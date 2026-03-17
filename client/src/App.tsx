import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/FirebaseAuthContext';

// Components
import Dashboard from './components/Dashboard/Dashboard';
import StudentDashboard from './components/Student/StudentDashboard';
import CollegeDashboard from './components/College/CollegeDashboard';
import RecruiterDashboard from './components/Recruiter/RecruiterDashboard';
import Layout from './components/Layout/Layout';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import StudentProfile from './components/Student/StudentProfile';
import EnhancedStudentProfile from './components/Student/EnhancedStudentProfile';
import AIShortlisting from './components/Recruiter/AIShortlisting';
import CollegeVerification from './components/College/CollegeVerification';
import PlacementAnalytics from './components/College/PlacementAnalytics';
import PublicRecruiterProfile from './components/Recruiter/PublicRecruiterProfile';
import CodingGrowthTracker from './components/Student/CodingGrowthTracker';
import CareerPrediction from './components/Student/CareerPrediction';

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  console.log('🔐 ProtectedRoute Check:', {
    requiredRole,
    isLoading,
    isAuthenticated,
    userRole: user?.role,
    hasUser: !!user
  });

  // Show loading while auth is initializing
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
          <p className="text-gray-600 font-medium">Initializing...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log('❌ Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Check role permission
  if (requiredRole && user?.role !== requiredRole) {
    console.log('❌ Role mismatch - required:', requiredRole, 'but user has:', user?.role);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 font-medium mb-2">Access Denied</p>
          <p className="text-gray-600 text-sm">Your account role ({user?.role}) doesn't have access to this page.</p>
          <p className="text-gray-600 text-sm">Required role: {requiredRole}</p>
        </div>
      </div>
    );
  }

  console.log('✅ Access granted to protected route for role:', user?.role);
  return <>{children}</>;
};

function AppContent() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public Auth Routes */}
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" replace />} />

        {/* Protected Routes with Layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />

          {/* Public Routes */}
          <Route path="dashboard" element={<Dashboard />} />

          {/* Student Routes */}
          <Route
            path="student"
            element={
              <ProtectedRoute requiredRole="student">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="student/profile"
            element={
              <ProtectedRoute requiredRole="student">
                <StudentProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="student/profile-builder"
            element={
              <ProtectedRoute requiredRole="student">
                <EnhancedStudentProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="student/coding-growth"
            element={
              <ProtectedRoute requiredRole="student">
                <CodingGrowthTracker />
              </ProtectedRoute>
            }
          />
          <Route
            path="student/career-prediction"
            element={
              <ProtectedRoute requiredRole="student">
                <CareerPrediction />
              </ProtectedRoute>
            }
          />

          {/* College Routes */}
          <Route
            path="college"
            element={
              <ProtectedRoute requiredRole="college">
                <CollegeDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="college/verify-students"
            element={
              <ProtectedRoute requiredRole="college">
                <CollegeVerification />
              </ProtectedRoute>
            }
          />
          <Route
            path="college/placement-analytics"
            element={
              <ProtectedRoute requiredRole="college">
                <PlacementAnalytics />
              </ProtectedRoute>
            }
          />

          {/* Recruiter Routes */}
          <Route
            path="recruiter"
            element={
              <ProtectedRoute requiredRole="recruiter">
                <RecruiterDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="recruiter/ai-shortlisting"
            element={
              <ProtectedRoute requiredRole="recruiter">
                <AIShortlisting />
              </ProtectedRoute>
            }
          />
          <Route
            path="recruiter/public-profiles"
            element={
              <ProtectedRoute requiredRole="recruiter">
                <PublicRecruiterProfile />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
