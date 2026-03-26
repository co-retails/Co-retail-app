import { NavigationDestination } from '../components/ResponsiveNavigation';
import { PartnerWarehouseSelection } from '../components/PartnerWarehouseSelector';

interface GetNavigationConfigParams {
  currentUserRole: 'store-staff' | 'partner' | 'buyer' | 'admin';
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
      // Sellpy or other partners: Dashboard, Shipping
      return [
        {
          id: 'partner-dashboard',
          label: 'Dashboard',
          icon: 'p34769840',
          onClick: handlers.handleNavigateToPartnerDashboard
        },
        {
          id: 'shipping',
          label: 'Shipping',
          desktopLabel: 'Orders & Shipments',
          icon: 'p20e0b980',
          onClick: handlers.handleNavigateToShipping
        }
      ];
    }
  }
  
  // Store staff and admin (default) navigation
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
export function getActiveDestination(currentScreen: unknown, currentUserRole: unknown): string {
  const screen = typeof currentScreen === 'string' ? currentScreen : 'home';
  const role = typeof currentUserRole === 'string' ? currentUserRole : 'store-staff';

  if (role === 'buyer') {
    if (screen === 'buyer-dashboard') return 'buyer-dashboard';
    if (screen.startsWith('showroom-browse') || screen === 'showroom-cart' || screen === 'showroom-product-detail') return 'buyer-browse';
    if (screen.includes('quotation')) return 'buyer-quotations';
    return 'buyer-dashboard';
  }
  
  if (role === 'partner') {
    if (screen.startsWith('showroom') || screen === 'line-sheet-creation' || screen === 'product-edit') return 'showroom-dashboard';
    if (screen.includes('quotation')) return 'partner-quotations';
    if (screen === 'price-fork-calibration') return 'partner-dashboard';
    if (screen === 'partner-dashboard' || screen === 'order-creation' || screen === 'box-management' || screen === 'sellpy-orders' || screen === 'order-details' || screen === 'retailer-id-scan' || screen === 'order-shipment-details') return 'partner-dashboard';
    if (screen === 'scan') return 'scan';
    if (screen.includes('shipping') || screen === 'receive') return 'shipping';
    return 'partner-dashboard';
  }
  
  // Store staff
  if (screen === 'home' || screen === 'return-management' || screen === 'return-confirmation' || screen === 'partner-selection' || screen === 'stock-check' || screen === 'stock-check-report' || screen === 'stock-check-review' || screen === 'status-update') return 'home';
  if (screen === 'items') return 'items';
  if (screen === 'scan') return 'scan';
  if (screen.includes('shipping') || screen === 'receive') return 'shipping';
  
  return 'home';
}
