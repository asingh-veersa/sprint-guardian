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
  },
  {
    timestamps: true,
  }
);

export const RiskMemory = model("RiskMemory", RiskMemorySchema);
