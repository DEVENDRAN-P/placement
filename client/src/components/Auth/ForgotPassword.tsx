import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/FirebaseAuthContext';
import { Card } from '../ui/Card';

const ForgotPassword: React.FC = () => {
  const { forgotPassword, isLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    try {
      await forgotPassword(email);
      setSuccess(true);
      setEmail('');
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to send reset email. Please try again.';
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
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">Reset password</h1>
          <p className="mt-1 text-sm text-slate-600">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        <Card padding="lg">
          {success ? (
            <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
              <div className="font-medium">Email sent successfully!</div>
              <p className="mt-2">
                Check your email for a link to reset your password. The link will expire in 1 hour.
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
                <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-slate-900/5 transition focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10"
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isLoading ? 'Sending...' : 'Send reset link'}
              </button>

              <div className="text-center text-sm">
                <p className="text-slate-600">
                  Remember your password?{' '}
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

export default ForgotPassword;
