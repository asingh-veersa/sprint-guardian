import { Decision, llmAnalyzedRiskT, Urgency } from "./types";

const decisionEngine = (risks: llmAnalyzedRiskT[]): llmAnalyzedRiskT[] =>
  // passing all type of severity for now
  risks.filter((risk) => risk.decision !== Decision.IGNORE);

export default decisionEngine;
