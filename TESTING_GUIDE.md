# Career Intelligence Portal - Testing Guide

Complete end-to-end testing procedures for all 13 core features.

## Prerequisites for Testing

1. **Ensure Services Are Running**

   ```powershell
   # Backend API (Port 5000)
   npm run server

   # Frontend React App (Port 3000)
   npm run client

   # MongoDB should be running
   ```

2. **Test Accounts Created**
   - Student account
   - College admin account
   - Recruiter account

3. **Postman Collection** (Optional but recommended)
   - Import the API testing collection for backend endpoints
   - Set environment variables for tokens

---

## Part 1: Student Features Testing

### Feature 1: Smart Student Profile

**Purpose**: Create comprehensive student profiles with academics, skills, projects, achievements

**Test Cases**:

1. **Registration & Profile Creation**
   - [ ] Navigate to `/auth/register` as student
   - [ ] Fill in basic info (email, password, name, phone)
   - [ ] Verify email confirmation email arrives
   - [ ] Click verification link and confirm email
   - [ ] Log in successfully

2. **Academic Information**
   - [ ] Go to `/student/profile`
   - [ ] Enter academic details:
     - [ ] College selection
     - [ ] Department selection
     - [ ] Year/Semester
     - [ ] CGPA
     - [ ] Attendance
     - [ ] Backlogs
   - [ ] Save and verify data persists
   - [ ] Update CGPA and verify changes reflect

3. **Skills Management**
   - [ ] Add multiple skills with proficiency levels
   - [ ] Mark skills as verified/unverified
   - [ ] Edit and delete skills
   - [ ] Verify skills appear in profile card

4. **Projects & Achievements**
   - [ ] Add project with details (name, description, link, status)
   - [ ] Add multiple projects and verify list
   - [ ] Add certifications
   - [ ] Add achievements
   - [ ] Delete items and verify removal

5. **Resume Upload**
   - [ ] Upload PDF resume
   - [ ] Verify file size < 5MB
   - [ ] Download uploaded resume
   - [ ] Replace with new resume

**API Tests**:

```bash
# GET student profile
curl -X GET http://localhost:5000/api/students/profile \
  -H "Authorization: Bearer YOUR_TOKEN"

# POST update profile
curl -X POST http://localhost:5000/api/students/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "academicInfo": {
      "cgpa": 8.5,
      "department": "Computer Science",
      "year": 3,
      "attendance": 95,
      "backlogs": 0
    }
  }'
```

---

### Feature 2: Coding Platform Integration

**Purpose**: Auto-fetch stats from LeetCode, CodeChef, and Codeforces

**Test Cases**:

1. **Connect LeetCode Account**
   - [ ] Go to `/student/coding-profiles`
   - [ ] Enter LeetCode username
   - [ ] Click "Fetch Stats"
   - [ ] Verify stats display: problems solved, rating, submission count
   - [ ] Verify data auto-saves

2. **Connect CodeChef Account**
   - [ ] Enter CodeChef username
   - [ ] Click "Fetch Stats"
   - [ ] Verify stats display: rating, stars, contests
   - [ ] Verify data persists

3. **Connect Codeforces Account**
   - [ ] Enter Codeforces username
   - [ ] Click "Fetch Stats"
   - [ ] Verify stats display: rating, rank, contests solved
   - [ ] Verify data persists

4. **Multi-Platform Dashboard**
   - [ ] View combined stats from all platforms
   - [ ] Verify total problems solved across platforms
   - [ ] Verify average rating calculation
   - [ ] View platform distribution chart

5. **Invalid Username Handling**
   - [ ] Enter invalid username
   - [ ] Verify error handling and user-friendly message

**API Tests**:

```bash
# Fetch all coding stats
curl -X POST http://localhost:5000/api/coding/fetch-all-stats \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "leetcodeUsername": "username",
    "codechefUsername": "username",
    "codeforcesUsername": "username"
  }'

# Get growth analytics
curl -X GET "http://localhost:5000/api/coding/growth-analytics?months=6" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Feature 3: AI Skill Gap Analysis

**Purpose**: Get personalized career advice and skill recommendations

**Test Cases**:

1. **Profile Analysis**
   - [ ] Complete student profile with skills, projects, academics
   - [ ] Go to `/student/skill-gap-analysis`
   - [ ] Review identified skill gaps

2. **Gap Identification**
   - [ ] Verify system identifies missing in-demand skills
   - [ ] Check recommendations are relevant to department/role
   - [ ] Verify coding platform data is factored into gaps

3. **Recommendations**
   - [ ] Review personalized learning recommendations
   - [ ] Check resource links (courses, articles)
   - [ ] Verify difficulty progression suggestions

4. **Email Report**
   - [ ] Click "Send Report to Email"
   - [ ] Verify email arrives with PDF report
   - [ ] Check report formatting and data accuracy

**Manual Testing**:

```javascript
// Browser console test
fetch("http://localhost:5000/api/ai/skill-gap", {
  headers: { Authorization: "Bearer YOUR_TOKEN" },
})
  .then((r) => r.json())
  .then((data) => console.log(data.data.gaps, data.data.recommendations));
```

---

### Feature 4: Career Prediction Engine

**Purpose**: AI-powered placement probability predictions

**Test Cases**:

1. **Open Prediction Tool**
   - [ ] Navigate to `/student/career-prediction`
   - [ ] Verify all profile data is loaded

2. **Prediction Calculation**
   - [ ] Verify placement probability score (0-100%)
   - [ ] Check probability breakdown:
     - [ ] CGPA factor (30%)
     - [ ] Coding skills factor (25%)
     - [ ] Projects factor (20%)
     - [ ] Skills/Certs factor (15%)
     - [ ] Soft skills factor (10%)

3. **Company Fit Analysis**
   - [ ] View matched companies list
   - [ ] Verify companies are relevant to skills/department
   - [ ] Check company match percentage
   - [ ] Review role recommendations

4. **Success Factors**
   - [ ] View factors improving placement chances
   - [ ] Check actionable improvement suggestions
   - [ ] Verify package range estimation

5. **Package Estimation**
   - [ ] Verify minimum and maximum package predictions
   - [ ] Check if estimates are department-specific
   - [ ] Compare with historical placement data

**Testing Different Profiles**:

```
Test Case 1: High-performing student
- CGPA: 9.0+, 300+ coding problems, 5+ projects
- Expected: >85% placement probability

Test Case 2: Average student
- CGPA: 7.0-8.0, 100 coding problems, 2-3 projects
- Expected: 60-75% placement probability

