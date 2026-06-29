import { Link, useLocation } from 'react-router-dom';
import { Activity, Upload, FileText, BarChart3, Home } from 'lucide-react';

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/upload', label: 'Upload', icon: Upload },
  { path: '/reports', label: 'Reports', icon: FileText },
  { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
];

export default function Header() {
  const location = useLocation();

  return (
    <header className="bg-white border-b border-[var(--color-border)] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 text-decoration-none">
            <div className="w-9 h-9 rounded-lg bg-[var(--color-primary-600)] flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-[var(--color-text-primary)] tracking-tight">
                NEPTUNE-CXR
              </span>
              <span className="hidden sm:inline text-xs text-[var(--color-text-muted)] ml-2 font-normal">
                Thoracic Screening
              </span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            {navItems.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`
                    flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium
                    transition-colors duration-150 no-underline
                    ${isActive
                      ? 'bg-[var(--color-primary-50)] text-[var(--color-primary-700)]'
                      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-tertiary)] hover:text-[var(--color-text-primary)]'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
