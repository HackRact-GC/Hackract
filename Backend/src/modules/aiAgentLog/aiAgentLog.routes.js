import express from "express";
import { createAIAgentLog, getLogs } from "./aiAgentLog.controller.js";
const router = express.Router();

router.post("/", createAIAgentLog);
router.get("/:session_id", getLogs);

export default router;
