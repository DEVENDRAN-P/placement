# AI-Powered Career Intelligence & Placement Portal

A comprehensive platform that connects students, colleges, and recruiters with AI-driven career intelligence and placement management.

## 🚀 Features

### For Students
- **Smart Student Profile**: Build comprehensive profiles with academics, skills, projects, and achievements
- **Coding Platform Integration**: Auto-fetch stats from LeetCode, CodeChef, and Codeforces
- **AI Skill Gap Analysis**: Get personalized career advice and skill recommendations
- **Career Prediction Engine**: AI-powered placement probability predictions
- **Coding Growth Tracker**: Visualize coding progress with detailed analytics
- **Resume Builder**: Upload and analyze resumes with plagiarism detection

### For Colleges
- **Institute Verification System**: Verified academic records for authentic profiles
- **AI Student Shortlisting**: Automatically filter and rank candidates based on company requirements
- **Placement Analytics Dashboard**: Comprehensive insights on placement performance
- **Department-wise Statistics**: Detailed analytics by department and academic performance
- **Communication System**: Efficiently communicate with students about opportunities

### For Recruiters
- **Smart Job Matching**: AI-powered candidate matching based on job requirements
- **Verified Talent Pool**: Access to pre-verified student profiles
- **Application Management**: Streamlined recruitment process with automated screening
- **Analytics Dashboard**: Track recruitment metrics and performance
- **Public Recruiter Profiles**: Enhanced visibility to attract top talent

## 🏗️ Architecture

### Backend (Node.js + Express)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based authentication with role-based access control
- **AI Services**: Natural language processing and machine learning for intelligent matching
- **API Integration**: External APIs for coding platforms and email services

### Frontend (React + TypeScript)
- **UI Framework**: Tailwind CSS for modern, responsive design
- **State Management**: React Context API for authentication and global state
- **Routing**: React Router for navigation and protected routes
- **Forms**: React Hook Form with Yup validation
- **Charts**: Recharts for data visualization

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## 🛠️ Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd career-intelligence-portal
```

### 2. Install dependencies
```bash
# Install all dependencies (server and client)
npm run install-all

# Or install separately
npm install
cd client && npm install
```

### 3. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configurations
# Configure:
# - Database connection
# - JWT secret
# - Email settings
# - API keys for coding platforms
```

### 4. Database Setup
```bash
# Start MongoDB service
# For Windows: net start MongoDB
# For macOS: brew services start mongodb-community
# For Linux: sudo systemctl start mongod
```

## 🚀 Running the Application

### Development Mode
```bash
# Start both server and client
npm run dev

# Or start separately
npm run server  # Backend on http://localhost:5000
npm run client  # Frontend on http://localhost:3000
```

### Production Mode
```bash
# Build the client
npm run build

# Start the server
npm start
```

## 📊 Database Schema

### Core Models
- **User**: Authentication and basic user information
- **Student**: Academic records, skills, projects, and placement status
- **College**: Institution details and placement cell information
- **Recruiter**: Company details and recruitment preferences
- **Placement**: Job postings and application management
- **Analytics**: Performance metrics and insights

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-email/:token` - Email verification
- `GET /api/auth/me` - Get current user

### Student APIs
- `POST /api/students/profile` - Create/update profile
- `GET /api/students/profile` - Get student profile
- `POST /api/students/skills` - Update skills
- `POST /api/students/projects` - Add project
- `POST /api/students/coding-profiles` - Update coding profiles

### College APIs
- `GET /api/colleges/profile` - Get college profile
- `GET /api/colleges/students` - Get college students
- `POST /api/colleges/verify-student/:id` - Verify student records
- `GET /api/colleges/statistics` - Get college statistics

### Recruiter APIs
- `POST /api/recruiters/placements` - Create job posting
- `GET /api/recruiters/placements` - Get job postings
- `GET /api/recruiters/search-students` - Search for students
- `PUT /api/recruiters/applications/:id` - Update application status

### AI APIs
- `POST /api/ai/shortlist-students` - AI student shortlisting
- `POST /api/ai/skill-gap-analysis` - Skill gap analysis
- `POST /api/ai/career-prediction` - Career prediction
- `GET /api/ai/job-matches` - Get job matches

## 🤖 AI Features

### Student Shortlisting Algorithm
- Multi-factor scoring: CGPA, skills, coding performance, projects
- Weighted matching based on job requirements
- Automatic ranking and filtering

### Skill Gap Analysis
- Natural language processing for skill extraction
- Industry-standard skill mapping
- Personalized learning recommendations

### Career Prediction Engine
- Machine learning model using historical placement data
- Factors: academic performance, coding skills, projects, certifications
- Confidence scoring and probability predictions

## 🔧 Configuration

### Environment Variables
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/career_intelligence

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d

# Email Service
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# API Keys
LEETCODE_API_KEY=your_leetcode_api_key
CODECHEF_API_KEY=your_codechef_api_key
CODEFORCES_API_KEY=your_codeforces_api_key
```

## 📱 User Roles

### Student
- Profile management
- Job applications
- Skill development tracking
- Career insights

### College
- Student verification
- Placement management
- Analytics and reporting
- Communication tools

### Recruiter
- Job posting management
- Candidate screening
- Recruitment analytics
- Company profile management

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📈 Performance Optimization

- Database indexing for frequently queried fields
- Caching for API responses
- Image optimization for uploads
- Lazy loading for large datasets

## 🔒 Security Features

- JWT-based authentication
- Role-based access control
- Input validation and sanitization
- Rate limiting for API endpoints
- File upload security
- Anti-plagiarism detection

## 🚀 Deployment

### Docker Deployment
```bash
# Build Docker image
docker build -t career-intelligence-portal .

# Run container
docker run -p 5000:5000 career-intelligence-portal
```

### Cloud Deployment
- **AWS**: EC2 with MongoDB Atlas
- **Google Cloud**: Compute Engine with Cloud Firestore
- **Azure**: App Service with Cosmos DB

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Email: support@careerintelligence.com
- Documentation: [docs.careerintelligence.com](https://docs.careerintelligence.com)

## 🎯 Roadmap

- [ ] Mobile application (React Native)
- [ ] Advanced AI matching algorithms
- [ ] Video interview integration
- [ ] Assessment platform
- [ ] International expansion
- [ ] Corporate training modules

## 👥 Team

- **Backend Developers**: Node.js, MongoDB, AI/ML
- **Frontend Developers**: React, TypeScript, UI/UX
- **DevOps**: Docker, Cloud Deployment
- **Product Managers**: Feature planning and user research

---

**Transforming Career Placement with AI Intelligence** 🚀
