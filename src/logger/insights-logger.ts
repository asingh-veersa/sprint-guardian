import path from "path";
import { llmAnalyzedRiskT } from "../agent/types";
import { existsSync, mkdirSync, writeFileSync } from "fs";

const isCI = process.env.CI === "true"; // GitHub Actions sets CI=true

const logInsights = (risks: llmAnalyzedRiskT[]): void => {
  // Choose directory based on environment
  const baseDir = isCI
    ? "/tmp/sprint-guardian/logs" // Always writable on GitHub Actions
    : "log"; // Local development logs

  // Ensure logs directory exists
  const dirPath = isCI ? baseDir : `${baseDir}/insights`;

  // Ensure folder exists
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }

  // Generate filename with current timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const logFileName = `insights-log-${timestamp}.json`;
  const logFilePath = path.join(dirPath, logFileName);

  const logData = {
    risks,
    loggedAt: new Date().toISOString(),
  };

  // Write data to file
  writeFileSync(logFilePath, JSON.stringify(logData, null, 2), {
    encoding: "utf-8",
  });
};

export default logInsights;
