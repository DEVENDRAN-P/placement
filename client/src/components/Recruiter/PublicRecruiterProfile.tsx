import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, ExternalLink, BadgeCheck } from 'lucide-react';

interface StudentProfile {
  id: string;
  name: string;
  title: string;
  location: string;
  bio: string;
  image: string;
  cgpa: number;
  verified: boolean;
  skills: string[];
  projects: number;
  certifications: number;
  codingStats: {
    leetcode: { problems: number; rating: number };
    codechef: { problems: number; rating: number };
    codeforces: { problems: number; rating: number };
  };
  socialLinks: {
    github?: string;
    linkedin?: string;
    portfolio?: string;
  };
  resumeUrl?: string;
  applications: number;
  views: number;
  saves: number;
}

const PublicRecruiterProfile: React.FC = () => {
  const [profile] = useState<StudentProfile>({
    id: '1',
    name: 'Raj Kumar',
    title: 'Full Stack Developer | DSA Enthusiast',
    location: 'Bangalore, India',
    bio: 'Passionate about building scalable applications and solving complex problems. Always learning new technologies.',
    image: 'https://via.placeholder.com/150',
    cgpa: 8.5,
    verified: true,
    skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'AWS', 'Docker', 'System Design'],
    projects: 5,
    certifications: 3,
    codingStats: {
      leetcode: { problems: 312, rating: 1847 },
      codechef: { problems: 245, rating: 1650 },
      codeforces: { problems: 178, rating: 1450 }
    },
    socialLinks: {
      github: 'https://github.com/rajkumar',
      linkedin: 'https://linkedin.com/in/rajkumar',
      portfolio: 'https://rajkumar.dev'
    },
    resumeUrl: '#',
    applications: 12,
    views: 234,
    saves: 18
  });

  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Verified Student Talent Marketplace</h1>
          <p className="text-gray-600">Browse verified student profiles with proven skills and achievements</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Cover */}
          <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

          {/* Profile Content */}
          <div className="px-8 py-8">
            {/* Profile Header */}
            <div className="flex gap-6 -mt-20 mb-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full border-4 border-white flex items-center justify-center text-white text-5xl font-bold shadow-lg">
                  RK
                </div>
              </div>

              {/* Basic Info & Actions */}
              <div className="flex-1 pt-8">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
                      {profile.verified && (
                        <div title="College Verified"><BadgeCheck className="text-blue-600" size={28} /></div>
                      )}
                    </div>
                    <p className="text-lg text-gray-600 font-semibold">{profile.title}</p>
                    <p className="text-gray-600">📍 {profile.location}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setLiked(!liked)}
                      title={liked ? 'Unlike' : 'Like'}
                      className={`p-3 rounded-full transition ${liked ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      <Heart size={20} fill={liked ? 'currentColor' : 'none'} />
                    </button>
                    <button
                      onClick={() => setSaved(!saved)}
                      title={saved ? 'Unsave' : 'Save'}
                      className={`p-3 rounded-full transition ${saved ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      <MessageCircle size={20} />
                    </button>
                    <button title="Share profile" className="p-3 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition">
                      <Share2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="mb-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <p className="text-gray-700 text-lg">{profile.bio}</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-4 mb-8 pb-8 border-b">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{profile.applications}</div>
                <p className="text-sm text-gray-600">Applications</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{profile.views}</div>
                <p className="text-sm text-gray-600">Profile Views</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{profile.saves}</div>
                <p className="text-sm text-gray-600">Saved By</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">{profile.cgpa}</div>
                <p className="text-sm text-gray-600">CGPA</p>
              </div>
            </div>

            {/* Verified Info Box */}
            <div className="mb-8 bg-green-50 border-l-4 border-green-500 p-4 rounded">
              <div className="flex items-center gap-2 mb-2">
                <BadgeCheck className="text-green-600" size={20} />
                <h3 className="font-bold text-green-700">College Verified</h3>
              </div>
              <p className="text-sm text-green-700">
                ✓ CGPA verified by college | ✓ Academic records verified | ✓ Coding stats auto-fetched
              </p>
            </div>

            {/* Skills */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Skills & Expertise</h2>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-semibold text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Coding Profiles */}
            <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-lg border border-orange-200">
                <h3 className="font-bold text-gray-900 mb-3">⚙️ LeetCode</h3>
                <p className="text-3xl font-bold text-orange-600 mb-1">{profile.codingStats.leetcode.problems}</p>
                <p className="text-sm text-gray-600 mb-3">Problems Solved</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-orange-600">{profile.codingStats.leetcode.rating}</span>
                  <a href="#" title="Visit LeetCode" className="text-orange-600 hover:text-orange-700">
                    <ExternalLink size={18} />
                  </a>
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-6 rounded-lg border border-yellow-200">
                <h3 className="font-bold text-gray-900 mb-3">🍳 CodeChef</h3>
                <p className="text-3xl font-bold text-yellow-600 mb-1">{profile.codingStats.codechef.problems}</p>
                <p className="text-sm text-gray-600 mb-3">Problems Solved</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-yellow-600">{profile.codingStats.codechef.rating}</span>
                  <a href="#" title="Visit CodeChef" className="text-yellow-600 hover:text-yellow-700">
                    <ExternalLink size={18} />
                  </a>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border border-indigo-200">
                <h3 className="font-bold text-gray-900 mb-3">🔢 Codeforces</h3>
                <p className="text-3xl font-bold text-indigo-600 mb-1">{profile.codingStats.codeforces.problems}</p>
                <p className="text-sm text-gray-600 mb-3">Problems Solved</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-indigo-600">{profile.codingStats.codeforces.rating}</span>
                  <a href="#" title="Visit Codeforces" className="text-indigo-600 hover:text-indigo-700">
                    <ExternalLink size={18} />
                  </a>
                </div>
              </div>
            </div>

            {/* Projects & Certifications */}
            <div className="mb-8 grid grid-cols-2 gap-4">
              <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                <h3 className="text-2xl font-bold text-purple-600 mb-1">{profile.projects}</h3>
                <p className="text-gray-700 font-semibold">Projects Completed</p>
              </div>
              <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                <h3 className="text-2xl font-bold text-green-600 mb-1">{profile.certifications}</h3>
                <p className="text-gray-700 font-semibold">Certifications</p>
              </div>
            </div>

            {/* Social Links */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect</h2>
              <div className="flex gap-4">
                {profile.socialLinks.github && (
                  <a
                    href={profile.socialLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-semibold"
                  >
                    <ExternalLink size={18} /> GitHub
                  </a>
                )}
                {profile.socialLinks.linkedin && (
                  <a
                    href={profile.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 font-semibold"
                  >
                    <ExternalLink size={18} /> LinkedIn
                  </a>
                )}
                {profile.socialLinks.portfolio && (
                  <a
                    href={profile.socialLinks.portfolio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold"
                  >
                    <ExternalLink size={18} /> Portfolio
                  </a>
                )}
              </div>
            </div>

            {/* Resume & Apply */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <a
                href={profile.resumeUrl}
                className="px-6 py-4 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 font-semibold text-center border border-gray-300"
              >
                📄 Download Resume
              </a>
              <button className="px-6 py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold">
                💼 Send Job Offer
              </button>
            </div>

            {/* About */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-bold text-gray-900 mb-4">About This Verification System</h2>
              <ul className="space-y-2 text-gray-700">
                <li>✅ CGPA and academic records verified by college administration office</li>
                <li>✅ Coding statistics auto-fetched directly from LeetCode, CodeChef, Codeforces APIs</li>
                <li>✅ Projects and achievements verified through portfolio links</li>
                <li>✅ Resume plagiarism checked using AI detection</li>
                <li>✅ All data is <strong>100% authentic and verifiable</strong></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Similar Profiles */}
        <div className="mt-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Other Top Students</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full"></div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">Student {i}</h3>
                    <p className="text-sm text-gray-600">Verified Student</p>
                  </div>
                  <BadgeCheck className="text-blue-600" size={20} />
                </div>
                <p className="text-gray-600 text-sm mb-3">Full Stack Developer | DSA Expert</p>
                <div className="flex justify-between text-sm text-gray-600 pb-3 border-b">
                  <span>CGPA: 8.{3 + i}</span>
                  <span>LeetCode: {1600 + i * 50}</span>
                </div>
                <button className="w-full mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-semibold">
                  View Profile
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicRecruiterProfile;
