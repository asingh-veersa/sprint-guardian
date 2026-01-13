import axios from "axios";
import env from "../config/env";

export async function sendSlackMessage(text: string) {
  await axios.post(
    "https://slack.com/api/chat.postMessage",
    {
      channel: env.slack.channel,
      text,
    },
    {
      headers: {
        Authorization: `Bearer ${env.slack.token}`,
        "Content-Type": "application/json",
      },
    }
  );
}
