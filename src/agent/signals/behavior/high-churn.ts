import { TicketState } from "../../../utils/agent.utils";

/**
 * Detects whether an issue or ticket is experiencing "high churn" —
 * that is, it has undergone a high number of updates (e.g., status or assignee changes)
 * in a short period, suggesting indecision, change of direction, or excessive back-and-forth.
 *
 * @param updates Number of distinct updates (status/assignee/field changes) during the time window.
 * @param status Current status of the issue (e.g., "Done", "In Progress").
 * @param threshold Minimum number of updates to consider as "high churn" (default: 4).
 * @returns boolean - true if churn detected (not done, and updates > threshold), false otherwise.
 */
export const highChurn = (
  updates: number,
  status: TicketState,
  threshold: number = 4,
): boolean => {
  if (typeof updates !== "number" || updates < 0) return false;
  if (!status) return false;
  // Don't flag issues that are completed (e.g., Done/Closed)
  // Tolerate various casing (e.g. "done", "Done", etc)
  const normalizedStatus = status.trim().toLowerCase();
  const doneStatuses = ["done", "closed", "resolved"];
  if (doneStatuses.includes(normalizedStatus)) return false;
  return updates > threshold;
};
