const express = require("express");
const { body, validationResult } = require("express-validator");
const Placement = require("../models/Placement");
const Student = require("../models/Student");
const User = require("../models/User");
const { protect, authorize } = require("../middleware/auth");
const {
  filterValidationRules,
  shortlistValidationRules,
  sendUpdateValidationRules,
  updateStatusValidationRules,
  exportValidationRules,
  handleValidationErrors,
} = require("../middleware/validation");
const { json2csv } = require("json2csv"); // Added for CSV export

const {
  publicApiLimiter,
  sensitiveActionLimiter,
} = require("../middleware/rateLimit");

const {
  getPaginationParams,
  buildPaginatedResponse,
} = require("../utils/pagination");

const router = express.Router();

// Get all active placements (public)
router.get("/active", publicApiLimiter, async (req, res) => {
  try {
    let { page = 1, limit = 20, department, location, type } = req.query;

    // Validate and constrain limit
    limit = Math.min(parseInt(limit) || 20, 100);
    page = Math.max(parseInt(page) || 1, 1);

    const filter = {
      status: "Open",
      "process.registrationDeadline": { $gt: new Date() },
    };

    if (department) {
      filter["eligibility.allowedDepartments"] = department;
    }

    if (location) {
      filter["job.location"] = { $in: [location] };
    }

    if (type) {
      filter["job.type"] = type;
    }

    const placements = await Placement.find(filter)
      .populate("company", "company.name company.industry company.size")
      .sort({ "process.registrationDeadline": 1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Placement.countDocuments(filter);

    res.json({
      success: true,
      data: {
        placements,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
        },
      },
    });
  } catch (error) {
    console.error("Get active placements error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get active placements",
    });
  }
});

// Get placement details
router.get("/:placementId", publicApiLimiter, async (req, res) => {
  try {
    const placement = await Placement.findById(req.params.placementId)
      .populate(
        "company",
        "company.name company.industry company.size company.website",
      )
      .populate("college", "name code address");

    if (!placement) {
      return res.status(404).json({
        success: false,
        message: "Placement not found",
      });
    }

    // Increment view count
    placement.statistics.totalViews += 1;
    await placement.save();

    res.json({
      success: true,
      data: placement,
    });
  } catch (error) {
    console.error("Get placement error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get placement details",
    });
  }
});

// Apply for placement (students only)
router.post(
  "/:placementId/apply",
  protect,
  authorize("student"),
  async (req, res) => {
    try {
      const { placementId } = req.params;
      const student = await Student.findOne({ user: req.user._id });

      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student profile not found",
        });
      }

      const placement = await Placement.findById(placementId);

      if (!placement) {
        return res.status(404).json({
          success: false,
          message: "Placement not found",
        });
      }

      // Check if placement is still open
      if (
        placement.status !== "Open" ||
        placement.process.registrationDeadline < new Date()
      ) {
        return res.status(400).json({
          success: false,
          message: "Applications are closed for this placement",
        });
      }

      // Check if student has already applied
      const existingApplication = placement.applications.find(
        (app) => app.student.toString() === student._id.toString(),
      );

      if (existingApplication) {
        return res.status(400).json({
          success: false,
          message: "You have already applied for this placement",
        });
      }

      // Check eligibility
      if (student.academicInfo.cgpa < placement.requirements.minCGPA) {
        return res.status(400).json({
          success: false,
          message: `Minimum CGPA requirement is ${placement.requirements.minCGPA}`,
        });
      }

      if (
        student.academicInfo.backlogCount > placement.requirements.maxBacklogs
      ) {
        return res.status(400).json({
          success: false,
          message: `Maximum backlogs allowed is ${placement.requirements.maxBacklogs}`,
        });
      }

      // Check department eligibility
      if (
        placement.eligibility.allowedDepartments.length > 0 &&
        !placement.eligibility.allowedDepartments.includes(
          student.academicInfo.department,
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Your department is not eligible for this placement",
        });
      }

      // Create application
      const application = {
        student: student._id,
        applicationDate: new Date(),
        status: "Applied",
      };

      placement.applications.push(application);
      placement.statistics.totalApplications += 1;

      await placement.save();

      res.status(201).json({
        success: true,
        message: "Application submitted successfully",
        data: {
          applicationId: application._id,
          status: application.status,
          appliedDate: application.applicationDate,
        },
      });
    } catch (error) {
      console.error("Apply for placement error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to submit application",
        error: process.env.NODE_ENV === "development" ? error.message : {},
      });
    }
  },
);

