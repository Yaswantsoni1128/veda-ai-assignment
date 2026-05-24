import type { Server } from "socket.io";

let ioInstance: Server | null = null;

export function setSocketIO(io: Server) {
  ioInstance = io;
}

export function getSocketIO(): Server {
  if (!ioInstance) {
    throw new Error("Socket.IO not initialized");
  }
  return ioInstance;
}