Test Case 3: Low-performing student
- CGPA: <6.5, <50 coding problems, 0-1 projects
- Expected: <50% placement probability
```

---

### Feature 5: Coding Growth Tracker

**Purpose**: Visualize coding progress with detailed analytics

**Test Cases**:

1. **6-Month Growth Chart**
   - [ ] Navigate to `/student/coding-growth`
   - [ ] View line chart showing problem solving trend
   - [ ] Zoom in on specific months
   - [ ] Verify data spans last 6 months

2. **Platform Comparison**
   - [ ] View bar chart: problems per platform
   - [ ] Verify LeetCode, CodeChef, Codeforces displayed
   - [ ] Check hover tooltips show exact counts

3. **Rating Progression**
   - [ ] View rating history for each platform
   - [ ] Verify upward/downward trends
   - [ ] Check milestone achievements (e.g., "Rating 1600")

4. **Performance Insights**
   - [ ] View difficulty distribution (Easy/Medium/Hard)
   - [ ] See acceptance rate trends
   - [ ] Check weekly/monthly averages
   - [ ] View consistency score

5. **Export Options**
   - [ ] Export growth data as CSV
   - [ ] Export chart as PNG/PDF
   - [ ] Verify data accuracy in exports

---

### Feature 6: Resume Builder & Plagiarism Detection

**Purpose**: Upload and analyze resumes with plagiarism detection

**Test Cases**:

1. **Resume Upload**
   - [ ] Go to `/student/resume-builder`
   - [ ] Upload PDF file
   - [ ] Verify file size validation (max 5MB)
   - [ ] Verify file type validation (.pdf, .doc, .docx)

2. **Resume Analysis**
   - [ ] After upload, view automated analysis
   - [ ] Check sections identified: Contact, Summary, Experience, Education, Skills
   - [ ] Verify skill extraction matches added skills
   - [ ] Review ATS compatibility score

3. **Plagiarism Scan**
   - [ ] Click "Scan for Plagiarism"
   - [ ] Verify scan completes in reasonable time
   - [ ] Check plagiarism percentage
   - [ ] View similar documents (if any matches found)

4. **Resume Quality Tips**
   - [ ] View formatting recommendations
   - [ ] Check readability suggestions
   - [ ] See missing sections alerts
   - [ ] Verify keyword suggestions based on target roles

5. **Multiple Resumes**
   - [ ] Upload second resume version
   - [ ] Set one as "Primary"
   - [ ] Remove old resume
   - [ ] Verify only primary shows in applications

---

## Part 2: College Features Testing

### Feature 7: Institute Verification System

**Purpose**: Verified academic records for authentic profiles

**Test Cases**:

1. **College Registration**
   - [ ] Navigate to `/auth/register` as college admin
   - [ ] Enter college code/registration
   - [ ] Verify email confirmation
   - [ ] Complete college profile (name, address, contact)

2. **Student Verification Dashboard**
   - [ ] Go to `/college/verify-students`
   - [ ] View list of students from college
   - [ ] Verify student information displays:
     - [ ] Name, email, contact
     - [ ] CGPA, Department, Year
     - [ ] Attendance, Backlogs
     - [ ] Skills, Projects, Certifications

3. **Bulk Verification**
   - [ ] Select multiple students
   - [ ] Click "Verify Selected"
   - [ ] Enter verification data (CGPA, attendance confirmed)
   - [ ] Verify records update with "Verified" badge

4. **Individual Verification**
   - [ ] Click on single student
   - [ ] Review uploaded documents
   - [ ] Accept/Reject based on data accuracy
   - [ ] Add verification notes
   - [ ] Confirm verification status changes

5. **Unverified Student Alerts**
   - [ ] View list of pending verifications
   - [ ] Filter by department
   - [ ] Filter by year
   - [ ] Send reminder emails for incomplete profiles

**Verification Workflow**:

```
1. Student submits profile with academic details
2. College receives notification
3. College admin reviews CGPA, transcripts
4. College admin verifies authentic records
5. Profile gets "Verified" badge
6. Recruiters see verified badge on applications
```

---

### Feature 8: AI Student Shortlisting

**Purpose**: Automatically filter and rank candidates based on company requirements

**Test Cases**:

1. **Shortlisting Setup** (as College Admin)
   - [ ] Receive job posting from recruiter
   - [ ] Go to `/college/ai-shortlisting`
   - [ ] Create shortlisting criteria:
     - [ ] Required skills
     - [ ] Minimum CGPA
     - [ ] Years of experience
     - [ ] Coding platform requirements

2. **Automatic Ranking**
   - [ ] Run shortlisting filter
   - [ ] Verify AI ranks students by match score
   - [ ] Review top 10 candidates
   - [ ] Check ranking shows score breakdown

3. **Shortlist Review**
   - [ ] View detailed rating for each student:
     - [ ] Skill match percentage
     - [ ] Academic fit
     - [ ] Coding ability score
     - [ ] Project relevance
     - [ ] Overall compatibility

4. **Manual Adjustments**
   - [ ] Override AI-generated rankings
   - [ ] Add notes to shortlisted students
   - [ ] Remove unsuitable candidates
   - [ ] Restore removed students

5. **Batch Actions**
   - [ ] Select all top candidates
   - [ ] Click "Send Interview Calls"
   - [ ] Verify all selected students receive emails
   - [ ] Check email contains interview details

---

### Feature 9: Placement Analytics Dashboard

**Purpose**: Comprehensive insights on placement performance

**Test Cases**:

1. **Dashboard Load**
   - [ ] Navigate to `/college/placement-analytics`
   - [ ] Verify all widgets load without errors
   - [ ] Check data is from current academic year

2. **Basic Statistics**
   - [ ] View total students count
   - [ ] Check placed students count
   - [ ] Verify placement rate percentage
   - [ ] See average package offered

3. **Department-wise Analytics**
   - [ ] View table of departments
   - [ ] Check each dept shows:
     - [ ] Total students
     - [ ] Placed students
     - [ ] Placement rate
     - [ ] Average package
   - [ ] Click on department for details

4. **Company Visits Tracking**
   - [ ] View companies visited this year
   - [ ] Check number of offers per company
   - [ ] See company visit timeline
   - [ ] View top recruiting companies

5. **Monthly Trends**
   - [ ] View placements by month chart
   - [ ] Check trend line (increasing/decreasing)
   - [ ] Identify peak placement months
   - [ ] Compare with previous year (if data exists)

6. **CGPA Distribution**
   - [ ] View pie chart of students by CGPA bands:
     - [ ] 9.0-10.0
     - [ ] 8.0-9.0
     - [ ] 7.0-8.0
     - [ ] 6.0-7.0
     - [ ] Below 6.0
   - [ ] Verify correlation with placement rates

---

### Feature 10: Department-wise Statistics

**Purpose**: Detailed analytics by department and academic performance

**Test Cases**:

1. **Department Selection**
   - [ ] Go to analytics dashboard
   - [ ] Click on specific department
   - [ ] View department-specific data

2. **Academic Performance**
   - [ ] View average CGPA by department
   - [ ] Check GPA distribution chart
   - [ ] See students per academic year
   - [ ] View attendance patterns

3. **Skill Analysis**
   - [ ] Top skills in department
   - [ ] In-demand skills by recruiters
   - [ ] Skill gaps identification
   - [ ] Certification trends

4. **Placement Metrics**
   - [ ] Placement rate (%)
   - [ ] Average package
   - [ ] Package range (min-max)
   - [ ] Premium offers (>10 LPA)

5. **Coding Analytics**
   - [ ] Average problems solved per student
   - [ ] Average rating by platform
   - [ ] Active coders percentage
   - [ ] Platform preference

6. **Export Statistics**
   - [ ] Export department report as PDF
   - [ ] Export data as CSV
   - [ ] Verify accuracy of exported data

---

### Feature 11: Communication System

**Purpose**: Efficiently communicate with students about opportunities

**Test Cases**:

1. **Bulk Email Interface**
   - [ ] Go to `/college/communications`
   - [ ] Select email template:
     - [ ] Placement opportunity
     - [ ] Interview call
     - [ ] Skill gap report
     - [ ] Career guidance
     - [ ] Custom template

2. **Recipient Selection**
   - [ ] Filter students by:
     - [ ] Department
     - [ ] CGPA range
     - [ ] Year
     - [ ] Verification status
     - [ ] Skill tags
   - [ ] Preview selected recipient count

3. **Email Composition**
   - [ ] Edit template content
   - [ ] Personalize with variables: {firstName}, {department}, {cgpa}
   - [ ] Add attachments (PDFs, documents)
   - [ ] Preview email rendering

4. **Send Campaign**
   - [ ] Schedule immediate send
   - [ ] Or schedule for future date/time
   - [ ] Verify confirmation dialog
   - [ ] Check "Sending..." progress

5. **Campaign Tracking**
   - [ ] View sent emails history
   - [ ] Check delivery status per student
   - [ ] View open rates
   - [ ] See click-through rates (if links included)
   - [ ] Review bounce-backs

6. **Response Management**
   - [ ] View student replies
   - [ ] Filter conversations by status
   - [ ] Mark campaign as closed
   - [ ] Archive completed campaigns

---

## Part 3: Recruiter Features Testing

### Feature 12: Smart Job Matching

**Purpose**: AI-powered candidate matching based on job requirements

**Test Cases**:

1. **Job Posting Creation** (as Recruiter)
   - [ ] Navigate to `/recruiter/jobs/create`
   - [ ] Fill job details:
     - [ ] Job title
     - [ ] Department
     - [ ] Location
     - [ ] Salary range
     - [ ] Job description
     - [ ] Required skills
     - [ ] Experience needed
     - [ ] Qualification requirements

2. **AI Matching Trigger**
   - [ ] Save job posting
   - [ ] AI automatically scans student profiles
   - [ ] Generates match scores for eligible students
   - [ ] Creates ranked candidate list

3. **Match Quality Verification**
   - [ ] View matched candidates
   - [ ] Check match score (0-100%)
   - [ ] View score breakdown:
     - [ ] Skill match
     - [ ] Experience fit
     - [ ] Academic qualification
     - [ ] Coding ability
     - [ ] Project relevance

4. **Filter Matched Candidates**
   - [ ] Filter by match score (80%+, 70%+, 60%+)
   - [ ] Filter by location
   - [ ] Filter by CGPA
   - [ ] Filter by coding proficiency

5. **Candidate Comparison**
   - [ ] Compare 2-3 top candidates side-by-side
   - [ ] View key differences
   - [ ] Check complementary skills
   - [ ] Review each candidate's full profile

---

### Feature 13: Verified Talent Pool

**Purpose**: Access to pre-verified student profiles

**Test Cases**:

1. **Filter Verified Students**
   - [ ] Go to `/recruiter/talent-pool`
   - [ ] Toggle "Show Only Verified" filter
   - [ ] Verify only students with blue "Verified" badge appear
   - [ ] Check verification shows college name

2. **Talent Pool Search**
   - [ ] Search by skill (e.g., "Python", "React")
   - [ ] Filter by:
     - [ ] Minimum CGPA
     - [ ] College
     - [ ] Department
     - [ ] Coding platform rating
     - [ ] Projects count

3. **Profile Browse**
   - [ ] Click student profile
   - [ ] Verify all sections display:
     - [ ] Verified badge with college name
     - [ ] Academic info (verified indicator)
     - [ ] Skills with verification status
     - [ ] Projects with descriptions
     - [ ] Certifications
     - [ ] Coding stats
     - [ ] Resume download option

4. **Talent Features**
   - [ ] View coding growth chart
   - [ ] Check skill gap analysis (if available)
   - [ ] See AI-generated placement probability
   - [ ] View recommended roles for candidate

5. **Quick Actions**
   - [ ] Click "Send Interview Call"
   - [ ] Click "Add to Shortlist"
   - [ ] Click "Request Referral"
   - [ ] Click "Download Resume"
   - [ ] Verify actions work without page reload

6. **Verification Confidence**
   - [ ] View verification status:
     - [ ] Academic records ✓
     - [ ] Contact info ✓
     - [ ] Document authenticity ✓
   - [ ] See verification date
   - [ ] Check college seal/official confirmation

---

## Part 4: Cross-Cutting Features (All Users)

### Feature 14: Application Management (Recruiter/Student)

**Test Cases**:

1. **For Recruiters**:
   - [ ] View received applications
   - [ ] Filter by status (New, Viewed, Shortlisted, Selected, Rejected)
   - [ ] Bulk update status
   - [ ] Send acceptance/rejection emails
   - [ ] Schedule interviews

2. **For Students**:
   - [ ] View all applications submitted
   - [ ] Check application status timeline
   - [ ] Receive status update notifications
   - [ ] View recruiter feedback (if provided)
   - [ ] Accept/decline job offer

### Feature 15: Analytics Dashboards

**Test Cases**:

1. **Student Analytics**
   - [ ] View placement readiness score
   - [ ] Check CGPA vs placement correlation
   - [ ] See skill demand analysis
   - [ ] View application success rate

2. **Recruiter Analytics**
   - [ ] View hiring funnel (Applied → Shortlisted → Offer)
   - [ ] Check conversion rates
   - [ ] See hiring timeline
   - [ ] Track recruitment costs

### Feature 16: Notification System

**Test Cases**:

1. **In-App Notifications**
   - [ ] Receive real-time updates
   - [ ] Mark as read/unread
   - [ ] Archive notifications

2. **Email Notifications**
   - [ ] Receive placement opportunities
   - [ ] Get interview call notifications
   - [ ] Receive skill gap feedback
   - [ ] Get profile improvement reminders

---

## Testing Checklist

### Phase 1: Unit Testing

```bash
# Run backend tests
npm run test

