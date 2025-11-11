import React, { Suspense, startTransition, useEffect } from 'react';
import DeliveryHomeScreen from './components/DeliveryHomeScreen';
import ShippingScreen, { Delivery, ReturnDelivery, SellpyOrder } from './components/ShippingScreen';
import ReceiveDeliveryScreen from './components/ReceiveDeliveryScreen';
import PartnerSelectionScreen, { Partner } from './components/PartnerSelectionScreen';
import ReturnManagementScreen, { ReturnItem, ReturnOrder } from './components/ReturnManagementScreen';
import ReturnConfirmationScreen from './components/ReturnConfirmationScreen';
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
  mockDeliveryNotes
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
    'partner-settings'
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
    setCurrentScreenSafe('return-management');
  };

  const handleUpdateReturnItem = (itemId: string, action: 'select' | 'deselect' | 'missing' | 'extend' | 'scan') => {
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
        partnerName: effectivePartnerName
      },
      ...prev
    ]);
  };

  const handleCreateReturn = (selectedItems: ReturnItem[]) => {
    createReturnOrder(selectedItems, selectedPartner?.id, selectedPartner?.name);
  };

  const handleCreateReturnFromItems = (items: Item[]) => {
    if (items.length === 0) return;

    const returnItems: ReturnItem[] = items.map((item) => ({
      id: item.id,
      itemId: item.itemId,
      title: item.title,
      size: item.size,
      color: item.color,
      status: 'Return - In transit',
      partnerItemRef: item.itemId,
      thumbnail: item.thumbnail,
      image: item.thumbnail,
      selected: false
    }));

    createReturnOrder(returnItems);
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
    // Add to available sessions
    setAvailableStockCheckSessions(prev => {
      // Check if session already exists
      const exists = prev.some(s => s.id === session.id);
      if (exists) {
        // Update existing session
        return prev.map(s => s.id === session.id ? session : s);
      }
      // Add new session at the beginning (most recent first)
      return [session, ...prev];
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

  const handleUpdateStockItemStatus = (itemId: string, newStatus: 'Missing' | 'Found' | 'Scanned') => {
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
        // Get store and partner info
        const currentStore = mockStores.find(s => s.id === currentStoreSelection.storeId);
        const currentPartner = mockWarehousePartners.find(p => p.id === currentPartnerWarehouseSelection.partnerId);
        
        setDetailsScreenData({
          type: 'order',
          data: order,
          storeName: currentStore?.name || order.receivingStoreName,
          storeCode: currentStore?.code || order.receivingStoreId,
          partnerName: currentPartner?.name || order.partnerName
        });
        setCurrentScreenSafe('delivery-note-creation');
      }
    }
  };

  const handleCreateDeliveryNoteForOrder = (orderId: string) => {
    // Find the order to pass to delivery note creation if needed
    const order = partnerOrders.find(o => o.id === orderId);
    if (order) {
      // Get store and partner info
      const currentStore = mockStores.find(s => s.id === currentStoreSelection.storeId);
      const currentPartner = mockWarehousePartners.find(p => p.id === currentPartnerWarehouseSelection.partnerId);
      
      setDetailsScreenData({
        type: 'order',
        data: order,
        storeName: currentStore?.name,
        storeCode: currentStore?.code,
        partnerName: currentPartner?.name
      });
      // Navigate to delivery note creation screen
      setCurrentScreenSafe('delivery-note-creation');
    }
  };

  const handleNavigateToRetailerIdScan = (orderId: string) => {
    setCurrentScreenSafe('retailer-id-scan');
  };

  // Delivery note box management handlers
  const [selectedDeliveryNoteBox, setSelectedDeliveryNoteBox] = React.useState<{ box: any; orderItems: OrderItem[] } | null>(null);

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
      
      setDeliveryNotes(prev => prev.map(note =>
        note.id === deliveryNoteId
          ? { ...note, boxes: [...note.boxes, newBox] }
          : note
      ));
      
      // Update detailsScreenData if we're viewing this delivery note
      if (detailsScreenData?.type === 'shipment' && detailsScreenData.data.id === deliveryNoteId) {
        setDetailsScreenData({
          ...detailsScreenData,
          data: {
            ...detailsScreenData.data,
            boxes: [...(detailsScreenData.data as DeliveryNote).boxes, newBox]
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
            status: 'valid' as const
          };
        });
      };
      
      const orderItems = relatedOrder ? generateOrderItems(relatedOrder.itemCount) : [];
      
      setSelectedDeliveryNoteBox({ box, orderItems });
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
          setDetailsScreenData({
            ...detailsScreenData,
            data: {
              ...detailsScreenData.data,
              boxes: (detailsScreenData.data as DeliveryNote).boxes.map(b =>
                b.id === boxId ? { ...b, items } : b
              )
            }
          });
        }
      }
      
      setSelectedDeliveryNoteBox(null);
      setCurrentScreenSafe('order-shipment-details');
    }
  };

  const handleViewShipmentDetails = (type: DetailType, data: PartnerOrder | DeliveryNote | ReturnDelivery) => {
    const currentStore = mockStores.find(s => s.id === currentStoreSelection.storeId);
    const currentPartner = mockWarehousePartners.find(p => p.id === currentPartnerWarehouseSelection.partnerId);
    
    setDetailsScreenData({
      type,
      data,
      storeName: currentStore?.name,
      storeCode: currentStore?.code,
      partnerName: currentPartner?.name
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
    currentScreen !== 'return-management' &&
    currentScreen !== 'return-confirmation' &&
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
            returns: returnDeliveries.length
          }}
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
              mockBoxes.push({
                id: `box-${i}`,
                boxId: `BOX-${delivery.deliveryId.slice(-6)}-${i.toString().padStart(3, '0')}`,
                orderNumber: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
                externalOrder: `EXT-${Math.floor(10000 + Math.random() * 90000)}`,
                items: Math.floor(20 + Math.random() * 100),
                status: 'In transit' as const,
                date: delivery.date,
                isScanned: false
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
          onSelectSellpyOrder={(order) => {
            setSelectedSellpyOrder(order);
            setCurrentScreenSafe('order-details');
          }}
          onOpenOrderDetails={(order) => {
            handleViewShipmentDetails('order', order);
          }}
          onOpenShipmentDetails={(deliveryNote) => {
            handleViewShipmentDetails('shipment', deliveryNote);
          }}
          onOpenReturnDetails={(returnDelivery) => {
            handleViewShipmentDetails('return', returnDelivery);
          }}
          onViewShowroomOrder={(orderId) => {
            const order = showroomOrders.find(o => o.id === orderId);
            if (order) {
              setSelectedShowroomOrder(order);
              setCurrentScreenSafe('purchase-order-details');
            }
          }}
          onUpdateReturnDeliveryStatus={handleUpdateReturnDeliveryStatus}
          brands={mockBrands}
          countries={mockCountries}
          stores={mockStores}
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
          onBack={() => setCurrentScreenSafe('delivery-details')}
          onRegister={(delivery, scannedBoxes) => {
            // Update the boxes in state
            setDeliveryBoxes(prev => prev.map(box => {
              const scannedBox = scannedBoxes.find(sb => sb.id === box.id);
              if (scannedBox) {
                return { ...scannedBox, status: 'Delivered', isScanned: true };
              }
              return box;
            }));
            // Navigate back or to confirmation
            setCurrentScreenSafe('shipping');
            const event = new CustomEvent('toast', {
              detail: { message: `Registered ${scannedBoxes.length} boxes successfully`, type: 'success' }
            });
            window.dispatchEvent(event);
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
          onViewBoxes={handleNavigateToShipmentsTab}
          onViewDeliveries={handleNavigateToShipmentsTab}
          onViewReturns={handleNavigateToReturnsTab}
          onNavigateToShowroom={handleNavigateToShowroom}
          onAdminClick={handleOpenAdminSettings}
          onRoleSwitcherClick={handleOpenRoleSwitcher}
          stats={mockPartnerStats}
          recentOrders={partnerOrders}
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
        />
      )}

      {currentScreen === 'order-creation' && (() => {
        const currentPartner = mockWarehousePartners?.find(p => p.id === currentPartnerWarehouseSelection?.partnerId);
        const isThriftedPartner = currentPartner?.name === 'Thrifted';
        
        if (isThriftedPartner) {
          return (
            <ThriftedOrderCreationScreen
              onBack={() => setCurrentScreenSafe('partner-dashboard')}
              onCreateOrder={(items, storeSelection, shouldRegister = false) => {
                // Create a new order with the items
                const newOrder: PartnerOrder = {
                  id: `THR-ORD-${Date.now().toString().slice(-8)}`,
                  status: shouldRegister ? 'registered' : 'pending',
                  createdDate: new Date().toISOString(),
                  itemCount: items.length,
                  boxCount: 0,
                  partnerId: currentPartner?.id,
                  partnerName: currentPartner?.name,
                  receivingStoreId: storeSelection.storeId,
                  receivingStoreName: mockStores?.find(s => s.id === storeSelection.storeId)?.name
                };
                
                setPartnerOrders(prev => [...prev, newOrder]);
                
                // If registering, show the post-registration dialog
                if (shouldRegister) {
                  setRegisteredOrderId(newOrder.id);
                  setShowPostRegistrationDialog(true);
                } else {
                  setCurrentScreenSafe('partner-dashboard');
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
          onViewDetails={(note) => handleViewShipmentDetails('delivery', note)}
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
              status: 'valid' as const
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
          onBack={handleBack}
          storeName={detailsScreenData.storeName}
          storeCode={detailsScreenData.storeCode}
          partnerName={detailsScreenData.partnerName}
          isAdmin={mockUserAccount.role.name === 'Admin'}
          onNavigateToRetailerIdScan={() => {
            if (detailsScreenData.type === 'order') {
              handleNavigateToRetailerIdScan((detailsScreenData.data as PartnerOrder).id);
            }
          }}
          onRegisterOrder={() => {
            if (detailsScreenData.type === 'order') {
              const order = detailsScreenData.data as PartnerOrder;
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
                      status: 'valid' as const,
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
        />
      )}

      {/* Delivery Note Box Details Screen */}
      {currentScreen === 'delivery-note-box-details' && selectedDeliveryNoteBox && (
        <DeliveryNoteBoxDetailsScreen
          box={selectedDeliveryNoteBox.box}
          orderItems={selectedDeliveryNoteBox.orderItems}
          onBack={() => {
            setSelectedDeliveryNoteBox(null);
            setCurrentScreenSafe('order-shipment-details');
          }}
          onRegisterBox={handleRegisterBox}
          onSaveAndClose={handleSaveBoxAndClose}
        />
      )}

      {/* Delivery Note Creation Screen */}
      {currentScreen === 'delivery-note-creation' && detailsScreenData && detailsScreenData.type === 'order' && (() => {
        const orderData = detailsScreenData.data as PartnerOrder;
        
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
              status: 'valid' as const
            };
          });
        };
        
        const orderItems = generateOrderItems(orderData.itemCount);
        
        return (
          <DeliveryNoteCreationScreen
            onBack={handleBack}
            orderId={orderData.id}
            orderItems={orderItems}
            onCreateDeliveryNote={(deliveryNote) => {
              // Add delivery note to state
              setDeliveryNotes(prev => [...prev, deliveryNote]);
              
              // Update order status to in-transit
              setPartnerOrders(prev =>
                prev.map(order =>
                  order.id === orderData.id
                    ? { ...order, status: 'in-transit' as const }
                    : order
                )
              );
              
              // Show success message
              toast.success('Delivery note registered successfully');
              
              // Navigate back to partner dashboard or shipping screen
              if (currentUserRole === 'partner') {
                setCurrentScreenSafe('partner-dashboard');
              } else {
                setCurrentScreenSafe('shipping');
              }
            }}
            onOpenBoxDetails={(box) => {
              // Set selected box and navigate to box details
              setSelectedDeliveryNoteBox({ box, orderItems: orderItems });
              setCurrentScreenSafe('delivery-note-box-details');
            }}
            receivingStore={
              orderData.receivingStoreName
                ? {
                    name: orderData.receivingStoreName,
                    code: orderData.receivingStoreId || ''
                  }
                : detailsScreenData.storeName
                  ? {
                      name: detailsScreenData.storeName,
                      code: detailsScreenData.storeCode || ''
                    }
                  : undefined
            }
            partnerName={orderData.partnerName || detailsScreenData.partnerName}
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
        onNavigateToPortalConfiguration={() => {
          setIsAdminSettingsSheetOpen(false);
          setCurrentScreenSafe('portal-configuration');
        }}
        onNavigateToPartnerSettings={() => {
          setIsAdminSettingsSheetOpen(false);
          setCurrentScreenSafe('partner-settings');
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

