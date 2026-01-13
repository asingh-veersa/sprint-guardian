import axios from "axios";
import env from "../config/env";
import { SprintDetailT, SprintIssueT } from "./types";
import customFieldsForIssuesParser from "../helper/custom-fields-for-issue-parser";
import {
  buildJiraFieldMap,
  transformObjectKey,
} from "../utils/integrations.util";

const jira = axios.create({
  baseURL: env.jira.baseUrl,
  auth: {
    username: env.jira.email ?? "",
    password: env.jira.token ?? "",
  },
  headers: {
    Accept: "application/json",
  },
});

/**
 * Get active sprint for a board
 */
export async function getActiveSprint(boardId: number): Promise<SprintDetailT> {
  const res = await jira.get(
    `/rest/agile/1.0/board/${boardId}/sprint?state=active`
  );

  // console.log("active sprint: ", res.data.values?.[0]);

  return res.data.values?.[0] || null;
}

/**
 * Get issues from a sprint
 */
async function getSprintIssues(sprintId: number): Promise<SprintIssueT[]> {
  const sprintObjectResponseFields = [
    // basic details
    "project",
    "flagged",
    "summary",
    "description",
    "updated",
    "created",
    "comment",
    "worklog",
    "issuetype",
    // heirarical
    "parent",
    "epic",
    "sprint",
    "subtasks",
    // status and priority
    "aggregateprogress",
    "progress",
    "priority",
    "status",
    "statuscategorychangedate",
    // ownership
    "assignee",
    "reporter",
    "creator",
    // time related
    "timetracking",
    "timeestimate",
    "timeoriginalestimate",
    "timespent",
    "aggregatetimespent",
    // resolution related
    "resolution",
    "resolutiondate",
    // git/pr awareness id
    "customfield_13200",
  ];

  const customFields = customFieldsForIssuesParser();

  const paramFields =
    sprintObjectResponseFields.join(",") + "," + customFields.join(",");
  // console.log("fields: ", paramFields);

  const res = await jira.get(`/rest/agile/1.0/sprint/${sprintId}/issue`, {
    params: {
      fields:
        sprintObjectResponseFields.join(",") + "," + customFields.join(","),
    },
  });

  // console.log('issue: ', res.data.issues)

  // NOTE: use GET /rest/agile/1.0/issue/{issueIdOrKey} get issue specific data for in depth logic implementation

  const fieldMap: Map<string, string> = buildJiraFieldMap(
    await getJiraFields()
  );

  // mapping custom field ids with their names
  const mappedIssues = res.data.issues.map((issue: any) => {
    const mappedFields = issue.fields;

    for (const [key, value] of Object.entries(issue.fields)) {
      const numericKey = key;

      if (customFields.includes(numericKey) && fieldMap.has(numericKey)) {
        mappedFields[transformObjectKey(fieldMap.get(numericKey)!)] = value;
      } else {
        mappedFields[key] = value;
      }
    }

    return {
      ...issue, // ✅ keep everything
      fields: mappedFields, // ✅ replace only fields
    };
  });
  // console.log(mappedIssues);

  // mappedIssues.forEach((i: any) => {
  //   if (i.key === "FUEL-302") {
  //     console.log(i);
  //     // const fields = i.fields;
  //     // for (const key of Object.keys(fields)) {
  //     //   if (key.startsWith("customfield_")) {
  //     //     console.log(fieldMap.get(key), " - ", key, " - ", fields[key]);
  //     //   }
  //     // }
  //   }
  // });

  // console.log(res.data.issues);

  return mappedIssues || [];
}

/**
 * Public API used by the agent
 */
export async function getActiveSprintIssues(
  boardId: number
): Promise<SprintIssueT[]> {
  const sprint = await getActiveSprint(boardId);

  if (!sprint) {
    console.warn("⚠️ No active sprint found");
    return [];
  }

  const issues = await getSprintIssues(sprint.id);
  return issues;
}

/**
 * Getting metadata of fields used by Jira
 */
export async function getJiraFields() {
  const res: any = await jira.get("/rest/api/3/field");
  return res.data;
}
