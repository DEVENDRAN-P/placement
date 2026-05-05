import React, { useState, useEffect, useCallback } from 'react';
import { Heart, ExternalLink, BadgeCheck, Github, Linkedin, Globe, Download, Mail } from 'lucide-react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

interface StudentProfile {
  _id: string;
  profile: {
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  user: { email: string };
  academicInfo: {
    cgpa: number;
    department: string;
    year: number;
    college: string;
  };
  skills: Array<{ name: string; level: string; verified: boolean }>;
  projects: Array<{ title: string; description: string; technologies: string[]; link?: string }>;
  achievements: Array<{ title: string; description: string; level: string }>;
  codingProfiles: {
    leetcode?: { username: string; rating: number; totalSolved: number };
    codechef?: { username: string; rating: number; totalSolved: number };
    codeforces?: { username: string; rating: number; totalSolved: number };
  };
  resume: { fileUrl?: string; isVerified: boolean; plagiarismScore: number };
  socialLinks: { github?: string; linkedin?: string; portfolio?: string };
  isProfilePublic: boolean;
  placementStatus: { isPlaced: boolean; company?: string; role?: string };
}

const PublicStudentProfile: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/students/public/${studentId}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }
      );

      if (response.data.success) {
        setProfile(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    if (studentId) {
      fetchProfile();
    }
  }, [studentId, fetchProfile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-bold text-gray-900">Profile not found</p>
        </div>
      </div>
    );
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 2200) return 'text-red-600';
    if (rating >= 1800) return 'text-orange-600';
    if (rating >= 1400) return 'text-yellow-600';
    if (rating >= 1000) return 'text-blue-600';
    return 'text-gray-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Cover Banner */}
          <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

          {/* Profile Section */}
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row gap-6 -mt-16 mb-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <img
                  src={profile.profile.avatar || `https://ui-avatars.com/api/?name=${profile.profile.firstName}+${profile.profile.lastName}&background=random&size=128`}
                  alt={`${profile.profile.firstName} ${profile.profile.lastName}`}
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                />
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {profile.profile.firstName} {profile.profile.lastName}
                  </h1>
                  {profile.resume.isVerified && (
                    <BadgeCheck className="text-blue-600" size={28} />
                  )}
                </div>

                <p className="text-gray-600 mb-2">
                  {profile.academicInfo.department} • Year {profile.academicInfo.year}
                </p>

                <p className="text-gray-600 mb-4">{profile.user.email}</p>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-gray-600 text-sm">CGPA</p>
                    <p className="text-2xl font-bold text-gray-900">{profile.academicInfo.cgpa.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Skills</p>
                    <p className="text-2xl font-bold text-gray-900">{profile.skills.length}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Projects</p>
                    <p className="text-2xl font-bold text-gray-900">{profile.projects.length}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Status</p>
                    <p className={`text-lg font-bold ${profile.placementStatus.isPlaced ? 'text-green-600' : 'text-orange-600'}`}>
                      {profile.placementStatus.isPlaced ? '✓ Placed' : 'Open'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <button className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                  <Mail size={18} /> Contact
                </button>
                <button
                  onClick={() => setSaved(!saved)}
                  className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                    saved
                      ? 'bg-red-100 text-red-600 hover:bg-red-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Heart size={18} fill={saved ? 'currentColor' : 'none'} /> Save
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Professional Summary</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Department</p>
                  <p className="font-semibold text-gray-900">{profile.academicInfo.department}</p>
                </div>
                <div>
                  <p className="text-gray-600">Year</p>
                  <p className="font-semibold text-gray-900">Year {profile.academicInfo.year}</p>
                </div>
                <div>
                  <p className="text-gray-600">College</p>
                  <p className="font-semibold text-gray-900">{profile.academicInfo.college}</p>
                </div>
                <div>
                  <p className="text-gray-600">Resume Status</p>
                  <p className={`font-semibold ${profile.resume.isVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                    {profile.resume.isVerified ? '✓ Verified' : 'Pending'}
                  </p>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Skills & Expertise</h2>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex items-center gap-1"
                  >
                    {skill.name}
                    {skill.verified && <BadgeCheck size={14} />}
                  </span>
                ))}
              </div>
            </div>

            {/* Coding Profiles */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Competitive Programming</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {profile.codingProfiles.leetcode && (
                  <a
                    href={`https://leetcode.com/${profile.codingProfiles.leetcode.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition"
                  >
                    <p className="font-semibold text-gray-900 mb-2">LeetCode</p>
                    <p className={`text-2xl font-bold mb-1 ${getRatingColor(profile.codingProfiles.leetcode.rating)}`}>
                      {profile.codingProfiles.leetcode.rating}
                    </p>
                    <p className="text-sm text-gray-600">
                      {profile.codingProfiles.leetcode.totalSolved} problems
                    </p>
                  </a>
                )}

                {profile.codingProfiles.codechef && (
                  <a
                    href={`https://codechef.com/users/${profile.codingProfiles.codechef.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition"
                  >
                    <p className="font-semibold text-gray-900 mb-2">CodeChef</p>
                    <p className={`text-2xl font-bold mb-1 ${getRatingColor(profile.codingProfiles.codechef.rating)}`}>
                      {profile.codingProfiles.codechef.rating}
                    </p>
                    <p className="text-sm text-gray-600">
                      {profile.codingProfiles.codechef.totalSolved} problems
                    </p>
                  </a>
                )}

                {profile.codingProfiles.codeforces && (
                  <a
                    href={`https://codeforces.com/profile/${profile.codingProfiles.codeforces.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition"
                  >
                    <p className="font-semibold text-gray-900 mb-2">Codeforces</p>
                    <p className={`text-2xl font-bold mb-1 ${getRatingColor(profile.codingProfiles.codeforces.rating)}`}>
                      {profile.codingProfiles.codeforces.rating}
                    </p>
                    <p className="text-sm text-gray-600">
                      {profile.codingProfiles.codeforces.totalSolved} problems
                    </p>
                  </a>
                )}
              </div>
            </div>

            {/* Projects */}
            {profile.projects.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Featured Projects</h2>
                <div className="space-y-4">
                  {profile.projects.map((project, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900">{project.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {project.technologies.map((tech, idx) => (
                              <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                        {project.link && (
                          <a
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-4 text-blue-600 hover:text-blue-800"
                          >
                            <ExternalLink size={20} />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Achievements */}
            {profile.achievements.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Achievements</h2>
                <div className="space-y-3">
                  {profile.achievements.map((achievement, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <span className="text-2xl">🏆</span>
                      <div>
                        <p className="font-semibold text-gray-900">{achievement.title}</p>
                        <p className="text-sm text-gray-600">{achievement.description}</p>
                        <p className="text-xs text-blue-600 mt-1">{achievement.level}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Resume */}
            {profile.resume.fileUrl && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-bold text-gray-900 mb-4">Resume</h3>
                <div className="p-4 bg-blue-50 rounded-lg mb-4">
                  <p className="text-sm text-gray-700">
                    Plagiarism Score: <span className="font-bold">{profile.resume.plagiarismScore}%</span>
                  </p>
                </div>
                <a
                  href={profile.resume.fileUrl}
                  download
                  className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  <Download size={18} /> Download Resume
                </a>
              </div>
            )}

            {/* Social Links */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-gray-900 mb-4">Connect</h3>
              <div className="space-y-3">
                {profile.socialLinks.linkedin && (
                  <a
                    href={profile.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700"
                  >
                    <Linkedin size={20} className="text-blue-600" /> LinkedIn
                  </a>
                )}
                {profile.socialLinks.github && (
                  <a
                    href={profile.socialLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700"
                  >
                    <Github size={20} className="text-gray-900" /> GitHub
                  </a>
                )}
                {profile.socialLinks.portfolio && (
                  <a
                    href={profile.socialLinks.portfolio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700"
                  >
                    <Globe size={20} className="text-green-600" /> Portfolio
                  </a>
                )}
              </div>
            </div>

            {/* Verification */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-gray-900 mb-4">Verification</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <BadgeCheck className="text-green-600" size={18} />
                  <span className="text-gray-700">CGPA verified by college</span>
                </div>
                <div className="flex items-center gap-2">
                  <BadgeCheck className="text-green-600" size={18} />
                  <span className="text-gray-700">Coding stats auto-fetched</span>
                </div>
                <div className="flex items-center gap-2">
                  <BadgeCheck
                    className={profile.resume.isVerified ? 'text-green-600' : 'text-gray-400'}
                    size={18}
                  />
                  <span className="text-gray-700">Resume verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicStudentProfile;
