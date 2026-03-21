import { DateTime } from "luxon";
import { Issue } from "jira.js/version3/models/issue";

export enum TicketState {
  TO_DO = "to do",
  ON_HOLD = "on hold",
  IN_PROGRESS = "in progress",
  CODE_REVIEW = "code review",
  IN_QA = "in qA",
  UX_ACCEPTANCE = "ux acceptance",
  ACCEPTANCE = "acceptance",
  DONE = "done",
}

export enum RiskScore {
  LOW = 10,
  MEDIUM = 20,
  HIGH = 35,
}

export const getRemainingSprintDays = (endDate?: string): number | null => {
  if (!endDate) return null;
  const currDate = DateTime.now();
  const sprintEndDate = DateTime.fromISO(endDate);
  return Math.floor(sprintEndDate.diff(currDate, "days").days);
};

export const getStaleDays = (lastUpdated?: string) => {
  if (!lastUpdated) return 0;

  const lastUpdatedIso = DateTime.fromISO(lastUpdated);
  return Math.floor(DateTime.now().diff(lastUpdatedIso, "days").days);
};

export const getIssueStatus = (issue: Issue): string =>
  issue.fields.status?.name?.toLowerCase() ?? "To do";

export const getIssueStoryPoints = (issue: Issue): number => {
  return Number(issue.fields.story_point_estimate ?? "0");
};
