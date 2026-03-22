import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AlertCircle, Clock, Eye, EyeOff, LogOut, RefreshCw, Download, Search, Filter } from 'lucide-react';
import { adminLogout } from '../services/adminAuth';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import AdminTutorRanking from './AdminTutorRanking';

interface FormSubmission {
  id: string;
  type: 'parent' | 'tutor';
  data: any;
  submittedAt: string;
  status: string;
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
  const navigate = useNavigate();
  const location = useLocation();
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'submissions' | 'parents' | 'tutors' | 'rankings'>('overview');
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Auto-check auth and fetch on mount
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const expiry = localStorage.getItem('adminTokenExpiry');
    if (token && expiry && Date.now() < parseInt(expiry)) {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsAuthenticated(true);
      setPassword('');
      fetchData();
    } else {
      setPassword('');
      alert('Please log in through the admin login page.');
      window.location.href = '/admin/login';
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const parentsRes = await supabase.from('parent_submissions').select('*');
        const tutorsRes = await supabase.from('tutor_profiles').select('id, verification_status');
        const parents = (parentsRes.data || []).map((p: any) => ({
          id: p.id,
          type: 'parent' as const,
          data: p,
          submittedAt: p.created_at || new Date().toISOString(),
          status: p.status || 'pending',
        }));
        const tutorCount = tutorsRes.data?.length || 0;
        const verifiedCount = tutorsRes.data?.filter((t: any) => t.verification_status === 'verified').length || 0;
        const combined = [...parents];
        setSubmissions(combined);
        setStats({
          totalSubmissions: combined.length + tutorCount,
          parentRequests: parents.length,
          tutorApplications: tutorCount,
          pendingApprovals: combined.filter(s => s.status === 'new' || s.status === 'pending' || s.status === 'pending_review').length,
          activeMatches: combined.filter(s => s.status === 'matching' || s.status === 'matched' || s.status === 'converted').length,
          verifiedTutors: verifiedCount,
        });
        setLastUpdated(new Date().toISOString());
      } else {
        // Fallback to local Express API
        const adminToken = localStorage.getItem('adminToken') || '';
        const submissionsRes = await fetch('/api/forms/all', {
          headers: { 'Authorization': `Bearer ${adminToken}` },
        });
        if (submissionsRes.ok) {
          const subs = await submissionsRes.json();
          setSubmissions(subs);
        }
        const statsRes = await fetch('/api/admin/stats', {
          headers: { 'Authorization': `Bearer ${adminToken}` },
        });
        if (statsRes.ok) {
          setStats(await statsRes.json());
        }
        setLastUpdated(new Date().toISOString());
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
    setLoading(false);
  };

