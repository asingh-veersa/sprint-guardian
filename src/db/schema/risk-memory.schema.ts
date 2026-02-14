import { model, Schema } from "mongoose";

const RiskMemorySchema = new Schema(
  {
    issueKey: { type: String, required: true, unique: true },
    lastRiskScore: { type: Number, required: true },
    lastSeverity: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      required: true,
    },
    lastAltertedAt: { type: Date, required: true, default: Date.now() },
    active: { type: Boolean, default: true },
    // experimental
    confidence: { type: String, required: false },
    sprintName: { type: String, required: true },
    riskHistory: {
      type: [
        {
          sprintName: { type: String, required: true },
          riskScore: { type: Number, required: true },
          severity: {
            type: String,
            enum: ["LOW", "MEDIUM", "HIGH"],
            required: true,
          },
        },
      ],
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

export const RiskMemory = model("RiskMemory", RiskMemorySchema);
