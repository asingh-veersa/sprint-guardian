import { DateTime } from "luxon";
import { CommitT } from "../../integrations/types";

export const createCommit = (partial: Partial<CommitT>): CommitT => ({
  id: partial.id ?? crypto.randomUUID(),
  projectId: partial.projectId ?? 1,
  message: partial.message ?? "TEST-1 dummy commit",
  author: partial.author ?? "Test User",
  authorEmail: partial.authorEmail ?? "test@example.com",
  authoredDate:
    partial.authoredDate ?? DateTime.now().minus({ days: 1 }).toISO()!,
  committer: partial.committer ?? "Test User",
  committerEmail: partial.committerEmail ?? "test@example.com",
  committerDate:
    partial.committerDate ?? DateTime.now().minus({ days: 1 }).toISO()!,
});
