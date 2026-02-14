import { Sprint, SprintState } from "../db/schema/sprint.schema";

export const dbUpdateSprintDetails = async (newData: any) => {
  const currSprint = await Sprint.findOne({
    state: SprintState.ACTIVE,
  });

  // CASE: no active sprint exists
  if (!currSprint) {
    await Sprint.create(newData);
  }

  // CASE: if active sprint exists but is stale
  if (currSprint && newData.sprintId !== currSprint?.sprintId) {
    // update the stale sprint data
    currSprint.state = SprintState.CLOSED;
    currSprint.save();

    // add new sprint document
    await Sprint.create(newData);
  }
};
