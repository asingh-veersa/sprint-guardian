import { DateTime } from "luxon";
import { createCommit } from "../factories/commit.factory";
import { createIssue } from "../factories/issue.factory";
import { createSprintContext } from "../factories/sprint.factory";
import { SprintScenarioT } from "./types";

export const healthySprint: SprintScenarioT = {
  name: "Healthy Sprint",

  sprintContext: createSprintContext({
    endDate: DateTime.now().plus({ days: 7 }).toISO()!,
  }),

  issues: [
    createIssue({
      key: "UI-101",
      fields: {
        status: { name: "In Progress" },
        updated: DateTime.now().minus({ hours: 4 }).toISO()!,
      },
    }),
  ],

  commits: [
    createCommit({
      message: "UI-101 add styles",
      committerDate: DateTime.now().minus({ hours: 2 }).toISO()!,
    }),
  ],
};
