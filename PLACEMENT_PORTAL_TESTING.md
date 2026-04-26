# Placement Portal - Testing & Validation Guide

## ✅ Pre-Launch Checklist

### Build Verification

- [x] Frontend compiles without critical errors
- [x] TypeScript type checking passes
- [x] No missing imports
- [x] Routes properly registered

### Code Quality

- [x] All endpoints have error handling
- [x] Authorization checks in place
- [x] Input validation implemented
- [x] Console.logs are appropriate

---

## 🧪 Unit Tests to Implement

### AI Scoring Algorithm Tests

```javascript
// Test 1: Perfect student
const perfectStudent = {
  codingProfiles: { leetcode: { rating: 2500 } },
  academicInfo: { cgpa: 10 },
  skills: [{ name: "JavaScript" }, { name: "React" }],
  projects: [1, 2, 3, 4, 5],
};
// Expected score: 100

// Test 2: Average student
const avgStudent = {
  codingProfiles: { leetcode: { rating: 1250 } },
  academicInfo: { cgpa: 5 },
  skills: [{ name: "JavaScript" }],
  projects: [1, 2],
};
// Expected score: ~50

// Test 3: High coding, low CGPA
const codingFocus = {
  codingProfiles: { leetcode: { rating: 2500 } },
  academicInfo: { cgpa: 5 },
  skills: [{ name: "C++" }],
  projects: [1],
};
// Expected score: ~65 (weighted towards coding)
```

### Filter Algorithm Tests

```javascript
// Test 1: CGPA range filter
// Input: minCGPA: 7.0, maxCGPA: 8.5
// Should return only students with CGPA 7.0 ≤ x ≤ 8.5

// Test 2: Department filter
// Input: department: 'Computer Science'
// Should return only CS students

// Test 3: Multi-criteria
// Input: CGPA 7.0+, CS dept, coding rating 1200+
// Should AND all conditions

// Test 4: Search filter
// Input: searchQuery: 'raj'
// Should match name case-insensitive
```

### Email System Tests

```javascript
// Test 1: Email validation
// Invalid: "not-an-email"
// Valid: "user@domain.com"

// Test 2: Bulk send
// Recipients: ["user1@test.com", "user2@test.com"]
// Should send to both without duplicates

// Test 3: Template rendering
// Subject: "Placement: {{company}}"
// Should replace variables correctly

// Test 4: Error handling
// Invalid SMTP credentials should show helpful error
// Network timeout should be retried
```

---

## 🔗 Integration Tests

### Test 1: Full Filtering Pipeline

```
1. Create test students in MongoDB
2. Call POST /api/placements/filter
3. Verify results match criteria
4. Check response format
5. Validate data types
```

**Test Data Required:**

```javascript
{
  name: "Raj Kumar",
  email: "raj@test.com",
  academicInfo: {
    cgpa: 8.5,
    department: "Computer Science",
    year: 4
  },
  codingProfiles: {
    leetcode: { rating: 2000 }
  },
  skills: [
    { name: "JavaScript", verified: true },
    { name: "React", verified: true }
  ],
  projects: [
    { title: "Project 1", technologies: ["React"] },
    { title: "Project 2", technologies: ["Node.js"] }
  ]
}
```

### Test 2: AI Shortlisting Pipeline

```
1. Filter to get 10 students
2. Call POST /api/placements/shortlist
3. Verify scores calculated correctly
4. Check sorting is descending
5. Validate breakdown sums to total
```

**Validation Formula:**

```
Total = (Coding * 0.4) + (CGPA * 0.3) + (Skills * 0.2) + (Projects * 0.1)
Should equal breakdown.total (within 0.1 margin)
```

### Test 3: Email Sending Pipeline

```
1. Select students from shortlist
2. Compose email in form
3. Call POST /api/placements/send-update
4. Check in actual email inbox
5. Verify all recipients received
```

**Validation:**

- [ ] Email arrives within 30 seconds
- [ ] Subject line intact
- [ ] Message formatting preserved
- [ ] No missing data
- [ ] Timestamp correct

