# Feature Testing Guide - Career Intelligence Portal

**Date**: March 15, 2026  
**Purpose**: Complete guide to test all 13 core features  
**Tools Needed**: Postman, Browser, Terminal

---

## Quick Start: Setup for Testing

### 1. Prerequisites

```powershell
# Verify services are running
cd c:\Users\LENOVO\OneDrive\Desktop\proj

# Check backend is running
curl http://localhost:5000/api/health

# Check frontend is running
curl http://localhost:3000
```

### 2. Test Accounts Created

```
STUDENT ACCOUNT:
Email: student@example.com
Password: Password123!
Role: student

COLLEGE ACCOUNT:
Email: college@example.com
Password: Password123!
Role: college
College Code: COLLEGE001

RECRUITER ACCOUNT:
Email: recruiter@example.com
Password: Password123!
Role: recruiter
```

---

## Feature 1: Authentication (Firebase)

### Test Method 1: Sign Up (UI)

```
Path: http://localhost:3000/register
Steps:
1. Click "Create Account"
2. Select Role: "Student"
3. Enter Email: test_student_123@gmail.com
4. Enter Password: TestPass123!
5. Confirm Password: TestPass123!
6. Click "Register"
Expected: Redirected to email verification page
```

### Test Method 2: Sign Up (API)

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "Password123!",
    "role": "student",
    "firstName": "John",
    "lastName": "Doe"
  }'

Expected Response:
{
  "success": true,
  "message": "Registration successful. Please verify your email.",
  "user": {
    "id": "...",
    "email": "newuser@example.com",
    "role": "student"
  }
}
```

### Test Method 3: Login (UI)

```
Path: http://localhost:3000/login
Steps:
1. Enter Email: student@example.com
2. Enter Password: Password123!
3. Select Role: Student
4. Click "Login"
Expected: Redirected to Student Dashboard
```

### Test Method 4: Login (API)

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "Password123!",
    "role": "student"
  }'

Expected Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "...",
    "email": "student@example.com",
    "role": "student",
    "firstName": "John"
  }
}
```

### Test Method 5: Email Verification

```
Steps:
1. After signup, check email (test email service)
2. Click verification link in email
3. Should see "Email Verified Successfully"
Expected: User marked as verified in database
```

### Test Method 6: Logout (UI)

```
Steps:
1. Click profile icon (top-right)
2. Click "Logout"
Expected: Redirected to login page, token cleared from localStorage
```

### Verification Checklist:

- [ ] Firebase registration works
- [ ] Firebase login works
- [ ] JWT token generated and stored
- [ ] Token sent in Authorization header
- [ ] Email verification email sent
- [ ] Logout clears session
- [ ] Role-based redirection works

---

## Feature 2: Student Profile System

### Test Method 1: Create Profile (UI)

```
Path: http://localhost:3000/student/profile
Login first as student@example.com

Steps:
1. Fill Personal Information
   - First Name: John
   - Last Name: Doe
   - Phone: +91-9876543210
   - Bio: Computer Science enthusiast

2. Fill Academic Details
   - CGPA: 8.5
   - Attendance: 92
   - Department: Computer Science
   - Year: 4
   - Semester: 8
   - Backlogs: 0

3. Add Skills
   - Click "Add Skill"
   - Skill: "Python"
   - Level: "Expert"
   - Click "Add"

4. Add Project
   - Title: "Career Portal"
   - Description: "AI-powered placement system"
   - Technologies: React, Node.js, MongoDB
   - GitHub Link: https://github.com/...
   - Dates: Jan 2024 - Present

5. Click "Save Profile"

Expected: Profile saved successfully, redirected to dashboard
```

### Test Method 2: Create Profile (API)

