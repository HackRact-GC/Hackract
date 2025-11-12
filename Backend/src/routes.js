import express from "express";
import UserRouter from "./modules/user/user.routes.js";
import ScanRouter from "./modules/scanSession/scanSession.routes.js";
import VulnRouter from "./modules/vulnerabilityFinding/vulnerabilityFinding.routes.js";
import LogRouter from "./modules/aiAgentLog/aiAgentLog.routes.js";

const app = express();
app.use(express.json());
app.use("/api/users", UserRouter);
app.use("/api/scans", ScanRouter);
app.use("/api/vulns", VulnRouter);
app.use("/api/logs", LogRouter);