// Get student's applications
router.get(
  "/my-applications",
  protect,
  authorize("student"),
  async (req, res) => {
    try {
      const student = await Student.findOne({ user: req.user._id });

      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student profile not found",
        });
      }

      const placements = await Placement.find({
        "applications.student": student._id,
      })
        .populate("company", "company.name company.industry")
        .populate("college", "name code");

      const applications = placements.map((placement) => {
        const application = placement.applications.find(
          (app) => app.student.toString() === student._id.toString(),
        );

        return {
          placement: {
            id: placement._id,
            title: placement.job.title,
            company: placement.company.company.name,
            industry: placement.company.company.industry,
            type: placement.job.type,
            location: placement.job.location,
            salary: placement.compensation.salary,
            deadline: placement.process.registrationDeadline,
          },
          application: {
            id: application._id,
            status: application.status,
            currentRound: application.currentRound,
            finalStatus: application.finalStatus,
            applicationDate: application.applicationDate,
            roundsCompleted: application.roundsCompleted,
            offerDetails: application.offerDetails,
          },
        };
      });

      res.json({
        success: true,
        data: {
          applications,
          total: applications.length,
        },
      });
    } catch (error) {
      console.error("Get student applications error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get applications",
      });
    }
  },
);

// Withdraw application
router.post(
  "/:placementId/withdraw",
  protect,
  authorize("student"),
  async (req, res) => {
    try {
      const { placementId } = req.params;
      const student = await Student.findOne({ user: req.user._id });

      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student profile not found",
        });
      }

      const placement = await Placement.findById(placementId);

      if (!placement) {
        return res.status(404).json({
          success: false,
          message: "Placement not found",
        });
      }

      const applicationIndex = placement.applications.findIndex(
        (app) => app.student.toString() === student._id.toString(),
      );

      if (applicationIndex === -1) {
        return res.status(404).json({
          success: false,
          message: "Application not found",
        });
      }

      // Check if application can be withdrawn
      const application = placement.applications[applicationIndex];
      if (
        application.status === "Selected" ||
        application.status === "Rejected"
      ) {
        return res.status(400).json({
          success: false,
          message: "Cannot withdraw application after final decision",
        });
      }

      // Update application status
      application.status = "Withdrawn";
      await placement.save();

      res.json({
        success: true,
        message: "Application withdrawn successfully",
      });
    } catch (error) {
      console.error("Withdraw application error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to withdraw application",
      });
    }
  },
);

// Get placement statistics (public)
router.get("/:placementId/statistics", async (req, res) => {
  try {
    const placement = await Placement.findById(req.params.placementId).populate(
      "company",
      "company.name",
    );

    if (!placement) {
      return res.status(404).json({
        success: false,
        message: "Placement not found",
      });
    }

    // Calculate statistics
    const stats = placement.applicationStats;

    res.json({
      success: true,
      data: {
        company: placement.company.company.name,
        title: placement.job.title,
        totalApplications: stats.total,
        applied: stats.applied,
        shortlisted: stats.shortlisted,
        selected: stats.selected,
        selectionRate: stats.selectionRate,
        views: placement.statistics.totalViews,
        registrationDeadline: placement.process.registrationDeadline,
      },
    });
  } catch (error) {
    console.error("Get placement statistics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get placement statistics",
    });
  }
});

// Get placement trends (for colleges and recruiters)
router.get(
  "/trends/overview",
  protect,
  authorize("college", "recruiter"),
  async (req, res) => {
    try {
      const { period = "monthly", months = 6 } = req.query;

      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - parseInt(months));

      const placements = await Placement.find({
        createdAt: { $gte: startDate, $lte: endDate },
      }).populate("company", "company.name company.industry");

      // Aggregate trends
      const trends = {
        totalPlacements: placements.length,
        byIndustry: {},
        byType: {},
        byMonth: {},
        averageSalaryRange: {
          min: 0,
          max: 0,
        },
      };

      placements.forEach((placement) => {
        // By industry
        const industry = placement.company.company.industry;
        trends.byIndustry[industry] = (trends.byIndustry[industry] || 0) + 1;

        // By type
        const type = placement.job.type;
        trends.byType[type] = (trends.byType[type] || 0) + 1;

        // By month
        const month = placement.createdAt.toISOString().slice(0, 7);
        trends.byMonth[month] = (trends.byMonth[month] || 0) + 1;

        // Salary range
        trends.averageSalaryRange.min += placement.compensation.salary.min;
        trends.averageSalaryRange.max += placement.compensation.salary.max;
      });

      // Calculate averages
      if (placements.length > 0) {
        trends.averageSalaryRange.min = Math.round(
          trends.averageSalaryRange.min / placements.length,
        );
        trends.averageSalaryRange.max = Math.round(
          trends.averageSalaryRange.max / placements.length,
        );
      }

      res.json({
        success: true,
        data: trends,
      });
    } catch (error) {
      console.error("Get placement trends error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get placement trends",
      });
    }
  },
);

