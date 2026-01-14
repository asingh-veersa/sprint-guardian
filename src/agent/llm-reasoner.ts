import { RiskT } from "./types";
import env from "../config/env";
import { SprintDetailT } from "../integrations/types";
import { callGenAI } from "../llm/gemini-client";
import { mockLLMresponse } from "../mock/llm";
import { MemoryAwareRiskT } from "./memory/agent-memory";

export const performLlmReasoning = async (
  risks: MemoryAwareRiskT[],
  sprintContext: SprintDetailT
) => {
  if (!risks || risks.length === 0) return [];

  const prompt = `
You are an AI Sprint Guardian.

You analyze sprint risks detected by the system.
Each risk is derived from factual signals and historical memory.

Each signal represents factual evidence collected by the system.
Your job is to:
- Interpret the signals
- Explain WHY this issue is a risk at this moment
- Adapt your explanation based on alertType
- Suggest a concrete next action

IMPORTANT:
- Severity is already determined by the system — do NOT reassign it
- Do NOT invent facts or signals
- Use only the provided data

Signal definitions:
- noCommits: Issue has no GitLab commits linked
- daysSinceLastCommit: Days since last commit (null means no commits)
- staleDays: Days since Jira issue was last updated
- sprintEnding: Sprint has 2 days or less remaining
- missingMR: Issue is in Code Review but no merge request linked
- ownershipRisk: Issue has no assignee

Sprint context:
${JSON.stringify(sprintContext, null, 2)}

Detected risks with historical context:
Each risk includes:
- severity: current risk level
- alertType:
  - NEW → first time this issue is risky
  - ESCALATED → risk has increased since last run
  - REMINDER → ongoing unresolved risk
${JSON.stringify(risks, null, 2)}

Instructions:
- If alertType is NEW:
  - Explain the primary risk clearly using the signals
- If alertType is ESCALATED:
  - Explain what has worsened or changed since the last run
  - Emphasize urgency
- If alertType is REMINDER:
  - Focus on what action is still missing or ignored
  - Avoid repeating generic explanations

Rules:
- One output per input risk
- Preserve issueKey and severity exactly as provided
- Use the signals explicitly in your reasoning
- Return valid JSON only
- No markdown, no extra text

Return format:
[
  {
    "issueKey": "AUTH-123",
    "severity": "HIGH | MEDIUM | LOW",
    "reason": "Clear explanation referencing the signals and alertType",
    "suggestedAction": "Concrete, human-actionable step"
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
    return JSON.parse(response);
  } catch (err) {
    console.error("❌ Failed to parse GenAI response:");
    throw err;
  }
};
