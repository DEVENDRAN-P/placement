import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { interviewPrepAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const InterviewPrep: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [resources, setResources] = useState<any>(null);
  const [selectedType, setSelectedType] = useState<string>('faang');
  const [mockInterview, setMockInterview] = useState<any>(null);
  const [tips, setTips] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch interview resources
        const resRes = await interviewPrepAPI.getResources({ role: 'Software Engineer' }) as any;
        if (resRes?.success) {
          setResources(resRes.data);
        }
        
        // Fetch mock interview for default type
        const mockRes = await interviewPrepAPI.getMockInterview(selectedType) as any;
        if (mockRes?.success) {
          setMockInterview(mockRes.data);
        }
        
        // Fetch tips for default type
        const tipsRes = await interviewPrepAPI.getTips(selectedType) as any;
        if (tipsRes?.success) {
          setTips(tipsRes.data);
        }
      } catch (err) {
        console.warn('Failed to fetch interview data');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user?.role === 'student') {
      fetchData();
    }
  }, [isAuthenticated, user, selectedType]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'student') return <div className="p-4 text-red-600">Access denied</div>;

  const interviewTypes = [
    { id: 'startup', label: 'Startup', icon: '🚀' },
    { id: 'faang', label: 'FAANG', icon: '🏢' },
    { id: 'service', label: 'Service Based', icon: '💼' },
    { id: 'consulting', label: 'Consulting', icon: '📊' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🎤 Interview Preparation</h1>
          <p className="mt-2 text-gray-600">Comprehensive resources to ace your interviews</p>
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        )}

        {/* Interview Type Selector */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Interview Type</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {interviewTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`p-4 rounded-lg border-2 transition ${
                  selectedType === type.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 bg-white hover:border-purple-300'
                }`}
              >
                <span className="text-2xl">{type.icon}</span>
                <p className="mt-2 font-medium text-gray-900">{type.label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Tips Section */}
        {tips && (
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">💡 Interview Tips for {selectedType.toUpperCase()}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-700 mb-3">Preparation</h3>
                <ul className="space-y-2">
                  {tips.preparation?.map((item: string, idx: number) => (
                    <li key={idx} className="flex items-start text-sm text-gray-600">
                      <span className="text-green-500 mr-2">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-700 mb-3">Questions to Ask</h3>
                <ul className="space-y-2">
                  {tips.questionsToAsk?.map((item: string, idx: number) => (
                    <li key={idx} className="text-sm text-gray-600 italic">"{item}"</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-4 p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-800"><strong>Interview Style:</strong> {tips.interviewStyle}</p>
            </div>
          </div>
        )}

        {/* Technical Questions */}
        {resources?.technical && (
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">📚 Technical Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(resources.technical).map(([role, topics]: [string, any]) => (
                <div key={role} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">{role}</h3>
                  {topics.map((topic: any, idx: number) => (
                    <div key={idx} className="mb-4">
                      <h4 className="font-medium text-purple-600">{topic.topic}</h4>
                      <ul className="mt-2 space-y-1">
                        {topic.questions?.slice(0, 3).map((q: string, i: number) => (
                          <li key={i} className="text-sm text-gray-600 flex items-start">
                            <span className="text-gray-400 mr-2">•</span>
                            {q}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Coding Patterns */}
        {resources?.codingPatterns && (
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">💻 Must-Know Coding Patterns</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {resources.codingPatterns.map((pattern: any, idx: number) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                  <h3 className="font-semibold text-gray-900">{pattern.pattern}</h3>
                  <p className="text-sm text-gray-600 mt-2">{pattern.description}</p>
                  <div className="mt-3">
                    <p className="text-xs font-medium text-gray-500 mb-1">Practice Problems:</p>
                    <div className="flex flex-wrap gap-1">
                      {pattern.problems?.slice(0, 3).map((p: string, i: number) => (
                        <span key={i} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{p}</span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs font-medium text-gray-500">Asked at:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {pattern.companies?.map((c: string, i: number) => (
                        <span key={i} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">{c}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Behavioral Questions */}
        {resources?.behavioral && (
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">🎯 Behavioral Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resources.behavioral.map((item: any, idx: number) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900">{item.question}</h3>
                  <p className="text-sm text-gray-600 mt-2"><strong>Tips:</strong> {item.tips}</p>
                  {item.sampleAnswer && (
                    <p className="text-sm text-gray-500 mt-2 italic">Sample: "{item.sampleAnswer}"</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mock Interview Rounds */}
        {mockInterview?.rounds && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">📋 Mock Interview Rounds</h2>
            <div className="space-y-4">
              {Object.entries(mockInterview.rounds).map(([round, details]: [string, any], idx: number) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">Round {idx + 1}: {details.type}</h3>
                      <p className="text-sm text-gray-500">Duration: {details.duration}</p>
                    </div>
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                      {details.tips ? 'Has Tips' : ''}
                    </span>
                  </div>
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">Sample Questions:</p>
                    <ul className="space-y-1">
                      {details.questions?.map((q: string, i: number) => (
                        <li key={i} className="text-sm text-gray-600 flex items-start">
                          <span className="text-purple-500 mr-2">→</span>
                          {q}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {details.tips && (
                    <div className="mt-3 p-3 bg-yellow-50 rounded">
                      <p className="text-sm text-yellow-800"><strong>Tip:</strong> {details.tips}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* General Tips */}
        {resources?.tips && (
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg p-6 mt-8 text-white">
            <h2 className="text-xl font-semibold mb-4">✨ General Interview Tips</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {resources.tips.map((tip: string, idx: number) => (
                <div key={idx} className="flex items-start">
                  <span className="text-yellow-300 mr-2">⭐</span>
                  <span className="text-sm">{tip}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewPrep;