const express = require("express");

const router = express.Router();

// API Documentation
router.get("/", (req, res) => {
  res.json({
    name: "Career Intelligence Portal API",
    version: "1.0.0",
    description: "AI-Powered Career Intelligence & Placement Portal",
    endpoints: {
      auth: {
        "POST /api/auth/register": "Register new user",
        "POST /api/auth/login": "Login user",
        "POST /api/auth/logout": "Logout user",
        "GET /api/auth/me": "Get current user"
      },
      students: {
        "GET /api/students/profile": "Get student profile",
        "POST /api/students/profile": "Create/update profile",
        "POST /api/students/skills": "Add skills",
        "POST /api/students/projects": "Add project",
        "POST /api/students/coding-profiles": "Update coding profile",
        "POST /api/students/resume": "Upload resume",
        "POST /api/students/achievements": "Add achievement",
        "POST /api/students/social-links": "Update social links"
      },
      colleges: {
        "GET /api/colleges/profile": "Get college profile",
        "PUT /api/colleges/profile": "Update profile",
        "GET /api/colleges/students": "Get college students",
        "POST /api/colleges/verify-student/:studentId": "Verify student",
        "GET /api/colleges/statistics": "Get statistics"
      },
      recruiters: {
        "GET /api/recruiters/profile": "Get recruiter profile",
        "POST /api/recruiters/placements": "Create job posting",
        "GET /api/recruiters/placements": "Get job postings",
        "GET /api/recruiters/search-students": "Search students"
      },
      placements: {
        "GET /api/placements/active": "Get active placements",
        "GET /api/placements/:placementId": "Get placement details",
        "POST /api/placements/:placementId/apply": "Apply for placement",
        "GET /api/placements/my-applications": "Get my applications"
      },
      ai: {
        "POST /api/ai/shortlist-students": "AI shortlist students",
        "POST /api/ai/skill-gap-analysis": "Skill gap analysis",
        "POST /api/ai/career-prediction": "Career prediction",
        "GET /api/ai/coding-growth": "Coding growth analytics",
        "GET /api/ai/job-matches": "Job recommendations",
        "POST /api/ai/resume-suggestions": "Resume suggestions"
      },
      analytics: {
        "GET /api/analytics/college/dashboard": "College dashboard",
        "GET /api/analytics/student/dashboard": "Student dashboard",
        "GET /api/analytics/recruiter/dashboard": "Recruiter dashboard"
      },
      notifications: {
        "POST /api/notifications/send-placement-notification": "Send placement email",
        "POST /api/notifications/send-batch-notifications": "Send batch emails",
        "POST /api/notifications/send-interview-notification": "Send interview email"
      },
      interviewPrep: {
        "GET /api/interview-prep/resources": "Get interview resources",
        "GET /api/interview-prep/mock-interview/:type": "Get mock interview"
      },
      referrals: {
        "POST /api/referrals/generate-code": "Generate referral code",
        "POST /api/referrals/apply": "Apply referral code",
        "GET /api/referrals/status": "Get referral status"
      },
      videoProfile: {
        "POST /api/video-profile/upload-introduction": "Upload video intro",
        "GET /api/video-profile/video-status": "Get video status",
        "POST /api/video-profile/generate-credential": "Generate credential"
      }
    },
    documentation: "https://github.com/your-repo/docs",
    swagger: "/api-docs/swagger.json"
  });
});

// Swagger JSON endpoint
router.get("/swagger.json", (req, res) => {
  res.json({
    openapi: "3.0.0",
    info: {
      title: "Career Intelligence Portal API",
      version: "1.0.0",
      description: "AI-Powered Career Intelligence & Placement Portal"
    },
    servers: [
      {
        url: "http://localhost:5000/api",
        description: "Development server"
      }
    ],
    paths: {
      "/auth/register": {
        post: {
          summary: "Register new user",
          tags: ["Authentication"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password", "firstName", "lastName", "role"],
                  properties: {
                    email: { type: "string" },
                    password: { type: "string" },
                    firstName: { type: "string" },
                    lastName: { type: "string" },
                    role: { type: "string", enum: ["student", "college", "recruiter"] }
                  }
                }
              }
            }
          },
          responses: {
            "201": { description: "User registered successfully" },
            "400": { description: "Validation error" }
          }
        }
      },
      "/auth/login": {
        post: {
          summary: "Login user",
          tags: ["Authentication"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email: { type: "string" },
                    password: { type: "string" }
                  }
                }
              }
            }
          },
          responses: {
            "200": { description: "Login successful" },
            "401": { description: "Invalid credentials" }
          }
        }
      }
    }
  });
});

// Health check (public)
router.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

module.exports = router;