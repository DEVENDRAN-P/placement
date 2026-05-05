import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/FirebaseAuthContext';
import { studentAPI } from '../../services/api';

const departments = [
  'Computer Science',
  'Information Technology',
  'Electronics and Communication',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Biomedical Engineering',
];

interface Student {
  college?: { _id: string };
  academicInfo: {
    rollNumber: string;
    department: string;
    year: number;
    semester: number;
    cgpa: number;
  };
  skills?: Array<{ name: string; level: string; verified: boolean }>;
  projects?: Array<{ title: string; technologies: string[] }>;
  codingProfiles?: {
    leetcode?: string;
    codechef?: string;
    codeforces?: string;
  };
}

const StudentProfile: React.FC = () => {
  const { isAuthenticated, user, updateProfile, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const [collegeId, setCollegeId] = useState<string>('');
  const [rollNumber, setRollNumber] = useState<string>('');
  const [department, setDepartment] = useState<string>('Computer Science');
  const [year, setYear] = useState<number>(1);
  const [semester, setSemester] = useState<number>(1);
  const [cgpa, setCgpa] = useState<number>(0);

  const [skillsInput, setSkillsInput] = useState<string>('');
  const [projectsInput, setProjectsInput] = useState<string>('');

  const [leetcodeUsername, setLeetcodeUsername] = useState<string>('');
  const [codechefUsername, setCodechefUsername] = useState<string>('');
  const [codeforcesUsername, setCodeforcesUsername] = useState<string>('');

  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);
  const [isSavingSkills, setIsSavingSkills] = useState<boolean>(false);
  const [isUpdatingCoding, setIsUpdatingCoding] = useState<boolean>(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (!isAuthenticated || user?.role !== 'student') return;
        setLoading(true);
        const response: any = await studentAPI.getProfile();
        if (response?.success && response?.data) {
          const s: Student = response.data;
          if (s.college?._id) setCollegeId(s.college._id);
          setRollNumber(s.academicInfo?.rollNumber || '');
          setDepartment(s.academicInfo?.department || 'Computer Science');
          setYear(s.academicInfo?.year || 1);
          setSemester(s.academicInfo?.semester || 1);
          setCgpa(s.academicInfo?.cgpa || 0);
          setLeetcodeUsername(s.codingProfiles?.leetcode || '');
          setCodechefUsername(s.codingProfiles?.codechef || '');
          setCodeforcesUsername(s.codingProfiles?.codeforces || '');
        }
      } catch (err: any) {
        // 404 means profile not created yet; keep defaults
        if (err?.status !== 404) {
          console.warn('Failed to load profile:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [isAuthenticated, user, updateProfile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingProfile(true);
      setError('');
      setSuccessMessage('');

      if (!rollNumber || !collegeId) {
        setError('Please enter both college ID and roll number');
        return;
      }

      if (cgpa < 0 || cgpa > 10) {
        setError('CGPA must be between 0 and 10');
        return;
      }

      const payload = {
        academicInfo: {
          rollNumber,
          department,
          year,
          semester,
          cgpa,
        },
        college: collegeId,
      };

      const response: any = await studentAPI.createProfile(payload);
      if (response?.success) {
        setSuccessMessage('Academic details saved successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(response?.message || 'Failed to save profile');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to save profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveSkillsAndProjects = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingSkills(true);
      setError('');
      setSuccessMessage('');

      // Skills: comma-separated list
      const skills = skillsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((name) => ({ name, level: 'Intermediate', verified: false }));

      if (skills.length > 0) {
        await studentAPI.updateSkills(skills);
      }

      // Projects: semicolon separated "Title - Tech1/Tech2"
      const projects = projectsInput
        .split(';')
        .map((p) => p.trim())
        .filter(Boolean);

      for (const p of projects) {
        const parts = p.split('-');
        const title = (parts[0] || '').trim();
        const techPart = parts[1] || '';
        const technologies = techPart
          .split('/')
          .map((t) => t.trim())
          .filter(Boolean);
        if (title) {
          await studentAPI.addProject({
            title,
            description: 'Project added via profile builder.',
            technologies,
            status: 'Completed',
          });
        }
      }

      setSuccessMessage('Skills and projects saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err?.message || 'Failed to save skills or projects');
    } finally {
      setIsSavingSkills(false);
    }
  };

  const handleUpdateCodingProfiles = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsUpdatingCoding(true);
      setError('');
      setSuccessMessage('');

      if (!leetcodeUsername && !codechefUsername && !codeforcesUsername) {
        setError('Please enter at least one coding profile username');
        return;
      }

      if (leetcodeUsername) {
        await studentAPI.updateCodingProfile('leetcode', leetcodeUsername);
      }
      if (codechefUsername) {
        await studentAPI.updateCodingProfile('codechef', codechefUsername);
      }
      if (codeforcesUsername) {
        await studentAPI.updateCodingProfile('codeforces', codeforcesUsername);
      }

      setSuccessMessage('Coding profiles updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err?.message || 'Failed to update coding profiles');
    } finally {
      setIsUpdatingCoding(false);
    }
  };

  // Show loading while authentication is initializing
  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Show message if wrong role
  if (user?.role !== 'student') {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Student profile is only available for student accounts.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Student Profile Builder</h1>
      <p className="mt-2 text-gray-600">
        Build a verified career profile with academics, skills, projects, and coding profiles.
      </p>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700">{successMessage}</p>
        </div>
      )}

      {loading && <p className="mt-4 text-gray-500">Loading profile...</p>}

      <div className="mt-6 space-y-8">
        {/* Academic Info */}
        <form
          onSubmit={handleSaveProfile}
          className="bg-white shadow rounded-lg p-6 space-y-4"
        >
          <h2 className="text-lg font-medium text-gray-900">1. Academic Details</h2>
          <p className="text-sm text-gray-600">
            This data is verified by your college and shown to recruiters.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">College ID (MongoDB)</label>
              <input
                type="text"
                value={collegeId}
                onChange={(e) => setCollegeId(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Your college's MongoDB ID"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Roll Number</label>
              <input
                type="text"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Your university roll number"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                title="Select Department"
              >
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Year</label>
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  title="Select Year"
                >
                  {[1, 2, 3, 4].map((y) => (
                    <option key={y} value={y}>
                      Year {y}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Semester</label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(Number(e.target.value))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  title="Select Semester"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>
                      Sem {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Current CGPA (0-10)</label>
              <input
                type="number"
                step="0.01"
                min={0}
                max={10}
                value={cgpa}
                onChange={(e) => setCgpa(Number(e.target.value))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="3.5"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSavingProfile}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSavingProfile ? '⏳ Saving...' : '✓ Save Academic Details'}
          </button>
        </form>

        {/* Skills & Projects */}
        <form
          onSubmit={handleSaveSkillsAndProjects}
          className="bg-white shadow rounded-lg p-6 space-y-4"
        >
          <h2 className="text-lg font-medium text-gray-900">2. Skills & Projects</h2>
          <p className="text-sm text-gray-600">
            Add your core skills and highlight key projects.
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700">Skills (Comma-separated)</label>
            <textarea
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Java, Python, DSA, React, MongoDB, Node.js"
            />
            <p className="mt-1 text-xs text-gray-500">Enter skills separated by commas. All will be marked as Intermediate.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Projects (Format: Title - Tech1/Tech2)</label>
            <textarea
              value={projectsInput}
              onChange={(e) => setProjectsInput(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="E-Commerce Platform - React/Node/MongoDB; Chat App - Socket.io/Express"
            />
            <p className="mt-1 text-xs text-gray-500">Format: "Title - Tech1/Tech2"; separate projects with semicolons.</p>
          </div>

          <button
            type="submit"
            disabled={isSavingSkills}
            className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSavingSkills ? '⏳ Saving...' : '✓ Save Skills & Projects'}
          </button>
        </form>

        {/* Coding Profiles */}
        <form
          onSubmit={handleUpdateCodingProfiles}
          className="bg-white shadow rounded-lg p-6 space-y-4"
        >
          <h2 className="text-lg font-medium text-gray-900">3. Coding Performance</h2>
          <p className="text-sm text-gray-600">
            Link your competitive programming profiles. We'll fetch your stats automatically.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">LeetCode Username</label>
              <div className="flex items-center mt-1">
                <input
                  type="text"
                  value={leetcodeUsername}
                  onChange={(e) => setLeetcodeUsername(e.target.value)}
                  className="block flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="username"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">CodeChef Username</label>
              <div className="flex items-center mt-1">
                <input
                  type="text"
                  value={codechefUsername}
                  onChange={(e) => setCodechefUsername(e.target.value)}
                  className="block flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="username"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Codeforces Username</label>
              <div className="flex items-center mt-1">
                <input
                  type="text"
                  value={codeforcesUsername}
                  onChange={(e) => setCodeforcesUsername(e.target.value)}
                  className="block flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="username"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isUpdatingCoding}
            className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdatingCoding ? '⏳ Updating...' : '✓ Update Coding Profiles'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentProfile;
