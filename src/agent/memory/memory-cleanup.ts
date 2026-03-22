import { RiskMemory } from "../../db/schema/risk-memory.schema";
import { dbGetActiveSprint } from "../../utils/db.utils";

/**
 * Marks all RiskMemory entries as inactive (active: false) except those whose issueKey is in `activeIssueKeys`.
 *
 * @param activeIssueKeys List of issue keys that should remain active.
 */
export const cleanupResolvedIssues = async (
  activeIssueKeys: string[],
): Promise<void> => {
  try {
    const currSprint = await dbGetActiveSprint();
    // If no activeIssueKeys are provided, mark ALL active issues as inactive.
    const filter =
      activeIssueKeys.length > 0
        ? {
            issueKey: { $nin: activeIssueKeys },
            active: true,
            sprintName: currSprint?.name,
          }
        : { active: true, sprintName: currSprint?.name };

    const result = await RiskMemory.updateMany(filter, {
      $set: { active: false },
    });
  } catch (error) {
    console.error("Failed to clean up resolved issues:", error);
  }
};
