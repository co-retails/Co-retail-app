import { useCallback } from 'react';
import { Screen } from './useAppState';

interface NavigationHandlersProps {
  currentScreen: Screen;
  setCurrentScreen: (screen: Screen) => void;
  setShippingInitialTab: (tab: 'shipments' | 'returns' | 'all' | 'pending' | 'in-transit' | 'delivered' | undefined) => void;
  currentUserRole?: 'store-staff' | 'partner' | 'buyer';
}

/**
 * Custom hook for navigation handlers
 * Centralizes all navigation logic to keep components clean
 */
export function useNavigationHandlers({
  currentScreen,
  setCurrentScreen,
  setShippingInitialTab,
  currentUserRole
}: NavigationHandlersProps) {
  
  const handleBack = useCallback(() => {
    // Navigate back based on current screen
    if (currentScreen === 'receive') {
      setCurrentScreen('shipping');
    } else if (currentScreen === 'return-management') {
      setCurrentScreen('partner-selection');
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
      setCurrentScreen('partner-dashboard');
    } else if (currentScreen === 'delivery-note-creation') {
      setCurrentScreen('partner-dashboard');
    } else if (currentScreen === 'order-shipment-details') {
      // Go back to shipping screen - determine which tab based on role
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
    } else {
      setCurrentScreen('home');
    }
  }, [currentScreen, setCurrentScreen, setShippingInitialTab, currentUserRole]);

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
    // For partners, default to pending (Orders tab)
    // For store staff, default to shipments (New tab)
    setShippingInitialTab(currentUserRole === 'partner' ? 'pending' : 'shipments');
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

  const handleNavigateToPriceForkCalibration = useCallback(() => {
    setCurrentScreen('price-fork-calibration');
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
    handleNavigateToPriceForkCalibration
  };
}
