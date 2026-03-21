/**
 * Detects if an issue's progress has meaningfully stalled.
 * This checks both periods of staleness and lack of recent commits, and can be tuned
 * with custom thresholds for both issue update and commit inactivity.
 *
 * @param staleDays - Days since the issue was last updated (e.g., issue.fields.updated)
 * @param daysSinceLastCommit - Days since the last commit was made for the issue
 * @param options - Optional tuning of thresholds:
 *        - staleThreshold: minimum days without issue update to be considered stalled (default: 2)
 *        - commitThreshold: minimum days since last commit to be considered inactive (default: 2)
 *        - maxAllowed: if provided, always return false if either value is below maxAllowed (to buffer for weekends/holidays)
 * @returns boolean - true if both thresholds are met, false otherwise
 */
export const progressStall = (
  staleDays: number,
  daysSinceLastCommit: number,
  options?: {
    staleThreshold?: number;
    commitThreshold?: number;
    maxAllowed?: number;
  }
): boolean => {
  const staleThreshold = options?.staleThreshold ?? 2;
  const commitThreshold = options?.commitThreshold ?? 2;
  const maxAllowed = options?.maxAllowed;

  // If either metric is missing or negative, we can't detect stall.
  if (staleDays < 0 || daysSinceLastCommit < 0) {
    return false;
  }

  // Optionally, avoid flagging as stalled unless both have met at least 'maxAllowed',
  // which is handy for sprint beginnings, weekends, or holidays.
  if (maxAllowed  && (staleDays < maxAllowed || daysSinceLastCommit < maxAllowed)) {
    return false;
  }

  // Stalled if both thresholds are met
  if (staleDays >= staleThreshold && daysSinceLastCommit >= commitThreshold) {
    return true;
  }

  return false;
};