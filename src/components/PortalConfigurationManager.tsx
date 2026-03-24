import { useState } from 'react';
import { PortalConfigurationLanding } from './PortalConfigurationLanding';
import { AttributeDictionaryScreen } from './AttributeDictionaryScreen';
import { DropdownValuesScreen } from './DropdownValuesScreen';
import { AttributeMappingScreen } from './AttributeMappingScreen';
import { CurrencyMappingScreen } from './CurrencyMappingScreen';
import { PartnerPricingScreen } from './PartnerPricingScreen';
import { PurchasePriceCurrencyConverterScreen } from './PurchasePriceCurrencyConverterScreen';
import { PublishingVersionsScreen } from './PublishingVersionsScreen';
import { ValidationRulesScreen } from './ValidationRulesScreen';
import { AuditLogScreen } from './AuditLogScreen';
import { GtinMappingScreen } from './GtinMappingScreen';
import { MarketStoreManagementScreen } from './MarketStoreManagementScreen';
import PartnerWarehouseManagementScreen from './PartnerWarehouseManagementScreen';
import PriceForkCalibrationScreen from './PriceForkCalibrationScreen';
import { UserRole } from './PortalConfigTypes';
import { Partner, Warehouse } from './PartnerWarehouseSelector';

interface Brand {
  id: string;
  name: string;
}

interface PortalConfigurationManagerProps {
  userRole: UserRole;
  isAdminExperienceMode?: boolean;
  onBack: () => void;
  partners?: Partner[];
  warehouses?: Warehouse[];
  brands?: Brand[];
  onSavePartner?: (partner: Partner) => void;
  onDeletePartner?: (partnerId: string) => void;
  onSaveWarehouse?: (warehouse: Warehouse) => void;
  onDeleteWarehouse?: (warehouseId: string) => void;
  currentPartnerId?: string;
}

export function PortalConfigurationManager({
  userRole,
  isAdminExperienceMode = false,
  onBack,
  partners = [],
  warehouses = [],
  brands = [],
  onSavePartner = () => {},
  onDeletePartner = () => {},
  onSaveWarehouse = () => {},
  onDeleteWarehouse = () => {},
  currentPartnerId = '2'
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
          isAdminExperienceMode={isAdminExperienceMode}
          onNavigate={handleNavigate}
          onBack={onBack}
        />
      );

    case 'attribute-dictionary':
      return <AttributeDictionaryScreen onBack={handleBackToLanding} />;

    case 'dropdown-values':
      return <DropdownValuesScreen onBack={handleBackToLanding} onNavigate={handleNavigate} />;

    case 'attribute-mappings':
      return <AttributeMappingScreen onBack={handleBackToLanding} />;

    case 'partner-pricing':
      return <PartnerPricingScreen onBack={handleBackToLanding} />;

    case 'purchase-price-converter':
      return <PurchasePriceCurrencyConverterScreen onBack={handleBackToLanding} />;

    case 'price-fork-calibration':
      return (
        <PriceForkCalibrationScreen
          partnerId={currentPartnerId}
          onBack={handleBackToLanding}
        />
      );

    case 'currency-mapping':
      return <CurrencyMappingScreen onBack={handleBackToLanding} />;

    case 'versions':
      return <PublishingVersionsScreen onBack={handleBackToLanding} />;

    case 'validation':
      return <ValidationRulesScreen onBack={handleBackToLanding} />;

    case 'audit':
      return <AuditLogScreen onBack={handleBackToLanding} />;

    case 'gtin-mapping':
      return <GtinMappingScreen onBack={handleBackToLanding} />;

    case 'markets-stores':
      return <MarketStoreManagementScreen onBack={handleBackToLanding} />;

    case 'partner-warehouse-management':
      return (
        <PartnerWarehouseManagementScreen
          onBack={handleBackToLanding}
          partners={partners}
          warehouses={warehouses}
          brands={brands}
          onSavePartner={onSavePartner}
          onDeletePartner={onDeletePartner}
          onSaveWarehouse={onSaveWarehouse}
          onDeleteWarehouse={onDeleteWarehouse}
        />
      );

    default:
      return (
        <PortalConfigurationLanding
          userRole={userRole}
          isAdminExperienceMode={isAdminExperienceMode}
          onNavigate={handleNavigate}
          onBack={onBack}
        />
      );
  }
}

export default PortalConfigurationManager;
