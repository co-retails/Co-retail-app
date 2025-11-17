import { useState, useEffect } from 'react';
import { Package, Truck, Search, ChevronRight, RotateCcw, CheckIcon, ClockIcon, Trash2, FilterIcon, MoreVertical, X, QrCode, ClipboardListIcon } from 'lucide-react';
import { UserRole } from './RoleSwitcher';
import type { ExtendedPartnerOrder } from './PartnerDashboard';
import { DeliveryNote } from './BoxManagementScreen';
import { ReturnItem } from './ReturnManagementScreen';
import { ShowroomOrder } from './ShowroomTypes';
import { OrderItem } from './OrderCreationScreen';
import StoreFilterBottomSheet, { ViewFilter } from './StoreFilterBottomSheet';
import { Button } from './ui/button';
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

type DeliveryNoteStatus = DeliveryNote['status'] | 'pending';
type ShippingTab = 'shipments' | 'returns' | 'all' | 'pending' | 'in-transit' | 'delivered' | 'pending-registered';
type OrderStatusFilter = 'approval' | 'pending' | 'registered' | 'in-transit' | 'all';
type ShipmentStatusFilter = 'packing' | 'in-transit' | 'delivered' | 'all';
type ReturnStatusFilter = 'in-transit' | 'returned' | 'all';
type ShippingUserRole = UserRole | 'admin' | 'store-manager' | 'buyer';

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
  status: 'In transit' | 'Delivered' | 'Partially Delivered' | 'Cancelled';
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
}

