import { Issue } from "jira.js/version3/models/issue";
import { RiskScore, TicketState } from "../../../utils/agent.utils";

/**
 * Analyzes whether a Jira issue is at medium risk due to unresolved blocking dependencies.
 * 
 * This function checks if any linked issues (dependencies) block the current issue and are not yet completed.
 * If there is at least one inward issue whose status is not "DONE", it returns a MEDIUM risk score.
 * Otherwise, it returns 0 indicating no risk from blocked dependencies.
 *
 * @param {Issue} issueDetails - The Jira issue to analyze for unresolved dependencies.
 * @returns {number} - Risk score (MEDIUM if any dependency is unresolved, otherwise 0).
 */
const analyzeBlockedDependenciesSignal = (
  issueDetails: Issue
): number => {
  const unresolvedDependencies = issueDetails?.fields?.issuelinks?.some(
    (issue: any) => {
      // If inwardIssue doesn't exist, not unresolved (return false)
      if (!issue?.inwardIssue) {
        return false;
      }
      // If inwardIssue exists and status name is not 'DONE', it's unresolved (return true)
      const statusName = issue.inwardIssue.fields?.status?.name;
      return statusName?.toLowerCase() !== TicketState.DONE;
    }
  );

  if (unresolvedDependencies) {
    return RiskScore.MEDIUM;
  }

  return 0;
};

export default analyzeBlockedDependenciesSignal;
