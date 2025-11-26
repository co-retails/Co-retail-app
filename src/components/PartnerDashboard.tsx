import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Settings, FilterIcon, QrCodeIcon, ChevronRight, ChevronDown as ChevronDownIcon, RotateCcw, ShoppingCart, ShoppingBag, MessageSquare, Calendar, X, ClipboardList, Truck, Package, Plus, BarChart3 } from 'lucide-react';
import StoreFilterBottomSheet, { ViewFilter } from './StoreFilterBottomSheet';
import svgPaths from "../imports/svg-8iuolkmxl8";
import type { Store, Country, Brand } from './StoreSelector';
import PartnerWarehouseSelector, { Partner as WarehousePartner, Warehouse, PartnerWarehouseSelection } from './PartnerWarehouseSelector';
import { ShowroomOrder } from './ShowroomTypes';
import type { ReturnDelivery } from './ShippingScreen';

export interface PartnerOrder {
  id: string;
  status: 'approval' | 'pending' | 'registered' | 'in-transit' | 'delivered' | 'in-review';
  createdDate: string;
  itemCount: number;
  boxCount: number;
  deliveryNote?: string;
  warehouseId?: string;
  warehouseName?: string;
}

export interface PartnerStats {
  pendingOrders: number;
  registeredOrders: number;
  inTransitDeliveries: number;
  totalItemsThisMonth: number;
  inReviewOrders: number;
}

// Extended partner order interface with partner and store information
export interface ExtendedPartnerOrder extends PartnerOrder {
  partnerId?: string;
  partnerName?: string;
  receivingStoreId?: string;
  receivingStoreName?: string;
}

// View filter types
export type ViewMode = 'all' | 'by-partner' | 'by-store';

interface PartnerDashboardProps {
  onCreateOrder: () => void;
  onViewOrders: () => void;
  onViewRegisteredOrders?: () => void;
  onViewBoxes: () => void;
  onViewReturns: () => void;
  onNavigateToShowroom?: () => void;
  onAdminClick?: () => void;
  stats: PartnerStats;
  recentOrders: ExtendedPartnerOrder[];
  returnDeliveries?: ReturnDelivery[];
  brands: Brand[];
  countries: Country[];
  stores: Store[];
  partners: WarehousePartner[];
  warehouses: Warehouse[];
  currentPartnerWarehouseSelection: PartnerWarehouseSelection;
  onPartnerWarehouseSelectionChange: (selection: PartnerWarehouseSelection) => void;
  currentUserRole: 'store-staff' | 'partner';
  showroomOrders?: ShowroomOrder[];
  onNavigateToQuotations?: () => void;
  onViewQuotationDetails?: (quotationId: string) => void;
  onOpenOrderDetails?: (order: ExtendedPartnerOrder) => void;
  onNavigateToReports?: () => void;
  // Shared filter state for partner portal
  viewFilter: ViewFilter;
  onViewFilterChange: (filter: ViewFilter) => void;
}

