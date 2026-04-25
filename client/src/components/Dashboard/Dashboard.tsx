import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/FirebaseAuthContext';

const Dashboard: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  console.log('📊 Dashboard Component - User:', { isAuthenticated, role: user?.role });

  // If authenticated, redirect to role-specific dashboard
  if (isAuthenticated && user?.role) {
    const roleRoutes: { [key: string]: string } = {
      student: '/student',
      college: '/college',
      recruiter: '/recruiter',
    };
    const destination = roleRoutes[user.role];
    if (destination) {
      console.log('🔄 Redirecting to role-specific dashboard:', destination);
      return <Navigate to={destination} replace />;
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Welcome to Career Portal</h1>
      <p className="mt-2 text-gray-600">
        AI-Powered Career Intelligence & Placement Portal
      </p>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {!isAuthenticated && (
          <>
            <Link to="/login" className="bg-white shadow rounded-lg p-6 hover:shadow-md transition">
              <h2 className="text-lg font-medium text-gray-900">Login</h2>
              <p className="mt-2 text-gray-600">
                Sign in as student, college, or recruiter
              </p>
            </Link>
            <Link to="/register" className="bg-white shadow rounded-lg p-6 hover:shadow-md transition">
              <h2 className="text-lg font-medium text-gray-900">Sign Up</h2>
              <p className="mt-2 text-gray-600">
                Create a new account for placement
              </p>
            </Link>
          </>
        )}

        {isAuthenticated && user?.role === 'student' && (
          <>
            <Link to="/student" className="bg-white shadow rounded-lg p-6 hover:shadow-md transition">
              <h2 className="text-lg font-medium text-gray-900">Student Dashboard</h2>
              <p className="mt-2 text-gray-600">
                View your placement readiness, coding performance, and AI insights.
              </p>
            </Link>
            <Link to="/student/profile" className="bg-white shadow rounded-lg p-6 hover:shadow-md transition">
              <h2 className="text-lg font-medium text-gray-900">Student Profile Builder</h2>
              <p className="mt-2 text-gray-600">
                Build a verified career profile with skills, projects, and resume.
              </p>
            </Link>
          </>
        )}

        {isAuthenticated && user?.role === 'college' && (
          <Link to="/college" className="bg-white shadow rounded-lg p-6 hover:shadow-md transition">
            <h2 className="text-lg font-medium text-gray-900">Placement Analytics</h2>
            <p className="mt-2 text-gray-600">
              Analyze placement rate, department performance, and hiring trends.
            </p>
          </Link>
        )}

        {isAuthenticated && user?.role === 'recruiter' && (
          <>
            <Link to="/recruiter" className="bg-white shadow rounded-lg p-6 hover:shadow-md transition">
              <h2 className="text-lg font-medium text-gray-900">Recruiter Dashboard</h2>
              <p className="mt-2 text-gray-600">
                Track job postings, applications, and hiring funnel analytics.
              </p>
            </Link>
            <Link to="/recruiter/ai-shortlisting" className="bg-white shadow rounded-lg p-6 hover:shadow-md transition">
              <h2 className="text-lg font-medium text-gray-900">AI Shortlisting</h2>
              <p className="mt-2 text-gray-600">
                Enter job requirements and let AI shortlist the best candidates.
              </p>
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;