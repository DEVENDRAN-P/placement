# Coding Platform Integration Guide

## Overview
Your Career Intelligence Portal automatically fetches coding platform statistics when students provide their usernames during signup or via the coding profiles linker page.

## How It Works

### 1. During Student Signup

When a student registers with coding platform usernames, the system:

#### **Step 1: Form Input**
- Frontend collects optional coding platform usernames:
  - LeetCode Username
  - CodeChef Username  
  - Codeforces Username
- Located in: [client/src/components/Auth/Register.tsx](client/src/components/Auth/Register.tsx#L330-L355)

#### **Step 2: Backend Processing**
- Registration endpoint receives the usernames
- Located in: [server/routes/auth.js](server/routes/auth.js#L225-L300)
- Calls `createStudentProfile()` function
- Located in: [server/routes/auth.js](server/routes/auth.js#L64-L155)

#### **Step 3: Data Fetching**
For each provided username, the system fetches:

**LeetCode Stats:**
- Total problems solved
- Easy/Medium/Hard breakdown
- User rating
- GraphQL API: `https://leetcode.com/graphql`
- Located in: [server/services/codingPlatforms.js](server/services/codingPlatforms.js#L7-L81)

**CodeChef Stats:**
- Coding rating
- Star rating
- Total problems solved
- Web scraping: `https://www.codechef.com/users/{username}`
- Located in: [server/services/codingPlatforms.js](server/services/codingPlatforms.js#L84-L111)

**Codeforces Stats:**
- User rating
- Rank (Newbie, Specialist, Pupil, Expert, Candidate Master, Master, Grandmaster)
- Total problems solved
- API: `https://codeforces.com/api/user.info` + `https://codeforces.com/api/user.status`
- Located in: [server/services/codingPlatforms.js](server/services/codingPlatforms.js#L114-L170)

#### **Step 4: Data Storage**
- All fetched stats are stored in the Student profile
- Stored in MongoDB collection: `students.codingProfiles`
- Format includes:
  - Username
  - Total problems solved
  - Ratings/Rankings
  - Last updated timestamp

### 2. After Signup - Linking Profiles

Students can update/add coding profiles anytime via:

**Location:** `http://localhost:3000/coding-profiles`

**Component:** [client/src/components/Student/CodingProfilesLinker.tsx](client/src/components/Student/CodingProfilesLinker.tsx)

**Features:**
- View current linked profiles
- Add new coding platform usernames
- Fetch latest stats on demand
- Backend endpoint: `POST /api/coding-platforms/fetch-all-stats`
- Located in: [server/routes/codingPlatforms.js](server/routes/codingPlatforms.js#L37-L120)

## API Endpoints

### **Fetch All Stats** (After Signup)
```
POST /api/coding-platforms/fetch-all-stats
Authorization: Bearer {token}

Request Body:
{
  "leetcodeUsername": "user123",
  "codechefUsername": "user456",
  "codeforcesUsername": "user789"
}

Response:
{
  "success": true,
  "data": {
    "studentProfile": {
      "codingProfiles": {
        "leetcode": {
          "username": "user123",
          "totalSolved": 450,
          "easySolved": 200,
          "mediumSolved": 180,
          "hardSolved": 70,
          "rating": 2100,
          "lastUpdated": "2026-05-04T10:30:00Z"
        },
        "codechef": {
          "username": "user456",
          "totalSolved": 320,
          "rating": 1850,
          "stars": "5★",
          "lastUpdated": "2026-05-04T10:30:00Z"
        },
        "codeforces": {
          "username": "user789",
          "totalSolved": 280,
          "rating": 1600,
          "rank": "Expert",
          "lastUpdated": "2026-05-04T10:30:00Z"
        }
      }
    }
  }
}
```

### **Get My Profiles**
```
GET /api/coding-platforms/my-profiles
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "profiles": {
      "leetcode": { ... },
      "codechef": { ... },
      "codeforces": { ... }
    }
  }
}
```

## Data Flow Diagram

```
Student Registration
       ↓
Frontend Form (Register.tsx)
   ↓ Collects usernames ↓
  - LeetCode
  - CodeChef
  - Codeforces
       ↓
Backend: POST /api/auth/register
       ↓
createStudentProfile() function
       ↓
For each username:
  ├→ LeetCode GraphQL API
  ├→ CodeChef Web Scraper
  └→ Codeforces REST API
       ↓
CodingPlatformService.fetchCodingStats()
       ↓
Parse & Validate Results
       ↓
Store in MongoDB
   (students.codingProfiles)
       ↓
Student Profile Created ✓
```

## Fetched Data Details

### LeetCode Profile Data
```javascript
{
  username: "user123",
  totalSolved: 450,           // Total AC submissions
  easySolved: 200,            // Easy problems solved
  mediumSolved: 180,          // Medium problems solved
  hardSolved: 70,             // Hard problems solved
  rating: 2100,               // LeetCode rating
  lastUpdated: Date           // When stats were fetched
}
```

### CodeChef Profile Data
```javascript
{
  username: "user456",
  totalSolved: 320,           // Total problems solved
  rating: 1850,               // CodeChef rating
  stars: "5★",                // Star rating
  lastUpdated: Date           // When stats were fetched
}
```

### Codeforces Profile Data
```javascript
{
  username: "user789",
  totalSolved: 280,           // Unique problems solved
  rating: 1600,               // Codeforces rating
  rank: "Expert",             // Rank based on rating
  lastUpdated: Date           // When stats were fetched
}
```

## Error Handling

If a coding platform is unavailable or username is invalid:

1. **Validation Before Fetch:**
   - Username format validation
   - Pattern matching: LeetCode/CodeChef (3-20 chars), Codeforces (3-24 chars)

2. **API Call Failures:**
   - Try-catch blocks for each platform
   - Graceful fallback to empty stats
   - Error logging for debugging
   - User-friendly error messages

3. **During Signup:**
   - If stats fetch fails, profile is still created
   - Empty stats initialized: `{ username: "", totalSolved: 0, ... }`
   - Student can update stats later via Coding Profiles page

## Usage Example

### Example 1: Signup with All Platforms
```
1. Open: http://localhost:3000/register
2. Select "I'm a Student"
3. Fill in basic details
4. Enter:
   - LeetCode: "davidgarner"
   - CodeChef: "davidgarner92"
   - Codeforces: "DavidGarner"
5. Click "Create Account"
6. System automatically fetches stats from all platforms
7. Profile created with complete coding data
```

### Example 2: Update Profiles Later
```
1. Login as student
2. Navigate to "Link Coding Profiles"
3. Enter username: "davidgarner" (LeetCode)
4. Click "Fetch Stats"
5. Stats are fetched and saved
6. Can repeat for other platforms
```

## API Timeout Configuration

- **Configured Timeout:** 30 seconds
- **Reason:** External API calls can be slow
- **File:** [client/src/services/api.ts](client/src/services/api.ts#L9)

This allows:
- LeetCode GraphQL queries to complete
- CodeChef web scraping to finish
- Codeforces API rate limiting

## Security Features

1. **Rate Limiting:**
   - Auth endpoints: 5 attempts per 15 minutes
   - File: [server/middleware/rateLimit.js](server/middleware/rateLimit.js)

2. **Input Validation:**
   - Username format validation before API calls
   - Express-validator on all endpoints

3. **Error Handling:**
   - No sensitive data in error messages
   - Proper null/undefined checks
   - Prevents ReDoS attacks in searches

## Testing the Feature

### Test Scenario 1: Complete Signup with Profiles
```bash
1. Go to: http://localhost:3000/register
2. Choose Student role
3. Fill: firstName, lastName, email, password
4. Add coding platform usernames:
   - Any valid LeetCode username
   - Any valid CodeChef username
   - Any valid Codeforces username
5. Submit
6. Check MongoDB for stored stats
7. View profile - stats should be populated
```

### Test Scenario 2: Update Profiles
```bash
1. Login as student
2. Go to: http://localhost:3000/coding-profiles
3. Enter new usernames
4. Click "Fetch Stats"
5. Wait for stats to load
6. Verify stats are updated
```

### Test Scenario 3: Handle Invalid Username
```bash
1. Go to: http://localhost:3000/coding-profiles
2. Enter invalid username (e.g., "xyz" for LeetCode)
3. Click "Fetch Stats"
4. Should see error message
5. Profile should not crash
```

## Backend Logs to Monitor

When testing, monitor these logs in terminal:

```
✅ LeetCode: Fetched stats for user davidgarner
✅ CodeChef: Fetched stats for user davidgarner92
✅ Codeforces: Fetched stats for user DavidGarner
```

Or error logs:
```
❌ LeetCode API error: User not found
❌ CodeChef scraping error: Page unavailable
❌ Codeforces API error: Invalid response
```

## Key Files Reference

| File | Purpose |
|------|---------|
| [server/services/codingPlatforms.js](server/services/codingPlatforms.js) | API integrations for all platforms |
| [server/routes/codingPlatforms.js](server/routes/codingPlatforms.js) | Express endpoints |
| [server/routes/auth.js](server/routes/auth.js) | Signup logic with profile creation |
| [client/src/components/Auth/Register.tsx](client/src/components/Auth/Register.tsx) | Signup form |
| [client/src/components/Student/CodingProfilesLinker.tsx](client/src/components/Student/CodingProfilesLinker.tsx) | Profile management UI |
| [client/src/services/api.ts](client/src/services/api.ts) | Frontend API client |

## Current Status

✅ **All features implemented and working:**
- LeetCode integration via GraphQL API
- CodeChef integration via web scraping
- Codeforces integration via REST API
- Automatic stats fetching during signup
- Manual stats update via dedicated page
- Proper error handling and validation
- Data persistence in MongoDB
- 30-second timeout for slow connections

## Next Steps

To enhance further:

1. **Historical Tracking:**
   - Store monthly snapshots of stats
   - Show progress graphs over time

2. **Real-time Updates:**
   - Cron jobs to auto-update stats weekly
   - Notify students of achievements

3. **Advanced Analytics:**
   - Compare coding performance across platforms
   - ML-based growth predictions
   - Skill gap analysis

4. **Achievements:**
   - Automatic badge generation
   - Milestone celebrations
   - Blockchain verification

---

**Last Updated:** May 4, 2026
**Status:** ✅ Production Ready
