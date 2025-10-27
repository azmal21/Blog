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

// ✅ Allow localhost + vercel.app + your deployed backend domain
const allowedOrigins = [
  "http://localhost:5173",
  "https://writeer.vercel.app",
  "https://writeer-git-main-mahammadazmal21-9335s-projects.vercel.app",
  "https://writeer-gko4jx3ra-mahammadazmal21-9335s-projects.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || /\.vercel\.app$/.test(origin)) {
        return callback(null, true);
      }
      console.log("❌ Blocked by CORS:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// ✅ Health check route (to test deployment)
app.get("/", (req, res) => {
  res.send("✅ Backend is live and running fine!");
});

// Static uploads
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
    ssl: true,
    tlsAllowInvalidCertificates: isDev,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

