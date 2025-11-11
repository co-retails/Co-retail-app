import React from 'react';
import { Button } from './button';

interface TaskButtonProps {
  label: string;
  description?: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'primary' | 'secondary';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

export function TaskButton({ 
  label, 
  description,
  icon, 
  onClick, 
  variant = 'default',
  size = 'default',
  className = "" 
}: TaskButtonProps) {
  const getButtonVariant = () => {
    switch (variant) {
      case 'primary':
        return 'default'; // filled button
      case 'secondary':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-auto p-3 gap-2';
      case 'lg':
        return 'h-auto p-6 gap-3';
      default:
        return 'h-auto p-4 gap-2';
    }
  };

  return (
    <Button
      variant={getButtonVariant()}
      onClick={onClick}
      className={`${getSizeClasses()} flex-col rounded-xl ${className}`}
    >
      <div className="w-6 h-6 flex items-center justify-center [&>svg]:w-6 [&>svg]:h-6">
        {icon}
      </div>
      <span className="label-large text-center">{label}</span>
      {description && (
        <span className="body-small opacity-80 text-center">{description}</span>
      )}
    </Button>
  );
}