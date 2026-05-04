import React, { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { recruiterAPI, analyticsAPI } from '../../services/api';
import { useAuth } from '../../context/FirebaseAuthContext';

const RecruiterPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [placements, setPlacements] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch recruiter stats
        try {
          const statsRes: any = await analyticsAPI.getRecruiterDashboard();
          if (statsRes?.success) {
            setStats(statsRes.data);
          }
        } catch (err) {
          console.warn('Failed to fetch recruiter stats');
        }

        // Fetch placements
        try {
          const placementsRes: any = await recruiterAPI.getPlacements({ limit: 5 });
          if (placementsRes?.success) {
            setPlacements(placementsRes.data || []);
          }
        } catch (err) {
          console.warn('Failed to fetch placements');
        }
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user?.role === 'recruiter') {
      fetchData();
    }
  }, [isAuthenticated, user]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'recruiter') {
    return <div className="text-red-600 p-4">This page is only available for recruiters</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-slate-900">Recruiter Dashboard</h1>
          <p className="mt-3 text-lg text-slate-600">
            Manage your job postings, track applications, and find top talent
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-slate-600 font-medium">Loading your dashboard...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Total Jobs */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 shadow-sm border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Total Jobs Posted</p>
                    <p className="text-3xl font-bold text-blue-600 mt-2">
                      {stats?.overview?.totalJobsPosted ?? 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Total Applications */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 shadow-sm border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Total Applications</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">
                      {stats?.applicationFunnel?.totalApplications ?? 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 10H9m6 0a6 6 0 11-12 0 6 6 0 0112 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Conversion Rate */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 shadow-sm border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Overall Conversion</p>
                    <p className="text-3xl font-bold text-purple-600 mt-2">
                      {stats?.conversionRates?.overall ?? 0}%
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Post Job */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 flex flex-col justify-between">
                <div className="mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Post New Job</h3>
                  <p className="text-slate-600 text-sm">Create a new job posting and find qualified candidates</p>
                </div>
                <Link
                  to="/recruiter/post-job"
                  className="inline-block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition"
                >
                  Post Job
                </Link>
              </div>

              {/* Browse Candidates */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 flex flex-col justify-between">
                <div className="mb-6">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Browse Candidates</h3>
                  <p className="text-slate-600 text-sm">Search and shortlist the best candidates for your roles</p>
                </div>
                <Link
                  to="/recruiter/candidates"
                  className="inline-block w-full text-center bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition"
                >
                  Browse Candidates
                </Link>
              </div>

              {/* AI Shortlisting */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 flex flex-col justify-between">
                <div className="mb-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">AI Shortlisting</h3>
                  <p className="text-slate-600 text-sm">Use AI to automatically shortlist best-fit candidates</p>
                </div>
                <Link
                  to="/recruiter/ai-shortlisting"
                  className="inline-block w-full text-center bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition"
                >
                  Use AI Shortlisting
                </Link>
              </div>
            </div>

            {/* Recent Jobs */}
            {placements.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Recent Job Postings</h2>
                <div className="space-y-4">
                  {placements.slice(0, 5).map((placement, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-bold text-slate-900">{placement.jobTitle || 'Job Position'}</h3>
                          <p className="text-sm text-slate-600 mt-1">{placement.company || 'Company'}</p>
                          <p className="text-xs text-slate-500 mt-2">
                            Posted: {new Date(placement.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            placement.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {placement.status || 'Active'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">💡 Pro Tips</h2>
              <ul className="space-y-3 text-slate-700">
                <li className="flex items-start space-x-3">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Write clear and detailed job descriptions to attract better candidates</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Use AI Shortlisting to save time and find the best matches automatically</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Review candidate coding profiles to assess technical skills</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Provide timely feedback to maintain candidate engagement</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecruiterPage;
