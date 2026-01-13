import { mockLLMresponse } from "../mock/llm";
import { performLlmReasoning } from "./llm-reasoner";
import { describe, vi, it, expect } from "vitest";

// NOTE: this will not be triggered when ENABLE_MOCK_LLM=true due to the configuration in llm-reasoner for mock llm.
vi.mock("../llm/gemini-client", () => {
  return {
    callGenAi: vi.fn(async (_prompt: string) => mockLLMresponse),
  };
});

describe("LLM Reasoner", () => {
  it("returns structured insights", async () => {
    const mockSprint: SprintDetailT = {
      id: 1,
      self: "123",
      state: "Active",
      name: "2026.1",
      startDate: "2 jan 2026",
      endDate: "15 jan 2026",
      originBoardId: 1,
      goal: "Mock goal",
    };

    const result = await performLlmReasoning(
      [
        {
          issueKey: "AUTH-123",
          summary: "Login API",
          message: "In Progress but no commits",
          status: "",
          riskScore: 0,
          signals: {
            noCommits: false,
            staleDays: 0,
            sprintEnding: false
          }
        },
      ],
      mockSprint
    );

    expect(result).toEqual(JSON.parse(mockLLMresponse));
  });
});
