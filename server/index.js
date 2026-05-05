const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const authRoutes = require("./routes/auth");
const studentRoutes = require("./routes/students");
const collegeRoutes = require("./routes/colleges");
const recruiterRoutes = require("./routes/recruiters");
const placementRoutes = require("./routes/placements");
const analyticsRoutes = require("./routes/analytics");
const aiRoutes = require("./routes/ai");
const notificationsRoutes = require("./routes/notifications");
const codingPlatformsRoutes = require("./routes/codingPlatforms");
const interviewPrepRoutes = require("./routes/interviewPrep");
const referralsRoutes = require("./routes/referrals");
const videoProfileRoutes = require("./routes/videoProfile");
const adminRoutes = require("./routes/admin");
const morgan = require("morgan");
// const logger = require("./utils/logger");
const { apiLimiter } = require("./middleware/rateLimit");
// const Sentry = require("@sentry/node");
// const Tracing = require("@sentry/tracing");
const apiDocsRoutes = require("./routes/apiDocs");
const contactRoutes = require("./routes/contact");
const { requireMongo, getMongoStatus } = require("./middleware/dbReady");

const app = express();

// Sentry Initialization - DISABLED FOR NOW
// Sentry.init({
//   dsn: process.env.SENTRY_DSN,
//   integrations: [
//     new Sentry.Integrations.Http({ tracing: true }),
//     new Tracing.Integrations.Express({ app }),
//   ],
//   tracesSampleRate: 1.0,
// });

// Sentry request and tracing handlers - DISABLED FOR NOW
// app.use(Sentry.Handlers.requestHandler());
// app.use(Sentry.Handlers.tracingHandler());

// HTTP request logging
app.use(morgan("combined"));

// Security middleware
app.use(helmet());

// Apply the general API rate limiter to all API routes
app.use("/api/", apiLimiter);

// CORS configuration


// CORS configuration (FIXED)
app.use(
  cors({
    origin: true, // allow all origins (fixes 403 on Vercel)
    credentials: true,
  }),
);

// Body parser middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Database connection (Atlas-friendly timeouts; fail fast vs infinite buffering)
const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 15000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
};

if (process.env.NODE_ENV !== "test") {
  mongoose.connection.on("connected", () => {
    console.log("MongoDB connected successfully");
  });
  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB disconnected");
  });
  mongoose.connection.on("error", (err) => {
    console.error("MongoDB connection error:", err.message);
  });

 if (!process.env.MONGODB_URI) {
  console.error("❌ MONGODB_URI is missing");
  process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI, mongoOptions)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });
}

// Require live DB for data routes (avoids 10s mongoose buffer timeouts)
// app.use(requireMongo);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/colleges", collegeRoutes);
app.use("/api/recruiters", recruiterRoutes);
app.use("/api/placements", placementRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/coding-platforms", codingPlatformsRoutes);
app.use("/api/interview-prep", interviewPrepRoutes);
app.use("/api/referrals", referralsRoutes);
app.use("/api/video-profile", videoProfileRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api-docs", apiDocsRoutes);
app.use("/api/contact", contactRoutes);

// Health check endpoint (works without MongoDB)
app.get("/api/health", (req, res) => {
  const mongo = getMongoStatus();
  const ok = mongo === "connected";
  res.status(ok ? 200 : 503).json({
    status: ok ? "OK" : "DEGRADED",
    message: ok
      ? "Career Intelligence Portal API is running"
      : "API up but database not connected",
    mongodb: mongo,
    timestamp: new Date().toISOString(),
  });
});

// Sentry error handler must be before any other error middleware - DISABLED
// app.use(Sentry.Handlers.errorHandler());

// Error handling middleware
app.use((err, req, res, next) => {
  // logger.error(
  //   `${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`,
  // );
  // logger.error(err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : {},
  });
});

// 404 handler
app.use("*", (req, res) => {
  // logger.warn(
  //   `404 - Route not found - ${req.originalUrl} - ${req.method} - ${req.ip}`,
  // );
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

const PORT = process.env.PORT || 5000;

let server;
if (process.env.NODE_ENV !== "test") {
  server = app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
    const uri = process.env.MONGODB_URI?.split("?")[0];
    if (uri) console.log(`MongoDB URI target: ${uri}`);
    console.log("Career Intelligence Portal API started");
  });
}

module.exports = app;
module.exports.server = server;
