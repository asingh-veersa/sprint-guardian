import chalk from "chalk";
import ora from "ora";
import env from "../config/env";

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

export const debuggerRun = (msg: string, payload?: any): void => {
  const debuggerActive = env.config.debugMode;

  if (debuggerActive) {
    console.log(msg, chalk.grey(JSON.stringify(payload, null, 2)));
  }
};

export enum PauseDuration {
  LONG = 1000,
  SHORT = 500,
}

export const pause = (ms = PauseDuration.SHORT) => {
  // skipping loaders in dev mode
  // NOTE: This will stop showing loaders delay for faster response but provide less better UI - comment this out in case of running scenario mode for better UI
  if (env.config.env !== "production") {
    return;
  }
  return new Promise((res: any) => setTimeout(res, ms));
};

export const runSpinner = async (
  startMessage: string,
  endMessage: string,
  callback?: () => Promise<void>
): Promise<void> => {
  // skipping loaders in dev mode
  // NOTE: This will stop showing loaders delay for faster response but provide less better UI - comment this out in case of running scenario mode for better UI
  if (env.config.env !== "production") {
    await callback?.();
    return;
  }

  const spinner = ora(startMessage).start();
  await pause(PauseDuration.LONG);
  await callback?.();
  spinner.succeed(endMessage);
  await pause(PauseDuration.SHORT);
};
