import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './dialog';
import { VisuallyHidden } from './visually-hidden';
import { Button } from './button';
import { ArrowLeftIcon, X } from 'lucide-react';

interface ResponsiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  fullScreen?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveDialog({ 
  open, 
  onOpenChange, 
  title, 
  description, 
  fullScreen = false,
  children,
  className = ""
}: ResponsiveDialogProps) {
  const handleClose = () => onOpenChange(false);

  if (fullScreen) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-surface border-0 w-screen h-screen max-w-none m-0 p-0 rounded-none">
          <VisuallyHidden>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </VisuallyHidden>
          
          {/* Header */}
          <div className="bg-surface-container border-b border-outline-variant">
            <div className="px-4 py-3">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  className="text-on-surface-variant"
                  aria-label="Close"
                >
                  <ArrowLeftIcon size={20} />
                </Button>
                <div className="flex-1">
                  <h1 className="headline-small text-on-surface">{title}</h1>
                  {description && (
                    <p className="body-small text-on-surface-variant">{description}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className={`flex-1 overflow-hidden ${className}`}>
            {children}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`bg-surface border border-outline-variant rounded-xl max-w-md ${className}`}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <DialogTitle className="headline-small text-on-surface">{title}</DialogTitle>
              {description && (
                <DialogDescription className="body-medium text-on-surface-variant">
                  {description}
                </DialogDescription>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="text-on-surface-variant ml-2"
              aria-label="Close"
            >
              <X size={20} />
            </Button>
          </div>
        </DialogHeader>
        <div className="space-y-4">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}