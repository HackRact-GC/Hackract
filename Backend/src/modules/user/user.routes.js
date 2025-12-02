import express from "express";
import { loginUser } from "./user.controller.js";
import { Admin, verifyAccessToken } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.post("/user/login", loginUser);
router.get("/admin/users", verifyAccessToken, Admin, async (req, res) => {
  // Example admin route
});

export default router;
