import chalk from "chalk";
import ora from "ora";

export const createStep = (text: string) =>
  ora({
    text,
    spinner: "dots",
  });

export const logSection = (title: string) => {
  console.log(
    "\n" +
      chalk.bold.cyan("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━") +
      "\n" +
      chalk.bold.cyan(`🔍 ${title}`) +
      "\n" +
      chalk.bold.cyan("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
  );
};

export const logSuccess = (msg: string) =>
  console.log(chalk.green(`✅ ${msg}`));

export const logWarning = (msg: string) =>
  console.log(chalk.yellow(`⚠️ ${msg}`));

export const logError = (msg: string) => console.log(chalk.red(`❌ ${msg}`));
