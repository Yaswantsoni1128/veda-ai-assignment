export type Difficulty = "easy" | "medium" | "hard";

export interface PaperQuestion {
  number: number;
  text: string;
  difficulty: Difficulty;
  marks: number;
}

export interface PaperSection {
  title: string;
  subtitle?: string;
  instruction: string;
  questions: PaperQuestion[];
}

export interface AnswerKeyItem {
  number: number;
  answer: string;
}

export interface GeneratedPaper {
  schoolName: string;
  subject: string;
  className: string;
  timeAllowed: string;
  maxMarks: number;
  generalInstruction: string;
  sections: PaperSection[];
  answerKey: AnswerKeyItem[];
}

export interface QuestionTypeRow {
  type: string;
  count: number;
  marksPerQuestion: number;
}
