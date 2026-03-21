import { Issue } from "jira.js/version3/models/issue";
import {
  CommitSchemaWithProjectId,
  SprintDetailT,
} from "../integrations/types";
import { RiskT, SignalsT } from "./types";
import { DateTime } from "luxon";
import {
  TicketState,
  getIssueStatus,
  getRemainingSprintDays,
  getStaleDays,
} from "../utils/agent.utils";
import { lateStart } from "./signals/behavior/late-start";
import { highChurn } from "./signals/behavior/high-churn";
import { progressStall } from "./signals/behavior/progress-stall";
import { statusFlapping } from "./signals/behavior/status-flapping";
import { getIssueDetailsById } from "../integrations/jira";
import anaylzeCommitSignal from "./signals/base/without-commits";
import anaylzeStaleSignal from "./signals/base/stale-issue";
import anaylzeSprintNearEndSignal from "./signals/base/sprint-near-end-issue";
import anaylzeOwnershipSignal from "./signals/base/ownership-risk";
import anaylzeMissingMRSignal from "./signals/base/missing-merge-request";
import analyzeLateStartRisk from "./signals/base/late-start";
import anaylzeOverDueSignal from "./signals/base/over-due";
import analyzeBlockedDependenciesSignal from "./signals/base/blocked-dependencies";
import { RISK_THRESHOLD, SPRINT_END_THRESHOLD } from "./config";
import env from "../config/env";

export type CommitInfoT = {
  commitCount: number;
  projectIds: Set<number>;
  lastCommitAt: DateTime;
};

type CommitIssueMap = Map<string, CommitInfoT>;

// Optimized: returns a mapping of commit id and projectId
const mapCommitsToIssuesV2 = (
  commits: {
    master: CommitSchemaWithProjectId[];
    mr: CommitSchemaWithProjectId[];
    projectId: number;
  }[],
): CommitIssueMap => {
  const map: CommitIssueMap = new Map();

  const processCommit = (
    commit: CommitSchemaWithProjectId,
    type: "master" | "mr" = "master",
  ) => {
    let matches = null;
    if (type === "master") {
      matches = commit.message.match(/[A-Z]+-\d+/g);
    } else if (type === "mr") {
      matches = commit.mergeRequestTitle?.match(/[A-Z]+-\d+/g);
    }
    if (!matches) return;

    const commitTime = DateTime.fromISO(commit.committed_date ?? "");
    for (const issueKey of matches) {
      let entry = map.get(issueKey);
      if (!entry) {
        entry = {
          commitCount: 1,
          projectIds: new Set([commit.projectId]),
          lastCommitAt: commitTime,
        };
        map.set(issueKey, entry);
      } else {
        entry.commitCount += 1;
        entry.projectIds.add(commit.projectId);
        if (commitTime > entry.lastCommitAt) {
          entry.lastCommitAt = commitTime;
        }
      }
    }
  };

  for (const item of commits) {
    item.master.forEach((commit) => processCommit(commit, "master"));
    item.mr.forEach((commit) => processCommit(commit, "mr"));
  }

  return map;
};

// defined rules to provided calculated signals
export const signalAnalyzer = async (
  issues: Issue[],
  commits: {
    master: CommitSchemaWithProjectId[];
    mr: CommitSchemaWithProjectId[];
    projectId: number;
  }[],
  sprintContext: SprintDetailT,
): Promise<RiskT[]> => {
  const risks: RiskT[] = [];
  const commitsByIssueKey: CommitIssueMap = mapCommitsToIssuesV2(commits);

  for (const issue of issues) {
    const status = getIssueStatus(issue) as TicketState;
    const issueKey = issue.key;
    const daysStale = getStaleDays(issue.fields?.updated);
    const remainingSprintDays = getRemainingSprintDays(sprintContext.endDate);
    const commitInfo = commitsByIssueKey.get(issueKey);
    const daysSinceLastCommit = commitInfo
      ? getStaleDays(commitInfo.lastCommitAt.toString())
      : Infinity;

    // computing behavioral signals
    let behavioralSignals: SignalsT["behavioral"] = {
      lateStart: lateStart(
        issue,
        sprintContext.startDate ?? "",
        sprintContext.endDate ?? "",
        status,
      ),
      highChurn: highChurn(issue.changelog?.histories?.length ?? 0, status),
      progressStall: progressStall(daysStale, daysSinceLastCommit),
      statusFlapping: statusFlapping(issue.changelog?.histories),
    };

    let baseSignals: SignalsT["base"] = {
      daysSinceLastCommit,
      noCommits: !commitsByIssueKey.has(issueKey),
      staleDays: daysStale,
      sprintEnding: remainingSprintDays
        ? remainingSprintDays <= SPRINT_END_THRESHOLD
        : false,
      ownershipRisk: !issue.fields.assignee,
    };

    //  score is not the dominant factor in evaluation, it works as a fallback and reduce false positives
    let score = 0;
    /**
     * For logging purpose
     */
    const triggeredSignals: number[] = [];

    const signal1Score = anaylzeCommitSignal(
      issue,
      commitsByIssueKey.has(issueKey),
    );
    if (signal1Score > 0) triggeredSignals.push(1);
    score += signal1Score;

    const signal2Score = anaylzeStaleSignal(
      issue,
      commitsByIssueKey.get(issueKey),
    );
    if (signal2Score > 0) triggeredSignals.push(2);
    score += signal2Score;

    const signal3Score = anaylzeSprintNearEndSignal(issue, sprintContext);
    if (signal3Score > 0) triggeredSignals.push(3);
    score += signal3Score;

    const signal4Score = anaylzeOwnershipSignal(issue);
    if (signal4Score > 0) triggeredSignals.push(4);
    score += signal4Score;

    const [mrSignal, mrSignalScore] = anaylzeMissingMRSignal(issue);
    baseSignals.missingMR = mrSignal;
    if (mrSignalScore > 0) triggeredSignals.push(5);
    score += mrSignalScore;

    const signal6Score = analyzeLateStartRisk(issue, sprintContext);
    if (signal6Score > 0) triggeredSignals.push(6);
    score += signal6Score;

    const signal7Score = anaylzeOverDueSignal(issue);
    if (signal7Score > 0) triggeredSignals.push(7);
    score += signal7Score;

    const signal8Score = analyzeBlockedDependenciesSignal(issue);
    if (signal8Score > 0) triggeredSignals.push(8);
    score += signal8Score;

    if (score > RISK_THRESHOLD) {
      const issueInDepthDetails = await getIssueDetailsById(issue.id);

      risks.push({
        issueKey,
        summary: issue.fields.summary,
        status: status ?? "",
        riskScore: Math.min(score, 100),
        signals: {
          base: baseSignals,
          behavioral: behavioralSignals,
        },
        issue: issueInDepthDetails,
        // for dev only
        triggeredSignals:
          env.config.env !== "production" ? triggeredSignals : undefined,
      });
    }
  }

  return risks;
};

export default signalAnalyzer;
