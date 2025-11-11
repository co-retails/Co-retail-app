import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { StatsCard } from './ui/stats-card';
import { TaskButton } from './ui/task-button';
import { Section } from './ui/section';
import svgPaths from "../imports/svg-8iuolkmxl8";
import StoreSelector, { Store, Country, Brand, StoreSelection } from './StoreSelector';
import SalesDataDashboard from './SalesDataDashboard';
import MonthlyGoalTracker, { GoalEditDialog } from './MonthlyGoalTracker';
import { ChevronDown, Settings, Target, UserIcon, Package, AlertCircle, TruckIcon, ChevronRight, ClipboardList, Search, RotateCcw, ClipboardCheck } from 'lucide-react';

interface DeliveryHomeScreenProps {
  onNavigateToShipping: () => void;
  onNavigateToReturns: () => void;
  onNavigateToReturnsTab?: () => void;
  onNavigateToItems?: () => void;
  onNavigateToScan?: () => void;
  onNavigateToSellers?: () => void;
  onNavigateToStockCheck?: () => void;
  onNavigateToAdmin?: () => void;
  onNavigateToRoleSwitcher?: () => void;
  deliveryStats: {
    newDeliveries: number;
    toReturn: number;
    returns: number;
  };
  brands: Brand[];
  countries: Country[];
  stores: Store[];
  currentStoreSelection: StoreSelection;
  onStoreSelectionChange: (selection: StoreSelection) => void;
  currentMonthlySales: number;
  monthlyGoal: number;
  onGoalUpdate: (newGoal: number) => void;
}



function StatusBarIPhone() {
  return (
    <div className="h-[44px] overflow-clip relative shrink-0 w-full">
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
  onRoleSwitcherClick?: () => void;
}

function Header({ currentStore, onStoreClick, onAdminClick, onRoleSwitcherClick }: HeaderProps) {
  return (
    <div className="w-full bg-surface border-b border-outline-variant">
      <StatusBarIPhone />
      
      {/* Header Content */}
      <div className="px-4 md:px-6 py-3">
        {/* Top Row: Profile Icon, Logo, Admin Icon */}
        <div className="flex items-center justify-between mb-4">
          {/* Profile/Role Switcher Icon */}
          <button
            onClick={onRoleSwitcherClick}
            className="p-2 rounded-full hover:bg-surface-container-high transition-colors"
            aria-label="Switch Role"
          >
            <UserIcon className="h-6 w-6 text-on-surface-variant" />
          </button>
          
          {/* Centered Logo */}
          <div className="flex flex-col items-center">
            <div className="h-[28px] w-[153px] mb-1">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 153 28">
                <path d={svgPaths.p2523a00} fill="#1A1A1A" />
              </svg>
            </div>
            <div className="label-large text-on-surface tracking-wider uppercase">
              Resell
            </div>
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
  );
}

export default function DeliveryHomeScreen({ 
  onNavigateToShipping, 
  onNavigateToReturns, 
  onNavigateToReturnsTab,
  onNavigateToItems, 
  onNavigateToScan, 
  onNavigateToSellers, 
  onNavigateToStockCheck, 
  onNavigateToAdmin,
  onNavigateToRoleSwitcher,
  deliveryStats,
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
        onRoleSwitcherClick={onNavigateToRoleSwitcher}
      />

      {/* Main Content Container */}
      <div className="w-full">
        {/* Main Content */}
        <div className="px-4 md:px-6 pt-6 pb-8 space-y-8">
          
          {/* Overview Stats - Compact Cards */}
          <div className="grid grid-cols-3 gap-3">
            <Card 
              className="p-4 bg-surface-container border border-outline-variant cursor-pointer hover:bg-surface-container-high transition-colors"
              onClick={onNavigateToShipping}
            >
              <div>
                <p className="body-small text-on-surface-variant mb-1">Inbound deliveries</p>
                <p className="headline-small text-on-surface">{deliveryStats.newDeliveries}</p>
              </div>
            </Card>

            <Card 
              className="p-4 bg-surface-container border border-outline-variant cursor-pointer hover:bg-surface-container-high transition-colors"
              onClick={onNavigateToReturns}
            >
              <div>
                <p className="body-small text-on-surface-variant mb-1">Items to return</p>
                <p className="headline-small text-on-surface">{deliveryStats.toReturn}</p>
              </div>
            </Card>

            <Card 
              className="p-4 bg-surface-container border border-outline-variant cursor-pointer hover:bg-surface-container-high transition-colors"
              onClick={onNavigateToReturnsTab || onNavigateToReturns}
            >
              <div>
                <p className="body-small text-on-surface-variant mb-1">Return deliveries</p>
                <p className="headline-small text-on-surface">{deliveryStats.returns}</p>
              </div>
            </Card>
          </div>
          
          {/* Quick Actions */}
          <div>
            <h2 className="title-medium text-on-surface mb-4">Quick actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                onClick={onNavigateToStockCheck}
                className="flex items-center justify-between p-4 bg-surface-container border border-outline-variant rounded-lg hover:bg-surface-container-high transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-container rounded-full flex items-center justify-center">
                    <ClipboardCheck className="w-5 h-5 text-on-primary-container" />
                  </div>
                  <div>
                    <p className="title-small text-on-surface">Stock check</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-on-surface-variant" />
              </button>

              <button
                onClick={() => {/* Add find delivery handler */}}
                className="flex items-center justify-between p-4 bg-surface-container border border-outline-variant rounded-lg hover:bg-surface-container-high transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-secondary-container rounded-full flex items-center justify-center">
                    <Search className="w-5 h-5 text-on-secondary-container" />
                  </div>
                  <div>
                    <p className="title-small text-on-surface">Search deliveries</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-on-surface-variant" />
              </button>
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