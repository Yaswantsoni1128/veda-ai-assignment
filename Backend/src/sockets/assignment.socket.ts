import type { Server, Socket } from "socket.io";

export function registerAssignmentSockets(io: Server) {
  io.on("connection", (socket: Socket) => {
    socket.on("assignment:join", (assignmentId: string) => {
      if (assignmentId) {
        socket.join(`assignment:${assignmentId}`);
        socket.emit("assignment:joined", { assignmentId });
      }
    });

    socket.on("assignment:leave", (assignmentId: string) => {
      if (assignmentId) {
        socket.leave(`assignment:${assignmentId}`);
      }
    });
  });
}
