import express from "express";
import { authCallback, login, logout, refresh } from "./auth.controller.js";

const router = express.Router();

// OAuth callback
router.get("/callback", authCallback);

// Login / logout / refresh
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh", refresh);

export default router;
