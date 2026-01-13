import { RiskT } from "./types";
import env from "../config/env";
import { SprintDetailT } from "../integrations/types";
import { callGenAI } from "../llm/gemini-client";
import { mockLLMresponse } from "../mock/llm";

export const performLlmReasoning = async (
  risks: RiskT[],
  sprintContext: SprintDetailT
) => {
  if (!risks || risks.length === 0) return [];

  const prompt = `
You are an AI Sprint Guardian.

You are given detected sprint risks along with the exact signals that caused each risk.

Each signal represents factual evidence collected by the system.
Your job is to:
- Interpret the signals
- Assign a severity (HIGH, MEDIUM, LOW)
- Explain the risk using the signals
- Suggest a concrete next action

Signal definitions:
- noCommits: Issue has no GitLab commits linked
- daysSinceLastCommit: Days since last commit (null means no commits)
- staleDays: Days since Jira issue was last updated
- sprintEnding: Sprint has 2 days or less remaining
- missingMR: Issue is in Code Review but no merge request linked
- ownershipRisk: Issue has no assignee

Sprint context:
${JSON.stringify(sprintContext, null, 2)}

Detected risks:
${JSON.stringify(risks, null, 2)}

Rules:
- Use the signals explicitly in your reasoning
- Do NOT invent facts
- One output per input risk
- Preserve issueKey
- Return valid JSON only
- No markdown

Return format:
[
  {
    "issueKey": "AUTH-123",
    "severity": "HIGH | MEDIUM | LOW",
    "reason": "Clear explanation referencing the signals",
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
