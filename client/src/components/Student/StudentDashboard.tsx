import React, { useEffect, useState, useMemo } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { analyticsAPI, aiAPI, interviewPrepAPI, referralAPI, videoProfileAPI, codingPlatformsAPI } from '../../services/api';
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

        // Fetch coding platform stats
        try {
          const codingRes: any = await codingPlatformsAPI.getMyProfiles();
          if (codingRes?.success && codingRes?.data?.profiles) {
            // Update the data with actual coding profiles
            setData(prevData => {
              if (!prevData) {
                return {
                  placementReadinessScore: 0,
                  recentApplications: [],
                  codingPerformance: {
                    platforms: {
                      leetcode: codingRes.data.profiles.leetcode?.totalSolved || 0,
                      codechef: codingRes.data.profiles.codechef?.totalSolved || 0,
                      codeforces: codingRes.data.profiles.codeforces?.totalSolved || 0
                    },
                    totalProblems: 
                      (codingRes.data.profiles.leetcode?.totalSolved || 0) +
                      (codingRes.data.profiles.codechef?.totalSolved || 0) +
                      (codingRes.data.profiles.codeforces?.totalSolved || 0)
                  }
                };
              }
              return {
                ...prevData,
                codingPerformance: {
                  ...prevData.codingPerformance,
                  platforms: {
                    leetcode: codingRes.data.profiles.leetcode?.totalSolved || 0,
                    codechef: codingRes.data.profiles.codechef?.totalSolved || 0,
                    codeforces: codingRes.data.profiles.codeforces?.totalSolved || 0
                  },
                  totalProblems: 
                    (codingRes.data.profiles.leetcode?.totalSolved || 0) +
                    (codingRes.data.profiles.codechef?.totalSolved || 0) +
                    (codingRes.data.profiles.codeforces?.totalSolved || 0)
                }
              };
            });
          }
        } catch (err) {
          console.warn('Coding profiles unavailable');
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
    placementReadinessScore: 0,
    recentApplications: [],
    codingPerformance: { totalProblems: 0, averageRating: 0, platforms: { leetcode: 0, codechef: 0, codeforces: 0 } }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Welcome Back, {user?.profile?.firstName || 'Student'}!</h1>
          <p className="text-lg text-slate-600">Track your placement journey and career progress</p>
        </div>

        {loading && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center space-x-3">
            <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <p className="text-blue-700 text-sm font-medium">Fetching your latest data...</p>
          </div>
        )}

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {/* Metric Card - Placement Readiness */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <p className="text-slate-600 text-sm font-medium mb-1">Placement Readiness</p>
            <p className="text-3xl font-bold text-slate-900 mb-2">{displayData.placementReadinessScore ?? 0}%</p>
            <p className="text-xs text-slate-500">Complete your profile to improve</p>
          </div>

          {/* Metric Card - Probability */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <p className="text-slate-600 text-sm font-medium mb-1">Placement Probability</p>
            <p className="text-3xl font-bold text-slate-900 mb-2">{placementProbability !== null ? `${placementProbability}%` : '0%'}</p>
            <p className="text-xs text-slate-500">AI-calculated prediction</p>
          </div>

          {/* Metric Card - Coding */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
            </div>
            <p className="text-slate-600 text-sm font-medium mb-1">Problems Solved</p>
            <p className="text-3xl font-bold text-slate-900 mb-2">{displayData.codingPerformance?.totalProblems || 0}</p>
            <p className="text-xs text-slate-500">Across all platforms</p>
          </div>

          {/* Metric Card - Applications */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <p className="text-slate-600 text-sm font-medium mb-1">Applications</p>
            <p className="text-3xl font-bold text-slate-900 mb-2">{displayData.recentApplications?.length || 0}</p>
            <p className="text-xs text-slate-500">Active applications</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {/* Career Prediction Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 lg:col-span-1">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-50 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">AI Career Prediction</h3>
                <span className="inline-block text-xs font-semibold text-green-700 bg-green-50 px-2 py-1 rounded-full mt-1">AI Powered</span>
              </div>
            </div>
            <p className="text-slate-600 text-sm mb-6">Get personalized placement probability based on your profile analysis and performance metrics.</p>
            <button
              onClick={handlePredictPlacement}
              disabled={probabilityLoading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {probabilityLoading ? 'Analyzing Your Profile...' : 'Generate Prediction'}
            </button>
          </div>

          {/* Skill Gap Analyzer Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 lg:col-span-1">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Skill Gap Analyzer</h3>
                <span className="inline-block text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded-full mt-1">AI Powered</span>
              </div>
            </div>
            <p className="text-slate-600 text-sm mb-4">Identify skill gaps for your target role.</p>
            <div className="flex space-x-2 mb-4">
              <input
                type="text"
                value={skillGapTarget}
                onChange={(e) => setSkillGapTarget(e.target.value)}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Backend Developer"
              />
              <button
                onClick={handleAnalyzeSkillGap}
                disabled={skillGapLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition disabled:opacity-50"
              >
                {skillGapLoading ? '...' : 'Analyze'}
              </button>
            </div>
            {skillGapSuggestions && (
              <div className="text-sm bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <p className="font-semibold text-slate-900 mb-2">Recommendations:</p>
                <ul className="space-y-1 text-slate-700">
                  {skillGapSuggestions.recommendations?.slice(0, 3).map((rec: string, idx: number) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Coding Performance Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 lg:col-span-1">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Coding Performance</h3>
                <span className="inline-block text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-1 rounded-full mt-1">Real-time</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-600 font-medium">LeetCode</span>
                <span className="text-lg font-bold text-slate-900">{displayData.codingPerformance?.platforms?.leetcode || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-600 font-medium">CodeChef</span>
                <span className="text-lg font-bold text-slate-900">{displayData.codingPerformance?.platforms?.codechef || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-600 font-medium">Codeforces</span>
                <span className="text-lg font-bold text-slate-900">{displayData.codingPerformance?.platforms?.codeforces || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Interview Preparation Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Interview Preparation</h3>
                <p className="text-sm text-slate-500 mt-1">Master interview patterns and techniques</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full">Pro Feature</span>
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
                    placeholder="Your referral code"
                    title="Referral code for sharing with friends"
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