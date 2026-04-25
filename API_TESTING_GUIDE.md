# Career Intelligence Portal - API Testing Guide

## ⚡ Quick API Tests

Base URL: `http://localhost:5000/api`

---

## 1️⃣ Health Check

```
GET http://localhost:5000/api/health
```

**Expected Response** (200 OK):

```json
{
  "status": "OK",
  "message": "Career Intelligence Portal API is running",
  "timestamp": "2024-04-13T10:30:00.000Z"
}
```

---

## 2️⃣ User Authentication

### Register as Student

```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "Password123!",
  "role": "student",
  "firstName": "John",
  "lastName": "Doe"
}
```

### Login

```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "Password123!",
  "role": "student"
}
```

**Save the token from response for other API calls**

---

## 3️⃣ Student Profile Management

### Get Student Profile

```
GET http://localhost:5000/api/students/profile
Authorization: Bearer {token}
```

### Update Student Profile

```
PUT http://localhost:5000/api/students/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phoneNumber": "9876543210",
  "bio": "Passionate developer",
  "academicInfo": {
    "cgpa": 8.5,
    "department": "Computer Science",
    "year": 3,
    "semester": 6,
    "attendancePercentage": 85,
    "backlogCount": 0
  },
  "skills": [
    {
      "name": "Python",
      "level": "Advanced",
      "verified": true
    },
    {
      "name": "JavaScript",
      "level": "Advanced",
      "verified": false
    }
  ]
}
```

---

## 4️⃣ Coding Platform Integration

### Fetch LeetCode Stats

```
POST http://localhost:5000/api/coding-platforms/stats
Authorization: Bearer {token}
Content-Type: application/json

{
  "platforms": ["leetcode"],
  "usernames": {
    "leetcode": "your_leetcode_username"
  }
}
```

### Fetch All Platform Stats

```
POST http://localhost:5000/api/coding-platforms/stats
Authorization: Bearer {token}
Content-Type: application/json

{
  "platforms": ["leetcode", "codeforces", "codechef"],
  "usernames": {
    "leetcode": "your_leetcode",
    "codeforces": "your_codeforces",
    "codechef": "your_codechef"
  }
}
```

### Get Coding Growth (Last 6 Months)

```
GET http://localhost:5000/api/coding-platforms/growth
Authorization: Bearer {token}
```

---

## 5️⃣ AI Features

### Get Career Prediction

```
GET http://localhost:5000/api/ai/career-prediction
Authorization: Bearer {token}
```

**Expected Response**:

```json
{
  "success": true,
  "data": {
    "placementProbability": 82,
    "recommendedRoles": ["Software Engineer", "Data Analyst"],
    "skillGaps": ["Machine Learning", "System Design"],
    "companies": ["Google", "Amazon", "MS"]
  }
}
```

### Get Skill Gap Analysis

```
GET http://localhost:5000/api/ai/skill-gap
Authorization: Bearer {token}
```

### Get Job Recommendations

```
GET http://localhost:5000/api/ai/job-recommendations
Authorization: Bearer {token}
```

---

## 6️⃣ Recruiter Features

### Create Job Requirements (as Recruiter)

```
POST http://localhost:5000/api/ai/shortlist
Authorization: Bearer {token}
Content-Type: application/json

{
  "jobTitle": "Senior Software Engineer",
  "company": "Tech Corp",
  "requirements": {
    "minCGPA": 7.5,
    "maxBacklogs": 1,
    "mandatorySkills": ["Python", "AWS"],
    "preferredSkills": ["Machine Learning", "Docker"],
    "yearsOfExperience": 2
  }
}
```

**Expected Response**:

```json
{
  "success": true,
  "data": {
    "totalEligible": 15,
    "shortlisted": [
      {
        "id": "student_id",
        "name": "John Doe",
        "cgpa": 8.5,
        "codingRating": 1900,
        "projects": 3,
        "matchScore": 89
      }
    ],
    "statistics": {
      "averageCGPA": 8.2,
      "averageCodingRating": 1750
    }
  }
}
```

---

## 7️⃣ University/College Features

### Get College Analytics

