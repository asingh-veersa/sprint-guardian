import { Decision, llmAnalyzedRiskT, Urgency } from "./types";

const decisionEngine = (risks: llmAnalyzedRiskT[]): llmAnalyzedRiskT[] =>
  risks.filter(
    (risk) =>
      risk.decision === Decision.CONFIRMED &&
      (risk.urgency === Urgency.IMMEDIATE || risk.urgency === Urgency.TODAY)
  );

export default decisionEngine;
