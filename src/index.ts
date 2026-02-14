import chalk from "chalk";
import figlet from "figlet";
import { mind } from "gradient-string";
import { runSprintGuardian } from "./agent/sprint-guardian";
import { logSuccess, pause } from "./utils/terminal-ui.utils";
import ora from "ora";
import { sendSlackMessage } from "./integrations/slack";

console.log(mind(figlet.textSync("PROJECT SENTINEL", { font: "Big" })));
console.log(chalk.dim("AI-powered Sprint Risk Analysis\n"));

const spinner = ora("Initializing engine...").start();
await pause(2000 as any);
spinner.succeed("System ready!");
await pause(1000);

const [issues, risks, positives, confirmedInsights, oldRisksStillHold] =
  await runSprintGuardian();

const slackMessage = oldRisksStillHold
  ? `⚠️ No new risks found, but there are still outstanding risks from previous scans.\nPlease review the existing risks and take necessary action. 🛠️`
  : `Sprint Guardian scanned all issues — no risks found today.\nGreat job keeping everything moving smoothly! 🚀`;

// in case 0 risks found
if (confirmedInsights.length === 0) {
  try {
    await sendSlackMessage(slackMessage);
    console.log("Slack message sent!");
  } catch (err: any) {
    console.error("Slack error: ", err.data || err);
  }
}

logSuccess("Sprint Guardian cycle completed");

console.log(
  chalk.bold.green(`\n
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✔ Sprint Analysis Complete
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Issues Analyzed : ${issues.length}
Risks       : ${risks.length}
True positives : ${positives.length}
Decision made  : ${confirmedInsights.length}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`)
);

process.exit();
