import { Queue } from "bullmq";
import { Redis } from "ioredis";

const connection = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
  maxRetriesPerRequest: null,
});

export const GENERATION_QUEUE_NAME = "paper-generation";

export interface GenerationJobData {
  assignmentId: string;
  regenerate?: boolean;
}

export const generationQueue = new Queue<GenerationJobData>(
  GENERATION_QUEUE_NAME,
  { connection }
);

export async function enqueueGeneration(
  assignmentId: string,
  regenerate = false
) {
  const job = await generationQueue.add(
    "generate-paper",
    { assignmentId, regenerate },
    {
      attempts: 2,
      backoff: { type: "exponential", delay: 3000 },
      removeOnComplete: 100,
      removeOnFail: 50,
    }
  );
  return job.id;
}
