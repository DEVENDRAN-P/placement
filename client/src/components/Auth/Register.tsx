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
    leetcodeUsername: '',
    codechefUsername: '',
    codeforcesUsername: '',
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

    // Make coding profiles mandatory for students
    if (formData.role === 'student' && !formData.leetcodeUsername && !formData.codechefUsername && !formData.codeforcesUsername) {
      setError('Please enter at least one coding profile (LeetCode, CodeChef, or Codeforces)');
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
        codingProfiles: formData.role === 'student' ? {
          leetcode: formData.leetcodeUsername ? { username: formData.leetcodeUsername } : undefined,
          codechef: formData.codechefUsername ? { username: formData.codechefUsername } : undefined,
          codeforces: formData.codeforcesUsername ? { username: formData.codeforcesUsername } : undefined,
        } : undefined,
      });

      // Navigate immediately without delay
      const dashboardRoutes: { [key: string]: string } = {
        student: '/student',
        college: '/college',
        recruiter: '/recruiter',
      };
      const destination = dashboardRoutes[roleValue] || '/dashboard';
      navigate(destination);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setError(errorMessage);
    }
  };

  const inputCls =
    'w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-slate-900/5 transition focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10';

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-xl">
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Career Intelligence Portal
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">Create account</h1>
          <p className="mt-1 text-sm text-slate-600">
            Choose a role, then complete your profile. Firebase and the API stay in sync.
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          {activeStep === 1 ? (
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Select role</h2>
              <p className="mt-1 text-sm text-slate-600">One account type per email.</p>

              <div className="mt-6 space-y-3">
                <button
                  type="button"
                  onClick={() => handleRoleSelect('student')}
                  className="w-full rounded-lg border border-slate-200 bg-white p-4 text-left transition hover:border-slate-400 hover:bg-slate-50"
                >
                  <h3 className="font-medium text-slate-900">Student</h3>
                  <p className="mt-0.5 text-sm text-slate-600">Profile, applications, and readiness tools.</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSelect('college')}
                  className="w-full rounded-lg border border-slate-200 bg-white p-4 text-left transition hover:border-slate-400 hover:bg-slate-50"
                >
                  <h3 className="font-medium text-slate-900">College</h3>
                  <p className="mt-0.5 text-sm text-slate-600">Campus placement operations and analytics.</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSelect('recruiter')}
                  className="w-full rounded-lg border border-slate-200 bg-white p-4 text-left transition hover:border-slate-400 hover:bg-slate-50"
                >
                  <h3 className="font-medium text-slate-900">Recruiter</h3>
                  <p className="mt-0.5 text-sm text-slate-600">Post roles and review candidates.</p>
                </button>
              </div>
            </div>
          ) : (
            <div>
              <button
                type="button"
                onClick={() => setActiveStep(1)}
                className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900"
              >
                ← Back to roles
              </button>

              <h2 className="text-lg font-semibold text-slate-900">
                {formData.role === 'student' && 'Student details'}
                {formData.role === 'college' && 'College details'}
                {formData.role === 'recruiter' && 'Recruiter details'}
              </h2>
              <p className="mt-1 text-sm text-slate-600">Fields marked implicitly required must be completed.</p>

              {error && (
                <div
                  className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
                  role="alert"
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">First name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="Ada"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Last name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Lovelace"
                      className={inputCls}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="you@example.com"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      className={`${inputCls} pr-16`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Confirm password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className={inputCls}
                  />
                </div>

                {formData.role === 'student' && (
                  <>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">
                        LeetCode username <span className="font-normal text-slate-500">(optional)</span>
                      </label>
                      <input
                        type="text"
                        name="leetcodeUsername"
                        value={formData.leetcodeUsername}
                        onChange={handleInputChange}
                        placeholder="handle"
                        className={inputCls}
                      />
                      <p className="mt-1 text-xs text-slate-500">Linked profiles sync after onboarding.</p>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">
                        CodeChef username <span className="font-normal text-slate-500">(optional)</span>
                      </label>
                      <input
                        type="text"
                        name="codechefUsername"
                        value={formData.codechefUsername}
                        onChange={handleInputChange}
                        placeholder="handle"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">
                        Codeforces handle <span className="font-normal text-slate-500">(optional)</span>
                      </label>
                      <input
                        type="text"
                        name="codeforcesUsername"
                        value={formData.codeforcesUsername}
                        onChange={handleInputChange}
                        placeholder="handle"
                        className={inputCls}
                      />
                    </div>
                  </>
                )}

                {formData.role === 'college' && (
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">College code</label>
                    <input
                      type="text"
                      name="collegeCode"
                      value={formData.collegeCode}
                      onChange={handleInputChange}
                      placeholder="Institution code"
                      className={inputCls}
                    />
                  </div>
                )}

                {formData.role === 'recruiter' && (
                  <>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">Company name</label>
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        placeholder="Organization"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label htmlFor="industrySelect" className="mb-1 block text-sm font-medium text-slate-700">
                        Industry
                      </label>
                      <select
                        id="industrySelect"
                        name="companyIndustry"
                        value={formData.companyIndustry}
                        onChange={handleInputChange}
                        className={inputCls}
                      >
                        <option value="">Select industry</option>
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
                  className="mt-2 w-full rounded-md bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? 'Creating account…' : 'Create account'}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-600">
                Already registered?{' '}
                <Link to="/login" className="font-semibold text-slate-900 underline-offset-4 hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
