import { RiskScore, TicketState } from "../../utils/agent.utils";

const anaylzeStaleSignal = (
  status: TicketState,
  daysSinceLastCommit: number
): number => {
  if (status === TicketState.IN_PROGRESS && daysSinceLastCommit > 2) {
    return RiskScore.LOW;
  }

  return 0;
};

export default anaylzeStaleSignal;
