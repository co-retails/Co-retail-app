import { useState, useEffect, useRef } from 'react';
import { Package, Truck, Search, ChevronRight, RotateCcw, CheckIcon, ClockIcon, Trash2, FilterIcon, MoreVertical, ArrowUp, ArrowDown, Plus, X } from 'lucide-react';
import { UserRole } from './RoleSwitcher';
import type { ExtendedPartnerOrder } from './PartnerDashboard';
import { DeliveryNote } from './BoxManagementScreen';
import { ReturnItem } from './ReturnManagementScreen';
import { OrderItem } from './OrderCreationScreen';
import StoreFilterBottomSheet, { ViewFilter } from './StoreFilterBottomSheet';
import { Button } from './ui/button';
import { useMediaQuery } from './ui/use-mobile';
import { ListRowCard, useListRowFonts } from './ui/list-row-card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import type { Store as StoreRecord, Country as CountryRecord, Brand as BrandRecord } from './StoreSelector';
import type { Warehouse } from './PartnerWarehouseSelector';
import type { SetStateAction, MouseEvent as ReactMouseEvent, KeyboardEvent as ReactKeyboardEvent, ChangeEvent } from 'react';

type ShippingPartnerOrder = ExtendedPartnerOrder & {
  externalOrderId?: string;
  orderValue?: number;
  salesMargin?: number;
};

type DeliveryNoteStatus = DeliveryNote['status'];
type ShippingTab = 'shipments' | 'returns' | 'all' | 'pending' | 'in-transit' | 'delivered' | 'pending-registered';
type OrderStatusFilter = 'approval' | 'pending' | 'draft' | 'registered' | 'in-transit' | 'all';
type ShipmentStatusFilter = 'packing' | 'in-transit' | 'delivered' | 'all';
type ReturnStatusFilter = 'in-transit' | 'returned' | 'all';
type ShippingUserRole = UserRole | 'admin' | 'store-manager';

export interface SellpyOrder {
  id: string;
  createdDate: string;
  status: 'pending' | 'in-progress' | 'completed' | 'registered';
  totalItems: number;
  itemsWithRetailerIds: number;
  receivingStore: string;
  storeCode?: string;
  brandId?: string;
  countryId?: string;
  storeId?: string;
  items: OrderItem[];
}

export interface Delivery {
  id: string;
  date: string;
  status: 'Draft' | 'Packing' | 'In transit' | 'Delivered' | 'Partially Delivered' | 'Cancelled' | 'Rejected';
  deliveryId: string;
  orders: number;
  items: number;
  boxes: number;
  sender: string;
  cancellationReason?: 'Missing delivery';
  partnerId?: string;
  partnerName?: string;
  warehouseId?: string;
  warehouseName?: string;
  receivingStoreId?: string;
  shippingLabel?: string;
}

export interface ReturnDelivery {
  id: string;
  date: string;
  status: 'Pending' | 'In transit' | 'Returned' | 'Cancelled';
  deliveryId: string;
  items: number;
  boxes: number;
  storeName: string;
  storeCode: string;
  partnerId: string;
  partnerName: string;
  storeId?: string;
  warehouseId?: string;
  warehouseName?: string;
  cancellationReason?: string;
}

export interface StoreSelection {
  brandId: string;
  countryId: string;
  storeId: string;
}

interface ShippingScreenProps {
  deliveries: Delivery[];
  onSelectDelivery: (delivery: Delivery) => void;
  onBack: () => void;
  onNavigateToHome?: () => void;
  onNavigateToItems?: () => void;
  onNavigateToScan?: () => void;
  onNavigateToSellers?: () => void;
  onScanBox?: () => void;
  initialTab?: 'shipments' | 'returns' | 'all' | 'pending' | 'in-transit' | 'delivered' | 'registered' | 'orders' | 'pending-registered' | 'pending-packing' | 'approval' | 'returns-returned' | 'returns-in-transit' | 'pending-pending' | 'pending-draft' | 'in-transit-filter';
  currentUserRole?: ShippingUserRole;
  partnerOrders?: ShippingPartnerOrder[];
  deliveryNotes?: DeliveryNote[];
  returnItems?: ReturnItem[];
  returnDeliveries?: ReturnDelivery[];
  currentPartnerId?: string;
  currentWarehouseId?: string;
  onSelectSellpyOrder?: (order: SellpyOrder) => void;
  onUpdateReturnDeliveryStatus?: (deliveryId: string, status: 'Returned') => void;
  onCancelReturn?: (deliveryId: string, reason?: string) => void;
  onOpenOrderDetails?: (order: ShippingPartnerOrder, activeTab?: ShippingTab, activeFilter?: string) => void;
  onOpenShipmentDetails?: (deliveryNote: DeliveryNote, activeTab?: ShippingTab, activeFilter?: string) => void;
  onOpenReturnDetails?: (returnDelivery: ReturnDelivery, activeTab?: ShippingTab, activeFilter?: string) => void;
  sellpyOrders?: SellpyOrder[];
  brands?: BrandRecord[];
  countries?: CountryRecord[];
  stores?: StoreRecord[];
  warehouses?: Warehouse[];
  onCreateDeliveryNoteForOrder?: (orderId: string) => void;
  currentStoreSelection?: StoreSelection;
  isAdmin?: boolean;
  onDeletePartnerOrder?: (orderId: string) => void;
  onDeleteDeliveryNote?: (deliveryNoteId: string) => void;
  onCreateOrder?: () => void;
  // Shared filter state for partner portal (optional - only used when currentUserRole is 'partner')
  viewFilter?: ViewFilter;
  onViewFilterChange?: (filter: ViewFilter) => void;
}

const getDeliveryNoteStatusDisplay = (status: DeliveryNoteStatus) => {
  switch (status) {
    case 'draft':
      return 'Draft';
    case 'packing':
      return 'Packing';
    case 'registered':
      return 'In Transit';
    case 'delivered':
      return 'Delivered';
    case 'partially-delivered':
      return 'Partially Delivered';
    case 'cancelled':
      return 'Cancelled';
    case 'rejected':
      return 'Rejected';
    default:
      return status;
  }
};

const getDeliveryNoteStatusBadgeColor = (status: DeliveryNoteStatus) => {
  switch (status) {
    case 'draft':
      return 'bg-surface-container-high text-on-surface-variant';
    case 'packing':
    case 'registered':
      return 'bg-primary-container text-on-primary-container';
    case 'delivered':
      return 'bg-success-container text-on-success-container';
    case 'partially-delivered':
      return 'bg-warning-container text-on-warning-container';
    case 'cancelled':
    case 'rejected':
      return 'bg-error-container text-on-error-container';
    default:
      return 'bg-surface-container-high text-on-surface-variant';
  }
};

/** True when delivery is In transit (status registered) and has been so for more than 10 days. */
const isDeliveryNoteInTransitOver10Days = (note: DeliveryNote): boolean => {
  if (note.status !== 'registered') return false;
  const fromDate = note.shipmentDate || note.createdDate;
  if (!fromDate) return false;
  const from = new Date(fromDate);
  const now = new Date();
  const daysMs = now.getTime() - from.getTime();
  const days = Math.floor(daysMs / (1000 * 60 * 60 * 24));
  return days > 10;
};

const resolveDeliveryNoteParties = (
  deliveryNote: DeliveryNote,
  orders: ShippingPartnerOrder[],
  stores?: StoreRecord[],
  brands?: BrandRecord[],
  warehouses?: Warehouse[]
) => {
  const primaryOrder = orders[0];
  const resolvedStoreId = primaryOrder?.receivingStoreId || deliveryNote.storeId;
  const storeRecord = resolvedStoreId ? stores?.find(store => store.id === resolvedStoreId) : undefined;
  const storeName = primaryOrder?.receivingStoreName || storeRecord?.name;
  const brandName = storeRecord ? brands?.find(brand => brand.id === storeRecord.brandId)?.name : undefined;
  const storeCode = storeRecord?.code || deliveryNote.storeCode;
  const receiverFromBrand = [brandName, storeCode].filter(Boolean).join(' ').trim();
  const receiver = receiverFromBrand || storeName || deliveryNote.storeCode || '-';
  const storeNameDisplay = receiverFromBrand && storeName && receiver !== storeName ? storeName : undefined;

  const resolvedWarehouseId = primaryOrder?.warehouseId || deliveryNote.warehouseId;
  const warehouseRecord = resolvedWarehouseId ? warehouses?.find(warehouse => warehouse.id === resolvedWarehouseId) : undefined;
  const warehouse = primaryOrder?.warehouseName || deliveryNote.warehouseName || warehouseRecord?.name;

  const sender = primaryOrder?.partnerName || deliveryNote.partnerName;

  return { sender, warehouse, receiver, storeNameDisplay };
};

function countItemsInBoxes(deliveryNote: DeliveryNote): number {
  return (
    deliveryNote.boxes?.reduce((sum, box) => {
      const arr = box.items ?? [];
      return sum + arr.filter(i => i.status !== 'removed').length;
    }, 0) ?? 0
  );
}

/** After the delivery is registered (shipped), list item count reflects packed lines only. */
function deliveryNoteUsesBoxedItemCount(status: DeliveryNote['status']): boolean {
  return (
    status === 'registered' ||
    status === 'delivered' ||
    status === 'partially-delivered' ||
    status === 'cancelled' ||
    status === 'rejected'
  );
}

/**
 * Shipment list counts: prefer orders with `deliveryNote` matching the note id (legacy/mock),
 * else match `order.id` to `deliveryNote.orderId`. Item count: order size until register, then lines in boxes.
 */
function getDeliveryNoteShipmentCounts(
  deliveryNote: DeliveryNote,
  partnerOrders: ShippingPartnerOrder[],
): {
  relatedOrdersForParties: ShippingPartnerOrder[];
  orderCount: number;
  itemCount: number;
} {
  const byDeliveryNoteId = partnerOrders.filter(o => o.deliveryNote === deliveryNote.id);
  const relatedOrdersForParties =
    byDeliveryNoteId.length > 0
      ? byDeliveryNoteId
      : partnerOrders.filter(o => o.id === deliveryNote.orderId);

  const orderCount =
    relatedOrdersForParties.length > 0
      ? relatedOrdersForParties.length
      : deliveryNote.orderId
        ? 1
        : 0;

  const orderItemSum = relatedOrdersForParties.reduce((s, o) => s + (o.itemCount || 0), 0);
  const itemsInBoxes = countItemsInBoxes(deliveryNote);

  const itemCount = deliveryNoteUsesBoxedItemCount(deliveryNote.status)
    ? itemsInBoxes
    : orderItemSum > 0
      ? orderItemSum
      : itemsInBoxes;

  return {
    relatedOrdersForParties,
    orderCount,
    itemCount,
  };
}

const resolveReturnDeliveryParties = (
  returnDelivery: ReturnDelivery,
  stores?: StoreRecord[],
  brands?: BrandRecord[],
  warehouses?: Warehouse[]
) => {
  const storeRecord =
    (returnDelivery.storeId && stores?.find(store => store.id === returnDelivery.storeId)) ||
    stores?.find(store => store.code === returnDelivery.storeCode);
  const brand = storeRecord ? brands?.find(b => b.id === storeRecord.brandId) : undefined;
  const storeCode = storeRecord?.code || returnDelivery.storeCode;
  const storeNameDisplay = storeRecord?.name || returnDelivery.storeName;
  const senderBase = [brand?.name, storeCode].filter(Boolean).join(' ').trim();
  const sender = senderBase || storeNameDisplay || '-';

  const warehouseRecord = returnDelivery.warehouseId
    ? warehouses?.find(warehouse => warehouse.id === returnDelivery.warehouseId)
    : undefined;
  const warehouseName = returnDelivery.warehouseName || warehouseRecord?.name || '';
  const receiverParts = [returnDelivery.partnerName, warehouseName].filter(Boolean);
  const receiver = receiverParts.length > 0 ? receiverParts.join(' • ') : returnDelivery.partnerName || warehouseName || '-';

  return { sender, storeNameDisplay, receiver, warehouseName };
};


function Tabs({ activeTab, onTabChange, userRole }: { 
  activeTab: ShippingTab; 
  onTabChange: (tab: ShippingTab) => void;
  userRole?: ShippingUserRole;
}) {
  const tabs: Array<{ id: ShippingTab; label: string }> = userRole === 'partner'
    ? [
        { id: 'pending', label: 'Orders' },
        { id: 'in-transit', label: 'Shipments' },
        { id: 'returns', label: 'Returns' }
      ]
    : [
        { id: 'shipments', label: 'Inbound' },
        { id: 'returns', label: 'Returns' },
        { id: 'all', label: 'All' }
      ];

  return (
    <div className="bg-surface w-full mb-4">
      <div className="flex border-b border-outline-variant overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className="flex-1 md:flex-none pb-3 pt-2 px-4 md:px-6 relative whitespace-nowrap"
            onClick={() => onTabChange(tab.id)}
          >
            <div className={`title-small text-center md:text-left ${
              activeTab === tab.id ? 'text-on-surface' : 'text-on-surface-variant'
            }`}>
              {tab.label}
            </div>
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-2 md:left-4 right-2 md:right-4 h-0.5 bg-primary rounded-full" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function DeliveryItem({ delivery, onSelect }: { delivery: Delivery; onSelect: () => void }) {
  const fonts = useListRowFonts();
  const getStatusBadgeClass = (status: Delivery['status']) => {
    if (status === 'Delivered') {
      return 'bg-success-container text-on-success-container';
    }
    return 'bg-surface-container-high text-on-surface';
  };

  return (
    <button
      className="w-full bg-surface-container hover:bg-surface-container-high transition-colors text-left"
      onClick={onSelect}
    >
      {/* M3 Three-line List Item - matching other screens pattern */}
      <ListRowCard>

        {/* Leading Element - Delivery Icon */}
        <div className="flex-shrink-0 w-10 h-10 bg-surface-container rounded-full flex items-center justify-center">
          <Package className="w-5 h-5 text-on-surface-variant" />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Top Line - Date and Status in smallest font (consistent with other screens) */}
          <div className={`${fonts.tinyText} font-medium text-on-surface-variant leading-tight tracking-[0.5px] mb-0.5 flex items-center gap-1 flex-nowrap whitespace-nowrap`}>
            <span>{delivery.date},</span>
            <span className={`${fonts.tinyText} font-semibold px-2 py-0.5 rounded-full ${getStatusBadgeClass(delivery.status)}`}>
              {delivery.status}
            </span>
          </div>

          {/* Primary Line - Delivery ID (prominent) */}
          <div className={`${fonts.baseText} font-normal text-on-surface leading-tight mb-0.5 tracking-[0.25px]`}>
            <span className="block break-all">Delivery: {delivery.deliveryId}</span>
          </div>

          {/* Secondary Line - Items */}
          <div className={`${fonts.tinyText} font-normal text-on-surface-variant leading-tight mb-0.5 tracking-[0.4px]`}>
            Items: {delivery.items}
          </div>

          {/* Metadata Line - Sender */}
          <div className={`${fonts.tinyText} font-medium text-on-surface-variant leading-tight tracking-[0.5px] opacity-90`}>
            <div className="truncate">Sender: {delivery.sender}</div>
          </div>
        </div>

        {/* Trailing Elements */}
        <div className="flex-shrink-0 flex items-center gap-2">
          {/* Boxes Count */}
          <div className="text-right">
            <div className={`${fonts.tinyText} font-medium text-on-surface-variant leading-tight tracking-[0.5px]`}>
              Boxes: {delivery.boxes}
            </div>
          </div>

          {/* Navigation Arrow */}
          <div className="w-5 h-5 flex items-center justify-center">
            <ChevronRight className="w-5 h-5 text-on-surface-variant" />
          </div>
        </div>
      </ListRowCard>
    </button>
  );
}

