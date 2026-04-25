import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { aiAPI } from '../../services/api';
import { useAuth } from '../../context/FirebaseAuthContext';

interface ShortlistedStudent {
  _id: string;
  name?: string;
  academicInfo?: {
    cgpa: number;
    department: string;
  };
  college?: {
    name: string;
    code: string;
  };
  averageCodingRating?: number;
  totalCodingProblems?: number;
}

const AIShortlisting: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [minCGPA, setMinCGPA] = useState<number>(7.5);
  const [maxBacklogs, setMaxBacklogs] = useState<number>(2);
  const [skills, setSkills] = useState<string>('Java, Python, DSA');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [result, setResult] = useState<{
    totalEligible: number;
    shortlisted: ShortlistedStudent[];
    statistics?: {
      averageCGPA: number;
      averageCodingRating: number;
    };
  } | null>(null);

  const handleShortlist = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      setResult(null);

      const customRequirements = {
        minCGPA,
        maxBacklogs,
        requiredSkills: skills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      } as any;

      const response: any = await aiAPI.shortlistStudents({ customRequirements });
      if (response.success) {
        setResult(response.data);
      } else {
        setError(response.message || 'Failed to shortlist students');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to shortlist students');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'recruiter' && user?.role !== 'college') {
    return (
      <div className="text-red-600">
        AI shortlisting is only available for recruiter and college accounts.
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">AI Student Shortlisting</h1>
      <p className="mt-2 text-gray-600">
        Enter simple requirements and let the system automatically shortlist best-fit candidates.
      </p>

      <form
        onSubmit={handleShortlist}
        className="mt-6 bg-white shadow rounded-lg p-6 space-y-4"
      >
        <h2 className="text-lg font-medium text-gray-900">Shortlisting Criteria</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Minimum CGPA</label>
            <input
              type="number"
              min={0}
              max={10}
              step="0.1"
              value={minCGPA}
              onChange={(e) => setMinCGPA(Number(e.target.value))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. 7.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Max Backlogs Allowed</label>
            <input
              type="number"
              min={0}
              max={10}
              value={maxBacklogs}
              onChange={(e) => setMaxBacklogs(Number(e.target.value))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. 2"
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700">Key Skills</label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. Java, Python, DSA"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Shortlisting...' : 'Run AI Shortlisting'}
        </button>
      </form>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {result && (
        <div className="mt-6 space-y-4">
          <div className="bg-white shadow rounded-lg p-6 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Shortlisting Summary</h2>
              <p className="mt-1 text-sm text-gray-600">
                Shortlisted {result.shortlisted.length} out of {result.totalEligible} eligible students.
              </p>
            </div>
            {result.statistics && (
              <div className="mt-4 md:mt-0 text-sm text-gray-700 space-y-1">
                <p>Average CGPA: {result.statistics.averageCGPA.toFixed(2)}</p>
                <p>Average Coding Rating: {result.statistics.averageCodingRating.toFixed(0)}</p>
              </div>
            )}
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-md font-medium text-gray-900">Top Shortlisted Students (max 50)</h3>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-sm text-left">
                <thead className="border-b text-gray-500">
                  <tr>
                    <th className="py-2 pr-4">Student</th>
                    <th className="py-2 pr-4">College</th>
                    <th className="py-2 pr-4">Department</th>
                    <th className="py-2 pr-4">CGPA</th>
                    <th className="py-2 pr-4">Coding Rating</th>
                    <th className="py-2 pr-4">Problems Solved</th>
                  </tr>
                </thead>
                <tbody>
                  {result.shortlisted.length === 0 && (
                    <tr>
                      <td className="py-2 text-gray-500" colSpan={6}>
                        No students matched the given criteria.
                      </td>
                    </tr>
                  )}
                  {result.shortlisted.map((s, idx) => (
                    <tr key={s._id || idx} className="border-b last:border-0">
                      <td className="py-2 pr-4">
                        {s.name || 'Student'}
                      </td>
                      <td className="py-2 pr-4">
                        {s.college?.name || '--'} ({s.college?.code || ''})
                      </td>
                      <td className="py-2 pr-4">{s.academicInfo?.department || '--'}</td>
                      <td className="py-2 pr-4">{s.academicInfo?.cgpa?.toFixed?.(2) ?? '--'}</td>
                      <td className="py-2 pr-4">{s.averageCodingRating ?? '--'}</td>
                      <td className="py-2 pr-4">{s.totalCodingProblems ?? '--'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIShortlisting;
