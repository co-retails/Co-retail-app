import React, { Suspense, startTransition, useEffect } from 'react';
import DeliveryHomeScreen from './components/DeliveryHomeScreen';
import ShippingScreen, { Delivery, ReturnDelivery, SellpyOrder } from './components/ShippingScreen';
import ReceiveDeliveryScreen from './components/ReceiveDeliveryScreen';
import PartnerSelectionScreen, { Partner } from './components/PartnerSelectionScreen';
import ReturnManagementScreen, { ReturnItem, ReturnOrder } from './components/ReturnManagementScreen';
import ReturnConfirmationScreen from './components/ReturnConfirmationScreen';
import ReturnShippingLabelScreen from './components/ReturnShippingLabelScreen';
import ReturnDetailsScreen, { ReturnOrderDetails, ReturnItemDetail } from './components/ReturnDetailsScreen';
import ItemsScreen, { Item } from './components/ItemsScreen';
import ScanScreen from './components/ScanScreen';
import SellersScreen from './components/SellersScreen';
import StockCheckScreen, { StockCheckSession } from './components/StockCheckScreen';
import StockCheckReportScreen from './components/StockCheckReportScreen';
import StockCheckReviewScreen from './components/StockCheckReviewScreen';
import StatusUpdateScreen from './components/StatusUpdateScreen';
import DeliveryDetailsScreen from './components/DeliveryDetailsScreen';
import BoxDetailsScreen from './components/BoxDetailsScreen';
import ResponsiveNavigation from './components/ResponsiveNavigation';
import ResponsiveLayout from './components/ResponsiveLayout';

// Partner Portal Components
import RoleSwitcher from './components/RoleSwitcher';
import RoleSwitcherSheet from './components/RoleSwitcherSheet';
import AdminSettingsSheet from './components/AdminSettingsSheet';
import PartnerDashboard, { PartnerOrder } from './components/PartnerDashboard';
import OrderCreationScreen, { OrderItem } from './components/OrderCreationScreen';
import ThriftedOrderCreationScreen from './components/ThriftedOrderCreationScreen';
import BoxManagementScreen, { DeliveryNote } from './components/BoxManagementScreen';
import DeliveryNoteCreationScreen, { DeliveryNote as DeliveryNoteCreationDeliveryNote } from './components/DeliveryNoteCreationScreen';
import OrderDetailsScreen from './components/OrderDetailsScreen';
import RetailerIdScanScreen from './components/RetailerIdScanScreen';
import PostRegistrationDialog from './components/PostRegistrationDialog';
import OrderShipmentDetailsScreen, { DetailType } from './components/OrderShipmentDetailsScreen';
import DeliveryNoteBoxDetailsScreen from './components/DeliveryNoteBoxDetailsScreen';

// Digital Showroom Components - Lazy loaded for code splitting
const PartnerShowroomDashboard = React.lazy(() => import('./components/PartnerShowroomDashboard'));
const ShowroomProductsScreen = React.lazy(() => import('./components/ShowroomProductsScreen'));
const ShowroomImportScreen = React.lazy(() => import('./components/ShowroomImportScreen'));
const BuyerShowroomBrowse = React.lazy(() => import('./components/BuyerShowroomBrowse'));
const ShowroomProductDetail = React.lazy(() => import('./components/ShowroomProductDetail'));
const ShowroomCart = React.lazy(() => import('./components/ShowroomCart'));
const ShowroomOrdersScreen = React.lazy(() => import('./components/ShowroomOrdersScreen'));
const PurchaseOrderDetailsScreen = React.lazy(() => import('./components/PurchaseOrderDetailsScreen'));
const LineSheetCreationScreen = React.lazy(() => import('./components/LineSheetCreationScreen'));
const LineSheetsListScreen = React.lazy(() => import('./components/LineSheetsListScreen'));
const ProductEditScreen = React.lazy(() => import('./components/ProductEditScreen'));
const PartnerQuotationsScreen = React.lazy(() => import('./components/PartnerQuotationsScreen'));
const QuotationDetailsScreen = React.lazy(() => import('./components/QuotationDetailsScreen'));

// Buyer Components - Lazy loaded for code splitting
const BuyerDashboard = React.lazy(() => import('./components/BuyerDashboard'));
const BuyerWishlistScreen = React.lazy(() => import('./components/BuyerWishlistScreen'));
const BuyerQuotationsScreen = React.lazy(() => import('./components/BuyerQuotationsScreen'));
const BuyerQuotationDetailsScreen = React.lazy(() => import('./components/BuyerQuotationDetailsScreen'));
const BuyerShipmentsScreen = React.lazy(() => import('./components/BuyerShipmentsScreen'));
const BuyerPurchaseOrdersScreen = React.lazy(() => import('./components/BuyerPurchaseOrdersScreen'));
const BuyerOrderDetailsScreen = React.lazy(() => import('./components/BuyerOrderDetailsScreen'));

// Portal Configuration Components - Lazy loaded
const PortalConfigurationManager = React.lazy(() => import('./components/PortalConfigurationManager').then(module => ({ default: module.PortalConfigurationManager })));
const PartnerSettingsScreen = React.lazy(() => import('./components/PartnerSettingsScreen').then(module => ({ default: module.default })));

// User Access Management Components - Lazy loaded
const StoreUserAccessScreen = React.lazy(() => import('./components/StoreUserAccessScreen').then(module => ({ default: module.default })));
const PartnerUserAccessScreen = React.lazy(() => import('./components/PartnerUserAccessScreen').then(module => ({ default: module.default })));

// Reports Components - Lazy loaded
const PartnerReportsScreen = React.lazy(() => import('./components/PartnerReportsScreen'));

import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner@2.0.3';
import { mockShowroomAnalytics } from './components/ShowroomMockData';
import { ShowroomProduct, CartItem, ShowroomMessage } from './components/ShowroomTypes';
import { QuotationRequest } from './components/BuyerQuotationsScreen';
import { Shipment } from './components/BuyerShipmentsScreen';
import { PurchaseOrder } from './components/BuyerPurchaseOrdersScreen';

// Loading fallback component for lazy-loaded routes
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="body-medium text-on-surface-variant">Loading...</p>
    </div>
  </div>
);

// Import custom hooks and utilities
import { useAppState, Screen } from './hooks/useAppState';
import { useNavigationHandlers } from './hooks/useNavigationHandlers';
import { getNavigationDestinations, getActiveDestination } from './utils/navigationConfig';
import { 
  mockBrands, 
  mockCountries, 
  mockStores, 
  mockWarehousePartners, 
  mockWarehouses,
  mockUserAccount,
  mockPartnerStats,
  mockPartners,
  mockReturnItems,
  mockDeliveryNotes,
  mockSalesReportData,
  mockStockReportData
} from './data/mockData';

