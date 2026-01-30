import { llmAnalyzedRiskT, RiskT } from "./types";
import env from "../config/env";
import { SprintDetailT } from "../integrations/types";
import { callGenAI } from "../llm/gemini-client";
import { mockLLMresponse } from "../mock/llm";
import { MemoryAwareRiskT } from "./memory/agent-memory";
import { RiskMemory } from "../db/schema/risk-memory.schema";

export const performGenAiAnalysis = async (
  risks: MemoryAwareRiskT[],
  sprintContext: SprintDetailT
): Promise<llmAnalyzedRiskT[]> => {
  if (!risks || risks.length === 0) return [];

  const memory = await RiskMemory.find();

  const prompt = `
You are an AI Sprint Guardian, an autonomous risk arbitration agent.

A deterministic analyzer has flagged the following issues as POSSIBLE risks.
These are heuristic-based and may contain false positives.

Your responsibilities:
1. Decide whether each item is a REAL RISK or a FALSE POSITIVE
2. If a real risk, assign severity (HIGH | MEDIUM | LOW)
3. Decide urgency (IMMEDIATE | TODAY | LATER | IGNORE)
4. Explain your reasoning using issue details and signals
5. Suppress noise aggressively
6. Assign a confidence score to your decision

Signal definitions:
- noCommits: Issue has no GitLab commits linked
- daysSinceLastCommit: Days since last commit (null means no commits)
- staleDays: Days since Jira issue was last updated
- sprintEnding: Sprint has 2 days or less remaining
- missingMR: Issue is in Code Review but no merge request linked
- ownershipRisk: Issue has no assignee

Sprint context:
${JSON.stringify(sprintContext, null, 2)}

Historical memory:
${JSON.stringify(memory, null, 2)}

Suspecte risks with historical context and with full issue context:
Each risk includes:
- severity: current risk level
- alertType:
  - NEW → first time this issue is risky
  - ESCALATED → risk has increased since last run
  - REMINDER → ongoing unresolved risk
${JSON.stringify(risks, null, 2)}

Rules:
- You are allowed to mark items as IGNORE even if riskScore is high
- Prefer fewer alerts over more alerts
- Use history to detect repeated low-value alerts
- Use comments, status, and timing to infer human intent
- Do NOT invent facts
- Confidence must be between 0.0 and 1.0
- One output per input item

Return format:
[
  {
    "issueKey": "AUTH-123",
    "decision": "CONFIRMED | IGNORE | MONITOR",
    "confidence": 0.0,
    "severity": "HIGH | MEDIUM | LOW | NONE",
    "urgency": "IMMEDIATE | TODAY | LATER | NONE",
    "reason": "...",
    "suggestedAction": "..."
  }
]
`;

  const llmMockModeEnabled = env.llmConfig.enableMockMode;

  const response =
    llmMockModeEnabled === true ? mockLLMresponse : await callGenAI(prompt);

  try {
    if (!response) {
      throw new Error("❌ Gemini returned empty response");
    }
    const cleanJson = response
      ?.replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    return JSON.parse(cleanJson);
  } catch (err) {
    console.error("❌ Failed to parse GenAI response:");
    throw err;
  }
};
