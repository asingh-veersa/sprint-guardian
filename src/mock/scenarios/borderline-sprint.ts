import { DateTime } from "luxon";
import { createCommit } from "../factories/commit.factory";
import { createIssue } from "../factories/issue.factory";
import { createSprintContext } from "../factories/sprint.factory";
import { SprintScenarioT } from "./types";
import { createIssueDetails } from "../factories/issueDetails.factory";

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
        assignee: { accountId: "alice", emailAddress: "alice@example.com", displayName: "Alice" },
      },
    }),

    // 🟡 Active, but commit frequency is low
    createIssue({
      key: "UI-402",
      fields: {
        status: { name: "In Progress" },
        updated: DateTime.now().minus({ hours: 20 }).toISO()!,
        assignee: { accountId: "bob", emailAddress: "bob@example.com", displayName: "Bob" },
      },
    }),

    // 🟡 Still not started, but recently groomed
    createIssue({
      key: "OPS-515",
      fields: {
        status: { name: "To Do" },
        updated: DateTime.now().minus({ hours: 6 }).toISO()!,
        assignee: { accountId: "charlie", emailAddress: "charlie@example.com", displayName: "Charlie" },
      },
    }),

    // 🟢 Recently completed (good signal)
    createIssue({
      key: "AUTH-210",
      fields: {
        status: { name: "Done" },
        updated: DateTime.now().minus({ hours: 10 }).toISO()!,
        resolutiondate: DateTime.now().minus({ hours: 10 }).toISO()!,
        assignee: { accountId: "dana", emailAddress: "dana@example.com", displayName: "Dana" },
      },
    }),

    // 🟡 BORDERLINE: Has one very old commit (barely has commits)
    createIssue({
      key: "DB-501",
      fields: {
        status: { name: "In Progress" },
        updated: DateTime.now().minus({ hours: 12 }).toISO()!,
        assignee: { accountId: "eve", emailAddress: "eve@example.com", displayName: "Eve" },
        story_point_estimate: "5",
      },
    }),

    // 🟡 BORDERLINE: Updated exactly 1 day ago (on edge of stale)
    createIssue({
      key: "CACHE-602",
      fields: {
        status: { name: "In Progress" },
        updated: DateTime.now().minus({ days: 1 }).toISO()!,
        assignee: { accountId: "frank", emailAddress: "frank@example.com", displayName: "Frank" },
        story_point_estimate: "3",
      },
    }),

    // 🟡 BORDERLINE: Story points exactly equal to remaining days (late start threshold)
    createIssue({
      key: "QUEUE-703",
      fields: {
        status: { name: "In Progress" },
        updated: DateTime.now().minus({ hours: 6 }).toISO()!,
        assignee: { accountId: "grace", emailAddress: "grace@example.com", displayName: "Grace" },
        story_point_estimate: "2", // Exactly 2 days left in sprint
      },
    }),

    // 🟡 BORDERLINE: Days in progress exactly equal to story points (over due threshold)
    createIssue({
      key: "STREAM-804",
      fields: {
        status: { name: "In Progress" },
        updated: DateTime.now().minus({ hours: 4 }).toISO()!,
        assignee: { accountId: "henry", emailAddress: "henry@example.com", displayName: "Henry" },
        story_point_estimate: "3",
      },
    }),

    // 🟡 BORDERLINE: In Code Review but development field incomplete (missing MR threshold)
    createIssue({
      key: "GRAPHQL-905",
      fields: {
        status: { name: "Code Review" },
        updated: DateTime.now().minus({ hours: 2 }).toISO()!,
        assignee: { accountId: "iris", emailAddress: "iris@example.com", displayName: "Iris" },
        development: "branch=feature/graphql", // Has branch but no pullrequest=
        story_point_estimate: "2",
      },
    }),

    // 🟡 BORDERLINE: Recently assigned (was unassigned, ownership risk threshold)
    createIssue({
      key: "REST-1006",
      fields: {
        status: { name: "In Progress" },
        updated: DateTime.now().minus({ hours: 1 }).toISO()!,
        assignee: { accountId: "jack", emailAddress: "jack@example.com", displayName: "Jack" }, // Just assigned
        story_point_estimate: "1",
      },
    }),

    // 🟡 BORDERLINE: Blocker just resolved (blocked dependencies threshold)
    createIssue({
      key: "WEBSOCKET-1107",
      fields: {
        status: { name: "In Progress" },
        updated: DateTime.now().minus({ hours: 3 }).toISO()!,
        assignee: { accountId: "kate", emailAddress: "kate@example.com", displayName: "Kate" },
        story_point_estimate: "4",
      },
    }),

    // 🟡 BORDERLINE: Multiple borderline signals - old commit + near stale
    createIssue({
      key: "CRON-1208",
      fields: {
        status: { name: "In Progress" },
        updated: DateTime.now().minus({ days: 1, hours: 12 }).toISO()!,
        assignee: { accountId: "leo", emailAddress: "leo@example.com", displayName: "Leo" },
        story_point_estimate: "3",
      },
    }),

    // 🟡 BORDERLINE: Recently moved to Code Review (status transition)
    createIssue({
      key: "WORKER-1309",
      fields: {
        status: { name: "Code Review" },
        updated: DateTime.now().minus({ hours: 1 }).toISO()!,
        assignee: { accountId: "mia", emailAddress: "mia@example.com", displayName: "Mia" },
        development: "pullrequest=123", // Has MR, should be fine
        story_point_estimate: "2",
      },
    }),

    // 🟡 BORDERLINE: Sprint ending exactly at threshold (2 days)
    createIssue({
      key: "SCHEDULER-1410",
      fields: {
        status: { name: "In Progress" },
        updated: DateTime.now().minus({ hours: 8 }).toISO()!,
        assignee: { accountId: "noah", emailAddress: "noah@example.com", displayName: "Noah" },
        story_point_estimate: "5", // High story points, sprint ending
      },
    }),

    // 🟡 BORDERLINE: On Hold but recently updated (status edge case)
    createIssue({
      key: "MONITOR-1511",
      fields: {
        status: { name: "On Hold" },
        updated: DateTime.now().minus({ hours: 2 }).toISO()!,
        assignee: { accountId: "olivia", emailAddress: "olivia@example.com", displayName: "Olivia" },
        story_point_estimate: "2",
      },
    }),

    // 🟡 BORDERLINE: Story points = 1, remaining days = 2 (not late start, but close)
    createIssue({
      key: "LEGACY-1612",
      fields: {
        status: { name: "In Progress" },
        updated: DateTime.now().minus({ hours: 6 }).toISO()!,
        assignee: { accountId: "paul", emailAddress: "paul@example.com", displayName: "Paul" },
        story_point_estimate: "1", // Less than remaining days, should be fine
      },
    }),

    // 🟡 BORDERLINE: Days in progress = story points - 1 (just under over due)
    createIssue({
      key: "MICRO-1713",
      fields: {
        status: { name: "In Progress" },
        updated: DateTime.now().minus({ hours: 2 }).toISO()!,
        assignee: { accountId: "quinn", emailAddress: "quinn@example.com", displayName: "Quinn" },
        story_point_estimate: "3",
      },
    }),

    // 🟡 BORDERLINE: In Code Review with partial development field
    createIssue({
      key: "INTEGRATION-1814",
      fields: {
        status: { name: "Code Review" },
        updated: DateTime.now().minus({ hours: 3 }).toISO()!,
        assignee: { accountId: "rachel", emailAddress: "rachel@example.com", displayName: "Rachel" },
        development: "repository=backend", // Missing pullrequest= but has other data
        story_point_estimate: "3",
      },
    }),

    // 🟡 BORDERLINE: No assignee but recently created (ownership risk edge)
    createIssue({
      key: "FEAT-1915",
      fields: {
        status: { name: "In Progress" },
        updated: DateTime.now().minus({ hours: 1 }).toISO()!,
        assignee: undefined, // No assignee
        story_point_estimate: "2",
      },
    }),

    // 🟡 BORDERLINE: Very recent commit but issue not updated (commit/update mismatch)
    createIssue({
      key: "BUG-2016",
      fields: {
        status: { name: "In Progress" },
        updated: DateTime.now().minus({ days: 1 }).toISO()!,
        assignee: { accountId: "sam", emailAddress: "sam@example.com", displayName: "Sam" },
        story_point_estimate: "1",
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

    // BORDERLINE: One very old commit for DB-501 (barely has commits)
    createCommit({
      message: "DB-501 initial schema design",
      committerDate: DateTime.now().minus({ days: 5 }).toISO()!,
    }),

    // BORDERLINE: Recent commit for CACHE-602 (not stale yet)
    createCommit({
      message: "CACHE-602 add cache invalidation",
      committerDate: DateTime.now().minus({ hours: 20 }).toISO()!,
    }),

    // BORDERLINE: Recent commit for QUEUE-703
    createCommit({
      message: "QUEUE-703 implement queue processor",
      committerDate: DateTime.now().minus({ hours: 5 }).toISO()!,
    }),

    // BORDERLINE: Commit for STREAM-804
    createCommit({
      message: "STREAM-804 add stream handler",
      committerDate: DateTime.now().minus({ hours: 3 }).toISO()!,
    }),

    // No commit for GRAPHQL-905 (in Code Review but no commits - edge case)

    // BORDERLINE: Recent commit for REST-1006
    createCommit({
      message: "REST-1006 add REST endpoint",
      committerDate: DateTime.now().minus({ hours: 1 }).toISO()!,
    }),

    // BORDERLINE: Commit for WEBSOCKET-1107
    createCommit({
      message: "WEBSOCKET-1107 implement websocket connection",
      committerDate: DateTime.now().minus({ hours: 2 }).toISO()!,
    }),

    // BORDERLINE: Old commit for CRON-1208 (multiple borderline signals)
    createCommit({
      message: "CRON-1208 setup cron job",
      committerDate: DateTime.now().minus({ days: 2 }).toISO()!,
    }),

    // BORDERLINE: Recent commit for WORKER-1309
    createCommit({
      message: "WORKER-1309 implement background worker",
      committerDate: DateTime.now().minus({ hours: 2 }).toISO()!,
    }),

    // BORDERLINE: Commit for SCHEDULER-1410
    createCommit({
      message: "SCHEDULER-1410 add task scheduler",
      committerDate: DateTime.now().minus({ hours: 7 }).toISO()!,
    }),

    // No commit for MONITOR-1511 (On Hold status)

    // BORDERLINE: Recent commit for LEGACY-1612
    createCommit({
      message: "LEGACY-1612 refactor legacy code",
      committerDate: DateTime.now().minus({ hours: 5 }).toISO()!,
    }),

    // BORDERLINE: Commit for MICRO-1713
    createCommit({
      message: "MICRO-1713 add microservice endpoint",
      committerDate: DateTime.now().minus({ hours: 1 }).toISO()!,
    }),

    // No commit for INTEGRATION-1814 (in Code Review, no commits)

    // No commit for FEAT-1915 (no assignee, no commits)

    // BORDERLINE: Very recent commit but issue not updated for BUG-2016
    createCommit({
      message: "BUG-2016 fix critical bug",
      committerDate: DateTime.now().minus({ hours: 2 }).toISO()!,
    }),
  ],

  issueDetails: [
    createIssueDetails({
      key: "API-301",
      fields: {
        summary: "Build API contract for partner integration",
        description: "Initial API design and scaffolding",
        status: { name: "In Progress" },
        updated: DateTime.now().minus({ days: 2 }).toISO()!,
        assignee: { displayName: "Alice" },
        comment: {
          comments: [
            {
              body: "Waiting for partner schema clarification",
              created: DateTime.now().minus({ days: 1 }).toISO()!,
            },
          ],
        },
        story_point_estimate: "3",
      },
    }),

    createIssueDetails({
      key: "UI-402",
      fields: {
        summary: "Improve dashboard responsiveness",
        description: "Minor UI adjustments requested during review",
        status: { name: "In Progress" },
        updated: DateTime.now().minus({ hours: 20 }).toISO()!,
        assignee: { displayName: "Bob" },
        comment: {
          comments: [
            {
              body: "Small polish changes, nothing critical",
              created: DateTime.now().minus({ hours: 18 }).toISO()!,
            },
          ],
        },
        story_point_estimate: "2",
      },
    }),

    createIssueDetails({
      key: "OPS-515",
      fields: {
        summary: "Production alert cleanup",
        description: "Remove noisy alerts from monitoring",
        status: { name: "To Do" },
        updated: DateTime.now().minus({ hours: 6 }).toISO()!,
        assignee: { displayName: "Charlie" },
        comment: {
          comments: [
            {
              body: "Groomed and ready, scheduled for tomorrow",
              created: DateTime.now().minus({ hours: 5 }).toISO()!,
            },
          ],
        },
        story_point_estimate: "1",
      },
    }),

    createIssueDetails({
      key: "AUTH-210",
      fields: {
        summary: "Finalize authentication flow",
        description: "Edge case handling and final testing",
        status: { name: "Done" },
        updated: DateTime.now().minus({ hours: 10 }).toISO()!,
        resolutiondate: DateTime.now().minus({ hours: 10 }).toISO()!,
        assignee: { displayName: "Dana" },
        comment: {
          comments: [
            {
              body: "Merged and deployed successfully",
              created: DateTime.now().minus({ hours: 9 }).toISO()!,
            },
          ],
        },
        story_point_estimate: "5",
      },
    }),

    // BORDERLINE: Has one very old commit (barely has commits)
    createIssueDetails({
      key: "DB-501",
      fields: {
        summary: "Database migration optimization",
        description: "Optimize slow migration queries",
        status: { name: "In Progress" },
        updated: DateTime.now().minus({ hours: 12 }).toISO()!,
        statuscategorychangedate: DateTime.now().minus({ days: 4 }).toISO()!,
        assignee: { accountId: "eve", emailAddress: "eve@example.com", displayName: "Eve" },
        comment: {
          comments: [
            {
              body: "Initial work done, need to test performance",
              created: DateTime.now().minus({ days: 5 }).toISO()!,
            },
          ],
        },
        story_point_estimate: "5",
      },
    }),

    // BORDERLINE: Updated exactly 1 day ago (on edge of stale)
    createIssueDetails({
      key: "CACHE-602",
      fields: {
        summary: "Cache invalidation strategy",
        description: "Implement smart cache invalidation",
        status: { name: "In Progress" },
        updated: DateTime.now().minus({ days: 1 }).toISO()!,
        statuscategorychangedate: DateTime.now().minus({ days: 3 }).toISO()!,
        assignee: { accountId: "frank", emailAddress: "frank@example.com", displayName: "Frank" },
        comment: {
          comments: [
            {
              body: "Working on cache strategy, making good progress",
              created: DateTime.now().minus({ days: 1 }).toISO()!,
            },
          ],
        },
        story_point_estimate: "3",
      },
    }),

    // BORDERLINE: Story points exactly equal to remaining days (late start threshold)
    createIssueDetails({
      key: "QUEUE-703",
      fields: {
        summary: "Message queue implementation",
        description: "Implement async message queue",
        status: { name: "In Progress" },
        updated: DateTime.now().minus({ hours: 6 }).toISO()!,
        statuscategorychangedate: DateTime.now().minus({ days: 1 }).toISO()!,
        assignee: { accountId: "grace", emailAddress: "grace@example.com", displayName: "Grace" },
        comment: {
          comments: [
            {
              body: "Started yesterday, sprint ends in 2 days - tight but doable",
              created: DateTime.now().minus({ hours: 5 }).toISO()!,
            },
          ],
        },
        story_point_estimate: "2", // Exactly 2 days left
      },
    }),

    // BORDERLINE: Days in progress exactly equal to story points (over due threshold)
    createIssueDetails({
      key: "STREAM-804",
      fields: {
        summary: "Stream processing pipeline",
        description: "Build real-time stream processor",
        status: { name: "In Progress" },
        updated: DateTime.now().minus({ hours: 4 }).toISO()!,
        statuscategorychangedate: DateTime.now().minus({ days: 3 }).toISO()!,
        assignee: { accountId: "henry", emailAddress: "henry@example.com", displayName: "Henry" },
        comment: {
          comments: [
            {
              body: "Been in progress for 3 days, estimated 3 points - on track",
              created: DateTime.now().minus({ hours: 3 }).toISO()!,
            },
          ],
        },
        story_point_estimate: "3", // Exactly 3 days in progress
      },
    }),

    // BORDERLINE: In Code Review but development field incomplete (missing MR threshold)
    createIssueDetails({
      key: "GRAPHQL-905",
      fields: {
        summary: "GraphQL API endpoint",
        description: "Add new GraphQL query endpoint",
        status: { name: "Code Review" },
        updated: DateTime.now().minus({ hours: 2 }).toISO()!,
        statuscategorychangedate: DateTime.now().minus({ hours: 2 }).toISO()!,
        assignee: { accountId: "iris", emailAddress: "iris@example.com", displayName: "Iris" },
        comment: {
          comments: [
            {
              body: "Ready for review, MR link should be added",
              created: DateTime.now().minus({ hours: 2 }).toISO()!,
            },
          ],
        },
        story_point_estimate: "2",
      },
    }),

    // BORDERLINE: Recently assigned (was unassigned, ownership risk threshold)
    createIssueDetails({
      key: "REST-1006",
      fields: {
        summary: "REST API endpoint",
        description: "Create new REST endpoint for user data",
        status: { name: "In Progress" },
        updated: DateTime.now().minus({ hours: 1 }).toISO()!,
        statuscategorychangedate: DateTime.now().minus({ hours: 1 }).toISO()!,
        assignee: { accountId: "jack", emailAddress: "jack@example.com", displayName: "Jack" },
        comment: {
          comments: [
            {
              body: "Just assigned to me, starting work now",
              created: DateTime.now().minus({ hours: 1 }).toISO()!,
            },
          ],
        },
        story_point_estimate: "1",
      },
    }),

    // BORDERLINE: Blocker just resolved (blocked dependencies threshold)
    createIssueDetails({
      key: "WEBSOCKET-1107",
      fields: {
        summary: "WebSocket connection handler",
        description: "Implement WebSocket connection management",
        status: { name: "In Progress" },
        updated: DateTime.now().minus({ hours: 3 }).toISO()!,
        statuscategorychangedate: DateTime.now().minus({ days: 2 }).toISO()!,
        assignee: { accountId: "kate", emailAddress: "kate@example.com", displayName: "Kate" },
        comment: {
          comments: [
            {
              body: "Dependency issue resolved, can proceed now",
              created: DateTime.now().minus({ hours: 3 }).toISO()!,
            },
          ],
        },
        story_point_estimate: "4",
        issuelinks: [
          {
            inwardIssue: {
              fields: {
                status: { name: "Done" }, // Blocker just resolved
              },
            },
          },
        ],
      },
    }),

    // BORDERLINE: Multiple borderline signals - old commit + near stale
    createIssueDetails({
      key: "CRON-1208",
      fields: {
        summary: "Cron job scheduler",
        description: "Setup automated cron jobs",
        status: { name: "In Progress" },
        updated: DateTime.now().minus({ days: 1, hours: 12 }).toISO()!,
        statuscategorychangedate: DateTime.now().minus({ days: 2 }).toISO()!,
        assignee: { accountId: "leo", emailAddress: "leo@example.com", displayName: "Leo" },
        comment: {
          comments: [
            {
              body: "Working on it, should update soon",
              created: DateTime.now().minus({ days: 1 }).toISO()!,
            },
          ],
        },
        story_point_estimate: "3",
      },
    }),

    // BORDERLINE: Recently moved to Code Review (status transition)
    createIssueDetails({
      key: "WORKER-1309",
      fields: {
        summary: "Background worker implementation",
        description: "Create worker for async tasks",
        status: { name: "Code Review" },
        updated: DateTime.now().minus({ hours: 1 }).toISO()!,
        statuscategorychangedate: DateTime.now().minus({ hours: 1 }).toISO()!,
        assignee: { accountId: "mia", emailAddress: "mia@example.com", displayName: "Mia" },
        comment: {
          comments: [
            {
              body: "Moved to code review, MR #123",
              created: DateTime.now().minus({ hours: 1 }).toISO()!,
            },
          ],
        },
        story_point_estimate: "2",
      },
    }),

    // BORDERLINE: Sprint ending exactly at threshold (2 days)
    createIssueDetails({
      key: "SCHEDULER-1410",
      fields: {
        summary: "Task scheduler service",
        description: "Build task scheduling service",
        status: { name: "In Progress" },
        updated: DateTime.now().minus({ hours: 8 }).toISO()!,
        statuscategorychangedate: DateTime.now().minus({ days: 3 }).toISO()!,
        assignee: { accountId: "noah", emailAddress: "noah@example.com", displayName: "Noah" },
        comment: {
          comments: [
            {
              body: "High priority, sprint ending soon",
              created: DateTime.now().minus({ hours: 7 }).toISO()!,
            },
          ],
        },
        story_point_estimate: "5", // High story points, sprint ending
      },
    }),

    // BORDERLINE: On Hold but recently updated (status edge case)
    createIssueDetails({
      key: "MONITOR-1511",
      fields: {
        summary: "Monitoring dashboard",
        description: "Build monitoring dashboard",
        status: { name: "On Hold" },
        updated: DateTime.now().minus({ hours: 2 }).toISO()!,
        statuscategorychangedate: DateTime.now().minus({ days: 1 }).toISO()!,
        assignee: { accountId: "olivia", emailAddress: "olivia@example.com", displayName: "Olivia" },
        comment: {
          comments: [
            {
              body: "On hold pending approval",
              created: DateTime.now().minus({ hours: 2 }).toISO()!,
            },
          ],
        },
        story_point_estimate: "2",
      },
    }),

    // BORDERLINE: Story points = 1, remaining days = 2 (not late start, but close)
    createIssueDetails({
      key: "LEGACY-1612",
      fields: {
        summary: "Legacy code refactoring",
        description: "Refactor old legacy code",
        status: { name: "In Progress" },
        updated: DateTime.now().minus({ hours: 6 }).toISO()!,
        statuscategorychangedate: DateTime.now().minus({ days: 1 }).toISO()!,
        assignee: { accountId: "paul", emailAddress: "paul@example.com", displayName: "Paul" },
        comment: {
          comments: [
            {
              body: "Small task, should be done today",
              created: DateTime.now().minus({ hours: 5 }).toISO()!,
            },
          ],
        },
        story_point_estimate: "1", // Less than remaining days, should be fine
      },
    }),

    // BORDERLINE: Days in progress = story points - 1 (just under over due)
    createIssueDetails({
      key: "MICRO-1713",
      fields: {
        summary: "Microservice endpoint",
        description: "Add endpoint to microservice",
        status: { name: "In Progress" },
        updated: DateTime.now().minus({ hours: 2 }).toISO()!,
        statuscategorychangedate: DateTime.now().minus({ days: 2 }).toISO()!,
        assignee: { accountId: "quinn", emailAddress: "quinn@example.com", displayName: "Quinn" },
        comment: {
          comments: [
            {
              body: "2 days in progress, estimated 3 points - still on track",
              created: DateTime.now().minus({ hours: 1 }).toISO()!,
            },
          ],
        },
        story_point_estimate: "3", // 2 days in progress, 3 points estimated
      },
    }),

    // BORDERLINE: In Code Review with partial development field
    createIssueDetails({
      key: "INTEGRATION-1814",
      fields: {
        summary: "Third-party integration",
        description: "Integrate with external service",
        status: { name: "Code Review" },
        updated: DateTime.now().minus({ hours: 3 }).toISO()!,
        statuscategorychangedate: DateTime.now().minus({ hours: 3 }).toISO()!,
        assignee: { accountId: "rachel", emailAddress: "rachel@example.com", displayName: "Rachel" },
        comment: {
          comments: [
            {
              body: "MR exists but not linked in development field",
              created: DateTime.now().minus({ hours: 3 }).toISO()!,
            },
          ],
        },
        story_point_estimate: "3",
      },
    }),

    // BORDERLINE: No assignee but recently created (ownership risk edge)
    createIssueDetails({
      key: "FEAT-1915",
      fields: {
        summary: "New feature implementation",
        description: "Implement new user feature",
        status: { name: "In Progress" },
        updated: DateTime.now().minus({ hours: 1 }).toISO()!,
        statuscategorychangedate: DateTime.now().minus({ hours: 1 }).toISO()!,
        // No assignee field - testing ownership risk
        comment: {
          comments: [
            {
              body: "Needs assignment",
              created: DateTime.now().minus({ hours: 1 }).toISO()!,
            },
          ],
        },
        story_point_estimate: "2",
      },
    }),

    // BORDERLINE: Very recent commit but issue not updated (commit/update mismatch)
    createIssueDetails({
      key: "BUG-2016",
      fields: {
        summary: "Critical bug fix",
        description: "Fix critical production bug",
        status: { name: "In Progress" },
        updated: DateTime.now().minus({ days: 1 }).toISO()!,
        statuscategorychangedate: DateTime.now().minus({ days: 2 }).toISO()!,
        assignee: { accountId: "sam", emailAddress: "sam@example.com", displayName: "Sam" },
        comment: {
          comments: [
            {
              body: "Fixed but forgot to update Jira",
              created: DateTime.now().minus({ hours: 2 }).toISO()!,
            },
          ],
        },
        story_point_estimate: "1",
      },
    }),
  ],
};
