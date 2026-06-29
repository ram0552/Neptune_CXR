import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import {
  Upload, Image as ImageIcon, X, FileImage, AlertCircle,
  CheckCircle, Loader
} from 'lucide-react';
import { analyzeImage } from '../services/api';
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE } from '../utils/helpers';

export default function UploadPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [stage, setStage] = useState(''); // upload, analyzing

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setError(null);

    if (rejectedFiles.length > 0) {
      const err = rejectedFiles[0].errors[0];
      if (err.code === 'file-too-large') {
        setError('File is too large. Maximum size is 10MB.');
      } else if (err.code === 'file-invalid-type') {
        setError('Invalid file type. Please upload a PNG or JPEG image.');
      } else {
        setError(err.message);
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: false
  });

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    setProgress(0);
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      // Upload phase
      setStage('upload');
      const result = await analyzeImage(file, (p) => {
        setProgress(p);
        if (p >= 100) setStage('analyzing');
      });

      setStage('');

      if (result.success && result.data) {
        navigate(`/analysis/${result.data.reportId}`, {
          state: { report: result.data.report }
        });
      }
    } catch (err) {
      setError(err.message);
      setStage('');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fade-in mt-4 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Upload Chest X-ray</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Upload a frontal chest X-ray image for AI-powered multi-label disease screening
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">Upload Error</p>
            <p className="text-sm text-red-700 mt-0.5">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {!file ? (
        /* ── Dropzone ── */
        <div
          {...getRootProps()}
          className={`dropzone ${isDragActive ? 'dropzone-active' : ''}`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary-50)] flex items-center justify-center">
              <Upload className="w-8 h-8 text-[var(--color-primary-500)]" />
            </div>
            <div>
              <p className="text-base font-medium text-[var(--color-text-primary)]">
                {isDragActive ? 'Drop your X-ray here' : 'Drag & drop your chest X-ray'}
              </p>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">
                or click to browse files
              </p>
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs text-[var(--color-text-muted)]">
              <span className="flex items-center gap-1">
                <FileImage className="w-3.5 h-3.5" /> PNG, JPEG, JPG
              </span>
              <span>Max 10MB</span>
            </div>
          </div>
        </div>
      ) : (
        /* ── Preview ── */
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Image Selected
            </h2>
            <button onClick={clearFile} className="btn btn-ghost btn-sm" disabled={uploading}>
              <X className="w-4 h-4" /> Remove
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-6">
            {/* Image preview */}
            <div className="flex-shrink-0">
              <div className="w-full sm:w-64 aspect-square rounded-lg overflow-hidden bg-black flex items-center justify-center border border-[var(--color-border)]">
                <img
                  src={preview}
                  alt="Chest X-ray preview"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            </div>

            {/* File info */}
            <div className="flex-1 min-w-0">
              <dl className="space-y-3">
                <div>
                  <dt className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">Filename</dt>
                  <dd className="text-sm text-[var(--color-text-primary)] truncate mt-0.5">{file.name}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">Size</dt>
                  <dd className="text-sm text-[var(--color-text-primary)] mt-0.5">{(file.size / 1024).toFixed(1)} KB</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">Type</dt>
                  <dd className="text-sm text-[var(--color-text-primary)] mt-0.5">{file.type}</dd>
                </div>
              </dl>

              {/* Progress */}
              {uploading && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-[var(--color-text-secondary)]">
                      {stage === 'upload' ? 'Uploading...' : 'AI analyzing...'}
                    </span>
                    <span className="text-xs text-[var(--color-text-muted)]">
                      {stage === 'upload' ? `${progress}%` : ''}
                    </span>
                  </div>
                  <div className="confidence-bar">
                    <div
                      className="confidence-bar-fill bg-[var(--color-primary-500)]"
                      style={{
                        width: stage === 'analyzing' ? '100%' : `${progress}%`,
                        ...(stage === 'analyzing' ? { animation: 'pulse-soft 1.5s ease-in-out infinite' } : {})
                      }}
                    />
                  </div>
                  {stage === 'analyzing' && (
                    <p className="text-xs text-[var(--color-text-muted)] mt-2 flex items-center gap-1.5">
                      <Loader className="w-3.5 h-3.5 animate-spin" />
                      Running DenseNet121 inference + GradCAM generation...
                    </p>
                  )}
                </div>
              )}

              {/* Analyze button */}
              {!uploading && (
                <button
                  onClick={handleAnalyze}
                  className="btn btn-primary btn-lg mt-6 w-full sm:w-auto"
                >
                  <ImageIcon className="w-5 h-5" />
                  Analyze X-ray
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Info ── */}
      <div className="ai-disclaimer mt-6">
        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-sm">AI Screening Disclaimer</p>
          <p className="mt-0.5">
            This system is for research and educational purposes only. Results should not
            be used for clinical decision-making without radiologist review.
          </p>
        </div>
      </div>
    </div>
  );
}
