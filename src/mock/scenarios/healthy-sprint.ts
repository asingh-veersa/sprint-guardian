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
    // 🟢 Active issue with recent commit
    createIssue({
      key: "UI-101",
      fields: {
        status: { name: "In Progress" },
        updated: DateTime.now().minus({ hours: 4 }).toISO()!,
        assignee: { displayName: "Alice" },
      },
    }),

    // 🟢 Recently completed issue
    createIssue({
      key: "API-202",
      fields: {
        status: { name: "Done" },
        updated: DateTime.now().minus({ days: 1 }).toISO()!,
        resolutiondate: DateTime.now().minus({ days: 1 }).toISO()!,
        assignee: { displayName: "Bob" },
      },
    }),

    // 🟢 Newly started issue (no risk yet)
    createIssue({
      key: "AUTH-303",
      fields: {
        status: { name: "In Progress" },
        updated: DateTime.now().minus({ hours: 1 }).toISO()!,
        assignee: { displayName: "Charlie" },
      },
    }),

    // 🟢 Backlog / To Do but recently groomed
    createIssue({
      key: "OPS-404",
      fields: {
        status: { name: "To Do" },
        updated: DateTime.now().minus({ hours: 3 }).toISO()!,
        assignee: { displayName: "Dana" },
      },
    }),
  ],

  commits: [
    createCommit({
      message: "UI-101 add styles",
      committerDate: DateTime.now().minus({ hours: 2 }).toISO()!,
    }),

    createCommit({
      message: "API-202 finalize response mapping",
      committerDate: DateTime.now().minus({ days: 1 }).toISO()!,
    }),

    createCommit({
      message: "AUTH-303 setup auth middleware",
      committerDate: DateTime.now().minus({ hours: 1 }).toISO()!,
    }),
  ],
};
