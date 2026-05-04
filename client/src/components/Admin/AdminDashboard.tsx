import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/FirebaseAuthContext';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AdminDashboard: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [dashboard, setDashboard] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>('dashboard');
  const [statistics, setStatistics] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        const res = await fetch(`${API_BASE_URL}/admin/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (data.success) {
          setDashboard(data.data);
        }
        
        const statsRes = await fetch(`${API_BASE_URL}/admin/statistics`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const statsData = await statsRes.json();
        
        if (statsData.success) {
          setStatistics(statsData.data);
        }
      } catch (err) {
        console.error('Failed to fetch admin data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user?.role === 'admin') {
      fetchData();
    }
  }, [isAuthenticated, user]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <div className="p-4 text-red-600">Access denied - Admin only</div>;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-slate-600 font-medium">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="mt-3 text-lg text-slate-600">Platform management, analytics, and control</p>
          </div>
          <div className="flex items-center space-x-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full">
            <span className="w-2 h-2 bg-green-600 rounded-full"></span>
            <span className="text-sm font-semibold text-green-700">Admin Mode Active</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-6 shadow-sm border border-indigo-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Total Users</p>
                <p className="text-3xl font-bold text-indigo-600 mt-2">
                  {dashboard?.overview?.totalUsers ?? 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-indigo-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 10H9m6 0a6 6 0 11-12 0 6 6 0 0112 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 shadow-sm border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Total Students</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {dashboard?.overview?.totalStudents ?? 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 shadow-sm border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Total Colleges</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">
                  {dashboard?.overview?.totalColleges ?? 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5.5m0 0H9m0 0h-2m0 0H3" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 shadow-sm border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Total Recruiters</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {dashboard?.overview?.totalRecruiters ?? 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Container */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-12">
          {/* Tab Headers */}
          <div className="flex border-b border-slate-200 overflow-x-auto">
            {['dashboard', 'users', 'colleges', 'recruiters', 'settings'].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`px-6 py-4 font-semibold text-sm whitespace-nowrap transition ${
                  selectedTab === tab
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-slate-600 hover:text-slate-900 border-b-2 border-transparent'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {selectedTab === 'dashboard' && (
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Platform Statistics</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                    <h3 className="font-bold text-slate-900 mb-4">User Distribution</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-700">Students</span>
                        <span className="font-bold text-slate-900 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                          {statistics?.students?.total ?? 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-700">Colleges</span>
                        <span className="font-bold text-slate-900 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                          {statistics?.colleges?.total ?? 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-700">Recruiters</span>
                        <span className="font-bold text-slate-900 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                          {statistics?.recruiters?.total ?? 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                    <h3 className="font-bold text-slate-900 mb-4">Placement Status</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-700">Total Jobs</span>
                        <span className="font-bold text-slate-900">{statistics?.placements?.total ?? 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-700">Active</span>
                        <span className="font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm">
                          {statistics?.placements?.active ?? 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-700">Closed</span>
                        <span className="font-bold text-slate-600">{statistics?.placements?.closed ?? 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                    <h3 className="font-bold text-slate-900 mb-4">Verification Status</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-700">Verified</span>
                        <span className="font-bold text-green-600">{dashboard?.overview?.verifiedUsers ?? 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-700">Active</span>
                        <span className="font-bold text-green-600">{dashboard?.overview?.activeUsers ?? 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-700">New This Month</span>
                        <span className="font-bold text-slate-900">{dashboard?.overview?.newUsersThisMonth ?? 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'users' && (
              <div className="text-center py-12">
                <svg className="w-12 h-12 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 10H9m6 0a6 6 0 11-12 0 6 6 0 0112 0z" />
                </svg>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">User Management</h3>
                <p className="text-slate-600">Full user management interface coming soon</p>
              </div>
            )}

            {selectedTab === 'colleges' && (
              <div className="text-center py-12">
                <svg className="w-12 h-12 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5.5m0 0H9m0 0h-2m0 0H3" />
                </svg>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">College Management</h3>
                <p className="text-slate-600">Manage college registrations and verifications</p>
              </div>
            )}

            {selectedTab === 'recruiters' && (
              <div className="text-center py-12">
                <svg className="w-12 h-12 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Recruiter Management</h3>
                <p className="text-slate-600">Manage recruiter registrations and verifications</p>
              </div>
            )}

            {selectedTab === 'settings' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-slate-900">Maintenance Mode</h3>
                    <p className="text-sm text-slate-600">Prevent users from logging in</p>
                  </div>
                  <button className="px-4 py-2 bg-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-300 transition">
                    Disabled
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-slate-900">Registration</h3>
                    <p className="text-sm text-slate-600">Allow new user registrations</p>
                  </div>
                  <button className="px-4 py-2 bg-green-100 text-green-700 font-medium rounded-lg hover:bg-green-200 transition">
                    Enabled
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-slate-900">Google Auth</h3>
                    <p className="text-sm text-slate-600">Allow Google OAuth login</p>
                  </div>
                  <button className="px-4 py-2 bg-green-100 text-green-700 font-medium rounded-lg hover:bg-green-200 transition">
                    Enabled
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            to="/dashboard"
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center hover:shadow-md hover:border-slate-300 transition"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 11l4-4m0 0l4 4m-4-4v4" />
              </svg>
            </div>
            <p className="font-semibold text-slate-900">Main Dashboard</p>
          </Link>

          <Link
            to="/placements/active"
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center hover:shadow-md hover:border-slate-300 transition"
          >
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="font-semibold text-slate-900">All Placements</p>
          </Link>

          <Link
            to="/analytics"
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center hover:shadow-md hover:border-slate-300 transition"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="font-semibold text-slate-900">Analytics</p>
          </Link>

          <Link
            to="/api-docs"
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center hover:shadow-md hover:border-slate-300 transition"
          >
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C6.248 6.253 2 10.998 2 16.5S6.248 26.75 12 26.75s10-4.745 10-10.25S17.752 6.253 12 6.253z" />
              </svg>
            </div>
            <p className="font-semibold text-slate-900">API Docs</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;