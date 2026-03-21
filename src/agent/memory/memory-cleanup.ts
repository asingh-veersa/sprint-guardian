import { RiskMemory } from "../../db/schema/risk-memory.schema";

/**
 * Marks all RiskMemory entries as inactive (active: false) except those whose issueKey is in `activeIssueKeys`.
 *
 * @param activeIssueKeys List of issue keys that should remain active.
 */
export const cleanupResolvedIssues = async (
  activeIssueKeys: string[],
): Promise<void> => {
  // If no activeIssueKeys are provided, mark ALL active issues as inactive.
  const filter =
    activeIssueKeys.length > 0
      ? { issueKey: { $nin: activeIssueKeys }, active: true }
      : { active: true };

  await RiskMemory.updateMany(filter, { $set: { active: false } });
};
