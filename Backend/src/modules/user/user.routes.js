import express from "express";
import { loginUser } from "./user.controller.js";
import { Admin, verifyAccessToken } from "../../middlewares/auth0.middleware.js";

const router = express.Router();

router.post("/user/login", loginUser);
router.get("/admin/users", verifyAccessToken, Admin, async (req, res) => {
  // Example admin route
});

export default router;
