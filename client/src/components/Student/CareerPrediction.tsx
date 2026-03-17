import React, { useState } from 'react';
import { AlertCircle, Zap, Target, TrendingUp, Award, BookOpen } from 'lucide-react';

const CareerPrediction: React.FC = () => {
  const [analyzed, setAnalyzed] = useState(true);
  const [loading, setLoading] = useState(false);

  const prediction = {
    placementProbability: 82,
    companyFit: [
      { type: 'Product Companies (Google, Microsoft)', probability: 85 },
      { type: 'Startups & Scale-ups', probability: 78 },
      { type: 'Corporate IT Services', probability: 92 },
      { type: 'Fintech Companies', probability: 68 }
    ],
    factors: [
      { name: 'CGPA Score', impact: 'Strong', score: 8.2 },
      { name: 'Coding Ability', impact: 'Very Strong', score: 1847 },
      { name: 'Project Portfolio', impact: 'Good', score: 7.5 },
      { name: 'Communication Skills', impact: 'Good', score: 7.0 },
      { name: 'System Design Knowledge', impact: 'Needs Work', score: 5.5 },
      { name: 'Interview Performance', impact: 'Very Good', score: 8.5 }
    ],
    topMatches: [
      {
        company: 'Microsoft',
        role: 'Software Engineer II',
        matchScore: 92,
        salary: '₹35-45L',
        reason: 'Strong DSA, good system design basics'
      },
      {
        company: 'Amazon',
        role: 'SDE I - Backend',
        matchScore: 88,
        reason: 'Excellent problem-solving, need system design polish'
      },
      {
        company: 'Flipkart',
        role: 'Software Development Engineer',
        matchScore: 90,
        reason: 'Perfect fit for backend development role'
      }
    ],
    recommendations: [
      'Complete system design course (focus on scalability)',
      'Practice 50+ hard level DSA problems',
      'Build 2-3 large-scale projects (distributed systems)',
      'Prepare OOPS concepts thoroughly',
      'Mock interviews with industry professionals',
      'Learn cloud services (AWS/GCP fundamentals)'
    ],
    timeline: {
      readyForInterview: '2-3 weeks',
      expectedOffer: '1-2 months',
      bestTime: 'Apply from next week onwards'
    }
  };

  const handleReanalyze = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setAnalyzed(true);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Career Prediction Engine</h1>
          <p className="text-gray-600">AI-powered analysis of your placement probability and career path</p>
        </div>

        {analyzed ? (
          <>
            {/* Main Probability Card */}
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg p-12 mb-12 text-white">
              <div className="max-w-2xl">
                <h2 className="text-5xl font-bold mb-6">Placement Probability</h2>
                <div className="mb-8">
                  <div className="text-7xl font-bold mb-2">{prediction.placementProbability}%</div>
                  <div className="h-4 bg-white/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full transition-all duration-1000"
                      style={{ width: `${prediction.placementProbability}%` }}
                    ></div>
                  </div>
                </div>
                <p className="text-lg text-blue-100">
                  Based on your academic performance, coding skills, and interview readiness
                </p>
              </div>
            </div>

            {/* Company Fit */}
            <div className="bg-white rounded-lg shadow-md p-8 mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Company Type Fit Analysis</h2>
              <div className="space-y-4">
                {prediction.companyFit.map((fit) => (
                  <div key={fit.type}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-gray-900">{fit.type}</span>
                      <span className="text-lg font-bold text-blue-600">{fit.probability}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full"
                        style={{ width: `${fit.probability}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Success Factors */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
              {/* Strengths and Weaknesses */}
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Success Factors</h2>
                <div className="space-y-4">
                  {prediction.factors.map((factor) => (
                    <div key={factor.name} className="border-l-4 border-blue-500 pl-4 py-2">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900">{factor.name}</h3>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${
                          factor.impact === 'Very Strong'
                            ? 'bg-green-100 text-green-700'
                            : factor.impact === 'Strong'
                            ? 'bg-green-50 text-green-600'
                            : factor.impact === 'Good'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {factor.impact}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            factor.score >= 8
                              ? 'bg-green-500'
                              : factor.score >= 6
                              ? 'bg-blue-500'
                              : 'bg-orange-500'
                          }`}
                          style={{ width: `${factor.score * 10}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{factor.score}/10</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Matches */}
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Top Job Matches</h2>
                <div className="space-y-4">
                  {prediction.topMatches.map((match) => (
                    <div key={match.company} className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-gray-900">{match.company}</h3>
                          <p className="text-sm text-gray-600">{match.role}</p>
                        </div>
                        <span className="text-2xl font-bold text-blue-600">{match.matchScore}%</span>
                      </div>
                      <p className="text-sm text-purple-600 font-semibold mb-2">💰 {match.salary}</p>
                      <p className="text-sm text-gray-700">{match.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-lg shadow-md p-8 mb-12">
              <div className="flex items-center gap-3 mb-6">
                <BookOpen className="text-green-500" size={28} />
                <h2 className="text-2xl font-bold text-gray-900">Recommended Actions</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {prediction.recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="flex gap-3 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200"
                  >
                    <div className="text-xl font-bold text-green-600 flex-shrink-0">{idx + 1}</div>
                    <p className="text-gray-700">{rec}</p>
                  </div>
                ))}
              </div>

              {/* Timeline */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border border-purple-200">
                <h3 className="font-bold text-gray-900 mb-4">📅 Timeline to Placement</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 mb-1">
                      {prediction.timeline.readyForInterview}
                    </div>
                    <p className="text-sm text-gray-600">Ready for Interviews</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {prediction.timeline.expectedOffer}
                    </div>
                    <p className="text-sm text-gray-600">Expected to Get Offers</p>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold text-green-600">
                      {prediction.timeline.bestTime}
                    </div>
                    <p className="text-sm text-gray-600">Best Time to Apply</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Confidence Score */}
            <div className="bg-white rounded-lg shadow-md p-8 mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Analysis Confidence</h2>
              <div className="flex items-center gap-4">
                <div className="text-5xl font-bold text-green-600">94%</div>
                <div>
                  <p className="text-gray-700">
                    This prediction is based on analysis of 500+ similar student profiles and their placement outcomes.
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    The model factors in your academic performance, coding skills, project experience, and interview patterns.
                  </p>
                </div>
              </div>
            </div>

            {/* Reanalyze Button */}
            <div className="text-center">
              <button
                onClick={handleReanalyze}
                disabled={loading}
                className="px-8 py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg"
              >
                {loading ? 'Re-analyzing...' : 'Re-analyze with Latest Data'}
              </button>
              <p className="text-sm text-gray-600 mt-3">Last analyzed: Today at 10:30 AM</p>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Zap className="mx-auto mb-4 text-yellow-500" size={48} />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Analyze Your Career Potential</h2>
            <p className="text-gray-600 mb-6">Click the button below to run AI analysis on your profile</p>
            <button
              onClick={handleReanalyze}
              className="px-8 py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold"
            >
              Start Analysis
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CareerPrediction;
