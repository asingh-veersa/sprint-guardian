import env from "../config/env";
import { getRecentCommits } from "../integrations/gitlab";
import { getActiveSprint, getActiveSprintIssues } from "../integrations/jira";
import analyzeSprintRisks from "./risk-analyzer";
import { sendSlackMessage } from "../integrations/slack";
import { performLlmReasoning } from "./llm-reasoner";
import { formatSlackMessage } from "../utils/integrations.util";
import {
  createStep,
  logSection,
  logSuccess,
  logWarning,
} from "../utils/terminal-ui.utils";
import scenarios from "../mock/scenarios";
import { connectMongo } from "../db/mongo";
import { cleanupResolvedIssues } from "./memory/memory-cleanup";
import { applyAgentMemory } from "./memory/agent-memory";

export const runSprintGuardian = async () => {
  const scenarioName = env.config.scenario;
  const scenario = scenarioName ? scenarios[scenarioName] : null;

  logSection("Sprint Guardian Activated 🛡️");

  if (scenario) {
    console.info(`Mock environment activated - '${scenario.name}'`);
  }

  const boardId = Number(env.jira.boardId);

  if (!boardId) {
    logWarning("Jira board ID not configured");
    return;
  }

  /**
   * Database connection for memorization
   */
  const databaseStep = createStep("Connecting to Database...");
  databaseStep.start();
  await connectMongo();
  databaseStep.succeed("🧠 Database connected successfully");

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
    return;
  }

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

  const risks = await analyzeSprintRisks(issues, commits, sprintContext);

  // console.log("risks: ", risks);

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
    return;
  }

  /**
   * LLM thinking layer
   */
  const reasonStep = createStep("Consulting Sprint Guardian AI...");
  reasonStep.start();

  const insights = await performLlmReasoning(memoryAwareRisks, sprintContext);
  if (!insights || insights.length === 0) {
    reasonStep.warn("LLM returned no actionable insights");
    return;
  }
  reasonStep.succeed("AI reasoning completed");

  /**
   * ACT
   */
  const actStep = createStep("Notifying team via Slack...");
  actStep.start();
  await sendSlackMessage(formatSlackMessage(insights));
  actStep.succeed("Slack notification sent 🚀");

  logSuccess("Sprint Guardian cycle completed");
};