```bash
# First, get your token from login
TOKEN="your_jwt_token_here"

# Create profile
curl -X POST http://localhost:5000/api/students/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "personalInfo": {
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+91-9876543210",
      "bio": "CS enthusiast"
    },
    "academicInfo": {
      "cgpa": 8.5,
      "attendance": 92,
      "department": "Computer Science",
      "year": 4,
      "semester": 8,
      "backlogs": 0
    },
    "skills": [
      {"name": "Python", "level": "Expert", "verified": false}
    ]
  }'

Expected Response:
{
  "success": true,
  "message": "Profile created successfully",
  "profile": {...}
}
```

### Test Method 3: Upload Resume

```bash
TOKEN="your_jwt_token_here"

# Upload resume file
curl -X POST http://localhost:5000/api/students/resume \
  -H "Authorization: Bearer $TOKEN" \
  -F "resume=@/path/to/resume.pdf"

Expected Response:
{
  "success": true,
  "message": "Resume uploaded successfully",
  "file": {
    "fileName": "resume.pdf",
    "fileUrl": "uploads/resumes/resume-123456.pdf",
    "uploadDate": "2024-03-15T10:30:00Z",
    "plagiarismScore": 18
  }
}
```

### Test Method 4: Verify Profile in Database

```powershell
# Check MongoDB directly
mongosh "mongodb+srv://user:password@cluster.mongodb.net/career_intelligence"

# Command in mongosh:
db.students.findOne({email: "student@example.com"})

# Should show:
{
  "_id": ObjectId("..."),
  "user": ObjectId("..."),
  "academicInfo": {
    "cgpa": 8.5,
    "attendance": 92,
    "department": "Computer Science"
  },
  "skills": [
    {"name": "Python", "level": "Expert"}
  ],
  "resume": {
    "fileUrl": "uploads/resumes/resume-123456.pdf",
    "plagiarismScore": 18
  }
}
```

### Verification Checklist:

- [ ] Profile creation works
- [ ] All sections save correctly
- [ ] Resume uploads successfully
- [ ] Data appears in database
- [ ] Edit profile updates correctly
- [ ] Skills can be added/removed
- [ ] Plagiarism score calculated

---

## Feature 3: Coding Platform Integration

### Test Method 1: Add LeetCode Username (UI)

```
Path: http://localhost:3000/student/profile
Steps:
1. Scroll to "Coding Profiles" section
2. Enter LeetCode Username: your_leetcode_username
3. Click "Fetch Stats"
Expected: Stats loaded showing problems solved, rating, etc.
```

### Test Method 2: Fetch LeetCode Stats (API)

```bash
TOKEN="your_jwt_token_here"

curl -X POST http://localhost:5000/api/coding/fetch-stats/leetcode \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "username": "your_leetcode_username"
  }'

Expected Response:
{
  "success": true,
  "platform": "leetcode",
  "stats": {
    "username": "your_leetcode_username",
    "totalSolved": 312,
    "easyCount": 145,
    "mediumCount": 128,
    "hardCount": 39,
    "rating": 2150,
    "ranking": 125948,
    "reputation": 45
  }
}
```

### Test Method 3: Fetch CodeChef Stats

```bash
TOKEN="your_jwt_token_here"

curl -X POST http://localhost:5000/api/coding/fetch-stats/codechef \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "username": "your_codechef_username"
  }'

Expected Response:
{
  "success": true,
  "platform": "codechef",
  "stats": {
    "username": "your_codechef_username",
    "totalSolved": 245,
    "rating": 1834,
    "stars": 4
  }
}
```

### Test Method 4: Fetch Codeforces Stats

```bash
TOKEN="your_jwt_token_here"

curl -X POST http://localhost:5000/api/coding/fetch-stats/codeforces \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "username": "your_codeforces_username"
  }'

Expected Response:
{
  "success": true,
  "platform": "codeforces",
  "stats": {
    "username": "your_codeforces_username",
    "totalProblems": 178,
    "rating": 1920,
    "rank": "Expert",
    "maxRating": 1960,
    "maxRank": "Expert"
  }
}
```

### Test Method 5: View Coding Dashboard (UI)

```
Path: http://localhost:3000/student/coding-growth
Steps:
1. See 6-month trend chart
2. View platform comparison
3. See difficulty distribution
4. View ratings progression
Expected: Charts display with mock/real data
```

