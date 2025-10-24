// routes/commentRoutes.js
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { getCommentsById, createComment } from "../controllers/commentController.js";

const router = express.Router();

// Get comments for a post
router.get("/posts/:postId/comments", getCommentsById);

// Create a comment (requires auth)
router.post("/posts/:postId/comments", authMiddleware, createComment);

export default router;
