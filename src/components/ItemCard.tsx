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
import { Edit3, XCircle, Package, Store, ShoppingBag, AlertTriangle, Ban, RotateCcw, Flag, MapPin } from "lucide-react";
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
  rejectReason?: 'Rejected - Broken on arrival' | 'Rejected - Dirty' | 'Rejected - Not accepted brand' | 'Rejected - Not accepted material' | 'Rejected - Not in season' | 'Rejected - Wrong store';
  lastInStoreAt?: string;
  location?: 'Warehouse' | 'In transit' | 'Shopfloor' | 'Back of House' | 'Partner';
  // Order-specific fields
  partnerItemId?: string;
  retailerItemId?: string;
  gender?: string;
  source?: string;
  errors?: string[];
  isExpired?: boolean;
  expiredFlaggedAt?: string;
  expiredPostponeWeeks?: number;
  isArchived?: boolean;
  archivedAt?: string;
  boxLabel?: string;
}

export type UserRole = 'admin' | 'store-staff' | 'store-manager' | 'partner';

export type ItemQuickAction =
  | 'mark-available'
  | 'store-transfer'
  | 'mark-sold'
  | 'mark-missing'
  | 'mark-broken'
  | 'mark-rejected'
  | 'mark-return-transit'
  | 'unflag-expired';

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
  isAdmin?: boolean; // Whether user is admin (for purchase price and margin visibility)
  /** Thrifted partner items: show Draft / In transit on the row, not Error/Ready from validation */
  thriftedPartnerItemCard?: boolean;
}

interface ItemCardProps {
  item: BaseItem;
  onToggleSelect?: (itemId: string) => void;
  onMoreActions?: (item: BaseItem, action: ItemQuickAction) => void;
  onEdit?: (item: BaseItem) => void;
  onClick?: (item: BaseItem) => void;
  /** Optional separate handler for clicking the thumbnail image (e.g. attach photo). */
  onThumbnailClick?: (item: BaseItem) => void;
  variant?: 'items-list' | 'order-details';
  showActions?: boolean;
  showSelection?: boolean;
  userRole?: UserRole;
  orderDetailsConfig?: OrderDetailsCardConfig;
  hideSellerName?: boolean;
  showExternalIdOnly?: boolean;
  showBothIds?: boolean;
  hideMissingAction?: boolean;
}

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

function normalizeTimestampForItem(value: string) {
  if (value.includes('T')) return value;
  const sanitized = value.replace(' ', 'T');
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(sanitized) ? `${sanitized}:00` : sanitized;
}

function getLastInStoreTimestampForItem(item: BaseItem): number | undefined {
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
      if (entry.status?.toLowerCase() === 'in store' || entry.status?.toLowerCase() === 'available') {
        const parsed = entry.timestamp ? Date.parse(normalizeTimestampForItem(entry.timestamp)) : NaN;
        if (!Number.isNaN(parsed)) {
          return parsed;
        }
      }
    }
  }
  return undefined;
}

/** Same rules as the row overflow menu — used for bulk actions on ItemsScreen. */
export function getItemListQuickActions(
  item: BaseItem,
  userRole: UserRole,
  hideMissingAction = false,
): Array<{ action: ItemQuickAction; label: string; className?: string }> {
  if (!item.status) return [];

  const status = item.status.toLowerCase();
  const isAdmin = userRole === 'admin';
  const actions: Array<{ action: ItemQuickAction; label: string; className?: string }> = [];

  const canReject =
    userRole === 'admin' &&
    (status === 'available' || status === 'in store') &&
    (() => {
      const timestamp = getLastInStoreTimestampForItem(item);
      if (timestamp === undefined) return false;
      return Date.now() - timestamp <= TWENTY_FOUR_HOURS_MS;
    })();

  if (status === 'in transit') {
    actions.push(
      { action: 'mark-available', label: 'In store' },
      { action: 'store-transfer', label: 'Store transfer' },
    );
  } else if (status === 'available' || status === 'in store') {
    if (isAdmin) {
      actions.push({ action: 'mark-sold', label: 'Sold' });
    }
    actions.push({ action: 'mark-broken', label: 'Broken' });
    if (canReject) {
      actions.push({ action: 'mark-rejected', label: 'Rejected', className: 'text-error' });
    }
  } else if (status === 'missing') {
    actions.push(
      { action: 'mark-available', label: 'Available' },
      { action: 'mark-sold', label: 'Sold' },
    );
  } else if (status === 'pending') {
    actions.push({ action: 'mark-available', label: 'In store' });
  } else if (status === 'expired') {
    actions.push({ action: 'mark-available', label: 'In store' });
  } else if (status === 'draft') {
    actions.push({ action: 'mark-available', label: 'In store' });
  }

  if (item.isExpired) {
    actions.push({ action: 'unflag-expired', label: 'Unflag expired' });
  }

  if (hideMissingAction) {
    return actions.filter(a => a.action !== 'mark-missing');
  }
  return actions;
}

