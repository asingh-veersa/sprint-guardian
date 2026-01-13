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

export const runSprintGuardian = async () => {
  logSection("Sprint Guardian Activated 🛡️");

  const boardId = Number(env.jira.boardId);

  if (!boardId) {
    logWarning("Jira board ID not configured");
    return;
  }

  /**
   * Observe
   */
  const observeStep = createStep("Observing sprint signals...");
  observeStep.start();

  const sprintContext = await getActiveSprint(boardId);
  if (!sprintContext) {
    logWarning("No active sprint found");
    return;
  }

  const [issues, commits] = await Promise.all([
    getActiveSprintIssues(boardId),
    getRecentCommits(),
  ]);

  observeStep.succeed(
    `Observed ${issues.length} issues and ${commits.length} commits`
  );

  /**
   * Analyze
   */
  const analyzeStep = createStep("Analyzing sprint risks...");
  analyzeStep.start();

  const risks = await analyzeSprintRisks(issues, commits, sprintContext);
  if (risks.length === 0) {
    analyzeStep.succeed("No sprint risks detected 🎉");
    return;
  }

  analyzeStep.warn(`Detected ${risks.length} potential risks`);

  /**
   * LLM thinking layer
   */
  const reasonStep = createStep("Consulting Sprint Guardian AI...");
  reasonStep.start();

  const insights = await performLlmReasoning(risks, sprintContext);
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
