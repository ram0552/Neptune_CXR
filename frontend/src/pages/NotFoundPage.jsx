import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="text-center py-20 fade-in">
      <h1 className="text-6xl font-bold text-[var(--color-text-muted)] mb-4">404</h1>
      <p className="text-lg text-[var(--color-text-secondary)] mb-6">Page not found</p>
      <Link to="/" className="btn btn-primary">
        <Home className="w-4 h-4" /> Back to Home
      </Link>
    </div>
  );
}
