const express = require("express");
const { sendOtp, verifyOtpAndRegister, loginUser, sendForgotOtp, resetPasswordWithOtp } = require("../controllers/authController");
const router = express.Router();

// Registration + Login
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtpAndRegister);
router.post("/login", loginUser);

// Forgot Password
router.post("/forgot-password", sendForgotOtp);
router.post("/reset-password", resetPasswordWithOtp);

module.exports = router;