### Test Method 6: Growth Analytics (API)

```bash
TOKEN="your_jwt_token_here"

curl -X GET http://localhost:5000/api/coding/growth-analytics \
  -H "Authorization: Bearer $TOKEN"

Expected Response:
{
  "success": true,
  "data": {
    "last6Months": [
      {"month": "Sept", "problemsSolved": 45},
      {"month": "Oct", "problemsSolved": 52},
      ...
    ],
    "platformComparison": {
      "leetcode": 312,
      "codechef": 245,
      "codeforces": 178
    }
  }
}
```

### Verification Checklist:

- [ ] LeetCode stats fetch correctly
- [ ] CodeChef stats fetch correctly
- [ ] Codeforces stats fetch correctly
- [ ] Stats save to database
- [ ] Growth chart displays 6-month data
- [ ] Platform comparison shows correctly
- [ ] Difficulty distribution visible

---

## Feature 4: AI Career Intelligence

### Test Method 1: Skill Gap Analysis (API)

```bash
TOKEN="your_jwt_token_here"

curl -X POST http://localhost:5000/api/ai/skill-gap-analysis \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "targetRole": "Senior Software Engineer",
    "targetCompany": "Google"
  }'

Expected Response:
{
  "success": true,
  "analysis": {
    "strengths": [
      {"skill": "Python", "level": "Expert"},
      {"skill": "System Design", "level": "Advanced"}
    ],
    "gaps": [
      {"skill": "Machine Learning", "level": "High", "resources": [...]},
      {"skill": "Kubernetes", "level": "Medium", "resources": [...]}
    ],
    "recommendations": [
      "Complete ML specialization course",
      "Build 2-3 ML projects",
      "Practice system design daily"
    ]
  }
}
```

### Test Method 2: Career Path Recommendation (API)

```bash
TOKEN="your_jwt_token_here"

curl -X POST http://localhost:5000/api/ai/career-prediction \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN"

Expected Response:
{
  "success": true,
  "prediction": {
    "placementProbability": 87,
    "confidenceLevel": "High",
    "topRoles": [
      {
        "role": "Senior Software Engineer",
        "probability": 92,
        "expectedPackage": "22-26 LPA"
      },
      {
        "role": "Full Stack Developer",
        "probability": 85,
        "expectedPackage": "18-22 LPA"
      }
    ],
    "successFactors": {
      "cgpaScore": 8.5,
      "codingScore": 8.2,
      "projectScore": 8.0,
      "timelineMonths": 3
    }
  }
}
```

### Test Method 3: Role Suggestion (API)

```bash
TOKEN="your_jwt_token_here"

curl -X GET http://localhost:5000/api/ai/role-suggestions \
  -H "Authorization: Bearer $TOKEN"

Expected Response:
{
  "success": true,
  "suggestions": [
    {
      "role": "Backend Engineer",
      "matchScore": 89,
      "reasoning": "Strong in system design and databases"
    },
    {
      "role": "DevOps Engineer",
      "matchScore": 76,
      "reasoning": "Good cloud and container knowledge"
    }
  ]
}
```

### Test Method 4: Learning Roadmap (API)

```bash
TOKEN="your_jwt_token_here"

curl -X POST http://localhost:5000/api/ai/learning-roadmap \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "targetRole": "Data Scientist",
    "timelineMonths": 6
  }'

Expected Response:
{
  "success": true,
  "roadmap": {
    "month1": {
      "focus": "Python & Statistics",
      "resources": [...],
      "priority": "High"
    },
    "month2": {
      "focus": "Machine Learning Basics",
      "resources": [...]
    }
  }
}
```

### Test Method 5: View AI Insights (UI)

```
Path: http://localhost:3000/student/ai-insights
Steps:
1. See placement probability score
2. View top recommended roles
3. See skill gaps and recommendations
4. Check learning roadmap
Expected: All insights displayed with scores and resources
```

