import { DateTime } from "luxon";
import { CommitT, SprintDetailT, SprintIssueT } from "../integrations/types";
import { RiskSignalsT, RiskT } from "./types";
import {
  getIssueStatus,
  getRemainingSprintDays,
  getStaleDays,
  RiskScore,
  TicketState,
} from "../utils/agent.utils";
import { sendSlackMessage } from "../integrations/slack";

const RISK_THRESHOLD: number = 35;
const SPRINT_END_THRESHOLD: number = 2;

const shouldTrackIssue = (
  issue: SprintIssueT,
  sprintContext: SprintDetailT
): boolean => {
  const status = getIssueStatus(issue);
  if (
    status === TicketState.DONE ||
    status === TicketState.TO_DO ||
    status === TicketState.IN_QA ||
    status === TicketState.UX_ACCEPTANCE ||
    status === TicketState.ACCEPTANCE
  ) {
    return false;
  }

  return true;
};

// defined rules to detect possible risks
const analyzeSprintRisks = async (
  issues: SprintIssueT[],
  commits: CommitT[],
  sprintContext: SprintDetailT
): Promise<RiskT[]> => {
  const risks: RiskT[] = [];
  const commitsByIssueKey: CommitIssueMap = mapCommitsToIssues(commits);

  for (const issue of issues) {
    let riskSignals: Partial<RiskSignalsT> = { missingMR: false };
    let score = 0;
    const status = getIssueStatus(issue);
    const issueKey = issue.key;
    const lastUpdated = DateTime.fromISO(issue.fields?.updated);
    const storyPoints = Number(issue.fields.story_point_estimate ?? "0");
    const daysStale = getStaleDays(lastUpdated);
    const remainingSprintDays = sprintContext.endDate
      ? getRemainingSprintDays(sprintContext.endDate)
      : null;

    const commitInfo = commitsByIssueKey.get(issueKey);
    const daysSinceLastCommit = commitInfo
      ? getStaleDays(commitInfo.lastCommitAt)
      : Infinity;

    // Skip the healthy states states
    if (status && shouldTrackIssue(issue, sprintContext)) {
      /**
       * SIGNAL 1: In progress but no commits
       */
      if (
        status === TicketState.IN_PROGRESS &&
        !commitsByIssueKey.has(issueKey)
      ) {
        score += RiskScore.LOW;
      }

      /**
       *  SIGNAL 2: Stale issue
       */
      if (status === TicketState.IN_PROGRESS && daysSinceLastCommit > 2) {
        score += RiskScore.LOW;
      }

      /**
       * SIGNAL 3: Sprint near end or story points are more than remaining sprint days
       *  - Only stalled in-progress work near sprint end escalates
       *  - Active work stays quiet
       */
      if (
        remainingSprintDays !== null &&
        remainingSprintDays <= SPRINT_END_THRESHOLD &&
        status === TicketState.IN_PROGRESS &&
        daysStale >= 1
      ) {
        score += RiskScore.HIGH;
      }

      /**
       * SIGNAL 4: Ownership risk
       */
      if (!issue.fields.assignee) {
        score += RiskScore.MEDIUM;
      }

      /**
       * SIGNAL 5: Issue is in Code Review but missing attached Merge request links
       */
      if (status === TicketState.CODE_REVIEW) {
        const development = issue.fields.development ?? "";

        if (!development.includes("pullrequest=")) {
          riskSignals.missingMR = true;
        }
      }
    }

    if (score > RISK_THRESHOLD) {
      risks.push({
        issueKey,
        summary: issue.fields.summary,
        status: status ?? "",
        riskScore: Math.min(score, 100),
        signals: {
          noCommits: !commitsByIssueKey.has(issueKey),
          daysSinceLastCommit,
          staleDays: daysStale,
          sprintEnding: remainingSprintDays
            ? remainingSprintDays <= SPRINT_END_THRESHOLD
            : false,
          missingMR: riskSignals.missingMR,
          ownershipRisk: !issue.fields.assignee,
        },
      });
    }

    // in progress but no commits
    // if (status === "In Progress" && !commitsByIssueKey.has(issueKey)) {
    //   risks.push({
    //     type: "NO_CODE_ACTIVITY",
    //     issueKey,
    //     summary: issue.fields.summary,
    //     message: "Marked In Progress but no commits found",
    //   });
    // }

    // // to do but commits exists
    // if (status === "To Do" && commitsByIssueKey.has(issueKey)) {
    //   risks.push({
    //     type: "STATUS_MISMATCH",
    //     issueKey,
    //     summary: issue.fields.summary,
    //     message: "Commits exist but Jira issue still To Do",
    //   });
    // }
  }

  return risks;
};

type CommitIssueInfo = {
  commitCount: number;
  projectIds: Set<number>;
  lastCommitAt: DateTime;
};

type CommitIssueMap = Map<string, CommitIssueInfo>;

// returns a mapping of commit id and projectId
const mapCommitsToIssues = (commits: CommitT[]): CommitIssueMap => {
  const map: CommitIssueMap = new Map();

  for (const commit of commits) {
    const matches = commit.message.match(/[A-Z]+-\d+/);

    // if no issue id as '[FUEL-120]' exists in the commit message - skip it
    if (!matches) {
      continue;
    }

    for (const issueKey of matches) {
      if (!map.has(issueKey)) {
        map.set(issueKey, {
          commitCount: 0,
          projectIds: new Set(),
          lastCommitAt: DateTime.fromISO(commit.committerDate),
        });
      }

      const entry = map.get(issueKey)!;
      entry.commitCount += 1;
      entry.projectIds.add(commit.projectId);

      const commitTime = DateTime.fromISO(commit.committerDate);
      if (commitTime > entry.lastCommitAt) {
        entry.lastCommitAt = commitTime;
      }
    }
  }

  return map;
};

export default analyzeSprintRisks;
