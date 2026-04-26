# Placement Portal - Quick Reference & Developer Guide

## 🚀 Quick Start

### Access Placement Portal

```
URL: http://localhost:3000/college/placement-portal
Auth: College account required
```

### Access Public Student Profile

```
URL: http://localhost:3000/student/public/{studentId}
Auth: Public (no authentication needed)
```

---

## 📁 Key Files Reference

### Frontend Components

#### **PlacementPortal.tsx**

- **Location:** `client/src/components/College/PlacementPortal.tsx`
- **Purpose:** Main college portal with 4 tabs
- **Lines:** 420+
- **Key Functions:**
  - `handleFilter()` - Apply filtering criteria
  - `handleShortlist()` - Run AI ranking
  - `handleSendEmail()` - Send bulk emails
  - `handleExport()` - Download CSV
  - `handleStatusUpdate()` - Update placement info

#### **PublicStudentProfile.tsx**

- **Location:** `client/src/components/Student/PublicStudentProfile.tsx`
- **Purpose:** Recruiter-facing profile display
- **Lines:** 500+
- **Key Sections:**
  - Header with verification badge
  - Academic details
  - Skills with badges
  - Coding platform stats
  - Projects showcase
  - Achievements
  - Resume download
  - Social links

### Backend Routes

#### **placements.js**

- **Location:** `server/routes/placements.js`
- **Purpose:** All placement management endpoints
- **Lines:** 450+
- **Endpoints:**
  - `GET /students/public/:studentId`
  - `POST /filter`
  - `POST /shortlist`
  - `POST /send-update`
  - `POST /update-status`
  - `POST /export`

### Services

#### **api.ts - placementManagementAPI**

- **Location:** `client/src/services/api.ts`
- **Purpose:** API client for frontend
- **Methods:**
  ```javascript
  placementManagementAPI.filterStudents(criteria);
  placementManagementAPI.aiShortlisting(params);
  placementManagementAPI.sendPlacementUpdate(data);
  placementManagementAPI.updatePlacementStatus(data);
  placementManagementAPI.exportShortlist(studentIds);
  placementManagementAPI.getPublicStudentProfile(studentId);
  ```

---

## 🔑 API Endpoints

### Filter Students

```
POST /api/placements/filter
Authorization: Bearer {JWT}

Request Body:
{
  minCGPA: 7.0,
  maxCGPA: 10,
  department: "Computer Science",
  year: 4,
  minCodingRating: 1000,
  skills: ["JavaScript", "React"],
  isPlaced: false,
  searchQuery: "Raj"
}

Response:
{
  success: true,
  data: [{
    _id: "...",
    name: "Raj Kumar",
    academicInfo: { cgpa: 8.5, department: "CS", year: 4 },
    codingProfiles: { leetcode: { rating: 2000 }, ... },
    ...
  }, ...]
}
```

### AI Shortlisting

```
POST /api/placements/shortlist
Authorization: Bearer {JWT}

Request Body:
{
  studentIds: ["id1", "id2", "id3"],
  jobRequirements: {
    requiredSkills: ["JavaScript", "React"]
  }
}

Response:
{
  success: true,
  data: [{
    ...student,
    aiScore: 87.3,
    scoreBreakdown: {
      coding: 80,
      cgpa: 85,
      skills: 92,
      projects: 100
    }
  }, ...]
}
```

### Send Placement Update

```
POST /api/placements/send-update
Authorization: Bearer {JWT}

Request Body:
{
  subject: "Placement Drive - Google",
  message: "<html>...</html>",
  studentIds: ["id1", "id2"],
  templateType: "opportunity"
}

Response:
{
  success: true,
  message: "Emails sent successfully",
  data: {
    sentCount: 2,
    timestamp: "2026-04-26T10:30:00Z"
  }
}
```

### Update Placement Status

```
POST /api/placements/update-status
Authorization: Bearer {JWT}

Request Body:
{
  studentIds: ["id1", "id2"],
  isPlaced: true,
  company: "Google",
  role: "Software Engineer",
  package: 1200000
}

Response:
{
  success: true,
  data: { modifiedCount: 2 }
}
```

### Get Public Student Profile

```
GET /api/placements/students/public/:studentId

Response:
{
  success: true,
  data: {
    _id: "...",
    name: "Raj Kumar",
    academicInfo: { cgpa: 8.5, ... },
    skills: [{ name: "JavaScript", verified: true }],
    codingProfiles: { ... },
    resume: { fileUrl: "...", plagiarismScore: 5 },
    projects: [{ title: "...", technologies: ["React"] }],
    achievements: [{ ... }],
    socialLinks: { linkedin: "...", github: "..." },
    placementStatus: { isPlaced: true, company: "Google" }
  }
}
```

### Export Shortlist

```
POST /api/placements/export
Authorization: Bearer {JWT}

Request Body:
{
  studentIds: ["id1", "id2", "id3"]
}

Response:
{
  success: true,
  data: {
    csv: "name,email,cgpa,department,year,leetcode,codechef,codeforces,skills,...\nRaj Kumar,raj@...",
    filename: "shortlist_2026-04-26.csv"
  }
}
```

---

## 🧮 AI Scoring Algorithm

### Implementation

