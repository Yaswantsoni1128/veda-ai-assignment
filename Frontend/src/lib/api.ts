const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002";

export interface QuestionTypeRow {
  type: string;
  count: number;
  marksPerQuestion: number;
}

export interface Assignment {
  _id: string;
  title: string;
  dueDate: string;
  questionTypeRows: QuestionTypeRow[];
  totalQuestions: number;
  totalMarks: number;
  additionalInstructions?: string;
  uploadedFileName?: string;
  status: "pending" | "processing" | "completed" | "failed";
  generatedPaper?: GeneratedPaper;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaperQuestion {
  number: number;
  text: string;
  difficulty: "easy" | "medium" | "hard";
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

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
}

export const api = {
  listAssignments: () =>
    request<{ success: boolean; data: Assignment[] }>("/api/assignments"),

  getAssignment: (id: string) =>
    request<{ success: boolean; data: Assignment }>(`/api/assignments/${id}`),

  createAssignment: (body: Record<string, unknown>) =>
    request<{ success: boolean; data: Assignment }>("/api/assignments", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  deleteAssignment: (id: string) =>
    request<{ success: boolean }>(`/api/assignments/${id}`, {
      method: "DELETE",
    }),

  regenerate: (id: string) =>
    request<{ success: boolean }>(`/api/assignments/${id}/regenerate`, {
      method: "POST",
    }),

  uploadFile: async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${API_URL}/api/assignments/upload`, {
      method: "POST",
      body: form,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Upload failed");
    return data as {
      success: boolean;
      data: { fileName: string; extractedText: string };
    };
  },

  pdfUrl: (id: string) => `${API_URL}/api/assignments/${id}/pdf`,
};
