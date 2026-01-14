import { RiskScore, TicketState } from "../../utils/agent.utils";

const anaylzeCommitSignal = (
  issueStatus: TicketState,
  hasCommits: boolean
): number => {
  if (issueStatus === TicketState.IN_PROGRESS && !hasCommits) {
    return RiskScore.LOW;
  }

  return 0;
};

export default anaylzeCommitSignal;
