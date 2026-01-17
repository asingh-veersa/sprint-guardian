import { DateTime } from "luxon";
import { createSprintContext } from "../factories/sprint.factory";
import { SprintScenarioT } from "./types";
import { createIssue } from "../factories/issue.factory";
import { createIssueDetails } from "../factories/issueDetails.factory";

export const customSprint: SprintScenarioT = {
  name: "Custom Sprint",

  sprintContext: createSprintContext({
    startDate: DateTime.now().minus({ days: 1 }).toISO()!,
    endDate: DateTime.now().plus({ days: 10 }).toISO()!,
    goal: "",
  }),

  issues: [
    // Issue is yet to be picked - no alert
    createIssue({
      key: "FUEL-101",
      fields: {
        status: { name: "To Do" },
        summary: "Completion of admin dashboard",
        updated: DateTime.now().minus({ days: 1 }).toISO(),
        assignee: undefined,
        story_point_estimate: "3",
      },
    }),

    // Issue is yet to be picked but have some dependencies - low risk factor
    createIssue({
      key: "FUEL-102",
      fields: {
        status: { name: "To Do" },
        summary: "Completion of admin dashboard",
        updated: DateTime.now().minus({ days: 1 }).toISO(),
        assignee: undefined,
        story_point_estimate: "3",
      },
    }),

    // Issue is picked but no assignee - low risk factor
    createIssue({
      key: "FUEL-103",
      fields: {
        status: { name: "In Progress" },
        summary: "Completion of admin dashboard",
        updated: DateTime.now().toISO(),
        assignee: undefined,
        story_point_estimate: "3",
      },
    }),

    // Issue is in progress and recently updated - no risk
    createIssue({
      key: "FUEL-104",
      fields: {
        status: { name: "In Progress" },
        summary: "Completion of admin dashboard",
        updated: DateTime.now().minus({ days: 1 }).toISO(),
        assignee: undefined,
        story_point_estimate: "3",
      },
    }),

    // Issue is in Code review but no MR attached - low risk
    createIssue({
      key: "FUEL-105",
      fields: {
        status: { name: "In Progress" },
        summary: "Completion of admin dashboard",
        updated: DateTime.now().minus({ days: 1 }).toISO(),
        assignee: undefined,
        story_point_estimate: "3",
      },
    }),
  ],

  issueDetails: [
    createIssueDetails({
      key: "FUEL-101",
      fields: {},
    }),

    createIssueDetails({
      key: "FUEL-102",
      fields: {
        issuelinks: [
          {
            inwardIssue: {
              key: "FUEL-201",
              fields: {
                summary: "some task",
                status: {
                  name: "To Do ",
                },
              },
            },
          },
        ],
      },
    }),
  ],
};
