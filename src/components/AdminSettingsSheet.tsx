import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import {
  FullScreenDialog,
  FullScreenDialogContent,
  FullScreenDialogDescription,
  FullScreenDialogHeader,
  FullScreenDialogTitle
} from './ui/full-screen-dialog';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Users, 
  Package, 
  Store, 
  ChevronRight,
  LogOut,
  Cog,
  BarChart3,
  UserIcon,
  X
} from 'lucide-react';
import { useMediaQuery } from './ui/use-mobile';

export interface UserRole {
  id: string;
  name: 'Admin' | 'Partner User' | 'Store User';
  permissions: string[];
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  userId: string;
  role: UserRole;
}

type AppRole = 'admin' | 'store-staff' | 'partner';

interface AdminSettingsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  userAccount: UserAccount;
  currentAppRole: AppRole;
  currentViewLabel: string;
  onLogout: () => void;
  onRoleChange?: (role: 'admin' | 'partner' | 'store-staff') => void;
  onSwitchView?: () => void;
  onNavigateToStockCheckReport?: () => void;
  onNavigateToShippingReport?: () => void;
  onNavigateToPartnerReports?: () => void;
  onNavigateToPortalConfiguration?: () => void;
  onNavigateToPartnerSettings?: () => void;
  onNavigateToStoreUserAccess?: () => void;
  onNavigateToPartnerUserAccess?: () => void;
}

interface MenuItem {
  id: string;
  title: string;
  description?: string;
  icon: React.ReactNode;
  onClick: () => void;
  visibleFor: AppRole[];
}

