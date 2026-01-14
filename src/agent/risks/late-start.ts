import { RiskScore, TicketState } from "../../utils/agent.utils";

const analyzeLateStartRisk = (
  status: TicketState,
  storyPoints: number,
  remainingSprintDays: number | null
): number => {
  {
    if (remainingSprintDays === null) return 0;

    if (
      status === TicketState.IN_PROGRESS &&
      storyPoints > remainingSprintDays
    ) {
      return RiskScore.HIGH;
    }

    return 0;
  }
};

export default analyzeLateStartRisk;
