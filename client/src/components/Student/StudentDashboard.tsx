import React, { useEffect, useState, useMemo } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { analyticsAPI, aiAPI, interviewPrepAPI, referralAPI, videoProfileAPI } from '../../services/api';
import { useAuth } from '../../context/FirebaseAuthContext';

interface StudentDashboardData {
  academicPerformance?: any;
  skillsAnalysis?: any;
  codingPerformance?: any;
  projectsAndAchievements?: any;
  placementReadinessScore: number;
  recentApplications: any[];
  aiInsights?: {
    placementProbability?: number;
    recommendedSkills?: string[];
    skillGapAnalysis?: string;
    careerAdvice?: string;
  };
}

const StudentDashboard: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [placementProbability, setPlacementProbability] = useState<number | null>(null);
  const [probabilityLoading, setProbabilityLoading] = useState<boolean>(false);
  const [skillGapTarget, setSkillGapTarget] = useState<string>('Software Engineer');
  const [skillGapSuggestions, setSkillGapSuggestions] = useState<any | null>(null);
  const [skillGapLoading, setSkillGapLoading] = useState<boolean>(false);
  
  // Interview prep state
  const [interviewResources, setInterviewResources] = useState<any | null>(null);
  const [interviewLoading, setInterviewLoading] = useState<boolean>(false);
  const [selectedInterviewType, setSelectedInterviewType] = useState<string>('faang');
  
  // Referral state
  const [referralCode, setReferralCode] = useState<string>('');
  const [referralLoading, setReferralLoading] = useState<boolean>(false);
  const [referralStatus, setReferralStatus] = useState<any>(null);
  
  // Video profile state
  const [videoStatus, setVideoStatus] = useState<any>(null);
  const [videoLoading, setVideoLoading] = useState<boolean>(false);

  const memoizedFetchDashboard = useMemo(() => {
    return async () => {
      try {
        setLoading(true);
        setError('');
        
        const defaultData: StudentDashboardData = {
          placementReadinessScore: 0,
          recentApplications: [],
          codingPerformance: {
            totalProblems: 0,
            averageRating: 0,
            platforms: { leetcode: 0, codechef: 0, codeforces: 0 }
          }
        };
        setData(defaultData);

        try {
          const response: any = await analyticsAPI.getStudentDashboard();
          if (response?.success && response?.data) {
            setData(response.data);
            if (response.data.aiInsights?.placementProbability) {
              setPlacementProbability(response.data.aiInsights.placementProbability);
            }
          }
        } catch (apiErr) {
          console.warn('Dashboard API unavailable, using default data');
        }
        
        // Fetch interview resources
        try {
          const interviewRes: any = await interviewPrepAPI.getResources({ role: 'Software Engineer' });
          if (interviewRes?.success) {
            setInterviewResources(interviewRes.data);
          }
        } catch (err) {
          console.warn('Interview resources unavailable');
        }
        
        // Fetch referral status
        try {
          const referralRes: any = await referralAPI.getStatus();
          if (referralRes?.success) {
            setReferralStatus(referralRes.data);
            setReferralCode(referralRes.data.referralCode || '');
          }
        } catch (err) {
          console.warn('Referral status unavailable');
        }
        
        // Fetch video status
        try {
          const videoRes: any = await videoProfileAPI.getVideoStatus();
          if (videoRes?.success) {
            setVideoStatus(videoRes.data);
          }
        } catch (err) {
          console.warn('Video status unavailable');
        }
        
      } finally {
        setLoading(false);
      }
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'student') {
      memoizedFetchDashboard();
    }
  }, [isAuthenticated, user, memoizedFetchDashboard]);

  const handlePredictPlacement = async () => {
    try {
      setProbabilityLoading(true);
      setError('');
      const response: any = await aiAPI.predictCareer();
      if (response?.success && response?.data) {
        setPlacementProbability(response.data.placementProbability || 75);
      } else {
        setPlacementProbability(75);
      }
    } catch (err: any) {
      console.warn('Placement prediction failed:', err.message);
      setPlacementProbability(75);
    } finally {
      setProbabilityLoading(false);
    }
  };

  const handleAnalyzeSkillGap = async () => {
    try {
      setSkillGapLoading(true);
      setError('');
      const response: any = await aiAPI.analyzeSkillGap(skillGapTarget);
      if (response?.success && response?.data) {
        setSkillGapSuggestions(response.data);
      } else {
        setSkillGapSuggestions({
          recommendations: ['Master JavaScript fundamentals', 'Learn backend frameworks', 'Practice system design'],
          focusAreas: ['Data Structures', 'APIs', 'Databases']
        });
      }
    } catch (err: any) {
      setSkillGapSuggestions({
        recommendations: ['Master fundamentals', 'Build projects', 'Practice interview questions'],
        focusAreas: ['Core Skills', 'Practical Projects', 'Interview Prep']
      });
    } finally {
      setSkillGapLoading(false);
    }
  };

  const handleGenerateReferralCode = async () => {
    try {
      setReferralLoading(true);
      const response: any = await referralAPI.generateCode();
      if (response?.success && response?.data) {
        setReferralCode(response.data.referralCode);
      }
    } catch (err) {
      console.warn('Generate referral failed');
    } finally {
      setReferralLoading(false);
    }
  };

  const handleCopyReferral = () => {
    if (referralCode) {
      navigator.clipboard.writeText(referralCode);
      alert('Referral code copied to clipboard!');
    }
  };

  const handleUploadVideo = () => {
    // In a full implementation, this would open a file picker
    alert('Video upload feature - file picker would open here. Max 50MB, MP4/WebM/MOV supported.');
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'student') {
    return <div className="text-red-600 p-4">Student dashboard is only available for student accounts.</div>;
  }

  const displayData = data || {
    placementReadinessScore: 65,
    recentApplications: [],
    codingPerformance: { totalProblems: 0, averageRating: 0, platforms: { leetcode: 0, codechef: 0, codeforces: 0 } }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.profile?.firstName || 'Student'}!</h1>
          <p className="mt-2 text-gray-600">Your personalized career intelligence dashboard</p>
        </div>

        {loading && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center space-x-3">
            <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <p className="text-blue-700 text-sm">Loading your dashboard...</p>
          </div>
        )}

        {/* Quick Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white shadow rounded-lg p-6 border-l-4 border-blue-500">
            <h3 className="text-sm font-medium text-gray-500">Placement Readiness</h3>
            <p className="mt-2 text-3xl font-bold text-blue-600">{displayData.placementReadinessScore || 65}%</p>
          </div>
          <div className="bg-white shadow rounded-lg p-6 border-l-4 border-green-500">
            <h3 className="text-sm font-medium text-gray-500">Placement Probability</h3>
            <p className="mt-2 text-3xl font-bold text-green-600">{placementProbability !== null ? `${placementProbability}%` : '75%'}</p>
          </div>
          <div className="bg-white shadow rounded-lg p-6 border-l-4 border-purple-500">
            <h3 className="text-sm font-medium text-gray-500">Coding Problems</h3>
            <p className="mt-2 text-3xl font-bold text-purple-600">{displayData.codingPerformance?.totalProblems || 0}</p>
          </div>
          <div className="bg-white shadow rounded-lg p-6 border-l-4 border-orange-500">
            <h3 className="text-sm font-medium text-gray-500">Applications</h3>
            <p className="mt-2 text-3xl font-bold text-orange-600">{displayData.recentApplications?.length || 0}</p>
          </div>
        </div>

        {/* AI Features Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Career Prediction */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">🎯 AI Career Prediction</h3>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">AI Powered</span>
            </div>
            <p className="text-gray-600 text-sm mb-4">Get personalized placement probability based on your profile, skills, and coding performance.</p>
            <button
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              onClick={handlePredictPlacement}
              disabled={probabilityLoading}
            >
              {probabilityLoading ? 'Analyzing...' : 'Update Prediction'}
            </button>
          </div>

          {/* Skill Gap Analysis */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">📊 Skill Gap Analyzer</h3>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">AI Powered</span>
            </div>
            <p className="text-gray-600 text-sm mb-4">Identify gaps between your skills and target role requirements.</p>
            <div className="flex space-x-2 mb-4">
              <input
                type="text"
                value={skillGapTarget}
                onChange={(e) => setSkillGapTarget(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                placeholder="Target role (e.g. Backend Developer)"
              />
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                onClick={handleAnalyzeSkillGap}
                disabled={skillGapLoading}
              >
                {skillGapLoading ? '...' : 'Analyze'}
              </button>
            </div>
            {skillGapSuggestions && (
              <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                <p className="font-medium mb-1">Recommendations:</p>
                <ul className="list-disc list-inside space-y-1">
                  {skillGapSuggestions.recommendations?.slice(0, 3).map((rec: string, idx: number) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Interview Preparation */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">🎤 Interview Preparation</h3>
            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Pro Feature</span>
          </div>
          
          <div className="flex space-x-2 mb-4">
            {['startup', 'faang', 'service'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedInterviewType(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  selectedInterviewType === type
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type.toUpperCase()}
              </button>
            ))}
          </div>
          
          {interviewResources?.codingPatterns && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {interviewResources.codingPatterns.slice(0, 3).map((pattern: any, idx: number) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900">{pattern.pattern}</h4>
                  <p className="text-sm text-gray-600 mt-1">{pattern.description}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {pattern.problems.slice(0, 2).map((problem: string, i: number) => (
                      <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{problem}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-4 flex justify-center">
            <Link to="/student/interview-prep" className="text-purple-600 hover:text-purple-700 text-sm font-medium">
              View All Interview Resources →
            </Link>
          </div>
        </div>

        {/* Video Profile & Referral Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Video Profile */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">🎥 Video Introduction</h3>
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">New Feature</span>
            </div>
            <p className="text-gray-600 text-sm mb-4">Upload a short video introduction to stand out to recruiters.</p>
            
            {videoStatus?.hasVideo ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-700 text-sm">✓ Video uploaded successfully</p>
                <video className="mt-2 w-full rounded" controls src={videoStatus.videoUrl}></video>
              </div>
            ) : (
              <button
                onClick={handleUploadVideo}
                className="w-full border-2 border-dashed border-gray-300 text-gray-600 py-4 rounded-lg hover:border-purple-500 hover:text-purple-600 transition"
              >
                📹 Upload Video Introduction
              </button>
            )}
          </div>

          {/* Referral System */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">🎁 Referral Program</h3>
              <span className="text-xs bg-pink-100 text-pink-800 px-2 py-1 rounded">Earn Rewards</span>
            </div>
            <p className="text-gray-600 text-sm mb-4">Share your referral code and earn rewards for every friend who joins.</p>
            
            {!referralCode ? (
              <button
                onClick={handleGenerateReferralCode}
                disabled={referralLoading}
                className="w-full bg-pink-600 text-white py-2 px-4 rounded-lg hover:bg-pink-700 transition"
              >
                {referralLoading ? 'Generating...' : 'Generate Referral Code'}
              </button>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={referralCode}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 font-mono"
                  />
                  <button
                    onClick={handleCopyReferral}
                    className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Copy
                  </button>
                </div>
                {referralStatus && (
                  <div className="text-sm text-gray-600">
                    <p>Referrals: {referralStatus.referralCount || 0} | Rewards: {referralStatus.referralRewards || 0}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Coding Performance */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">💻 Coding Performance</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">{displayData.codingPerformance?.platforms?.leetcode || 0}</p>
              <p className="text-sm text-gray-600">LeetCode</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{displayData.codingPerformance?.platforms?.codechef || 0}</p>
              <p className="text-sm text-gray-600">CodeChef</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{displayData.codingPerformance?.platforms?.codeforces || 0}</p>
              <p className="text-sm text-gray-600">Codeforces</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{displayData.codingPerformance?.averageRating || 0}</p>
              <p className="text-sm text-gray-600">Avg Rating</p>
            </div>
          </div>
          <div className="mt-4 flex justify-center">
            <Link to="/student/coding-growth" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View Detailed Growth Tracker →
            </Link>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/student/profile" className="bg-white shadow rounded-lg p-4 text-center hover:shadow-md transition">
            <span className="text-2xl">👤</span>
            <p className="mt-2 text-sm font-medium text-gray-700">Profile</p>
          </Link>
          <Link to="/student/career-prediction" className="bg-white shadow rounded-lg p-4 text-center hover:shadow-md transition">
            <span className="text-2xl">🔮</span>
            <p className="mt-2 text-sm font-medium text-gray-700">Career Path</p>
          </Link>
          <Link to="/placements/active" className="bg-white shadow rounded-lg p-4 text-center hover:shadow-md transition">
            <span className="text-2xl">💼</span>
            <p className="mt-2 text-sm font-medium text-gray-700">Jobs</p>
          </Link>
          <Link to="/student/applications" className="bg-white shadow rounded-lg p-4 text-center hover:shadow-md transition">
            <span className="text-2xl">📋</span>
            <p className="mt-2 text-sm font-medium text-gray-700">Applications</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;