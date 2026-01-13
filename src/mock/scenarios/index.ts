import { chaosSprint } from "./chaos-sprint";
import { healthySprint } from "./healthy-sprint";
import { stalledSprint } from "./stalled-sprint";
import { SprintScenarioT } from "./types";

const scenarios: Record<string, SprintScenarioT> = {
  stalled: stalledSprint,
  healthy: healthySprint,
  chaos: chaosSprint,
};

export default scenarios;
