# Sprint Guardian 🛡️

[![Sprint Guardian Daily Run](https://github.com/asingh-veersa/sprint-guardian/actions/workflows/sprint-guardian.yml/badge.svg)](https://github.com/asingh-veersa/sprint-guardian/actions/workflows/sprint-guardian.yml)

**AI-powered Sprint Risk Analysis System**

Sprint Guardian (also known as Project Sentinel) is an intelligent monitoring system that analyzes active sprints in Jira, tracks development activity in GitLab, and proactively identifies risks that could impact sprint delivery. It uses AI to provide contextual insights and automatically notifies teams via Slack.

## 🎯 Features

- **Multi-Signal Risk Detection**: Analyzes 8+ different risk signals including:
  - Issues without commits
  - Stale issues (no activity for extended periods)
  - Sprint near-end escalations
  - Ownership risks (unassigned issues)
  - Missing merge requests
  - Late start issues
  - Overdue issues (exceeding story points)
  - Blocked dependencies

- **AI-Powered Analysis**: Uses Large Language Models (OpenAI, Google Gemini, or Hugging Face) to provide contextual risk analysis and actionable insights

- **Decision Engine**: Intelligent filtering system that confirms, monitors, or ignores risks based on severity and urgency

- **Memory System**: MongoDB-backed memory layer that tracks resolved issues and prevents duplicate notifications

- **Multi-Platform Integration**:
  - **Jira**: Fetches active sprint data and issue details
  - **GitLab**: Tracks commit activity and maps commits to issues
  - **Slack**: Sends formatted risk notifications to teams

- **Mock Scenarios**: Built-in test scenarios for development and testing

## 🏗️ Architecture

```
┌─────────────────┐
│   Scheduler     │ (Cron jobs for automated runs)
└────────┬────────┘
         │
┌────────▼────────┐
│ Sprint Guardian │ (Main orchestrator)
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼──────┐
│Observe│ │ Analyze │
└───┬───┘ └──┬──────┘
    │        │
┌───▼────────▼───┐
│  Risk Analyzer │ (8+ risk detection signals)
└───┬────────────┘
    │
┌───▼────────────┐
│ Memory Layer   │ (MongoDB - track resolved issues)
└───┬────────────┘
    │
┌───▼────────────┐
│  LLM Analysis  │ (AI-powered contextual analysis)
└───┬────────────┘
    │
┌───▼────────────┐
│Decision Engine │ (Filter & confirm risks)
└───┬────────────┘
    │
┌───▼────────────┐
│  Slack Notify  │ (Send actionable alerts)
└────────────────┘
```

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB instance (local or cloud)
- API credentials for:
  - Jira (API token)
  - GitLab (Personal access token)
  - Slack (Bot token)
  - LLM provider (OpenAI, Gemini, or Hugging Face)

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sprint-guardian
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory with the following variables:

   ```env
   # Environment
   NODE_ENV=development
   PORT=3000
   DEBUG=false

   # Jira Configuration
   JIRA_BASE_URL=https://your-domain.atlassian.net
   JIRA_EMAIL=your-email@example.com
   JIRA_API_TOKEN=your-jira-api-token
   JIRA_BOARD_ID=your-board-id

   # GitLab Configuration
   GITLAB_BASE_URL=https://gitlab.com
   GITLAB_TOKEN=your-gitlab-token
   GITLAB_PROJECT_IDS=project-id-1,project-id-2

   # Slack Configuration
   SLACK_BOT_TOKEN=xoxb-your-slack-bot-token
   SLACK_CHANNEL=#your-channel

   # LLM Configuration (choose one)
   # OpenAI
   OPENAI_API_KEY=your-openai-key
   LLM_MODEL=gpt-4

   # OR Gemini
   GEMINI_API_KEY=your-gemini-key
   GEMINI_MODEL=gemini-pro

   # OR Hugging Face
   HUGGING_FACE_API_TOKEN=your-hf-token
   HUGGING_FACE_MODEL=your-model-name

   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017
   MONGODB_DATABASE_DEV=sprint-guardian-dev
   MONGODB_DATABASE_PROD=sprint-guardian-prod

   # Optional: Custom Jira Fields
   CUSTOM_ISSUE_FIELDS=field1,field2

   # Development Only
   SPRINT_GUARDIAN_SCENARIO=healthy-sprint  # Mock scenario name
   ENABLE_MOCK_LLM=false  # Use mock LLM responses
   ```

4. **Run the application**
   ```bash
   # Development mode
   npm run dev

   # Development with debug
   npm run dev:debug

   # Production mode
   npm start
   ```

## 📖 Usage

### Manual Execution

Run Sprint Guardian manually to analyze the current sprint:

```bash
npm run dev
```

The system will:
1. Connect to MongoDB
2. Fetch active sprint from Jira
3. Retrieve sprint issues and recent GitLab commits
4. Analyze risks using multiple detection signals
5. Apply memory layer to filter resolved issues
6. Use AI to provide contextual analysis
7. Run decision engine to confirm actionable risks
8. Send Slack notifications for confirmed risks

### Scheduled Execution

Use the scheduler (`src/scheduler/sprintCheck.js`) with cron to run automatically:

```javascript
// Example: Run every day at 9 AM
import cron from 'node-cron';
import { runSprintGuardian } from './src/agent/sprint-guardian';

cron.schedule('0 9 * * *', async () => {
  await runSprintGuardian();
});
```

### Mock Scenarios

For development and testing, use mock scenarios:

```env
SPRINT_GUARDIAN_SCENARIO=healthy-sprint
```

Available scenarios:
- `healthy-sprint`: All issues progressing normally
- `stalled-sprint`: Multiple stalled issues
- `chaos-sprint`: High-risk sprint with many problems
- `borderline-sprint`: Mixed signals requiring AI analysis
- `custom-sprint`: Custom scenario

## 🔍 Risk Detection Signals

The system analyzes the following risk signals:

1. **No Commits**: Issue in progress but no GitLab commits found
2. **Stale Issue**: No activity for extended period
3. **Sprint Near End**: Issue stalled as sprint deadline approaches
4. **Ownership Risk**: Issue not assigned to anyone
5. **Missing MR**: Issue in code review but no merge request link
6. **Late Start**: Issue started late relative to remaining sprint days
7. **Overdue**: Issue taking longer than allocated story points
8. **Blocked Dependencies**: Linked blocker issues not resolved

Each signal contributes to a risk score. Issues exceeding the threshold are flagged for AI analysis.

## 🧠 AI Analysis

The LLM analysis layer provides:
- **Severity Assessment**: HIGH, MEDIUM, LOW, NONE
- **Urgency Classification**: IMMEDIATE, TODAY, LATER, NONE
- **Contextual Reasoning**: Why this is a risk
- **Suggested Actions**: What the team should do
- **Confidence Level**: How certain the AI is about the assessment

## 🎛️ Decision Engine

The decision engine filters AI insights based on:
- Severity and urgency thresholds
- Historical patterns (memory layer)
- Issue state and context

Only confirmed insights are sent to Slack to avoid notification fatigue.

## 📁 Project Structure

```
sprint-guardian/
├── src/
│   ├── agent/              # Core agent logic
│   │   ├── config/         # Configuration constants
│   │   ├── risks/          # Risk detection modules
│   │   ├── memory/         # Memory/state management
│   │   ├── decision-engine.ts
│   │   ├── gen-ai.ts       # LLM integration
│   │   ├── risk-analyzer.ts
│   │   └── sprint-guardian.ts
│   ├── integrations/       # External API integrations
│   │   ├── jira.ts
│   │   ├── gitlab.ts
│   │   └── slack.ts
│   ├── llm/                # LLM client implementations
│   │   ├── open-ai-client.ts
│   │   ├── gemini-client.ts
│   │   └── hugging-face-client.ts
│   ├── db/                 # Database schemas and connection
│   ├── mock/               # Mock data and scenarios
│   ├── scheduler/          # Cron job schedulers
│   ├── routes/             # Express routes
│   └── utils/              # Utility functions
├── package.json
├── tsconfig.json
└── README.md
```

## 🧪 Testing

Run tests with:

```bash
npm test
```

## 🔧 Configuration

### Risk Thresholds

Adjust risk detection sensitivity in `src/agent/config/index.ts`:
- `RISK_THRESHOLD`: Minimum score to flag an issue
- `SPRINT_END_THRESHOLD`: Days before sprint end to escalate

### LLM Selection

The system supports multiple LLM providers. Set the appropriate environment variables for your chosen provider. The system will automatically use the configured provider.

## 📝 Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `JIRA_BASE_URL` | Your Jira instance URL | Yes |
| `JIRA_EMAIL` | Jira account email | Yes |
| `JIRA_API_TOKEN` | Jira API token | Yes |
| `JIRA_BOARD_ID` | Jira board ID to monitor | Yes |
| `GITLAB_BASE_URL` | GitLab instance URL | Yes |
| `GITLAB_TOKEN` | GitLab personal access token | Yes |
| `GITLAB_PROJECT_IDS` | Comma-separated project IDs | Yes |
| `SLACK_BOT_TOKEN` | Slack bot OAuth token | Yes |
| `SLACK_CHANNEL` | Slack channel to post to | Yes |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `OPENAI_API_KEY` | OpenAI API key (if using OpenAI) | Conditional |
| `GEMINI_API_KEY` | Google Gemini API key (if using Gemini) | Conditional |
| `HUGGING_FACE_API_TOKEN` | Hugging Face API token (if using HF) | Conditional |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

ISC

## 🙏 Acknowledgments

Built with:
- TypeScript
- Node.js
- MongoDB
- Jira API
- GitLab API
- Slack API
- OpenAI / Google Gemini / Hugging Face

---

**Sprint Guardian** - Keeping your sprints on track, one risk at a time 🚀
