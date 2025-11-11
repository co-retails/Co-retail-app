import React from 'react';
import { Button } from './button';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({ 
  icon, 
  title, 
  description, 
  actionLabel, 
  onAction,
  className = "" 
}: EmptyStateProps) {
  return (
    <div className={`text-center py-8 ${className}`}>
      <div className="w-12 h-12 bg-surface-container-high rounded-full flex items-center justify-center mx-auto mb-3">
        <div className="w-6 h-6 text-on-surface-variant">
          {icon}
        </div>
      </div>
      <h3 className="title-medium text-on-surface mb-2">{title}</h3>
      <p className="body-small text-on-surface-variant mb-4">{description}</p>
      {actionLabel && onAction && (
        <Button 
          onClick={onAction}
          className="rounded-full"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}