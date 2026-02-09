import { SprintIssueDetailsT } from "../../integrations/types";

export type RiskT = {
  type?: string;
  message?: string;
  issueKey: string;
  summary: string;
  status: string;
  riskScore: number;
  signals: RiskSignalsT;
  issue: SprintIssueDetailsT;
  // NOTE: for dev logging only (not available in production)
  triggeredSignals?: number[];
};

export type RiskSignalsT = {
  noCommits: boolean;
  daysSinceLastCommit: number | null;
  staleDays: number;
  sprintEnding: boolean;
  missingMR?: boolean;
  ownershipRisk?: boolean;
};

export enum Decision {
  CONFIRMED = "CONFIRMED",
  IGNORE = "IGNORE",
  MONITOR = "MONITOR",
}

export enum Severity {
  HIGH = "HIGH",
  MEDIUM = "MEDIUM",
  LOW = "LOW",
  NONE = "NONE",
}

export enum Urgency {
  IMMEDIATE = "IMMEDIATE",
  TODAY = "TODAY",
  LATER = "LATER",
  NONE = "NONE",
}

export type llmAnalyzedRiskT = {
  issueKey: string;
  decision: Decision;
  severity: Severity;
  urgency: Urgency;
  reason: string;
  suggestedAction: string;
  confidence: string;
};
