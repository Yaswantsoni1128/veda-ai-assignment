import "../loadEnv.js";
import { Worker, Job } from "bullmq";
import { Redis } from "ioredis";
import mongoose from "mongoose";
import Assignment from "../models/Assignment.model.js";
import JobLog from "../models/JobLog.model.js";
import { GENERATION_QUEUE_NAME, type GenerationJobData } from "../queue/generation.queue.js";
import { generateQuestionPaper } from "../services/ai.service.js";
import { getSocketIO } from "../socket.js";
import redis from "../config/redis.js";

const connection = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
  maxRetriesPerRequest: null,
});

function emitAssignmentUpdate(
  assignmentId: string,
  payload: Record<string, unknown>
) {
  getSocketIO().to(`assignment:${assignmentId}`).emit("assignment:update", payload);
}

async function processGeneration(job: Job<GenerationJobData>) {
  const { assignmentId } = job.data;

  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) {
    throw new Error("Assignment not found");
  }

  await JobLog.findOneAndUpdate(
    { jobId: job.id },
    { status: "processing", startedAt: new Date() },
    { upsert: true }
  );

  assignment.status = "processing";
  await assignment.save();

  emitAssignmentUpdate(assignmentId, {
    assignmentId,
    status: "processing",
    progress: 30,
    message: "Generating question paper with AI...",
  });

  await job.updateProgress(30);

  const cacheKey = `paper:${assignmentId}`;
  if (!job.data.regenerate) {
    const cached = await redis.get(cacheKey);
    if (cached) {
      const paper = JSON.parse(cached);
      assignment.generatedPaper = paper;
      assignment.status = "completed";
      await assignment.save();

      emitAssignmentUpdate(assignmentId, {
        assignmentId,
        status: "completed",
        progress: 100,
        generatedPaper: paper,
      });

      await job.updateProgress(100);
      return { cached: true };
    }
  }

  const { paper, raw } = await generateQuestionPaper({
    title: assignment.title,
    dueDate: assignment.dueDate.toISOString().split("T")[0],
    questionTypes: assignment.questionTypeRows,
    totalQuestions: assignment.totalQuestions,
    totalMarks: assignment.totalMarks,
    additionalInstructions: assignment.additionalInstructions,
    extractedText: assignment.extractedText,
  });

  await job.updateProgress(80);

  assignment.generatedPaper = paper;
  assignment.rawAIResponse = raw;
  assignment.status = "completed";
  assignment.errorMessage = undefined;
  await assignment.save();

  await redis.setex(cacheKey, 3600, JSON.stringify(paper));

  await JobLog.findOneAndUpdate(
    { jobId: job.id },
    { status: "completed", completedAt: new Date() }
  );

  emitAssignmentUpdate(assignmentId, {
    assignmentId,
    status: "completed",
    progress: 100,
    generatedPaper: paper,
  });

  await job.updateProgress(100);
  return { success: true };
}

export function startGenerationWorker() {
  const worker = new Worker<GenerationJobData>(
    GENERATION_QUEUE_NAME,
    async (job) => processGeneration(job),
    { connection, concurrency: 2 }
  );

  worker.on("failed", async (job, err) => {
    if (!job?.data?.assignmentId) return;

    const assignmentId = job.data.assignmentId;
    await Assignment.findByIdAndUpdate(assignmentId, {
      status: "failed",
      errorMessage: err.message,
    });

    await JobLog.findOneAndUpdate(
      { jobId: job.id },
      {
        status: "failed",
        failedAt: new Date(),
        errorMessage: err.message,
      }
    );

    emitAssignmentUpdate(assignmentId, {
      assignmentId,
      status: "failed",
      error: err.message,
    });
  });

  console.log("✅ Generation worker started");
  return worker;
}

// Ensure mongoose is connected when worker runs standalone
if (mongoose.connection.readyState === 0 && process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI).catch(console.error);
}
