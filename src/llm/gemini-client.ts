import { GoogleGenAI } from "@google/genai";
import env from "../config/env";

const ai = new GoogleGenAI({});

export async function callGenAI(prompt: string) {
  const response = await ai.models.generateContent({
    model: env.gemini.model ?? "gemini-2.5-flash",
    contents: prompt,
  });

  return response.text;
}
