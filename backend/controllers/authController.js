// controllers/authController.js
import User from "../models/User.js";
import Otp from "../models/Otp.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: { rejectUnauthorized: false },
});

// -------------------- REGISTER OTP --------------------
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already exists" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await Otp.deleteMany({ email });
    await Otp.create({ email, otp });

    await transporter.sendMail({
      from: `"Writeer Team" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Writeer Verification Code - Secure Your Account",
      html: `
        <div style="font-family: 'Segoe UI', sans-serif; background-color: #f9fafb; padding: 20px; border-radius: 10px; border: 1px solid #e5e7eb;">
          <h2 style="color: #4f46e5; text-align: center;">🔐 Verify Your Writeer Account</h2>
          <p style="font-size: 16px; color: #374151;">Hello,</p>
          <p style="font-size: 16px; color: #374151;">
            Your One-Time Password (OTP) for <strong>Writeer</strong> is:
          </p>
          <div style="text-align: center; margin: 20px 0;">
            <span style="display: inline-block; background-color: #4f46e5; color: white; font-size: 22px; letter-spacing: 4px; padding: 10px 20px; border-radius: 8px;">
              ${otp}
            </span>
          </div>
          <p style="font-size: 14px; color: #6b7280;">
            This code will expire in <strong>5 minutes</strong>. Please do not share it with anyone for your account’s security.
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="font-size: 14px; color: #9ca3af; text-align: center;">
            © ${new Date().getFullYear()} Writeer. All rights reserved.
          </p>
        </div>
      `,
    });

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("OTP send error:", err);
    res.status(500).json({ message: "Failed to send OTP", error: err.message });
  }
};

// -------------------- VERIFY REGISTER OTP --------------------
export const verifyOtpAndRegister = async (req, res) => {
  try {
    const { username, email, password, otp } = req.body;

    const record = await Otp.findOne({ email, otp });
    if (!record) return res.status(400).json({ message: "Invalid or expired OTP" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    await Otp.deleteMany({ email });

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// -------------------- LOGIN --------------------
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({ token, username: user.username });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// -------------------- FORGOT PASSWORD: SEND OTP --------------------
export const sendForgotOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "No account found with this email" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await Otp.deleteMany({ email });
    await Otp.create({ email, otp });

    await transporter.sendMail({
      from: `"Writeer Team" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Writeer Password Reset Code – Secure Your Account",
      html: `
        <div style="font-family: 'Segoe UI', sans-serif; background-color: #f9fafb; padding: 20px; border-radius: 10px; border: 1px solid #e5e7eb;">
          <h2 style="color: #4f46e5; text-align: center;">🔒 Password Reset Request</h2>
          <p style="font-size: 16px; color: #374151;">Hello,</p>
          <p style="font-size: 16px; color: #374151;">
            We received a request to reset your <strong>Writeer</strong> account password.  
            Use the One-Time Password (OTP) below to verify your request:
          </p>
          <div style="text-align: center; margin: 20px 0;">
            <span style="display: inline-block; background-color: #4f46e5; color: white; font-size: 22px; letter-spacing: 4px; padding: 10px 20px; border-radius: 8px;">
              ${otp}
            </span>
          </div>
          <p style="font-size: 14px; color: #6b7280;">
            This code will expire in <strong>5 minutes</strong>. If you did not request a password reset, please ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="font-size: 14px; color: #9ca3af; text-align: center;">
            © ${new Date().getFullYear()} Writeer. All rights reserved.
          </p>
        </div>
      `,
    });

    res.status(200).json({ message: "Password reset OTP sent successfully" });
  } catch (err) {
    console.error("Forgot password OTP error:", err);
    res.status(500).json({ message: "Failed to send OTP", error: err.message });
  }
};

// -------------------- RESET PASSWORD USING OTP --------------------
export const resetPasswordWithOtp = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const record = await Otp.findOne({ email, otp });
    if (!record) return res.status(400).json({ message: "Invalid or expired OTP" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.findOneAndUpdate(
      { email },
      { password: hashedPassword },
      { new: true }
    );

    await Otp.deleteMany({ email });

    res.status(200).json({ message: "Password reset successful. Please login again." });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
