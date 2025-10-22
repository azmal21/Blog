// controllers/ProfileController.js
const User = require("../models/User");

// ✅ Get user profile
const getMyProfile = async (req, res) => {
  try {
    const user = req.user;

    res.json({
      username: user.username,
      email: user.email,
      bio: user.bio || "",
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Update user bio
const updateBio = async (req, res) => {
  try {
    const { bio } = req.body;

    if (bio === undefined) {
      return res.status(400).json({ message: "Bio is required" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { bio },
      { new: true } // returns the updated document
    );

    res.json({
      message: "Bio updated successfully",
      bio: updatedUser.bio,
    });
  } catch (error) {
    console.error("Error updating bio:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getMyProfile, updateBio };
