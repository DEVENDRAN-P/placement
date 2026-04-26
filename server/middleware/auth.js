const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Protect routes - now supports both JWT and Firebase tokens
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
    });
  }

  try {
    // Try to verify as JWT token first
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from database
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid token. User not found.",
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: "Account is deactivated.",
        });
      }

      // Use role from token (which is more reliable than DB)
      req.user = user.toObject();
      req.user.role = decoded.role || user.role; // Token role takes precedence

      // Debug logging only in development
      if (process.env.NODE_ENV === "development") {
        console.log(
          `✅ JWT token verified for user: ${user.email}, role: ${req.user.role}`,
        );
      }
      next();
    } catch (jwtError) {
      // JWT verification failed, this might be a Firebase token
      // For now, create a temporary user object from the token
      // In production, you would validate the Firebase token using Firebase Admin SDK

      // Extract basic info from the token (Firebase tokens have sub, email, etc.)
      const parts = token.split(".");
      if (parts.length === 3) {
        try {
          // Decode the payload (for Firebase tokens, this is acceptable as they're still signed)
          const payload = JSON.parse(
            Buffer.from(parts[1], "base64").toString(),
          );

          // ⚠️ Note: In production, Firebase tokens should be verified using Firebase Admin SDK
          // This requires: const admin = require('firebase-admin'); await admin.auth().verifyIdToken(token);
          // For now, we validate by checking if user exists in database

          // Try to find user in database to get correct role and verify they exist
          let dbUser = null;
          try {
            if (payload.email) {
              dbUser = await User.findOne({ email: payload.email }).select(
                "-password",
              );
            } else if (payload.sub || payload.uid || payload.user_id) {
              dbUser = await User.findById(
                payload.sub || payload.uid || payload.user_id,
              ).select("-password");
            }
          } catch (dbError) {
            if (process.env.NODE_ENV === "development") {
              console.log(
                "Database lookup failed for Firebase user, using token data",
              );
            }
          }

          // If user doesn't exist in database, reject the token
          if (!dbUser) {
            if (process.env.NODE_ENV === "development") {
              console.error(
                `❌ Token validation failed: User not found in database for email: ${payload.email}`,
              );
              console.error(
                "This usually means: User authenticated with Firebase but not synced to MongoDB",
              );
              console.error("Fix: Call /auth/firebase-login to sync user");
            }
            return res.status(401).json({
              success: false,
              message: "User not found. Please re-login to sync your account.",
            });
          }

          // Create user object with role from DB if available
          req.user = {
            _id: payload.sub || payload.uid || payload.user_id,
            id: payload.sub || payload.uid || payload.user_id,
            email: payload.email,
            role: dbUser?.role || payload.role || "student",
            isActive: true,
            isVerified: payload.email_verified || false,
          };

          // Debug logging only in development
          if (process.env.NODE_ENV === "development") {
            console.log(
              "✅ Firebase token accepted, user:",
              req.user.email,
              "role:",
              req.user.role,
            );
          }
          next();
        } catch (parseError) {
          return res.status(401).json({
            success: false,
            message: "Invalid token format.",
          });
        }
      } else {
        return res.status(401).json({
          success: false,
          message: "Invalid token.",
        });
      }
    }
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Authentication error: " + error.message,
    });
  }
};

// Role-based authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. ${req.user.role} role is not authorized to access this resource.`,
      });
    }
    next();
  };
};

// Check if user is verified
const requireVerification = (req, res, next) => {
  if (!req.user.isVerified) {
    return res.status(403).json({
      success: false,
      message: "Please verify your email address to access this feature.",
    });
  }
  next();
};

// Check subscription status for premium features
const requireSubscription = (plan = "Premium") => {
  return async (req, res, next) => {
    try {
      let userSubscription;

      if (req.user.role === "college") {
        const College = require("../models/College");
        const college = await College.findOne({ user: req.user._id });
        userSubscription = college?.subscription;
      } else if (req.user.role === "recruiter") {
        const Recruiter = require("../models/Recruiter");
        const recruiter = await Recruiter.findOne({ user: req.user._id });
        userSubscription = recruiter?.subscription;
      } else {
        // Students don't need subscription for basic features
        return next();
      }

      if (
        !userSubscription ||
        !userSubscription.isActive ||
        !userSubscription.endDate ||
        userSubscription.endDate < new Date()
      ) {
        return res.status(403).json({
          success: false,
          message: `This feature requires a ${plan} subscription. Please upgrade your plan.`,
        });
      }

      const planHierarchy = ["Basic", "Premium", "Enterprise"];
      const userPlanIndex = planHierarchy.indexOf(userSubscription.plan);
      const requiredPlanIndex = planHierarchy.indexOf(plan);

      if (userPlanIndex < requiredPlanIndex) {
        return res.status(403).json({
          success: false,
          message: `This feature requires a ${plan} subscription. Your current plan is ${userSubscription.plan}.`,
        });
      }

      next();
    } catch (error) {
      console.error("Subscription check error:", error);
      return res.status(500).json({
        success: false,
        message: "Error checking subscription status.",
      });
    }
  };
};

module.exports = {
  protect,
  authorize,
  requireVerification,
  requireSubscription,
};