# Run frontend tests
cd client && npm run test
```

### Phase 2: API Integration Testing

```bash
# Using Postman or curl:
# 1. Test all endpoints with valid data
# 2. Test all endpoints with invalid data
# 3. Test authentication and authorization
# 4. Test error handling
# 5. Test data validation
```

### Phase 3: Manual E2E Testing

- [ ] **Test on Chrome** (latest version)
- [ ] **Test on Firefox** (latest version)
- [ ] **Test on Safari** (if on macOS)
- [ ] **Test on Edge** (if on Windows)
- [ ] **Test on Mobile** (iOS Safari, Chrome Mobile)

### Phase 4: Performance Testing

```bash
# Test API response times
npm run load-test

# Check frontend performance
# Chrome DevTools > Performance tab > Record session
```

### Phase 5: Security Testing

- [ ] Test SQL injection in search fields
- [ ] Test XSS in text inputs
- [ ] Verify JWT token expiration
- [ ] Test CSRF protection
- [ ] Verify file upload restrictions (type, size)
- [ ] Test role-based access control
- [ ] Test data access isolation (user can't access others' data)

---

## Automated Testing Commands

```bash
# Run all tests
npm run test-all

# Run backend tests
npm run test:server

# Run frontend tests
npm run test:client

# Run E2E tests
npm run test:e2e

