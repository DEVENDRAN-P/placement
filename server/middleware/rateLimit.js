const rateLimit = require("express-rate-limit");

// General API limiter - to prevent brute-force attacks
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again after 15 minutes",
});

// Stricter limiter for sensitive actions like sending emails or performing complex filters
const sensitiveActionLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20, // Limit each IP to 20 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message:
    "Too many sensitive actions from this IP, please try again after 10 minutes",
});

// Limiter for public-facing endpoints to prevent scraping
const publicApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message:
    "Too many requests to public endpoints, please try again after 15 minutes",
});

module.exports = {
  apiLimiter,
  sensitiveActionLimiter,
  publicApiLimiter,
};
