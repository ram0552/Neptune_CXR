import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, FileText, Clock, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { getReports } from '../services/api';
import { formatDate, getRiskBadgeClass, formatPercent, DISEASE_LABELS } from '../utils/helpers';

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1, limit: 10 });
  const [search, setSearch] = useState('');
  const [diseaseFilter, setDiseaseFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    loadReports();
  }, [pagination.page, search, diseaseFilter, sortBy, sortOrder]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        sortBy,
        sortOrder,
      };
      if (search) params.search = search;
      if (diseaseFilter) params.disease = diseaseFilter;

      const result = await getReports(params);
      if (result.success) {
        setReports(result.data.reports);
        setPagination(prev => ({ ...prev, ...result.data.pagination }));
      }
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Screening Reports</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
            {pagination.total} report{pagination.total !== 1 ? 's' : ''} total
          </p>
        </div>
        <Link to="/upload" className="btn btn-primary btn-sm">
          <FileText className="w-4 h-4" /> New Screening
        </Link>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder="Search by filename..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-[var(--color-border)] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-200)] focus:border-[var(--color-primary-400)]"
            />
          </form>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
            <select
              value={diseaseFilter}
              onChange={e => { setDiseaseFilter(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
              className="pl-9 pr-8 py-2 text-sm border border-[var(--color-border)] rounded-lg bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-200)]"
            >
              <option value="">All Diseases</option>
              {DISEASE_LABELS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="spinner spinner-lg" />
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-10 h-10 text-[var(--color-text-muted)] mx-auto mb-3" />
            <p className="text-sm text-[var(--color-text-secondary)]">No reports found</p>
            <Link to="/upload" className="btn btn-primary btn-sm mt-3">Upload X-ray</Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th
                      className="cursor-pointer select-none"
                      onClick={() => toggleSort('createdAt')}
                    >
                      <span className="flex items-center gap-1">
                        Date <ArrowUpDown className="w-3 h-3" />
                      </span>
                    </th>
                    <th>Image</th>
                    <th>Top Finding</th>
                    <th>Findings</th>
                    <th>
                      <span
                        className="flex items-center gap-1 cursor-pointer select-none"
                        onClick={() => toggleSort('inferenceTimeMs')}
                      >
                        Inference <ArrowUpDown className="w-3 h-3" />
                      </span>
                    </th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r) => {
                    const topPred = r.predictions?.find(p => p.disease === r.topFinding);
                    return (
                      <tr key={r._id}>
                        <td className="text-xs whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                            {formatDate(r.createdAt)}
                          </div>
                        </td>
                        <td className="font-medium text-xs truncate max-w-[140px]">{r.originalFilename}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{r.topFinding}</span>
                            {topPred && (
                              <span className={`badge ${getRiskBadgeClass(topPred.risk_level)}`}>
                                {formatPercent(topPred.probability)}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-info">
                            {r.positiveFindings?.length || 0}
                          </span>
                        </td>
                        <td className="text-xs text-[var(--color-text-muted)]">
                          {r.inferenceTimeMs?.toFixed(0)}ms
                        </td>
                        <td>
                          <span className={`badge ${r.reportStatus === 'completed' ? 'badge-low' : 'badge-minimal'}`}>
                            {r.reportStatus}
                          </span>
                        </td>
                        <td>
                          <Link to={`/analysis/${r._id}`} className="btn btn-ghost btn-sm">
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--color-border)]">
                <span className="text-xs text-[var(--color-text-muted)]">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                    disabled={pagination.page <= 1}
                    className="btn btn-ghost btn-sm"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                    disabled={pagination.page >= pagination.pages}
                    className="btn btn-ghost btn-sm"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
