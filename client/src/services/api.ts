import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds to allow for slow network and external API calls
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
let authRedirectScheduled = false;
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!authRedirectScheduled && window.location.pathname !== '/login') {
        authRedirectScheduled = true;
        window.location.assign('/login');
        setTimeout(() => {
          authRedirectScheduled = false;
        }, 3000);
      }
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
  getAllStudents: (params?: any) => api.get('/students/all', { params }),
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

// Interview Preparation APIs
export const interviewPrepAPI = {
  getResources: (params?: any) => api.get('/interview-prep/resources', { params }),
  getMockInterview: (type: string) => api.get(`/interview-prep/mock-interview/${type}`),
  getTips: (companyType: string) => api.get(`/interview-prep/tips/${companyType}`),
  recordMockInterview: (data: any) => api.post('/interview-prep/record', data),
  getHistory: () => api.get('/interview-prep/history'),
};

// Referral APIs
export const referralAPI = {
  generateCode: () => api.post('/referrals/generate-code'),
  applyCode: (referralCode: string) => api.post('/referrals/apply', { referralCode }),
  getStatus: () => api.get('/referrals/status'),
};

// Video Profile APIs
export const videoProfileAPI = {
  uploadIntroduction: (formData: FormData) => api.post('/video-profile/upload-introduction', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getVideoStatus: () => api.get('/video-profile/video-status'),
  deleteIntroduction: () => api.delete('/video-profile/delete-introduction'),
  generateCredential: (credentialType: string) => api.post('/video-profile/generate-credential', { credentialType }),
  verifyCredential: (credentialId: string) => api.get(`/video-profile/verify-credential/${credentialId}`),
  getMyCredentials: () => api.get('/video-profile/my-credentials'),
};

// College Placement Management APIs
export const placementManagementAPI = {
  getPublicStudentProfile: (studentId: string) => api.get(`/placements/students/public/${studentId}`),
  filterStudents: (criteria: any) => api.post('/placements/filter', criteria),
  aiShortlisting: (params: any) => api.post('/placements/shortlist', params),
  sendPlacementUpdate: (data: any) => api.post('/placements/send-update', data),
  updatePlacementStatus: (data: any) => api.post('/placements/update-status', data),
  exportShortlist: (studentIds: string[]) => api.post('/placements/export', { studentIds }),
};

// Coding Platforms APIs
export const codingPlatformsAPI = {
  getMyProfiles: () => api.get('/coding-platforms/my-profiles'),
  fetchAllStats: (usernames: any) => api.post('/coding-platforms/fetch-all-stats', usernames),
  fetchStats: (platform: string, username: string) => 
    api.post(`/coding-platforms/fetch-stats/${platform}`, { username }),
  getGrowthAnalytics: (months?: number) => 
    api.get('/coding-platforms/growth-analytics', { params: { months } }),
};

export default api;
