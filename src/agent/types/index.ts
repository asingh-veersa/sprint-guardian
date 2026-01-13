export type RiskT = {
  type?: string;
  message?: string;
  issueKey: string;
  summary: string;
  status: string;
  riskScore: number;
  signals: RiskSignalsT;
};

export type RiskSignalsT = {
  noCommits: boolean;
  staleDays: number;
  sprintEnding: boolean;
  missingMR?: boolean;
};

export type LlmInsightT = {
  issueKey: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  reason: string;
  suggestedAction: string;
};
