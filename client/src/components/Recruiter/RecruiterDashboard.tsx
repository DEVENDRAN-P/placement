import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { analyticsAPI } from '../../services/api';
import { useAuth } from '../../context/FirebaseAuthContext';

const RecruiterDashboard: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const response: any = await analyticsAPI.getRecruiterDashboard();
        if (response.success) {
          setData(response.data);
        } else {
          setError(response.message || 'Failed to load recruiter analytics');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load recruiter analytics');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user?.role === 'recruiter') {
      fetchDashboard();
    }
  }, [isAuthenticated, user]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'recruiter') {
    return <div className="text-red-600 p-4">Recruiter dashboard is only available for recruiter accounts. Your role: {user?.role}</div>;
  }

  // Default data with ZERO initialization when API is unavailable
  const defaultZeroData = {
    overview: {
      totalJobsPosted: 0,
      activeJobs: 0,
      closedJobs: 0
    },
    conversionRates: {
      screeningToShortlist: 0,
      shortlistToSelection: 0,
      overall: 0
    },
    applicationFunnel: {
      totalApplications: 0,
      totalScreened: 0,
      totalShortlisted: 0
    }
  };
  
  const displayData = data || defaultZeroData;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900">Recruiter Dashboard</h1>
        <p className="mt-3 text-lg text-slate-600">
          Manage job postings, track applications, and leverage AI to shortlist top candidates.
        </p>
      </div>

      {loading && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center space-x-3">
          <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <p className="text-blue-700 text-sm font-medium">Syncing latest data...</p>
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center space-x-3">
          <span className="text-xl">⚠️</span>
          <p className="text-amber-700 text-sm">{error || "Using cached data"}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Total Jobs Posted */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 shadow-sm border border-blue-200 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Total Jobs Posted</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {displayData.overview.totalJobsPosted ?? 0}
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  Active: {displayData.overview.activeJobs ?? 0} · Closed: {displayData.overview.closedJobs ?? 0}
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
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 shadow-sm border border-green-200 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Total Applications</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {displayData.applicationFunnel.totalApplications ?? 0}
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  Screened: {displayData.applicationFunnel.totalScreened ?? 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 10H9m6 0a6 6 0 11-12 0 6 6 0 0112 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Shortlisted Candidates */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 shadow-sm border border-purple-200 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Shortlisted</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">
                  {displayData.applicationFunnel.totalShortlisted ?? 0}
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  Overall Conversion: {displayData.conversionRates.overall ?? 0}%
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Conversion Rates */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Conversion Funnel</h2>
            <div className="space-y-4">
              {/* Screening to Shortlist */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-slate-700 font-medium">Screening → Shortlist</p>
                  <span className="text-sm font-bold text-slate-900">
                    {displayData.conversionRates.screeningToShortlist ?? 0}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(displayData.conversionRates.screeningToShortlist ?? 0, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Shortlist to Selection */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-slate-700 font-medium">Shortlist → Selection</p>
                  <span className="text-sm font-bold text-slate-900">
                    {displayData.conversionRates.shortlistToSelection ?? 0}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(displayData.conversionRates.shortlistToSelection ?? 0, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Shortlisting CTA */}
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl shadow-sm border border-indigo-200 p-6 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-indigo-500 bg-opacity-20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900">AI Shortlisting</h3>
              <p className="mt-2 text-slate-700">
                Automatically identify and shortlist the best-fit candidates for your roles using advanced AI.
              </p>
            </div>
            <Link
              to="/recruiter/ai-shortlisting"
              className="mt-6 inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition shadow-sm"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              Launch AI Shortlisting
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
