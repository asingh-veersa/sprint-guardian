import { DateTime } from "luxon";
import { SprintIssueT } from "../../integrations/types";

export const createIssue = (partial: Partial<SprintIssueT>): SprintIssueT => ({
  id: partial.id ?? crypto.randomUUID(),
  key: partial.key ?? "TEST-1",
  fields: {
    summary: partial.fields?.summary ?? "Test issue",
    description: partial.fields?.description ?? "",
    created:
      partial.fields?.created ?? DateTime.now().minus({ days: 35 }).toISO()!,
    updated:
      partial.fields?.updated ?? DateTime.now().minus({ days: 2 }).toISO()!,
    status: partial.fields?.status ?? {
      name: "In Progress",
    },
    assignee: partial.fields?.assignee ?? {
      accountId: "1",
      emailAddress: "dev@example.com",
      displayName: "Dev User",
    },
    story_point_estimate: partial.fields?.story_point_estimate ?? "3",
    development: partial.fields?.development ?? "",
    ...partial.fields,
  },
});
