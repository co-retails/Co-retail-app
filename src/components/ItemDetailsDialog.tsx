import React, { useState, useRef, useMemo, useEffect, useCallback, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  FullScreenDialog as Dialog,
  FullScreenDialogContent as DialogContent,
  FullScreenDialogDescription as DialogDescription,
  FullScreenDialogTitle as DialogTitle
} from './ui/full-screen-dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import BrandPicker from './BrandPicker';
import { VisuallyHidden } from './ui/visually-hidden';
import { ArrowLeft, Edit3, Check, X, QrCode, Package, Calendar, Tag, Euro, Clock, MapPin, History, RefreshCw, Ban, Barcode } from 'lucide-react';
import JsBarcode from 'jsbarcode';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { useMediaQuery } from './ui/use-mobile';
import svgPaths from '../imports/svg-7un8q74kd7';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Separator } from './ui/separator';
import { useOverlayPortalContainer } from './ui/overlay-portal-context';
import ActiveScanner from './ActiveScanner';
import { toast } from 'sonner@2.0.3';
import {
  THRIFTED_VALID_VALUES,
  filterBrandsByQuery,
  getAllThriftedSubcategories,
  sortOptionsAlpha,
  sortStoreItemSizes,
} from '../utils/spreadsheetUtils';
import { getStatusLabel, getStatusTextColor } from '../utils/statusColors';

export interface ItemDetails {
  id: string;
  itemId: string;
  /** Thrifted external ID (SKU); optional, shown separately from Item ID* */
  externalId?: string;
  title: string;
  brand: string;
  category: string;
  subcategory?: string;
  size?: string;
  color?: string;
  price: number;
  status: string;
  date: string;
  deliveryId?: string;
  boxLabel?: string;
  image?: string; // Full-size product image
  thumbnail?: string; // Thumbnail/fallback image
  daysRemaining?: number;
  source?: string;
  orderNumber?: string;
  lastInStoreAt?: string;
  location?: 'Warehouse' | 'In transit' | 'Store';
  rejectReason?: 'Rejected - Broken on arrival' | 'Rejected - Dirty' | 'Rejected - Not accepted brand' | 'Rejected - Not accepted material' | 'Rejected - Not in season' | 'Rejected - Wrong store';
}

export interface StatusHistoryEntry {
  status: string;
  timestamp: string;
  user?: string;
  note?: string;
}

export type RejectedReasonType = 'Rejected - Broken on arrival' | 'Rejected - Dirty' | 'Rejected - Not accepted brand' | 'Rejected - Not accepted material' | 'Rejected - Not in season' | 'Rejected - Wrong store';

interface ItemDetailsDialogProps {
  item: ItemDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (itemId: string, updates: Partial<ItemDetails>) => void;
  statusHistory?: StatusHistoryEntry[];
  priceOptions?: number[];
  priceCurrency?: string;
  expireTimeWeeks?: number; // Expire time setting for the store (in weeks)
  userRole?: 'admin' | 'store-staff' | 'store-manager' | 'partner'; // User role to determine if location can be edited
  /** Called when user changes status from Available to Rejected (within 24h). Parent should show reject reason sheet and then call onSave with reason. */
  onRequestRejectReason?: (item: ItemDetails) => void;
  /** Thrifted partner draft items: read-only Draft/In transit, Thrifted value lists, brand typeahead */
  enableThriftedPartnerItemDialog?: boolean;
  brandAutocompleteOptions?: string[];
  /** Mobile Thrifted item sheet: Done closes; Next opens the following row (parent handles state). */
  partnerMobileActions?: {
    hasNext: boolean;
    onNext: () => void;
    onDone: () => void;
  };
}

type EditField = 'itemId' | 'title' | 'brand' | 'category' | 'subcategory' | 'size' | 'color' | 'price' | 'status' | 'location' | null;

