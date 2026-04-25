import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/FirebaseAuthContext';
import { studentAPI } from '../../services/api';
import { AlertCircle, CheckCircle, Upload, Plus, Trash2, ExternalLink } from 'lucide-react';

interface StudentProfile {
  personal?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    profilePicture?: string;
  };
  academicInfo?: {
    rollNumber: string;
    department: string;
    college: string;
    year: number;
    semester: number;
    cgpa: number;
    attendance: number;
    verified: boolean;
  };
  skills?: Array<{
    id?: string;
    name: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
    yearsOfExperience: number;
    verified: boolean;
  }>;
  projects?: Array<{
    id?: string;
    title: string;
    description: string;
    technologies: string[];
    link?: string;
    startDate: string;
    endDate: string;
  }>;
  achievements?: Array<{
    id?: string;
    title: string;
    description: string;
    date: string;
  }>;
  certificates?: Array<{
    id?: string;
    title: string;
    issuer: string;
    issueDate: string;
    certificateUrl?: string;
    verified: boolean;
  }>;
  codingProfiles?: {
    leetcode?: { username: string; rating: number; problemsSolved: number };
    codechef?: { username: string; rating: number; problemsSolved: number };
    codeforces?: { username: string; rating: number; problemsSolved: number };
  };
  resume?: {
    fileName: string;
    uploadDate: string;
    verified: boolean;
  };
  publicProfile?: {
    isPublic: boolean;
    bio: string;
    location: string;
    socialLinks?: {
      github?: string;
      linkedin?: string;
      portfolio?: string;
    };
  };
}

