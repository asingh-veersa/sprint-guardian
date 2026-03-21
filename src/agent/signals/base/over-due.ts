import { DateTime } from "luxon";
import {
  getIssueStatus,
  RiskScore,
  TicketState,
} from "../../../utils/agent.utils";
import { Issue } from "jira.js/version3/models/issue";

/**
 * Analyzes whether a Jira issue in progress is overdue based on the number of days
 * it has spent in the "In Progress" state compared to its estimated story points.
 * If the days since entering "In Progress" exceed the story points, it returns a low risk score.
 * Otherwise, or if story points are not present or the issue is not in progress, returns 0 (no risk).
 *
 * @param {Issue} issue - The Jira issue to analyze.
 * @returns {number} Risk score for the overdue signal (RiskScore.LOW or 0).
 */
const anaylzeOverDueSignal = (
  issue: Issue,
): number => {
  const storyPointsStr = issue.fields.story_point_estimate;
  const currState = getIssueStatus(issue);

  if (!storyPointsStr || currState !== TicketState.IN_PROGRESS) {
    return 0;
  }

  const storyPoints = Number(storyPointsStr);
  const statusCategoryChangeDate =
    issue.fields?.statuscategorychangedate;

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
