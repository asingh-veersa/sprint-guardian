import { SprintIssueDetailsT } from "../../integrations/types";
import { RiskScore, TicketState } from "../../utils/agent.utils";

const analyzeBlockedDependenciesSignal = (
  issueDetails: SprintIssueDetailsT
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