export default function App() {
  // Get all state from custom hook
  const state = useAppState();
  
  // List of screens that use lazy-loaded components
  const lazyLoadedScreens: Screen[] = [
    'showroom-dashboard',
    'showroom-products',
    'showroom-import',
    'showroom-browse',
    'showroom-product-detail',
    'showroom-cart',
    'showroom-orders',
    'purchase-order-details',
    'line-sheet-creation',
    'line-sheets-list',
    'product-edit',
    'partner-quotations',
    'quotation-details',
    'buyer-dashboard',
    'buyer-wishlist',
    'buyer-quotations',
    'buyer-quotation-details',
    'buyer-shipments',
    'buyer-orders',
    'buyer-order-details',
    'portal-configuration',
    'partner-settings',
    'store-user-access',
    'partner-user-access',
    'partner-reports'
  ];

  // Wrapper for setCurrentScreen that uses startTransition for lazy-loaded screens
  const setCurrentScreenSafe = React.useCallback((screen: Screen) => {
    if (lazyLoadedScreens.includes(screen)) {
      startTransition(() => {
        state.setCurrentScreen(screen);
      });
    } else {
      state.setCurrentScreen(screen);
    }
  }, [state.setCurrentScreen]);

  // Create a modified state object with the safe setter
  const safeState = {
    ...state,
    setCurrentScreen: setCurrentScreenSafe
  };
  
  // Destructure frequently used state
  const {
    currentScreen,
    selectedDelivery,
    setSelectedDelivery,
    shippingInitialTab,
    setShippingInitialTab,
    currentUserRole,
    setCurrentUserRole,
    isRoleSwitcherSheetOpen,
    setIsRoleSwitcherSheetOpen,
    isAdminSettingsSheetOpen,
    setIsAdminSettingsSheetOpen,
    currentStoreSelection,
    setCurrentStoreSelection,
    currentPartnerWarehouseSelection,
    setCurrentPartnerWarehouseSelection,
    partnerPortalViewFilter,
    setPartnerPortalViewFilter,
    currentRetailerSelection,
    setCurrentRetailerSelection,
    deliveries,
    setDeliveries,
    partnerOrders,
    setPartnerOrders,
    currentOrder,
    setCurrentOrder,
    deliveryNotes,
    setDeliveryNotes,
    partners,
    setPartners,
    warehouses,
    setWarehouses,
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
    setReturnOrders,
    currentStockCheckSession,
    setCurrentStockCheckSession,
    selectedBox,
    setSelectedBox,
    deliveryBoxes,
    setDeliveryBoxes,
    userRole,
    monthlyGoal,
    setMonthlyGoal,
    currentMonthlySales,
    detailsScreenData,
    setDetailsScreenData,
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
    buyerQuotations,
    setBuyerQuotations,
    selectedQuotation,
    setSelectedQuotation
  } = state;

  // Sync partner portal filter with partner selection
  useEffect(() => {
    if (partnerPortalViewFilter.partnerId !== currentPartnerWarehouseSelection.partnerId) {
      setPartnerPortalViewFilter({
        mode: 'by-partner',
        partnerId: currentPartnerWarehouseSelection.partnerId
      });
    }
  }, [currentPartnerWarehouseSelection.partnerId]);

  // Get navigation handlers
  const navigationHandlers = useNavigationHandlers({
    currentScreen,
    setCurrentScreen: setCurrentScreenSafe,
    setShippingInitialTab,
    currentUserRole: currentUserRole as 'store-staff' | 'partner' | 'buyer'
  });

  const {
    handleBack,
    handleBackToHome,
    handleNavigateToItems,
    handleNavigateToScan,
    handleNavigateToSellers,
    handleNavigateToShipping,
    handleViewInShipping,
    handleNavigateToPartnerDashboard,
    handleNavigateToShowroom,
    handleNavigateToPartnerQuotations,
    handleNavigateToBuyerDashboard,
    handleNavigateToBuyerWishlist,
    handleNavigateToBuyerOrders,
    handleNavigateToBuyerQuotations,
    handleNavigateToBuyerShipments,
    handleNavigateToPortalConfig
  } = navigationHandlers;

  const findStoreRecord = (storeId?: string, fallbackCode?: string) => {
    if (storeId) {
      const storeById = mockStores.find(store => store.id === storeId);
      if (storeById) {
        return storeById;
      }
    }
    if (fallbackCode) {
      return mockStores.find(store => store.code === fallbackCode);
    }
    return undefined;
  };

  const formatReceiverLabel = (store?: (typeof mockStores)[number], fallbackCode?: string) => {
    if (!store && !fallbackCode) {
      return undefined;
    }
    const brand = store ? mockBrands.find(brand => brand.id === store.brandId) : undefined;
    const code = store?.code || fallbackCode;
    if (brand || code) {
      return [brand?.name, code].filter(Boolean).join(' ').trim();
    }
    return undefined;
  };

  const resolveWarehouseName = (warehouseId?: string, fallbackName?: string) => {
    if (warehouseId) {
      const warehouse = mockWarehouses.find(w => w.id === warehouseId);
      if (warehouse) {
        return warehouse.name;
      }
    }
    return fallbackName;
  };

  const buildOrderMetadata = (order: PartnerOrder) => {
    const store = findStoreRecord(order.receivingStoreId, undefined);
    const storeName = store?.name || order.receivingStoreName;
    const storeCode = store?.code;
    const receiverLabel = formatReceiverLabel(store, storeCode);
    return {
      storeName,
      storeCode,
      partnerName: order.partnerName,
      warehouseName: resolveWarehouseName(order.warehouseId, order.warehouseName),
      receiverLabel: receiverLabel || storeName || storeCode
    };
  };

  const buildDeliveryMetadata = (deliveryNote: DeliveryNote) => {
    const relatedOrder = partnerOrders.find(order => order.deliveryNote === deliveryNote.id);
    if (relatedOrder) {
      return buildOrderMetadata(relatedOrder);
    }
    const store = findStoreRecord(deliveryNote.storeId, deliveryNote.storeCode);
    const storeName = store?.name;
    const storeCode = store?.code || deliveryNote.storeCode;
    const receiverLabel = formatReceiverLabel(store, storeCode);
    return {
      storeName,
      storeCode,
      partnerName: deliveryNote.partnerName,
      warehouseName: resolveWarehouseName(deliveryNote.warehouseId, deliveryNote.partnerName),
      receiverLabel: receiverLabel || storeName || storeCode
    };
  };

  const buildReturnMetadata = (returnDelivery: ReturnDelivery) => {
    const store = findStoreRecord(returnDelivery.storeId, returnDelivery.storeCode);
    const storeName = store?.name || returnDelivery.storeName;
    const storeCode = store?.code || returnDelivery.storeCode;
    const receiverLabel = formatReceiverLabel(store, storeCode) || storeName;
    return {
      storeName,
      storeCode,
      partnerName: returnDelivery.partnerName,
      warehouseName: resolveWarehouseName(returnDelivery.warehouseId, returnDelivery.warehouseName || returnDelivery.partnerName),
      receiverLabel
    };
  };


  // Buyer-specific state
  const [wishlistProductIds, setWishlistProductIds] = React.useState<string[]>([]);
  const [buyerShipments, setBuyerShipments] = React.useState<Shipment[]>([]);
  const [buyerPurchaseOrders, setBuyerPurchaseOrders] = React.useState<PurchaseOrder[]>([]);
  const [selectedBuyerQuotationId, setSelectedBuyerQuotationId] = React.useState<string | null>(null);
  const [selectedBuyerOrderId, setSelectedBuyerOrderId] = React.useState<string | null>(null);

  // === Shipping and Delivery Handlers ===
  const handleReceiveDelivery = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setCurrentScreenSafe('receive');
  };

  const handleCompleteReceiving = () => {
    if (selectedDelivery) {
      setDeliveries(deliveries.map(d => 
        d.id === selectedDelivery.id ? { ...d, status: 'Delivered' } : d
      ));
      setSelectedDelivery(null);
      setCurrentScreenSafe('shipping');
    }
  };

  // === Return Flow Handlers ===
  const handlePartnerSelect = (partner: Partner) => {
    setSelectedPartner(partner);
    // Initialize returnItems - for Kinda Kinks, add demo items for testing
    if (partner.id === '2' && partner.name === 'Kinda Kinks') {
      const kindaKinksDemoItems: ReturnItem[] = [
        {
          id: 'kk-1',
          itemId: 'KK-ITM-001',
          title: 'Vintage Denim Jacket',
          size: 'M',
          color: 'Blue',
          status: 'In store',
          partnerItemRef: 'KK-VDJ-001',
          partnerId: '2', // Kinda Kinks partner ID
          selected: false,
          canExtend: false,
          scanned: false,
          image: 'https://images.unsplash.com/photo-1563339387-0ba9892a3f84?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZW5pbSUyMGphY2tldCUyMHZpbnRhZ2V8ZW58MXx8fHwxNzYxMDcyNjk2fDA&ixlib=rb-4.1.0&q=80&w=1080',
          thumbnail: 'https://images.unsplash.com/photo-1563339387-0ba9892a3f84?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZW5pbSUyMGphY2tldCUyMHZpbnRhZ2V8ZW58MXx8fHwxNzYxMDcyNjk2fDA&ixlib=rb-4.1.0&q=80&w=1080'
        },
        {
          id: 'kk-2',
          itemId: 'KK-ITM-002',
          title: 'Leather Boots',
          size: '39',
          color: 'Black',
          status: 'Broken',
          partnerItemRef: 'KK-LB-002',
          partnerId: '2', // Kinda Kinks partner ID
          selected: false,
          canExtend: false,
          scanned: false,
          image: 'https://images.unsplash.com/photo-1652474590303-b4d72bf9f61a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsZWF0aGVyJTIwYm9vdHMlMjBmYXNoaW9ufGVufDF8fHx8MTc2MTExODkzM3ww&ixlib=rb-4.1.0&q=80&w=1080',
          thumbnail: 'https://images.unsplash.com/photo-1652474590303-b4d72bf9f61a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsZWF0aGVyJTIwYm9vdHMlMjBmYXNoaW9ufGVufDF8fHx8MTc2MTExODkzM3ww&ixlib=rb-4.1.0&q=80&w=1080'
        },
        {
          id: 'kk-3',
          itemId: 'KK-ITM-003',
          title: 'Cotton Summer Dress',
          size: 'L',
          color: 'White',
          status: 'Rejected',
          partnerItemRef: 'KK-CSD-003',
          partnerId: '2', // Kinda Kinks partner ID
          selected: false,
          canExtend: false,
          scanned: false,
          image: 'https://images.unsplash.com/photo-1602303894456-398ce544d90b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdW1tZXIlMjBkcmVzcyUyMGZhc2hpb258ZW58MXx8fHwxNzYxMDc0NzI2fDA&ixlib=rb-4.1.0&q=80&w=1080',
          thumbnail: 'https://images.unsplash.com/photo-1602303894456-398ce544d90b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdW1tZXIlMjBkcmVzcyUyMGZhc2hpb258ZW58MXx8fHwxNzYxMDc0NzI2fDA&ixlib=rb-4.1.0&q=80&w=1080'
        },
        {
          id: 'kk-4',
          itemId: 'KK-ITM-004',
          title: 'Wool Sweater',
          size: 'S',
          color: 'Gray',
          status: 'In transit',
          partnerItemRef: 'KK-WS-004',
          partnerId: '2', // Kinda Kinks partner ID
          selected: false,
          canExtend: false,
          scanned: false,
          image: 'https://images.unsplash.com/photo-1731404617461-e0eeeeefcf7b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b29sJTIwc3dlYXRlciUyMGNsb3RoaW5nfGVufDF8fHx8MTc2MTEzNDA3MHww&ixlib=rb-4.1.0&q=80&w=1080',
          thumbnail: 'https://images.unsplash.com/photo-1731404617461-e0eeeeefcf7b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b29sJTIwc3dlYXRlciUyMGNsb3RoaW5nfGVufDF8fHx8MTc2MTEzNDA3MHww&ixlib=rb-4.1.0&q=80&w=1080'
        }
      ];
      setReturnItems(kindaKinksDemoItems);
    } else {
      // For other partners, initialize as empty array to allow scanning any items
      setReturnItems([]);
    }
    setCurrentScreenSafe('return-management');
  };

  const handleUpdateReturnItem = (itemId: string, action: 'select' | 'deselect' | 'missing' | 'extend' | 'scan') => {
    // Validate that the item belongs to the selected partner before allowing actions
    const item = returnItems.find(i => i.id === itemId);
    if (item && selectedPartner) {
      // If item has a partnerId, it must match the selected partner
      if (item.partnerId && item.partnerId !== selectedPartner.id) {
        toast.error(`This item belongs to a different partner and cannot be added to this return.`);
        return;
      }
    }

    setReturnItems(prev => prev.map(item => {
      if (item.id === itemId) {
        switch (action) {
          case 'select':
            return { ...item, selected: true };
          case 'deselect':
            return { ...item, selected: false };
          case 'scan':
            return { ...item, scanned: true };
          case 'extend':
            // Extension logic - could update canExtend or other properties
            return item;
          case 'missing':
            // Mark item as missing - could update a missing flag
            return item;
          default:
            return item;
        }
      }
      return item;
    }));
  };

  const createReturnOrder = (items: ReturnItem[], partnerId?: string, partnerName?: string) => {
    const effectivePartnerId =
      partnerId || currentPartnerWarehouseSelection?.partnerId || selectedPartner?.id || '';
    const partnerFromWarehouse = mockWarehousePartners.find(
      (partner) => partner.id === effectivePartnerId
    );
    const effectivePartnerName =
      partnerName || partnerFromWarehouse?.name || selectedPartner?.name || 'Partner';

    const completedOrder: ReturnOrder = {
      id: `RET-${Date.now()}`,
      partnerId: effectivePartnerId,
      partnerName: effectivePartnerName,
      status: 'Return - In transit',
      createdDate: new Date().toISOString().split('T')[0],
      items,
      parcelId: `STORE-${Date.now()}`
    };

    setReturnOrders((prev) => [...prev, completedOrder]);
    setCurrentReturnOrder(completedOrder);
    setCurrentScreenSafe('return-confirmation');

    const currentStore = mockStores.find((store) => store.id === currentStoreSelection.storeId);
    setReturnDeliveries((prev) => [
      {
        id: completedOrder.id,
        date: completedOrder.createdDate,
        status: 'In transit',
        deliveryId: completedOrder.id,
        items: items.length,
        boxes: Math.max(1, Math.ceil(items.length / 10)),
        storeName: currentStore?.name || 'Current store',
        storeCode: currentStore?.code || '',
        partnerId: effectivePartnerId,
        partnerName: effectivePartnerName,
        storeId: currentStoreSelection.storeId,
        warehouseId: currentPartnerWarehouseSelection.warehouseId,
        warehouseName: mockWarehouses.find((warehouse) => warehouse.id === currentPartnerWarehouseSelection.warehouseId)?.name
      },
      ...prev
    ]);
  };

  const handleCreateReturn = (selectedItems: ReturnItem[]) => {
    // Validate that all selected items belong to the selected partner
    if (selectedPartner) {
      const invalidItems = selectedItems.filter(item => 
        item.partnerId && item.partnerId !== selectedPartner.id
      );
      if (invalidItems.length > 0) {
        toast.error(`Cannot create return: ${invalidItems.length} item(s) belong to a different partner.`);
        return;
      }
    }
    createReturnOrder(selectedItems, selectedPartner?.id, selectedPartner?.name);
  };

  const handleCreateReturnFromItems = (items: Item[]) => {
    if (items.length === 0) return;

    // Group items by seller/partner - use sellerName or source to determine partner
    // For now, assume all items are from the same seller (first item's seller)
    const firstItem = items[0];
    const sellerName = firstItem.sellerName || firstItem.source || 'Unknown';
    
    // Find partner by name - try to match with mockPartners first (for ReturnManagementScreen)
    let partner = mockPartners.find(p => 
      p.name.toLowerCase() === sellerName.toLowerCase() || 
      sellerName.toLowerCase().includes(p.name.toLowerCase())
    );
    
    // If not found in mockPartners, try mockWarehousePartners
    if (!partner) {
      const warehousePartner = mockWarehousePartners.find(p => 
        p.name.toLowerCase() === sellerName.toLowerCase() || 
        sellerName.toLowerCase().includes(p.name.toLowerCase())
      );
      if (warehousePartner) {
        // Convert warehouse partner to Partner format
        partner = {
          id: warehousePartner.id,
          name: warehousePartner.name,
          connectionStatus: 'connected' as const,
          itemsToReturn: 0
        };
      }
    }
    
    // Fallback to first partner if still not found
    if (!partner) {
      partner = mockPartners[0] || {
        id: '1',
        name: sellerName,
        connectionStatus: 'connected' as const,
        itemsToReturn: 0
      };
    }

    // Convert items to ReturnItem format with scanned=true (pre-scanned from items screen)
    const returnItems: ReturnItem[] = items.map((item) => ({
      id: item.id,
      itemId: item.itemId,
      title: item.title || `${item.brand} ${item.category}`,
      size: item.size,
      color: item.color,
      status: 'Return - In transit' as const,
      partnerItemRef: item.itemId,
      partnerId: partner.id, // Associate items with the selected partner
      thumbnail: item.thumbnail,
      image: item.thumbnail,
      selected: true, // Pre-selected
      scanned: true, // Pre-scanned
      canExtend: false
    }));

    // Set up the return items and partner for ReturnManagementScreen
    setReturnItems(returnItems);
    setSelectedPartner(partner);
    setCurrentScreenSafe('return-management');
  };

  const handleExtendReturn = (itemIds: string[]) => {
    // Extension logic would go here
  };

  const handleReturnComplete = () => {
    setReturnItems(mockReturnItems);
  };

  // === Delete Handlers ===
  const handleDeletePartnerOrder = (orderId: string) => {
    setPartnerOrders(partnerOrders.filter(order => order.id !== orderId));
  };

  const handleDeleteDeliveryNote = (deliveryNoteId: string) => {
    setDeliveryNotes(deliveryNotes.filter(note => note.id !== deliveryNoteId));
    setSelectedPartner(null);
    setCurrentReturnOrder(null);
    setCurrentScreenSafe('home');
  };

  // === Partner & Warehouse Management Handlers ===
  const handleSavePartner = (partner: any) => {
    const existingIndex = partners.findIndex(p => p.id === partner.id);
    if (existingIndex >= 0) {
      // Update existing partner
      const updated = [...partners];
      updated[existingIndex] = partner;
      setPartners(updated);
    } else {
      // Add new partner
      setPartners([...partners, partner]);
    }
  };

  const handleDeletePartner = (partnerId: string) => {
    setPartners(partners.filter(p => p.id !== partnerId));
  };

  const handleSaveWarehouse = (warehouse: any) => {
    const existingIndex = warehouses.findIndex(w => w.id === warehouse.id);
    if (existingIndex >= 0) {
      // Update existing warehouse
      const updated = [...warehouses];
      updated[existingIndex] = warehouse;
      setWarehouses(updated);
    } else {
      // Add new warehouse
      setWarehouses([...warehouses, warehouse]);
    }
  };

  const handleDeleteWarehouse = (warehouseId: string) => {
    setWarehouses(warehouses.filter(w => w.id !== warehouseId));
  };

  // === Stock Check Handlers ===
  const handleStartStockCheck = (category: string, location: string) => {
    const session = {
      id: `SC-${Date.now()}`,
      category,
      location,
      startTime: new Date(),
      scannedItems: [],
      missingItems: []
    };
    setCurrentStockCheckSession(session);
    setCurrentScreenSafe('stock-check-report');
  };

  const handleStockCheckScan = (itemId: string) => {
    if (currentStockCheckSession) {
      const updatedSession = {
        ...currentStockCheckSession,
        scannedItems: [...currentStockCheckSession.scannedItems, { itemId, scannedAt: new Date() }]
      };
      setCurrentStockCheckSession(updatedSession);
    }
  };

  const handleStockCheckComplete = () => {
    setCurrentScreenSafe('stock-check-review');
  };

  const handleStockCheckFinish = () => {
    setCurrentStockCheckSession(null);
    setCurrentScreenSafe('home');
  };

  const handleNavigateToStockCheck = () => {
    setCurrentScreenSafe('stock-check');
  };
  
  // Store historical stock check sessions - initialize with mock data
  const [availableStockCheckSessions, setAvailableStockCheckSessions] = React.useState<StockCheckSession[]>(() => {
    // Generate mock historical sessions for demo
    const sessions: StockCheckSession[] = [];
    const today = new Date();
    
    // Generate 10 mock historical sessions
    for (let i = 0; i < 10; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i * 7); // Weekly sessions
      
      const totalItems = 200 + Math.floor(Math.random() * 100);
      const scannedItems = Math.floor(totalItems * (0.7 + Math.random() * 0.25));
      
      sessions.push({
        id: `SC-${date.getTime()}`,
        date: date.toISOString().split('T')[0],
        totalItems,
        scannedItems,
        notFoundItems: Math.floor(Math.random() * 10),
        status: 'Completed',
        reportGenerated: true,
        items: [] // Items would be loaded when report is selected
      });
    }
    
    return sessions;
  });
  
  const handleNavigateToStockCheckReports = () => {
    // Get the latest session (most recent date)
    const latestSession = availableStockCheckSessions.length > 0 
      ? availableStockCheckSessions[0] 
      : null;
    
    if (latestSession) {
      setCurrentStockCheckSession(latestSession);
      setCurrentScreenSafe('stock-check-report');
    } else {
      // If no sessions, redirect to home or show empty state
      setCurrentScreenSafe('home');
    }
  };

  const handleGenerateStockCheckReport = (session: StockCheckSession) => {
    // Load accumulated items for the same date from localStorage
    const today = new Date().toISOString().split('T')[0];
    try {
      const saved = localStorage.getItem(`stockCheckSession_${today}`);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.items && data.items.length > 0) {
          // Use accumulated items from all users for today
          const accumulatedScanned = data.items.filter((item: any) => item.isScanned);
          session.scannedItems = accumulatedScanned.length;
          session.items = data.items;
          session.totalItems = Math.max(session.totalItems, data.items.length);
        }
      }
    } catch (e) {
      console.error('Failed to load accumulated items for report:', e);
    }

    // Add to available sessions
    setAvailableStockCheckSessions(prev => {
      // Check if session already exists for this date
      const existingSession = prev.find(s => s.date === session.date);
      if (existingSession) {
        // Update existing session with accumulated data
        return prev.map(s => 
          s.date === session.date 
            ? { 
                ...s, 
                scannedItems: session.scannedItems,
                totalItems: session.totalItems,
                items: session.items,
                status: 'Completed' as const,
                reportGenerated: true
              }
            : s
        );
      }
      // Add new session at the beginning (most recent first)
      return [session, ...prev].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    });
    
    setCurrentStockCheckSession(session);
    setCurrentScreenSafe('stock-check-report');
  };
  
  const handleStockCheckReportDateChange = (newDate: string) => {
    // Find the session for the selected date
    const session = availableStockCheckSessions.find(s => s.date === newDate);
    if (session) {
      setCurrentStockCheckSession(session);
    }
  };

  const handleUpdateStockItemStatus = (itemId: string, newStatus: 'Missing' | 'Found' | 'Scanned' | 'In Store' | 'In Store 2nd try' | 'Broken') => {
    // Update the item status in the current session
    // In a real app, this would update the backend
    // TODO: Implement backend update
  };

  // === Partner Dashboard Handlers ===
  const handleCreateOrder = () => {
    const newOrder = {
      id: `ORD-${Date.now()}`,
      items: []
    };
    setCurrentOrder(newOrder);
    setCurrentScreenSafe('order-creation');
  };

  const handleSaveOrder = () => {
    setCurrentOrder(null);
    setCurrentScreenSafe('partner-dashboard');
  };

  const handleCancelOrder = () => {
    setCurrentOrder(null);
    setCurrentScreenSafe('partner-dashboard');
  };

  const handleNavigateToBoxManagement = () => {
    setCurrentScreenSafe('box-management');
  };

  const handleNavigateToSellpyOrders = () => {
    setCurrentScreenSafe('shipping');
    // Sellpy orders are shown in the shipments tab (for store staff only)
    setShippingInitialTab('shipments');
  };

  const handleNavigateToShipmentsTab = () => {
    setCurrentScreenSafe('shipping');
    // Use 'in-transit' for partners, 'shipments' for store staff/admin
    setShippingInitialTab(currentUserRole === 'partner' ? 'in-transit' : 'shipments');
  };

  const handleNavigateToReturnsTab = () => {
    setCurrentScreenSafe('shipping');
    setShippingInitialTab('returns');
  };

  const handleSellpyOrderClick = (order: SellpyOrder) => {
    setSelectedSellpyOrder(order);
    setCurrentScreenSafe('order-details');
  };

  const handleRegisterSellpyOrder = (orderId: string) => {
    setSellpyOrders(prev => prev.map(order =>
      order.id === orderId ? { ...order, status: 'registered' } : order
    ));
    setRegisteredOrderId(orderId);
    setShowPostRegistrationDialog(true);
  };

  const handleClosePostRegistrationDialog = () => {
    setShowPostRegistrationDialog(false);
    setRegisteredOrderId(null);
  };

  const handleViewOrderListFromDialog = () => {
    setShowPostRegistrationDialog(false);
    // Navigate to partner dashboard for partners, shipping screen for others
    if (currentUserRole === 'partner') {
      setCurrentScreenSafe('partner-dashboard');
    } else {
      setCurrentScreenSafe('shipping');
      setShippingInitialTab('orders');
    }
  };

  const handleCreateDeliveryNoteFromDialog = () => {
    setShowPostRegistrationDialog(false);
    
    // Find the registered order
    if (registeredOrderId) {
      const order = partnerOrders.find(o => o.id === registeredOrderId);
      if (order) {
        const metadata = buildOrderMetadata(order);
        setDetailsScreenData({
          type: 'order',
          data: order,
          ...metadata
        });
        setCurrentScreenSafe('delivery-note-creation');
      }
    }
  };

  const handleCreateDeliveryNoteForOrder = (orderId: string) => {
    // Find the order to pass to delivery note creation if needed
    const order = partnerOrders.find(o => o.id === orderId);
    if (order) {
      const metadata = buildOrderMetadata(order);
      setDetailsScreenData({
        type: 'order',
        data: order,
        ...metadata
      });
      // Navigate to delivery note creation screen
      setCurrentScreenSafe('delivery-note-creation');
    }
  };

  const handleNavigateToRetailerIdScan = (orderId: string) => {
    setCurrentScreenSafe('retailer-id-scan');
  };

  // Delivery note box management handlers
  const [selectedDeliveryNoteBox, setSelectedDeliveryNoteBox] = React.useState<{ 
    box: any; 
    orderItems: OrderItem[];
    receiverBrand?: string;
    receiverStoreCode?: string;
    senderWarehouse?: string;
    previousScreen?: Screen; // Track which screen we came from
  } | null>(null);

  const handleAddBoxToDeliveryNote = (deliveryNoteId: string, boxLabel: string) => {
    const deliveryNote = deliveryNotes.find(note => note.id === deliveryNoteId);
    if (deliveryNote) {
      const newBox: any = {
        id: `box-${Date.now()}`,
        qrLabel: boxLabel,
        items: [],
        status: 'pending',
        createdDate: new Date().toISOString()
      };
      
      // Status flow: Pending -> Packing (when a box has been added)
      const newStatus = deliveryNote.status === 'pending' ? 'packing' : deliveryNote.status;
      
      setDeliveryNotes(prev => prev.map(note =>
        note.id === deliveryNoteId
          ? { ...note, boxes: [...note.boxes, newBox], status: newStatus as any }
          : note
      ));
      
      // Update detailsScreenData if we're viewing this delivery note
      if (detailsScreenData?.type === 'shipment' && detailsScreenData.data.id === deliveryNoteId) {
        setDetailsScreenData({
          ...detailsScreenData,
          data: {
            ...detailsScreenData.data,
            boxes: [...(detailsScreenData.data as DeliveryNote).boxes, newBox],
            status: newStatus as any
          }
        });
      }
    }
  };

  const handleOpenBoxDetails = (box: any) => {
    // Get order items from the related order
    const deliveryNote = deliveryNotes.find(note => 
      note.boxes.some(b => b.id === box.id)
    );
    
    if (deliveryNote) {
      // Find the related order to get order items
      const relatedOrder = partnerOrders.find(order => order.id === deliveryNote.orderId);
      
      // Get receiver information (Brand + store code)
      let receiverBrand: string | undefined;
      let receiverStoreCode: string | undefined;
      if (deliveryNote.storeId && deliveryNote.storeCode) {
        const store = mockStores.find(s => s.id === deliveryNote.storeId);
        if (store) {
          const brand = mockBrands.find(b => b.id === store.brandId);
          receiverBrand = brand?.name;
          receiverStoreCode = deliveryNote.storeCode;
        }
      }
      
      // Get sender information (Warehouse)
      const senderWarehouse = deliveryNote.warehouseName;
      
      // Generate order items (in real app, these would come from the order)
      const generateOrderItems = (count: number): OrderItem[] => {
        const brands = ['WEEKDAY', 'COS', 'Monki', 'H&M'];
        const categories = ['Clothing', 'Shoes', 'Accessories'];
        const colors = ['Black', 'White', 'Blue', 'Red', 'Gray'];
        const sizes = ['XS', 'S', 'M', 'L', 'XL'];
        
        return Array.from({ length: count }, (_, index) => {
          const price = parseFloat((Math.random() * 150 + 20).toFixed(2));
          const purchasePrice = parseFloat((price * (0.4 + Math.random() * 0.3)).toFixed(2));
          
          return {
            id: `item-${deliveryNote.orderId}-${index + 1}`,
            partnerItemId: `PID-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
            retailerItemId: index < 2 ? `RID-${Math.random().toString(36).substr(2, 6).toUpperCase()}` : undefined,
            itemId: `ITEM-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
            brand: brands[Math.floor(Math.random() * brands.length)],
            category: categories[Math.floor(Math.random() * categories.length)],
            size: sizes[Math.floor(Math.random() * sizes.length)],
            color: colors[Math.floor(Math.random() * colors.length)],
            price,
            purchasePrice,
            status: undefined
          };
        });
      };
      
      const orderItems = relatedOrder ? generateOrderItems(relatedOrder.itemCount) : [];
      
      setSelectedDeliveryNoteBox({ 
        box, 
        orderItems,
        receiverBrand,
        receiverStoreCode,
        senderWarehouse,
        previousScreen: currentScreen // Track which screen we came from
      });
      setCurrentScreenSafe('delivery-note-box-details');
    }
  };

  const handleRegisterBox = (boxId: string) => {
    if (selectedDeliveryNoteBox) {
      const deliveryNote = deliveryNotes.find(note => 
        note.boxes.some(b => b.id === boxId)
      );
      
      if (deliveryNote) {
        setDeliveryNotes(prev => prev.map(note =>
          note.id === deliveryNote.id
            ? {
                ...note,
                boxes: note.boxes.map(b =>
                  b.id === boxId ? { ...b, status: 'registered' as const } : b
                )
              }
            : note
        ));
        
        // Update detailsScreenData if we're viewing this delivery note
        if (detailsScreenData?.type === 'shipment' && detailsScreenData.data.id === deliveryNote.id) {
          setDetailsScreenData({
            ...detailsScreenData,
            data: {
              ...detailsScreenData.data,
              boxes: (detailsScreenData.data as DeliveryNote).boxes.map(b =>
                b.id === boxId ? { ...b, status: 'registered' as const } : b
              )
            }
          });
        }
      }
    }
  };

  const handleSaveBoxAndClose = (boxId: string, items: OrderItem[]) => {
    if (selectedDeliveryNoteBox) {
      const deliveryNote = deliveryNotes.find(note => 
        note.boxes.some(b => b.id === boxId)
      );
      
      if (deliveryNote) {
        setDeliveryNotes(prev => prev.map(note =>
          note.id === deliveryNote.id
            ? {
                ...note,
                boxes: note.boxes.map(b =>
                  b.id === boxId ? { ...b, items } : b
                )
              }
            : note
        ));
        
        // Update detailsScreenData if we're viewing this delivery note
        if (detailsScreenData?.type === 'shipment' && detailsScreenData.data.id === deliveryNote.id) {
          const updatedBoxes = (detailsScreenData.data as DeliveryNote).boxes.map(b =>
            b.id === boxId ? { ...b, items } : b
          );
          setDetailsScreenData({
            ...detailsScreenData,
            data: {
              ...detailsScreenData.data,
              boxes: updatedBoxes
            }
          });
        }
      }
      
      const previousScreen = selectedDeliveryNoteBox.previousScreen || 'order-shipment-details';
      setSelectedDeliveryNoteBox(null);
      setCurrentScreenSafe(previousScreen);
    }
  };

  const handleViewShipmentDetails = (type: DetailType, data: PartnerOrder | DeliveryNote | ReturnDelivery, previousScreen?: Screen, previousTab?: 'shipments' | 'returns' | 'all' | 'pending' | 'in-transit' | 'delivered' | 'registered' | 'orders' | 'pending-registered') => {
    let metadata: {
      storeName?: string;
      storeCode?: string;
      partnerName?: string;
      warehouseName?: string;
      receiverLabel?: string;
    };

    switch (type) {
      case 'order':
        metadata = buildOrderMetadata(data as PartnerOrder);
        break;
      case 'shipment':
        metadata = buildDeliveryMetadata(data as DeliveryNote);
        break;
      case 'return':
        metadata = buildReturnMetadata(data as ReturnDelivery);
        break;
      default:
        metadata = {};
        break;
    }

    setDetailsScreenData({
      type,
      data,
      ...metadata,
      previousScreen: previousScreen || currentScreen, // Track where we came from
      previousTab: previousTab // Track which tab was active
    });
    setCurrentScreenSafe('order-shipment-details');
  };

  const handleUpdateReturnDeliveryStatus = (deliveryId: string, status: 'Returned') => {
    setReturnDeliveries((prev) =>
      prev.map((delivery) => (delivery.id === deliveryId ? { ...delivery, status } : delivery))
    );

    if (status === 'Returned') {
      setReturnOrders((prev) =>
        prev.map((order) =>
          order.id === deliveryId ? { ...order, status: 'Returned' } : order
        )
      );
    }
    
    // Update detailsScreenData if we're viewing this return
    if (detailsScreenData?.type === 'return' && detailsScreenData.data.id === deliveryId) {
      setDetailsScreenData({
        ...detailsScreenData,
        data: {
          ...detailsScreenData.data,
          status
        }
      });
    }
    
    toast.success('Return marked as returned');
  };

  const handleCancelReturn = (deliveryId: string, reason?: string) => {
    setReturnDeliveries((prev) => prev.map((delivery) => 
      delivery.id === deliveryId 
        ? { ...delivery, status: 'Cancelled' as any, cancellationReason: reason || 'Missing return' }
        : delivery
    ));
    setReturnOrders((prev) => prev.filter((order) => order.id !== deliveryId));
    toast.success(`Return cancelled${reason ? `: ${reason}` : ''}`);
    
    // Update detailsScreenData if we're viewing this return
    if (detailsScreenData?.type === 'return' && detailsScreenData.data.id === deliveryId) {
      setDetailsScreenData({
        ...detailsScreenData,
        data: {
          ...detailsScreenData.data,
          status: 'Cancelled' as any,
          cancellationReason: reason || 'Missing return'
        }
      });
    }
  };

  // === Role Management Handlers ===
  const handleOpenRoleSwitcher = () => {
    setIsRoleSwitcherSheetOpen(true);
  };

  const handleRoleChange = (role: typeof currentUserRole) => {
    setCurrentUserRole(role);
    setIsRoleSwitcherSheetOpen(false);
    
    // Reset shipping tab when changing roles
    setShippingInitialTab(undefined);
    
    // Navigate to appropriate dashboard based on role
    if (role === 'partner') {
      setCurrentScreenSafe('partner-dashboard');
    } else if (role === 'buyer') {
      setCurrentScreenSafe('buyer-dashboard');
    } else {
      setCurrentScreenSafe('home');
    }
  };

  const handleOpenAdminSettings = () => {
    setIsAdminSettingsSheetOpen(true);
  };

  const handleLogout = () => {
    setIsAdminSettingsSheetOpen(false);
  };



  // === Showroom Handlers ===
  const handleShowroomProducts = () => {
    setCurrentScreenSafe('showroom-products');
  };

  const handleShowroomImport = () => {
    setCurrentScreenSafe('showroom-import');
  };

  const handleShowroomProductClick = (productId: string) => {
    const product = showroomProducts.find(p => p.id === productId);
    if (product) {
      setSelectedShowroomProduct(product);
      setCurrentScreenSafe('showroom-product-detail');
    }
  };

  const handleShowroomCart = () => {
    setCurrentScreenSafe('showroom-cart');
  };

  const handleShowroomAddToCart = (productId: string, quantity: number) => {
    const product = showroomProducts.find(p => p.id === productId);
    if (product) {
      const existingItem = showroomCart.find(item => item.productId === productId);
      if (existingItem) {
        setShowroomCart(showroomCart.map(item =>
          item.productId === productId ? { ...item, quantity: item.quantity + quantity } : item
        ));
      } else {
        const newItem: CartItem = {
          productId: product.id,
          sku: product.sku,
          title: product.title,
          quantity,
          pricePerUnit: product.wholesalePrice,
          image: product.images[0],
          partnerId: product.partnerId,
          partnerName: product.partnerName,
          moq: product.moq
        };
        setShowroomCart([...showroomCart, newItem]);
      }
      setCurrentScreenSafe('showroom-cart');
    }
  };

  const handleShowroomUpdateQuantity = (productId: string, quantity: number) => {
    setShowroomCart(showroomCart.map(item =>
      item.productId === productId ? { ...item, quantity } : item
    ));
  };

  const handleShowroomRemoveItem = (productId: string) => {
    setShowroomCart(showroomCart.filter(item => item.productId !== productId));
  };

  const handleShowroomCheckout = (type: 'rfq' | 'po', notes?: string) => {
    // In real app, would create order via API
    setShowroomCart([]);
    setCurrentScreenSafe('buyer-quotations');
  };

  const handleShowroomImportComplete = () => {
    setShowroomActiveTab('products');
    setCurrentScreenSafe('showroom-dashboard');
  };

  // === Partner Quotations Handlers ===
  const handleSendQuotationMessage = (orderId: string, message: string) => {
    const newMessage: ShowroomMessage = {
      id: `msg-${Date.now()}`,
      threadId: orderId,
      author: 'Partner Support',
      authorRole: 'partner',
      body: message,
      createdAt: new Date().toISOString()
    };
    
    setShowroomMessages(prev => ({
      ...prev,
      [orderId]: [...(prev[orderId] || []), newMessage]
    }));

    // Update order status to negotiation if it was pending
    setShowroomOrders(prev => prev.map(order => 
      order.id === orderId && order.status === 'pending' 
        ? { ...order, status: 'negotiation' as const }
        : order
    ));
  };

  const handleApproveQuotation = (quotationId: string, finalPrice: number) => {
    setShowroomOrders(prev => prev.map(order =>
      order.id === quotationId
        ? { ...order, status: 'accepted' as const, subtotal: finalPrice }
        : order
    ));
    
    // Navigate back to quotations list if we're on the details screen
    if (currentScreen === 'quotation-details') {
      setCurrentScreenSafe('partner-quotations');
      setSelectedShowroomOrder(null);
    }
  };

  const handleRejectQuotation = (quotationId: string, reason: string) => {
    setShowroomOrders(prev => prev.map(order =>
      order.id === quotationId
        ? { ...order, status: 'declined' as const, notes: reason }
        : order
    ));
    
    // Navigate back to quotations list if we're on the details screen
    if (currentScreen === 'quotation-details') {
      setCurrentScreenSafe('partner-quotations');
      setSelectedShowroomOrder(null);
    }
  };

  const handleViewQuotationDetails = (quotationId: string) => {
    const quotation = showroomOrders.find(o => o.id === quotationId);
    if (quotation) {
      setSelectedShowroomOrder(quotation);
      setCurrentScreenSafe('quotation-details');
    }
  };

  // === Buyer Handlers ===
  const handleBuyerToggleWishlist = (productId: string) => {
    setWishlistProductIds(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleRequestQuotation = (productIds: string[], message: string) => {
    const selectedProducts = showroomProducts.filter(p => productIds.includes(p.id));
    
    const newQuotation: QuotationRequest = {
      id: `RFQ-${Date.now()}`,
      partnerId: selectedProducts[0]?.partnerId || '6',
      partnerName: selectedProducts[0]?.partnerName || 'Partner',
      status: 'pending',
      createdDate: new Date().toISOString().split('T')[0],
      items: selectedProducts.map(p => ({
        productId: p.id,
        productName: p.title,
        sku: p.sku,
        quantity: p.moq,
        imageUrl: p.images[0]
      })),
      message
    };

    setBuyerQuotations(prev => [...prev, newQuotation]);
    setCurrentScreenSafe('buyer-quotations');
  };

  const handleViewBuyerQuotation = (quotationId: string) => {
    setSelectedBuyerQuotationId(quotationId);
    setCurrentScreenSafe('buyer-quotation-details');
  };

  const handleAcceptQuotation = (quotationId: string) => {
    setBuyerQuotations(prev => prev.map(q =>
      q.id === quotationId ? { ...q, status: 'accepted' as const } : q
    ));
    setCurrentScreenSafe('buyer-quotations');
  };

  const handleDeclineQuotation = (quotationId: string, reason: string) => {
    setBuyerQuotations(prev => prev.map(q =>
      q.id === quotationId ? { ...q, status: 'declined' as const } : q
    ));
    setCurrentScreenSafe('buyer-quotations');
  };

  const handleSendBuyerQuotationMessage = (quotationId: string, message: string) => {
    setBuyerQuotations(prev => prev.map(q => {
      if (q.id === quotationId) {
        const newMessage = {
          id: `msg-${Date.now()}`,
          author: 'Buyer User',
          authorRole: 'buyer' as const,
          body: message,
          createdAt: new Date().toISOString()
        };
        return {
          ...q,
          messages: [...(q.messages || []), newMessage]
        };
      }
      return q;
    }));
  };

  const handleViewShipment = (shipmentId: string) => {
    // View shipment logic would go here
  };

  const handleViewOrder = (orderId: string) => {
    setSelectedBuyerOrderId(orderId);
    setCurrentScreenSafe('buyer-order-details');
  };

  const handleTrackShipment = (shipmentId: string) => {
    // Track shipment logic would go here
  };

  const handleUpdateBuyerOrder = (orderId: string, updates: Partial<PurchaseOrder>) => {
    setBuyerPurchaseOrders(prev => prev.map(o =>
      o.id === orderId ? { ...o, ...updates } : o
    ));
  };

  // === Navigation Configuration ===
  const navigationDestinations = getNavigationDestinations({
    currentUserRole,
    currentScreen,
    currentPartnerWarehouseSelection,
    handlers: {
      handleNavigateToPartnerDashboard,
      handleNavigateToShowroom,
      handleNavigateToPartnerQuotations,
      handleNavigateToItems,
      handleNavigateToScan,
      handleNavigateToSellers,
      handleNavigateToShipping,
      handleNavigateToBuyerDashboard,
      handleNavigateToBuyerWishlist,
      handleNavigateToBuyerOrders,
      handleNavigateToBuyerQuotations,
      handleNavigateToBuyerShipments,
      setCurrentScreen: setCurrentScreenSafe
    }
  });

  const activeDestination = getActiveDestination(currentScreen, currentUserRole);

  // Determine if we should show navigation
  const showMainNavigation = 
    currentScreen !== 'status-update' &&
    currentScreen !== 'role-switcher' &&
    currentScreen !== 'portal-configuration' &&
    currentScreen !== 'partner-settings' &&
    currentScreen !== 'store-user-access' &&
    currentScreen !== 'partner-user-access' &&
    currentScreen !== 'return-management' &&
    currentScreen !== 'return-confirmation' &&
    currentScreen !== 'return-shipping-label' &&
    currentScreen !== 'stock-check' &&
    currentScreen !== 'stock-check-report' &&
    currentScreen !== 'stock-check-review' &&
    currentScreen !== 'delivery-details' &&
    currentScreen !== 'box-details' &&
    currentScreen !== 'order-details' &&
    currentScreen !== 'sellpy-order-details' &&
    currentScreen !== 'retailer-id-scan' &&
    currentScreen !== 'order-shipment-details' &&
    currentScreen !== 'receive';

  // === Render ===
  return (
    <ResponsiveLayout
      showBackButton={
        currentScreen !== 'home' &&
        currentScreen !== 'partner-dashboard' &&
        currentScreen !== 'buyer-dashboard' &&
        currentScreen !== 'showroom-dashboard' &&
        currentScreen !== 'return-confirmation'
      }
      onBackClick={handleBack}
      onHomeClick={handleBackToHome}
      showRoleSwitcher={true}
      onRoleSwitcherClick={handleOpenRoleSwitcher}
      currentRole={currentUserRole}
      onAdminClick={handleOpenAdminSettings}
      currentStoreSelection={currentStoreSelection}
      onStoreChange={setCurrentStoreSelection}
      brands={mockBrands}
      countries={mockCountries}
      stores={mockStores}
      currentPartnerWarehouseSelection={currentPartnerWarehouseSelection}
      onPartnerWarehouseChange={setCurrentPartnerWarehouseSelection}
      partners={mockWarehousePartners}
      warehouses={mockWarehouses}
    >
      {/* Store Staff Screens */}
      {currentScreen === 'home' && (
        <DeliveryHomeScreen 
          onNavigateToShipping={() => {
            // For partners, default to pending (Orders tab)
            // For store staff, default to shipments (New tab)
            setShippingInitialTab(currentUserRole === 'partner' ? 'pending' : 'shipments');
            setCurrentScreenSafe('shipping');
          }}
          onNavigateToReturns={() => setCurrentScreenSafe('partner-selection')}
          onNavigateToReturnsTab={() => {
            setShippingInitialTab('returns');
            setCurrentScreenSafe('shipping');
          }}
          onNavigateToItems={handleNavigateToItems}
          onNavigateToScan={handleNavigateToScan}
          onNavigateToSellers={handleNavigateToSellers}
          onNavigateToStockCheck={handleNavigateToStockCheck}
          onNavigateToAdmin={handleOpenAdminSettings}
          onNavigateToRoleSwitcher={handleOpenRoleSwitcher}
          deliveryStats={{
            newDeliveries: deliveries.filter(d => d.status === 'In transit').length,
            toReturn: mockPartners.reduce((sum, p) => sum + p.itemsToReturn, 0),
            returns: returnDeliveries.filter(r => 
              (r.status === 'Pending' || r.status === 'In transit') &&
              (r.storeId === currentStoreSelection.storeId || 
               r.storeCode === mockStores.find(s => s.id === currentStoreSelection.storeId)?.code)
            ).length
          }}
          expiredItemsCount={38}
          itemsToScanCount={289}
          brands={mockBrands}
          countries={mockCountries}
          stores={mockStores}
          currentStoreSelection={currentStoreSelection}
          onStoreSelectionChange={setCurrentStoreSelection}
          currentMonthlySales={currentMonthlySales}
          monthlyGoal={monthlyGoal}
          onGoalUpdate={setMonthlyGoal}
        />
      )}

      {currentScreen === 'shipping' && (
        <ShippingScreen
          deliveries={deliveries}
          returnDeliveries={returnDeliveries}
          onScanBox={() => {
            // Set a generic delivery for scanning any box
            setSelectedDelivery({
              id: 'scan-any',
              deliveryId: 'SCAN',
              supplier: 'Any Supplier',
              boxes: 0,
              status: 'In transit',
              date: new Date().toLocaleDateString(),
              warehouse: 'All Warehouses'
            });
            setDeliveryBoxes([]);
            setCurrentScreenSafe('receive');
          }}
          onSelectDelivery={(delivery) => {
            setSelectedDelivery(delivery);
            // Generate mock boxes for the delivery
            const mockBoxes = [];
            for (let i = 1; i <= delivery.boxes; i++) {
              const initialStatus =
                delivery.status === 'Delivered'
                  ? 'Delivered'
                  : delivery.status === 'Cancelled'
                  ? 'Cancelled'
                  : 'In transit';
              mockBoxes.push({
                id: `box-${i}`,
                boxId: `BOX-${delivery.deliveryId.slice(-6)}-${i.toString().padStart(3, '0')}`,
                orderNumber: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
                externalOrder: `EXT-${Math.floor(10000 + Math.random() * 90000)}`,
                items: Math.floor(20 + Math.random() * 100),
                status: initialStatus as 'In transit' | 'Delivered' | 'Cancelled',
                date: delivery.date,
                isScanned: initialStatus === 'Delivered',
                deliveryId: delivery.id as string,
                cancellationReason: initialStatus === 'Cancelled' ? (delivery.cancellationReason || 'Missing box') : undefined
              });
            }
            setDeliveryBoxes(mockBoxes);
            setCurrentScreenSafe('delivery-details');
          }}
          onBack={handleBack}
          onNavigateToHome={handleBackToHome}
          onNavigateToItems={handleNavigateToItems}
          onNavigateToScan={handleNavigateToScan}
          onNavigateToSellers={handleNavigateToSellers}
          initialTab={shippingInitialTab}
          currentUserRole={currentUserRole}
          partnerOrders={partnerOrders}
          deliveryNotes={deliveryNotes}
          showroomOrders={showroomOrders}
          sellpyOrders={sellpyOrders}
          currentPartnerId={currentPartnerWarehouseSelection?.partnerId}
          currentWarehouseId={currentPartnerWarehouseSelection?.warehouseId}
          onSelectSellpyOrder={(order) => {
            setSelectedSellpyOrder(order);
            setCurrentScreenSafe('order-details');
          }}
          onOpenOrderDetails={(order, activeTab) => {
            setSelectedPartnerOrder(order);
            handleViewShipmentDetails('order', order, 'shipping', activeTab);
          }}
          onOpenShipmentDetails={(deliveryNote, activeTab) => {
            // For pending/packing delivery notes, show the delivery note creation screen
            if (deliveryNote.status === 'pending' || deliveryNote.status === 'packing') {
              // Find the related order to get order items
              const relatedOrder = partnerOrders.find(order => order.id === deliveryNote.orderId);
              if (relatedOrder) {
                // Generate order items (in real app, these would come from the order)
                const generateOrderItems = (count: number): OrderItem[] => {
                  const brands = ['WEEKDAY', 'COS', 'Monki', 'H&M'];
                  const categories = ['Clothing', 'Shoes', 'Accessories'];
                  const colors = ['Black', 'White', 'Blue', 'Red', 'Gray'];
                  const sizes = ['XS', 'S', 'M', 'L', 'XL'];
                  
                  return Array.from({ length: count }, (_, index) => {
                    const price = parseFloat((Math.random() * 150 + 20).toFixed(2));
                    const purchasePrice = parseFloat((price * (0.4 + Math.random() * 0.3)).toFixed(2));
                    
                    return {
                      id: `item-${deliveryNote.orderId}-${index + 1}`,
                      partnerItemId: `PID-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
                      retailerItemId: index < 2 ? `RID-${Math.random().toString(36).substr(2, 6).toUpperCase()}` : undefined,
                      itemId: `ITEM-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
                      brand: brands[Math.floor(Math.random() * brands.length)],
                      category: categories[Math.floor(Math.random() * categories.length)],
                      size: sizes[Math.floor(Math.random() * sizes.length)],
                      color: colors[Math.floor(Math.random() * colors.length)],
                      price,
                      purchasePrice,
                      status: undefined,
                      gender: 'Unisex',
                      subcategory: '',
                      source: 'manual'
                    };
                  });
                };
                const orderItems = generateOrderItems(relatedOrder.itemCount);
                
                // Get receiver brand and warehouse info
                const receivingStoreId = deliveryNote.storeId;
                const receivingStoreCode = deliveryNote.storeCode || '';
                const store = receivingStoreId ? mockStores.find(s => s.id === receivingStoreId) : undefined;
                const receiverBrand = store ? mockBrands.find(b => b.id === store.brandId)?.name : undefined;
                const warehouseName = resolveWarehouseName(deliveryNote.warehouseId, deliveryNote.warehouseName);
                
                setDetailsScreenData({
                  type: 'shipment',
                  data: deliveryNote,
                  storeName: deliveryNote.storeName,
                  storeCode: deliveryNote.storeCode,
                  partnerName: deliveryNote.partnerName,
                  warehouseName: warehouseName,
                  orderItems: orderItems,
                  previousScreen: 'shipping',
                  previousTab: activeTab
                });
                setCurrentScreenSafe('delivery-note-creation');
                return;
              }
            }
            // For other statuses, use the regular details screen
            handleViewShipmentDetails('shipment', deliveryNote, 'shipping', activeTab);
          }}
          onOpenReturnDetails={(returnDelivery, activeTab) => {
            handleViewShipmentDetails('return', returnDelivery, 'shipping', activeTab);
          }}
          onViewShowroomOrder={(orderId) => {
            const order = showroomOrders.find(o => o.id === orderId);
            if (order) {
              setSelectedShowroomOrder(order);
              setCurrentScreenSafe('purchase-order-details');
            }
          }}
          onUpdateReturnDeliveryStatus={handleUpdateReturnDeliveryStatus}
          onCancelReturn={handleCancelReturn}
          brands={mockBrands}
          countries={mockCountries}
          stores={mockStores}
          warehouses={mockWarehouses}
          currentStoreSelection={currentStoreSelection}
          isAdmin={mockUserAccount.role.name === 'Admin'}
          onDeletePartnerOrder={handleDeletePartnerOrder}
          onDeleteDeliveryNote={handleDeleteDeliveryNote}
          onCreateDeliveryNoteForOrder={handleCreateDeliveryNoteForOrder}
          onCreateOrder={currentUserRole === 'partner' ? handleCreateOrder : undefined}
          viewFilter={currentUserRole === 'partner' ? partnerPortalViewFilter : undefined}
          onViewFilterChange={currentUserRole === 'partner' ? setPartnerPortalViewFilter : undefined}
        />
      )}

      {currentScreen === 'delivery-details' && selectedDelivery && (
        <DeliveryDetailsScreen
          delivery={selectedDelivery}
          boxes={deliveryBoxes}
          onBack={() => setCurrentScreenSafe('shipping')}
          onScanToReceive={() => setCurrentScreenSafe('receive')}
          onSelectBox={(box) => {
            setSelectedBox(box);
            setCurrentScreenSafe('box-details');
          }}
          onMarkBoxScanned={(boxId) => {
            setDeliveryBoxes(prev => prev.map(b => 
              b.id === boxId ? { ...b, isScanned: true, status: 'Delivered' } : b
            ));
          }}
          userRole={currentUserRole}
          onUpdateDeliveryStatus={(deliveryId, status, reason) => {
            setDeliveries(prevDeliveries =>
              prevDeliveries.map(delivery =>
                delivery.id === deliveryId
                  ? { ...delivery, status, cancellationReason: reason as 'Missing delivery' | undefined }
                  : delivery
              )
            );
            // Update selectedDelivery if it's the one being updated
            if (selectedDelivery.id === deliveryId) {
              setSelectedDelivery({ ...selectedDelivery, status, cancellationReason: reason as 'Missing delivery' | undefined });
            }
          }}
        />
      )}

      {currentScreen === 'box-details' && selectedBox && (
        <BoxDetailsScreen
          box={selectedBox}
          items={[
            {
              id: '1',
              itemId: '34780001',
              title: 'Sample Item 1',
              brand: 'H&M',
              category: 'Clothing',
              size: 'M',
              color: 'Black',
              price: 29.99,
              status: 'In transit',
              date: selectedBox.date,
              orderNumber: selectedBox.orderNumber
            },
            {
              id: '2',
              itemId: '34780002',
              title: 'Sample Item 2',
              brand: 'Weekday',
              category: 'Clothing',
              size: 'L',
              color: 'White',
              price: 39.99,
              status: 'In transit',
              date: selectedBox.date,
              orderNumber: selectedBox.orderNumber
            }
          ]}
          onBack={() => setCurrentScreenSafe('delivery-details')}
        />
      )}

      {currentScreen === 'receive' && selectedDelivery && (
        <ReceiveDeliveryScreen
          delivery={selectedDelivery}
          boxes={deliveryBoxes}
          userRole={currentUserRole}
          onBoxesChange={setDeliveryBoxes}
          onUpdateDeliveryStatus={(deliveryId, status, reason) => {
            setDeliveries(prevDeliveries =>
              prevDeliveries.map(delivery =>
                delivery.id === deliveryId
                  ? { ...delivery, status, cancellationReason: reason }
                  : delivery
              )
            );
            setSelectedDelivery(prev =>
              prev && prev.id === deliveryId ? { ...prev, status, cancellationReason: reason } : prev
            );
            if (status === 'Cancelled') {
              setDeliveryBoxes(prev =>
                prev.map(box => ({
                  ...box,
                  status: 'Cancelled',
                  isScanned: false,
                  cancellationReason: 'Missing box'
                }))
              );
            }
          }}
          onBack={() => setCurrentScreenSafe('delivery-details')}
          onRegister={(delivery, scannedBoxes) => {
            // Update the boxes in state
            setDeliveryBoxes(prev => prev.map(box => {
              const scannedBox = scannedBoxes.find(sb => sb.id === box.id);
              if (scannedBox) {
                return { ...scannedBox, status: 'Delivered', isScanned: true, cancellationReason: undefined };
              }
              return { ...box, status: box.status === 'Cancelled' ? 'Cancelled' : box.status, cancellationReason: box.cancellationReason };
            }));
            setDeliveries(prevDeliveries =>
              prevDeliveries.map(existing =>
                existing.id === delivery.id
                  ? { ...existing, status: 'Delivered', cancellationReason: undefined }
                  : existing
              )
            );
            setSelectedDelivery(prev =>
              prev && prev.id === delivery.id ? { ...prev, status: 'Delivered', cancellationReason: undefined } : prev
            );
            // Navigate back or to confirmation
            setCurrentScreenSafe('shipping');
            window.dispatchEvent(
              new CustomEvent('delivery-registered', {
                detail: {
                  deliveryId: delivery.id,
                  timestamp: new Date().toISOString()
                }
              })
            );
          }}
        />
      )}

      {currentScreen === 'partner-selection' && (
        <PartnerSelectionScreen
          partners={mockPartners}
          onSelectPartner={handlePartnerSelect}
          onBack={handleBackToHome}
        />
      )}

      {currentScreen === 'return-management' && selectedPartner && (
        <ReturnManagementScreen
          partner={selectedPartner}
          items={returnItems}
          onBack={handleBack}
          onUpdateItem={handleUpdateReturnItem}
          onCreateReturn={handleCreateReturn}
          onContinue={() => {
            // Navigate to shipping label screen
            setCurrentScreenSafe('return-shipping-label');
          }}
        />
      )}

      {currentScreen === 'return-shipping-label' && selectedPartner && (
        <ReturnShippingLabelScreen
          partner={selectedPartner}
          items={returnItems}
          onBack={() => setCurrentScreenSafe('return-management')}
          onRegisterReturn={(shippingLabel) => {
            // Create return order with shipping label
            const scannedItems = returnItems.filter(item => item.scanned);
            if (scannedItems.length === 0) {
              toast.error('No scanned items to return');
              return;
            }

            const currentStore = mockStores.find((store) => store.id === currentStoreSelection.storeId);
            const warehouse = mockWarehouses.find((w) => w.id === currentPartnerWarehouseSelection?.warehouseId);
            
            // Create return order
            const returnOrderId = `RET-${Date.now()}`;
            const returnOrder: ReturnOrder = {
              id: returnOrderId,
              partnerId: selectedPartner.id,
              partnerName: selectedPartner.name,
              status: 'Return - In transit',
              createdDate: new Date().toISOString().split('T')[0],
              items: scannedItems,
              parcelId: shippingLabel
            };

            // Create return delivery with status 'Pending'
            const returnDelivery: ReturnDelivery = {
              id: returnOrderId,
              date: returnOrder.createdDate,
              status: 'Pending',
              deliveryId: returnOrderId,
              items: scannedItems.length,
              boxes: Math.max(1, Math.ceil(scannedItems.length / 10)),
              storeName: currentStore?.name || 'Current store',
              storeCode: currentStore?.code || '',
              partnerId: selectedPartner.id,
              partnerName: selectedPartner.name,
              storeId: currentStoreSelection.storeId,
              warehouseId: currentPartnerWarehouseSelection?.warehouseId,
              warehouseName: warehouse?.name
            };

            // Update state
            setReturnOrders((prev) => [...prev, returnOrder]);
            setReturnDeliveries((prev) => [returnDelivery, ...prev]);
            setCurrentReturnOrder(returnOrder);
            
            // Navigate to success screen
            setCurrentScreenSafe('return-confirmation');
            toast.success('Return registered successfully');
          }}
        />
      )}

      {currentScreen === 'return-confirmation' && currentReturnOrder && (
        <ReturnConfirmationScreen
          returnOrder={currentReturnOrder}
          onBackToHome={() => {
            handleReturnComplete();
            handleBackToHome();
          }}
          onViewInShipping={handleNavigateToReturnsTab}
        />
      )}

      {currentScreen === 'return-details' && currentReturnOrderDetails && (
        <ReturnDetailsScreen
          returnOrder={currentReturnOrderDetails}
          onBack={handleBack}
          onScan={() => {
            // TODO: Implement scan functionality
            toast.info('Scan functionality coming soon');
          }}
          onAddManually={() => {
            // TODO: Implement manual add functionality
            toast.info('Manual add functionality coming soon');
          }}
          onSaveAndClose={() => {
            setCurrentReturnOrderDetails(null);
            handleBack();
          }}
          userRole={currentUserRole}
          onReturn={() => {
            // Register the return - move from pending to in transit
            if (currentReturnOrderDetails) {
              const scannedItems = currentReturnOrderDetails.scannedItems;
              if (scannedItems.length === 0) {
                toast.error('Please scan at least one item before registering the return');
                return;
              }

              // Create return delivery with status 'Pending'
              const currentStore = mockStores.find((store) => store.id === currentStoreSelection.storeId);
              const warehouse = mockWarehouses.find((w) => w.id === currentPartnerWarehouseSelection?.warehouseId);
              
              const returnDelivery: ReturnDelivery = {
                id: currentReturnOrderDetails.id,
                date: currentReturnOrderDetails.createdDate,
                status: 'Pending',
                deliveryId: currentReturnOrderDetails.orderNumber,
                items: scannedItems.length,
                boxes: Math.max(1, Math.ceil(scannedItems.length / 10)),
                storeName: currentStore?.name || 'Current store',
                storeCode: currentStore?.code || '',
                partnerId: currentReturnOrderDetails.partnerId,
                partnerName: currentReturnOrderDetails.partnerName,
                storeId: currentStoreSelection.storeId,
                warehouseId: currentPartnerWarehouseSelection?.warehouseId,
                warehouseName: warehouse?.name
              };

              setReturnDeliveries((prev) => [returnDelivery, ...prev]);
              setCurrentReturnOrderDetails(null);
              toast.success('Return registered successfully');
              handleNavigateToReturnsTab();
            }
          }}
        />
      )}

      {currentScreen === 'items' && (
        <ItemsScreen 
          onBack={handleBack} 
          userRole={currentUserRole === 'store-staff' ? 'Store Manager' : 'Store User'}
          currentPartnerWarehouseSelection={currentPartnerWarehouseSelection}
          partners={mockWarehousePartners}
          viewFilter={currentUserRole === 'partner' ? partnerPortalViewFilter : undefined}
          onViewFilterChange={currentUserRole === 'partner' ? setPartnerPortalViewFilter : undefined}
          brands={mockBrands}
          countries={mockCountries}
          stores={mockStores}
          onCreateReturn={handleCreateReturnFromItems}
        />
      )}

      {currentScreen === 'scan' && (
        <ScanScreen
          onBack={handleBack}
          userRole={currentUserRole === 'store-staff' ? 'Store Manager' : 'Store User'}
          currentPartnerWarehouseSelection={currentPartnerWarehouseSelection}
        />
      )}

      {currentScreen === 'sellers' && (
        <SellersScreen onBack={handleBack} />
      )}

      {currentScreen === 'stock-check' && (
        <StockCheckScreen
          onBack={handleBackToHome}
          onGenerateReport={handleGenerateStockCheckReport}
          onSaveAndClose={handleBackToHome}
        />
      )}

      {currentScreen === 'stock-check-report' && currentStockCheckSession && (
        <StockCheckReportScreen
          session={currentStockCheckSession}
          onBack={handleBackToHome}
          onReviewItems={handleStockCheckComplete}
          onDone={handleStockCheckFinish}
          onDateChange={handleStockCheckReportDateChange}
          availableSessions={availableStockCheckSessions}
        />
      )}

      {currentScreen === 'stock-check-review' && currentStockCheckSession && (
        <StockCheckReviewScreen
          session={currentStockCheckSession}
          onBack={handleBack}
          onUpdateItemStatus={handleUpdateStockItemStatus}
        />
      )}

      {currentScreen === 'status-update' && (
        <StatusUpdateScreen
          onBack={handleBackToHome}
          userRole={userRole}
        />
      )}

      {/* Partner Portal Screens */}
      {currentScreen === 'partner-dashboard' && (
        <PartnerDashboard
          onBack={handleBack}
          onCreateOrder={handleCreateOrder}
          onViewOrders={() => {
            // Navigate to shipping screen with Orders tab (pending tab for partners)
            setShippingInitialTab('pending');
            setCurrentScreenSafe('shipping');
          }}
          onViewRegisteredOrders={() => {
            // Navigate to Orders tab (pending) with registered filter
            setShippingInitialTab('pending-registered');
            setCurrentScreenSafe('shipping');
          }}
          onViewBoxes={handleNavigateToShipmentsTab}
          onViewDeliveries={handleNavigateToShipmentsTab}
          onViewReturns={handleNavigateToReturnsTab}
          onNavigateToShowroom={handleNavigateToShowroom}
          onAdminClick={handleOpenAdminSettings}
          onRoleSwitcherClick={handleOpenRoleSwitcher}
          stats={mockPartnerStats}
          recentOrders={partnerOrders}
          returnDeliveries={returnDeliveries}
          brands={mockBrands}
          countries={mockCountries}
          stores={mockStores}
          currentStoreSelection={currentStoreSelection}
          onStoreSelectionChange={setCurrentStoreSelection}
          partners={mockWarehousePartners}
          warehouses={mockWarehouses}
          currentPartnerWarehouseSelection={currentPartnerWarehouseSelection}
          onPartnerWarehouseSelectionChange={setCurrentPartnerWarehouseSelection}
          currentUserRole={currentUserRole as 'store-staff' | 'partner'}
          showroomOrders={showroomOrders}
          onNavigateToOrdersTab={handleNavigateToPartnerQuotations}
          onNavigateToShipmentsTab={handleNavigateToShipmentsTab}
          onNavigateToQuotations={handleNavigateToPartnerQuotations}
          onViewQuotationDetails={(quotationId) => {
            const quotation = showroomOrders.find(o => o.id === quotationId);
            if (quotation) {
              setSelectedShowroomOrder(quotation);
              setCurrentScreenSafe('quotation-details');
            }
          }}
          viewFilter={partnerPortalViewFilter}
          onViewFilterChange={setPartnerPortalViewFilter}
          onOpenOrderDetails={(order) => {
            setSelectedPartnerOrder(order);
            handleViewShipmentDetails('order', order, 'partner-dashboard');
          }}
          onNavigateToReports={() => setCurrentScreenSafe('partner-reports')}
        />
      )}

      {currentScreen === 'partner-reports' && (
        <React.Suspense fallback={<LoadingFallback />}>
          <PartnerReportsScreen
            onBack={() => setCurrentScreenSafe('partner-dashboard')}
            salesData={mockSalesReportData}
            stockData={mockStockReportData}
            stores={mockStores}
            brands={mockBrands}
            countries={mockCountries}
            partners={mockWarehousePartners}
            partnerId={currentPartnerWarehouseSelection.partnerId}
            currentUserRole={currentUserRole}
          />
        </React.Suspense>
      )}

      {currentScreen === 'order-creation' && (() => {
        const currentPartner = mockWarehousePartners?.find(p => p.id === currentPartnerWarehouseSelection?.partnerId);
        const isThriftedPartner = currentPartner?.name === 'Thrifted';
        
        if (isThriftedPartner) {
          return (
            <ThriftedOrderCreationScreen
              onBack={() => setCurrentScreenSafe('partner-dashboard')}
              onCreateOrder={(items, storeSelection, shouldRegister = false) => {
                // Create a new order with the items (always as pending, user can register later)
                const newOrder: PartnerOrder = {
                  id: `THR-ORD-${Date.now().toString().slice(-8)}`,
                  status: shouldRegister ? 'registered' : 'pending',
                  createdDate: new Date().toISOString(),
                  itemCount: items.length,
                  boxCount: 0,
                  partnerId: currentPartner?.id,
                  partnerName: currentPartner?.name,
                  receivingStoreId: storeSelection.storeId,
                  receivingStoreName: mockStores?.find(s => s.id === storeSelection.storeId)?.name,
                  warehouseId: currentPartnerWarehouseSelection?.warehouseId,
                  warehouseName: mockWarehouses.find(w => w.id === currentPartnerWarehouseSelection?.warehouseId)?.name
                };
                
                setPartnerOrders(prev => [...prev, newOrder]);
                
                // If registering, show the post-registration dialog
                if (shouldRegister) {
                  setRegisteredOrderId(newOrder.id);
                  setShowPostRegistrationDialog(true);
                } else {
                  // Navigate to order details screen so user can fix validation errors
                  const store = mockStores?.find(s => s.id === storeSelection.storeId);
                  
                  // Set up details screen data with order and items
                  setDetailsScreenData({
                    type: 'order',
                    data: newOrder,
                    storeName: store?.name,
                    storeCode: store?.code,
                    partnerName: currentPartner?.name,
                    warehouseName: mockWarehouses.find(w => w.id === currentPartnerWarehouseSelection?.warehouseId)?.name,
                    orderItems: items // Pass items to the details screen
                  });
                  
                  // Navigate to order details screen
                  setCurrentScreenSafe('order-shipment-details');
                }
              }}
              currentPartner={currentPartner}
              brands={mockBrands}
              countries={mockCountries}
              stores={mockStores}
            />
          );
        }
        
        // Default order creation screen (for other partners if needed)
        return (
          <OrderCreationScreen
            onBack={handleBack}
            onSave={handleSaveOrder}
            onCancel={handleCancelOrder}
          />
        );
      })()}

      {currentScreen === 'box-management' && (
        <BoxManagementScreen
          deliveryNotes={deliveryNotes}
          onBack={handleBack}
          onViewDetails={(note) => handleViewShipmentDetails('shipment', note)}
        />
      )}

      {currentScreen === 'order-details' && selectedSellpyOrder && (
        <OrderDetailsScreen
          order={selectedSellpyOrder}
          onBack={handleBack}
          onRegisterOrder={() => handleRegisterSellpyOrder(selectedSellpyOrder.id)}
          onNavigateToScan={(itemId) => handleNavigateToRetailerIdScan(selectedSellpyOrder.id)}
          onNavigateToRetailerIdScan={() => handleNavigateToRetailerIdScan(selectedSellpyOrder.id)}
        />
      )}

      {currentScreen === 'retailer-id-scan' && (() => {
        // Get order data from detailsScreenData if available
        const orderData = detailsScreenData?.type === 'order' 
          ? detailsScreenData.data as PartnerOrder
          : null;
        
        // Generate mock items for the order
        const generateScanItems = (count: number): OrderItem[] => {
          const brands = ['WEEKDAY', 'COS', 'Monki', 'H&M'];
          const categories = ['Clothing', 'Shoes', 'Accessories'];
          const colors = ['Black', 'White', 'Blue', 'Red', 'Gray'];
          const sizes = ['XS', 'S', 'M', 'L', 'XL'];
          
          return Array.from({ length: count }, (_, index) => {
            const price = parseFloat((Math.random() * 150 + 20).toFixed(2));
            const purchasePrice = parseFloat((price * (0.4 + Math.random() * 0.3)).toFixed(2));
            
            return {
              id: `item-${index + 1}`,
              partnerItemId: `PID-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
              retailerItemId: index < 2 ? `RID-${Math.random().toString(36).substr(2, 6).toUpperCase()}` : undefined,
              itemId: '',
              brand: brands[Math.floor(Math.random() * brands.length)],
              category: categories[Math.floor(Math.random() * categories.length)],
              size: sizes[Math.floor(Math.random() * sizes.length)],
              color: colors[Math.floor(Math.random() * colors.length)],
              price,
              purchasePrice,
              status: undefined
            };
          });
        };
        
        const scanOrderItems = orderData ? generateScanItems(orderData.itemCount) : [];
        
        return (
          <RetailerIdScanScreen
            onBack={handleBack}
            onComplete={() => setCurrentScreenSafe('order-details')}
            onRegisterOrder={() => {
              if (orderData) {
                // Update order status to registered
                const updatedPartnerOrders = partnerOrders.map(order =>
                  order.id === orderData.id
                    ? { ...order, status: 'registered' as const }
                    : order
                );
                setPartnerOrders(updatedPartnerOrders);
                
                // Update detailsScreenData
                if (detailsScreenData) {
                  setDetailsScreenData({
                    ...detailsScreenData,
                    data: { ...orderData, status: 'registered' as const }
                  });
                }
                
                setCurrentScreenSafe('order-shipment-details');
              }
            }}
            onCreateDeliveryNote={(orderId, items) => {
              // Find the order and prepare data for delivery note creation
              const order = partnerOrders.find(o => o.id === orderId);
              if (order) {
                setDetailsScreenData({
                  type: 'order',
                  data: order,
                  storeName: detailsScreenData?.storeName,
                  storeCode: detailsScreenData?.storeCode,
                  partnerName: detailsScreenData?.partnerName
                });
                setCurrentScreenSafe('delivery-note-creation');
              }
            }}
            onViewOrders={() => {
              // Navigate back to shipping screen with registered orders tab
              setShippingInitialTab('registered');
              setCurrentScreenSafe('shipping');
            }}
            orderId={orderData?.id || ''}
            orderItems={scanOrderItems}
            receivingStore={detailsScreenData?.storeName}
            partnerName={detailsScreenData?.partnerName}
            orderStatus={orderData?.status === 'registered' ? 'registered' : 'pending'}
          />
        );
      })()}

      {currentScreen === 'order-shipment-details' && detailsScreenData && (
        <OrderShipmentDetailsScreen
          type={detailsScreenData.type}
          data={detailsScreenData.data}
          onBack={() => {
            // Restore the tab if we came from shipping screen
            if (detailsScreenData.previousScreen === 'shipping' && detailsScreenData.previousTab) {
              setShippingInitialTab(detailsScreenData.previousTab);
            }
            
            // Navigate back to the previous screen if specified, otherwise use default handleBack
            if (detailsScreenData.previousScreen) {
              setCurrentScreenSafe(detailsScreenData.previousScreen);
            } else {
              handleBack();
            }
          }}
          storeName={detailsScreenData.storeName}
          storeCode={detailsScreenData.storeCode}
          partnerName={detailsScreenData.partnerName}
          warehouseName={detailsScreenData.warehouseName}
          receiverLabel={detailsScreenData.receiverLabel}
          isAdmin={mockUserAccount.role.name === 'Admin'}
          currentUserRole={currentUserRole === 'partner' ? 'partner' : currentUserRole === 'admin' ? 'admin' : 'store-staff'}
          onUpdateReturnDeliveryStatus={detailsScreenData.type === 'return' ? handleUpdateReturnDeliveryStatus : undefined}
          onCancelReturn={detailsScreenData.type === 'return' ? handleCancelReturn : undefined}
          onNavigateToRetailerIdScan={() => {
            if (detailsScreenData.type === 'order') {
              handleNavigateToRetailerIdScan((detailsScreenData.data as PartnerOrder).id);
            }
          }}
          onRegisterOrder={() => {
            if (detailsScreenData.type === 'order') {
              const order = detailsScreenData.data as PartnerOrder;
              
              // If order is in approval status, approve it (change to pending)
              if (order.status === 'approval') {
                setPartnerOrders(prev => prev.map(o =>
                  o.id === order.id ? { ...o, status: 'pending' } : o
                ));
                // Update detailsScreenData
                setDetailsScreenData({
                  ...detailsScreenData,
                  data: { ...order, status: 'pending' }
                });
                toast.success('Order approved and moved to pending');
                return;
              }
              
              // Otherwise, register the order
              setRegisteredOrderId(order.id);
              setShowPostRegistrationDialog(true);
              // Update order status to registered
              setPartnerOrders(prev => prev.map(o =>
                o.id === order.id ? { ...o, status: 'registered' } : o
              ));
            }
          }}
          onCreateDeliveryNote={(orderId) => {
            // Find the order and prepare data for delivery note creation
            const order = partnerOrders.find(o => o.id === orderId);
            if (order) {
              setDetailsScreenData({
                type: 'order',
                data: order,
                storeName: detailsScreenData?.storeName,
                storeCode: detailsScreenData?.storeCode,
                partnerName: detailsScreenData?.partnerName
              });
              setCurrentScreenSafe('delivery-note-creation');
            }
          }}
          onAddBox={handleAddBoxToDeliveryNote}
          onOpenBoxDetails={handleOpenBoxDetails}
          relatedOrders={(() => {
            if (detailsScreenData?.type === 'shipment') {
              const shipment = detailsScreenData.data as DeliveryNote;
              const relatedOrder = partnerOrders.find(order => order.id === shipment.orderId);
              if (relatedOrder) {
                // Get external order ID if available (for Sellpy)
                const shippingOrder = partnerOrders.find(o => o.id === shipment.orderId) as any;
                return [{
                  id: relatedOrder.id,
                  externalOrderId: shippingOrder?.externalOrderId
                }];
              }
            }
            return [];
          })()}
          onUnregisterBox={(boxId) => {
            if (detailsScreenData?.type === 'shipment') {
              const shipment = detailsScreenData.data as DeliveryNote;
              setDeliveryNotes(prev => prev.map(note =>
                note.id === shipment.id
                  ? {
                      ...note,
                      boxes: note.boxes.map(b =>
                        b.id === boxId ? { ...b, status: 'pending' as const } : b
                      )
                    }
                  : note
              ));
              
              // Update detailsScreenData
              setDetailsScreenData({
                ...detailsScreenData,
                data: {
                  ...detailsScreenData.data,
                  boxes: (detailsScreenData.data as DeliveryNote).boxes.map(b =>
                    b.id === boxId ? { ...b, status: 'pending' as const } : b
                  )
                }
              });
              toast.success('Box unregistered');
            }
          }}
          onDeleteBox={(boxId) => {
            if (detailsScreenData?.type === 'shipment') {
              const shipment = detailsScreenData.data as DeliveryNote;
              setDeliveryNotes(prev => prev.map(note =>
                note.id === shipment.id
                  ? {
                      ...note,
                      boxes: note.boxes.filter(b => b.id !== boxId)
                    }
                  : note
              ));
              
              // Update detailsScreenData
              setDetailsScreenData({
                ...detailsScreenData,
                data: {
                  ...detailsScreenData.data,
                  boxes: (detailsScreenData.data as DeliveryNote).boxes.filter(b => b.id !== boxId)
                }
              });
              toast.success('Box deleted');
            }
          }}
          orderItems={(() => {
            // If orderItems are provided in detailsScreenData (for newly created orders), use them
            if (detailsScreenData?.orderItems && detailsScreenData.orderItems.length > 0) {
              return detailsScreenData.orderItems;
            }
            
            // For Sellpy pending orders, try to find items from mockSellpyOrders
            if (detailsScreenData?.type === 'order' && detailsScreenData?.partnerName === 'Sellpy') {
              const order = detailsScreenData.data as PartnerOrder;
              // Try to find matching Sellpy order by externalOrderId or by matching order ID pattern
              const sellpyOrder = sellpyOrders.find(so => {
                // Try matching by externalOrderId if available
                if (order.externalOrderId && so.id.includes(order.externalOrderId)) {
                  return true;
                }
                // Try matching by order ID pattern (SEL-ORD-2024-XXX might map to SEL-2024-XXX)
                const orderIdMatch = order.id.match(/SEL-ORD-(\d{4})-(\d+)/);
                if (orderIdMatch) {
                  const year = orderIdMatch[1];
                  const num = orderIdMatch[2];
                  return so.id === `SEL-${year}-${num.padStart(3, '0')}`;
                }
                return false;
              });
              
              if (sellpyOrder && sellpyOrder.items && sellpyOrder.items.length > 0) {
                return sellpyOrder.items;
              }
            }
            
            if (detailsScreenData?.type === 'shipment') {
              const shipment = detailsScreenData.data as DeliveryNote;
              const relatedOrder = partnerOrders.find(order => order.id === shipment.orderId);
              if (relatedOrder) {
                // Generate order items (in real app, these would come from the order)
                const generateOrderItems = (count: number): OrderItem[] => {
                  const brands = ['WEEKDAY', 'COS', 'Monki', 'H&M'];
                  const categories = ['Clothing', 'Shoes', 'Accessories'];
                  const colors = ['Black', 'White', 'Blue', 'Red', 'Gray'];
                  const sizes = ['XS', 'S', 'M', 'L', 'XL'];
                  
                  return Array.from({ length: count }, (_, index) => {
                    const price = parseFloat((Math.random() * 150 + 20).toFixed(2));
                    const purchasePrice = parseFloat((price * (0.4 + Math.random() * 0.3)).toFixed(2));
                    
                    return {
                      id: `item-${shipment.orderId}-${index + 1}`,
                      partnerItemId: `PID-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
                      retailerItemId: index < 2 ? `RID-${Math.random().toString(36).substr(2, 6).toUpperCase()}` : undefined,
                      itemId: `ITEM-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
                      brand: brands[Math.floor(Math.random() * brands.length)],
                      category: categories[Math.floor(Math.random() * categories.length)],
                      size: sizes[Math.floor(Math.random() * sizes.length)],
                      color: colors[Math.floor(Math.random() * colors.length)],
                      price,
                      purchasePrice,
                      status: undefined,
                      gender: 'Unisex',
                      subcategory: '',
                      source: 'manual'
                    };
                  });
                };
                return generateOrderItems(relatedOrder.itemCount);
              }
            }
            return [];
          })()}
          onSaveAndClose={(() => {
            if (detailsScreenData?.type === 'shipment') {
              const shipment = detailsScreenData.data as DeliveryNote;
              if (shipment.status === 'pending' || shipment.status === 'packing') {
                return () => {
                  // Update delivery note in state
                  setDeliveryNotes(prev => prev.map(note =>
                    note.id === shipment.id ? { ...note, ...shipment } : note
                  ));
                  
                  // Update detailsScreenData
                  setDetailsScreenData({
                    ...detailsScreenData,
                    data: shipment
                  });
                  
                  toast.success('Delivery note saved');
                  handleBack();
                };
              }
            }
            return undefined;
          })()}
          onRegisterDelivery={(() => {
            if (detailsScreenData?.type === 'shipment') {
              const shipment = detailsScreenData.data as DeliveryNote;
              if (shipment.status === 'pending' || shipment.status === 'packing') {
                return () => {
                  const registeredBoxes = shipment.boxes.filter(box => box.status === 'registered');
                  const pendingBoxes = shipment.boxes.filter(box => box.status === 'pending');
                  
                  if (registeredBoxes.length === 0) {
                    toast.error('At least one box must be registered before registering the delivery note');
                    return;
                  }
                  
                  // Update delivery note status to registered
                  const updatedShipment: DeliveryNote = {
                    ...shipment,
                    boxes: shipment.boxes.map(box => ({
                      ...box,
                      status: box.status === 'registered' ? 'registered' : 'pending'
                    })),
                    status: 'registered',
                    registeredDate: new Date().toISOString()
                  };
                  
                  setDeliveryNotes(prev => prev.map(note =>
                    note.id === shipment.id ? updatedShipment : note
                  ));
                  
                  // Update detailsScreenData
                  setDetailsScreenData({
                    ...detailsScreenData,
                    data: updatedShipment
                  });
                  
                  // Update order status to in-transit if all boxes are registered
                  const relatedOrder = partnerOrders.find(order => order.id === shipment.orderId);
                  if (relatedOrder && pendingBoxes.length === 0) {
                    setPartnerOrders(prev => prev.map(order =>
                      order.id === shipment.orderId ? { ...order, status: 'in-transit' as const } : order
                    ));
                  }
                  
                  toast.success('Delivery note registered successfully');
                };
              }
            }
            return undefined;
          })()}
        />
      )}

      {/* Delivery Note Box Details Screen */}
      {currentScreen === 'delivery-note-box-details' && selectedDeliveryNoteBox && (
        <DeliveryNoteBoxDetailsScreen
          box={selectedDeliveryNoteBox.box}
          orderItems={selectedDeliveryNoteBox.orderItems}
          receiverBrand={selectedDeliveryNoteBox.receiverBrand}
          receiverStoreCode={selectedDeliveryNoteBox.receiverStoreCode}
          senderWarehouse={selectedDeliveryNoteBox.senderWarehouse}
          isAdmin={currentUserRole === 'admin'}
          onBack={() => {
            const previousScreen = selectedDeliveryNoteBox?.previousScreen || 'order-shipment-details';
            setSelectedDeliveryNoteBox(null);
            setCurrentScreenSafe(previousScreen);
          }}
          onRegisterBox={handleRegisterBox}
          onSaveAndClose={handleSaveBoxAndClose}
          onUnregisterBox={(boxId) => {
            const deliveryNote = deliveryNotes.find(note => 
              note.boxes.some(b => b.id === boxId)
            );
            
            if (deliveryNote) {
              setDeliveryNotes(prev => prev.map(note =>
                note.id === deliveryNote.id
                  ? {
                      ...note,
                      boxes: note.boxes.map(b =>
                        b.id === boxId ? { ...b, status: 'pending' as const } : b
                      )
                    }
                  : note
              ));
              
              // Update detailsScreenData if we're viewing this delivery note
              if (detailsScreenData?.type === 'shipment' && detailsScreenData.data.id === deliveryNote.id) {
                setDetailsScreenData({
                  ...detailsScreenData,
                  data: {
                    ...detailsScreenData.data,
                    boxes: (detailsScreenData.data as DeliveryNote).boxes.map(b =>
                      b.id === boxId ? { ...b, status: 'pending' as const } : b
                    )
                  }
                });
              }
              
              // Update selected box if it's the one being unregistered
              if (selectedDeliveryNoteBox.box.id === boxId) {
                setSelectedDeliveryNoteBox({
                  ...selectedDeliveryNoteBox,
                  box: { ...selectedDeliveryNoteBox.box, status: 'pending' }
                });
              }
              
              toast.success('Box unregistered');
            }
          }}
        />
      )}

      {/* Delivery Note Creation Screen */}
      {currentScreen === 'delivery-note-creation' && detailsScreenData && (detailsScreenData.type === 'order' || (detailsScreenData.type === 'shipment' && ((detailsScreenData.data as DeliveryNote).status === 'pending' || (detailsScreenData.data as DeliveryNote).status === 'packing'))) && (() => {
        const isShipment = detailsScreenData.type === 'shipment';
        const orderData = isShipment ? null : detailsScreenData.data as PartnerOrder;
        const deliveryNoteData = isShipment ? detailsScreenData.data as DeliveryNote : null;
        
        // Generate order items from order data
        const generateOrderItems = (count: number): OrderItem[] => {
          const brands = ['WEEKDAY', 'COS', 'Monki', 'H&M'];
          const categories = ['Clothing', 'Shoes', 'Accessories'];
          const colors = ['Black', 'White', 'Blue', 'Red', 'Gray'];
          const sizes = ['XS', 'S', 'M', 'L', 'XL'];
          
          return Array.from({ length: count }, (_, index) => {
            const price = parseFloat((Math.random() * 150 + 20).toFixed(2));
            const purchasePrice = parseFloat((price * (0.4 + Math.random() * 0.3)).toFixed(2));
            
            return {
              id: `item-${orderData.id}-${index + 1}`,
              partnerItemId: `PID-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
              retailerItemId: index < 2 ? `RID-${Math.random().toString(36).substr(2, 6).toUpperCase()}` : undefined,
              itemId: `ITEM-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
              brand: brands[Math.floor(Math.random() * brands.length)],
              category: categories[Math.floor(Math.random() * categories.length)],
              size: sizes[Math.floor(Math.random() * sizes.length)],
              color: colors[Math.floor(Math.random() * colors.length)],
              price,
              purchasePrice,
              status: undefined
            };
          });
        };
        
        // Get order items - use from detailsScreenData if available (for shipments), otherwise generate
        const orderItems = detailsScreenData.orderItems || (orderData ? generateOrderItems(orderData.itemCount) : []);
        
        // Get order ID - use from delivery note if shipment, otherwise from order
        const orderId = isShipment && deliveryNoteData ? deliveryNoteData.orderId : (orderData ? orderData.id : '');
        
        // Get receiver brand and warehouse info
        const receivingStoreId = isShipment && deliveryNoteData 
          ? deliveryNoteData.storeId 
          : (orderData ? (orderData.receivingStoreId || detailsScreenData.storeId) : undefined);
        const receivingStoreCode = isShipment && deliveryNoteData
          ? deliveryNoteData.storeCode || ''
          : (orderData ? (orderData.receivingStoreId || detailsScreenData.storeCode || '') : '');
        const store = receivingStoreId ? mockStores.find(s => s.id === receivingStoreId) : undefined;
        const receiverBrand = store ? mockBrands.find(b => b.id === store.brandId)?.name : (detailsScreenData.receiverBrand || undefined);
        const warehouseName = isShipment && deliveryNoteData
          ? resolveWarehouseName(deliveryNoteData.warehouseId, deliveryNoteData.warehouseName)
          : (orderData ? resolveWarehouseName(orderData.warehouseId, orderData.warehouseName) : detailsScreenData.warehouseName);

        return (
          <DeliveryNoteCreationScreen
            onBack={() => {
              // Restore the tab if we came from shipping screen
              if (detailsScreenData.previousScreen === 'shipping' && detailsScreenData.previousTab) {
                setShippingInitialTab(detailsScreenData.previousTab);
              }
              handleBack();
            }}
            orderId={orderId}
            orderItems={orderItems}
            onCreateDeliveryNote={(deliveryNote) => {
              if (isShipment && deliveryNoteData) {
                // Update existing delivery note, preserving other fields
                setDeliveryNotes(prev => prev.map(note =>
                  note.id === deliveryNoteData.id 
                    ? { 
                        ...note, 
                        ...deliveryNote,
                        createdDate: note.createdDate, // Preserve original created date
                        storeId: note.storeId,
                        storeCode: note.storeCode,
                        storeName: note.storeName,
                        warehouseId: note.warehouseId,
                        warehouseName: note.warehouseName,
                        partnerId: note.partnerId,
                        partnerName: note.partnerName
                      } 
                    : note
                ));
                
                // Update order status based on delivery note status
                if (deliveryNote.status === 'registered') {
                  const relatedOrder = partnerOrders.find(order => order.id === deliveryNote.orderId);
                  if (relatedOrder) {
                    setPartnerOrders(prev =>
                      prev.map(order =>
                        order.id === deliveryNote.orderId
                          ? { ...order, status: 'in-transit' as const }
                          : order
                      )
                    );
                  }
                }
              } else if (orderData) {
                // Add new delivery note to state
                setDeliveryNotes(prev => [...prev, deliveryNote]);
                
                // Update order status based on delivery note status
                if (deliveryNote.status === 'registered') {
                  setPartnerOrders(prev =>
                    prev.map(order =>
                      order.id === orderData.id
                        ? { ...order, status: 'in-transit' as const }
                        : order
                    )
                  );
                }
              }
              
              // Show success message
              toast.success('Delivery note saved successfully');
              
              // Navigate back - restore tab if from shipping screen
              if (detailsScreenData.previousScreen === 'shipping' && detailsScreenData.previousTab) {
                setShippingInitialTab(detailsScreenData.previousTab);
                setCurrentScreenSafe('shipping');
              } else if (currentUserRole === 'partner') {
                setCurrentScreenSafe('partner-dashboard');
              } else {
                setCurrentScreenSafe('shipping');
              }
            }}
            onSaveAndClose={(savedBoxes) => {
              if (isShipment && deliveryNoteData) {
                // Update existing delivery note with current boxes
                if (savedBoxes) {
                  setDeliveryNotes(prev => prev.map(note =>
                    note.id === deliveryNoteData.id
                      ? { ...note, boxes: savedBoxes }
                      : note
                  ));
                }
                toast.success('Delivery note saved');
              } else if (orderData) {
                // Create delivery note with pending status
                const deliveryNote: DeliveryNoteCreationDeliveryNote = {
                  id: `DN-${Date.now().toString().slice(-8)}`,
                  orderId: orderData.id,
                  boxes: [],
                  status: 'pending',
                  createdDate: new Date().toISOString()
                };
                setDeliveryNotes(prev => [...prev, deliveryNote]);
                toast.success('Delivery note saved');
              }
              
              // Navigate back - restore tab if from shipping screen
              if (detailsScreenData.previousScreen === 'shipping' && detailsScreenData.previousTab) {
                setShippingInitialTab(detailsScreenData.previousTab);
                setCurrentScreenSafe('shipping');
              } else if (currentUserRole === 'partner') {
                setCurrentScreenSafe('partner-dashboard');
              } else {
                setCurrentScreenSafe('shipping');
              }
            }}
            onOpenBoxDetails={(box) => {
              // Set selected box and navigate to box details
              // Track that we came from delivery-note-creation screen
              setSelectedDeliveryNoteBox({ 
                box, 
                orderItems: orderItems,
                previousScreen: 'delivery-note-creation'
              });
              setCurrentScreenSafe('delivery-note-box-details');
            }}
            receivingStore={
              isShipment && deliveryNoteData
                ? (deliveryNoteData.storeName
                    ? {
                        name: deliveryNoteData.storeName,
                        code: receivingStoreCode
                      }
                    : undefined)
                : (orderData?.receivingStoreName
                    ? {
                        name: orderData.receivingStoreName,
                        code: receivingStoreCode
                      }
                    : detailsScreenData.storeName
                      ? {
                          name: detailsScreenData.storeName,
                          code: receivingStoreCode
                        }
                      : undefined)
            }
            receiverBrand={receiverBrand}
            warehouseName={warehouseName}
            partnerName={isShipment && deliveryNoteData 
              ? deliveryNoteData.partnerName 
              : (orderData?.partnerName || detailsScreenData.partnerName)}
            isAdmin={currentUserRole === 'admin'}
            initialBoxes={isShipment && deliveryNoteData ? (detailsScreenData.data as DeliveryNote).boxes : undefined}
            deliveryNoteId={isShipment && deliveryNoteData ? deliveryNoteData.id : undefined}
            existingCreatedDate={isShipment && deliveryNoteData ? deliveryNoteData.createdDate : undefined}
            onDeleteUnassignedItem={(itemId) => {
              // Remove item from order items
              toast.success('Item removed');
            }}
          />
        );
      })()}

      {/* Digital Showroom Screens */}
      {currentScreen === 'showroom-dashboard' && (
        <Suspense fallback={<LoadingFallback />}>
        <PartnerShowroomDashboard 
          onNavigateToProducts={handleShowroomProducts}
          onNavigateToImport={() => {
            setShowroomActiveTab('products');
            handleShowroomImport();
          }}
          onNavigateToLineSheets={() => setCurrentScreenSafe('line-sheets-list')}
          products={showroomProducts}
          lineSheets={lineSheets}
          catalogHealth={{
            total: showroomProducts.length,
            active: showroomProducts.filter(p => p.status === 'active').length,
            draft: showroomProducts.filter(p => p.status === 'draft').length,
            missingMedia: showroomProducts.filter(p => p.images.length === 0).length,
            missingAttributes: showroomProducts.filter(p => !p.description || !p.category).length
          }}
          analytics={mockShowroomAnalytics}
          onEditProduct={(productId) => {
            const product = showroomProducts.find(p => p.id === productId);
            if (product) {
              setSelectedProductForEdit(product);
              setCurrentScreenSafe('product-edit');
            }
          }}
          onDuplicateProduct={(productId) => {}}
          onArchiveProduct={(productId) => {}}
          onBulkAction={(action, productIds) => {}}
          onCreateLineSheet={() => {
            setSelectedLineSheet(null);
            setShowroomActiveTab('linesheets');
            setCurrentScreenSafe('line-sheet-creation');
          }}
          onEditLineSheet={(lineSheetId) => {
            const lineSheet = lineSheets.find(ls => ls.id === lineSheetId);
            if (lineSheet) {
              setSelectedLineSheet(lineSheet);
              setCurrentScreenSafe('line-sheet-creation');
            }
          }}
          onDeleteLineSheet={(lineSheetId) => {
            setLineSheets(prev => prev.filter(ls => ls.id !== lineSheetId));
          }}
          onShareLineSheet={(lineSheetId) => {}}
          onViewLineSheet={(lineSheetId) => {}}
          activeTab={showroomActiveTab}
          onTabChange={setShowroomActiveTab}
        />
        </Suspense>
      )}

      {currentScreen === 'showroom-products' && (
        <Suspense fallback={<LoadingFallback />}>
        <ShowroomProductsScreen 
          onBack={() => setCurrentScreenSafe('showroom-dashboard')}
          products={showroomProducts}
          onEditProduct={(productId) => {
            const product = showroomProducts.find(p => p.id === productId);
            if (product) {
              setSelectedProductForEdit(product);
              setCurrentScreenSafe('product-edit');
            }
          }}
          onDuplicateProduct={(productId) => {}}
          onArchiveProduct={(productId) => {}}
          onBulkAction={(action, productIds) => {}}
          onImport={handleShowroomImport}
          onCreateLineSheet={() => {
            setSelectedLineSheet(null);
            setCurrentScreenSafe('line-sheet-creation');
          }}
        />
        </Suspense>
      )}

      {currentScreen === 'showroom-import' && (
        <Suspense fallback={<LoadingFallback />}>
        <ShowroomImportScreen 
          onBack={() => {
            setShowroomActiveTab('products');
            setCurrentScreenSafe('showroom-dashboard');
          }}
          onImportComplete={handleShowroomImportComplete}
        />
        </Suspense>
      )}

      {currentScreen === 'showroom-browse' && (
        <Suspense fallback={<LoadingFallback />}>
        <BuyerShowroomBrowse 
          products={showroomProducts.filter(p => p.productType === 'white_label')}
          onProductClick={handleShowroomProductClick}
          onAddToCart={handleShowroomAddToCart}
          cartItemCount={showroomCart.length}
          onViewCart={handleShowroomCart}
          wishlistProductIds={wishlistProductIds}
          onToggleWishlist={handleBuyerToggleWishlist}
        />
        </Suspense>
      )}

      {currentScreen === 'showroom-product-detail' && selectedShowroomProduct && (
        <Suspense fallback={<LoadingFallback />}>
        <ShowroomProductDetail 
          product={selectedShowroomProduct}
          onBack={() => setCurrentScreenSafe('showroom-browse')}
          onAddToCart={(quantity) => handleShowroomAddToCart(selectedShowroomProduct.id, quantity)}
        />
        </Suspense>
      )}

      {currentScreen === 'showroom-cart' && (
        <Suspense fallback={<LoadingFallback />}>
        <ShowroomCart 
          onBack={() => setCurrentScreenSafe('showroom-browse')}
          cartItems={showroomCart}
          onUpdateQuantity={handleShowroomUpdateQuantity}
          onRemoveItem={handleShowroomRemoveItem}
          onCheckout={handleShowroomCheckout}
        />
        </Suspense>
      )}

      {currentScreen === 'showroom-orders' && (
        <Suspense fallback={<LoadingFallback />}>
        <ShowroomOrdersScreen 
          onBack={() => setCurrentScreenSafe('showroom-dashboard')}
          orders={showroomOrders}
          onViewOrder={(order) => {
            setSelectedShowroomOrder(order);
            setCurrentScreenSafe('purchase-order-details');
          }}
        />
        </Suspense>
      )}

      {currentScreen === 'purchase-order-details' && selectedShowroomOrder && (
        <PurchaseOrderDetailsScreen 
          order={selectedShowroomOrder}
          onBack={() => setCurrentScreenSafe('showroom-orders')}
          userRole={currentUserRole === 'Partner' ? 'partner' : 'buyer'}
        />
      )}

      {currentScreen === 'line-sheet-creation' && (
        <LineSheetCreationScreen 
          onBack={() => {
            setSelectedLineSheet(null);
            setShowroomActiveTab('linesheets');
            setCurrentScreenSafe('showroom-dashboard');
          }}
          onCreate={(lineSheet) => {
            const newLineSheet = {
              ...lineSheet,
              id: `ls-${Date.now()}`,
              createdAt: new Date().toISOString()
            };
            setLineSheets(prev => [...prev, newLineSheet]);
            setSelectedLineSheet(null);
            setShowroomActiveTab('linesheets');
            setCurrentScreenSafe('showroom-dashboard');
          }}
          onUpdate={(lineSheetId, lineSheet) => {
            setLineSheets(prev => prev.map(ls => 
              ls.id === lineSheetId ? { ...lineSheet, id: lineSheetId, createdAt: ls.createdAt } : ls
            ));
            setSelectedLineSheet(null);
            setShowroomActiveTab('linesheets');
            setCurrentScreenSafe('showroom-dashboard');
          }}
          products={showroomProducts}
          partnerId={currentPartnerWarehouseSelection?.partnerId || 'partner-1'}
          editingLineSheet={selectedLineSheet}
        />
      )}

      {currentScreen === 'line-sheets-list' && (
        <LineSheetsListScreen 
          lineSheets={lineSheets}
          onBack={() => setCurrentScreenSafe('showroom-dashboard')}
          onCreate={() => {
            setSelectedLineSheet(null);
            setCurrentScreenSafe('line-sheet-creation');
          }}
          onView={(lineSheetId) => {}}
          onEdit={(lineSheetId) => {
            const lineSheet = lineSheets.find(ls => ls.id === lineSheetId);
            if (lineSheet) {
              setSelectedLineSheet(lineSheet);
              setCurrentScreenSafe('line-sheet-creation');
            }
          }}
          onDelete={(lineSheetId) => {
            setLineSheets(prev => prev.filter(ls => ls.id !== lineSheetId));
          }}
          onShare={(lineSheetId) => {}}
        />
      )}

      {currentScreen === 'product-edit' && selectedProductForEdit && (
        <ProductEditScreen 
          product={selectedProductForEdit}
          onBack={() => {
            setShowroomActiveTab('products');
            setCurrentScreenSafe('showroom-dashboard');
          }}
          onSave={(product) => {
            setShowroomProducts(prev => prev.map(p => 
              p.id === product.id ? product : p
            ));
            setShowroomActiveTab('products');
            setCurrentScreenSafe('showroom-dashboard');
          }}
        />
      )}

      {currentScreen === 'partner-quotations' && (
        <PartnerQuotationsScreen 
          onBack={handleBack}
          quotations={showroomOrders.filter(order => 
            order.type === 'rfq' && 
            order.partnerId === currentPartnerWarehouseSelection.partnerId
          )}
          messages={showroomMessages}
          onSendMessage={handleSendQuotationMessage}
          onViewQuotation={handleViewQuotationDetails}
          onApproveQuote={handleApproveQuotation}
          onRejectQuote={handleRejectQuotation}
        />
      )}

      {/* Quotation Details Screen */}
      {currentScreen === 'quotation-details' && selectedShowroomOrder && (
        <QuotationDetailsScreen 
          quotation={selectedShowroomOrder}
          messages={showroomMessages[selectedShowroomOrder.id] || []}
          onBack={handleBack}
          onSendMessage={(message) => handleSendQuotationMessage(selectedShowroomOrder.id, message)}
          onApproveQuote={handleApproveQuotation}
          onRejectQuote={handleRejectQuotation}
        />
      )}

      {/* Buyer Screens */}
      {currentScreen === 'buyer-dashboard' && (
        <Suspense fallback={<LoadingFallback />}>
        <BuyerDashboard 
          stats={{
            activeOrders: buyerPurchaseOrders.filter(o => o.status === 'pending').length,
            pendingQuotations: buyerQuotations.filter(q => q.status === 'pending').length,
            wishlistItems: wishlistProductIds.length,
            shipmentsInTransit: buyerShipments.filter(s => s.status === 'in-transit').length
          }}
          onBrowseProducts={() => setCurrentScreenSafe('showroom-browse')}
          onViewWishlist={handleNavigateToBuyerWishlist}
          onViewQuotations={handleNavigateToBuyerQuotations}
          onViewShipments={handleNavigateToBuyerShipments}
          onViewOrders={handleNavigateToBuyerOrders}
          onRoleSwitcherClick={handleOpenRoleSwitcher}
          onAdminClick={handleOpenAdminSettings}
          brands={mockBrands}
          countries={mockCountries}
          currentRetailerSelection={currentRetailerSelection}
          onRetailerSelectionChange={setCurrentRetailerSelection}
        />
        </Suspense>
      )}

      {currentScreen === 'buyer-wishlist' && (
        <BuyerWishlistScreen 
          wishlistProducts={showroomProducts.filter(p => wishlistProductIds.includes(p.id))}
          onBack={handleBack}
          onProductClick={handleShowroomProductClick}
          onRemoveFromWishlist={handleBuyerToggleWishlist}
          onAddToCart={handleShowroomAddToCart}
        />
      )}

      {currentScreen === 'buyer-quotations' && (
        <BuyerQuotationsScreen 
          quotations={buyerQuotations}
          onBack={handleBack}
          onViewQuotation={handleViewBuyerQuotation}
          onSendMessage={(quotationId, message) => {
            setBuyerQuotations(prev => prev.map(q => {
              if (q.id === quotationId) {
                const newMessage = {
                  id: `msg-${Date.now()}`,
                  author: 'Buyer User',
                  authorRole: 'buyer' as const,
                  body: message,
                  createdAt: new Date().toISOString()
                };
                return {
                  ...q,
                  messages: [...(q.messages || []), newMessage]
                };
              }
              return q;
            }));
          }}
          onUpdateQuotation={(quotationId, updates) => {
            setBuyerQuotations(prev => prev.map(q =>
              q.id === quotationId ? { ...q, ...updates } : q
            ));
          }}
        />
      )}

      {currentScreen === 'buyer-quotation-details' && selectedBuyerQuotationId && (
        <BuyerQuotationDetailsScreen 
          quotation={buyerQuotations.find(q => q.id === selectedBuyerQuotationId)!}
          onBack={handleBack}
          onAcceptQuotation={() => handleAcceptQuotation(selectedBuyerQuotationId)}
          onDeclineQuotation={(reason) => handleDeclineQuotation(selectedBuyerQuotationId, reason)}
          onSendMessage={(message) => handleSendBuyerQuotationMessage(selectedBuyerQuotationId, message)}
        />
      )}

      {currentScreen === 'buyer-shipments' && (
        <BuyerShipmentsScreen 
          shipments={buyerShipments}
          onBack={handleBack}
          onViewShipment={handleViewShipment}
        />
      )}

      {currentScreen === 'buyer-orders' && (
        <BuyerPurchaseOrdersScreen 
          orders={buyerPurchaseOrders}
          onBack={handleBack}
          onViewOrder={handleViewOrder}
          onTrackShipment={handleTrackShipment}
        />
      )}

      {currentScreen === 'buyer-order-details' && selectedBuyerOrderId && (
        <BuyerOrderDetailsScreen 
          order={buyerPurchaseOrders.find(o => o.id === selectedBuyerOrderId)!}
          onBack={handleBack}
          onUpdateOrder={handleUpdateBuyerOrder}
          onTrackShipment={handleTrackShipment}
        />
      )}

      {/* Portal Configuration */}
      {currentScreen === 'portal-configuration' && (
        <Suspense fallback={<LoadingFallback />}>
        <PortalConfigurationManager 
          userRole={currentUserRole}
          onBack={() => {
            setIsAdminSettingsSheetOpen(false);
            setCurrentScreenSafe(currentUserRole === 'partner' ? 'partner-dashboard' : (currentUserRole === 'buyer' ? 'buyer-dashboard' : 'home'));
          }}
          partners={partners}
          warehouses={warehouses}
          brands={mockBrands}
          onSavePartner={handleSavePartner}
          onDeletePartner={handleDeletePartner}
          onSaveWarehouse={handleSaveWarehouse}
          onDeleteWarehouse={handleDeleteWarehouse}
          currentPartnerId={currentPartnerWarehouseSelection.partnerId}
        />
        </Suspense>
      )}

      {/* Partner Settings */}
      {currentScreen === 'partner-settings' && (
        <Suspense fallback={<LoadingFallback />}>
          <PartnerSettingsScreen
            onBack={() => {
              setIsAdminSettingsSheetOpen(false);
              setCurrentScreenSafe(currentUserRole === 'partner' ? 'partner-dashboard' : (currentUserRole === 'buyer' ? 'buyer-dashboard' : 'home'));
            }}
            brands={mockBrands}
            partners={mockWarehousePartners}
            countries={mockCountries}
            currentUserRole={currentUserRole === 'admin' ? 'Admin' : currentUserRole === 'partner' ? 'Partner Admin' : 'Store Manager'}
          />
        </Suspense>
      )}

      {/* Store User Access Management */}
      {currentScreen === 'store-user-access' && (
        <Suspense fallback={<LoadingFallback />}>
          <StoreUserAccessScreen
            onBack={() => {
              setIsAdminSettingsSheetOpen(false);
              setCurrentScreenSafe(currentUserRole === 'partner' ? 'partner-dashboard' : (currentUserRole === 'buyer' ? 'buyer-dashboard' : 'home'));
            }}
            brands={mockBrands}
            countries={mockCountries}
            stores={mockStores}
            currentUserRole={currentUserRole === 'admin' ? 'Admin' : 'Brand Admin'}
            currentUserBrandId={currentUserRole === 'admin' ? undefined : currentStoreSelection.brandId}
          />
        </Suspense>
      )}

      {/* Partner User Access Management */}
      {currentScreen === 'partner-user-access' && (
        <Suspense fallback={<LoadingFallback />}>
          <PartnerUserAccessScreen
            onBack={() => {
              setIsAdminSettingsSheetOpen(false);
              setCurrentScreenSafe(currentUserRole === 'partner' ? 'partner-dashboard' : (currentUserRole === 'buyer' ? 'buyer-dashboard' : 'home'));
            }}
            brands={mockBrands}
            partners={mockWarehousePartners}
            currentUserRole={
              currentUserRole === 'admin' 
                ? 'Admin' 
                : currentUserRole === 'partner' 
                  ? 'Partner Admin' 
                  : 'Brand Admin'
            }
            currentUserBrandId={currentUserRole === 'admin' ? undefined : currentStoreSelection.brandId}
            currentUserPartnerId={currentUserRole === 'partner' ? currentPartnerWarehouseSelection.partnerId : undefined}
          />
        </Suspense>
      )}

      {/* Post-registration dialog */}
      <PostRegistrationDialog 
        isOpen={showPostRegistrationDialog}
        onClose={handleClosePostRegistrationDialog}
        onViewOrderList={handleViewOrderListFromDialog}
        onCreateDeliveryNote={handleCreateDeliveryNoteFromDialog}
        orderId={registeredOrderId || ''}
      />

      {/* Role Switcher Sheet */}
      <RoleSwitcherSheet 
        isOpen={isRoleSwitcherSheetOpen}
        onClose={() => setIsRoleSwitcherSheetOpen(false)}
        currentRole={currentUserRole}
        onRoleChange={handleRoleChange}
      />

      {/* Admin Settings Sheet */}
      <AdminSettingsSheet 
        isOpen={isAdminSettingsSheetOpen}
        onClose={() => setIsAdminSettingsSheetOpen(false)}
        userAccount={mockUserAccount}
        currentAppRole={currentUserRole}
        onLogout={handleLogout}
        onSwitchToAdmin={currentUserRole === 'admin' ? undefined : () => handleRoleChange('admin')}
        onNavigateToStockCheckReport={handleNavigateToStockCheckReports}
        onNavigateToPartnerReports={() => {
          setIsAdminSettingsSheetOpen(false);
          setCurrentScreenSafe('partner-reports');
        }}
        onNavigateToPortalConfiguration={() => {
          setIsAdminSettingsSheetOpen(false);
          setCurrentScreenSafe('portal-configuration');
        }}
        onNavigateToPartnerSettings={() => {
          setIsAdminSettingsSheetOpen(false);
          setCurrentScreenSafe('partner-settings');
        }}
        onNavigateToStoreUserAccess={() => {
          setIsAdminSettingsSheetOpen(false);
          setCurrentScreenSafe('store-user-access');
        }}
        onNavigateToPartnerUserAccess={() => {
          setIsAdminSettingsSheetOpen(false);
          setCurrentScreenSafe('partner-user-access');
        }}
      />

      {/* Show main navigation only for main app screens */}
      {showMainNavigation && (
        <ResponsiveNavigation 
          activeDestination={activeDestination}
          destinations={navigationDestinations}
        />
      )}
      
      {/* Toast notifications */}
      <Toaster />
    </ResponsiveLayout>
  );
}

