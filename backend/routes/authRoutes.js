import express from "express";
import { sendOtp, verifyOtpAndRegister, loginUser, sendForgotOtp, resetPasswordWithOtp } from "../controllers/authController.js";
const router = express.Router();

// Registration + Login
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtpAndRegister);
router.post("/login", loginUser);

// Forgot Password
router.post("/forgot-password", sendForgotOtp);
router.post("/reset-password", resetPasswordWithOtp);

export default router;