### Verification Checklist:

- [ ] Skill gap analysis returns insights
- [ ] Career prediction shows probability
- [ ] Role suggestions provided
- [ ] Learning roadmap generated
- [ ] Insights display on UI dashboard
- [ ] Recommendations are personalized
- [ ] Ratings and scores reasonable (0-100)

---

## Feature 5: Student Dashboard

### Test Method 1: View Dashboard (UI)

```
Path: http://localhost:3000/student/dashboard
Steps:
1. Login as student
2. See main dashboard with:
   - Profile completion percentage
   - Placement readiness score
   - Coding progress chart
   - Recommended actions
   - Recent achievements
Expected: All dashboard sections load with data
```

### Test Method 2: Get Dashboard Data (API)

```bash
TOKEN="your_jwt_token_here"

curl -X GET http://localhost:5000/api/analytics/student/dashboard \
  -H "Authorization: Bearer $TOKEN"

Expected Response:
{
  "success": true,
  "dashboard": {
    "profileCompletion": 85,
    "placementReadinessScore": 78,
    "academicPerformance": {
      "cgpa": 8.5,
      "attendance": 92
    },
    "codingPerformance": {
      "totalProblems": 312,
      "avgRating": 2150,
      "skillLevel": "Advanced"
    },
    "projects": 4,
    "certifications": 2,
    "placementStatus": "Active",
    "recentActivity": [...]
  }
}
```

### Test Method 3: View Progress Charts (UI)

```
Path: http://localhost:3000/student/dashboard
Charts to verify:
1. Coding progress (6-month line chart)
2. Skills distribution (radar/pie chart)
3. Readiness score (gauge chart)
4. Academic performance (bar chart)
Expected: All charts render with sample data
```

### Test Method 4: Check Recommended Actions (UI)

```
Path: http://localhost:3000/student/dashboard
Steps:
1. Scroll to "Recommended Actions"
2. Should see AI-suggested next steps:
   - "Learn System Design (High Priority)"
   - "Complete 50 more LeetCode problems"
   - "Build a full-stack project"
Expected: Actions appear based on skill gaps
```

### Verification Checklist:

- [ ] Dashboard loads without errors
- [ ] All data sections populate
- [ ] Charts render correctly
- [ ] Placement readiness score calculated
- [ ] Profile completion % accurate
- [ ] Recent activity shows correctly
- [ ] Recommended actions personalized

---

## Feature 6: Placement Intelligence

### Test Method 1: Job Matching (API)

```bash
TOKEN="your_jwt_token_here"

curl -X POST http://localhost:5000/api/ai/job-matching \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "jobFilters": {
      "minPackage": 15,
      "maxPackage": 30,
      "location": "Bangalore",
      "jobType": "Full-time"
    }
  }'

Expected Response:
{
  "success": true,
  "matches": [
    {
      "jobId": "...",
      "company": "Google",
      "role": "Senior Backend Engineer",
      "package": "22-26 LPA",
      "matchScore": 92,
      "skills": ["Python", "System Design", "Distributed Systems"],
      "applyLink": "..."
    }
  ]
}
```

### Test Method 2: Placement Status (API)

```bash
TOKEN="your_jwt_token_here"

curl -X GET http://localhost:5000/api/placements/student-status \
  -H "Authorization: Bearer $TOKEN"

Expected Response:
{
  "success": true,
  "status": {
    "isPlaced": false,
    "applications": 5,
    "shortlisted": 2,
    "interviews": 1,
    "offers": 0
  }
}
```

### Test Method 3: Interview Preparation (API)

```bash
TOKEN="your_jwt_token_here"

curl -X POST http://localhost:5000/api/placements/interview-prep \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "company": "Google",
    "role": "Backend Engineer"
  }'

Expected Response:
{
  "success": true,
  "preparation": {
    "topicsToFocus": [
      "System Design",
      "Database Design",
      "Distributed Consensus"
    ],
    "resources": [
      {"title": "...", "link": "...", "duration": "2 hours"}
    ],
    "estimatedPreparationTime": "30 days"
  }
}
```

