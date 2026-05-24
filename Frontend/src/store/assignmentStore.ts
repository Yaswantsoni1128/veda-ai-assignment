import { create } from "zustand";
import type { QuestionTypeRow } from "@/lib/api";

const QUESTION_TYPE_OPTIONS = [
  "Multiple Choice Questions",
  "Short Questions",
  "Diagram/Graph-Based Questions",
  "Numerical Problems",
  "Long Answer Questions",
];

export interface CreateFormState {
  title: string;
  dueDate: string;
  questionTypeRows: QuestionTypeRow[];
  additionalInstructions: string;
  extractedText: string;
  uploadedFileName: string;
  step: number;
}

interface AssignmentStore {
  form: CreateFormState;
  setTitle: (title: string) => void;
  setDueDate: (dueDate: string) => void;
  setAdditionalInstructions: (text: string) => void;
  setUploadedFile: (fileName: string, extractedText: string) => void;
  addQuestionTypeRow: () => void;
  removeQuestionTypeRow: (index: number) => void;
  updateQuestionTypeRow: (
    index: number,
    field: keyof QuestionTypeRow,
    value: string | number
  ) => void;
  setStep: (step: number) => void;
  resetForm: () => void;
  getTotals: () => { totalQuestions: number; totalMarks: number };
  validateForm: () => string | null;
}

const defaultRow = (): QuestionTypeRow => ({
  type: QUESTION_TYPE_OPTIONS[0],
  count: 5,
  marksPerQuestion: 2,
});

const initialForm: CreateFormState = {
  title: "",
  dueDate: "",
  questionTypeRows: [defaultRow()],
  additionalInstructions: "",
  extractedText: "",
  uploadedFileName: "",
  step: 1,
};

export const useAssignmentStore = create<AssignmentStore>((set, get) => ({
  form: { ...initialForm },

  setTitle: (title) =>
    set((s) => ({ form: { ...s.form, title } })),

  setDueDate: (dueDate) =>
    set((s) => ({ form: { ...s.form, dueDate } })),

  setAdditionalInstructions: (additionalInstructions) =>
    set((s) => ({ form: { ...s.form, additionalInstructions } })),

  setUploadedFile: (uploadedFileName, extractedText) =>
    set((s) => ({ form: { ...s.form, uploadedFileName, extractedText } })),

  addQuestionTypeRow: () =>
    set((s) => ({
      form: {
        ...s.form,
        questionTypeRows: [...s.form.questionTypeRows, defaultRow()],
      },
    })),

  removeQuestionTypeRow: (index) =>
    set((s) => ({
      form: {
        ...s.form,
        questionTypeRows: s.form.questionTypeRows.filter((_, i) => i !== index),
      },
    })),

  updateQuestionTypeRow: (index, field, value) =>
    set((s) => {
      const rows = [...s.form.questionTypeRows];
      rows[index] = { ...rows[index], [field]: value };
      return { form: { ...s.form, questionTypeRows: rows } };
    }),

  setStep: (step) => set((s) => ({ form: { ...s.form, step } })),

  resetForm: () => set({ form: { ...initialForm, questionTypeRows: [defaultRow()] } }),

  getTotals: () => {
    const rows = get().form.questionTypeRows;
    return {
      totalQuestions: rows.reduce((s, r) => s + (Number(r.count) || 0), 0),
      totalMarks: rows.reduce(
        (s, r) => s + (Number(r.count) || 0) * (Number(r.marksPerQuestion) || 0),
        0
      ),
    };
  },

  validateForm: () => {
    const { form } = get();
    if (!form.title.trim()) return "Assignment title is required";
    if (!form.dueDate) return "Due date is required";
    if (!form.questionTypeRows.length) return "Add at least one question type";
    for (const row of form.questionTypeRows) {
      if (!row.type.trim()) return "Question type cannot be empty";
      if (!row.count || row.count <= 0)
        return "Number of questions must be greater than 0";
      if (!row.marksPerQuestion || row.marksPerQuestion <= 0)
        return "Marks must be greater than 0";
    }
    return null;
  },
}));

export { QUESTION_TYPE_OPTIONS };
