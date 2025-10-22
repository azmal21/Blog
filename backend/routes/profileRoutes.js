const express = require("express");
const router = express.Router();
const { getMyProfile, updateBio } = require("../controllers/ProfileController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/me", authMiddleware, getMyProfile);

router.put("/update-bio", authMiddleware, updateBio);

module.exports = router;
