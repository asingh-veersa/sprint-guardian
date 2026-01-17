import {
  SprintIssueT,
  CommitT,
  SprintDetailT,
  SprintIssueDetailsT,
} from "../../integrations/types";

export type SprintScenarioT = {
  name: string;
  sprintContext: SprintDetailT;
  issues: SprintIssueT[];
  commits: CommitT[];
  issueDetails?: SprintIssueDetailsT[];
};
