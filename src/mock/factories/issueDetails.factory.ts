import { SprintIssueDetailsT } from "../../integrations/types";

export const createIssueDetails = (
  partial: Partial<SprintIssueDetailsT>
): SprintIssueDetailsT => ({
  id: partial.id ?? crypto.randomUUID(),
  key: partial.key ?? "TEST-1",
  fields: partial.fields!,
});
