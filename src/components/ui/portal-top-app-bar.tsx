import { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { cn } from './utils';

interface PortalTopAppBarProps {
  title: string;
  subtitle?: ReactNode;
  onBack?: () => void;
  actions?: ReactNode;
  className?: string;
}

export function PortalTopAppBar({
  title,
  subtitle,
  onBack,
  actions,
  className,
}: PortalTopAppBarProps) {
  return (
    <div
      className={cn(
        'sticky top-0 bg-surface z-10 border-b border-outline-variant',
        className,
      )}
    >
      <div className="flex items-center h-16 px-4 md:px-6 gap-2">
        {onBack && (
          <button
            className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest transition-colors"
            onClick={onBack}
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6 text-on-surface" />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="title-large text-on-surface truncate">{title}</h1>
          {subtitle && (
            <p className="body-medium text-on-surface-variant truncate">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
      </div>
    </div>
  );
}
