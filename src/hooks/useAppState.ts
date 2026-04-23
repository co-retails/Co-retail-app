import { useState } from 'react';
import { Delivery, ReturnDelivery } from '../components/ShippingScreen';
import { Partner } from '../components/PartnerSelectionScreen';
import { ReturnItem, ReturnOrder } from '../components/ReturnManagementScreen';
import { ReturnOrderDetails } from '../components/ReturnDetailsScreen';
import { StoreSelection } from '../components/StoreSelector';
import { PartnerWarehouseSelection, Partner as WarehousePartner, Warehouse } from '../components/PartnerWarehouseSelector';
import { RetailerCountrySelection } from '../components/RetailerCountrySelector';
import { ExtendedPartnerOrder } from '../components/PartnerDashboard';
import { DeliveryNote } from '../components/BoxManagementScreen';
import { SellpyOrder } from '../components/ShippingScreen';
import { OrderItem } from '../components/OrderCreationScreen';

import { UserRole as AppUserRole } from '../components/RoleSwitcher';
import { UserRole, ItemStatus } from '../components/StatusUpdateScreen';
import { StockCheckSession } from '../components/StockCheckScreen';
import { DetailType } from '../components/OrderShipmentDetailsScreen';
import { PartnerOrder } from '../components/PartnerDashboard';
import { ViewFilter } from '../components/StoreFilterBottomSheet';
import {
  mockDeliveries,
  mockPartners,
  mockReturnItems,
  mockSellpyOrders,
  mockDeliveryNotes,
  mockReturnDeliveries,
  mockPartnerOrders,
  applyDemoPartnerOrdersTodaysDates,
  mockWarehousePartners,
  visibleWarehousePartners,
  mockWarehouses
} from '../data/mockData';

export type Screen = 
  | 'home' 
  | 'shipping' 
  | 'receive' 
  | 'delivery-details'
  | 'box-details'
  | 'delivery-note-box-details'
  | 'partner-selection' 
  | 'return-management' 
  | 'return-confirmation'
  | 'return-details'
  | 'return-shipping-label' 
  | 'items' 
  | 'scan' 
  | 'sellers' 
  | 'stock-check' 
  | 'stock-check-report' 
  | 'stock-check-review' 
  | 'status-update' 
  | 'role-switcher' 
  | 'partner-dashboard' 
  | 'order-creation' 
  | 'box-management' 
  | 'order-details' 
  | 'sellpy-order-details'
  | 'retailer-id-scan' 
  | 'order-shipment-details' 
  | 'price-fork-calibration'
  | 'portal-configuration'
  | 'partner-settings'
  | 'store-user-access'
  | 'partner-user-access'
  | 'partner-reports'
  | 'shipping-report';

/**
 * Central state management hook for the entire application
 * This hook consolidates all useState declarations to keep App.tsx clean
 */
