import { useState } from 'react';
import { Card } from './ui/card';
import { Section } from './ui/section';
import svgPaths from "../imports/svg-8iuolkmxl8";
import StoreSelector, { Store, Country, Brand, StoreSelection } from './StoreSelector';
import SalesDataDashboard from './SalesDataDashboard';
import MonthlyGoalTracker, { GoalEditDialog } from './MonthlyGoalTracker';
import { ChevronDown, Settings, Target, UserIcon, RotateCcw, ClipboardCheck, QrCode } from 'lucide-react';
import { QuickActionButton } from './ui/quick-action-button';
import weekdayLogo from '../assets/weekday-logo.svg';
import hmLogo from '../assets/hm-logo.svg';
import cosLogo from '../assets/cos-logo.svg';

interface DeliveryHomeScreenProps {
  onNavigateToShipping: () => void;
  onNavigateToReturns: () => void;
  onNavigateToReturnsTab?: () => void;
  onNavigateToItems?: () => void;
  onNavigateToScan?: () => void;
  onNavigateToSellers?: () => void;
  onNavigateToStockCheck?: () => void;
  onNavigateToAdmin?: () => void;
  onScanToReceive?: () => void;
  inTransitDeliveriesCount?: number;
  inTransitBoxesCount?: number;
  daysSinceLastStockCheck?: number | null;
  lastStockCheckDate?: string | null;
  inStoreItemsCount?: number;
  inTransitReturnsCount?: number;
  expiredItemsCount?: number;
  itemsToScanCount?: number;
  brands: Brand[];
  countries: Country[];
  stores: Store[];
  currentStoreSelection: StoreSelection;
  onStoreSelectionChange: (selection: StoreSelection) => void;
  currentMonthlySales: number;
  monthlyGoal: number | null;
  onGoalUpdate: (newGoal: number) => void;
}



function StatusBarIPhone() {
  return (
    <div className="h-[44px] overflow-clip relative shrink-0 w-full md:hidden">
      <div className="absolute h-[11.336px] right-[14.67px] top-[17.33px] w-[66.661px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 67 12">
          <path d={svgPaths.p18c81cf0} fill="#212121" opacity="0.35" stroke="white" />
          <path d={svgPaths.p3d3cbf00} fill="#212121" opacity="0.4" />
          <path d={svgPaths.p3cceaf80} fill="#212121" />
          <path clipRule="evenodd" d={svgPaths.p1d7c8600} fill="#212121" fillRule="evenodd" />
          <path clipRule="evenodd" d={svgPaths.p3e2de00} fill="#212121" fillRule="evenodd" />
        </svg>
      </div>
      <div className="absolute h-[21px] left-[24px] rounded-[24px] top-[12px] w-[54px]">
        <div className="absolute font-normal h-[20px] leading-[0] left-[27px] text-[#212121] text-[15px] text-center top-px tracking-[-0.5px] translate-x-[-50%] w-[54px]">
          <p className="leading-[20px]">9:41</p>
        </div>
      </div>
    </div>
  );
}

interface HeaderProps {
  currentStore: string;
  onStoreClick: () => void;
  onAdminClick?: () => void;
  currentStoreSelection?: StoreSelection;
  stores?: Store[];
  brands?: Brand[];
}

