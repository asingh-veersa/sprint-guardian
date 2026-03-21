import { llmAnalyzedRiskT } from "./types";
import env from "../config/env";
import { SprintDetailT } from "../integrations/types";
import { callGenAI } from "../llm/gemini-client";
import { mockLLMresponse } from "../mock/llm";
import { MemoryAwareRiskT } from "./memory/agent-memory";
import { RiskMemory } from "../db/schema/risk-memory.schema";

/**
 * Performs GenAI analysis on the provided risks within the sprint context.
 * This function builds a structured prompt for the LLM, using memory and issue context,
 * and robustly parses the response. Enhanced error handling and logics.
 *
 * @param risks - The risks to analyze, with memory/severity context already applied
 * @param sprintContext - Sprint context to help guide the AI reasoning
 * @returns LLM-analyzed list, filtered and validated
 */
export const performGenAiAnalysis = async (
  risks: MemoryAwareRiskT[],
  sprintContext: SprintDetailT
): Promise<llmAnalyzedRiskT[]> => {
  if (!Array.isArray(risks) || risks.length === 0) {
    return [];
  }

  // Only fetch active memory for relevant risks for a tighter prompt
  const relevantIssueKeys = risks.map(risk => risk.issueKey);
  const memory = await RiskMemory.find({ issueKey: { $in: relevantIssueKeys }, active: true });

  // Defensive: In case a non-objectified sprintContext is passed in
  const safeSprintContext = typeof sprintContext === "object"
    ? sprintContext
    : {};

  // Prompt string improvements: clarity, compactness, and double braces for JSON
  const prompt = `
You are an AI Sprint Guardian, an autonomous risk arbitration agent.

A deterministic analyzer has flagged the following issues as POSSIBLE risks.
These are heuristic-based and may contain false positives.

Your responsibilities:
1. Decide whether each item is a REAL RISK or a FALSE POSITIVE.
2. If a real risk, assign severity (HIGH | MEDIUM | LOW).
3. Decide urgency (IMMEDIATE | TODAY | LATER | IGNORE).
4. Explain your reasoning using issue details and signals.
5. Suppress noise aggressively.
6. Assign a confidence score to your decision (0.0-1.0).

For each risk, you will see two types of diagnostic signals:
- Base signals: Fundamental markers such as blocked dependencies, stale updates, lack of assignee, or missing required fields. These indicate structural or process-related problems inherent to the issue, regardless of behavior over time.

- Behavior signals: Indicators of problematic patterns, such as frequent status changes (high churn), repeated reopening, returns to previous workflow stages, or evidence of neglect/bounce-back. These capture non-obvious risk factors and team response patterns.

Evaluate both sets of signals for each risk holistically. Always consider how multiple signals (or their absence) interact, and weigh conflicting evidence carefully.

GitLab activity rules:
- If commits exist in merge requests, treat issue as ACTIVE even if noCommits is true
- Prefer MR activity over default branch commits when assessing progress

Noise suppression rules:
- Repeated REMINDER alerts with no change → downgrade or IGNORE
- Low severity issues without escalation → IGNORE
- Avoid flagging issues that are actively being worked on

Decision definitions:
- CONFIRMED → Clear, actionable risk requiring attention
- MONITOR → Weak or emerging signal, not urgent yet
- IGNORE → False positive or no meaningful risk

Confidence guidelines:
- >0.8 → strong multi-signal evidence
- 0.5–0.8 → moderate evidence or partial signals
- <0.5 → weak or ambiguous signals

Sprint context:
${JSON.stringify(safeSprintContext, null, 2)}

Historical memory:
${JSON.stringify(memory, null, 2)}

Suspect risks with historical context and with full issue context:
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

If signals conflict (e.g., staleDays high but recent commits exist),
explain why one signal outweighs the other.

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
