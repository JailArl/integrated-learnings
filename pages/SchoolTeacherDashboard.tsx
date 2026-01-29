import React, { useState } from 'react';
import { BarChart3, TrendingUp, Users, Target, Download, LogOut, Eye, Book } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  status: 'completed' | 'in-progress' | 'not-started';
  happinessScore: number;
  wealthScore: number;
  decisionQuality: number;
  completionTime: string;
}

interface ClassData {
  className: string;
  totalStudents: number;
  completed: number;
  inProgress: number;
  averageHappiness: number;
  averageWealth: number;
  topDecisionMaker: string;
}

const SchoolTeacherDashboard: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState('2B');
  const [viewMode, setViewMode] = useState<'overview' | 'students' | 'analytics'>('overview');

  // Demo Data - In production, this comes from backend
  const demoClasses: Record<string, ClassData> = {
    '2A': {
      className: '2A',
      totalStudents: 32,
      completed: 28,
      inProgress: 4,
      averageHappiness: 7.2,
      averageWealth: 6.8,
      topDecisionMaker: 'Alex Tan'
    },
    '2B': {
      className: '2B',
      totalStudents: 30,
      completed: 25,
      inProgress: 5,
      averageHappiness: 7.5,
      averageWealth: 7.1,
      topDecisionMaker: 'Jessica Lee'
    },
    '3C': {
      className: '3C',
      totalStudents: 28,
      completed: 22,
      inProgress: 6,
      averageHappiness: 6.9,
      averageWealth: 6.5,
      topDecisionMaker: 'Marcus Wong'
    }
  };

  const demoStudents: Record<string, Student[]> = {
    '2A': [
      { id: '001', name: 'Alex Tan', status: 'completed', happinessScore: 8.2, wealthScore: 7.5, decisionQuality: 8.1, completionTime: '45 mins' },
      { id: '002', name: 'Jessica Lee', status: 'completed', happinessScore: 7.8, wealthScore: 8.2, decisionQuality: 8.5, completionTime: '52 mins' },
      { id: '003', name: 'Marcus Wong', status: 'completed', happinessScore: 7.1, wealthScore: 6.9, decisionQuality: 7.3, completionTime: '48 mins' },
      { id: '004', name: 'Sarah Chua', status: 'in-progress', happinessScore: 6.8, wealthScore: 6.5, decisionQuality: 6.9, completionTime: '28 mins elapsed' },
      { id: '005', name: 'David Chen', status: 'not-started', happinessScore: 0, wealthScore: 0, decisionQuality: 0, completionTime: 'Not started' },
    ],
    '2B': [
      { id: '101', name: 'Jessica Lee', status: 'completed', happinessScore: 8.5, wealthScore: 8.0, decisionQuality: 8.8, completionTime: '42 mins' },
      { id: '102', name: 'Ryan Krishnan', status: 'completed', happinessScore: 7.2, wealthScore: 7.3, decisionQuality: 7.6, completionTime: '50 mins' },
      { id: '103', name: 'Emma Lim', status: 'completed', happinessScore: 7.9, wealthScore: 7.6, decisionQuality: 8.2, completionTime: '46 mins' },
      { id: '104', name: 'Ali Hassan', status: 'in-progress', happinessScore: 7.1, wealthScore: 6.8, decisionQuality: 7.2, completionTime: '31 mins elapsed' },
      { id: '105', name: 'Sophie Ng', status: 'in-progress', happinessScore: 6.9, wealthScore: 6.6, decisionQuality: 6.8, completionTime: '24 mins elapsed' },
    ],
    '3C': [
      { id: '201', name: 'Marcus Wong', status: 'completed', happinessScore: 8.1, wealthScore: 7.9, decisionQuality: 8.3, completionTime: '48 mins' },
      { id: '202', name: 'Priya Singh', status: 'completed', happinessScore: 7.6, wealthScore: 7.4, decisionQuality: 7.9, completionTime: '51 mins' },
      { id: '203', name: 'Kevin Ooi', status: 'completed', happinessScore: 6.8, wealthScore: 6.7, decisionQuality: 7.1, completionTime: '55 mins' },
    ]
  };

  const classData = demoClasses[selectedClass];
  const students = demoStudents[selectedClass] || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">Completed</span>;
      case 'in-progress':
        return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">In Progress</span>;
      case 'not-started':
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">Not Started</span>;
      default:
        return null;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6.5) return 'text-blue-600';
    if (score >= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
              <p className="text-gray-600 mt-1">Integrated Learnings - Financial Literacy Program</p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Report
              </button>
              <button className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg font-semibold transition">
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            <button
              onClick={() => setViewMode('overview')}
              className={`py-4 px-2 font-semibold border-b-2 transition ${
                viewMode === 'overview'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <BarChart3 className="w-5 h-5 inline mr-2" />
              Overview
            </button>
            <button
              onClick={() => setViewMode('students')}
              className={`py-4 px-2 font-semibold border-b-2 transition ${
                viewMode === 'students'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users className="w-5 h-5 inline mr-2" />
              Student Results
            </button>
            <button
              onClick={() => setViewMode('analytics')}
              className={`py-4 px-2 font-semibold border-b-2 transition ${
                viewMode === 'analytics'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <TrendingUp className="w-5 h-5 inline mr-2" />
              Analytics
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Class Selector */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Select Class:</label>
          <div className="flex gap-3">
            {Object.keys(demoClasses).map((className) => (
              <button
                key={className}
                onClick={() => setSelectedClass(className)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  selectedClass === className
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-900 border border-gray-300 hover:border-gray-400'
                }`}
              >
                Class {className}
              </button>
            ))}
          </div>
        </div>

        {/* OVERVIEW TAB */}
        {viewMode === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-semibold">Total Students</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{classData.totalStudents}</p>
                  </div>
                  <Users className="w-10 h-10 text-green-500 opacity-20" />
                </div>
                <p className="text-xs text-gray-600 mt-3">{classData.completed} completed, {classData.inProgress} in progress</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-semibold">Avg Happiness</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{classData.averageHappiness.toFixed(1)}/10</p>
                  </div>
                  <Target className="w-10 h-10 text-blue-500 opacity-20" />
                </div>
                <p className="text-xs text-gray-600 mt-3">Life satisfaction after program</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-semibold">Avg Wealth Score</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{classData.averageWealth.toFixed(1)}/10</p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-purple-500 opacity-20" />
                </div>
                <p className="text-xs text-gray-600 mt-3">Financial decision quality</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-semibold">Top Performer</p>
                    <p className="text-lg font-bold text-gray-900 mt-2">{classData.topDecisionMaker}</p>
                  </div>
                  <Book className="w-10 h-10 text-orange-500 opacity-20" />
                </div>
                <p className="text-xs text-gray-600 mt-3">Best decision-making</p>
              </div>
            </div>

            {/* Quick Insights */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Completion Status</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">Completed</span>
                      <span className="text-sm font-bold text-green-600">{((classData.completed / classData.totalStudents) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{width: `${(classData.completed / classData.totalStudents) * 100}%`}}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">In Progress</span>
                      <span className="text-sm font-bold text-blue-600">{((classData.inProgress / classData.totalStudents) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{width: `${(classData.inProgress / classData.totalStudents) * 100}%`}}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Key Insights</h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-0.5">✓</span>
                    <span className="text-gray-700"><strong>Delayed gratification understanding:</strong> Students show improved long-term thinking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-0.5">✓</span>
                    <span className="text-gray-700"><strong>Financial instrument knowledge:</strong> Comfortable discussing stocks, bonds, REITs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-0.5">✓</span>
                    <span className="text-gray-700"><strong>Scam awareness:</strong> Most students identified red flags correctly</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* STUDENTS TAB */}
        {viewMode === 'students' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Student Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Happiness</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Wealth</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Decisions</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{student.name}</td>
                    <td className="px-6 py-4">{getStatusBadge(student.status)}</td>
                    <td className="px-6 py-4">
                      {student.status === 'not-started' ? (
                        <span className="text-gray-400">—</span>
                      ) : (
                        <span className={`font-bold ${getScoreColor(student.happinessScore)}`}>{student.happinessScore}/10</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {student.status === 'not-started' ? (
                        <span className="text-gray-400">—</span>
                      ) : (
                        <span className={`font-bold ${getScoreColor(student.wealthScore)}`}>{student.wealthScore}/10</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {student.status === 'not-started' ? (
                        <span className="text-gray-400">—</span>
                      ) : (
                        <span className={`font-bold ${getScoreColor(student.decisionQuality)}`}>{student.decisionQuality}/10</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{student.completionTime}</td>
                    <td className="px-6 py-4">
                      <button className="text-green-600 hover:text-green-700 font-semibold flex items-center gap-1 text-sm">
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ANALYTICS TAB */}
        {viewMode === 'analytics' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Decision-Making Patterns</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">Chose University Path</span>
                      <span className="text-sm font-bold text-blue-600">68%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{width: '68%'}} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">Invested Early</span>
                      <span className="text-sm font-bold text-green-600">72%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{width: '72%'}} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">Avoided Scams</span>
                      <span className="text-sm font-bold text-purple-600">84%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{width: '84%'}} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">Delayed Gratification</span>
                      <span className="text-sm font-bold text-orange-600">65%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-orange-600 h-2 rounded-full" style={{width: '65%'}} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Learning Outcomes</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm font-semibold text-gray-900">✓ Pre vs Post Assessment</p>
                    <p className="text-xs text-gray-600 mt-1">65% improvement in financial literacy concepts understanding</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm font-semibold text-gray-900">✓ Behavioral Shifts</p>
                    <p className="text-xs text-gray-600 mt-1">Students showed increased preference for long-term financial planning</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-sm font-semibold text-gray-900">✓ Engagement Metrics</p>
                    <p className="text-xs text-gray-600 mt-1">Average 48 mins gameplay, 94% active participation during expert talk</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Recommendations for Next Steps</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="text-blue-600 font-bold mt-0.5">→</span>
                  <span className="text-gray-700">Schedule follow-up reflection sessions with students who struggled with scam identification</span>
                </div>
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="text-blue-600 font-bold mt-0.5">→</span>
                  <span className="text-gray-700">Highlight top performers as peer mentors in discussions about delayed gratification</span>
                </div>
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="text-blue-600 font-bold mt-0.5">→</span>
                  <span className="text-gray-700">Consider follow-up enrichment session for 3-6 months post-program for reinforcement</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SchoolTeacherDashboard;
