// server.js
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Import routes
import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import userbioRoutes from "./routes/userbioRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";

// Load environment variables
dotenv.config();

const app = express();

// Fix __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check environment
const isDev = process.env.NODE_ENV !== "production";

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: "https://writeer-gko4jx3ra-mahammadazmal21-9335s-projects.vercel.app",
    credentials: true,
  })
);




app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api", commentRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/users", userbioRoutes);
app.use("/api/feedback", feedbackRoutes);

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    ssl: true, // Enable TLS/SSL
    tlsAllowInvalidCertificates: isDev, // Allow invalid certificates in development only
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));






