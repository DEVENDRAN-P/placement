# 🚀 PHASE 1: Security & Stability Implementation Guide

**Goal:** Make the system secure and stable enough for real testing  
**Timeline:** 1-2 weeks  
**Priority:** Do these FIRST before any other development

---

## 📋 Phase 1 Tasks (In Order)

### Task 1: Input Validation (6 hours)

**Impact:** Prevents injection attacks, data corruption  
**Difficulty:** Easy

**Step 1.1: Install express-validator**

```bash
npm install express-validator
```

**Step 1.2: Create validation middleware**
Create `server/middleware/validation.js`:

```javascript
const { body, query, param, validationResult } = require("express-validator");

// Validation rules
const studentFilterRules = () => [
  body("minCGPA")
    .optional()
    .isFloat({ min: 0, max: 10 })
    .withMessage("CGPA must be between 0-10")
    .toFloat(),
  body("maxCGPA")
    .optional()
    .isFloat({ min: 0, max: 10 })
    .withMessage("CGPA must be between 0-10")
    .toFloat(),
  body("department").optional().trim().isLength({ min: 1, max: 50 }).escape(),
  body("year")
    .optional()
    .isInt({ min: 1, max: 4 })
    .withMessage("Year must be 1-4")
    .toInt(),
  body("minCodingRating").optional().isInt({ min: 0, max: 3500 }).toInt(),
  body("skills")
    .optional()
    .isArray({ max: 20 })
    .withMessage("Max 20 skills allowed"),
  body("searchQuery").optional().trim().isLength({ min: 1, max: 100 }).escape(),
];

const emailRules = () => [
  body("subject")
    .notEmpty()
    .withMessage("Subject required")
    .trim()
    .isLength({ min: 5, max: 200 })
    .escape(),
  body("message")
    .notEmpty()
    .withMessage("Message required")
    .isLength({ min: 10, max: 5000 })
    .escape(),
  body("studentIds")
    .isArray({ min: 1, max: 1000 })
    .withMessage("Must select 1-1000 students"),
];

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((e) => ({
        field: e.param,
        message: e.msg,
      })),
    });
  }
  next();
};

module.exports = {
  studentFilterRules,
  emailRules,
  handleValidationErrors,
};
```

**Step 1.3: Apply to routes**
Update `server/routes/placements.js`:

```javascript
const {
  studentFilterRules,
  emailRules,
  handleValidationErrors,
} = require("../middleware/validation");

// Before: router.post("/filter", protect, authorize("college"), async (req, res) => {
// After:
router.post(
  "/filter",
  protect,
  authorize("college"),
  studentFilterRules(),
  handleValidationErrors,
  async (req, res) => {
    // Now req.body is validated and sanitized
    const {
      minCGPA = 0,
      maxCGPA = 10,
      department,
      year,
      minCodingRating = 0,
      skills = [],
      searchQuery,
    } = req.body;
    // ... rest of code
  },
);

router.post(
  "/send-update",
  protect,
  authorize("college"),
  emailRules(),
  handleValidationErrors,
  async (req, res) => {
    // ... validated data
  },
);
```

**Status:** When validation prevents injection attempts, log them for monitoring

---

### Task 2: Email Job Queue (8 hours)

**Impact:** Prevents SMTP timeouts, enables retry logic  
**Difficulty:** Medium  
**Requires:** Redis (or local development alternative)

**Step 2.1: Install Bull + Redis**

```bash
npm install bull redis
```

**Step 2.2: Create email queue**
Create `server/services/emailQueue.js`:

```javascript
const Queue = require("bull");
const emailService = require("./emailService");
const Student = require("../models/Student");
const logger = require("../utils/logger"); // Create this for logging

const emailQueue = new Queue("email-notifications", {
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: process.env.REDIS_PORT || 6379,
  },
});

// Process jobs (runs in background)
emailQueue.process(5, async (job) => {
  const { studentIds, subject, message, collegeId } = job.data;
  const totalStudents = studentIds.length;
  let sentCount = 0;
  let failedCount = 0;

  logger.info(`Email job ${job.id} started`, {
    jobId: job.id,
    totalStudents,
    collegeId,
  });

  try {
    for (let i = 0; i < totalStudents; i++) {
      try {
        const student = await Student.findById(studentIds[i])
          .populate("user", "email")
          .lean();

        if (student?.user?.email) {
          await emailService.sendEmail({
            to: student.user.email,
            subject,
            html: message,
          });
          sentCount++;
        }
      } catch (error) {
        failedCount++;
        logger.warn(`Email failed for student ${studentIds[i]}`, {
          error: error.message,
        });
      }

      // Update job progress
      job.progress(Math.round(((i + 1) / totalStudents) * 100));
    }

    const result = {
      jobId: job.id,
      sentCount,
      failedCount,
      totalStudents,
      timestamp: new Date(),
    };

    logger.info(`Email job ${job.id} completed`, result);
    return result;
  } catch (error) {
    logger.error(`Email job ${job.id} failed`, {
      error: error.message,
      stack: error.stack,
    });
    throw error; // Bull will retry
  }
});

// Job success event
emailQueue.on("completed", (job, result) => {
  logger.info(`Email job completed successfully`, {
    jobId: job.id,
    result,
  });
});

// Job failure event
emailQueue.on("failed", (job, error) => {
  logger.error(`Email job failed after retries`, {
    jobId: job.id,
    attempts: job.attemptsMade,
    error: error.message,
  });
});

module.exports = { emailQueue };
```

