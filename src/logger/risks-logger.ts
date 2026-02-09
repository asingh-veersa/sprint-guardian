import path from "path";
import { MemoryAwareRiskT } from "../agent/memory/agent-memory";
import { RiskT } from "../agent/types";
import { existsSync, mkdirSync, writeFileSync } from "fs";

const logRisks = (risks: RiskT[], memoryAwareRisks: MemoryAwareRiskT[]): void => {
  // Ensure logs directory exists
  const logsDir = path.resolve(process.cwd(), "log");
  if (!existsSync(logsDir)) {
    mkdirSync(logsDir, { recursive: true });
  }

  // Generate filename with current timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const logFileName = `risks-log-${timestamp}.json`;
  const logFilePath = path.join(logsDir, logFileName);

  // Prepare log data
  const logData = {
    risks,
    memoryAwareRisks,
    loggedAt: new Date().toISOString(),
  };

  // Write data to file
  writeFileSync(logFilePath, JSON.stringify(logData, null, 2), {
    encoding: "utf-8",
  });
};

export default logRisks;