function ThriftedBrandAutocompleteEdit({
  value,
  onChange,
  onBlurCommit,
  onPickSuggestion,
  suggestions,
  className,
  minCharsForPanel = 2,
}: {
  value: string;
  onChange: (v: string) => void;
  /** Called when the field loses focus (commit to parent). */
  onBlurCommit?: () => void;
  /** Called when user picks a list item (commit immediately; avoids relying on blur). */
  onPickSuggestion?: (name: string) => void;
  suggestions: string[];
  className?: string;
  /** Avoid opening the portal on the first keystroke (iOS focus/layout issues). */
  minCharsForPanel?: number;
}) {
  const overlayContainer = useOverlayPortalContainer();
  const anchorRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [menuRect, setMenuRect] = useState<{ top: number; left: number; width: number } | null>(null);
  const filtered = useMemo(
    () => filterBrandsByQuery(suggestions, value, 40),
    [suggestions, value]
  );
  const showPanel =
    open &&
    value.trim().length >= minCharsForPanel &&
    (filtered.length > 0 || value.trim().length >= minCharsForPanel);

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
    window.addEventListener('resize', onReposition);
    return () => {
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
                className="w-full px-3 py-2.5 text-left body-medium hover:bg-surface-container-high min-h-[44px] touch-manipulation"
                onMouseDown={(e) => e.preventDefault()}
                onPointerDown={(e) => e.preventDefault()}
                onClick={() => {
                  clearBlurCommitTimer();
                  onChange(name);
                  onPickSuggestion?.(name);
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

  const portalTarget = overlayContainer ?? (typeof document !== 'undefined' ? document.body : null);
  const blurCommitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearBlurCommitTimer = useCallback(() => {
    if (blurCommitTimerRef.current) {
      clearTimeout(blurCommitTimerRef.current);
      blurCommitTimerRef.current = null;
    }
  }, []);

  useEffect(() => () => clearBlurCommitTimer(), [clearBlurCommitTimer]);

  return (
    <div ref={anchorRef} className="relative flex-1 min-w-0">
      <Input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          clearBlurCommitTimer();
          setOpen(true);
        }}
        onBlur={() => {
          clearBlurCommitTimer();
          const delay = onBlurCommit ? 400 : 200;
          blurCommitTimerRef.current = setTimeout(() => {
            blurCommitTimerRef.current = null;
            setOpen(false);
            onBlurCommit?.();
          }, delay);
        }}
        className={className}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        inputMode="text"
        placeholder="Type brand name"
      />
      {portalTarget && list ? createPortal(list, portalTarget) : null}
    </div>
  );
}

// Helper to check if item can be rejected
const canRejectItem = (item: ItemDetails, history: StatusHistoryEntry[]): boolean => {
  const status = item.status?.toLowerCase();
  if (!status || (status !== 'available' && status !== 'in store')) return false;
  
  // Find last in-store timestamp
  let timestamp: number | undefined;
  if (item.lastInStoreAt) {
    const parsed = Date.parse(item.lastInStoreAt);
    if (!Number.isNaN(parsed)) timestamp = parsed;
  }
  
  if (timestamp === undefined && history && history.length) {
    for (let i = history.length - 1; i >= 0; i--) {
      const entry = history[i];
      if (entry && (entry.status?.toLowerCase() === 'in store' || entry.status?.toLowerCase() === 'available')) {
        const normalizeTimestamp = (value: string) => {
          if (value.includes('T')) return value;
          const sanitized = value.replace(' ', 'T');
          return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(sanitized) ? `${sanitized}:00` : sanitized;
        };
        const parsed = entry.timestamp ? Date.parse(normalizeTimestamp(entry.timestamp)) : NaN;
        if (!Number.isNaN(parsed)) {
          timestamp = parsed;
          break;
        }
      }
    }
  }
  
  if (timestamp === undefined) return false;
  const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
  return Date.now() - timestamp <= TWENTY_FOUR_HOURS_MS;
};

// Statuses shown in item details dropdown. Rejected only when item is Available and within 24h.
// Draft, In transit, Returned, Storage are hidden from store item details.
const getAvailableStatuses = (item: ItemDetails, history: StatusHistoryEntry[]): string[] => {
  const base = ['Available', 'Sold', 'Missing', 'Broken'];
  const withRejected = canRejectItem(item, history) ? [...base, 'Rejected'] : base;
  const current = item.status;
  if (current && !withRejected.includes(current)) {
    return [current, ...withRejected];
  }
  return withRejected;
};

const AVAILABLE_BRANDS = [
  'H&M',
  'Weekday',
  'COS',
  'ARKET',
  'Monki',
  'Zara',
  'Mango',
  'Uniqlo',
  'Other'
];

const AVAILABLE_CATEGORIES = [
  'Tops',
  'Dresses',
  'Jeans',
  'Trousers',
  'Shorts',
  'Skirts',
  'Jackets',
  'Coats',
  'Hoodies',
  'Sweaters',
  'Shoes',
  'Accessories',
  'Other'
];

const AVAILABLE_SIZES = [
  'XXS',
  'XS',
  'S',
  'M',
  'L',
  'XL',
  'XXL',
  '32',
  '34',
  '36',
  '38',
  '40',
  '42',
  '44',
  '46',
  'One size'
];

const AVAILABLE_COLORS = [
  'Black',
  'White',
  'Gray',
  'Beige',
  'Brown',
  'Red',
  'Pink',
  'Orange',
  'Yellow',
  'Green',
  'Blue',
  'Purple',
  'Multi-color'
];

const AVAILABLE_LOCATIONS = [
  'Warehouse',
  'In transit',
  'Store'
];

const SORTED_AVAILABLE_CATEGORIES = sortOptionsAlpha(AVAILABLE_CATEGORIES);
const SORTED_AVAILABLE_COLORS = sortOptionsAlpha(AVAILABLE_COLORS);
const SORTED_AVAILABLE_BRANDS = sortOptionsAlpha(AVAILABLE_BRANDS);
const SORTED_AVAILABLE_SIZES = sortStoreItemSizes(AVAILABLE_SIZES);
const SORTED_AVAILABLE_LOCATIONS = sortOptionsAlpha(AVAILABLE_LOCATIONS);
const SORTED_THRIFTED_CATEGORIES = sortOptionsAlpha([...THRIFTED_VALID_VALUES.categories]);
const SORTED_THRIFTED_COLORS = sortOptionsAlpha([...THRIFTED_VALID_VALUES.colors]);
const SORTED_ALL_THRIFTED_SUBCATEGORIES = sortOptionsAlpha(getAllThriftedSubcategories());

function ThriftedPartnerInlineSection({
  item,
  onPatch,
  brandAutocompleteOptions,
  priceSelectOptions,
  priceCurrency,
  onOpenScanner,
  retailerDraft,
  externalDraft,
  brandDraft,
  onRetailerDraftChange,
  onExternalDraftChange,
  onBrandDraftChange,
}: {
  item: ItemDetails;
  onPatch: (updates: Partial<ItemDetails>) => void;
  brandAutocompleteOptions: string[];
  priceSelectOptions: Array<{ value: string; label: string }>;
  priceCurrency?: string;
  onOpenScanner: () => void;
  retailerDraft: string;
  externalDraft: string;
  brandDraft: string;
  onRetailerDraftChange: (v: string) => void;
  onExternalDraftChange: (v: string) => void;
  onBrandDraftChange: (v: string) => void;
}) {
  const subcategoryBase = useMemo(() => {
    const c = item.category?.trim();
    if (c && THRIFTED_VALID_VALUES.subcategories[c]) {
      return sortOptionsAlpha([...THRIFTED_VALID_VALUES.subcategories[c]]);
    }
    return SORTED_ALL_THRIFTED_SUBCATEGORIES;
  }, [item.category]);

  const subcategoryOptions = useMemo(() => {
    const cur = item.subcategory?.trim();
    if (cur && !subcategoryBase.includes(cur)) {
      return sortOptionsAlpha([...subcategoryBase, cur]);
    }
    return subcategoryBase;
  }, [subcategoryBase, item.subcategory]);

  const sizeOptions = useMemo(
    () => sortStoreItemSizes([...THRIFTED_VALID_VALUES.sizes]),
    []
  );

  const priceOptsSafe = priceSelectOptions.filter((o) => o.value !== '');
  const priceValue =
    item.price !== undefined && item.price !== null && item.price > 0
      ? String(item.price)
      : '';
  const priceOptionsForSelect = useMemo(() => {
    if (
      priceValue &&
      !priceOptsSafe.some((o) => o.value === priceValue)
    ) {
      return [
        ...priceOptsSafe,
        { value: priceValue, label: `${priceCurrency || 'SEK'} ${priceValue}` },
      ];
    }
    return priceOptsSafe;
  }, [priceOptsSafe, priceValue, priceCurrency]);

  const categoryOpts = useMemo(() => {
    const c = item.category?.trim();
    const base = SORTED_THRIFTED_CATEGORIES;
    if (c && !base.includes(c)) return sortOptionsAlpha([...base, c]);
    return base;
  }, [item.category]);

  const sizeOpts = useMemo(() => {
    const s = item.size?.trim();
    if (s && !sizeOptions.includes(s)) return [...sizeOptions, s];
    return sizeOptions;
  }, [item.size, sizeOptions]);

  const colorOpts = useMemo(() => {
    const c = item.color?.trim();
    const base = SORTED_THRIFTED_COLORS;
    if (c && !base.includes(c)) return sortOptionsAlpha([...base, c]);
    return base;
  }, [item.color]);

  const FieldRow = ({
    icon: Icon,
    label,
    children,
  }: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    children: React.ReactNode;
  }) => (
    <div className="flex items-start gap-3 pb-2">
      <Icon className="w-5 h-5 text-on-surface-variant flex-shrink-0 mt-2.5" />
      <div className="flex-1 min-w-0">
        <p className="label-small text-on-surface-variant mb-1">{label}</p>
        <div className="mt-0">{children}</div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <FieldRow icon={RefreshCw} label="Status">
        <span className={`body-medium ${getStatusTextColor(item.status)}`}>
          {getStatusLabel(item.status)}
        </span>
      </FieldRow>

      <FieldRow icon={Tag} label="Item ID*">
        <div className="flex gap-2">
          <Input
            value={retailerDraft}
            onChange={(e) => onRetailerDraftChange(e.target.value)}
            className="relative z-[1] bg-surface-container-high border border-outline rounded-lg min-h-[48px] h-12 text-base flex-1 touch-manipulation"
            placeholder="Required"
            autoComplete="off"
            inputMode="text"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-12 w-12 shrink-0 touch-manipulation"
            onClick={onOpenScanner}
            aria-label="Scan item ID"
          >
            <QrCode size={18} />
          </Button>
        </div>
      </FieldRow>

      <FieldRow icon={Tag} label="External ID (optional)">
        <Input
          value={externalDraft}
          onChange={(e) => onExternalDraftChange(e.target.value)}
          className="relative z-[1] bg-surface-container-high border border-outline rounded-lg min-h-[48px] h-12 text-base touch-manipulation"
          placeholder="Optional"
          autoComplete="off"
          inputMode="text"
        />
      </FieldRow>

      <FieldRow icon={Tag} label="Brand">
        <ThriftedBrandAutocompleteEdit
          value={brandDraft}
          onChange={(v) => onBrandDraftChange(v)}
          suggestions={brandAutocompleteOptions}
          minCharsForPanel={2}
          className="relative z-[1] bg-surface-container-high border border-outline rounded-lg min-h-[48px] h-12 text-base touch-manipulation w-full"
        />
      </FieldRow>

      <FieldRow icon={Tag} label="Category">
        <Select
          modal={false}
          value={item.category || ''}
          onValueChange={(v) => onPatch({ category: v })}
        >
          <SelectTrigger className="bg-surface-container-high border border-outline rounded-lg min-h-[48px] h-12 touch-manipulation w-full">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categoryOpts.map((c) => (
              <SelectItem key={c} value={c} className="min-h-[44px] py-3 touch-manipulation">
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FieldRow>

      <FieldRow icon={Tag} label="Subcategory">
        <Select
          modal={false}
          value={item.subcategory || ''}
          onValueChange={(v) => onPatch({ subcategory: v })}
        >
          <SelectTrigger className="bg-surface-container-high border border-outline rounded-lg min-h-[48px] h-12 touch-manipulation w-full">
            <SelectValue placeholder="Select subcategory" />
          </SelectTrigger>
          <SelectContent>
            {subcategoryOptions.map((c) => (
              <SelectItem key={c} value={c} className="min-h-[44px] py-3 touch-manipulation">
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FieldRow>

      <FieldRow icon={Package} label="Size">
        <Select modal={false} value={item.size || ''} onValueChange={(v) => onPatch({ size: v })}>
          <SelectTrigger className="bg-surface-container-high border border-outline rounded-lg min-h-[48px] h-12 touch-manipulation w-full">
            <SelectValue placeholder="Select size" />
          </SelectTrigger>
          <SelectContent>
            {sizeOpts.map((s) => (
              <SelectItem key={s} value={s} className="min-h-[44px] py-3 touch-manipulation">
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FieldRow>

      <FieldRow icon={Package} label="Color">
        <Select modal={false} value={item.color || ''} onValueChange={(v) => onPatch({ color: v })}>
          <SelectTrigger className="bg-surface-container-high border border-outline rounded-lg min-h-[48px] h-12 touch-manipulation w-full">
            <SelectValue placeholder="Select color" />
          </SelectTrigger>
          <SelectContent>
            {colorOpts.map((c) => (
              <SelectItem key={c} value={c} className="min-h-[44px] py-3 touch-manipulation">
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FieldRow>

      <FieldRow icon={Euro} label={`Price${priceCurrency ? ` (${priceCurrency})` : ''}`}>
        <Select
          modal={false}
          value={priceValue}
          onValueChange={(v) => onPatch({ price: parseFloat(v) })}
        >
          <SelectTrigger className="bg-surface-container-high border border-outline rounded-lg min-h-[48px] h-12 touch-manipulation w-full">
            <SelectValue placeholder="Select price" />
          </SelectTrigger>
          <SelectContent>
            {priceOptionsForSelect.map((o) => (
              <SelectItem key={o.value} value={o.value} className="min-h-[44px] py-3 touch-manipulation">
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FieldRow>
    </div>
  );
}

export default function ItemDetailsDialog({ 
  item, 
  isOpen, 
  onClose, 
  onSave,
  statusHistory = [],
  priceOptions,
  priceCurrency,
  expireTimeWeeks,
  userRole,
  onRequestRejectReason,
  enableThriftedPartnerItemDialog = false,
  brandAutocompleteOptions = [],
  partnerMobileActions,
}: ItemDetailsDialogProps) {
  const [editingField, setEditingField] = useState<EditField>(null);
  const [editValues, setEditValues] = useState<Partial<ItemDetails>>({});
  const [showIdScanner, setShowIdScanner] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedId, setScannedId] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [showBarcode, setShowBarcode] = useState(false);
  const isLargeScreen = useMediaQuery('(min-width: 640px)');
  const barcodeRefCallback = useCallback((node: SVGSVGElement | null) => {
    if (!node || !item?.itemId) return;
    try {
      JsBarcode(node, `9${item.itemId}`, {
        format: 'CODE128',
        displayValue: true,
        fontSize: 14,
        height: 80,
        margin: 8,
      });
    } catch (err) {
      console.error('Failed to render barcode', err);
    }
  }, [item?.itemId]);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const thriftedFlushDraftsRef = useRef<(() => void) | null>(null);
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;
  const itemIdRef = useRef<string | undefined>(undefined);
  itemIdRef.current = item?.id;

  const itemSnapshotRef = useRef<ItemDetails | null>(null);
  if (item) {
    itemSnapshotRef.current = item;
  }

  const [thriftedRetailerDraft, setThriftedRetailerDraft] = useState('');
  const [thriftedExternalDraft, setThriftedExternalDraft] = useState('');
  const [thriftedBrandDraft, setThriftedBrandDraft] = useState('');
  const thriftedRetailerDraftRef = useRef('');
  const thriftedExternalDraftRef = useRef('');
  const thriftedBrandDraftRef = useRef('');
  thriftedRetailerDraftRef.current = thriftedRetailerDraft;
  thriftedExternalDraftRef.current = thriftedExternalDraft;
  thriftedBrandDraftRef.current = thriftedBrandDraft;

  const [thriftedDraftResyncEpoch, setThriftedDraftResyncEpoch] = useState(0);
  const prevShowScannerRef = useRef(false);
  useEffect(() => {
    if (prevShowScannerRef.current && !showIdScanner && enableThriftedPartnerItemDialog) {
      setThriftedDraftResyncEpoch((e) => e + 1);
    }
    prevShowScannerRef.current = showIdScanner;
  }, [showIdScanner, enableThriftedPartnerItemDialog]);

  useEffect(() => {
    if (item?.id) {
      setShowIdScanner(false);
    }
  }, [item?.id]);

  useEffect(() => {
    if (!enableThriftedPartnerItemDialog) return;
    const rowId = item?.id;
    if (!rowId) return;
    const cur = itemSnapshotRef.current;
    if (!cur || cur.id !== rowId) return;
    setThriftedRetailerDraft(cur.itemId);
    setThriftedExternalDraft(cur.externalId ?? '');
    setThriftedBrandDraft(cur.brand || '');
  }, [item?.id, thriftedDraftResyncEpoch, enableThriftedPartnerItemDialog]);

  useLayoutEffect(() => {
    if (!enableThriftedPartnerItemDialog) {
      thriftedFlushDraftsRef.current = null;
      return;
    }
    thriftedFlushDraftsRef.current = () => {
      const id = itemIdRef.current;
      if (!id) return;
      onSaveRef.current(id, {
        itemId: thriftedRetailerDraftRef.current,
        externalId: thriftedExternalDraftRef.current,
        brand: thriftedBrandDraftRef.current,
      });
    };
    return () => {
      thriftedFlushDraftsRef.current = null;
    };
  }, [enableThriftedPartnerItemDialog]);

  const stableThriftedPatch = useCallback((updates: Partial<ItemDetails>) => {
    const id = itemIdRef.current;
    if (!id) return;
    onSaveRef.current(id, updates);
  }, []);

  const effectivePricePoints = useMemo(() => {
    if (priceOptions && priceOptions.length > 0) return priceOptions;
    if (enableThriftedPartnerItemDialog) return [...THRIFTED_VALID_VALUES.prices];
    return [];
  }, [priceOptions, enableThriftedPartnerItemDialog]);

  const flushThriftedDraftsToParent = () => {
    if (enableThriftedPartnerItemDialog) {
      thriftedFlushDraftsRef.current?.();
    }
  };

  const closeWithThriftedFlush = () => {
    flushThriftedDraftsToParent();
    onClose();
  };

  const handleMainDialogOpenChange = (open: boolean) => {
    if (!open) {
      flushThriftedDraftsToParent();
      onClose();
    }
  };

  if (!item) return null;

  const handleStartEdit = (field: EditField) => {
    if (field) {
      setEditingField(field);
      setEditValues({ [field]: item[field] });
    }
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setEditValues({});
  };

  const handleSaveEdit = (field: EditField) => {
    if (field && editValues[field] !== undefined) {
      // When changing from Available to Rejected, show reject reason sheet first (within 24h rule)
      if (field === 'status' && editValues[field] === 'Rejected' && item.status === 'Available') {
        if (canRejectItem(item, statusHistory) && onRequestRejectReason) {
          onRequestRejectReason(item);
          setEditingField(null);
          setEditValues({});
          return;
        }
        if (!canRejectItem(item, statusHistory)) {
          toast.error('Item can only be rejected within 24 hours of arriving in store.');
          return;
        }
      }

      const updates = { [field]: editValues[field] };
      
      // Add status change to history if status is being updated
      if (field === 'status') {
        toast.success(`Status updated to ${editValues[field]}`);
      } else {
        toast.success(`${field.charAt(0).toUpperCase() + field.slice(1)} updated`);
      }
      
      onSave(item.id, updates);
      setEditingField(null);
      setEditValues({});
    }
  };

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      const mockId = `${Math.floor(100000 + Math.random() * 900000)}`;
      // Automatically save and close
      onSave(item.id, { itemId: mockId });
      if (enableThriftedPartnerItemDialog) {
        setThriftedRetailerDraft(mockId);
      }
      toast.success(`Item ID updated to ${mockId}`);
      setShowIdScanner(false);
      setScannedId('');
      setIsScanning(false);
    }, 1500);
  };

  const handleManualEntry = (newId: string) => {
    if (newId.trim()) {
      // Automatically save and close
      onSave(item.id, { itemId: newId });
      if (enableThriftedPartnerItemDialog) {
        setThriftedRetailerDraft(newId.trim());
      }
      toast.success(`Item ID updated to ${newId}`);
      setShowIdScanner(false);
      setScannedId('');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('Image size must be less than 10MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setUploadedImage(result);
        onSave(item.id, { image: result });
        toast.success('Image uploaded successfully');
      };
      reader.readAsDataURL(file);
    }
  };

  const displayImage = uploadedImage || item.image || item.thumbnail;
  const hasNoImage = !displayImage;

  const formatPriceValue = (amount?: number) => {
    if (amount === undefined || amount === null || Number.isNaN(amount)) {
      return 'Not set';
    }

    const currency = priceCurrency || 'EUR';
    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency
      }).format(amount);
    } catch {
      return `${currency} ${amount.toFixed(2)}`;
    }
  };

  // Calculate days in store from lastInStoreAt
  const calculateDaysInStore = (lastInStoreAt?: string): number | null => {
    if (!lastInStoreAt) return null;
    try {
      const lastInStoreDate = new Date(lastInStoreAt);
      const now = new Date();
      const diffTime = now.getTime() - lastInStoreDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 ? diffDays : null;
    } catch {
      return null;
    }
  };

  const daysInStore = calculateDaysInStore(item?.lastInStoreAt);

  const priceSelectOptions = effectivePricePoints.map((option) => ({
    value: option.toString(),
    label: formatPriceValue(option),
  }));

  const EditableField = ({
    field,
    label,
    value,
    icon: Icon,
    type = 'text',
    options,
    formatValue,
    brandSuggestions = [],
  }: {
    field: EditField;
    label: string;
    value: any;
    icon: any;
    type?: 'text' | 'number' | 'select' | 'brand-autocomplete';
    options?: Array<string | { value: string; label: string }>;
    formatValue?: (value: any) => React.ReactNode;
    brandSuggestions?: string[];
  }) => {
    const isEditing = editingField === field;
    const currentValue = isEditing ? (editValues[field] ?? value) : value;
    const normalizedOptions =
      options?.map((option) =>
        typeof option === 'string'
          ? { value: option, label: option }
          : { value: option.value, label: option.label }
      ) ?? [];

    // Radix SelectItem must not use value="" (empty string is reserved for clearing the Select).
    const normalizedOptionsSafe = normalizedOptions.filter((option) => option.value !== '');

    let selectOptions = normalizedOptionsSafe;
    if (
      type === 'select' &&
      normalizedOptionsSafe.length > 0 &&
      currentValue !== undefined &&
      currentValue !== null
    ) {
      const currentStringValue = currentValue.toString();
      if (
        currentStringValue !== '' &&
        !normalizedOptionsSafe.some((option) => option.value === currentStringValue)
      ) {
        selectOptions = [
          ...normalizedOptionsSafe,
          {
            value: currentStringValue,
            label:
              formatValue?.(currentValue) ??
              (typeof currentValue === 'string' ? currentValue : currentStringValue)
          }
        ];
      }
    }

    return (
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <Icon className="w-5 h-5 text-on-surface-variant flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="label-small text-on-surface-variant mb-1">{label}</p>
            {isEditing ? (
              <div className="flex items-center gap-2">
                {type === 'brand-autocomplete' && field === 'brand' ? (
                  <ThriftedBrandAutocompleteEdit
                    value={currentValue?.toString() || ''}
                    onChange={(v) => setEditValues({ ...editValues, brand: v })}
                    suggestions={brandSuggestions}
                    className="bg-surface-container-high border border-outline rounded-lg min-h-[48px] h-12 text-base touch-manipulation"
                  />
                ) : type === 'select' && field === 'brand' ? (
                  <BrandPicker
                    value={currentValue?.toString() || ''}
                    onChange={(v) => setEditValues({ ...editValues, [field]: v })}
                    brands={selectOptions.map((o) => o.value)}
                    placeholder="Select brand"
                    triggerClassName="bg-surface-container-high border border-outline rounded-lg min-h-[48px] h-12 touch-manipulation flex-1"
                  />
                ) : type === 'select' ? (
                  <Select
                    modal={false}
                    value={
                      currentValue !== undefined && currentValue !== null
                        ? currentValue.toString()
                        : ''
                    }
                    onValueChange={(val) =>
                      setEditValues({
                        ...editValues,
                        [field]:
                          field === 'price'
                            ? Number.isNaN(Number(val))
                              ? val
                              : parseFloat(val)
                            : val
                      })
                    }
                  >
                    <SelectTrigger className="bg-surface-container-high border border-outline rounded-lg min-h-[48px] h-12 touch-manipulation">
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectOptions
                        .filter((option) => option.value !== '')
                        .map((option) => (
                          <SelectItem
                            key={option.value}
                            value={option.value}
                            className="min-h-[48px] md:min-h-0 py-3 md:py-1.5 touch-manipulation"
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    type={type}
                    value={currentValue?.toString() || ''}
                    onChange={(e) => setEditValues({ ...editValues, [field]: type === 'number' ? parseFloat(e.target.value) : e.target.value })}
                    className="bg-surface-container-high border border-outline rounded-lg min-h-[48px] h-12 text-base touch-manipulation"
                    autoFocus
                  />
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleSaveEdit(field)}
                  className="min-h-[48px] min-w-[48px] h-12 w-12 flex-shrink-0 text-primary hover:bg-primary-container touch-manipulation"
                >
                  <Check size={20} />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleCancelEdit}
                  className="min-h-[48px] min-w-[48px] h-12 w-12 flex-shrink-0 text-on-surface-variant hover:bg-surface-container-high touch-manipulation"
                >
                  <X size={20} />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {field === 'status' ? (
                  <span className={`body-large ${getStatusTextColor(currentValue)}`}>
                    {getStatusLabel(currentValue)}
                  </span>
                ) : formatValue ? (
                  <p className="body-large text-on-surface break-words">
                    {formatValue(currentValue)}
                  </p>
                ) : (
                  <p className="body-large text-on-surface break-words">
                    {currentValue || 'Not set'}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
        {!isEditing && !(enableThriftedPartnerItemDialog && field === 'status') && (
          <Button
            size="icon"
            variant="ghost"
            onClick={() => handleStartEdit(field)}
            className="min-h-[48px] min-w-[48px] h-12 w-12 flex-shrink-0 text-on-surface-variant hover:bg-surface-container-high touch-manipulation"
          >
            <Edit3 size={20} />
          </Button>
        )}
      </div>
    );
  };

  if (showIdScanner) {
    return (
      <Dialog open={isOpen} onOpenChange={() => {
        setShowIdScanner(false);
        setScannedId('');
      }}>
        <DialogContent className="bg-surface border-0 m-0 p-0 rounded-none flex flex-col [&>button]:hidden">
          <VisuallyHidden>
            <DialogTitle>Scan new item ID</DialogTitle>
            <DialogDescription>Scan or enter a new ID for this item</DialogDescription>
          </VisuallyHidden>
          
          {/* Header */}
          <div className="bg-surface-container border-b border-outline-variant flex-shrink-0">
            <div className="px-4 py-3">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowIdScanner(false);
                    setScannedId('');
                  }}
                  className="h-12 w-12 text-on-surface-variant touch-manipulation"
                  aria-label="Back"
                >
                  <ArrowLeft size={20} />
                </Button>
                <div className="flex-1">
                  <h1 className="title-large text-on-surface">Scan new item ID</h1>
                  <p className="body-small text-on-surface-variant">
                    Current ID: {item.itemId}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Scanner - 1/3 of screen */}
          <div className="flex-shrink-0 px-4 pt-4 pb-4 border-b border-outline-variant overflow-hidden">
            <div className="h-[33vh] min-h-[200px] max-h-[33vh]">
              <ActiveScanner
                onScan={handleScan}
                onManualEntry={handleManualEntry}
                isScanning={isScanning}
                showManualEntry={false}
              />
            </div>
          </div>

          {/* Scanned ID Display */}
          <div className="flex-1 overflow-y-auto p-4">
            {isScanning && (
              <div className="p-4 bg-primary-container rounded-lg">
                <p className="body-medium text-on-primary-container mb-2">Scanning...</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
    <Dialog open={isOpen} onOpenChange={handleMainDialogOpenChange}>
      <DialogContent
        className={
          enableThriftedPartnerItemDialog && partnerMobileActions
            ? 'bg-surface border-0 m-0 p-0 rounded-none flex flex-col min-h-0 h-[100dvh] max-h-[100dvh] box-border [&>button]:hidden'
            : 'bg-surface border-0 m-0 p-0 rounded-none flex flex-col min-h-0 [&>button]:hidden'
        }
      >
        <VisuallyHidden>
          <DialogTitle>Item details</DialogTitle>
          <DialogDescription>View and edit item information</DialogDescription>
        </VisuallyHidden>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden [-webkit-overflow-scrolling:touch]">
          {/* Image Section */}
          {displayImage ? (
            <div className="relative w-full aspect-square bg-surface-container-high">
              {/* Back arrow on top of image */}
              <Button
                variant="ghost"
                size="icon"
                onClick={closeWithThriftedFlush}
                className="absolute top-4 left-4 min-h-[48px] min-w-[48px] bg-surface-container-highest/90 text-on-surface hover:bg-surface-container-high shadow-md z-10 touch-manipulation"
                aria-label="Back"
              >
                <ArrowLeft size={20} />
              </Button>
              <ImageWithFallback
                src={displayImage}
                alt={item.title || item.brand}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            /* No image - back arrow in top left */
            <div className="relative w-full">
              <Button
                variant="ghost"
                size="icon"
                onClick={closeWithThriftedFlush}
                className="absolute top-4 left-4 min-h-[48px] min-w-[48px] bg-surface-container-highest/90 text-on-surface hover:bg-surface-container-high shadow-md z-10 touch-manipulation"
                aria-label="Back"
              >
                <ArrowLeft size={20} />
              </Button>
            </div>
          )}

          {/* Item Information */}
          <div className="p-4 space-y-6">
            {/* No Image State - Show small thumbnail and add image options */}
            {hasNoImage && (
              <div className="bg-surface-container rounded-lg p-4 border border-outline-variant">
                <div className="flex items-start gap-4">
                  {/* Small thumbnail placeholder */}
                  <div className="flex-shrink-0 w-20 h-20 bg-surface-container-high rounded-lg flex items-center justify-center">
                    <Package className="w-10 h-10 text-on-surface-variant opacity-30" />
                  </div>
                  
                  <div className="flex-1">
                    <p className="body-medium text-on-surface mb-2">No image</p>
                    <p className="body-small text-on-surface-variant">Add an image to help identify this item</p>
                  </div>
                </div>
              </div>
            )}

            {enableThriftedPartnerItemDialog ? (
              <>
                <h2 className="title-large text-on-surface">Item details</h2>
                <Separator className="bg-outline-variant" />
                <ThriftedPartnerInlineSection
                  item={item}
                  onPatch={stableThriftedPatch}
                  brandAutocompleteOptions={brandAutocompleteOptions}
                  priceSelectOptions={priceSelectOptions}
                  priceCurrency={priceCurrency}
                  onOpenScanner={() => setShowIdScanner(true)}
                  retailerDraft={thriftedRetailerDraft}
                  externalDraft={thriftedExternalDraft}
                  brandDraft={thriftedBrandDraft}
                  onRetailerDraftChange={setThriftedRetailerDraft}
                  onExternalDraftChange={setThriftedExternalDraft}
                  onBrandDraftChange={setThriftedBrandDraft}
                />
              </>
            ) : (
              <>
                {/* Item ID - Replaces Title */}
                <div className="flex items-center justify-between gap-3">
                  <h2 className="title-large text-on-surface mb-1 flex-1 min-w-0 break-words">
                    Item ID: {item.itemId}
                  </h2>
                  <Button
                    variant="outline"
                    onClick={() => setShowBarcode(true)}
                    className="flex items-center gap-2 flex-shrink-0 min-h-[48px] min-w-[48px] px-4 touch-manipulation"
                  >
                    <Barcode size={18} />
                    Show barcode
                  </Button>
                </div>

                <Separator className="bg-outline-variant" />

                {/* Editable Fields */}
                <div className="space-y-4">
                  <EditableField
                    field="status"
                    label="Status"
                    value={item.status}
                    icon={RefreshCw}
                    type="select"
                    options={getAvailableStatuses(item, statusHistory)}
                  />

                  {/* Rejected reason - read-only when saved */}
                  {item.rejectReason && (
                    <div className="flex items-start gap-3">
                      <Ban className="w-5 h-5 text-on-surface-variant flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="label-small text-on-surface-variant mb-1">Rejected reason</p>
                        <p className="body-large text-on-surface break-words">{item.rejectReason}</p>
                      </div>
                    </div>
                  )}

                  <EditableField
                    field="price"
                    label={`Price${priceCurrency ? ` (${priceCurrency})` : ''}`}
                    value={item.price}
                    icon={Euro}
                    type={priceSelectOptions.length > 0 ? 'select' : 'number'}
                    options={priceSelectOptions}
                    formatValue={(val) =>
                      val !== undefined && val !== null
                        ? formatPriceValue(
                            typeof val === 'number' ? val : parseFloat(val as string)
                          )
                        : 'Not set'
                    }
                  />

                  <EditableField
                    field="brand"
                    label="Brand"
                    value={item.brand}
                    icon={Tag}
                    type="select"
                    options={SORTED_AVAILABLE_BRANDS}
                  />

                  <EditableField
                    field="category"
                    label="Category"
                    value={item.category}
                    icon={Tag}
                    type="select"
                    options={SORTED_AVAILABLE_CATEGORIES}
                  />

                  {(item.subcategory || editingField === 'subcategory') && (
                    <EditableField
                      field="subcategory"
                      label="Subcategory"
                      value={item.subcategory}
                      icon={Tag}
                      type="text"
                    />
                  )}

                  <EditableField
                    field="size"
                    label="Size"
                    value={item.size}
                    icon={Package}
                    type="select"
                    options={SORTED_AVAILABLE_SIZES}
                  />

                  <EditableField
                    field="color"
                    label="Color"
                    value={item.color}
                    icon={Package}
                    type="select"
                    options={SORTED_AVAILABLE_COLORS}
                  />

                  {userRole === 'admin' && (
                    <EditableField
                      field="location"
                      label="Location"
                      value={item.location}
                      icon={MapPin}
                      type="select"
                      options={SORTED_AVAILABLE_LOCATIONS}
                    />
                  )}

                  <Separator className="bg-outline-variant" />

                  {/* Date */}
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-on-surface-variant flex-shrink-0" />
                    <div>
                      <p className="label-small text-on-surface-variant">Registered date</p>
                      <p className="body-large text-on-surface">{item.date}</p>
                    </div>
                  </div>

                  {/* Days Remaining */}
                  {item.daysRemaining !== undefined && (
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-on-surface-variant flex-shrink-0" />
                      <div className="flex-1">
                        <p className="label-small text-on-surface-variant">Days remaining</p>
                        <p className="body-large text-on-surface">
                          {item.daysRemaining} {item.daysRemaining === 1 ? 'day' : 'days'}
                          {expireTimeWeeks !== undefined && (
                            <span className="body-medium text-on-surface-variant ml-2">
                              ({expireTimeWeeks} {expireTimeWeeks === 1 ? 'week' : 'weeks'})
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Days in Store */}
                  {daysInStore !== null && (
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-on-surface-variant flex-shrink-0" />
                      <div className="flex-1">
                        <p className="label-small text-on-surface-variant">Days in store</p>
                        <p className="body-large text-on-surface">
                          {daysInStore} {daysInStore === 1 ? 'day' : 'days'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Delivery ID */}
                  {item.deliveryId && (
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-on-surface-variant flex-shrink-0" />
                      <div>
                        <p className="label-small text-on-surface-variant">Delivery ID</p>
                        <p className="body-large text-on-surface">{item.deliveryId}</p>
                      </div>
                    </div>
                  )}

                  {/* Box Label */}
                  {item.boxLabel && (
                    <div className="flex items-center gap-3">
                      <Package className="w-5 h-5 text-on-surface-variant flex-shrink-0" />
                      <div>
                        <p className="label-small text-on-surface-variant">Box label</p>
                        <p className="body-large text-on-surface">{item.boxLabel}</p>
                      </div>
                    </div>
                  )}

                  {/* Source */}
                  {item.source && (
                    <div className="flex items-center gap-3">
                      <Tag className="w-5 h-5 text-on-surface-variant flex-shrink-0" />
                      <div>
                        <p className="label-small text-on-surface-variant">Source</p>
                        <p className="body-large text-on-surface">{item.source}</p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {enableThriftedPartnerItemDialog && (
              <>
                <Separator className="bg-outline-variant" />
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-on-surface-variant flex-shrink-0" />
                    <div>
                      <p className="label-small text-on-surface-variant">Registered date</p>
                      <p className="body-large text-on-surface">{item.date}</p>
                    </div>
                  </div>

                  {item.daysRemaining !== undefined && (
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-on-surface-variant flex-shrink-0" />
                      <div className="flex-1">
                        <p className="label-small text-on-surface-variant">Days remaining</p>
                        <p className="body-large text-on-surface">
                          {item.daysRemaining} {item.daysRemaining === 1 ? 'day' : 'days'}
                          {expireTimeWeeks !== undefined && (
                            <span className="body-medium text-on-surface-variant ml-2">
                              ({expireTimeWeeks} {expireTimeWeeks === 1 ? 'week' : 'weeks'})
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  )}

                  {daysInStore !== null && (
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-on-surface-variant flex-shrink-0" />
                      <div className="flex-1">
                        <p className="label-small text-on-surface-variant">Days in store</p>
                        <p className="body-large text-on-surface">
                          {daysInStore} {daysInStore === 1 ? 'day' : 'days'}
                        </p>
                      </div>
                    </div>
                  )}

                  {item.deliveryId && (
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-on-surface-variant flex-shrink-0" />
                      <div>
                        <p className="label-small text-on-surface-variant">Delivery ID</p>
                        <p className="body-large text-on-surface">{item.deliveryId}</p>
                      </div>
                    </div>
                  )}

                  {item.boxLabel && (
                    <div className="flex items-center gap-3">
                      <Package className="w-5 h-5 text-on-surface-variant flex-shrink-0" />
                      <div>
                        <p className="label-small text-on-surface-variant">Box label</p>
                        <p className="body-large text-on-surface">{item.boxLabel}</p>
                      </div>
                    </div>
                  )}

                  {item.source && (
                    <div className="flex items-center gap-3">
                      <Tag className="w-5 h-5 text-on-surface-variant flex-shrink-0" />
                      <div>
                        <p className="label-small text-on-surface-variant">Source</p>
                        <p className="body-large text-on-surface">{item.source}</p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Status History Section at Bottom */}
          {showHistory && statusHistory.length > 0 && (
            <div className="p-4 bg-surface-container-low border-t border-outline-variant">
              <h3 className="title-medium text-on-surface mb-3">Status history</h3>
              <div className="space-y-3">
                {statusHistory.map((entry, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-primary"></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`body-medium ${getStatusTextColor(entry.status)}`}>
                          {getStatusLabel(entry.status)}
                        </span>
                        <span className="label-small text-on-surface-variant">{entry.timestamp}</span>
                      </div>
                      {entry.user && (
                        <p className="body-small text-on-surface-variant">By {entry.user}</p>
                      )}
                      {entry.note && (
                        <p className="body-small text-on-surface mt-1">{entry.note}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* History Button at Bottom */}
          {statusHistory.length > 0 && (
            <div className="p-4 bg-surface-container border-t border-outline-variant flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
                className="w-full min-h-[48px] text-on-surface-variant touch-manipulation"
              >
                <History size={18} className="mr-2" />
                {showHistory ? 'Hide History' : 'Show History'}
              </Button>
            </div>
          )}
        </div>

        {enableThriftedPartnerItemDialog && partnerMobileActions && (
          <div
            className="flex-shrink-0 border-t border-outline-variant bg-surface mx-4 pt-3 flex gap-3"
            style={{
              paddingLeft: 'max(12px, env(safe-area-inset-left, 0px))',
              paddingRight: 'max(12px, env(safe-area-inset-right, 0px))',
              paddingBottom: 'max(28px, calc(env(safe-area-inset-bottom, 24px) + 20px))',
            }}
          >
            <Button
              type="button"
              variant="outline"
              className="flex-1 min-h-[48px] touch-manipulation"
              onClick={() => {
                flushThriftedDraftsToParent();
                partnerMobileActions.onDone();
              }}
            >
              Done
            </Button>
            {partnerMobileActions.hasNext ? (
              <Button
                type="button"
                variant="default"
                className="flex-1 min-h-[48px] touch-manipulation"
                onClick={() => {
                  flushThriftedDraftsToParent();
                  partnerMobileActions.onNext();
                }}
              >
                Next
              </Button>
            ) : null}
          </div>
        )}
      </DialogContent>
    </Dialog>

    <Sheet open={showBarcode} onOpenChange={setShowBarcode}>
      <SheetContent
        side={isLargeScreen ? 'right' : 'bottom'}
        containerZIndex={12000}
        className={`
          ${isLargeScreen ? 'max-w-md' : 'max-h-[85vh] rounded-t-3xl'}
          bg-surface-container-high border-outline-variant p-0 gap-0 overflow-hidden flex flex-col
        `}
      >
        {!isLargeScreen && (
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-8 h-1 bg-outline-variant rounded-full" />
          </div>
        )}

        <SheetHeader className={`relative px-6 pb-4 flex-shrink-0 ${isLargeScreen ? 'pt-6' : ''}`}>
          <SheetTitle className="title-large text-on-surface text-left">Item barcode</SheetTitle>
          <SheetDescription className="body-small text-on-surface-variant text-left">
            Scan this barcode at the POS to sell the item.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-4">
          <div className="flex flex-col items-center justify-center bg-white rounded-2xl border border-outline-variant py-6 px-4">
            <svg ref={barcodeRefCallback} aria-label={`Barcode for item ${item?.itemId ?? ''}`} />
          </div>

          <div className="space-y-3 pt-2">
            <p className="title-small text-on-surface">If the item has lost its hangtag</p>
            <p className="body-medium text-on-surface-variant">
              Write the Item ID and price on an empty hangtag and attach it to the item.
            </p>
            <p className="body-medium text-on-surface-variant">
              To sell the item, either:
            </p>
            <p className="body-medium text-on-surface-variant">
              a) Type the Item ID manually in the POS, or
            </p>
            <p className="body-medium text-on-surface-variant">
              b) Open item details, show the barcode, and scan it in the POS.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
    </>
  );
}
