import { DateTime } from "luxon";
import {
  CommitT,
  SprintDetailT,
  SprintIssueDetailsT,
  SprintIssueT,
} from "../integrations/types";
import { RiskSignalsT, RiskT } from "./types";
import {
  getIssueStatus,
  getRemainingSprintDays,
  getStaleDays,
  RiskScore,
  TicketState,
} from "../utils/agent.utils";
import anaylzeCommitSignal from "./risks/without-commits";
import anaylzeStaleSignal from "./risks/stale-issue";
import { RISK_THRESHOLD, SPRINT_END_THRESHOLD } from "./config";
import anaylzeSprintNearEndSignal from "./risks/sprint-near-end-issue";
import anaylzeOwnershipSignal from "./risks/ownership-risk";
import anaylzeMissingMRSignal from "./risks/missing-merge-request";
import analyzeLateStartRisk from "./risks/late-start";
import { getIssueDetails } from "../integrations/jira";
import anaylzeOverDueSignal from "./risks/over-due";
import analyzeBlockedDependenciesSignal from "./risks/blocked-dependencies";

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
    const status = getIssueStatus(issue) as TicketState;
    const issueKey = issue.key;
    const daysStale = getStaleDays(issue.fields?.updated);
    const remainingSprintDays = getRemainingSprintDays(sprintContext.endDate);

    const commitInfo = commitsByIssueKey.get(issueKey);
    const daysSinceLastCommit = commitInfo
      ? getStaleDays(commitInfo.lastCommitAt.toString())
      : Infinity;

    // Skip the healthy states
    if (status && shouldTrackIssue(issue, sprintContext)) {
      const issueDetails: SprintIssueDetailsT = await getIssueDetails(
        issue.key
      );
      // SIGNAL 1: In progress but no commits
      score += anaylzeCommitSignal(issue, commitsByIssueKey.has(issueKey));

      // SIGNAL 2: Stale issue
      score += anaylzeStaleSignal(issue, commitsByIssueKey.get(issueKey));

      /**
       * SIGNAL 3: Sprint near end or story points are more than remaining sprint days
       *  - Only stalled in-progress work near sprint end escalates
       *  - Active work stays quiet
       */
      score += anaylzeSprintNearEndSignal(issue, sprintContext);

      // SIGNAL 4: Ownership risk
      score += anaylzeOwnershipSignal(issue);

      // SIGNAL 5: Issue is in Code Review but missing attached Merge request links
      const [mrSignal, mrSignalScore] = anaylzeMissingMRSignal(issue);
      riskSignals.missingMR = mrSignal;
      score += mrSignalScore;

      // SIGNAL 6: Issue is picked late - story points > left sprint
      score += analyzeLateStartRisk(issue, sprintContext);

      // SIGNAL 7: Issue took more than assigned story points
      score += anaylzeOverDueSignal(issue, issueDetails);

      // SIGNAL 8: Issues linked as blockers not resolved
      score += analyzeBlockedDependenciesSignal(issueDetails);

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
          issue: issueDetails,
        });
      }
    }
  }

  return risks;
};

export type CommitInfoT = {
  commitCount: number;
  projectIds: Set<number>;
  lastCommitAt: DateTime;
};

type CommitIssueMap = Map<string, CommitInfoT>;

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
