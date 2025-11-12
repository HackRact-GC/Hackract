import chalk from "chalk";
import axios from "axios";
import { PrismaClient } from "@prisma/client";
import { loginSchema, logoutSchema, refreshSchema } from "./auth.schema.js";
import { upsertUser, verifyAccessToken, refreshToken } from "./auth.service.js";

const prisma = new PrismaClient();

export async function authCallback(req, res) {
  const { code, state } = req.query;

  if (!code) return res.status(400).json({ success: false, message: "Authorization code is required" });

  try {
    const tokenRes = await axios.post(
      `${process.env.AUTH_DOMAIN}/oauth/token`,
      {
        grant_type: "authorization_code",
        client_id: process.env.AUTH_CLIENT_ID,
        client_secret: process.env.AUTH_CLIENT_SECRET,
        code,
        redirect_uri: process.env.AUTH_CALLBACK_URL,
      },
      { headers: { "Content-Type": "application/json" } }
    );

    const { access_token, id_token } = tokenRes.data;

    const userInfo = await axios.get(`${process.env.AUTH_DOMAIN}/userinfo`, {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const user = await upsertUser(userInfo.data, access_token);

    const frontendRedirect = state || process.env.FRONTEND_URL;
    res.redirect(`${frontendRedirect}?token=${access_token}`);
  } catch (err) {
    console.error(chalk.red("🔥 Auth Callback Error:"), err);
    res.status(500).json({ success: false, message: "Authentication failed", error: err.message });
  }
}

export async function login(req, res) {
  try {
    const { error, value } = loginSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).json({ success: false, details: error.details.map(d => d.message) });

    const { user } = value;
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(400).json({ success: false, message: "Missing access token" });

    const result = await upsertUser(user, token);
    res.json({ success: true, user: result });
  } catch (err) {
    console.error("🔥 Login Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function logout(req, res) {
  try {
    const { error, value } = logoutSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, details: error.details.map(d => d.message) });

    // Invalidate token or just respond
    res.json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    console.error("🔥 Logout Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function refresh(req, res) {
  try {
    const { error, value } = refreshSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, details: error.details.map(d => d.message) });

    const token = await refreshToken(value.user.sub);
    res.json({ success: true, accessToken: token });
  } catch (err) {
    console.error("🔥 Refresh Token Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
}
