const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const { body, validationResult } = require("express-validator");
const EmailService = require("../services/emailService");
const Student = require("../models/Student");
const Placement = require("../models/Placement");
const User = require("../models/User");

const router = express.Router();

// All routes require authentication
router.use(protect);

// Send placement notification to a single student
router.post(
  "/send-placement-notification",
  authorize("college", "recruiter"),
  [
    body("studentId").isMongoId(),
    body("placementId").isMongoId(),
    body("matchScore").isInt({ min: 0, max: 100 }),
    body("reasons").isArray(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { studentId, placementId, matchScore, reasons } = req.body;

      const student = await Student.findById(studentId).populate("user");
      const placement = await Placement.findById(placementId);

      if (!student || !placement) {
        return res.status(404).json({
          success: false,
          message: "Student or Placement not found",
        });
      }

      const result = await EmailService.sendPlacementNotification(
        student,
        placement,
        matchScore,
        reasons,
      );

      res.json({
        success: true,
        message: "Placement notification sent successfully",
        data: result,
      });
    } catch (error) {
      console.error("Notification error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to send notification",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },
);

// Send batch notifications to shortlisted students
router.post(
  "/send-batch-notifications",
  authorize("college", "recruiter"),
  [
    body("placementId").isMongoId(),
    body("studentIds").isArray(),
    body("subject").notEmpty().trim(),
    body("templateType").isIn([
      "placement",
      "interview",
      "skillGap",
      "careerPrediction",
      "preparationResources",
    ]),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { placementId, studentIds, subject, templateType, templateData } =
        req.body;

      const students = await Student.find({
        _id: { $in: studentIds },
      }).populate("user");

      if (students.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No students found",
        });
      }

      const recipients = students.map((student) => ({
        email: student.user.email,
        name: `${student.user.firstName} ${student.user.lastName}`,
      }));

      const result = await EmailService.sendBatchEmails(
        recipients,
        subject,
        templateType,
        templateData || {},
      );

      res.json({
        success: true,
        message: "Batch notifications sent successfully",
        data: result,
      });
    } catch (error) {
      console.error("Batch notification error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to send batch notifications",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },
);

// Send interview notification
router.post(
  "/send-interview-notification",
  authorize("college", "recruiter"),
  [
    body("studentId").isMongoId(),
    body("placementId").isMongoId(),
    body("round").notEmpty().trim(),
    body("dateTime").notEmpty().trim(),
    body("location").notEmpty().trim(),
    body("joinLink").optional().isURL(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { studentId, placementId, round, dateTime, location, joinLink } =
        req.body;

      const student = await Student.findById(studentId).populate("user");
      const placement = await Placement.findById(placementId);

      if (!student || !placement) {
        return res.status(404).json({
          success: false,
          message: "Student or Placement not found",
        });
      }

      const interviewDetails = {
        round,
        dateTime,
        location,
        joinLink: joinLink || "#",
      };

      const result = await EmailService.sendInterviewNotification(
        student,
        placement,
        interviewDetails,
      );

      res.json({
        success: true,
        message: "Interview notification sent successfully",
        data: result,
      });
    } catch (error) {
      console.error("Interview notification error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to send interview notification",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },
);

// Send verification notification
router.post(
  "/send-verification-notification",
  authorize("college"),
  [
    body("studentId").isMongoId(),
    body("cgpa").isFloat({ min: 0, max: 10 }),
    body("department").notEmpty().trim(),
    body("attendance").isInt({ min: 0, max: 100 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { studentId, cgpa, department, attendance } = req.body;

      const student = await Student.findById(studentId).populate("user");

      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student not found",
        });
      }

      const verificationData = { cgpa, department, attendance };

      const result = await EmailService.sendVerificationNotification(
        student,
        verificationData,
      );

      res.json({
        success: true,
        message: "Verification notification sent successfully",
        data: result,
      });
    } catch (error) {
      console.error("Verification notification error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to send verification notification",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },
);

// Send skill gap analysis report
router.post(
  "/send-skill-gap-report",
  authorize("college"),
  [
    body("studentId").isMongoId(),
    body("weaknesses").isArray(),
    body("recommendations").isArray(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { studentId, weaknesses, recommendations } = req.body;

      const student = await Student.findById(studentId).populate("user");

      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student not found",
        });
      }

      const analysis = { weaknesses, recommendations };

      const result = await EmailService.sendSkillGapReport(student, analysis);

      res.json({
        success: true,
        message: "Skill gap report sent successfully",
        data: result,
      });
    } catch (error) {
      console.error("Skill gap report error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to send skill gap report",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },
);

// Send career prediction report
router.post(
  "/send-career-prediction",
  authorize("college"),
  [
    body("studentId").isMongoId(),
    body("placementProbability").isInt({ min: 0, max: 100 }),
    body("preferredCompanyTypes").isArray(),
    body("expectedPackageMin").isInt({ min: 0 }),
    body("expectedPackageMax").isInt({ min: 0 }),
    body("improvementSuggestions").isArray(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const {
        studentId,
        placementProbability,
        preferredCompanyTypes,
        expectedPackageMin,
        expectedPackageMax,
        improvementSuggestions,
      } = req.body;

      const student = await Student.findById(studentId).populate("user");

      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student not found",
        });
      }

      const prediction = {
        placementProbability,
        preferredCompanyTypes,
        expectedPackageMin,
        expectedPackageMax,
        improvementSuggestions,
      };

      const result = await EmailService.sendCareerPredictionReport(
        student,
        prediction,
      );

      res.json({
        success: true,
        message: "Career prediction report sent successfully",
        data: result,
      });
    } catch (error) {
      console.error("Career prediction error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to send career prediction report",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },
);

// Send custom email
router.post(
  "/send-custom-email",
  authorize("college", "recruiter"),
  [
    body("studentIds").isArray(),
    body("subject").notEmpty().trim(),
    body("htmlContent").notEmpty(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { studentIds, subject, htmlContent } = req.body;

      const students = await Student.find({
        _id: { $in: studentIds },
      }).populate("user");

      if (students.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No students found",
        });
      }

      const results = [];
      for (const student of students) {
        try {
          const result = await EmailService.sendEmail(
            student.user.email,
            subject,
            htmlContent,
          );
          results.push({
            email: student.user.email,
            status: "sent",
            messageId: result.messageId,
          });
        } catch (error) {
          results.push({
            email: student.user.email,
            status: "failed",
            error: error.message,
          });
        }
      }

      res.json({
        success: true,
        message: "Custom emails sent",
        data: {
          totalSent: results.filter((r) => r.status === "sent").length,
          totalFailed: results.filter((r) => r.status === "failed").length,
          results,
        },
      });
    } catch (error) {
      console.error("Custom email error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to send custom email",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },
);

module.exports = router;
