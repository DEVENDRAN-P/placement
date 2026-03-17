import React, { useState } from 'react';
import { TrendingUp, Users, DollarSign, Target, BarChart3, Zap } from 'lucide-react';

interface PlacementStat {
  department: string;
  placementRate: number;
  averageCGPA: number;
  averagePackage: number;
  highestPackage: number;
  studentsPlaced: number;
  totalStudents: number;
}

const PlacementAnalytics: React.FC = () => {
  const [stats] = useState<PlacementStat[]>([
    {
      department: 'Computer Science',
      placementRate: 95,
      averageCGPA: 8.2,
      averagePackage: 12.5,
      highestPackage: 35,
      studentsPlaced: 95,
      totalStudents: 100
    },
    {
      department: 'Information Technology',
      placementRate: 92,
      averageCGPA: 7.8,
      averagePackage: 11.2,
      highestPackage: 28,
      studentsPlaced: 92,
      totalStudents: 100
    },
    {
      department: 'Electronics',
      placementRate: 78,
      averageCGPA: 7.2,
      averagePackage: 9.5,
      highestPackage: 22,
      studentsPlaced: 78,
      totalStudents: 100
    }
  ]);

  const [selectedDept, setSelectedDept] = useState(stats[0]);

  const overallStats = {
    totalStudents: stats.reduce((sum, s) => sum + s.totalStudents, 0),
    placedStudents: stats.reduce((sum, s) => sum + s.studentsPlaced, 0),
    avgPackage: (stats.reduce((sum, s) => sum + s.averagePackage, 0) / stats.length).toFixed(2),
    highestPackage: Math.max(...stats.map(s => s.highestPackage))
  };

  const placementRate = ((overallStats.placedStudents / overallStats.totalStudents) * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Placement Analytics</h1>
          <p className="text-gray-600">Comprehensive insights on student placements and market trends</p>
        </div>

        {/* Overall Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Overall Placement Rate</h3>
              <TrendingUp className="text-blue-500" size={24} />
            </div>
            <p className="text-3xl font-bold text-gray-900">{placementRate}%</p>
            <p className="text-sm text-gray-600 mt-2">{overallStats.placedStudents} of {overallStats.totalStudents} students</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Average Package</h3>
              <DollarSign className="text-green-500" size={24} />
            </div>
            <p className="text-3xl font-bold text-gray-900">₹{overallStats.avgPackage}L</p>
            <p className="text-sm text-gray-600 mt-2">Across all departments</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Highest Package</h3>
              <Target className="text-purple-500" size={24} />
            </div>
            <p className="text-3xl font-bold text-gray-900">₹{overallStats.highestPackage}L</p>
            <p className="text-sm text-gray-600 mt-2">Maximum offered</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Total Students</h3>
              <Users className="text-orange-500" size={24} />
            </div>
            <p className="text-3xl font-bold text-gray-900">{overallStats.totalStudents}</p>
            <p className="text-sm text-gray-600 mt-2">Across {stats.length} departments</p>
          </div>
        </div>

        {/* Department-wise Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* Department List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Departments</h2>
              <div className="space-y-2">
                {stats.map((dept) => (
                  <button
                    key={dept.department}
                    onClick={() => setSelectedDept(dept)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition ${
                      selectedDept.department === dept.department
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="font-semibold text-gray-900">{dept.department}</div>
                    <div className="text-sm text-gray-600">{dept.placementRate}% placement</div>
                    <div className="text-sm text-green-600 font-medium">₹{dept.averagePackage}L avg</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Department Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{selectedDept.department}</h2>
              
              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Placement Rate</p>
                  <p className="text-3xl font-bold text-blue-600">{selectedDept.placementRate}%</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Average CGPA</p>
                  <p className="text-3xl font-bold text-green-600">{selectedDept.averageCGPA}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Avg Package</p>
                  <p className="text-3xl font-bold text-purple-600">₹{selectedDept.averagePackage}L</p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Highest Package</p>
                  <p className="text-3xl font-bold text-orange-600">₹{selectedDept.highestPackage}L</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-900 mb-3">Placement Progress</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Students Placed</span>
                    <span className="font-semibold text-gray-900">{selectedDept.studentsPlaced}/{selectedDept.totalStudents}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full"
                      style={{ width: `${selectedDept.placementRate}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Insights and Recommendations */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center gap-3 mb-6">
            <Zap className="text-yellow-500" size={28} />
            <h2 className="text-2xl font-bold text-gray-900">Key Insights</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-2">🎯 Focus Areas</h3>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>• Increase placement rate in Electronics dept (currently 78%)</li>
                <li>• Focus on internship programs for improved CGPA correlation</li>
                <li>• Encourage more coding practice for higher packages</li>
              </ul>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-2">✨ Strengths</h3>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>• CS department achieves 95% placement rate</li>
                <li>• Average package of ₹12.5L is competitive</li>
                <li>• Strong hiring from top IT companies</li>
              </ul>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-2">📊 Trends</h3>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>• Rising demand for AI/ML developers</li>
                <li>• Cloud technologies (AWS, Azure) trending up</li>
                <li>• Companies preferring higher CGPA thresholds (7.5+)</li>
              </ul>
            </div>

            <div className="border-l-4 border-orange-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-2">💡 Recommendations</h3>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>• Conduct skill gap workshops early in the year</li>
                <li>• Arrange guest lectures from industry experts</li>
                <li>• Encourage participation in competitive coding</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Year-over-Year Comparison */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="text-indigo-500" size={28} />
            <h2 className="text-2xl font-bold text-gray-900">Historical Trends</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-gray-600 mb-2">2023 Placement Rate</p>
              <div className="text-4xl font-bold text-blue-600 mb-2">89%</div>
              <div className="flex items-center justify-center gap-1 text-green-600 font-semibold">
                <TrendingUp size={16} /> +6% increase
              </div>
            </div>
            <div className="text-center">
              <p className="text-gray-600 mb-2">2023 Avg Package</p>
              <div className="text-4xl font-bold text-purple-600 mb-2">₹10.8L</div>
              <div className="flex items-center justify-center gap-1 text-green-600 font-semibold">
                <TrendingUp size={16} /> +1.7L increase
              </div>
            </div>
            <div className="text-center">
              <p className="text-gray-600 mb-2">2023 Highest Package</p>
              <div className="text-4xl font-bold text-orange-600 mb-2">₹32L</div>
              <div className="flex items-center justify-center gap-1 text-green-600 font-semibold">
                <TrendingUp size={16} /> +3L increase
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlacementAnalytics;