```javascript
// In placements.js - POST /shortlist

const calculateScore = (student, requiredSkills = []) => {
  // Coding score (40%)
  const maxCodingRating = Math.max(
    student.codingProfiles?.leetcode?.rating || 0,
    student.codingProfiles?.codechef?.rating || 0,
    student.codingProfiles?.codeforces?.rating || 0,
  );
  const codingScore = Math.min(100, (maxCodingRating / 2500) * 100);

  // CGPA score (30%)
  const cgpaScore = (student.academicInfo.cgpa / 10) * 100;

  // Skills score (20%)
  const studentSkills = student.skills.map((s) => s.name.toLowerCase());
  const matchCount = requiredSkills.filter((req) =>
    studentSkills.some((s) => s.includes(req.toLowerCase())),
  ).length;
  const skillsScore =
    requiredSkills.length > 0
      ? (matchCount / requiredSkills.length) * 100
      : Math.min(100, (student.skills.length / 10) * 100);

  // Projects score (10%)
  const projectsScore = Math.min(
    100,
    ((student.projects?.length || 0) / 5) * 100,
  );

  // Total
  return {
    total:
      codingScore * 0.4 +
      cgpaScore * 0.3 +
      skillsScore * 0.2 +
      projectsScore * 0.1,
    breakdown: {
      coding: codingScore,
      cgpa: cgpaScore,
      skills: skillsScore,
      projects: projectsScore,
    },
  };
};
```

---

## 🛠️ Common Tasks

### Add New Filter Criterion

1. Update PlacementPortal.tsx state
2. Add filter UI in Tab 2
3. Update request body to placements.js
4. Add to MongoDB query in POST /filter

### Modify AI Weights

1. Edit `calculateScore()` in placements.js
2. Change percentages (must sum to 1.0)
3. Example: `(coding * 0.5) + (cgpa * 0.3) + (skills * 0.15) + (projects * 0.05)`

### Add Email Template

1. Add template option to BulkNotifications form
2. Create template string in component
3. Pass templateType to backend
4. Add case in placements.js

### Change CSV Export Fields

1. Modify export button handler in PlacementPortal
2. Update POST /export in placements.js
3. Adjust field selection in MongoDB query

---

## 🔍 Debugging Tips

### Issue: Filter returns no results

- Check MongoDB connection
- Verify student records exist
- Check filter criteria values
- Look at server logs for query error

### Issue: AI shortlisting scores are 0

- Verify studentIds exist
- Check coding profiles are populated
- Check CGPA values exist
- Add console.log in calculateScore()

### Issue: Emails not sending

- Check .env has EMAIL_USER and EMAIL_PASS
- Verify student emails are valid
- Check nodemailer transporter config
- Look for SMTP errors in server logs

### Issue: Public profile not loading

- Verify studentId is valid
- Check isProfilePublic is true in DB
- Look at Network tab for 404
- Check server logs for errors

---

## 📊 Database Queries

### Students with high CGPA and coding rating

```javascript
db.students.find({
  "academicInfo.cgpa": { $gte: 8.0 },
  "codingProfiles.leetcode.rating": { $gte: 1500 },
});
```

### Get all placed students

```javascript
db.students.find({
  "placementStatus.isPlaced": true,
});
```

### Find students with specific skills

```javascript
db.students.find({
  "skills.name": { $in: ["JavaScript", "React"] },
});
```

### Students with public profiles

```javascript
db.students.find({
  isProfilePublic: true,
});
```

---

## 🧪 Manual Testing Checklist

### Filtering Feature

- [ ] Load PlacementPortal
- [ ] Set CGPA range (7.0-10)
- [ ] Select department
- [ ] Set min coding rating
- [ ] Click "Filter Students"
- [ ] Verify results show correctly
- [ ] Select multiple students
- [ ] Click "Shortlist Selected"

### AI Shortlisting

- [ ] View shortlisting results
- [ ] Check scores are 0-100
- [ ] Verify descending order
- [ ] Look at score breakdown
- [ ] Click on student to view details

### Email System

- [ ] Type email subject
- [ ] Type email message
- [ ] Select student recipients
- [ ] Click "Send Emails"
- [ ] Verify in email client
- [ ] Check delivery timestamp

### Public Profile

- [ ] Go to student public profile URL
- [ ] Verify verification badges show
- [ ] Check coding stats display
- [ ] Check skills are visible
- [ ] Verify download resume button
- [ ] Test responsive design

---

## 📝 Common Modifications

### Change Filter Criteria

**File:** `PlacementPortal.tsx` (Tab 2: Filter section)

```jsx
// Add new filter field
const [customFilter, setCustomFilter] = useState("");

// Add UI control
<input
  placeholder="Custom filter"
  value={customFilter}
  onChange={(e) => setCustomFilter(e.target.value)}
/>;

// Add to request
const response = await placementManagementAPI.filterStudents({
  ...criteria,
  customFilter,
});
```

### Add Email Template

**File:** `PlacementPortal.tsx` (BulkNotifications component)

```jsx
const emailTemplates = {
  opportunity: "Join our placement drive...",
  update: "Placement status update...",
  interview: "Interview scheduled for...",
  custom: emailMessage, // User typed
};
```

### Modify Export Fields

**File:** `placements.js` (POST /export)

```javascript
const csv = studentIds.map(id => {
  const student = /* get from DB */;
  return [
    student.name,
    student.email,
    student.academicInfo.cgpa,
    student.customField // Add here
  ].join(',');
});
```

---

## 🔐 Security Notes

### Protected Routes

- All college portal endpoints require JWT + college role
- Public profile has no auth but filters by isProfilePublic

### Data Validation

- Always validate student IDs exist before operations
- Sanitize email content before sending
- Check authorization on every request

### Best Practices

- Never expose sensitive data in public profiles
- Always hash/encrypt resume files
- Use HTTPS in production
- Implement rate limiting for email endpoint

---

## 📞 Support

For issues:

1. Check server logs: `node server/index.js`
2. Check browser console: F12 → Console
3. Check Network tab for API errors
4. Verify MongoDB connection
5. Check .env configuration

---

**Last Updated:** April 26, 2026  
**Version:** 1.0  
**Status:** Production Ready
