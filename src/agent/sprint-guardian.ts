import env from "../config/env";
import { getRecentCommits } from "../integrations/gitlab";
import { getActiveSprint, getActiveSprintIssues } from "../integrations/jira";
import analyzeSprintRisks from "./risk-analyzer";
import { sendSlackMessage } from "../integrations/slack";
import { performGenAiAnalysis } from "./gen-ai";
import { formatSlackMessage } from "../utils/integrations.util";
import {
  createStep,
  logWarning,
  pause,
  PauseDuration,
  runSpinner,
} from "../utils/terminal-ui.utils";
import scenarios from "../mock/scenarios";
import { connectMongo } from "../db/mongo";
import { cleanupResolvedIssues } from "./memory/memory-cleanup";
import { applyAgentMemory, updateAgentMemory } from "./memory/agent-memory";
import decisionEngine from "./decision-engine";
import { SprintIssueT } from "../integrations/types";
import { llmAnalyzedRiskT, RiskT } from "./types";
import logRisks from "../logger/risks-logger";
import logInsights from "../logger/insights-logger";

export const runSprintGuardian = async (): Promise<
  [
    issues: SprintIssueT[],
    risks: RiskT[],
    positives: llmAnalyzedRiskT[],
    confirmedInsights: llmAnalyzedRiskT[]
  ]
> => {
  const scenarioName = env.config.scenario;
  const scenario = scenarioName ? scenarios[scenarioName] : null;
  const isProdMode: boolean = env.config.env === "production";

  if (scenario) {
    await runSpinner(
      "Activating environment...",
      `Mock environment activated - '${scenario.name}'`
    );
  }

  const boardId = Number(env.jira.boardId);

  if (!boardId) {
    logWarning("Jira board ID not configured");
    throw Error("Jira board ID not configured");
  }

  /**
   * Database connection for memorization
   */
  await runSpinner(
    "Connecting to Database...",
    "🧠 Database connected successfully",
    async () => {
      await connectMongo();
    }
  );

  /**
   * Observe
   */
  const observeStep = createStep("Observing sprint signals...");
  observeStep.start();

  const sprintContext = scenario
    ? scenario.sprintContext
    : await getActiveSprint(boardId);
  if (!sprintContext) {
    logWarning("No active sprint found");
    return [[], [], [], []];
  }

  await pause(PauseDuration.LONG);
  const [issues, commits] = scenario
    ? [scenario.issues, scenario.commits]
    : await Promise.all([getActiveSprintIssues(boardId), getRecentCommits()]);

  observeStep.succeed(
    `Observed ${issues.length} issues and ${commits.length} commits`
  );

  /**
   * Analyze
   */
  const analyzeStep = createStep("Analyzing sprint risks...");
  analyzeStep.start();
  await pause(PauseDuration.LONG);

  const risks = await analyzeSprintRisks(issues, commits, sprintContext);
  analyzeStep.warn(`Detected ${risks.length} potential risks`);

  /**
   * Memory layer
   */
  // cleanup resolved issues
  await cleanupResolvedIssues(issues.map((i) => i.key));
  const memoryAwareRisks = await applyAgentMemory(risks);

  /**
   * Logging (enabled for both prod and dev)
   */
  logRisks(risks, memoryAwareRisks);

  if (memoryAwareRisks.length === 0) {
    analyzeStep.succeed("No new or escalated risks detected 🎉");
    return [issues, risks, [], []];
  }

  /**
   * LLM thinking layer
   */
  const reasonStep = createStep("Consulting Sprint Guardian AI...");
  reasonStep.start();
  const insights = await performGenAiAnalysis(memoryAwareRisks, sprintContext);
  /**
   * Logging (enabled for both prod and dev)
   */
  logInsights(insights);

  if (!insights || insights.length === 0) {
    reasonStep.warn("LLM returned no actionable insights");
    reasonStep.succeed();
    return [issues, risks, [], []];
  }
  reasonStep.succeed("AI reasoning completed");

  await updateAgentMemory(insights);

  /**
   * Decision Engine
   */
  const decisionStep = createStep("Running Decision Engine...");
  decisionStep.start();
  await pause(PauseDuration.LONG);
  const confirmedInsights = decisionEngine(insights);
  if (confirmedInsights.length === 0) {
    decisionStep.warn("Decision Engine returned no actionable insights");
    decisionStep.succeed();
    return [issues, risks, insights, []];
  }
  decisionStep.succeed("Insights verified by Decision Engine");

  /**
   * ACT
   */
  if (confirmedInsights.length > 0) {
    const actStep = createStep("Notifying team via Slack...");
    actStep.start();
    await sendSlackMessage(formatSlackMessage(confirmedInsights));
    actStep.succeed("Slack notification sent 🚀");
  }

  return [issues, risks, insights, confirmedInsights];
};
