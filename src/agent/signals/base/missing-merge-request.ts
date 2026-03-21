import { Issue } from "jira.js/version3/models/issue";
import {
  getIssueStatus,
  RiskScore,
  TicketState,
} from "../../../utils/agent.utils";

/**
 * Analyzes a Jira issue to determine if it is missing a merge (pull) request during code review.
 *
 * @param issue - The Jira issue to analyze.
 * @returns A tuple where the first value is `true` if the issue is in code review and missing a pull request, otherwise `false`.
 *          The second value is the corresponding risk score (`RiskScore.LOW` if missing, otherwise `0`).
 */
const anaylzeMissingMRSignal = (issue: Issue): [boolean, number] => {
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