```
GET http://localhost:5000/api/analytics/college-dashboard
Authorization: Bearer {token}
Content-Type: application/json

{
  "collegeId": "{college_id}",
  "year": 2024,
  "department": "Computer Science"
}
```

### Verify Student

```
PUT http://localhost:5000/api/colleges/verify-student/{studentId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "verificationStatus": "approved",
  "verifiedCGPA": 8.5,
  "verifiedAttendance": 85,
  "notes": "Record verified with college database"
}
```

---

## 8️⃣ Resume Upload & Analysis

### Upload Resume

```
POST http://localhost:5000/api/students/resume
Authorization: Bearer {token}
Content-Type: multipart/form-data

[File] resume.pdf or resume.docx
```

### Get Resume Analysis

```
GET http://localhost:5000/api/students/resume-analysis
Authorization: Bearer {token}
```

---

## 9️⃣ Notifications

### Send Email Notification

```
POST http://localhost:5000/api/notifications/send
Authorization: Bearer {token}
Content-Type: application/json

{
  "recipientId": "user_id",
  "type": "opportunity_alert",
  "data": {
    "jobTitle": "Software Engineer",
    "company": "Google",
    "link": "https://example.com/job"
  }
}
```

### Batch Email Notification

```
POST http://localhost:5000/api/notifications/batch-send
Authorization: Bearer {token}
Content-Type: application/json

{
  "recipients": ["user_id_1", "user_id_2"],
  "type": "placement_opportunity",
  "template": "opportunity_alert",
  "data": {
    "company": "Microsoft",
    "deadline": "2024-04-30"
  }
}
```

---

## 🔟 Placement Analytics

### Get Student Placement Analytics

```
GET http://localhost:5000/api/analytics/student-dashboard
Authorization: Bearer {token}
```

### Get Recruiter Analytics

```
GET http://localhost:5000/api/analytics/recruiter-dashboard
Authorization: Bearer {token}
```

**Expected Response**:

```json
{
  "success": true,
  "data": {
    "totalApplications": 45,
    "targetedApplications": 32,
    "placedCandidates": 8,
    "pendingApplications": 5,
    "successRate": 75,
    "averageTimeToHire": 14,
    "topSkillsRequired": ["Python", "SQL", "AWS"],
    "hiringSources": ["Portal", "Referral", "College"]
  }
}
```

---

## Error Responses

### Unauthorized (401)

```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

### Forbidden (403)

```json
{
  "success": false,
  "message": "Access denied. student role is not authorized to access this resource."
}
```

### Server Error (500)

```json
{
  "success": false,
  "message": "Something went wrong!",
  "error": "Error details only shown in development"
}
```

---

## 📝 Test Scenarios

### Scenario 1: Complete Student Flow

1. Register as student
2. Complete profile builder
3. Link LeetCode/CodeChef profiles
4. Get career prediction
5. View job recommendations
6. Upload resume

### Scenario 2: Recruiter Hiring Flow

1. Register as recruiter
2. Create job requirements
3. Get AI shortlisted candidates
4. View candidate details
5. Send email notifications
6. Track analytics

### Scenario 3: College Admin Flow

1. Register as college
2. Verify multiple students
3. View placement analytics
4. Export reports
5. Send batch notifications

---

## 🧪 Testing Tools

- **Postman**: [Download](https://www.postman.com/downloads/)
- **Thunder Client** (VS Code): Install from Extensions
- **REST Client** (VS Code): Install and use .http/.rest files
- **cURL**: Command line testing

### Sample cURL Command

```bash
curl -X GET http://localhost:5000/api/health \
  -H "Accept: application/json"
```

---

## ✅ Common Issues

| Error                               | Solution                                           |
| ----------------------------------- | -------------------------------------------------- |
| "Access denied. No token provided." | Add `Authorization: Bearer {token}` header         |
| "Invalid token"                     | Re-login and get fresh token                       |
| "CORS error"                        | Make sure frontend and backend are running         |
| "MongoDB connection error"          | Check MONGODB_URI in .env and network connectivity |
| "Firebase token error"              | Check Firebase configuration in firebase.ts        |

---

**Last Updated**: April 13, 2026
