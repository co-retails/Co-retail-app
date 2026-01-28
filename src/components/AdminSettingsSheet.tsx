import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  Users, 
  Package, 
  Store, 
  ChevronRight,
  LogOut,
  Cog,
  BarChart3,
  UserIcon
} from 'lucide-react';
import { useMediaQuery } from './ui/use-mobile';

export interface UserRole {
  id: string;
  name: 'Admin' | 'Brand Admin' | 'Store Manager';
  permissions: string[];
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  userId: string;
  role: UserRole;
}

type AppRole = 'admin' | 'store-staff' | 'partner' | 'buyer';

interface AdminSettingsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  userAccount: UserAccount;
  currentAppRole: AppRole;
  isAdminExperienceMode?: boolean;
  onToggleAdminExperience?: () => void;
  onLogout: () => void;
  onRoleSwitcherClick?: () => void;
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
  adminOnly?: boolean;
  brandAdminOnly?: boolean;
  partnerOnly?: boolean;
}

export default function AdminSettingsSheet({
  isOpen,
  onClose,
  userAccount,
  currentAppRole,
  isAdminExperienceMode = false,
  onToggleAdminExperience,
  onLogout,
  onRoleSwitcherClick,
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

  const hasPermission = (requiredRole?: 'Admin' | 'Brand Admin') => {
    if (!requiredRole) {
      return true;
    }

    // If in admin experience mode, admin users have full access
    if (isAdminExperienceMode && roleName === 'Admin') {
      return true;
    }

    if (requiredRole === 'Admin') {
      return roleName === 'Admin';
    }

    if (requiredRole === 'Brand Admin') {
      return ['Admin', 'Brand Admin'].includes(roleName);
    }

    return true;
  };

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

  const handleToggleAdminExperience = () => {
    if (onToggleAdminExperience) {
      onToggleAdminExperience();
    }
  };

  const handleRoleSwitcherClick = () => {
    if (onRoleSwitcherClick) {
      onRoleSwitcherClick();
      onClose();
    }
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
          onClick: handleStockCheckReport
        },
        {
          id: 'shipping-report',
          title: 'Shipping report',
          description: 'Monitor B2B deliveries and boxes',
          icon: <BarChart3 className="w-6 h-6" />,
          onClick: handleShippingReport,
          brandAdminOnly: true
        },
        {
          id: 'partner-reports',
          title: 'Partner Reports',
          description: 'Sales & Stock analytics for partners',
          icon: <BarChart3 className="w-6 h-6" />,
          onClick: handlePartnerReports,
          partnerOnly: true
        }
      ]
    },
    {
      title: 'Access',
      items: [
        {
          id: 'store-user-access',
          title: 'Store user access',
          description: 'View store staff and manager accounts',
          icon: <Store className="w-6 h-6" />,
          onClick: handleStoreUserAccess,
          brandAdminOnly: true
        },
        {
          id: 'partner-user-access',
          title: 'Partner user access',
          description: 'View partner portal user accounts',
          icon: <Users className="w-6 h-6" />,
          onClick: handlePartnerUserAccess,
          brandAdminOnly: true
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
          adminOnly: true
        },
        {
          id: 'partner-settings',
          title: 'Partner settings',
          description: 'Manage partner access and agreements',
          icon: <Store className="w-6 h-6" />,
          onClick: handlePartnerSettings,
          adminOnly: true
        }
      ]
    }
  ];

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side={isLargeScreen ? "right" : "bottom"}
        className={`
          ${isLargeScreen 
            ? 'max-w-md' 
            : 'max-h-[90vh] rounded-t-3xl'
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

        {/* Header with Account Info */}
        <div className="flex-shrink-0">
          <SheetHeader className={`relative px-6 pb-3 flex-shrink-0 ${isLargeScreen ? 'pt-6' : ''}`}>
            <SheetTitle className="title-large text-on-surface text-left">
              Settings
            </SheetTitle>
            <SheetDescription className="sr-only">
              Admin settings and account management
            </SheetDescription>
          </SheetHeader>

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
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <Badge variant="secondary" className="rounded-lg">
                Access role: {roleName}
              </Badge>
              <Badge variant="outline" className="rounded-lg text-on-surface">
                Current view: {currentAppRole === 'store-staff' ? 'Store app' : currentAppRole === 'partner' ? 'Partner portal' : currentAppRole === 'buyer' ? 'Buyer portal' : 'Admin'}
              </Badge>
              {isAdminExperienceMode && (
                <Badge variant="secondary" className="rounded-lg">
                  Admin experience
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-4">
              {onRoleSwitcherClick && (
                <Button
                  variant="outline"
                  onClick={handleRoleSwitcherClick}
                  className="rounded-lg text-on-surface border-outline hover:bg-surface-container-high px-4"
                >
                  <UserIcon className="w-5 h-5 mr-2" />
                  Switch view
                </Button>
              )}
              <Button
                variant="outline"
                onClick={handleLogout}
                className="rounded-lg text-error border-error hover:bg-error-container hover:text-on-error-container px-4"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Logout
              </Button>
              {roleName === 'Admin' && onToggleAdminExperience && (
                <Button
                  variant="ghost"
                  onClick={handleToggleAdminExperience}
                  className="rounded-lg text-on-surface hover:bg-surface-container-high"
                >
                  {isAdminExperienceMode ? 'View app based experience' : 'View full admin experience'}
                </Button>
              )}
            </div>
          </div>

          <Separator className="bg-outline-variant" />
        </div>

        {/* Scrollable Menu Content */}
        <div className="flex-1 overflow-y-auto">
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
                    // Check permissions
                    if (item.adminOnly && !hasPermission('Admin')) return null;
                    if (item.brandAdminOnly && !hasPermission('Brand Admin')) return null;
                    if (item.partnerOnly && currentAppRole !== 'partner') return null;

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
      </SheetContent>
    </Sheet>
  );
}