### Test Method 4: View Job Recommendations (UI)

```
Path: http://localhost:3000/student/job-matches
Steps:
1. See list of matched jobs
2. Each job shows:
   - Company name
   - Role
   - Package range
   - Skill match %
   - Apply button
Expected: Jobs sorted by match score
```

### Verification Checklist:

- [ ] Job matching returns results
- [ ] Match scores calculated correctly
- [ ] Placement status tracked
- [ ] Interview prep details provided
- [ ] Resources recommended
- [ ] Jobs filtered by preferences
- [ ] Application tracking works

---

## Feature 7: Email Notification System

### Test Method 1: Account Verification Email

```
Steps:
1. Sign up with new email
2. Check email inbox (or Mail in a Drop)
3. Should receive: "Verify Your Account" email
4. Contains verification link
Expected: Email received within 30 seconds
```

### Test Method 2: Career Recommendation Email (API)

```bash
TOKEN="your_jwt_token_here"

curl -X POST http://localhost:5000/api/notifications/send-skill-gap-report \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN"

Expected:
1. Email sent to student
2. Subject: "Your Personalized Skill Gap Analysis"
3. Contains: Gaps, recommendations, resources
4. Response: {"success": true, "message": "Email sent"}
```

### Test Method 3: Placement Alert Email (API)

```bash
TOKEN="recruiter_token_here"

curl -X POST http://localhost:5000/api/notifications/send-placement-notification \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "studentId": "...",
    "company": "Google",
    "role": "Backend Engineer",
    "package": "22-26 LPA",
    "matchScore": 92
  }'

Expected:
1. Email sent to student
2. Subject: "Job Opportunity at Google"
3. Contains: Role details, apply link
```

### Test Method 4: Interview Notification Email (API)

```bash
TOKEN="recruiter_token_here"

curl -X POST http://localhost:5000/api/notifications/send-interview-notification \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "studentId": "...",
    "company": "Google",
    "interviewDate": "2024-03-20T10:00:00Z",
    "interviewType": "Technical Round 1",
    "joinLink": "https://meet.google.com/..."
  }'

Expected: Email with interview details and join link
```

### Test Method 5: Test Email Configuration

```bash
# Check if email service is configured
curl -X GET http://localhost:5000/api/health

Response should show:
{
  "status": "ok",
  "services": {
    "database": "connected",
    "email": "configured",
    "firebase": "configured"
  }
}
```

### Verification Checklist:

- [ ] Verification emails sent on signup
- [ ] Skill report email contains recommendations
- [ ] Job alert emails delivered
- [ ] Interview notification contains correct details
- [ ] Email templates format correctly
- [ ] Links in emails are clickable
- [ ] HTML rendering looks good

---

## Feature 8: Database Structure

### Test Method 1: Verify Collections Exist

```powershell
# Open MongoDB connection
mongosh "mongodb+srv://user:password@cluster.mongodb.net/career_intelligence"

# List all collections
show collections

Expected:
users
students
colleges
recruiters
placements
analytics
```

### Test Method 2: Check User Document

```javascript
// In mongosh console
db.users.findOne()

Expected:
{
  "_id": ObjectId("..."),
  "email": "student@example.com",
  "role": "student",
  "isVerified": true,
  "createdAt": ISODate("2024-03-15T...")
}
```

### Test Method 3: Check Student Document

```javascript
db.students.findOne()

Expected:
{
  "_id": ObjectId("..."),
  "user": ObjectId("..."),
  "college": ObjectId("..."),
  "academicInfo": {
    "cgpa": 8.5,
    "attendance": 92,
    "department": "Computer Science"
  },
  "skills": [...]
}
```

### Test Method 4: Check Relationships

```javascript
// Get a student with all relationships populated
db.students.aggregate([
  {$match: {"_id": ObjectId("...")}},
  {
    $lookup: {
      from: "users",
      localField: "user",
      foreignField: "_id",
      as: "userData"
    }
  }
])

Expected: Student document includes embedded user data
```

