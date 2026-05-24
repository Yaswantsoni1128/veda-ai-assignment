import type { QuestionTypeRow } from "../types/paper.types.js";

export interface PromptInput {
  title: string;
  dueDate: string;
  questionTypes: QuestionTypeRow[];
  totalQuestions: number;
  totalMarks: number;
  additionalInstructions?: string;
  extractedText?: string;
}

export function buildGenerationPrompt(input: PromptInput): string {
  const typeBreakdown = input.questionTypes
    .map(
      (q) =>
        `- ${q.type}: ${q.count} question(s), ${q.marksPerQuestion} mark(s) each`
    )
    .join("\n");

  const contextBlock = input.extractedText
    ? `\nReference material from uploaded document:\n"""\n${input.extractedText.slice(0, 8000)}\n"""\n`
    : "";

  return `You are an expert exam paper generator for Indian CBSE schools.

Create a complete question paper as STRICT JSON only (no markdown, no code fences).

Assignment title: ${input.title}
Due date: ${input.dueDate}
Total questions required: ${input.totalQuestions}
Total marks required: ${input.totalMarks}

Question type breakdown:
${typeBreakdown}

${input.additionalInstructions ? `Teacher instructions: ${input.additionalInstructions}` : ""}
${contextBlock}

Return JSON matching this exact schema:
{
  "schoolName": "Delhi Public School, Sector-4, Bokaro",
  "subject": "string",
  "className": "string",
  "timeAllowed": "string e.g. 45 minutes",
  "maxMarks": number (must equal ${input.totalMarks}),
  "generalInstruction": "string",
  "sections": [
    {
      "title": "Section A",
      "subtitle": "string",
      "instruction": "string",
      "questions": [
        {
          "number": 1,
          "text": "question text",
          "difficulty": "easy" | "medium" | "hard",
          "marks": number
        }
      ]
    }
  ],
  "answerKey": [
    { "number": 1, "answer": "detailed answer" }
  ]
}

Rules:
- Use sections A, B, C as needed to match question types.
- difficulty must be exactly "easy", "medium", or "hard".
- Question numbers must be sequential across the whole paper.
- Sum of all question marks must equal ${input.totalMarks}.
- Total question count must equal ${input.totalQuestions}.
- Mix difficulties appropriately (roughly 30% easy, 40% medium, 30% hard).
- Answer key must have one entry per question.
- Output ONLY valid JSON.`;
}

export function parsePaperJson(raw: string): unknown {
  const trimmed = raw.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("AI response did not contain valid JSON");
  }
  return JSON.parse(jsonMatch[0]);
}
