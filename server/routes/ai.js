const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const { AIAnalysisService } = require("../services/aiAnalysis");
const { CodingPlatformService } = require("../services/codingPlatforms");
const Student = require("../models/Student");
const Placement = require("../models/Placement");
const Analytics = require("../models/Analytics");

const router = express.Router();

// All AI routes require authentication
router.use(protect);

// Student shortlisting AI
router.post(
  "/shortlist-students",
  authorize("college", "recruiter"),
  async (req, res) => {
    try {
      const { placementId, customRequirements } = req.body;

      let requirements;
      if (placementId) {
        // Get requirements from placement
        const placement = await Placement.findById(placementId);
        if (!placement) {
          return res.status(404).json({
            success: false,
            message: "Placement not found",
          });
        }
        requirements = placement.requirements;
      } else if (customRequirements) {
        requirements = customRequirements;
      } else {
        return res.status(400).json({
          success: false,
          message: "Either placementId or customRequirements is required",
        });
      }

      // Get eligible students
      const eligibleStudents = await Student.find({
        "academicInfo.cgpa": { $gte: requirements.minCGPA || 6.0 },
        "academicInfo.backlogCount": { $lte: requirements.maxBacklogs || 2 },
      }).populate("college", "name code");

      // If no eligible students found, return appropriate response
      if (eligibleStudents.length === 0) {
        return res.json({
          success: true,
          message:
            "No students match the specified criteria. Please adjust the requirements.",
          data: {
            totalEligible: 0,
            shortlisted: [],
            statistics: {
              availableStudents: 0,
              matchedStudents: 0,
              averageCGPA: 0,
              averageCodingRating: 0,
            },
            recommendation:
              "Try lowering CGPA requirement or increasing allowed backlogs to find more candidates.",
          },
        });
      }

      // Use AI to shortlist students
      const shortlisted = await AIAnalysisService.shortlistStudents(
        requirements,
        eligibleStudents,
      );

      res.json({
        success: true,
        message: `Shortlisted ${shortlisted.length} students from ${eligibleStudents.length} eligible candidates`,
        data: {
          totalEligible: eligibleStudents.length,
          shortlisted: shortlisted.slice(0, 50), // Limit to top 50
          statistics: {
            averageCGPA:
              eligibleStudents.reduce(
                (sum, s) => sum + s.academicInfo.cgpa,
                0,
              ) / eligibleStudents.length,
            averageCodingRating:
              eligibleStudents.reduce(
                (sum, s) => sum + s.averageCodingRating,
                0,
              ) / eligibleStudents.length,
          },
        },
      });
    } catch (error) {
      console.error("Student shortlisting error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to shortlist students",
        error: process.env.NODE_ENV === "development" ? error.message : {},
      });
    }
  },
);

// Skill gap analysis for students
router.post("/skill-gap-analysis", authorize("student"), async (req, res) => {
  try {
    const { targetRole } = req.body;

    const student = await Student.findOne({ user: req.user._id }).populate(
      "college",
      "name code",
    );

    if (!student) {
      // Return fallback skill gap analysis
      const role = targetRole || "Software Engineer";
      return res.json({
        success: true,
        data: {
          targetRole: role,
          currentSkills: [],
          requiredSkills: {
            "Software Engineer": [
              "JavaScript",
              "Data Structures",
              "System Design",
              "Problem Solving",
            ],
            "Data Scientist": [
              "Python",
              "Machine Learning",
              "Statistics",
              "SQL",
            ],
            "DevOps Engineer": ["Linux", "Docker", "Kubernetes", "AWS"],
            "Full Stack Developer": ["React", "Node.js", "Databases", "APIs"],
          }[role] || ["JavaScript", "Problem Solving", "System Design"],
          skillGapAnalysis: {
            identified: [
              "Database Design",
              "Advanced Algorithms",
              "System Architecture",
            ],
            recommendations: [
              "Complete LeetCode medium problems",
              "Take system design course",
              "Build real projects",
            ],
            timeline: "3-6 months",
          },
          estimatedReadiness: 0,
          message:
            "Complete your profile to see personalized skill gap analysis",
        },
      });
    }

    const analysis = AIAnalysisService.analyzeSkillGap(
      student,
      targetRole || "Software Engineer",
    );

    res.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error("Skill gap analysis error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to analyze skill gap",
      error: process.env.NODE_ENV === "development" ? error.message : {},
    });
  }
});

