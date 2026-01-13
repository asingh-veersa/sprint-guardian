import axios from "axios";
import env from "../config/env";

const HF_API_URL = `https://router.huggingface.co/models/${env.huggingFace.model}`;

export async function callHuggingFace(prompt: string) {
  const response = await axios.post(
    HF_API_URL,
    {
      inputs: prompt,
      parameters: {
        temperature: 0.2,
        max_new_tokens: 400,
        return_full_text: false,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${env.huggingFace.token}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
}