  const handleStatusUpdate = async (submissionId: string, newStatus: string) => {
    try {
      if (isSupabaseConfigured && supabase) {
        const updParent = await supabase.from('parent_submissions').update({ status: newStatus }).eq('id', submissionId);
        const ok = !updParent.error;
        if (ok) {
          setSubmissions(submissions.map(s => s.id === submissionId ? { ...s, status: newStatus } : s));
          alert('Status updated successfully');
        }
      } else {
        const res = await fetch(`/api/forms/${submissionId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}`,
          },
          body: JSON.stringify({ status: newStatus }),
        });
        if (res.ok) {
          setSubmissions(submissions.map(s => s.id === submissionId ? { ...s, status: newStatus } : s));
          alert('Status updated successfully');
        }
      }
    } catch (error) {
      alert('Failed to update status');
    }
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      await adminLogout(token);
    }
    // Clear session data
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminTokenExpiry');
    setIsAuthenticated(false);
    setPassword('');
    setSubmissions([]);
    setStats(null);
    setLastUpdated(null);
    // Redirect to login
    window.location.href = '/admin/login';
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
      s.data.parent_name || s.data.full_name || 'N/A',
      s.data.email || 'N/A',
      s.status,
      new Date(s.submittedAt).toLocaleDateString(),
      s.notes || '',
    ]);

    return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  };

  const filteredSubmissions = submissions.filter(s => {
    const matchesSearch = 
      s.data.parent_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.data.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.data.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || s.status === filterStatus;
    const matchesType = filterType === 'all' || s.type === filterType;

    return matchesSearch && matchesStatus && matchesType;
  });

  const hasActiveFilters = searchTerm.trim().length > 0 || filterStatus !== 'all' || filterType !== 'all';
  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setFilterType('all');
  };

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
          <div>
            <h1 className="text-2xl font-bold text-gray-900">IL Admin Dashboard</h1>
            <p className="text-sm text-gray-500">Manage requests, approvals, and matches in one place.</p>
          </div>
          <div className="flex items-center gap-4">
            {lastUpdated && (
              <span className="hidden sm:inline text-xs text-gray-500">
                Last updated {new Date(lastUpdated).toLocaleTimeString()}
              </span>
            )}
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
        {/* Admin Page Navigation */}
        <div className="mb-6 flex items-center border-b border-gray-200 pb-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/admin')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${location.pathname === '/admin' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate('/admin/matching')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${location.pathname === '/admin/matching' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Matching
            </button>
            <button
              onClick={() => navigate('/admin/tutors')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${location.pathname === '/admin/tutors' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Tutor Review
            </button>
          </div>
        </div>

        <div className="mb-6 bg-white border border-gray-200 rounded-lg p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-sm text-gray-500">Welcome back</p>
            <h2 className="text-lg font-semibold text-gray-900">Here’s what needs attention today.</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('submissions')}
              className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Review submissions
            </button>
            <button
              onClick={handleExport}
              className="px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Export CSV
            </button>
          </div>
        </div>
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
          {(['overview', 'submissions', 'parents', 'tutors', 'rankings'] as const).map(tab => (
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
                  <p className="mt-1 text-xs text-gray-500">Tip: search by name, email, or submission ID.</p>
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
                    <option value="new">New</option>
                    <option value="pending">Pending</option>
                    <option value="contacted">Contacted</option>
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

                {hasActiveFilters && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">&nbsp;</label>
                    <button
                      onClick={handleClearFilters}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center gap-2"
                    >
                      <Filter size={18} />
                      Clear filters
                    </button>
                  </div>
                )}
              </div>

              <p className="text-sm text-gray-600">
                Showing {filteredSubmissions.length} of {submissions.length} submissions
              </p>
            </div>

            {/* Submissions Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {filteredSubmissions.length === 0 ? (
                <div className="p-10 text-center">
                  <div className="mx-auto w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                    <AlertCircle size={20} className="text-gray-500" />
                  </div>
                  <p className="text-gray-700 font-medium">No submissions found</p>
                  <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filters.</p>
                  {hasActiveFilters && (
                    <button
                      onClick={handleClearFilters}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      Clear filters
                    </button>
                  )}
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
                            {submission.data.parent_name || submission.data.full_name}
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
          <div className="space-y-4">
            {/* Parent Status Filter */}
            <div className="bg-white rounded-lg shadow p-4 flex flex-wrap gap-2">
              {['all', 'new', 'contacted', 'diagnostic_booked', 'matching', 'converted', 'follow_up', 'lost'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                    filterStatus === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status === 'all' ? 'All' : status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  {status !== 'all' && (
                    <span className="ml-1 opacity-75">
                      ({parentSubmissions.filter(s => s.status === status || s.data.status === status).length})
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              {parentSubmissions.filter(s => filterStatus === 'all' || s.status === filterStatus || s.data.status === filterStatus).length === 0 ? (
                <div className="p-8 text-center text-gray-500">No parent submissions found</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Parent</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Contact</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Level</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Subjects</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Mode</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Tutor Type</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Submitted</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parentSubmissions
                        .filter(s => filterStatus === 'all' || s.status === filterStatus || s.data.status === filterStatus)
                        .map(s => (
                        <tr key={s.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">
                            <div className="font-medium text-gray-900">{s.data.parent_name || s.data.parentName}</div>
                            <div className="text-xs text-gray-500">{s.data.email}</div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{s.data.contact_number || s.data.phone}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{s.data.student_level || s.data.level}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            <div className="flex flex-wrap gap-1">
                              {(Array.isArray(s.data.subjects) ? s.data.subjects : []).slice(0, 3).map((subj: string) => (
                                <span key={subj} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                                  {subj}
                                </span>
                              ))}
                              {Array.isArray(s.data.subjects) && s.data.subjects.length > 3 && (
                                <span className="text-xs text-gray-400">+{s.data.subjects.length - 3}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{s.data.preferred_mode || s.data.assignmentType || '—'}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{s.data.budget_range || '—'}</td>
                          <td className="px-4 py-3 text-sm">
                            <select
                              value={s.status}
                              onChange={(e) => handleStatusUpdate(s.id, e.target.value)}
                              className={`px-2 py-1 rounded text-xs font-medium border-0 cursor-pointer ${
                                s.status === 'new' ? 'bg-blue-100 text-blue-800' :
                                s.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                                s.status === 'diagnostic_booked' ? 'bg-purple-100 text-purple-800' :
                                s.status === 'matching' ? 'bg-indigo-100 text-indigo-800' :
                                s.status === 'converted' ? 'bg-green-100 text-green-800' :
                                s.status === 'follow_up' ? 'bg-orange-100 text-orange-800' :
                                s.status === 'lost' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}
                            >
                              <option value="new">New</option>
                              <option value="contacted">Contacted</option>
                              <option value="diagnostic_booked">Diagnostic Booked</option>
                              <option value="matching">Matching</option>
                              <option value="converted">Converted</option>
                              <option value="follow_up">Follow Up</option>
                              <option value="lost">Lost</option>
                            </select>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {new Date(s.submittedAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <button
                              onClick={() => { setSelectedSubmission(s); setShowDetailsModal(true); }}
                              className="text-blue-600 hover:text-blue-900 font-medium"
                            >
                              View
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

        {activeTab === 'tutors' && (
          <div className="space-y-4">
            {/* Tutor Status Filter */}
            <div className="bg-white rounded-lg shadow p-4 flex flex-wrap gap-2">
              {['all', 'account_created', 'profile_incomplete', 'pending_review', 'more_info_requested', 'approved', 'rejected', 'active', 'inactive'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                    filterStatus === status
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status === 'all' ? 'All' : status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  {status !== 'all' && (
                    <span className="ml-1 opacity-75">
                      ({tutorSubmissions.filter(s => s.status === status || s.data.status === status).length})
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              {tutorSubmissions.filter(s => filterStatus === 'all' || s.status === filterStatus || s.data.status === filterStatus).length === 0 ? (
                <div className="p-8 text-center text-gray-500">No tutor applications found</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Tutor</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Contact</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Experience</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Subjects</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Documents</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Interview</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tutorSubmissions
                        .filter(s => filterStatus === 'all' || s.status === filterStatus || s.data.status === filterStatus)
                        .map(s => (
                        <tr key={s.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">
                            <div className="font-medium text-gray-900">{s.data.fullName || s.data.full_name || s.data.name}</div>
                            <div className="text-xs text-gray-500">{s.data.email}</div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{s.data.phone || s.data.contact_number || '—'}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{s.data.experienceYears || s.data.experience_years || '—'} yrs</td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            <div className="flex flex-wrap gap-1">
                              {(Array.isArray(s.data.subjects) ? s.data.subjects : []).slice(0, 3).map((subj: string) => (
                                <span key={subj} className="px-1.5 py-0.5 bg-green-50 text-green-700 rounded text-xs">
                                  {subj}
                                </span>
                              ))}
                              {Array.isArray(s.data.subjects) && s.data.subjects.length > 3 && (
                                <span className="text-xs text-gray-400">+{s.data.subjects.length - 3}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              s.data.documents_uploaded ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                            }`}>
                              {s.data.documents_uploaded ? '✓ Uploaded' : 'Pending'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              s.data.ai_interview_completed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                            }`}>
                              {s.data.ai_interview_completed ? '✓ Done' : 'Pending'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <select
                              value={s.status}
                              onChange={(e) => handleStatusUpdate(s.id, e.target.value)}
                              className={`px-2 py-1 rounded text-xs font-medium border-0 cursor-pointer ${
                                s.status === 'account_created' ? 'bg-gray-100 text-gray-800' :
                                s.status === 'profile_incomplete' ? 'bg-yellow-100 text-yellow-800' :
                                s.status === 'pending_review' ? 'bg-blue-100 text-blue-800' :
                                s.status === 'more_info_requested' ? 'bg-orange-100 text-orange-800' :
                                s.status === 'approved' ? 'bg-green-100 text-green-800' :
                                s.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                s.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                                s.status === 'inactive' ? 'bg-gray-200 text-gray-600' :
                                'bg-gray-100 text-gray-800'
                              }`}
                            >
                              <option value="account_created">Account Created</option>
                              <option value="profile_incomplete">Profile Incomplete</option>
                              <option value="pending_review">Pending Review</option>
                              <option value="more_info_requested">More Info Requested</option>
                              <option value="approved">Approved</option>
                              <option value="rejected">Rejected</option>
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                            </select>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <button
                              onClick={() => { setSelectedSubmission(s); setShowDetailsModal(true); }}
                              className="text-blue-600 hover:text-blue-900 font-medium"
                            >
                              View
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

        {activeTab === 'rankings' && (
          <AdminTutorRanking />
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="sticky top-0 bg-gray-50 border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">
                {selectedSubmission.type === 'parent' ? selectedSubmission.data.parent_name : selectedSubmission.data.full_name}
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
                  <p className="text-gray-900">{selectedSubmission.data.contact_number || selectedSubmission.data.phone}</p>
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
