import http from "http";
import app from "./app.js";
import { connectDatabase } from "./src/database/sqlConnection.js";

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  // Connect to database first
  await connectDatabase();

  // Start HTTP server
  const server = http.createServer(app);
  server.listen(PORT, () => {
    console.log(`🚀 HackRact Server running on http://localhost:${PORT}`);
  });
};

startServer();
