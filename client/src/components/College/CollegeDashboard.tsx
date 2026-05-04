import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { analyticsAPI } from '../../services/api';
import { useAuth } from '../../context/FirebaseAuthContext';

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
  
  const displayData = data || defaultZeroData;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900">Placement Analytics</h1>
        <p className="mt-3 text-lg text-slate-600">
          Track placement metrics, department performance, and hiring trends across your campus.
        </p>
      </div>

      {loading && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center space-x-3">
          <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <p className="text-blue-700 text-sm font-medium">Syncing latest analytics...</p>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Placement Rate */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 shadow-sm border border-blue-200 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Placement Rate</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {displayData.overview.placementRate ?? 0}%
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  {displayData.overview.placedStudents ?? 0}/{displayData.overview.totalStudents ?? 0} students
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Average Package */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 shadow-sm border border-green-200 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Avg Package</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  ₹{((displayData.overview.averagePackage ?? 0) / 100000).toFixed(1)}
                </p>
                <p className="text-xs text-slate-500 mt-2">LPA</p>
              </div>
              <div className="w-12 h-12 bg-green-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Highest Package */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 shadow-sm border border-purple-200 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Highest Package</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">
                  ₹{((displayData.overview.highestPackage ?? 0) / 100000).toFixed(1)}
                </p>
                <p className="text-xs text-slate-500 mt-2">LPA</p>
              </div>
              <div className="w-12 h-12 bg-purple-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Companies Visited */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 shadow-sm border border-orange-200 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Companies Visited</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">
                  {displayData.overview.companiesVisited ?? 0}
                </p>
                <p className="text-xs text-slate-500 mt-2">Total visiting</p>
              </div>
              <div className="w-12 h-12 bg-orange-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5.5m0 0H9m0 0h-2m0 0H3" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Department Performance Table */}
        {data && data.departmentStats && Object.keys(data.departmentStats).length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Department Performance</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Department</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Placement Rate</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Avg CGPA</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Avg Package (LPA)</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries<any>(data.departmentStats).map(([dept, stats]) => (
                    <tr key={dept} className="border-b border-slate-100 hover:bg-slate-50 transition">
                      <td className="py-3 px-4 text-sm font-medium text-slate-900">{dept}</td>
                      <td className="py-3 px-4 text-sm text-slate-700">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                          {(stats.placementRate ?? 0).toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-700">{(stats.averageCGPA ?? 0).toFixed(2)}</td>
                      <td className="py-3 px-4 text-sm font-semibold text-slate-900">
                        ₹{((stats.averagePackage ?? 0) / 100000).toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollegeDashboard;
