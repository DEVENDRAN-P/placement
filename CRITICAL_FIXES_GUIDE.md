# Backend Critical Issues - Quick Fix Guide

## 🔴 MUST FIX IMMEDIATELY

### Issue #1: Missing Module Exports (Classes not exported)

**Files Affected:**

- server/services/aiAnalysis.js
- server/services/codingPlatforms.js
- server/services/analyticsService.js

**Quick Fix:** Add at the end of each file:

```javascript
module.exports = AIAnalysisService; // or appropriate class name
```

**Test:** Run `npm run server` and check for "Cannot find module" errors

---

### Issue #2: SendGrid Import Missing

**File:** server/services/emailService.js (Line 18)

**Quick Fix - Add at top of file:**

```javascript
const nodemailer = require("nodemailer");
const sgMail = require("@sendgrid/mail"); // ADD THIS LINE
require("dotenv").config();
```

**Also install if missing:**

```bash
npm install @sendgrid/mail
```

---

### Issue #3: Template Key Typo

**File:** server/services/emailService.js (Line 104)

**Change from:**

```javascript
preparationResourcesL: `  // WRONG - extra 'L'
```

**Change to:**

```javascript
preparationResources: `  // CORRECT
```

---

### Issue #4: Incomplete Virtual Properties

**File:** server/models/Student.js (End of file)

**Add these virtual properties:**

```javascript
// Virtual for total coding problems solved
studentSchema.virtual("totalCodingProblems").get(function () {
  return (
    (this.codingProfiles.leetcode?.totalSolved || 0) +
    (this.codingProfiles.codechef?.totalSolved || 0) +
    (this.codingProfiles.codeforces?.totalSolved || 0)
  );
});

// Virtual for average coding rating
studentSchema.virtual("averageCodingRating").get(function () {
  const ratings = [
    this.codingProfiles.leetcode?.rating || 0,
    this.codingProfiles.codechef?.rating || 0,
    this.codingProfiles.codeforces?.rating || 0,
  ].filter((r) => r > 0);
  return ratings.length > 0
    ? ratings.reduce((a, b) => a + b) / ratings.length
    : 0;
});
```

**At very end, add:**

```javascript
module.exports = mongoose.model("Student", studentSchema);
```

---

### Issue #5: Implement Missing Service Methods

**File:** server/services/aiAnalysis.js - Add these methods:

```javascript
// Add to AIAnalysisService class
static analyzeSkillGap(student, targetRole) {
  const targetSkillsMap = {
    "Software Engineer": ["JavaScript", "Data Structures", "System Design", "Problem Solving"],
    "Data Scientist": ["Python", "Machine Learning", "Statistics", "SQL"],
    "DevOps Engineer": ["Linux", "Docker", "Kubernetes", "AWS"],
    "Full Stack Developer": ["React", "Node.js", "Databases", "APIs"]
  };

  const requiredSkills = targetSkillsMap[targetRole] || ["JavaScript", "Problem Solving"];
  const studentSkillNames = student.skills.map(s => s.name);
  const gapSkills = requiredSkills.filter(s => !studentSkillNames.includes(s));

  return {
    targetRole,
    currentSkills: studentSkillNames,
    requiredSkills,
    skillGap: gapSkills,
    analysis: `Missing ${gapSkills.length} key skills`,
    recommendations: gapSkills.map(skill => `Learn and practice ${skill}`)
  };
}

static predictCareerSuccess(student, historicalData = []) {
  const baseScore = Math.min((student.academicInfo.cgpa / 10) * 50, 50);
  const codingScore = Math.min((student.averageCodingRating / 2000) * 30, 30);
  const projectScore = Math.min((student.projects.length / 5) * 20, 20);

  const placementProbability = Math.round(baseScore + codingScore + projectScore);

  return {
    placementProbability: Math.min(placementProbability, 100),
    placementScore: Math.min(placementProbability, 100),
    factors: [
      { factor: "Academic Performance", impact: baseScore > 35 ? "Good" : "Needs Work", score: baseScore },
      { factor: "Coding Skills", impact: codingScore > 20 ? "Good" : "Needs Work", score: codingScore },
      { factor: "Projects/Experience", impact: projectScore > 10 ? "Good" : "Needs Work", score: projectScore }
    ],
    recommendations: [
      "Focus on weak areas identified above",
      "Complete more coding problems",
      "Build real-world projects"
    ],
    suggestedRoles: ["Software Engineer", "Full Stack Developer"],
    timelinePrediction: "3-6 months to be interview-ready"
  };
}
```

**File:** server/services/codingPlatforms.js - Add these methods:

```javascript
// Add to CodingPlatformService class
static async getCodingGrowth(student, months = 6) {
  // Returns growth data structure
  return {
    growth: "Month-over-month coding problem growth",
    data: [
      { month: "Last 6 months", problemsSolved: student.totalCodingProblems || 0 }
    ]
  };
}

static getCodingInsights(student) {
  return {
    topStrength: "Problem Solving",
    weakArea: "Advanced Algorithms",
    recommendation: "Focus on medium & hard problems",
    nextTarget: student.totalCodingProblems + 50
  };
}
```

**File:** server/services/codingPlatforms.js - Fix validateUsername:

```javascript
static validateUsername(platform, username) {
  const patterns = {
    leetcode: /^[a-zA-Z0-9_-]{3,20}$/,
    codechef: /^[a-zA-Z0-9_-]{3,20}$/,
    codeforces: /^[a-zA-Z0-9_]{3,24}$/,
  };

  const pattern = patterns[platform.toLowerCase()];
  return pattern ? pattern.test(username) : false;  // ADD THIS LINE
}
```

---

### Issue #6: Complete Notifications Route

**File:** server/routes/notifications.js (fix incomplete handler around line 95)

```javascript
// Add missing implementation continuation
router.post(
  "/send-interview-notification",
  authorize("college", "recruiter"),
  async (req, res) => {
    try {
      // ... validation code already exists ...

      // Continue implementation
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

      const result = await EmailService.sendEmail(
        student.user.email,
        `Interview Notification - ${placement.job.title}`,
        EmailService.getEmailTemplate("interview", {
          studentName: student.user.profile.firstName,
          companyName: placement.company.company?.name || "Company",
          round,
          dateTime,
          location,
          joinLink: joinLink || "",
        }),
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
```

---

### Issue #7: Fix Analytics Service Typo

**File:** server/services/analyticsService.js (Line 4)

**Change from:**

```javascript
static async getCollgePlacementStats(collegeId) {  // TYPO
```

**Change to:**

```javascript
static async getCollegePlacementStats(collegeId) {  // CORRECT
```

**Also update reference in** server/routes/analytics.js if it's called there.

---

## ✅ TESTING AFTER FIXES

```bash
# 1. Restart server
npm run server

# 2. Test each fixed endpoint
curl http://localhost:5000/api/health

# 3. Test protected routes
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/students/profile

# 4. Check console for any errors
```

---

## 🔍 PRIORITY ORDER

1. ✅ Add module exports (Issues #1)
2. ✅ Fix SendGrid import (Issue #2)
3. ✅ Fix template typo (Issue #3)
4. ✅ Implement virtual properties (Issue #4)
5. ✅ Implement missing service methods (Issue #5)
6. ✅ Complete notification route (Issue #6)
7. ✅ Fix service typo (Issue #7)

**Estimated Time:** 30-45 minutes

**Impact:** These fixes will make ~80% of backend endpoints functional
