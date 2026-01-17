import { SprintIssueT } from "../../integrations/types";
import { getIssueStatus, RiskScore, TicketState } from "../../utils/agent.utils";

const anaylzeCommitSignal = (
  issue: SprintIssueT,
  hasCommits: boolean
): number => {
  const issueStatus = getIssueStatus(issue);
  
  if (issueStatus === TicketState.IN_PROGRESS && !hasCommits) {
    return RiskScore.LOW;
  }

  return 0;
};

export default anaylzeCommitSignal;
