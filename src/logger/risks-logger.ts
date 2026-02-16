import path from "path";
import { MemoryAwareRiskT } from "../agent/memory/agent-memory";
import { RiskT } from "../agent/types";
import { existsSync, mkdirSync, writeFileSync } from "fs";

const isCI = process.env.CI === "true"; // GitHub Actions sets CI=true

const logRisks = (
  risks: RiskT[],
  memoryAwareRisks: MemoryAwareRiskT[]
): void => {
  try {
    // Choose directory based on environment
    const baseDir = isCI
      ? "/tmp/sprint-guardian/logs" // Always writable on GitHub Actions
      : "log"; // Local development logs

    // Ensure logs directory exists
    const dirPath = isCI ? baseDir : `${baseDir}/risks`;

    // Ensure folder exists
    if (!existsSync(dirPath)) {
      mkdirSync(dirPath, { recursive: true });
    }

    // Generate filename with current timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const logFileName = `risks-log-${timestamp}.json`;
    const logFilePath = path.join(dirPath, logFileName);

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
  } catch (error) {
    console.error("⚠️ Failed to write risk logs:", error.message);
  }
};

export default logRisks;