export function useAppState() {
  // Navigation state
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [shippingInitialTab, setShippingInitialTab] = useState<'shipments' | 'returns' | 'all' | 'pending' | 'in-transit' | 'delivered' | 'registered' | 'pending-packing' | 'returns-returned' | 'returns-in-transit' | 'approval' | 'pending-registered' | 'pending-pending' | 'pending-draft' | 'in-transit-filter' | undefined>(undefined);
  const [receivePreviousScreen, setReceivePreviousScreen] = useState<Screen | null>(null);
  const [returnManagementPreviousScreen, setReturnManagementPreviousScreen] = useState<Screen | null>(null);
  const [returnManagementPreviousTab, setReturnManagementPreviousTab] = useState<'shipments' | 'returns' | 'all' | 'pending' | 'in-transit' | 'delivered' | 'registered' | undefined>(undefined);
  /** Where Back from order-creation should return (partner home vs Orders & Shipments). */
  const [orderCreationReturnScreen, setOrderCreationReturnScreen] = useState<Screen>('partner-dashboard');
  
  // Role management state
  const [currentUserRole, setCurrentUserRole] = useState<AppUserRole>('store-staff');
  const [isAdminSettingsSheetOpen, setIsAdminSettingsSheetOpen] = useState(false);
  const [isSwitchViewSheetOpen, setIsSwitchViewSheetOpen] = useState(false);
  const [adminView, setAdminView] = useState<'store' | 'partner'>('store');
  /** Partner portal and admin (partner view) — email sign-in; store staff use SSO separately. */
  const [isPartnerPortalAuthenticated, setIsPartnerPortalAuthenticated] = useState(false);
  /** E-mail used at partner portal sign-in (shown in Settings until logout). */
  const [partnerPortalSessionEmail, setPartnerPortalSessionEmail] = useState<string | null>(null);
  
  // Store selection state
  const [currentStoreSelection, setCurrentStoreSelection] = useState<StoreSelection>({
    brandId: '1', // WEEKDAY
    countryId: '1', // Sweden
    storeId: '1' // Drottninggatan 63
  });
  
  // Partner/Warehouse selection state
  const [currentPartnerWarehouseSelection, setCurrentPartnerWarehouseSelection] = useState<PartnerWarehouseSelection>({
    partnerId: '1', // Sellpy Operations
    warehouseId: '1' // Stockholm Central Warehouse
  });
  
  // Partner Portal View Filter state (persists across partner portal screens)
  const [partnerPortalViewFilter, setPartnerPortalViewFilter] = useState<ViewFilter>({
    mode: 'by-partner',
    partnerId: '1' // Default to current partner
  });
  
  // Retailer/Country selection state
  const [currentRetailerSelection, setCurrentRetailerSelection] = useState<RetailerCountrySelection>({
    brandId: undefined,
    countryId: undefined
  });
  
  // Data state
  const [deliveries, setDeliveries] = useState<Delivery[]>(mockDeliveries);
  const [partnerOrders, setPartnerOrders] = useState<ExtendedPartnerOrder[]>(() =>
    applyDemoPartnerOrdersTodaysDates(mockPartnerOrders)
  );
  /** Line items for partner orders (Thrifted drafts etc.) — keyed by order id */
  const [partnerOrderLineItemsByOrderId, setPartnerOrderLineItemsByOrderId] = useState<
    Record<string, OrderItem[]>
  >({});
  const [currentOrder, setCurrentOrder] = useState<{ id: string; items: OrderItem[] } | null>(null);
  const [deliveryNotes, setDeliveryNotes] = useState<DeliveryNote[]>(mockDeliveryNotes);
  const [partners, setPartners] = useState<WarehousePartner[]>(visibleWarehousePartners);
  const [warehouses, setWarehouses] = useState<Warehouse[]>(mockWarehouses);
  
  // Sellpy flow state
  const [sellpyOrders, setSellpyOrders] = useState<SellpyOrder[]>(mockSellpyOrders);
  const [selectedSellpyOrder, setSelectedSellpyOrder] = useState<SellpyOrder | null>(null);
  const [selectedPartnerOrder, setSelectedPartnerOrder] = useState<PartnerOrder | null>(null);
  const [selectedDeliveryNote, setSelectedDeliveryNote] = useState<DeliveryNote | null>(null);
  const [showPostRegistrationDialog, setShowPostRegistrationDialog] = useState(false);
  const [registeredOrderId, setRegisteredOrderId] = useState<string | null>(null);
  
  // Return flow state
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [returnItems, setReturnItems] = useState<ReturnItem[]>(mockReturnItems);
  const [returnDeliveries, setReturnDeliveries] = useState<ReturnDelivery[]>(mockReturnDeliveries);
  const [currentReturnOrder, setCurrentReturnOrder] = useState<ReturnOrder | null>(null);
  const [currentReturnOrderDetails, setCurrentReturnOrderDetails] = useState<ReturnOrderDetails | null>(null);
  const [returnOrders, setReturnOrders] = useState<ReturnOrder[]>([]);
  
  // Stock check flow state
  const [currentStockCheckSession, setCurrentStockCheckSession] = useState<StockCheckSession | null>(null);
  
  // Delivery and Box state
  const [selectedBox, setSelectedBox] = useState<any>(null);
  const [deliveryBoxes, setDeliveryBoxes] = useState<any[]>([]);
  // Tracks which screen to return to when backing out of box-details
  // ('delivery-details' when opened from DeliveryDetailsScreen, 'receive' when
  // opened from ReceiveDeliveryScreen). Defaults to 'delivery-details'.
  const [boxDetailsPreviousScreen, setBoxDetailsPreviousScreen] = useState<'delivery-details' | 'receive'>('delivery-details');
  
  // Status update state
  const [userRole] = useState<UserRole>('Store Manager');
  
  // Monthly goal state
  const [monthlyGoal, setMonthlyGoal] = useState<number | null>(500);
  const [currentMonthlySales] = useState(287);
  
  // Details screen state
  const [detailsScreenData, setDetailsScreenData] = useState<{
    type: DetailType;
    data: PartnerOrder | DeliveryNote | ReturnDelivery;
    storeName?: string;
    storeCode?: string;
    partnerName?: string;
    warehouseName?: string;
    receiverLabel?: string;
    orderItems?: OrderItem[]; // Store order items for newly created orders
    previousScreen?: Screen; // Track where we came from for back navigation
    previousTab?: 'shipments' | 'returns' | 'all' | 'pending' | 'in-transit' | 'delivered' | 'registered' | 'orders' | 'pending-registered'; // Track which tab was active
    previousFilter?: 'packing' | 'in-transit' | 'delivered' | 'all' | 'returned' | 'approval' | 'pending' | 'registered'; // Track which filter chip was active
  } | null>(null);
  
  return {
    // Navigation
    currentScreen,
    setCurrentScreen,
    selectedDelivery,
    setSelectedDelivery,
    shippingInitialTab,
    setShippingInitialTab,
    receivePreviousScreen,
    setReceivePreviousScreen,
    returnManagementPreviousScreen,
    setReturnManagementPreviousScreen,
    returnManagementPreviousTab,
    setReturnManagementPreviousTab,
    orderCreationReturnScreen,
    setOrderCreationReturnScreen,
    
    // Role management
    currentUserRole,
    setCurrentUserRole,
    isAdminSettingsSheetOpen,
    setIsAdminSettingsSheetOpen,
    isSwitchViewSheetOpen,
    setIsSwitchViewSheetOpen,
    adminView,
    setAdminView,
    isPartnerPortalAuthenticated,
    setIsPartnerPortalAuthenticated,
    partnerPortalSessionEmail,
    setPartnerPortalSessionEmail,
    
    // Store/Partner selection
    currentStoreSelection,
    setCurrentStoreSelection,
    currentPartnerWarehouseSelection,
    setCurrentPartnerWarehouseSelection,
    partnerPortalViewFilter,
    setPartnerPortalViewFilter,
    currentRetailerSelection,
    setCurrentRetailerSelection,
    
    // Data
    deliveries,
    setDeliveries,
    partnerOrders,
    setPartnerOrders,
    partnerOrderLineItemsByOrderId,
    setPartnerOrderLineItemsByOrderId,
    currentOrder,
    setCurrentOrder,
    deliveryNotes,
    setDeliveryNotes,
    partners,
    setPartners,
    warehouses,
    setWarehouses,
    
    // Sellpy flow
    sellpyOrders,
    setSellpyOrders,
    selectedSellpyOrder,
    setSelectedSellpyOrder,
    selectedPartnerOrder,
    setSelectedPartnerOrder,
    selectedDeliveryNote,
    setSelectedDeliveryNote,
    showPostRegistrationDialog,
    setShowPostRegistrationDialog,
    registeredOrderId,
    setRegisteredOrderId,
    
    // Return flow
    selectedPartner,
    setSelectedPartner,
    returnItems,
    setReturnItems,
    returnDeliveries,
    setReturnDeliveries,
    currentReturnOrder,
    setCurrentReturnOrder,
    currentReturnOrderDetails,
    setCurrentReturnOrderDetails,
    returnOrders,
    setReturnOrders,
    
    // Stock check
    currentStockCheckSession,
    setCurrentStockCheckSession,
    
    // Delivery and Box
    selectedBox,
    setSelectedBox,
    deliveryBoxes,
    setDeliveryBoxes,
    boxDetailsPreviousScreen,
    setBoxDetailsPreviousScreen,
    
    // Status update
    userRole,
    
    // Monthly goal
    monthlyGoal,
    setMonthlyGoal,
    currentMonthlySales,
    
    // Details screen
    detailsScreenData,
    setDetailsScreenData,
    
  };
}
