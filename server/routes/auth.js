const express = require("express");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const rateLimit = require("express-rate-limit");
const User = require("../models/User");
const Student = require("../models/Student");
const College = require("../models/College");
const Recruiter = require("../models/Recruiter");
const { protect } = require("../middleware/auth");
const { CodingPlatformService } = require("../services/codingPlatforms");
const nodemailer = require("nodemailer");

const router = express.Router();

// Health check endpoint for auth service
router.get("/status", (req, res) => {
  res.json({
    success: true,
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});

// Rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 attempts per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message:
    "Too many login/register attempts, please try again after 15 minutes",
  skipSuccessfulRequests: false,
});

// Helper function to get or create default college
const getOrCreateDefaultCollege = async (userId) => {
  let college = await College.findOne();
  if (!college) {
    try {
      college = new College({
        user: userId,
        name: "Default College",
        code: "DEFAULT",
        type: "Private",
        address: { city: "Unknown", state: "Unknown" },
        contact: { email: "contact@default.edu" },
        statistics: {
          totalStudents: 0,
          placedStudents: 0,
          averagePackage: 0,
          highestPackage: 0,
          companiesVisited: 0,
          placementRate: 0,
        },
        placementCell: {},
        verificationStatus: { isVerified: false, documents: [] },
        subscription: { plan: "Basic", isActive: false },
      });
      await college.save();
    } catch (error) {
      // Handle race condition: if another process created the college concurrently
      if (error.code === 11000 || error.code === "E11000") {
        college = await College.findOne();
      } else {
        throw error;
      }
    }
  }
  return college;
};

// Helper function to create student profile with coding data
const createStudentProfile = async (userId, codingProfilesInput = {}) => {
  const college = await getOrCreateDefaultCollege(userId);

  // Prepare coding profiles with defaults
  const codingProfilesData = {
    leetcode: {
      username: "",
      totalSolved: 0,
      easySolved: 0,
      mediumSolved: 0,
      hardSolved: 0,
      rating: 0,
      lastUpdated: new Date(),
    },
    codechef: {
      username: "",
      rating: 0,
      stars: "",
      totalSolved: 0,
      lastUpdated: new Date(),
    },
    codeforces: {
      username: "",
      rating: 0,
      rank: "Newbie",
      totalSolved: 0,
      lastUpdated: new Date(),
    },
  };

  // Fetch stats if usernames provided
  const platforms = ["leetcode", "codechef", "codeforces"];
  for (const platform of platforms) {
    const inputData = codingProfilesInput[platform];
    if (inputData && inputData.username) {
      try {
        const stats = await CodingPlatformService.fetchCodingStats(
          platform,
          inputData.username,
        );
        if (platform === "leetcode") {
          codingProfilesData.leetcode = {
            username: stats.username,
            totalSolved: stats.totalSolved || 0,
            easySolved: stats.easySolved || 0,
            mediumSolved: stats.mediumSolved || 0,
            hardSolved: stats.hardSolved || 0,
            rating: stats.rating || 0,
            lastUpdated: new Date(),
          };
        } else if (platform === "codechef") {
          codingProfilesData.codechef = {
            username: stats.username,
            rating: stats.rating || 0,
            stars: stats.stars || "",
            totalSolved: stats.totalSolved || 0,
            lastUpdated: new Date(),
          };
        } else if (platform === "codeforces") {
          codingProfilesData.codeforces = {
            username: stats.username,
            rating: stats.rating || 0,
            rank: stats.rank || "Newbie",
            totalSolved: stats.totalSolved || 0,
            lastUpdated: new Date(),
          };
        }
      } catch (error) {
        console.error(
          `Failed to fetch ${platform} stats during signup:`,
          error.message,
        );
      }
    }
  }

  const student = new Student({
    user: userId,
    college: college._id,
    codingProfiles: codingProfilesData,
    academicInfo: {
      rollNumber: userId.toString(),
      department: "Computer Science",
      year: 1,
      semester: 1,
      cgpa: 0,
      attendance: 0,
      backlogCount: 0,
    },
    skills: [],
    projects: [],
    certifications: [],
    achievements: [],
    socialLinks: {},
    resume: {
      fileUrl: "",
      fileName: "",
      uploadDate: new Date(),
      isVerified: false,
      plagiarismScore: 0,
    },
    placementStatus: { isPlaced: false },
    aiInsights: {
      placementProbability: 0,
      recommendedSkills: [],
      skillGapAnalysis: "",
      careerAdvice: "",
      lastAnalyzed: new Date(),
    },
    blockchainCredentials: [],
  });

  await student.save();
  return student;
};

// Generate JWT Token (now includes role)
const generateToken = (id, role = "student") => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