### Test Method 5: Verify Indexes

```javascript
// Check indexes created
db.users.getIndexes()

Expected: Indexes on email and other frequently queried fields
```

### Verification Checklist:

- [ ] All 5 collections exist
- [ ] Users collection has documents
- [ ] Students linked to Users
- [ ] Academic info stored correctly
- [ ] Skills array populated
- [ ] Resume data stored
- [ ] Relationships work via ObjectId

---

## Feature 9: File Storage (Resume Upload)

### Test Method 1: Upload Resume via UI

```
Path: http://localhost:3000/student/profile
Steps:
1. Scroll to "Resume" section
2. Click "Select File" or drag-drop
3. Choose file: resume.pdf (or .docx)
4. Click "Upload"
Expected: File uploaded, plagiarism score calculated
```

### Test Method 2: Upload Resume via API

```bash
TOKEN="your_jwt_token_here"

curl -X POST http://localhost:5000/api/students/resume \
  -H "Authorization: Bearer $TOKEN" \
  -F "resume=@/Users/john/Desktop/resume.pdf"

Expected Response:
{
  "success": true,
  "file": {
    "fileName": "resume.pdf",
    "fileUrl": "uploads/resumes/resume-1710509400000.pdf",
    "uploadDate": "2024-03-15T10:30:00Z",
    "plagiarismScore": 18,
    "isVerified": true
  }
}
```

### Test Method 3: Download Resume

```bash
TOKEN="your_jwt_token_here"

# Download your own resume
curl -X GET http://localhost:5000/uploads/resumes/resume-1710509400000.pdf \
  -H "Authorization: Bearer $TOKEN" \
  -o downloaded_resume.pdf

Expected: PDF file downloaded successfully
```

### Test Method 4: Verify File in Storage

```powershell
# Check if file exists in uploads folder
Get-ChildItem "c:\Users\LENOVO\OneDrive\Desktop\proj\server\uploads\resumes\"

Expected: resume-TIMESTAMP.pdf file exists
```

### Test Method 5: Resume Analysis (Plagiarism)

```bash
TOKEN="your_jwt_token_here"

curl -X GET http://localhost:5000/api/students/resume/plagiarism \
  -H "Authorization: Bearer $TOKEN"

Expected Response:
{
  "success": true,
  "plagiarismScore": 18,
  "details": {
    "matchedContent": "...",
    "sources": [...]
  }
}
```

### Verification Checklist:

- [ ] PDF files upload successfully
- [ ] DOCX files upload successfully
- [ ] File size limit enforced (5MB)
- [ ] File stored in uploads/resumes/
- [ ] Plagiarism score calculated
- [ ] Only student can access own resume
- [ ] File metadata saved in database

---

## Feature 10: Admin Panel

### Test Method 1: College Admin Dashboard (UI)

```
Path: http://localhost:3000/college/dashboard
Login as: college@example.com
Expected to see:
1. Student verification form
2. Analytics dashboard
3. Placement statistics
4. Company visit records
```

### Test Method 2: Recruiter Dashboard (UI)

```
Path: http://localhost:3000/recruiter/dashboard
Login as: recruiter@example.com
Expected to see:
1. Job posting management
2. Application tracking
3. AI shortlisting tool
4. Interview scheduling
```

### Test Method 3: Verify College Admin Functions (API)

```bash
TOKEN="college_token_here"

# Get students for verification
curl -X GET http://localhost:5000/api/colleges/students-to-verify \
  -H "Authorization: Bearer $TOKEN"

Expected Response:
{
  "success": true,
  "students": [
    {
      "id": "...",
      "name": "John Doe",
      "cgpa": 8.5,
      "verified": false
    }
  ]
}
```

### Test Method 4: Verify Student as College Admin (API)

```bash
TOKEN="college_token_here"

curl -X POST http://localhost:5000/api/colleges/verify-student \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "studentId": "...",
    "cgpa": 8.5,
    "attendance": 92,
    "department": "CS"
  }'

Expected: Student marked as verified
```

