import {
  CommitSchemaWithProjectId,
  SprintDetailT,
} from "../../integrations/types";
import { Issue } from "jira.js/version3/models/issue";

export type SprintScenarioT = {
  name: string;
  sprintContext: SprintDetailT;
  issues: Issue[];
  commits: {
    master: CommitSchemaWithProjectId[];
    mr: CommitSchemaWithProjectId[];
    projectId: number;
  }[];
  issueDetails?: Issue[];
};
