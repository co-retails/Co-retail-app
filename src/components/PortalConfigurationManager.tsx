import React, { useState } from 'react';
import { PortalConfigurationLanding } from './PortalConfigurationLanding';
import { AttributeDictionaryScreen } from './AttributeDictionaryScreen';
import { DropdownValuesScreen } from './DropdownValuesScreen';
import { SEKPriceLaddersScreen } from './SEKPriceLaddersScreen';
import { CurrencyMappingScreen } from './CurrencyMappingScreen';
import { PartnerPricingScreen } from './PartnerPricingScreen';
import { CountryOverridesScreen } from './CountryOverridesScreen';
import { EffectiveViewScreen } from './EffectiveViewScreen';
import { PublishingVersionsScreen } from './PublishingVersionsScreen';
import { ValidationRulesScreen } from './ValidationRulesScreen';
import { AuditLogScreen } from './AuditLogScreen';
import { UserRole } from './PortalConfigTypes';

interface PortalConfigurationManagerProps {
  userRole: UserRole;
  onBack: () => void;
}

export function PortalConfigurationManager({
  userRole,
  onBack
}: PortalConfigurationManagerProps) {
  const [currentScreen, setCurrentScreen] = useState<string>('landing');

  const handleNavigate = (screen: string) => {
    setCurrentScreen(screen);
  };

  const handleBackToLanding = () => {
    setCurrentScreen('landing');
  };

  // Render the appropriate screen
  switch (currentScreen) {
    case 'landing':
      return (
        <PortalConfigurationLanding
          userRole={userRole}
          onNavigate={handleNavigate}
          onBack={onBack}
        />
      );

    case 'attribute-dictionary':
      return <AttributeDictionaryScreen onBack={handleBackToLanding} />;

    case 'dropdown-values':
      return <DropdownValuesScreen onBack={handleBackToLanding} />;

    case 'price-ladders':
      return <SEKPriceLaddersScreen onBack={handleBackToLanding} />;

    case 'partner-pricing':
      return <PartnerPricingScreen onBack={handleBackToLanding} />;

    case 'currency-mapping':
      return <CurrencyMappingScreen onBack={handleBackToLanding} />;

    case 'country-overrides':
      return <CountryOverridesScreen onBack={handleBackToLanding} />;

    case 'effective-view':
      return <EffectiveViewScreen onBack={handleBackToLanding} />;

    case 'versions':
      return <PublishingVersionsScreen onBack={handleBackToLanding} />;

    case 'validation':
      return <ValidationRulesScreen onBack={handleBackToLanding} />;

    case 'audit':
      return <AuditLogScreen onBack={handleBackToLanding} />;

    default:
      return (
        <PortalConfigurationLanding
          userRole={userRole}
          onNavigate={handleNavigate}
          onBack={onBack}
        />
      );
  }
}
