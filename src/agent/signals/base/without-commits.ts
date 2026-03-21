import { Issue } from "jira.js/version3/models/issue";
import { getIssueStatus, RiskScore, TicketState } from "../../../utils/agent.utils";

/**
 * Analyzes whether a Jira issue that is currently "In Progress" has any associated commits.
 *
 * This function is used as a risk signal calculation in sprint risk analysis. If an issue
 * is marked as "In Progress" but has no commits linked to it (i.e., work has not started in code),
 * this may indicate potential risk or bottlenecks in delivery. In such a case, a low risk score
 * will be returned.
 *
 * @param {Issue} issue - The Jira issue to analyze.
 * @param {boolean} hasCommits - Whether any commits have been linked to this issue.
 * @returns {number} - Risk score (LOW if condition met, otherwise 0).
 */
const anaylzeCommitSignal = (
  issue: Issue,
  hasCommits: boolean
): number => {
  const issueStatus = getIssueStatus(issue);
  
  if (issueStatus === TicketState.IN_PROGRESS && !hasCommits) {
    return RiskScore.LOW;
  }

  return 0;
};

export default anaylzeCommitSignal;
