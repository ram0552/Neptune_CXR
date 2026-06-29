import { Link } from 'react-router-dom';
import {
  Upload, Shield, Brain, FileText, BarChart3,
  Stethoscope, Layers, ArrowRight, Activity, Cpu, Database, Eye
} from 'lucide-react';

const workflowSteps = [
  { icon: Upload, title: 'Upload X-ray', desc: 'Upload a frontal chest X-ray in PNG or JPEG format' },
  { icon: Cpu, title: 'AI Analysis', desc: 'DenseNet121 performs multi-label disease classification' },
  { icon: Eye, title: 'GradCAM Explanation', desc: 'Visual heatmap highlighting regions of AI focus' },
  { icon: Shield, title: 'Confidence Estimation', desc: 'Calibrated probability with clinical risk assessment' },
  { icon: FileText, title: 'Clinical Report', desc: 'Structured screening report with actionable findings' },
  { icon: Database, title: 'Report Storage', desc: 'Persistent storage with search, filter, and analytics' },
];

const features = [
  {
    icon: Brain,
    title: 'Multi-Label Prediction',
    desc: '14 thoracic disease classes detected simultaneously using deep convolutional neural network analysis.',
  },
  {
    icon: Eye,
    title: 'Explainable AI',
    desc: 'GradCAM visualization with anatomically grounded explanations connecting evidence to clinical findings.',
  },
  {
    icon: Shield,
    title: 'Trustworthy Output',
    desc: 'Confidence estimation, risk stratification, and calibrated uncertainty — not just raw probabilities.',
  },
  {
    icon: Layers,
    title: 'Modular Architecture',
    desc: 'Plugin-based model registry designed for future integration of ViT, GNN, and neuro-symbolic reasoning.',
  },
  {
    icon: Stethoscope,
    title: 'Clinical Workflow',
    desc: 'Simulates a real hospital screening pathway from image upload to structured clinical report.',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    desc: 'Visual analytics for disease distribution, confidence trends, and screening volume monitoring.',
  },
];

const diseases = [
  'Atelectasis', 'Cardiomegaly', 'Consolidation', 'Edema',
  'Effusion', 'Emphysema', 'Fibrosis', 'Hernia',
  'Infiltration', 'Mass', 'Nodule', 'Pleural Thickening',
  'Pneumonia', 'Pneumothorax'
];

export default function LandingPage() {
  return (
    <div className="fade-in">
      {/* ── Hero Section ── */}
      <section className="text-center py-12 sm:py-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-primary-50)] border border-[var(--color-primary-200)] mb-6">
          <Activity className="w-4 h-4 text-[var(--color-primary-600)]" />
          <span className="text-sm font-medium text-[var(--color-primary-700)]">
            AI-Powered Chest X-ray Screening
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold text-[var(--color-text-primary)] mb-4 tracking-tight">
          NEPTUNE-CXR
        </h1>
        <p className="text-xl text-[var(--color-text-secondary)] mb-2 font-medium">
          Trustworthy Multi-Label Thoracic Disease Screening System
        </p>
        <p className="text-base text-[var(--color-text-muted)] max-w-2xl mx-auto mb-8">
          An end-to-end AI screening platform demonstrating modern full-stack engineering,
          modular AI integration, explainable medical AI, and structured clinical reporting.
        </p>

        <div className="flex items-center justify-center gap-3">
          <Link to="/upload" className="btn btn-primary btn-lg">
            <Upload className="w-5 h-5" />
            Start Screening
          </Link>
          <Link to="/dashboard" className="btn btn-secondary btn-lg">
            <BarChart3 className="w-5 h-5" />
            View Dashboard
          </Link>
        </div>
      </section>

      {/* ── Workflow Section ── */}
      <section className="py-12">
        <h2 className="text-2xl font-bold text-center mb-2">Screening Workflow</h2>
        <p className="text-sm text-[var(--color-text-muted)] text-center mb-8">
          End-to-end pipeline from X-ray upload to clinical report generation
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {workflowSteps.map((step, idx) => (
            <div key={idx} className="card card-hover flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[var(--color-primary-50)] flex items-center justify-center">
                <span className="text-sm font-bold text-[var(--color-primary-600)]">{idx + 1}</span>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">{step.title}</h3>
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features Section ── */}
      <section className="py-12">
        <h2 className="text-2xl font-bold text-center mb-2">Key Capabilities</h2>
        <p className="text-sm text-[var(--color-text-muted)] text-center mb-8">
          Built for academic research with production-quality engineering
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, idx) => (
            <div key={idx} className="card card-hover">
              <div className="w-10 h-10 rounded-lg bg-[var(--color-primary-50)] flex items-center justify-center mb-3">
                <feature.icon className="w-5 h-5 text-[var(--color-primary-600)]" />
              </div>
              <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-2">{feature.title}</h3>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Disease Coverage ── */}
      <section className="py-12">
        <h2 className="text-2xl font-bold text-center mb-2">Disease Coverage</h2>
        <p className="text-sm text-[var(--color-text-muted)] text-center mb-6">
          14-class multi-label classification aligned with ChestX-ray14 / CheXpert
        </p>

        <div className="card">
          <div className="flex flex-wrap gap-2 justify-center">
            {diseases.map((disease) => (
              <span key={disease} className="badge badge-info">{disease}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tech Stack ── */}
      <section className="py-12">
        <h2 className="text-2xl font-bold text-center mb-6">Architecture</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card text-center">
            <div className="w-12 h-12 rounded-xl bg-[#61dafb15] flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">⚛️</span>
            </div>
            <h3 className="font-semibold text-sm mb-1">Frontend</h3>
            <p className="text-xs text-[var(--color-text-secondary)]">
              React + Vite + TailwindCSS
            </p>
          </div>
          <div className="card text-center">
            <div className="w-12 h-12 rounded-xl bg-[#68a06315] flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">🟢</span>
            </div>
            <h3 className="font-semibold text-sm mb-1">Backend</h3>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Node.js + Express + MongoDB
            </p>
          </div>
          <div className="card text-center">
            <div className="w-12 h-12 rounded-xl bg-[#306998]15 flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">🐍</span>
            </div>
            <h3 className="font-semibold text-sm mb-1">AI Service</h3>
            <p className="text-xs text-[var(--color-text-secondary)]">
              FastAPI + PyTorch + GradCAM
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-12 text-center">
        <div className="card inline-block px-12 py-8">
          <h2 className="text-xl font-bold mb-2">Ready to Screen?</h2>
          <p className="text-sm text-[var(--color-text-secondary)] mb-4">
            Upload a chest X-ray to experience the full AI screening pipeline.
          </p>
          <Link to="/upload" className="btn btn-primary btn-lg">
            <Upload className="w-5 h-5" />
            Upload Chest X-ray
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
