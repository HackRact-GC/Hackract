import chalk from "chalk";
import axios from "axios";
import { PrismaClient } from "@prisma/client";
import { loginSchema } from "./user.schema.js";
import { findOrCreateUser, getAllUsers, getUserById } from "./user.service.js";

const prisma = new PrismaClient();

export async function loginUser(req, res) {
  try {
    const { error, value } = loginSchema.validate(req.body, { abortEarly: false });
    if (error)
      return res.status(400).json({ success: false, message: "Validation failed", details: error.details.map(d => d.message) });

    const { user } = value;
    const accessToken = req.headers.authorization?.split(" ")[1];
    if (!accessToken)
      return res.status(400).json({ success: false, message: "Missing access token" });

    const result = await findOrCreateUser(user, accessToken);
    res.status(200).json({ success: true, message: "User logged in successfully", user: result });
  } catch (err) {
    console.error(chalk.red("🔥 Login Error:"), err);
    res.status(500).json({ success: false, message: "Login failed", error: err.message });
  }
}
