import { RiskScore, TicketState } from "../../utils/agent.utils";
import { SPRINT_END_THRESHOLD } from "../config";

const anaylzeSprintNearEndSignal = (
  status: TicketState,
  daysStale: number,
  remainingSprintDays: number | null
): number => {
  if (
    remainingSprintDays !== null &&
    remainingSprintDays <= SPRINT_END_THRESHOLD &&
    status === TicketState.IN_PROGRESS &&
    daysStale >= 1
  ) {
    return RiskScore.HIGH;
  }
  return 0;
};

export default anaylzeSprintNearEndSignal;
