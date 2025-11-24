import React from 'react';
import { Button } from './button';
import { ArrowLeftIcon, Settings, UserIcon } from 'lucide-react';

interface SharedHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  onAdminClick?: () => void;
  onRoleSwitcherClick?: () => void;
  rightElement?: React.ReactNode;
  className?: string;
}

export function SharedHeader({ 
  title, 
  subtitle, 
  onBack, 
  onAdminClick, 
  onRoleSwitcherClick,
  rightElement,
  className = "" 
}: SharedHeaderProps) {
  return (
    <div className={`bg-surface border-b border-outline-variant ${className}`}>
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="text-on-surface-variant"
                aria-label="Go back"
              >
                <ArrowLeftIcon size={20} />
              </Button>
            )}
            <div className="flex-1">
              <h1 className="headline-small text-on-surface">{title}</h1>
              {subtitle && (
                <p className="body-small text-on-surface-variant">{subtitle}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {rightElement}
            {onRoleSwitcherClick && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onRoleSwitcherClick}
                className="text-on-surface-variant"
                aria-label="Switch role"
              >
                <UserIcon size={20} />
              </Button>
            )}
            {onAdminClick && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onAdminClick}
                className="text-on-surface-variant"
                aria-label="Admin settings"
              >
                <Settings size={20} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}