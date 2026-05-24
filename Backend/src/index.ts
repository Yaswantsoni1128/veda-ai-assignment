import "./loadEnv.js";

import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

import { connectDB } from "./config/db.js";
import redis from "./config/redis.js";
import assignmentRoutes from "./routes/assignment.routes.js";
import { registerAssignmentSockets } from "./sockets/assignment.socket.js";
import { setSocketIO } from "./socket.js";
import { startGenerationWorker } from "./workers/generation.worker.js";

const app = express();
const server = http.createServer(app);

const allowedOrigins = process.env.CORS_ORIGIN?.split(",") || [
  "http://localhost:3001",
  "http://localhost:3000",
  "http://127.0.0.1:3001",
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

app.use(express.json({ limit: "16mb" }));
app.use(express.urlencoded({ extended: true, limit: "16mb" }));

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
  pingTimeout: 60_000,
});

setSocketIO(io);
registerAssignmentSockets(io);

io.on("connection", (socket) => {
  console.log(`⚡ User connected: ${socket.id}`);
  socket.on("disconnect", (reason) => {
    console.log(`❌ User disconnected: ${socket.id} (${reason})`);
  });
});

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Veda AI Backend Running 🚀",
    uptime: `${Math.floor(process.uptime())}s`,
  });
});

app.get("/health", async (_req, res) => {
  try {
    const redisPing =
      redis.status === "ready" ? await redis.ping() : "disconnected";
    res.status(200).json({
      success: true,
      services: {
        server: "up",
        redis: redisPing === "PONG" ? "up" : "down",
        mongodb: "up",
      },
    });
  } catch {
    res.status(503).json({ success: false, message: "Service unhealthy" });
  }
});

app.use("/api/assignments", assignmentRoutes);

app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

const PORT = Number(process.env.PORT) || 8000;

const startServer = async () => {
  try {
    await connectDB();
    await redis.ping();
    console.log("✅ Redis Connected");

    startGenerationWorker();

    server.listen(PORT, () => {
      console.log(`\n🚀 Server running on http://localhost:${PORT}`);
      console.log(`📡 Socket.IO ready\n`);
    });
  } catch (error) {
    console.error("❌ Server Startup Error:", error);
    process.exit(1);
  }
};

const gracefulShutdown = async (signal: string) => {
  console.log(`\n🛑 ${signal} received — shutting down...`);
  server.close();
  io.close();
  try {
    await redis.quit();
  } catch {
    redis.disconnect();
  }
  const { default: mongoose } = await import("mongoose");
  await mongoose.disconnect().catch(() => {});
  process.exit(0);
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

startServer();