export interface ReturnDelivery {
  id: string;
  date: string;
  status: 'Pending' | 'In transit' | 'Returned';
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
  initialTab?: 'shipments' | 'returns' | 'all' | 'pending' | 'in-transit' | 'delivered' | 'registered' | 'orders' | 'pending-registered';
  currentUserRole?: ShippingUserRole;
  partnerOrders?: ShippingPartnerOrder[];
  deliveryNotes?: DeliveryNote[];
  returnItems?: ReturnItem[];
  returnDeliveries?: ReturnDelivery[];
  currentPartnerId?: string;
  currentWarehouseId?: string;
  onSelectSellpyOrder?: (order: SellpyOrder) => void;
  onUpdateReturnDeliveryStatus?: (deliveryId: string, status: 'Returned') => void;
  onCancelReturn?: (deliveryId: string) => void;
  onOpenOrderDetails?: (order: ShippingPartnerOrder) => void;
  onOpenShipmentDetails?: (deliveryNote: DeliveryNote) => void;
  onOpenReturnDetails?: (returnDelivery: ReturnDelivery) => void;
  showroomOrders?: ShowroomOrder[];
  onViewShowroomOrder?: (orderId: string) => void;
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
      <div className="flex border-b border-outline-variant">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className="flex-1 pb-3 pt-2 px-4 relative"
            onClick={() => onTabChange(tab.id)}
          >
            <div className={`title-small text-center ${
              activeTab === tab.id ? 'text-on-surface' : 'text-on-surface-variant'
            }`}>
              {tab.label}
            </div>
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function DeliveryItem({ delivery, onSelect }: { delivery: Delivery; onSelect: () => void }) {
  const getStatusBadgeClass = (status: Delivery['status']) => {
    if (status === 'Delivered') {
      return 'bg-success-container text-on-success-container';
    }
    return '';
  };

  const isDelivered = delivery.status === 'Delivered';

  return (
    <button
      className="w-full bg-surface-container hover:bg-surface-container-high transition-colors border-b border-outline-variant text-left"
      onClick={onSelect}
    >
      {/* M3 Three-line List Item - matching other screens pattern */}
      <div className="flex items-center gap-4 px-4 py-3">
        
        {/* Leading Element - Delivery Icon */}
        <div className="flex-shrink-0 w-10 h-10 bg-surface-container rounded-full flex items-center justify-center">
          <Package className="w-5 h-5 text-on-surface-variant" />
        </div>
        
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Top Line - Date and Status in smallest font (consistent with other screens) */}
          <div className="text-[11px] font-medium text-on-surface-variant leading-tight tracking-[0.5px] mb-0.5 flex items-center gap-1 flex-wrap">
            <span>{delivery.date},</span>
            {isDelivered ? (
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${getStatusBadgeClass(delivery.status)}`}>
                {delivery.status}
              </span>
            ) : (
              <span>{delivery.status}</span>
            )}
          </div>
          
          {/* Primary Line - Delivery ID (prominent) */}
          <div className="text-sm font-normal text-on-surface leading-tight mb-0.5 tracking-[0.25px]">
            <span className="block truncate">Delivery ID: {delivery.deliveryId}</span>
          </div>
          
          {/* Secondary Line - Orders and Items */}
          <div className="text-xs font-normal text-on-surface-variant leading-tight mb-0.5 tracking-[0.4px]">
            Orders: {delivery.orders}, Items: {delivery.items}
          </div>
          
          {/* Metadata Line - Sender */}
          <div className="text-[11px] font-medium text-on-surface-variant leading-tight tracking-[0.5px] opacity-90">
            <div className="truncate">Sender: {delivery.sender}</div>
          </div>
        </div>
        
        {/* Trailing Elements */}
        <div className="flex-shrink-0 flex items-center gap-2">
          {/* Boxes Count */}
          <div className="text-right">
            <div className="text-[11px] font-medium text-on-surface-variant leading-tight tracking-[0.5px]">
              Boxes: {delivery.boxes}
            </div>
          </div>
          
          {/* Navigation Arrow */}
          <div className="w-5 h-5 flex items-center justify-center">
            <ChevronRight className="w-5 h-5 text-on-surface-variant" />
          </div>
        </div>
      </div>
    </button>
  );
}

function PartnerDeliveryNoteItem({ 
  deliveryNote, 
  orders, 
  onClick,
  isAdmin,
  onDelete,
  showSenderReceiver = false,
  stores,
  brands,
  warehouses
}: { 
  deliveryNote: DeliveryNote; 
  orders: ShippingPartnerOrder[];
  onClick?: () => void;
  isAdmin?: boolean;
  onDelete?: (deliveryNoteId: string) => void;
  showSenderReceiver?: boolean;
  stores?: StoreRecord[];
  brands?: BrandRecord[];
  warehouses?: Warehouse[];
}) {
  const relatedOrders = orders.filter(order => order.deliveryNote === deliveryNote.id);
  const totalItems = relatedOrders.reduce((sum, order) => sum + order.itemCount, 0);
  
  // Get sender and receiver from related orders
  const senderName = relatedOrders[0]?.partnerName;
  const receivingStoreId = relatedOrders[0]?.receivingStoreId;
  const receivingStoreName = relatedOrders[0]?.receivingStoreName;
  const warehouseId = relatedOrders[0]?.warehouseId;
  const warehouseDisplay = relatedOrders[0]?.warehouseName || (warehouseId ? warehouses?.find(w => w.id === warehouseId)?.name : undefined);
  
  // Helper to get receiver display with brand and store code
  const getReceiverDisplay = () => {
    if (!receivingStoreId || !receivingStoreName) {
      return receivingStoreName || '';
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
  
  const receiverDisplay = getReceiverDisplay();
  const deliveryStatus = deliveryNote.status as DeliveryNoteStatus;
  
  const getStatusDisplay = (status: DeliveryNoteStatus) => {
    switch (status) {
      case 'pending': return 'Pending Shipment';
      case 'registered': return 'In Transit';
      default: return status;
    }
  };

  const getStatusBadgeColor = (status: DeliveryNoteStatus) => {
    switch (status) {
      case 'pending': return 'bg-warning-container text-on-warning-container';
      case 'registered': return 'bg-primary-container text-on-primary-container';
      default: return 'bg-surface-container-high text-on-surface-variant';
    }
  };

  const ComponentWrapper = onClick ? 'button' : 'div';
  
  return (
    <ComponentWrapper 
      className={`w-full bg-surface-container border-b border-outline-variant ${
        onClick ? 'hover:bg-surface-container-high active:bg-surface-container cursor-pointer transition-colors duration-200 text-left' : ''
      }`}
      onClick={onClick}
    >
      {/* M3 Three-line List Item */}
      <div className="flex items-center gap-4 px-4 py-3">
        
        {/* Leading Element - Truck Icon */}
        <div className="flex-shrink-0 w-10 h-10 bg-surface-container rounded-full flex items-center justify-center">
          <Truck className="w-5 h-5 text-on-surface-variant" />
        </div>
        
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Top Line - Date and Status */}
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className="label-small text-on-surface-variant">
              {deliveryNote.createdDate},
            </span>
            <span className={`label-small px-2 py-0.5 rounded-full ${getStatusBadgeColor(deliveryNote.status)}`}>
              {getStatusDisplay(deliveryNote.status as DeliveryNoteStatus)}
            </span>
          </div>
          
          {/* Primary Line - Delivery Note ID */}
          <div className="body-medium text-on-surface mb-0.5">
            <span className="block truncate">Delivery: {deliveryNote.id}</span>
          </div>
          
          {/* Secondary Line - Orders, Items and Boxes */}
          <div className="body-small text-on-surface-variant mb-0.5">
            {relatedOrders.length} order{relatedOrders.length !== 1 ? 's' : ''} • {totalItems} items • {deliveryNote.boxes.length} boxes
          </div>
          
          {/* Sender/Receiver Line - Only show if requested */}
          {showSenderReceiver && (senderName || receiverDisplay || warehouseDisplay) && (
            <div className="label-small text-on-surface-variant opacity-90">
              {warehouseDisplay && (
                <div className="truncate">From: {warehouseDisplay}</div>
              )}
              {!warehouseDisplay && senderName && (
                <div className="truncate">From: {senderName}</div>
              )}
              {receiverDisplay && (
                <div className="truncate">To: {receiverDisplay}</div>
              )}
              {receivingStoreName && receiverDisplay !== receivingStoreName && (
                <div className="truncate">{receivingStoreName}</div>
              )}
            </div>
          )}
          
          {/* Metadata Line - Order IDs */}
          {relatedOrders.length > 0 && (
            <div className="label-small text-on-surface-variant opacity-90">
              <div className="truncate">
                Orders: {relatedOrders.map(order => order.id).join(', ')}
              </div>
            </div>
          )}
        </div>
        
        {/* Trailing Elements */}
        <div className="flex-shrink-0 flex items-center gap-3">
          {/* Status Badge - Always visible on desktop, positioned far right */}
          <div className={`hidden md:flex px-3 py-1.5 rounded-full label-medium min-w-[120px] justify-center ${getStatusBadgeColor(deliveryStatus)}`}>
            {getStatusDisplay(deliveryStatus)}
          </div>
          {/* Delete button for Admin on pending deliveries */}
          {isAdmin && deliveryStatus === 'pending' && onDelete && (
            <button
              onClick={(e: ReactMouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
                if (confirm('Are you sure you want to delete this delivery? This action cannot be undone.')) {
                  onDelete(deliveryNote.id);
                }
              }}
              className="p-2 rounded-full hover:bg-error-container text-error transition-colors"
              aria-label="Delete delivery"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </ComponentWrapper>
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

  const storeRecord =
    (returnDelivery.storeId && stores?.find(store => store.id === returnDelivery.storeId)) ||
    stores?.find(store => store.code === returnDelivery.storeCode);
  const brandRecord = storeRecord ? brands?.find(brand => brand.id === storeRecord.brandId) : undefined;
  
  // Sender: Brand + store code
  const senderDisplay = [brandRecord?.name, storeRecord?.code || returnDelivery.storeCode]
    .filter(Boolean)
    .join(' ')
    .trim() || returnDelivery.storeName;
  
  // Receiver: Partner name + warehouse
  const warehouseRecord = warehouses?.find(warehouse => warehouse.id === returnDelivery.warehouseId);
  const warehouseName = returnDelivery.warehouseName || warehouseRecord?.name || '';
  const receiverDisplay = [returnDelivery.partnerName, warehouseName]
    .filter(Boolean)
    .join(' ')
    .trim() || returnDelivery.partnerName;

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
  
  return (
    <ComponentWrapper 
      className={`bg-surface-container border-b border-outline-variant last:border-b-0 ${
        onClick ? 'hover:bg-surface-container-high active:bg-surface-container cursor-pointer transition-colors duration-200 text-left w-full' : ''
      }`}
      onClick={onClick}
      role={onClick && hasActionButton ? 'button' : undefined}
      tabIndex={onClick && hasActionButton ? 0 : undefined}
    >
      <div className="flex items-center gap-4 px-4 py-3">
        
        {/* Leading Element - Return Icon */}
        <div className="flex-shrink-0 w-10 h-10 bg-surface-container rounded-full flex items-center justify-center">
          <RotateCcw className="w-5 h-5 text-on-surface-variant" />
        </div>
        
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Top Line - Date and Status */}
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className="label-small text-on-surface-variant">
              {returnDelivery.date},
            </span>
            <span className={`label-small px-2 py-0.5 rounded-full ${getStatusBadgeColor(returnDelivery.status)}`}>
              {getStatusDisplay(returnDelivery.status)}
            </span>
          </div>
          
          {/* Primary Line - Delivery ID */}
          <div className="body-medium text-on-surface mb-0.5">
            <span className="block truncate">Delivery: {returnDelivery.deliveryId}</span>
          </div>
          
          {/* Secondary Line - Sender (Brand + Store Code) */}
          <div className="body-small text-on-surface-variant mb-0.5">
            <span className="block truncate">From: {senderDisplay}</span>
          </div>
          
          {/* Secondary Line - Receiver (Partner + Warehouse) */}
          <div className="body-small text-on-surface-variant mb-0.5">
            <span className="block truncate">To: {receiverDisplay}</span>
          </div>
          
          {/* Metadata Line - Items, Boxes, and Store Code */}
          <div className="label-small text-on-surface-variant opacity-90">
            <div className="truncate">
              {returnDelivery.items} items • {returnDelivery.boxes} boxes
            </div>
          </div>
        </div>
        
        {/* Trailing Elements */}
        <div className="flex-shrink-0 flex items-center gap-3">
          {/* Status Badge - Always visible on desktop, positioned far right */}
          <div className={`hidden md:flex px-3 py-1.5 rounded-full label-medium min-w-[120px] justify-center ${getStatusBadgeColor(returnDelivery.status)}`}>
            {getStatusDisplay(returnDelivery.status)}
          </div>

          {/* More menu for pending returns */}
          {returnDelivery.status === 'Pending' && onCancel && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  onClick={(e: React.MouseEvent) => e.stopPropagation()}
                  className="p-2 rounded-full hover:bg-surface-container-high transition-colors"
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
                handleMarkAsReturned();
              }}
              className="px-3 py-1.5 bg-primary text-on-primary rounded-full label-medium hover:bg-primary/90 transition-colors"
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
      </div>
    </ComponentWrapper>
  );
}

function PartnerOrderItem({ 
  order, 
  onClick, 
  isClickable = false,
  isSellpyPending = false,
  isAdmin,
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
      case 'pending': return 'bg-warning-container text-on-warning-container';
      case 'registered': return 'bg-tertiary-container text-on-tertiary-container';
      case 'in-transit': return 'bg-primary-container text-on-primary-container';
      case 'delivered': return 'bg-success-container text-on-success-container';
      case 'in-review': return 'bg-warning-container text-on-warning-container';
      default: return 'bg-surface-container-high text-on-surface-variant';
    }
  };

  return (
    <div 
      className={`w-full bg-surface-container border-b border-outline-variant ${
        isClickable 
          ? 'hover:bg-surface-container-high active:bg-surface-container cursor-pointer transition-colors duration-200' 
          : ''
      }`}
    >
      {/* M3 Three-line List Item */}
      <div 
        className="flex items-center gap-4 px-4 py-3"
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
            <span className="label-small text-on-surface-variant">
              {order.createdDate},
            </span>
            <span className={`label-small px-2 py-0.5 rounded-full ${getStatusBadgeColor(order.status)}`}>
              {getStatusDisplay(order.status)}
            </span>
          </div>
          
          {/* Primary Line - Order ID */}
          <div className="body-medium text-on-surface mb-0.5">
            <span className="block truncate">Order: {order.id}</span>
          </div>
          
          {/* Secondary Line - Items and Boxes */}
          <div className="body-small text-on-surface-variant mb-0.5">
            {order.itemCount} items • {order.boxCount} boxes
          </div>
          
          {/* Sender/Receiver Line - Only show if requested */}
          {showSenderReceiver && (warehouseDisplay || order.partnerName || receiverDisplay) && (
            <div className="label-small text-on-surface-variant opacity-90 space-y-0.5">
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
            <div className="label-small text-on-surface-variant opacity-90">
              <div className="truncate">Shipped via: {order.deliveryNote}</div>
            </div>
          )}
          
          {/* Add Retailer IDs Hint for Sellpy Pending Orders Only */}
          {isClickable && isSellpyPending && (
            <div className="label-small text-primary mt-1">
              Tap to add retailer IDs
            </div>
          )}
        </div>
        
        {/* Trailing Elements */}
        <div className="flex-shrink-0 flex items-center gap-3">
          {/* Status Badge - Always visible on desktop, positioned far right */}
          <div className={`hidden md:flex px-3 py-1.5 rounded-full label-medium min-w-[140px] justify-center ${getStatusBadgeColor(order.status)}`}>
            {getStatusDisplay(order.status)}
          </div>
          
          {/* Action Menu for registered orders */}
          {order.status === 'registered' && onCreateDeliveryNote && (
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
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          {/* Delete button for Admin on pending orders */}
          {isAdmin && order.status === 'pending' && onDelete && (
            <button
              onClick={(e: ReactMouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
                if (confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
                  onDelete(order.id);
                }
              }}
              className="p-2 rounded-full hover:bg-error-container text-error transition-colors"
              aria-label="Delete order"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          
          {/* Arrow for clickable items */}
          {isClickable && (
            <div className="w-5 h-5 flex items-center justify-center">
              <ChevronRight className="w-5 h-5 text-primary" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ShowroomOrderItem({ 
  order, 
  onClick 
}: { 
  order: ShowroomOrder; 
  onClick?: () => void; 
}) {
  const getStatusDisplay = (status: ShowroomOrder['status']) => {
    switch (status) {
      case 'submitted': return 'Submitted';
      case 'in_review': return 'In Review';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      case 'fulfillment': return 'Fulfillment';
      case 'shipped': return 'Shipped';
      case 'closed': return 'Closed';
      default: return status;
    }
  };

  const getStatusBadgeColor = (status: ShowroomOrder['status']) => {
    switch (status) {
      case 'submitted': return 'bg-surface-container-high text-on-surface-variant';
      case 'in_review': return 'bg-warning-container text-on-warning-container';
      case 'approved': return 'bg-tertiary-container text-on-tertiary-container';
      case 'rejected': return 'bg-error-container text-on-error-container';
      case 'fulfillment': return 'bg-primary-container text-on-primary-container';
      case 'shipped': return 'bg-tertiary-container text-on-tertiary-container';
      case 'closed': return 'bg-surface-container-high text-on-surface-variant';
      default: return 'bg-surface-container-high text-on-surface-variant';
    }
  };

  return (
    <button 
      className="w-full bg-surface-container border-b border-outline-variant hover:bg-surface-container-high active:bg-surface-container cursor-pointer transition-colors duration-200 text-left"
      onClick={onClick}
    >
      {/* M3 Three-line List Item */}
      <div className="flex items-center gap-4 px-4 py-3">
        
        {/* Leading Element - Package Icon */}
        <div className="flex-shrink-0 w-10 h-10 bg-surface-container rounded-full flex items-center justify-center">
          <Package className="w-5 h-5 text-on-surface-variant" />
        </div>
        
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Top Line - Date and Status */}
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className="label-small text-on-surface-variant">
              {new Date(order.createdAt).toLocaleDateString()},
            </span>
            <span className={`label-small px-2 py-0.5 rounded-full ${getStatusBadgeColor(order.status)}`}>
              {getStatusDisplay(order.status)}
            </span>
          </div>
          
          {/* Primary Line - Order ID */}
          <div className="body-medium text-on-surface mb-0.5">
            <span className="block truncate">Order #{order.id}</span>
          </div>
          
          {/* Secondary Line - Order Type and Items */}
          <div className="body-small text-on-surface-variant mb-0.5">
            {order.type.toUpperCase()} • {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
          </div>
          
          {/* Metadata Line - Buyer */}
          <div className="label-small text-on-surface-variant opacity-90">
            <div className="truncate">Buyer: {order.buyerName}</div>
          </div>
        </div>
        
        {/* Trailing Elements */}
        <div className="flex-shrink-0 flex items-center gap-3">
          {/* Status Badge - Always visible on desktop, positioned far right */}
          <div className={`hidden md:flex px-3 py-1.5 rounded-full label-medium min-w-[120px] justify-center ${getStatusBadgeColor(order.status)}`}>
            {getStatusDisplay(order.status)}
          </div>
          
          {/* Total */}
          <div className="text-right hidden md:block min-w-[80px]">
            <div className="body-medium text-on-surface">
              ${order.subtotal.toFixed(2)}
            </div>
          </div>
          
          {/* Arrow */}
          <div className="w-5 h-5 flex items-center justify-center">
            <ChevronRight className="w-5 h-5 text-on-surface-variant" />
          </div>
        </div>
      </div>
    </button>
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
      case 'registered': return 'text-on-success-container';
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
      case 'registered': return 'bg-success-container text-on-success-container';
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

  return (
    <button 
      className="w-full bg-surface-container border-b border-outline-variant hover:bg-surface-container-high active:bg-surface-container cursor-pointer transition-colors duration-200 text-left"
      onClick={onClick}
    >
      {/* M3 Three-line List Item */}
      <div className="flex items-center gap-4 px-4 py-3">
        
        {/* Leading Element - Status Icon */}
        <div className="flex-shrink-0 w-10 h-10 bg-surface-container rounded-full flex items-center justify-center">
          <StatusIcon className="w-5 h-5 text-on-surface-variant" />
        </div>
        
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Top Line - Order ID and Status */}
          <div className={`text-[11px] font-medium leading-tight tracking-[0.5px] mb-0.5 ${getStatusColor(order.status)}`}>
            {order.id}, {getStatusDisplay(order.status)}
          </div>
          
          {/* Primary Line - Date */}
          <div className="text-sm font-normal text-on-surface leading-tight mb-0.5 tracking-[0.25px]">
            <span className="block truncate">Received: {order.createdDate}</span>
          </div>
          
          {/* Secondary Line - Items Progress */}
          <div className="text-xs font-normal text-on-surface-variant leading-tight mb-0.5 tracking-[0.4px]">
            {order.itemsWithRetailerIds} / {order.totalItems} items processed
          </div>
          
          {/* Metadata Line - Receiving Store */}
          <div className="text-[11px] font-medium text-on-surface-variant leading-tight tracking-[0.5px] opacity-90">
            <div className="truncate">Store: {order.receivingStore}</div>
          </div>
        </div>
        
        {/* Trailing Elements */}
        <div className="flex-shrink-0 flex items-center gap-3">
          {/* Status Badge - Always visible on desktop, positioned far right */}
          <div className={`hidden md:flex px-3 py-1.5 rounded-full label-medium min-w-[120px] justify-center ${getStatusBadgeColor(order.status)}`}>
            {getStatusDisplay(order.status)}
          </div>
          
          {/* Arrow */}
          <div className="w-5 h-5 flex items-center justify-center">
            <ChevronRight className="w-5 h-5 text-on-surface-variant" />
          </div>
        </div>
      </div>
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
  showroomOrders = [],
  onViewShowroomOrder,
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

  const handleScanClick = () => {
    if (onScanBox) {
      onScanBox();
    } else if (onNavigateToScan) {
      onNavigateToScan();
    }
  };

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
          return 'pending';
        case 'returns':
          return 'returns';
        case 'shipments':
        case 'registered':
        case 'in-transit':
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
  // Filter out Approval option for Thrifted partner
  const isThriftedPartnerForFilter = currentPartnerId === '2'; // Thrifted
  const orderStatusFilterOptions: Array<{ id: OrderStatusFilter; label: string }> = isThriftedPartnerForFilter
    ? [
        { id: 'all' as OrderStatusFilter, label: 'All' },
        { id: 'pending' as OrderStatusFilter, label: 'Pending' },
        { id: 'registered' as OrderStatusFilter, label: 'Registered' },
        { id: 'in-transit' as OrderStatusFilter, label: 'In transit' }
      ]
    : [
        { id: 'all' as OrderStatusFilter, label: 'All' },
        { id: 'approval' as OrderStatusFilter, label: 'Approval' },
        { id: 'pending' as OrderStatusFilter, label: 'Pending' },
        { id: 'registered' as OrderStatusFilter, label: 'Registered' },
        { id: 'in-transit' as OrderStatusFilter, label: 'In transit' }
      ];
  const shipmentStatusFilterOptions: Array<{ id: ShipmentStatusFilter; label: string }> = [
    { id: 'all', label: 'All' },
    { id: 'packing', label: 'Packing' },
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
    case 'pending':
      setOrderStatusFilter('pending');
      break;
    case 'pending-registered': // Special case: Orders tab with registered filter
      setOrderStatusFilter('registered');
      break;
    case 'registered':
      setOrderStatusFilter('registered');
      break;
    case 'shipments':
    case 'in-transit':
    case 'all':
      setShipmentStatusFilter('in-transit');
      break;
    case 'delivered':
      setShipmentStatusFilter('delivered');
      break;
    case 'returns':
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

  const filteredDeliveries = deliveries.filter(delivery => {
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
    const matchesSearch = searchTerm === '' || 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.deliveryNote && order.deliveryNote.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.partnerName && order.partnerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.receivingStoreName && order.receivingStoreName.toLowerCase().includes(searchTerm.toLowerCase()));
    
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
        case 'registered':
          return order.status === 'registered';
        case 'in-transit':
          return order.status === 'in-transit';
        case 'all':
        default:
          return ['approval', 'pending', 'registered', 'in-transit', 'in-review', 'delivered'].includes(order.status);
      }
    })();
    
    return matchesSearch && matchesPartner && matchesWarehouse && matchesStatusFilter;
  }).sort((a, b) => {
    // Sort by createdDate descending (newest first)
    return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
  });

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
    const matchesSearch = searchTerm === '' || 
      delivery.deliveryId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.storeCode.toLowerCase().includes(searchTerm.toLowerCase());
    
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
  }).sort((a, b) => {
    // Sort by date descending (newest first)
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const filteredDeliveryNotes = deliveryNotes.filter(note => {
    const matchesSearch = searchTerm === '' || 
      note.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.orderId.toLowerCase().includes(searchTerm.toLowerCase());

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
            return noteStatus === 'pending' || noteStatus === 'packing';
          case 'in-transit':
            return noteStatus === 'registered';
          case 'delivered':
            return noteStatus === 'delivered' || noteStatus === 'rejected' || noteStatus === 'partially-delivered' || noteStatus === 'cancelled';
          case 'all':
          default:
            return ['pending', 'packing', 'registered', 'delivered', 'rejected', 'partially-delivered', 'cancelled'].includes(noteStatus);
        }
      })();

      return matchesSearch && matchesStatusFilter;
    }
    
    const matchesTab = (activeTab === 'pending' && noteStatus === 'pending') ||
      (activeTab === 'in-transit' && noteStatus === 'registered') ||
      (activeTab === 'all' && (noteStatus === 'delivered' || noteStatus === 'rejected'));
    
    return matchesSearch && matchesTab;
  }).sort((a, b) => {
    // Sort by createdDate descending (newest first)
    return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
  });

  // Filter showroom orders (purchase orders for Chinese partners)
  const filteredShowroomOrders = showroomOrders.filter(order => {
    const matchesSearch = searchTerm === '' || 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.buyerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = (() => {
      if (activeTab === 'pending') {
        return order.status === 'submitted' || order.status === 'in_review' || order.status === 'approved';
      }

      if (activeTab === 'in-transit') {
        switch (shipmentStatusFilter) {
          case 'in-transit':
            return order.status === 'fulfillment' || order.status === 'shipped';
          case 'delivered':
            return order.status === 'shipped' || order.status === 'closed';
          case 'all':
          default:
            return ['fulfillment', 'shipped', 'closed'].includes(order.status);
        }
      }

      return false;
    })();
    
    return matchesSearch && matchesTab;
  }).sort((a, b) => {
    // Sort by createdAt descending (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

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
  const showCreateOrderButton = role === 'partner' && isThriftedPartner && !!onCreateOrder;
  const showShowroomOrders = role === 'partner' && isChinesePartner && (activeTab === 'pending' || activeTab === 'in-transit');
  const showDeliveryNotes = role === 'partner' && !isChinesePartner && activeTab === 'in-transit';
  const showOrders = role === 'partner' && !isChinesePartner && activeTab === 'pending';
  const showReturns = activeTab === 'returns'; // Show returns for both partners and store staff
  // Store staff no longer has an 'orders' tab - removed
  const showSellpyOrders = false;
  

  return (
    <div className="bg-surface relative size-full">
      {/* Header */}
      <div className="sticky top-0 bg-surface z-10 border-b border-outline-variant">
        <div className="px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="headline-small text-on-surface">
              {role === 'partner' ? 'Orders & Shipments' : 'Shipping'}
            </h3>
            
            {/* Filter Button - Partner Portal Only - Matching ItemsScreen design */}
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
                  className={`
                    h-12 px-3 border transition-colors flex items-center gap-2 flex-shrink-0 rounded-[8px]
                    ${((viewFilter.storeIds?.length || 0) > 0 || 
                      (viewFilter.brandIds?.length || 0) > 0 || 
                      (viewFilter.countryIds?.length || 0) > 0)
                      ? 'bg-secondary-container border-outline text-on-secondary-container'
                      : 'bg-surface border-outline text-on-surface-variant hover:bg-surface-container-high'
                    }
                  `}
                >
                  <FilterIcon size={20} />
                  <span className="label-medium">
                    {((viewFilter.brandIds?.length || 0) > 0 || 
                      (viewFilter.countryIds?.length || 0) > 0 || 
                      (viewFilter.storeIds?.length || 0) > 0)
                      ? 'Filtered'
                      : 'Filter'
                    }
                  </span>
                  {((viewFilter.brandIds?.length || 0) > 0 || 
                    (viewFilter.countryIds?.length || 0) > 0 || 
                    (viewFilter.storeIds?.length || 0) > 0) && (
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  )}
                </button>
              </StoreFilterBottomSheet>
            )}
          </div>
          
          {/* Filter Chips Display - Partner Portal Only - Matching ItemsScreen design */}
          {role === 'partner' && ((viewFilter.brandIds?.length || 0) > 0 || 
            (viewFilter.countryIds?.length || 0) > 0 || 
            (viewFilter.storeIds?.length || 0) > 0) && (
            <div className="mt-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="label-small text-on-surface-variant">Active filters:</span>
                
                {/* Brand Filter Chips */}
                {viewFilter.brandIds && viewFilter.brandIds.length > 0 && 
                  brands.filter(b => viewFilter.brandIds!.includes(b.id)).map(brand => (
                    <div 
                      key={`brand-${brand.id}`} 
                      className="inline-flex items-center gap-1.5 px-2 py-1 bg-secondary-container text-on-secondary-container rounded-full label-small"
                    >
                      {brand.name}
                      <button
                        onClick={(e: ReactMouseEvent<HTMLButtonElement>) => {
                          e.stopPropagation();
                          handleBrandFilterChange(viewFilter.brandIds!.filter(id => id !== brand.id));
                        }}
                        className="hover:opacity-70"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))
                }
                
                {/* Country Filter Chips */}
                {viewFilter.countryIds && viewFilter.countryIds.length > 0 && 
                  countries.filter(c => viewFilter.countryIds!.includes(c.id)).map(country => (
                    <div 
                      key={`country-${country.id}`} 
                      className="inline-flex items-center gap-1.5 px-2 py-1 bg-secondary-container text-on-secondary-container rounded-full label-small"
                    >
                      {country.name}
                      <button
                        onClick={(e: ReactMouseEvent<HTMLButtonElement>) => {
                          e.stopPropagation();
                          handleCountryFilterChange(viewFilter.countryIds!.filter(id => id !== country.id));
                        }}
                        className="hover:opacity-70"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))
                }
                
                {/* Store Filter Chips */}
                {viewFilter.storeIds && viewFilter.storeIds.length > 0 && 
                  stores.filter(s => viewFilter.storeIds!.includes(s.id)).map(store => (
                    <div 
                      key={`store-${store.id}`} 
                      className="inline-flex items-center gap-1.5 px-2 py-1 bg-secondary-container text-on-secondary-container rounded-full label-small"
                    >
                      {store.name}
                      <button
                        onClick={(e: ReactMouseEvent<HTMLButtonElement>) => {
                          e.stopPropagation();
                          handleStoreFilterChange(viewFilter.storeIds!.filter(id => id !== store.id));
                        }}
                        className="hover:opacity-70"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))
                }
              </div>
            </div>
          )}

          {showCreateOrderButton && (
            <div className="mt-4 md:max-w-sm md:w-auto">
              <Button
                onClick={onCreateOrder}
                className="w-full md:w-auto justify-center h-14 rounded-[12px] gap-3 bg-primary text-on-primary hover:bg-primary/90 shadow-md shadow-primary/15 transition-colors px-6"
              >
                <ClipboardListIcon className="w-5 h-5" />
                <span className="label-large">Create new order</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Content - M3 Grid: 16px mobile, 24px tablet+ */}
      <div className="px-4 md:px-6 pt-4 md:pt-6">
        
        {/* Search Bar - Max width on desktop */}
        <div className="mb-4">
          <div className="relative md:max-w-2xl">
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
        </div>

        {/* Action Button - Role-specific */}
        {(role === 'store-staff' || role === 'admin') && (onScanBox || onNavigateToScan) && hasInTransitDelivery && (
          <div className="flex justify-end mb-4">
            <Button
              onClick={handleScanClick}
              className="bg-primary hover:bg-primary/90 focus:bg-primary/90 active:bg-primary/80 text-on-primary transition-colors px-6 py-3 rounded-lg min-h-[40px] flex items-center justify-center gap-2"
            >
              <QrCode className="w-5 h-5" />
              <span className="label-large">Scan to receive</span>
            </Button>
          </div>
        )}

        {/* Tabs */}
        <Tabs
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
          userRole={role}
        />

        {role === 'partner' && showOrders && !isChinesePartner && (
          <div className="mb-4 flex flex-wrap gap-2">
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
                    case 'registered':
                      return order.status === 'registered';
                    case 'in-transit':
                      return order.status === 'in-transit';
                    case 'all':
                    default:
                      return ['approval', 'pending', 'registered', 'in-transit', 'in-review', 'delivered'].includes(order.status);
                  }
                }).length;
              })();
              
              return (
                <button
                  key={id}
                  onClick={() => setOrderStatusFilter(id)}
                  className={`px-3 py-1.5 rounded-[8px] border label-medium transition-colors ${
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
        )}

        {role === 'partner' && activeTab === 'in-transit' && (
          <div className="mb-4 flex flex-wrap gap-2">
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
                  
                  const noteStatus = note.status || 'pending';
                  switch (id) {
                    case 'packing':
                      return noteStatus === 'pending' || noteStatus === 'packing';
                    case 'in-transit':
                      return noteStatus === 'registered';
                    case 'delivered':
                      return noteStatus === 'delivered' || noteStatus === 'rejected' || noteStatus === 'partially-delivered' || noteStatus === 'cancelled';
                    case 'all':
                    default:
                      return ['pending', 'packing', 'registered', 'delivered', 'rejected', 'partially-delivered', 'cancelled'].includes(noteStatus);
                  }
                }).length;
              })();
              