### Test Method 5: AI Shortlisting (API)

```bash
TOKEN="recruiter_token_here"

curl -X POST http://localhost:5000/api/recruiters/ai-shortlist \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "jobRequirements": {
      "skills": ["Python", "System Design"],
      "minCgpa": 7.5,
      "minCodingRating": 1500,
      "experience": 2
    }
  }'

Expected: Top 10 matched students returned with scores
```

### Verification Checklist:

- [ ] College admin can view students
- [ ] College admin can verify records
- [ ] Recruiter can post jobs
- [ ] AI shortlisting returns candidates
- [ ] Analytics dashboard shows stats
- [ ] Role-based access enforced
- [ ] Admin actions logged

---

## Feature 11: Frontend Features

### Test Method 1: Navigation & Routing

```
Path: http://localhost:3000
Steps:
1. Login as different roles (student, college, recruiter)
2. Verify redirected to correct dashboard:
   - Student → /student/dashboard
   - College → /college/dashboard
   - Recruiter → /recruiter/dashboard
Expected: No 404 errors, routing works
```

### Test Method 2: Responsive Design

```
Steps:
1. Open http://localhost:3000 on:
   - Desktop browser (1920x1080)
   - Tablet (768x1024)
   - Mobile (375x667)
2. Check all pages render correctly
Expected: No overlapping content, mobile menu appears
```

### Test Method 3: Form Validation

```
Path: http://localhost:3000/student/profile
Steps:
1. Leave CGPA blank, try to submit
Expected: Error message "CGPA is required"
2. Enter CGPA = 11, try to submit
Expected: Error message "CGPA must be between 0-10"
3. Fill all correctly, submit
Expected: Success message
```

### Test Method 4: Error Handling

```
Steps:
1. Stop backend server
2. Try to access student dashboard
3. Make API request
Expected: User-friendly error message, not raw error
```

### Test Method 5: UI Components

```
Verify all components render:
1. Cards, Buttons, Inputs ✓
2. Charts (Recharts) ✓
3. Modals/Dialogs ✓
4. Dropdowns ✓
5. File upload ✓
6. Spinners/Loaders ✓
Expected: All components visible and interactive
```

### Verification Checklist:

- [ ] All pages load without errors
- [ ] Navigation between pages works
- [ ] Forms submit and validate
- [ ] Tables display data correctly
- [ ] Charts render with data
- [ ] Mobile responsive
- [ ] Error messages user-friendly
- [ ] Loading states show

---

## Feature 12: Deployment Readiness

### Test Method 1: Environment Variables

```powershell
# Check .env file exists and has all variables
Get-Content ".env"

Expected variables:
- MONGODB_URI=mongodb+srv://...
- JWT_SECRET=your_secret
- PORT=5000
- NODE_ENV=development
- EMAIL_HOST=smtp.gmail.com
```

### Test Method 2: Build Frontend for Production

```bash
cd client
npm run build

Expected:
- build/ folder created
- Minified JS and CSS files
- HTML file in build/
- Build size < 500KB
```

### Test Method 3: Test Production Build Locally

```bash
# Install serve globally
npm install -g serve

# Serve production build
serve -s build -l 3000

# Open http://localhost:3000
# Verify site works
```

### Test Method 4: Backend Startup

```bash
cd server
npm start

Expected output:
- Server listening on port 5000
- Database connected
- Email configured
- No errors in logs
```

### Test Method 5: Health Check Endpoint

```bash
curl http://localhost:5000/api/health

Expected Response:
{
  "status": "ok",
  "database": "connected",
  "email": "configured"
}
```

### Test Method 6: API Documentation

```
Check if endpoints are documented:
- README.md or API_DOCS.md ✓
- Lists all endpoints with methods ✓
- Shows request/response examples ✓
- Explains authentication ✓
```

### Verification Checklist:

