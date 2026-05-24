import { generateQuestions } from "../config/openrouter.js";
import {
  buildGenerationPrompt,
  parsePaperJson,
  type PromptInput,
} from "./prompt.service.js";
import type { GeneratedPaper } from "../types/paper.types.js";

function validatePaper(data: unknown): GeneratedPaper {
  const paper = data as GeneratedPaper;
  if (!paper?.sections?.length) {
    throw new Error("Generated paper missing sections");
  }
  if (!paper.answerKey?.length) {
    throw new Error("Generated paper missing answer key");
  }
  return paper;
}

export async function generateQuestionPaper(
  input: PromptInput
): Promise<{ paper: GeneratedPaper; raw: string }> {
  const prompt = buildGenerationPrompt(input);
  const raw = await generateQuestions(prompt);
  const parsed = parsePaperJson(raw);
  const paper = validatePaper(parsed);
  return { paper, raw };
}
