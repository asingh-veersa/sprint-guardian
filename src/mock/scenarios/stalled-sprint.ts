import { DateTime } from "luxon";
import { SprintScenarioT } from "./types";
import { createIssue } from "../factories/issue.factory";
import { createCommit } from "../factories/commit.factory";
import { createSprintContext } from "../factories/sprint.factory";

export const stalledSprint: SprintScenarioT = {
  name: "Stalled Sprint Near End",

  sprintContext: createSprintContext({
    endDate: DateTime.now().plus({ days: 1 }).toISO()!,
  }),

  issues: [
    createIssue({
      key: "AUTH-123",
      fields: {
        summary: "Login API",
        status: { name: "In Progress" },
        updated: DateTime.now().minus({ days: 4 }).toISO()!,
        story_point_estimate: "3",
      },
    }),
    createIssue({
      key: "PAY-456",
      fields: {
        summary: "Payment webhook",
        status: { name: "In Progress" },
        assignee: undefined, // ownership risk
        updated: DateTime.now().minus({ days: 5 }).toISO()!,
        story_point_estimate: "5",
      },
    }),
  ],

  commits: [
    createCommit({
      message: "AUTH-120 initial setup",
      committerDate: DateTime.now().minus({ days: 6 }).toISO()!,
    }),
  ],
};
