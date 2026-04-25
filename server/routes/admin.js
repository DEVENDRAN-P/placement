const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const Student = require("../models/Student");
const College = require("../models/College");
const Recruiter = require("../models/Recruiter");
const Placement = require("../models/Placement");

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize("admin"));

// Get dashboard overview
router.get("/dashboard", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await Student.countDocuments();
    const totalColleges = await College.countDocuments();
    const totalRecruiters = await Recruiter.countDocuments();
    const totalPlacements = await Placement.countDocuments();

    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: new Date(new Date().setDate(1)) },
    });

    const activeUsers = await User.countDocuments({ isActive: true });
    const verifiedUsers = await User.countDocuments({ isVerified: true });

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalStudents,
          totalColleges,
          totalRecruiters,
          totalPlacements,
          newUsersThisMonth,
          activeUsers,
          verifiedUsers,
        },
        userDistribution: {
          students: totalStudents,
          colleges: totalColleges,
          recruiters: totalRecruiters,
        },
        placementStats: {
          totalPlacements,
          activePlacements: await Placement.countDocuments({ status: "Open" }),
          closedPlacements: await Placement.countDocuments({
            status: "Closed",
          }),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get dashboard data",
    });
  }
});

// Get all users (with pagination and filters)
router.get("/users", async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search, verified } = req.query;
    const filter = {};

    if (role) filter.role = role;
    if (verified !== undefined) filter.isVerified = verified === "true";
    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: "i" } },
        { "profile.firstName": { $regex: search, $options: "i" } },
        { "profile.lastName": { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get users",
    });
  }
});

// Get single user details
router.get("/users/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let profileData = null;
    if (user.role === "student") {
      profileData = await Student.findOne({ user: user._id }).populate(
        "college",
        "name code",
      );
    } else if (user.role === "college") {
      profileData = await College.findOne({ user: user._id });
    } else if (user.role === "recruiter") {
      profileData = await Recruiter.findOne({ user: user._id });
    }

    res.json({
      success: true,
      data: { user, profileData },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get user details",
    });
  }
});

// Update user (admin can modify any field)
router.put(
  "/users/:userId",
  [
    body("role").optional().isIn(["student", "college", "recruiter", "admin"]),
    body("isVerified").optional().isBoolean(),
    body("isActive").optional().isBoolean(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { role, isVerified, isActive, profile } = req.body;

      const user = await User.findById(req.params.userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      if (role) user.role = role;
      if (isVerified !== undefined) user.isVerified = isVerified;
      if (isActive !== undefined) user.isActive = isActive;
      if (profile) user.profile = { ...user.profile, ...profile };

      await user.save();

      res.json({
        success: true,
        message: "User updated successfully",
        data: user,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to update user",
      });
    }
  },
);

// Delete user (soft delete - deactivate)
router.delete("/users/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.isActive = false;
    await user.save();

    res.json({
      success: true,
      message: "User deactivated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to deactivate user",
    });
  }
});

// Get all colleges
router.get("/colleges", async (req, res) => {
  try {
    const colleges = await College.find()
      .populate("user", "email isVerified isActive")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: colleges,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get colleges",
    });
  }
});

// Get all recruiters
router.get("/recruiters", async (req, res) => {
  try {
    const recruiters = await Recruiter.find()
      .populate("user", "email isVerified isActive")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: recruiters,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get recruiters",
    });
  }
});

// Verify college
router.put("/colleges/:collegeId/verify", async (req, res) => {
  try {
    const college = await College.findById(req.params.collegeId);

    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found",
      });
    }

    college.verificationStatus = {
      isVerified: true,
      verifiedBy: req.user._id,
      verifiedDate: new Date(),
      documents: ["Verified by admin"],
    };

    await college.save();

    res.json({
      success: true,
      message: "College verified successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to verify college",
    });
  }
});

// Verify recruiter
router.put("/recruiters/:recruiterId/verify", async (req, res) => {
  try {
    const recruiter = await Recruiter.findById(req.params.recruiterId);

    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: "Recruiter not found",
      });
    }

    recruiter.verificationStatus = {
      isVerified: true,
      verifiedBy: req.user._id,
      verifiedDate: new Date(),
      documents: ["Verified by admin"],
    };

    await recruiter.save();

    res.json({
      success: true,
      message: "Recruiter verified successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to verify recruiter",
    });
  }
});

// Get system settings
router.get("/settings", async (req, res) => {
  try {
    const settings = {
      platform: {
        name: "Career Intelligence Portal",
        version: "1.0.0",
        maintenanceMode: false,
        registrationOpen: true,
      },
      features: {
        googleAuth: true,
        emailVerification: true,
        codingPlatformIntegration: true,
        aiAnalysis: true,
        videoProfiles: true,
        referrals: true,
      },
      limits: {
        maxResumeSize: 5 * 1024 * 1024,
        maxVideoSize: 50 * 1024 * 1024,
        rateLimit: 100,
      },
    };

    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get settings",
    });
  }
});

// Update system settings
router.put(
  "/settings",
  [
    body("maintenanceMode").optional().isBoolean(),
    body("registrationOpen").optional().isBoolean(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { maintenanceMode, registrationOpen } = req.body;

      // In a real app, you'd save to a settings collection
      // For now, this is a placeholder

      res.json({
        success: true,
        message: "Settings updated successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to update settings",
      });
    }
  },
);

// Get platform statistics
router.get("/statistics", async (req, res) => {
  try {
    const stats = {
      users: {
        total: await User.countDocuments(),
        active: await User.countDocuments({ isActive: true }),
        verified: await User.countDocuments({ isVerified: true }),
      },
      students: {
        total: await Student.countDocuments(),
        placed: await Student.countDocuments({
          "placementStatus.isPlaced": true,
        }),
      },
      colleges: {
        total: await College.countDocuments(),
        verified: await College.countDocuments({
          "verificationStatus.isVerified": true,
        }),
      },
      recruiters: {
        total: await Recruiter.countDocuments(),
        verified: await Recruiter.countDocuments({
          "verificationStatus.isVerified": true,
        }),
      },
      placements: {
        total: await Placement.countDocuments(),
        active: await Placement.countDocuments({ status: "Open" }),
        closed: await Placement.countDocuments({ status: "Closed" }),
      },
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get statistics",
    });
  }
});

// Activity log (recent actions)
router.get("/activity", async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    // Get recent user registrations
    const recentUsers = await User.find()
      .select("email role createdAt")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    const activity = recentUsers.map((user) => ({
      type: "user_registration",
      user: user.email,
      role: user.role,
      timestamp: user.createdAt,
    }));

    res.json({
      success: true,
      data: activity,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get activity",
    });
  }
});

module.exports = router;
