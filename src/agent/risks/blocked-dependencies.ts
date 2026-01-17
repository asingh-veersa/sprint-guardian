import { SprintIssueDetailsT } from "../../integrations/types";
import { RiskScore, TicketState } from "../../utils/agent.utils";

const analyzeBlockedDependenciesSignal = (
  issueDetails: SprintIssueDetailsT
): number => {
  const unresolvedDependencies = issueDetails?.fields?.issuelinks?.some(
    (issue: any) => issue?.inwardIssue?.fields?.status?.name !== TicketState.DONE
  );

  if (unresolvedDependencies) {
    return RiskScore.LOW;
  }

  return 0;
};

export default analyzeBlockedDependenciesSignal;
