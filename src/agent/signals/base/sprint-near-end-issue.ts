import { Issue } from "jira.js/version3/models/issue";
import { SprintDetailT } from "../../../integrations/types";
import {
  getIssueStatus,
  getRemainingSprintDays,
  getStaleDays,
  RiskScore,
  TicketState,
} from "../../../utils/agent.utils";
import { SPRINT_END_THRESHOLD } from "../../config";

/**
 * Analyzes whether a Jira issue is still "In Progress" and at risk because the sprint is nearing its end.
 * 
 * This signal triggers a HIGH risk score if:
 * - The number of days remaining in the sprint is less than or equal to the configured SPRINT_END_THRESHOLD,
 * - The issue is still in the "In Progress" state,
 * - The issue has not been updated in a day or more (i.e., daysStale >= 1).
 * 
 * This helps surface tickets that are at risk of not being completed before the sprint ends.
 * 
 * @param {Issue} issue - The Jira issue to analyze.
 * @param {SprintDetailT} sprintContext - The context providing sprint end date.
 * @returns {number} - Risk score (HIGH if near sprint end and criteria met, otherwise 0).
 */
const anaylzeSprintNearEndSignal = (
  issue: Issue,
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
