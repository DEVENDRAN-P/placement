import React, { useState } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

const CollegeVerification: React.FC = () => {
  const [students, setStudents] = useState([
    {
      id: 1,
      name: 'Raj Kumar',
      rollNumber: 'CS001',
      email: 'raj@college.edu',
      verified: false,
      cgpa: null,
      attendance: null
    },
    {
      id: 2,
      name: 'Priya Singh',
      rollNumber: 'CS002',
      email: 'priya@college.edu',
      verified: true,
      cgpa: 8.5,
      attendance: 92
    }
  ]);

  const [selectedStudent, setSelectedStudent] = useState(students[0]);
  const [verifyForm, setVerifyForm] = useState({
    cgpa: '',
    attendance: '',
    department: ''
  });

  const handleVerifyStudent = () => {
    setStudents(students.map(s =>
      s.id === selectedStudent.id
        ? {
          ...s,
          verified: true,
          cgpa: parseFloat(verifyForm.cgpa),
          attendance: parseFloat(verifyForm.attendance)
        }
        : s
    ));
    setMessage({ type: 'success', text: 'Student verified successfully!' });
    setVerifyForm({ cgpa: '', attendance: '', department: '' });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const [message, setMessage] = useState({ type: '', text: '' });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Verify Student Academic Records</h1>
          <p className="text-gray-600">As an admin, verify student CGPA and attendance from your ERP system</p>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-green-100 text-green-700 border border-green-200'
              : 'bg-blue-100 text-blue-700 border border-blue-200'
          }`}>
            <CheckCircle size={20} />
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Student List */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Students to Verify</h2>
            <div className="space-y-2">
              {students.map((student) => (
                <button
                  key={student.id}
                  onClick={() => setSelectedStudent(student)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition ${
                    selectedStudent.id === student.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="font-semibold text-gray-900">{student.name}</div>
                  <div className="text-sm text-gray-600">{student.rollNumber}</div>
                  <div className="flex items-center gap-2 mt-1">
                    {student.verified ? (
                      <>
                        <CheckCircle className="text-green-600" size={16} />
                        <span className="text-sm text-green-600">Verified</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="text-orange-500" size={16} />
                        <span className="text-sm text-orange-600">Pending</span>
                      </>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Verification Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Verify Student</h2>
              
              {/* Student Info */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Student Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-semibold text-gray-900">{selectedStudent.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Roll Number</p>
                    <p className="font-semibold text-gray-900">{selectedStudent.rollNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold text-gray-900">{selectedStudent.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className={`font-semibold ${selectedStudent.verified ? 'text-green-600' : 'text-orange-600'}`}>
                      {selectedStudent.verified ? 'Verified' : 'Pending Verification'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Verification Form */}
              {!selectedStudent.verified && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Enter Academic Details</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CGPA (0-10)</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.01"
                      placeholder="e.g., 8.5"
                      value={verifyForm.cgpa}
                      onChange={(e) => setVerifyForm({ ...verifyForm, cgpa: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Attendance (0-100%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="e.g., 92"
                      value={verifyForm.attendance}
                      onChange={(e) => setVerifyForm({ ...verifyForm, attendance: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="dept-select" className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <select
                      id="dept-select"
                      title="Select department"
                      value={verifyForm.department}
                      onChange={(e) => setVerifyForm({ ...verifyForm, department: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Department</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Mechanical">Mechanical</option>
                    </select>
                  </div>

                  <button
                    onClick={handleVerifyStudent}
                    disabled={!verifyForm.cgpa || !verifyForm.attendance || !verifyForm.department}
                    className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                  >
                    Verify Student & Add to Portal
                  </button>
                </div>
              )}

              {selectedStudent.verified && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="text-green-600" size={24} />
                    <h3 className="text-lg font-semibold text-green-700">Student Verified</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">CGPA</p>
                      <p className="font-semibold text-gray-900">{selectedStudent.cgpa}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Attendance</p>
                      <p className="font-semibold text-gray-900">{selectedStudent.attendance}%</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Statistics */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-3xl font-bold text-gray-900">{students.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-sm text-gray-600">Verified</p>
                <p className="text-3xl font-bold text-green-600">{students.filter(s => s.verified).length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollegeVerification;
