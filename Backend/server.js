import http from "http";
import app from "./app.js";
import { connectDatabase } from "./src/database/sqlConnection.js";
import { Server } from "socket.io";

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await connectDatabase();

  const server = http.createServer(app);

  // Initialize Socket.io
  const io = new Server(server, {
    cors: {
      origin: "*", // Adjust this in production to match your frontend URL
      methods: ["GET", "POST"]
    }
  });

  // Socket.io standard events for Workflow Collaboration
  io.on("connection", (socket) => {
    console.log(`🔌 New client connected: ${socket.id}`);

    // Join a specific workflow room (e.g., roomID = workflowId)
    socket.on("join-workflow", (workflowId) => {
      socket.join(workflowId);
      console.log(`Client ${socket.id} joined workflow room: ${workflowId}`);
      // Notify others in room
      socket.to(workflowId).emit("user-joined", { id: socket.id });
    });

    // Handle incoming changes (nodes moving, edits, etc)
    socket.on("workflow-change", (data) => {
      // data ideally contains { workflowId, action, details, user }

      // Broadcast the change to everyone ELSE in that room
      socket.to(data.workflowId).emit("workflow-updated", data);

      // TODO: Here we could optionally persist this atomic change to Prisma WorkflowHistory
      // to avoid storing every single drag event, we typically batch or save on throttle.
    });

    // Handle cursor movement optionally showing where users are
    socket.on("cursor-move", (data) => {
      // data: { workflowId, x, y, user }
      socket.to(data.workflowId).emit("cursor-updated", { ...data, socketId: socket.id });
    });

    socket.on("leave-workflow", (workflowId) => {
      socket.leave(workflowId);
      console.log(`Client ${socket.id} left workflow room: ${workflowId}`);
      socket.to(workflowId).emit("user-left", { id: socket.id });
    });

    socket.on("disconnect", () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  server.listen(PORT, () => {
    console.log(`🚀 HackRact Server running on http://localhost:${PORT}`);
    console.log(`📘 Swagger Docs at http://localhost:${PORT}/api-docs`);
  });
};

startServer();
