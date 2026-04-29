import { useState, useMemo } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { StatusBadge } from './ui/status-badge';
import { QuickActionButton } from './ui/quick-action-button';
import { useIsListRowBumped } from './ui/list-row-card';
import { Settings, ChevronRight, ChevronDown as ChevronDownIcon, RotateCcw, Calendar, X, ClipboardList, ClipboardCheck, Truck, Package, Plus, BarChart3, Sparkles, CheckCircle2 } from 'lucide-react';
import type { Store, Brand } from './StoreSelector';
import { StoreLensLogo } from './StoreLensLogo';
import PartnerWarehouseSelector, { Partner as WarehousePartner, Warehouse, PartnerWarehouseSelection } from './PartnerWarehouseSelector';
import type { ReturnDelivery } from './ShippingScreen';
import type { DeliveryNote } from './BoxManagementScreen';

/** Calendar-day match in local timezone; supports `YYYY-MM-DD` and ISO datetimes. */
function isPartnerOrderCreatedToday(createdDate: string, now: Date = new Date()): boolean {
  const head = createdDate.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(head)) {
    const [y, m, d] = head.split('-').map(Number);
    return y === now.getFullYear() && m === now.getMonth() + 1 && d === now.getDate();
  }
  const t = new Date(createdDate);
  if (Number.isNaN(t.getTime())) return false;
  return (
    t.getFullYear() === now.getFullYear() &&
    t.getMonth() === now.getMonth() &&
    t.getDate() === now.getDate()
  );
}

export interface PartnerOrder {
  id: string;
  status: 'approval' | 'pending' | 'draft' | 'registered' | 'in-transit' | 'delivered' | 'in-review';
  createdDate: string;
  itemCount: number;
  boxCount: number;
  deliveryNote?: string;
  warehouseId?: string;
  warehouseName?: string;
}

export interface PartnerStats {
  pendingOrders: number;
  draftOrders?: number;
  registeredOrders: number;
  inTransitDeliveries: number;
  totalItemsThisMonth: number;
  inReviewOrders: number;
  approvalOrders?: number;
}

// Extended partner order interface with partner and store information
export interface ExtendedPartnerOrder extends PartnerOrder {
  partnerId?: string;
  partnerName?: string;
  receivingStoreId?: string;
  receivingStoreName?: string;
}

interface PartnerDashboardProps {
  onCreateOrder: () => void;
  onViewOrders: () => void;
  onViewRegisteredOrders?: () => void;
  onViewApprovalOrders?: () => void;
  onViewBoxes: () => void;
  onViewDeliveries?: () => void;
  onViewReturns: () => void;
  onAdminClick?: () => void;
  stats: PartnerStats;
  recentOrders: ExtendedPartnerOrder[];
  returnDeliveries?: ReturnDelivery[];
  deliveryNotes?: DeliveryNote[];
  brands: Brand[];
  stores: Store[];
  partners: WarehousePartner[];
  warehouses: Warehouse[];
  currentPartnerWarehouseSelection: PartnerWarehouseSelection;
  onPartnerWarehouseSelectionChange: (selection: PartnerWarehouseSelection) => void;
  currentUserRole: 'store-staff' | 'partner';
  onOpenOrderDetails?: (order: ExtendedPartnerOrder) => void;
  onNavigateToReports?: () => void;
}

