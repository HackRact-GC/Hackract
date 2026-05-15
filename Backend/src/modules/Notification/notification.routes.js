import express from "express";
import * as controller from "./notification.controller.js";
import { protect } from "../../middleware/Auth.middleware.js";

const router = express.Router();

router.use(protect);

router.get("/", controller.list);
router.patch("/mark-all-read", controller.markAllRead);
router.patch("/:id/read", controller.markRead);
router.delete("/:id", controller.remove);

export default router;
