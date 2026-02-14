import axios from "axios";
import env, { isProductionActive } from "../config/env";

export async function sendSlackMessage(text: string) {
  await axios.post(
    "https://slack.com/api/chat.postMessage",
    {
      channel: isProductionActive
        ? env.slack.channel.prod
        : env.slack.channel.dev,
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
