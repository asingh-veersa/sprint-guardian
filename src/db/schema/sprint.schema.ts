/**
 * This schema is to track total analytics of sprints (being used for metabase only)
 */

import { Schema, model } from "mongoose";

export enum SprintState {
  ACTIVE = "active",
  CLOSED = "closed",
  FUTURE = "future",
}

const SprintSchema = new Schema(
  {
    sprintId: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    boardId: { type: Number, required: true },
    state: {
      type: String,
      enum: SprintState,
      required: true,
    },
    startDate: { type: Date, required: false },
    endDate: { type: Date, required: false },
    // completeDate: { type: Date, required: false },
    goal: { type: String, required: false },
    // totalIssues: { type: Number, required: false },
    // completedIssues: { type: Number, required: false },
    // notCompletedIssues: { type: Number, required: false },
    // totalStoryPoints: { type: Number, required: false },
    // completedStoryPoints: { type: Number, required: false },
    // notCompletedStoryPoints: { type: Number, required: false },
    // createdAt: { type: Date, default: Date.now },
    // updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export const Sprint = model("Sprint", SprintSchema);
