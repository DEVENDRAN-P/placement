import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Award, Zap, Target } from 'lucide-react';

interface CodingStats {
  platform: string;
  icon: string;
  problemsSolved: number;
  rating: number;
  contests: number;
  ratingTrend: 'up' | 'down' | 'stable';
}

const CodingGrowthTracker: React.FC = () => {
  const [stats] = useState<CodingStats[]>([
    { platform: 'LeetCode', icon: '⚙️', problemsSolved: 312, rating: 1847, contests: 12, ratingTrend: 'up' },
    { platform: 'CodeChef', icon: '🍳', problemsSolved: 245, rating: 1650, contests: 8, ratingTrend: 'up' },
    { platform: 'Codeforces', icon: '🔢', problemsSolved: 178, rating: 1450, contests: 5, ratingTrend: 'stable' }
  ]);

  const growthData = [
    { month: 'Jan', solved: 25, rating: 1200, contests: 1 },
    { month: 'Feb', solved: 48, rating: 1350, contests: 2 },
    { month: 'Mar', solved: 72, rating: 1500, contests: 3 },
    { month: 'Apr', solved: 105, rating: 1620, contests: 4 },
    { month: 'May', solved: 145, rating: 1750, contests: 5 },
    { month: 'Jun', solved: 189, rating: 1820, contests: 7 },
    { month: 'Jul', solved: 235, rating: 1847, contests: 12 }
  ];

  const difficultyData = [
    { difficulty: 'Easy', count: 120, percentage: 38 },
    { difficulty: 'Medium', count: 150, percentage: 48 },
    { difficulty: 'Hard', count: 42, percentage: 14 }
  ];

  const totalProblems = stats.reduce((sum, s) => sum + s.problemsSolved, 0);
  const avgRating = (stats.reduce((sum, s) => sum + s.rating, 0) / stats.length).toFixed(0);
  const totalContests = stats.reduce((sum, s) => sum + s.contests, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Coding Growth Tracker</h1>
          <p className="text-gray-600">Monitor your problem-solving progress across platforms</p>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Total Problems Solved</h3>
              <Zap className="text-blue-500" size={24} />
            </div>
            <p className="text-3xl font-bold text-gray-900">{totalProblems}</p>
            <p className="text-sm text-green-600 font-semibold mt-2">+45 this month</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Average Rating</h3>
              <Award className="text-purple-500" size={24} />
            </div>
            <p className="text-3xl font-bold text-gray-900">{avgRating}</p>
            <p className="text-sm text-green-600 font-semibold mt-2">+120 this month</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Contests Participated</h3>
              <Target className="text-green-500" size={24} />
            </div>
            <p className="text-3xl font-bold text-gray-900">{totalContests}</p>
            <p className="text-sm text-blue-600 font-semibold mt-2">Consistent participation</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Current Streak</h3>
              <TrendingUp className="text-orange-500" size={24} />
            </div>
            <p className="text-3xl font-bold text-gray-900">24</p>
            <p className="text-sm text-green-600 font-semibold mt-2">Days of solving</p>
          </div>
        </div>

        {/* Platform Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {stats.map((platform) => (
            <div key={platform.platform} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">{platform.platform}</h3>
                <span className="text-3xl">{platform.icon}</span>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Problems Solved</p>
                  <p className="text-2xl font-bold text-gray-900">{platform.problemsSolved}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Current Rating</p>
                  <p className="text-2xl font-bold text-blue-600">{platform.rating}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Contests</p>
                  <p className="text-2xl font-bold text-purple-600">{platform.contests}</p>
                </div>
                <div className="pt-3 border-t">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
                    platform.ratingTrend === 'up'
                      ? 'bg-green-100 text-green-700'
                      : platform.ratingTrend === 'down'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {platform.ratingTrend === 'up' ? '📈' : platform.ratingTrend === 'down' ? '📉' : '➡️'} 
                    {platform.ratingTrend === 'up' ? 'Improving' : platform.ratingTrend === 'down' ? 'Declining' : 'Stable'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Growth Chart */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">6-Month Growth Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="solved" stroke="#3b82f6" strokeWidth={2} name="Problems Solved" />
              <Line type="monotone" dataKey="rating" stroke="#10b981" strokeWidth={2} name="Rating" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Difficulty Distribution */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Problem Difficulty Distribution</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={difficultyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="difficulty" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              {difficultyData.map((data) => (
                <div key={data.difficulty}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-900">{data.difficulty}</span>
                    <span className="text-sm font-semibold text-gray-600">{data.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        data.difficulty === 'Easy'
                          ? 'bg-green-500'
                          : data.difficulty === 'Medium'
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${data.percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{data.count} problems</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Personalized Recommendations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-3">Current Strengths 💪</h3>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>✅ Strong foundation in easy problems (120 solved)</li>
                <li>✅ Consistent participation in contests (12 contests)</li>
                <li>✅ Good rating improvement (+120 this month)</li>
              </ul>
            </div>

            <div className="border-l-4 border-orange-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-3">Areas to Focus 🎯</h3>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>⚠️ Hard problems need practice (only 42 solved)</li>
                <li>⚠️ Rating still below 1900 on LeetCode</li>
                <li>⚠️ System design concepts need attention</li>
              </ul>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-3">Next Steps 🚀</h3>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>1. Solve 50+ hard problems (currently 42)</li>
                <li>2. Reach rating 1900+ on LeetCode</li>
                <li>3. Learn dynamic programming deeply</li>
              </ul>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-3">Learning Path 📚</h3>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>📖 Complete advanced DP course</li>
                <li>📖 Practice graph problems</li>
                <li>📖 Study system design (LLD/HLD)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodingGrowthTracker;
