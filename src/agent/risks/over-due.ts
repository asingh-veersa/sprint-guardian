import { DateTime } from "luxon";
import { SprintIssueDetailsT, SprintIssueT } from "../../integrations/types";
import {
  getIssueStatus,
  RiskScore,
  TicketState,
} from "../../utils/agent.utils";

const anaylzeOverDueSignal = (
  issue: SprintIssueT,
  issueDetails: SprintIssueDetailsT
): number => {
  const storyPointsStr = issue.fields.story_point_estimate;
  const currState = getIssueStatus(issue);

  if (!storyPointsStr || currState !== TicketState.IN_PROGRESS) {
    return 0;
  }

  const storyPoints = Number(storyPointsStr);
  const statusCategoryChangeDate =
    issueDetails.fields?.statuscategorychangedate;

  const daysSinceInProgress = DateTime.now().diff(
    DateTime.fromISO(statusCategoryChangeDate),
    "days"
  ).days;

  if (daysSinceInProgress > storyPoints) {
    return RiskScore.LOW;
  }

  return 0;
};

export default anaylzeOverDueSignal;
