import env from "../config/env";

const customFieldsForIssuesParser = (): string[] => {
  const customFields = env.customFields.issue;

  const fields = customFields?.split(",");

  return fields ?? [];
};

export default customFieldsForIssuesParser;
