import { useCallback } from 'react';
import { Screen } from './useAppState';

interface NavigationHandlersProps {
  currentScreen: Screen;
  setCurrentScreen: (screen: Screen) => void;
  setShippingInitialTab: (tab: 'shipments' | 'returns' | 'all' | 'pending' | 'in-transit' | 'delivered' | 'registered' | undefined) => void;
  currentUserRole?: 'store-staff' | 'partner' | 'buyer' | 'admin';
  receivePreviousScreen?: Screen | null;
  returnManagementPreviousScreen?: Screen | null;
  returnManagementPreviousTab?: 'shipments' | 'returns' | 'all' | 'pending' | 'in-transit' | 'delivered' | 'registered' | undefined;
  orderCreationReturnScreen?: Screen;
}

/**
 * Custom hook for navigation handlers
 * Centralizes all navigation logic to keep components clean
 */
export function useNavigationHandlers({
  currentScreen,
  setCurrentScreen,
  setShippingInitialTab,
  currentUserRole,
  receivePreviousScreen,
  returnManagementPreviousScreen,
  returnManagementPreviousTab,
  orderCreationReturnScreen = 'partner-dashboard'
}: NavigationHandlersProps) {
  
  const handleBack = useCallback(() => {
    console.log('[handleBack] currentScreen:', currentScreen, 'receivePreviousScreen:', receivePreviousScreen);
    // Navigate back based on current screen
    if (currentScreen === 'receive') {
      // Use the tracked previous screen if available, otherwise default to shipping
      console.log('[handleBack] Navigating from receive screen, previousScreen:', receivePreviousScreen);
      if (receivePreviousScreen) {
        console.log('[handleBack] Setting screen to:', receivePreviousScreen);
        setCurrentScreen(receivePreviousScreen);
      } else {
        console.log('[handleBack] No previousScreen, defaulting to shipping');
        setCurrentScreen('shipping');
      }
    } else if (currentScreen === 'return-management') {
      // Use the tracked previous screen if available, otherwise default to partner-selection
      console.log('[handleBack] Navigating from return-management, previousScreen:', returnManagementPreviousScreen, 'previousTab:', returnManagementPreviousTab);
      if (returnManagementPreviousScreen === 'shipping' && returnManagementPreviousTab) {
        console.log('[handleBack] Restoring shipping tab to:', returnManagementPreviousTab);
        setShippingInitialTab(returnManagementPreviousTab);
        setCurrentScreen('shipping');
      } else if (returnManagementPreviousScreen) {
        console.log('[handleBack] Setting screen to:', returnManagementPreviousScreen);
        setCurrentScreen(returnManagementPreviousScreen);
      } else {
        console.log('[handleBack] No previousScreen, defaulting to partner-selection');
        setCurrentScreen('partner-selection');
      }
    } else if (currentScreen === 'stock-check-report') {
      setCurrentScreen('home');
    } else if (currentScreen === 'stock-check-review') {
      setCurrentScreen('stock-check-report');
    } else if (currentScreen === 'box-management') {
      setCurrentScreen('partner-dashboard');
    } else if (currentScreen === 'sellpy-orders') {
      setCurrentScreen('partner-dashboard');
    } else if (currentScreen === 'sellpy-order-details') {
      // Go back to shipping screen with Orders tab (for Sellpy partner portal)
      setShippingInitialTab('pending');
      setCurrentScreen('shipping');
    } else if (currentScreen === 'order-details') {
      // Go back to shipping screen with New tab (for Sellpy orders in store staff mode)
      setShippingInitialTab('shipments');
      setCurrentScreen('shipping');
    } else if (currentScreen === 'retailer-id-scan') {
      setCurrentScreen('order-shipment-details');
    } else if (currentScreen === 'order-creation') {
      setCurrentScreen(orderCreationReturnScreen);
    } else if (currentScreen === 'delivery-note-creation') {
      setCurrentScreen('partner-dashboard');
    } else if (currentScreen === 'order-shipment-details') {
      // Check if we have detailsScreenData with previousScreen to navigate back correctly
      // This will be handled in App.tsx where we have access to detailsScreenData
      // For now, default to shipping screen - App.tsx will override if previousScreen is set
      if (currentUserRole === 'partner') {
        // For partners, default to pending (orders) tab
        setShippingInitialTab('pending');
      } else {
        // For store staff, default to shipments (new) tab
        setShippingInitialTab('shipments');
      }
      setCurrentScreen('shipping');
    } else if (currentScreen === 'showroom-products' || 
               currentScreen === 'showroom-orders' || 
               currentScreen === 'line-sheets-list') {
      setCurrentScreen('showroom-dashboard');
    } else if (currentScreen === 'showroom-product-detail') {
      setCurrentScreen('showroom-products');
    } else if (currentScreen === 'showroom-import' || 
               currentScreen === 'line-sheet-creation' || 
               currentScreen === 'product-edit') {
      setCurrentScreen('showroom-dashboard');
    } else if (currentScreen === 'showroom-browse') {
      setCurrentScreen('buyer-dashboard');
    } else if (currentScreen === 'showroom-cart') {
      setCurrentScreen('showroom-browse');
    } else if (currentScreen === 'purchase-order-details') {
      setCurrentScreen('showroom-orders');
    } else if (currentScreen === 'buyer-quotation-details') {
      setCurrentScreen('buyer-quotations');
    } else if (currentScreen === 'buyer-order-details') {
      setCurrentScreen('buyer-orders');
    } else if (currentScreen === 'buyer-wishlist' || 
               currentScreen === 'buyer-quotations' || 
               currentScreen === 'buyer-shipments' ||
               currentScreen === 'buyer-orders') {
      setCurrentScreen('buyer-dashboard');
    } else if (currentScreen === 'partner-quotations' || 
               currentScreen === 'quotation-details') {
      setCurrentScreen('partner-dashboard');
    } else if (currentScreen === 'price-fork-calibration') {
      setCurrentScreen('partner-dashboard');
    } else if (currentScreen === 'portal-configuration') {
      setCurrentScreen('home');
    } else if (currentScreen === 'store-user-access' || currentScreen === 'partner-user-access') {
      setCurrentScreen('home');
    } else if (currentScreen === 'shipping-report' || currentScreen === 'partner-reports') {
      // Navigate back based on user role
      if (currentUserRole === 'admin' || currentUserRole === 'store-staff') {
        setCurrentScreen('home');
      } else {
        setCurrentScreen('partner-dashboard');
      }
    } else {
      setCurrentScreen('home');
    }
  }, [currentScreen, setCurrentScreen, setShippingInitialTab, currentUserRole, receivePreviousScreen, returnManagementPreviousScreen, returnManagementPreviousTab, orderCreationReturnScreen]);

  const handleBackToHome = useCallback(() => {
    setCurrentScreen('home');
  }, [setCurrentScreen]);

  const handleNavigateToItems = useCallback(() => {
    setCurrentScreen('items');
  }, [setCurrentScreen]);

  const handleNavigateToScan = useCallback(() => {
    setCurrentScreen('scan');
  }, [setCurrentScreen]);

  const handleNavigateToSellers = useCallback(() => {
    setCurrentScreen('sellers');
  }, [setCurrentScreen]);

  const handleNavigateToShipping = useCallback(() => {
    // Default to "All" filters for partners unless a specific action overrides later
    if (currentUserRole === 'partner') {
      setShippingInitialTab(undefined);
    } else {
      setShippingInitialTab('shipments');
    }
    setCurrentScreen('shipping');
  }, [setCurrentScreen, setShippingInitialTab, currentUserRole]);

  const handleViewInShipping = useCallback(() => {
    setShippingInitialTab('returns');
    setCurrentScreen('shipping');
  }, [setCurrentScreen, setShippingInitialTab]);

  const handleNavigateToPartnerDashboard = useCallback(() => {
    setCurrentScreen('partner-dashboard');
  }, [setCurrentScreen]);

  const handleNavigateToShowroom = useCallback(() => {
    setCurrentScreen('showroom-dashboard');
  }, [setCurrentScreen]);

  const handleNavigateToPartnerQuotations = useCallback(() => {
    setCurrentScreen('partner-quotations');
  }, [setCurrentScreen]);

  const handleNavigateToBuyerDashboard = useCallback(() => {
    setCurrentScreen('buyer-dashboard');
  }, [setCurrentScreen]);

  const handleNavigateToBuyerWishlist = useCallback(() => {
    setCurrentScreen('buyer-wishlist');
  }, [setCurrentScreen]);

  const handleNavigateToBuyerOrders = useCallback(() => {
    setCurrentScreen('buyer-orders');
  }, [setCurrentScreen]);

  const handleNavigateToBuyerQuotations = useCallback(() => {
    setCurrentScreen('buyer-quotations');
  }, [setCurrentScreen]);

  const handleNavigateToBuyerShipments = useCallback(() => {
    setCurrentScreen('buyer-shipments');
  }, [setCurrentScreen]);

  const handleNavigateToPortalConfig = useCallback(() => {
    setCurrentScreen('portal-configuration');
  }, [setCurrentScreen]);

  const handleNavigateToSellpyOrders = useCallback(() => {
    setShippingInitialTab('shipments');
    setCurrentScreen('shipping');
  }, [setCurrentScreen, setShippingInitialTab]);

  const handleNavigateToStoreUserAccess = useCallback(() => {
    setCurrentScreen('store-user-access');
  }, [setCurrentScreen]);

  const handleNavigateToPartnerUserAccess = useCallback(() => {
    setCurrentScreen('partner-user-access');
  }, [setCurrentScreen]);

  return {
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
    handleNavigateToPortalConfig,
    handleNavigateToSellpyOrders,
    handleNavigateToStoreUserAccess,
    handleNavigateToPartnerUserAccess
  };
}
