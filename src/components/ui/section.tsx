import React from 'react';

interface SectionProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  spacing?: 'compact' | 'default' | 'spacious';
  className?: string;
}

export function Section({ 
  title, 
  subtitle, 
  children, 
  spacing = 'default',
  className = ""
}: SectionProps) {
  const getSpacingClasses = () => {
    switch (spacing) {
      case 'compact':
        return 'space-y-2';
      case 'spacious':
        return 'space-y-6';
      default:
        return 'space-y-4';
    }
  };

  return (
    <div className={`${getSpacingClasses()} ${className}`}>
      {(title || subtitle) && (
        <div className="space-y-1">
          {title && (
            <h2 className="title-medium text-on-surface">{title}</h2>
          )}
          {subtitle && (
            <p className="body-medium text-on-surface-variant">{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}