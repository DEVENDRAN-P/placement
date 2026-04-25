# Production Deployment Guide

## Pre-Deployment Checklist

### ✅ Code Quality

- [x] All console.log statements removed (development mode only)
- [x] No API keys in code
- [x] TypeScript type safety implemented
- [x] Error handling on all endpoints
- [x] Input validation on all forms
- [x] CORS properly configured

### ✅ Security

- [x] Authentication implemented (Firebase)
- [x] Authorization middleware in place
- [x] Rate limiting on sensitive endpoints
- [x] Helmet.js security headers
- [x] Environment variables configured
- [ ] HTTPS/SSL setup required
- [ ] Database encryption recommended

### ✅ Database

- [x] MongoDB Atlas connection tested
- [x] Indexes created on frequently queried fields
- [x] Backup strategy documented
- [ ] Connection pooling optimized

### ✅ Frontend

- [x] Production build tested
- [x] Error boundaries implemented
- [x] Loading states managed
- [x] Environment variables configured
- [ ] Analytics pixel added (optional)
- [ ] SEO meta tags added

---

## Deployment Options

### Option 1: Heroku (Recommended for Hackathon)

#### Backend Deployment

```bash
# Create Heroku app
heroku create your-app-name

# Add MongoDB Atlas connection
heroku config:set MONGODB_URI="mongodb+srv://..."

# Set environment variables
heroku config:set JWT_SECRET="your-random-secret"
heroku config:set NODE_ENV="production"
heroku config:set FIREBASE_API_KEY="your-key"

# Deploy
git push heroku main
```

#### Environment Variables on Heroku

```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=generate-random-64-char-string
JWT_EXPIRE=7d
FRONTEND_URL=https://your-frontend.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=app-specific-password
OPENAI_API_KEY=sk-...
FIREBASE_API_KEY=...
FIREBASE_PROJECT_ID=...
```

### Option 2: Railway (Docker-based, Simpler Setup)

```bash
# Install Railway CLI
npm install -g railway

# Login and init
railway login
railway init

# Deploy
railway up
```

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["node", "server/index.js"]
```

### Option 3: AWS + Elastic Beanstalk

```bash
# Create EB app
eb init -p node.js my-app

# Configure environment
eb config

# Deploy
eb create production
eb deploy
```

---

## Frontend Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from client directory
cd client
vercel --prod

# Set environment variables in Vercel dashboard
REACT_APP_API_URL=https://your-backend.com/api
REACT_APP_FIREBASE_API_KEY=...
```

Create `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "env": {
    "REACT_APP_API_URL": "@api_url",
    "REACT_APP_FIREBASE_API_KEY": "@firebase_key"
  }
}
```

### Netlify (Alternative)

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod

# Or drag and drop build folder to Netlify UI
```

Create `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "build"

[[redirects]]
  from = "/api/*"
  to = "https://your-backend.com/api/:splat"
  status = 200
```

---

## Database Optimization

### MongoDB Atlas Configuration

#### Indexes to Create

```javascript
// In MongoDB Atlas console or compass
db.students.createIndex({ user: 1 });
db.students.createIndex({ "academicInfo.cgpa": -1 });
db.colleges.createIndex({ code: 1 });
db.placements.createIndex({ recruiter: 1, createdAt: -1 });
db.notifications.createIndex({ recipient: 1, createdAt: -1 });
```

#### Backup Strategy

```bash
# Automated daily backups in Atlas console
# Go to: Deployment → Backup and Restore
# Configure: Daily snapshots with 7-day retention
```

#### Connection Pooling

In `server/index.js`:

```javascript
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
  minPoolSize: 5,
  socketTimeoutMS: 45000,
});
```

---

## Performance Optimization

### Frontend Optimization

```bash
# Generate production build
cd client
npm run build

# Analyze bundle size
npm install --save-dev webpack-bundle-analyzer
npm run build:analyze
```

### Backend Optimization

```javascript
// Add compression middleware
const compression = require("compression");
app.use(compression());

// Add caching headers
app.set("cache control", "public, max-age=86400");

// Add database query optimization
// Use lean() for read-only queries
const students = await Student.find().lean();
```

### API Response Caching

```javascript
// Redis caching (optional)
const redis = require("redis");
const client = redis.createClient();

