import dotenv from "dotenv";

dotenv.config();

const env = {
  port: process.env.PORT,
  config: {
    scenario: process.env.SPRINT_GUARDIAN_SCENARIO,
  },
  jira: {
    baseUrl: process.env.JIRA_BASE_URL,
    email: process.env.JIRA_EMAIL,
    token: process.env.JIRA_API_TOKEN,
    boardId: process.env.JIRA_BOARD_ID,
  },
  llmConfig: {
    enableMockMode: process.env.ENABLE_MOCK_LLM ?? false,
  },
  openAi: {
    token: process.env.OPENAI_API_KEY,
    model: process.env.LLM_MODEL,
  },
  slack: {
    token: process.env.SLACK_BOT_TOKEN,
    channel: process.env.SLACK_CHANNEL,
  },
  gitlab: {
    token: process.env.GITLAB_TOKEN,
    baseUrl: process.env.GITLAB_BASE_URL,
    projectIds: process.env.GITLAB_PROJECT_IDS,
  },
  huggingFace: {
    token: process.env.HUGGING_FACE_API_TOKEN,
    model: process.env.HUGGING_FACE_MODEL,
  },
  gemini: {
    token: process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL,
  },
  customFields: {
    issue: process.env.CUSTOM_ISSUE_FIELDS,
  },
};

export default env;
