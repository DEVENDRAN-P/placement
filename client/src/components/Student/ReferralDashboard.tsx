import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { referralAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ReferralDashboard: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [status, setStatus] = useState<any>(null);
  const [applyingCode, setApplyingCode] = useState<boolean>(false);
  const [referralInput, setReferralInput] = useState<string>('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setLoading(true);
        const res = await referralAPI.getStatus() as any;
        if (res?.success) {
          setStatus(res.data);
        }
      } catch (err) {
        console.warn('Failed to fetch referral status');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user?.role === 'student') {
      fetchStatus();
    }
  }, [isAuthenticated, user]);

  const handleGenerateCode = async () => {
    try {
      const res = await referralAPI.generateCode() as any;
      if (res?.success && res?.data) {
        setStatus((prev: any) => ({
          ...prev,
          referralCode: res.data.referralCode,
        }));
        setMessage({ type: 'success', text: 'Referral code generated!' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to generate code' });
    }
  };

  const handleApplyCode = async () => {
    if (!referralInput.trim()) {
      setMessage({ type: 'error', text: 'Please enter a referral code' });
      return;
    }

    try {
      setApplyingCode(true);
      const res = await referralAPI.applyCode(referralInput) as any;
      if (res?.success) {
        setMessage({ type: 'success', text: `Applied! Referred by ${res.data.referredBy}` });
        // Refresh status
        const statusRes = await referralAPI.getStatus() as any;
        if (statusRes?.success) {
          setStatus(statusRes.data);
        }
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Invalid referral code' });
    } finally {
      setApplyingCode(false);
    }
  };

  const handleCopyCode = () => {
    if (status?.referralCode) {
      navigator.clipboard.writeText(status.referralCode);
      setMessage({ type: 'success', text: 'Code copied!' });
    }
  };

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'student') return <div className="p-4 text-red-600">Access denied</div>;

  const rewards = [
    { tier: 'Bronze', referrals: 5, reward: 'Resume Review', color: 'bg-orange-100 text-orange-800' },
    { tier: 'Silver', referrals: 10, reward: 'Mock Interview', color: 'bg-gray-200 text-gray-800' },
    { tier: 'Gold', referrals: 25, reward: 'Career Coaching', color: 'bg-yellow-100 text-yellow-800' },
    { tier: 'Platinum', referrals: 50, reward: 'Job Guarantee', color: 'bg-purple-100 text-purple-800' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🎁 Referral Program</h1>
          <p className="mt-2 text-gray-600">Invite friends and earn exciting rewards</p>
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
          </div>
        )}

        {message && (
          <div className={`mb-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {message.text}
          </div>
        )}

        {/* Your Referral Code */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Referral Code</h2>
          {status?.referralCode ? (
            <div className="flex items-center space-x-4">
              <div className="flex-1 p-4 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg">
                <p className="text-2xl font-bold text-white text-center tracking-wider">{status.referralCode}</p>
              </div>
              <button
                onClick={handleCopyCode}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Copy
              </button>
            </div>
          ) : (
            <button
              onClick={handleGenerateCode}
              className="w-full py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition"
            >
              Generate Your Code
            </button>
          )}
          <p className="mt-3 text-sm text-gray-500">
            Share this code with friends. When they register with your code, both of you earn rewards!
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <p className="text-3xl font-bold text-pink-600">{status?.referralCount || 0}</p>
            <p className="text-gray-600">Total Referrals</p>
          </div>
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <p className="text-3xl font-bold text-purple-600">{status?.referralRewards || 0}</p>
            <p className="text-gray-600">Rewards Earned</p>
          </div>
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <p className="text-3xl font-bold text-blue-600">{status?.referrals?.length || 0}</p>
            <p className="text-gray-600">Active Referrals</p>
          </div>
        </div>

        {/* Apply Referral Code */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Have a Referral Code?</h2>
          <div className="flex space-x-4">
            <input
              type="text"
              value={referralInput}
              onChange={(e) => setReferralInput(e.target.value.toUpperCase())}
              placeholder="Enter referral code"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
            />
            <button
              onClick={handleApplyCode}
              disabled={applyingCode}
              className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50"
            >
              {applyingCode ? 'Applying...' : 'Apply'}
            </button>
          </div>
          {status?.referredBy && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <p className="text-green-800">✓ You were referred by: {status.referredBy.name} ({status.referredBy.email})</p>
            </div>
          )}
        </div>

        {/* Rewards Tiers */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🎯 Rewards Tiers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rewards.map((tier, idx) => (
              <div key={idx} className={`p-4 rounded-lg border-2 ${tier.color} ${(status?.referralCount || 0) >= tier.referrals ? 'border-opacity-100' : 'border-opacity-50'}`}>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{tier.tier}</h3>
                    <p className="text-sm">{tier.referrals} referrals needed</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{tier.reward}</p>
                    {(status?.referralCount || 0) >= tier.referrals && (
                      <span className="text-xs bg-white px-2 py-1 rounded">Unlocked! 🎉</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Your Referrals */}
        {status?.referrals && status.referrals.length > 0 && (
          <div className="bg-white shadow rounded-lg p-6 mt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Referrals</h2>
            <div className="space-y-3">
              {status.referrals.map((ref: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{ref.name}</p>
                    <p className="text-sm text-gray-500">{ref.email}</p>
                  </div>
                  <p className="text-sm text-gray-500">{new Date(ref.date).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReferralDashboard;