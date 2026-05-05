const mongoose = require("mongoose");

/**
 * Paths that must respond without MongoDB (health checks, auth ping, contact form).
 */
function isDbOptionalPath(req) {
  const url = req.originalUrl.split("?")[0];
  return (
    url === "/api/health" ||
    url.startsWith("/api/auth/status") ||
    url.startsWith("/api/contact")
  );
}

/**
 * Reject API requests when MongoDB is not connected (avoids mongoose buffering timeouts).
 */
function requireMongo(req, res, next) {
  if (process.env.NODE_ENV === "test") {
    return next();
  }
  if (!req.originalUrl.startsWith("/api")) {
    return next();
  }
  if (isDbOptionalPath(req)) {
    return next();
  }
  if (mongoose.connection.readyState === 1) {
    return next();
  }
  return res.status(503).json({
    success: false,
    message:
      "Database is unavailable. Verify MONGODB_URI and Atlas network access (IP allowlist / VPN).",
    code: "DB_UNAVAILABLE",
  });
}

function getMongoStatus() {
  const states = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };
  return states[mongoose.connection.readyState] || "unknown";
}

module.exports = { requireMongo, isDbOptionalPath, getMongoStatus };
