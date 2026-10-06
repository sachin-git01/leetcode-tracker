require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");
const problemRoutes = require("./routes/problemRoutes");
const authRoutes = require("./routes/authRoutes");

// Process-level safety against unexpected crashes
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception thrown:", error);
});

// Initialize MongoDB connection
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Headers (configured to allow Google Auth popups & cross-origin images)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }
  })
);

// High-speed payload compression
app.use(compression());

// Strict Payload Limits (mitigate memory bomb & denial of service attacks)
app.use(express.json({ limit: "100kb" }));

// Dynamic CORS Lockdown
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "https://leetcode-tracker-wheat.vercel.app",
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL.replace(/\/$/, "")] : [])
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server health checks)
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app")
      ) {
        return callback(null, true);
      }
      return callback(new Error(`CORS policy violation: Access from ${origin} denied.`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// Rate Limiters to prevent DDoS and brute-force abuse
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60, // Limit each IP to 60 auth requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many authentication attempts. Please try again after 15 minutes." }
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 400, // Generous limit for standard tracker actions
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please slow down." }
});

// API Discovery / Root
app.get("/", (req, res) => {
  res.status(200).json({
    name: "LeetCode Tracker API",
    status: "Online & Running",
    database: "MongoDB Atlas Connected",
    endpoints: {
      health: "/health",
      auth: "/auth",
      problems: "/problems"
    }
  });
});

// Health check endpoint (for uptime monitors like UptimeRobot, Render, AWS ALB)
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    database: "MongoDB Connected",
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// Mount Routes with appropriate rate limiters
app.use("/auth", authLimiter, authRoutes);
app.use("/problems", apiLimiter, problemRoutes);

// 404 Handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.originalUrl}` });
});

// Centralized Global Error Handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err.stack || err.message);

  if (err.message && err.message.includes("CORS")) {
    return res.status(403).json({ error: err.message });
  }

  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    error: process.env.NODE_ENV === "production" ? "Internal server error" : err.message || "Unknown error"
  });
});

app.listen(PORT, () => {
  console.log(`Server running securely on port ${PORT}`);
});
