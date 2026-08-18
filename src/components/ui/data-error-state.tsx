import { TriangleAlert, RefreshCw } from 'lucide-react';
import { Button } from './button';

interface DataErrorBannerProps {
  /** One line naming the outage, e.g. "Some dashboard data didn't load". */
  title: string;
  /** What is and isn't affected. Avoid technical detail. */
  description?: string;
  onRetry?: () => void;
  /** True while a retry is in flight — swaps the label and spins the icon. */
  retrying?: boolean;
  retryLabel?: string;
  className?: string;
}

/**
 * Screen-level failure banner. When several blocks on a screen fail together
 * they almost always share one cause, so recovery is offered once at the top
 * rather than repeated on every affected block.
 */
export function DataErrorBanner({
  title,
  description,
  onRetry,
  retrying = false,
  retryLabel = 'Try again',
  className = '',
}: DataErrorBannerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`bg-error-container border border-error/20 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center gap-3 ${className}`}
    >
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <TriangleAlert
          className="w-5 h-5 text-on-error-container flex-shrink-0 mt-0.5"
          aria-hidden="true"
        />
        <div className="min-w-0">
          <p className="title-small text-on-error-container">{title}</p>
          {description && (
            <p className="body-small text-on-error-container/80 mt-0.5">{description}</p>
          )}
        </div>
      </div>
      {onRetry && (
        <Button
          variant="outline"
          onClick={onRetry}
          disabled={retrying}
          className="rounded-full bg-surface w-full sm:w-auto flex-shrink-0 touch-manipulation"
        >
          <RefreshCw className={retrying ? 'animate-spin' : undefined} aria-hidden="true" />
          {retrying ? 'Retrying…' : retryLabel}
        </Button>
      )}
    </div>
  );
}

interface DataErrorStateProps {
  /** Short, block-specific heading, e.g. "Sales data unavailable". */
  title: string;
  /** What the user can and can't rely on right now. Avoid technical detail. */
  description?: string;
  /**
   * Recovery is normally offered once at screen level (see `DataErrorBanner`).
   * Only pass this when a block can genuinely fail — and recover — on its own.
   */
  onRetry?: () => void;
  /** True while a retry is in flight. */
  retrying?: boolean;
  retryLabel?: string;
  /**
   * 'card' draws its own bordered surface (use when the block has no wrapper of
   * its own); 'inline' assumes the parent already provides one.
   */
  variant?: 'card' | 'inline';
  className?: string;
}

/**
 * Block-level failure state. Mirrors the structure of `EmptyState` but uses the
 * error palette, so a screen made of several independently-loaded blocks can
 * show exactly which parts are missing instead of blanking the whole page.
 */
export function DataErrorState({
  title,
  description = "We couldn't load this right now. Your data is safe — this is a display problem only.",
  onRetry,
  retrying = false,
  retryLabel = 'Try again',
  variant = 'card',
  className = '',
}: DataErrorStateProps) {
  const containerClass =
    variant === 'card'
      ? 'bg-surface-container border border-outline-variant rounded-lg py-8 px-4'
      : 'py-8 px-4';

  return (
    <div
      role="status"
      aria-live="polite"
      className={`text-center ${containerClass} ${className}`}
    >
      <div className="w-12 h-12 bg-error-container rounded-full flex items-center justify-center mx-auto mb-3">
        <TriangleAlert className="w-6 h-6 text-on-error-container" aria-hidden="true" />
      </div>
      <h3 className="title-medium text-on-surface mb-2">{title}</h3>
      <p className="body-small text-on-surface-variant max-w-sm mx-auto">{description}</p>
      {onRetry ? (
        <Button
          variant="outline"
          onClick={onRetry}
          disabled={retrying}
          className="rounded-full touch-manipulation mt-4"
        >
          <RefreshCw className={retrying ? 'animate-spin' : undefined} aria-hidden="true" />
          {retrying ? 'Retrying…' : retryLabel}
        </Button>
      ) : (
        // No local retry: the screen-level banner owns recovery. Still echo the
        // in-flight state so the block visibly responds to that one button.
        retrying && <p className="label-large text-on-surface-variant mt-4">Retrying…</p>
      )}
    </div>
  );
}

export default DataErrorState;
