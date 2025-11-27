import React from 'react';
import { Screen, useAppState } from '../hooks/useAppState';
import DeliveryHomeScreen from './DeliveryHomeScreen';
import ShippingScreen from './ShippingScreen';
import ReceiveDeliveryScreen from './ReceiveDeliveryScreen';
import PartnerSelectionScreen from './PartnerSelectionScreen';
import ReturnManagementScreen from './ReturnManagementScreen';
import ReturnConfirmationScreen from './ReturnConfirmationScreen';
import ItemsScreen from './ItemsScreen';
import ScanScreen from './ScanScreen';
import SellersScreen from './SellersScreen';
import StockCheckScreen from './StockCheckScreen';
import StockCheckReportScreen from './StockCheckReportScreen';
import StockCheckReviewScreen from './StockCheckReviewScreen';
import StatusUpdateScreen from './StatusUpdateScreen';
import RoleSwitcher from './RoleSwitcher';
import PartnerDashboard from './PartnerDashboard';
import OrderCreationScreen from './OrderCreationScreen';
import ThriftedOrderCreationScreen from './ThriftedOrderCreationScreen';
import BoxManagementScreen from './BoxManagementScreen';
import DeliveryNoteDetailsScreen from './DeliveryNoteDetailsScreen';
import OrderDetailsScreen from './OrderDetailsScreen';
import RetailerIdScanScreen from './RetailerIdScanScreen';
import OrderShipmentDetailsScreen from './OrderShipmentDetailsScreen';
import PartnerShowroomDashboard from './PartnerShowroomDashboard';
import ShowroomProductsScreen from './ShowroomProductsScreen';
import ShowroomImportScreen from './ShowroomImportScreen';
import BuyerShowroomBrowse from './BuyerShowroomBrowse';
import ShowroomProductDetail from './ShowroomProductDetail';
import ShowroomCart from './ShowroomCart';
import ShowroomOrdersScreen from './ShowroomOrdersScreen';
import PurchaseOrderDetailsScreen from './PurchaseOrderDetailsScreen';
import LineSheetCreationScreen from './LineSheetCreationScreen';
import LineSheetsListScreen from './LineSheetsListScreen';
import ProductEditScreen from './ProductEditScreen';
import PartnerQuotationsScreen from './PartnerQuotationsScreen';
import QuotationDetailsScreen from './QuotationDetailsScreen';
import BuyerDashboard from './BuyerDashboard';
import BuyerWishlistScreen from './BuyerWishlistScreen';
import BuyerQuotationsScreen from './BuyerQuotationsScreen';
import BuyerQuotationDetailsScreen from './BuyerQuotationDetailsScreen';
import BuyerShipmentsScreen from './BuyerShipmentsScreen';
import BuyerPurchaseOrdersScreen from './BuyerPurchaseOrdersScreen';
import BuyerOrderDetailsScreen from './BuyerOrderDetailsScreen';
import { PortalConfigurationManager } from './PortalConfigurationManager';

interface AppRouterProps {
  state: ReturnType<typeof useAppState>;
  handlers: {
    handleBack: () => void;
    handleBackToHome: () => void;
    handleNavigateToItems: () => void;
    handleNavigateToScan: () => void;
    handleNavigateToSellers: () => void;
    handleNavigateToShipping: () => void;
    handleNavigateToPartnerDashboard: () => void;
    handleNavigateToShowroom: () => void;
    handleNavigateToPartnerQuotations: () => void;
    handleViewInShipping: () => void;
    handleRoleChange: (role: string) => void;
    [key: string]: any;  // Allow additional handlers
  };
  brands?: { id: string; name: string; }[];
  countries?: { id: string; name: string; }[];
  stores?: { id: string; name: string; code: string; countryId: string; brandId: string; }[];
}

/**
 * AppRouter component
 * Handles all screen routing based on currentScreen state
 * This keeps the main App.tsx clean and focused
 */
