import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { analyticsAPI } from '../../services/api';
import { useAuth } from '../../context/FirebaseAuthContext';
import { PageHeader } from '../ui/PageHeader';
import { Card } from '../ui/Card';

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
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <PageHeader
          title="Recruiter overview"
          description="Posting volume, pipeline counts, and funnel conversion from MongoDB-backed analytics."
        />

        {loading && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
            Loading recruiter metrics…
          </div>
        )}
        {error && (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card padding="md">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Jobs posted
              </p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">
                {displayData.overview.totalJobsPosted ?? 0}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Active {displayData.overview.activeJobs ?? 0} · Closed{' '}
                {displayData.overview.closedJobs ?? 0}
              </p>
            </Card>
            <Card padding="md">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Applications
              </p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">
                {displayData.applicationFunnel.totalApplications ?? 0}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Screened {displayData.applicationFunnel.totalScreened ?? 0}
              </p>
            </Card>
            <Card padding="md">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Shortlisted
              </p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">
                {displayData.applicationFunnel.totalShortlisted ?? 0}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Overall conversion {displayData.conversionRates.overall ?? 0}%
              </p>
            </Card>
          </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card padding="md">
            <h2 className="text-base font-semibold text-slate-900">Conversion funnel</h2>
            <div className="space-y-4">
              {/* Screening to Shortlist */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-slate-700 font-medium">Screening → Shortlist</p>
                  <span className="text-sm font-bold text-slate-900">
                    {displayData.conversionRates.screeningToShortlist ?? 0}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-200">
                  <div
                    className="h-2 rounded-full bg-slate-900 transition-all"
                    style={{ width: `${Math.min(displayData.conversionRates.screeningToShortlist ?? 0, 100)}%` }}
                  />
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
                <div className="h-2 w-full rounded-full bg-slate-200">
                  <div
                    className="h-2 rounded-full bg-slate-600 transition-all"
                    style={{ width: `${Math.min(displayData.conversionRates.shortlistToSelection ?? 0, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card padding="md" className="flex flex-col justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-900">AI shortlisting</h3>
              <p className="mt-2 text-sm text-slate-600">
                Rank applicants against open roles using model-assisted scoring.
              </p>
            </div>
            <Link
              to="/recruiter/ai-shortlisting"
              className="mt-6 inline-flex items-center justify-center rounded-md bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              Open workflow
            </Link>
          </Card>
        </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
