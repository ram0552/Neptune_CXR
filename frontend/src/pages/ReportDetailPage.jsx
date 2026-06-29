import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Trash2, Clock, Cpu, Activity, AlertTriangle,
  FileImage, Download
} from 'lucide-react';
import { getReportById, deleteReport } from '../services/api';
import { formatDate, formatPercent, getConfidenceColor, getRiskBadgeClass } from '../utils/helpers';

export default function ReportDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadReport();
  }, [id]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const result = await getReportById(id);
      if (result.success) setReport(result.data);
    } catch (err) {
      console.error('Failed to load report:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Archive this report? It will be hidden from the reports list.')) return;
    try {
      setDeleting(true);
      await deleteReport(id);
      navigate('/reports');
    } catch (err) {
      console.error('Failed to delete:', err);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-20">
        <p className="text-[var(--color-text-secondary)]">Report not found.</p>
        <Link to="/reports" className="btn btn-primary mt-4">Back to Reports</Link>
      </div>
    );
  }

  const positiveFindings = report.predictions?.filter(p => p.is_positive) || [];

  return (
    <div className="fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link to="/reports" className="btn btn-ghost btn-sm">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Clinical Screening Report</h1>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Report ID: {report._id}
            </p>
          </div>
        </div>
        <button onClick={handleDelete} className="btn btn-danger btn-sm" disabled={deleting}>
          <Trash2 className="w-4 h-4" /> {deleting ? 'Archiving...' : 'Archive'}
        </button>
      </div>

      {/* Report Header Card */}
      <div className="card mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">Image</p>
            <p className="text-sm font-medium mt-1 truncate">{report.originalFilename}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">Date</p>
            <p className="text-sm mt-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {formatDate(report.createdAt)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">Model</p>
            <p className="text-sm mt-1 flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5" /> {report.modelName}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">Inference</p>
            <p className="text-sm mt-1 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5" /> {report.inferenceTimeMs?.toFixed(0)}ms
            </p>
          </div>
        </div>
      </div>

      {/* Images side by side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="card">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <FileImage className="w-4 h-4" /> Original X-ray
          </h3>
          <div className="aspect-square rounded-lg overflow-hidden bg-black flex items-center justify-center border border-[var(--color-border)]">
            <img src={`/uploads/${report.imageFilename}`} alt="Original X-ray" className="max-w-full max-h-full object-contain" />
          </div>
        </div>
        <div className="card">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4" /> GradCAM Heatmap
          </h3>
          <div className="aspect-square rounded-lg overflow-hidden bg-black flex items-center justify-center border border-[var(--color-border)]">
            {report.heatmapFilename ? (
              <img src={`/heatmaps/${report.heatmapFilename}`} alt="GradCAM heatmap" className="max-w-full max-h-full object-contain" />
            ) : (
              <p className="text-sm text-gray-400">Heatmap unavailable</p>
            )}
          </div>
        </div>
      </div>

      {/* Findings */}
      <div className="card mb-6">
        <h2 className="text-base font-semibold mb-4">Detected Findings</h2>
        {positiveFindings.length === 0 ? (
          <p className="text-sm text-[var(--color-text-secondary)]">No significant findings detected.</p>
        ) : (
          <div className="space-y-3">
            {positiveFindings.map((pred, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)]">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-sm">{pred.disease}</span>
                  <span className={`badge ${getRiskBadgeClass(pred.risk_level)}`}>{pred.risk_level}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="confidence-bar w-24">
                    <div
                      className="confidence-bar-fill"
                      style={{
                        width: `${pred.probability * 100}%`,
                        backgroundColor: getConfidenceColor(pred.probability)
                      }}
                    />
                  </div>
                  <span className="text-sm font-bold w-14 text-right" style={{ color: getConfidenceColor(pred.probability) }}>
                    {formatPercent(pred.probability)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Clinical Summary */}
      <div className="card mb-6">
        <h2 className="text-base font-semibold mb-3">Clinical Summary</h2>
        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{report.clinicalSummary}</p>

        {report.suggestedFollowUp && (
          <div className="mt-4 pt-4 border-t border-[var(--color-border-light)]">
            <h3 className="text-sm font-semibold mb-2">Suggested Follow-up</h3>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{report.suggestedFollowUp}</p>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="ai-disclaimer">
        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p>{report.aiDisclaimer}</p>
      </div>
    </div>
  );
}
