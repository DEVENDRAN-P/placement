const express = require("express");
const { body, validationResult } = require("express-validator");
const Recruiter = require("../models/Recruiter");
const Placement = require("../models/Placement");
const Student = require("../models/Student");
const {
  protect,
  authorize,
  requireSubscription,
} = require("../middleware/auth");

const router = express.Router();

// All recruiter routes require authentication and recruiter role
router.use(protect);
router.use(authorize("recruiter"));

// Get recruiter profile
router.get("/profile", async (req, res) => {
  try {
    const recruiter = await Recruiter.findOne({ user: req.user._id });

    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: "Recruiter profile not found",
      });
    }

    res.json({
      success: true,
      data: recruiter,
    });
  } catch (error) {
    console.error("Get recruiter profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get recruiter profile",
    });
  }
});

// Update recruiter profile
router.put(
  "/profile",
  [
    body("company.name").notEmpty().trim(),
    body("company.industry").isIn([
      "IT Services",
      "Product",
      "Consulting",
      "Finance",
      "Healthcare",
      "Education",
      "Manufacturing",
      "Other",
    ]),
    body("hrDetails.name").notEmpty().trim(),
    body("hrDetails.designation").notEmpty().trim(),
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

      const updateData = req.body;

      const recruiter = await Recruiter.findOneAndUpdate(
        { user: req.user._id },
        updateData,
        { new: true, runValidators: true },
      );

      if (!recruiter) {
        return res.status(404).json({
          success: false,
          message: "Recruiter profile not found",
        });
      }

      res.json({
        success: true,
        message: "Recruiter profile updated successfully",
        data: recruiter,
      });
    } catch (error) {
      console.error("Update recruiter profile error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update recruiter profile",
      });
    }
  },
);

// Create new job posting
router.post(
  "/placements",
  requireSubscription("Basic"),
  [
    body("job.title").notEmpty().trim(),
    body("job.description").notEmpty().trim(),
    body("job.type").isIn(["Full Time", "Internship", "Apprenticeship"]),
    body("requirements.minCGPA").isFloat({ min: 0, max: 10 }),
    body("compensation.salary.min").isFloat({ min: 0 }),
    body("compensation.salary.max").isFloat({ min: 0 }),
    body("process.startDate").isISO8601().toDate(),
    body("process.registrationDeadline").isISO8601().toDate(),
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

      const recruiter = await Recruiter.findOne({ user: req.user._id });

      if (!recruiter) {
        return res.status(404).json({
          success: false,
          message: "Recruiter profile not found",
        });
      }

      // Validate that deadline is in the future
      const requestDeadline = new Date(req.body.process?.registrationDeadline);
      if (requestDeadline <= new Date()) {
        return res.status(400).json({
          success: false,
          message: "Registration deadline must be in the future",
        });
      }

      // Check subscription credits
      if (recruiter.subscription.remainingCredits <= 0) {
        return res.status(403).json({
          success: false,
          message: "Insufficient credits. Please upgrade your subscription.",
        });
      }

      const placementData = {
        ...req.body,
        company: recruiter._id,
        status: "Open",
      };

      const placement = new Placement(placementData);
      await placement.save();

      // Update recruiter statistics and deduct credits
      recruiter.statistics.totalJobsPosted += 1;
      recruiter.subscription.remainingCredits -= 1;
      await recruiter.save();

      res.status(201).json({
        success: true,
        message: "Job posted successfully",
        data: placement,
      });
    } catch (error) {
      console.error("Create placement error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create job posting",
        error: process.env.NODE_ENV === "development" ? error.message : {},
      });
    }
  },
);

// Get recruiter's job postings
router.get("/placements", async (req, res) => {
  try {
    const recruiter = await Recruiter.findOne({ user: req.user._id });

    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: "Recruiter profile not found",
      });
    }

    const { page = 1, limit = 20, status } = req.query;
    const filter = { company: recruiter._id };

    if (status) {
      filter.status = status;
    }

    const placements = await Placement.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Placement.countDocuments(filter);

    res.json({
      success: true,
      data: {
        placements,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
        },
      },
    });
  } catch (error) {
    console.error("Get placements error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get job postings",
    });
  }
});

// Get applications for a specific job
router.get("/placements/:placementId/applications", async (req, res) => {
  try {
    const { placementId } = req.params;
    const recruiter = await Recruiter.findOne({ user: req.user._id });

    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: "Recruiter profile not found",
      });
    }

    const placement = await Placement.findOne({
      _id: placementId,
      company: recruiter._id,
    }).populate({
      path: "applications.student",
      populate: [
        { path: "user", select: "profile.firstName profile.lastName email" },
        { path: "college", select: "name code" },
      ],
    });

    if (!placement) {
      return res.status(404).json({
        success: false,
        message: "Job posting not found",
      });
    }

    res.json({
      success: true,
      data: {
        placement: {
          id: placement._id,
          title: placement.job.title,
          totalApplications: placement.applications.length,
        },
        applications: placement.applications,
      },
    });
  } catch (error) {
    console.error("Get applications error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get applications",
    });
  }
});

