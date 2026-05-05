const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const Analytics = require("../models/Analytics");
const Student = require("../models/Student");
const Placement = require("../models/Placement");
const College = require("../models/College");

const router = express.Router();

// All analytics routes require authentication
router.use(protect);

// Get college analytics dashboard
router.get("/college/dashboard", authorize("college"), async (req, res) => {
  try {
    const college = await College.findOne({ user: req.user._id });

     if (!college) {
       console.log(
         "🏫 College profile not found in MongoDB, returning default data for Firebase user",
       );
       return res.json({
         success: true,
         data: {
           overview: {
             totalStudents: 0,
             placedStudents: 0,
             placementRate: 0,
             averagePackage: 0,
             highestPackage: 0,
             companiesVisited: 0,
           },
           departmentStats: {},
           cgpaDistribution: {
             "9.0-10.0": 0,
             "8.0-9.0": 0,
             "7.0-8.0": 0,
             "6.0-7.0": 0,
             "Below 6.0": 0,
           },
           codingStats: {
             totalActiveCoders: 0,
             averageRating: 0,
             totalProblemsSolved: 0,
             platformDistribution: {
               leetcode: 0,
               codechef: 0,
               codeforces: 0,
             },
           },
           monthlyTrend: {},
           recentPlacements: [],
         },
       });
     }

    // Get basic statistics
    const students = await Student.find({ college: college._id });
    const totalStudents = students.length;
    const placedStudents = students.filter(
      (s) => s.placementStatus.isPlaced,
    ).length;
    const placementRate =
      totalStudents > 0 ? (placedStudents / totalStudents) * 100 : 0;

    // Department-wise statistics
    const departmentStats = {};
    students.forEach((student) => {
      const dept = student.academicInfo.department;
      if (!departmentStats[dept]) {
        departmentStats[dept] = {
          total: 0,
          placed: 0,
          totalCGPA: 0,
          averagePackage: 0,
          packages: [],
        };
      }
      departmentStats[dept].total++;
      departmentStats[dept].totalCGPA += student.academicInfo.cgpa;

      if (student.placementStatus.isPlaced) {
        departmentStats[dept].placed++;
        if (student.placementStatus.package) {
          departmentStats[dept].packages.push(student.placementStatus.package);
        }
      }
    });

    // Calculate department averages
    Object.keys(departmentStats).forEach((dept) => {
      const stats = departmentStats[dept];
      stats.averageCGPA = stats.totalCGPA / stats.total;
      stats.placementRate = (stats.placed / stats.total) * 100;
      if (stats.packages.length > 0) {
        stats.averagePackage =
          stats.packages.reduce((a, b) => a + b, 0) / stats.packages.length;
      }
      delete stats.totalCGPA;
      delete stats.packages;
    });

    // Academic performance distribution
    const cgpaDistribution = {
      "9.0-10.0": 0,
      "8.0-9.0": 0,
      "7.0-8.0": 0,
      "6.0-7.0": 0,
      "Below 6.0": 0,
    };

    students.forEach((student) => {
      const cgpa = student.academicInfo.cgpa;
      if (cgpa >= 9.0) cgpaDistribution["9.0-10.0"]++;
      else if (cgpa >= 8.0) cgpaDistribution["8.0-9.0"]++;
      else if (cgpa >= 7.0) cgpaDistribution["7.0-8.0"]++;
      else if (cgpa >= 6.0) cgpaDistribution["6.0-7.0"]++;
      else cgpaDistribution["Below 6.0"]++;
    });

    // Coding performance analysis
    const codingStats = {
      totalActiveCoders: 0,
      averageRating: 0,
      totalProblemsSolved: 0,
      platformDistribution: {
        leetcode: 0,
        codechef: 0,
        codeforces: 0,
      },
    };

    let totalRating = 0;
    let ratingCount = 0;

    students.forEach((student) => {
      const totalProblems = student.totalCodingProblems;
      if (totalProblems > 0) {
        codingStats.totalActiveCoders++;
        codingStats.totalProblemsSolved += totalProblems;
      }

      const avgRating = student.averageCodingRating;
      if (avgRating > 0) {
        totalRating += avgRating;
        ratingCount++;
      }

      // Platform distribution
      if (student.codingProfiles.leetcode.totalSolved > 0) {
        codingStats.platformDistribution.leetcode++;
      }
      if (student.codingProfiles.codechef.totalSolved > 0) {
        codingStats.platformDistribution.codechef++;
      }
      if (student.codingProfiles.codeforces.totalSolved > 0) {
        codingStats.platformDistribution.codeforces++;
      }
    });

    codingStats.averageRating = ratingCount > 0 ? totalRating / ratingCount : 0;

     // Recent placements trend
     const recentPlacements = await Placement.find({
       college: college._id,
       status: "Closed",
       "process.endDate": {
         $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
       }, // Last 90 days
     }).populate("company", "company.name");

     const monthlyTrend = {};
     recentPlacements.forEach((placement) => {
       const month = placement.process.endDate.toISOString().slice(0, 7);
       if (!monthlyTrend[month]) {
         monthlyTrend[month] = {
           companies: new Set(),
           placements: 0,
           students: 0,
         };
       }
       monthlyTrend[month].companies.add(placement.company.company.name);
       monthlyTrend[month].placements++;
       monthlyTrend[month].students += placement.applications.filter(
         (app) => app.finalStatus === "Selected",
       ).length;
     });

     // Convert Sets to counts
     Object.keys(monthlyTrend).forEach((month) => {
       monthlyTrend[month].companies = monthlyTrend[month].companies.size;
     });

     res.json({
       success: true,
       data: {
         overview: {
           totalStudents,
           placedStudents,
           placementRate: Math.round(placementRate * 10) / 10,
           averagePackage: college.statistics?.averagePackage || 0,
           highestPackage: college.statistics?.highestPackage || 0,
           companiesVisited: college.statistics?.companiesVisited || 0,
         },
         departmentStats,
         cgpaDistribution,
         codingStats,
         monthlyTrend,
         recentPlacements: recentPlacements.slice(0, 5).map((p) => ({
           company: p.company.company.name,
           role: p.job.title,
           studentsSelected: p.applications.filter(
             (app) => app.finalStatus === "Selected",
           ).length,
         })),
       },
     });
  } catch (error) {
    console.error("College dashboard analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate college dashboard analytics",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Get student personal analytics
router.get("/student/dashboard", authorize("student"), async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id }).populate(
      "college",
      "name code",
    );

    // If student profile not found, return default data
    if (!student) {
      console.log(
        "📊 Student profile not found in MongoDB, returning default data for Firebase user",
      );
      return res.json({
        success: true,
        data: {
          academicPerformance: {
            currentCGPA: 0,
            attendance: 0,
            backlogs: 0,
            department: "Not Set",
            year: 1,
          },
          skillsAnalysis: {
            totalSkills: 0,
            verifiedSkills: 0,
            skillLevels: {
              Beginner: 0,
              Intermediate: 0,
              Advanced: 0,
              Expert: 0,
            },
            topSkills: [],
          },
          codingPerformance: {
            totalProblems: 0,
            averageRating: 0,
            platforms: {
              leetcode: 0,
              codechef: 0,
              codeforces: 0,
            },
            ratings: {
              leetcode: 0,
              codechef: 0,
              codeforces: 0,
            },
          },
          projectsAndAchievements: {
            totalProjects: 0,
            completedProjects: 0,
            totalCertifications: 0,
            verifiedCertifications: 0,
            totalAchievements: 0,
          },
          placementReadinessScore: 0,
          recentApplications: [],
          aiInsights: null,
          message: "Complete your profile to see detailed analytics",
        },
      });
    }

    // Academic performance
    const academicPerformance = {
      currentCGPA: student.academicInfo.cgpa,
      attendance: student.academicInfo.attendance,
      backlogs: student.academicInfo.backlogCount,
      department: student.academicInfo.department,
      year: student.academicInfo.year,
    };

    // Skills analysis
    const skillsAnalysis = {
      totalSkills: student.skills.length,
      verifiedSkills: student.skills.filter((s) => s.verified).length,
      skillLevels: {
        Beginner: student.skills.filter((s) => s.level === "Beginner").length,
        Intermediate: student.skills.filter((s) => s.level === "Intermediate")
          .length,
        Advanced: student.skills.filter((s) => s.level === "Advanced").length,
        Expert: student.skills.filter((s) => s.level === "Expert").length,
      },
      topSkills: student.skills.slice(0, 10).map((s) => s.name),
    };

    // Coding performance
    const codingPerformance = {
      totalProblems: student.totalCodingProblems || 0,
      averageRating: Math.round(student.averageCodingRating || 0),
      platforms: {
        leetcode: student.codingProfiles?.leetcode?.totalSolved || 0,
        codechef: student.codingProfiles?.codechef?.totalSolved || 0,
        codeforces: student.codingProfiles?.codeforces?.totalSolved || 0,
      },
      ratings: {
        leetcode: student.codingProfiles?.leetcode?.rating || 0,
        codechef: student.codingProfiles?.codechef?.rating || 0,
        codeforces: student.codingProfiles?.codeforces?.rating || 0,
      },
    };

    // Projects and achievements
    const projectsAndAchievements = {
      totalProjects: student.projects.length,
      completedProjects: student.projects.filter(
        (p) => p.status === "Completed",
      ).length,
      totalCertifications: student.certifications.length,
      verifiedCertifications: student.certifications.filter((c) => c.verified)
        .length,
      totalAchievements: student.achievements.length,
    };

    // Placement readiness score
    let readinessScore = 0;
    let maxScore = 0;

    // CGPA contribution (30%)
    maxScore += 30;
    if (student.academicInfo.cgpa >= 8.5) readinessScore += 30;
    else if (student.academicInfo.cgpa >= 7.5) readinessScore += 25;
    else if (student.academicInfo.cgpa >= 6.5) readinessScore += 20;
    else if (student.academicInfo.cgpa >= 6.0) readinessScore += 15;

    // Skills contribution (20%)
    maxScore += 20;
    if (student.skills.length >= 10) readinessScore += 20;
    else if (student.skills.length >= 7) readinessScore += 15;
    else if (student.skills.length >= 5) readinessScore += 10;
    else if (student.skills.length >= 3) readinessScore += 5;

    // Coding contribution (25%)
    maxScore += 25;
    if (student.totalCodingProblems >= 300) readinessScore += 25;
    else if (student.totalCodingProblems >= 200) readinessScore += 20;
    else if (student.totalCodingProblems >= 100) readinessScore += 15;
    else if (student.totalCodingProblems >= 50) readinessScore += 10;
    else if (student.totalCodingProblems >= 20) readinessScore += 5;

    // Projects contribution (15%)
    maxScore += 15;
    if (student.projects.length >= 5) readinessScore += 15;
    else if (student.projects.length >= 3) readinessScore += 10;
    else if (student.projects.length >= 1) readinessScore += 5;

    // Certifications contribution (10%)
    maxScore += 10;
    if (student.certifications.length >= 5) readinessScore += 10;
    else if (student.certifications.length >= 3) readinessScore += 7;
    else if (student.certifications.length >= 1) readinessScore += 3;

    const placementReadinessScore = Math.round(
      (readinessScore / maxScore) * 100,
    );

    // Recent applications
    const recentApplications = await Placement.find({
      "applications.student": student._id,
    })
      .populate("company", "company.name")
      .sort({ "applications.applicationDate": -1 })
      .limit(5);

    const applications = recentApplications.map((placement) => {
      const application = placement.applications.find(
        (app) => app.student.toString() === student._id.toString(),
      );
      return {
        company: placement.company.company.name,
        role: placement.job.title,
        status: application.status,
        applicationDate: application.applicationDate,
        finalStatus: application.finalStatus,
      };
    });

    res.json({
      success: true,
      data: {
        academicPerformance,
        skillsAnalysis,
        codingPerformance,
        projectsAndAchievements,
        placementReadinessScore,
        recentApplications: applications,
        aiInsights: student.aiInsights,
      },
    });
  } catch (error) {
    console.error("Student dashboard analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate student dashboard analytics",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Get recruiter analytics
router.get("/recruiter/dashboard", authorize("recruiter"), async (req, res) => {
  try {
    const Recruiter = require("../models/Recruiter");
    const recruiter = await Recruiter.findOne({ user: req.user._id });

    if (!recruiter) {
      console.log(
        "💼 Recruiter profile not found in MongoDB, returning default data for Firebase user",
      );
      return res.json({
        success: true,
        data: {
          basicStatistics: {
            totalJobsPosted: 0,
            activeJobs: 0,
            closedJobs: 0,
          },
          applicationFunnel: {
            totalApplications: 0,
            totalScreened: 0,
            totalShortlisted: 0,
            totalSelected: 0,
            conversionRate: 0,
          },
          recentActivities: [],
          topApplicants: [],
          skillDemand: [],
          monthlyTrend: {},
          message: "Complete your recruiter profile to see detailed analytics",
        },
      });
    }

    // Get all placements
    const placements = await Placement.find({ company: recruiter._id });

    // Basic statistics
    const totalJobsPosted = placements.length;
    const activeJobs = placements.filter((p) => p.status === "Open").length;
    const closedJobs = placements.filter((p) => p.status === "Closed").length;

    // Application funnel
    let totalApplications = 0;
    let totalScreened = 0;
    let totalShortlisted = 0;
    let totalSelected = 0;

    placements.forEach((placement) => {
      placement.applications.forEach((app) => {
        totalApplications++;
        if (app.status === "Screened") totalScreened++;
        if (app.status === "Shortlisted") totalShortlisted++;
        if (app.finalStatus === "Selected") totalSelected++;
      });
    });

    const conversionRates = {
      screeningToShortlist:
        totalScreened > 0 ? (totalShortlisted / totalScreened) * 100 : 0,
      shortlistToSelection:
        totalShortlisted > 0 ? (totalSelected / totalShortlisted) * 100 : 0,
      overall:
        totalApplications > 0 ? (totalSelected / totalApplications) * 100 : 0,
    };

    // Recent activity
    const recentPlacements = placements
      .sort({ createdAt: -1 })
      .slice(0, 5)
      .map((p) => ({
        id: p._id,
        title: p.job.title,
        status: p.status,
        applications: p.applications.length,
        postedDate: p.createdAt,
      }));

    // Top performing jobs
    const jobPerformance = placements
      .map((placement) => {
        const applications = placement.applications.length;
        const selected = placement.applications.filter(
          (app) => app.finalStatus === "Selected",
        ).length;
        const selectionRate =
          applications > 0 ? (selected / applications) * 100 : 0;

        return {
          title: placement.job.title,
          applications,
          selected,
          selectionRate,
          status: placement.status,
        };
      })
      .sort((a, b) => b.selectionRate - a.selectionRate)
      .slice(0, 5);

    // Application trends over time
    const applicationTrends = {};
    placements.forEach((placement) => {
      placement.applications.forEach((app) => {
        const month = app.applicationDate.toISOString().slice(0, 7);
        applicationTrends[month] = (applicationTrends[month] || 0) + 1;
      });
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalJobsPosted,
          activeJobs,
          closedJobs,
          totalApplications,
          totalSelected,
          subscriptionCredits: recruiter.subscription.remainingCredits,
        },
        conversionRates: {
          screeningToShortlist:
            Math.round(conversionRates.screeningToShortlist * 10) / 10,
          shortlistToSelection:
            Math.round(conversionRates.shortlistToSelection * 10) / 10,
          overall: Math.round(conversionRates.overall * 10) / 10,
        },
        recentActivity: recentPlacements,
        topPerformingJobs: jobPerformance,
        applicationTrends,
      },
    });
  } catch (error) {
    console.error("Recruiter dashboard analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate recruiter dashboard analytics",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Generate custom analytics report
router.post("/custom-report", protect, async (req, res) => {
  try {
    const { reportType, filters, format = "json" } = req.body;

    let data;

    switch (reportType) {
      case "placement_summary":
        data = await generatePlacementSummary(filters);
        break;
      case "student_performance":
        data = await generateStudentPerformanceReport(filters);
        break;
      case "coding_analytics":
        data = await generateCodingAnalytics(filters);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: "Invalid report type",
        });
    }

    res.json({
      success: true,
      data,
      generatedAt: new Date(),
    });
  } catch (error) {
    console.error("Custom report generation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate custom report",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Helper functions for custom reports
async function generatePlacementSummary(filters) {
  const query = {};

  if (filters.college) query.college = filters.college;
  if (filters.company) query.company = filters.company;
  if (filters.startDate)
    query.createdAt = { $gte: new Date(filters.startDate) };
  if (filters.endDate) query.createdAt = { $lte: new Date(filters.endDate) };

  const placements = await Placement.find(query)
    .populate("company", "company.name")
    .populate("college", "name");

  return {
    totalPlacements: placements.length,
    placements: placements.map((p) => ({
      company: p.company.company.name,
      college: p.college.name,
      title: p.job.title,
      applications: p.applications.length,
      selected: p.applications.filter((app) => app.finalStatus === "Selected")
        .length,
      status: p.status,
    })),
  };
}

async function generateStudentPerformanceReport(filters) {
  const query = {};

  if (filters.college) query.college = filters.college;
  if (filters.department) query["academicInfo.department"] = filters.department;
  if (filters.minCGPA)
    query["academicInfo.cgpa"] = { $gte: parseFloat(filters.minCGPA) };

  const students = await Student.find(query)
    .populate("college", "name")
    .populate("user", "profile.firstName profile.lastName");

  return {
    totalStudents: students.length,
    averageCGPA:
      students.reduce((sum, s) => sum + s.academicInfo.cgpa, 0) /
      students.length,
    placedStudents: students.filter((s) => s.placementStatus.isPlaced).length,
    students: students.map((s) => ({
      name: `${s.user.profile.firstName} ${s.user.profile.lastName}`,
      college: s.college.name,
      department: s.academicInfo.department,
      cgpa: s.academicInfo.cgpa,
      isPlaced: s.placementStatus.isPlaced,
      package: s.placementStatus.package,
    })),
  };
}

async function generateCodingAnalytics(filters) {
  const query = {};

  if (filters.college) query.college = filters.college;
  if (filters.minProblems) {
    query.$or = [
      {
        "codingProfiles.leetcode.totalSolved": {
          $gte: parseInt(filters.minProblems),
        },
      },
      {
        "codingProfiles.codechef.totalSolved": {
          $gte: parseInt(filters.minProblems),
        },
      },
      {
        "codingProfiles.codeforces.totalSolved": {
          $gte: parseInt(filters.minProblems),
        },
      },
    ];
  }

  const students = await Student.find(query)
    .populate("college", "name")
    .populate("user", "profile.firstName profile.lastName");

  const codingStats = students
    .map((s) => ({
      name: `${s.user.profile.firstName} ${s.user.profile.lastName}`,
      college: s.college.name,
      totalProblems: s.totalCodingProblems,
      averageRating: s.averageCodingRating,
      leetcode: s.codingProfiles.leetcode,
      codechef: s.codingProfiles.codechef,
      codeforces: s.codingProfiles.codeforces,
    }))
    .filter((s) => s.totalProblems > 0)
    .sort((a, b) => b.totalProblems - a.totalProblems);

  return {
    totalActiveCoders: codingStats.length,
    averageProblemsSolved:
      codingStats.reduce((sum, s) => sum + s.totalProblems, 0) /
      codingStats.length,
    averageRating:
      codingStats.reduce((sum, s) => sum + s.averageRating, 0) /
      codingStats.length,
    topCoders: codingStats.slice(0, 10),
  };
}

module.exports = router;