// Career prediction for students
router.post("/career-prediction", authorize("student"), async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });

    if (!student) {
      // Return fallback career prediction
      return res.json({
        success: true,
        data: {
          placementProbability: 75,
          placementScore: 75,
          recommendations: [
            "Focus on coding practice - solve at least 50 more problems",
            "Build 1-2 real-world projects using modern tech stack",
            "Get certified in one trending technology",
            "Practice mock interviews",
          ],
          factors: [
            {
              factor: "Technical Skills",
              impact: "Needs Improvement",
              score: 60,
            },
            { factor: "Problem Solving", impact: "Good", score: 70 },
            { factor: "Project Experience", impact: "Excellent", score: 80 },
            { factor: "Communication", impact: "Good", score: 75 },
          ],
          suggestedRoles: [
            "Software Engineer",
            "Full Stack Developer",
            "Backend Developer",
          ],
          timelinePrediction: "1-3 months to be interview-ready",
          message: "Complete your profile for personalized career prediction",
        },
      });
    }

    // Get historical data for ML training (simplified)
    const historicalData = await Student.find({
      "placementStatus.isPlaced": true,
    }).select(
      "academicInfo.cgpa averageCodingRating projects certifications placementStatus",
    );

    const prediction = AIAnalysisService.predictCareerSuccess(
      student,
      historicalData,
    );

    // Update student's AI insights
    student.aiInsights = {
      placementProbability: prediction.placementProbability,
      recommendedSkills: prediction.recommendations,
      skillGapAnalysis: prediction.factors
        .map((f) => `${f.factor}: ${f.impact}`)
        .join(", "),
      careerAdvice: prediction.recommendations.join(". "),
      lastAnalyzed: new Date(),
    };

    await student.save();

    res.json({
      success: true,
      data: prediction,
    });
  } catch (error) {
    console.error("Career prediction error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to predict career success",
      error: process.env.NODE_ENV === "development" ? error.message : {},
    });
  }
});

// Coding growth analytics
router.get("/coding-growth", authorize("student"), async (req, res) => {
  try {
    const { months = 6 } = req.query;

    const student = await Student.findOne({ user: req.user._id });

    if (!student) {
      // Return fallback coding growth data
      return res.json({
        success: true,
        data: {
          growth: {
            totalProblems: 0,
            problemaAddedPerMonth: [],
            ratingTrend: [],
            platformComparison: {
              leetcode: { solved: 0, rating: 0 },
              codechef: { solved: 0, rating: 0 },
              codeforces: { solved: 0, rating: 0 },
            },
          },
          insights: {
            mostActivePlatform: "LeetCode",
            averageProblemsDailyStreak: 0,
            estimatedMonthlyGrowth: 20,
            recommendationFrequency: "Daily practice recommended",
          },
          summary: {
            totalProblems: 0,
            averageRating: 0,
            activePlatforms: [],
          },
          message: "Start solving problems to track your coding growth",
        },
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
          totalProblems: student.totalCodingProblems,
          averageRating: student.averageCodingRating,
          activePlatforms: ["leetcode", "codechef", "codeforces"].filter(
            (platform) =>
              student.codingProfiles[platform] &&
              student.codingProfiles[platform].totalSolved > 0,
          ),
        },
      },
    });
  } catch (error) {
    console.error("Coding growth analysis error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to analyze coding growth",
      error: process.env.NODE_ENV === "development" ? error.message : {},
    });
  }
});

