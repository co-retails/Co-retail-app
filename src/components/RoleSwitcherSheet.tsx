import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { UserIcon, TruckIcon, Shield } from 'lucide-react';
import { useMediaQuery } from './ui/use-mobile';

export type UserRole = 'store-staff' | 'partner' | 'admin';

interface RoleSwitcherSheetProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export default function RoleSwitcherSheet({ 
  isOpen, 
  onClose, 
  currentRole, 
  onRoleChange 
}: RoleSwitcherSheetProps) {
  const isLargeScreen = useMediaQuery('(min-width: 640px)');

  const handleRoleChange = (role: UserRole) => {
    onRoleChange(role);
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side={isLargeScreen ? "right" : "bottom"}
        className={`
          ${isLargeScreen 
            ? 'max-w-md' 
            : 'max-h-[85vh] rounded-t-3xl'
          }
          bg-surface-container-high border-outline-variant p-0 gap-0 overflow-hidden flex flex-col
        `}
      >
        {/* Drag Handle - Mobile Only */}
        {!isLargeScreen && (
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-8 h-1 bg-outline-variant rounded-full" />
          </div>
        )}

        {/* Header */}
        <SheetHeader className={`relative px-6 pb-4 flex-shrink-0 ${isLargeScreen ? 'pt-6' : ''}`}>
          <SheetTitle className="title-large text-on-surface text-left">
            Switch view
          </SheetTitle>
          <SheetDescription className="body-small text-on-surface-variant text-left">
            Access different features based on your role
          </SheetDescription>
        </SheetHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <div className="space-y-3">
            <Button
              variant={currentRole === 'store-staff' ? 'default' : 'outline'}
              onClick={() => handleRoleChange('store-staff')}
              className="flex w-full flex-col items-start gap-2 text-left whitespace-normal break-words justify-start h-auto md:h-auto p-4 md:py-4"
            >
              <div className="flex items-center gap-2 w-full">
                <UserIcon size={20} className="flex-shrink-0" />
                <span className="label-large break-words">Store user</span>
                {currentRole === 'store-staff' && (
                  <Badge variant="secondary" className="ml-auto flex-shrink-0 body-small">
                    Active
                  </Badge>
                )}
              </div>
              <p className="body-small text-left opacity-80 break-words whitespace-normal overflow-wrap-anywhere">
                Store app only with basic operational workflows
              </p>
            </Button>
            
            <Button
              variant={currentRole === 'partner' ? 'default' : 'outline'}
              onClick={() => handleRoleChange('partner')}
              className="flex w-full flex-col items-start gap-2 text-left whitespace-normal break-words justify-start h-auto md:h-auto p-4 md:py-4"
            >
              <div className="flex items-center gap-2 w-full">
                <TruckIcon size={20} className="flex-shrink-0" />
                <span className="label-large break-words">Partner user</span>
                {currentRole === 'partner' && (
                  <Badge variant="secondary" className="ml-auto flex-shrink-0 body-small">
                    Active
                  </Badge>
                )}
              </div>
              <p className="body-small text-left opacity-80 break-words whitespace-normal overflow-wrap-anywhere">
                Partner portal only with partner workflows
              </p>
            </Button>

            <Button
              variant={currentRole === 'admin' ? 'default' : 'outline'}
              onClick={() => handleRoleChange('admin')}
              className="flex w-full flex-col items-start gap-2 text-left whitespace-normal break-words justify-start h-auto md:h-auto p-4 md:py-4"
            >
              <div className="flex items-center gap-2 w-full">
                <Shield size={20} className="flex-shrink-0" />
                <span className="label-large break-words">Admin</span>
                {currentRole === 'admin' && (
                  <Badge variant="secondary" className="ml-auto flex-shrink-0 body-small">
                    Active
                  </Badge>
                )}
              </div>
              <p className="body-small text-left opacity-80 break-words whitespace-normal overflow-wrap-anywhere">
                Full settings and configurable access to store app and partner portal
              </p>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