// ============================================
// COLLEGE PLACEMENT MANAGEMENT ENDPOINTS
// ============================================

// const emailQueue = require("../services/emailQueue"); // Disabled - no Redis

// Get public student profile via shareable link
router.get(
  "/students/public/shared/:token",
  publicApiLimiter,
  async (req, res) => {
    try {
      const { token } = req.params;

      const student = await Student.findOne({
        "publicProfileToken.token": token,
        "publicProfileToken.expires": { $gt: Date.now() },
      })
        .select("-__v -resume.fileUrl -aiInsights -publicProfileToken")
        .lean({ virtuals: true });

      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Profile link is invalid or has expired.",
        });
      }

      // Get user info
      const user = await User.findById(student.user).select("email");

      res.json({
        success: true,
        data: {
          ...student,
          user: { email: user?.email },
        },
      });
    } catch (error) {
      console.error("Get shared public profile error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch profile",
        error: process.env.NODE_ENV === "development" ? error.message : {},
      });
    }
  },
);

// Filter students by criteria
router.post(
  "/filter",
  protect,
  authorize("college"),
  sensitiveActionLimiter,
  filterValidationRules(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { page, limit, skip } = getPaginationParams(req.query);
      const {
        minCGPA = 0,
        maxCGPA = 10,
        department,
        year,
        minLeetcode = 0,
        minCodechef = 0,
        minCodeforces = 0,
        skills = [],
        placementStatus,
        searchQuery,
      } = req.body;

      let query = { college: req.user._id || req.user.id };

      // CGPA filter
      if (minCGPA || maxCGPA) {
        query["academicInfo.cgpa"] = {
          $gte: minCGPA,
          $lte: maxCGPA,
        };
      }

      // Department filter
      if (department) {
        query["academicInfo.department"] = department;
      }

      // Year filter
      if (year) {
        query["academicInfo.year"] = year;
      }

      // Coding rating filters
      const codingFilters = [];
      if (minLeetcode > 0) {
        codingFilters.push({
          "codingProfiles.leetcode.rating": { $gte: minLeetcode },
        });
      }
      if (minCodechef > 0) {
        codingFilters.push({
          "codingProfiles.codechef.rating": { $gte: minCodechef },
        });
      }
      if (minCodeforces > 0) {
        codingFilters.push({
          "codingProfiles.codeforces.rating": { $gte: minCodeforces },
        });
      }
      if (codingFilters.length > 0) {
        query.$and = (query.$and || []).concat(codingFilters);
      }

      // Placement status filter
      if (placementStatus && placementStatus !== "Any") {
        query["placementStatus.isPlaced"] = placementStatus === "Placed";
      }

      // Skills filter
      if (skills.length > 0) {
        query["skills.name"] = { $in: skills };
      }

      // Search query
      if (searchQuery) {
        const userIds = await User.find({
          email: { $regex: searchQuery, $options: "i" },
        }).select("_id");

        const userIdList = userIds.map((u) => u._id);

        const searchOr = [
          { user: { $in: userIdList } },
          { "profile.firstName": { $regex: searchQuery, $options: "i" } },
          { "profile.lastName": { $regex: searchQuery, $options: "i" } },
        ];

        if (query.$or) {
          query.$and = query.$and || [];
          query.$and.push({ $or: searchOr });
        } else {
          query.$or = searchOr;
        }
      }

      const total = await Student.countDocuments(query);
      const students = await Student.find(query)
        .populate("user", "email")
        .select("-__v")
        .skip(skip)
        .limit(limit)
        .lean({ virtuals: true });

      res.json({
        success: true,
        ...buildPaginatedResponse(students, total, page, limit),
      });
    } catch (error) {
      console.error("Filter students error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to filter students",
        error: process.env.NODE_ENV === "development" ? error.message : {},
      });
    }
  },
);