const EnhancedStudentProfile: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [profile, setProfile] = useState<StudentProfile>({
    personal: { firstName: '', lastName: '', email: '', phone: '' },
    academicInfo: { rollNumber: '', department: '', college: '', year: 1, semester: 1, cgpa: 0, attendance: 0, verified: false },
    skills: [],
    projects: [],
    achievements: [],
    certificates: [],
    codingProfiles: {},
    publicProfile: { isPublic: false, bio: '', location: '' }
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const steps = [
    { id: 1, title: 'Personal Info', icon: '👤' },
    { id: 2, title: 'Academic Info', icon: '🎓' },
    { id: 3, title: 'Skills', icon: '⚡' },
    { id: 4, title: 'Projects', icon: '💻' },
    { id: 5, title: 'Achievements', icon: '🏆' },
    { id: 6, title: 'Certificates', icon: '📜' },
    { id: 7, title: 'Coding Profiles', icon: '🔢' },
    { id: 8, title: 'Resume & Public', icon: '📄' }
  ];

  useEffect(() => {
    if (isAuthenticated && user?.role === 'student') {
      loadProfile();
    }
  }, [isAuthenticated, user]);

  const loadProfile = async () => {
    try {
      const response: any = await studentAPI.getProfile();
      if (response?.success && response?.data) {
        setProfile(response.data);
        setMessage({ type: 'success', text: 'Profile loaded successfully' });
      }
    } catch (err: any) {
      console.log('Profile not found, starting fresh');
    }
  };

  // Step 1: Personal Information
  const renderPersonalStep = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="First Name"
          value={profile.personal?.firstName || ''}
          onChange={(e) => setProfile({
            ...profile,
            personal: { ...profile.personal, firstName: e.target.value } as typeof profile.personal
          })}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="Last Name"
          value={profile.personal?.lastName || ''}
          onChange={(e) => setProfile({
            ...profile,
            personal: { ...profile.personal, lastName: e.target.value } as typeof profile.personal
          })}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="email"
          placeholder="Email"
          value={profile.personal?.email || user?.email || ''}
          disabled
          className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
        />
        <input
          type="tel"
          placeholder="Phone"
          value={profile.personal?.phone || ''}
          onChange={(e) => setProfile({
            ...profile,
            personal: { ...profile.personal, phone: e.target.value } as typeof profile.personal
          })}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-white text-2xl">
            {profile.personal?.firstName?.[0]}{profile.personal?.lastName?.[0]}
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            <Upload size={20} /> Upload Picture
          </button>
        </div>
      </div>
    </div>
  );

  // Step 2: Academic Information
  const renderAcademicStep = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Academic Information</h2>
      {profile.academicInfo?.verified && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
          <CheckCircle className="text-green-600" />
          <span className="text-green-700">College Verified</span>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="College Name"
          value={profile.academicInfo?.college || ''}
          onChange={(e) => setProfile({
            ...profile,
            academicInfo: { ...profile.academicInfo, college: e.target.value } as typeof profile.academicInfo
          })}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="Roll Number"
          value={profile.academicInfo?.rollNumber || ''}
          onChange={(e) => setProfile({
            ...profile,
            academicInfo: { ...profile.academicInfo, rollNumber: e.target.value } as typeof profile.academicInfo
          })}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          id="dept-select-1"
          title="Select department"
          value={profile.academicInfo?.department || ''}
          onChange={(e) => setProfile({
            ...profile,
            academicInfo: { ...profile.academicInfo, department: e.target.value } as typeof profile.academicInfo
          })}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Department</option>
          <option value="Computer Science">Computer Science</option>
          <option value="Information Technology">Information Technology</option>
          <option value="Electronics">Electronics</option>
          <option value="Mechanical">Mechanical</option>
          <option value="Electrical">Electrical</option>
        </select>
        <select
          id="year-select"
          title="Select year"
          value={profile.academicInfo?.year || 1}
          onChange={(e) => setProfile({
            ...profile,
            academicInfo: { ...profile.academicInfo, year: parseInt(e.target.value) } as typeof profile.academicInfo
          })}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="1">Year 1</option>
          <option value="2">Year 2</option>
          <option value="3">Year 3</option>
          <option value="4">Year 4</option>
        </select>
        <input
          type="number"
          placeholder="Current CGPA (0-10)"
          min="0"
          max="10"
          step="0.01"
          value={profile.academicInfo?.cgpa || 0}
          onChange={(e) => setProfile({
            ...profile,
            academicInfo: { ...profile.academicInfo, cgpa: parseFloat(e.target.value) } as typeof profile.academicInfo
          })}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="number"
          placeholder="Attendance (%)"
          min="0"
          max="100"
          value={profile.academicInfo?.attendance || 0}
          onChange={(e) => setProfile({
            ...profile,
            academicInfo: { ...profile.academicInfo, attendance: parseFloat(e.target.value) } as typeof profile.academicInfo
          })}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-700">
          Your college can verify your academic records. Ask your placement office to add your CGPA and attendance.
        </p>
      </div>
    </div>
  );

  // Step 3: Skills
  const renderSkillsStep = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Skills & Expertise</h2>
      <div className="space-y-3">
        {profile.skills?.map((skill, idx) => (
          <div key={idx} className="flex gap-2 items-center bg-gray-50 p-3 rounded-lg">
            <div className="flex-1">
              <div className="font-medium">{skill.name}</div>
              <div className="text-sm text-gray-600">{skill.level} • {skill.yearsOfExperience} years</div>
            </div>
            {skill.verified && <CheckCircle className="text-green-600" />}
            <button
              onClick={() => setProfile({
                ...profile,
                skills: profile.skills?.filter((_, i) => i !== idx)
              })}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
      <div className="bg-white border border-gray-300 rounded-lg p-4 space-y-3">
        <h3 className="font-semibold">Add New Skill</h3>
        <input
          type="text"
          placeholder="Skill name (e.g., Python, React, AWS)"
          id="skillName"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          id="skillLevel"
          title="Select skill level"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
          <option value="Expert">Expert</option>
        </select>
        <button
          onClick={() => {
            const skillName = (document.getElementById('skillName') as HTMLInputElement)?.value;
            const skillLevel = (document.getElementById('skillLevel') as HTMLSelectElement)?.value;
            if (skillName) {
              setProfile({
                ...profile,
                skills: [...(profile.skills || []), {
                  name: skillName,
                  level: skillLevel as any,
                  yearsOfExperience: 0,
                  verified: false
                }]
              });
              (document.getElementById('skillName') as HTMLInputElement).value = '';
            }
          }}
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2"
        >
          <Plus size={18} /> Add Skill
        </button>
      </div>
    </div>
  );

  // Step 4: Projects
  const renderProjectsStep = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Projects & Build Portfolio</h2>
      <div className="space-y-3">
        {profile.projects?.map((project, idx) => (
          <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-gray-900">{project.title}</h3>
              <button
                onClick={() => setProfile({
                  ...profile,
                  projects: profile.projects?.filter((_, i) => i !== idx)
                })}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 size={18} />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-2">{project.description}</p>
            <div className="flex gap-2 flex-wrap mb-2">
              {project.technologies.map((tech, tidx) => (
                <span key={tidx} className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                  {tech}
                </span>
              ))}
            </div>
            {project.link && (
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700 flex items-center gap-1 text-sm"
              >
                View Project <ExternalLink size={14} />
              </a>
            )}
          </div>
        ))}
      </div>
      <div className="bg-white border border-gray-300 rounded-lg p-4 space-y-3">
        <h3 className="font-semibold">Add New Project</h3>
        <input
          type="text"
          placeholder="Project title"
          id="projTitle"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <textarea
          placeholder="Project description"
          id="projDesc"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="Technologies used (comma-separated)"
          id="projTech"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="url"
          placeholder="GitHub/Demo link (optional)"
          id="projLink"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => {
            const title = (document.getElementById('projTitle') as HTMLInputElement)?.value;
            const desc = (document.getElementById('projDesc') as HTMLTextAreaElement)?.value;
            const tech = (document.getElementById('projTech') as HTMLInputElement)?.value;
            const link = (document.getElementById('projLink') as HTMLInputElement)?.value;
            if (title && desc) {
              setProfile({
                ...profile,
                projects: [...(profile.projects || []), {
                  title,
                  description: desc,
                  technologies: tech.split(',').map(t => t.trim()),
                  link: link || undefined,
                  startDate: '',
                  endDate: ''
                }]
              });
              (document.getElementById('projTitle') as HTMLInputElement).value = '';
              (document.getElementById('projDesc') as HTMLTextAreaElement).value = '';
          (document.getElementById('projTech') as HTMLInputElement).value = '';
              (document.getElementById('projLink') as HTMLInputElement).value = '';
            }
          }}
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2"
        >
          <Plus size={18} /> Add Project
        </button>
      </div>
    </div>
  );

  // Step 7: Coding Profiles
  const renderCodingStep = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Coding Platform Profiles</h2>
      <p className="text-gray-600">Connect your coding profiles to showcase your problem-solving skills</p>
      
      <div className="space-y-4">
        {/* LeetCode */}
        <div className="border border-gray-300 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">⚙️</span>
            <h3 className="font-semibold">LeetCode</h3>
          </div>
          <input
            type="text"
            placeholder="LeetCode username"
            value={profile.codingProfiles?.leetcode?.username || ''}
            onChange={(e) => setProfile({
              ...profile,
              codingProfiles: {
                ...profile.codingProfiles,
                leetcode: {
                  ...(profile.codingProfiles?.leetcode || {}),
                  username: e.target.value,
                  rating: profile.codingProfiles?.leetcode?.rating || 0,
                  problemsSolved: profile.codingProfiles?.leetcode?.problemsSolved || 0
                }
              }
            })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {profile.codingProfiles?.leetcode?.problemsSolved ? (
            <div className="mt-2 text-sm text-gray-600">
              {profile.codingProfiles.leetcode.problemsSolved} problems solved • Rating: {profile.codingProfiles.leetcode.rating}
            </div>
          ) : null}
        </div>

        {/* CodeChef */}
        <div className="border border-gray-300 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">🍳</span>
            <h3 className="font-semibold">CodeChef</h3>
          </div>
          <input
            type="text"
            placeholder="CodeChef username"
            value={profile.codingProfiles?.codechef?.username || ''}
            onChange={(e) => setProfile({
              ...profile,
              codingProfiles: {
                ...profile.codingProfiles,
                codechef: {
                  ...(profile.codingProfiles?.codechef || {}),
                  username: e.target.value,
                  rating: profile.codingProfiles?.codechef?.rating || 0,
                  problemsSolved: profile.codingProfiles?.codechef?.problemsSolved || 0
                }
              }
            })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Codeforces */}
        <div className="border border-gray-300 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">🔢</span>
            <h3 className="font-semibold">Codeforces</h3>
          </div>
          <input
            type="text"
            placeholder="Codeforces username"
            value={profile.codingProfiles?.codeforces?.username || ''}
            onChange={(e) => setProfile({
              ...profile,
              codingProfiles: {
                ...profile.codingProfiles,
                codeforces: {
                  ...(profile.codingProfiles?.codeforces || {}),
                  username: e.target.value,
                  rating: profile.codingProfiles?.codeforces?.rating || 0,
                  problemsSolved: profile.codingProfiles?.codeforces?.problemsSolved || 0
                }
              }
            })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <button
        className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 font-semibold"
        onClick={() => setMessage({ type: 'info', text: 'Fetching data from coding platforms...' })}
      >
        Fetch Coding Stats
      </button>
    </div>
  );

  // Render appropriate step
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderPersonalStep();
      case 2: return renderAcademicStep();
      case 3: return renderSkillsStep();
      case 4: return renderProjectsStep();
      case 5: return renderAchievementsStep();
      case 6: return renderCertificatesStep();
      case 7: return renderCodingStep();
      case 8: return renderPublicProfileStep();
      default: return renderPersonalStep();
    }
  };

  const renderAchievementsStep = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Achievements</h2>
      <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-600">
        Add your hackathons, competitions, and other achievements
      </div>
    </div>
  );

  const renderCertificatesStep = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Certificates & Credentials</h2>
      <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-600">
        Upload course certificates, MOOCs, and credential documents
      </div>
    </div>
  );

  const renderPublicProfileStep = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Resume & Public Profile</h2>
      <div>
        <label className="flex items-center gap-2 mb-4 cursor-pointer">
          <input
            type="checkbox"
            checked={profile.publicProfile?.isPublic || false}
            onChange={(e) => setProfile({
              ...profile,
              publicProfile: { ...profile.publicProfile, isPublic: e.target.checked } as typeof profile.publicProfile
            })}
            className="w-4 h-4"
          />
          <span className="text-gray-700">Make my profile public (Like LinkedIn)</span>
        </label>
        {profile.publicProfile?.isPublic && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
            <input
              type="text"
              placeholder="Short bio (150 characters)"
              value={profile.publicProfile?.bio || ''}
              maxLength={150}
              onChange={(e) => setProfile({
                ...profile,
                publicProfile: { ...profile.publicProfile, bio: e.target.value } as typeof profile.publicProfile
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Location (City, Country)"
              value={profile.publicProfile?.location || ''}
              onChange={(e) => setProfile({
                ...profile,
                publicProfile: { ...profile.publicProfile, location: e.target.value } as typeof profile.publicProfile
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
      </div>
      <div className="border-t pt-4">
        <h3 className="font-semibold mb-3">Upload Resume</h3>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Upload className="mx-auto mb-2 text-gray-400" size={32} />
          <p className="text-gray-700">Drag and drop your resume or click to upload</p>
          <p className="text-sm text-gray-500">PDF or DOCX • Max 5MB</p>
        </div>
      </div>
    </div>
  );

  const handleSave = async () => {
    setLoading(true);
    try {
      const response: any = await studentAPI.createProfile({
        personal: profile.personal,
        academicInfo: profile.academicInfo,
        skills: profile.skills,
        projects: profile.projects,
        achievements: profile.achievements,
        certificates: profile.certificates,
        codingProfiles: profile.codingProfiles,
        resume: profile.resume,
        publicProfile: profile.publicProfile
      });
      
      if (response?.success) {
        setMessage({ type: 'success', text: 'Profile saved successfully!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: response?.message || 'Failed to save profile' });
      }
    } catch (err: any) {
      console.error('Save error:', err);
      const errorMessage = err?.message || 'Failed to save profile';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Build Your Career Profile</h1>
          <p className="text-gray-600">Step {currentStep} of {steps.length}</p>
        </div>

        {/* Step Indicator */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex overflow-x-auto gap-2">
            {steps.map((step) => (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                  currentStep === step.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{step.icon}</span>
                <span className="hidden sm:inline">{step.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-green-100 text-green-700 border border-green-200'
                : message.type === 'error'
                ? 'bg-red-100 text-red-700 border border-red-200'
                : 'bg-blue-100 text-blue-700 border border-blue-200'
            }`}
          >
            <AlertCircle size={20} />
            {message.text}
          </div>
        )}

        {/* Content */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          {renderCurrentStep()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between gap-4">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            Previous
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-8 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
          <button
            onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
            disabled={currentStep === steps.length}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            Next
          </button>
        </div>

        {/* Profile Completeness */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="font-semibold text-lg mb-3">Profile Completeness: {Math.round(((currentStep - 1) / steps.length) * 100)}%</h3>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-500 h-3 rounded-full transition-all"
              style={{ width: `${((currentStep - 1) / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedStudentProfile;

