import React, { useEffect, useState, useCallback } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { recruiterAPI, studentAPI } from '../../services/api';
import { useAuth } from '../../context/FirebaseAuthContext';
import { Search, Filter, Download } from 'lucide-react';

interface Candidate {
  _id: string;
  userId?: string;
  user?: {
    profile: {
      firstName: string;
      lastName: string;
    };
  };
  profile?: {
    firstName: string;
    lastName: string;
  };
  academicInfo?: {
    cgpa: number;
  };
  codingProfiles?: {
    leetcode?: { totalSolved?: number; rating?: number };
    codechef?: { totalSolved?: number; rating?: number };
    codeforces?: { totalSolved?: number; rating?: number };
  };
  skills?: string[];
  name?: string;
  firstName?: string;
  lastName?: string;
  cgpa?: number;
}

const BrowseCandidatesPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { placementId } = useParams();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCGPA, setFilterCGPA] = useState('');

  const fetchCandidates = useCallback(async () => {
    try {
      setLoading(true);
      
      let result = null;
      
      // Try to fetch applications for a specific placement first
      if (placementId) {
        try {
          const appRes: any = await recruiterAPI.getApplications(placementId);
          if (appRes?.success && appRes.data?.length > 0) {
            setCandidates(appRes.data || []);
            return;
          }
        } catch (appErr) {
          console.warn('Could not fetch placement applications:', appErr);
        }
      }
      
      // Fallback: Try recruiter search (primary for recruiters)
      try {
        const searchRes: any = await recruiterAPI.searchStudents({ limit: 100 });
        if (searchRes?.success && Array.isArray(searchRes.data)) {
          setCandidates(searchRes.data || []);
          return;
        }
      } catch (searchErr) {
        console.warn('Could not search students via recruiter API:', searchErr);
      }
      
      // Fallback: Try public students endpoint
      try {
        const studentRes: any = await studentAPI.getAllStudents({ limit: 100 });
        if (studentRes?.success && Array.isArray(studentRes.data)) {
          setCandidates(studentRes.data || []);
          return;
        }
      } catch (studentErr) {
        console.warn('Could not fetch from public students API:', studentErr);
      }
      
      // If all fail, show empty state
      setCandidates([]);
    } catch (err) {
      console.error('Error fetching candidates:', err);
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  }, [placementId]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'recruiter') {
      fetchCandidates();
    }
  }, [isAuthenticated, user, fetchCandidates]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'recruiter') {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-2xl font-bold text-red-900 mb-2">Access Denied</h2>
            <p className="text-red-700">This page is only available for recruiters. Your role: {user?.role}</p>
            <p className="text-red-600 text-sm mt-2">Please log in with a recruiter account to access the candidate browsing features.</p>
          </div>
        </div>
      </div>
    );
  }

  const filteredCandidates = candidates.filter((candidate) => {
    // Handle different data structures
    const firstName = candidate.user?.profile?.firstName || candidate.profile?.firstName || candidate.firstName || '';
    const lastName = candidate.user?.profile?.lastName || candidate.profile?.lastName || candidate.lastName || '';
    const name = `${firstName} ${lastName}`.toLowerCase().trim();
    
    const matchesSearch = searchTerm === '' || name.includes(searchTerm.toLowerCase());
    
    const cgpa = candidate.academicInfo?.cgpa || candidate.cgpa || 0;
    const matchesCGPA = !filterCGPA || cgpa >= parseFloat(filterCGPA);
    
    return matchesSearch && matchesCGPA;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link to="/recruiter/jobs" className="text-blue-600 hover:text-blue-700 mb-4 block">
            ← Back to Jobs
          </Link>
          <h1 className="text-4xl font-bold text-slate-900">Browse Candidates</h1>
          <p className="text-slate-600 mt-2">Search and shortlist the best candidates for your roles</p>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Search className="w-4 h-4 inline mr-2" />
                Search Candidate
              </label>
              <input
                type="text"
                placeholder="Name or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Filter className="w-4 h-4 inline mr-2" />
                Min CGPA
              </label>
              <input
                type="number"
                placeholder="7.0"
                min="0"
                max="10"
                step="0.1"
                value={filterCGPA}
                onChange={(e) => setFilterCGPA(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Download className="w-4 h-4 inline mr-2" />
                Export Results
              </label>
              <button className="w-full px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 font-semibold">
                Download CSV
              </button>
            </div>
          </div>
        </div>

        {/* Candidates List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-slate-600">Loading candidates...</p>
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-slate-600">No candidates found</p>
            </div>
          ) : (
            filteredCandidates.map((candidate) => {
              const firstName = candidate.user?.profile?.firstName || candidate.profile?.firstName || candidate.firstName || '';
              const lastName = candidate.user?.profile?.lastName || candidate.profile?.lastName || candidate.lastName || '';
              const cgpa = candidate.academicInfo?.cgpa || candidate.cgpa || 0;
              
              return (
              <div key={candidate._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                      {firstName} {lastName}
                    </h3>
                    
                    <div className="grid md:grid-cols-3 gap-6 mb-4">
                      <div>
                        <p className="text-slate-500 text-sm">CGPA</p>
                        <p className="text-2xl font-bold text-blue-600">{cgpa.toFixed(2)}</p>
                      </div>
                      
                      <div>
                        <p className="text-slate-500 text-sm mb-2">Coding Stats</p>
                        <div className="space-y-1 text-sm">
                          {candidate.codingProfiles?.leetcode?.totalSolved && (
                            <p>LeetCode: {candidate.codingProfiles.leetcode.totalSolved} problems</p>
                          )}
                          {candidate.codingProfiles?.codechef?.totalSolved && (
                            <p>CodeChef: {candidate.codingProfiles.codechef.totalSolved} problems</p>
                          )}
                          {candidate.codingProfiles?.codeforces?.totalSolved && (
                            <p>Codeforces: {candidate.codingProfiles.codeforces.totalSolved} problems</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <p className="text-slate-500 text-sm mb-2">Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {candidate.skills?.slice(0, 3).map((skill, idx) => (
                            <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">
                              {skill}
                            </span>
                          ))}
                          {candidate.skills && candidate.skills.length > 3 && (
                            <span className="text-slate-500 text-xs">+{candidate.skills.length - 3} more</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="ml-4 space-y-2 flex flex-col">
                    <Link
                      to={`/students/public/${candidate._id}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-center whitespace-nowrap"
                    >
                      View Profile
                    </Link>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold">
                      Shortlist
                    </button>
                    <button className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 font-semibold">
                      Message
                    </button>
                  </div>
                </div>
              </div>
            );
            })
          )}
        </div>

        {/* Stats */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Search Statistics</h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div>
              <p className="text-slate-500">Total Candidates</p>
              <p className="text-3xl font-bold text-blue-600">{candidates.length}</p>
            </div>
            <div>
              <p className="text-slate-500">Matching Results</p>
              <p className="text-3xl font-bold text-green-600">{filteredCandidates.length}</p>
            </div>
            <div>
              <p className="text-slate-500">Avg CGPA</p>
              <p className="text-3xl font-bold text-purple-600">
                {candidates.length > 0 
                  ? (candidates.reduce((sum, c) => sum + c.academicInfo.cgpa, 0) / candidates.length).toFixed(2)
                  : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Shortlisted</p>
              <p className="text-3xl font-bold text-orange-600">0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowseCandidatesPage;