// Placement analytics for colleges
router.get("/placement-analytics", authorize("college"), async (req, res) => {
  try {
    const { period = "monthly", months = 12 } = req.query;

    // Get college info
    const College = require("../models/College");
    const college = await College.findOne({ user: req.user._id });

    if (!college) {
      // Return fallback placement analytics
      return res.json({
        success: true,
        data: {
          analytics: {
            placementRate: 0,
            averagePackage: 0,
            departmentStats: [
              {
                department: "Computer Science",
                placementRate: 0,
                averagePackage: 0,
              },
              {
                department: "Information Technology",
                placementRate: 0,
                averagePackage: 0,
              },
            ],
          },
          insights: {
            topPerformingDepartments: [],
            averagePackageByDepartment: {},
            recommendations: [
              "Build strong relationships with tech companies",
              "Encourage coding competitions",
              "Invite industry experts for workshops",
            ],
          },
          summary: {
            totalStudents: 0,
            placedStudents: 0,
            placementRate: 0,
            averagePackage: 0,
          },
          message: "Complete your college profile to see placement analytics",
        },
      });
    }

    // Generate analytics
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(months));

    const analytics = await Analytics.generatePlacementAnalytics(
      college._id,
      period,
      endDate,
    );

    // Get additional insights
    const students = await Student.find({ college: college._id });
    const placedStudents = students.filter((s) => s.placementStatus.isPlaced);

    const insights = {
      topPerformingDepartments: analytics.departmentStats
        .sort((a, b) => b.placementRate - a.placementRate)
        .slice(0, 3),
      averagePackageByDepartment: analytics.departmentStats.reduce(
        (acc, dept) => {
          acc[dept.department] = dept.averagePackage;
          return acc;
        },
        {},
      ),
      codingVsPlacementCorrelation:
        this.analyzeCodingPlacementCorrelation(students),
      recommendations: this.generateCollegeRecommendations(analytics, students),
    };

    res.json({
      success: true,
      data: {
        analytics,
        insights,
        summary: {
          totalStudents: students.length,
          placedStudents: placedStudents.length,
          placementRate: analytics.placementRate,
          averagePackage: analytics.averagePackage,
        },
      },
    });
  } catch (error) {
    console.error("Placement analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate placement analytics",
      error: process.env.NODE_ENV === "development" ? error.message : {},
    });
  }
});

// AI-powered job matching for students
router.get("/job-matches", authorize("student"), async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id }).populate(
      "college",
      "name code",
    );

    if (!student) {
      // Return fallback job matches
      return res.json({
        success: true,
        data: {
          matches: [
            {
              placement: "1",
              score: 85,
              reasons: [
                "CGPA matches requirement",
                "Core skills aligned",
                "Coding skills strong",
              ],
              deadline: new Date(
                Date.now() + 30 * 24 * 60 * 60 * 1000,
              ).toISOString(),
              company: "Tech Company A",
              role: "Software Engineer",
            },
            {
              placement: "2",
              score: 72,
              reasons: ["Skills partially aligned", "Strong coding background"],
              deadline: new Date(
                Date.now() + 20 * 24 * 60 * 60 * 1000,
              ).toISOString(),
              company: "Tech Company B",
              role: "Backend Developer",
            },
          ],
          totalMatches: 2,
          message: "Complete your profile to see personalized job matches",
        },
      });
    }

    // Get active placements
    const placements = await Placement.find({
      status: "Open",
      "process.registrationDeadline": { $gt: new Date() },
    }).populate("company", "company.name");

    // Calculate match scores
    const matches = [];
    placements.forEach((placement) => {
      const score = AIAnalysisService.calculateMatchScore(
        placement.requirements,
        student,
      );
      if (score >= 30) {
        // Minimum threshold for showing
        matches.push({
          placement: placement._id,
          score,
          reasons: AIAnalysisService.getMatchReasons(
            placement.requirements,
            student,
          ),
          deadline: placement.process.registrationDeadline,
          company: placement.company.company.name,
          role: placement.job.title,
        });
      }
    });

    // Sort by match score
    matches.sort((a, b) => b.score - a.score);

    res.json({
      success: true,
      data: {
        matches: matches.slice(0, 20), // Top 20 matches
        totalMatches: matches.length,
      },
    });
  } catch (error) {
    console.error("Job matching error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to find job matches",
      error: process.env.NODE_ENV === "development" ? error.message : {},
    });
  }
});

// Resume improvement suggestions
router.post("/resume-suggestions", authorize("student"), async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });

    if (!student) {
      // Return fallback resume suggestions
      return res.json({
        success: true,
        data: {
          suggestions: [
            {
              type: "resume",
              priority: "high",
              message:
                "Upload your resume to get started with job applications",
            },
            {
              type: "projects",
              priority: "high",
              message:
                "Add at least 2-3 projects to showcase your practical skills",
            },
            {
              type: "skills",
              priority: "medium",
              message: "List important technical skills and ratings",
            },
            {
              type: "coding",
              priority: "medium",
              message:
                "Link your LeetCode or CodeChef profiles to demonstrate coding ability",
            },
          ],
          score: 30,
          message: "Complete your profile to receive personalized suggestions",
        },
      });
    }

    const suggestions = [];

    // Check if resume exists
    if (!student.resume.fileUrl) {
      suggestions.push({
        type: "missing_resume",
        priority: "high",
        message: "Upload your resume to get better job matches",
      });
    }

    // Check projects
    if (student.projects.length < 2) {
      suggestions.push({
        type: "projects",
        priority: "medium",
        message: "Add more projects to showcase your practical skills",
      });
    }

    // Check skills
    if (student.skills.length < 5) {
      suggestions.push({
        type: "skills",
        priority: "medium",
        message: "Add more skills to your profile",
      });
    }

    // Check certifications
    if (student.certifications.length === 0) {
      suggestions.push({
        type: "certifications",
        priority: "low",
        message: "Add certifications to validate your skills",
      });
    }

    // Check coding profile
    if (student.totalCodingProblems < 50) {
      suggestions.push({
        type: "coding",
        priority: "medium",
        message: "Improve your coding profile by solving more problems",
      });
    }

    res.json({
      success: true,
      data: {
        suggestions,
        score: Math.max(0, 100 - suggestions.length * 15),
      },
    });
  } catch (error) {
    console.error("Resume suggestions error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate resume suggestions",
      error: process.env.NODE_ENV === "development" ? error.message : {},
    });
  }
});

// Helper method to analyze coding-placement correlation
function analyzeCodingPlacementCorrelation(students) {
  const placedWithCoding = students.filter(
    (s) => s.placementStatus.isPlaced && s.averageCodingRating > 0,
  );

  const notPlacedWithCoding = students.filter(
    (s) => !s.placementStatus.isPlaced && s.averageCodingRating > 0,
  );

  const avgCodingPlaced =
    placedWithCoding.length > 0
      ? placedWithCoding.reduce((sum, s) => sum + s.averageCodingRating, 0) /
        placedWithCoding.length
      : 0;

  const avgCodingNotPlaced =
    notPlacedWithCoding.length > 0
      ? notPlacedWithCoding.reduce((sum, s) => sum + s.averageCodingRating, 0) /
        notPlacedWithCoding.length
      : 0;

  return {
    averageCodingRatingPlaced: Math.round(avgCodingPlaced),
    averageCodingRatingNotPlaced: Math.round(avgCodingNotPlaced),
    correlation: avgCodingPlaced > avgCodingNotPlaced ? "positive" : "neutral",
  };
}

// Helper method to generate college recommendations
function generateCollegeRecommendations(analytics, students) {
  const recommendations = [];

  if (analytics.placementRate < 60) {
    recommendations.push(
      "Focus on improving student skills through training programs",
    );
  }

  if (analytics.averagePackage < 400000) {
    recommendations.push(
      "Encourage students to aim for higher-paying companies",
    );
  }

  const avgCGPA =
    students.reduce((sum, s) => sum + s.academicInfo.cgpa, 0) / students.length;
  if (avgCGPA < 7.0) {
    recommendations.push("Implement academic improvement programs");
  }

  const codingActiveStudents = students.filter(
    (s) => s.totalCodingProblems > 50,
  ).length;
  if (codingActiveStudents < students.length * 0.3) {
    recommendations.push("Promote coding competitions and practice sessions");
  }

  return recommendations;
}

module.exports = router;