export default function PartnerDashboard({
  onCreateOrder,
  onViewOrders,
  onViewRegisteredOrders,
  onViewBoxes,
  onViewReturns,
  onNavigateToShowroom,
  onAdminClick,
  stats,
  recentOrders,
  returnDeliveries = [],
  brands,
  countries,
  stores,
  partners,
  warehouses,
  currentPartnerWarehouseSelection,
  onPartnerWarehouseSelectionChange,
  currentUserRole,
  showroomOrders = [],
  onNavigateToQuotations,
  onViewQuotationDetails,
  viewFilter,
  onViewFilterChange,
  onOpenOrderDetails,
  onNavigateToReports
}: PartnerDashboardProps) {
  const [isPartnerWarehouseSelectorOpen, setIsPartnerWarehouseSelectorOpen] = useState(false);
  
  // Update view filter when partner selection changes (reset to partner-only view)
  useEffect(() => {
    // Only reset if switching to a different partner, preserve brand/country/store filters if same partner
    if (viewFilter.partnerId !== currentPartnerWarehouseSelection.partnerId) {
      onViewFilterChange({ 
        mode: 'by-partner', 
        partnerId: currentPartnerWarehouseSelection.partnerId 
      });
    } else if (!viewFilter.partnerId) {
      // Initialize if no partner ID set
      onViewFilterChange({ 
        mode: 'by-partner', 
        partnerId: currentPartnerWarehouseSelection.partnerId 
      });
    }
  }, [currentPartnerWarehouseSelection.partnerId]);

  // Get current partner/warehouse display name
  const getCurrentPartnerWarehouseDisplay = () => {
    if (!currentPartnerWarehouseSelection.partnerId) {
      return 'Select partner';
    }
    const currentPartner = partners.find(partner => partner.id === currentPartnerWarehouseSelection.partnerId);
    const currentWarehouse = warehouses.find(warehouse => warehouse.id === currentPartnerWarehouseSelection.warehouseId);
    
    if (currentPartner && currentWarehouse) {
      return `${currentPartner.name} - ${currentWarehouse.name}`;
    }
    if (currentPartner) {
      return currentPartner.name;
    }
    return 'Select Partner & Warehouse';
  };

  const handlePartnerWarehouseSelectionConfirm = (selection: PartnerWarehouseSelection) => {
    onPartnerWarehouseSelectionChange(selection);
  };

  // Filter recent orders based on current view mode
  const getFilteredOrders = () => {
    let filteredOrders = recentOrders;
    const selectedWarehouseId = currentPartnerWarehouseSelection.warehouseId;
    
    // Note: Approval orders filtering will be handled by passing isAdmin prop
    // For now, we'll filter them out - this should be updated when isAdmin prop is added
    
    switch (viewFilter.mode) {
      case 'by-partner':
        return viewFilter.partnerId 
          ? filteredOrders.filter(order => {
              const matchesPartner = order.partnerId === viewFilter.partnerId;
              const matchesWarehouse = !selectedWarehouseId || order.warehouseId === selectedWarehouseId;
              return matchesPartner && matchesWarehouse;
            })
          : [];
      case 'by-store':
        // Apply all active filters
        
        // Filter by selected stores
        if (viewFilter.storeIds?.length) {
          filteredOrders = filteredOrders.filter(order => 
            order.receivingStoreId && viewFilter.storeIds!.includes(order.receivingStoreId)
          );
        }
        
        // Filter by selected brands (if no specific stores selected)
        if (viewFilter.brandIds?.length && (!viewFilter.storeIds?.length)) {
          const brandStoreIds = stores
            .filter(store => viewFilter.brandIds!.includes(store.brandId))
            .map(store => store.id);
          filteredOrders = filteredOrders.filter(order => 
            order.receivingStoreId && brandStoreIds.includes(order.receivingStoreId)
          );
        }
        
        // Filter by selected countries (if no specific stores/brands selected)
        if (viewFilter.countryIds?.length && (!viewFilter.storeIds?.length) && (!viewFilter.brandIds?.length)) {
          const countryStoreIds = stores
            .filter(store => viewFilter.countryIds!.includes(store.countryId))
            .map(store => store.id);
          filteredOrders = filteredOrders.filter(order => 
            order.receivingStoreId && countryStoreIds.includes(order.receivingStoreId)
          );
        }
        
        return filteredOrders;
      default:
        return filteredOrders.filter(order => {
          const matchesWarehouse = !selectedWarehouseId || order.warehouseId === selectedWarehouseId;
          return matchesWarehouse;
        });
    }
  };

  // Calculate filtered stats based on current view mode
  const getFilteredStats = (): PartnerStats => {
    if (viewFilter.mode === 'all' && !viewFilter.partnerId) {
      return stats;
    }
    const filteredOrders = getFilteredOrders();
    
    return {
      pendingOrders: filteredOrders.filter(order => order.status === 'pending').length,
      registeredOrders: filteredOrders.filter(order => order.status === 'registered').length,
      inTransitDeliveries: filteredOrders.filter(order => order.status === 'in-transit').length,
      totalItemsThisMonth: filteredOrders.reduce((sum, order) => sum + order.itemCount, 0),
      inReviewOrders: filteredOrders.filter(order => order.status === 'in-review').length
    };
  };

  // Handle view all stores (reset to partner only)
  const handleViewAllStores = () => {
    onViewFilterChange({ mode: 'by-partner', partnerId: currentPartnerWarehouseSelection.partnerId });
  };

  // Handle brand filter change (multiselect)
  const handleBrandFilterChange = (brandIds: string[]) => {
    onViewFilterChange({ 
      mode: 'by-store', 
      brandIds, 
      storeIds: viewFilter.storeIds,
      countryIds: viewFilter.countryIds,
      partnerId: viewFilter.partnerId
    });
  };

  // Handle store filter change (multiselect)
  const handleStoreFilterChange = (storeIds: string[]) => {
    onViewFilterChange({ 
      mode: 'by-store', 
      brandIds: viewFilter.brandIds,
      storeIds, 
      countryIds: viewFilter.countryIds,
      partnerId: viewFilter.partnerId
    });
  };

  // Handle country filter change (multiselect)
  const handleCountryFilterChange = (countryIds: string[]) => {
    onViewFilterChange({ 
      mode: 'by-store', 
      brandIds: viewFilter.brandIds,
      storeIds: viewFilter.storeIds,
      countryIds,
      partnerId: viewFilter.partnerId
    });
  };

  const filteredStats = getFilteredStats();
  const filteredOrders = getFilteredOrders();
  const currentPartner = partners.find(partner => partner.id === currentPartnerWarehouseSelection.partnerId);
  const currentPartnerName = currentPartner?.name ?? '';
  const isThriftedOrSellpyPartner = ['Thrifted', 'Sellpy', 'Sellpy Operations'].some(name => currentPartnerName.includes(name));
  const pendingOrdersCount = filteredStats.pendingOrders;
  const activeShipmentsCount = filteredStats.inTransitDeliveries;
  const registeredOrdersCount = filteredStats.registeredOrders;
  const relevantReturnDeliveries = returnDeliveries.filter(delivery => {
    const matchesPartner = !currentPartnerWarehouseSelection.partnerId || delivery.partnerId === currentPartnerWarehouseSelection.partnerId;
    const matchesWarehouse = !currentPartnerWarehouseSelection.warehouseId || delivery.warehouseId === currentPartnerWarehouseSelection.warehouseId;
    return matchesPartner && matchesWarehouse;
  });
  const inTransitReturnCount = relevantReturnDeliveries.filter(delivery => delivery.status === 'In transit').length;
  const pendingOrdersLabel = `${pendingOrdersCount} pending ${pendingOrdersCount === 1 ? 'order' : 'orders'}`;
  const inTransitReturnsLabel = `${inTransitReturnCount} in transit ${inTransitReturnCount === 1 ? 'return' : 'returns'}`;

  const getOrderStatusVariant = (status: ExtendedPartnerOrder['status']): 'default' | 'secondary' | 'outline' => {
    switch (status) {
      case 'registered':
        return 'default';
      case 'approval':
        return 'outline';
      case 'in-transit':
      case 'in-review':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getOrderStatusLabel = (status: ExtendedPartnerOrder['status']) => {
    switch (status) {
      case 'approval':
        return 'Approval';
      case 'pending':
        return 'Pending';
      case 'registered':
        return 'Registered';
      case 'in-transit':
        return 'In transit';
      case 'delivered':
        return 'Delivered';
      case 'in-review':
        return 'In review';
      default:
        return status;
    }
  };

  const StatusBarIPhone = () => {
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
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* Mobile Header - Full header with logo and selector */}
      <div className="w-full bg-surface border-b border-outline-variant md:hidden">
        <StatusBarIPhone />
        
        {/* Header Content */}
        <div className="px-4 md:px-6 py-3">
          {/* Top Row: Logo, Admin Icon */}
          <div className="flex items-center justify-between mb-4">
            {/* Spacer to balance layout */}
            <div className="w-10" />
            
            {/* Centered Logo */}
            <div className="flex flex-col items-center">
              <div className="h-[28px] w-[153px] mb-1">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 153 28">
                  <path d={svgPaths.p2523a00} fill="#1A1A1A" />
                </svg>
              </div>
              <div className="label-large text-on-surface tracking-wider uppercase">
                {currentUserRole === 'partner' ? 'Partner portal' : 'Resell'}
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
          
          {/* Partner/Warehouse Selector Row */}
          <div className="flex justify-center">
            <button
              onClick={() => setIsPartnerWarehouseSelectorOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-surface-container-high transition-colors"
            >
              <span className="title-medium text-on-surface">{getCurrentPartnerWarehouseDisplay()}</span>
              <ChevronDownIcon className="h-4 w-4 text-on-surface-variant" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Desktop Header - Logo and selector, positioned below top nav */}
      <div className="hidden md:flex flex-col items-center px-6 py-4 bg-surface" style={{ marginTop: '4rem' }}>
        {/* Logo */}
        <div className="flex flex-col items-center mb-3">
          <div className="h-[28px] w-[153px] mb-1">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 153 28">
              <path d={svgPaths.p2523a00} fill="#1A1A1A" />
            </svg>
          </div>
          <div className="label-large text-on-surface tracking-wider uppercase">
            {currentUserRole === 'partner' ? 'Partner portal' : 'Resell'}
          </div>
        </div>
        
        {/* Partner/Warehouse Selector */}
        <button
          onClick={() => setIsPartnerWarehouseSelectorOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-surface-container-high transition-colors"
        >
          <span className="title-medium text-on-surface">{getCurrentPartnerWarehouseDisplay()}</span>
          <ChevronDownIcon className="h-4 w-4 text-on-surface-variant" />
        </button>
      </div>

      {/* Main Content Container */}
      <div className="w-full">
        {/* Main Content */}
        <div className="px-4 md:px-6 pt-6 pb-8 space-y-8 max-w-5xl mx-auto w-full">
        {/* Partner Overview - Matching Home Screen Button Style */}
        <div className="space-y-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              {/* Partner Overview Title */}
              <h2 className="title-medium text-on-surface">Partner overview</h2>
              
              {/* Filter Button - Mobile & Desktop - Matching ShippingScreen design */}
              <StoreFilterBottomSheet
                viewFilter={viewFilter}
                onViewAllStores={handleViewAllStores}
                onBrandFilterChange={handleBrandFilterChange}
                onStoreFilterChange={handleStoreFilterChange}
                onCountryFilterChange={handleCountryFilterChange}
                currentPartnerId={currentPartnerWarehouseSelection.partnerId}
                partners={partners}
                brands={brands}
                stores={stores}
                countries={countries}
              >
                <button 
                  className={`
                    h-12 md:h-12 px-3 border transition-colors flex items-center gap-2 flex-shrink-0 rounded-[8px] min-h-[48px] touch-manipulation
                    ${((viewFilter.storeIds?.length || 0) > 0 || 
                      (viewFilter.brandIds?.length || 0) > 0 || 
                      (viewFilter.countryIds?.length || 0) > 0)
                      ? 'bg-secondary-container border-outline text-on-secondary-container'
                      : 'bg-surface border-outline text-on-surface-variant hover:bg-surface-container-high'
                    }
                  `}
                >
                  <FilterIcon className="h-4 w-4 flex-shrink-0" />
                  <span className="label-medium">
                    {((viewFilter.brandIds?.length || 0) > 0 || 
                      (viewFilter.countryIds?.length || 0) > 0 || 
                      (viewFilter.storeIds?.length || 0) > 0)
                      ? 'Filtered'
                      : 'Filter'
                    }
                  </span>
                  {((viewFilter.brandIds?.length || 0) > 0 || 
                    (viewFilter.countryIds?.length || 0) > 0 || 
                    (viewFilter.storeIds?.length || 0) > 0) && (
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  )}
                </button>
              </StoreFilterBottomSheet>
            </div>
            
            {/* Filter Chips Display - M3 Pattern with Filter Chips - Desktop & Mobile */}
            {((viewFilter.brandIds?.length || 0) > 0 || 
              (viewFilter.countryIds?.length || 0) > 0 || 
              (viewFilter.storeIds?.length || 0) > 0) && (
              <div className="mb-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="label-small text-on-surface-variant">Active filters:</span>
                  
                  {/* Brand Filter Chips */}
                  {viewFilter.brandIds && viewFilter.brandIds.length > 0 && 
                    brands.filter(b => viewFilter.brandIds!.includes(b.id)).map(brand => (
                      <div 
                        key={`brand-${brand.id}`} 
                        className="inline-flex items-center gap-2 h-10 md:h-8 px-3 bg-secondary-container text-on-secondary-container border border-outline-variant rounded-[8px] min-h-[40px] md:min-h-0 touch-manipulation"
                      >
                        <span className="label-small">{brand.name}</span>
                        <button
                          onClick={() => {
                            const newBrandIds = viewFilter.brandIds!.filter(id => id !== brand.id);
                            handleBrandFilterChange(newBrandIds);
                          }}
                          className="p-0.5 rounded-full hover:bg-on-secondary-container/10 transition-colors"
                          aria-label={`Remove ${brand.name} filter`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))
                  }
                  
                  {/* Country Filter Chips */}
                  {viewFilter.countryIds && viewFilter.countryIds.length > 0 && 
                    countries.filter(c => viewFilter.countryIds!.includes(c.id)).map(country => (
                      <div 
                        key={`country-${country.id}`} 
                        className="inline-flex items-center gap-2 h-10 md:h-8 px-3 bg-secondary-container text-on-secondary-container border border-outline-variant rounded-[8px] min-h-[40px] md:min-h-0 touch-manipulation"
                      >
                        <span className="label-small">{country.name}</span>
                        <button
                          onClick={() => {
                            const newCountryIds = viewFilter.countryIds!.filter(id => id !== country.id);
                            handleCountryFilterChange(newCountryIds);
                          }}
                          className="p-0.5 rounded-full hover:bg-on-secondary-container/10 transition-colors"
                          aria-label={`Remove ${country.name} filter`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))
                  }
                  
                  {/* Store Filter Chips */}
                  {viewFilter.storeIds && viewFilter.storeIds.length > 0 && 
                    stores.filter(s => viewFilter.storeIds!.includes(s.id)).map(store => (
                      <div 
                        key={`store-${store.id}`} 
                        className="inline-flex items-center gap-2 h-10 md:h-8 px-3 bg-secondary-container text-on-secondary-container border border-outline-variant rounded-[8px] min-h-[40px] md:min-h-0 touch-manipulation"
                      >
                        <span className="label-small">{store.name} ({store.code})</span>
                        <button
                          onClick={() => {
                            const newStoreIds = viewFilter.storeIds!.filter(id => id !== store.id);
                            handleStoreFilterChange(newStoreIds);
                          }}
                          className="p-0.5 rounded-full hover:bg-on-secondary-container/10 transition-colors"
                          aria-label={`Remove ${store.name} filter`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))
                  }
                  
                  {/* Clear All Filters Button */}
                  <button
                    onClick={handleViewAllStores}
                    className="inline-flex items-center h-10 md:h-8 px-3 bg-surface-container-high hover:bg-surface-container-highest text-on-surface transition-colors rounded-[8px] min-h-[40px] md:min-h-0 touch-manipulation"
                  >
                    <span className="label-small">Clear all</span>
                  </button>
                </div>
              </div>
            )}
            
            {/* Mobile Filter summary removed to avoid duplication with chips */}
          </div>
          
        </div>

        {/* Overview Stats - Compact Cards (Thrifted/Sellpy only) */}
        {isThriftedOrSellpyPartner && (
          <div className="grid grid-cols-2 gap-3">
            <Card
              className="p-4 bg-surface-container border border-outline-variant cursor-pointer hover:bg-surface-container-high transition-colors"
              onClick={onViewBoxes}
            >
              <div>
                <p className="body-small text-on-surface-variant mb-1">Shipments in transit</p>
                <p className="headline-small text-on-surface">{activeShipmentsCount}</p>
              </div>
            </Card>
          </div>
        )}

        {/* Quick Actions */}
        {isThriftedOrSellpyPartner ? (
          <div>
            <h2 className="title-medium text-on-surface mb-4">Quick actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    onClick={onViewOrders}
                    className="flex items-center justify-between p-4 bg-surface-container border border-outline-variant rounded-lg hover:bg-surface-container-high transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-container rounded-full flex items-center justify-center">
                        <ClipboardList className="w-5 h-5 text-on-primary-container" />
                      </div>
                      <div>
                        <p className="title-small text-on-surface">Orders to process</p>
                        <p className="body-small text-on-surface-variant">{pendingOrdersLabel}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-on-surface-variant" />
                  </button>

                  <button
                    onClick={onViewRegisteredOrders ?? onViewOrders}
                    className="flex items-center justify-between p-4 bg-surface-container border border-outline-variant rounded-lg hover:bg-surface-container-high transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-tertiary-container rounded-full flex items-center justify-center">
                        <Package className="w-5 h-5 text-on-tertiary-container" />
                      </div>
                      <div>
                        <p className="title-small text-on-surface">Orders to pack</p>
                        <p className="body-small text-on-surface-variant">
                          {registeredOrdersCount} registered {registeredOrdersCount === 1 ? 'order' : 'orders'}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-on-surface-variant" />
                  </button>

                  <button
                    onClick={onViewReturns}
                    className="flex items-center justify-between p-4 bg-surface-container border border-outline-variant rounded-lg hover:bg-surface-container-high transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-tertiary-container rounded-full flex items-center justify-center">
                        <RotateCcw className="w-5 h-5 text-on-tertiary-container" />
                      </div>
                      <div>
                        <p className="title-small text-on-surface">Mark as returned</p>
                        <p className="body-small text-on-surface-variant">{inTransitReturnsLabel}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-on-surface-variant" />
                  </button>

                  {/* Reports */}
                  {onNavigateToReports && (
                    <button
                      onClick={onNavigateToReports}
                      className="flex items-center justify-between p-4 bg-surface-container border border-outline-variant rounded-lg hover:bg-surface-container-high transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-container rounded-full flex items-center justify-center">
                          <BarChart3 className="w-5 h-5 text-on-primary-container" />
                        </div>
                        <div>
                          <p className="title-small text-on-surface">View reports</p>
                          <p className="body-small text-on-surface-variant">Sales & Stock analytics</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-on-surface-variant" />
                    </button>
                  )}
            </div>
          </div>
        ) : (
          <div>
            <h2 className="title-medium text-on-surface mb-4">Quick actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Chinese Partner Quick Actions */}
              {partners?.find(p => p.id === currentPartnerWarehouseSelection.partnerId)?.name === 'Shenzhen Fashion Manufacturing' ? (
                <>
                  {/* Quotation Requests for Chinese partner */}
                  {onNavigateToQuotations && (
                    <button
                      onClick={onNavigateToQuotations}
                      className="flex items-center justify-between p-4 bg-surface-container border border-outline-variant rounded-lg hover:bg-surface-container-high transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                          <ShoppingCart className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                          <p className="title-small text-on-surface">Quotation requests</p>
                          <p className="body-small text-on-surface-variant">
                            {showroomOrders.filter(o => o.type === 'rfq' && (o.status === 'pending' || o.status === 'negotiation')).length} pending
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-on-surface-variant" />
                    </button>
                  )}

                  {/* Showroom Products */}
                  {onNavigateToShowroom && (
                    <button
                      onClick={onNavigateToShowroom}
                      className="flex items-center justify-between p-4 bg-surface-container border border-outline-variant rounded-lg hover:bg-surface-container-high transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-container rounded-full flex items-center justify-center">
                          <ShoppingBag className="w-5 h-5 text-on-primary-container" />
                        </div>
                        <div>
                          <p className="title-small text-on-surface">Showroom</p>
                          <p className="body-small text-on-surface-variant">Manage products</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-on-surface-variant" />
                    </button>
                  )}
                </>
              ) : (
                <>
                  {/* Regular Partner Quick Actions */}
                  <button
                    onClick={onViewOrders}
                    className="flex items-center justify-between p-4 bg-surface-container border border-outline-variant rounded-lg hover:bg-surface-container-high transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-container rounded-full flex items-center justify-center">
                        <ClipboardList className="w-5 h-5 text-on-primary-container" />
                      </div>
                      <div>
                        <p className="title-small text-on-surface">Orders to process</p>
                        <p className="body-small text-on-surface-variant">{filteredStats.pendingOrders} orders</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-on-surface-variant" />
                  </button>

                  <button
                    onClick={onViewBoxes}
                    className="flex items-center justify-between p-4 bg-surface-container border border-outline-variant rounded-lg hover:bg-surface-container-high transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-secondary-container rounded-full flex items-center justify-center">
                        <Truck className="w-5 h-5 text-on-secondary-container" />
                      </div>
                      <div>
                        <p className="title-small text-on-surface">Active shipments</p>
                        <p className="body-small text-on-surface-variant">{filteredStats.inTransitDeliveries} shipments</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-on-surface-variant" />
                  </button>

                  <button
                    onClick={onViewReturns}
                    className="flex items-center justify-between p-4 bg-surface-container border border-outline-variant rounded-lg hover:bg-surface-container-high transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-tertiary-container rounded-full flex items-center justify-center">
                        <RotateCcw className="w-5 h-5 text-on-tertiary-container" />
                      </div>
                      <div>
                        <p className="title-small text-on-surface">Return deliveries</p>
                        <p className="body-small text-on-surface-variant">{filteredStats.inTransitDeliveries} deliveries</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-on-surface-variant" />
                  </button>

                  {/* Reports */}
                  {onNavigateToReports && (
                    <button
                      onClick={onNavigateToReports}
                      className="flex items-center justify-between p-4 bg-surface-container border border-outline-variant rounded-lg hover:bg-surface-container-high transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-container rounded-full flex items-center justify-center">
                          <BarChart3 className="w-5 h-5 text-on-primary-container" />
                        </div>
                        <div>
                          <p className="title-small text-on-surface">View reports</p>
                          <p className="body-small text-on-surface-variant">Sales & Stock analytics</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-on-surface-variant" />
                    </button>
                  )}

                  {/* Digital Showroom - Only for white-label partners */}
                  {onNavigateToShowroom && 
                   partners?.find(p => p.id === currentPartnerWarehouseSelection.partnerId)?.productType === 'white-label' && (
                    <button
                      onClick={onNavigateToShowroom}
                      className="flex items-center justify-between p-4 bg-surface-container border border-outline-variant rounded-lg hover:bg-surface-container-high transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-secondary-container rounded-full flex items-center justify-center">
                          <ShoppingBag className="w-5 h-5 text-on-secondary-container" />
                        </div>
                        <div>
                          <p className="title-small text-on-surface">Showroom</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-on-surface-variant" />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Latest Quotation Requests - Chinese Partner Only */}
        {partners?.find(p => p.id === currentPartnerWarehouseSelection.partnerId)?.name === 'Shenzhen Fashion Manufacturing' && (
          <Card className="bg-transparent border border-outline-variant shadow-none">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="title-medium">Latest quotation requests</CardTitle>
                {onNavigateToQuotations && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={onNavigateToQuotations}
                    className="body-small"
                  >
                    View all
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {showroomOrders.filter(o => o.type === 'rfq').length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare size={48} className="mx-auto text-on-surface-variant/50 mb-4" />
                  <p className="body-large text-on-surface-variant">No quotation requests yet</p>
                  <p className="body-medium text-on-surface-variant">Quotation requests from buyers will appear here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {showroomOrders
                    .filter(o => o.type === 'rfq')
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 5)
                    .map((quotation) => {
                      const getQuotationStatusBadge = (status: string) => {
                        const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
                          requested: { label: 'New request', variant: 'default' },
                          negotiation: { label: 'In negotiation', variant: 'secondary' },
                          quote_approved: { label: 'Approved', variant: 'secondary' },
                          converted_to_po: { label: 'Converted to PO', variant: 'outline' },
                          rejected: { label: 'Rejected', variant: 'destructive' }
                        };
                        const config = statusConfig[status] || { label: status, variant: 'outline' as const };
                        return <Badge variant={config.variant}>{config.label}</Badge>;
                      };

                      return (
                        <button
                          key={quotation.id}
                          onClick={() => onViewQuotationDetails?.(quotation.id)}
                          className="w-full flex items-start justify-between p-3 rounded-lg border border-outline-variant hover:bg-surface-container-high transition-colors text-left"
                        >
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="title-small text-on-surface">RFQ #{quotation.id}</p>
                              {getQuotationStatusBadge(quotation.status)}
                            </div>
                            <div className="flex items-center gap-2 text-on-surface-variant">
                              <Calendar className="w-4 h-4" />
                              <p className="body-small">
                                {new Date(quotation.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </p>
                            </div>
                            <p className="body-small text-on-surface-variant">
                              {quotation.items.length} {quotation.items.length === 1 ? 'item' : 'items'} • {quotation.buyerName}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1 ml-3">
                            <p className="title-small text-on-surface">$ {quotation.subtotal.toFixed(2)}</p>
                            <ChevronRight className="w-5 h-5 text-on-surface-variant" />
                          </div>
                        </button>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Recent Orders */}
        {partners?.find(p => p.id === currentPartnerWarehouseSelection.partnerId)?.name !== 'Shenzhen Fashion Manufacturing' && (
          <Card className="bg-transparent border border-outline-variant shadow-none">
            <CardHeader>
              <CardTitle className="title-medium">Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredOrders.length === 0 ? (
                <div className="text-center py-8">
                  <Package size={48} className="mx-auto text-on-surface-variant/50 mb-4" />
                  {partners?.find(p => p.id === currentPartnerWarehouseSelection.partnerId)?.name === 'Sellpy Operations' ? (
                    <>
                      <p className="body-large text-on-surface-variant">No items need item IDs</p>
                      <p className="body-medium text-on-surface-variant">Items from API integration will appear here when they need item IDs</p>
                      <Button onClick={onCreateOrder} className="mt-4">
                        <QrCodeIcon size={16} className="mr-2" />
                        Check for Items
                      </Button>
                    </>
                  ) : (
                    <>
                      <p className="body-large text-on-surface-variant">No orders yet</p>
                      <p className="body-medium text-on-surface-variant">Create your first order to get started</p>
                      <Button onClick={onCreateOrder} className="mt-4">
                        <Plus size={16} className="mr-2" />
                        Create Order
                      </Button>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredOrders.map(order => (
                    <Card 
                      key={order.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => onOpenOrderDetails?.(order)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          onOpenOrderDetails?.(order);
                        }
                      }}
                      className="p-4 border-outline-variant bg-surface-container hover:bg-surface-container-high transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="title-small text-on-surface mb-1">{order.id}</div>
                          <div className="body-small text-on-surface-variant">{order.itemCount} items • {order.boxCount} boxes</div>
                          <div className="body-small text-on-surface-variant">Created {order.createdDate}</div>
                          {(() => {
                            const receivingStore = stores.find(store => store.id === order.receivingStoreId);
                            const brandName = receivingStore
                              ? brands.find(brand => brand.id === receivingStore.brandId)?.name
                              : undefined;
                            if (!order.receivingStoreName && !receivingStore && !brandName) {
                              return null;
                            }
                            const name = order.receivingStoreName || receivingStore?.name;
                            const code = receivingStore?.code || order.receivingStoreId;
                            if (!name && !code && !brandName) {
                              return null;
                            }
                            return (
                              <div className="body-small text-on-surface-variant">
                                To: {brandName && <span className="font-medium text-on-surface">{brandName}</span>}
                                {brandName && (name || code) ? ' • ' : ''}
                                {name || 'Unknown store'}
                                {code && <span className="ml-1">({code})</span>}
                              </div>
                            );
                          })()}
                        </div>
                        <Badge variant={getOrderStatusVariant(order.status)}>
                          {getOrderStatusLabel(order.status)}
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
        </div>
      </div>

      {/* Partner/Warehouse Selector Modal */}
      <PartnerWarehouseSelector
        isOpen={isPartnerWarehouseSelectorOpen}
        onClose={() => setIsPartnerWarehouseSelectorOpen(false)}
        onConfirm={handlePartnerWarehouseSelectionConfirm}
        partners={partners}
        warehouses={warehouses}
        currentSelection={currentPartnerWarehouseSelection}
      />
    </div>
  );
}