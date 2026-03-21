import axios from "axios";
import env from "../config/env";
import { SprintDetailT, SprintIssueT } from "./types";
import customFieldsForIssuesParser from "../helper/custom-fields-for-issue-parser";
import {
  buildJiraFieldMap,
  transformObjectKey,
} from "../utils/integrations.util";
import scenarios from "../mock/scenarios";
import { Sprint, SprintState } from "../db/schema/sprint.schema";
import { dbUpdateSprintDetails } from "../utils/db.utils";
import { Version3Client } from "jira.js";
import { Issue } from "jira.js/version3/models/issue";
import { FieldDetails } from "jira.js/version3/models/fieldDetails";

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

export const jiraClient = new Version3Client({
  host: env.jira.baseUrl!,
  authentication: {
    basic: {
      email: env.jira.email!,
      apiToken: env.jira.token!,
    },
  },
});

/**
 * Get active sprint for a board
 */
export async function getActiveSprint(boardId: number): Promise<SprintDetailT> {
  const res = await jira.get(
    `/rest/agile/1.0/board/${boardId}/sprint?state=active`,
  );

  const currSprint = res.data.values?.[0];

  if (currSprint) {
    const sprintData = new Sprint({
      boardId: currSprint.originBoardId,
      sprintId: currSprint.id,
      name: currSprint.name,
      state: SprintState.ACTIVE,
      goal: currSprint.goal,
      startData: currSprint?.startDate,
      endData: currSprint?.endDate,
    });

    dbUpdateSprintDetails(sprintData);
  }

  return currSprint || null;
}

/**
 * Get issues from a sprint
 */
/**
 * @deprecated This function is deprecated and may be removed in future releases. Use getSprintIssuesBySprint instead
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
      fields: paramFields,
    },
  });

  // console.log('issue: ', res.data.issues)

  // NOTE: use GET /rest/agile/1.0/issue/{issueIdOrKey} get issue specific data for in depth logic implementation

  const fieldMap: Map<string, string> = buildJiraFieldMap(
    await getJiraFields(),
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

async function getSprintIssuesBySprint(sprintId: number): Promise<Issue[]> {
  const res =
    await jiraClient.issueSearch.searchForIssuesUsingJqlEnhancedSearch({
      jql: `sprint=${sprintId}`,
      fields: ["*all"],
      expand: "names,schema",
      maxResults: 100,
    });

  const jiraFields = await getJiraIssueFields();
  const fieldMap: Map<string, string> = buildJiraFieldMap(jiraFields);

  // Remap custom field ids to their descriptive snake_case names for each issue
  const mappedIssues = res.issues?.map((issue: any) => {
    const mappedFields = { ...issue.fields };

    for (const [key, value] of Object.entries(issue.fields)) {
      // Check if this field is a custom field that needs renaming
      if (fieldMap.has(key)) {
        mappedFields[transformObjectKey(fieldMap.get(key)!)] = value;
      }
    }

    return {
      ...issue,
      fields: mappedFields,
    };
  });

  return mappedIssues ?? [];
}

/**
 * Public API used by the agent
 */
export async function getActiveSprintIssues(boardId: number): Promise<Issue[]> {
  const sprint = await getActiveSprint(boardId);

  if (!sprint) {
    console.warn("⚠️ No active sprint found");
    return [];
  }

  const issues = await getSprintIssuesBySprint(sprint.id);
  console.log("issues: ", issues);
  return issues;
}

/**
 * Get a particular issue details
 */
/**
 * @deprecated Use getIssueDetailsById instead.
 */
export async function getIssueDetails(issueIdOrKey: string) {
  const scenarioName = env.config.scenario;
  const scenario = scenarioName ? scenarios[scenarioName] : null;

  if (scenario) {
    // NOTE: always filter issue by key and not id in case of running scenario for sake of simplicity.
    return scenario.issueDetails?.find((issue) => issue.key === issueIdOrKey);
  }

  // REAL TIME DATA
  const res = await jira.get(`/rest/agile/1.0/issue/${issueIdOrKey}`, {
    params: {
      // fields:
      //   sprintObjectResponseFields.join(",") + "," + customFields.join(","),
    },
  });

  const fieldMap: Map<string, string> = buildJiraFieldMap(
    await getJiraFields(),
  );

  // mapping custom field ids with their names
  const mappedFields = res.data.fields;
  for (const [key, value] of Object.entries(mappedFields)) {
    const numericKey = key;
    if (
      // customFields.includes(numericKey) &&
      fieldMap.has(numericKey)
    ) {
      mappedFields[transformObjectKey(fieldMap.get(numericKey)!)] = value;
    } else {
      mappedFields[key] = value;
    }
  }

  res.data = {
    ...res.data,
    fields: mappedFields,
  };

  return res.data;
}

export const getIssueDetailsById = async (
  issueIdOrKey: string,
): Promise<Issue> => {
  const issue = await jiraClient.issues.getIssue({
    issueIdOrKey,
    fields: ["*all"],
    expand: "changelog, renderedFields, names, schema",
  });

  return issue;
};

/**
 * Getting metadata of fields used by Jira
 * @deprecated Use getJiraIssueFields instead.
 */
export async function getJiraFields() {
  const res: any = await jira.get("/rest/api/3/field");
  return res.data;
}

export const getJiraIssueFields = async (): Promise<FieldDetails[]> => {
  return jiraClient.issueFields.getFields();
};
