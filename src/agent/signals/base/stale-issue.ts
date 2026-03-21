import { Issue } from "jira.js/version3/models/issue";
import {
  getIssueStatus,
  getStaleDays,
  RiskScore,
  TicketState,
} from "../../../utils/agent.utils";
import { CommitInfoT } from "../../risk-analyzer";

/**
 * Analyzes whether an "In Progress" Jira issue has gone stale due to inactivity in code commits.
 *
 * This risk signal is used when a ticket is actively being tracked but has not received any commits 
 * in the last X days. If such inactivity is detected while the ticket is still "In Progress",
 * a low risk score is returned as a warning of potential stagnation.
 *
 * @param {Issue} issue - The Jira issue object to analyze.
 * @param {CommitInfoT | undefined} commitInfo - The latest commit information for this issue, if available.
 * @returns {number} Risk score (LOW if issue is in progress and no commits for more than 2 days, otherwise 0).
 */
const anaylzeStaleSignal = (
  issue: Issue,
  commitInfo?: CommitInfoT
): number => {
  const status = getIssueStatus(issue);
  const daysSinceLastCommit = commitInfo
    ? getStaleDays(commitInfo.lastCommitAt.toString())
    : Infinity;

  if (status === TicketState.IN_PROGRESS && daysSinceLastCommit > 2) {
    return RiskScore.LOW;
  }

  return 0;
};

export default anaylzeStaleSignal;
