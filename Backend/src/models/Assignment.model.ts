import mongoose, { Schema, Document } from "mongoose";
import type { GeneratedPaper, QuestionTypeRow } from "../types/paper.types.js";

export interface IAssignment extends Document {
  title: string;
  dueDate: Date;
  questionTypeRows: QuestionTypeRow[];
  questionTypes: string[];
  totalQuestions: number;
  totalMarks: number;
  additionalInstructions?: string;
  uploadedFileName?: string;
  extractedText?: string;
  status: "pending" | "processing" | "completed" | "failed";
  generatedPaper?: GeneratedPaper;
  rawAIResponse?: string;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionTypeRowSchema = new Schema({
  type: { type: String, required: true, trim: true },
  count: { type: Number, required: true, min: 1 },
  marksPerQuestion: { type: Number, required: true, min: 1 },
});

const QuestionSchema = new Schema({
  number: { type: Number, required: true },
  text: { type: String, required: true },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    required: true,
  },
  marks: { type: Number, required: true, min: 1 },
});

const SectionSchema = new Schema({
  title: { type: String, required: true },
  subtitle: { type: String },
  instruction: { type: String, required: true },
  questions: { type: [QuestionSchema], required: true },
});

const AnswerKeySchema = new Schema({
  number: { type: Number, required: true },
  answer: { type: String, required: true },
});

const GeneratedPaperSchema = new Schema({
  schoolName: { type: String, required: true },
  subject: { type: String, required: true },
  className: { type: String, required: true },
  timeAllowed: { type: String, required: true },
  maxMarks: { type: Number, required: true },
  generalInstruction: { type: String, required: true },
  sections: { type: [SectionSchema], required: true },
  answerKey: { type: [AnswerKeySchema], required: true },
});

const AssignmentSchema = new Schema<IAssignment>(
  {
    title: { type: String, required: true, trim: true },
    dueDate: { type: Date, required: true },
    questionTypeRows: { type: [QuestionTypeRowSchema], required: true },
    questionTypes: { type: [String], required: true },
    totalQuestions: { type: Number, required: true, min: 1 },
    totalMarks: { type: Number, required: true, min: 1 },
    additionalInstructions: { type: String },
    uploadedFileName: { type: String },
    extractedText: { type: String },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
    generatedPaper: { type: GeneratedPaperSchema },
    rawAIResponse: { type: String },
    errorMessage: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IAssignment>("Assignment", AssignmentSchema);
