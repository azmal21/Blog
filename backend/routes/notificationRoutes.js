import express from "express";
import { getMyNotifications, markAsRead } from "../controllers/notificationController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();
router.get("/", authMiddleware, getMyNotifications);
router.put("/:id/read", authMiddleware, markAsRead);

export default router;