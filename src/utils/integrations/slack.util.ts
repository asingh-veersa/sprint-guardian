import { llmAnalyzedRiskT } from "../../agent/types";

export function formatSlackMessage(insights: llmAnalyzedRiskT[]): string {
  let text = `🚨 *Sprint Guardian Alert*\n`;
  text += `_Autonomous sprint risk analysis_\n\n`;

  for (const insight of insights) {
    const severityEmoji =
      insight.severity === "HIGH"
        ? "🔴"
        : insight.severity === "MEDIUM"
        ? "🟠"
        : "🟡";

    text += `${severityEmoji} *${insight.issueKey}* — *${insight.severity}*\n`;
    text += `• *Why*: ${insight.reason}\n`;
    text += `• *Action*: ${insight.suggestedAction}\n\n`;
  }

  return text;
}
