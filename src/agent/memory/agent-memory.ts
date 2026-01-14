import { DateTime } from "luxon";
import { RiskT } from "../types";
import { RiskMemory } from "../../db/schema/risk-memory.schema";

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

export const applyAgentMemory = async (
  risks: RiskT[]
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
