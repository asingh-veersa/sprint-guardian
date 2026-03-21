import { Issue } from "jira.js/version3/models/issue";
import { TicketState } from "../../../utils/agent.utils";

/**
 * Detects whether an issue is starting late in the sprint by comparing its status change date
 * (e.g., first time "In Progress") to the sprint start date.
 * Returns true if the issue started work late (for example, after a threshold percentage of the sprint duration has passed).
 *
 * @param issue The issue details object containing status change and sprint info
 * @param sprintStartDate ISO string start of sprint
 * @param sprintEndDate ISO string end of sprint
 * @param statusFieldName The field name in the issue's changelog/fields indicating "In Progress" or similar
 * @param thresholdRatio Threshold (e.g., 0.4 means after 40% of the sprint has elapsed it is considered "late start")
 * @returns boolean - true if started late, false otherwise
 */
export const lateStart = (
  issue: Issue,
  sprintStartDate: string,
  sprintEndDate: string,
  statusFieldName: TicketState = TicketState.IN_PROGRESS,
  thresholdRatio = 0.4,
): boolean => {
  if (!sprintStartDate || !sprintEndDate) return false;
  if (!issue || !issue.changelog) return false;

  const sprintStart = new Date(sprintStartDate).getTime();
  const sprintEnd = new Date(sprintEndDate).getTime();

  if (isNaN(sprintStart) || isNaN(sprintEnd) || sprintEnd <= sprintStart)
    return false;

  // Find the first changelog entry where the statusFieldName is set
  const statusHistory = issue.changelog.histories?.filter(
    (entry: any) =>
      entry.field === "status" &&
      entry.toString &&
      entry.toString.toLowerCase().includes(statusFieldName.toLowerCase()),
  );

  if (!statusHistory || statusHistory.length === 0) return false;

  const firstInProgress = new Date(statusHistory[0]?.created ?? "").getTime();
  if (isNaN(firstInProgress)) return false;

  const sprintDuration = sprintEnd - sprintStart;
  const startDelta = firstInProgress - sprintStart;

  return startDelta / sprintDuration >= thresholdRatio;
};