export function AppRouter({ state, handlers }: AppRouterProps) {
  const { currentScreen } = state;

  switch (currentScreen) {
    case 'home':
      return (
        <DeliveryHomeScreen
          onNavigateToShipping={handlers.handleNavigateToShipping}
          onNavigateToItems={handlers.handleNavigateToItems}
          onNavigateToScan={handlers.handleNavigateToScan}
          onNavigateToSellers={handlers.handleNavigateToSellers}
        />
      );

    case 'shipping':
      return (
        <ShippingScreen
          deliveries={state.deliveries}
          onSelectDelivery={(delivery) => {
            state.setSelectedDelivery(delivery);
            state.setCurrentScreen('receive');
          }}
          initialTab={state.shippingInitialTab}
          onBack={handlers.handleBack}
          onNavigateToHome={() => state.setCurrentScreen('home')}
          onNavigateToItems={handlers.handleNavigateToItems}
          onNavigateToScan={handlers.handleNavigateToScan}
          onNavigateToSellers={handlers.handleNavigateToSellers}
          currentUserRole={state.currentUserRole}
          partnerOrders={state.partnerOrders}
          deliveryNotes={state.deliveryNotes}
          returnDeliveries={state.returnDeliveries}
          showroomOrders={state.showroomOrders}
          sellpyOrders={state.sellpyOrders}
          currentPartnerId={state.currentPartnerWarehouseSelection?.partnerId}
          onSelectSellpyOrder={(order) => {
            state.setSelectedSellpyOrder(order);
            state.setCurrentScreen('sellpy-order-details');
          }}
          onOpenOrderDetails={(order) => {
            handlers.onViewOrder?.(order);
          }}
          onOpenShipmentDetails={(deliveryNote) => {
            handlers.onViewDeliveryNote?.(deliveryNote);
          }}
          onOpenReturnDetails={(returnDelivery) => {
            handlers.onViewReturnDelivery?.(returnDelivery);
          }}
          onViewShowroomOrder={(orderId) => {
            const order = state.showroomOrders.find(o => o.id === orderId);
            if (order) {
              state.setSelectedShowroomOrder(order);
              state.setCurrentScreen('purchase-order-details');
            }
          }}
          onUpdateReturnDeliveryStatus={(deliveryId, status) => {
            state.setReturnDeliveries(prev => prev.map(delivery =>
              delivery.id === deliveryId ? { ...delivery, status } : delivery
            ));
          }}
          onDeletePartnerOrder={(orderId) => {
            state.setPartnerOrders(prev => prev.filter(order => order.id !== orderId));
          }}
          onDeleteDeliveryNote={(deliveryNoteId) => {
            state.setDeliveryNotes(prev => prev.filter(note => note.id !== deliveryNoteId));
          }}
          brands={props.brands}
          countries={props.countries}
          stores={props.stores}
          currentStoreSelection={state.currentStoreSelection}
          isAdmin={props.isAdmin}
        />
      );

    case 'items':
      return (
        <ItemsScreen
          onBack={handlers.handleBack}
          onNavigateToHome={() => state.setCurrentScreen('home')}
          onNavigateToShipping={handlers.handleNavigateToShipping}
          onNavigateToScan={handlers.handleNavigateToScan}
          onNavigateToSellers={handlers.handleNavigateToSellers}
          userRole={state.currentUserRole}
        />
      );

    case 'scan':
      return (
        <ScanScreen
          onNavigateToHome={() => state.setCurrentScreen('home')}
          onNavigateToItems={handlers.handleNavigateToItems}
          onNavigateToSellers={handlers.handleNavigateToSellers}
          onNavigateToShipping={handlers.handleNavigateToShipping}
          onNavigateToReturns={() => state.setCurrentScreen('partner-selection')}
          userRole={state.currentUserRole}
        />
      );

    case 'sellers':
      return (
        <SellersScreen
          onBack={handlers.handleBack}
          onNavigateToHome={() => state.setCurrentScreen('home')}
          onNavigateToItems={handlers.handleNavigateToItems}
          onNavigateToScan={handlers.handleNavigateToScan}
          onNavigateToShipping={handlers.handleNavigateToShipping}
        />
      );

    case 'status-update':
      return (
        <StatusUpdateScreen
          onBack={handlers.handleBack}
          userRole={state.userRole}
          onStatusUpdate={handlers.handleStatusUpdate}
        />
      );

    case 'role-switcher':
      return (
        <div className="min-h-screen bg-surface">
          <div className="bg-surface-container border-b border-outline-variant">
            <div className="px-4 py-3">
              <div className="flex items-center gap-3">
                <h1 className="headline-small text-on-surface">Switch view</h1>
              </div>
            </div>
          </div>
          <div className="p-4">
            <RoleSwitcher
              currentRole={state.currentUserRole}
              onRoleChange={handlers.handleRoleChange}
            />
          </div>
        </div>
      );

    case 'partner-dashboard':
      return (
        <PartnerDashboard
          onBack={handlers.handleBack}
          onViewOrder={handlers.onViewOrder}
          onCreateOrder={() => state.setCurrentScreen('order-creation')}
          onViewDeliveryNote={handlers.onViewDeliveryNote}
          onViewReturnDelivery={handlers.onViewReturnDelivery}
        />
      );

    case 'portal-configuration':
      return <PortalConfigurationManager onBack={handlers.handleBack} />;

    case 'order-creation':
      const currentPartner = props.partners?.find(p => p.id === state.currentPartnerWarehouseSelection?.partnerId);
      const isThriftedPartner = currentPartner?.name === 'Thrifted';
      
      if (isThriftedPartner) {
        return (
          <ThriftedOrderCreationScreen
            onBack={() => state.setCurrentScreen('partner-dashboard')}
            onCreateOrder={(items, storeSelection, shouldRegister = false) => {
              // Create a new order with the items (always as pending, user can register later)
              const newOrder: import('./PartnerDashboard').ExtendedPartnerOrder = {
                id: `THR-ORD-${Date.now().toString().slice(-8)}`,
                status: 'pending', // Always create as pending, user can register after fixing errors
                createdDate: new Date().toISOString(),
                itemCount: items.length,
                boxCount: 0,
                partnerId: currentPartner?.id,
                partnerName: currentPartner?.name,
                receivingStoreId: storeSelection.storeId,
                receivingStoreName: props.stores?.find(s => s.id === storeSelection.storeId)?.name,
                warehouseId: state.currentPartnerWarehouseSelection?.warehouseId,
                warehouseName: props.warehouses?.find(w => w.id === state.currentPartnerWarehouseSelection?.warehouseId)?.name
              };
              
              state.setPartnerOrders(prev => [...prev, newOrder]);
              
              // Store order items for the order details screen
              // We need to store items in a way that can be accessed by OrderShipmentDetailsScreen
              // For now, we'll pass them through detailsScreenData
              const store = props.stores?.find(s => s.id === storeSelection.storeId);
              
              // Set up details screen data with order and items
              state.setDetailsScreenData({
                type: 'order',
                data: newOrder,
                storeName: store?.name,
                storeCode: store?.code,
                partnerName: currentPartner?.name,
                warehouseName: props.warehouses?.find(w => w.id === state.currentPartnerWarehouseSelection?.warehouseId)?.name,
                orderItems: items // Pass items to the details screen
              });
              
              // Navigate to order details screen so user can fix validation errors
              state.setCurrentScreen('order-shipment-details');
            }}
            currentPartner={currentPartner}
            brands={props.brands}
            countries={props.countries}
            stores={props.stores}
          />
        );
      }
      
      // Default order creation screen (for other partners if needed)
      return (
        <div className="min-h-screen bg-surface flex items-center justify-center">
          <div className="text-center">
            <p className="body-medium text-on-surface-variant">Order creation not available for this partner</p>
          </div>
        </div>
      );

    case 'order-details':
      return state.selectedSellpyOrder ? (
        <OrderDetailsScreen
          order={state.selectedSellpyOrder}
          onBack={() => {
            state.setCurrentScreen('shipping');
            state.setInitialShippingTab('orders');
          }}
          onItemScanned={(itemId, retailerItemId) => {
            // Update both selectedSellpyOrder and sellpyOrders
            const updatedItems = state.selectedSellpyOrder!.items.map(item =>
              item.itemId === itemId
                ? { ...item, retailerItemId, status: undefined }
                : item
            );
            
            const itemsWithRetailerIds = updatedItems.filter(item => item.retailerItemId).length;
            const totalItems = updatedItems.length;
            
            // Determine order status based on progress
            let orderStatus: 'pending' | 'in-progress' | 'completed' | 'registered' = 'in-progress';
            if (itemsWithRetailerIds === 0) {
              orderStatus = 'pending';
            } else if (itemsWithRetailerIds === totalItems && updatedItems.every(item => item.status !== 'error')) {
              orderStatus = 'completed';
            }
            
            const updatedOrder = {
              ...state.selectedSellpyOrder!,
              items: updatedItems,
              itemsWithRetailerIds,
              status: orderStatus
            };
            
            // Update selected order
            state.setSelectedSellpyOrder(updatedOrder);
            
            // Update main orders array
            state.setSellpyOrders(prev =>
              prev.map(order =>
                order.id === state.selectedSellpyOrder?.id
                  ? updatedOrder
                  : order
              )
            );
          }}
          onNavigateToScan={(itemId) => {
            state.setCurrentScreen('retailer-id-scan');
          }}
          onCompleteOrder={() => {
            if (state.selectedSellpyOrder) {
              state.setRegisteredOrderId(state.selectedSellpyOrder.id);
              state.setShowPostRegistrationDialog(true);
              state.setSellpyOrders(prev =>
                prev.map(order =>
                  order.id === state.selectedSellpyOrder?.id
                    ? { ...order, status: 'registered' }
                    : order
                )
              );
            }
          }}
          onRegisterOrder={() => {
            if (state.selectedSellpyOrder) {
              state.setRegisteredOrderId(state.selectedSellpyOrder.id);
              state.setShowPostRegistrationDialog(true);
              state.setSellpyOrders(prev =>
                prev.map(order =>
                  order.id === state.selectedSellpyOrder?.id
                    ? { ...order, status: 'registered' }
                    : order
                )
              );
            }
          }}
        />
      ) : (
        <div className="min-h-screen bg-surface flex items-center justify-center">
          <div className="text-center">
            <p className="body-medium text-on-surface-variant">No order selected</p>
          </div>
        </div>
      );

    case 'sellpy-order-details':
      return state.selectedSellpyOrder ? (
        <OrderDetailsScreen
          order={state.selectedSellpyOrder}
          onBack={handlers.handleBack}
          onItemScanned={(itemId, retailerItemId) => {
            // Update both selectedSellpyOrder and sellpyOrders
            const updatedItems = state.selectedSellpyOrder!.items.map(item =>
              item.itemId === itemId
                ? { ...item, retailerItemId, status: undefined }
                : item
            );
            
            const itemsWithRetailerIds = updatedItems.filter(item => item.retailerItemId).length;
            const totalItems = updatedItems.length;
            
            // Determine order status based on progress
            let orderStatus: 'pending' | 'in-progress' | 'completed' | 'registered' = 'in-progress';
            if (itemsWithRetailerIds === 0) {
              orderStatus = 'pending';
            } else if (itemsWithRetailerIds === totalItems && updatedItems.every(item => item.status !== 'error')) {
              orderStatus = 'completed';
            }
            
            const updatedOrder = {
              ...state.selectedSellpyOrder!,
              items: updatedItems,
              itemsWithRetailerIds,
              status: orderStatus
            };
            
            // Update selected order
            state.setSelectedSellpyOrder(updatedOrder);
            
            // Update main orders array
            state.setSellpyOrders(prev =>
              prev.map(order =>
                order.id === state.selectedSellpyOrder?.id
                  ? updatedOrder
                  : order
              )
            );
          }}
          onNavigateToScan={(itemId) => {
            state.setCurrentScreen('retailer-id-scan');
          }}
          onCompleteOrder={() => {
            if (state.selectedSellpyOrder) {
              state.setRegisteredOrderId(state.selectedSellpyOrder.id);
              state.setShowPostRegistrationDialog(true);
              state.setSellpyOrders(prev =>
                prev.map(order =>
                  order.id === state.selectedSellpyOrder?.id
                    ? { ...order, status: 'registered' }
                    : order
                )
              );
            }
          }}
          onRegisterOrder={() => {
            if (state.selectedSellpyOrder) {
              state.setRegisteredOrderId(state.selectedSellpyOrder.id);
              state.setShowPostRegistrationDialog(true);
              state.setSellpyOrders(prev =>
                prev.map(order =>
                  order.id === state.selectedSellpyOrder?.id
                    ? { ...order, status: 'registered' }
                    : order
                )
              );
            }
          }}
        />
      ) : (
        <div className="min-h-screen bg-surface flex items-center justify-center">
          <div className="text-center">
            <p className="body-medium text-on-surface-variant">No order selected</p>
          </div>
        </div>
      );

    case 'retailer-id-scan':
      // Get order data from detailsScreenData if available
      const orderData = state.detailsScreenData?.type === 'order' 
        ? state.detailsScreenData.data as import('./PartnerDashboard').PartnerOrder
        : null;
      
      // Generate mock items for the order
      const generateScanItems = (count: number): import('./OrderCreationScreen').OrderItem[] => {
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
          onBack={() => state.setCurrentScreen('order-shipment-details')}
          onComplete={(updatedItems) => {
            // Handle retailer ID scan completion - update items and go back
            state.setCurrentScreen('order-shipment-details');
          }}
          onRegisterOrder={() => {
            if (orderData) {
              // Update order status to registered
              const updatedPartnerOrders = state.partnerOrders.map(order =>
                order.id === orderData.id
                  ? { ...order, status: 'registered' as const }
                  : order
              );
              state.setPartnerOrders(updatedPartnerOrders);
              
              // Update detailsScreenData
              if (state.detailsScreenData) {
                state.setDetailsScreenData({
                  ...state.detailsScreenData,
                  data: { ...orderData, status: 'registered' as const }
                });
              }
              
              state.setCurrentScreen('order-shipment-details');
            }
          }}
          onCreateDeliveryNote={(orderId, items) => {
            // Navigate to delivery note creation screen
            state.setCurrentScreen('delivery-note-creation');
          }}
          onViewOrders={() => {
            // Navigate back to shipping screen with registered orders tab
            state.setShippingInitialTab('registered');
            state.setCurrentScreen('shipping');
          }}
          orderId={orderData?.id || ''}
          orderItems={scanOrderItems}
          receivingStore={state.detailsScreenData?.storeName}
          partnerName={state.detailsScreenData?.partnerName}
          orderStatus={orderData?.status === 'registered' ? 'registered' : 'pending'}
        />
      );

    case 'delivery-note-creation':
      const deliveryOrderData = state.detailsScreenData?.type === 'order' 
        ? state.detailsScreenData.data as import('./PartnerDashboard').PartnerOrder
        : null;
      
      if (!deliveryOrderData) {
        return (
          <div className="min-h-screen bg-surface flex items-center justify-center">
            <div className="text-center">
              <p className="body-medium text-on-surface-variant">No order selected</p>
            </div>
          </div>
        );
      }
      
      // Generate mock items for the order
      const deliveryOrderItems = Array.from({ length: deliveryOrderData.itemCount || 20 }, (_, index) => {
        const brands = ['WEEKDAY', 'COS', 'Monki', 'H&M'];
        const categories = ['Clothing', 'Shoes', 'Accessories'];
        const colors = ['Black', 'White', 'Blue', 'Red', 'Gray'];
        const sizes = ['XS', 'S', 'M', 'L', 'XL'];
        
        const price = parseFloat((Math.random() * 150 + 20).toFixed(2));
        const purchasePrice = parseFloat((price * (0.4 + Math.random() * 0.3)).toFixed(2));
        
        return {
          id: `item-${index + 1}`,
          itemId: `ITM-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          brand: brands[Math.floor(Math.random() * brands.length)],
          gender: Math.random() > 0.5 ? 'Women' : 'Men',
          category: categories[Math.floor(Math.random() * categories.length)],
          subcategory: 'Tops',
          size: sizes[Math.floor(Math.random() * sizes.length)],
          color: colors[Math.floor(Math.random() * colors.length)],
          price,
          purchasePrice,
          status: undefined,
          partnerItemId: `PID-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
          retailerItemId: Math.random() > 0.3 ? `RID-${Math.random().toString(36).substring(2, 8).toUpperCase()}` : undefined,
          source: 'api' as const
        };
      });
      
      return (
        <DeliveryNoteDetailsScreen
          onBack={() => {
            state.setCurrentScreen('partner-dashboard');
          }}
          orderId={deliveryOrderData.id}
          orderItems={deliveryOrderItems}
          onCreateDeliveryNote={(deliveryNote) => {
            // Add delivery note to state
            state.setDeliveryNotes(prev => [...prev, deliveryNote]);
            
            // Update order status to in-transit
            state.setPartnerOrders(prev =>
              prev.map(order =>
                order.id === deliveryOrderData.id
                  ? { ...order, status: 'in-transit' as const }
                  : order
              )
            );
            
            // Show success message
            toast.success('Delivery note registered successfully');
            
            // Navigate back to partner dashboard
            state.setCurrentScreen('partner-dashboard');
          }}
          receivingStore={
            deliveryOrderData.receivingStoreName
              ? {
                  name: deliveryOrderData.receivingStoreName,
                  code: deliveryOrderData.receivingStoreId || ''
                }
              : undefined
          }
          partnerName={deliveryOrderData.partnerName}
        />
      );

    // Add more cases as needed for other screens
    // This demonstrates the pattern - additional screens can be added similarly
    
    default:
      return (
        <DeliveryHomeScreen
          onNavigateToShipping={handlers.handleNavigateToShipping}
          onNavigateToItems={handlers.handleNavigateToItems}
          onNavigateToScan={handlers.handleNavigateToScan}
          onNavigateToSellers={handlers.handleNavigateToSellers}
        />
      );
  }
}
