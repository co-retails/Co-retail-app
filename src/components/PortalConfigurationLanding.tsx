import { Card } from './ui/card';
import { Badge } from './ui/badge';
import {
  Settings,
  Database,
  Filter,
  DollarSign,
  History,
  CheckCircle,
  FileText,
  ChevronRight,
  ArrowLeft,
  Globe,
  Building2,
  Sparkles
} from 'lucide-react';
import { UserRole } from './PortalConfigTypes';

interface PortalConfigurationLandingProps {
  userRole: UserRole;
  isAdminExperienceMode?: boolean;
  onNavigate: (screen: string) => void;
  onBack: () => void;
}

export function PortalConfigurationLanding({
  userRole,
  isAdminExperienceMode = false,
  onNavigate,
  onBack
}: PortalConfigurationLandingProps) {
  const isAdmin = userRole === 'admin' || isAdminExperienceMode;

  const attributeSections = [
    {
      id: 'values',
      title: 'Attribute values',
      description: 'Configure attribute value options',
      icon: Filter,
      disabled: !isAdmin,
      screen: 'dropdown-values'
    },
  ];

  const pricingSections = [
    {
      id: 'partner-pricing',
      title: 'Partner pricing',
      description: 'Set fixed prices per currency for each partner',
      icon: DollarSign,
      disabled: false,
      screen: 'partner-pricing'
    },
    {
      id: 'price-fork-calibration',
      title: 'Price Fork calibration',
      description: 'Adjust AI pricing parameters for API-integrated order creation',
      icon: Sparkles,
      disabled: false,
      screen: 'price-fork-calibration'
    },
    {
      id: 'purchase-price-converter',
      title: 'Purchase price currency converter',
      description: 'Convert purchase prices from EUR to sales price currency',
      icon: DollarSign,
      disabled: !isAdmin,
      screen: 'purchase-price-converter'
    }
  ];

  const systemSections = [
    {
      id: 'markets-stores',
      title: 'Markets & Stores',
      description: 'Enable brands, markets, and stores for Store App and Partner Portal',
      icon: Globe,
      disabled: !isAdmin,
      screen: 'markets-stores'
    },
    {
      id: 'partner-warehouse-management',
      title: 'Partners & Warehouses',
      description: 'Add and manage partners and their warehouse locations',
      icon: Building2,
      disabled: !isAdmin,
      screen: 'partner-warehouse-management'
    }
  ];

  const adminSections = [
    {
      id: 'versions',
      title: 'Publishing & Versions',
      description: 'Publish changes and manage version history',
      icon: History,
      disabled: !isAdmin,
      screen: 'versions'
    },
    {
      id: 'validation',
      title: 'Validation rules',
      description: 'Configure validation checks',
      icon: CheckCircle,
      disabled: !isAdmin,
      screen: 'validation'
    },
    {
      id: 'audit',
      title: 'Audit log',
      description: 'Track all configuration changes',
      icon: FileText,
      disabled: !isAdmin,
      screen: 'audit'
    }
  ];

  return (
    <div className="min-h-screen bg-surface pb-20 md:pb-0">
      {/* Top App Bar */}
      <div className="sticky top-0 bg-surface z-10 border-b border-outline-variant">
        <div className="flex items-center h-16 px-4 md:px-6">
          <button
            className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest transition-colors mr-2"
            onClick={onBack}
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6 text-on-surface" />
          </button>

          <div className="flex-1">
            <h1 className="title-large text-on-surface">Portal configuration</h1>
            <p className="body-small text-on-surface-variant">
              Manage attributes, pricing, and validation rules
            </p>
          </div>

          {!isAdmin && (
            <Badge variant="outline" className="border-outline bg-surface-container">
              <span className="label-medium text-on-surface-variant">View only</span>
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl px-4 md:px-6 py-6 space-y-8">
        {/* Attributes Section */}
        <div>
          <div className="mb-4">
            <h2 className="title-large text-on-surface mb-1">Attributes</h2>
            <p className="body-medium text-on-surface-variant">
              Define what attributes exist, which are mandatory, and valid values
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {attributeSections.map((section) => {
              const Icon = section.icon;
              return (
                <Card
                  key={section.id}
                  className={`p-6 border-outline-variant bg-surface-container hover:bg-surface-container-high transition-colors ${
                    section.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                  onClick={() => !section.disabled && onNavigate(section.screen)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 rounded-lg bg-primary-container flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-on-primary-container" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="title-medium text-on-surface mb-1">{section.title}</h3>
                        <p className="body-medium text-on-surface-variant">{section.description}</p>
                      </div>
                    </div>

                    {!section.disabled && (
                      <ChevronRight className="w-6 h-6 text-on-surface-variant flex-shrink-0 ml-2" />
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Pricing Section */}
        <div>
          <div className="mb-4">
            <h2 className="title-large text-on-surface mb-1">Pricing</h2>
            <p className="body-medium text-on-surface-variant">
              Set fixed price points per currency for each partner
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pricingSections.map((section) => {
              const Icon = section.icon;
              return (
                <Card
                  key={section.id}
                  className={`p-6 border-outline-variant bg-surface-container hover:bg-surface-container-high transition-colors ${
                    section.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                  onClick={() => !section.disabled && onNavigate(section.screen)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 rounded-lg bg-tertiary-container flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-on-tertiary-container" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="title-medium text-on-surface mb-1">{section.title}</h3>
                        <p className="body-medium text-on-surface-variant">{section.description}</p>
                      </div>
                    </div>

                    {!section.disabled && (
                      <ChevronRight className="w-6 h-6 text-on-surface-variant flex-shrink-0 ml-2" />
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* System Configuration Section */}
        {isAdmin && (
          <div>
            <div className="mb-4">
              <h2 className="title-large text-on-surface mb-1">System configuration</h2>
              <p className="body-medium text-on-surface-variant">
                Manage system-wide settings for brands, markets, and stores
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {systemSections.map((section) => {
                const Icon = section.icon;
                return (
                  <Card
                    key={section.id}
                    className="p-6 border-outline-variant bg-surface-container hover:bg-surface-container-high transition-colors cursor-pointer"
                    onClick={() => onNavigate(section.screen)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 rounded-lg bg-error-container flex items-center justify-center flex-shrink-0">
                          <Icon className="w-6 h-6 text-on-error-container" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="title-medium text-on-surface mb-1">{section.title}</h3>
                          <p className="body-medium text-on-surface-variant">{section.description}</p>
                        </div>
                      </div>

                      <ChevronRight className="w-6 h-6 text-on-surface-variant flex-shrink-0 ml-2" />
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Admin Tools Section */}
        {isAdmin && (
          <div>
            <div className="mb-4">
              <h2 className="title-large text-on-surface mb-1">Admin tools</h2>
              <p className="body-medium text-on-surface-variant">
                Publishing, versioning, validation, and audit capabilities
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {adminSections.map((section) => {
                const Icon = section.icon;
                return (
                  <Card
                    key={section.id}
                    className="p-6 border-outline-variant bg-surface-container hover:bg-surface-container-high transition-colors cursor-pointer"
                    onClick={() => onNavigate(section.screen)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-6 h-6 text-accent" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="title-medium text-on-surface mb-1">{section.title}</h3>
                          <p className="body-small text-on-surface-variant">{section.description}</p>
                        </div>
                      </div>

                      <ChevronRight className="w-6 h-6 text-on-surface-variant flex-shrink-0 ml-2" />
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Info for non-admin users */}
        {!isAdmin && (
          <Card className="p-6 border-outline bg-surface-container">
            <div className="flex gap-4">
              <Settings className="w-6 h-6 text-on-surface-variant flex-shrink-0" />
              <div>
                <h3 className="title-medium text-on-surface mb-1">Limited access</h3>
                <p className="body-medium text-on-surface-variant">
                  {userRole === 'partner'
                    ? 'As a Partner, you can view the available configuration areas, but cannot modify them.'
                    : 'As Store Staff, you can view configurations to help reconcile validation errors.'}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
