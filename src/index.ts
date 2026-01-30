import chalk from "chalk";
import figlet from "figlet";
import { mind } from "gradient-string";
import { runSprintGuardian } from "./agent/sprint-guardian";
import env from "./config/env";
import { getIssueDetails, getJiraFields } from "./integrations/jira";
import { pause } from "./utils/terminal-ui.utils";
import ora from "ora";

console.log(mind(figlet.textSync("PROJECT SENTINEL", { font: "Big" })));
console.log(chalk.dim("AI-powered Sprint Risk Analysis\n"));

const spinner = ora("Initializing engine...").start();
await pause(2000 as any);
spinner.succeed("System ready!");
await pause(1000);

await runSprintGuardian();

// getJiraFields()
// getIssueDetails('FUEL-278')
