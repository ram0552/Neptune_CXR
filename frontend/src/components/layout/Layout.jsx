import { Outlet } from 'react-router-dom';
import Header from './Header';

export default function Layout() {
  return (
    <div className="min-h-screen bg-[var(--color-surface-secondary)]">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <footer className="border-t border-[var(--color-border)] py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs text-[var(--color-text-muted)]">
            NEPTUNE-CXR — Trustworthy Multi-Label Thoracic Disease Screening System
          </p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            For research and educational purposes only. Not for clinical use.
          </p>
        </div>
      </footer>
    </div>
  );
}
