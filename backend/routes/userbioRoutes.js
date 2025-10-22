// routes/userRoutes.js
import express from "express";
import User from "../models/User.js";

const router = express.Router();

// GET user bio by username or id
router.get("/bio/:username", async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username }).select("username bio -_id");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
