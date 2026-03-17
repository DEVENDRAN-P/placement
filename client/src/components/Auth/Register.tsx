import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/FirebaseAuthContext';

type UserRole = 'student' | 'college' | 'recruiter';

const Register: React.FC = () => {
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const [error, setError] = useState<string>('');
  const [activeStep, setActiveStep] = useState<number>(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student' as UserRole,
    collegeCode: '',
    companyName: '',
    companyIndustry: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRoleSelect = (role: UserRole) => {
    setFormData(prev => ({
      ...prev,
      role,
    }));
    setActiveStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.firstName || !formData.lastName) {
      setError('Please enter your first and last name');
      return;
    }

    if (!formData.email) {
      setError('Please enter your email address');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.role === 'college' && !formData.collegeCode) {
      setError('Please enter your college code');
      return;
    }

    if (formData.role === 'recruiter' && !formData.companyName) {
      setError('Please enter your company name');
      return;
    }

    try {
      const roleValue = formData.role;
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: roleValue,
        collegeCode: formData.role === 'college' ? formData.collegeCode : undefined,
        companyDetails: formData.role === 'recruiter' ? {
          name: formData.companyName,
          industry: formData.companyIndustry,
        } : undefined,
      });

      // Show success message briefly before navigating
      console.log('✅ Account created successfully! Redirecting...');

      // Wait for auth state to update and then navigate to role-specific dashboard
      setTimeout(() => {
        const dashboardRoutes: { [key: string]: string } = {
          student: '/student',
          college: '/college',
          recruiter: '/recruiter',
        };
        const destination = dashboardRoutes[roleValue] || '/dashboard';
        console.log('🔄 Navigating to:', destination);
        navigate(destination);
      }, 1000);
    } catch (err: any) {
      const errorMessage = err.message || 'Registration failed. Please try again.';
      console.error('❌ Registration error:', errorMessage);
      setError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-700 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 text-white">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
              <span className="text-xl font-bold text-blue-600">CP</span>
            </div>
            <h1 className="text-3xl font-bold">Career Portal</h1>
          </div>
          <p className="text-lg text-blue-100">Join our community and unlock your career potential</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Left side - Benefits */}
            <div className="hidden md:flex md:flex-col md:justify-between md:p-12 bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
              <div>
                <h2 className="text-3xl font-bold mb-6">Why Join Us?</h2>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">AI-Powered Matching</h3>
                      <p className="text-blue-100">Smart algorithms connect you with perfect opportunities</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Verified Profiles</h3>
                      <p className="text-blue-100">Build trust with verified credentials and achievements</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Real Analytics</h3>
                      <p className="text-blue-100">Data-driven insights to track your progress</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Form */}
            <div className="p-8 md:p-12">
              {activeStep === 1 ? (
                // Step 1: Role Selection
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h2>
                  <p className="text-gray-600 mb-8">Choose your role to get started</p>

                  <div className="space-y-4">
                    <button
                      type="button"
                      onClick={() => handleRoleSelect('student')}
                      className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition text-left group"
                    >
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">I'm a Student</h3>
                      <p className="text-sm text-gray-600">Build your career profile and find placements</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRoleSelect('college')}
                      className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition text-left group"
                    >
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">I'm from a College</h3>
                      <p className="text-sm text-gray-600">Manage placements and student profiles</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRoleSelect('recruiter')}
                      className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition text-left group"
                    >
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">I'm a Recruiter</h3>
                      <p className="text-sm text-gray-600">Shortlist talent and manage hiring</p>
                    </button>
                  </div>
                </div>
              ) : (
                // Step 2: Registration Form
                <div>
                  <button
                    type="button"
                    onClick={() => setActiveStep(1)}
                    className="mb-6 text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Back
                  </button>

                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {formData.role === 'student' && 'Student Registration'}
                    {formData.role === 'college' && 'College Registration'}
                    {formData.role === 'recruiter' && 'Recruiter Registration'}
                  </h2>
                  <p className="text-gray-600 mb-6">Fill in your details to create an account</p>

                  {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          placeholder="John"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          placeholder="Doe"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="you@example.com"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="••••••••"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                        >
                          {showPassword ? 'Hide' : 'Show'}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="••••••••"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {formData.role === 'college' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">College Code</label>
                        <input
                          type="text"
                          name="collegeCode"
                          value={formData.collegeCode}
                          onChange={handleInputChange}
                          placeholder="e.g., MIT001"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}

                    {formData.role === 'recruiter' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                          <input
                            type="text"
                            name="companyName"
                            value={formData.companyName}
                            onChange={handleInputChange}
                            placeholder="Your Company"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label htmlFor="industrySelect" className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                          <select
                            id="industrySelect"
                            name="companyIndustry"
                            value={formData.companyIndustry}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select Industry</option>
                            <option value="IT Services">IT Services</option>
                            <option value="Product">Product</option>
                            <option value="Consulting">Consulting</option>
                            <option value="Finance">Finance</option>
                            <option value="Manufacturing">Manufacturing</option>
                          </select>
                        </div>
                      </>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50 mt-6"
                    >
                      {isLoading ? 'Creating Account...' : 'Create Account'}
                    </button>
                  </form>

                  <p className="text-center text-gray-600 mt-6">
                    Already have an account?{' '}
                    <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                      Sign in
                    </Link>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
