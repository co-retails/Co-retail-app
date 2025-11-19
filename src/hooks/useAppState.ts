import { useState } from 'react';
import { Delivery, ReturnDelivery } from '../components/ShippingScreen';
import { Partner } from '../components/PartnerSelectionScreen';
import { ReturnItem, ReturnOrder } from '../components/ReturnManagementScreen';
import { ReturnOrderDetails } from '../components/ReturnDetailsScreen';
import { StoreSelection } from '../components/StoreSelector';
import { PartnerWarehouseSelection } from '../components/PartnerWarehouseSelector';
import { RetailerCountrySelection } from '../components/RetailerCountrySelector';
import { ExtendedPartnerOrder } from '../components/PartnerDashboard';
import { DeliveryNote } from '../components/BoxManagementScreen';
import { SellpyOrder } from '../components/ShippingScreen';
import { OrderItem } from '../components/OrderCreationScreen';
import { ShowroomProduct, ShowroomOrder, CartItem, LineSheet, ShowroomMessage } from '../components/ShowroomTypes';
import { QuotationRequest } from '../components/BuyerQuotationsScreen';
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
  mockShowroomProducts,
  mockShowroomOrders,
  mockLineSheets,
  mockShowroomMessages,
  mockBuyerQuotations,
  mockSellpyOrders,
  mockDeliveryNotes,
  mockReturnDeliveries,
  mockPartnerOrders
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
  | 'showroom-dashboard' 
  | 'showroom-products' 
  | 'showroom-import' 
  | 'price-fork-calibration'
  | 'showroom-browse' 
  | 'showroom-product-detail' 
  | 'showroom-cart' 
  | 'showroom-orders' 
  | 'purchase-order-details' 
  | 'line-sheet-creation' 
  | 'line-sheets-list' 
  | 'product-edit' 
  | 'partner-quotations' 
  | 'quotation-details' 
  | 'buyer-dashboard' 
  | 'buyer-wishlist' 
  | 'buyer-quotations' 
  | 'buyer-quotation-details' 
  | 'buyer-shipments' 
  | 'buyer-orders' 
  | 'buyer-order-details' 
  | 'portal-configuration'
  | 'partner-settings';

/**
 * Central state management hook for the entire application
 * This hook consolidates all useState declarations to keep App.tsx clean
 */
export function useAppState() {
  // Navigation state
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [shippingInitialTab, setShippingInitialTab] = useState<'shipments' | 'returns' | 'all' | 'pending' | 'in-transit' | 'delivered' | 'registered' | undefined>(undefined);
  
  // Role management state
  const [currentUserRole, setCurrentUserRole] = useState<AppUserRole>('admin');
  const [isRoleSwitcherSheetOpen, setIsRoleSwitcherSheetOpen] = useState(false);
  const [isAdminSettingsSheetOpen, setIsAdminSettingsSheetOpen] = useState(false);
  
  // Store selection state
  const [currentStoreSelection, setCurrentStoreSelection] = useState<StoreSelection>({
    brandId: '1', // WEEKDAY
    countryId: '1', // Sweden
    storeId: '1' // Drottninggatan 63
  });
  
  // Partner/Warehouse selection state
  const [currentPartnerWarehouseSelection, setCurrentPartnerWarehouseSelection] = useState<PartnerWarehouseSelection>({
    partnerId: '6', // Shenzhen Fashion Manufacturing
    warehouseId: '13' // Shenzhen Production Facility
  });
  
  // Partner Portal View Filter state (persists across partner portal screens)
  const [partnerPortalViewFilter, setPartnerPortalViewFilter] = useState<ViewFilter>({
    mode: 'by-partner',
    partnerId: '6' // Default to current partner
  });
  
  // Retailer/Country selection state (for Buyer mode)
  const [currentRetailerSelection, setCurrentRetailerSelection] = useState<RetailerCountrySelection>({
    brandId: undefined,
    countryId: undefined
  });
  
  // Data state
  const [deliveries, setDeliveries] = useState<Delivery[]>(mockDeliveries);
  const [partnerOrders, setPartnerOrders] = useState<ExtendedPartnerOrder[]>(mockPartnerOrders);
  const [currentOrder, setCurrentOrder] = useState<{ id: string; items: OrderItem[] } | null>(null);
  const [deliveryNotes, setDeliveryNotes] = useState<DeliveryNote[]>(mockDeliveryNotes);
  
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
  
  // Status update state
  const [userRole] = useState<UserRole>('Store Manager');
  
  // Monthly goal state
  const [monthlyGoal, setMonthlyGoal] = useState(500);
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
  } | null>(null);
  
  // Digital Showroom state
  const [showroomProducts, setShowroomProducts] = useState<ShowroomProduct[]>(mockShowroomProducts);
  const [showroomOrders, setShowroomOrders] = useState<ShowroomOrder[]>(mockShowroomOrders);
  const [showroomCart, setShowroomCart] = useState<CartItem[]>([]);
  const [selectedShowroomProduct, setSelectedShowroomProduct] = useState<ShowroomProduct | null>(null);
  const [selectedShowroomOrder, setSelectedShowroomOrder] = useState<ShowroomOrder | null>(null);
  const [lineSheets, setLineSheets] = useState<LineSheet[]>(mockLineSheets);
  const [selectedLineSheet, setSelectedLineSheet] = useState<LineSheet | null>(null);
  const [selectedProductForEdit, setSelectedProductForEdit] = useState<ShowroomProduct | null>(null);
  const [showroomActiveTab, setShowroomActiveTab] = useState<'products' | 'linesheets' | 'analytics'>('products');
  const [showroomMessages, setShowroomMessages] = useState<Record<string, ShowroomMessage[]>>(mockShowroomMessages);
  
  // Buyer state
  const [buyerQuotations, setBuyerQuotations] = useState<QuotationRequest[]>(mockBuyerQuotations);
  const [selectedQuotation, setSelectedQuotation] = useState<QuotationRequest | null>(null);

  return {
    // Navigation
    currentScreen,
    setCurrentScreen,
    selectedDelivery,
    setSelectedDelivery,
    shippingInitialTab,
    setShippingInitialTab,
    
    // Role management
    currentUserRole,
    setCurrentUserRole,
    isRoleSwitcherSheetOpen,
    setIsRoleSwitcherSheetOpen,
    isAdminSettingsSheetOpen,
    setIsAdminSettingsSheetOpen,
    
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
    currentOrder,
    setCurrentOrder,
    deliveryNotes,
    setDeliveryNotes,
    
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
    
    // Status update
    userRole,
    
    // Monthly goal
    monthlyGoal,
    setMonthlyGoal,
    currentMonthlySales,
    
    // Details screen
    detailsScreenData,
    setDetailsScreenData,
    
    // Showroom
    showroomProducts,
    setShowroomProducts,
    showroomOrders,
    setShowroomOrders,
    showroomCart,
    setShowroomCart,
    selectedShowroomProduct,
    setSelectedShowroomProduct,
    selectedShowroomOrder,
    setSelectedShowroomOrder,
    lineSheets,
    setLineSheets,
    selectedLineSheet,
    setSelectedLineSheet,
    selectedProductForEdit,
    setSelectedProductForEdit,
    showroomActiveTab,
    setShowroomActiveTab,
    showroomMessages,
    setShowroomMessages,
    
    // Buyer
    buyerQuotations,
    setBuyerQuotations,
    selectedQuotation,
    setSelectedQuotation
  };
}
