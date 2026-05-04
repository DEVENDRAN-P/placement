const express = require("express");
const multer = require("multer");
const path = require("path");
const { body, validationResult } = require("express-validator");
const Student = require("../models/Student");
const College = require("../models/College");
const { protect, authorize } = require("../middleware/auth");
const { fetchCodingStats } = require("../services/codingPlatforms");
const crypto = require("crypto");
const { analyzeResume } = require("../services/aiAnalysis");

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/resumes/");
  },
  filename: function (req, file, cb) {
    cb(null, `resume-${Date.now()}-${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = [".pdf", ".doc", ".docx"];
    const allowedMimeTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const ext = path.extname(file.originalname).toLowerCase();

    // Check both extension and MIME type
    if (
      allowedTypes.includes(ext) &&
      allowedMimeTypes.includes(file.mimetype)
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, DOC, and DOCX files are allowed"));
    }
  },
});

// All student routes require authentication and student role
router.use(protect);
router.use(authorize("student"));

// Create/Update student profile - Comprehensive endpoint
router.post("/profile", async (req, res) => {
  try {
    const {
      personal,
      academic,
      skills,
      projects,
      achievements,
      certificates,
      codingProfiles,
      resume,
      publicProfile,
      academicInfo,
      college,
    } = req.body;

    // Get or create student document
    let student = await Student.findOne({ user: req.user._id });

    const isNewStudent = !student;

    if (!student) {
      // Determine college ID
      let collegeId = college;

      // If academic data provided, extract college from it
      if (academic?.college && academic.college !== "") {
        collegeId = academic.college;
      }

      // If still no college, try to find one from the user
      if (!collegeId) {
        // Try to find any college (fallback for development)
        const anyCollege = await College.findOne();
        if (anyCollege) {
          collegeId = anyCollege._id;
        } else {
          // Create a default college if none exists
          const defaultCollege = new College({
            user: req.user._id,
            name: "Default College",
            code: "DEFAULT",
            type: "Private",
            address: {
              city: "Unknown",
              state: "Unknown",
            },
          });
          await defaultCollege.save();
          collegeId = defaultCollege._id;
        }
      }

      // Verify college exists
      const collegeDoc = await College.findById(collegeId);
      if (!collegeDoc) {
        return res.status(400).json({
          success: false,
          message: "Invalid college ID",
        });
      }

      student = new Student({
        user: req.user._id,
        college: collegeId,
      });
    }

    // Update academic info
    if (academic || academicInfo) {
      const academicData = academic || academicInfo;
      student.academicInfo = {
        rollNumber:
          academicData.rollNumber || student.academicInfo?.rollNumber || "",
        department:
          academicData.department || student.academicInfo?.department || "",
        year: academicData.year || student.academicInfo?.year || 1,
        semester: academicData.semester || student.academicInfo?.semester || 1,
        cgpa: parseFloat(academicData.cgpa) || student.academicInfo?.cgpa || 0,
        attendance:
          parseFloat(academicData.attendance) ||
          student.academicInfo?.attendance ||
          0,
        backlogCount:
          academicData.backlogCount || student.academicInfo?.backlogCount || 0,
      };
    }

    // Update skills
    if (skills && Array.isArray(skills) && skills.length > 0) {
      student.skills = skills.map((skill) => ({
        name: skill.name || "",
        level: skill.level || "Beginner",
        verified: skill.verified || false,
      }));
    }

    // Update projects
    if (projects && Array.isArray(projects) && projects.length > 0) {
      student.projects = projects.map((project) => ({
        title: project.title || "",
        description: project.description || "",
        technologies: project.technologies || [],
        githubUrl: project.link || project.githubUrl || "",
        liveUrl: project.liveUrl || "",
        startDate: project.startDate ? new Date(project.startDate) : new Date(),
        endDate: project.endDate ? new Date(project.endDate) : new Date(),
        status: project.status || "Completed",
      }));
    }

    // Update achievements
    if (
      achievements &&
      Array.isArray(achievements) &&
      achievements.length > 0
    ) {
      student.achievements = achievements.map((achievement) => ({
        title: achievement.title || "",
        description: achievement.description || "",
        date: new Date(achievement.date) || new Date(),
        category: achievement.category || "Other",
        level: achievement.level || "College",
      }));
    }

    // Update certifications
    if (
      certificates &&
      Array.isArray(certificates) &&
      certificates.length > 0
    ) {
      student.certifications = certificates.map((cert) => ({
        name: cert.title || cert.name || "",
        issuer: cert.issuer || "",
        issueDate: cert.issueDate ? new Date(cert.issueDate) : new Date(),
        expiryDate: cert.expiryDate ? new Date(cert.expiryDate) : null,
        credentialId: cert.credentialId || "",
        credentialUrl: cert.certificateUrl || cert.credentialUrl || "",
        certificateFile: cert.certificateFile || "",
        verified: cert.verified || false,
      }));
    }

    // Update coding profiles
    if (codingProfiles) {
      if (codingProfiles.leetcode) {
        student.codingProfiles.leetcode = {
          username: codingProfiles.leetcode.username || "",
          totalSolved:
            codingProfiles.leetcode.problemsSolved ||
            codingProfiles.leetcode.totalSolved ||
            0,
          easySolved: codingProfiles.leetcode.easySolved || 0,
          mediumSolved: codingProfiles.leetcode.mediumSolved || 0,
          hardSolved: codingProfiles.leetcode.hardSolved || 0,
          rating: codingProfiles.leetcode.rating || 0,
          lastUpdated: new Date(),
        };
      }
      if (codingProfiles.codechef) {
        student.codingProfiles.codechef = {
          username: codingProfiles.codechef.username || "",
          rating: codingProfiles.codechef.rating || 0,
          stars: codingProfiles.codechef.stars || "",
          totalSolved:
            codingProfiles.codechef.problemsSolved ||
            codingProfiles.codechef.totalSolved ||
            0,
          lastUpdated: new Date(),
        };
      }
      if (codingProfiles.codeforces) {
        student.codingProfiles.codeforces = {
          username: codingProfiles.codeforces.username || "",
          rating: codingProfiles.codeforces.rating || 0,
          rank: codingProfiles.codeforces.rank || "",
          totalSolved:
            codingProfiles.codeforces.problemsSolved ||
            codingProfiles.codeforces.totalSolved ||
            0,
          lastUpdated: new Date(),
        };
      }
    }

    // Update resume
    if (resume) {
      student.resume = {
        fileUrl: resume.fileUrl || "",
        fileName: resume.fileName || "",
        uploadDate: resume.uploadDate
          ? new Date(resume.uploadDate)
          : new Date(),
        isVerified: resume.verified || false,
        plagiarismScore: resume.plagiarismScore || 0,
      };
    }

    // Update public profile visibility
    if (publicProfile !== undefined) {
      student.isProfilePublic = publicProfile.isPublic || false;
    }

    // Save student profile
    await student.save();

    // Return success response
    res.json({
      success: true,
      message: isNewStudent
        ? "Student profile created successfully"
        : "Student profile updated successfully",
      data: await Student.findById(student._id).populate(
        "college",
        "name code address",
      ),
    });
  } catch (error) {
    console.error("Profile creation/update error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save profile",
      error: process.env.NODE_ENV === "development" ? error.message : {},
    });
  }
});

// Get student profile
router.get("/profile", async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id }).populate(
      "college",
      "name code address",
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    res.json({
      success: true,
      data: student,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get profile",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Update skills
router.post(
  "/skills",
  [
    body("skills").isArray(),
    body("skills.*.name").notEmpty().trim(),
    body("skills.*.level").isIn([
      "Beginner",
      "Intermediate",
      "Advanced",
      "Expert",
    ]),
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

      const { skills } = req.body;

      const student = await Student.findOneAndUpdate(
        { user: req.user._id },
        { $set: { skills } },
        { new: true, runValidators: true },
      );

      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student profile not found",
        });
      }

      res.json({
        success: true,
        message: "Skills updated successfully",
        data: student.skills,
      });
    } catch (error) {
      console.error("Skills update error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update skills",
      });
    }
  },
);

// Add project
router.post(
  "/projects",
  [
    body("title").notEmpty().trim(),
    body("description").notEmpty().trim(),
    body("technologies").isArray(),
    body("status").isIn(["Completed", "In Progress", "Planned"]),
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

      const projectData = req.body;

      const student = await Student.findOneAndUpdate(
        { user: req.user._id },
        { $push: { projects: projectData } },
        { new: true, runValidators: true },
      );

      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student profile not found",
        });
      }

      res.json({
        success: true,
        message: "Project added successfully",
        data: student.projects[student.projects.length - 1],
      });
    } catch (error) {
      console.error("Project addition error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to add project",
      });
    }
  },
);

// Update project
router.put(
  "/projects/:projectId",
  [
    body("title").optional().notEmpty().trim(),
    body("description").optional().notEmpty().trim(),
    body("technologies").optional().isArray(),
    body("status").optional().isIn(["Completed", "In Progress", "Planned"]),
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

      const { projectId } = req.params;
      const updateData = req.body;

      const student = await Student.findOneAndUpdate(
        {
          user: req.user._id,
          "projects._id": projectId,
        },
        {
          $set: {
            "projects.$": updateData,
          },
        },
        { new: true, runValidators: true },
      );

      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Project not found",
        });
      }

      const updatedProject = student.projects.id(projectId);

      res.json({
        success: true,
        message: "Project updated successfully",
        data: updatedProject,
      });
    } catch (error) {
      console.error("Project update error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update project",
      });
    }
  },
);

// Add certification
router.post(
  "/certifications",
  [
    body("name").notEmpty().trim(),
    body("issuer").notEmpty().trim(),
    body("issueDate").isISO8601().toDate(),
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

      const certificationData = req.body;

      const student = await Student.findOneAndUpdate(
        { user: req.user._id },
        { $push: { certifications: certificationData } },
        { new: true, runValidators: true },
      );

      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student profile not found",
        });
      }

      res.json({
        success: true,
        message: "Certification added successfully",
        data: student.certifications[student.certifications.length - 1],
      });
    } catch (error) {
      console.error("Certification addition error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to add certification",
      });
    }
  },
);

// Update coding profiles
router.post(
  "/coding-profiles",
  [
    body("platform").isIn(["leetcode", "codechef", "codeforces"]),
    body("username").notEmpty().trim(),
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

      const { platform, username } = req.body;

      // Fetch coding stats from platform
      const stats = await fetchCodingStats(platform, username);

      const student = await Student.findOneAndUpdate(
        { user: req.user._id },
        {
          $set: {
            [`codingProfiles.${platform}`]: {
              username,
              ...stats,
              lastUpdated: new Date(),
            },
          },
        },
        { new: true, runValidators: true },
      );

      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student profile not found",
        });
      }

      res.json({
        success: true,
        message: "Coding profile updated successfully",
        data: student.codingProfiles[platform],
      });
    } catch (error) {
      console.error("Coding profile update error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update coding profile",
        error: process.env.NODE_ENV === "development" ? error.message : {},
      });
    }
  },
);

// Upload resume
router.post("/resume", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // Analyze resume for plagiarism and extract information
    const analysis = await analyzeResume(req.file.path);

    const student = await Student.findOneAndUpdate(
      { user: req.user._id },
      {
        $set: {
          "resume.fileUrl": req.file.path,
          "resume.fileName": req.file.originalname,
          "resume.uploadDate": new Date(),
          "resume.plagiarismScore": analysis.plagiarismScore,
          "resume.isVerified": analysis.plagiarismScore < 30, // Consider verified if plagiarism score is less than 30%
        },
      },
      { new: true, runValidators: true },
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    res.json({
      success: true,
      message: "Resume uploaded successfully",
      data: {
        fileUrl: student.resume.fileUrl,
        fileName: student.resume.fileName,
        plagiarismScore: student.resume.plagiarismScore,
        isVerified: student.resume.isVerified,
        extractedSkills: analysis.extractedSkills,
        extractedExperience: analysis.extractedExperience,
      },
    });
  } catch (error) {
    console.error("Resume upload error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload resume",
      error: process.env.NODE_ENV === "development" ? error.message : {},
    });
  }
});

// Add achievement
router.post(
  "/achievements",
  [
    body("title").notEmpty().trim(),
    body("description").notEmpty().trim(),
    body("date").isISO8601().toDate(),
    body("category").isIn([
      "Academic",
      "Coding",
      "Sports",
      "Cultural",
      "Other",
    ]),
    body("level").isIn(["College", "State", "National", "International"]),
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

      const achievementData = req.body;

      const student = await Student.findOneAndUpdate(
        { user: req.user._id },
        { $push: { achievements: achievementData } },
        { new: true, runValidators: true },
      );

      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student profile not found",
        });
      }

      res.json({
        success: true,
        message: "Achievement added successfully",
        data: student.achievements[student.achievements.length - 1],
      });
    } catch (error) {
      console.error("Achievement addition error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to add achievement",
      });
    }
  },
);

// Update social links
router.post(
  "/social-links",
  [
    body("linkedin").optional().isURL(),
    body("github").optional().isURL(),
    body("portfolio").optional().isURL(),
    body("twitter").optional().isURL(),
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

      const socialLinks = req.body;

      const student = await Student.findOneAndUpdate(
        { user: req.user._id },
        { $set: { socialLinks } },
        { new: true, runValidators: true },
      );

      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student profile not found",
        });
      }

      res.json({
        success: true,
        message: "Social links updated successfully",
        data: student.socialLinks,
      });
    } catch (error) {
      console.error("Social links update error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update social links",
      });
    }
  },
);

// Toggle profile visibility
router.post("/toggle-visibility", async (req, res) => {
  try {
    const student = await Student.findOneAndUpdate(
      { user: req.user._id },
      [{ $set: { isProfilePublic: { $not: "$isProfilePublic" } } }],
      { new: true },
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    res.json({
      success: true,
      message: `Profile is now ${student.isProfilePublic ? "public" : "private"}`,
      data: { isProfilePublic: student.isProfilePublic },
    });
  } catch (error) {
    console.error("Profile visibility toggle error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle profile visibility",
    });
  }
});

// Get public student profile (for recruiters)
router.get("/public/:studentId", async (req, res) => {
  try {
    const student = await Student.findOne({
      _id: req.params.studentId,
      isProfilePublic: true,
    })
      .populate("college", "name code address")
      .select("-resume.fileUrl -aiInsights");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Public profile not found",
      });
    }

    res.json({
      success: true,
      data: student,
    });
  } catch (error) {
    console.error("Get public profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get public profile",
    });
  }
});

// Generate a secure, shareable link for the public profile
router.post("/generate-shareable-link", async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    // Generate a secure, random token
    const token = crypto.randomBytes(20).toString("hex");
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    student.publicProfileToken = { token, expires };
    student.isProfilePublic = true; // Make profile public when link is generated
    await student.save();

    const shareableLink = `${req.protocol}://${req.get(
      "host",
    )}/api/students/public/shared/${token}`;

    res.json({
      success: true,
      message: "Shareable link generated. It will expire in 7 days.",
      data: {
        shareableLink,
        expires,
      },
    });
  } catch (error) {
    console.error("Generate shareable link error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate shareable link",
    });
  }
});

module.exports = router;
