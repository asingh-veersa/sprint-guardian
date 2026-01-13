import env from "../config/env";
import OpenAI from "openai";

export const openaiLLM = new OpenAI({
  apiKey: env.openAi.token,
});
