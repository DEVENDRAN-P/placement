import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { analyticsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

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

  // Default data when API is unavailable
  const displayData = data || {
    overview: {
      totalJobsPosted: 12,
      activeJobs: 5,
      closedJobs: 7
    },
    conversionRates: {
      screeningToShortlist: 35,
      shortlistToSelection: 45,
      overall: 16
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Recruiter Dashboard</h1>
      <p className="mt-2 text-gray-600">
        Manage job postings, track applications, and use AI to shortlist candidates.
      </p>

      {loading && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center space-x-3">
          <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <p className="text-blue-700 text-sm">Syncing latest data...</p>
        </div>
      )}
      {error && (
        <p className="mt-4 text-sm text-orange-600 p-3 bg-orange-50 border border-orange-200 rounded-lg">⚠️ {error || "Using cached data"}</p>
      )}

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900">Job Postings</h3>
          <p className="mt-2 text-gray-600">Create and manage job opportunities.</p>
          <p className="mt-4 text-3xl font-bold text-blue-600">{displayData.overview.totalJobsPosted}</p>
          <p className="mt-1 text-sm text-gray-500">
            Active: {displayData.overview.activeJobs} · Closed: {displayData.overview.closedJobs}
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900">Application Funnel</h3>
          <p className="mt-2 text-gray-600">Conversion from screening to selection.</p>
          <div className="mt-4 text-sm text-gray-700 space-y-1">
            <p>Screen → Shortlist: {displayData.conversionRates.screeningToShortlist}%</p>
            <p>Shortlist → Select: {displayData.conversionRates.shortlistToSelection}%</p>
            <p>Overall: {displayData.conversionRates.overall}%</p>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">AI Shortlisting</h3>
            <p className="mt-2 text-gray-600">
              Use AI to automatically shortlist best-fit candidates for your roles.
            </p>
          </div>
          <Link
            to="/recruiter/ai-shortlisting"
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            Go to AI Shortlisting
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
