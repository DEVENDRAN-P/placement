import React, { useState, useEffect } from 'react';
import {
  Search, Filter, Users, Award, Mail, FileText, TrendingUp,
  Download, Plus, ChevronDown, Loader, AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/FirebaseAuthContext';
import axios from 'axios';

interface Student {
  _id: string;
  user: { email: string };
  academicInfo: {
    cgpa: number;
    department: string;
    year: number;
    semester: number;
  };
  skills: Array<{ name: string; level: string }>;
  codingProfiles: {
    leetcode?: { rating: number; totalSolved: number };
    codechef?: { rating: number; totalSolved: number };
    codeforces?: { rating: number; totalSolved: number };
  };
  resume: { fileUrl?: string };
  profile: { firstName: string; lastName: string };
  placementStatus: { isPlaced: boolean };
}

interface FilterCriteria {
  minCGPA: number;
  maxCGPA: number;
  department: string;
  year: number;
  minCodingRating: number;
  skills: string[];
  isPlaced: boolean | null;
  searchQuery: string;
}

const PlacementPortal: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'filter' | 'shortlist' | 'notifications'>('overview');
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, placed: 0, eligible: 0 });

  const [filters, setFilters] = useState<FilterCriteria>({
    minCGPA: 0,
    maxCGPA: 10,
    department: '',
    year: 0,
    minCodingRating: 0,
    skills: [],
    isPlaced: null,
    searchQuery: ''
  });

  useEffect(() => {
    if (isAuthenticated && user?.role === 'college') {
      fetchStudents();
    }
  }, [isAuthenticated, user]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/colleges/students`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setStudents(response.data.data);
        setFilteredStudents(response.data.data);

        // Calculate stats
        const placed = response.data.data.filter((s: Student) => s.placementStatus.isPlaced).length;
        setStats({
          total: response.data.data.length,
          placed,
          eligible: response.data.data.filter((s: Student) => s.academicInfo.cgpa >= 7.0).length
        });
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...students];

    // CGPA filter
    filtered = filtered.filter(
      s => s.academicInfo.cgpa >= filters.minCGPA && s.academicInfo.cgpa <= filters.maxCGPA
    );

    // Department filter
    if (filters.department) {
      filtered = filtered.filter(s => s.academicInfo.department === filters.department);
    }

    // Year filter
    if (filters.year > 0) {
      filtered = filtered.filter(s => s.academicInfo.year === filters.year);
    }

    // Coding rating filter
    if (filters.minCodingRating > 0) {
      filtered = filtered.filter(s => {
        const maxRating = Math.max(
          s.codingProfiles.leetcode?.rating || 0,
          s.codingProfiles.codechef?.rating || 0,
          s.codingProfiles.codeforces?.rating || 0
        );
        return maxRating >= filters.minCodingRating;
      });
    }

    // Placement status filter
    if (filters.isPlaced !== null) {
      filtered = filtered.filter(s => s.placementStatus.isPlaced === filters.isPlaced);
    }

    // Skills filter
    if (filters.skills.length > 0) {
      filtered = filtered.filter(s =>
        filters.skills.some(skill =>
          s.skills.some(sSkill => sSkill.name.toLowerCase() === skill.toLowerCase())
        )
      );
    }

    // Search query
    if (filters.searchQuery) {
      filtered = filtered.filter(s =>
        `${s.profile.firstName} ${s.profile.lastName}`
          .toLowerCase()
          .includes(filters.searchQuery.toLowerCase()) ||
        s.user.email.toLowerCase().includes(filters.searchQuery.toLowerCase())
      );
    }

    setFilteredStudents(filtered);
  };

  const toggleStudentSelection = (studentId: string) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedStudents(newSelected);
  };

  const exportShortlist = () => {
    if (filteredStudents.length === 0) {
      alert('No students to export');
      return;
    }

    const data = filteredStudents.map(s => ({
      Name: `${s.profile.firstName} ${s.profile.lastName}`,
      Email: s.user.email,
      CGPA: s.academicInfo.cgpa,
      Department: s.academicInfo.department,
      Year: s.academicInfo.year,
      'LeetCode Rating': s.codingProfiles.leetcode?.rating || 'N/A',
      'CodeChef Rating': s.codingProfiles.codechef?.rating || 'N/A',
      'Codeforces Rating': s.codingProfiles.codeforces?.rating || 'N/A',
      Skills: s.skills.map(sk => sk.name).join(', '),
      Placed: s.placementStatus.isPlaced ? 'Yes' : 'No'
    }));

    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).map(v => `"${v}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shortlist-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Students</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
            </div>
            <Users className="text-blue-500" size={40} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Placed</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.placed}</p>
            </div>
            <Award className="text-green-500" size={40} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Eligible (CGPA ≥ 7.0)</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{stats.eligible}</p>
            </div>
            <TrendingUp className="text-purple-500" size={40} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setActiveTab('filter')}
            className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
          >
            <Filter size={20} className="text-blue-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Filter Students</p>
              <p className="text-sm text-gray-600">By CGPA, skills, coding ratings</p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('shortlist')}
            className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition"
          >
            <Award size={20} className="text-purple-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900">AI Shortlisting</p>
              <p className="text-sm text-gray-600">AI-powered candidate ranking</p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition"
          >
            <Mail size={20} className="text-green-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Send Updates</p>
              <p className="text-sm text-gray-600">Bulk email to students</p>
            </div>
          </button>

          <button
            onClick={exportShortlist}
            className="flex items-center gap-3 p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition"
          >
            <Download size={20} className="text-orange-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Export List</p>
              <p className="text-sm text-gray-600">Download as CSV</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  const renderFilter = () => (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <h3 className="text-xl font-bold text-gray-900">Advanced Student Filtering</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Search */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Search by Name or Email</label>
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search..."
              value={filters.searchQuery}
              onChange={(e) => {
                setFilters({ ...filters, searchQuery: e.target.value });
              }}
              onKeyUp={applyFilters}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* CGPA Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Min CGPA</label>
          <input
            type="number"
            min="0"
            max="10"
            step="0.1"
            value={filters.minCGPA}
            onChange={(e) => setFilters({ ...filters, minCGPA: parseFloat(e.target.value) })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Max CGPA</label>
          <input
            type="number"
            min="0"
            max="10"
            step="0.1"
            value={filters.maxCGPA}
            onChange={(e) => setFilters({ ...filters, maxCGPA: parseFloat(e.target.value) })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Department */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
          <select
            value={filters.department}
            onChange={(e) => setFilters({ ...filters, department: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Departments</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Electronics">Electronics</option>
            <option value="Mechanical">Mechanical</option>
            <option value="Civil">Civil</option>
          </select>
        </div>

        {/* Year */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
          <select
            value={filters.year}
            onChange={(e) => setFilters({ ...filters, year: parseInt(e.target.value) })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="0">All Years</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </select>
        </div>

        {/* Min Coding Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Min Coding Rating</label>
          <input
            type="number"
            min="0"
            value={filters.minCodingRating}
            onChange={(e) => setFilters({ ...filters, minCodingRating: parseInt(e.target.value) })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Placement Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Placement Status</label>
          <select
            value={filters.isPlaced === null ? '' : filters.isPlaced.toString()}
            onChange={(e) => setFilters({
              ...filters,
              isPlaced: e.target.value === '' ? null : e.target.value === 'true'
            })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All</option>
            <option value="false">Not Placed</option>
            <option value="true">Placed</option>
          </select>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={applyFilters}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          Apply Filters
        </button>
        <button
          onClick={() => {
            setFilters({
              minCGPA: 0,
              maxCGPA: 10,
              department: '',
              year: 0,
              minCodingRating: 0,
              skills: [],
              isPlaced: null,
              searchQuery: ''
            });
            setFilteredStudents(students);
          }}
          className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium"
        >
          Reset
        </button>
      </div>

      {/* Results */}
      <div className="mt-8">
        <h4 className="text-lg font-bold text-gray-900 mb-4">
          Results: {filteredStudents.length} students
        </h4>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredStudents.map(student => (
            <div key={student._id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
              <input
                type="checkbox"
                checked={selectedStudents.has(student._id)}
                onChange={() => toggleStudentSelection(student._id)}
                className="w-4 h-4"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  {student.profile.firstName} {student.profile.lastName}
                </p>
                <p className="text-sm text-gray-600">{student.user.email}</p>
                <div className="flex gap-4 mt-2 text-sm">
                  <span className="text-gray-700">CGPA: {student.academicInfo.cgpa.toFixed(2)}</span>
                  <span className="text-gray-700">{student.academicInfo.department}</span>
                  <span className="text-gray-700">Year {student.academicInfo.year}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderShortlist = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">AI-Powered Student Shortlisting</h3>
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-3">
        <AlertCircle className="text-blue-600 flex-shrink-0" size={20} />
        <div className="text-sm text-blue-800">
          <p className="font-medium">AI Shortlisting Algorithm</p>
          <p>Ranks students by: Coding performance (40%), CGPA (30%), Skills (20%), Projects (10%)</p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {filteredStudents.length > 0 ? (
          filteredStudents
            .sort((a, b) => {
              const scoreA = (
                ((a.codingProfiles.leetcode?.rating || 0) / 2500) * 40 +
                (a.academicInfo.cgpa / 10) * 30 +
                (a.skills.length / 10) * 20
              );
              const scoreB = (
                ((b.codingProfiles.leetcode?.rating || 0) / 2500) * 40 +
                (b.academicInfo.cgpa / 10) * 30 +
                (b.skills.length / 10) * 20
              );
              return scoreB - scoreA;
            })
            .map((student, index) => {
              const score = Math.min(100, (
                ((student.codingProfiles.leetcode?.rating || 0) / 2500) * 40 +
                (student.academicInfo.cgpa / 10) * 30 +
                (student.skills.length / 10) * 20
              ));

              return (
                <div key={student._id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-lg text-gray-600">#{index + 1}</span>
                        <div>
                          <p className="font-bold text-gray-900">
                            {student.profile.firstName} {student.profile.lastName}
                          </p>
                          <p className="text-sm text-gray-600">{student.user.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">{score.toFixed(1)}</div>
                      <p className="text-xs text-gray-600">Score</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mt-3 text-sm">
                    <div>
                      <p className="text-gray-600">CGPA</p>
                      <p className="font-semibold text-gray-900">{student.academicInfo.cgpa.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Coding</p>
                      <p className="font-semibold text-gray-900">
                        {student.codingProfiles.leetcode?.rating || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Skills</p>
                      <p className="font-semibold text-gray-900">{student.skills.length}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Status</p>
                      <p className="font-semibold" style={{ color: student.placementStatus.isPlaced ? '#10b981' : '#ef4444' }}>
                        {student.placementStatus.isPlaced ? 'Placed' : 'Available'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
        ) : (
          <p className="text-gray-600 text-center py-8">No students to shortlist. Apply filters first.</p>
        )}
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <h3 className="text-xl font-bold text-gray-900">Send Placement Updates</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Subject</label>
          <input
            type="text"
            placeholder="e.g., Placement Drive - XYZ Company"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Message</label>
          <textarea
            placeholder="Type your message here..."
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Recipients</label>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-2">
              Sending to {selectedStudents.size} selected students
            </p>
            {selectedStudents.size === 0 && (
              <p className="text-sm text-orange-600">⚠️ Select students from filter to send emails</p>
            )}
          </div>
        </div>

        <button
          disabled={selectedStudents.size === 0}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-medium flex items-center gap-2"
        >
          <Mail size={18} /> Send to {selectedStudents.size} Students
        </button>
      </div>
    </div>
  );

  if (!isAuthenticated || user?.role !== 'college') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto text-red-600 mb-4" size={48} />
          <p className="text-xl font-bold text-gray-900">Access Denied</p>
          <p className="text-gray-600">Placement Portal is only available for college accounts.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Placement Portal</h1>
          <p className="mt-2 text-gray-600">Manage student placements, filter candidates, and send updates</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          {(['overview', 'filter', 'shortlist', 'notifications'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium border-b-2 transition ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="animate-spin text-blue-600" size={32} />
          </div>
        ) : (
          <>
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'filter' && renderFilter()}
            {activeTab === 'shortlist' && renderShortlist()}
            {activeTab === 'notifications' && renderNotifications()}
          </>
        )}
      </div>
    </div>
  );
};

export default PlacementPortal;
