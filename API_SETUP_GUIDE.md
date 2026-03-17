# API Setup Guide - Complete Instructions

This guide lists all APIs needed for the Career Intelligence Portal and provides step-by-step instructions to get them **completely FREE**.

---

## 📋 All APIs Required (14 Total)

| #   | API                          | Purpose                       | Cost             | Status         |
| --- | ---------------------------- | ----------------------------- | ---------------- | -------------- |
| 1   | **LeetCode GraphQL API**     | Fetch coding stats            | Free             | ✅ Ready       |
| 2   | **CodeChef Scraping**        | Fetch CodeChef stats          | Free             | ✅ Ready       |
| 3   | **Codeforces REST API**      | Fetch Codeforces stats        | Free             | ✅ Ready       |
| 4   | **Gmail SMTP**               | Send emails                   | Free (limited)   | ⏳ Needs Setup |
| 5   | **OpenAI API**               | AI analysis & recommendations | Free trial       | ⏳ Needs Setup |
| 6   | **MongoDB Atlas**            | Database                      | Free (shared)    | ✅ Ready       |
| 7   | **Firebase Authentication**  | User authentication           | Free tier        | ⏳ Needs Setup |
| 8   | **SendGrid API**             | Email service (optional)      | Free (100/day)   | ⏳ Optional    |
| 9   | **Plagiarism Detection API** | Resume plagiarism check       | Free trial       | ⏳ Optional    |
| 10  | **PapersWithCode API**       | AI skill recommendations      | Free             | ⏳ Optional    |
| 11  | **Hugging Face API**         | NLP for profile analysis      | Free             | ⏳ Optional    |
| 12  | **GitHub API**               | Get student's GitHub projects | Free             | ⏳ Optional    |
| 13  | **Cloudinary or AWS S3**     | File storage (resumes)        | Free tier        | ⏳ Optional    |
| 14  | **Stripe API**               | Subscription payments         | Free (test mode) | ⏳ Optional    |

---

## 🚀 ESSENTIAL APIs (Must Have - FREE)

### 1️⃣ **LeetCode GraphQL API**

**Status**: ✅ Already working in code
**Cost**: 100% FREE
**What it does**: Fetches LeetCode problem-solving stats

**How to Use**:

```javascript
// Already implemented in server/services/codingPlatforms.js
// No API key needed!
// Just use username to fetch stats
```

**Test it immediately**:

```bash
# Try this in PowerShell
$body = @{
  leetcodeUsername = "username_here"  # Replace with any LeetCode username
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/coding/fetch-all-stats" `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body `
  -Method POST
```

---

### 2️⃣ **Codeforces REST API**

**Status**: ✅ Already working in code
**Cost**: 100% FREE
**What it does**: Fetches Codeforces problem-solving stats

**How to Use**:

```javascript
// Already implemented in server/services/codingPlatforms.js
// No API key needed!
// Endpoint: https://codeforces.com/api/user.info?handles=USERNAME
```

**Test it**:

```bash
# Try this in PowerShell
Invoke-WebRequest "https://codeforces.com/api/user.info?handles=tourist" |
  Select-Object -ExpandProperty Content |
  ConvertFrom-Json |
  Select-Object -ExpandProperty result
```

---

### 3️⃣ **CodeChef Scraping**

**Status**: ✅ Already working in code
**Cost**: 100% FREE
**What it does**: Scrapes CodeChef profile stats

**How to Use**:

```javascript
// Uses cheerio for HTML scraping
// No API key needed!
// Web scraping from: https://www.codechef.com/users/USERNAME
```

**Test it**:

```bash
# Use any CodeChef username
curl "https://www.codechef.com/users/gennady"
```

---

### 4️⃣ **Gmail SMTP (Email Service)**

**Status**: ⏳ Needs Setup
**Cost**: FREE (up to 500/day)
**What it does**: Sends verification emails, notifications, job matches

