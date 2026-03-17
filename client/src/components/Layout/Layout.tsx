import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/FirebaseAuthContext';

const Layout: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  console.log('📍 Layout Component - Auth State:', {
    isAuthenticated,
    userRole: user?.role,
    firstName: user?.profile.firstName
  });

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Only show role-specific nav links if authenticated
  const navLinks = isAuthenticated && user?.role
    ? [
        { label: 'Dashboard', href: '/dashboard' },
        ...(user.role === 'student' ? [
          { label: 'Student Dashboard', href: '/student' },
          { label: 'Profile', href: '/student/profile' },
        ] : []),
        ...(user.role === 'college' ? [
          { label: 'College Dashboard', href: '/college' },
        ] : []),
        ...(user.role === 'recruiter' ? [
          { label: 'Recruiter Dashboard', href: '/recruiter' },
          { label: 'AI Shortlist', href: '/recruiter/ai-shortlisting' },
        ] : []),
      ]
    : [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Login', href: '/login' },
        { label: 'Register', href: '/register' },
      ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center space-x-2 flex-shrink-0">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CP</span>
              </div>
              <span className="text-lg font-bold text-gray-900 hidden sm:inline">Career Portal</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* User Section */}
            <div className="flex items-center space-x-4">
              {isAuthenticated && (
                <>
                  <div className="hidden sm:flex items-center space-x-2">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.profile.firstName} {user?.profile.lastName}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition hidden sm:inline-block"
                  >
                    Logout
                  </button>
                </>
              )}

              {!isAuthenticated && (
                <div className="hidden sm:flex items-center space-x-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition"
                  >
                    Register
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                {mobileMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-200">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  >
                    {link.label}
                  </Link>
                ))}
                {isAuthenticated && (
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                  >
                    Logout ({user?.profile.firstName})
                  </button>
                )}
                {!isAuthenticated && (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-100"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-md text-base font-medium text-blue-600 hover:bg-blue-50"
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full py-6 px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-semibold mb-4">Career Portal</h3>
              <p className="text-sm">AI-Powered Career Intelligence & Placement Portal</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Students</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/student" className="hover:text-white">Dashboard</Link></li>
                <li><Link to="/student/profile" className="hover:text-white">Profile</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Recruiters</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/recruiter" className="hover:text-white">Dashboard</Link></li>
                <li><Link to="/recruiter/ai-shortlisting" className="hover:text-white">AI Shortlisting</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="mailto:support@careerportal.com" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">FAQ</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2024 Career Intelligence Portal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
