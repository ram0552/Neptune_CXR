/**
 * Utility helpers and constants for the NEPTUNE-CXR frontend.
 */

// Risk level → badge class mapping
export const getRiskBadgeClass = (level) => {
  const map = {
    'Critical': 'badge-critical',
    'High': 'badge-high',
    'Moderate': 'badge-moderate',
    'Low': 'badge-low',
    'Minimal': 'badge-minimal',
  };
  return map[level] || 'badge-minimal';
};

// Risk level → color for charts
export const getRiskColor = (level) => {
  const map = {
    'Critical': '#dc2626',
    'High': '#f97316',
    'Moderate': '#eab308',
    'Low': '#22c55e',
    'Minimal': '#6b7280',
  };
  return map[level] || '#6b7280';
};

// Confidence bar color based on probability
export const getConfidenceColor = (probability) => {
  if (probability >= 0.9) return '#dc2626';
  if (probability >= 0.7) return '#f97316';
  if (probability >= 0.5) return '#eab308';
  if (probability >= 0.3) return '#3b82f6';
  return '#22c55e';
};

// Format probability as percentage
export const formatPercent = (value) => `${(value * 100).toFixed(1)}%`;

// Format date
export const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Format date short
export const formatDateShort = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Chart colors palette
export const CHART_COLORS = [
  '#3b82f6', '#14b8a6', '#f97316', '#8b5cf6', '#ec4899',
  '#22c55e', '#eab308', '#06b6d4', '#f43f5e', '#a855f7',
  '#10b981', '#6366f1', '#f59e0b', '#ef4444'
];

// Disease labels
export const DISEASE_LABELS = [
  'Atelectasis', 'Cardiomegaly', 'Consolidation', 'Edema',
  'Effusion', 'Emphysema', 'Fibrosis', 'Hernia',
  'Infiltration', 'Mass', 'Nodule', 'Pleural Thickening',
  'Pneumonia', 'Pneumothorax'
];

// File validation
export const ACCEPTED_FILE_TYPES = {
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
};

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
