import { Issue } from "jira.js/version3/models/issue";
import { RiskScore } from "../../../utils/agent.utils";

/**
 * Analyzes ownership risk for a Jira issue.
 * 
 * This function returns a MEDIUM risk score if the issue has no assignee,
 * indicating potential risk due to lack of clear ownership.
 *
 * @param {Issue} issue - The Jira issue to analyze.
 * @returns {number} - Risk score (MEDIUM if unassigned, otherwise 0).
 */
const anaylzeOwnershipSignal = (issue: Issue): number => {
    if (!issue.fields.assignee) {
        return RiskScore.MEDIUM;
    }
    return 0;
}

export default anaylzeOwnershipSignal