function PartnerDeliveryNoteItem({ 
  deliveryNote, 
  orders, 
  onClick,
  isAdmin,
  canDeleteDraftOrPacking,
  onDelete,
  showSenderReceiver = false,
  stores,
  brands,
  warehouses,
  inTransitOver10Days = false
}: { 
  deliveryNote: DeliveryNote; 
  orders: ShippingPartnerOrder[];
  onClick?: () => void;
  isAdmin?: boolean;
  canDeleteDraftOrPacking?: boolean;
  onDelete?: (deliveryNoteId: string) => void;
  showSenderReceiver?: boolean;
  stores?: StoreRecord[];
  brands?: BrandRecord[];
  warehouses?: Warehouse[];
  inTransitOver10Days?: boolean;
}) {
  const { relatedOrdersForParties: relatedOrders, itemCount: totalItems } =
    getDeliveryNoteShipmentCounts(deliveryNote, orders);
  const deliveryStatus = deliveryNote.status as DeliveryNoteStatus;
  const { sender, warehouse, receiver, storeNameDisplay } = resolveDeliveryNoteParties(
    deliveryNote,
    relatedOrders,
    stores,
    brands,
    warehouses
  );

  const hasActions =
    (isAdmin || canDeleteDraftOrPacking) &&
    (deliveryStatus === 'draft' || deliveryStatus === 'packing') &&
    onDelete;
  const fonts = useListRowFonts();

  return (
    <div
      className={`w-full bg-surface-container border-b border-outline-variant ${
        onClick ? 'hover:bg-surface-container-high active:bg-surface-container cursor-pointer transition-colors duration-200' : ''
      }`}
    >
      {/* M3 Three-line List Item - matching DeliveryItem pattern for mobile */}
      <ListRowCard>

        {/* Leading Element - Truck Icon */}
        <div className="flex-shrink-0 w-10 h-10 bg-surface-container rounded-full flex items-center justify-center">
          <Truck className="w-5 h-5 text-on-surface-variant" />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0" onClick={onClick}>
          {/* Top Line - Date and Status in smallest font (consistent with DeliveryItem) */}
          <div className={`${fonts.tinyText} font-medium text-on-surface-variant leading-tight tracking-[0.5px] mb-0.5 flex items-center gap-1 flex-wrap`}>
            <span>{deliveryNote.createdDate},</span>
            <span className={`${fonts.tinyText} font-medium px-2 py-0.5 rounded-full ${getDeliveryNoteStatusBadgeColor(deliveryStatus)}`}>
              {getDeliveryNoteStatusDisplay(deliveryStatus)}
            </span>
            {inTransitOver10Days && (
              <span className={`${fonts.tinyText} font-medium text-error`}>more than 10 days</span>
            )}
          </div>

          {/* Primary Line - Delivery Note ID (prominent) */}
          <div className={`${fonts.baseText} font-normal text-on-surface leading-tight mb-0.5 tracking-[0.25px]`}>
            <span className="block break-all">Delivery: {deliveryNote.id}</span>
          </div>

          {/* Secondary Line - Items */}
          <div className={`${fonts.tinyText} font-normal text-on-surface-variant leading-tight mb-0.5 tracking-[0.4px]`}>
            {totalItems} items
          </div>

          {/* Metadata Line - Sender/Receiver (only if requested) */}
          {showSenderReceiver && (warehouse || sender || receiver) && (
            <div className={`${fonts.tinyText} font-medium text-on-surface-variant leading-tight tracking-[0.5px] opacity-90 space-y-0.5`}>
              {warehouse ? (
                <div className="truncate">From: {warehouse}</div>
              ) : (
                <div className="truncate">From: {sender || '-'}</div>
              )}
              <div className="truncate">To: {receiver || '-'}</div>
              {storeNameDisplay && (
                <div className="truncate text-on-surface-variant">{storeNameDisplay}</div>
              )}
            </div>
          )}
        </div>

        {/* Trailing Elements - Boxes count, More menu, Arrow */}
        <div className="flex-shrink-0 flex items-center gap-2">
          {/* Boxes Count - on mobile, matches DeliveryItem pattern */}
          <div className="text-right">
            <div className={`${fonts.tinyText} font-medium text-on-surface-variant leading-tight tracking-[0.5px]`}>
              Boxes: {deliveryNote.boxes.length}
            </div>
          </div>
          
          {/* More Menu for Actions - on mobile */}
          {hasActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                  }}
                  className="p-1 rounded-full hover:bg-surface-container-high text-on-surface-variant transition-colors"
                  aria-label="Delivery actions"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-surface-container border border-outline-variant rounded-[12px] p-2 w-64">
                <DropdownMenuItem
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    if (confirm('Are you sure you want to delete this delivery? This action cannot be undone.')) {
                      onDelete?.(deliveryNote.id);
                    }
                  }}
                  className="px-3 py-2 rounded-[8px] hover:bg-surface-container-high focus:bg-surface-container-high cursor-pointer text-error"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  <span className="body-medium">Delete Delivery</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          {/* Navigation Arrow */}
          {onClick && (
            <div className="w-5 h-5 flex items-center justify-center" onClick={onClick}>
              <ChevronRight className="w-5 h-5 text-on-surface-variant" />
            </div>
          )}
        </div>
      </ListRowCard>
    </div>
  );
}



function ReturnDeliveryComponent({
  returnDelivery, 
  onUpdateStatus,
  onCancel,
  onClick,
  stores,
  brands,
  warehouses,
  userRole
}: { 
  returnDelivery: ReturnDelivery; 
  onUpdateStatus?: (deliveryId: string, status: 'Returned') => void;
  onCancel?: (deliveryId: string) => void;
  onClick?: () => void;
  stores?: StoreRecord[];
  brands?: BrandRecord[];
  warehouses?: Warehouse[];
  userRole?: ShippingUserRole;
}) {
  const fonts = useListRowFonts();
  const getStatusDisplay = (status: ReturnDelivery['status']) => {
    switch (status) {
      case 'Pending': return 'Pending';
      case 'In transit': return 'In transit';
      case 'Returned': return 'Returned';
      default: return status;
    }
  };

  const getStatusBadgeColor = (status: ReturnDelivery['status']) => {
    switch (status) {
      case 'Pending': return 'bg-warning-container text-on-warning-container';
      case 'In transit': return 'bg-primary-container text-on-primary-container';
      case 'Returned': return 'bg-success-container text-on-success-container';
      default: return 'bg-surface-container-high text-on-surface-variant';
    }
  };

  const { sender, receiver } = resolveReturnDeliveryParties(returnDelivery, stores, brands, warehouses);

  const handleMarkAsReturned = () => {
    if (onUpdateStatus) {
      onUpdateStatus(returnDelivery.id, 'Returned');
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCancel && confirm('Are you sure you want to cancel this return? This action cannot be undone.')) {
      onCancel(returnDelivery.id);
    }
  };

  // Use div wrapper when there are action buttons to avoid nested buttons
  const hasActionButton = (returnDelivery.status !== 'Returned' && onUpdateStatus) || (returnDelivery.status === 'Pending' && onCancel);
  const ComponentWrapper = onClick && !hasActionButton ? 'button' : 'div';
  
  const handleContentClick = (e: React.MouseEvent | React.TouchEvent) => {
    if (!onClick) return;
    
    const target = e.target as HTMLElement;
    // Check if clicking on interactive elements - buttons, menus, etc.
    const isButton = target.closest('button');
    const isMenuItem = target.closest('[role="menuitem"]');
    const isMenu = target.closest('[role="menu"]');
    const isDropdownTrigger = target.closest('[data-slot="dropdown-menu-trigger"]');
    const isDropdownContent = target.closest('[data-slot="dropdown-menu-content"]');
    
    // Don't trigger if clicking on interactive elements
    if (isButton || isMenuItem || isMenu || isDropdownTrigger || isDropdownContent) {
      return;
    }
    
    // Trigger onClick for the content area
    e.stopPropagation();
    if (e.type === 'touchend') {
      e.preventDefault();
    }
    onClick();
  };
  
  const handleTouchStart = (e: React.TouchEvent) => {
    // Don't prevent default - let the browser handle it naturally
    // This allows buttons and dropdowns to work correctly
  };
  
  return (
    <ComponentWrapper 
      className={`bg-surface-container border-b border-outline-variant last:border-b-0 ${
        onClick ? 'hover:bg-surface-container-high active:bg-surface-container cursor-pointer transition-colors duration-200 text-left w-full touch-manipulation' : ''
      }`}
      onClick={hasActionButton ? undefined : onClick}
      role={onClick && hasActionButton ? 'button' : undefined}
      tabIndex={onClick && hasActionButton ? 0 : undefined}
      style={onClick && hasActionButton ? { WebkitTapHighlightColor: 'transparent' } : undefined}
    >
      <ListRowCard
        className="return-delivery-content"
        onClick={hasActionButton && onClick ? handleContentClick : undefined}
        onTouchStart={hasActionButton && onClick ? handleTouchStart : undefined}
        onTouchEnd={hasActionButton && onClick ? handleContentClick : undefined}
        style={hasActionButton && onClick ? { WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' } : undefined}
      >

        {/* Leading Element - Return Icon */}
        <div className="flex-shrink-0 w-10 h-10 bg-surface-container rounded-full flex items-center justify-center">
          <RotateCcw className="w-5 h-5 text-on-surface-variant" />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Top Line - Date and Status */}
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className={`${fonts.tinyText} font-medium text-on-surface-variant`}>
              {returnDelivery.date},
            </span>
            <span className={`${fonts.tinyText} font-medium px-2 py-0.5 rounded-full ${getStatusBadgeColor(returnDelivery.status)}`}>
              {getStatusDisplay(returnDelivery.status)}
            </span>
          </div>

          {/* Primary Line - Delivery ID */}
          <div className={`${fonts.bodyMd} text-on-surface mb-0.5`}>
            <span className="block break-all">Delivery: {returnDelivery.deliveryId}</span>
          </div>

          {/* Secondary Line - Sender (Brand + Store Code) */}
          <div className={`${fonts.body} text-on-surface-variant mb-0.5`}>
            <span className="block truncate">From: {sender}</span>
          </div>

          {/* Secondary Line - Receiver (Partner + Warehouse) */}
          <div className={`${fonts.body} text-on-surface-variant mb-0.5`}>
            <span className="block truncate">To: {receiver}</span>
          </div>

          {/* Metadata Line - Items */}
          <div className={`${fonts.label} text-on-surface-variant opacity-90`}>
            <div className="truncate">
              {returnDelivery.items} {returnDelivery.items === 1 ? 'item' : 'items'}
            </div>
          </div>
        </div>
        
        {/* Trailing Elements */}
        <div className="flex-shrink-0 flex items-center gap-3">
          {/* Status Badge - Visible on desktop only (hidden on tablet to avoid duplicate with top-left status) */}
          <div className={`hidden lg:flex px-3 py-1.5 rounded-full label-medium min-w-[120px] justify-center ${getStatusBadgeColor(returnDelivery.status)}`}>
            {getStatusDisplay(returnDelivery.status)}
          </div>

          {/* More menu for pending returns */}
          {returnDelivery.status === 'Pending' && onCancel && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                  onTouchEnd={(e: React.TouchEvent) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                  className="p-2 rounded-full hover:bg-surface-container-high transition-colors touch-manipulation"
                  aria-label="More actions"
                >
                  <MoreVertical className="w-5 h-5 text-on-surface-variant" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem
                  onClick={handleCancel}
                  className="text-error focus:text-error focus:bg-error-container"
                >
                  Cancel return
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Mark as Returned button - Only show for partners, not store staff */}
          {returnDelivery.status !== 'Returned' && returnDelivery.status !== 'Pending' && onUpdateStatus && userRole === 'partner' && (
            <button 
              onClick={(e: ReactMouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
                e.preventDefault();
                handleMarkAsReturned();
              }}
              onTouchEnd={(e: React.TouchEvent) => {
                e.stopPropagation();
                e.preventDefault();
              }}
              className="px-4 py-2 bg-primary text-on-primary rounded-lg label-medium hover:bg-primary/90 transition-colors min-h-[44px] touch-manipulation"
            >
              Mark as returned
            </button>
          )}

          {/* Navigation Arrow - Show when clickable (on mobile) */}
          {onClick && (
            <div className="w-5 h-5 flex items-center justify-center md:hidden">
              <ChevronRight className="w-5 h-5 text-on-surface-variant" />
            </div>
          )}
        </div>
      </ListRowCard>
    </ComponentWrapper>
  );
}

function PartnerOrderItem({
  order, 
  onClick, 
  isClickable = false,
  isSellpyPending = false,
  isAdmin,
  canDeleteDraft,
  onDelete,
  onCreateDeliveryNote,
  showSenderReceiver = false,
  stores,
  brands,
  warehouses
}: { 
  order: ShippingPartnerOrder; 
  onClick?: () => void; 
  isClickable?: boolean;
  isSellpyPending?: boolean;
  isAdmin?: boolean;
  canDeleteDraft?: boolean;
  onDelete?: (orderId: string) => void;
  onCreateDeliveryNote?: (orderId: string) => void;
  showSenderReceiver?: boolean;
  stores?: StoreRecord[];
  brands?: BrandRecord[];
  warehouses?: Warehouse[];
}) {
  const storeRecord = order.receivingStoreId ? stores?.find(s => s.id === order.receivingStoreId) : undefined;
  const brandRecord = storeRecord ? brands?.find(b => b.id === storeRecord.brandId) : undefined;
  const receiverDisplay = (() => {
    const brandName = brandRecord?.name;
    const storeCode = storeRecord?.code;
    if (brandName || storeCode) {
      return [brandName, storeCode].filter(Boolean).join(' ').trim();
    }
    return order.receivingStoreName || '';
  })();
  const storeNameDisplay = storeRecord?.name || order.receivingStoreName;
  const warehouseRecord = order.warehouseId ? warehouses?.find(w => w.id === order.warehouseId) : undefined;
  const warehouseDisplay = order.warehouseName || warehouseRecord?.name;
  
  const getStatusDisplay = (status: ShippingPartnerOrder['status']) => {
    switch (status) {
      case 'approval': return 'Approval';
      case 'pending': return 'Pending';
      case 'registered': return 'Ready for Packaging';
      case 'in-transit': return 'In Transit';
      case 'delivered': return 'Delivered';
      case 'in-review': return 'In Review';
      default: return status;
    }
  };

  const getStatusBadgeColor = (status: ShippingPartnerOrder['status']) => {
    switch (status) {
      case 'approval': return 'bg-secondary-container text-on-secondary-container';
      case 'pending': return 'bg-warning-container text-on-warning-container';
      case 'registered': return 'bg-tertiary-container text-on-tertiary-container';
      case 'in-transit': return 'bg-primary-container text-on-primary-container';
      case 'delivered': return 'bg-success-container text-on-success-container';
      case 'in-review': return 'bg-warning-container text-on-warning-container';
      default: return 'bg-surface-container-high text-on-surface-variant';
    }
  };

  const canDeleteOrder =
    !!onDelete &&
    (
      (isAdmin && (order.status === 'pending' || order.status === 'draft')) ||
      (canDeleteDraft && order.status === 'draft')
    );
  const fonts = useListRowFonts();

  return (
    <div
      className={`w-full bg-surface-container border-b border-outline-variant ${
        isClickable
          ? 'hover:bg-surface-container-high active:bg-surface-container cursor-pointer transition-colors duration-200'
          : ''
      }`}
    >
      {/* M3 Three-line List Item */}
      <ListRowCard
        onClick={isClickable ? onClick : undefined}
        role={isClickable ? 'button' : undefined}
        tabIndex={isClickable ? 0 : undefined}
        onKeyDown={isClickable ? (e: ReactKeyboardEvent<HTMLDivElement>) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick?.();
          }
        } : undefined}
      >

        {/* Leading Element - Package Icon */}
        <div className="flex-shrink-0 w-10 h-10 bg-surface-container rounded-full flex items-center justify-center">
          <Package className="w-5 h-5 text-on-surface-variant" />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Top Line - Date and Status */}
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className={`${fonts.tinyText} font-medium text-on-surface-variant`}>
              {order.createdDate},
            </span>
            <span className={`${fonts.tinyText} font-medium px-2 py-0.5 rounded-full ${getStatusBadgeColor(order.status)}`}>
              {getStatusDisplay(order.status)}
            </span>
          </div>

          {/* Primary Line - Order ID */}
          <div className={`${fonts.bodyMd} text-on-surface mb-0.5`}>
            <span className="block break-all">Order: {order.id}</span>
          </div>

          {/* Secondary Line - Items and Boxes */}
          <div className={`${fonts.body} text-on-surface-variant mb-0.5`}>
            {order.itemCount} items • {order.boxCount} boxes
          </div>

          {/* Sender/Receiver Line - Only show if requested */}
          {showSenderReceiver && (warehouseDisplay || order.partnerName || receiverDisplay) && (
            <div className={`${fonts.label} text-on-surface-variant opacity-90 space-y-0.5`}>
              {warehouseDisplay && (
                <div className="truncate">From: {warehouseDisplay}</div>
              )}
              {!warehouseDisplay && order.partnerName && (
                <div className="truncate">From: {order.partnerName}</div>
              )}
              {receiverDisplay && (
                <div className="truncate">To: {receiverDisplay}</div>
              )}
              {storeNameDisplay && receiverDisplay !== storeNameDisplay && (
                <div className="truncate">{storeNameDisplay}</div>
              )}
            </div>
          )}

          {/* Metadata Line - Delivery Note if exists */}
          {order.deliveryNote && (
            <div className={`${fonts.label} text-on-surface-variant opacity-90`}>
              <div className="truncate">Shipped via: {order.deliveryNote}</div>
            </div>
          )}

          {/* Add Item IDs Hint for Sellpy Pending Orders Only */}
          {isClickable && isSellpyPending && (
            <div className={`${fonts.label} text-primary mt-1`}>
              Tap to add item IDs
            </div>
          )}
        </div>

        {/* Trailing Elements */}
        <div className="flex-shrink-0 flex items-center gap-3">
          {/* Status Badge - Visible on desktop only (hidden on tablet to avoid duplicate with top-left status) */}
          <div className={`hidden lg:flex px-3 py-1.5 rounded-full label-medium min-w-[140px] justify-center ${getStatusBadgeColor(order.status)}`}>
            {getStatusDisplay(order.status)}
          </div>
          
          {/* Action Menu */}
          {(order.status === 'registered' && onCreateDeliveryNote) || canDeleteOrder ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  onClick={(e: ReactMouseEvent<HTMLButtonElement>) => e.stopPropagation()}
                  className="p-2 rounded-full hover:bg-surface-container-high text-on-surface-variant transition-colors"
                  aria-label="Order actions"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {order.status === 'registered' && onCreateDeliveryNote && (
                  <DropdownMenuItem
                    onClick={(e: ReactMouseEvent<HTMLDivElement>) => {
                      e.stopPropagation();
                      onCreateDeliveryNote(order.id);
                    }}
                    className="gap-2"
                  >
                    <Package className="w-4 h-4" />
                    <span className="label-large">Create delivery note</span>
                  </DropdownMenuItem>
                )}
                {canDeleteOrder && (
                  <DropdownMenuItem
                    onClick={(e: ReactMouseEvent<HTMLDivElement>) => {
                      e.stopPropagation();
                      if (confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
                        onDelete(order.id);
                      }
                    }}
                    className="gap-2 text-error focus:text-error focus:bg-error-container"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="label-large">Delete order</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
          
          {/* Arrow for clickable items */}
          {isClickable && (
            <div className="w-5 h-5 flex items-center justify-center">
              <ChevronRight className="w-5 h-5 text-primary" />
            </div>
          )}
        </div>
      </ListRowCard>
    </div>
  );
}

function SellpyOrderItem({
  order, 
  onClick 
}: { 
  order: SellpyOrder; 
  onClick?: () => void; 
}) {
  const getStatusColor = (status: SellpyOrder['status']) => {
    switch (status) {
      case 'pending': return 'text-on-warning-container';
      case 'in-progress': return 'text-on-primary-container';
      case 'completed': return 'text-on-tertiary-container';
      case 'registered': return 'text-tertiary';
      default: return 'text-on-surface-variant';
    }
  };

  const getStatusDisplay = (status: SellpyOrder['status']) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'in-progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'registered': return 'Registered';
      default: return status;
    }
  };

  const getStatusBadgeColor = (status: SellpyOrder['status']) => {
    switch (status) {
      case 'pending': return 'bg-warning-container text-on-warning-container';
      case 'in-progress': return 'bg-primary-container text-on-primary-container';
      case 'completed': return 'bg-tertiary-container text-on-tertiary-container';
      case 'registered': return 'bg-tertiary-container text-on-tertiary-container';
      default: return 'bg-surface-container-high text-on-surface-variant';
    }
  };

  const getStatusIcon = (status: SellpyOrder['status']) => {
    switch (status) {
      case 'pending': return ClockIcon;
      case 'in-progress': return Package;
      case 'completed': return CheckIcon;
      case 'registered': return CheckIcon;
      default: return Package;
    }
  };

  const StatusIcon = getStatusIcon(order.status);
  const fonts = useListRowFonts();

  return (
    <button
      className="w-full bg-surface-container border-b border-outline-variant hover:bg-surface-container-high active:bg-surface-container cursor-pointer transition-colors duration-200 text-left"
      onClick={onClick}
    >
      {/* M3 Three-line List Item */}
      <ListRowCard>

        {/* Leading Element - Status Icon */}
        <div className="flex-shrink-0 w-10 h-10 bg-surface-container rounded-full flex items-center justify-center">
          <StatusIcon className="w-5 h-5 text-on-surface-variant" />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Top Line - Order ID and Status */}
          <div className={`${fonts.tinyText} font-medium leading-tight tracking-[0.5px] mb-0.5 ${getStatusColor(order.status)}`}>
            {order.id}, {getStatusDisplay(order.status)}
          </div>

          {/* Primary Line - Date */}
          <div className={`${fonts.baseText} font-normal text-on-surface leading-tight mb-0.5 tracking-[0.25px]`}>
            <span className="block truncate">Received: {order.createdDate}</span>
          </div>

          {/* Secondary Line - Items Progress */}
          <div className={`${fonts.tinyText} font-normal text-on-surface-variant leading-tight mb-0.5 tracking-[0.4px]`}>
            {order.itemsWithRetailerIds} / {order.totalItems} items processed
          </div>

          {/* Metadata Line - Receiving Store */}
          <div className={`${fonts.tinyText} font-medium text-on-surface-variant leading-tight tracking-[0.5px] opacity-90`}>
            <div className="truncate">Store: {order.receivingStore}</div>
          </div>
        </div>

        {/* Trailing Elements */}
        <div className="flex-shrink-0 flex items-center gap-3">
          {/* Status Badge - Visible on desktop only (hidden on tablet to avoid duplicate with top-left status) */}
          <div className={`hidden lg:flex px-3 py-1.5 rounded-full label-medium min-w-[120px] justify-center ${getStatusBadgeColor(order.status)}`}>
            {getStatusDisplay(order.status)}
          </div>

          {/* Arrow */}
          <div className="w-5 h-5 flex items-center justify-center">
            <ChevronRight className="w-5 h-5 text-on-surface-variant" />
          </div>
        </div>
      </ListRowCard>
    </button>
  );
}