export default function PartnerDashboard({
  onCreateOrder,
  onViewOrders,
  onViewRegisteredOrders,
  onViewApprovalOrders,
  onViewBoxes,
  onViewDeliveries,
  onViewReturns,
  onAdminClick,
  stats,
  recentOrders,
  returnDeliveries = [],
  deliveryNotes = [],
  brands,
  stores,
  partners,
  warehouses,
  currentPartnerWarehouseSelection,
  onPartnerWarehouseSelectionChange,
  currentUserRole,
  onOpenOrderDetails,
  onNavigateToReports
}: PartnerDashboardProps) {
  const [isPartnerWarehouseSelectorOpen, setIsPartnerWarehouseSelectorOpen] = useState(false);
  const isListRowBumped = useIsListRowBumped();

  // Get current partner/warehouse display name
  const getCurrentPartnerWarehouseDisplay = () => {
    if (!currentPartnerWarehouseSelection.partnerId) {
      return 'Select partner';
    }
    const currentPartner = partners.find(partner => partner.id === currentPartnerWarehouseSelection.partnerId);
    const currentWarehouse = warehouses.find(warehouse => warehouse.id === currentPartnerWarehouseSelection.warehouseId);
    
    if (currentPartner && currentWarehouse) {
      return `${currentPartner.name} - ${currentWarehouse.name}`;
    }
    if (currentPartner) {
      return currentPartner.name;
    }
    return 'Select Partner & Warehouse';
  };

  const handlePartnerWarehouseSelectionConfirm = (selection: PartnerWarehouseSelection) => {
    onPartnerWarehouseSelectionChange(selection);
  };

  // Lists and stats: scoped to selected partner + warehouse only (brand/store/country filters live on Orders & Shipments / Items)
  const selectedPartnerId = currentPartnerWarehouseSelection.partnerId;

  const getFilteredOrders = () => {
    const selectedWarehouseId = currentPartnerWarehouseSelection.warehouseId;

    return recentOrders.filter(order => {
      const matchesPartner = !selectedPartnerId || order.partnerId === selectedPartnerId;
      const matchesWarehouse = !selectedWarehouseId || order.warehouseId === selectedWarehouseId;
      return matchesPartner && matchesWarehouse;
    });
  };

  const getFilteredDeliveryNotes = () => {
    if (!deliveryNotes.length) {
      return [];
    }

    const selectedWarehouseId = currentPartnerWarehouseSelection.warehouseId;

    return deliveryNotes.filter(note => {
      const matchesPartner = !selectedPartnerId || note.partnerId === selectedPartnerId;
      const matchesWarehouse = !selectedWarehouseId || note.warehouseId === selectedWarehouseId;
      return matchesPartner && matchesWarehouse;
    });
  };

  // Calculate filtered stats from orders for the selected partner + warehouse
  const getFilteredStats = (): PartnerStats => {
    if (!selectedPartnerId) {
      return stats;
    }
    const filteredOrders = getFilteredOrders();
    
    return {
      pendingOrders: filteredOrders.filter(order => order.status === 'pending').length,
      draftOrders: filteredOrders.filter(order => order.status === 'draft').length,
      registeredOrders: filteredOrders.filter(order => order.status === 'registered').length,
      inTransitDeliveries: filteredOrders.filter(order => order.status === 'in-transit').length,
      totalItemsThisMonth: filteredOrders.reduce((sum, order) => sum + order.itemCount, 0),
      inReviewOrders: filteredOrders.filter(order => order.status === 'in-review').length,
      approvalOrders: filteredOrders.filter(order => order.status === 'approval').length
    };
  };

  const filteredStats = getFilteredStats();
  const filteredOrders = getFilteredOrders();
  const todaysOrdersForList = useMemo(() => {
    const wid = currentPartnerWarehouseSelection.warehouseId;
    return recentOrders
      .filter((order) => {
        const matchesPartner = !selectedPartnerId || order.partnerId === selectedPartnerId;
        const matchesWarehouse = !wid || order.warehouseId === wid;
        return matchesPartner && matchesWarehouse;
      })
      .filter((o) => isPartnerOrderCreatedToday(o.createdDate))
      .filter((o) => !(currentUserRole === 'partner' && o.status === 'approval'));
  }, [recentOrders, selectedPartnerId, currentPartnerWarehouseSelection.warehouseId, currentUserRole]);
  const filteredDeliveryNotes = getFilteredDeliveryNotes();
  const currentPartner = partners.find(partner => partner.id === currentPartnerWarehouseSelection.partnerId);
  const currentWarehouse = warehouses.find(warehouse => warehouse.id === currentPartnerWarehouseSelection.warehouseId);
  const currentPartnerName = currentPartner?.name ?? '';
  const isChinesePartner = currentPartnerName === 'Shenzhen Fashion Manufacturing';
  const isThriftedOrSellpyPartner = ['Thrifted', 'Sellpy', 'Sellpy Operations'].some(name => currentPartnerName.includes(name));
  const isThriftedPartner = currentPartnerName.includes('Thrifted');
  /** Sellpy / API-driven partners — orders are not created manually in the portal (only Thrifted can). */
  const isSellpyPartner = !isThriftedPartner && currentPartnerName.includes('Sellpy');
  const partnerCanManuallyCreateOrder = isThriftedPartner;
  const isThriftedCopenhagenHub = isThriftedPartner && currentWarehouse?.name === 'Thrifted Copenhagen Hub';
  const pendingOrdersCount = filteredStats.pendingOrders;
  const draftOrdersCount = filteredStats.draftOrders ?? 0;
  const activeShipmentsCount = filteredStats.inTransitDeliveries;
  const registeredOrdersCount = filteredStats.registeredOrders;
  const approvalOrdersCount = filteredStats.approvalOrders || 0;
  const relevantReturnDeliveries = returnDeliveries.filter(delivery => {
    const matchesPartner = !currentPartnerWarehouseSelection.partnerId || delivery.partnerId === currentPartnerWarehouseSelection.partnerId;
    const matchesWarehouse = !currentPartnerWarehouseSelection.warehouseId || delivery.warehouseId === currentPartnerWarehouseSelection.warehouseId;
    return matchesPartner && matchesWarehouse;
  });
  const inTransitReturnCount = relevantReturnDeliveries.filter(delivery => delivery.status === 'In transit').length;
  const ordersNeedingAttentionCount = isThriftedPartner ? draftOrdersCount : pendingOrdersCount;
  const pendingOrdersLabel = isThriftedPartner
    ? `${draftOrdersCount} draft ${draftOrdersCount === 1 ? 'order' : 'orders'}`
    : `${pendingOrdersCount} pending ${pendingOrdersCount === 1 ? 'order' : 'orders'}`;
  const approvalOrdersLabel = `${approvalOrdersCount} ${approvalOrdersCount === 1 ? 'order' : 'orders'} awaiting approval`;
  const inTransitReturnsLabel = `${inTransitReturnCount} in transit ${inTransitReturnCount === 1 ? 'return' : 'returns'}`;
  const deliveriesToCompleteCount = filteredDeliveryNotes.filter(note => note.status === 'draft' || note.status === 'packing').length;
  const deliveriesToCompleteLabel = `${deliveriesToCompleteCount} ${deliveriesToCompleteCount === 1 ? 'delivery' : 'deliveries'} to complete`;
  const activeShipmentsLabel = `${activeShipmentsCount} active ${activeShipmentsCount === 1 ? 'shipment' : 'shipments'}`;
  const showPendingOrdersAction = ordersNeedingAttentionCount > 0;
  const showApprovalOrdersAction = approvalOrdersCount > 0;
  const canShowApprovalOrdersAction = currentUserRole !== 'partner' && showApprovalOrdersAction;
  const showRegisteredOrdersAction = registeredOrdersCount > 0;
  const showReturnsAction = inTransitReturnCount > 0;
  const showDeliveriesAction = deliveriesToCompleteCount > 0;
  const showActiveShipmentsAction = activeShipmentsCount > 0;
  const thriftedHasActionableQuickActions = canShowApprovalOrdersAction || showPendingOrdersAction || showRegisteredOrdersAction || showDeliveriesAction || showReturnsAction;
  const otherPartnersHaveActionableQuickActions = canShowApprovalOrdersAction || showPendingOrdersAction || showActiveShipmentsAction || showReturnsAction || showDeliveriesAction;
  /** Thrifted/Sellpy quick-actions empty card with primary CTA (same screen as Today's orders). */
  const showThriftedSellpyQuickActionsEmpty = Boolean(onNavigateToReports && !thriftedHasActionableQuickActions);
  /** Avoid two Create-order buttons when Today's orders is also empty for Thrifted. */
  const hideTodaysOrdersCreateButtonThrifted = isThriftedPartner && showThriftedSellpyQuickActionsEmpty;
  const quickActionEmptyStateTitle = currentPartnerName ? `${currentPartnerName} is all set` : "You're all set";
  const quickActionEmptyStateDescription = isThriftedPartner
    ? 'No actions needed right now. Create a new Thrifted order whenever you are ready.'
    : isSellpyPartner
      ? 'No actions need attention right now. New orders will appear when they are received from your integration.'
      : 'No partner actions need attention right now. Start a new order whenever you are ready.';
  const quickActionEmptyStateButtonLabel = isThriftedPartner ? 'Create Thrifted order' : 'Create new order';
  const quickActionEmptyStateButtonLabelWithOverride = isThriftedCopenhagenHub ? 'Create order' : quickActionEmptyStateButtonLabel;


  return (
    <div className="min-h-screen bg-surface">
      {/* Mobile Header - Full header with logo and selector */}
      <div className="w-full bg-surface border-b border-outline-variant md:hidden">
        {/* Header Content */}
        <div className="px-4 md:px-6 py-3">
          {/* Top Row: Logo, Admin Icon */}
          <div className="flex items-center justify-between mb-4">
            {/* Spacer to balance layout */}
            <div className="w-10" />
            
            {/* Centered Logo */}
            <div className="flex flex-col items-center">
              <StoreLensLogo className="mb-1" />
              <div className="label-large text-on-surface tracking-wider uppercase">
                {currentUserRole === 'partner' ? 'Partner portal' : 'Resell'}
              </div>
            </div>
            
            {/* Admin Settings Icon */}
            <button
              onClick={onAdminClick}
              className="inline-flex items-center justify-center p-2 rounded-full hover:bg-surface-container-high transition-colors min-h-[48px] min-w-[48px] md:min-h-[40px] md:min-w-[40px] touch-manipulation"
              aria-label="Admin Settings"
            >
              <Settings className="h-6 w-6 text-on-surface-variant" />
            </button>
          </div>
          
          {/* Partner/Warehouse Selector Row */}
          <div className="flex justify-center">
            <button
              onClick={() => setIsPartnerWarehouseSelectorOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-surface-container-high transition-colors"
            >
              <span className="title-medium text-on-surface">{getCurrentPartnerWarehouseDisplay()}</span>
              <ChevronDownIcon className="h-4 w-4 text-on-surface-variant" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Desktop Header - Logo and selector, positioned below top nav */}
      <div className="hidden md:flex flex-col items-center px-6 py-4 bg-surface" style={{ marginTop: '4rem' }}>
        {/* Logo */}
        <div className="flex flex-col items-center mb-3">
          <StoreLensLogo className="mb-1" />
          <div className="label-large text-on-surface tracking-wider uppercase">
            {currentUserRole === 'partner' ? 'Partner portal' : 'Resell'}
          </div>
        </div>
        
        {/* Partner/Warehouse Selector */}
        <button
          onClick={() => setIsPartnerWarehouseSelectorOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-surface-container-high transition-colors"
        >
          <span className="title-medium text-on-surface">{getCurrentPartnerWarehouseDisplay()}</span>
          <ChevronDownIcon className="h-4 w-4 text-on-surface-variant" />
        </button>
      </div>

      {/* Main Content Container */}
      <div className="w-full">
        {/* Main Content */}
        <div className="px-4 md:px-6 pt-6 pb-8 space-y-8 max-w-5xl mx-auto w-full">
        {/* Quick Actions */}
        {isThriftedOrSellpyPartner ? (
          <div>
            <h2 className="title-medium text-on-surface mb-4">Quick actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {canShowApprovalOrdersAction && (
                <QuickActionButton
                  onClick={onViewApprovalOrders}
                  iconWrapperClassName=""
                  iconWrapperStyle={{ backgroundColor: '#ffebee' }}
                  icon={<CheckCircle2 className="w-5 h-5" style={{ color: '#c62828' }} />}
                  title="Orders to approve"
                  description={approvalOrdersLabel}
                />
              )}

              {showPendingOrdersAction && (
                <QuickActionButton
                  onClick={onViewOrders}
                  iconWrapperClassName="bg-primary-container"
                  icon={<ClipboardList className="w-5 h-5 text-on-primary-container" />}
                  title="Orders to process"
                  description={pendingOrdersLabel}
                />
              )}

              {showRegisteredOrdersAction && (
                <QuickActionButton
                  onClick={onViewRegisteredOrders ?? onViewOrders}
                  iconWrapperClassName="bg-surface-container-highest"
                  icon={<Package className="w-5 h-5 text-on-surface-variant" />}
                  title="Orders to pack"
                  description={
                    <>
                      {registeredOrdersCount} ready for packaging {registeredOrdersCount === 1 ? 'order' : 'orders'}
                    </>
                  }
                />
              )}

              {showDeliveriesAction && (
                <QuickActionButton
                  onClick={onViewDeliveries ?? onViewBoxes}
                  iconWrapperClassName="bg-secondary-container"
                  icon={<ClipboardCheck className="w-5 h-5 text-on-secondary-container" />}
                  title="Deliveries to complete"
                  description={deliveriesToCompleteLabel}
                />
              )}

              {showReturnsAction && (
                <QuickActionButton
                  onClick={onViewReturns}
                  iconWrapperClassName="bg-tertiary-container"
                  icon={<RotateCcw className="w-5 h-5 text-on-tertiary-container" />}
                  title="Mark as returned"
                  description={inTransitReturnsLabel}
                />
              )}

            </div>

            {showThriftedSellpyQuickActionsEmpty && (
              <div className="mt-4 p-4 bg-surface-container-high border border-dashed border-outline-variant rounded-lg text-center flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="title-small text-on-surface mb-1">{quickActionEmptyStateTitle}</p>
                  <p className="body-small text-on-surface-variant">{quickActionEmptyStateDescription}</p>
                </div>
                {partnerCanManuallyCreateOrder && (
                  <Button
                    variant="outline"
                    className="inline-flex items-center justify-center gap-2"
                    onClick={() => onCreateOrder()}
                  >
                    <Plus size={16} />
                    {quickActionEmptyStateButtonLabelWithOverride}
                  </Button>
                )}
              </div>
            )}

            {onNavigateToReports && (
              <QuickActionButton
                onClick={onNavigateToReports}
                iconWrapperClassName=""
                iconWrapperStyle={{ backgroundColor: '#dbeafe' }}
                icon={<BarChart3 className="w-5 h-5 text-on-surface" />}
                title="View reports"
                description="Sales & Stock analytics"
                className="mt-4 w-full"
              />
            )}
          </div>
        ) : (
          <div>
            <h2 className="title-medium text-on-surface mb-4">Quick actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Chinese Partner Quick Actions */}
              {isChinesePartner ? (
                <>
                  {/* Chinese Partner Quick Actions - placeholder */}
                </>
              ) : (
                <>
                  {/* Regular Partner Quick Actions */}
                  {canShowApprovalOrdersAction && (
                    <QuickActionButton
                      onClick={onViewApprovalOrders}
                      iconWrapperClassName=""
                      iconWrapperStyle={{ backgroundColor: '#ffebee' }}
                      icon={<CheckCircle2 className="w-5 h-5" style={{ color: '#c62828' }} />}
                      title="Orders to approve"
                      description={approvalOrdersLabel}
                    />
                  )}

                  {showPendingOrdersAction && (
                    <QuickActionButton
                      onClick={onViewOrders}
                      iconWrapperClassName="bg-primary-container"
                      icon={<ClipboardList className="w-5 h-5 text-on-primary-container" />}
                      title="Orders to process"
                      description={pendingOrdersLabel}
                    />
                  )}

                  {showActiveShipmentsAction && (
                    <QuickActionButton
                      onClick={onViewBoxes}
                      iconWrapperClassName="bg-secondary-container"
                      icon={<Truck className="w-5 h-5 text-on-secondary-container" />}
                      title="Active shipments"
                      description={activeShipmentsLabel}
                    />
                  )}

                  {showDeliveriesAction && (
                    <QuickActionButton
                      onClick={onViewDeliveries ?? onViewBoxes}
                      iconWrapperClassName="bg-secondary-container"
                      icon={<ClipboardCheck className="w-5 h-5 text-on-secondary-container" />}
                      title="Deliveries to complete"
                      description={deliveriesToCompleteLabel}
                    />
                  )}

                  {showReturnsAction && (
                    <QuickActionButton
                      onClick={onViewReturns}
                      iconWrapperClassName="bg-tertiary-container"
                      icon={<RotateCcw className="w-5 h-5 text-on-tertiary-container" />}
                      title="Return deliveries"
                      description={inTransitReturnsLabel}
                    />
                  )}

                  {/* Reports */}
                  {onNavigateToReports && (
                    <QuickActionButton
                      onClick={onNavigateToReports}
                      iconWrapperClassName=""
                      iconWrapperStyle={{ backgroundColor: '#dbeafe' }}
                      icon={<BarChart3 className="w-5 h-5 text-on-surface" />}
                      title="View reports"
                      description="Sales & Stock analytics"
                    />
                  )}

                </>
              )}
            </div>
            {!isChinesePartner && onNavigateToReports && !otherPartnersHaveActionableQuickActions && (
              <div className="mt-4 border border-dashed border-outline-variant rounded-lg bg-surface-container-high p-4 text-center flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="title-small text-on-surface mb-1">{quickActionEmptyStateTitle}</p>
                  <p className="body-small text-on-surface-variant">{quickActionEmptyStateDescription}</p>
                </div>
                <Button
                  variant="outline"
                  className="inline-flex items-center justify-center gap-2"
                  onClick={() => onCreateOrder()}
                >
                  <Plus size={16} />
                  {quickActionEmptyStateButtonLabel}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Today's orders (incoming orders for the selected partner + warehouse) */}
        {!isChinesePartner && (
          <Card className="bg-transparent border border-outline-variant shadow-none">
            <CardHeader>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <CardTitle className="title-medium">Today&apos;s orders</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onViewOrders}
                  className="body-small shrink-0"
                >
                  View orders
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {todaysOrdersForList.length === 0 ? (
                <div className="text-center py-8">
                  <Package size={48} className="mx-auto text-on-surface-variant/50 mb-4" />
                  <p className="body-large text-on-surface-variant">No orders today</p>
                  <p className="body-medium text-on-surface-variant">Older orders are available in Orders &amp; Shipments.</p>
                  {partnerCanManuallyCreateOrder && !hideTodaysOrdersCreateButtonThrifted && (
                    <div className="mt-4 flex justify-center">
                      <Button onClick={() => onCreateOrder()} className="inline-flex items-center justify-center gap-2">
                        <Plus size={16} />
                        Create order
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {todaysOrdersForList.map(order => (
                    <Card
                      key={order.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => onOpenOrderDetails?.(order)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          onOpenOrderDetails?.(order);
                        }
                      }}
                      style={isListRowBumped ? { minHeight: '112px' } : undefined}
                      className="p-4 border-outline-variant bg-surface-container hover:bg-surface-container-high transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className={`${isListRowBumped ? 'title-medium' : 'title-small'} text-on-surface mb-1`}>{order.id}</div>
                          <div className={`${isListRowBumped ? 'body-medium' : 'body-small'} text-on-surface-variant`}>{order.itemCount} items • {order.boxCount} boxes</div>
                          <div className={`${isListRowBumped ? 'body-medium' : 'body-small'} text-on-surface-variant`}>Created {order.createdDate}</div>
                          {(() => {
                            const receivingStore = stores.find(store => store.id === order.receivingStoreId);
                            const brandName = receivingStore
                              ? brands.find(brand => brand.id === receivingStore.brandId)?.name
                              : undefined;
                            if (!order.receivingStoreName && !receivingStore && !brandName) {
                              return null;
                            }
                            const name = order.receivingStoreName || receivingStore?.name;
                            const code = receivingStore?.code || order.receivingStoreId;
                            if (!name && !code && !brandName) {
                              return null;
                            }
                            return (
                              <div className={`${isListRowBumped ? 'body-medium' : 'body-small'} text-on-surface-variant`}>
                                To: {brandName && <span className="font-medium text-on-surface">{brandName}</span>}
                                {brandName && (name || code) ? ' • ' : ''}
                                {name || 'Unknown store'}
                                {code && <span className="ml-1">({code})</span>}
                              </div>
                            );
                          })()}
                        </div>
                        <StatusBadge status={order.status} />
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
        </div>
      </div>

      {/* Partner/Warehouse Selector Modal */}
      <PartnerWarehouseSelector
        isOpen={isPartnerWarehouseSelectorOpen}
        onClose={() => setIsPartnerWarehouseSelectorOpen(false)}
        onConfirm={handlePartnerWarehouseSelectionConfirm}
        partners={partners}
        warehouses={warehouses}
        currentSelection={currentPartnerWarehouseSelection}
      />
    </div>
  );
}