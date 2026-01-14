import { RiskMemory } from "../../db/schema/risk-memory.schema";

export const cleanupResolvedIssues = async (
  activeIssueKeys: string[]
): Promise<void> => {
  await RiskMemory.updateMany(
    {
      issueKey: { $nin: activeIssueKeys },
      active: true,
    },
    {
      $set: { active: false },
    }
  );
};
