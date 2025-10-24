// routes/profileRoutes.js
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { getMyProfile, updateBio } from "../controllers/ProfileController.js";

const router = express.Router();

// Get current user's profile
router.get("/me", authMiddleware, getMyProfile);

// Update current user's bio
router.put("/update-bio", authMiddleware, updateBio);

export default router;
