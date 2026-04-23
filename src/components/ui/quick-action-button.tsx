import React from 'react';
import { ChevronRight } from 'lucide-react';
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
          className={`w-10 h-10 rounded-full flex items-center justify-center ${iconWrapperClassName}`}
          style={iconWrapperStyle}
        >
          {icon}
        </div>
        <div>
          <p className={`${titleClass} text-on-surface`}>{title}</p>
          <p className={`${descriptionClass} text-on-surface-variant`}>{description}</p>
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-on-surface-variant" />
    </button>
  );
}