// Update application status
router.put(
  "/placements/:placementId/applications/:applicationId",
  [
    body("status").isIn([
      "Screened",
      "Shortlisted",
      "Rejected",
      "Selected",
      "On Hold",
    ]),
    body("round").optional().isInt({ min: 1 }),
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

      const { placementId, applicationId } = req.params;
      const { status, round, feedback, score } = req.body;

      const recruiter = await Recruiter.findOne({ user: req.user._id });

      if (!recruiter) {
        return res.status(404).json({
          success: false,
          message: "Recruiter profile not found",
        });
      }

      const placement = await Placement.findOne({
        _id: placementId,
        company: recruiter._id,
      });

      if (!placement) {
        return res.status(404).json({
          success: false,
          message: "Job posting not found",
        });
      }

      const application = placement.applications.id(applicationId);
      if (!application) {
        return res.status(404).json({
          success: false,
          message: "Application not found",
        });
      }

      // Update application status
      application.status = status;

      if (round && feedback) {
        const roundData = {
          roundNumber: round,
          roundName: `Round ${round}`,
          status: feedback.includes("Passed")
            ? "Passed"
            : feedback.includes("Failed")
              ? "Failed"
              : "Completed",
          score: score,
          feedback: feedback,
          date: new Date(),
        };

        if (!application.roundsCompleted) {
          application.roundsCompleted = [];
        }
        application.roundsCompleted.push(roundData);
        application.currentRound = round + 1;
      }

      // Update final status if selected or rejected
      if (status === "Selected") {
        application.finalStatus = "Selected";
        recruiter.statistics.totalHires += 1;
      } else if (status === "Rejected") {
        application.finalStatus = "Rejected";
      }

      await placement.save();
      await recruiter.save();

      res.json({
        success: true,
        message: "Application status updated successfully",
        data: application,
      });
    } catch (error) {
      console.error("Update application status error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update application status",
      });
    }
  },
);

// Get recruiter statistics
router.get("/statistics", async (req, res) => {
  try {
    const recruiter = await Recruiter.findOne({ user: req.user._id });

    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: "Recruiter profile not found",
      });
    }

    const placements = await Placement.find({ company: recruiter._id });

    let totalApplications = 0;
    let totalInterviews = 0;
    const companyStats = {};

    placements.forEach((placement) => {
      totalApplications += placement.applications.length;

      placement.applications.forEach((app) => {
        if (app.status === "Shortlisted" || app.status === "Selected") {
          totalInterviews++;
        }
      });
    });

    // Update recruiter statistics
    recruiter.statistics.totalApplications = totalApplications;
    recruiter.statistics.totalInterviews = totalInterviews;
    recruiter.statistics.successRate =
      totalInterviews > 0
        ? (recruiter.statistics.totalHires / totalInterviews) * 100
        : 0;

    await recruiter.save();

    res.json({
      success: true,
      data: {
        ...recruiter.statistics,
        activeJobs: placements.filter((p) => p.status === "Open").length,
        closedJobs: placements.filter((p) => p.status === "Closed").length,
        subscriptionCredits: recruiter.subscription.remainingCredits,
      },
    });
  } catch (error) {
    console.error("Get recruiter statistics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get recruiter statistics",
    });
  }
});

// Search for students
router.get("/search-students", async (req, res) => {
  try {
    const {
      skills,
      minCGPA,
      maxBacklogs,
      department,
      year,
      college,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};

    if (minCGPA) {
      filter["academicInfo.cgpa"] = { $gte: parseFloat(minCGPA) };
    }

    if (maxBacklogs) {
      filter["academicInfo.backlogCount"] = { $lte: parseInt(maxBacklogs) };
    }

    if (department) {
      filter["academicInfo.department"] = department;
    }

    if (year) {
      filter["academicInfo.year"] = parseInt(year);
    }

    if (college) {
      filter["college"] = college;
    }

    if (skills) {
      const skillArray = skills.split(",").map((s) => s.trim());
      filter["skills.name"] = { $in: skillArray };
    }

    const students = await Student.find(filter)
      .populate("user", "profile.firstName profile.lastName email")
      .populate("college", "name code")
      .sort({ "academicInfo.cgpa": -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Student.countDocuments(filter);

    res.json({
      success: true,
      data: {
        students,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
        },
      },
    });
  } catch (error) {
    console.error("Search students error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search students",
    });
  }
});

// Update preferences
router.put(
  "/preferences",
  [
    body("cgpaCutoff").isFloat({ min: 0, max: 10 }),
    body("maxBacklogs").isInt({ min: 0 }),
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

      const preferences = req.body;

      const recruiter = await Recruiter.findOneAndUpdate(
        { user: req.user._id },
        { $set: { preferences } },
        { new: true, runValidators: true },
      );

      if (!recruiter) {
        return res.status(404).json({
          success: false,
          message: "Recruiter profile not found",
        });
      }

      res.json({
        success: true,
        message: "Preferences updated successfully",
        data: recruiter.preferences,
      });
    } catch (error) {
      console.error("Update preferences error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update preferences",
      });
    }
  },
);

module.exports = router;
