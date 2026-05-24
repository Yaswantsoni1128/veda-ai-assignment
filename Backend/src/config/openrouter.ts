import "../loadEnv.js";
import OpenAI from "openai";

/** Free-only models (tried in order). First match wins. */
const FREE_MODELS = [
  "openrouter/free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "meta-llama/llama-3.2-3b-instruct:free",
  "qwen/qwen-2.5-7b-instruct:free",
  "google/gemma-2-9b-it:free",
  "mistralai/mistral-7b-instruct:free",
];

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is missing from environment variables");
  }
  if (!client) {
    client = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": process.env.APP_URL || "http://localhost:3000",
        "X-Title": "VedaAI Assessment Creator",
      },
    });
  }
  return client;
}

function getModelsToTry(): string[] {
  const preferred = process.env.OPENROUTER_MODEL?.trim();
  if (preferred) {
    return [preferred, ...FREE_MODELS.filter((m) => m !== preferred)];
  }
  return FREE_MODELS;
}

function isModelUnavailableError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const msg = err.message.toLowerCase();
  return (
    msg.includes("404") ||
    msg.includes("no endpoints") ||
    msg.includes("not found") ||
    msg.includes("does not exist")
  );
}

export async function generateQuestions(prompt: string): Promise<string> {
  const models = getModelsToTry();
  let lastError: Error | null = null;

  for (const model of models) {
    try {
      const completion = await getClient().chat.completions.create({
        model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error("Empty response from AI model");
      }

      console.log(`✅ OpenRouter model used: ${model}`);
      return content;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (isModelUnavailableError(err)) {
        console.warn(`⚠️ Model unavailable, trying next: ${model}`);
        continue;
      }
      throw lastError;
    }
  }

  throw new Error(
    `All free OpenRouter models failed. Last error: ${lastError?.message}. ` +
      `Get a key at https://openrouter.ai/keys and set OPENROUTER_API_KEY in .env`
  );
}