### Test 4: Public Profile Pipeline

```
1. Create student with isProfilePublic: true
2. Go to /student/public/:studentId
3. Verify all sections load
4. Download resume
5. Check responsive design
```

**Validation:**

- [ ] Page loads without auth
- [ ] No 404 errors
- [ ] Verification badges display
- [ ] Coding stats show
- [ ] Resume downloadable
- [ ] Mobile view works

---

## 📋 Manual Testing Scenarios

### Scenario 1: College Admin Workflow

**Actor:** College Placement Officer
**Time:** ~10 minutes

```
1. Login to college account
2. Navigate to /college/placement-portal
3. View Overview tab
   ✓ Check total students count
   ✓ Check placed count
   ✓ Check eligible count (CGPA ≥ 7.0)
4. Go to Filter tab
   ✓ Set CGPA 7.5-10
   ✓ Select department "Computer Science"
   ✓ Set min coding rating 1200
   ✓ Click "Filter Students"
   ✓ Verify results appear
5. Click "Shortlist Selected"
   ✓ AI scores should appear
   ✓ Scores should be 0-100
   ✓ List should be sorted descending
6. Go to Notifications tab
   ✓ Type subject: "Google Recruitment Drive"
   ✓ Type message: "Join our placement drive"
   ✓ Select all students
   ✓ Click "Send Emails"
   ✓ Verify confirmation
7. Click "Export Shortlist"
   ✓ CSV file downloads
   ✓ Open and verify data
```

**Success Criteria:**

- All features work without errors
- Data is accurate
- UX is intuitive
- No missing fields in export

### Scenario 2: Recruiter Viewing Student Profile

**Actor:** Company Recruiter
**Time:** ~5 minutes

```
1. Receive student profile link from college
2. Visit /student/public/{studentId}
3. View student information
   ✓ Verification badge shows
   ✓ CGPA displays correctly
   ✓ Skills list visible
4. Check coding profiles
   ✓ LeetCode stats show
   ✓ CodeChef stats show
   ✓ Codeforces stats show
   ✓ Ratings color-coded
5. View projects
   ✓ Project titles visible
   ✓ Technologies listed
   ✓ Links clickable
6. Check resume
   ✓ Download button works
   ✓ Plagiarism score displays
7. Click "Contact"
   ✓ Email form opens
   ✓ Student email pre-filled
```

**Success Criteria:**

- Profile loads quickly
- All data is accurate
- Links are working
- Resume downloads successfully

### Scenario 3: Data Export and Legacy System Integration

**Actor:** College Admin
**Time:** ~5 minutes

```
1. In Shortlist tab, click "Export Shortlist"
2. CSV file downloads
3. Open in Excel/Sheets
   ✓ Headers are correct
   ✓ Data rows align
   ✓ No data loss
   ✓ Formatting preserved
4. Import to legacy system
   ✓ All fields recognized
   ✓ No encoding issues
   ✓ Student count matches
```

**Success Criteria:**

- CSV is properly formatted
- All required fields present
- Data integrity maintained
- Compatible with Excel/Sheets

---

## 🐛 Common Issues & Solutions

### Issue: Filter returns empty results

**Symptoms:** No students found even though they should exist

**Debug Steps:**

1. Check MongoDB connection
2. Verify test students exist: `db.students.count()`
3. Check filter values are valid
4. Add console.log in placements.js filter endpoint
5. Look at actual MongoDB query

**Solution:**

```javascript
// Add logging in placements.js
console.log("Filter criteria:", req.body);
console.log("MongoDB query:", query);
const results = await Student.find(query);
console.log("Results count:", results.length);
```

### Issue: AI scores are always 0

**Symptoms:** All scores show 0 even for good students

**Debug Steps:**

1. Check studentIds exist and have data
2. Verify coding profiles are populated
3. Check CGPA field exists
4. Look at calculateScore function

**Solution:**

```javascript
// Verify data exists before scoring
console.log("Student data:", student);
console.log("Coding profiles:", student.codingProfiles);
console.log("CGPA:", student.academicInfo.cgpa);
```

