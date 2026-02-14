import path from "path";
import { llmAnalyzedRiskT } from "../agent/types";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { isProductionActive } from "../config/env";

const logInsights = (risks: llmAnalyzedRiskT[]): void => {
  // Ensure logs directory exists
  const dirPath = isProductionActive
    ? "log/production/insights"
    : "log/insights";
  const logsDir = path.resolve(process.cwd(), dirPath);
  if (!existsSync(logsDir)) {
    mkdirSync(logsDir, { recursive: true });
  }

  // Generate filename with current timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const logFileName = `insights-log-${timestamp}.json`;
  const logFilePath = path.join(logsDir, logFileName);

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
