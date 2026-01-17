import { SprintIssueT } from "../../integrations/types";
import {
  getIssueStatus,
  getStaleDays,
  RiskScore,
  TicketState,
} from "../../utils/agent.utils";
import { CommitInfoT } from "../risk-analyzer";

const anaylzeStaleSignal = (
  issue: SprintIssueT,
  commitInfo?: CommitInfoT
): number => {
  const status = getIssueStatus(issue);
  const daysSinceLastCommit = commitInfo
    ? getStaleDays(commitInfo.lastCommitAt.toString())
    : Infinity;

  if (status === TicketState.IN_PROGRESS && daysSinceLastCommit > 2) {
    return RiskScore.LOW;
  }

  return 0;
};

export default anaylzeStaleSignal;
