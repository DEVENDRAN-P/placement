import React, { useEffect, useState, useMemo } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  analyticsAPI,
  aiAPI,
  interviewPrepAPI,
  referralAPI,
  videoProfileAPI,
  codingPlatformsAPI,
} from '../../services/api';
import { useAuth } from '../../context/FirebaseAuthContext';
import { PageHeader } from '../ui/PageHeader';
import { Card } from '../ui/Card';
import {
  Briefcase,
  ClipboardList,
  Sparkles,
  UserRound,
  Video,
  Gift,
  ChevronRight,
} from 'lucide-react';

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
  const [placementProbability, setPlacementProbability] = useState<number | null>(null);
  const [probabilityLoading, setProbabilityLoading] = useState<boolean>(false);
  const [skillGapTarget, setSkillGapTarget] = useState<string>('Software Engineer');
  const [skillGapSuggestions, setSkillGapSuggestions] = useState<any | null>(null);
  const [skillGapLoading, setSkillGapLoading] = useState<boolean>(false);
  
  // Interview prep state
  const [interviewResources, setInterviewResources] = useState<any | null>(null);
  
  // Referral state
  const [referralCode, setReferralCode] = useState<string>('');
  const [referralLoading, setReferralLoading] = useState<boolean>(false);
  const [referralStatus, setReferralStatus] = useState<any>(null);
  
  // Video profile state
  const [videoStatus, setVideoStatus] = useState<any>(null);
  const [dashboardLoadNote, setDashboardLoadNote] = useState<string>('');
  const [skillGapError, setSkillGapError] = useState<string>('');

  const memoizedFetchDashboard = useMemo(() => {
    return async () => {
      try {
        setLoading(true);
        setDashboardLoadNote('');
        
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
          setDashboardLoadNote(
            'Dashboard summary could not be loaded from the server. Metrics below reflect zeros until the API succeeds.',
          );
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
      const response: any = await aiAPI.predictCareer();
      if (response?.success && response?.data) {
        const p =
          response.data.placementProbability ?? response.data.placementScore;
        if (typeof p === 'number') setPlacementProbability(Math.round(p));
      }
    } catch {
      /* keep previous value; user can retry */
    } finally {
      setProbabilityLoading(false);
    }
  };

  const handleAnalyzeSkillGap = async () => {
    try {
      setSkillGapLoading(true);
      setSkillGapError('');
      const response: any = await aiAPI.analyzeSkillGap(skillGapTarget);
      if (response?.success && response?.data) {
        setSkillGapSuggestions(response.data);
      } else {
        setSkillGapSuggestions(null);
        setSkillGapError(response?.message || 'Analysis returned no data.');
      }
    } catch (err: any) {
      setSkillGapSuggestions(null);
      setSkillGapError(
        typeof err === 'string'
          ? err
          : err?.message || 'Skill gap analysis failed.',
      );
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
      void navigator.clipboard.writeText(referralCode);
    }
  };

  const handleUploadVideo = () => {
    window.location.assign('/student/video-profile');
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
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <PageHeader
          title={`Welcome, ${user?.profile?.firstName || 'Student'}`}
          description="Placement readiness, coding activity, and applications from live APIs."
        />

        {loading && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
            Loading dashboard…
          </div>
        )}

        {dashboardLoadNote && (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            {dashboardLoadNote}
          </div>
        )}

        <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card padding="md">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Placement readiness
            </p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              {displayData.placementReadinessScore ?? 0}%
            </p>
            <p className="mt-1 text-xs text-slate-500">From analytics service</p>
          </Card>
          <Card padding="md">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Placement probability
            </p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              {placementProbability !== null ? `${placementProbability}%` : '—'}
            </p>
            <p className="mt-1 text-xs text-slate-500">Run prediction below</p>
          </Card>
          <Card padding="md">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Problems solved
            </p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              {displayData.codingPerformance?.totalProblems || 0}
            </p>
            <p className="mt-1 text-xs text-slate-500">Aggregated platforms</p>
          </Card>
          <Card padding="md">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Applications
            </p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              {displayData.recentApplications?.length || 0}
            </p>
            <p className="mt-1 text-xs text-slate-500">Recent pipeline</p>
          </Card>
        </div>

        <div className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card padding="lg" className="lg:col-span-1">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-slate-600" aria-hidden />
              <div>
                <h3 className="text-base font-semibold text-slate-900">Career prediction</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Calls the AI service with your stored profile context.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handlePredictPlacement}
              disabled={probabilityLoading}
              className="mt-6 w-full rounded-md bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {probabilityLoading ? 'Running…' : 'Run prediction'}
            </button>
          </Card>

          <Card padding="lg" className="lg:col-span-1">
            <h3 className="text-base font-semibold text-slate-900">Skill gap analysis</h3>
            <p className="mt-1 text-sm text-slate-600">Target role vs. your recorded skills.</p>
            <div className="mt-4 flex gap-2">
              <input
                type="text"
                value={skillGapTarget}
                onChange={(e) => setSkillGapTarget(e.target.value)}
                className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-900/5 focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10"
                placeholder="Target role"
              />
              <button
                type="button"
                onClick={handleAnalyzeSkillGap}
                disabled={skillGapLoading}
                className="shrink-0 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
              >
                {skillGapLoading ? '…' : 'Analyze'}
              </button>
            </div>
            {skillGapSuggestions && (
              <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800">
                <p className="font-medium text-slate-900">Recommendations</p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {skillGapSuggestions.recommendations?.slice(0, 5).map((rec: string, idx: number) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
            {skillGapError && <p className="mt-3 text-sm text-red-700">{skillGapError}</p>}
          </Card>

          <Card padding="lg" className="lg:col-span-1">
            <h3 className="text-base font-semibold text-slate-900">Coding platforms</h3>
            <p className="mt-1 text-sm text-slate-600">Synced solved counts.</p>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-md border border-slate-100 bg-slate-50 px-3 py-2">
                <dt className="text-slate-600">LeetCode</dt>
                <dd className="font-semibold text-slate-900">
                  {displayData.codingPerformance?.platforms?.leetcode || 0}
                </dd>
              </div>
              <div className="flex items-center justify-between rounded-md border border-slate-100 bg-slate-50 px-3 py-2">
                <dt className="text-slate-600">CodeChef</dt>
                <dd className="font-semibold text-slate-900">
                  {displayData.codingPerformance?.platforms?.codechef || 0}
                </dd>
              </div>
              <div className="flex items-center justify-between rounded-md border border-slate-100 bg-slate-50 px-3 py-2">
                <dt className="text-slate-600">Codeforces</dt>
                <dd className="font-semibold text-slate-900">
                  {displayData.codingPerformance?.platforms?.codeforces || 0}
                </dd>
              </div>
            </dl>
          </Card>
        </div>

        <Card padding="lg" className="mb-10">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Interview preparation</h3>
              <p className="text-sm text-slate-600">Patterns returned by the interview prep API.</p>
            </div>
            <Link
              to="/student/interview-prep"
              className="text-sm font-semibold text-slate-900 underline-offset-4 hover:underline"
            >
              Open full library
            </Link>
          </div>
          
          {interviewResources?.codingPatterns && (
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              {interviewResources.codingPatterns.slice(0, 3).map((pattern: any, idx: number) => (
                <div key={idx} className="rounded-md border border-slate-200 bg-slate-50 p-4">
                  <h4 className="font-medium text-slate-900">{pattern.pattern}</h4>
                  <p className="mt-1 text-sm text-slate-600">{pattern.description}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {pattern.problems?.slice(0, 2).map((problem: string, i: number) => (
                      <span
                        key={i}
                        className="rounded bg-white px-2 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200"
                      >
                        {problem}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <div className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card padding="md">
            <div className="flex items-center gap-2">
              <Video className="h-5 w-5 text-slate-600" aria-hidden />
              <h3 className="text-base font-semibold text-slate-900">Video introduction</h3>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              Optional clip for recruiters; stored when your backend enables uploads.
            </p>

            {videoStatus?.hasVideo ? (
              <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-800">Recording on file</p>
                <video className="mt-3 w-full rounded-md border border-slate-200" controls src={videoStatus.videoUrl} />
              </div>
            ) : (
              <button
                type="button"
                onClick={handleUploadVideo}
                className="mt-4 w-full rounded-md border border-dashed border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              >
                Upload or manage video
              </button>
            )}
          </Card>

          <Card padding="md">
            <div className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-slate-600" aria-hidden />
              <h3 className="text-base font-semibold text-slate-900">Referrals</h3>
            </div>
            <p className="mt-2 text-sm text-slate-600">Codes and counts from the referral API.</p>

            {!referralCode ? (
              <button
                type="button"
                onClick={handleGenerateReferralCode}
                disabled={referralLoading}
                className="mt-4 w-full rounded-md bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-50"
              >
                {referralLoading ? 'Generating…' : 'Generate code'}
              </button>
            ) : (
              <div className="mt-4 space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={referralCode}
                    readOnly
                    title="Referral code"
                    className="min-w-0 flex-1 rounded-md border border-slate-300 bg-slate-50 px-3 py-2 font-mono text-sm text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={handleCopyReferral}
                    className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
                  >
                    Copy
                  </button>
                </div>
                {referralStatus && (
                  <p className="text-sm text-slate-600">
                    Referrals: {referralStatus.referralCount || 0} · Rewards:{' '}
                    {referralStatus.referralRewards || 0}
                  </p>
                )}
              </div>
            )}
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { to: '/student/profile', label: 'Profile', Icon: UserRound },
            { to: '/student/career-prediction', label: 'Career insights', Icon: Sparkles },
            { to: '/placements/active', label: 'Active jobs', Icon: Briefcase },
            { to: '/student/applications', label: 'Applications', Icon: ClipboardList },
          ].map(({ to, label, Icon }) => (
            <Link
              key={to}
              to={to}
              className="group flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:border-slate-300 hover:shadow-md"
            >
              <span className="flex items-center gap-3">
                <Icon className="h-5 w-5 text-slate-500" aria-hidden />
                <span className="text-sm font-medium text-slate-900">{label}</span>
              </span>
              <ChevronRight className="h-4 w-4 text-slate-400 transition group-hover:text-slate-700" aria-hidden />
            </Link>
          ))}
        </div>

        <div className="mt-8 border-t border-slate-200 pt-6">
          <Link
            to="/student/coding-growth"
            className="text-sm font-semibold text-slate-900 underline-offset-4 hover:underline"
          >
            Detailed coding growth →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;