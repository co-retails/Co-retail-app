import React, { memo, ReactNode } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import svgPaths from "../imports/svg-7un8q74kd7";
import svgPathsNew from "../imports/svg-9jzmb4i3sv";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Edit3, XCircle, Package, Store, ShoppingBag, AlertTriangle, Ban, RotateCcw } from "lucide-react";
import type { StatusHistoryEntry } from './ItemDetailsDialog';

// Base item interface that works for both Item and OrderItem
export interface BaseItem {
  id: string;
  itemId?: string;
  title?: string;
  brand: string;
  category: string;
  subcategory?: string;
  size?: string;
  color?: string;
  price: number;
  purchasePrice?: number;
  currency?: string;
  status?: string;
  date?: string;
  deliveryId?: string;
  sellerName?: string;
  image?: string; // Full-size product image
  thumbnail?: string; // Thumbnail/fallback image
  daysRemaining?: number;
  selected?: boolean;
  statusHistory?: StatusHistoryEntry[];
  rejectReason?: 'Broken on arrival' | 'Not accepted brand' | 'Not in season';
  lastInStoreAt?: string;
  // Order-specific fields
  partnerItemId?: string;
  retailerItemId?: string;
  gender?: string;
  source?: string;
  errors?: string[];
}

export type UserRole = 'admin' | 'store-staff' | 'store-manager' | 'partner' | 'buyer';

interface OrderDetailsCardConfig {
  partnerLabel?: string;
  retailerLabel?: string;
  showPartnerId?: boolean;
  showRetailerId?: boolean;
  showCategory?: boolean;
  showSubcategory?: boolean;
  showSize?: boolean;
  showColor?: boolean;
  showPrice?: boolean;
  showPurchasePrice?: boolean;
  showMargin?: boolean;
  currency?: string;
  marginValue?: number;
  extraFields?: Array<{ label: string; value?: ReactNode }>;
  errorMessages?: string[];
  orderStatus?: string; // Order status to derive item display status
}

interface ItemCardProps {
  item: BaseItem;
  onToggleSelect?: (itemId: string) => void;
  onMoreActions?: (item: BaseItem, action: 'in-store' | 'store-transfer' | 'sold' | 'missing' | 'broken' | 'rejected' | 'in-store-2nd-try') => void;
  onEdit?: (item: BaseItem) => void;
  onClick?: (item: BaseItem) => void;
  variant?: 'items-list' | 'order-details';
  showActions?: boolean;
  showSelection?: boolean;
  userRole?: UserRole;
  orderDetailsConfig?: OrderDetailsCardConfig;
}