function Header({ currentStore, onStoreClick, onAdminClick, currentStoreSelection, stores = [], brands = [] }: HeaderProps) {
  // Determine which logo to show based on the selected store's brand
  const getBrandLogo = () => {
    if (!currentStoreSelection?.storeId || !stores.length || !brands.length) {
      return null;
    }
    
    const currentStore = stores.find(store => store.id === currentStoreSelection.storeId);
    if (!currentStore) return null;
    
    const brand = brands.find(b => b.id === currentStore.brandId);
    if (!brand) return null;
    
    // Map brand names to logo imports
    const brandName = brand.name.toUpperCase();
    if (brandName === 'WEEKDAY') {
      return weekdayLogo;
    } else if (brandName === 'H&M' || brandName === 'H&M') {
      return hmLogo;
    } else if (brandName === 'COS') {
      return cosLogo;
    }
    
    return null;
  };

  // Get brand-specific text to display below logo
  const getBrandText = () => {
    if (!currentStoreSelection?.storeId || !stores.length || !brands.length) {
      return null;
    }
    
    const currentStore = stores.find(store => store.id === currentStoreSelection.storeId);
    if (!currentStore) return null;
    
    const brand = brands.find(b => b.id === currentStore.brandId);
    if (!brand) return null;
    
    // Map brand names to text
    const brandName = brand.name.toUpperCase();
    if (brandName === 'WEEKDAY') {
      return 'CURATED 2ND HAND';
    } else if (brandName === 'H&M' || brandName === 'H&M') {
      return 'PRE-LOVED';
    } else if (brandName === 'COS') {
      return 'RESTORE';
    }
    
    return null;
  };

  const logoPath = getBrandLogo();
  const brandText = getBrandText();
  
  // Check if current brand is H&M
  const isHMBrand = () => {
    if (!currentStoreSelection?.storeId || !stores.length || !brands.length) {
      return false;
    }
    const currentStore = stores.find(store => store.id === currentStoreSelection.storeId);
    if (!currentStore) return false;
    const brand = brands.find(b => b.id === currentStore.brandId);
    return brand?.name.toUpperCase() === 'H&M';
  };

  const isHM = isHMBrand();

  return (
    <>
      {/* Mobile Header - Full header with logo and selector */}
      <div className="w-full bg-surface border-b border-outline-variant md:hidden">
        {/* Header Content */}
        <div className="px-4 py-3">
          {/* Top Row: Logo, Admin Icon */}
          <div className="flex items-center justify-between mb-4">
            {/* Spacer to balance layout */}
            <div className="w-10" />
            
            {/* Centered Logo */}
            <div className="flex flex-col items-center">
              {logoPath ? (
                <>
                  <div className="h-[28px] mb-1 flex items-center justify-center">
                    <img 
                      src={logoPath} 
                      alt="Brand Logo" 
                      className="h-full w-auto max-w-[153px] object-contain"
                      style={isHM ? { filter: 'brightness(0) saturate(0)' } : undefined}
                    />
                  </div>
                  {brandText && (
                    <div className="label-large text-on-surface tracking-wider uppercase">
                      {brandText}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="h-[28px] w-[153px] mb-1">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 153 28">
                      <path d={svgPaths.p2523a00} fill="#1A1A1A" />
                    </svg>
                  </div>
                  <div className="label-large text-on-surface tracking-wider uppercase">
                    Resell
                  </div>
                </>
              )}
            </div>
            
            {/* Admin Settings Icon */}
            <button
              onClick={onAdminClick}
              className="p-2 rounded-full hover:bg-surface-container-high transition-colors"
              aria-label="Admin Settings"
            >
              <Settings className="h-6 w-6 text-on-surface-variant" />
            </button>
          </div>
          
          {/* Store Selector Row */}
          <div className="flex justify-center">
            <button
              onClick={onStoreClick}
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-surface-container-high transition-colors"
            >
              <span className="title-medium text-on-surface">{currentStore}</span>
              <ChevronDown className="h-4 w-4 text-on-surface-variant" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Desktop Header - Logo and selector, positioned below top nav */}
      <div className="hidden md:flex flex-col items-center px-6 py-4 bg-surface" style={{ marginTop: '4rem' }}>
        {/* Logo */}
        <div className="flex flex-col items-center mb-3">
          {logoPath ? (
            <>
              <div className="h-[28px] mb-1 flex items-center justify-center">
                <img 
                  src={logoPath} 
                  alt="Brand Logo" 
                  className="h-full w-auto max-w-[153px] object-contain"
                  style={isHM ? { filter: 'brightness(0) saturate(0)' } : undefined}
                />
              </div>
              {brandText && (
                <div className="label-large text-on-surface tracking-wider uppercase">
                  {brandText}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="h-[28px] w-[153px] mb-1">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 153 28">
                  <path d={svgPaths.p2523a00} fill="#1A1A1A" />
                </svg>
              </div>
              <div className="label-large text-on-surface tracking-wider uppercase">
                Resell
              </div>
            </>
          )}
        </div>
        
        {/* Store Selector */}
        <button
          onClick={onStoreClick}
          className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-surface-container-high transition-colors"
        >
          <span className="title-medium text-on-surface">{currentStore}</span>
          <ChevronDown className="h-4 w-4 text-on-surface-variant" />
        </button>
      </div>
    </>
  );
}

export default function DeliveryHomeScreen({ 
  onNavigateToShipping, 
  onNavigateToReturns, 
  onNavigateToReturnsTab,
  onNavigateToStockCheck, 
  onNavigateToAdmin,
  onNavigateToScan,
  onScanToReceive,
  inTransitDeliveriesCount = 0,
  inTransitBoxesCount = 0,
  daysSinceLastStockCheck = null,
  lastStockCheckDate = null,
  inStoreItemsCount = 0,
  inTransitReturnsCount = 0,
  expiredItemsCount = 0,
  itemsToScanCount = 0,
  brands,
  countries,
  stores,
  currentStoreSelection,
  onStoreSelectionChange,
  currentMonthlySales,
  monthlyGoal,
  onGoalUpdate
}: DeliveryHomeScreenProps) {
  const [isStoreSelectorOpen, setIsStoreSelectorOpen] = useState(false);

  // Get current store display name
  const getCurrentStoreDisplay = () => {
    const currentStore = stores.find(store => store.id === currentStoreSelection.storeId);
    
    if (currentStore) {
      return currentStore.name;
    }
    return 'Select Store';
  };

  const handleStoreSelectionConfirm = (selection: StoreSelection) => {
    onStoreSelectionChange(selection);
  };
  return (
    <div className="bg-surface min-h-screen w-full">
      {/* Header - Full Width */}
      <Header 
        currentStore={getCurrentStoreDisplay()} 
        onStoreClick={() => setIsStoreSelectorOpen(true)}
        onAdminClick={onNavigateToAdmin}
        currentStoreSelection={currentStoreSelection}
        stores={stores}
        brands={brands}
      />

      {/* Main Content Container */}
      <div className="w-full">
        {/* Main Content */}
        <div className="px-4 md:px-6 pt-6 pb-8 space-y-8 max-w-5xl mx-auto w-full">
          
          {/* Actions */}
          <div>
            <h2 className="title-medium text-on-surface mb-4">Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <QuickActionButton
                onClick={onScanToReceive || onNavigateToShipping}
                iconWrapperClassName="bg-primary-container"
                icon={<QrCode className="w-5 h-5 text-on-primary-container" />}
                title="Receive boxes"
                description={
                  <>
                    {inTransitDeliveriesCount} {inTransitDeliveriesCount === 1 ? 'In transit delivery' : 'In transit deliveries'}, {inTransitBoxesCount} {inTransitBoxesCount === 1 ? 'box' : 'boxes'}
                  </>
                }
              />

              <QuickActionButton
                onClick={onNavigateToReturns}
                iconWrapperClassName="bg-tertiary-container"
                icon={<RotateCcw className="w-5 h-5 text-on-tertiary-container" />}
                title="Create a return"
                description={
                  <>
                    {expiredItemsCount} item{expiredItemsCount === 1 ? '' : 's'} expired
                    {inTransitReturnsCount > 0 && ` • ${inTransitReturnsCount} ${inTransitReturnsCount === 1 ? 'return' : 'returns'} in transit`}
                  </>
                }
              />

              <QuickActionButton
                onClick={onNavigateToStockCheck}
                iconWrapperStyle={{ backgroundColor: '#dbeafe' }}
                iconWrapperClassName=""
                icon={<ClipboardCheck className="w-5 h-5 text-on-surface" />}
                title="Stock check"
                description={
                  <>
                    {inStoreItemsCount} {inStoreItemsCount === 1 ? 'item' : 'items'} in store
                    {lastStockCheckDate && (
                      ` • Last check ${new Date(lastStockCheckDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}`
                    )}
                  </>
                }
              />
            </div>
          </div>
          
          {/* Monthly Goal Tracker */}
          <Section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-on-surface-variant" />
                <h2 className="title-medium text-on-surface">
                  {new Date().toLocaleDateString('en-US', { month: 'long' })} progress
                </h2>
              </div>
              <GoalEditDialog currentGoal={monthlyGoal} onGoalUpdate={onGoalUpdate} />
            </div>
            
            <MonthlyGoalTracker 
              currentSales={currentMonthlySales}
              monthlyGoal={monthlyGoal}
            />
          </Section>
          
          {/* Sales Data Dashboard */}
          <Section>
            <SalesDataDashboard />
          </Section>
        </div>
      </div>

      {/* Store Selector Modal */}
      <StoreSelector
        isOpen={isStoreSelectorOpen}
        onClose={() => setIsStoreSelectorOpen(false)}
        onConfirm={handleStoreSelectionConfirm}
        brands={brands}
        countries={countries}
        stores={stores}
        currentSelection={currentStoreSelection}
      />
    </div>
  );
}