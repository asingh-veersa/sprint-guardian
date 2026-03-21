import { Changelog } from "jira.js/version3/models/changelog";

/**
 * Determines whether an issue is "status flapping"—that is, changing between statuses
 * too often in a short period (e.g., >= 3 status changes in the last 2 days).
 *
 * @param histories Array of changelog history objects, each with { field, created } properties
 * @param statusFieldName Name of the status field in changelog (default: "status")
 * @param thresholdCount How many status changes triggers "flapping" (default: 3)
 * @param windowDays Time window (in days) for counting changes (default: 2)
 * @returns boolean - true if flapping detected, false otherwise
 */
export const statusFlapping = (
  histories: Changelog[] = [],
  statusFieldName: string = "status",
  thresholdCount: number = 3,
  windowDays: number = 2,
): boolean => {
  if (!histories || !histories.length) return false;

  const now = new Date();
  const windowAgo = new Date(now.getTime() - windowDays * 24 * 60 * 60 * 1000);

  // Filter status field changes within the last N days
  const statusChanges = histories.filter(
    (h) =>
      h.historyMetadata?.type?.toLowerCase() ===
        statusFieldName.toLowerCase() && new Date(h.created ?? "") >= windowAgo,
  );

  return statusChanges.length >= thresholdCount;
};
