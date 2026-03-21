import { Issue } from "jira.js/version3/models/issue";
import { SprintDetailT } from "../../../integrations/types";
import {
  getIssueStatus,
  getIssueStoryPoints,
  getRemainingSprintDays,
  RiskScore,
  TicketState,
} from "../../../utils/agent.utils";

/**
 * Analyzes whether a Jira issue is at high risk due to a late start in the sprint.
 * 
 * This function triggers a HIGH risk score if the issue is already "In Progress" and its
 * estimated story points are greater than the number of days remaining in the sprint.
 * This highlights tickets that likely cannot be completed before the sprint ends because
 * work began too late or their effort estimate exceeds remaining time.
 * 
 * @param {Issue} issue - The Jira issue to analyze.
 * @param {SprintDetailT} sprintContext - The context providing the sprint end date.
 * @returns {number} - Risk score (HIGH if late start risk is detected, otherwise 0).
 */
const analyzeLateStartRisk = (
  issue: Issue,
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