**⚙️ FREE Setup Instructions (Google App Password Method)**:

#### Step 1: Enable 2-Factor Authentication

1. Go to **Google Account**: https://myaccount.google.com
2. Left sidebar → **Security**
3. Under "How you sign in to Google" → **2-Step Verification**
4. Enable it (follow prompts)

#### Step 2: Generate App Password

1. After 2FA enabled, go to **Security** tab again
2. Scroll down to **App passwords** (appears after 2FA)
3. Select:
   - Device: **Windows Computer**
   - App: **Mail**
4. Google generates a **16-character password**
5. Copy it (it's your `EMAIL_PASS`)

#### Step 3: Update .env file

```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_gmail_email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx  # Paste the 16-char password here
```

#### Step 4: Test it works

```bash
# Test email sending
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@gmail.com",
    "password": "Test123!",
    "role": "student",
    "firstName": "Test",
    "lastName": "User"
  }'

# Check email arrives in inbox
```

**📧 What emails will be sent**:

- Email verification on signup
- Placement notifications
- Interview calls
- Skill gap reports
- Career feedback

---

## 🤖 RECOMMENDED APIs (Better Features - FREE)

### 5️⃣ **OpenAI API (ChatGPT)**

**Status**: ⏳ Needs Setup
**Cost**: FREE trial ($5 credit - good for testing)
**What it does**: AI skill gap analysis, career predictions, resume feedback

**📍 GET IT FREE**:

#### Step 1: Create OpenAI Account

1. Go to: https://platform.openai.com/signup
2. Sign up with email (free)
3. Verify email

#### Step 2: Get FREE Trial Credit

1. Dashboard → **Billing** → **Overview**
2. You get **$5 free credit** for 3 months
3. Set usage limit to $2/month for safety

#### Step 3: Generate API Key

1. Click your profile icon (top right)
2. Go to **API keys**
3. Click **Create new secret key**
4. Copy immediately (won't show again!)

#### Step 4: Update .env

```
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx
```

#### Step 5: Add to application

```javascript
// Create file: server/services/openaiService.js
const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Use for skill gap analysis
exports.analyzeSkillGaps = async (studentProfile) => {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: `Analyze this student's profile and identify skill gaps:
        ${JSON.stringify(studentProfile)}`,
      },
    ],
  });
  return response.choices[0].message.content;
};
```

**Install OpenAI SDK**:

```bash
npm install openai --save
```

**Cost Calculator**:

- $5 credit ÷ ~$0.002 per request = ~2,500 API calls
- Enough for 2-3 months of testing!

---

### 6️⃣ **MongoDB Atlas (Database)**

**Status**: ✅ Already Setup
**Cost**: FREE (up to 512MB)
**What it does**: Store all user data

**Your Current Setup**:

```
mongodb+srv://devendranprabhakar2007_db_user:U559djAx3THwmDzE@cluster0.a82o8x5.mongodb.net/career_intelligence
```

✅ Already configured and working!

---

### 7️⃣ **Firebase Authentication**

**Status**: ⏳ Can be setup
**Cost**: FREE (up to 50k users)
**What it does**: Alternative OAuth login (Google, GitHub, Facebook)

**📍 OPTIONAL Setup** (if you want SSO):

#### Step 1: Create Firebase Project

1. Go to: https://console.firebase.google.com
2. Click **Create Project**
3. Enter name: "career-intelligence"
4. Continue through setup

#### Step 2: Enable Authentication Methods

1. Left sidebar → **Authentication**
2. Click **Get Started**
3. Enable:
   - Email/Password ✅
   - Google ✅
   - GitHub ✅

#### Step 3: Get Config

1. Project Settings (gear icon)
2. Copy your config object
3. Save to `.env` or config file

---

## 📦 OPTIONAL APIs (Nice to Have - FREE)

### 8️⃣ **SendGrid Email API**

**Better than Gmail SMTP**
**Cost**: FREE (100 emails/day)
**Why**: More reliable than SMTP

**Setup if Gmail doesn't work**:

1. Go to: https://sendgrid.com
2. Sign up (free)
3. Generate API key
4. Update `.env`:

```
SENDGRID_API_KEY=SG.xxxxxxxxxxxx
```

---

### 9️⃣ **Hugging Face (NLP)**

**For better skill analysis**
**Cost**: FREE API
**Setup**:

```bash
npm install @huggingface/inference

# Get API key from: https://huggingface.co/settings/tokens
```

```javascript
import { HfInference } from "@huggingface/inference";

const hf = new HfInference(process.env.HUGGING_FACE_API_KEY);

// Analyze resume text
const analysis = await hf.documentQuestionAnswering({
  model: "impira/layoutlm-document-qa",
  inputs: {
    question: "What skills are mentioned?",
    image: resumeFile,
  },
});
```

---

### 🔟 **GitHub API**

**Fetch student's GitHub projects**
**Cost**: FREE (5000 requests/hour)
**Setup**:

```bash
# Get token: https://github.com/settings/tokens
# Create Personal Access Token (read-only)
```

```javascript
const { Octokit } = require("@octokit/rest");

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

// Get user repos
const repos = await octokit.repos.listForUser({
  username: "github_username",
  per_page: 100,
});
```

---

### 1️⃣1️⃣ **Cloudinary (File Storage)**

**For resume PDFs instead of local storage**
**Cost**: FREE (25GB/month)
**Setup**:

1. Go to: https://cloudinary.com
2. Sign up (free)
3. Get credentials from dashboard
4. Use instead of local file uploads

```bash
npm install cloudinary

# In .env:
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
```

---

## ✅ QUICK SETUP CHECKLIST

### Must Do (15 minutes)

- [ ] Gmail App Password setup (.env EMAIL_PASS)
- [ ] Test email sending
- [ ] Update .env file completely

### Should Do (30 minutes)

- [ ] Get OpenAI API key
- [ ] Add OpenAI to .env
- [ ] Update OpenAI service code
- [ ] Test AI features

### Nice to Have (optional)

- [ ] GitHub API for portfolio pulling
- [ ] Cloudinary for file storage
- [ ] Hugging Face for advanced NLP
- [ ] SendGrid as Gmail backup

---

## 🔧 Complete .env Template

```properties
# ============ ESSENTIAL ============

# Server
PORT=5000
NODE_ENV=development

# Database - Already setup ✅
MONGODB_URI=mongodb+srv://devendranprabhakar2007_db_user:U559djAx3THwmDzE@cluster0.a82o8x5.mongodb.net/career_intelligence?retryWrites=true&w=majority

# JWT
JWT_SECRET=your_secret_key_change_in_production
JWT_EXPIRE=7d

# Gmail SMTP - SETUP REQUIRED ⏳
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx

# Frontend URL
FRONTEND_URL=http://localhost:3000

# ============ RECOMMENDED ============

# OpenAI API - Get FREE $5 credit ⏳
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx

# ============ OPTIONAL ============

# SendGrid Email (backup)
SENDGRID_API_KEY=SG.xxxxxxxxxxxx

# GitHub API
GITHUB_TOKEN=ghp_xxxxxxxxxxxx

# Hugging Face API
HUGGING_FACE_API_KEY=hf_xxxxxxxxxxxx

# Cloudinary (file storage)
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx

# Stripe (payment - test mode)
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxx
STRIPE_PUBLIC_KEY=pk_test_xxxxxxxxxxxx

# Firebase
FIREBASE_API_KEY=xxxxxxxxxxxx
FIREBASE_AUTH_DOMAIN=xxx.firebaseapp.com
FIREBASE_PROJECT_ID=xxx
FIREBASE_STORAGE_BUCKET=xxx.appspot.com
```

---

## 🧪 Test Each API

### Quick Test Script (run in PowerShell)

```powershell
# 1. Test LeetCode
Write-Host "Testing LeetCode API..."
curl -X POST http://localhost:5000/api/coding/fetch-stats/leetcode `
  -H "Content-Type: application/json" `
  -d '{"username":"jeremyxu08"}' | ConvertFrom-Json

# 2. Test Gmail SMTP
Write-Host "Testing Gmail..."
# Check server logs for email sending

# 3. Test OpenAI
Write-Host "Testing OpenAI..."
curl -X POST http://localhost:5000/api/ai/analyze-skills `
  -H "Authorization: Bearer YOUR_TOKEN" | ConvertFrom-Json

# 4. Test GitHub
Write-Host "Testing GitHub..."
curl https://api.github.com/users/torvalds/repos | ConvertFrom-Json | Select-Object -First 5
```

---

## 💰 Cost Summary

| API        | Monthly Cost | Why FREE            |
| ---------- | ------------ | ------------------- |
| LeetCode   | $0           | No auth needed      |
| CodeChef   | $0           | Web scraping        |
| Codeforces | $0           | Public API          |
| Gmail SMTP | $0           | Personal account    |
| OpenAI     | $0           | $5 trial + pricing  |
| MongoDB    | $0           | Free tier           |
| Firebase   | $0           | Free tier           |
| SendGrid   | $0           | 100 emails/day free |
| GitHub API | $0           | 5000 req/hr free    |
| Cloudinary | $0           | 25GB/month free     |
| Stripe     | $0           | Test mode           |
| **TOTAL**  | **$0/month** | ✅ Completely FREE  |

---

## 🚨 Important Notes

### Security

⚠️ **Never commit .env to Git!**

```bash
# .gitignore should have:
.env
.env.local
.env.*.local
```

### Gmail Limits

- **500 emails/day** per account
- If you hit limit, use SendGrid (100/day) as backup

### OpenAI Costs

- Your $5 credit expires after 3 months
- After that: ~$0.002 per request
- Set spending limit in dashboard!

### Production Considerations

- Use SendGrid instead of Gmail for production
- Use AWS S3/Cloudinary instead of local file storage
- Use managed MongoDB Atlas (you're already using it ✅)
- Get Firebase for OAuth login

---

## 🆘 Troubleshooting

### "Gmail: Authentication failed"

```
Solution:
1. Verify app password is 16 characters
2. No spaces in email address
3. Port must be 587 (not 25 or 465)
4. Verify 2FA is enabled
```

### "LeetCode API returns null"

```
Solution:
1. Check username spelling
2. LeetCode user must exist
3. Profile must be public (not private)
4. Try different username for testing
```

### "OpenAI quota exceeded"

```
Solution:
1. Check spending limit in dashboard
2. Reduce API call frequency
3. Use GPT-3.5-turbo (cheaper than GPT-4)
4. Cache responses to reduce calls
```

---

## 📞 Need Help?

**Free Support for Setup**:

- LeetCode API docs: https://leetcode.com/graphql (no docs, but working)
- Codeforces docs: https://codeforces.com/apiHelp
- Gmail app password: https://support.google.com/accounts/answer/185833
- OpenAI docs: https://platform.openai.com/docs
- MongoDB Atlas: https://www.mongodb.com/docs/atlas
- Firebase: https://firebase.google.com/docs

---

## ✨ What's Next?

1. **Immediate** (Next 15 min):
   - [ ] Get Gmail app password
   - [ ] Update .env with EMAIL_PASS
   - [ ] Test email sending

2. **Within an hour**:
   - [ ] Get OpenAI API key
   - [ ] Update .env with OPENAI_API_KEY
   - [ ] Add AI skill analysis feature

3. **For full features** (optional):
   - [ ] GitHub API integration
   - [ ] Cloudinary for resumes
   - [ ] SendGrid as backup

---

**Last Updated**: March 15, 2026
**All APIs are 100% FREE to use!** ✅