# Run with coverage
npm run test:coverage

# Run specific test file
npm run test -- --testPathPattern=students

# Watch mode
npm run test -- --watch
```

---

## Critical Path Testing (Minimum Coverage)

If short on time, test these critical flows:

1. **Student Signup → Profile → Application** (15 min)
   - Register student
   - Complete profile
   - Apply for job
   - Receive offer

2. **College Verification → Analytics** (10 min)
   - Register college
   - Verify students
   - View placement analytics

3. **Recruiter Job → Shortlist → Hire** (15 min)
   - Post job
   - AI shortlists candidates
   - Send interview call
   - Make offer

---

## Troubleshooting Common Issues

### "Connection Refused" on API Calls

```bash
# Check if backend is running
netstat -ano | findstr :5000

# Kill existing process and restart
npm run server
```

### "Cannot fetch from coding platforms"

- Verify internet connection
- Check username validity
- Check API rate limits (coding platforms)
- Try again after 5 minutes

### "Email not sending"

- Verify SMTP credentials in .env
- Check email service status
- Allow less secure app access (Gmail)
- Review email logs: `npm run logs:email`

### "Verification email not arriving"

- Check spam folder
- Verify email service configuration
- Test with test email in .env
- Check email logs for errors

---

## Reporting Issues

When reporting test failures, include:

1. Steps to reproduce
2. Expected vs actual result
3. Browser/OS/Node version
4. Screenshot/video
5. API response (if API issue)
6. Browser console errors
7. Server logs excerpt

---

## Sign-off Checklist

- [ ] All 13 core features tested
- [ ] All critical paths work
- [ ] No critical bugs found
- [ ] Performance acceptable (<2s page load)
- [ ] Security checks passed
- [ ] Cross-browser testing done
- [ ] Mobile responsiveness verified
- [ ] All notifications delivering
- [ ] Database operations working
- [ ] File uploads working (resume, uploads)
- [ ] Email system functional
- [ ] Authentication flows working
- [ ] Authorization enforced correctly
- [ ] Error messages user-friendly
- [ ] API responds with correct status codes

---

**Last Updated**: March 15, 2026
**Next Review**: After each feature implementation
