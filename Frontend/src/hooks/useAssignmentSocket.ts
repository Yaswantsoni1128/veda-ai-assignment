"use client";

import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import type { GeneratedPaper } from "@/lib/api";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:8000";

export interface AssignmentUpdatePayload {
  assignmentId: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress?: number;
  message?: string;
  generatedPaper?: GeneratedPaper;
  error?: string;
}

export function useAssignmentSocket(
  assignmentId: string | null,
  onUpdate: (payload: AssignmentUpdatePayload) => void
) {
  const socketRef = useRef<Socket | null>(null);
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  const connect = useCallback(() => {
    if (!assignmentId) return;

    const socket = io(WS_URL, { transports: ["websocket", "polling"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("assignment:join", assignmentId);
    });

    socket.on("assignment:update", (payload: AssignmentUpdatePayload) => {
      onUpdateRef.current(payload);
    });

    return () => {
      socket.emit("assignment:leave", assignmentId);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [assignmentId]);

  useEffect(() => {
    const cleanup = connect();
    return () => cleanup?.();
  }, [connect]);
}
