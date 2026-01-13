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

Your role is to reason over PRE-DETECTED sprint risks.
Do NOT invent new risks or issue keys.
Only analyze the risks provided below.

Sprint context:
${JSON.stringify(sprintContext, null, 2)}

Detected risks (source of truth):
${JSON.stringify(risks, null, 2)}

Severity rules:
- HIGH: Likely to impact sprint goal AND < 3 days remaining
- MEDIUM: Risky but recoverable with action
- LOW: Awareness only, no immediate action required

For each risk, return JSON in this EXACT format:
[
  {
    "issueKey": "AUTH-123",
    "severity": "HIGH | MEDIUM | LOW",
    "reason": "Why this is risky in THIS sprint",
    "suggestedAction": "One concrete next step the team can take"
  }
]

Rules:
- Use ONLY issueKeys from detected risks
- Be concise and actionable
- No markdown
- Return VALID JSON ONLY
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
