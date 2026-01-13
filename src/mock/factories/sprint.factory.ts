import { DateTime } from "luxon";
import { SprintDetailT } from "../../integrations/types";

export const createSprintContext = (
  partial: Partial<SprintDetailT>
): SprintDetailT => ({
  id: partial.id ?? 1,
  self: partial.self ?? "https://jira.example.com/sprint/1",
  state: partial.state ?? "active",
  name: partial.name ?? "Mock Sprint",
  startDate: partial.startDate ?? DateTime.now().minus({ days: 10 }).toISO()!,
  endDate: partial.endDate ?? DateTime.now().plus({ days: 2 }).toISO()!,
  originBoardId: partial.originBoardId ?? 1,
  goal: partial.goal ?? "Test sprint",
});
