import path from "path";
import { MemoryAwareRiskT } from "../agent/memory/agent-memory";
import { RiskT } from "../agent/types";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { isProductionActive } from "../config/env";

const logRisks = (
  risks: RiskT[],
  memoryAwareRisks: MemoryAwareRiskT[]
): void => {
  // Ensure logs directory exists
  const dirPath = isProductionActive ? "log/production/risks" : "log/risks"
  const logsDir = path.resolve(process.cwd(), dirPath);
  if (!existsSync(logsDir)) {
    mkdirSync(logsDir, { recursive: true });
  }

  // Generate filename with current timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const logFileName = `risks-log-${timestamp}.json`;
  const logFilePath = path.join(logsDir, logFileName);

  // Prepare log data
  risks = risks.map((r) => ({
    ...r,
    issue: undefined,
  }));
  
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
