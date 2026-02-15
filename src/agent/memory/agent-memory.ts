import { DateTime } from "luxon";
import { llmAnalyzedRiskT, RiskT } from "../types";
import { RiskMemory } from "../../db/schema/risk-memory.schema";
import { SprintDetailT } from "../../integrations/types";

const getSeverityFromScore = (score: number) => {
  if (score >= 50) return "HIGH";
  if (score >= 30) return "MEDIUM";
  return "LOW";
};

const ALERT_COOLDOWN_HOURS = 24;

export type AlterTypeT = "NEW" | "ESCALATED" | "REMINDER";

export type MemoryAwareRiskT = RiskT & {
  severity: "LOW" | "MEDIUM" | "HIGH";
  alertType: AlterTypeT;
};

// will provide memory to help determine if the risks are new or are already reported
export const applyAgentMemory = async (
  risks: RiskT[],
  sprintContext: SprintDetailT
): Promise<MemoryAwareRiskT[]> => {
  const now = DateTime.now();
  const actionable: MemoryAwareRiskT[] = [];

  for (const risk of risks) {
    const severity = getSeverityFromScore(risk.riskScore);

    const existing = await RiskMemory.findOne({
      issueKey: risk.issueKey,
      active: true,
    });

    // first time seeing this issue
    if (!existing) {
      await RiskMemory.create({
        issueKey: risk.issueKey,
        lastRiskScore: risk.riskScore,
        lastSeverity: severity,
        lastAltertedAt: now.toJSDate(),
        sprintName: sprintContext.name,
      });

      actionable.push({
        ...risk,
        severity,
        alertType: "NEW",
      });

      continue;
    }

    const hoursSinceLastAlert = now.diff(
      DateTime.fromJSDate(existing.lastAltertedAt),
      "hours"
    ).hours;
    const severityEscalated =
      severity === "HIGH" && existing.lastSeverity !== "HIGH";

    // supress noise
    if (!severityEscalated && hoursSinceLastAlert < ALERT_COOLDOWN_HOURS) {
      continue;
    }

    /**
     * Detecting sprint change: record that this issue was risky in a previous sprint
     */
    if (existing.sprintName !== sprintContext.name) {
      const prevSprint = {
        sprintName: existing.sprintName,
        riskScore: existing.lastRiskScore,
        severity: existing.lastSeverity,
      };
      if (Array.isArray(existing.riskHistory)) {
        existing.riskHistory.unshift(prevSprint);
      } else {
        existing.set("riskHistory", [prevSprint]);
      }
      // update sprint name to latest one
      existing.sprintName = sprintContext.name;
    }

    // update memory
    existing.lastRiskScore = risk.riskScore;
    existing.lastSeverity = severity;
    existing.lastAltertedAt = now.toJSDate();
    await existing.save();

    actionable.push({
      ...risk,
      severity,
      alertType: severityEscalated ? "ESCALATED" : "REMINDER",
    });
  }

  return actionable;
};

// Updates the issues based on GenAi response (if any)
export const updateAgentMemory = async (
  risks: llmAnalyzedRiskT[]
): Promise<void> => {
  for (const risk of risks) {
    await RiskMemory.findOneAndUpdate(
      {
        issueKey: risk.issueKey,
      },
      {
        $set: {
          confidence: risk.confidence,
        },
      },
      {
        $upsert: false,
      }
    );
  }
};
