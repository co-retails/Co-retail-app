import React from 'react';

interface StatsCardProps {
  label: string;
  value: number | string;
  description?: string;
  variant?: 'default' | 'primary' | 'error' | 'success';
  onClick?: () => void;
  className?: string;
}

export function StatsCard({ 
  label, 
  value, 
  description, 
  variant = 'default',
  onClick,
  className = "" 
}: StatsCardProps) {
  const getValueColor = () => {
    switch (variant) {
      case 'primary':
        return 'text-primary';
      case 'error':
        return 'text-error';
      case 'success':
        return 'text-success';
      default:
        return 'text-on-surface';
    }
  };

  const Component = onClick ? 'button' : 'div';
  // Updated to match partner dashboard pattern exactly
  const baseClasses = "bg-surface-container-high border border-outline-variant rounded-lg p-3 md:p-4 flex flex-col justify-between h-24 md:h-28 shadow-sm";
  const interactiveClasses = onClick 
    ? "cursor-pointer hover:bg-surface-container-highest focus:bg-surface-container-highest active:bg-surface-container-highest transition-colors text-left"
    : "";

  return (
    <Component
      onClick={onClick}
      className={`${baseClasses} ${interactiveClasses} ${className}`}
    >
      <div className="space-y-1">
        <div className="label-small text-on-surface uppercase">
          <p className="text-[12px] break-words">{label}</p>
        </div>
        {description && (
          <div className="label-small text-on-surface-variant">
            <p className="leading-tight text-[10px] break-words">{description}</p>
          </div>
        )}
      </div>
      <div className={`title-large ${getValueColor()} mt-auto`}>
        <p>{value}</p>
      </div>
    </Component>
  );
}