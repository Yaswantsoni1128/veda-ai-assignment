import mongoose, { Schema, Document } from "mongoose";

export interface IJobLog extends Document {
  assignmentId: mongoose.Types.ObjectId;

  jobId: string;

  status: "queued" | "processing" | "completed" | "failed";

  startedAt?: Date;

  completedAt?: Date;

  failedAt?: Date;

  retryCount?: number;

  errorMessage?: string;
}

const JobLogSchema = new Schema<IJobLog>(
  {
    assignmentId: {
      type: Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
    },

    jobId: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["queued", "processing", "completed", "failed"],
      required: true,
    },

    startedAt: Date,

    completedAt: Date,

    failedAt: Date,

    retryCount: {
      type: Number,
      default: 0,
    },

    errorMessage: String,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IJobLog>(
  "JobLog",
  JobLogSchema
);