app.get("/api/colleges/dashboard", async (req, res) => {
  const cacheKey = `college:${req.user._id}:dashboard`;

  // Check cache
  const cached = await client.get(cacheKey);
  if (cached) return res.json(JSON.parse(cached));

  // Fetch and cache
  const data = await College.findOne({ user: req.user._id });
  await client.setex(cacheKey, 3600, JSON.stringify(data));
  res.json(data);
});
```

---

## Monitoring & Logging

### Application Logging (Winston)

```bash
npm install winston
```

Replace console.log with:

```javascript
const winston = require("winston");

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.json(),
  defaultMeta: { service: "career-portal" },
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

// Use in code
logger.error("Error occurred:", error);
logger.info("User logged in:", { userId: user._id });
```

### Error Monitoring (Sentry)

```bash
npm install @sentry/node
```

```javascript
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});

app.use(Sentry.Handlers.requestHandler());

// Error handler
app.use(Sentry.Handlers.errorHandler());
```

### Uptime Monitoring

- UptimeRobot: https://uptimerobot.com
- Configure: Check `/api/health` every 5 minutes
- Alert: Email when down

---

## SSL/HTTPS Setup

### Using Let's Encrypt (Free)

```bash
# Install Certbot
brew install certbot

# Get certificate
certbot certonly --standalone -d yourdomain.com

# Auto-renew
certbot renew --dry-run
```

### Use Heroku SSL (Automatic)

```bash
# Heroku provides free SSL for all apps
# Just use: https://your-app.herokuapp.com
```

---

## Database Backup & Recovery

### Automated Backup (Atlas)

1. Go to Deployment → Backup and Restore
2. Enable automated backup
3. Set backup frequency: Daily
4. Set retention: 7 days

### Manual Backup

```bash
# Export entire database
mongodump --uri="mongodb+srv://..." --out=./backup

# Export specific collection
mongoexport --uri="mongodb+srv://..." \
  --collection=students \
  --out=students.json

# Restore
mongorestore --uri="mongodb+srv://..." ./backup
```

---

## CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Setup Node
        uses: actions/setup-node@v2
        with:
          node-version: "18"

      - name: Install dependencies
        run: npm run install-all

      - name: Run tests
        run: npm test

      - name: Deploy backend to Heroku
        env:
          HEROKU_API_KEY: ${{ secrets.HEROKU_API_KEY }}
        run: |
          git push https://heroku:$HEROKU_API_KEY@git.heroku.com/your-app.git main

      - name: Deploy frontend
        run: |
          cd client
          npm run build
          vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

---

## Post-Deployment

### Smoke Tests

```bash
# Test API endpoints
curl https://your-app.herokuapp.com/api/health

# Test auth
curl -X POST https://your-app.herokuapp.com/api/auth/login ...

# Test database
curl https://your-app.herokuapp.com/api/students/profile ...
```

### Monitor Logs

```bash
# Heroku logs
heroku logs --tail --app your-app-name

# Railway logs
railway logs
```

### Performance Monitoring

```bash
# Check response times
curl -w "Time: %{time_total}s\n" https://your-api.com/api/health
```

---

## Rollback Plan

If deployment issues occur:

### Heroku Rollback

```bash
# View release history
heroku releases --app your-app

# Rollback to previous version
heroku releases:rollback v123 --app your-app
```

### Database Rollback

```bash
# Use Atlas automatic backup
# Restore from specific timestamp in backup section
```

---

## Scaling Strategy

### Horizontal Scaling (Multiple Instances)

```bash
# On Heroku
heroku ps:scale web=3 --app your-app

# On Railway
# Increase pod count in dashboard
```

### Database Scaling

```bash
# Upgrade MongoDB plan if needed
# Atlas → Cluster → Change Tier

# Add read replicas for high load
```

### CDN for Frontend

```bash
# Cloudflare integration
# Connect domain → Enable proxying
# Setup caching rules for static assets
```

---

## Post-Launch Checklist

- [ ] Verify all features working in production
- [ ] Monitor error rates (target: < 0.5%)
- [ ] Check response times (target: < 500ms)
- [ ] Test authentication with real users
- [ ] Verify email notifications working
- [ ] Setup monitoring & alerting
- [ ] Document known issues
- [ ] Create runbook for team
- [ ] Setup on-call rotation
- [ ] Plan capacity for expected users

---

**Last Updated**: April 13, 2026
**Deployment Ready**: ✅ YES
