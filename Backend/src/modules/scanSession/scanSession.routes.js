import express from "express";
import { createScan, fetchScans, fetchScanById, deleteScan } from "./scanSession.controller.js";
import { verifyAccessToken } from "../../middlewares/auth0.middleware.js";

const router = express.Router();

router.post("/", verifyAccessToken, createScan);
router.get("/", verifyAccessToken, fetchScans);
router.get("/:id", verifyAccessToken, fetchScanById);
router.delete("/:id", verifyAccessToken, deleteScan);

export default router;