              return (
                <button
                  key={id}
                  onClick={() => setShipmentStatusFilter(id)}
                  className={`px-3 py-1.5 rounded-[8px] border label-medium transition-colors ${
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
        )}

        {role === 'partner' && activeTab === 'returns' && (
          <div className="mb-4 flex flex-wrap gap-2">
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
                  className={`px-3 py-1.5 rounded-[8px] border label-medium transition-colors ${
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
        )}

        {/* Count Display - Hidden for partner portal orders, shipments, and returns tabs (counts shown in filter chips) */}
        {!(role === 'partner' && ((activeTab === 'pending' && showOrders && !isChinesePartner) || (activeTab === 'in-transit' && showDeliveryNotes) || activeTab === 'returns')) && (
          <div className="mb-3">
            <span className="body-medium text-on-surface-variant">
              {showReturns ?
                `${filteredReturnDeliveries.length} return deliveries` :
                showSellpyOrders ?
                  `${filteredSellpyOrders.length} orders` :
                role === 'partner' ? 
                  (showShowroomOrders ?
                    `${filteredShowroomOrders.length} ${activeTab === 'pending' ? 'purchase orders' : shipmentStatusFilter === 'delivered' ? 'deliveries' : 'shipments'}` :
                    showDeliveryNotes ? 
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
                  <div className="flex md:hidden flex-col gap-2">
                    {filteredReturnDeliveries.map((returnDelivery) => (
                      <div key={returnDelivery.id} className="bg-surface border border-outline-variant rounded-lg overflow-hidden">
                        <ReturnDeliveryComponent 
                          returnDelivery={returnDelivery}
                          onUpdateStatus={onUpdateReturnDeliveryStatus}
                          onCancel={onCancelReturn}
                          onClick={() => onOpenReturnDetails?.(returnDelivery)}
                          stores={stores}
                          brands={brands}
                          warehouses={warehouses}
                          userRole={role}
                        />
                      </div>
                    ))}
                  </div>
                  
                  {/* Desktop: Table View */}
                  <div className="hidden md:block bg-surface border border-outline-variant rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-surface-container-high border-b border-outline-variant">
                        <tr>
                          <th className="px-4 py-3 text-left title-small text-on-surface">Date</th>
                          <th className="px-4 py-3 text-left title-small text-on-surface">Delivery ID</th>
                          <th className="px-4 py-3 text-left title-small text-on-surface">Receiver</th>
                          <th className="px-4 py-3 text-left title-small text-on-surface">Warehouse</th>
                          <th className="px-4 py-3 text-right title-small text-on-surface">Items</th>
                          <th className="px-4 py-3 text-right title-small text-on-surface">Boxes</th>
                          <th className="px-4 py-3 text-right title-small text-on-surface">Status</th>
                          <th className="px-4 py-3 text-right title-small text-on-surface"></th>
                        </tr>
                      </thead>
                      <tbody>
                      {filteredReturnDeliveries.map((returnDelivery) => {
                          return (
                            <tr 
                              key={returnDelivery.id}
                              className="border-b border-outline-variant last:border-b-0 hover:bg-surface-container-high transition-colors"
                            >
                              <td className="px-4 py-3 body-small text-on-surface-variant">{returnDelivery.date}</td>
                              <td 
                                className="px-4 py-3 body-medium text-on-surface cursor-pointer"
                                onClick={() => onOpenReturnDetails?.(returnDelivery)}
                              >{returnDelivery.deliveryId}</td>
                              <td 
                                className="px-4 py-3 body-medium text-on-surface cursor-pointer"
                                onClick={() => onOpenReturnDetails?.(returnDelivery)}
                              >{returnDelivery.storeName}</td>
                              <td 
                                className="px-4 py-3 body-small text-on-surface-variant cursor-pointer"
                                onClick={() => onOpenReturnDetails?.(returnDelivery)}
                              >{returnDelivery.storeCode}</td>
                              <td 
                                className="px-4 py-3 body-medium text-on-surface text-right cursor-pointer"
                                onClick={() => onOpenReturnDetails?.(returnDelivery)}
                              >{returnDelivery.items}</td>
                              <td 
                                className="px-4 py-3 body-medium text-on-surface text-right cursor-pointer"
                                onClick={() => onOpenReturnDetails?.(returnDelivery)}
                              >{returnDelivery.boxes}</td>
                              <td 
                                className="px-4 py-3 text-right cursor-pointer"
                                onClick={() => onOpenReturnDetails?.(returnDelivery)}
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
                                    className="px-3 py-1.5 bg-primary text-on-primary rounded-full label-medium hover:bg-primary/90 transition-colors"
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
                  <div className="flex md:hidden flex-col gap-2">
                    {filteredReturnDeliveries.map((returnDelivery) => (
                      <div key={returnDelivery.id} className="bg-surface border border-outline-variant rounded-lg overflow-hidden">
                        <ReturnDeliveryComponent 
                          returnDelivery={returnDelivery}
                          onUpdateStatus={onUpdateReturnDeliveryStatus}
                          onCancel={onCancelReturn}
                          onClick={() => onOpenReturnDetails?.(returnDelivery)}
                          stores={stores}
                          brands={brands}
                          warehouses={warehouses}
                          userRole={role}
                        />
                      </div>
                    ))}
                  </div>
                  
                  {/* Desktop: Table View */}
                  <div className="hidden md:block bg-surface border border-outline-variant rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-surface-container-high border-b border-outline-variant">
                        <tr>
                          <th className="px-4 py-3 text-left title-small text-on-surface">Date</th>
                          <th className="px-4 py-3 text-left title-small text-on-surface">Delivery ID</th>
                          <th className="px-4 py-3 text-left title-small text-on-surface">Receiver</th>
                          <th className="px-4 py-3 text-left title-small text-on-surface">Warehouse</th>
                          <th className="px-4 py-3 text-right title-small text-on-surface">Items</th>
                          <th className="px-4 py-3 text-right title-small text-on-surface">Boxes</th>
                          <th className="px-4 py-3 text-right title-small text-on-surface">Status</th>
                          <th className="px-4 py-3 text-right title-small text-on-surface"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredReturnDeliveries.map((returnDelivery) => {
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
                          const storeNameDisplay = storeRecord?.name || returnDelivery.storeName;
                          const warehouseName = returnDelivery.warehouseName || (returnDelivery.warehouseId ? warehouses?.find(warehouse => warehouse.id === returnDelivery.warehouseId)?.name : undefined);

                          return (
                            <tr 
                              key={returnDelivery.id}
                              className="border-b border-outline-variant last:border-b-0 hover:bg-surface-container-high transition-colors"
                            >
                              <td className="px-4 py-3 body-small text-on-surface-variant">{returnDelivery.date}</td>
                              <td 
                                className="px-4 py-3 body-medium text-on-surface cursor-pointer"
                                onClick={() => onOpenReturnDetails?.(returnDelivery)}
                              >{returnDelivery.deliveryId}</td>
                              <td 
                                className="px-4 py-3 body-medium text-on-surface cursor-pointer"
                                onClick={() => onOpenReturnDetails?.(returnDelivery)}
                              >
                                <div className="space-y-0.5">
                                  <span className="block">{receiverDisplay}</span>
                                  {storeNameDisplay && receiverDisplay !== storeNameDisplay && (
                                    <span className="block text-on-surface-variant">{storeNameDisplay}</span>
                                  )}
                                </div>
                              </td>
                              <td 
                                className="px-4 py-3 body-medium text-on-surface cursor-pointer"
                                onClick={() => onOpenReturnDetails?.(returnDelivery)}
                              >
                                {warehouseName || '-'}
                              </td>
                              <td 
                                className="px-4 py-3 body-medium text-on-surface text-right cursor-pointer"
                                onClick={() => onOpenReturnDetails?.(returnDelivery)}
                              >{returnDelivery.items}</td>
                              <td 
                                className="px-4 py-3 body-medium text-on-surface text-right cursor-pointer"
                                onClick={() => onOpenReturnDetails?.(returnDelivery)}
                              >{returnDelivery.boxes}</td>
                              <td 
                                className="px-4 py-3 text-right cursor-pointer"
                                onClick={() => onOpenReturnDetails?.(returnDelivery)}
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
                <div className="flex md:hidden flex-col gap-2">
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
                <div className="hidden md:block bg-surface border border-outline-variant rounded-lg overflow-hidden">
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
                            case 'registered': return 'text-success';
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
            // Partner View - Show showroom orders (Chinese partner), delivery notes, or regular orders
            showShowroomOrders && filteredShowroomOrders.length > 0 ? (
              // Show Showroom Purchase Orders (Chinese Partner)
              <>
                {/* Mobile: Card View */}
                <div className="flex md:hidden flex-col gap-2">
                  {filteredShowroomOrders.map((order) => (
                    <div key={order.id} className="bg-surface border border-outline-variant rounded-lg overflow-hidden">
                      <ShowroomOrderItem 
                        order={order}
                        onClick={() => onViewShowroomOrder?.(order.id)}
                      />
                    </div>
                  ))}
                </div>
                
                {/* Desktop: Table View */}
                <div className="hidden md:block bg-surface border border-outline-variant rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-surface-container-high border-b border-outline-variant">
                      <tr>
                        <th className="px-4 py-3 text-left title-small text-on-surface">Date</th>
                        <th className="px-4 py-3 text-left title-small text-on-surface">Order ID</th>
                        <th className="px-4 py-3 text-left title-small text-on-surface">Type</th>
                        <th className="px-4 py-3 text-left title-small text-on-surface">Status</th>
                        <th className="px-4 py-3 text-left title-small text-on-surface">Buyer</th>
                        <th className="px-4 py-3 text-right title-small text-on-surface">Items</th>
                        <th className="px-4 py-3 text-right title-small text-on-surface">Total</th>
                        <th className="px-4 py-3 text-right title-small text-on-surface"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredShowroomOrders.map((order) => {
                        const getStatusColor = (status: ShowroomOrder['status']) => {
                          switch (status) {
                            case 'submitted': return 'text-on-surface-variant';
                            case 'in_review': return 'text-warning';
                            case 'approved': return 'text-tertiary';
                            case 'rejected': return 'text-error';
                            case 'fulfillment': return 'text-primary';
                            case 'shipped': return 'text-tertiary';
                            case 'closed': return 'text-on-surface-variant';
                            default: return 'text-on-surface-variant';
                          }
                        };

                        const getStatusDisplay = (status: ShowroomOrder['status']) => {
                          switch (status) {
                            case 'submitted': return 'Submitted';
                            case 'in_review': return 'In Review';
                            case 'approved': return 'Approved';
                            case 'rejected': return 'Rejected';
                            case 'fulfillment': return 'Fulfillment';
                            case 'shipped': return 'Shipped';
                            case 'closed': return 'Closed';
                            default: return status;
                          }
                        };
                        
                        return (
                          <tr 
                            key={order.id}
                            onClick={() => onViewShowroomOrder?.(order.id)}
                            className="border-b border-outline-variant last:border-b-0 hover:bg-surface-container-high transition-colors cursor-pointer"
                          >
                            <td className="px-4 py-3 body-medium text-on-surface-variant">{new Date(order.createdAt).toLocaleDateString()}</td>
                            <td className="px-4 py-3 body-medium text-on-surface">#{order.id}</td>
                            <td className="px-4 py-3 body-medium text-on-surface-variant">{order.type.toUpperCase()}</td>
                            <td className="px-4 py-3">
                              <span className={`body-medium ${getStatusColor(order.status)}`}>
                                {getStatusDisplay(order.status)}
                              </span>
                            </td>
                            <td className="px-4 py-3 body-medium text-on-surface">{order.buyerName}</td>
                            <td className="px-4 py-3 body-medium text-on-surface text-right">{order.items.length}</td>
                            <td className="px-4 py-3 body-medium text-on-surface text-right">${order.subtotal.toFixed(2)}</td>
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
            ) : showDeliveryNotes && filteredDeliveryNotes.length > 0 ? (
              // Show Delivery Notes (Shipments)
              <>
                {/* Mobile: Card View */}
                <div className="flex md:hidden flex-col gap-2">
                  {filteredDeliveryNotes.map((deliveryNote) => (
                    <div key={deliveryNote.id} className="bg-surface border border-outline-variant rounded-lg overflow-hidden">
                      <PartnerDeliveryNoteItem 
                        deliveryNote={deliveryNote}
                        orders={partnerOrdersList}
                        onClick={() => onOpenShipmentDetails?.(deliveryNote)}
                        isAdmin={isAdmin}
                        onDelete={onDeleteDeliveryNote}
                        showSenderReceiver={true}
                        stores={stores}
                        brands={brands}
                        warehouses={warehouses}
                      />
                    </div>
                  ))}
                </div>
                
                {/* Desktop: Table View */}
                <div className="hidden md:block bg-surface border border-outline-variant rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-surface-container-high border-b border-outline-variant">
                      <tr>
                        <th className="px-4 py-3 text-left title-small text-on-surface">Date</th>
                        <th className="px-4 py-3 text-left title-small text-on-surface">Delivery ID</th>
                        <th className="px-4 py-3 text-left title-small text-on-surface">Sender / Receiver</th>
                        <th className="px-4 py-3 text-right title-small text-on-surface">Orders</th>
                        <th className="px-4 py-3 text-right title-small text-on-surface">Items</th>
                        <th className="px-4 py-3 text-right title-small text-on-surface">Boxes</th>
                        <th className="px-4 py-3 text-right title-small text-on-surface">Status</th>
                        <th className="px-4 py-3 text-right title-small text-on-surface"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDeliveryNotes.map((deliveryNote) => {
                        const noteStatus = deliveryNote.status as DeliveryNoteStatus;
                        const relatedOrders = partnerOrdersList.filter(order => order.deliveryNote === deliveryNote.id);
                        const totalItems = relatedOrders.reduce((sum, order) => sum + order.itemCount, 0);
                        const senderName = relatedOrders[0]?.partnerName;
                        const receiverDisplay = getReceiverDisplay(relatedOrders[0]?.receivingStoreId, relatedOrders[0]?.receivingStoreName);
                        const storeRecord = relatedOrders[0]?.receivingStoreId ? stores?.find(store => store.id === relatedOrders[0]?.receivingStoreId) : undefined;
                        const storeNameDisplay = storeRecord?.name || relatedOrders[0]?.receivingStoreName;
                        const warehouseName = relatedOrders[0]?.warehouseName || (relatedOrders[0]?.warehouseId ? warehouses?.find(warehouse => warehouse.id === relatedOrders[0]?.warehouseId)?.name : undefined);
                        
                        const getStatusBadgeColor = (status: DeliveryNoteStatus) => {
                          switch (status) {
                            case 'pending': return 'bg-warning-container text-on-warning-container';
                            case 'registered': return 'bg-primary-container text-on-primary-container';
                            default: return 'bg-surface-container-high text-on-surface-variant';
                          }
                        };

                        const getStatusDisplay = (status: DeliveryNoteStatus) => {
                          switch (status) {
                            case 'pending': return 'Pending Shipment';
                            case 'registered': return 'In Transit';
                            default: return status;
                          }
                        };
                        
                        return (
                          <tr 
                            key={deliveryNote.id}
                            className="border-b border-outline-variant last:border-b-0 hover:bg-surface-container-high transition-colors"
                          >
                            <td className="px-4 py-3 body-small text-on-surface-variant">{deliveryNote.createdDate}</td>
                            <td 
                              className="px-4 py-3 body-medium text-on-surface cursor-pointer"
                              onClick={() => onOpenShipmentDetails?.(deliveryNote)}
                            >{deliveryNote.id}</td>
                            <td 
                              className="px-4 py-3 body-small text-on-surface-variant cursor-pointer"
                              onClick={() => onOpenShipmentDetails?.(deliveryNote)}
                            >
                              <div className="space-y-0.5">
                                {warehouseName && (
                                  <span className="block">From: {warehouseName}</span>
                                )}
                                {!warehouseName && senderName && (
                                  <span className="block">From: {senderName}</span>
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
                              onClick={() => onOpenShipmentDetails?.(deliveryNote)}
                            >{relatedOrders.length}</td>
                            <td 
                              className="px-4 py-3 body-medium text-on-surface text-right cursor-pointer"
                              onClick={() => onOpenShipmentDetails?.(deliveryNote)}
                            >{totalItems}</td>
                            <td 
                              className="px-4 py-3 body-medium text-on-surface text-right cursor-pointer"
                              onClick={() => onOpenShipmentDetails?.(deliveryNote)}
                            >{deliveryNote.boxes?.length || 0}</td>
                            <td 
                              className="px-4 py-3 text-right cursor-pointer"
                              onClick={() => onOpenShipmentDetails?.(deliveryNote)}
                            >
                              <div className={`inline-flex px-3 py-1.5 rounded-full label-medium min-w-[120px] justify-center ${getStatusBadgeColor(noteStatus)}`}>
                                {getStatusDisplay(noteStatus)}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              {isAdmin && noteStatus === 'pending' && onDeleteDeliveryNote ? (
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
                                  onClick={() => onOpenShipmentDetails?.(deliveryNote)}
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
                <div className="flex md:hidden flex-col gap-2">
                  {filteredPartnerOrders.map((order) => (
                    <div key={order.id} className="bg-surface border border-outline-variant rounded-lg overflow-hidden">
                      <PartnerOrderItem 
                        order={order}
                        onClick={() => {
                          if (order.status === 'pending' && order.partnerName === 'Sellpy Operations') {
                            handleSellpyOrderSelect(order.id);
                          } else if (onOpenOrderDetails) {
                            onOpenOrderDetails(order);
                          }
                        }}
                        isClickable={true}
                        isSellpyPending={order.status === 'pending' && order.partnerName === 'Sellpy Operations'}
                        isAdmin={isAdmin}
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
                <div className="hidden md:block bg-surface border border-outline-variant rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-surface-container-high border-b border-outline-variant">
                      <tr>
                        <th className="px-4 py-3 text-left title-small text-on-surface">Date</th>
                        <th className="px-4 py-3 text-left title-small text-on-surface">Order ID</th>
                        <th className="px-4 py-3 text-left title-small text-on-surface">External Order ID</th>
                        <th className="px-4 py-3 text-left title-small text-on-surface">Sender / Receiver</th>
                        <th className="px-4 py-3 text-right title-small text-on-surface">Items</th>
                        <th className="px-4 py-3 text-right title-small text-on-surface">Order Value</th>
                        <th className="px-4 py-3 text-right title-small text-on-surface">Sales Margin %</th>
                        <th className="px-4 py-3 text-right title-small text-on-surface">Status</th>
                        <th className="px-4 py-3 text-right title-small text-on-surface"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPartnerOrders.map((order) => {
                        const getStatusDisplay = (status: ShippingPartnerOrder['status']) => {
                          switch (status) {
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
                            case 'pending': return 'bg-warning-container text-on-warning-container';
                            case 'registered': return 'bg-secondary-container text-on-secondary-container';
                            case 'in-transit': return 'bg-primary-container text-on-primary-container';
                            case 'delivered': return 'bg-tertiary-container text-on-tertiary-container';
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
                                  onOpenOrderDetails(order);
                                }
                              }}
                            >{order.id}</td>
                            <td 
                              className="px-4 py-3 body-small text-on-surface-variant cursor-pointer"
                              onClick={() => {
                                if (isSellpyPending) {
                                  handleSellpyOrderSelect(order.id);
                                } else if (onOpenOrderDetails) {
                                  onOpenOrderDetails(order);
                                }
                              }}
                            >
                              {order.externalOrderId || '-'}
                            </td>
                            <td 
                              className="px-4 py-3 body-small text-on-surface-variant cursor-pointer"
                              onClick={() => {
                                if (isSellpyPending) {
                                  handleSellpyOrderSelect(order.id);
                                } else if (onOpenOrderDetails) {
                                  onOpenOrderDetails(order);
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
                                  onOpenOrderDetails(order);
                                }
                              }}
                            >{order.itemCount}</td>
                            <td 
                              className="px-4 py-3 body-medium text-on-surface text-right cursor-pointer"
                              onClick={() => {
                                if (isSellpyPending) {
                                  handleSellpyOrderSelect(order.id);
                                } else if (onOpenOrderDetails) {
                                  onOpenOrderDetails(order);
                                }
                              }}
                            >
                              {order.orderValue ? `$${order.orderValue.toFixed(2)}` : '-'}
                            </td>
                            <td 
                              className="px-4 py-3 body-medium text-on-surface text-right cursor-pointer"
                              onClick={() => {
                                if (isSellpyPending) {
                                  handleSellpyOrderSelect(order.id);
                                } else if (onOpenOrderDetails) {
                                  onOpenOrderDetails(order);
                                }
                              }}
                            >
                              {order.salesMargin !== undefined ? `${order.salesMargin.toFixed(1)}%` : '-'}
                            </td>
                            <td 
                              className="px-4 py-3 text-right cursor-pointer"
                              onClick={() => {
                                if (isSellpyPending) {
                                  handleSellpyOrderSelect(order.id);
                                } else if (onOpenOrderDetails) {
                                  onOpenOrderDetails(order);
                                }
                              }}
                            >
                              <div className={`inline-flex px-3 py-1.5 rounded-full label-medium min-w-[140px] justify-center ${getStatusBadgeColor(order.status)}`}>
                                {getStatusDisplay(order.status)}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              {(isAdmin && order.status === 'pending' && onDeletePartnerOrder) || (order.status === 'registered' && onCreateDeliveryNoteForOrder) ? (
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
                                    {isAdmin && order.status === 'pending' && onDeletePartnerOrder && (
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
                                        onOpenOrderDetails(order);
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
                    {isChinesePartner && activeTab === 'pending' ? 'No purchase orders found' :
                     activeTab === 'pending' ? 'No orders found' :
                     activeTab === 'in-transit' ? (shipmentStatusFilter === 'delivered' ? 'No delivered shipments' : shipmentStatusFilter === 'all' ? 'No shipments found' : 'No shipments in transit') :
                     'No items found'}
                  </h5>
                  <p className="body-medium text-on-surface-variant">
                    {isChinesePartner && activeTab === 'pending' ? 'Purchase orders from buyers will appear here' :
                     activeTab === 'pending' ? 'Create your first order to get started' :
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
                <div className="flex md:hidden flex-col gap-2">
                  {filteredDeliveries.map((delivery) => (
                    <div key={delivery.id} className="bg-surface border border-outline-variant rounded-lg overflow-hidden">
                      <DeliveryItem 
                        delivery={delivery} 
                        onSelect={() => onSelectDelivery(delivery)} 
                      />
                    </div>
                  ))}
                  {activeTab === 'all' && filteredReturnDeliveries.map((returnDelivery) => (
                    <div key={returnDelivery.id} className="bg-surface border border-outline-variant rounded-lg overflow-hidden">
                      <ReturnDeliveryComponent 
                        returnDelivery={returnDelivery}
                        onUpdateStatus={onUpdateReturnDeliveryStatus}
                        onCancel={onCancelReturn}
                        onClick={() => onOpenReturnDetails?.(returnDelivery)}
                        stores={stores}
                        brands={brands}
                        warehouses={warehouses}
                        userRole={role}
                      />
                    </div>
                  ))}
                </div>
                
                {/* Desktop: Table View */}
                <div className="hidden md:block bg-surface border border-outline-variant rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-surface-container-high border-b border-outline-variant">
                      <tr>
                        <th className="px-4 py-3 text-left title-small text-on-surface">Date</th>
                        <th className="px-4 py-3 text-left title-small text-on-surface">Delivery ID</th>
                        <th className="px-4 py-3 text-left title-small text-on-surface">Status</th>
                        <th className="px-4 py-3 text-left title-small text-on-surface">Sender</th>
                        <th className="px-4 py-3 text-right title-small text-on-surface">Orders</th>
                        <th className="px-4 py-3 text-right title-small text-on-surface">Items</th>
                        <th className="px-4 py-3 text-right title-small text-on-surface">Boxes</th>
                        <th className="px-4 py-3 text-right title-small text-on-surface"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDeliveries.map((delivery) => {
                        const getStatusColor = (status: Delivery['status']) => {
                          switch (status) {
                            case 'In transit': return 'text-primary';
                            case 'Delivered': return 'text-tertiary';
                            case 'Partially Delivered': return 'text-warning';
                            case 'Cancelled': return 'text-error';
                            default: return 'text-on-surface-variant';
                          }
                        };
                        
                        return (
                          <tr 
                            key={delivery.id}
                            onClick={() => onSelectDelivery(delivery)}
                            className="border-b border-outline-variant last:border-b-0 hover:bg-surface-container-high transition-colors cursor-pointer"
                          >
                            <td className="px-4 py-3 body-medium text-on-surface-variant">{delivery.date}</td>
                            <td className="px-4 py-3 body-medium text-on-surface">{delivery.deliveryId}</td>
                            <td className="px-4 py-3">
                              <span className={`body-medium ${getStatusColor(delivery.status)}`}>
                                {delivery.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 body-medium text-on-surface">{delivery.sender}</td>
                            <td className="px-4 py-3 body-medium text-on-surface text-right">{delivery.orders}</td>
                            <td className="px-4 py-3 body-medium text-on-surface text-right">{delivery.items}</td>
                            <td className="px-4 py-3 body-medium text-on-surface text-right">{delivery.boxes}</td>
                            <td className="px-4 py-3 text-right">
                              <ChevronRight className="w-5 h-5 text-on-surface-variant inline-block" />
                            </td>
                          </tr>
                        );
                      })}
                      {activeTab === 'all' && filteredReturnDeliveries.map((returnDelivery) => {
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

                        const getStatusColor = (status: ReturnDelivery['status']) => {
                          switch (status) {
                            case 'Pending': return 'text-warning';
                            case 'In transit': return 'text-primary';
                            case 'Returned': return 'text-tertiary';
                            default: return 'text-on-surface-variant';
                          }
                        };

                        return (
                          <tr 
                            key={returnDelivery.id}
                            onClick={() => onOpenReturnDetails?.(returnDelivery)}
                            className="border-b border-outline-variant last:border-b-0 hover:bg-surface-container-high transition-colors cursor-pointer"
                          >
                            <td className="px-4 py-3 body-medium text-on-surface-variant">{returnDelivery.date}</td>
                            <td className="px-4 py-3 body-medium text-on-surface">{returnDelivery.deliveryId}</td>
                            <td className="px-4 py-3">
                              <span className={`body-medium ${getStatusColor(returnDelivery.status)}`}>
                                {returnDelivery.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 body-medium text-on-surface">{receiverDisplay}</td>
                            <td className="px-4 py-3 body-medium text-on-surface text-right">—</td>
                            <td className="px-4 py-3 body-medium text-on-surface text-right">{returnDelivery.items}</td>
                            <td className="px-4 py-3 body-medium text-on-surface text-right">{returnDelivery.boxes}</td>
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