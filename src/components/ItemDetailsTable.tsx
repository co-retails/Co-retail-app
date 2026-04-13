import {
  useState,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useCallback,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ItemCard, BaseItem } from './ItemCard';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { useOverlayPortalContainer } from './ui/overlay-portal-context';
import { AlertCircleIcon, Package, Trash2Icon, Check, ChevronDown } from 'lucide-react';
import ItemDetailsDialog, { ItemDetails, StatusHistoryEntry } from './ItemDetailsDialog';
import { OrderItem } from './OrderCreationScreen';
import { getPriceOptionsForCurrency } from '../data/partnerPricing';
import {
  THRIFTED_VALID_VALUES,
  filterBrandsByQuery,
  getThriftedImportOutcome,
  sortOptionsAlpha,
} from '../utils/spreadsheetUtils';

/**
 * Desktop table: control always uses the full column when valid (hint track is 0px).
 * When invalid, a fixed hint column opens — no flex-1/basis swap, so width stays predictable.
 */
function DesktopEditFieldWithHint({
  errorMessage,
  children,
}: {
  errorMessage?: string | null | undefined;
  children: ReactNode;
}) {
  const hasHint = Boolean(errorMessage && String(errorMessage).trim());
  return (
    <div
      className="grid w-full min-w-0 items-center"
      style={{
        gridTemplateColumns: hasHint ? 'minmax(0, 1fr) 1.125rem' : 'minmax(0, 1fr) 0px',
        columnGap: hasHint ? '0.5rem' : 0,
      }}
    >
      <div className="min-w-0 w-full max-w-full [&_button]:w-full [&_input]:w-full [&_[data-slot=select-trigger]]:w-full">
        {children}
      </div>
      <div className="flex min-h-9 shrink-0 items-center justify-center self-center">
        {hasHint ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  className="inline-flex shrink-0 cursor-default text-error"
                  tabIndex={0}
                  role="img"
                  aria-label={errorMessage ?? 'Validation error'}
                >
                  <AlertCircleIcon className="h-4 w-4" aria-hidden />
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[18rem] bg-error-container text-on-error-container">
                <p className="body-small">{errorMessage}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : null}
      </div>
    </div>
  );
}

/** Prefer desktop `<tr>` so we do not scroll to a hidden mobile card wrapper (same id, earlier in DOM). */
function findElementByItemRowId(itemId: string): Element | null {
  if (typeof document === 'undefined') return null;
  const trNodes = document.querySelectorAll('tr[data-item-row-id]');
  for (let i = 0; i < trNodes.length; i++) {
    if (trNodes[i].getAttribute('data-item-row-id') === itemId) {
      const row = trNodes[i];
      if (row instanceof HTMLElement) {
        const rects = row.getClientRects();
        if (rects.length > 0 && rects[0].height > 0) return row;
      }
    }
  }
  const nodes = document.querySelectorAll('[data-item-row-id]');
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].getAttribute('data-item-row-id') === itemId) {
      const el = nodes[i];
      if (el instanceof HTMLElement) {
        const { display } = window.getComputedStyle(el);
        if (display !== 'none') return el;
      }
    }
  }
  return null;
}

function scrollItemRowIntoView(el: Element) {
  if (!(el instanceof HTMLElement)) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
  requestAnimationFrame(() => {
    let parent: HTMLElement | null = el.parentElement;
    while (parent && parent !== document.body) {
      const style = window.getComputedStyle(parent);
      const oy = style.overflowY;
      const scrollableY =
        (oy === 'auto' || oy === 'scroll' || oy === 'overlay') &&
        parent.scrollHeight > parent.clientHeight + 2;
      if (scrollableY) {
        const er = el.getBoundingClientRect();
        const pr = parent.getBoundingClientRect();
        const pad = 180;
        if (er.bottom > pr.bottom - pad) {
          parent.scrollTop += er.bottom - pr.bottom + pad;
        } else if (er.top < pr.top + pad) {
          parent.scrollTop -= pr.top + pad - er.top;
        }
        break;
      }
      parent = parent.parentElement;
    }
  });
}

export interface ItemDetailsTableItem extends OrderItem {
  id: string;
  status?: 'pending' | 'scanned' | 'error' | 'draft' | 'in-transit';
  purchasePrice?: number;
  imageUrl?: string;
  errors?: string[];
  fieldErrors?: Record<string, string>; // Field-specific error messages
  date?: string; // Date for display in item cards
  sku?: string; // SKU/partner item ID
  statusHistory?: StatusHistoryEntry[];
}

