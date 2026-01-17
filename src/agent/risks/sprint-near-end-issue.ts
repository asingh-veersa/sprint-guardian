import { SprintDetailT, SprintIssueT } from "../../integrations/types";
import {
  getIssueStatus,
  getRemainingSprintDays,
  getStaleDays,
  RiskScore,
  TicketState,
} from "../../utils/agent.utils";
import { SPRINT_END_THRESHOLD } from "../config";

const anaylzeSprintNearEndSignal = (
  issue: SprintIssueT,
  sprintContext: SprintDetailT
): number => {
  const status = getIssueStatus(issue);
  const daysStale = getStaleDays(issue.fields?.updated);
  const remainingSprintDays = getRemainingSprintDays(sprintContext?.endDate);

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