// Send verification email
const sendVerificationEmail = async (user, token) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: "Verify Your Email - Career Intelligence Portal",
    html: `
      <h2>Welcome to Career Intelligence Portal!</h2>
      <p>Thank you for registering. Please click the button below to verify your email address:</p>
      <a href="${verificationUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a>
      <p>Or copy and paste this link in your browser:</p>
      <p>${verificationUrl}</p>
      <p>This link will expire in 24 hours.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// Register user
router.post(
  "/register",
  authLimiter,
  [
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }),
    body("role").isIn(["student", "college", "recruiter"]),
    body("firstName").notEmpty().trim(),
    body("lastName").notEmpty().trim(),
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

      const {
        email,
        password,
        role,
        firstName,
        lastName,
        phone,
        collegeCode,
        companyDetails,
        codingProfiles,
      } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User with this email already exists",
        });
      }

      // Create user
      const user = new User({
        email,
        password,
        role,
        profile: {
          firstName,
          lastName,
          phone,
        },
        verificationToken: jwt.sign({ email }, process.env.JWT_SECRET, {
          expiresIn: "24h",
        }),
      });

      await user.save();

      // Create role-specific profile
      if (role === "student") {
        // Create student profile with optional coding platform data
        await createStudentProfile(user._id, codingProfiles);
      } else if (role === "college") {
        if (!collegeCode) {
          await User.findByIdAndDelete(user._id);
          return res.status(400).json({
            success: false,
            message: "College code is required for college registration",
          });
        }

        // Check if college code already exists
        const existingCollege = await College.findOne({ code: collegeCode });
        if (existingCollege) {
          await User.findByIdAndDelete(user._id);
          return res.status(400).json({
            success: false,
            message:
              "College code already registered. Please use a unique code.",
          });
        }

        const college = new College({
          user: user._id,
          code: collegeCode,
          name: `${firstName} ${lastName}`, // Temporary, will be updated
        });

        await college.save();
      } else if (role === "recruiter") {
        if (!companyDetails) {
          await User.findByIdAndDelete(user._id);
          return res.status(400).json({
            success: false,
            message: "Company details are required for recruiter registration",
          });
        }

        const recruiter = new Recruiter({
          user: user._id,
          company: {
            name: companyDetails.name,
            industry: companyDetails.industry,
            size: companyDetails.size,
            website: companyDetails.website,
          },
          hrDetails: {
            name: `${firstName} ${lastName}`,
            designation: companyDetails.designation,
            email: email,
            phone: phone,
          },
        });

        await recruiter.save();
      }

      // Send verification email (optional - don't fail registration if email fails)
      try {
        await sendVerificationEmail(user, user.verificationToken);
      } catch (emailError) {
        console.warn(
          "⚠️ Email verification failed, but registration succeeded:",
          emailError.message,
        );
        // Don't fail the registration - email is optional in development
      }

      res.status(201).json({
        success: true,
        message:
          "Registration successful. Please check your email to verify your account.",
        data: {
          userId: user._id,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({
        success: false,
        message: "Registration failed",
        error: process.env.NODE_ENV === "development" ? error.message : {},
      });
    }
  },
);

// Verify email
router.post("/verify-email/:token", async (req, res) => {
  try {
    const { token } = req.params;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification token",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email already verified",
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(400).json({
      success: false,
      message: "Invalid or expired verification token",
    });
  }
});

// Login
router.post(
  "/login",
  authLimiter,
  [body("email").isEmail().normalizeEmail(), body("password").notEmpty()],
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

      const { email, password } = req.body;

      // Find user by email
      const user = await User.findOne({ email }).select("+password");

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      // Check if password matches
      const isMatch = await user.comparePassword(password);

      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: "Account is deactivated. Please contact support.",
        });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate token with role
      const token = generateToken(user._id, user.role);

      // Get role-specific data
      let profileData = {};
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
        message: "Login successful",
        data: {
          token,
          user: {
            id: user._id,
            email: user.email,
            role: user.role,
            profile: user.profile,
            isVerified: user.isVerified,
            lastLogin: user.lastLogin,
          },
          profileData,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        message: "Login failed",
        error: process.env.NODE_ENV === "development" ? error.message : {},
      });
    }
  },
);

// Get current user
router.get("/me", protect, async (req, res) => {
  try {
    let profileData = {};

    if (req.user.role === "student") {
      profileData = await Student.findOne({ user: req.user._id }).populate(
        "college",
        "name code address",
      );
    } else if (req.user.role === "college") {
      profileData = await College.findOne({ user: req.user._id });
    } else if (req.user.role === "recruiter") {
      profileData = await Recruiter.findOne({ user: req.user._id });
    }

    res.json({
      success: true,
      data: {
        user: req.user,
        profileData,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get user data",
    });
  }
});

// Firebase Login/Register (for users registered via Firebase Auth)
router.post(
  "/firebase-login",
  [
    body("email").isEmail().normalizeEmail(),
    body("firstName").notEmpty().trim(),
    body("lastName").notEmpty().trim(),
    body("role").isIn(["student", "college", "recruiter"]).optional(),
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

      const {
        email,
        firstName,
        lastName,
        role = "student",
        photoURL,
        phone,
        codingProfiles,
      } = req.body;

      let user = await User.findOne({ email });

      // If user doesn't exist, create them
      if (!user) {
        user = new User({
          email,
          password: jwt.sign({ email }, process.env.JWT_SECRET), // Generate a random password for Firebase users
          role,
          profile: {
            firstName,
            lastName,
            phone: phone || "",
            avatar: photoURL || "",
          },
          isVerified: true, // Firebase users are considered verified
          isFirebaseUser: true,
        });

        await user.save();

        // Create role-specific profile
        if (role === "student") {
          await createStudentProfile(user._id, codingProfiles);
        } else if (role === "college") {
          const college = new College({
            user: user._id,
            code: `firebase-${Date.now()}`,
            name: `${firstName} ${lastName}`,
          });
          await college.save();
        } else if (role === "recruiter") {
          const recruiter = new Recruiter({
            user: user._id,
            company: {
              name: "Not provided",
              industry: "Not provided",
            },
            hrDetails: {
              name: `${firstName} ${lastName}`,
              email: email,
              phone: phone || "",
            },
          });
          await recruiter.save();
        }
      } else {
        // Update existing user profile with Firebase info
        user.profile.firstName = firstName;
        user.profile.lastName = lastName;
        if (photoURL) user.profile.avatar = photoURL;
        if (phone) user.profile.phone = phone;
        user.isVerified = true;
        user.lastLogin = new Date();
        await user.save();

        // Ensure student profile exists for existing student users (first-time login after Firebase registration)
        if (user.role === "student") {
          let student = await Student.findOne({ user: user._id });
          if (!student) {
            // Create missing student profile with provided coding data (if any)
            await createStudentProfile(user._id, codingProfiles);
          } else if (codingProfiles) {
            // Update only missing coding profiles (e.g., if user didn't provide during initial signup later login)
            const platforms = ["leetcode", "codechef", "codeforces"];
            let needsUpdate = false;
            const updateData = {};

            for (const platform of platforms) {
              const input = codingProfiles[platform];
              if (
                input &&
                input.username &&
                !student.codingProfiles[platform]?.username
              ) {
                try {
                  const stats = await CodingPlatformService.fetchCodingStats(
                    platform,
                    input.username,
                  );
                  updateData[`codingProfiles.${platform}`] = {
                    username: stats.username,
                    totalSolved: stats.totalSolved || 0,
                    ...(platform === "leetcode" && {
                      easySolved: stats.easySolved || 0,
                      mediumSolved: stats.mediumSolved || 0,
                      hardSolved: stats.hardSolved || 0,
                    }),
                    ...(platform === "codechef" && {
                      stars: stats.stars || "",
                    }),
                    ...(platform === "codeforces" && {
                      rank: stats.rank || "Newbie",
                    }),
                    rating: stats.rating || 0,
                    lastUpdated: new Date(),
                  };
                  needsUpdate = true;
                } catch (error) {
                  console.error(
                    `Failed to fetch ${platform} stats:`,
                    error.message,
                  );
                }
              }
            }

            if (needsUpdate) {
              await Student.findOneAndUpdate(
                { user: user._id },
                { $set: updateData },
              );
            }
          }
        }
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate JWT token
      const token = generateToken(user._id, user.role);

      // Get role-specific data
      let profileData = {};
      if (user.role === "student") {
        profileData = await Student.findOne({ user: user._id });
      } else if (user.role === "college") {
        profileData = await College.findOne({ user: user._id });
      } else if (user.role === "recruiter") {
        profileData = await Recruiter.findOne({ user: user._id });
      }

      res.json({
        success: true,
        message: "Firebase login successful",
        data: {
          token,
          user: {
            id: user._id,
            email: user.email,
            role: user.role,
            profile: user.profile,
            isVerified: user.isVerified,
            lastLogin: user.lastLogin,
          },
          profileData,
          isNewUser:
            !user.createdAt ||
            new Date().getTime() - new Date(user.createdAt).getTime() < 5000,
        },
      });
    } catch (error) {
      console.error("Firebase login error:", error);
      res.status(500).json({
        success: false,
        message: "Firebase login failed",
        error: process.env.NODE_ENV === "development" ? error.message : {},
      });
    }
  },
);

// Logout
router.post("/logout", protect, async (req, res) => {
  // In a real implementation, you might want to blacklist the token
  // For now, we'll just return success
  res.json({
    success: true,
    message: "Logout successful",
  });
});

module.exports = router;