export default function ShippingScreen({ 
  deliveries, 
  onSelectDelivery, 
  onNavigateToScan, 
  onScanBox,
  initialTab,
  currentUserRole = 'store-staff',
  partnerOrders = [],
  deliveryNotes = [],
  returnDeliveries = [],
  currentPartnerId,
  currentWarehouseId,
  onSelectSellpyOrder,
  onUpdateReturnDeliveryStatus,
  onCancelReturn,
  onOpenOrderDetails,
  onOpenShipmentDetails,
  onOpenReturnDetails,
  sellpyOrders = [],
  brands = [] as BrandRecord[],
  countries = [] as CountryRecord[],
  stores = [] as StoreRecord[],
  warehouses = [] as Warehouse[],
  isAdmin = false,
  onDeletePartnerOrder,
  onDeleteDeliveryNote,
  onCreateDeliveryNoteForOrder,
  onCreateOrder,
  currentStoreSelection,
  viewFilter: externalViewFilter,
  onViewFilterChange: externalOnViewFilterChange
}: ShippingScreenProps) {
  const role: ShippingUserRole = currentUserRole ?? 'store-staff';
  const showPartnerStoreFilterLabel = useMediaQuery('(min-width: 640px)');

  // Adjust initial tab based on user role
  const getInitialTab = (): ShippingTab => {
    if (role === 'partner') {
      // Default to 'pending' (Orders tab) if no initialTab provided
      if (!initialTab) {
        return 'pending';
      }

      switch (initialTab) {
        case 'orders':
        case 'pending':
        case 'pending-registered': // Special case: Orders tab with registered filter
        case 'approval': // Special case: Orders tab with approval filter
        case 'pending-pending': // Special case: Orders tab with pending filter (Sellpy)
        case 'pending-draft': // Special case: Orders tab with draft filter (Thrifted)
          return 'pending';
        case 'returns':
        case 'returns-returned':
        case 'returns-in-transit':
          return 'returns';
        case 'pending-packing': // Special case: Shipments tab with Pending & Packing filter
        case 'shipments':
        case 'registered':
        case 'in-transit':
        case 'in-transit-filter': // Special case: Shipments tab with in-transit filter
        case 'all':
        case 'delivered':
          return 'in-transit';
        default:
          return 'pending';
      }
    }
    // For store staff, default to 'shipments' (renamed to 'New')
    if (!initialTab || initialTab === 'orders' || initialTab === 'pending-registered') {
      return 'shipments';
    }
    return initialTab as ShippingTab;
  };

  const [activeTab, setActiveTab] = useState<ShippingTab>(getInitialTab());
  const [orderStatusFilter, setOrderStatusFilter] = useState<OrderStatusFilter>('all');
  const [shipmentStatusFilter, setShipmentStatusFilter] = useState<ShipmentStatusFilter>('all');
  const [returnStatusFilter, setReturnStatusFilter] = useState<ReturnStatusFilter>('all');
  
  // Sorting state
  type SortDirection = 'asc' | 'desc' | null;
  type OrderSortField = 'date' | 'id' | 'externalId' | 'senderReceiver' | 'items' | 'orderValue' | 'salesMargin' | 'status';
  type ShipmentSortField = 'date' | 'id' | 'senderReceiver' | 'orders' | 'items' | 'boxes' | 'status';
type ReturnSortField = 'date' | 'id' | 'senderReceiver' | 'items' | 'status';
  
  const [orderSort, setOrderSort] = useState<{ field: OrderSortField; direction: SortDirection }>({ field: 'date', direction: 'desc' });
  const [shipmentSort, setShipmentSort] = useState<{ field: ShipmentSortField; direction: SortDirection }>({ field: 'date', direction: 'desc' });
  const [returnSort, setReturnSort] = useState<{ field: ReturnSortField; direction: SortDirection }>({ field: 'date', direction: 'desc' });
  
  // Pagination state for "All" tabs
  const [loadedItemsCount, setLoadedItemsCount] = useState(50);
  const ITEMS_PER_PAGE = 50;
  
  // Thrifted: Draft only (no Pending). Sellpy: Pending only (no Draft).
  const isThriftedPartnerForFilter = currentPartnerId === '2'; // Thrifted
  const canShowApprovalOrderFilter = !!isAdmin;
  const orderStatusFilterOptions: Array<{ id: OrderStatusFilter; label: string }> = isThriftedPartnerForFilter
    ? [
        { id: 'all' as OrderStatusFilter, label: 'All' },
        { id: 'draft' as OrderStatusFilter, label: 'Draft' },
        { id: 'registered' as OrderStatusFilter, label: 'Ready for Packaging' },
        { id: 'in-transit' as OrderStatusFilter, label: 'In transit' }
      ]
    : canShowApprovalOrderFilter
      ? [
          { id: 'all' as OrderStatusFilter, label: 'All' },
          { id: 'approval' as OrderStatusFilter, label: 'Approval' },
          { id: 'pending' as OrderStatusFilter, label: 'Pending' },
          { id: 'registered' as OrderStatusFilter, label: 'Ready for Packaging' },
          { id: 'in-transit' as OrderStatusFilter, label: 'In transit' }
        ]
      : [
          { id: 'all' as OrderStatusFilter, label: 'All' },
          { id: 'pending' as OrderStatusFilter, label: 'Pending' },
          { id: 'registered' as OrderStatusFilter, label: 'Ready for Packaging' },
          { id: 'in-transit' as OrderStatusFilter, label: 'In transit' }
        ];
  const shipmentStatusFilterOptions: Array<{ id: ShipmentStatusFilter; label: string }> = [
    { id: 'all', label: 'All' },
    { id: 'packing', label: 'Draft & Packing' },
    { id: 'in-transit', label: 'In transit' },
    { id: 'delivered', label: 'Delivered' }
  ];
  const returnStatusFilterOptions: Array<{ id: ReturnStatusFilter; label: string }> = [
    { id: 'all', label: 'All' },
    { id: 'in-transit', label: 'In transit' },
    { id: 'returned', label: 'Returned' }
  ];
  const [searchTerm, setSearchTerm] = useState('');
  
  // Use shared filter state for partner portal, local state for store staff
  const [localViewFilter, setLocalViewFilter] = useState<ViewFilter>({
    mode: 'by-store',
    brandIds: [],
    countryIds: [],
    storeIds: []
  });
  
  // Use external filter if provided (partner portal), otherwise use local
  const viewFilter = externalViewFilter ?? localViewFilter;

  const applyViewFilter = (
    update: ViewFilter | ((prev: ViewFilter) => ViewFilter)
  ) => {
    if (externalOnViewFilterChange) {
      const next =
        typeof update === 'function' ? update(viewFilter) : update;
      externalOnViewFilterChange(next);
    } else {
      setLocalViewFilter(update as SetStateAction<ViewFilter>);
    }
  };

  // Update active tab when initialTab or currentUserRole changes
  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [initialTab, role]);

