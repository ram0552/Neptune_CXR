import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import {
  Activity, FileText, Clock, TrendingUp, BarChart3,
  AlertCircle, CheckCircle, RefreshCw
} from 'lucide-react';
import { getDashboardStats } from '../services/api';
import { CHART_COLORS, formatPercent, formatDateShort, getRiskColor } from '../utils/helpers';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getDashboardStats();
      if (result.success) setStats(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="spinner spinner-lg mx-auto mb-4" />
          <p className="text-sm text-[var(--color-text-secondary)]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-10 h-10 text-[var(--color-risk-moderate)] mx-auto mb-3" />
        <p className="text-sm text-[var(--color-text-secondary)]">{error}</p>
        <button onClick={loadStats} className="btn btn-primary btn-sm mt-3">
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  const aiStatus = stats?.aiServiceStatus;

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
            System overview and screening analytics
          </p>
        </div>
        <button onClick={loadStats} className="btn btn-secondary btn-sm">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <FileText className="w-5 h-5 text-[var(--color-primary-500)]" />
          </div>
          <p className="stat-value">{stats?.totalReports || 0}</p>
          <p className="stat-label">Total Screenings</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-[var(--color-accent-500)]" />
          </div>
          <p className="stat-value">{stats?.avgConfidence || 0}%</p>
          <p className="stat-label">Avg Confidence</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <p className="stat-value">{stats?.avgInferenceTime || 0}<span className="text-sm font-normal">ms</span></p>
          <p className="stat-label">Avg Inference Time</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            {aiStatus?.model_loaded
              ? <CheckCircle className="w-5 h-5 text-green-500" />
              : <AlertCircle className="w-5 h-5 text-amber-500" />
            }
          </div>
          <p className="stat-value text-lg">{aiStatus?.model_name || 'N/A'}</p>
          <p className="stat-label">
            AI Model {aiStatus?.model_loaded
              ? <span className="status-dot status-dot-healthy ml-1" />
              : <span className="status-dot status-dot-warning ml-1" />
            }
          </p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Disease Distribution Bar Chart */}
        <div className="card">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[var(--color-primary-500)]" />
            Disease Distribution
          </h2>
          {stats?.diseaseDistribution?.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.diseaseDistribution} margin={{ top: 5, right: 5, bottom: 50, left: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" />
                <XAxis
                  dataKey="disease"
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                  tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }}
                  height={60}
                />
                <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} />
                <Tooltip
                  contentStyle={{
                    background: 'white',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    boxShadow: 'var(--shadow-elevated)'
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {stats.diseaseDistribution.map((_, idx) => (
                    <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-[var(--color-text-muted)] text-center py-12">No data yet</p>
          )}
        </div>

        {/* Disease Pie Chart */}
        <div className="card">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-[var(--color-accent-500)]" />
            Disease Frequency
          </h2>
          {stats?.diseaseDistribution?.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.diseaseDistribution}
                  dataKey="count"
                  nameKey="disease"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={110}
                  paddingAngle={2}
                  label={({ disease, percent }) => `${disease} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {stats.diseaseDistribution.map((_, idx) => (
                    <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'white',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-[var(--color-text-muted)] text-center py-12">No data yet</p>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Daily Uploads Line Chart */}
        <div className="card">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            Daily Uploads (Last 30 Days)
          </h2>
          {stats?.dailyUploads?.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={stats.dailyUploads} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDateShort}
                  tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }}
                />
                <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} allowDecimals={false} />
                <Tooltip
                  labelFormatter={(val) => `Date: ${val}`}
                  contentStyle={{
                    background: 'white',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="var(--color-primary-500)"
                  strokeWidth={2}
                  dot={{ fill: 'var(--color-primary-500)', r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-[var(--color-text-muted)] text-center py-12">No upload history</p>
          )}
        </div>

        {/* Risk Distribution */}
        <div className="card">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            Risk Level Distribution
          </h2>
          {stats?.riskDistribution?.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.riskDistribution} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} />
                <YAxis type="category" dataKey="level" tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} width={70} />
                <Tooltip
                  contentStyle={{
                    background: 'white',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {stats.riskDistribution.map((entry, idx) => (
                    <Cell key={idx} fill={getRiskColor(entry.level)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-[var(--color-text-muted)] text-center py-12">No risk data</p>
          )}
        </div>
      </div>

      {/* Recent Reports */}
      {stats?.recentReports?.length > 0 && (
        <div className="card">
          <h2 className="text-sm font-semibold mb-3">Recent Screenings</h2>
          <div className="space-y-2">
            {stats.recentReports.map((r, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 px-3 rounded-lg bg-[var(--color-surface-secondary)]">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium truncate max-w-[200px]">{r.originalFilename}</span>
                  <span className="badge badge-info">{r.topFinding}</span>
                </div>
                <span className="text-xs text-[var(--color-text-muted)]">{formatDateShort(r.createdAt)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
