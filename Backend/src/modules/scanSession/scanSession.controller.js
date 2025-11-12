import chalk from "chalk";
import { PrismaClient } from "@prisma/client";
import { createScanSchema } from "./scanSession.schema.js";
import { createScanSession, getAllSessions, getSessionById, deleteSession } from "./scanSession.service.js";

const prisma = new PrismaClient();

export async function createScan(req, res) {
  try {
    const { error, value } = createScanSchema.validate(req.body);
    if (error)
      return res.status(400).json({ success: false, message: error.details.map(d => d.message).join(", ") });

    const scan = await createScanSession(value);
    res.status(201).json({ success: true, data: scan });
  } catch (err) {
    console.error(chalk.red("🔥 Create Scan Error:"), err);
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function fetchScans(req, res) {
  try {
    const scans = await getAllSessions();
    res.json({ success: true, data: scans });
  } catch (err) {
    console.error("❌ Fetch Scans Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function fetchScanById(req, res) {
  try {
    const { id } = req.params;
    const session = await getSessionById(id);
    if (!session) return res.status(404).json({ success: false, message: "Scan not found" });
    res.json({ success: true, data: session });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function deleteScan(req, res) {
  try {
    const { id } = req.params;
    await deleteSession(id);
    res.json({ success: true, message: "Scan deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
}