### Issue: Emails not being sent

**Symptoms:** Email endpoint returns success but no email received

**Debug Steps:**

1. Check .env has valid credentials
2. Verify SMTP settings
3. Check transporter is initialized
4. Look for SMTP errors in logs

**Solution:**

```javascript
// Test transporter connection
transporter.verify((error, success) => {
  if (error) {
    console.error("Transporter error:", error);
  } else {
    console.log("Transporter ready:", success);
  }
});
```

### Issue: Public profile shows 404

**Symptoms:** `/student/public/:studentId` returns 404

**Debug Steps:**

1. Verify studentId is valid ObjectId
2. Check student exists: `db.students.findById(id)`
3. Check isProfilePublic is true
4. Look at server logs

**Solution:**

```javascript
// Check in placements.js
const student = await Student.findById(studentId);
if (!student) {
  console.error("Student not found:", studentId);
  return res.status(404).json({ error: "Student not found" });
}
if (!student.isProfilePublic) {
  console.warn("Profile not public:", studentId);
  return res.status(403).json({ error: "Profile is private" });
}
```

---

## 📊 Performance Benchmarks

### Expected Response Times

| Endpoint       | Operation      | Time   |
| -------------- | -------------- | ------ |
| `/filter`      | 100 students   | ~100ms |
| `/filter`      | 1000 students  | ~300ms |
| `/shortlist`   | 10 students    | ~50ms  |
| `/shortlist`   | 100 students   | ~150ms |
| `/send-update` | 10 emails      | ~2s    |
| `/send-update` | 100 emails     | ~15s   |
| `/export`      | 100 students   | ~500ms |
| `/public/:id`  | Single profile | ~100ms |

### Load Testing

```
Tool: Artillery or LoadImpact
Scenario: 50 concurrent users
Duration: 5 minutes

Expected:
- Filter: <500ms at 90th percentile
- Shortlist: <300ms at 90th percentile
- Public profile: <300ms at 90th percentile
- No errors beyond 10% failure rate acceptable
```

---

## ✅ Pre-Production Checklist

### Code Quality

- [ ] No console.log calls left (except dev)
- [ ] All error messages are user-friendly
- [ ] Input validation is complete
- [ ] SQL injection prevention checked (MongoDB injection)
- [ ] CORS is properly configured

### Security

- [ ] Authorization on all endpoints
- [ ] Sensitive data not exposed
- [ ] Email validation before sending
- [ ] Rate limiting on email endpoint
- [ ] HTTPS enforced in production

### Performance

- [ ] Database indexes created
- [ ] Queries are optimized
- [ ] No N+1 query problems
- [ ] Caching strategy defined
- [ ] Response times acceptable

### Documentation

- [ ] API docs complete
- [ ] Code comments added
- [ ] README updated
- [ ] Deployment guide written
- [ ] Troubleshooting guide created

### Testing

- [ ] Unit tests written
- [ ] Integration tests passing
- [ ] Manual testing completed
- [ ] Edge cases handled
- [ ] Error scenarios tested

---

## 🚀 Deployment Steps

### Pre-Deployment

```bash
1. npm run build (frontend)
2. npm test (if tests exist)
3. Verify .env is set up
4. Check database is ready
5. Review security settings
```

### Deployment

```bash
1. Deploy frontend (build artifacts)
2. Deploy backend (start node server)
3. Run database migrations
4. Warm up caches
5. Monitor for errors
```

### Post-Deployment

```bash
1. Monitor error logs
2. Check API response times
3. Verify email sending
4. Test public profiles
5. Monitor database load
```

---

## 📞 Support & Escalation

### Level 1: Self-Service

- Check documentation
- Look at error messages
- Search logs
- Review code comments

### Level 2: Developer Support

- Escalate to development team
- Provide error logs
- Share test case
- Describe expected vs actual

### Level 3: Emergency

- Contact lead developer
- Provide reproduction steps
- Include database state
- Share network trace

---

**Testing Guide Version:** 1.0  
**Last Updated:** April 26, 2026  
**Status:** Ready for QA