useEffect(() => {
  if (role !== 'partner') {
    return;
  }

  setOrderStatusFilter('all');
  setShipmentStatusFilter('all');
  setReturnStatusFilter('all');

  if (!initialTab) {
    return;
  }

  switch (initialTab) {
    case 'approval': // Special case: Orders tab with approval filter
      setOrderStatusFilter(isAdmin ? 'approval' : 'all');
      break;
    case 'pending':
      // 'pending' without specific filter encoding means 'all' filter
      // Don't override - keep as 'all' (already set above)
      break;
    case 'pending-pending': // Special case: Orders tab with pending filter (Sellpy)
      setOrderStatusFilter('pending');
      break;
    case 'pending-draft': // Special case: Orders tab with draft filter (Thrifted)
      setOrderStatusFilter('draft');
      break;
    case 'pending-registered': // Special case: Orders tab with registered filter
      setOrderStatusFilter('registered');
      break;
    case 'registered':
      setOrderStatusFilter('registered');
      break;
    case 'pending-packing': // Special case: Shipments tab with Pending & Packing filter
      setShipmentStatusFilter('packing');
      break;
    case 'shipments':
    case 'in-transit':
      // 'in-transit' without specific filter encoding means 'all' filter
      // Don't override - keep as 'all' (already set above)
      break;
    case 'in-transit-filter': // Special case: Shipments tab with in-transit filter
      setShipmentStatusFilter('in-transit');
      break;
    case 'all':
      setShipmentStatusFilter('in-transit');
      break;
    case 'delivered':
      setShipmentStatusFilter('delivered');
      break;
    case 'returns':
      // 'returns' without specific filter encoding means 'all' filter
      // Don't override - keep as 'all' (already set above)
      break;
    case 'returns-returned':
      setReturnStatusFilter('returned');
      break;
    case 'returns-in-transit':
      setReturnStatusFilter('in-transit');
      break;
    default:
      break;
  }
}, [initialTab, role]);

  // Filter handlers
  const handleViewAllStores = () => {
    applyViewFilter({
      mode: 'all',
      brandIds: [],
      countryIds: [],
      storeIds: []
    });
  };

  const handleBrandFilterChange = (brandIds: string[]) => {
    applyViewFilter(prev => ({
      ...prev,
      mode: 'by-store',
      brandIds
    }));
  };

  const handleCountryFilterChange = (countryIds: string[]) => {
    applyViewFilter(prev => ({
      ...prev,
      mode: 'by-store',
      countryIds
    }));
  };

  const handleStoreFilterChange = (storeIds: string[]) => {
    applyViewFilter(prev => ({
      ...prev,
      mode: 'by-store',
      storeIds
    }));
  };

  // Helper function to get receiver display with brand and store code
  const getReceiverDisplay = (receivingStoreId?: string, receivingStoreName?: string) => {
    if (!receivingStoreId || !receivingStoreName) {
      return receivingStoreName || '-';
    }
    
    const store = stores?.find(s => s.id === receivingStoreId);
    if (!store) {
      return receivingStoreName;
    }
    
    const brand = brands?.find(b => b.id === store.brandId);
    const brandName = brand?.name || '';
    const storeCode = store.code || '';
    
    return `${brandName} ${storeCode}`;
  };

  // Helper function to check if search term matches any value in an object
  const matchesSearchTerm = (searchTerm: string, values: (string | number | undefined | null)[]): boolean => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return values.some(val => {
      if (val === undefined || val === null) return false;
      return String(val).toLowerCase().includes(searchLower);
    });
  };

  // Sorting helper functions
  const sortOrders = (orders: ShippingPartnerOrder[], sortField: OrderSortField, direction: SortDirection) => {
    if (!direction) return orders;
    
    return [...orders].sort((a, b) => {
      let aVal: any;
      let bVal: any;
      
      switch (sortField) {
        case 'date':
          aVal = new Date(a.createdDate).getTime();
          bVal = new Date(b.createdDate).getTime();
          break;
        case 'id':
          aVal = a.id.toLowerCase();
          bVal = b.id.toLowerCase();
          break;
        case 'externalId':
          aVal = (a.externalOrderId || '').toLowerCase();
          bVal = (b.externalOrderId || '').toLowerCase();
          break;
        case 'senderReceiver':
          const aStore = a.receivingStoreId ? stores?.find(s => s.id === a.receivingStoreId) : null;
          const aBrand = aStore && brands ? brands.find(b => b.id === aStore.brandId) : null;
          aVal = `${a.warehouseName || ''} ${aBrand?.name || ''} ${aStore?.code || ''} ${a.receivingStoreName || ''}`.toLowerCase();
          const bStore = b.receivingStoreId ? stores?.find(s => s.id === b.receivingStoreId) : null;
          const bBrand = bStore && brands ? brands.find(b => b.id === bStore.brandId) : null;
          bVal = `${b.warehouseName || ''} ${bBrand?.name || ''} ${bStore?.code || ''} ${b.receivingStoreName || ''}`.toLowerCase();
          break;
        case 'items':
          aVal = a.itemCount || 0;
          bVal = b.itemCount || 0;
          break;
        case 'orderValue':
          aVal = a.orderValue || 0;
          bVal = b.orderValue || 0;
          break;
        case 'salesMargin':
          aVal = a.salesMargin || 0;
          bVal = b.salesMargin || 0;
          break;
        case 'status':
          aVal = a.status;
          bVal = b.status;
          break;
        default:
          return 0;
      }
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return direction === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });
  };

  const sortShipments = (shipments: DeliveryNote[], sortField: ShipmentSortField, direction: SortDirection) => {
    if (!direction) return shipments;
    
    return [...shipments].sort((a, b) => {
      let aVal: any;
      let bVal: any;
      
      switch (sortField) {
        case 'date':
          aVal = new Date(a.createdDate).getTime();
          bVal = new Date(b.createdDate).getTime();
          break;
        case 'id':
          aVal = a.id.toLowerCase();
          bVal = b.id.toLowerCase();
          break;
        case 'senderReceiver': {
          const aCtx = getDeliveryNoteShipmentCounts(a, partnerOrdersList);
          const aParties = resolveDeliveryNoteParties(a, aCtx.relatedOrdersForParties, stores, brands, warehouses);
          aVal = `${aParties.warehouse || ''} ${aParties.receiver}`.toLowerCase();
          const bCtx = getDeliveryNoteShipmentCounts(b, partnerOrdersList);
          const bParties = resolveDeliveryNoteParties(b, bCtx.relatedOrdersForParties, stores, brands, warehouses);
          bVal = `${bParties.warehouse || ''} ${bParties.receiver}`.toLowerCase();
          break;
        }
        case 'orders':
          aVal = getDeliveryNoteShipmentCounts(a, partnerOrdersList).orderCount;
          bVal = getDeliveryNoteShipmentCounts(b, partnerOrdersList).orderCount;
          break;
        case 'items':
          aVal = getDeliveryNoteShipmentCounts(a, partnerOrdersList).itemCount;
          bVal = getDeliveryNoteShipmentCounts(b, partnerOrdersList).itemCount;
          break;
        case 'boxes':
          aVal = a.boxes?.length || 0;
          bVal = b.boxes?.length || 0;
          break;
        case 'status':
          aVal = a.status || '';
          bVal = b.status || '';
          break;
        default:
          return 0;
      }
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return direction === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });
  };

  const sortReturns = (returns: ReturnDelivery[], sortField: ReturnSortField, direction: SortDirection) => {
    if (!direction) return returns;
    
    return [...returns].sort((a, b) => {
      let aVal: any;
      let bVal: any;
      
      switch (sortField) {
        case 'date':
          aVal = new Date(a.date).getTime();
          bVal = new Date(b.date).getTime();
          break;
        case 'id':
          aVal = a.deliveryId.toLowerCase();
          bVal = b.deliveryId.toLowerCase();
          break;
        case 'senderReceiver': {
          const aParties = resolveReturnDeliveryParties(a, stores, brands, warehouses);
          const bParties = resolveReturnDeliveryParties(b, stores, brands, warehouses);
          aVal = `${aParties.sender} ${aParties.receiver}`.toLowerCase();
          bVal = `${bParties.sender} ${bParties.receiver}`.toLowerCase();
          break;
        }
        case 'items':
          aVal = a.items || 0;
          bVal = b.items || 0;
          break;
        case 'status':
          aVal = a.status;
          bVal = b.status;
          break;
        default:
          return 0;
      }
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return direction === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });
  };

  const filteredDeliveries = deliveries.filter(delivery => {
    // For store staff: exclude pending deliveries - only show in-transit and delivered/cancelled
    if ((role === 'store-staff' || role === 'admin' || role === 'store-manager') && 
        (delivery.status === 'Draft' || delivery.status === 'Packing')) {
      return false;
    }
    
    const matchesSearch = searchTerm === '' || 
      delivery.deliveryId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.sender.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'shipments' && delivery.status === 'In transit') ||
      (activeTab === 'returns' && (delivery.status === 'Delivered' || delivery.status === 'Cancelled'));
    
    const matchesPartner = role !== 'partner' || !currentPartnerId || delivery.partnerId === currentPartnerId;
    const matchesWarehouse = role !== 'partner' || !currentWarehouseId || delivery.warehouseId === currentWarehouseId;
    
    return matchesSearch && matchesTab && matchesPartner && matchesWarehouse;
  }).sort((a, b) => {
    // Sort by date descending (newest first)
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const hasInTransitDelivery = deliveries.some((delivery) => delivery.status === 'In transit');

  // Filter data based on active tab and search
  const partnerOrdersList = partnerOrders ?? [];

  const filteredPartnerOrders = partnerOrdersList.filter(order => {
    // Comprehensive search across all fields
    const orderStore = order.receivingStoreId ? stores?.find(s => s.id === order.receivingStoreId) : null;
    const orderBrand = orderStore ? brands?.find(b => b.id === orderStore.brandId) : null;
    const matchesSearch = matchesSearchTerm(searchTerm, [
      order.id,
      order.externalOrderId,
      order.deliveryNote,
      order.partnerName,
      order.receivingStoreName,
      orderStore?.name,
      orderStore?.code,
      orderBrand?.name,
      order.warehouseName,
      order.itemCount,
      order.orderValue,
      order.salesMargin,
      order.status,
      order.createdDate
    ]);
    
    // Filter out approval orders for non-admin users
    if (order.status === 'approval' && !isAdmin) {
      return false;
    }
    
    if (role === 'partner' && activeTab !== 'pending') {
      return false;
    }
    
    // For partners: only show their orders
    // For store staff: show all orders
    const matchesPartner = role === 'store-staff' || 
      order.partnerId === currentPartnerId;
    const matchesWarehouse = role === 'store-staff' || 
      !currentWarehouseId || 
      order.warehouseId === currentWarehouseId;
    
    // Apply brand/country/store filters (for partner portal only)
    if (role === 'partner') {
      const orderStore = order.receivingStoreId ? stores?.find(s => s.id === order.receivingStoreId) : null;
      
      // Check brand filter
      if (viewFilter.brandIds && viewFilter.brandIds.length > 0) {
        if (!orderStore || !viewFilter.brandIds.includes(orderStore.brandId)) {
          return false;
        }
      }
      
      // Check country filter
      if (viewFilter.countryIds && viewFilter.countryIds.length > 0) {
        if (!orderStore || !viewFilter.countryIds.includes(orderStore.countryId)) {
          return false;
        }
      }
      
      // Check store filter
      if (viewFilter.storeIds && viewFilter.storeIds.length > 0) {
        if (!order.receivingStoreId || !viewFilter.storeIds.includes(order.receivingStoreId)) {
          return false;
        }
      }
    }
    
    const matchesStatusFilter = (() => {
      if (role !== 'partner') {
        return true;
      }

      switch (orderStatusFilter) {
        case 'approval':
          return order.status === 'approval';
        case 'pending':
          return order.status === 'pending';
        case 'draft':
          return order.status === 'draft';
        case 'registered':
          return order.status === 'registered';
        case 'in-transit':
          return order.status === 'in-transit';
        case 'all':
        default:
          return ['approval', 'pending', 'draft', 'registered', 'in-transit', 'in-review', 'delivered'].includes(order.status);
      }
    })();
    
    return matchesSearch && matchesPartner && matchesWarehouse && matchesStatusFilter;
  });
  
  // Apply sorting to orders
  const sortedPartnerOrders = role === 'partner' 
    ? sortOrders(filteredPartnerOrders, orderSort.field, orderSort.direction)
    : filteredPartnerOrders;
  
  // Pagination for "All" tabs - only show first N items
  const isAllTab = activeTab === 'all';
  const paginatedPartnerOrders = isAllTab 
    ? sortedPartnerOrders.slice(0, loadedItemsCount)
    : sortedPartnerOrders;

  const findSellpyOrder = (orderId: string) =>
    sellpyOrders.find(order => order.id === orderId);

  const handleSellpyOrderSelect = (orderId: string) => {
    if (!onSelectSellpyOrder) return;
    const sellpyOrder = findSellpyOrder(orderId);
    if (sellpyOrder) {
      onSelectSellpyOrder(sellpyOrder);
    }
  };


  // Filter return deliveries based on search and role
  const filteredReturnDeliveries = returnDeliveries.filter(delivery => {
    // Comprehensive search across all fields
    const deliveryStore = delivery.storeId ? stores?.find(s => s.id === delivery.storeId) : stores?.find(s => s.code === delivery.storeCode);
    const deliveryBrand = deliveryStore ? brands?.find(b => b.id === deliveryStore.brandId) : null;
    const deliveryWarehouse = delivery.warehouseName || (delivery.warehouseId ? warehouses?.find(w => w.id === delivery.warehouseId)?.name : '');
    const matchesSearch = matchesSearchTerm(searchTerm, [
      delivery.deliveryId,
      delivery.storeName,
      delivery.storeCode,
      deliveryStore?.name,
      deliveryStore?.code,
      deliveryBrand?.name,
      deliveryWarehouse,
      delivery.items,
      delivery.boxes,
      delivery.status,
      delivery.date,
      delivery.partnerName
    ]);
    
    // For partners: only show their return deliveries
    // For store staff and admin: show return deliveries for the selected store
    const matchesPartner = (role === 'store-staff' || role === 'admin') || 
      delivery.partnerId === currentPartnerId;
    const matchesWarehouse = (role === 'store-staff' || role === 'admin') || 
      !currentWarehouseId || 
      delivery.warehouseId === currentWarehouseId;
    
    // For store staff and admin: filter by selected store if available
    let matchesStore = true;
    if ((role === 'store-staff' || role === 'admin') && currentStoreSelection?.storeId) {
      // Match by storeId directly (convert to string for comparison)
      const deliveryStoreId = String(delivery.storeId || '');
      const selectedStoreId = String(currentStoreSelection.storeId);
      
      // Also try matching by storeCode
      const selectedStore = stores?.find(s => String(s.id) === selectedStoreId);
      const selectedStoreCode = selectedStore?.code;
      
      // Match if storeId matches OR storeCode matches
      matchesStore = deliveryStoreId === selectedStoreId || 
                     (selectedStoreCode ? delivery.storeCode === selectedStoreCode : false);
    }

    if (!matchesPartner || !matchesWarehouse || !matchesStore) {
      return false;
    }

    // For "Returns ongoing" tab: only show Pending and In transit returns
    if (activeTab === 'returns') {
      if (role === 'partner') {
        // For partners: exclude Pending returns
        if (delivery.status === 'Pending') {
          return false;
        }
        const matchesStatus = (() => {
          switch (returnStatusFilter) {
            case 'in-transit':
              return delivery.status === 'In transit';
            case 'returned':
              return delivery.status === 'Returned';
            case 'all':
            default:
              return delivery.status === 'In transit' || delivery.status === 'Returned';
          }
        })();
        return matchesSearch && matchesStatus;
      } else {
        // Store staff and admin: show only Pending and In transit in Returns ongoing tab
        return matchesSearch && (delivery.status === 'Pending' || delivery.status === 'In transit');
      }
    }

    // For "All" tab: show all returns (pending, in transit, delivered/returned)
    if (activeTab === 'all') {
      // For partners: exclude Pending returns
      if (role === 'partner' && delivery.status === 'Pending') {
        return false;
      }
      return matchesSearch;
    }

    // For other tabs, don't show returns (they're only shown on 'returns' and 'all' tabs)
    return false;
  });
  
  // Apply sorting to returns
  const sortedReturnDeliveries = role === 'partner'
    ? sortReturns(filteredReturnDeliveries, returnSort.field, returnSort.direction)
    : filteredReturnDeliveries;
  
  // Pagination for "All" tabs
  const paginatedReturnDeliveries = isAllTab
    ? sortedReturnDeliveries.slice(0, loadedItemsCount)
    : sortedReturnDeliveries;
  
  // Reset loaded items count when tab or filters change
  useEffect(() => {
    setLoadedItemsCount(ITEMS_PER_PAGE);
  }, [activeTab, orderStatusFilter, shipmentStatusFilter, returnStatusFilter, searchTerm]);
  
  // Handle scroll to load more items
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (activeTab !== 'all') return;
    
    const target = e.currentTarget;
    const scrollBottom = target.scrollHeight - target.scrollTop - target.clientHeight;
    
    // Load more when within 200px of bottom
    if (scrollBottom < 200) {
      let totalItems = 0;
      if (role === ('partner' as any)) {
        // For "All" tab, we need to determine which list is being shown
        // This depends on what's visible in the current view
        // For now, use the largest of the three lists
        totalItems = Math.max(
          sortedPartnerOrders.length,
          sortedDeliveryNotes.length,
          sortedReturnDeliveries.length
        );
      } else {
        totalItems = sortedReturnDeliveries.length + filteredDeliveries.length;
      }
      
      if (loadedItemsCount < totalItems) {
        setLoadedItemsCount(prev => Math.min(prev + ITEMS_PER_PAGE, totalItems));
      }
    }
  };
  
  // Sort handlers
  const handleOrderSort = (field: string) => {
    setOrderSort(prev => ({
      field: field as OrderSortField,
      direction: prev.field === field 
        ? (prev.direction === 'asc' ? 'desc' : prev.direction === 'desc' ? null : 'asc')
        : 'asc'
    }));
  };

  const handleShipmentSort = (field: string) => {
    setShipmentSort(prev => ({
      field: field as ShipmentSortField,
      direction: prev.field === field 
        ? (prev.direction === 'asc' ? 'desc' : prev.direction === 'desc' ? null : 'asc')
        : 'asc'
    }));
  };

  const handleReturnSort = (field: string) => {
    setReturnSort(prev => ({
      field: field as ReturnSortField,
      direction: prev.field === field 
        ? (prev.direction === 'asc' ? 'desc' : prev.direction === 'desc' ? null : 'asc')
        : 'asc'
    }));
  };
  
  // Sortable header component
  const SortableHeader = ({ 
    field, 
    label, 
    currentSort, 
    onSort, 
    align = 'left' 
  }: { 
    field: OrderSortField | ShipmentSortField | ReturnSortField; 
    label: string; 
    currentSort: { field: string; direction: SortDirection }; 
    onSort: (field: string) => void;
    align?: 'left' | 'right';
  }) => {
    const isActive = currentSort.field === field;
    const direction = isActive ? currentSort.direction : null;
    
    return (
      <th 
        className={`px-4 py-3 ${align === 'right' ? 'text-right' : 'text-left'} title-small text-on-surface cursor-pointer hover:bg-surface-container transition-colors`}
        onClick={() => onSort(field)}
      >
        <div className={`flex items-center gap-2 ${align === 'right' ? 'justify-end' : ''}`}>
          <span>{label}</span>
          <div className="flex flex-col">
            <ArrowUp 
              size={12} 
              className={direction === 'asc' ? 'text-primary' : 'text-on-surface-variant opacity-30'} 
            />
            <ArrowDown 
              size={12} 
              className={direction === 'desc' ? 'text-primary' : 'text-on-surface-variant opacity-30'} 
              style={{ marginTop: '-4px' }}
            />
          </div>
        </div>
      </th>
    );
  };

  const filteredDeliveryNotes = deliveryNotes.filter(note => {
    // Comprehensive search across all fields
    const { relatedOrdersForParties: relatedOrders, orderCount, itemCount: totalItems } =
      getDeliveryNoteShipmentCounts(note, partnerOrdersList);
    const noteWarehouse = relatedOrders[0]?.warehouseName || (relatedOrders[0]?.warehouseId ? warehouses?.find(w => w.id === relatedOrders[0]?.warehouseId)?.name : '');
    const noteReceiver = getReceiverDisplay(relatedOrders[0]?.receivingStoreId, relatedOrders[0]?.receivingStoreName);
    const matchesSearch = matchesSearchTerm(searchTerm, [
      note.id,
      note.orderId,
      note.status,
      note.createdDate,
      noteWarehouse,
      noteReceiver,
      orderCount,
      totalItems,
      note.boxes?.length,
      ...relatedOrders.map(o => o.id),
      ...relatedOrders.map(o => o.externalOrderId).filter(Boolean)
    ]);

    const noteStatus = note.status as DeliveryNoteStatus;
    
    if (role === 'partner') {
      if (activeTab !== 'in-transit') {
        return false;
      }

      const matchesPartner = !currentPartnerId || note.partnerId === currentPartnerId;
      const matchesWarehouse = !currentWarehouseId || note.warehouseId === currentWarehouseId;
      if (!matchesPartner || !matchesWarehouse) {
        return false;
      }

                  const matchesStatusFilter = (() => {
                    switch (shipmentStatusFilter) {
                      case 'packing':
                        return noteStatus === 'draft' || noteStatus === 'packing';
          case 'in-transit':
            return noteStatus === 'registered';
          case 'delivered':
            return noteStatus === 'delivered' || noteStatus === 'rejected' || noteStatus === 'partially-delivered' || noteStatus === 'cancelled';
          case 'all':
          default:
            return ['draft', 'packing', 'registered', 'delivered', 'rejected', 'partially-delivered', 'cancelled'].includes(noteStatus);
        }
      })();

      return matchesSearch && matchesStatusFilter;
    }
    
    // For store staff: exclude draft/pending delivery notes - only show in-transit (registered) and delivered/rejected
    if ((role === 'store-staff' || role === 'admin' || role === 'store-manager') && (noteStatus === 'draft' || noteStatus === 'packing')) {
      return false;
    }
    
    const matchesTab = (activeTab === 'pending' && (noteStatus === 'draft' || noteStatus === 'packing')) ||
      (activeTab === 'in-transit' && noteStatus === 'registered') ||
      (activeTab === 'all' && (noteStatus === 'delivered' || noteStatus === 'rejected'));
    
    return matchesSearch && matchesTab;
  });
  
  // Apply sorting to shipments
  const sortedDeliveryNotes = role === 'partner'
    ? sortShipments(filteredDeliveryNotes, shipmentSort.field, shipmentSort.direction)
    : filteredDeliveryNotes;
  
  // Pagination for "All" tabs
  const paginatedDeliveryNotes = isAllTab
    ? sortedDeliveryNotes.slice(0, loadedItemsCount)
    : sortedDeliveryNotes;

  // Filter Sellpy orders (API integration orders for store staff - no filters needed as selection is done on home screen)
  const filteredSellpyOrders = sellpyOrders.filter(order => {
    const matchesSearch = searchTerm === '' || 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.receivingStore.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  }).sort((a, b) => {
    // Sort by createdDate descending (newest first)
    return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
  });

  // Determine what to show based on the tab and partner type
  const isChinesePartner = currentPartnerId === '6'; // Shenzhen Fashion Manufacturing
  const isThriftedPartner = currentPartnerId === '2'; // Thrifted
  const canPartnerDeleteDraftOrders = role === 'partner' && currentPartnerId === '2'; // Thrifted partner
  const canPartnerDeleteDraftOrPackingDeliveryNotes =
    role === 'partner' && (currentPartnerId === '1' || currentPartnerId === '2'); // Sellpy + Thrifted partners
  const canShowSalesMarginColumn = !isThriftedPartner && role !== 'partner';
  const showCreateOrderButton = role === 'partner' && isThriftedPartner && !!onCreateOrder;
  const showDeliveryNotes = role === 'partner' && !isChinesePartner && activeTab === 'in-transit';
  const showOrders = role === 'partner' && !isChinesePartner && activeTab === 'pending';
  const showReturns = activeTab === 'returns'; // Show returns for both partners and store staff
  // Store staff no longer has an 'orders' tab - removed
  const showSellpyOrders = false;

  const hasActivePartnerViewFilters =
    (viewFilter.brandIds?.length ?? 0) > 0 ||
    (viewFilter.countryIds?.length ?? 0) > 0 ||
    (viewFilter.storeIds?.length ?? 0) > 0;

  return (
    <div className="bg-surface relative size-full">
      {/* Spacer for top nav on desktop */}
      <div className="hidden md:block h-16"></div>
      {/* Header */}
      <div className="sticky top-0 md:top-16 bg-surface z-[90] border-b border-outline-variant">
        <div className="px-4 md:px-6 py-4 md:pt-4">
          <h3 className="headline-small text-on-surface">
            {role === 'partner' ? 'Orders & Shipments' : 'Shipping'}
          </h3>

          {showCreateOrderButton && (
            <div className="mt-4 md:max-w-sm md:w-auto">
              <Button
                onClick={() => onCreateOrder?.()}
                className="w-full md:w-auto justify-center h-14 rounded-[12px] gap-3 bg-primary text-on-primary hover:bg-primary/90 transition-colors px-6"
              >
                <Plus className="w-5 h-5" />
                <span className="label-large">Create order</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Content - M3 Grid: 16px mobile, 24px tablet+ */}
      <div className="px-4 md:px-6 pt-4 md:pt-6">
        
        {/* Search row + store filter (partner); label from sm (tablet) up, icon-only on narrow mobile */}
        <div className="mb-4">
          <div className="flex gap-3 items-start">
            <div className="relative md:max-w-2xl flex-1 min-w-0">
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <Search className="w-5 h-5 text-on-surface-variant" />
                </div>
                <input
                  type="text"
                  id="shipping-search"
                  name="shipping-search"
                  placeholder={showReturns ? "Search for return delivery ID or store name" : 
                    showSellpyOrders ? "Search for order ID or store name" :
                    role === 'partner' ? "Search for order ID or delivery note" : "Search for delivery ID"
                  }
                  value={searchTerm}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="w-full h-12 pl-10 pr-4 bg-surface-container rounded-lg border border-outline-variant focus:border-primary focus:outline-none text-on-surface body-large"
                />
              </div>
            </div>

            {role === 'partner' && brands && brands.length > 0 && (
              <StoreFilterBottomSheet
                viewFilter={viewFilter}
                onViewAllStores={handleViewAllStores}
                onBrandFilterChange={handleBrandFilterChange}
                onStoreFilterChange={handleStoreFilterChange}
                onCountryFilterChange={handleCountryFilterChange}
                currentPartnerId={currentPartnerId || ''}
                partners={[]}
                brands={brands}
                stores={stores || []}
                countries={countries || []}
              >
                <button
                  type="button"
                  aria-label="Store filter"
                  className={`
                    h-12 min-w-12 px-3 border transition-colors inline-flex items-center justify-center gap-2 flex-shrink-0 rounded-[8px]
                    ${hasActivePartnerViewFilters
                      ? 'bg-secondary-container border-outline text-on-secondary-container'
                      : 'bg-surface border-outline text-on-surface-variant hover:bg-surface-container-high'
                    }
                  `}
                >
                  <FilterIcon size={20} className="shrink-0" />
                  <span
                    className={
                      showPartnerStoreFilterLabel
                        ? 'label-medium whitespace-nowrap shrink-0'
                        : 'label-medium hidden whitespace-nowrap shrink-0'
                    }
                  >
                    Store filter
                  </span>
                  {hasActivePartnerViewFilters && (
                    <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                  )}
                </button>
              </StoreFilterBottomSheet>
            )}
          </div>

          {/* Active view filters as blue bubbles (one bubble per category) */}
          {role === 'partner' && hasActivePartnerViewFilters && (
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              {(viewFilter.brandIds?.length || 0) > 0 && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-container text-on-primary-container label-small">
                  <span className="whitespace-nowrap">
                    {viewFilter.brandIds!.length === 1
                      ? (brands?.find(b => b.id === viewFilter.brandIds![0])?.name ?? `Brand (1)`)
                      : `Brand (${viewFilter.brandIds!.length})`}
                  </span>
                  <button
                    type="button"
                    aria-label="Clear brand filters"
                    className="hover:opacity-70"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleBrandFilterChange([]);
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {(viewFilter.countryIds?.length || 0) > 0 && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-container text-on-primary-container label-small">
                  <span className="whitespace-nowrap">
                    {viewFilter.countryIds!.length === 1
                      ? (countries?.find(c => c.id === viewFilter.countryIds![0])?.name ?? `Country (1)`)
                      : `Country (${viewFilter.countryIds!.length})`}
                  </span>
                  <button
                    type="button"
                    aria-label="Clear country filters"
                    className="hover:opacity-70"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleCountryFilterChange([]);
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {(viewFilter.storeIds?.length || 0) > 0 && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-container text-on-primary-container label-small">
                  <span className="whitespace-nowrap">
                    {viewFilter.storeIds!.length === 1
                      ? (stores?.find(s => s.id === viewFilter.storeIds![0])?.name ?? `Store (1)`)
                      : `Store (${viewFilter.storeIds!.length})`}
                  </span>
                  <button
                    type="button"
                    aria-label="Clear store filters"
                    className="hover:opacity-70"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleStoreFilterChange([]);
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tabs */}
        <Tabs
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
          userRole={role}
        />

        {role === 'partner' && showOrders && !isChinesePartner && (
          <div className="mb-4 -mx-4 md:-mx-6 px-4 md:px-6 py-3 bg-surface border-b border-outline-variant">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {orderStatusFilterOptions.map(({ id, label }) => {
              const isActive = orderStatusFilter === id;
              // Calculate count for this filter
              const count = (() => {
                if (!partnerOrdersList || partnerOrdersList.length === 0) return 0;
                
                return partnerOrdersList.filter(order => {
                  // Filter out approval orders for non-admin users
                  if (order.status === 'approval' && !isAdmin) {
                    return false;
                  }
                  
                  const matchesSearch = searchTerm === '' || 
                    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (order.deliveryNote && order.deliveryNote.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (order.partnerName && order.partnerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (order.receivingStoreName && order.receivingStoreName.toLowerCase().includes(searchTerm.toLowerCase()));
                  const matchesPartner = !currentPartnerId || order.partnerId === currentPartnerId;
                  const matchesWarehouse = !currentWarehouseId || order.warehouseId === currentWarehouseId;
                  
                  if (!matchesSearch || !matchesPartner || !matchesWarehouse) {
                    return false;
                  }
                  
                  // Apply brand/country/store filters (for partner portal only)
                  if (role === 'partner') {
                    const orderStore = order.receivingStoreId ? stores?.find(s => s.id === order.receivingStoreId) : null;
                    
                    // Check brand filter
                    if (viewFilter.brandIds && viewFilter.brandIds.length > 0) {
                      if (!orderStore || !viewFilter.brandIds.includes(orderStore.brandId)) {
                        return false;
                      }
                    }
                    
                    // Check country filter
                    if (viewFilter.countryIds && viewFilter.countryIds.length > 0) {
                      if (!orderStore || !viewFilter.countryIds.includes(orderStore.countryId)) {
                        return false;
                      }
                    }
                    
                    // Check store filter
                    if (viewFilter.storeIds && viewFilter.storeIds.length > 0) {
                      if (!order.receivingStoreId || !viewFilter.storeIds.includes(order.receivingStoreId)) {
                        return false;
                      }
                    }
                  }
                  
                  // Check status filter
                  switch (id) {
                    case 'approval':
                      return order.status === 'approval';
                    case 'pending':
                      return order.status === 'pending';
                    case 'draft':
                      return order.status === 'draft';
                    case 'registered':
                      return order.status === 'registered';
                    case 'in-transit':
                      return order.status === 'in-transit';
                    case 'all':
                    default:
                      return ['approval', 'pending', 'draft', 'registered', 'in-transit', 'in-review', 'delivered'].includes(order.status);
                  }
                }).length;
              })();
              
              return (
                <button
                  key={id}
                  onClick={() => setOrderStatusFilter(id)}
                  className={`flex-shrink-0 h-11 flex items-center justify-center px-4 py-2 rounded-lg border label-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-primary text-on-primary border-primary'
                      : 'bg-surface border-outline-variant text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  {label} ({count})
                </button>
              );
            })}
            </div>
          </div>
        )}

        {role === 'partner' && activeTab === 'in-transit' && (
          <div className="mb-4 -mx-4 md:-mx-6 px-4 md:px-6 py-3 bg-surface border-b border-outline-variant">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {shipmentStatusFilterOptions.map(({ id, label }) => {
              const isActive = shipmentStatusFilter === id;
              // Calculate count for this filter
              const count = (() => {
                if (!deliveryNotes) return 0;
                
                return deliveryNotes.filter(note => {
                  const matchesSearch = searchTerm === '' || 
                    note.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    note.orderId.toLowerCase().includes(searchTerm.toLowerCase());
                  const matchesPartner = !currentPartnerId || note.partnerId === currentPartnerId;
                  const matchesWarehouse = !currentWarehouseId || note.warehouseId === currentWarehouseId;
                  
                  if (!matchesSearch || !matchesPartner || !matchesWarehouse) {
                    return false;
                  }
                  
                  const noteStatus = note.status || 'draft';
                  switch (id) {
                    case 'packing':
                      return noteStatus === 'draft' || noteStatus === 'packing';
                    case 'in-transit':
                      return noteStatus === 'registered';
                    case 'delivered':
                      return noteStatus === 'delivered' || noteStatus === 'rejected' || noteStatus === 'partially-delivered' || noteStatus === 'cancelled';
                    case 'all':
                    default:
                      return ['draft', 'packing', 'registered', 'delivered', 'rejected', 'partially-delivered', 'cancelled'].includes(noteStatus);
                  }
                }).length;
              })();
              
              return (
                <button
                  key={id}
                  onClick={() => setShipmentStatusFilter(id)}
                  className={`flex-shrink-0 h-11 flex items-center justify-center px-4 py-2 rounded-lg border label-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-primary text-on-primary border-primary'
                      : 'bg-surface border-outline-variant text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  {label} ({count})
                </button>
              );
            })}
            </div>
          </div>
        )}

        {role === 'partner' && activeTab === 'returns' && (
          <div className="mb-4 -mx-4 md:-mx-6 px-4 md:px-6 py-3 bg-surface border-b border-outline-variant">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {returnStatusFilterOptions.map(({ id, label }) => {
              const isActive = returnStatusFilter === id;
              // Calculate count for this filter
              const count = (() => {
                if (!returnDeliveries || returnDeliveries.length === 0) return 0;
                
                return returnDeliveries.filter(delivery => {
                  // For partners: exclude Pending returns
                  if (role === 'partner' && delivery.status === 'Pending') {
                    return false;
                  }
                  
                  const matchesSearch = searchTerm === '' || 
                    delivery.deliveryId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    delivery.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    delivery.storeCode.toLowerCase().includes(searchTerm.toLowerCase());
                  
                  // For partners: only show their return deliveries
                  const matchesPartner = !currentPartnerId || delivery.partnerId === currentPartnerId;
                  const matchesWarehouse = !currentWarehouseId || delivery.warehouseId === currentWarehouseId;
                  
                  if (!matchesSearch || !matchesPartner || !matchesWarehouse) {
                    return false;
                  }
                  
                  // Check status filter
                  switch (id) {
                    case 'in-transit':
                      return delivery.status === 'In transit';
                    case 'returned':
                      return delivery.status === 'Returned';
                    case 'all':
                    default:
                      // For partners: only count In transit and Returned
                      if (role === 'partner') {
                        return delivery.status === 'In transit' || delivery.status === 'Returned';
                      }
                      return true;
                  }
                }).length;
              })();
              
              return (
                <button
                  key={id}
                  onClick={() => setReturnStatusFilter(id)}
                  className={`flex-shrink-0 h-11 flex items-center justify-center px-4 py-2 rounded-lg border label-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-primary text-on-primary border-primary'
                      : 'bg-surface border-outline-variant text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  {label} ({count})
                </button>
              );
            })}
            </div>
          </div>
        )}

        {/* Count Display - Hidden for partner portal orders, shipments, and returns tabs (counts shown in filter chips) */}
        {!(role === 'partner' && ((activeTab === 'pending' && showOrders && !isChinesePartner) || (activeTab === 'in-transit' && showDeliveryNotes) || activeTab === 'returns')) && (
          <div className="mb-3">
            <span className="body-medium text-on-surface font-normal">
              {showReturns ?
                `${filteredReturnDeliveries.length} return deliveries` :
                showSellpyOrders ?
                  `${filteredSellpyOrders.length} orders` :
                role === 'partner' ? 
                  (showDeliveryNotes ? 
                      `${filteredDeliveryNotes.length} ${shipmentStatusFilter === 'delivered' ? 'deliveries' : 'shipments'}` :
                      `${filteredPartnerOrders.length} orders`
                  ) :
                  activeTab === 'all' ?
                    `${filteredDeliveries.length + filteredReturnDeliveries.length} deliveries` :
                    `${filteredDeliveries.length} deliveries`
              }
            </span>
          </div>
        )}

        {/* List Content - Role-specific */}
        <div className="space-y-0 mb-4">
          {showReturns ? (
            // Returns View - Different for partners vs store staff
            role === 'partner' ? (
              // Partner View - Show Return Deliveries
              filteredReturnDeliveries.length > 0 ? (
                <>
                  {/* Mobile: Card View */}
                  <div className="flex lg:!hidden flex-col gap-2" data-tablet-mobile-only>
                    {sortedReturnDeliveries.map((returnDelivery) => (
                      <div key={returnDelivery.id} className="bg-surface border border-outline-variant rounded-lg overflow-hidden">
                        <ReturnDeliveryComponent 
                          returnDelivery={returnDelivery}
                          onUpdateStatus={onUpdateReturnDeliveryStatus}
                          onCancel={onCancelReturn}
                          onClick={() => onOpenReturnDetails?.(returnDelivery, activeTab, returnStatusFilter)}
                          stores={stores}
                          brands={brands}
                          warehouses={warehouses}
                          userRole={role}
                        />
                      </div>
                    ))}
                  </div>
                  
                  {/* Desktop: Table View */}
                  <div 
                    className="hidden lg:!block bg-surface border border-outline-variant rounded-lg overflow-hidden" data-desktop-table
                    onScroll={handleScroll}
                    style={{ maxHeight: isAllTab ? '70vh' : 'auto', overflowY: isAllTab ? 'auto' : 'visible' }}
                  >
                    <table className="w-full">
                      <thead className="bg-surface-container-high border-b border-outline-variant sticky top-0 z-10">
                        <tr>
                          {(role === 'partner' as any) ? (
                            <>
                              <SortableHeader field="date" label="Date" currentSort={returnSort} onSort={handleReturnSort} />
                              <SortableHeader field="id" label="Delivery ID" currentSort={returnSort} onSort={handleReturnSort} />
                              <SortableHeader field="senderReceiver" label="Sender / Receiver" currentSort={returnSort} onSort={handleReturnSort} />
                              <SortableHeader field="items" label="Items" currentSort={returnSort} onSort={handleReturnSort} align="right" />
                              <SortableHeader field="status" label="Status" currentSort={returnSort} onSort={handleReturnSort} align="right" />
                            </>
                          ) : (
                            <>
                              <th className="px-4 py-3 text-left title-small text-on-surface">Date</th>
                              <th className="px-4 py-3 text-left title-small text-on-surface">Delivery ID</th>
                              <th className="px-4 py-3 text-left title-small text-on-surface">Receiver (Partner)</th>
                              <th className="px-4 py-3 text-right title-small text-on-surface">Items</th>
                              <th className="px-4 py-3 text-right title-small text-on-surface">Status</th>
                            </>
                          )}
                          <th className="px-4 py-3 text-right title-small text-on-surface"></th>
                        </tr>
                      </thead>
                      <tbody>
                      {paginatedReturnDeliveries.map((returnDelivery) => {
                          const { sender, storeNameDisplay, receiver } = resolveReturnDeliveryParties(
                            returnDelivery,
                            stores,
                            brands,
                            warehouses
                          );
                          const shouldShowStoreName = Boolean(storeNameDisplay && sender !== storeNameDisplay);
                          return (
                            <tr 
                              key={returnDelivery.id}
                              className="border-b border-outline-variant last:border-b-0 hover:bg-surface-container-high transition-colors"
                            >
                              <td className="px-4 py-3 body-small text-on-surface-variant">{returnDelivery.date}</td>
                              <td 
                                className="px-4 py-3 body-medium text-on-surface cursor-pointer"
                                onClick={() => onOpenReturnDetails?.(returnDelivery, activeTab, returnStatusFilter)}
                              >{returnDelivery.deliveryId}</td>
                              <td 
                                className="px-4 py-3 body-small text-on-surface-variant cursor-pointer"
                                onClick={() => onOpenReturnDetails?.(returnDelivery, activeTab, returnStatusFilter)}
                              >
                                <div className="space-y-0.5">
                                  <span className="block">From: {sender}</span>
                                  {shouldShowStoreName && (
                                    <span className="block text-on-surface-variant">{storeNameDisplay}</span>
                                  )}
                                  <span className="block">To: {receiver}</span>
                                </div>
                              </td>
                              <td 
                                className="px-4 py-3 body-medium text-on-surface text-right cursor-pointer"
                                onClick={() => onOpenReturnDetails?.(returnDelivery, activeTab, returnStatusFilter)}
                              >{returnDelivery.items}</td>
                              <td 
                                className="px-4 py-3 text-right cursor-pointer"
                                onClick={() => onOpenReturnDetails?.(returnDelivery, activeTab, returnStatusFilter)}
                              >
                                <div className={`inline-flex px-3 py-1.5 rounded-full label-medium min-w-[120px] justify-center ${
                                  returnDelivery.status === 'Pending' ? 'bg-warning-container text-on-warning-container' :
                                  returnDelivery.status === 'In transit' ? 'bg-primary-container text-on-primary-container' :
                                  returnDelivery.status === 'Returned' ? 'bg-success-container text-on-success-container' :
                                  'bg-surface-container-high text-on-surface-variant'
                                }`}>
                                  {returnDelivery.status}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-right">
                                {returnDelivery.status !== 'Returned' && onUpdateReturnDeliveryStatus && role === 'partner' && (
                                  <button 
                                    className="px-4 py-2 bg-primary text-on-primary rounded-lg label-medium hover:bg-primary/90 transition-colors min-h-[44px]"
                                    onClick={(e: ReactMouseEvent<HTMLButtonElement>) => {
                                      e.stopPropagation();
                                      onUpdateReturnDeliveryStatus(returnDelivery.id, 'Returned');
                                    }}
                                  >
                                    Mark as returned
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 px-4">
                  <div className="text-center space-y-2">
                    <h5 className="title-medium text-on-surface">
                      No return deliveries found
                    </h5>
                    <p className="body-medium text-on-surface-variant">
                      Return deliveries from stores will appear here
                    </p>
                  </div>
                </div>
              )
            ) : (
              // Store Staff View - Show Return Deliveries (read-only, no status updates)
              filteredReturnDeliveries.length > 0 ? (
                <>
                  {/* Mobile: Card View */}
                  <div className="flex lg:!hidden flex-col gap-2" data-tablet-mobile-only>
                    {sortedReturnDeliveries.map((returnDelivery) => (
                      <div key={returnDelivery.id} className="bg-surface border border-outline-variant rounded-lg overflow-hidden">
                        <ReturnDeliveryComponent 
                          returnDelivery={returnDelivery}
                          onUpdateStatus={onUpdateReturnDeliveryStatus}
                          onCancel={onCancelReturn}
                          onClick={() => onOpenReturnDetails?.(returnDelivery, activeTab, returnStatusFilter)}
                          stores={stores}
                          brands={brands}
                          warehouses={warehouses}
                          userRole={role}
                        />
                      </div>
                    ))}
                  </div>
                  
                  {/* Desktop: Table View */}
                  <div 
                    className="hidden lg:!block bg-surface border border-outline-variant rounded-lg overflow-hidden" data-desktop-table
                    onScroll={handleScroll}
                    style={{ maxHeight: isAllTab ? '70vh' : 'auto', overflowY: isAllTab ? 'auto' : 'visible' }}
                  >
                    <table className="w-full">
                      <thead className="bg-surface-container-high border-b border-outline-variant sticky top-0 z-10">
                        <tr>
                          {(role === 'partner' as any) ? (
                            <>
                              <SortableHeader field="date" label="Date" currentSort={returnSort} onSort={handleReturnSort} />
                              <SortableHeader field="id" label="Delivery ID" currentSort={returnSort} onSort={handleReturnSort} />
                              <SortableHeader field="senderReceiver" label="Sender / Receiver" currentSort={returnSort} onSort={handleReturnSort} />
                              <SortableHeader field="items" label="Items" currentSort={returnSort} onSort={handleReturnSort} align="right" />
                              <SortableHeader field="status" label="Status" currentSort={returnSort} onSort={handleReturnSort} align="right" />
                            </>
                          ) : (
                            <>
                              <th className="px-4 py-3 text-left title-small text-on-surface">Date</th>
                              <th className="px-4 py-3 text-left title-small text-on-surface">Delivery ID</th>
                              <th className="px-4 py-3 text-left title-small text-on-surface">Receiver (Partner)</th>
                              <th className="px-4 py-3 text-right title-small text-on-surface">Items</th>
                              <th className="px-4 py-3 text-right title-small text-on-surface">Status</th>
                            </>
                          )}
                          <th className="px-4 py-3 text-right title-small text-on-surface"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedReturnDeliveries.map((returnDelivery) => {
                          const partnerDisplay = returnDelivery.partnerName || '-';
                          const warehouseDisplay =
                            returnDelivery.warehouseName ||
                            (returnDelivery.warehouseId
                              ? warehouses?.find(warehouse => warehouse.id === returnDelivery.warehouseId)?.name
                              : undefined);

                          return (
                            <tr 
                              key={returnDelivery.id}
                              className="border-b border-outline-variant last:border-b-0 hover:bg-surface-container-high transition-colors"
                            >
                              <td className="px-4 py-3 body-small text-on-surface-variant">{returnDelivery.date}</td>
                              <td 
                                className="px-4 py-3 body-medium text-on-surface cursor-pointer"
                                onClick={() => onOpenReturnDetails?.(returnDelivery, activeTab, returnStatusFilter)}
                              >{returnDelivery.deliveryId}</td>
                              <td 
                                className="px-4 py-3 body-medium text-on-surface cursor-pointer"
                                onClick={() => onOpenReturnDetails?.(returnDelivery, activeTab, returnStatusFilter)}
                              >
                                <div className="space-y-0.5">
                                  <span className="block">{partnerDisplay}</span>
                                  {warehouseDisplay && (
                                    <span className="block text-on-surface-variant">{warehouseDisplay}</span>
                                  )}
                                </div>
                              </td>
                              <td 
                                className="px-4 py-3 body-medium text-on-surface text-right cursor-pointer"
                                onClick={() => onOpenReturnDetails?.(returnDelivery, activeTab, returnStatusFilter)}
                              >{returnDelivery.items}</td>
                              <td 
                                className="px-4 py-3 text-right cursor-pointer"
                                onClick={() => onOpenReturnDetails?.(returnDelivery, activeTab, returnStatusFilter)}
                              >
                                <div className={`inline-flex px-3 py-1.5 rounded-full label-medium min-w-[120px] justify-center ${
                                  returnDelivery.status === 'Pending' ? 'bg-warning-container text-on-warning-container' :
                                  returnDelivery.status === 'In transit' ? 'bg-primary-container text-on-primary-container' :
                                  returnDelivery.status === 'Returned' ? 'bg-success-container text-on-success-container' :
                                  'bg-surface-container-high text-on-surface-variant'
                                }`}>
                                  {returnDelivery.status}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-right">
                                {/* No action buttons for store staff - returns can only be marked as returned by partners */}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 px-4">
                  <div className="text-center space-y-2">
                    <h5 className="title-medium text-on-surface">
                      No return deliveries found
                    </h5>
                    <p className="body-medium text-on-surface-variant">
                      Return deliveries to partners will appear here
                    </p>
                  </div>
                </div>
              )
            )
          ) : showSellpyOrders ? (
            // Store Staff - API Orders Tab - Show Sellpy Orders
            filteredSellpyOrders.length > 0 ? (
              <>
                {/* Mobile: Card View */}
                <div className="flex lg:!hidden flex-col gap-2" data-tablet-mobile-only>
                  {filteredSellpyOrders.map((order) => (
                    <div key={order.id} className="bg-surface border border-outline-variant rounded-lg overflow-hidden">
                      <SellpyOrderItem 
                        order={order}
                        onClick={() => handleSellpyOrderSelect(order.id)}
                      />
                    </div>
                  ))}
                </div>
                
                {/* Desktop: Table View */}
                <div className="hidden lg:!block bg-surface border border-outline-variant rounded-lg overflow-hidden" data-desktop-table>
                  <table className="w-full">
                    <thead className="bg-surface-container-high border-b border-outline-variant">
                      <tr>
                        <th className="px-4 py-3 text-left title-small text-on-surface">Date</th>
                        <th className="px-4 py-3 text-left title-small text-on-surface">Order ID</th>
                        <th className="px-4 py-3 text-left title-small text-on-surface">Status</th>
                        <th className="px-4 py-3 text-left title-small text-on-surface">Progress</th>
                        <th className="px-4 py-3 text-left title-small text-on-surface">Store</th>
                        <th className="px-4 py-3 text-right title-small text-on-surface"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSellpyOrders.map((order) => {
                        const getStatusColor = (status: SellpyOrder['status']) => {
                          switch (status) {
                            case 'pending': return 'text-on-surface-variant';
                            case 'in-progress': return 'text-primary';
                            case 'completed': return 'text-tertiary';
                            case 'registered': return 'text-tertiary';
                            default: return 'text-on-surface-variant';
                          }
                        };

                        const getStatusDisplay = (status: SellpyOrder['status']) => {
                          switch (status) {
                            case 'pending': return 'Pending';
                            case 'in-progress': return 'In Progress';
                            case 'completed': return 'Completed';
                            case 'registered': return 'Registered';
                            default: return status;
                          }
                        };
                        
                        return (
                          <tr 
                            key={order.id}
                            onClick={() => handleSellpyOrderSelect(order.id)}
                            className="border-b border-outline-variant last:border-b-0 hover:bg-surface-container-high transition-colors cursor-pointer"
                          >
                            <td className="px-4 py-3 body-medium text-on-surface-variant">{order.createdDate}</td>
                            <td className="px-4 py-3 body-medium text-on-surface">{order.id}</td>
                            <td className="px-4 py-3">
                              <span className={`body-medium ${getStatusColor(order.status)}`}>
                                {getStatusDisplay(order.status)}
                              </span>
                            </td>
                            <td className="px-4 py-3 body-medium text-on-surface-variant">
                              {order.itemsWithRetailerIds} / {order.totalItems} items
                            </td>
                            <td className="px-4 py-3 body-medium text-on-surface">{order.receivingStore}</td>
                            <td className="px-4 py-3 text-right">
                              <ChevronRight className="w-5 h-5 text-on-surface-variant inline-block" />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="text-center space-y-2">
                  <h5 className="title-medium text-on-surface">
                    No API orders found
                  </h5>
                  <p className="body-medium text-on-surface-variant">
                    Orders from API integrations will appear here
                  </p>
                </div>
              </div>
            )
          ) : role === 'partner' ? (
            // Partner View - Show delivery notes or regular orders
            showDeliveryNotes && filteredDeliveryNotes.length > 0 ? (
              // Show Delivery Notes (Shipments)
              <>
                {/* Mobile: Card View */}
                <div className="flex lg:!hidden flex-col gap-2" data-tablet-mobile-only>
                  {sortedDeliveryNotes.map((deliveryNote) => {
                    const inTransitOver10 = isDeliveryNoteInTransitOver10Days(deliveryNote);
                    return (
                      <div
                        key={deliveryNote.id}
                        className={`bg-surface rounded-lg overflow-hidden border ${inTransitOver10 ? 'border-2 border-error' : 'border border-outline-variant'}`}
                      >
                        <PartnerDeliveryNoteItem 
                          deliveryNote={deliveryNote}
                          orders={partnerOrdersList}
                          onClick={() => onOpenShipmentDetails?.(deliveryNote, activeTab, shipmentStatusFilter)}
                          isAdmin={isAdmin}
                          canDeleteDraftOrPacking={canPartnerDeleteDraftOrPackingDeliveryNotes}
                          onDelete={onDeleteDeliveryNote}
                          showSenderReceiver={true}
                          stores={stores}
                          brands={brands}
                          warehouses={warehouses}
                          inTransitOver10Days={inTransitOver10}
                        />
                      </div>
                    );
                  })}
                </div>
                
                {/* Desktop: Table View */}
                <div 
                  className="hidden lg:!block bg-surface border border-outline-variant rounded-lg overflow-hidden" data-desktop-table
                  onScroll={handleScroll}
                  style={{ maxHeight: isAllTab ? '70vh' : 'auto', overflowY: isAllTab ? 'auto' : 'visible' }}
                >
                  <table className="w-full">
                    <thead className="bg-surface-container-high border-b border-outline-variant sticky top-0 z-10">
                      <tr>
                        {role === 'partner' ? (
                          <>
                            <SortableHeader field="date" label="Date" currentSort={shipmentSort} onSort={handleShipmentSort} />
                            <SortableHeader field="id" label="Delivery ID" currentSort={shipmentSort} onSort={handleShipmentSort} />
                            <SortableHeader field="senderReceiver" label="Sender / Receiver" currentSort={shipmentSort} onSort={handleShipmentSort} />
                            <SortableHeader field="items" label="Items" currentSort={shipmentSort} onSort={handleShipmentSort} align="right" />
                            <SortableHeader field="boxes" label="Boxes" currentSort={shipmentSort} onSort={handleShipmentSort} align="right" />
                            <SortableHeader field="status" label="Status" currentSort={shipmentSort} onSort={handleShipmentSort} align="right" />
                          </>
                        ) : (
                          <>
                            <th className="px-4 py-3 text-left title-small text-on-surface">Date</th>
                            <th className="px-4 py-3 text-left title-small text-on-surface">Delivery ID</th>
                            <th className="px-4 py-3 text-left title-small text-on-surface">Sender / Receiver</th>
                            <th className="px-4 py-3 text-right title-small text-on-surface">Items</th>
                            <th className="px-4 py-3 text-right title-small text-on-surface">Boxes</th>
                            <th className="px-4 py-3 text-right title-small text-on-surface">Status</th>
                          </>
                        )}
                        <th className="px-4 py-3 text-right title-small text-on-surface"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedDeliveryNotes.map((deliveryNote) => {
                        const noteStatus = deliveryNote.status as DeliveryNoteStatus;
                        const { relatedOrdersForParties: relatedOrders, itemCount: totalItems } =
                          getDeliveryNoteShipmentCounts(deliveryNote, partnerOrdersList);
                        const { sender, warehouse, receiver, storeNameDisplay } = resolveDeliveryNoteParties(
                          deliveryNote,
                          relatedOrders,
                          stores,
                          brands,
                          warehouses
                        );
                        const inTransitOver10 = isDeliveryNoteInTransitOver10Days(deliveryNote);
                        
                        return (
                          <tr 
                            key={deliveryNote.id}
                            className={`border-b border-outline-variant last:border-b-0 hover:bg-surface-container-high transition-colors ${inTransitOver10 ? 'border-l-4 border-l-error' : ''}`}
                          >
                            <td className="px-4 py-3 body-small text-on-surface-variant">{deliveryNote.createdDate}</td>
                            <td 
                              className="px-4 py-3 body-medium text-on-surface cursor-pointer"
                              onClick={() => onOpenShipmentDetails?.(deliveryNote, activeTab, shipmentStatusFilter)}
                            >{deliveryNote.id}</td>
                            <td 
                              className="px-4 py-3 body-small text-on-surface-variant cursor-pointer"
                              onClick={() => onOpenShipmentDetails?.(deliveryNote, activeTab, shipmentStatusFilter)}
                            >
                              <div className="space-y-0.5">
                                {warehouse ? (
                                  <span className="block">From: {warehouse}</span>
                                ) : (
                                  <span className="block">From: {sender || '-'}</span>
                                )}
                                <span className="block">To: {receiver || '-'}</span>
                                {storeNameDisplay && (
                                  <span className="block text-on-surface-variant">{storeNameDisplay}</span>
                                )}
                              </div>
                            </td>
                            <td
                              className="px-4 py-3 body-medium text-on-surface text-right cursor-pointer"
                              onClick={() => onOpenShipmentDetails?.(deliveryNote, activeTab, shipmentStatusFilter)}
                            >{totalItems}</td>
                            <td 
                              className="px-4 py-3 body-medium text-on-surface text-right cursor-pointer"
                              onClick={() => onOpenShipmentDetails?.(deliveryNote, activeTab, shipmentStatusFilter)}
                            >{deliveryNote.boxes?.length || 0}</td>
                            <td 
                              className="px-4 py-3 text-right cursor-pointer"
                              onClick={() => onOpenShipmentDetails?.(deliveryNote, activeTab, shipmentStatusFilter)}
                            >
                              <div className="flex flex-wrap items-center justify-end gap-1.5">
                                <div className={`inline-flex px-3 py-1.5 rounded-full label-medium min-w-[120px] justify-center ${getDeliveryNoteStatusBadgeColor(noteStatus)}`}>
                                  {getDeliveryNoteStatusDisplay(noteStatus)}
                                </div>
                                {inTransitOver10 && (
                                  <span className="label-medium text-error whitespace-nowrap">more than 10 days</span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              {(isAdmin || canPartnerDeleteDraftOrPackingDeliveryNotes) && (noteStatus === 'draft' || noteStatus === 'packing') && onDeleteDeliveryNote ? (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <button 
                                      className="p-2 rounded-full hover:bg-surface-container-high text-on-surface-variant transition-colors"
                                      onClick={(e: ReactMouseEvent<HTMLButtonElement>) => e.stopPropagation()}
                                    >
                                      <MoreVertical className="w-4 h-4" />
                                    </button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={(e: ReactMouseEvent<HTMLDivElement>) => {
                                        e.stopPropagation();
                                        if (confirm('Are you sure you want to delete this delivery? This action cannot be undone.')) {
                                          onDeleteDeliveryNote(deliveryNote.id);
                                        }
                                      }}
                                      className="text-error"
                                    >
                                      Delete delivery
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              ) : (
                                <button 
                                  className="p-2 text-on-surface-variant cursor-pointer"
                                  onClick={() => onOpenShipmentDetails?.(deliveryNote, activeTab, shipmentStatusFilter)}
                                >
                                  <ChevronRight className="w-5 h-5" />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            ) : showOrders && filteredPartnerOrders.length > 0 ? (
              // Show Regular Orders
              <>
                {/* Mobile: Card View */}
                <div className="flex lg:!hidden flex-col gap-2" data-tablet-mobile-only>
                  {sortedPartnerOrders.map((order) => (
                    <div key={order.id} className="bg-surface border border-outline-variant rounded-lg overflow-hidden">
                      <PartnerOrderItem 
                        order={order}
                        onClick={() => {
                          if (order.status === 'pending' && order.partnerName === 'Sellpy Operations') {
                            handleSellpyOrderSelect(order.id);
                          } else if (onOpenOrderDetails) {
                            onOpenOrderDetails(order, activeTab, orderStatusFilter);
                          }
                        }}
                        isClickable={true}
                        isSellpyPending={order.status === 'pending' && order.partnerName === 'Sellpy Operations'}
                        isAdmin={isAdmin}
                        canDeleteDraft={canPartnerDeleteDraftOrders}
                        onDelete={onDeletePartnerOrder}
                        onCreateDeliveryNote={onCreateDeliveryNoteForOrder}
                        showSenderReceiver={true}
                        stores={stores}
                        brands={brands}
                        warehouses={warehouses}
                      />
                    </div>
                  ))}
                </div>
                
                {/* Desktop: Table View */}
                <div 
                  className="hidden lg:!block bg-surface border border-outline-variant rounded-lg overflow-hidden" data-desktop-table
                  onScroll={handleScroll}
                  style={{ maxHeight: isAllTab ? '70vh' : 'auto', overflowY: isAllTab ? 'auto' : 'visible' }}
                >
                  <table className="w-full">
                    <thead className="bg-surface-container-high border-b border-outline-variant sticky top-0 z-10">
                      <tr>
                        {role === 'partner' ? (
                          <>
                            <SortableHeader field="date" label="Date" currentSort={orderSort} onSort={handleOrderSort} />
                            <SortableHeader field="id" label="Order ID" currentSort={orderSort} onSort={handleOrderSort} />
                            {!isThriftedPartner && (
                              <SortableHeader field="externalId" label="External Order ID" currentSort={orderSort} onSort={handleOrderSort} />
                            )}
                            <SortableHeader field="senderReceiver" label="Sender / Receiver" currentSort={orderSort} onSort={handleOrderSort} />
                            <SortableHeader field="items" label="Items" currentSort={orderSort} onSort={handleOrderSort} align="right" />
                            <SortableHeader field="orderValue" label="Order Value" currentSort={orderSort} onSort={handleOrderSort} align="right" />
                            {canShowSalesMarginColumn && (
                              <SortableHeader field="salesMargin" label="Sales Margin %" currentSort={orderSort} onSort={handleOrderSort} align="right" />
                            )}
                            <SortableHeader field="status" label="Status" currentSort={orderSort} onSort={handleOrderSort} align="right" />
                          </>
                        ) : (
                          <>
                            <th className="px-4 py-3 text-left title-small text-on-surface">Date</th>
                            <th className="px-4 py-3 text-left title-small text-on-surface">Order ID</th>
                            {!isThriftedPartner && (
                              <th className="px-4 py-3 text-left title-small text-on-surface">External Order ID</th>
                            )}
                            <th className="px-4 py-3 text-left title-small text-on-surface">Sender / Receiver</th>
                            <th className="px-4 py-3 text-right title-small text-on-surface">Items</th>
                            <th className="px-4 py-3 text-right title-small text-on-surface">Order Value</th>
                            {canShowSalesMarginColumn && (
                              <th className="px-4 py-3 text-right title-small text-on-surface">Sales Margin %</th>
                            )}
                            <th className="px-4 py-3 text-right title-small text-on-surface">Status</th>
                          </>
                        )}
                        <th className="px-4 py-3 text-right title-small text-on-surface"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedPartnerOrders.map((order) => {
                        const getStatusDisplay = (status: ShippingPartnerOrder['status']) => {
                          switch (status) {
                            case 'approval': return 'Approval';
                            case 'pending': return 'Pending';
                            case 'registered': return 'Ready for Packaging';
                            case 'in-transit': return 'In Transit';
                            case 'delivered': return 'Delivered';
                            case 'in-review': return 'In Review';
                            default: return status;
                          }
                        };

                        const getStatusBadgeColor = (status: ShippingPartnerOrder['status']) => {
                          switch (status) {
                            case 'approval': return 'bg-secondary-container text-on-secondary-container';
                            case 'pending': return 'bg-warning-container text-on-warning-container';
                            case 'registered': return 'bg-tertiary-container text-on-tertiary-container';
                            case 'in-transit': return 'bg-primary-container text-on-primary-container';
                            case 'delivered': return 'bg-success-container text-on-success-container';
                            case 'in-review': return 'bg-warning-container text-on-warning-container';
                            default: return 'bg-surface-container-high text-on-surface-variant';
                          }
                        };

                        const isSellpyPending = order.status === 'pending' && order.partnerName === 'Sellpy Operations';
                        const receiverDisplay = getReceiverDisplay(order.receivingStoreId, order.receivingStoreName);
                        const storeRecord = order.receivingStoreId ? stores?.find(store => store.id === order.receivingStoreId) : undefined;
                        const storeNameDisplay = storeRecord?.name || order.receivingStoreName;
                        const warehouseName = order.warehouseName || (order.warehouseId ? warehouses?.find(warehouse => warehouse.id === order.warehouseId)?.name : undefined);
                        
                        return (
                          <tr 
                            key={order.id}
                            className="border-b border-outline-variant last:border-b-0 hover:bg-surface-container-high transition-colors"
                          >
                            <td className="px-4 py-3 body-small text-on-surface-variant">{order.createdDate}</td>
                            <td 
                              className="px-4 py-3 body-medium text-on-surface cursor-pointer"
                              onClick={() => {
                                if (isSellpyPending) {
                                  handleSellpyOrderSelect(order.id);
                                } else if (onOpenOrderDetails) {
                                  onOpenOrderDetails(order, activeTab, orderStatusFilter);
                                }
                              }}
                            >{order.id}</td>
                            {!isThriftedPartner && (
                              <td 
                                className="px-4 py-3 body-small text-on-surface-variant cursor-pointer"
                                onClick={() => {
                                  if (isSellpyPending) {
                                    handleSellpyOrderSelect(order.id);
                                  } else if (onOpenOrderDetails) {
                                    onOpenOrderDetails(order, activeTab, orderStatusFilter);
                                  }
                                }}
                              >
                                {order.externalOrderId || '-'}
                              </td>
                            )}
                            <td 
                              className="px-4 py-3 body-small text-on-surface-variant cursor-pointer"
                              onClick={() => {
                                if (isSellpyPending) {
                                  handleSellpyOrderSelect(order.id);
                                } else if (onOpenOrderDetails) {
                                  onOpenOrderDetails(order, activeTab, orderStatusFilter);
                                }
                              }}
                            >
                              <div className="space-y-0.5">
                                {warehouseName && (
                                  <span className="block">From: {warehouseName}</span>
                                )}
                                {!warehouseName && order.partnerName && (
                                  <span className="block">From: {order.partnerName}</span>
                                )}
                                {receiverDisplay ? (
                                  <span className="block">To: {receiverDisplay}</span>
                                ) : (
                                  <span className="block">To: -</span>
                                )}
                                {storeNameDisplay && receiverDisplay !== storeNameDisplay && (
                                  <span className="block text-on-surface-variant">{storeNameDisplay}</span>
                                )}
                              </div>
                            </td>
                            <td 
                              className="px-4 py-3 body-medium text-on-surface text-right cursor-pointer"
                              onClick={() => {
                                if (isSellpyPending) {
                                  handleSellpyOrderSelect(order.id);
                                } else if (onOpenOrderDetails) {
                                  onOpenOrderDetails(order, activeTab, orderStatusFilter);
                                }
                              }}
                            >{order.itemCount}</td>
                            <td 
                              className="px-4 py-3 body-medium text-on-surface text-right cursor-pointer"
                              onClick={() => {
                                if (isSellpyPending) {
                                  handleSellpyOrderSelect(order.id);
                                } else if (onOpenOrderDetails) {
                                  onOpenOrderDetails(order, activeTab, orderStatusFilter);
                                }
                              }}
                            >
                              {order.orderValue ? `$${order.orderValue.toFixed(2)}` : '-'}
                            </td>
                            {canShowSalesMarginColumn && (
                              <td 
                                className="px-4 py-3 body-medium text-on-surface text-right cursor-pointer"
                                onClick={() => {
                                  if (isSellpyPending) {
                                    handleSellpyOrderSelect(order.id);
                                  } else if (onOpenOrderDetails) {
                                    onOpenOrderDetails(order, activeTab, orderStatusFilter);
                                  }
                                }}
                              >
                                {order.salesMargin !== undefined ? `${order.salesMargin.toFixed(1)}%` : '-'}
                              </td>
                            )}
                            <td 
                              className="px-4 py-3 text-right cursor-pointer"
                              onClick={() => {
                                if (isSellpyPending) {
                                  handleSellpyOrderSelect(order.id);
                                } else if (onOpenOrderDetails) {
                                  onOpenOrderDetails(order, activeTab, orderStatusFilter);
                                }
                              }}
                            >
                              <div className={`inline-flex px-3 py-1.5 rounded-full label-medium min-w-[140px] justify-center ${getStatusBadgeColor(order.status)}`}>
                                {getStatusDisplay(order.status)}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              {(
                                (onDeletePartnerOrder &&
                                  (
                                    (isAdmin && (order.status === 'pending' || order.status === 'draft')) ||
                                    (canPartnerDeleteDraftOrders && order.status === 'draft')
                                  )) ||
                                (order.status === 'registered' && onCreateDeliveryNoteForOrder)
                              ) ? (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <button 
                                      className="p-2 rounded-full hover:bg-surface-container-high text-on-surface-variant transition-colors"
                                      onClick={(e: ReactMouseEvent<HTMLButtonElement>) => e.stopPropagation()}
                                    >
                                      <MoreVertical className="w-4 h-4" />
                                    </button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-56">
                                    {order.status === 'registered' && onCreateDeliveryNoteForOrder && (
                                      <DropdownMenuItem
                                        onClick={(e: ReactMouseEvent<HTMLDivElement>) => {
                                          e.stopPropagation();
                                          onCreateDeliveryNoteForOrder(order.id);
                                        }}
                                        className="gap-2"
                                      >
                                        <Package className="w-4 h-4" />
                                        <span className="label-large">Create delivery note</span>
                                      </DropdownMenuItem>
                                    )}
                                    {(onDeletePartnerOrder &&
                                      (
                                        (isAdmin && (order.status === 'pending' || order.status === 'draft')) ||
                                        (canPartnerDeleteDraftOrders && order.status === 'draft')
                                      )) && (
                                      <DropdownMenuItem
                                        onClick={(e: ReactMouseEvent<HTMLDivElement>) => {
                                          e.stopPropagation();
                                          if (confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
                                            onDeletePartnerOrder(order.id);
                                          }
                                        }}
                                        className="text-error gap-2"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                        <span className="label-large">Delete order</span>
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              ) : (
                                <button 
                                  className="p-2 text-on-surface-variant cursor-pointer"
                                  onClick={() => {
                                    if (isSellpyPending) {
                                      handleSellpyOrderSelect(order.id);
                                    } else {
                                      if (onOpenOrderDetails) {
                                        onOpenOrderDetails(order, activeTab, orderStatusFilter);
                                      }
                                    }
                                  }}
                                >
                                  <ChevronRight className={`w-5 h-5 ${isSellpyPending ? 'text-primary' : 'text-on-surface-variant'}`} />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              // Empty State
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="text-center space-y-2">
                  <h5 className="title-medium text-on-surface">
                    {activeTab === 'pending' ? 'No orders found' :
                     activeTab === 'in-transit' ? (shipmentStatusFilter === 'delivered' ? 'No delivered shipments' : shipmentStatusFilter === 'all' ? 'No shipments found' : 'No shipments in transit') :
                     'No items found'}
                  </h5>
                  <p className="body-medium text-on-surface-variant">
                    {activeTab === 'pending' ? 'Create your first order to get started' :
                     activeTab === 'in-transit' ? (shipmentStatusFilter === 'delivered' ? 'Delivered shipments will appear here' : 'Orders will appear here once they are packaged and shipped') :
                     'Items will appear here when available'}
                  </p>
                </div>
              </div>
            )
          ) : (
            // Store Staff Deliveries View
            (filteredDeliveries.length > 0 || (activeTab === 'all' && filteredReturnDeliveries.length > 0)) ? (
              <>
                {/* Mobile: Card View */}
                <div className="flex lg:!hidden flex-col gap-2" data-tablet-mobile-only>
                  {filteredDeliveries.map((delivery) => (
                    <div key={delivery.id} className="bg-surface border border-outline-variant rounded-lg overflow-hidden">
                      <DeliveryItem 
                        delivery={delivery} 
                        onSelect={() => onSelectDelivery(delivery)} 
                      />
                    </div>
                  ))}
                  {activeTab === 'all' && sortedReturnDeliveries.map((returnDelivery) => (
                    <div key={returnDelivery.id} className="bg-surface border border-outline-variant rounded-lg overflow-hidden">
                      <ReturnDeliveryComponent 
                        returnDelivery={returnDelivery}
                        onUpdateStatus={onUpdateReturnDeliveryStatus}
                        onCancel={onCancelReturn}
                        onClick={() => onOpenReturnDetails?.(returnDelivery, activeTab)}
                        stores={stores}
                        brands={brands}
                        warehouses={warehouses}
                        userRole={role}
                      />
                    </div>
                  ))}
                </div>
                
                {/* Desktop: Table View */}
                <div className="hidden lg:!block bg-surface border border-outline-variant rounded-lg overflow-hidden" data-desktop-table>
                  <table className="w-full">
                    <thead className="bg-surface-container-high border-b border-outline-variant">
                      <tr>
                        <th className="px-4 py-3 text-left title-small text-on-surface">Date</th>
                        <th className="px-4 py-3 text-left title-small text-on-surface">Delivery ID</th>
                        <th className="px-4 py-3 text-left title-small text-on-surface">Sender</th>
                        <th className="px-4 py-3 text-right title-small text-on-surface">Items</th>
                        <th className="px-4 py-3 text-right title-small text-on-surface">Boxes</th>
                        <th className="px-4 py-3 text-right title-small text-on-surface">Status</th>
                        <th className="px-4 py-3 text-right title-small text-on-surface"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDeliveries.map((delivery) => {
                        const getStatusBadgeColor = (status: Delivery['status']) => {
                          switch (status) {
                            case 'Delivered': return 'bg-success-container text-on-success-container';
                            case 'In transit': return 'bg-primary-container text-on-primary-container';
                            case 'Partially Delivered': return 'bg-warning-container text-on-warning-container';
                            case 'Cancelled': return 'bg-error-container text-on-error-container';
                            default: return 'bg-surface-container-high text-on-surface-variant';
                          }
                        };
                        
                        const shouldHighlightStatus = delivery.status === 'Delivered' || delivery.status === 'In transit';
                        
                        return (
                          <tr 
                            key={delivery.id}
                            onClick={() => onSelectDelivery(delivery)}
                            className="border-b border-outline-variant last:border-b-0 hover:bg-surface-container-high transition-colors cursor-pointer"
                          >
                            <td className="px-4 py-3 body-medium text-on-surface-variant">{delivery.date}</td>
                            <td className="px-4 py-3 body-medium text-on-surface">{delivery.deliveryId}</td>
                            <td className="px-4 py-3 body-medium text-on-surface">{delivery.sender}</td>
                            <td className="px-4 py-3 body-medium text-on-surface text-right">{delivery.items}</td>
                            <td className="px-4 py-3 body-medium text-on-surface text-right">{delivery.boxes}</td>
                            <td className="px-4 py-3 text-right">
                              {shouldHighlightStatus ? (
                                <div className={`inline-flex px-3 py-1.5 rounded-full label-medium min-w-[120px] justify-center ${getStatusBadgeColor(delivery.status)}`}>
                                  {delivery.status}
                                </div>
                              ) : (
                                <span className={`body-medium ${delivery.status === 'In transit' ? 'text-primary' : delivery.status === 'Partially Delivered' ? 'text-warning' : delivery.status === 'Cancelled' ? 'text-error' : 'text-on-surface-variant'}`}>
                                  {delivery.status}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <ChevronRight className="w-5 h-5 text-on-surface-variant inline-block" />
                            </td>
                          </tr>
                        );
                      })}
                      {activeTab === 'all' && paginatedReturnDeliveries.map((returnDelivery) => {
                        const storeRecord = returnDelivery.storeId
                          ? stores?.find(store => store.id === returnDelivery.storeId)
                          : stores?.find(store => store.code === returnDelivery.storeCode);
                        const brandRecord = storeRecord ? brands?.find(brand => brand.id === storeRecord.brandId) : undefined;
                        const receiverDisplay = (() => {
                          const brandName = brandRecord?.name;
                          const code = storeRecord?.code || returnDelivery.storeCode;
                          if (brandName || code) {
                            return [brandName, code].filter(Boolean).join(' ').trim();
                          }
                          return returnDelivery.storeName;
                        })();

                        const getStatusBadgeColor = (status: ReturnDelivery['status']) => {
                          switch (status) {
                            case 'Pending': return 'bg-warning-container text-on-warning-container';
                            case 'In transit': return 'bg-primary-container text-on-primary-container';
                            case 'Returned': return 'bg-success-container text-on-success-container';
                            default: return 'bg-surface-container-high text-on-surface-variant';
                          }
                        };

                        const shouldHighlightStatus = returnDelivery.status === 'Pending' || returnDelivery.status === 'In transit' || returnDelivery.status === 'Returned';

                        return (
                          <tr 
                            key={returnDelivery.id}
                            onClick={() => onOpenReturnDetails?.(returnDelivery, activeTab, returnStatusFilter)}
                            className="border-b border-outline-variant last:border-b-0 hover:bg-surface-container-high transition-colors cursor-pointer"
                          >
                            <td className="px-4 py-3 body-medium text-on-surface-variant">{returnDelivery.date}</td>
                            <td className="px-4 py-3 body-medium text-on-surface">{returnDelivery.deliveryId}</td>
                            <td className="px-4 py-3 body-medium text-on-surface">{receiverDisplay}</td>
                            <td className="px-4 py-3 body-medium text-on-surface text-right">{returnDelivery.items}</td>
                            <td className="px-4 py-3 body-medium text-on-surface text-right">—</td>
                            <td className="px-4 py-3 text-right">
                              {shouldHighlightStatus ? (
                                <div className={`inline-flex px-3 py-1.5 rounded-full label-medium min-w-[120px] justify-center ${getStatusBadgeColor(returnDelivery.status)}`}>
                                  {returnDelivery.status}
                                </div>
                              ) : (
                                <span className={`body-medium ${returnDelivery.status === 'Pending' ? 'text-warning' : returnDelivery.status === 'In transit' ? 'text-primary' : 'text-on-surface-variant'}`}>
                                  {returnDelivery.status}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <ChevronRight className="w-5 h-5 text-on-surface-variant inline-block" />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="text-center space-y-2">
                  <h5 className="title-medium text-on-surface">
                    No deliveries found
                  </h5>
                  <p className="body-medium text-on-surface-variant">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      </div>
      
      {/* Floating Action Button for Scan Box - Only show for store staff */}
    </div>
  );
}