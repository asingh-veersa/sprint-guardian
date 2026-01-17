import { runSprintGuardian } from "./agent/sprint-guardian";
import env from "./config/env";
import { getIssueDetails, getJiraFields } from "./integrations/jira";

runSprintGuardian();
// getJiraFields()
// getIssueDetails('FUEL-278')