export default function AdminSettingsSheet({
  isOpen,
  onClose,
  userAccount,
  currentAppRole,
  currentViewLabel,
  onLogout,
  onRoleChange,
  onSwitchView,
  onNavigateToStockCheckReport,
  onNavigateToShippingReport,
  onNavigateToPartnerReports,
  onNavigateToPortalConfiguration,
  onNavigateToPartnerSettings,
  onNavigateToStoreUserAccess,
  onNavigateToPartnerUserAccess
}: AdminSettingsSheetProps) {
  if (!userAccount) {
    console.warn('AdminSettingsSheet: userAccount is undefined, sheet will not render.');
    return null;
  }

  const roleName = userAccount.role?.name ?? 'Admin';

  const isLargeScreen = useMediaQuery('(min-width: 640px)');

  const handleStockCheckReport = () => {
    if (onNavigateToStockCheckReport) {
      onNavigateToStockCheckReport();
      onClose();
    }
  };

  const handleShippingReport = () => {
    if (onNavigateToShippingReport) {
      onNavigateToShippingReport();
      onClose();
    }
  };

  const handlePartnerReports = () => {
    if (onNavigateToPartnerReports) {
      onNavigateToPartnerReports();
      onClose();
    }
  };

  const handlePortalConfiguration = () => {
    if (onNavigateToPortalConfiguration) {
      onNavigateToPortalConfiguration();
      onClose();
    }
  };

  const handlePartnerSettings = () => {
    if (onNavigateToPartnerSettings) {
      onNavigateToPartnerSettings();
      onClose();
    }
  };

  const handleLogout = () => {
    onLogout();
    onClose();
  };

  const handleSwitchViewClick = () => {
    if (!onSwitchView) return;
    // Close settings first so the switch view sheet is not hidden beneath mobile fullscreen settings.
    onClose();
    setTimeout(() => onSwitchView(), 0);
  };

  const handleStoreUserAccess = () => {
    if (onNavigateToStoreUserAccess) {
      onNavigateToStoreUserAccess();
      onClose();
    }
  };

  const handlePartnerUserAccess = () => {
    if (onNavigateToPartnerUserAccess) {
      onNavigateToPartnerUserAccess();
      onClose();
    }
  };

  const menuSections: { title: string; items: MenuItem[] }[] = [
    {
      title: 'Reports',
      items: [
        {
          id: 'stock-check-report',
          title: 'Stock check report',
          description: 'Access historical stock check sessions',
          icon: <Package className="w-6 h-6" />,
          onClick: handleStockCheckReport,
          visibleFor: ['admin', 'store-staff']
        },
        {
          id: 'shipping-report',
          title: 'Shipping report',
          description: 'Monitor B2B deliveries and boxes',
          icon: <BarChart3 className="w-6 h-6" />,
          onClick: handleShippingReport,
          visibleFor: ['admin', 'partner']
        },
        {
          id: 'partner-reports',
          title: 'Partner Reports',
          description: 'Sales & Stock analytics for partners',
          icon: <BarChart3 className="w-6 h-6" />,
          onClick: handlePartnerReports,
          visibleFor: ['admin', 'partner']
        }
      ]
    },
    {
      title: 'Access',
      items: [
        {
          id: 'store-user-access',
          title: 'Admin user access',
          description: 'Manage admin access and access scopes',
          icon: <Store className="w-6 h-6" />,
          onClick: handleStoreUserAccess,
          visibleFor: ['admin']
        },
        {
          id: 'partner-user-access',
          title: 'Partner user access',
          description: 'View or manage partner portal user accounts',
          icon: <Users className="w-6 h-6" />,
          onClick: handlePartnerUserAccess,
          visibleFor: ['admin', 'partner']
        }
      ]
    },
    {
      title: 'Settings',
      items: [
        {
          id: 'portal-configuration',
          title: 'Portal configuration',
          description: 'Manage attributes, pricing, and validation rules',
          icon: <Cog className="w-6 h-6" />,
          onClick: handlePortalConfiguration,
          visibleFor: ['admin']
        },
        {
          id: 'partner-settings',
          title: 'Partner settings',
          description: 'Manage partner access and agreements',
          icon: <Store className="w-6 h-6" />,
          onClick: handlePartnerSettings,
          visibleFor: ['admin']
        }
      ]
    }
  ];

  const accountAndMenuContent = (
    <>
      {/* Account Information */}
      <div className="px-6 pb-4">
        <div className="flex items-center gap-3 p-3 bg-surface-container rounded-lg">
          <Avatar className="w-10 h-10 bg-tertiary-container">
            <AvatarFallback className="text-on-tertiary-container label-large">
              {userAccount.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="label-large text-on-surface truncate">{userAccount.name}</div>
            <div className="body-small text-on-surface-variant truncate">{userAccount.email}</div>
          </div>
        </div>
        <div className="mt-3 flex items-end gap-2">
          {onRoleChange ? (
            <div className="flex-1 min-w-0 space-y-1">
              <label className="label-small text-on-surface-variant">Role</label>
              <Select
                value={currentAppRole === 'partner' || currentAppRole === 'store-staff' || currentAppRole === 'admin' ? currentAppRole : 'store-staff'}
                onValueChange={(value) => onRoleChange(value as 'admin' | 'partner' | 'store-staff')}
              >
                <SelectTrigger className="bg-surface border border-outline rounded-lg min-h-[48px] h-12 px-3 w-full">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="store-staff">Store user</SelectItem>
                  <SelectItem value="partner">Partner user</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : (
            <Badge variant="secondary" className="rounded-lg">
              {roleName}
            </Badge>
          )}
          <Button
            variant="outline"
            onClick={handleLogout}
            className="rounded-lg text-error border-error hover:bg-error-container hover:text-on-error-container px-4 min-h-[48px] h-12 shrink-0"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Logout
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <Badge variant="outline" className="rounded-lg text-on-surface">
            Current view: {currentViewLabel}
          </Badge>
          {onSwitchView && currentAppRole === 'admin' && (
            <Button
              variant="outline"
              onClick={handleSwitchViewClick}
              className="rounded-lg text-on-surface border-outline hover:bg-surface-container-high px-4"
            >
              <UserIcon className="w-5 h-5 mr-2" />
              Switch view
            </Button>
          )}
        </div>
      </div>

      <Separator className="bg-outline-variant" />

      {/* Menu Content */}
      <div className={isLargeScreen ? 'flex-1 overflow-y-auto' : ''}>
        <div className="py-2">
          {menuSections.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              {section.title && (
                <div className="px-6 py-3">
                  <h3 className="title-small text-on-surface">{section.title}</h3>
                </div>
              )}

              <div className="space-y-1 px-3">
                {section.items.map((item) => {
                  if (!item.visibleFor.includes(currentAppRole)) return null;

                  return (
                    <button
                      key={item.id}
                      onClick={item.onClick}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-surface-container-highest active:bg-surface-container text-left transition-colors"
                    >
                      <div className="text-on-surface-variant flex-shrink-0">
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="body-large text-on-surface">{item.title}</div>
                        {item.description && (
                          <div className="body-small text-on-surface-variant">{item.description}</div>
                        )}
                      </div>
                      <ChevronRight className="w-5 h-5 text-on-surface-variant flex-shrink-0" />
                    </button>
                  );
                })}
              </div>

              {sectionIndex < menuSections.length - 1 && (
                <Separator className="my-2 bg-outline-variant" />
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );

  if (!isLargeScreen) {
    return (
      <FullScreenDialog open={isOpen} onOpenChange={onClose}>
        <FullScreenDialogContent className="bg-surface-container-high p-0 h-screen overflow-hidden !gap-0 flex flex-col">
          <FullScreenDialogHeader className="sticky top-0 z-20 bg-surface-container-high px-6 pt-6 pb-3 flex-shrink-0 border-b border-outline-variant">
            <FullScreenDialogTitle className="title-large text-on-surface text-left">
              Settings
            </FullScreenDialogTitle>
            <FullScreenDialogDescription className="sr-only">
              Admin settings and account management
            </FullScreenDialogDescription>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full"
              aria-label="Close settings"
            >
              <X className="w-5 h-5" />
            </Button>
          </FullScreenDialogHeader>
          <div className="flex-1 overflow-y-auto">
            {accountAndMenuContent}
          </div>
        </FullScreenDialogContent>
      </FullScreenDialog>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side="right"
        className="max-w-md bg-surface-container-high border-outline-variant p-0 gap-0 overflow-hidden flex flex-col"
      >
        {/* Header with Account Info */}
        <div className="flex-shrink-0">
          <SheetHeader className="relative px-6 pb-3 flex-shrink-0 pt-6">
            <SheetTitle className="title-large text-on-surface text-left">
              Settings
            </SheetTitle>
            <SheetDescription className="sr-only">
              Admin settings and account management
            </SheetDescription>
          </SheetHeader>
        </div>
        {accountAndMenuContent}
      </SheetContent>
    </Sheet>
  );
}
