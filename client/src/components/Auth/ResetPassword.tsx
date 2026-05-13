import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/FirebaseAuthContext';
import { Card } from '../ui/Card';

const ResetPassword: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const { resetPassword, isLoading } = useAuth();
  const navigate = useNavigate();

  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!password || !confirmPassword) {
      setError('Please enter both password fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!token) {
      setError('Invalid reset link');
      return;
    }

    try {
      await resetPassword(token, password);
      setSuccess(true);
      setPassword('');
      setConfirmPassword('');
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to reset password. Please try again.';
      setError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Career Intelligence Portal
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">Create new password</h1>
          <p className="mt-1 text-sm text-slate-600">
            Enter your new password below to reset your account.
          </p>
        </div>

        <Card padding="lg">
          {success ? (
            <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
              <div className="font-medium">Password reset successful!</div>
              <p className="mt-2">
                Your password has been updated. You can now login with your new password.
              </p>
              <p className="mt-2 text-xs">Redirecting to login...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div
                  className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
                  role="alert"
                >
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                  New password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 pr-10 text-sm text-slate-900 shadow-sm outline-none ring-slate-900/5 transition focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
                  Confirm password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 pr-10 text-sm text-slate-900 shadow-sm outline-none ring-slate-900/5 transition focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isLoading ? 'Resetting...' : 'Reset password'}
              </button>

              <div className="text-center text-sm">
                <p className="text-slate-600">
                  <Link to="/login" className="font-medium text-slate-900 hover:underline">
                    Back to login
                  </Link>
                </p>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
