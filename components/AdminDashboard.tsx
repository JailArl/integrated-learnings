import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Clock, Eye, EyeOff, LogOut, RefreshCw, Download, Search, Filter } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../services/supabase';

interface FormSubmission {
  id: string;
  type: 'parent' | 'tutor';
  data: any;
  submittedAt: string;
  status: 'pending' | 'approved' | 'matched' | 'verified' | 'cancelled' | 'rejected';
  notes?: string;
}

interface DashboardStats {
  totalSubmissions: number;
  parentRequests: number;
  tutorApplications: number;
  pendingApprovals: number;
  activeMatches: number;
  verifiedTutors: number;
}

export default function AdminDashboard() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'submissions' | 'parents' | 'tutors'>('overview');
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      setIsAuthenticated(true);
      setPassword('');
      fetchData();
    } else {
      alert('Invalid password');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const [parentsRes, tutorsRes] = await Promise.all([
          supabase.from('parent_submissions').select('*'),
          supabase.from('tutor_submissions').select('*'),
        ]);
        const parents = (parentsRes.data || []).map((p: any) => ({
          id: p.id,
          type: 'parent' as const,
          data: p,
          submittedAt: p.submittedAt || p.submitted_at || new Date().toISOString(),
          status: p.status || 'pending',
        }));
        const tutors = (tutorsRes.data || []).map((t: any) => ({
          id: t.id,
          type: 'tutor' as const,
          data: t,
          submittedAt: t.submittedAt || t.submitted_at || new Date().toISOString(),
          status: t.status || 'pending',
        }));
        const combined = [...parents, ...tutors];
        setSubmissions(combined);
        setStats({
          totalSubmissions: combined.length,
          parentRequests: parents.length,
          tutorApplications: tutors.length,
          pendingApprovals: combined.filter(s => s.status === 'pending').length,
          activeMatches: combined.filter(s => s.status === 'matched').length,
          verifiedTutors: tutors.filter(s => s.status === 'verified').length,
        });
      } else {
        // Fallback to local Express API
        const submissionsRes = await fetch('/api/forms/all', {
          headers: { 'Authorization': `Bearer admin123` },
        });
        if (submissionsRes.ok) {
          const subs = await submissionsRes.json();
          setSubmissions(subs);
        }
        const statsRes = await fetch('/api/admin/stats', {
          headers: { 'Authorization': `Bearer admin123` },
        });
        if (statsRes.ok) {
          setStats(await statsRes.json());
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
    setLoading(false);
  };

  const handleStatusUpdate = async (submissionId: string, newStatus: string) => {
    try {
      if (isSupabaseConfigured && supabase) {
        const [updParent, updTutor] = await Promise.all([
          supabase.from('parent_submissions').update({ status: newStatus }).eq('id', submissionId),
          supabase.from('tutor_submissions').update({ status: newStatus }).eq('id', submissionId),
        ]);
        const ok = (!updParent.error && (updParent.data || updParent.count)) || (!updTutor.error && (updTutor.data || updTutor.count));
        if (ok) {
          setSubmissions(submissions.map(s => s.id === submissionId ? { ...s, status: newStatus as any } : s));
          alert('Status updated successfully');
        }
      } else {
        const res = await fetch(`/api/forms/${submissionId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer admin123`,
          },
          body: JSON.stringify({ status: newStatus }),
        });
        if (res.ok) {
          setSubmissions(submissions.map(s => s.id === submissionId ? { ...s, status: newStatus as any } : s));
          alert('Status updated successfully');
        }
      }
    } catch (error) {
      alert('Failed to update status');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
    setSubmissions([]);
    setStats(null);
  };

  const handleExport = () => {
    const csv = generateCSV(submissions);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `form-submissions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const generateCSV = (data: FormSubmission[]): string => {
    const headers = ['ID', 'Type', 'Name', 'Email', 'Status', 'Submitted At', 'Notes'];
    const rows = data.map(s => [
      s.id,
      s.type,
      s.data.parentName || s.data.fullName || 'N/A',
      s.data.email || 'N/A',
      s.status,
      new Date(s.submittedAt).toLocaleDateString(),
      s.notes || '',
    ]);

    return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  };

  const filteredSubmissions = submissions.filter(s => {
    const matchesSearch = 
      s.data.parentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.data.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.data.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || s.status === filterStatus;
    const matchesType = filterType === 'all' || s.type === filterType;

    return matchesSearch && matchesStatus && matchesType;
  });

  const parentSubmissions = submissions.filter(s => s.type === 'parent');
  const tutorSubmissions = submissions.filter(s => s.type === 'tutor');

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 w-96">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600 mb-8">Integrated Learnings Form Management</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Admin Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter admin password"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-500"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Login
            </button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-800">
              <strong>Demo credentials:</strong> Password is <code className="font-mono">admin123</code>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">IL Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={fetchData}
              disabled={loading}
              className="p-2 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
              title="Refresh data"
            >
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-gray-600 text-sm">Total Submissions</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalSubmissions}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-gray-600 text-sm">Parent Requests</p>
              <p className="text-3xl font-bold text-blue-600">{stats.parentRequests}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-gray-600 text-sm">Tutor Applications</p>
              <p className="text-3xl font-bold text-green-600">{stats.tutorApplications}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-gray-600 text-sm">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.pendingApprovals}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-gray-600 text-sm">Active Matches</p>
              <p className="text-3xl font-bold text-purple-600">{stats.activeMatches}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-gray-600 text-sm">Verified Tutors</p>
              <p className="text-3xl font-bold text-red-600">{stats.verifiedTutors}</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-0 mb-6 bg-white rounded-lg border border-gray-200 overflow-hidden">
          {(['overview', 'submissions', 'parents', 'tutors'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 font-medium transition ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        {activeTab === 'overview' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">System Status</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-700 font-medium">Database Status</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-700">Connected (In-Memory)</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-700 font-medium">Form Handler API</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-700">Running (localhost:3001)</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-700 font-medium">Email Service</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-yellow-700">Configured (Resend API)</span>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-bold text-blue-900 mb-2">Quick Setup Guide</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✓ Run backend server: <code className="font-mono bg-white px-2 py-1">node backend-setup.ts</code></li>
                <li>✓ Frontend already imports formHandler.ts for API calls</li>
                <li>✓ Update Dashboards.tsx wizards to call submitParentForm/submitTutorForm</li>
                <li>✓ Add Resend API key to backend .env for email confirmations</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'submissions' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-4 space-y-4">
              <div className="flex gap-4 flex-wrap">
                <div className="flex-1 min-w-64">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                  <div className="relative">
                    <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by name, email, or ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All</option>
                    <option value="parent">Parents</option>
                    <option value="tutor">Tutors</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="verified">Verified</option>
                    <option value="matched">Matched</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">&nbsp;</label>
                  <button
                    onClick={handleExport}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                  >
                    <Download size={18} />
                    Export CSV
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-600">
                Showing {filteredSubmissions.length} of {submissions.length} submissions
              </p>
            </div>

            {/* Submissions Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {filteredSubmissions.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No submissions found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Submitted</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSubmissions.map(submission => (
                        <tr key={submission.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="px-6 py-3 text-sm font-mono text-gray-700">{submission.id.slice(0, 8)}</td>
                          <td className="px-6 py-3 text-sm">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              submission.type === 'parent'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {submission.type}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-sm text-gray-700">
                            {submission.data.parentName || submission.data.fullName}
                          </td>
                          <td className="px-6 py-3 text-sm text-gray-600">{submission.data.email}</td>
                          <td className="px-6 py-3 text-sm">
                            <select
                              value={submission.status}
                              onChange={(e) => handleStatusUpdate(submission.id, e.target.value)}
                              className={`px-2 py-1 rounded text-xs font-medium border-0 ${
                                submission.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : submission.status === 'approved' || submission.status === 'verified'
                                  ? 'bg-green-100 text-green-800'
                                  : submission.status === 'matched'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              <option value="pending">Pending</option>
                              <option value="approved">Approved</option>
                              <option value="verified">Verified</option>
                              <option value="matched">Matched</option>
                              <option value="cancelled">Cancelled</option>
                              <option value="rejected">Rejected</option>
                            </select>
                          </td>
                          <td className="px-6 py-3 text-sm text-gray-600">
                            {new Date(submission.submittedAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-3 text-sm">
                            <button
                              onClick={() => {
                                setSelectedSubmission(submission);
                                setShowDetailsModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900 font-medium"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'parents' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {parentSubmissions.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No parent submissions yet</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Parent Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Child / Level</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Phone</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Package</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parentSubmissions.map(s => (
                      <tr key={s.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-6 py-3 text-sm font-medium text-gray-900">{s.data.parentName}</td>
                        <td className="px-6 py-3 text-sm text-gray-700">
                          {s.data.childName} ({s.data.level})
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-600">{s.data.email}</td>
                        <td className="px-6 py-3 text-sm text-gray-600">{s.data.phone}</td>
                        <td className="px-6 py-3 text-sm">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                            {s.data.assignmentType}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            s.status === 'matched'
                              ? 'bg-green-100 text-green-800'
                              : s.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {s.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'tutors' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {tutorSubmissions.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No tutor applications yet</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Tutor Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Phone</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Experience</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Subjects</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tutorSubmissions.map(s => (
                      <tr key={s.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-6 py-3 text-sm font-medium text-gray-900">{s.data.fullName}</td>
                        <td className="px-6 py-3 text-sm text-gray-600">{s.data.email}</td>
                        <td className="px-6 py-3 text-sm text-gray-600">{s.data.phone}</td>
                        <td className="px-6 py-3 text-sm text-gray-700">{s.data.experienceYears} years</td>
                        <td className="px-6 py-3 text-sm text-gray-700">
                          {Array.isArray(s.data.subjects) ? s.data.subjects.join(', ') : 'N/A'}
                        </td>
                        <td className="px-6 py-3 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            s.status === 'verified' || s.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : s.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : s.status === 'matched'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {s.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="sticky top-0 bg-gray-50 border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">
                {selectedSubmission.type === 'parent' ? selectedSubmission.data.parentName : selectedSubmission.data.fullName}
              </h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Type</p>
                  <p className="text-gray-900">{selectedSubmission.type}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Status</p>
                  <p className="text-gray-900">{selectedSubmission.status}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Email</p>
                  <p className="text-gray-900">{selectedSubmission.data.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Phone</p>
                  <p className="text-gray-900">{selectedSubmission.data.phone}</p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-3">Full Details</p>
                <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto max-h-64 text-gray-700">
                  {JSON.stringify(selectedSubmission.data, null, 2)}
                </pre>
              </div>

              <div>
                <label className="block text-xs text-gray-500 uppercase font-semibold mb-2">Notes</label>
                <textarea
                  defaultValue={selectedSubmission.notes}
                  placeholder="Add notes..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-2">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