- [ ] .env file complete
- [ ] Frontend builds successfully
- [ ] Backend starts without errors
- [ ] Health check passes
- [ ] API documentation exists
- [ ] Production build tested
- [ ] No hardcoded secrets

---

## Feature 13: Advanced Deployment

### Test Method 1: Docker Container (Optional)

```bash
# Create Dockerfile if needed
# Build image
docker build -t career-portal .

# Run container
docker run -p 5000:5000 career-portal

Expected: App runs in Docker
```

### Test Method 2: Performance Testing

```bash
# Install Apache Bench
# Test concurrent requests
ab -n 100 -c 10 http://localhost:3000/

Expected:
- Requests/sec > 100
- Response time < 500ms
```

### Test Method 3: Database Backup

```bash
# MongoDB Atlas: Automated backups configured

# Manual backup (mongodump)
mongodump --uri "mongodb+srv://..." --out ./backup

Expected: Backup folder created
```

### Verification Checklist:

- [ ] Docker build works (if creating Docker)
- [ ] Performance acceptable
- [ ] Database backups configured
- [ ] Deployment scripts work
- [ ] Environment variables validated
- [ ] Security checks pass

---

## Complete Test Checklist

### Core Features

- [ ] Feature 1: Authentication (Firebase)
- [ ] Feature 2: Student Profile System
- [ ] Feature 3: Coding Platform Integration
- [ ] Feature 4: AI Career Intelligence
- [ ] Feature 5: Student Dashboard
- [ ] Feature 6: Placement Intelligence
- [ ] Feature 7: Email Notifications
- [ ] Feature 8: Database Structure
- [ ] Feature 9: File Storage
- [ ] Feature 10: Admin Panel
- [ ] Feature 11: Frontend Features
- [ ] Feature 12: Deployment Readiness
- [ ] Feature 13: Advanced Deployment

### Cross-Feature Integration

- [ ] User can signup and login
- [ ] Student can complete profile with resume
- [ ] Coding stats fetch and display
- [ ] AI provides recommendations
- [ ] Dashboard shows all data
- [ ] Emails send on placements
- [ ] College admin can verify students
- [ ] Recruiter can shortlist via AI
- [ ] All data persists in database

---

## Quick Test Command Reference

```bash
# Test Authentication
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@example.com","password":"Password123!","role":"student"}'

# Get Student Dashboard
curl -X GET http://localhost:5000/api/analytics/student/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test Coding Stats
curl -X POST http://localhost:5000/api/coding/fetch-stats/leetcode \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username":"yourLeetCodeUsername"}'

# Get Career Prediction
curl -X POST http://localhost:5000/api/ai/career-prediction \
  -H "Authorization: Bearer YOUR_TOKEN"

# Check Health
curl http://localhost:5000/api/health

# Get All Errors
curl http://localhost:5000/api/debug/errors
```

---

## Troubleshooting

### Backend won't start

```powershell
# Check port 5000 is free
netstat -ano | findstr ":5000"

# Kill process on 5000
taskkill /PID <PID> /F

# Start backend again
npm start
```

### Frontend won't connect to backend

```
Check:
1. Backend is running (http://localhost:5000/api/health)
2. .env has correct BACKEND_URL
3. CORS is enabled in server/index.js
4. No firewall blocking
```

### MongoDB connection fails

```
Check:
1. MONGODB_URI correct in .env
2. Network access whitelist IP in Atlas
3. Username/password correct
4. Database exists
```

### Email not sending

```
Check:
1. EMAIL_HOST, EMAIL_USER, EMAIL_PASS set in .env
2. Gmail security: https://myaccount.google.com/apppasswords
3. App password used (not regular password)
4. Less secure apps enabled if needed
```

---

## Notes

- All timestamps should be in ISO 8601 format
- All IDs are MongoDB ObjectIds
- Pagination defaults to 10 items per page
- Total testing time: ~2-3 hours
- Each feature: 10-15 minutes to test

---

**Last Updated**: March 15, 2026  
**Status**: Ready for Testing  
**Tester**: You!
