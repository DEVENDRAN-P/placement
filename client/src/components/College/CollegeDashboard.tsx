import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { analyticsAPI } from '../../services/api';
import { useAuth } from '../../context/FirebaseAuthContext';
import { PageHeader } from '../ui/PageHeader';
import { Card } from '../ui/Card';

const CollegeDashboard: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const response: any = await analyticsAPI.getCollegeDashboard();
        if (response.success) {
          setData(response.data);
        } else {
          setError(response.message || 'Failed to load college analytics');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load college analytics');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user?.role === 'college') {
      fetchDashboard();
    }
  }, [isAuthenticated, user]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'college') {
    return <div className="text-red-600 p-4">Placement analytics are only available for college accounts. Your role: {user?.role}</div>;
  }

  // Default data with ZERO initialization when API is unavailable
  const defaultZeroData = {
    overview: {
      placementRate: 0,
      placedStudents: 0,
      totalStudents: 0,
      averagePackage: 0,
      highestPackage: 0,
      companiesVisited: 0
    },
    departmentStats: {},
    cgpaDistribution: [],
    monthlyTrend: {}
  };
   
  // Merge API data with defaults to ensure all fields are present
  const displayData = {
    ...defaultZeroData,
    ...(data || {}),
    overview: {
      ...defaultZeroData.overview,
      ...(data?.overview || {})
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <PageHeader
          title="Placement analytics"
          description="Campus-wide placement KPIs and department rollups from stored student outcomes."
        />

        {loading && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
            Loading college analytics…
          </div>
        )}
        {error && (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card padding="md">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Placement rate
              </p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">
                {displayData.overview.placementRate ?? 0}%
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {displayData.overview.placedStudents ?? 0} /{' '}
                {displayData.overview.totalStudents ?? 0} students
              </p>
            </Card>
            <Card padding="md">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Average package
              </p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">
                ₹{((displayData.overview.averagePackage ?? 0) / 100000).toFixed(1)}
              </p>
              <p className="mt-1 text-xs text-slate-500">LPA</p>
            </Card>
            <Card padding="md">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Highest package
              </p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">
                ₹{((displayData.overview.highestPackage ?? 0) / 100000).toFixed(1)}
              </p>
              <p className="mt-1 text-xs text-slate-500">LPA</p>
            </Card>
            <Card padding="md">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Companies visited
              </p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">
                {displayData.overview.companiesVisited ?? 0}
              </p>
              <p className="mt-1 text-xs text-slate-500">Recorded drives</p>
            </Card>
          </div>

        {data && data.departmentStats && Object.keys(data.departmentStats).length > 0 && (
          <Card padding="md">
            <h2 className="text-base font-semibold text-slate-900">Department performance</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Department</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Placement rate</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Avg CGPA</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Avg package (LPA)</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries<any>(data.departmentStats).map(([dept, stats]) => (
                    <tr key={dept} className="border-b border-slate-100 transition hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">{dept}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800">
                          {(stats.placementRate ?? 0).toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">{(stats.averageCGPA ?? 0).toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                        ₹{((stats.averagePackage ?? 0) / 100000).toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
        </div>
      </div>
    </div>
  );
};

export default CollegeDashboard;
