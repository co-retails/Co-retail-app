import React from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from './ui/sheet';
import { Badge } from './ui/badge';
import { Store, TruckIcon } from 'lucide-react';
import { useMediaQuery } from './ui/use-mobile';
import { cn } from './ui/utils';

interface SwitchViewSheetProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: 'store' | 'partner';
  onViewChange: (view: 'store' | 'partner') => void;
}

export default function SwitchViewSheet({ isOpen, onClose, currentView, onViewChange }: SwitchViewSheetProps) {
  const isLargeScreen = useMediaQuery('(min-width: 640px)');

  const handleSelect = (view: 'store' | 'partner') => {
    onViewChange(view);
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side={isLargeScreen ? 'right' : 'bottom'}
        className={`
          ${isLargeScreen ? 'max-w-md' : 'max-h-[85vh] rounded-t-3xl'}
          bg-surface-container-high border-outline-variant p-0 gap-0 overflow-hidden flex flex-col
        `}
      >
        {!isLargeScreen && (
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-8 h-1 bg-outline-variant rounded-full" />
          </div>
        )}

        <SheetHeader className={`relative px-6 pb-4 flex-shrink-0 ${isLargeScreen ? 'pt-6' : ''}`}>
          <SheetTitle className="title-large text-on-surface text-left">Switch view</SheetTitle>
          <SheetDescription className="body-small text-on-surface-variant text-left">
            Choose which app experience to open.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto pb-6">
          <div className="space-y-3 px-6 md:px-6">
            <button
              type="button"
              onClick={() => handleSelect('store')}
              className={cn(
                'w-full min-h-[168px] rounded-lg border text-left transition-colors overflow-hidden',
                currentView === 'store'
                  ? 'bg-primary text-on-primary border-primary'
                  : 'bg-surface text-on-surface border-outline hover:bg-surface-container-high'
              )}
            >
              <div className="h-full p-6 flex flex-col items-start justify-start gap-3">
                <div className="flex items-center gap-2 w-full">
                  <Store size={20} className="flex-shrink-0" />
                  <span className="label-large break-words">Store app</span>
                  {currentView === 'store' && (
                    <Badge variant="secondary" className="ml-auto flex-shrink-0 body-small">
                      Active
                    </Badge>
                  )}
                </div>
                <p className="body-small text-left opacity-80 break-words whitespace-normal overflow-wrap-anywhere">
                  Operational store workflows and reports.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleSelect('partner')}
              className={cn(
                'w-full min-h-[168px] rounded-lg border text-left transition-colors overflow-hidden',
                currentView === 'partner'
                  ? 'bg-primary text-on-primary border-primary'
                  : 'bg-surface text-on-surface border-outline hover:bg-surface-container-high'
              )}
            >
              <div className="h-full p-6 flex flex-col items-start justify-start gap-3">
                <div className="flex items-center gap-2 w-full">
                  <TruckIcon size={20} className="flex-shrink-0" />
                  <span className="label-large break-words">Partner portal</span>
                  {currentView === 'partner' && (
                    <Badge variant="secondary" className="ml-auto flex-shrink-0 body-small">
                      Active
                    </Badge>
                  )}
                </div>
                <p className="body-small text-left opacity-80 break-words whitespace-normal overflow-wrap-anywhere">
                  Partner workflows and partner-facing operations.
                </p>
              </div>
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
