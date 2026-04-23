import { NavigationDestination } from '../components/ResponsiveNavigation';
import { PartnerWarehouseSelection } from '../components/PartnerWarehouseSelector';

interface GetNavigationConfigParams {
  currentUserRole: 'store-staff' | 'partner' | 'admin';
  currentScreen: string;
  currentPartnerWarehouseSelection?: PartnerWarehouseSelection;
  handlers: {
    handleNavigateToPartnerDashboard: () => void;
    handleNavigateToItems: () => void;
    handleNavigateToScan: () => void;
    handleNavigateToSellers: () => void;
    handleNavigateToShipping: () => void;
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
  
  // Partner mode navigation
  if (currentUserRole === 'partner') {
    // Partner navigation
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

  if (role === 'partner') {
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
