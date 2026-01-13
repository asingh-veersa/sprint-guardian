import { SprintIssueT, CommitT, SprintDetailT } from "../../integrations/types";

export type SprintScenarioT = {
  name: string;
  sprintContext: SprintDetailT;
  issues: SprintIssueT[];
  commits: CommitT[];
};
