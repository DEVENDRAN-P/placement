import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { codingPlatformsAPI } from '../../services/api';
import { useAuth } from '../../context/FirebaseAuthContext';

interface CodingProfile {
  leetcode?: { username: string; totalSolved: number; rating: number };
  codechef?: { username: string; totalSolved: number; rating: number };
  codeforces?: { username: string; totalSolved: number; rating: number };
}

const CodingProfilesLinker: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [profiles, setProfiles] = useState<CodingProfile>({});
  const [loading, setLoading] = useState(false);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [leetcodeUsername, setLeetcodeUsername] = useState('');
  const [codechefUsername, setCodechefUsername] = useState('');
  const [codeforcesUsername, setCodeforcesUsername] = useState('');

  // Fetch saved profiles
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setLoadingProfiles(true);
        const response: any = await codingPlatformsAPI.getMyProfiles();
        if (response?.success && response?.data?.profiles) {
          setProfiles(response.data.profiles);
          if (response.data.profiles.leetcode?.username) {
            setLeetcodeUsername(response.data.profiles.leetcode.username);
          }
          if (response.data.profiles.codechef?.username) {
            setCodechefUsername(response.data.profiles.codechef.username);
          }
          if (response.data.profiles.codeforces?.username) {
            setCodeforcesUsername(response.data.profiles.codeforces.username);
          }
        }
      } catch (err) {
        console.warn('Failed to load coding profiles');
      } finally {
        setLoadingProfiles(false);
      }
    };

    if (isAuthenticated && user?.role === 'student') {
      fetchProfiles();
    }
  }, [isAuthenticated, user]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'student') {
    return <div className="text-red-600 p-4">This page is only available for students</div>;
  }

  const handleFetchStats = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const response: any = await codingPlatformsAPI.fetchAllStats({
        leetcodeUsername: leetcodeUsername || undefined,
        codechefUsername: codechefUsername || undefined,
        codeforcesUsername: codeforcesUsername || undefined,
      });

      if (response?.success) {
        setProfiles(response.data.studentProfile);
        setSuccess('Coding profiles linked successfully! Your stats have been fetched.');
        
        // Clear form after success
        setTimeout(() => {
          setLeetcodeUsername('');
          setCodechefUsername('');
          setCodeforcesUsername('');
        }, 2000);
      } else {
        setError(response?.message || 'Failed to fetch coding stats');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to link coding profiles');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-slate-900">Link Coding Profiles</h1>
          <p className="mt-3 text-lg text-slate-600">
            Connect your LeetCode, CodeChef, and Codeforces accounts to showcase your coding skills
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
            <span className="text-xl">❌</span>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-3">
            <span className="text-xl">✅</span>
            <p className="text-green-700 text-sm">{success}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* Input Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Enter Your Usernames</h2>

              <div className="space-y-6">
                {/* LeetCode */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">LeetCode Username</label>
                  <input
                    type="text"
                    value={leetcodeUsername}
                    onChange={(e) => setLeetcodeUsername(e.target.value)}
                    placeholder="Enter your LeetCode username"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                  />
                  <p className="mt-2 text-xs text-slate-600">
                    Your public LeetCode username (visible on leetcode.com/u/username)
                  </p>
                </div>

                {/* CodeChef */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">CodeChef Username</label>
                  <input
                    type="text"
                    value={codechefUsername}
                    onChange={(e) => setCodechefUsername(e.target.value)}
                    placeholder="Enter your CodeChef username"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                  />
                  <p className="mt-2 text-xs text-slate-600">
                    Your public CodeChef username (visible on codechef.com/users/username)
                  </p>
                </div>

                {/* Codeforces */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Codeforces Username</label>
                  <input
                    type="text"
                    value={codeforcesUsername}
                    onChange={(e) => setCodeforcesUsername(e.target.value)}
                    placeholder="Enter your Codeforces username"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                  />
                  <p className="mt-2 text-xs text-slate-600">
                    Your public Codeforces username (visible on codeforces.com/profile/username)
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleFetchStats}
                  disabled={loading || (!leetcodeUsername && !codechefUsername && !codeforcesUsername)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Fetching your stats...
                    </>
                  ) : (
                    'Link & Fetch Stats'
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Stats Display */}
          <div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Your Stats</h2>

              {loadingProfiles ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="text-slate-600 mt-2 text-sm">Loading profiles...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* LeetCode Stats */}
                  {profiles.leetcode ? (
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                      <h3 className="font-semibold text-slate-900 mb-2">LeetCode</h3>
                      <div className="space-y-1 text-sm text-slate-700">
                        <p>Username: <span className="font-medium">{profiles.leetcode.username}</span></p>
                        <p>Solved: <span className="font-medium text-blue-600">{profiles.leetcode.totalSolved}</span></p>
                        <p>Rating: <span className="font-medium text-blue-600">{profiles.leetcode.rating || 'N/A'}</span></p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center">
                      <p className="text-sm text-slate-600">No LeetCode profile linked</p>
                    </div>
                  )}

                  {/* CodeChef Stats */}
                  {profiles.codechef ? (
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                      <h3 className="font-semibold text-slate-900 mb-2">CodeChef</h3>
                      <div className="space-y-1 text-sm text-slate-700">
                        <p>Username: <span className="font-medium">{profiles.codechef.username}</span></p>
                        <p>Solved: <span className="font-medium text-green-600">{profiles.codechef.totalSolved}</span></p>
                        <p>Rating: <span className="font-medium text-green-600">{profiles.codechef.rating || 'N/A'}</span></p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center">
                      <p className="text-sm text-slate-600">No CodeChef profile linked</p>
                    </div>
                  )}

                  {/* Codeforces Stats */}
                  {profiles.codeforces ? (
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                      <h3 className="font-semibold text-slate-900 mb-2">Codeforces</h3>
                      <div className="space-y-1 text-sm text-slate-700">
                        <p>Username: <span className="font-medium">{profiles.codeforces.username}</span></p>
                        <p>Solved: <span className="font-medium text-purple-600">{profiles.codeforces.totalSolved}</span></p>
                        <p>Rating: <span className="font-medium text-purple-600">{profiles.codeforces.rating || 'N/A'}</span></p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center">
                      <p className="text-sm text-slate-600">No Codeforces profile linked</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Information Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Why Link Your Coding Profiles?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Showcase Skills</h3>
                <p className="text-sm text-slate-600">Display your coding prowess to recruiters and stand out from the competition</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Better Matches</h3>
                <p className="text-sm text-slate-600">Get job recommendations based on your coding performance and problem-solving skills</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Track Progress</h3>
                <p className="text-sm text-slate-600">Monitor your coding growth and improvement over time with detailed analytics</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodingProfilesLinker;