// AI Shortlisting - Rank students
router.post(
  "/shortlist",
  protect,
  authorize("college"),
  sensitiveActionLimiter,
  shortlistValidationRules(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { students: studentData = [], jobRequirements = {} } = req.body;

      // The student data is now passed in the body, already validated.
      const students = studentData;

      // Calculate AI ranking score for each student
      const rankedStudents = students.map((student) => {
        let score = 0;
        const breakdown = {};

        // 40% - Coding Performance
        const maxCodingRating = Math.max(
          student.codingProfiles.leetcode?.rating || 0,
          student.codingProfiles.codechef?.rating || 0,
          student.codingProfiles.codeforces?.rating || 0,
        );
        const codingScore = Math.min(100, (maxCodingRating / 2500) * 100);
        breakdown.coding = codingScore * 0.4;
        score += breakdown.coding;

        // 30% - CGPA
        const cgpaScore = (student.academicInfo.cgpa / 10) * 100;
        breakdown.cgpa = cgpaScore * 0.3;
        score += breakdown.cgpa;

        // 20% - Skills Match
        let skillMatch = 0;
        if (
          jobRequirements.requiredSkills &&
          jobRequirements.requiredSkills.length > 0
        ) {
          const studentSkills = student.skills.map((s) => s.name.toLowerCase());
          const matchedSkills = jobRequirements.requiredSkills.filter((skill) =>
            studentSkills.includes(skill.toLowerCase()),
          ).length;
          skillMatch =
            (matchedSkills / jobRequirements.requiredSkills.length) * 100;
        } else {
          skillMatch = Math.min(100, (student.skills.length / 10) * 100);
        }
        breakdown.skills = skillMatch * 0.2;
        score += breakdown.skills;

        // 10% - Projects
        const projectScore = Math.min(100, (student.projects.length / 5) * 100);
        breakdown.projects = projectScore * 0.1;
        score += breakdown.projects;

        return {
          ...student,
          aiScore: Math.min(100, score),
          scoreBreakdown: breakdown,
        };
      });

      // Sort by score descending
      const sorted = rankedStudents.sort((a, b) => b.aiScore - a.aiScore);

      res.json({
        success: true,
        data: sorted,
        totalCandidates: sorted.length,
      });
    } catch (error) {
      console.error("AI shortlisting error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to perform AI shortlisting",
        error: process.env.NODE_ENV === "development" ? error.message : {},
      });
    }
  },
);

// Send placement update email
router.post(
  "/send-update",
  protect,
  authorize("college"),
  sensitiveActionLimiter,
  sendUpdateValidationRules(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { subject, message, studentIds = [] } = req.body;

      // const job = await emailQueue.add(
      //   { studentIds, subject, message },
      //   {
      //     attempts: 3, // Retry 3 times
      //     backoff: {
      //       type: "exponential",
      //       delay: 5000, // 5s, 10s, 20s
      //     },
      //     removeOnComplete: true,
      //     removeOnFail: 100, // Keep last 100 failed jobs
      //   },
      // );

      res.json({
        success: true,
        message: `Email job queued for ${studentIds.length} students. (Disabled - no Redis)`,
        data: {
          jobId: "disabled",
          timestamp: new Date(),
        },
      });
    } catch (error) {
      console.error("Queue email error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to queue emails",
        error: process.env.NODE_ENV === "development" ? error.message : {},
      });
    }
  },
);

// Bulk update placement status
router.post(
  "/update-status",
  protect,
  authorize("college"),
  updateStatusValidationRules(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const {
        studentIds = [],
        isPlaced,
        company,
        role,
        package: salary,
      } = req.body;

      const updateData = {
        "placementStatus.isPlaced": isPlaced,
      };

      if (company) updateData["placementStatus.company"] = company;
      if (role) updateData["placementStatus.role"] = role;
      if (salary) updateData["placementStatus.package"] = salary;
      if (isPlaced) updateData["placementStatus.offerDate"] = new Date();

      const result = await Student.updateMany(
        { _id: { $in: studentIds } },
        { $set: updateData },
      );

      res.json({
        success: true,
        message: `Updated placement status for ${result.modifiedCount} students`,
        data: {
          modifiedCount: result.modifiedCount,
        },
      });
    } catch (error) {
      console.error("Update status error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update placement status",
        error: process.env.NODE_ENV === "development" ? error.message : {},
      });
    }
  },
);

router.post(
  "/export",
  protect,
  authorize("college"),
  exportValidationRules(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { studentIds, format } = req.body;
      const students = await Student.find({ _id: { $in: studentIds } })
        .populate("user", "email")
        .lean();

      if (format === "csv") {
        const fields = [
          { label: "Name", value: "profile.firstName" },
          { label: "Email", value: "user.email" },
          { label: "CGPA", value: "academicInfo.cgpa" },
          { label: "Department", value: "academicInfo.department" },
          { label: "LeetCode", value: "codingProfiles.leetcode.rating" },
        ];
        const csv = json2csv.parse(students, { fields });
        res.header("Content-Type", "text/csv");
        res.attachment("student_export.csv");
        return res.send(csv);
      }

      // Default to JSON
      res.json({
        success: true,
        data: students,
      });
    } catch (error) {
      console.error("Export error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to export data",
        error: process.env.NODE_ENV === "development" ? error.message : {},
      });
    }
  },
);

module.exports = router;
