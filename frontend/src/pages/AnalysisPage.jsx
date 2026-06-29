import { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import {
  ArrowLeft, Download, Eye, EyeOff, AlertTriangle,
  Clock, Cpu, FileText, Activity, ChevronDown, ChevronUp
} from 'lucide-react';
import { getReportById } from '../services/api';
import { formatPercent, formatDate, getConfidenceColor, getRiskBadgeClass } from '../utils/helpers';

export default function AnalysisPage() {
  const { id } = useParams();
  const location = useLocation();
  const [report, setReport] = useState(location.state?.report || null);
  const [loading, setLoading] = useState(!report);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [expandedExplanations, setExpandedExplanations] = useState({});

  useEffect(() => {
    if (!report && id) {
      loadReport();
    }
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

  const toggleExplanation = (idx) => {
    setExpandedExplanations(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="spinner spinner-lg mx-auto mb-4" />
          <p className="text-sm text-[var(--color-text-secondary)]">Loading analysis results...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-20">
        <p className="text-[var(--color-text-secondary)]">Report not found.</p>
        <Link to="/upload" className="btn btn-primary mt-4">Upload New X-ray</Link>
      </div>
    );
  }

  const positiveFindings = report.predictions?.filter(p => p.is_positive) || [];
  const negativeFindings = report.predictions?.filter(p => !p.is_positive) || [];

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link to="/reports" className="btn btn-ghost btn-sm">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Screening Results</h1>
            <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
              {report.originalFilename} • {formatDate(report.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to={`/report/${report._id}`} className="btn btn-secondary btn-sm">
            <FileText className="w-4 h-4" /> Full Report
          </Link>
        </div>
      </div>

      {/* Meta badges */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)] bg-white px-3 py-1.5 rounded-full border border-[var(--color-border)]">
          <Clock className="w-3.5 h-3.5" />
          {report.inferenceTimeMs?.toFixed(0)}ms inference
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)] bg-white px-3 py-1.5 rounded-full border border-[var(--color-border)]">
          <Cpu className="w-3.5 h-3.5" />
          {report.modelName} {report.modelVersion}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)] bg-white px-3 py-1.5 rounded-full border border-[var(--color-border)]">
          <Activity className="w-3.5 h-3.5" />
          {positiveFindings.length} finding{positiveFindings.length !== 1 ? 's' : ''} detected
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ── Left: Images ── */}
        <div className="lg:col-span-2 space-y-4">
          {/* Image card */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold">
                {showHeatmap ? 'GradCAM Heatmap' : 'Original X-ray'}
              </h2>
              <button
                onClick={() => setShowHeatmap(!showHeatmap)}
                className="btn btn-ghost btn-sm"
              >
                {showHeatmap ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showHeatmap ? 'Original' : 'Heatmap'}
              </button>
            </div>

            <div className="aspect-square rounded-lg overflow-hidden bg-black flex items-center justify-center border border-[var(--color-border)]">
              {showHeatmap && report.heatmapFilename ? (
                <img
                  src={`/heatmaps/${report.heatmapFilename}`}
                  alt="GradCAM heatmap overlay"
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <img
                  src={`/uploads/${report.imageFilename}`}
                  alt="Original chest X-ray"
                  className="max-w-full max-h-full object-contain"
                />
              )}
            </div>
            <p className="text-xs text-[var(--color-text-muted)] mt-2 text-center">
              {showHeatmap
                ? 'Red/yellow regions indicate areas of highest AI attention'
                : 'Original uploaded chest X-ray image'
              }
            </p>
          </div>

          {/* Clinical Summary */}
          <div className="card">
            <h2 className="text-sm font-semibold mb-2">Clinical Summary</h2>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              {report.clinicalSummary}
            </p>

            {report.suggestedFollowUp && (
              <div className="mt-3 pt-3 border-t border-[var(--color-border-light)]">
                <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-1">
                  Suggested Follow-up
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {report.suggestedFollowUp}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Predictions ── */}
        <div className="lg:col-span-3 space-y-4">
          {/* Positive Findings */}
          {positiveFindings.length > 0 && (
            <div className="card">
              <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Detected Findings ({positiveFindings.length})
              </h2>
              <div className="space-y-3">
                {positiveFindings.map((pred, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)]">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-[var(--color-text-primary)]">
                          {pred.disease}
                        </span>
                        <span className={`badge ${getRiskBadgeClass(pred.risk_level)}`}>
                          {pred.risk_level}
                        </span>
                      </div>
                      <span className="text-sm font-bold" style={{ color: getConfidenceColor(pred.probability) }}>
                        {formatPercent(pred.probability)}
                      </span>
                    </div>

                    {/* Confidence bar */}
                    <div className="confidence-bar mb-2">
                      <div
                        className="confidence-bar-fill"
                        style={{
                          width: `${pred.probability * 100}%`,
                          backgroundColor: getConfidenceColor(pred.probability)
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
                      <span>Confidence: {pred.confidence_level}</span>
                      <span>{pred.affected_region}</span>
                    </div>

                    {/* Expandable explanation */}
                    {pred.explanation && (
                      <div className="mt-2">
                        <button
                          onClick={() => toggleExplanation(idx)}
                          className="text-xs text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] flex items-center gap-1"
                        >
                          {expandedExplanations[idx] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          AI Explanation
                        </button>
                        {expandedExplanations[idx] && (
                          <p className="mt-1.5 text-xs text-[var(--color-text-secondary)] leading-relaxed pl-4 border-l-2 border-[var(--color-primary-200)]">
                            {pred.explanation}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No findings */}
          {positiveFindings.length === 0 && (
            <div className="card text-center py-8">
              <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3">
                <Activity className="w-6 h-6 text-green-500" />
              </div>
              <h2 className="text-base font-semibold text-[var(--color-text-primary)]">No Significant Findings</h2>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                The AI screening did not detect significant thoracic abnormalities above the decision threshold.
              </p>
            </div>
          )}

          {/* Negative / Below threshold */}
          {negativeFindings.length > 0 && (
            <div className="card">
              <h2 className="text-sm font-semibold mb-3 text-[var(--color-text-secondary)]">
                Below Threshold ({negativeFindings.length})
              </h2>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Disease</th>
                    <th>Probability</th>
                    <th>Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {negativeFindings.map((pred, idx) => (
                    <tr key={idx}>
                      <td className="font-medium">{pred.disease}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="confidence-bar w-16">
                            <div
                              className="confidence-bar-fill bg-gray-300"
                              style={{ width: `${pred.probability * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-[var(--color-text-muted)]">
                            {formatPercent(pred.probability)}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-minimal">{pred.confidence_level}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* AI Disclaimer */}
      <div className="ai-disclaimer mt-6">
        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p>{report.aiDisclaimer}</p>
      </div>
    </div>
  );
}