export const ItemCard = memo(function ItemCard({ 
  item, 
  onToggleSelect, 
  onMoreActions, 
  onEdit,
  onClick,
  variant = 'items-list',
  showActions = true,
  showSelection = true,
  userRole = 'store-staff',
  orderDetailsConfig
}: ItemCardProps) {
  const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
  const normalizeTimestamp = (value: string) => {
    if (value.includes('T')) return value;
    const sanitized = value.replace(' ', 'T');
    return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(sanitized) ? `${sanitized}:00` : sanitized;
  };
  const getLastInStoreTimestamp = () => {
    if (item.lastInStoreAt) {
      const parsed = Date.parse(item.lastInStoreAt);
      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }
    if (item.statusHistory && item.statusHistory.length) {
      for (let i = item.statusHistory.length - 1; i >= 0; i--) {
        const entry = item.statusHistory[i];
        if (!entry) {
          continue;
        }
        if (entry.status?.toLowerCase() === 'in store') {
          const parsed = entry.timestamp ? Date.parse(normalizeTimestamp(entry.timestamp)) : NaN;
          if (!Number.isNaN(parsed)) {
            return parsed;
          }
        }
      }
    }
    return undefined;
  };
  const canRejectItem = () => {
    if (!onMoreActions) return false;
    if (userRole !== 'admin') return false;
    if (!item.status || item.status.toLowerCase() !== 'in store') return false;
    const timestamp = getLastInStoreTimestamp();
    if (timestamp === undefined) return false;
    return Date.now() - timestamp <= TWENTY_FOUR_HOURS_MS;
  };

  // Get available actions based on item status
  const getAvailableActions = () => {
    if (!onMoreActions || !item.status) return [];
    
    const status = item.status.toLowerCase();
    const isAdmin = userRole === 'admin';
    const actions: Array<{ action: string; label: string; icon: React.ReactNode; className?: string }> = [];

    // In transit items: In store, Store transfer
    if (status === 'in transit' || status === 'return - in transit') {
      actions.push(
        { action: 'in-store', label: 'In store', icon: <Package className="mr-2 h-4 w-4" /> },
        { action: 'store-transfer', label: 'Store transfer', icon: <Store className="mr-2 h-4 w-4" /> }
      );
    }
    // In store items: Sold (only for Admins), Missing, Broken, Rejected (only visible within 24 hours)
    else if (status === 'in store') {
      if (isAdmin) {
        actions.push({ action: 'sold', label: 'Sold', icon: <ShoppingBag className="mr-2 h-4 w-4" /> });
      }
      actions.push(
        { action: 'missing', label: 'Missing', icon: <AlertTriangle className="mr-2 h-4 w-4" /> },
        { action: 'broken', label: 'Broken', icon: <XCircle className="mr-2 h-4 w-4" /> }
      );
      if (canRejectItem()) {
        actions.push({ action: 'rejected', label: 'Rejected', icon: <Ban className="mr-2 h-4 w-4" />, className: 'text-error' });
      }
    }
    // Expired items: Sold (only for admins), In store, In store 2nd try, Missing, Broken
    else if (status === 'expired' || status === 'to return') {
      if (isAdmin) {
        actions.push({ action: 'sold', label: 'Sold', icon: <ShoppingBag className="mr-2 h-4 w-4" /> });
      }
      actions.push(
        { action: 'in-store', label: 'In store', icon: <Package className="mr-2 h-4 w-4" /> },
        { action: 'in-store-2nd-try', label: 'In store 2nd try', icon: <RotateCcw className="mr-2 h-4 w-4" /> },
        { action: 'missing', label: 'Missing', icon: <AlertTriangle className="mr-2 h-4 w-4" /> },
        { action: 'broken', label: 'Broken', icon: <XCircle className="mr-2 h-4 w-4" /> }
      );
    }
    // Missing items: In store, Sold (available to all users)
    else if (status === 'missing') {
      actions.push(
        { action: 'in-store', label: 'In store', icon: <Package className="mr-2 h-4 w-4" /> },
        { action: 'sold', label: 'Sold', icon: <ShoppingBag className="mr-2 h-4 w-4" /> }
      );
    }
    // Sold items: In store
    else if (status === 'sold') {
      actions.push({ action: 'in-store', label: 'In store', icon: <Package className="mr-2 h-4 w-4" /> });
    }

    return actions;
  };
  const getStatusColor = (status?: string) => {
    if (!status) return 'text-on-surface-variant';
    
    switch (status.toLowerCase()) {
      case 'in store':
        return 'text-success';
      case 'in transit':
      case 'pending':
        return 'text-on-surface-variant';
      case 'to return':
      case 'expired':
        return 'text-error';
      case 'archived':
        return 'text-on-surface-variant';
      case 'in store 2nd try':
        return 'text-tertiary';
      case 'error':
        return 'text-error';
      case 'rejected':
        return 'text-error';
      default:
        return 'text-on-surface-variant';
    }
  };

  if (variant === 'order-details') {
    const {
      partnerLabel = 'Partner ID',
      retailerLabel = 'Retailer ID',
      showPartnerId = true,
      showRetailerId = true,
      showCategory = true,
      showSubcategory = true,
      showSize = true,
      showColor = true,
      showPrice = true,
      showPurchasePrice = false,
      showMargin = false,
      currency,
      marginValue,
      extraFields = [],
      errorMessages,
      orderStatus
    } = orderDetailsConfig || {};

    // Derive item display status from order status and item state
    const getItemDisplayStatus = () => {
      // If item has validation errors, show error
      if (item.status === 'error' || (errorMessages && errorMessages.length > 0)) {
        return { text: 'Error', color: 'text-error' };
      }
      
      // If order status is provided, use it to determine item status
      if (orderStatus) {
        switch (orderStatus) {
          case 'pending':
            // For pending orders, show "Ready" if retailer ID exists, otherwise "Pending"
            return item.retailerItemId 
              ? { text: 'Ready', color: 'text-success' }
              : { text: 'Pending', color: 'text-on-surface-variant' };
          case 'registered':
            return { text: 'Registered', color: 'text-success' };
          case 'in-transit':
            return { text: 'In Transit', color: 'text-primary' };
          case 'delivered':
            return { text: 'Delivered', color: 'text-tertiary' };
          case 'in-review':
            return { text: 'In Review', color: 'text-warning' };
          default:
            // Fallback: show "Ready" if retailer ID exists, otherwise use order status or "Pending"
            return item.retailerItemId
              ? { text: 'Ready', color: 'text-success' }
              : { text: orderStatus ? (orderStatus.charAt(0).toUpperCase() + orderStatus.slice(1)) : 'Pending', color: 'text-on-surface-variant' };
        }
      }
      
      // Fallback: use item status or retailer ID presence
      if (item.retailerItemId) {
        return { text: 'Ready', color: 'text-success' };
      }
      return { text: item.status || 'Pending', color: item.status === 'error' ? 'text-error' : 'text-on-surface-variant' };
    };

    const displayStatus = getItemDisplayStatus();

    const priceCurrency = currency ?? item.currency;
    const formatPrice = (value?: number) => {
      if (value === undefined || Number.isNaN(value)) {
        return '—';
      }
      if (priceCurrency) {
        return `${value.toFixed(2)} ${priceCurrency}`;
      }
      return `$${value.toFixed(2)}`;
    };

    const derivedMargin = showMargin
      ? (marginValue !== undefined
          ? marginValue
          : (item.price && item.purchasePrice !== undefined && item.price > 0
              ? ((item.price - item.purchasePrice) / item.price) * 100
              : undefined))
      : undefined;

    const combinedErrors = errorMessages?.length
      ? errorMessages
      : item.errors;

    return (
      <div className="w-full bg-surface-container hover:bg-surface-container-high border border-outline-variant rounded-lg transition-colors">
        {/* M3 Three-line List Item - Mobile Layout */}
        <button 
          className="w-full flex items-center gap-4 p-4 text-left md:hidden"
          onClick={() => onEdit?.(item)}
          aria-label="Edit item"
        >
          {/* Status Indicator */}

          
          {/* Thumbnail */}
          <div className="flex-shrink-0 w-14 h-14 bg-surface-container rounded-xl overflow-hidden">
            {item.image || item.thumbnail ? (
              <ImageWithFallback 
                src={item.image || item.thumbnail || ''} 
                alt={item.title || item.brand}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-surface-variant flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="var(--on-surface-variant)" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Z" />
                </svg>
              </div>
            )}
          </div>
          
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Line 1: Status */}
            <div className="flex items-center gap-2 mb-1 min-w-0">
              <div className={`label-small whitespace-nowrap flex-shrink-0 ${displayStatus.color}`}>
                {displayStatus.text}
              </div>
            </div>
            
            {/* Line 2: Title/Item ID */}
            <div className="title-small text-on-surface mb-0.5 truncate">
              {item.title || `${item.brand} ${item.category}`}
            </div>
            
            {/* Line 3: Brand • Category • Size */}
            <div className="body-small text-on-surface-variant mb-1 truncate">
              {[
                item.brand,
                showCategory ? item.category : undefined,
                showSubcategory ? item.subcategory : undefined,
                showSize ? item.size : undefined,
                showColor ? item.color : undefined
              ].filter(Boolean).join(' • ')}
            </div>
            
            {/* Line 4: Partner ID and Retailer ID (two columns) */}
            {(showPartnerId || showRetailerId) && (
              <div className="grid grid-cols-2 gap-2 label-small text-on-surface-variant opacity-90">
                {showPartnerId && (
                  <div className="truncate">
                    <span className="block text-on-surface-variant/70">{partnerLabel}</span>
                    <span className="text-on-surface">{item.partnerItemId || '—'}</span>
                  </div>
                )}
                {showRetailerId && (
                  <div className="truncate">
                    <span className="block text-on-surface-variant/70">{retailerLabel}</span>
                    <span className={`text-on-surface ${item.retailerItemId ? 'text-success' : ''}`}>
                      {item.retailerItemId || '—'}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Price Info */}
            {(showPurchasePrice || showPrice || (showMargin && derivedMargin !== undefined)) && (
              <div className="mt-3 pt-3 border-t border-outline-variant">
                <div className="flex flex-wrap gap-4">
                  {showPurchasePrice && (
                    <div className="label-small">
                      <span className="text-on-surface-variant/70">Purchase:</span>
                      <span className="text-on-surface ml-1">
                        {formatPrice(item.purchasePrice)}
                      </span>
                    </div>
                  )}
                  {showPrice && (
                    <div className="label-small">
                      <span className="text-on-surface-variant/70">Price:</span>
                      <span className="text-on-surface ml-1">
                        {formatPrice(item.price)}
                      </span>
                    </div>
                  )}
                  {showMargin && derivedMargin !== undefined && (
                    <div className="label-small">
                      <span className="text-on-surface-variant/70">Margin:</span>
                      <span className="text-primary ml-1">
                        {derivedMargin.toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {extraFields.length > 0 && (
              <div className="mt-3 pt-3 border-t border-outline-variant">
                <div className="grid grid-cols-2 gap-2">
                  {extraFields.map((field) => (
                    <div key={field.label} className="label-small text-on-surface-variant">
                      <span className="block text-on-surface-variant/70">{field.label}</span>
                      <span className="text-on-surface">{field.value || '—'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Trailing Elements */}
          <div className="flex-shrink-0 flex items-center gap-2">
            {/* Price */}
            <div className="text-right">
              {showPrice && (
                <div className="title-small text-on-surface whitespace-nowrap">
                  {formatPrice(item.price)}
                </div>
              )}
            </div>
          </div>
        </button>

        {/* Desktop/Tablet: Table Row Layout */}
        <div className="hidden md:flex items-center gap-4 px-4 py-3 hover:bg-surface-container-high transition-colors">

          
          {/* Item Info */}
          <div className="flex-1 grid grid-cols-5 gap-4 items-center">
            <div className="min-w-0">
              <p className="title-small text-on-surface break-words">{item.partnerItemId || 'N/A'}</p>
              <p className="body-small text-on-surface-variant">Partner ID</p>
            </div>
            <div className="min-w-0">
              <p className="title-small text-on-surface break-words">{item.brand}</p>
              <p className="body-small text-on-surface-variant">{item.category}</p>
            </div>
            <div className="min-w-0">
              <p className="title-small text-on-surface">{item.size || 'N/A'}</p>
              <p className="body-small text-on-surface-variant">{item.color}</p>
            </div>
            <div className="min-w-0">
              <p className="title-small text-on-surface">${item.price.toFixed(2)}</p>
              <p className="body-small text-on-surface-variant">Price</p>
            </div>
            <div className="min-w-0">
              {item.retailerItemId ? (
                <div>
                  <p className="title-small text-on-surface break-words">{item.retailerItemId}</p>
                  <p className="body-small text-success">Assigned</p>
                </div>
              ) : (
                <div>
                  <p className="title-small text-on-surface-variant">Not assigned</p>
                  <p className="body-small text-on-surface-variant">Retailer ID</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Actions */}
          {onEdit && showActions && (
            <button
              onClick={() => onEdit(item)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest transition-colors text-on-surface-variant flex-shrink-0"
            >
              <Edit3 size={16} />
            </button>
          )}
        </div>
        
        {item.status === 'error' && combinedErrors && (
          <div className="mx-4 mb-3 p-3 rounded-xl bg-error-container/20 border border-error">
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 rounded-full bg-error flex items-center justify-center mt-0.5">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" className="text-on-error" />
                </svg>
              </div>
              <p className="body-small text-on-error-container">
                {combinedErrors.join(', ')}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default items-list variant
  return (
    <div className="w-full bg-surface-container hover:bg-surface-container-high border-b border-outline-variant last:border-b-0 transition-colors">
      {/* M3 List Item - Based on Figma Design */}
      <div className="flex items-center px-1 py-3">
        
        {/* Leading Element - Checkbox for selection */}
        {showSelection && (
          <div className="flex items-center justify-center flex-shrink-0">
            <button 
              className="p-3 rounded-lg hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest transition-colors"
              onClick={() => onToggleSelect?.(item.id)}
              aria-label={item.selected ? "Deselect item" : "Select item"}
            >
              <div className="relative w-6 h-6">
                {item.selected ? (
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 44 44">
                    <path d={svgPaths.p10e86e80} fill="var(--primary)" />
                  </svg>
                ) : (
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 44 44">
                    <path d={svgPaths.p3e435600} fill="var(--on-surface-variant)" />
                  </svg>
                )}
              </div>
            </button>
          </div>
        )}
        
        {/* Thumbnail */}
        <div className="flex-shrink-0 w-12 h-[68px] bg-[rgba(0,0,0,0.08)] rounded flex items-center justify-center overflow-hidden">
          {item.image || item.thumbnail ? (
            <ImageWithFallback 
              src={item.image || item.thumbnail || ''} 
              alt={item.title || item.brand}
              className="w-full h-full object-cover"
            />
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 20 20" stroke="var(--on-surface)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
              <path d={svgPathsNew.p22bc0080} />
            </svg>
          )}
        </div>
        
        {/* Main Content */}
        <button 
          className="flex-1 min-w-0 text-left cursor-pointer hover:opacity-80 transition-opacity pl-3"
          onClick={() => onClick?.(item)}
        >
          {/* Line 1: Date • Status */}
          <div className="flex items-center gap-1 mb-0.5 min-w-0">
            <div className="label-small text-on-surface whitespace-nowrap flex-shrink-0">
              {item.date || '2022-06-09'}
            </div>
            <div className="w-1 h-1 rounded-full bg-outline-variant flex-shrink-0"></div>
            <div className={`label-small whitespace-nowrap truncate ${getStatusColor(item.status)}`}>
              {item.status || 'No Status'}
            </div>
          </div>
          
          {/* Line 2: Brand */}
          <div className="title-small text-on-surface mb-0.5 truncate">
            {item.brand}
          </div>
          
          {/* Line 3: Category • Size */}
          <div className="body-small text-on-surface mb-0.5 truncate">
            {item.category}{item.size ? ` • ${item.size}` : ''}
          </div>
          
          {/* Line 4: ID and Delivery */}
          <div className="label-small text-on-surface opacity-90 mb-0.5">
            <div className="line-clamp-2">
              ID: {item.retailerItemId || item.itemId || item.partnerItemId || '684756'}
              {item.deliveryId && (
                <>
                  <br />
                  Delivery: {item.deliveryId}
                </>
              )}
            </div>
          </div>
          
          {/* Line 5: Seller */}
          <div className="body-small text-on-surface truncate">
            {item.sellerName || 'Sellpy'}
          </div>
          {item.status?.toLowerCase() === 'rejected' && item.rejectReason && (
            <div className="label-small text-error truncate mt-1">
              Reason: {item.rejectReason}
            </div>
          )}
        </button>
        
        {/* Trailing Elements */}
        <div className="flex-shrink-0 flex items-center gap-0 h-full">
          {/* Price and Days */}
          <div className="flex flex-col items-end justify-center h-full px-0">
            <div className="title-small text-on-surface whitespace-nowrap">
              €{item.price.toFixed(2)}
            </div>
            {item.daysRemaining !== undefined && (
              <div className="label-small text-on-surface whitespace-nowrap">
                {item.daysRemaining} days
              </div>
            )}
          </div>
          
          {/* More Actions */}
          {showActions && onMoreActions && (
            <div className="flex items-center justify-center h-full">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button 
                    className="p-3 rounded-lg hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest transition-colors"
                    aria-label="More actions"
                  >
                    <svg className="w-6 h-6" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                      <path d={svgPathsNew.p3fdba000} fill="var(--on-surface)" />
                    </svg>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Item actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {getAvailableActions().map((actionItem) => (
                    <DropdownMenuItem
                      key={actionItem.action}
                      onClick={() => onMoreActions?.(item, actionItem.action as any)}
                      className={actionItem.className}
                    >
                      {actionItem.icon}
                      <span>{actionItem.label}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});