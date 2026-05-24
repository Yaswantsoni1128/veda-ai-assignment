import { Request, Response } from "express";
import Assignment from "../models/Assignment.model.js";
import JobLog from "../models/JobLog.model.js";
import { enqueueGeneration } from "../queue/generation.queue.js";
import { generatePaperPdf } from "../services/pdf.service.js";
import type { QuestionTypeRow } from "../types/paper.types.js";

function validateQuestionTypes(rows: QuestionTypeRow[]): string | null {
  if (!rows?.length) return "At least one question type is required";
  for (const row of rows) {
    if (!row.type?.trim()) return "Question type cannot be empty";
    if (!Number.isFinite(row.count) || row.count <= 0) {
      return "Number of questions must be a positive number";
    }
    if (!Number.isFinite(row.marksPerQuestion) || row.marksPerQuestion <= 0) {
      return "Marks must be a positive number";
    }
  }
  return null;
}

export async function listAssignments(_req: Request, res: Response) {
  const assignments = await Assignment.find()
    .sort({ createdAt: -1 })
    .select("-rawAIResponse -extractedText");
  res.json({ success: true, data: assignments });
}

export async function getAssignment(req: Request, res: Response) {
  const assignment = await Assignment.findById(req.params.id).select(
    "-rawAIResponse"
  );
  if (!assignment) {
    return res.status(404).json({ success: false, message: "Not found" });
  }
  res.json({ success: true, data: assignment });
}

export async function createAssignment(req: Request, res: Response) {
  const {
    title,
    dueDate,
    questionTypeRows,
    additionalInstructions,
    extractedText,
    uploadedFileName,
    autoGenerate = true,
  } = req.body;

  if (!title?.trim()) {
    return res.status(400).json({ success: false, message: "Title is required" });
  }
  if (!dueDate) {
    return res.status(400).json({ success: false, message: "Due date is required" });
  }

  const validationError = validateQuestionTypes(questionTypeRows);
  if (validationError) {
    return res.status(400).json({ success: false, message: validationError });
  }

  const totalQuestions = questionTypeRows.reduce(
    (sum: number, r: QuestionTypeRow) => sum + r.count,
    0
  );
  const totalMarks = questionTypeRows.reduce(
    (sum: number, r: QuestionTypeRow) => sum + r.count * r.marksPerQuestion,
    0
  );

  const assignment = await Assignment.create({
    title: title.trim(),
    dueDate: new Date(dueDate),
    questionTypeRows,
    questionTypes: questionTypeRows.map((r: QuestionTypeRow) => r.type),
    totalQuestions,
    totalMarks,
    additionalInstructions,
    extractedText,
    uploadedFileName,
    status: autoGenerate ? "pending" : "pending",
  });

  if (autoGenerate) {
    const jobId = await enqueueGeneration(assignment._id.toString());
    await JobLog.create({
      assignmentId: assignment._id,
      jobId: String(jobId),
      status: "queued",
    });
  }

  res.status(201).json({ success: true, data: assignment });
}

export async function deleteAssignment(req: Request, res: Response) {
  const deleted = await Assignment.findByIdAndDelete(req.params.id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: "Not found" });
  }
  res.json({ success: true, message: "Assignment deleted" });
}

export async function regenerateAssignment(req: Request, res: Response) {
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) {
    return res.status(404).json({ success: false, message: "Not found" });
  }

  assignment.status = "pending";
  assignment.errorMessage = undefined;
  await assignment.save();

  const jobId = await enqueueGeneration(assignment._id.toString(), true);
  await JobLog.create({
    assignmentId: assignment._id,
    jobId: String(jobId),
    status: "queued",
  });

  res.json({
    success: true,
    data: { assignmentId: assignment._id, jobId },
  });
}

export async function downloadPdf(req: Request, res: Response) {
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment?.generatedPaper) {
    return res
      .status(404)
      .json({ success: false, message: "Paper not generated yet" });
  }

  const buffer = await generatePaperPdf(assignment.generatedPaper);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${assignment.title.replace(/\s+/g, "-")}.pdf"`
  );
  res.send(buffer);
}

export async function uploadFile(req: Request, res: Response) {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }

  const text = req.file.buffer.toString("utf-8");
  res.json({
    success: true,
    data: {
      fileName: req.file.originalname,
      extractedText: text.slice(0, 50000),
    },
  });
}
