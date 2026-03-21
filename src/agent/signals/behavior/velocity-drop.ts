/**
 * Detect if a team's current sprint "velocity" (commit count) has dropped compared to previous sprints.
 * This version uses commit counts as the measure of velocity (not story points).
 *
 * @param currentCommitCount - The total number of commits in the current timeframe (e.g., sprint)
 * @param previousCommitCounts - Array of total commit counts for previous equivalent timeframes (e.g., previous sprints)
 * @param thresholdDropRatio - Ratio threshold for drop detection (e.g. 0.2 = 20% drop triggers signal)
 * @returns boolean - true if velocity dropped more than threshold, false otherwise
 */
export const velocityDrop = (
  currentCommitCount: number,
  previousCommitCounts: number[] = [],
  thresholdDropRatio: number = 0.2,
): boolean => {
  // Require at least one previous period for comparison
  if (
    isNaN(currentCommitCount) ||
    currentCommitCount === 0 ||
    !previousCommitCounts?.length
  ) {
    return false;
  }

  // Filter out invalid or zero commit counts from previous periods
  const prevValidCounts = previousCommitCounts.filter(
    (n) => !isNaN(n) && n > 0,
  );
  if (!prevValidCounts.length) return false;

  // Calculate average commits of previous periods
  const avgPrevCommits =
    prevValidCounts.reduce((sum, n) => sum + n, 0) / prevValidCounts.length;
  if (avgPrevCommits === 0) return false;

  // Calculate drop ratio
  const dropRatio = (avgPrevCommits - currentCommitCount) / avgPrevCommits;
  return dropRatio >= thresholdDropRatio;
};
