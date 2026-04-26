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
const logger = require("./utils/logger");
const { apiLimiter } = require("./middleware/rateLimit");
const Sentry = require("@sentry/node");
const Tracing = require("@sentry/tracing");
const apiDocsRoutes = require("./routes/apiDocs");

const app = express();

// Sentry Initialization
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Tracing.Integrations.Express({ app }),
  ],
  tracesSampleRate: 1.0,
});

// Sentry request and tracing handlers
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

// HTTP request logging
app.use(morgan("combined", { stream: logger.stream }));

// Security middleware
app.use(helmet());

// Apply the general API rate limiter to all API routes
app.use("/api/", apiLimiter);

// CORS configuration
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

// Body parser middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Database connection
mongoose
  .connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/career_intelligence",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  )
  .then(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("MongoDB connected successfully");
    }
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

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

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Career Intelligence Portal API is running",
    timestamp: new Date().toISOString(),
  });
});

// Sentry error handler must be before any other error middleware
app.use(Sentry.Handlers.errorHandler());

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(
    `${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`,
  );
  logger.error(err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : {},
  });
});

// 404 handler
app.use("*", (req, res) => {
  logger.warn(
    `404 - Route not found - ${req.originalUrl} - ${req.method} - ${req.ip}`,
  );
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
