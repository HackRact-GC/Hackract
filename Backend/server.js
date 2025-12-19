import http from "http";
import app from "./app.js";
import { connectDatabase } from "./src/database/sqlConnection.js";

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await connectDatabase();

  const server = http.createServer(app);
  server.listen(PORT, () => {
    console.log(`🚀 HackRact Server running on http://localhost:${PORT}`);
    console.log(`📘 Swagger Docs at http://localhost:${PORT}/api-docs`);
  });
};

startServer();
