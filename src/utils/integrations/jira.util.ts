import { JiraFieldT } from "../../integrations/types";

export function extractJiraKeys(text: string) {
  const regex = /[A-Z]+-\d+/g;
  return text.match(regex) || [];
}

export function buildJiraFieldMap(fields: JiraFieldT[]) {
  const map: Map<string, string> = new Map();

  for (const field of fields) {
    map.set(field.id, field.name);
  }

  return map;
}

export function transformObjectKey(key: string) {
  const parts = key.split(" ");
  return parts.map((item) => item.toLowerCase()).join("_");
}