**Step 2.3: Update email endpoint**
Update `server/routes/placements.js`:

```javascript
const { emailQueue } = require("../services/emailQueue");

router.post(
  "/send-update",
  protect,
  authorize("college"),
  emailRules(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { studentIds, subject, message } = req.body;

      // Queue the job
      const job = await emailQueue.add(
        {
          studentIds,
          subject,
          message,
          collegeId: req.user._id || req.user.id,
        },
        {
          attempts: 3, // Retry 3 times on failure
          backoff: {
            type: "exponential",
            delay: 2000, // Start with 2s, then 4s, then 8s
          },
          removeOnComplete: true, // Clean up after success
          removeOnFail: false, // Keep failed jobs for debugging
        },
      );

      logger.info("Email job queued", {
        jobId: job.id,
        studentCount: studentIds.length,
        user: req.user._id,
      });

      return res.json({
        success: true,
        message: "Email notification queued successfully",
        jobId: job.id,
        studentCount: studentIds.length,
        estimatedTime: "2-5 minutes",
      });
    } catch (error) {
      logger.error("Failed to queue email", { error: error.message });
      res.status(500).json({
        success: false,
        message: "Failed to queue emails",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },
);

// NEW: Check email job status
router.get(
  "/email-status/:jobId",
  protect,
  authorize("college"),
  async (req, res) => {
    try {
      const job = await emailQueue.getJob(req.params.jobId);

      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }

      const state = await job.getState();
      const progress = job.progress();

      res.json({
        jobId: job.id,
        state,
        progress,
        data: job.data,
        result: job.returnvalue,
        failedReason: job.failedReason,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);
```

**Step 2.4: Add to server startup**
In `server/index.js`:

```javascript
// Make sure Bull/Redis queue is initialized
const { emailQueue } = require("./services/emailQueue");

// ... after all route setup ...

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Email queue initialized and ready");
});
```

**Status:** Emails now queue and retry automatically. Can be monitored via job status endpoint.

---

### Task 3: Rate Limiting (4 hours)

**Impact:** Prevents DoS, scraping, abuse  
**Difficulty:** Easy

**Step 3.1: Install rate limiting package**

```bash
npm install express-rate-limit
```

**Step 3.2: Create rate limiting middleware**
Create `server/middleware/rateLimit.js`:

```javascript
const rateLimit = require("express-rate-limit");

// Global limiter (basic protection)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requests per 15 min
  message: "Too many requests, please try again later",
  standardHeaders: true, // Return rate limit info in headers
  skip: (req) => process.env.NODE_ENV === "development", // Disable in dev
});

// Stricter limiter for email (1 per minute per college)
const emailLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 1, // 1 bulk email per minute
  keyGenerator: (req) => req.user?._id || req.user?.id || req.ip,
  message: "Only 1 bulk email per minute. Please wait.",
  skip: (req) => process.env.NODE_ENV === "development",
});

// Stricter limiter for public profile access (100 per 15 min per IP)
const publicProfileLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many profile requests. Please try again later.",
  skip: (req) => process.env.NODE_ENV === "development",
});

// Filter limiter (10 per minute per user)
const filterLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  keyGenerator: (req) => req.user?._id || req.user?.id || req.ip,
  message: "Too many filter requests. Please wait.",
  skip: (req) => process.env.NODE_ENV === "development",
});

module.exports = {
  globalLimiter,
  emailLimiter,
  publicProfileLimiter,
  filterLimiter,
};
```

**Step 3.3: Apply rate limiting to routes**
Update `server/index.js`:

```javascript
const {
  globalLimiter,
  emailLimiter,
  publicProfileLimiter,
  filterLimiter,
} = require("./middleware/rateLimit");

// Apply global limiter to all routes
app.use(globalLimiter);

// ... other middleware ...
```

Update `server/routes/placements.js`:

```javascript
const {
  emailLimiter,
  publicProfileLimiter,
  filterLimiter,
} = require("../middleware/rateLimit");

// Public routes
router.get(
  "/students/public/:studentId",
  publicProfileLimiter,
  async (req, res) => {
    // ... existing code
  },
);

// Protected routes
router.post(
  "/filter",
  protect,
  authorize("college"),
  filterLimiter,
  studentFilterRules(),
  handleValidationErrors,
  async (req, res) => {
    // ... existing code
  },
);

router.post(
  "/send-update",
  protect,
  authorize("college"),
  emailLimiter,
  emailRules(),
  handleValidationErrors,
  async (req, res) => {
    // ... existing code
  },
);
```

**Status:** API now protected from abuse, brute force, and scraping

