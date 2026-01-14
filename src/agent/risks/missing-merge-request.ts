import { SprintIssueT } from "../../integrations/types";
import { getIssueStatus, TicketState } from "../../utils/agent.utils";

const anaylzeMissingMRSignal = (issue: SprintIssueT): boolean => {
  const state = getIssueStatus(issue);
  if (state === TicketState.CODE_REVIEW) {
    const development = issue.fields.development ?? "";

    if (!development.includes("pullrequest=")) {
      return true;
    }
  }

  return false;
};

export default anaylzeMissingMRSignal
