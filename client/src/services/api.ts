import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000, // Reduced from 10000 to 5 seconds so it fails fast if no MongoDB
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

// Auth APIs
export const authAPI = {
  register: (userData: any) => api.post('/auth/register', userData),
  login: (credentials: any) => api.post('/auth/login', credentials),
  verifyEmail: (token: string) => api.post(`/auth/verify-email/${token}`),
  getCurrentUser: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

// Student APIs
export const studentAPI = {
  createProfile: (profileData: any) => api.post('/students/profile', profileData),
  getProfile: () => api.get('/students/profile'),
  updateSkills: (skills: any) => api.post('/students/skills', { skills }),
  addProject: (project: any) => api.post('/students/projects', project),
  updateProject: (projectId: string, project: any) => api.put(`/students/projects/${projectId}`, project),
  addCertification: (certification: any) => api.post('/students/certifications', certification),
  updateCodingProfile: (platform: string, username: string) => 
    api.post('/students/coding-profiles', { platform, username }),
  uploadResume: (formData: FormData) => api.post('/students/resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  addAchievement: (achievement: any) => api.post('/students/achievements', achievement),
  updateSocialLinks: (links: any) => api.post('/students/social-links', links),
  toggleProfileVisibility: () => api.post('/students/toggle-visibility'),
  getPublicProfile: (studentId: string) => api.get(`/students/public/${studentId}`),
};

// College APIs
export const collegeAPI = {
  getProfile: () => api.get('/colleges/profile'),
  updateProfile: (profileData: any) => api.put('/colleges/profile', profileData),
  getStudents: (params?: any) => api.get('/colleges/students', { params }),
  verifyStudent: (studentId: string, verificationData: any) => 
    api.post(`/colleges/verify-student/${studentId}`, verificationData),
  getStatistics: () => api.get('/colleges/statistics'),
  addDepartment: (department: any) => api.post('/colleges/departments', department),
  updatePlacementCell: (placementCellData: any) => api.put('/colleges/placement-cell', placementCellData),
};

// Recruiter APIs
export const recruiterAPI = {
  getProfile: () => api.get('/recruiters/profile'),
  updateProfile: (profileData: any) => api.put('/recruiters/profile', profileData),
  createPlacement: (placementData: any) => api.post('/recruiters/placements', placementData),
  getPlacements: (params?: any) => api.get('/recruiters/placements', { params }),
  getApplications: (placementId: string) => api.get(`/recruiters/placements/${placementId}/applications`),
  updateApplicationStatus: (placementId: string, applicationId: string, statusData: any) =>
    api.put(`/recruiters/placements/${placementId}/applications/${applicationId}`, statusData),
  getStatistics: () => api.get('/recruiters/statistics'),
  searchStudents: (params: any) => api.get('/recruiters/search-students', { params }),
  updatePreferences: (preferences: any) => api.put('/recruiters/preferences', preferences),
};

// Placement APIs
export const placementAPI = {
  getActivePlacements: (params?: any) => api.get('/placements/active', { params }),
  getPlacementDetails: (placementId: string) => api.get(`/placements/${placementId}`),
  applyForPlacement: (placementId: string) => api.post(`/placements/${placementId}/apply`),
  getMyApplications: () => api.get('/placements/my-applications'),
  withdrawApplication: (placementId: string) => api.post(`/placements/${placementId}/withdraw`),
  getPlacementStatistics: (placementId: string) => api.get(`/placements/${placementId}/statistics`),
  getPlacementTrends: (params?: any) => api.get('/placements/trends/overview', { params }),
};

// AI APIs
export const aiAPI = {
  shortlistStudents: (requirements: any) => api.post('/ai/shortlist-students', requirements),
  analyzeSkillGap: (targetRole: string) => api.post('/ai/skill-gap-analysis', { targetRole }),
  predictCareer: () => api.post('/ai/career-prediction'),
  getCodingGrowth: (months?: number) => api.get('/ai/coding-growth', { params: { months } }),
  getPlacementAnalytics: (params?: any) => api.get('/ai/placement-analytics', { params }),
  getJobMatches: () => api.get('/ai/job-matches'),
  getResumeSuggestions: () => api.post('/ai/resume-suggestions'),
};

// Analytics APIs
export const analyticsAPI = {
  getCollegeDashboard: () => api.get('/analytics/college/dashboard'),
  getStudentDashboard: () => api.get('/analytics/student/dashboard'),
  getRecruiterDashboard: () => api.get('/analytics/recruiter/dashboard'),
  generateCustomReport: (reportConfig: any) => api.post('/analytics/custom-report', reportConfig),
};

export default api;
