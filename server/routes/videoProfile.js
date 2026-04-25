const express = require("express");
const multer = require("multer");
const path = require("path");
const { protect, authorize } = require("../middleware/auth");
const { body, validationResult } = require("express-validator");
const Student = require("../models/Student");
const College = require("../models/College");
const fs = require("fs");

const router = express.Router();

// Configure multer for video uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "uploads/videos/";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `video-${Date.now()}-${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for videos
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = [".mp4", ".webm", ".mov", ".avi"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only video files (MP4, WebM, MOV, AVI) are allowed"));
    }
  },
});

// All routes require authentication
router.use(protect);

// Upload video introduction (students)
router.post(
  "/upload-introduction",
  authorize("student"),
  upload.single("video"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No video file uploaded",
        });
      }

      const student = await Student.findOne({ user: req.user._id });

      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student profile not found",
        });
      }

      // Remove old video if exists
      if (student.videoProfile?.videoUrl) {
        const oldPath = path.join(__dirname, "..", student.videoProfile.videoUrl);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      student.videoProfile = {
        videoUrl: `/uploads/videos/${req.file.filename}`,
        uploadedAt: new Date(),
        duration: req.body.duration ? parseInt(req.body.duration) : null,
        status: "pending",
      };

      await student.save();

      res.json({
        success: true,
        message: "Video introduction uploaded successfully",
        data: {
          videoUrl: student.videoProfile.videoUrl,
          uploadedAt: student.videoProfile.uploadedAt,
        },
      });
    } catch (error) {
      console.error("Upload video error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to upload video",
      });
    }
  }
);

// Get video profile status
router.get("/video-status", authorize("student"), async (req, res) => {
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
        hasVideo: !!student.videoProfile?.videoUrl,
        videoUrl: student.videoProfile?.videoUrl || null,
        uploadedAt: student.videoProfile?.uploadedAt || null,
        status: student.videoProfile?.status || "not_uploaded",
      },
    });
  } catch (error) {
    console.error("Get video status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get video status",
    });
  }
});

// Delete video profile
router.delete("/delete-introduction", authorize("student"), async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    if (student.videoProfile?.videoUrl) {
      const videoPath = path.join(__dirname, "..", student.videoProfile.videoUrl);
      if (fs.existsSync(videoPath)) {
        fs.unlinkSync(videoPath);
      }

      student.videoProfile = undefined;
      await student.save();
    }

    res.json({
      success: true,
      message: "Video introduction deleted successfully",
    });
  } catch (error) {
    console.error("Delete video error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete video",
    });
  }
});

// Generate blockchain credential (placeholder - for future implementation)
router.post(
  "/generate-credential",
  authorize("student"),
  [
    body("credentialType").isIn(["degree", "certificate", "skill_badge"]),
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

      const { credentialType } = req.body;
      const student = await Student.findOne({ user: req.user._id }).populate("college", "name code");

      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student profile not found",
        });
      }

      // Generate a placeholder credential ID
      // In production, this would integrate with a blockchain service like Ethereum/Hyperledger
      const credentialId = `CRED-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      // Initialize credentials array if not exists
      if (!student.blockchainCredentials) {
        student.blockchainCredentials = [];
      }

      student.blockchainCredentials.push({
        credentialId,
        credentialType,
        issuedAt: new Date(),
        status: "issued",
        verificationHash: `0x${Buffer.from(JSON.stringify({
          student: student._id,
          college: student.college?._id,
          type: credentialType,
          timestamp: Date.now()
        })).toString("hex").substring(0, 64)}`,
      });

      await student.save();

      res.json({
        success: true,
        message: "Blockchain credential generated (demo mode)",
        data: {
          credentialId,
          credentialType,
          issuedAt: new Date(),
          status: "issued",
          verificationUrl: `https://careerportal.com/verify/${credentialId}`,
          note: "This is a demo credential. Full blockchain implementation coming soon.",
        },
      });
    } catch (error) {
      console.error("Generate credential error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to generate credential",
      });
    }
  }
);

// Verify a credential
router.get("/verify-credential/:credentialId", async (req, res) => {
  try {
    const { credentialId } = req.params;

    const student = await Student.findOne({
      "blockchainCredentials.credentialId": credentialId,
    }).populate("college", "name code");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Credential not found",
      });
    }

    const credential = student.blockchainCredentials.find(
      (c) => c.credentialId === credentialId
    );

    res.json({
      success: true,
      data: {
        credentialId: credential.credentialId,
        credentialType: credential.credentialType,
        studentName: `${student.user?.profile?.firstName || "Student"} ${student.user?.profile?.lastName || ""}`,
        college: student.college?.name,
        issuedAt: credential.issuedAt,
        status: credential.status,
        verificationHash: credential.verificationHash,
      },
    });
  } catch (error) {
    console.error("Verify credential error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify credential",
    });
  }
});

// Get student's credentials
router.get("/my-credentials", authorize("student"), async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });

    if (!student || !student.blockchainCredentials) {
      return res.json({
        success: true,
        data: [],
      });
    }

    res.json({
      success: true,
      data: student.blockchainCredentials.sort(
        (a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime()
      ),
    });
  } catch (error) {
    console.error("Get credentials error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get credentials",
    });
  }
});

// College verifies student credential
router.post(
  "/verify-student-credential/:studentId",
  authorize("college"),
  [body("credentialId").notEmpty()],
  async (req, res) => {
    try {
      const { studentId } = req.params;
      const { credentialId } = req.body;

      const college = await College.findOne({ user: req.user._id });
      const student = await Student.findOne({
        _id: studentId,
        college: college._id,
      });

      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student not found in your college",
        });
      }

      const credential = student.blockchainCredentials?.find(
        (c) => c.credentialId === credentialId
      );

      if (!credential) {
        return res.status(404).json({
          success: false,
          message: "Credential not found",
        });
      }

      // Verify the credential
      credential.status = "verified";
      credential.verifiedBy = college._id;
      credential.verifiedAt = new Date();

      await student.save();

      res.json({
        success: true,
        message: "Credential verified successfully",
        data: credential,
      });
    } catch (error) {
      console.error("Verify student credential error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to verify credential",
      });
    }
  }
);

module.exports = router;