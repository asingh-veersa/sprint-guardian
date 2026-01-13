import { DateTime } from "luxon";
import { SprintIssueT } from "../integrations/types";

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

export const getRemainingSprintDays = (endDate: string) => {
  const currDate = DateTime.now();
  const sprintEndDate = DateTime.fromISO(endDate);
  return Math.floor(sprintEndDate.diff(currDate, "days").days);
};

export const getStaleDays = (lastUpdated: DateTime) =>
  Math.floor(DateTime.now().diff(lastUpdated, "days").days);

export const getIssueStatus = (issue: SprintIssueT): string | undefined =>
  issue.fields.status?.name?.toLowerCase();