interface ItemDetailsTableProps {
  items: ItemDetailsTableItem[];
  showRetailerId?: boolean;
  showPrice?: boolean;
  showPurchasePrice?: boolean;
  showMargin?: boolean; // Show margin % per item row
  showStatus?: boolean;
  isEditable?: boolean;
  onUpdateItem?: (itemId: string, field: keyof ItemDetailsTableItem, value: any) => void;
  onDeleteItem?: (itemId: string) => void;
  subcategoryOptions?: string[]; // Custom subcategory options (e.g., for conditions)
  subcategoryLabel?: string; // Custom label for subcategory column
  brandAsInput?: boolean; // Use text input instead of dropdown for brand
  categoryOptions?: string[]; // Custom category options
  hideCategoryForThrifted?: boolean; // Hide category column for Thrifted orders (category is auto-mapped from subcategory)
  subcategoriesByCategory?: Record<string, string[]>; // Map of category to subcategories for cascading dropdown
  partnerId?: string; // Partner ID for price lookup
  countryName?: string; // Country name for currency lookup
  currency?: string; // Currency code (if known, otherwise derived from country)
  orderStatus?: string; // Order status to pass to item cards for status display
  isAdmin?: boolean; // Whether user is admin (for purchase price and margin visibility)
  /** Thrifted-style items: no "error" row state; show Draft; use Thrifted price ladder fallback */
  thriftedPartnerTable?: boolean;
  /** Brand names for autocomplete (e.g. catalog + existing order brands) */
  brandAutocompleteOptions?: string[];
  /** After add-row on mobile: open item details for this id (consumed via callback) */
  requestOpenMobileItemId?: string | null;
  onRequestOpenMobileItemIdConsumed?: () => void;
  /** After add-row on desktop: scroll this item row into view */
  requestScrollToItemId?: string | null;
  onRequestScrollToItemIdConsumed?: () => void;
}

function BrandAutocompleteInput({
  value,
  onChange,
  suggestions,
  className,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  suggestions: string[];
  className?: string;
  placeholder?: string;
}) {
  const overlayContainer = useOverlayPortalContainer();
  const anchorRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [menuRect, setMenuRect] = useState<{ top: number; left: number; width: number } | null>(null);
  const filtered = useMemo(
    () => filterBrandsByQuery(suggestions, value, 40),
    [value, suggestions]
  );
  const showPanel = open && (filtered.length > 0 || value.trim().length > 0);

  const updateMenuRect = useCallback(() => {
    const el = anchorRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const maxW = Math.max(120, window.innerWidth - r.left - 16);
    setMenuRect({
      top: r.bottom + 4,
      left: r.left,
      width: Math.min(r.width, maxW),
    });
  }, []);

  useLayoutEffect(() => {
    if (!showPanel) {
      setMenuRect(null);
      return;
    }
    updateMenuRect();
    const onReposition = () => updateMenuRect();
    window.addEventListener('scroll', onReposition, true);
    window.addEventListener('resize', onReposition);
    return () => {
      window.removeEventListener('scroll', onReposition, true);
      window.removeEventListener('resize', onReposition);
    };
  }, [showPanel, updateMenuRect, filtered.length, value]);

  const list =
    showPanel && menuRect ? (
      <ul
        className="fixed z-[10100] max-h-52 overflow-y-auto rounded-md border border-outline-variant bg-surface-container py-1 shadow-lg"
        style={{ top: menuRect.top, left: menuRect.left, width: menuRect.width }}
        role="listbox"
      >
        {filtered.length === 0 ? (
          <li className="px-3 py-2 body-small text-on-surface-variant">No matching brands</li>
        ) : (
          filtered.map((name) => (
            <li key={name}>
              <button
                type="button"
                className="w-full px-3 py-2 text-left body-medium hover:bg-surface-container-high min-h-[40px]"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(name);
                  setOpen(false);
                }}
              >
                {name}
              </button>
            </li>
          ))
        )}
      </ul>
    ) : null;

  return (
    <div ref={anchorRef} className="relative w-full min-w-0">
      <Input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 280)}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
      />
      {typeof document !== 'undefined' && list
        ? createPortal(list, overlayContainer ?? document.body)
        : null}
    </div>
  );
}

/** Desktop table-fixed: full cell width; same border box in error vs valid (no ring/layout shift) */
const DESKTOP_SELECT_TRIGGER =
  'box-border min-w-0 w-full max-w-full overflow-hidden [&_[data-slot=select-value]]:min-w-0 [&_[data-slot=select-value]]:flex-1 [&_[data-slot=select-value]]:overflow-hidden [&_[data-slot=select-value]]:truncate [&_[data-slot=select-value]]:text-left';

/** Desktop table-fixed: match select border box */
const DESKTOP_TABLE_INPUT = 'box-border min-w-0 w-full';

// Dropdown options for editable attributes
const BRAND_OPTIONS = ['WEEKDAY', 'COS', 'Monki', 'H&M', '& Other Stories', 'Arket'];
const CATEGORY_OPTIONS = ['Clothing', 'Shoes', 'Accessories', 'Bags'];
const SUBCATEGORY_OPTIONS = ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Sneakers', 'Boots', 'Sandals', 'Bags', 'Scarves', 'Jewelry'];
const COLOR_OPTIONS = ['Black', 'White', 'Blue', 'Red', 'Gray', 'Green', 'Navy', 'Beige', 'Brown', 'Pink', 'Yellow', 'Purple'];
const SIZE_OPTIONS = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '34', '36', '37', '38', '39', '40', '41', '42', '43', '44'];

