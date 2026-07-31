import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, RefreshCw, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const domainsList = ['All', 'AI', 'Web Development', 'App Development', 'Competitive Programming', 'Design Team', 'Content Team', 'Event Management'];
const statusList = ['All', 'Pending', 'Under Review', 'Interview Scheduled', 'Task Assigned', 'Interview Completed', 'Selected', 'Rejected'];

const AdminDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [apps, setApps] = useState([]);
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filter & Query States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch Stats
      const statsRes = await axios.get('http://localhost:5000/api/applications/admin/stats');
      setStats(statsRes.data.stats);
      setCharts(statsRes.data.charts);

      // 2. Fetch Paginated Application Lists
      const domainFilter = selectedDomain === 'CP' ? 'Competitive Programming' : selectedDomain;
      const listRes = await axios.get('http://localhost:5000/api/applications/admin/list', {
        params: {
          searchQuery,
          domain: domainFilter,
          status: selectedStatus,
          page,
          limit: 6,
          sortBy,
          sortOrder
        }
      });
      setApps(listRes.data.applications);
      setTotalPages(listRes.data.totalPages);
      setTotalCount(listRes.data.totalCount);
    } catch (err) {
      console.error(err);
      showToast('Error syncing administrative data tables.', 'error');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedDomain, selectedStatus, sortBy, sortOrder, page, showToast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const getMaxChartValue = (chartMap) => {
    if (!chartMap) return 1;
    const values = Object.values(chartMap);
    return values.length > 0 ? Math.max(...values) : 1;
  };

  return (
    <div className="w-full min-h-screen bg-brand-brown-dark py-12 px-6 md:px-12 relative overflow-hidden">
      {/* Orbs */}
      <div className="absolute top-[5%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-brand-gold/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col gap-10 relative z-10">
        
        {/* Banner */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-brand-gold font-bold">Admin Desk</span>
            <h1 className="font-display text-3xl font-extrabold text-white mt-1">Club Recruitment Dashboard</h1>
          </div>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Data
          </button>
        </div>

        {/* Stats Dashboard Grid */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="glass-card p-5 border border-white/5 flex flex-col gap-1.5">
              <span className="text-[10px] text-white/40 uppercase font-bold">Total Applications</span>
              <p className="text-2xl font-extrabold text-white">{stats.total}</p>
            </div>
            <div className="glass-card p-5 border border-white/5 flex flex-col gap-1.5 border-l-4 border-l-yellow-500">
              <span className="text-[10px] text-yellow-500/80 uppercase font-bold">Pending Review</span>
              <p className="text-2xl font-extrabold text-white">{stats.pending + stats.underReview}</p>
            </div>
            <div className="glass-card p-5 border border-white/5 flex flex-col gap-1.5 border-l-4 border-l-brand-gold">
              <span className="text-[10px] text-brand-gold uppercase font-bold">Interview Stages</span>
              <p className="text-2xl font-extrabold text-white">{stats.interview + stats.taskAssigned + (stats.taskSubmitted || 0) + (stats.interviewCompleted || 0)}</p>
            </div>
            <div className="glass-card p-5 border border-white/5 flex flex-col gap-1.5 border-l-4 border-l-green-500">
              <span className="text-[10px] text-green-400 uppercase font-bold">Selected</span>
              <p className="text-2xl font-extrabold text-white">{stats.selected}</p>
            </div>
            <div className="glass-card p-5 border border-white/5 flex flex-col gap-1.5 border-l-4 border-l-red-500 col-span-2 md:col-span-1">
              <span className="text-[10px] text-red-400/80 uppercase font-bold">Rejected</span>
              <p className="text-2xl font-extrabold text-white">{stats.rejected}</p>
            </div>
          </div>
        )}

        {/* Aggregation Charts section */}
        {charts && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Chart 1: Domain Distribution */}
            <div className="glass-card p-6 border border-white/5 flex flex-col gap-4">
              <h3 className="text-xs uppercase tracking-wider font-extrabold text-white/50 border-b border-white/5 pb-2">Applications by Domain</h3>
              <div className="flex flex-col gap-3.5 mt-2">
                {Object.entries(charts.domain).map(([dom, val]) => {
                  const maxVal = getMaxChartValue(charts.domain);
                  const percentage = Math.round((val / maxVal) * 100);
                  return (
                    <div key={dom} className="flex flex-col gap-1 text-xs">
                      <div className="flex justify-between text-white/70">
                        <span className="font-semibold truncate max-w-[150px]">{dom}</span>
                        <span className="font-mono">{val}</span>
                      </div>
                      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                        <div className="bg-brand-gold h-full rounded-full" style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  );
                })}
                {Object.keys(charts.domain).length === 0 && <p className="text-xs text-white/30 text-center py-4">No data.</p>}
              </div>
            </div>

            {/* Chart 2: Branch Distribution */}
            <div className="glass-card p-6 border border-white/5 flex flex-col gap-4">
              <h3 className="text-xs uppercase tracking-wider font-extrabold text-white/50 border-b border-white/5 pb-2">Applications by Branch</h3>
              <div className="flex flex-col gap-3.5 mt-2">
                {Object.entries(charts.branch).map(([branch, val]) => {
                  const maxVal = getMaxChartValue(charts.branch);
                  const percentage = Math.round((val / maxVal) * 100);
                  return (
                    <div key={branch} className="flex flex-col gap-1 text-xs">
                      <div className="flex justify-between text-white/70">
                        <span className="font-semibold">{branch}</span>
                        <span className="font-mono">{val}</span>
                      </div>
                      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                        <div className="bg-brand-gold h-full rounded-full" style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  );
                })}
                {Object.keys(charts.branch).length === 0 && <p className="text-xs text-white/30 text-center py-4">No data.</p>}
              </div>
            </div>

            {/* Chart 3: Year Distribution */}
            <div className="glass-card p-6 border border-white/5 flex flex-col gap-4">
              <h3 className="text-xs uppercase tracking-wider font-extrabold text-white/50 border-b border-white/5 pb-2">Applications by Year</h3>
              <div className="flex flex-col gap-3.5 mt-2">
                {Object.entries(charts.year).map(([year, val]) => {
                  const maxVal = getMaxChartValue(charts.year);
                  const percentage = Math.round((val / maxVal) * 100);
                  return (
                    <div key={year} className="flex flex-col gap-1 text-xs">
                      <div className="flex justify-between text-white/70">
                        <span className="font-semibold">{year} Year</span>
                        <span className="font-mono">{val}</span>
                      </div>
                      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                        <div className="bg-brand-gold h-full rounded-full" style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* Filter Controls & List Table */}
        <div className="glass-card p-6 border border-white/5 flex flex-col gap-6">
          
          {/* Header query filters */}
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            {/* Search Input */}
            <div className="relative w-full lg:max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by student name, register no..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap gap-3 w-full lg:w-auto justify-end">
              {/* Domain select */}
              <select
                value={selectedDomain}
                onChange={(e) => { setSelectedDomain(e.target.value); setPage(1); }}
                className="bg-white/5 border border-white/10 text-white text-xs px-3 py-2 rounded-xl focus:outline-none"
              >
                <option value="All" className="bg-brand-brown">All Domains</option>
                {domainsList.slice(1).map(d => (
                  <option key={d} value={d} className="bg-brand-brown">{d}</option>
                ))}
              </select>

              {/* Status select */}
              <select
                value={selectedStatus}
                onChange={(e) => { setSelectedStatus(e.target.value); setPage(1); }}
                className="bg-white/5 border border-white/10 text-white text-xs px-3 py-2 rounded-xl focus:outline-none"
              >
                <option value="All" className="bg-brand-brown">All Statuses</option>
                {statusList.slice(1).map(s => (
                  <option key={s} value={s} className="bg-brand-brown">{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Table Data Grid */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/5 text-white/40 font-bold uppercase tracking-wider">
                  <th className="py-4 px-4 cursor-pointer hover:text-white" onClick={() => toggleSort('applicationId')}>
                    App ID <ArrowUpDown className="inline w-3 h-3 ml-1" />
                  </th>
                  <th className="py-4 px-4">Candidate Details</th>
                  <th className="py-4 px-4">Domain</th>
                  <th className="py-4 px-4">Resume Score</th>
                  <th className="py-4 px-4">Interview Score</th>
                  <th className="py-4 px-4 cursor-pointer hover:text-white" onClick={() => toggleSort('createdAt')}>
                    Date Applied <ArrowUpDown className="inline w-3 h-3 ml-1" />
                  </th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {apps.map((app) => (
                  <tr key={app._id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-white">{app.applicationId}</td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-white">{app.userId?.name || 'Local Candidate'}</span>
                        <span className="text-[10px] text-white/50">{app.userId?.email || 'N/A'} | {app.userId?.deptYear}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 bg-brand-gold/10 text-brand-gold rounded-md border border-brand-gold/10 font-medium">
                        {app.preferredDomain}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-mono text-white/70 font-semibold">{app.resumeScore || 0}/100</td>
                    <td className="py-4 px-4 font-mono text-brand-gold font-bold">
                      {app.juryScore?.overallRating ? `${app.juryScore.overallRating}/10` : 'N/A'}
                    </td>
                    <td className="py-4 px-4 text-white/50">{new Date(app.createdAt).toLocaleDateString()}</td>
                    <td className="py-4 px-4">
                      <span className={`font-semibold uppercase tracking-wider text-[10px] ${
                        app.status === 'Selected' ? 'text-green-400' :
                        app.status === 'Rejected' ? 'text-red-400' :
                        'text-brand-gold'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => navigate(`/admin/applications/${app._id}`)}
                        className="px-3.5 py-1.5 bg-brand-gold hover:bg-brand-gold-light text-brand-brown-dark font-bold rounded-lg cursor-pointer flex items-center gap-1 ml-auto"
                      >
                        <Eye className="w-3.5 h-3.5" /> Review
                      </button>
                    </td>
                  </tr>
                ))}
                {apps.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-white/30">
                      {loading ? 'Fetching records...' : 'No applications found matching parameters.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center border-t border-white/5 pt-4 text-white/50 text-xs">
              <span>Showing Page {page} of {totalPages} ({totalCount} rows)</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="p-2 border border-white/10 rounded-lg hover:bg-white/5 disabled:opacity-30 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                  className="p-2 border border-white/10 rounded-lg hover:bg-white/5 disabled:opacity-30 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
