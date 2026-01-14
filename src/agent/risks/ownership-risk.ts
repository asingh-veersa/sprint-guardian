import { SprintIssueT } from "../../integrations/types";
import { RiskScore } from "../../utils/agent.utils";

const anaylzeOwnershipSignal = (issue: SprintIssueT) => {
    if(!issue.fields.assignee){
        return RiskScore.MEDIUM;
    }

    return 0;
}

export default anaylzeOwnershipSignal