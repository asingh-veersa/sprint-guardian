import { DateTime } from "luxon";
import { createCommit } from "../factories/commit.factory";
import { createIssue } from "../factories/issue.factory";
import { createSprintContext } from "../factories/sprint.factory";
import { SprintScenarioT } from "./types";

export const borderlineSprint: SprintScenarioT = {
  name: "Borderline Sprint",

  sprintContext: createSprintContext({
    // ⏳ Sprint is almost over
    endDate: DateTime.now().plus({ days: 2 }).toISO()!,
  }),

  issues: [
    // 🟡 In progress, but last update was a while ago
    createIssue({
      key: "API-301",
      fields: {
        status: { name: "In Progress" },
        updated: DateTime.now().minus({ days: 2 }).toISO()!,
        assignee: { displayName: "Alice" },
      },
    }),

    // 🟡 Active, but commit frequency is low
    createIssue({
      key: "UI-402",
      fields: {
        status: { name: "In Progress" },
        updated: DateTime.now().minus({ hours: 20 }).toISO()!,
        assignee: { displayName: "Bob" },
      },
    }),

    // 🟡 Still not started, but recently groomed
    createIssue({
      key: "OPS-515",
      fields: {
        status: { name: "To Do" },
        updated: DateTime.now().minus({ hours: 6 }).toISO()!,
        assignee: { displayName: "Charlie" },
      },
    }),

    // 🟢 Recently completed (good signal)
    createIssue({
      key: "AUTH-210",
      fields: {
        status: { name: "Done" },
        updated: DateTime.now().minus({ hours: 10 }).toISO()!,
        resolutiondate: DateTime.now().minus({ hours: 10 }).toISO()!,
        assignee: { displayName: "Dana" },
      },
    }),
  ],

  commits: [
    // Older commit for API-301
    createCommit({
      message: "API-301 initial endpoint scaffolding",
      committerDate: DateTime.now().minus({ days: 2 }).toISO()!,
    }),

    // Recent but sparse commit for UI-402
    createCommit({
      message: "UI-402 tweak layout spacing",
      committerDate: DateTime.now().minus({ hours: 18 }).toISO()!,
    }),

    // Completion commit (positive signal)
    createCommit({
      message: "AUTH-210 finalize auth flow",
      committerDate: DateTime.now().minus({ hours: 10 }).toISO()!,
    }),
  ],
};
