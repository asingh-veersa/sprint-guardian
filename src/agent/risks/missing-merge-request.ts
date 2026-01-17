import { SprintIssueT } from "../../integrations/types";
import {
  getIssueStatus,
  RiskScore,
  TicketState,
} from "../../utils/agent.utils";

const anaylzeMissingMRSignal = (issue: SprintIssueT): [boolean, number] => {
  const state = getIssueStatus(issue);
  if (state === TicketState.CODE_REVIEW) {
    const development = issue.fields.development ?? "";

    if (!development.includes("pullrequest=")) {
      return [true, RiskScore.LOW];
    }
  }

  return [false, 0];
};

export default anaylzeMissingMRSignal;
