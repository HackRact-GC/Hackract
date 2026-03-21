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

  // In-memory registry for active collaborators { workflowId: { socketId: userInfo } }
  const workflowUsers = {};

  // Socket.io standard events for Workflow Collaboration
  io.on("connection", (socket) => {
    console.log(`🔌 New client connected: ${socket.id}`);

    // Join a specific workflow room (e.g., roomID = workflowId)
    socket.on("join-workflow", ({ workflowId, user, color }) => {
      socket.join(workflowId);
      
      // Store user info
      if (!workflowUsers[workflowId]) workflowUsers[workflowId] = {};
      workflowUsers[workflowId][socket.id] = { id: socket.id, user, color, joinedAt: new Date() };

      console.log(`Client ${socket.id} (${user}) joined workflow room: ${workflowId}`);
      
      // Send the current list of collaborators to the new user
      socket.emit("collaborators-list", Object.values(workflowUsers[workflowId]));

      // Notify others in room
      socket.to(workflowId).emit("user-joined", workflowUsers[workflowId][socket.id]);
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

    // Handle node-level presence (focus/selection)
    socket.on("node-focus", (data) => {
      // data: { workflowId, nodeId, user }
      socket.to(data.workflowId).emit("node-focused", { ...data, socketId: socket.id });
    });

    const handleLeave = (workflowId) => {
      if (workflowUsers[workflowId]) {
        delete workflowUsers[workflowId][socket.id];
        if (Object.keys(workflowUsers[workflowId]).length === 0) {
          delete workflowUsers[workflowId];
        }
      }
      socket.leave(workflowId);
      socket.to(workflowId).emit("user-left", { id: socket.id });
    };

    socket.on("leave-workflow", (workflowId) => {
      console.log(`Client ${socket.id} left workflow room: ${workflowId}`);
      handleLeave(workflowId);
    });

    socket.on("disconnecting", () => {
      // Clean up from all rooms on disconnect
      for (const room of socket.rooms) {
        if (room !== socket.id) {
          handleLeave(room);
        }
      }
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
