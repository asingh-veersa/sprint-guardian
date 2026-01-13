import { DateTime } from "luxon";
import { SprintScenarioT } from "./types";
import { createIssue } from "../factories/issue.factory";
import { createCommit } from "../factories/commit.factory";
import { createSprintContext } from "../factories/sprint.factory";

export const chaosSprint: SprintScenarioT = {
  name: "Chaos Sprint – High Risk Convergence",

  sprintContext: createSprintContext({
    state: "active",
    startDate: DateTime.now().minus({ days: 12 }).toISO()!,
    endDate: DateTime.now().plus({ days: 3 }).toISO()!,
    goal: "Ship critical platform changes",
  }),

  issues: [
    // 🔴 Stale, high effort, no commits
    createIssue({
      key: "CORE-101",
      fields: {
        summary: "Refactor auth middleware",
        status: { name: "In Progress" },
        story_point_estimate: "8",
        updated: DateTime.now().minus({ days: 6 }).toISO()!,
      },
    }),

    // 🔴 No assignee + late sprint
    createIssue({
      key: "CORE-102",
      fields: {
        summary: "Migrate token service",
        status: { name: "In Progress" },
        assignee: undefined,
        story_point_estimate: "5",
        updated: DateTime.now().minus({ days: 4 }).toISO()!,
      },
    }),

    // 🟠 Blocked but noisy comments
    createIssue({
      key: "API-220",
      fields: {
        summary: "Partner API integration",
        description: "Integrate with external partner APIs",
        status: { name: "Blocked" },
        story_point_estimate: "3",
        updated: DateTime.now().minus({ days: 3 }).toISO()!,

        comment: {
          self: "https://jira.example.com/rest/api/2/issue/API-220/comment",
          maxResults: 5,
          total: 5,
          startAt: 0,
          comments: [
            {
              self: "comment-1",
              id: "1",
              body: "Waiting for partner credentials",
              created: DateTime.now().minus({ days: 6 }).toISO()!,
              updated: DateTime.now().minus({ days: 6 }).toISO()!,
              author: {
                self: "user-1",
                name: "dev1",
                displayName: "Dev One",
                active: "true",
              },
              updateAutor: {
                self: "user-1",
                name: "dev1",
                displayName: "Dev One",
                active: "true",
              },
            },
            {
              self: "comment-2",
              id: "2",
              body: "Followed up via email",
              created: DateTime.now().minus({ days: 5 }).toISO()!,
              updated: DateTime.now().minus({ days: 5 }).toISO()!,
              author: {
                self: "user-2",
                name: "dev2",
                displayName: "Dev Two",
                active: "true",
              },
              updateAutor: {
                self: "user-2",
                name: "dev2",
                displayName: "Dev Two",
                active: "true",
              },
            },
            {
              self: "comment-3",
              id: "3",
              body: "Discussed internally, still blocked",
              created: DateTime.now().minus({ days: 4 }).toISO()!,
              updated: DateTime.now().minus({ days: 4 }).toISO()!,
              author: {
                self: "user-1",
                name: "dev1",
                displayName: "Dev One",
                active: "true",
              },
              updateAutor: {
                self: "user-1",
                name: "dev1",
                displayName: "Dev One",
                active: "true",
              },
            },
            {
              self: "comment-4",
              id: "4",
              body: "Any update from partner?",
              created: DateTime.now().minus({ days: 3 }).toISO()!,
              updated: DateTime.now().minus({ days: 3 }).toISO()!,
              author: {
                self: "user-3",
                name: "pm",
                displayName: "Product Manager",
                active: "true",
              },
              updateAutor: {
                self: "user-3",
                name: "pm",
                displayName: "Product Manager",
                active: "true",
              },
            },
            {
              self: "comment-5",
              id: "5",
              body: "Still waiting, no ETA",
              created: DateTime.now().minus({ days: 2 }).toISO()!,
              updated: DateTime.now().minus({ days: 2 }).toISO()!,
              author: {
                self: "user-1",
                name: "dev1",
                displayName: "Dev One",
                active: "true",
              },
              updateAutor: {
                self: "user-1",
                name: "dev1",
                displayName: "Dev One",
                active: "true",
              },
            },
          ],
        },
      },
    }),

    // 🟡 Done but suspiciously late (anaylzer will ignore this)
    createIssue({
      key: "OPS-77",
      fields: {
        summary: "CI pipeline fixes",
        status: { name: "Done" },
        resolutiondate: DateTime.now().minus({ hours: 3 }).toISO()!,
        updated: DateTime.now().minus({ hours: 3 }).toISO()!,
      },
    }),
  ],

  commits: [
    // ❌ Commits not linked to sprint issues
    createCommit({
      message: "chore: update dependencies",
      committerDate: DateTime.now().minus({ days: 1 }).toISO()!,
    }),

    createCommit({
      message: "fix: lint warnings",
      committerDate: DateTime.now().minus({ hours: 12 }).toISO()!,
    }),

    // ❌ Old commit only
    createCommit({
      message: "WIP groundwork",
      committerDate: DateTime.now().minus({ days: 7 }).toISO()!,
    }),
  ],
};
