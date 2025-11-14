import { NavigationDestination } from '../components/ResponsiveNavigation';
import { PartnerWarehouseSelection } from '../components/PartnerWarehouseSelector';

interface GetNavigationConfigParams {
  currentUserRole: 'store-staff' | 'partner' | 'buyer';
  currentScreen: string;
  currentPartnerWarehouseSelection?: PartnerWarehouseSelection;
  handlers: {
    handleNavigateToPartnerDashboard: () => void;
    handleNavigateToShowroom: () => void;
    handleNavigateToPartnerQuotations: () => void;
    handleNavigateToItems: () => void;
    handleNavigateToScan: () => void;
    handleNavigateToSellers: () => void;
    handleNavigateToShipping: () => void;
    handleNavigateToBuyerDashboard: () => void;
    handleNavigateToBuyerWishlist: () => void;
    handleNavigateToBuyerOrders: () => void;
    handleNavigateToBuyerQuotations: () => void;
    handleNavigateToBuyerShipments: () => void;
    setCurrentScreen: (screen: any) => void;
  };
}

/**
 * Get navigation destinations based on user role and context
 */
export function getNavigationDestinations({
  currentUserRole,
  currentScreen,
  currentPartnerWarehouseSelection,
  handlers
}: GetNavigationConfigParams): NavigationDestination[] {
  
  // Buyer mode navigation
  if (currentUserRole === 'buyer') {
    return [
      {
        id: 'buyer-dashboard',
        label: 'Dashboard',
        icon: 'p34769840',
        onClick: handlers.handleNavigateToBuyerDashboard
      },
      {
        id: 'buyer-browse',
        label: 'Browse',
        icon: 'p3882d700',
        onClick: () => handlers.setCurrentScreen('showroom-browse')
      },
      {
        id: 'buyer-quotations',
        label: 'Quotations',
        icon: 'documents',
        onClick: handlers.handleNavigateToBuyerQuotations
      }
    ];
  }
  
  // Partner mode navigation
  if (currentUserRole === 'partner') {
    // Check partner type for navigation
    const isChinesePartner = currentPartnerWarehouseSelection?.partnerId === '6'; // Shenzhen Fashion Manufacturing
    
    // Partner navigation - varies by partner type
    if (isChinesePartner) {
      // Chinese partner: Dashboard, Showroom, Quotations (consistent across all screens)
      return [
        {
          id: 'partner-dashboard',
          label: 'Dashboard',
          icon: 'p34769840',
          onClick: handlers.handleNavigateToPartnerDashboard
        },
        {
          id: 'showroom-dashboard',
          label: 'Showroom',
          icon: 'p3882d700',
          onClick: handlers.handleNavigateToShowroom
        },
        {
          id: 'partner-quotations',
          label: 'Quotations',
          icon: 'documents',
          onClick: handlers.handleNavigateToPartnerQuotations
        }
      ];
    } else {
      // Sellpy or other partners: Dashboard, Items, Shipping
      return [
        {
          id: 'partner-dashboard',
          label: 'Dashboard',
          icon: 'p34769840',
          onClick: handlers.handleNavigateToPartnerDashboard
        },
        {
          id: 'items',
          label: 'Items',
          icon: 'p3882d700',
          onClick: handlers.handleNavigateToItems
        },
        {
          id: 'shipping',
          label: 'Shipping',
          icon: 'p20e0b980',
          onClick: handlers.handleNavigateToShipping
        }
      ];
    }
  }
  
  // Store staff (default) navigation
  return [
    {
      id: 'home',
      label: 'Home',
      icon: 'p34769840',
      onClick: () => handlers.setCurrentScreen('home')
    },
    {
      id: 'items',
      label: 'Items',
      icon: 'p3882d700',
      onClick: handlers.handleNavigateToItems
    },
    {
      id: 'scan',
      label: 'Scan',
      icon: 'p34fc5000',
      onClick: handlers.handleNavigateToScan
    },
    {
      id: 'sellers',
      label: 'Sellers',
      icon: 'sellers',
      onClick: handlers.handleNavigateToSellers
    },
    {
      id: 'shipping',
      label: 'Shipping',
      icon: 'p20e0b980',
      onClick: handlers.handleNavigateToShipping
    }
  ];
}

/**
 * Get active destination ID based on current screen
 */
export function getActiveDestination(currentScreen: string, currentUserRole: string): string {
  if (currentUserRole === 'buyer') {
    if (currentScreen === 'buyer-dashboard') return 'buyer-dashboard';
    if (currentScreen.startsWith('showroom-browse') || currentScreen === 'showroom-cart' || currentScreen === 'showroom-product-detail') return 'buyer-browse';
    if (currentScreen.includes('quotation')) return 'buyer-quotations';
    return 'buyer-dashboard';
  }
  
  if (currentUserRole === 'partner') {
    if (currentScreen.startsWith('showroom') || currentScreen === 'line-sheet-creation' || currentScreen === 'product-edit') return 'showroom-dashboard';
    if (currentScreen.includes('quotation')) return 'partner-quotations';
    if (currentScreen === 'price-fork-calibration') return 'partner-dashboard';
    if (currentScreen === 'partner-dashboard' || currentScreen === 'order-creation' || currentScreen === 'box-management' || currentScreen === 'sellpy-orders' || currentScreen === 'order-details' || currentScreen === 'retailer-id-scan' || currentScreen === 'order-shipment-details') return 'partner-dashboard';
    if (currentScreen === 'items') return 'items';
    if (currentScreen === 'scan') return 'scan';
    if (currentScreen.includes('shipping') || currentScreen === 'receive') return 'shipping';
    return 'partner-dashboard';
  }
  
  // Store staff
  if (currentScreen === 'home' || currentScreen === 'return-management' || currentScreen === 'return-confirmation' || currentScreen === 'partner-selection' || currentScreen === 'stock-check' || currentScreen === 'stock-check-report' || currentScreen === 'stock-check-review' || currentScreen === 'status-update') return 'home';
  if (currentScreen === 'items') return 'items';
  if (currentScreen === 'scan') return 'scan';
  if (currentScreen === 'sellers') return 'sellers';
  if (currentScreen.includes('shipping') || currentScreen === 'receive') return 'shipping';
  
  return 'home';
}
