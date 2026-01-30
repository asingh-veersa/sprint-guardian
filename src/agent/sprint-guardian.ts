import env from "../config/env";
import { getRecentCommits } from "../integrations/gitlab";
import { getActiveSprint, getActiveSprintIssues } from "../integrations/jira";
import analyzeSprintRisks from "./risk-analyzer";
import { sendSlackMessage } from "../integrations/slack";
import { performGenAiAnalysis } from "./gen-ai";
import { formatSlackMessage } from "../utils/integrations.util";
import {
  createStep,
  logSection,
  logSuccess,
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
import chalk from "chalk";

export const runSprintGuardian = async () => {
  const activeDebugMode = env.config.debugMode;

  const scenarioName = env.config.scenario;
  const scenario = scenarioName ? scenarios[scenarioName] : null;

  if (scenario) {
    await runSpinner(
      "Activating environment...",
      `Mock environment activated - '${scenario.name}'`
    );
  }

  const boardId = Number(env.jira.boardId);

  if (!boardId) {
    logWarning("Jira board ID not configured");
    process.exit();
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
    process.exit();
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
  if (memoryAwareRisks.length === 0) {
    analyzeStep.succeed("No new or escalated risks detected 🎉");
    logSuccess("Sprint Guardian cycle completed");
    process.exit();
  }

  /**
   * LLM thinking layer
   */
  const reasonStep = createStep("Consulting Sprint Guardian AI...");
  reasonStep.start();
  const insights = await performGenAiAnalysis(memoryAwareRisks, sprintContext);
  if (!insights || insights.length === 0) {
    reasonStep.warn("LLM returned no actionable insights");
    reasonStep.succeed();
    logSuccess("Sprint Guardian cycle completed");
    process.exit();
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
    logSuccess("Sprint Guardian cycle completed");
    process.exit();
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

  logSuccess("Sprint Guardian cycle completed");

  console.log(
    chalk.bold.green(`\n
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✔ Sprint Analysis Complete
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Issues Analyzed : ${issues.length}
Risks       : ${risks.length}
Decision made  : ${confirmedInsights.length}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`)
  );
  process.exit();
};
