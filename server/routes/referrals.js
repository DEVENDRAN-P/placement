const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const { body, validationResult } = require("express-validator");
const Student = require("../models/Student");
const User = require("../models/User");

const router = express.Router();

// All routes require authentication
router.use(protect);

// Generate referral code for current user
router.post("/generate-code", authorize("student"), async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    // Generate a unique referral code if not exists
    if (!student.referralCode) {
      const user = await User.findById(req.user._id);
      const referralCode = `REF${user.email.split("@")[0].substring(0, 4).toUpperCase()}${Date.now().toString().slice(-6)}`;
      student.referralCode = referralCode;
      await student.save();
    }

    res.json({
      success: true,
      data: {
        referralCode: student.referralCode,
        referralLink: `https://careerportal.com/register?ref=${student.referralCode}`,
      },
    });
  } catch (error) {
    console.error("Generate referral code error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate referral code",
    });
  }
});

// Verify and apply referral code
router.post(
  "/apply",
  authorize("student"),
  [
    body("referralCode").notEmpty().trim(),
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

      const { referralCode } = req.body;

      // Find the referrer
      const referrerStudent = await Student.findOne({ referralCode: referralCode.toUpperCase() })
        .populate("user", "profile.firstName profile.lastName email");

      if (!referrerStudent) {
        return res.status(400).json({
          success: false,
          message: "Invalid referral code",
        });
      }

      // Get current student
      const currentStudent = await Student.findOne({ user: req.user._id });

      if (!currentStudent) {
        return res.status(404).json({
          success: false,
          message: "Student profile not found",
        });
      }

      // Check if already referred
      if (currentStudent.referredBy) {
        return res.status(400).json({
          success: false,
          message: "You have already used a referral code",
        });
      }

      // Prevent self-referral
      if (currentStudent._id.toString() === referrerStudent._id.toString()) {
        return res.status(400).json({
          success: false,
          message: "You cannot refer yourself",
        });
      }

      // Apply referral
      currentStudent.referredBy = referrerStudent._id;
      currentStudent.referralAppliedAt = new Date();
      await currentStudent.save();

      // Update referrer's stats (if they exist)
      referrerStudent.referralCount = (referrerStudent.referralCount || 0) + 1;
      referrerStudent.referralRewards = (referrerStudent.referralRewards || 0) + 1;
      await referrerStudent.save();

      res.json({
        success: true,
        message: "Referral code applied successfully",
        data: {
          referredBy: referrerStudent.user.profile.firstName + " " + referrerStudent.user.profile.lastName,
        },
      });
    } catch (error) {
      console.error("Apply referral code error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to apply referral code",
      });
    }
  }
);

// Get referral status and stats
router.get("/status", authorize("student"), async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id })
      .populate("referredBy", "user.profile.firstName user.profile.lastName user.email");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    // Get referrals made by this student
    const referrals = await Student.find({ referredBy: student._id })
      .populate("user", "profile.firstName profile.lastName email")
      .select("createdAt");

    res.json({
      success: true,
      data: {
        referralCode: student.referralCode || null,
        referralCount: referrals.length,
        referralRewards: student.referralRewards || 0,
        referredBy: student.referredBy
          ? {
              name: student.referredBy.user.profile.firstName + " " + student.referredBy.user.profile.lastName,
              email: student.referredBy.user.email,
              date: student.referralAppliedAt,
            }
          : null,
        referrals: referrals.map((ref) => ({
          name: ref.user.profile.firstName + " " + ref.user.profile.lastName,
          email: ref.user.email,
          date: ref.createdAt,
        })),
        rewardsAvailable: [
          { tier: "Bronze (5 referrals)", rewards: "Resume Review" },
          { tier: "Silver (10 referrals)", rewards: "Mock Interview Session" },
          { tier: "Gold (25 referrals)", rewards: "Premium Career Coaching" },
        ],
      },
    });
  } catch (error) {
    console.error("Get referral status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get referral status",
    });
  }
});

module.exports = router;