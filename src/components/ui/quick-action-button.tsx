import React from 'react';
import { ChevronRight, TriangleAlert } from 'lucide-react';
import { useMediaQuery } from './use-mobile';

interface QuickActionButtonProps {
  title: string;
  description: React.ReactNode;
  icon: React.ReactNode;
  onClick?: () => void;
  iconWrapperClassName?: string;
  iconWrapperStyle?: React.CSSProperties;
  disabled?: boolean;
  className?: string;
  /**
   * The counts behind `description` failed to load. The description is replaced
   * rather than shown as 0 — a stale "0 in transit deliveries" would read as a
   * fact and send staff to the wrong place. The action itself stays available:
   * only the summary is missing, and recovery is offered once at screen level.
   */
  error?: boolean;
  /** Overrides the default error line. Keep it to one short sentence. */
  errorDescription?: React.ReactNode;
  /** True while a screen-level retry is in flight. */
  retrying?: boolean;
}

export function QuickActionButton({
  title,
  description,
  icon,
  onClick,
  iconWrapperClassName = 'bg-surface-container-highest',
  iconWrapperStyle,
  disabled,
  className = '',
  error = false,
  errorDescription = "Couldn't load",
  retrying = false,
}: QuickActionButtonProps) {
  const isMobileOrTablet = useMediaQuery('(max-width: 1023px)');
  const titleClass = isMobileOrTablet ? 'title-medium' : 'title-small';
  const descriptionClass = isMobileOrTablet ? 'body-medium' : 'body-small';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={isMobileOrTablet ? { minHeight: '112px' } : undefined}
      className={`flex items-center justify-between p-4 bg-surface-container border border-outline-variant rounded-lg hover:bg-surface-container-high transition-colors text-left ${className}`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center ${
            error ? 'bg-error-container' : iconWrapperClassName
          }`}
          style={error ? undefined : iconWrapperStyle}
        >
          {error ? (
            <TriangleAlert className="w-5 h-5 text-on-error-container" aria-hidden="true" />
          ) : (
            icon
          )}
        </div>
        <div>
          <p className={`${titleClass} text-on-surface`}>{title}</p>
          {/* Kept in the normal description colour: the card still works, only
              its summary is missing. The alert icon carries the degraded state,
              and the screen-level banner carries the alarm — repeating red here
              would read as three more errors instead of one outage. */}
          <p className={`${descriptionClass} text-on-surface-variant`}>
            {error ? (retrying ? 'Retrying…' : errorDescription) : description}
          </p>
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-on-surface-variant" />
    </button>
  );
}
