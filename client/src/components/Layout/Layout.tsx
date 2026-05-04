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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link to="/dashboard" className="flex items-center space-x-3 hover:opacity-80 transition">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-lg">CP</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Career Portal</h1>
                <p className="text-xs text-slate-500">AI-Powered Placement Platform</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="px-4 py-2 text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition font-medium text-sm"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {isAuthenticated && user ? (
                <div className="flex items-center space-x-4 border-l border-slate-200 pl-4">
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-semibold text-slate-900">{user?.profile?.firstName || 'User'}</p>
                    <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-semibold text-sm transition"
                  >
                    Logout
                  </button>
                </div>
              ) : null}
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden mt-4 space-y-2 border-t border-slate-200 pt-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="block px-4 py-2 text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-slate-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4">Career Portal</h3>
              <p className="text-slate-600 text-sm">Connecting talent with opportunities through AI-powered intelligence.</p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><Link to="/recruiter" className="hover:text-blue-600 transition">For Recruiters</Link></li>
                <li><Link to="/student/coding-profiles" className="hover:text-blue-600 transition">Coding Profiles</Link></li>
                <li><Link to="/faq" className="hover:text-blue-600 transition">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><Link to="/contact" className="hover:text-blue-600 transition">Contact Us</Link></li>
                <li><Link to="/faq" className="hover:text-blue-600 transition">Help & Support</Link></li>
                <li><Link to="/" className="hover:text-blue-600 transition">Status</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><Link to="/" className="hover:text-blue-600 transition">Privacy Policy</Link></li>
                <li><Link to="/" className="hover:text-blue-600 transition">Terms of Service</Link></li>
                <li><Link to="/contact" className="hover:text-blue-600 transition">Support</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-200 mt-8 pt-8 text-center text-slate-600 text-sm">
            <p>© 2024 Career Intelligence Portal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