---

### Task 4: Pagination (4 hours)

**Impact:** Handles large datasets without crashing  
**Difficulty:** Easy

**Step 4.1: Create pagination utility**
Create `server/utils/pagination.js`:

```javascript
const getPaginationParams = (query) => {
  let page = parseInt(query.page) || 1;
  let limit = parseInt(query.limit) || 50;

  // Validate ranges
  page = Math.max(1, page);
  limit = Math.min(100, Math.max(1, limit)); // Min 1, Max 100

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

const buildPaginationResponse = (data, total, page, limit) => {
  return {
    data,
    pagination: {
      current: page,
      pageSize: limit,
      total,
      pages: Math.ceil(total / limit),
      hasMore: page * limit < total,
      hasPrevious: page > 1,
    },
  };
};

module.exports = { getPaginationParams, buildPaginationResponse };
```

**Step 4.2: Update filter endpoint**
Update in `server/routes/placements.js`:

```javascript
const {
  getPaginationParams,
  buildPaginationResponse,
} = require("../utils/pagination");

router.post(
  "/filter",
  protect,
  authorize("college"),
  filterLimiter,
  studentFilterRules(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const {
        minCGPA = 0,
        maxCGPA = 10,
        department,
        year,
        minCodingRating = 0,
        skills = [],
        searchQuery,
      } = req.body;
      const { page, limit, skip } = getPaginationParams(req.body);

      let query = { college: req.user._id || req.user.id };

      // ... existing filter logic ...

      // Count total (before pagination)
      const total = await Student.countDocuments(query);

      // Get paginated results
      const students = await Student.find(query)
        .populate("user", "email")
        .select("-__v")
        .limit(limit)
        .skip(skip)
        .lean();

      const response = buildPaginationResponse(students, total, page, limit);

      res.json({
        success: true,
        ...response,
      });
    } catch (error) {
      logger.error("Filter students error", { error: error.message });
      res.status(500).json({
        success: false,
        message: "Failed to filter students",
      });
    }
  },
);
```

**Step 4.3: Update shortlist endpoint**
Similar pagination logic for `POST /shortlist`

**Status:** All list endpoints now handle unlimited data safely

---

## 🧪 Phase 1 Testing Checklist

After implementing Phase 1, verify:

### Input Validation Tests

```javascript
// Test: Invalid CGPA should be rejected
POST /api/placements/filter
{
  "minCGPA": 15, // Invalid: > 10
  "searchQuery": "<script>alert(1)</script>" // Should be escaped
}
// Expected: 400 Bad Request with validation errors
```

### Email Queue Tests

```javascript
// Test: Email job should queue
POST /api/placements/send-update
{
  "subject": "Test",
  "message": "Test message",
  "studentIds": ["id1", "id2", "id3"]
}
// Expected: 202 Accepted with jobId
// Check queue status after 1 second
GET /api/placements/email-status/:jobId
// Expected: { state: "processing", progress: 33 }
```

### Rate Limiting Tests

```bash
# Test: Rapid email sends should fail
for i in {1..5}; do
  curl -X POST http://localhost:5000/api/placements/send-update \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"subject":"Test","message":"Test","studentIds":["id1"]}'
done
# Expected: 1st succeeds, 2-5 fail with 429 Too Many Requests
```

### Pagination Tests

```javascript
// Test: Large dataset should not return everything
POST /api/placements/filter
{
  "minCGPA": 0,
  "page": 1,
  "limit": 50
}
// Expected: { data: [50 items], pagination: { pages: 1000, hasMore: true } }

// Test: Limit is capped
POST /api/placements/filter
{
  "page": 1,
  "limit": 10000 // Requested 10K
}
// Expected: Returns 100 items (capped), pagination shows limit: 100
```

---

## 📊 Phase 1 Completion Checklist

- [ ] All routes have input validation with express-validator
- [ ] Email endpoint uses Bull job queue with retry logic
- [ ] Rate limiting applied to public endpoints (publicProfileLimiter)
- [ ] Rate limiting applied to protected endpoints (emailLimiter, filterLimiter)
- [ ] All list endpoints implement pagination
- [ ] Logger created and logs are persistent (not just console)
- [ ] Tests pass for validation, queueing, rate limit, pagination
- [ ] .env includes REDIS_HOST, REDIS_PORT
- [ ] Documentation updated to reflect changes

---

## 🚀 When Phase 1 is Complete

**You can now:**

- ✅ Deploy to staging without security vulnerabilities
- ✅ Handle 50K+ students without crashing
- ✅ Resend failed emails automatically
- ✅ Prevent abuse and scraping
- ✅ Sleep at night knowing data is validated

**Still needed before production:**

- Phase 2: Data quality, public profile security, observability
- Phase 3: Testing (unit, integration, API)
- Phase 4: Documentation and polish

**Estimated time to completion:** 1-2 weeks with focused effort 🎯

---

**Phase 1 Implementation Guide**  
**Ready to start?** Begin with Task 1: Input Validation (easiest, highest impact)