export function quickActionIcon(action: ItemQuickAction): ReactNode {
  switch (action) {
    case 'mark-available':
      return <Package className="mr-2 h-4 w-4 shrink-0" />;
    case 'store-transfer':
      return <Store className="mr-2 h-4 w-4 shrink-0" />;
    case 'mark-sold':
      return <ShoppingBag className="mr-2 h-4 w-4 shrink-0" />;
    case 'mark-missing':
      return <AlertTriangle className="mr-2 h-4 w-4 shrink-0" />;
    case 'mark-broken':
      return <XCircle className="mr-2 h-4 w-4 shrink-0" />;
    case 'mark-rejected':
      return <Ban className="mr-2 h-4 w-4 shrink-0" />;
    case 'mark-return-transit':
      return <MapPin className="mr-2 h-4 w-4 shrink-0" />;
    case 'unflag-expired':
      return <RotateCcw className="mr-2 h-4 w-4 shrink-0" />;
    default:
      return null;
  }
}

export const ItemCard = memo(function ItemCard({ 
  item, 
  onToggleSelect, 
  onMoreActions, 
  onEdit,
  onClick,
  onThumbnailClick,
  variant = 'items-list',
  showActions = true,
  showSelection = true,
  userRole = 'store-staff',
  orderDetailsConfig,
  hideSellerName = false,
  showExternalIdOnly = false,
  showBothIds = false,
  hideMissingAction = false
}: ItemCardProps) {
  const thumbnailSrc = (item.image as string | undefined) || item.thumbnail || undefined;
  const renderThumbnailFallback = (variant: 'card' | 'list') => (
    <Package
      className={`${variant === 'card' ? 'w-6 h-6' : 'w-5 h-5'} text-on-surface-variant/60`}
    />
  );
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
        if (entry.status?.toLowerCase() === 'in store' || entry.status?.toLowerCase() === 'available') {
          const parsed = entry.timestamp ? Date.parse(normalizeTimestamp(entry.timestamp)) : NaN;
          if (!Number.isNaN(parsed)) {
            return parsed;
          }
        }
      }
    }
    return undefined;
  };

  // Calculate days in store from lastInStoreAt
  const calculateDaysInStore = (): number | null => {
    const timestamp = getLastInStoreTimestamp();
    if (timestamp === undefined) return null;
    const now = new Date();
    const diffTime = now.getTime() - timestamp;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 ? diffDays : null;
  };

  // Calculate days expired from expiredFlaggedAt
  const calculateDaysExpired = (): number | null => {
    if (!item.expiredFlaggedAt) return null;
    try {
      const expiredDate = new Date(item.expiredFlaggedAt);
      const now = new Date();
      const diffTime = now.getTime() - expiredDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 ? diffDays : null;
    } catch {
      return null;
    }
  };

  const daysInStore = calculateDaysInStore();
  const daysExpired = item.isExpired ? calculateDaysExpired() : null;

  const getAvailableActions = () => {
    if (!onMoreActions || !item.status) return [];
    return getItemListQuickActions(item, userRole, hideMissingAction).map((a) => ({
      ...a,
      icon: quickActionIcon(a.action),
    }));
  };
  const getStatusColor = (status?: string) => {
    if (!status) return 'text-on-surface-variant';
    
    switch (status.toLowerCase()) {
      case 'available':
        return 'text-success';
      case 'in transit':
        return 'text-primary';
      case 'draft':
        return 'text-on-surface-variant';
      case 'storage':
        return 'text-warning';
      case 'sold':
      case 'returned':
        return 'text-tertiary';
      case 'missing':
      case 'broken':
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
      orderStatus,
      isAdmin = false,
      thriftedPartnerItemCard = false
    } = orderDetailsConfig || {};

    // Derive item display status from order status and item state
    const getItemDisplayStatus = () => {
      if (thriftedPartnerItemCard) {
        const normalized = item.status?.toLowerCase().replace(/-/g, ' ').trim() || '';
        if (normalized === 'in transit') {
          return { text: 'In Transit', color: 'text-primary' };
        }
        return { text: 'Draft', color: 'text-on-surface-variant' };
      }

      // If order status is provided, use it to determine item status
      // For partner portal: approval, pending, and ready-for-packaging orders show "Draft" for all items
      // In transit orders show "In Transit" for all items
      if (orderStatus) {
        switch (orderStatus) {
          case 'approval':
          case 'pending':
          case 'draft':
          case 'registered': // "ready for packaging"
            // All items in approval, pending, and ready-for-packaging orders show "Draft"
            return { text: 'Draft', color: 'text-on-surface-variant' };
          case 'in-transit':
            // All items in in-transit orders show "In Transit"
            return { text: 'In Transit', color: 'text-primary' };
          case 'delivered':
            return { text: 'Delivered', color: 'text-tertiary' };
          case 'in-review':
            return { text: 'In Review', color: 'text-warning' };
          default:
            // For other order statuses, check item errors first
            if (item.status === 'error' || (errorMessages && errorMessages.length > 0)) {
              return { text: 'Error', color: 'text-error' };
            }
            // Fallback: show "Ready" if retailer ID exists, otherwise use order status or "Pending"
            return item.retailerItemId
              ? { text: 'Ready', color: 'text-success' }
              : { text: orderStatus ? (orderStatus.charAt(0).toUpperCase() + orderStatus.slice(1)) : 'Pending', color: 'text-on-surface-variant' };
        }
      }
      
      // If no order status, check item errors
      if (item.status === 'error' || (errorMessages && errorMessages.length > 0)) {
        return { text: 'Error', color: 'text-error' };
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

  const handlePrimaryAction = onClick || onEdit;

  return (
      <div className="w-full bg-surface-container hover:bg-surface-container-high border border-outline-variant rounded-lg transition-colors">
        {/* M3 Three-line List Item - Mobile Layout */}
        <button 
          className="w-full flex items-center gap-4 p-4 text-left lg:hidden"
        onClick={() => handlePrimaryAction?.(item)}
        aria-label="View item details"
        >
          {/* Status Indicator */}

          
          {/* Thumbnail */}
          <div
            role={onThumbnailClick ? 'button' : undefined}
            tabIndex={onThumbnailClick ? 0 : undefined}
            className={`relative flex-shrink-0 w-14 h-14 bg-surface-container rounded-xl overflow-hidden ${
              onThumbnailClick ? 'cursor-pointer' : 'cursor-default'
            }`}
            onClick={(e) => {
              if (!onThumbnailClick) return;
              e.preventDefault();
              e.stopPropagation();
              onThumbnailClick(item);
            }}
            onKeyDown={(e) => {
              if (!onThumbnailClick) return;
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                onThumbnailClick(item);
              }
            }}
            aria-label={onThumbnailClick ? 'Add image' : 'Item image'}
          >
            <ImageWithFallback 
              src={thumbnailSrc}
              alt={item.title || item.brand}
              className="w-full h-full object-cover"
              fallback={renderThumbnailFallback('card')}
            />
            {onThumbnailClick && (
              <div className="absolute bottom-0 right-0 p-0.5">
                <div className="h-6 w-6 rounded-full bg-black/35 flex items-center justify-center">
                  <span className="text-white text-lg leading-none select-none">+</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Line 1: Date • Status */}
            <div className="flex items-center gap-1 mb-0.5 min-w-0 flex-wrap">
              <div className="label-small text-on-surface whitespace-nowrap flex-shrink-0">
                {item.date || '—'}
              </div>
              <div className="w-1 h-1 rounded-full bg-outline-variant flex-shrink-0"></div>
              <div className={`label-small whitespace-nowrap truncate flex-shrink-0 ${displayStatus.color}`}>
                {displayStatus.text}
              </div>
              {item.isExpired && (
                <span className="label-small text-warning whitespace-nowrap flex-shrink-0">
                  Expired flag
                </span>
              )}
              {item.isArchived && (
                <span className="label-small text-on-surface-variant whitespace-nowrap flex-shrink-0">
                  Archived
                </span>
              )}
            </div>
            
            {/* Line 2: Brand */}
            <div className="title-small text-on-surface mb-0.5 truncate">
              {item.brand}
            </div>
            
            {/* Line 3: Category • Subcategory • Size • Color */}
            <div className="body-small text-on-surface mb-0.5 truncate">
              {[
                showCategory ? item.category : undefined,
                showSubcategory ? item.subcategory : undefined,
                showSize ? item.size : undefined,
                showColor ? item.color : undefined
              ].filter(Boolean).join(' • ')}
            </div>
            
            {/* Line 4: Partner ID and Retailer ID (two columns) */}
            {(showPartnerId || showRetailerId) && (
              <div className="label-small text-on-surface opacity-90 mb-0.5">
                <div className="line-clamp-2">
                  {showPartnerId && item.partnerItemId && (
                    <>
                      {partnerLabel}: {item.partnerItemId}
                      {showRetailerId && item.retailerItemId && <br />}
                    </>
                  )}
                  {showRetailerId && item.retailerItemId && (
                    <>
                      {retailerLabel}: <span className={item.retailerItemId ? 'text-success' : ''}>{item.retailerItemId}</span>
                    </>
                  )}
                  {!item.partnerItemId && !item.retailerItemId && '—'}
                </div>
              </div>
            )}

            {/* Price Info - Only show purchase price and margin (admin only) */}
            {((isAdmin && showPurchasePrice) || (isAdmin && showMargin)) && (
              <div className="mt-2 pt-2 border-t border-outline-variant">
                <div className="flex flex-wrap gap-4">
                  {isAdmin && showPurchasePrice && item.purchasePrice !== undefined && (
                    <div className="label-small">
                      <span className="text-on-surface-variant/70">Purchase:</span>
                      <span className="text-on-surface ml-1">
                        {formatPrice(item.purchasePrice)}
                      </span>
                    </div>
                  )}
                  {isAdmin && showMargin && derivedMargin !== undefined && (
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
            {/* Sales Price - Always show in trailing elements */}
            {showPrice && (
              <div className="text-right">
                <div className="title-small text-on-surface whitespace-nowrap">
                  {formatPrice(item.price)}
                </div>
              </div>
            )}
          </div>
        </button>

        {/* Tablet landscape & desktop: Table Row Layout (card with image used below lg) */}
        <div className="hidden lg:flex items-center gap-4 px-4 py-3 hover:bg-surface-container-high transition-colors">

          
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
            <div className="min-w-0 text-right">
              <p className="title-small text-on-surface whitespace-nowrap">${item.price.toFixed(2)}</p>
              <p className="body-small text-on-surface-variant">Price</p>
            </div>
            <div className="min-w-0">
              {item.retailerItemId ? (
                <div>
                  <p className="title-small text-on-surface break-words">{item.retailerItemId}</p>
                  <p className={`body-small ${getStatusColor(item.status)} whitespace-nowrap`}>{item.status || 'Assigned'}</p>
                </div>
              ) : (
                <div>
                  <p className="title-small text-on-surface-variant">Not assigned</p>
                  <p className={`body-small ${getStatusColor(item.status)} whitespace-nowrap`}>{item.status || 'Retailer ID'}</p>
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
  const handlePrimaryAction = onClick || onEdit;
  const availableActions = getAvailableActions();
  
  return (
    <div className="w-full bg-surface-container hover:bg-surface-container-high border-b border-outline-variant last:border-b-0 transition-colors">
      {/* M3 List Item - Based on Figma Design */}
      <div className="flex items-center px-1 py-3 gap-3">
        
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
        <div className={`flex-shrink-0 w-12 h-[68px] bg-[rgba(0,0,0,0.08)] rounded flex items-center justify-center overflow-hidden ${!showSelection ? 'ml-3' : ''}`}>
          <ImageWithFallback 
            src={thumbnailSrc}
            alt={item.title || item.brand}
            className="w-full h-full object-cover"
            fallback={renderThumbnailFallback('list')}
          />
        </div>
        
        {/* Main Content */}
        <button 
          className="flex-1 min-w-0 text-left cursor-pointer hover:opacity-80 transition-opacity pl-3 pr-2 overflow-hidden"
          onClick={() => handlePrimaryAction?.(item)}
        >
          {/* Line 1: Date • Status */}
          <div className="flex items-center gap-1 mb-0.5 min-w-0">
            <div className="label-small text-on-surface whitespace-nowrap flex-shrink-0">
              {item.date || '2022-06-09'}
            </div>
            <div className="w-1 h-1 rounded-full bg-outline-variant flex-shrink-0"></div>
            <div className={`label-small whitespace-nowrap ${getStatusColor(item.status)}`}>
              {item.status || 'Pending'}
            </div>
          </div>
          
          {/* Line 2: Brand */}
          <div className="title-small text-on-surface mb-0.5 truncate">
            {item.brand}
          </div>
          
          {/* Line 3: Category • Size • Color */}
          <div className="body-small text-on-surface mb-0.5 truncate">
            {item.category}
            {item.size ? ` • ${item.size}` : ''}
            {item.color ? ` • ${item.color}` : ''}
          </div>
          
          {/* Line 4: ID and Delivery */}
          <div className="label-small text-on-surface opacity-90 mb-0.5">
            <div className="line-clamp-2 break-words">
              {showBothIds && item.retailerItemId && item.partnerItemId ? (
                <>
                  Item ID: {item.retailerItemId}
                  <br />
                  External ID: {item.partnerItemId}
                </>
              ) : showExternalIdOnly ? (
                <>External ID: {item.partnerItemId || '—'}</>
              ) : (
                <>
                  ID: {item.retailerItemId || item.itemId || item.partnerItemId || '684756'}
                  {item.deliveryId && (
                    <>
                      <br />
                      Delivery: {item.deliveryId}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
          
          {/* Line 4.5: Box Label */}
          {item.boxLabel && (
            <div className="label-small text-on-surface-variant mb-0.5 truncate">
              Box label: {item.boxLabel}
            </div>
          )}
          
          {/* Line 5: Seller */}
          {!hideSellerName && (
            <div className="body-small text-on-surface truncate">
              {item.sellerName || 'Sellpy'}
            </div>
          )}
          {item.status?.toLowerCase() === 'rejected' && item.rejectReason && (
            <div className="label-small text-error truncate mt-1">
              Reason: {item.rejectReason}
            </div>
          )}
        </button>
        
        {/* Trailing Elements */}
        <div className="flex-shrink-0 flex items-center gap-0 h-full ml-auto">
          {/* Price and Days */}
          <div className={`flex flex-col items-end justify-end h-full px-0 text-right min-w-[80px] ${!(showActions && onMoreActions && availableActions.length > 0) ? 'pr-12' : ''}`}>
            <div className="title-small text-on-surface whitespace-nowrap">
              €{item.price.toFixed(2)}
            </div>
            {item.isExpired ? (
              // For expired items, show days in store
              daysInStore !== null && (
                <div className="label-small text-on-surface whitespace-nowrap">
                  {daysInStore} {daysInStore === 1 ? 'day' : 'days'} in store
                </div>
              )
            ) : (
              // For non-expired items, show days remaining if available
              item.daysRemaining !== undefined && (
                <div className="label-small text-on-surface whitespace-nowrap">
                  {item.daysRemaining} {item.daysRemaining === 1 ? 'day' : 'days'}
                </div>
              )
            )}
            {daysExpired !== null && (
              <div className="label-small text-warning whitespace-nowrap flex items-center gap-1 mt-0.5">
                <Flag className="w-3 h-3" />
                {daysExpired} {daysExpired === 1 ? 'day' : 'days'} Expired
              </div>
            )}
          </div>
          
          {/* More Actions */}
          {showActions && onMoreActions && availableActions.length > 0 && (
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
                  {availableActions.map((actionItem) => (
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