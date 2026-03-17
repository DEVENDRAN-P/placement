const express = require("express");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const Student = require("../models/Student");
const College = require("../models/College");
const Recruiter = require("../models/Recruiter");
const { protect } = require("../middleware/auth");
const nodemailer = require("nodemailer");

const router = express.Router();

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
        // For students, we'll need additional information
        // This will be handled in a separate profile completion step
        console.log(
          "Student registration initiated, profile completion required",
        );
      } else if (role === "college") {
        if (!collegeCode) {
          await User.findByIdAndDelete(user._id);
          return res.status(400).json({
            success: false,
            message: "College code is required for college registration",
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

      // Send verification email
      await sendVerificationEmail(user, user.verificationToken);

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