export function ItemDetailsTable({
  items,
  showRetailerId = true,
  showPrice = false,
  showPurchasePrice = false,
  showMargin = false,
  showStatus = false,
  isEditable = false,
  onUpdateItem,
  onDeleteItem,
  subcategoryOptions = SUBCATEGORY_OPTIONS,
  subcategoryLabel = 'Subcategory',
  brandAsInput = false,
  categoryOptions = CATEGORY_OPTIONS,
  hideCategoryForThrifted = false,
  subcategoriesByCategory,
  partnerId,
  countryName,
  currency,
  orderStatus,
  isAdmin = false,
  thriftedPartnerTable = false,
  brandAutocompleteOptions = [],
  requestOpenMobileItemId,
  onRequestOpenMobileItemIdConsumed,
  requestScrollToItemId,
  onRequestScrollToItemIdConsumed,
}: ItemDetailsTableProps) {
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const onOpenConsumedRef = useRef(onRequestOpenMobileItemIdConsumed);
  onOpenConsumedRef.current = onRequestOpenMobileItemIdConsumed;
  const onScrollConsumedRef = useRef(onRequestScrollToItemIdConsumed);
  onScrollConsumedRef.current = onRequestScrollToItemIdConsumed;

  const [mobileDetailsItem, setMobileDetailsItem] = useState<ItemDetailsTableItem | null>(null);
  const [openBrandPopovers, setOpenBrandPopovers] = useState<Record<string, boolean>>({});
  const detailFieldMap: Partial<Record<keyof ItemDetails, keyof ItemDetailsTableItem>> = {
    brand: 'brand',
    category: 'category',
    subcategory: 'subcategory',
    size: 'size',
    color: 'color',
    price: 'price',
    status: 'status',
    itemId: 'retailerItemId'
  };

  const mapToItemDetails = (item: ItemDetailsTableItem): ItemDetails => ({
    id: item.id,
    itemId: (thriftedPartnerTable
      ? item.retailerItemId || ''
      : (item.retailerItemId || item.itemId || item.partnerItemId || '')) as string,
    externalId: thriftedPartnerTable
      ? (item.sku || item.partnerItemId || '').trim() || undefined
      : undefined,
    title: (item.partnerItemId || item.itemId || item.brand || 'Item') as string,
    brand: item.brand || '',
    category: item.category || '',
    subcategory: item.subcategory,
    size: item.size,
    color: item.color,
    price: item.price || 0,
    status:
      thriftedPartnerTable
        ? item.status === 'in-transit'
          ? 'In transit'
          : 'Draft'
        : item.status || 'Pending',
    date: (item.date || new Date().toISOString().split('T')[0]) as string,
    deliveryId: (item as any).deliveryId,
    thumbnail: item.imageUrl
  });

  const handleMobileDetailsSave = (itemId: string, updates: Partial<ItemDetails>) => {
    if (!mobileDetailsItem) return;
    const updatedItem = { ...mobileDetailsItem };

    if (updates.externalId !== undefined && thriftedPartnerTable) {
      const ext = updates.externalId == null ? '' : String(updates.externalId);
      updatedItem.sku = ext;
      updatedItem.partnerItemId = ext;
      // OrderShipmentDetailsScreen syncs sku when partnerItemId updates
      onUpdateItem?.(itemId, 'partnerItemId', ext);
    }

    (Object.entries(updates) as [keyof ItemDetails, ItemDetails[keyof ItemDetails]][]).forEach(([key, value]) => {
      if (key === 'externalId') return;
      const mappedField = detailFieldMap[key];
      if (!mappedField || value === undefined) return;
      (updatedItem as any)[mappedField] = value;
      onUpdateItem?.(itemId, mappedField, value);
    });

    setMobileDetailsItem(updatedItem);
  };

  // Do not replace mobileDetailsItem on every `items` reference change — that can reset in-dialog drafts on mobile.
  // Close if the row disappears (e.g. filter).
  useEffect(() => {
    if (!mobileDetailsItem) return;
    const stillThere = items.some((i) => i.id === mobileDetailsItem.id);
    if (!stillThere) setMobileDetailsItem(null);
  }, [items, mobileDetailsItem?.id]);

  const partnerMobileActions = useMemo(() => {
    if (!thriftedPartnerTable || !mobileDetailsItem) return undefined;
    const idx = items.findIndex((i) => i.id === mobileDetailsItem.id);
    return {
      hasNext: idx >= 0 && idx < items.length - 1,
      onDone: () => setMobileDetailsItem(null),
      onNext: () => {
        setMobileDetailsItem((prev) => {
          if (!prev) return prev;
          const j = items.findIndex((i) => i.id === prev.id);
          if (j < 0 || j >= items.length - 1) return prev;
          return items[j + 1];
        });
      },
    };
  }, [thriftedPartnerTable, mobileDetailsItem, items]);

  useLayoutEffect(() => {
    if (!requestOpenMobileItemId) return;
    let cancelled = false;
    const id = requestOpenMobileItemId;
    let attempts = 0;
    const maxAttempts = 48;
    const tryOpen = () => {
      if (cancelled) return;
      const found = itemsRef.current.find((i) => i.id === id);
      if (found) {
        setMobileDetailsItem(found);
        onOpenConsumedRef.current?.();
        return;
      }
      attempts += 1;
      if (attempts < maxAttempts) {
        requestAnimationFrame(tryOpen);
      } else {
        onOpenConsumedRef.current?.();
      }
    };
    requestAnimationFrame(() => requestAnimationFrame(tryOpen));
    return () => {
      cancelled = true;
    };
  }, [requestOpenMobileItemId]);

  useLayoutEffect(() => {
    if (!requestScrollToItemId) return;
    let cancelled = false;
    const id = requestScrollToItemId;
    let attempts = 0;
    const maxAttempts = 48;
    const tryScroll = () => {
      if (cancelled) return;
      const el = findElementByItemRowId(id);
      if (el) {
        scrollItemRowIntoView(el);
        onScrollConsumedRef.current?.();
        return;
      }
      attempts += 1;
      if (attempts < maxAttempts) {
        requestAnimationFrame(tryScroll);
      } else {
        onScrollConsumedRef.current?.();
      }
    };
    requestAnimationFrame(() => requestAnimationFrame(tryScroll));
    return () => {
      cancelled = true;
    };
  }, [requestScrollToItemId]);

  // Get price options based on partner, brand, and currency
  const firstItemBrand = items[0]?.brand;
  const priceOptions = useMemo(() => {
    let opts =
      partnerId && currency
        ? getPriceOptionsForCurrency(partnerId, firstItemBrand, currency)
        : [];
    if (
      opts.length === 0 &&
      thriftedPartnerTable &&
      (currency === 'SEK' || !currency)
    ) {
      opts = [...THRIFTED_VALID_VALUES.prices];
    }
    return opts;
  }, [partnerId, currency, firstItemBrand, thriftedPartnerTable]);

  const mergedBrandSuggestions = useMemo(() => {
    const set = new Set<string>();
    brandAutocompleteOptions.forEach((b) => {
      if (b?.trim()) set.add(b.trim());
    });
    items.forEach((it) => {
      if (it.brand?.trim()) set.add(it.brand.trim());
    });
    if (thriftedPartnerTable) {
      BRAND_OPTIONS.forEach((b) => set.add(b));
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [brandAutocompleteOptions, items, thriftedPartnerTable]);

  /** Explicit column widths for table-fixed (same every row; avoids max-w-0 td hacks). */
  const desktopColWidths = useMemo(() => {
    const cols: { key: string; width: string }[] = [{ key: 'img', width: '4.5rem' }];
    if (showRetailerId) cols.push({ key: 'retailer', width: '9rem' });
    cols.push({ key: 'ext', width: '8.5rem' }, { key: 'brand', width: '10rem' });
    if (!hideCategoryForThrifted) cols.push({ key: 'cat', width: '7.5rem' });
    cols.push(
      { key: 'sub', width: '11rem' },
      { key: 'size', width: '5.5rem' },
      { key: 'color', width: '6.5rem' },
    );
    if (showPurchasePrice) cols.push({ key: 'purchase', width: '6.5rem' });
    if (showPrice) cols.push({ key: 'price', width: '7.5rem' });
    if (showMargin) cols.push({ key: 'margin', width: '4.5rem' });
    if (showStatus) cols.push({ key: 'status', width: '5.5rem' });
    if (isEditable && onDeleteItem) cols.push({ key: 'actions', width: '3.25rem' });
    return cols;
  }, [
    showRetailerId,
    hideCategoryForThrifted,
    showPurchasePrice,
    showPrice,
    showMargin,
    showStatus,
    isEditable,
    onDeleteItem,
  ]);

  const sortedCategoryOptions = useMemo(
    () => sortOptionsAlpha(categoryOptions),
    [categoryOptions]
  );
  const sortedSubcategoryOptions = useMemo(
    () => sortOptionsAlpha(subcategoryOptions),
    [subcategoryOptions]
  );
  const sortedColorOptions = useMemo(
    () =>
      sortOptionsAlpha(
        thriftedPartnerTable ? THRIFTED_VALID_VALUES.colors : COLOR_OPTIONS
      ),
    [thriftedPartnerTable]
  );
  
  const displayCurrency = currency || 'SEK'; // Default to SEK if not provided
  return (
    <>
      {/* Mobile & tablet only - Cards. Desktop (lg+) must show the table below, not cards. */}
      <div className="lg:hidden space-y-2" data-tablet-mobile-only>
        {items.map((item) => {
          const hasError = !thriftedPartnerTable && item.status === 'error';
          const errorFields = Object.entries(item.fieldErrors || {});
          const thriftedIncomplete =
            thriftedPartnerTable && errorFields.length > 0;
          const baseItem: BaseItem = {
            id: item.id,
            brand: item.brand || '—',
            category: item.category || '',
            subcategory: item.subcategory || '',
            size: item.size,
            color: item.color,
            price: item.price || 0,
            purchasePrice: item.purchasePrice,
            partnerItemId: item.partnerItemId || item.sku || item.itemId,
            retailerItemId: item.retailerItemId,
            thumbnail: item.imageUrl,
            status:
              thriftedPartnerTable
                ? item.status === 'in-transit'
                  ? 'In transit'
                  : 'Draft'
                : item.status,
            date: item.date || new Date().toISOString().split('T')[0], // Add date for display
            errors:
              hasError || thriftedIncomplete
                ? errorFields.map(([field, message]) => `${field}: ${message}`)
                : undefined,
            currency: displayCurrency
          };

          const marginValue = showMargin && item.price && item.purchasePrice
            ? ((item.price - item.purchasePrice) / item.price) * 100
            : undefined;

          return (
            <div key={item.id} data-item-row-id={item.id}>
            <ItemCard
              item={baseItem}
              variant="order-details"
              onClick={() => setMobileDetailsItem(item)}
              showActions={false}
              showSelection={false}
              orderDetailsConfig={{
                partnerLabel: 'External ID',
                retailerLabel: 'Item ID*',
                showPartnerId: true,
                showRetailerId: showRetailerId,
                showCategory: !hideCategoryForThrifted,
                showSubcategory: true,
                showSize: true,
                showColor: true,
                showPrice,
                showPurchasePrice: isAdmin && showPurchasePrice,
                showMargin: isAdmin && showMargin,
                currency: displayCurrency,
                marginValue,
                orderStatus,
                isAdmin,
                thriftedPartnerItemCard: thriftedPartnerTable,
                extraFields: showStatus ? [{
                  label: 'Status',
                  value: thriftedPartnerTable
                    ? item.status === 'in-transit'
                      ? 'In transit'
                      : 'Draft'
                    : item.status
                }] : undefined,
                errorMessages:
                  hasError || thriftedIncomplete
                    ? errorFields.map(([field, message]) => `${field}: ${message}`)
                    : undefined
              }}
            />
            </div>
          );
        })}
      </div>

      {/* Desktop: colgroup locks widths for every row; spacer below sits in page scroll (not inside overflow-x). */}
      <div className="hidden lg:block w-full" data-desktop-table>
        <div className="overflow-x-auto rounded-lg border border-outline-variant bg-surface">
          <table className="w-full min-w-[1180px] table-fixed border-collapse">
            <colgroup>
              {desktopColWidths.map((c) => (
                <col key={c.key} style={{ width: c.width }} />
              ))}
            </colgroup>
            <thead className="bg-surface-container">
              <tr className="border-b border-outline-variant">
                <th className="px-3 py-3 text-left">
                  <span className="label-medium text-on-surface">Image</span>
                </th>
                {showRetailerId && (
                  <th className="px-3 py-3 text-left">
                    <span className="label-medium text-on-surface">Item ID*</span>
                  </th>
                )}
                <th className="px-3 py-3 text-left">
                  <span className="label-medium text-on-surface">External ID</span>
                </th>
                <th className="px-3 py-3 text-left">
                  <span className="label-medium text-on-surface">Item brand</span>
                </th>
                {!hideCategoryForThrifted && (
                  <th className="px-3 py-3 text-left">
                    <span className="label-medium text-on-surface">Category</span>
                  </th>
                )}
                <th className="px-3 py-3 text-left">
                  <span className="label-medium text-on-surface">{subcategoryLabel}</span>
                </th>
                <th className="px-3 py-3 text-left">
                  <span className="label-medium text-on-surface">Size</span>
                </th>
                <th className="px-3 py-3 text-left">
                  <span className="label-medium text-on-surface">Color</span>
                </th>
                {showPurchasePrice && (
                  <th className="px-3 py-3 text-right">
                    <span className="label-medium text-on-surface">Purchase Price</span>
                  </th>
                )}
                {showPrice && (
                  <th className="px-3 py-3 text-right">
                    <span className="label-medium text-on-surface">Price ({displayCurrency})*</span>
                  </th>
                )}
                {showMargin && (
                  <th className="px-3 py-3 text-right">
                    <span className="label-medium text-on-surface">Margin %</span>
                  </th>
                )}
                {showStatus && (
                  <th className="px-3 py-3 text-center">
                    <span className="label-medium text-on-surface">Status</span>
                  </th>
                )}
                {isEditable && onDeleteItem && (
                  <th className="px-3 py-3 text-right">
                    <span className="label-medium text-on-surface">Actions</span>
                  </th>
                )}
              </tr>
            </thead>
        <tbody className="bg-surface">
          {items.map((item, index) => {
            const hasError = !thriftedPartnerTable && item.status === 'error';
            const thriftedOutcome = thriftedPartnerTable
              ? getThriftedImportOutcome(item)
              : 'imported';
            const thriftedRejected = thriftedOutcome === 'rejected';
            const thriftedDuplicateOnly = thriftedOutcome === 'skipped';
            const thriftedNeedsFields =
              thriftedPartnerTable &&
              item.fieldErrors &&
              Object.keys(item.fieldErrors).length > 0;
            return (
            <tr 
              key={item.id}
              data-item-row-id={item.id}
              className={`${index !== items.length - 1 ? 'border-b border-outline-variant' : ''} ${
                hasError
                  ? 'bg-error-container/10'
                  : thriftedRejected
                    ? 'bg-error-container/10 border-l-2 border-l-error'
                    : thriftedDuplicateOnly
                      ? 'bg-warning-container/25 border-l-2 border-l-warning'
                      : thriftedNeedsFields
                        ? 'bg-surface-container/80 border-l-2 border-l-outline-variant'
                    : 'hover:bg-surface-container/50'
              } transition-colors`}
            >
              {/* Image */}
              <td className="px-3 py-3 min-w-0 align-top overflow-hidden">
                <div className="w-12 h-12 rounded overflow-hidden bg-surface-container flex items-center justify-center mx-auto">
                  <ImageWithFallback
                    src={item.imageUrl}
                    alt={`${item.brand} ${item.category}`}
                    className="w-full h-full object-cover"
                    fallback={<Package className="w-5 h-5 text-on-surface-variant/60" />}
                  />
                </div>
              </td>

              {/* Retailer ID */}
              {showRetailerId && (
                <td className="px-3 py-3 min-w-0 align-top overflow-hidden">
                  {isEditable && onUpdateItem ? (
                    <DesktopEditFieldWithHint errorMessage={item.fieldErrors?.retailerItemId}>
                      <Input
                        value={item.retailerItemId || ''}
                        onChange={(e) => onUpdateItem(item.id, 'retailerItemId', e.target.value)}
                        placeholder="Enter Item ID*"
                        className={`${DESKTOP_TABLE_INPUT} h-9 body-medium ${
                          item.fieldErrors?.retailerItemId
                            ? 'border-error focus:border-error bg-error-container/10'
                            : 'border-outline-variant focus:border-primary bg-surface-container'
                        }`}
                      />
                    </DesktopEditFieldWithHint>
                  ) : item.retailerItemId ? (
                    <span className="body-medium text-on-surface">{item.retailerItemId}</span>
                  ) : (
                    <span className="body-medium text-on-surface-variant">—</span>
                  )}
                </td>
              )}

              {/* External ID */}
              <td className="px-3 py-3 min-w-0 align-top overflow-hidden">
                {isEditable && onUpdateItem && brandAsInput ? (
                  <DesktopEditFieldWithHint
                    errorMessage={item.fieldErrors?.partnerItemId || item.fieldErrors?.sku}
                  >
                    <Input
                      value={item.partnerItemId || ''}
                      onChange={(e) => onUpdateItem(item.id, 'partnerItemId', e.target.value)}
                      placeholder="Enter SKU"
                      className={`${DESKTOP_TABLE_INPUT} h-9 body-medium ${
                        item.fieldErrors?.partnerItemId || item.fieldErrors?.sku
                          ? 'border-error focus:border-error bg-error-container/10'
                          : 'border-outline-variant focus:border-primary bg-surface-container'
                      }`}
                    />
                  </DesktopEditFieldWithHint>
                ) : (
                  <span className="body-medium text-on-surface">{item.partnerItemId || '—'}</span>
                )}
              </td>

              {/* Brand */}
              <td className="px-3 py-3 min-w-0 align-top overflow-hidden">
                {isEditable && onUpdateItem ? (
                  <DesktopEditFieldWithHint errorMessage={item.fieldErrors?.brand}>
                    {brandAsInput ? (
                      <BrandAutocompleteInput
                        value={item.brand || ''}
                        onChange={(v) => onUpdateItem(item.id, 'brand', v)}
                        suggestions={mergedBrandSuggestions}
                        placeholder="Type item brand"
                        className={`${DESKTOP_TABLE_INPUT} h-9 body-medium ${
                          item.fieldErrors?.brand
                            ? thriftedPartnerTable
                              ? 'border-warning/80 bg-surface-container focus:border-warning'
                              : 'border-error focus:border-error bg-error-container/10'
                            : 'border-outline-variant focus:border-primary bg-surface-container'
                        }`}
                      />
                    ) : (
                      <Popover
                        open={openBrandPopovers[item.id] || false}
                        onOpenChange={(open) => setOpenBrandPopovers(prev => ({ ...prev, [item.id]: open }))}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={`h-9 w-full min-w-0 justify-between body-medium ${
                              item.fieldErrors?.brand
                                ? 'border-error focus:border-error bg-error-container/10'
                                : 'border-outline-variant focus:border-primary bg-surface-container'
                            }`}
                          >
                            <span className="truncate">
                              {item.brand || 'Select item brand'}
                            </span>
                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Search brands..." />
                            <CommandList>
                              <CommandEmpty>No brand found.</CommandEmpty>
                              <CommandGroup>
                                {BRAND_OPTIONS.map((brand) => (
                                  <CommandItem
                                    key={brand}
                                    value={brand}
                                    onSelect={() => {
                                      onUpdateItem(item.id, 'brand', brand);
                                      setOpenBrandPopovers(prev => ({ ...prev, [item.id]: false }));
                                    }}
                                    className="flex min-h-[44px] cursor-pointer items-center justify-between py-3 md:min-h-0 md:py-1.5"
                                  >
                                    <span className="body-medium">{brand}</span>
                                    {item.brand === brand && (
                                      <Check className="h-4 w-4 opacity-70" />
                                    )}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    )}
                  </DesktopEditFieldWithHint>
                ) : (
                  <span className="body-medium text-on-surface">{item.brand}</span>
                )}
              </td>

              {/* Category - Show for cascading dropdown (required before subcategory) */}
              {!hideCategoryForThrifted && (
                <td className="px-3 py-3 min-w-0 align-top overflow-hidden">
                  {isEditable && onUpdateItem ? (
                    <DesktopEditFieldWithHint errorMessage={item.fieldErrors?.category}>
                      <Select
                        value={item.category || undefined}
                        onValueChange={(value) => {
                          onUpdateItem(item.id, 'category', value);
                          if (subcategoriesByCategory && item.subcategory) {
                            const validSubcategories = subcategoriesByCategory[value] || [];
                            if (!validSubcategories.includes(item.subcategory)) {
                              onUpdateItem(item.id, 'subcategory', '');
                            }
                          }
                        }}
                      >
                        <SelectTrigger
                          aria-invalid={Boolean(item.fieldErrors?.category)}
                          className={`${DESKTOP_SELECT_TRIGGER} h-9 body-medium ${
                            item.fieldErrors?.category
                              ? 'border-error focus:border-error bg-error-container/10'
                              : 'border-outline-variant focus:border-primary bg-surface-container'
                          }`}
                        >
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {sortedCategoryOptions.map((category) => (
                            <SelectItem
                              key={category}
                              value={category}
                              className="body-medium min-h-[48px] touch-manipulation py-3 md:min-h-0 md:py-1.5"
                            >
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </DesktopEditFieldWithHint>
                  ) : (
                    <span className="body-medium text-on-surface">{item.category}</span>
                  )}
                </td>
              )}

              {/* Subcategory - Cascading dropdown (requires category selection first) */}
              <td className="px-3 py-3 min-w-0 align-top overflow-hidden">
                {isEditable && onUpdateItem ? (
                  <DesktopEditFieldWithHint errorMessage={item.fieldErrors?.subcategory}>
                    <Select
                      value={item.subcategory || undefined}
                      onValueChange={(value) => onUpdateItem(item.id, 'subcategory', value)}
                      disabled={!item.category && !!subcategoriesByCategory}
                    >
                      <SelectTrigger
                        aria-invalid={Boolean(item.fieldErrors?.subcategory)}
                        className={`${DESKTOP_SELECT_TRIGGER} h-9 body-medium ${
                          item.fieldErrors?.subcategory
                            ? 'border-error focus:border-error bg-error-container/10'
                            : 'border-outline-variant focus:border-primary bg-surface-container'
                        } ${!item.category && subcategoriesByCategory ? 'opacity-50' : ''}`}
                      >
                        <SelectValue
                          placeholder={
                            !item.category && subcategoriesByCategory
                              ? `Select category first`
                              : `Select ${subcategoryLabel.toLowerCase()}`
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {(() => {
                          if (subcategoriesByCategory && item.category) {
                            const validSubcategories = sortOptionsAlpha(
                              subcategoriesByCategory[item.category] || []
                            );
                            return validSubcategories.map((subcategory) => (
                              <SelectItem
                                key={subcategory}
                                value={subcategory}
                                className="body-medium min-h-[48px] touch-manipulation py-3 md:min-h-0 md:py-1.5"
                              >
                                {subcategory}
                              </SelectItem>
                            ));
                          }
                          return sortedSubcategoryOptions.map((subcategory) => (
                            <SelectItem
                              key={subcategory}
                              value={subcategory}
                              className="body-medium min-h-[48px] touch-manipulation py-3 md:min-h-0 md:py-1.5"
                            >
                              {subcategory}
                            </SelectItem>
                          ));
                        })()}
                      </SelectContent>
                    </Select>
                  </DesktopEditFieldWithHint>
                ) : (
                  <span className="body-medium text-on-surface">{item.subcategory}</span>
                )}
              </td>

              {/* Size */}
              <td className="px-3 py-3 min-w-0 align-top overflow-hidden">
                {isEditable && onUpdateItem ? (
                  <DesktopEditFieldWithHint errorMessage={item.fieldErrors?.size}>
                    <Select
                      value={item.size || undefined}
                      onValueChange={(value) => onUpdateItem(item.id, 'size', value)}
                    >
                      <SelectTrigger
                        aria-invalid={Boolean(item.fieldErrors?.size)}
                        className={`${DESKTOP_SELECT_TRIGGER} h-9 body-medium ${
                          item.fieldErrors?.size
                            ? 'border-error focus:border-error bg-error-container/10'
                            : 'border-outline-variant focus:border-primary bg-surface-container'
                        }`}
                      >
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        {SIZE_OPTIONS.map((size) => (
                          <SelectItem
                            key={size}
                            value={size}
                            className="body-medium min-h-[48px] touch-manipulation py-3 md:min-h-0 md:py-1.5"
                          >
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </DesktopEditFieldWithHint>
                ) : (
                  <span className="body-medium text-on-surface">{item.size || '—'}</span>
                )}
              </td>

              {/* Color */}
              <td className="px-3 py-3 min-w-0 align-top overflow-hidden">
                {isEditable && onUpdateItem ? (
                  <DesktopEditFieldWithHint errorMessage={item.fieldErrors?.color}>
                    <Select
                      value={item.color || undefined}
                      onValueChange={(value) => onUpdateItem(item.id, 'color', value)}
                    >
                      <SelectTrigger
                        aria-invalid={Boolean(item.fieldErrors?.color)}
                        className={`${DESKTOP_SELECT_TRIGGER} h-9 body-medium ${
                          item.fieldErrors?.color
                            ? 'border-error focus:border-error bg-error-container/10'
                            : 'border-outline-variant focus:border-primary bg-surface-container'
                        }`}
                      >
                        <SelectValue placeholder="Select color" />
                      </SelectTrigger>
                      <SelectContent>
                        {sortedColorOptions.map((color) => (
                          <SelectItem
                            key={color}
                            value={color}
                            className="body-medium min-h-[48px] touch-manipulation py-3 md:min-h-0 md:py-1.5"
                          >
                            {color}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </DesktopEditFieldWithHint>
                ) : (
                  <span className="body-medium text-on-surface">{item.color}</span>
                )}
              </td>

              {/* Purchase Price */}
              {showPurchasePrice && (
                <td className="px-3 py-3 text-right min-w-0 align-top overflow-hidden">
                  <span className="body-medium text-on-surface truncate block">
                    {item.purchasePrice?.toFixed(2) || '0.00'} SEK
                  </span>
                </td>
              )}

              {/* Price */}
              {showPrice && (
                <td className="px-3 py-3 text-right min-w-0 align-top overflow-hidden">
                  {isEditable && onUpdateItem ? (
                    <DesktopEditFieldWithHint errorMessage={item.fieldErrors?.price}>
                      <Select
                        value={item.price > 0 ? item.price.toString() : ''}
                        onValueChange={(value) => onUpdateItem(item.id, 'price', parseFloat(value))}
                      >
                        <SelectTrigger
                          aria-invalid={Boolean(item.fieldErrors?.price)}
                          className={`${DESKTOP_SELECT_TRIGGER} h-9 body-medium [&_[data-slot=select-value]]:text-right ${
                            item.fieldErrors?.price
                              ? 'border-error focus:border-error bg-error-container/10'
                              : 'border-outline-variant focus:border-primary bg-surface-container'
                          }`}
                        >
                          <SelectValue placeholder="Select price*">
                            {item.price > 0 && (
                              <span className="block w-full truncate text-right">
                                {item.price} {displayCurrency}
                              </span>
                            )}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {priceOptions.length > 0 ? (
                            priceOptions.map((price) => (
                              <SelectItem
                                key={price}
                                value={price.toString()}
                                className="body-medium min-h-[48px] touch-manipulation py-3 md:min-h-0 md:py-1.5"
                              >
                                {price} {displayCurrency}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem
                              value="no-prices"
                              disabled
                              className="body-medium min-h-[48px] touch-manipulation py-3 md:min-h-0 md:py-1.5"
                            >
                              No prices configured
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </DesktopEditFieldWithHint>
                  ) : (
                    <span className="body-medium text-on-surface">
                      {item.price} {displayCurrency}
                    </span>
                  )}
                </td>
              )}

              {/* Margin % */}
              {showMargin && (
                <td className="px-3 py-3 text-right min-w-0 align-top overflow-hidden">
                  <span className="body-medium text-primary truncate block">
                    {item.price && item.purchasePrice && item.price > 0
                      ? `${(((item.price - item.purchasePrice) / item.price) * 100).toFixed(1)}%`
                      : '—'}
                  </span>
                </td>
              )}

              {/* Status */}
              {showStatus && (
                <td className="px-3 py-3 text-center min-w-0 align-top overflow-hidden">
                  {thriftedPartnerTable ? (
                    item.status === 'in-transit' ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-primary-container text-on-primary-container label-small">
                        In transit
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-surface-container-highest text-on-surface label-small">
                        Draft
                      </span>
                    )
                  ) : (
                    <>
                      {item.status === 'pending' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-warning-container text-on-warning-container label-small">
                          Pending
                        </span>
                      )}
                      {item.status === 'scanned' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-primary-container text-on-primary-container label-small">
                          Scanned
                        </span>
                      )}
                    </>
                  )}
                </td>
              )}

              {/* Delete button */}
              {isEditable && onDeleteItem && (
                <td className="px-3 py-3 text-right min-w-0 align-top overflow-hidden">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteItem(item.id)}
                    className="text-error hover:text-error hover:bg-error-container/10"
                  >
                    <Trash2Icon className="w-4 h-4" />
                  </Button>
                </td>
              )}
            </tr>
          );
          })}
        </tbody>
          </table>
        </div>
        {/* Outside horizontal scroll: expands vertical scroll area so last rows clear fixed footers */}
        <div
          className="pointer-events-none w-full shrink-0 select-none bg-surface"
          style={{ minHeight: 'max(65vh, 48rem)' }}
          aria-hidden={true}
        />
      </div>

      <ItemDetailsDialog
        item={mobileDetailsItem ? mapToItemDetails(mobileDetailsItem) : null}
        isOpen={!!mobileDetailsItem}
        onClose={() => setMobileDetailsItem(null)}
        onSave={handleMobileDetailsSave}
        statusHistory={mobileDetailsItem?.statusHistory}
        priceOptions={priceOptions}
        priceCurrency={displayCurrency}
        enableThriftedPartnerItemDialog={thriftedPartnerTable}
        brandAutocompleteOptions={mergedBrandSuggestions}
        partnerMobileActions={partnerMobileActions}
      />
    </>
  );
}
