export interface User {
  id: string;
  email: string;
  role: 'student' | 'college' | 'recruiter' | 'admin';
  profile: {
    firstName: string;
    lastName: string;
    phone?: string;
    avatar?: string;
    bio?: string;
  };
  isVerified: boolean;
  lastLogin?: string;
}

export interface Student {
  _id: string;
  user: string;
  college: College;
  academicInfo: {
    rollNumber: string;
    department: string;
    year: number;
    semester: number;
    cgpa: number;
    sgpa: Array<{ semester: number; sgpa: number }>;
    attendance: number;
    backlogCount: number;
  };
  skills: Array<{
    name: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
    verified: boolean;
  }>;
  projects: Array<{
    title: string;
    description: string;
    technologies: string[];
    githubUrl?: string;
    liveUrl?: string;
    startDate: string;
    endDate?: string;
    status: 'Completed' | 'In Progress' | 'Planned';
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    issueDate: string;
    expiryDate?: string;
    credentialId?: string;
    credentialUrl?: string;
    certificateFile?: string;
    verified: boolean;
  }>;
  codingProfiles: {
    leetcode: {
      username?: string;
      totalSolved?: number;
      easySolved?: number;
      mediumSolved?: number;
      hardSolved?: number;
      rating?: number;
      lastUpdated?: string;
    };
    codechef: {
      username?: string;
      rating?: number;
      stars?: string;
      totalSolved?: number;
      lastUpdated?: string;
    };
    codeforces: {
      username?: string;
      rating?: number;
      rank?: string;
      totalSolved?: number;
      lastUpdated?: string;
    };
  };
  resume: {
    fileUrl?: string;
    fileName?: string;
    uploadDate?: string;
    isVerified: boolean;
    plagiarismScore: number;
  };
  placementStatus: {
    isPlaced: boolean;
    company?: string;
    role?: string;
    package?: number;
    offerDate?: string;
    joiningDate?: string;
  };
  achievements: Array<{
    title: string;
    description: string;
    date: string;
    category: 'Academic' | 'Coding' | 'Sports' | 'Cultural' | 'Other';
    level: 'College' | 'State' | 'National' | 'International';
  }>;
  socialLinks: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
    twitter?: string;
  };
  isProfilePublic: boolean;
  aiInsights: {
    placementProbability?: number;
    recommendedSkills?: string[];
    skillGapAnalysis?: string;
    careerAdvice?: string;
    lastAnalyzed?: string;
  };
}

export interface College {
  _id: string;
  user: string;
  name: string;
  code: string;
  address: {
    street?: string;
    city: string;
    state: string;
    pincode?: string;
    country: string;
  };
  contact: {
    phone?: string;
    email?: string;
    website?: string;
  };
  accreditation?: string;
  establishedYear?: number;
  type: 'Government' | 'Private' | 'Autonomous' | 'Deemed University';
  departments: Array<{
    name: string;
    headOfDepartment?: string;
    totalSeats: number;
    facultyCount: number;
  }>;
  placementCell: {
    coordinatorName?: string;
    coordinatorEmail?: string;
    coordinatorPhone?: string;
    officeAddress?: string;
  };
  statistics: {
    totalStudents: number;
    placedStudents: number;
    averagePackage: number;
    highestPackage: number;
    companiesVisited: number;
    placementRate: number;
  };
  verificationStatus: {
    isVerified: boolean;
    verifiedBy?: string;
    verifiedDate?: string;
    documents: string[];
  };
  subscription: {
    plan: 'Basic' | 'Premium' | 'Enterprise';
    startDate?: string;
    endDate?: string;
    isActive: boolean;
  };
}

export interface Recruiter {
  _id: string;
  user: string;
  company: {
    name: string;
    industry: 'IT Services' | 'Product' | 'Consulting' | 'Finance' | 'Healthcare' | 'Education' | 'Manufacturing' | 'Other';
    size?: string;
    website?: string;
    logo?: string;
    description?: string;
  };
  companyAddress: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country: string;
  };
  hrDetails: {
    name: string;
    designation: string;
    email?: string;
    phone?: string;
    linkedin?: string;
  };
  verificationStatus: {
    isVerified: boolean;
    verifiedBy?: string;
    verifiedDate?: string;
    documents: string[];
  };
  subscription: {
    plan: 'Basic' | 'Premium' | 'Enterprise';
    startDate?: string;
    endDate?: string;
    isActive: boolean;
    remainingCredits: number;
  };
  preferences: {
    targetColleges: string[];
    departments: string[];
    cgpaCutoff: number;
    backlogAllowed: boolean;
    maxBacklogs: number;
    skillsRequired: string[];
    experienceRequired: string;
  };
  statistics: {
    totalJobsPosted: number;
    totalApplications: number;
    totalInterviews: number;
    totalHires: number;
    averageHiringTime?: number;
    successRate: number;
  };
}

export interface Placement {
  _id: string;
  company: Recruiter;
  college: College;
  job: {
    title: string;
    description: string;
    department: string[];
    type: 'Full Time' | 'Internship' | 'Apprenticeship';
    location: string[];
    workMode: 'On-site' | 'Remote' | 'Hybrid';
  };
  requirements: {
    minCGPA: number;
    maxBacklogs: number;
    skills: Array<{
      name: string;
      level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
      isMandatory: boolean;
    }>;
    experience: string;
    educationLevel: string;
  };
  compensation: {
    salary: {
      min: number;
      max: number;
      currency: string;
      period: string;
    };
    benefits: string[];
    bonuses: string[];
  };
  process: {
    rounds: Array<{
      name: string;
      description?: string;
      type: string;
      duration?: number;
      isOnline: boolean;
    }>;
    totalDuration?: number;
    startDate: string;
    endDate?: string;
    registrationDeadline: string;
  };
  eligibility: {
    allowedDepartments: string[];
    allowedYears: number[];
    passOutYear?: number;
    nationality: string[];
    workPermitRequired: boolean;
  };
  applications: Array<{
    student: Student;
    applicationDate: string;
    status: 'Applied' | 'Screened' | 'Shortlisted' | 'Rejected' | 'Selected' | 'On Hold' | 'Withdrawn';
    currentRound?: number;
    roundsCompleted: Array<{
      roundNumber: number;
      roundName: string;
      status: 'Pending' | 'Completed' | 'Passed' | 'Failed';
      score?: number;
      feedback?: string;
      date: string;
    }>;
    finalStatus: 'Selected' | 'Rejected' | 'On Hold' | 'Pending';
    offerDetails?: {
      package: number;
      joiningDate?: string;
      location?: string;
      role?: string;
    };
    aiMatchScore?: number;
    aiRanking?: number;
  }>;
  statistics: {
    totalViews: number;
    totalApplications: number;
    shortlistedCandidates: number;
    selectedCandidates: number;
    averageCGPA?: number;
    averageCodingRating?: number;
  };
  status: 'Draft' | 'Open' | 'Closed' | 'Cancelled';
  aiInsights: {
    recommendedColleges?: string[];
    studentMatchScore?: number;
    competitionLevel?: 'Low' | 'Medium' | 'High' | 'Very High';
    successProbability?: number;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: {
    items?: T[];
    [key: string]: any;
  };
  pagination?: {
    current: number;
    pages: number;
    total: number;
  };
}
