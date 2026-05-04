const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const { body, validationResult } = require("express-validator");
const { CodingPlatformService } = require("../services/codingPlatforms");
const Student = require("../models/Student");

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get student's saved coding profiles
router.get("/my-profiles", authorize("student"), async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    res.json({
      success: true,
      data: {
        profiles: student.codingProfiles || {},
      },
    });
  } catch (error) {
    console.error("Get coding profiles error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch coding profiles",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Fetch coding stats from all platforms for a student
router.post("/fetch-all-stats", authorize("student"), async (req, res) => {
  try {
    const { leetcodeUsername, codechefUsername, codeforcesUsername } = req.body;

    if (!leetcodeUsername && !codechefUsername && !codeforcesUsername) {
      return res.status(400).json({
        success: false,
        message: "At least one username is required",
      });
    }

    const student = await Student.findOne({ user: req.user._id });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    const results = {};
    const errors = {};

    // Fetch LeetCode stats
    if (
      leetcodeUsername &&
      CodingPlatformService.validateUsername("leetcode", leetcodeUsername)
    ) {
      try {
        const stats =
          await CodingPlatformService.fetchLeetCodeStats(leetcodeUsername);
        results.leetcode = stats;
        student.codingProfiles.leetcode = {
          username: stats.username,
          totalSolved: stats.totalSolved,
          easySolved: stats.easySolved,
          mediumSolved: stats.mediumSolved,
          hardSolved: stats.hardSolved,
          rating: stats.rating,
          lastUpdated: new Date(),
        };
      } catch (error) {
        errors.leetcode = error.message;
      }
    }

    // Fetch CodeChef stats
    if (
      codechefUsername &&
      CodingPlatformService.validateUsername("codechef", codechefUsername)
    ) {
      try {
        const stats =
          await CodingPlatformService.fetchCodeChefStats(codechefUsername);
        results.codechef = stats;
        student.codingProfiles.codechef = {
          username: stats.username,
          rating: stats.rating,
          stars: stats.stars,
          totalSolved: stats.totalSolved,
          lastUpdated: new Date(),
        };
      } catch (error) {
        errors.codechef = error.message;
      }
    }

    // Fetch Codeforces stats
    if (
      codeforcesUsername &&
      CodingPlatformService.validateUsername("codeforces", codeforcesUsername)
    ) {
      try {
        const stats =
          await CodingPlatformService.fetchCodeforcesStats(codeforcesUsername);
        results.codeforces = stats;
        student.codingProfiles.codeforces = {
          username: stats.username,
          rating: stats.rating,
          rank: stats.rank,
          totalSolved: stats.totalSolved,
          lastUpdated: new Date(),
        };
      } catch (error) {
        errors.codeforces = error.message;
      }
    }

    // Save the student profile with updated coding stats
    await student.save();

    res.json({
      success: Object.keys(results).length > 0,
      message: "Coding stats fetch completed",
      data: {
        successfulFetches: results,
        failedFetches: errors,
        studentProfile: student.codingProfiles,
      },
    });
  } catch (error) {
    console.error("Fetch coding stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch coding statistics",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Fetch stats for a specific platform
router.post(
  "/fetch-stats/:platform",
  [body("username").notEmpty().trim()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { platform } = req.params;
      const { username } = req.body;

      // Validate username format
      if (!CodingPlatformService.validateUsername(platform, username)) {
        return res.status(400).json({
          success: false,
          message: `Invalid ${platform} username format`,
        });
      }

      const stats = await CodingPlatformService.fetchCodingStats(
        platform,
        username,
      );

      // Update student profile if authenticated
      const student = await Student.findOne({ user: req.user._id });
      if (student) {
        student.codingProfiles[platform] = {
          ...stats,
          lastUpdated: new Date(),
        };
        await student.save();
      }

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error("Fetch stats error:", error);
      res.status(500).json({
        success: false,
        message: `Failed to fetch ${req.params.platform} statistics`,
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },
);

// Get coding growth analytics
router.get("/growth-analytics", authorize("student"), async (req, res) => {
  try {
    const { months = 6 } = req.query;

    const student = await Student.findOne({ user: req.user._id });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    const growthData = await CodingPlatformService.getCodingGrowth(
      student,
      parseInt(months),
    );
    const insights = CodingPlatformService.getCodingInsights(student);

    res.json({
      success: true,
      data: {
        growth: growthData,
        insights,
        summary: {
          totalProblems: student.totalCodingProblems || 0,
          averageRating: student.averageCodingRating || 0,
          activePlatforms: ["leetcode", "codechef", "codeforces"].filter(
            (platform) =>
              student.codingProfiles[platform] &&
              student.codingProfiles[platform].totalSolved > 0,
          ),
        },
      },
    });
  } catch (error) {
    console.error("Growth analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch growth analytics",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Get coding insights and recommendations
router.get("/insights", authorize("student"), async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });

    if (!student) {
      return res.json({
        success: true,
        data: {
          message: "Start adding coding profiles to get personalized insights",
          insights: {},
        },
      });
    }

    const insights = CodingPlatformService.getCodingInsights(student);

    res.json({
      success: true,
      data: insights,
    });
  } catch (error) {
    console.error("Insights error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch insights",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Validate coding platform username
router.post(
  "/validate-username/:platform",
  [body("username").notEmpty().trim()],
  async (req, res) => {
    try {
      const { platform } = req.params;
      const { username } = req.body;

      const isValid = CodingPlatformService.validateUsername(
        platform,
        username,
      );

      res.json({
        success: true,
        data: {
          platform,
          username,
          isValid,
          message: isValid
            ? "Username format is valid"
            : "Invalid username format for this platform",
        },
      });
    } catch (error) {
      console.error("Validation error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to validate username",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },
);

module.exports = router;
