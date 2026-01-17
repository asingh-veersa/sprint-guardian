import { SprintDetailT, SprintIssueT } from "../../integrations/types";
import {
  getIssueStatus,
  getIssueStoryPoints,
  getRemainingSprintDays,
  RiskScore,
  TicketState,
} from "../../utils/agent.utils";

const analyzeLateStartRisk = (
  issue: SprintIssueT,
  sprintContext: SprintDetailT
): number => {
  const status = getIssueStatus(issue);
  const storyPoints = getIssueStoryPoints(issue);
  const remainingSprintDays = getRemainingSprintDays(sprintContext.endDate);

  if (remainingSprintDays === null) return 0;

  if (status === TicketState.IN_PROGRESS && storyPoints > remainingSprintDays) {
    return RiskScore.HIGH;
  }

  return 0;
};

export default analyzeLateStartRisk;
