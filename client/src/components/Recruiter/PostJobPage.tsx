import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { recruiterAPI } from '../../services/api';
import { useAuth } from '../../context/FirebaseAuthContext';
import { Plus } from 'lucide-react';

interface JobPosting {
  _id: string;
  job: {
    title: string;
    description: string;
    location: string;
    ctc: number;
    type: string;
  };
  status: string;
  applicants: number;
  shortlisted: number;
  process: {
    registrationDeadline: string;
  };
}

const PostJobPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    ctc: '',
    type: 'Full-time',
    department: '',
    registrationDeadline: '',
  });

  useEffect(() => {
    if (isAuthenticated && user?.role === 'recruiter') {
      fetchJobs();
    }
  }, [isAuthenticated, user]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response: any = await recruiterAPI.getPlacements({ limit: 100 });
      if (response?.success) {
        setJobs(response.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response: any = await recruiterAPI.createPlacement({
        job: {
          title: formData.title,
          description: formData.description,
          location: formData.location,
          ctc: parseInt(formData.ctc),
          type: formData.type,
        },
        eligibility: {
          allowedDepartments: [formData.department],
        },
        process: {
          registrationDeadline: new Date(formData.registrationDeadline),
        },
      });

      if (response?.success) {
        alert('Job posted successfully!');
        setFormData({
          title: '',
          description: '',
          location: '',
          ctc: '',
          type: 'Full-time',
          department: '',
          registrationDeadline: '',
        });
        setShowForm(false);
        fetchJobs();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to post job');
    }
  };

  if (!isAuthenticated || user?.role !== 'recruiter') {
    return <Navigate to="/login" replace />;
  }

  const filteredJobs = filter === 'all' 
    ? jobs 
    : jobs.filter(job => job.status === filter);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Post New Job</h1>
            <p className="text-slate-600 mt-2">Manage your job postings and track applications</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
          >
            <Plus className="w-5 h-5" />
            Post New Job
          </button>
        </div>

        {/* Post Job Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">Create Job Posting</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Job Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g., Senior Software Engineer"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Location *</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="e.g., Bangalore, India"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">CTC (LPA) *</label>
                  <input
                    type="number"
                    required
                    value={formData.ctc}
                    onChange={(e) => setFormData({...formData, ctc: e.target.value})}
                    placeholder="15"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Job Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>Full-time</option>
                    <option>Internship</option>
                    <option>Contract</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Department *</label>
                  <input
                    type="text"
                    required
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    placeholder="e.g., Computer Science"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description *</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Detailed job description..."
                  rows={6}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Registration Deadline *</label>
                <input
                  type="date"
                  required
                  value={formData.registrationDeadline}
                  onChange={(e) => setFormData({...formData, registrationDeadline: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-semibold"
                >
                  Post Job
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-slate-200 text-slate-700 px-6 py-2 rounded-lg hover:bg-slate-300 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filter & Search */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border border-slate-300'}`}
          >
            All Jobs
          </button>
          <button
            onClick={() => setFilter('Open')}
            className={`px-4 py-2 rounded-lg font-medium ${filter === 'Open' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border border-slate-300'}`}
          >
            Open
          </button>
          <button
            onClick={() => setFilter('Closed')}
            className={`px-4 py-2 rounded-lg font-medium ${filter === 'Closed' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border border-slate-300'}`}
          >
            Closed
          </button>
        </div>

        {/* Jobs List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-slate-600">Loading jobs...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-600">No jobs posted yet</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 text-blue-600 hover:text-blue-700 font-semibold"
              >
                Post your first job
              </button>
            </div>
          ) : (
            filteredJobs.map((job) => (
              <div key={job._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-slate-900">{job.job.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        job.status === 'Open' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {job.status}
                      </span>
                    </div>
                    <p className="text-slate-600 mb-3">{job.job.description.substring(0, 100)}...</p>
                    <div className="grid md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500">Location</p>
                        <p className="font-semibold text-slate-900">{job.job.location}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">CTC</p>
                        <p className="font-semibold text-slate-900">{job.job.ctc} LPA</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Applications</p>
                        <p className="font-semibold text-slate-900">{job.applicants || 0}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Shortlisted</p>
                        <p className="font-semibold text-slate-900">{job.shortlisted || 0}</p>
                      </div>
                    </div>
                  </div>
                  <Link
                    to={`/recruiter/candidates/${job._id}`}
                    className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold whitespace-nowrap"
                  >
                    View Candidates
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PostJobPage;
