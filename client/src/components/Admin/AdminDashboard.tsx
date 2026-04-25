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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Platform management and control</p>
          </div>
          <div className="flex space-x-2">
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              Admin Mode
            </span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-500">Total Users</p>
            <p className="text-3xl font-bold text-indigo-600">{dashboard?.overview?.totalUsers || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-500">Total Students</p>
            <p className="text-3xl font-bold text-blue-600">{dashboard?.overview?.totalStudents || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-500">Total Colleges</p>
            <p className="text-3xl font-bold text-purple-600">{dashboard?.overview?.totalColleges || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-500">Total Recruiters</p>
            <p className="text-3xl font-bold text-green-600">{dashboard?.overview?.totalRecruiters || 0}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setSelectedTab('dashboard')}
              className={`px-6 py-3 font-medium ${
                selectedTab === 'dashboard'
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setSelectedTab('users')}
              className={`px-6 py-3 font-medium ${
                selectedTab === 'users'
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Users
            </button>
            <button
              onClick={() => setSelectedTab('colleges')}
              className={`px-6 py-3 font-medium ${
                selectedTab === 'colleges'
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Colleges
            </button>
            <button
              onClick={() => setSelectedTab('recruiters')}
              className={`px-6 py-3 font-medium ${
                selectedTab === 'recruiters'
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Recruiters
            </button>
            <button
              onClick={() => setSelectedTab('settings')}
              className={`px-6 py-3 font-medium ${
                selectedTab === 'settings'
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Settings
            </button>
          </div>

          <div className="p-6">
            {selectedTab === 'dashboard' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Platform Statistics</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-700">User Distribution</h3>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Students</span>
                        <span className="font-medium">{statistics?.students?.total || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Colleges</span>
                        <span className="font-medium">{statistics?.colleges?.total || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Recruiters</span>
                        <span className="font-medium">{statistics?.recruiters?.total || 0}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-700">Placement Status</h3>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Jobs</span>
                        <span className="font-medium">{statistics?.placements?.total || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Active</span>
                        <span className="font-medium text-green-600">{statistics?.placements?.active || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Closed</span>
                        <span className="font-medium text-gray-600">{statistics?.placements?.closed || 0}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-700">Verification Status</h3>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Verified Users</span>
                        <span className="font-medium text-green-600">{dashboard?.overview?.verifiedUsers || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Active Users</span>
                        <span className="font-medium text-green-600">{dashboard?.overview?.activeUsers || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">New This Month</span>
                        <span className="font-medium">{dashboard?.overview?.newUsersThisMonth || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'users' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">User Management</h2>
                <p className="text-gray-500">User management interface - view, edit, and manage all platform users.</p>
                <div className="mt-4 p-8 bg-gray-50 rounded-lg text-center">
                  <p className="text-gray-500">Full user management interface coming soon</p>
                </div>
              </div>
            )}

            {selectedTab === 'colleges' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">College Management</h2>
                <p className="text-gray-500">Manage college registrations and verifications.</p>
                <div className="mt-4 p-8 bg-gray-50 rounded-lg text-center">
                  <p className="text-gray-500">College management interface coming soon</p>
                </div>
              </div>
            )}

            {selectedTab === 'recruiters' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Recruiter Management</h2>
                <p className="text-gray-500">Manage recruiter registrations and verifications.</p>
                <div className="mt-4 p-8 bg-gray-50 rounded-lg text-center">
                  <p className="text-gray-500">Recruiter management interface coming soon</p>
                </div>
              </div>
            )}

            {selectedTab === 'settings' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Platform Settings</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium">Maintenance Mode</h3>
                      <p className="text-sm text-gray-500">Enable to prevent user login</p>
                    </div>
                    <button className="px-4 py-2 bg-gray-200 rounded-lg">Disabled</button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium">Registration</h3>
                      <p className="text-sm text-gray-500">Allow new user registrations</p>
                    </div>
                    <button className="px-4 py-2 bg-green-100 text-green-800 rounded-lg">Enabled</button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium">Google Auth</h3>
                      <p className="text-sm text-gray-500">Allow Google OAuth login</p>
                    </div>
                    <button className="px-4 py-2 bg-green-100 text-green-800 rounded-lg">Enabled</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/dashboard" className="bg-white rounded-lg shadow p-4 text-center hover:shadow-md transition">
            <span className="text-2xl">🏠</span>
            <p className="mt-2 text-sm font-medium">Main Dashboard</p>
          </Link>
          <Link to="/placements/active" className="bg-white rounded-lg shadow p-4 text-center hover:shadow-md transition">
            <span className="text-2xl">💼</span>
            <p className="mt-2 text-sm font-medium">All Placements</p>
          </Link>
          <Link to="/analytics" className="bg-white rounded-lg shadow p-4 text-center hover:shadow-md transition">
            <span className="text-2xl">📊</span>
            <p className="mt-2 text-sm font-medium">Analytics</p>
          </Link>
          <Link to="/api-docs" className="bg-white rounded-lg shadow p-4 text-center hover:shadow-md transition">
            <span className="text-2xl">📚</span>
            <p className="mt-2 text-sm font-medium">API Docs</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;