import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  calibrationParameters,
  mockBrandSegments,
  mockCategoryMappings,
  mockPriceForkTestItems,
  priceForkDefaultState,
  PriceForkCalibrationState,
  PriceForkInsightPrompt,
  PriceForkTestItem,
  pricingLogicNarrative,
  priceForkPromptDefinitions
} from '../data/priceFork';
import { MASTER_VALUES_DEMO } from '../data/masterValuesDemo';
import { getSekPriceOptions } from '../data/partnerPricing';
import { Brand } from './PortalConfigTypes';
import { cn } from './ui/utils';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Slider } from './ui/slider';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from './ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from './ui/table';
import { ScrollArea } from './ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from './ui/dialog';
// Popover removed from MatrixPriceCell — uses plain absolute dropdown to avoid
// position:fixed containing-block issues inside the horizontal scroll container.
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Brain, ChevronDown, ChevronRight, DownloadCloud, Info, Loader2, Sparkles, Search, Wand2, X } from 'lucide-react';
import { PortalTopAppBar } from './ui/portal-top-app-bar';

interface PriceForkCalibrationScreenProps {
  partnerId: string;
  onBack?: () => void;
  onSaveCalibration?: (brandId: string, state: PriceForkCalibrationState) => void;
}

const confidenceBandClasses = [
  { max: 0.6, className: 'text-error', badge: 'bg-error-container text-on-error-container' },
  { max: 0.75, className: 'text-tertiary', badge: 'bg-tertiary-container text-on-tertiary-container' },
  { max: 1, className: 'text-primary', badge: 'bg-primary-container text-on-primary-container' }
];

const getConfidenceStyles = (confidence: number) => {
  const band = confidenceBandClasses.find((item) => confidence <= item.max) ?? confidenceBandClasses.at(-1)!;
  return {
    textClass: band.className,
    badgeClass: band.badge
  };
};

const calcMargin = (purchasePrice: number, salePrice: number) => {
  if (!purchasePrice) return 0;
  return (salePrice - purchasePrice) / purchasePrice;
};

const snapToNearestPricePoint = (value: number, pricePoints: number[]): number => {
  if (!pricePoints.length) {
    return Math.round(value);
  }

  return pricePoints.reduce((closest, point) => {
    const diff = Math.abs(point - value);
    const closestDiff = Math.abs(closest - value);
    if (diff < closestDiff) {
      return point;
    }
    if (diff === closestDiff) {
      return Math.max(point, closest);
    }
    return closest;
  }, pricePoints[0]!);
};

const formatWeightLabel = (weight: number) => {
  // Display as a multiplier, e.g. x1.20
  const rounded = Math.round(weight * 100) / 100;
  return `x${rounded.toFixed(2)}`;
};

const pickRandomSubset = <T,>(items: T[], count: number): T[] => {
  if (count <= 0) return [];
  if (items.length <= count) return [...items];
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy.slice(0, count);
};

const getMasterCategoryKeyFromBrandName = (
  brandName: string
): keyof typeof MASTER_VALUES_DEMO.categoriesByBrand => {
  const normalized = brandName.trim().toLowerCase();
  if (normalized === 'h&m' || normalized === 'hm') return 'H&M';
  if (normalized === 'cos') return 'COS';
  if (normalized === 'arket') return 'ARKET';
  return 'WEEKDAY';
};

/**
 * Temporarily hides the "Calibration actions" card and the "Test items" table
 * at the bottom of the Calibration tab. Flip to `true` to bring them back.
 */
const SHOW_CALIBRATION_ACTIONS_AND_TEST_ITEMS: boolean = false;

type MatrixMaterial = PriceForkTestItem['material'];
type MatrixTier = PriceForkTestItem['brandTier'];

// Annotation for a cell that received a pasted value (informational only — value already committed).
type PendingCell = {
  rowKey: string;
  material: MatrixMaterial;
  tier: MatrixTier;
  raw: number;
  snapped: number;
  changed: boolean;
};

const pkey = (rowKey: string, m: MatrixMaterial, t: MatrixTier) => `${rowKey}|${m}|${t}`;

// Parse clipboard text (Excel = tab-delimited, CSV = comma-delimited) into a 2D
// grid of numbers. Empty/non-numeric cells become null (skipped, not cleared).
const parseClipboardGrid = (text: string): Array<Array<number | null>> => {
  if (!text) return [];
  const lines = text.replace(/\r/g, '').split('\n');
  while (lines.length && lines[lines.length - 1]!.trim() === '') lines.pop();
  return lines.map((line) => {
    const delim = line.includes('\t') ? '\t' : ',';
    return line.split(delim).map((cell) => {
      const cleaned = cell.replace(/[^\d.,-]/g, '').replace(',', '.').trim();
      if (cleaned === '' || cleaned === '-' || cleaned === '.') return null;
      const n = Number(cleaned);
      return Number.isFinite(n) ? n : null;
    });
  });
};

// Map a pasted grid onto matrix cells, anchored at (anchor.r, anchor.c), snapping
// each value to the nearest valid ladder price. Out-of-range targets are ignored.
const buildPendingFromPaste = (
  grid: Array<Array<number | null>>,
  anchor: { r: number; c: number },
  gridRows: Array<{ rowKey: string; material: MatrixMaterial }>,
  tiers: MatrixTier[],
  pricePoints: number[]
): Map<string, PendingCell> => {
  const out = new Map<string, PendingCell>();
  grid.forEach((cols, i) => {
    cols.forEach((raw, j) => {
      if (raw == null) return;
      const r = anchor.r + i;
      const c = anchor.c + j;
      if (r < 0 || r >= gridRows.length || c < 0 || c >= tiers.length) return;
      const { rowKey, material } = gridRows[r]!;
      const tier = tiers[c]!;
      const snapped = snapToNearestPricePoint(raw, pricePoints);
      out.set(pkey(rowKey, material, tier), {
        rowKey,
        material,
        tier,
        raw,
        snapped,
        changed: snapped !== raw
      });
    });
  });
  return out;
};

// Spreadsheet-style price cell: a paste-capable editable input plus a dropdown
// that only lists valid ladder prices. Typed/pasted values are snapped on commit,
// so every stored price stays on the ladder.
function MatrixPriceCell({
  value,
  suggested,
  isBase,
  pricePoints,
  pending,
  disabled,
  triggerWidthClass,
  onPickLadder,
  onClearToSuggested,
  onCommitTyped,
  onPasteCapture
}: {
  value: number | null;
  suggested: number | null;
  isBase: boolean;
  pricePoints: number[];
  pending?: PendingCell;
  disabled: boolean;
  triggerWidthClass: string;
  onPickLadder: (n: number) => void;
  onClearToSuggested?: () => void;
  onCommitTyped: (n: number) => void;
  onPasteCapture: (e: ClipboardEvent) => void;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // `pending` is annotation-only — value is already committed. Always show live `value`.
  const displayNumber = value;
  const shown = editing ? draft : displayNumber != null ? String(displayNumber) : '';

  const commit = () => {
    setEditing(false);
    if (disabled) return;
    const trimmed = draft.trim();
    if (trimmed === '') return;
    const parsed = Number(trimmed.replace(',', '.'));
    if (Number.isNaN(parsed)) return;
    onCommitTyped(snapToNearestPricePoint(parsed, pricePoints));
  };

  return (
    // `relative` is required so the absolutely-positioned dropdown is contained here.
    <div ref={containerRef} className={cn('relative', triggerWidthClass)}>
      <div
        className={cn(
          'flex items-stretch rounded-lg border bg-surface-container-high overflow-hidden min-h-[40px] w-full',
          pending
            ? pending.changed
              ? 'border-tertiary ring-2 ring-tertiary/50 bg-tertiary-container/30'
              : 'border-primary ring-2 ring-primary/40 bg-primary-container/30'
            : 'border-outline'
        )}
      >
        <input
          inputMode="numeric"
          disabled={disabled}
          value={shown}
          placeholder="—"
          onFocus={(e) => {
            setEditing(true);
            setDraft(displayNumber != null ? String(displayNumber) : '');
            e.currentTarget.select();
          }}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              e.currentTarget.blur();
            }
          }}
          onPaste={(e) => { e.preventDefault(); onPasteCapture(e.nativeEvent); }}
          className="flex-1 min-w-0 px-3 bg-transparent text-sm text-on-surface outline-none disabled:opacity-50"
          aria-label="Price"
        />
        <button
          type="button"
          disabled={disabled}
          aria-label="Choose a valid price"
          onClick={() => setOpen((o) => !o)}
          className="px-2 flex items-center justify-center text-muted-foreground hover:bg-surface-container disabled:opacity-50 touch-manipulation"
        >
          <ChevronDown className="w-4 h-4 opacity-50" />
        </button>
      </div>

      {/* Dropdown list — position:absolute so it stays inside the scroll container and
          is never clipped by a Radix portal fixed-position bug. */}
      {open && (
        <div
          className="absolute left-0 top-full z-[10050] mt-1 w-full min-w-[160px] rounded-md border border-outline bg-popover shadow-md"
          // Close on outside mousedown
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="overflow-y-auto" style={{ maxHeight: '280px' }}>
            <div className="py-1">
              {!isBase && suggested != null && (
                <button
                  type="button"
                  onClick={() => {
                    onClearToSuggested?.();
                    setOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 min-h-[44px] body-medium hover:bg-surface-container flex items-center justify-between touch-manipulation"
                >
                  <span>Suggested</span>
                  <span className="text-on-surface-variant">{suggested} SEK</span>
                </button>
              )}
              {pricePoints.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    onPickLadder(p);
                    setOpen(false);
                  }}
                  className={cn(
                    'w-full text-left px-3 py-2 min-h-[44px] body-medium hover:bg-surface-container touch-manipulation',
                    value === p && 'bg-secondary-container text-on-secondary-container'
                  )}
                >
                  {p} SEK
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Compact editor for a sub-category's material weight (e.g. "×2.0"). Sits under the
// material name. Typed values are clamped to the x1–x5 range on commit.
function MaterialWeightInput({
  weight,
  disabled,
  onCommit
}: {
  weight: number;
  disabled: boolean;
  onCommit: (w: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const rounded = Math.round(weight * 100) / 100;
  const shown = editing ? draft : String(rounded);

  const commit = () => {
    setEditing(false);
    const trimmed = draft.trim().replace(',', '.').replace(/[^\d.]/g, '');
    if (trimmed === '') return;
    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed)) return;
    onCommit(Math.min(5, Math.max(1, parsed)));
  };

  return (
    <div className="mt-1 flex items-center gap-1">
      <span className="body-small text-on-surface-variant">×</span>
      <input
        inputMode="decimal"
        disabled={disabled}
        value={shown}
        onFocus={(e) => {
          setEditing(true);
          setDraft(String(rounded));
          e.currentTarget.select();
        }}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            e.currentTarget.blur();
          }
        }}
        className="w-16 px-2 py-1 rounded-md border border-outline bg-surface-container-high text-sm text-on-surface outline-none disabled:opacity-50"
        aria-label="Material weight multiplier"
      />
    </div>
  );
}

// Full-width selectable list row (label + description + trailing chevron), mirroring the
// SelectionListItem pattern in StoreSelector.tsx. Used for the Save-time weight-reconcile
// choices so each option has room for an explanatory line.
function ReconcileChoice({
  label,
  description,
  onClick,
  disabled
}: {
  label: string;
  description: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center justify-between gap-3 p-4 rounded-lg bg-surface-container hover:bg-surface-container-high active:bg-surface-container-highest transition-colors text-left touch-manipulation min-h-[48px] disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed"
    >
      <div className="flex-1">
        <div className="body-large text-on-surface">{label}</div>
        <div className="body-small text-on-surface-variant mt-0.5">{description}</div>
      </div>
      <ChevronRight className="h-5 w-5 text-on-surface-variant flex-shrink-0" />
    </button>
  );
}

// Stable empty object shared by both brandGroupOverrides and lastSavedBrandGroupOverrides
// on first render so reference equality correctly reports no unsaved changes initially.
const EMPTY_BRAND_GROUP_OVERRIDES: Record<string, PriceForkTestItem['brandTier']> = {};

export default function PriceForkCalibrationScreen({
  partnerId,
  onBack,
  onSaveCalibration
}: PriceForkCalibrationScreenProps) {
  // Mock brands data
  const brands: Brand[] = [
    { id: '1', name: 'WEEKDAY', code: 'WD' },
    { id: '2', name: 'COS', code: 'COS' },
    { id: '3', name: 'Monki', code: 'MK' },
    { id: '4', name: 'H&M', code: 'HM' }
  ];

  const [selectedBrandId, setSelectedBrandId] = useState<string>(brands[0]?.id || '1');
  const [activeTab, setActiveTab] = useState<'calibration' | 'brand-groups' | 'price-matrix'>('calibration');
  
  // Store calibration state per brand
  const [calibrationStates, setCalibrationStates] = useState<Record<string, PriceForkCalibrationState>>({
    [selectedBrandId]: { ...priceForkDefaultState }
  });
  const [lastSavedStates, setLastSavedStates] = useState<Record<string, PriceForkCalibrationState>>({
    [selectedBrandId]: { ...priceForkDefaultState }
  });

  // Get current brand's calibration state
  const calibrationState = calibrationStates[selectedBrandId] || { ...priceForkDefaultState };
  const lastSavedState = lastSavedStates[selectedBrandId] || { ...priceForkDefaultState };
  const selectedBrandName = brands.find((b) => b.id === selectedBrandId)?.name ?? brands[0]?.name ?? '';

  const PRICE_GROUPS: Array<PriceForkTestItem['brandTier']> = [
    'Premium',
    'High',
    'Mid',
    'Low',
  ];

  // Tiers in left-to-right matrix column order (Low is the base price anchor).
  const MATRIX_TIERS: Array<PriceForkTestItem['brandTier']> = ['Low', 'Mid', 'High', 'Premium'];

  // Material rows rendered under every subcategory. `other` = "Standard" (weight x1).
  const MATRIX_MATERIALS: Array<{ key: PriceForkTestItem['material']; label: string }> = [
    { key: 'other', label: 'Standard' },
    { key: 'leather', label: 'Leather' },
    { key: 'silk', label: 'Silk' },
    { key: 'suede', label: 'Suede' },
    { key: 'cashmere', label: 'Cashmere' },
  ];

  // Brand → group (AI mapping) UI state (mocked)
  const [brandGroupOverrides, setBrandGroupOverrides] = useState<Record<string, PriceForkTestItem['brandTier']>>(EMPTY_BRAND_GROUP_OVERRIDES);
  const [lastSavedBrandGroupOverrides, setLastSavedBrandGroupOverrides] = useState<Record<string, PriceForkTestItem['brandTier']>>(EMPTY_BRAND_GROUP_OVERRIDES);
  const [brandGroupFilter, setBrandGroupFilter] = useState<PriceForkTestItem['brandTier'] | 'all'>('all');
  const [brandGroupSearch, setBrandGroupSearch] = useState('');

  const brandGroupRows = useMemo(() => {
    const rows = mockBrandSegments.flatMap((segment) =>
      segment.brands.map((b) => ({
        itemBrand: b.name,
        aiGroup: segment.tier as PriceForkTestItem['brandTier'],
      }))
    );
    const uniq = new Map<string, { itemBrand: string; aiGroup: PriceForkTestItem['brandTier'] }>();
    rows.forEach((r) => {
      if (!uniq.has(r.itemBrand)) uniq.set(r.itemBrand, r);
    });
    const list = Array.from(uniq.values()).map((r) => ({
      ...r,
      group: brandGroupOverrides[r.itemBrand] ?? r.aiGroup,
    }));
    return list
      .filter((r) => (brandGroupFilter === 'all' ? true : r.group === brandGroupFilter))
      .filter((r) => (brandGroupSearch.trim()
        ? r.itemBrand.toLowerCase().includes(brandGroupSearch.trim().toLowerCase())
        : true))
      .sort((a, b) => a.itemBrand.localeCompare(b.itemBrand));
  }, [brandGroupOverrides, brandGroupFilter, brandGroupSearch]);

  // Price matrix UI state (mocked)
  type PriceMatrixRow = {
    key: string;
    category: string;
    subcategory: string;
    isFallback: boolean;
    /** Base price for the subcategory (every cell is derived from this) */
    basePrice: number | null;
    /**
     * Optional manual overrides for computed prices, keyed by material then tier.
     * e.g. priceOverrides['leather']['High'] = 1290 (demo)
     */
    priceOverrides?: Partial<
      Record<
        PriceForkTestItem['material'],
        Partial<Record<PriceForkTestItem['brandTier'], number>>
      >
    >;
    /**
     * Per-subcategory material weight overrides (e.g. materialWeights['leather'] = 2).
     * Applies across all brand-group tiers for this subcategory. When absent for a
     * material, the global calibration weight is used.
     */
    materialWeights?: Partial<Record<PriceForkTestItem['material'], number>>;
  };

  const sekPricePoints = useMemo(() => {
    const pts = getSekPriceOptions(partnerId, selectedBrandName);
    return pts.length ? pts : getSekPriceOptions(partnerId);
  }, [partnerId, selectedBrandName]);

  const seedMatrixRows = useMemo<PriceMatrixRow[]>(() => {
    const categoryKey = getMasterCategoryKeyFromBrandName(selectedBrandName);
    const byCategory = MASTER_VALUES_DEMO.categoriesByBrand[categoryKey];

    const rows: PriceMatrixRow[] = [];
    Object.entries(byCategory).forEach(([category, subcategories]) => {
      subcategories.forEach((subcategory) => {
        const key = `${category}::${subcategory}`;
        rows.push({
          key,
          category,
          subcategory,
          isFallback: false,
          basePrice: null
        });
      });
    });

    // Safety fallback (shouldn't happen in demo, but avoids empty matrix if data changes)
    if (rows.length === 0) {
      const uniq = new Map<string, { category: string; subcategory: string }>();
      mockPriceForkTestItems.forEach((it) => {
        const category = it.category || it.partnerCategory || 'Other';
        const subcategory = (it as any).subcategory || it.partnerCategory || 'Other';
        const key = `${category}::${subcategory}`;
        if (!uniq.has(key)) uniq.set(key, { category, subcategory });
      });
      return Array.from(uniq.entries()).map(([key, v]) => ({
        key,
        category: v.category,
        subcategory: v.subcategory,
        isFallback: false,
        basePrice: null
      }));
    }

    return rows;
  }, [selectedBrandName]);

  const [priceMatrixRows, setPriceMatrixRows] = useState<PriceMatrixRow[]>(seedMatrixRows);
  const [lastSavedPriceMatrixRows, setLastSavedPriceMatrixRows] = useState<PriceMatrixRow[]>(seedMatrixRows);
  const [priceMatrixSearch, setPriceMatrixSearch] = useState('');
  const [pasteAnnotations, setPasteAnnotations] = useState<Map<string, PendingCell> | null>(null);
  // When the global material weights change AND the matrix has per-sub-category
  // weight overrides, Save opens this dialog to ask how to reconcile the two.
  const [showWeightReconcile, setShowWeightReconcile] = useState(false);

  useEffect(() => {
    setPriceMatrixRows(seedMatrixRows);
    setLastSavedPriceMatrixRows(seedMatrixRows);
    setPasteAnnotations(null);
  }, [seedMatrixRows]);

  const filteredPriceMatrixRows = useMemo(() => {
    const q = priceMatrixSearch.trim().toLowerCase();
    return priceMatrixRows
      .filter((r) =>
        q ? `${r.category} ${r.subcategory}`.toLowerCase().includes(q) : true
      );
  }, [priceMatrixRows, priceMatrixSearch]);

  // Paste targets the brand-group (Standard) row only — material rows are derived from
  // it via material weight, so they aren't editable. The paste grid is therefore one row
  // per visible sub-category (material fixed to 'other'), columns = tiers.
  const matrixGridRows = useMemo(
    () =>
      filteredPriceMatrixRows.map((row) => ({
        rowKey: row.key,
        material: 'other' as MatrixMaterial
      })),
    [filteredPriceMatrixRows]
  );

  const writeMatrixOverride = (rowKey: string, m: MatrixMaterial, t: MatrixTier, n: number) => {
    setPriceMatrixRows((prev) =>
      prev.map((r) => {
        if (r.key !== rowKey) return r;
        const matOv = { ...(r.priceOverrides?.[m] ?? {}) };
        matOv[t] = n;
        const next = { ...(r.priceOverrides ?? {}) };
        next[m] = matOv;
        return { ...r, priceOverrides: next };
      })
    );
  };

  const clearMatrixOverride = (rowKey: string, m: MatrixMaterial, t: MatrixTier) => {
    setPriceMatrixRows((prev) =>
      prev.map((r) => {
        if (r.key !== rowKey) return r;
        const matOv = { ...(r.priceOverrides?.[m] ?? {}) };
        delete matOv[t];
        const next = { ...(r.priceOverrides ?? {}) };
        if (Object.keys(matOv).length) next[m] = matOv;
        else delete next[m];
        return { ...r, priceOverrides: Object.keys(next).length ? next : undefined };
      })
    );
  };

  const setMatrixBasePrice = (rowKey: string, n: number) => {
    setPriceMatrixRows((prev) => prev.map((r) => (r.key === rowKey ? { ...r, basePrice: n } : r)));
  };

  // Set (or clear) the per-subcategory material weight. Clamped to the x1–x5 range used
  // in the Calibration tab. Passing null removes the override (revert to global weight).
  const setMatrixMaterialWeight = (rowKey: string, m: MatrixMaterial, weight: number | null) => {
    setPriceMatrixRows((prev) =>
      prev.map((r) => {
        if (r.key !== rowKey) return r;
        const next = { ...(r.materialWeights ?? {}) };
        if (weight == null) {
          delete next[m];
        } else {
          next[m] = Math.min(5, Math.max(1, weight));
        }
        return { ...r, materialWeights: Object.keys(next).length ? next : undefined };
      })
    );
  };

  // Immediately commit a clipboard paste into priceMatrixRows and store annotations so
  // cells can show "Pasted" / "Snapped from N" captions. Paste only fires from a
  // brand-group (Standard) price cell; the block spreads right across tiers and down
  // across sub-categories (one grid row per sub-category).
  const handleMatrixPaste =
    (rowKey: string, tier: MatrixTier) =>
    (e: ClipboardEvent) => {
      const grid = parseClipboardGrid(e.clipboardData?.getData('text') ?? '');
      if (!grid.length) return;
      const subIdx = filteredPriceMatrixRows.findIndex((x) => x.key === rowKey);
      if (subIdx < 0) return;
      const anchor = { r: subIdx, c: MATRIX_TIERS.indexOf(tier) };
      const next = buildPendingFromPaste(grid, anchor, matrixGridRows, MATRIX_TIERS, sekPricePoints);
      if (!next.size) return;

      // Immediately write values to priceMatrixRows (no preview/confirm step).
      const byRow = new Map<string, PendingCell[]>();
      next.forEach((pc) => {
        const arr = byRow.get(pc.rowKey) ?? [];
        arr.push(pc);
        byRow.set(pc.rowKey, arr);
      });
      setPriceMatrixRows((prev) =>
        prev.map((r) => {
          const cells = byRow.get(r.key);
          if (!cells) return r;
          let basePrice = r.basePrice;
          const overrides = { ...(r.priceOverrides ?? {}) };
          cells.forEach((pc) => {
            if (pc.material === 'other' && pc.tier === 'Low') {
              basePrice = pc.snapped;
            } else {
              const matOv = { ...(overrides[pc.material] ?? {}) };
              matOv[pc.tier] = pc.snapped;
              overrides[pc.material] = matOv;
            }
          });
          return { ...r, basePrice, priceOverrides: Object.keys(overrides).length ? overrides : undefined };
        })
      );

      // Store annotations so cells can display "Pasted" / "Snapped from N" below the price.
      setPasteAnnotations((prev) => {
        const merged = new Map(prev ?? []);
        next.forEach((pc, k) => merged.set(k, pc));
        return merged;
      });
    };

  // Handle brand change
  const handleBrandChange = (brandId: string) => {
    setSelectedBrandId(brandId);
    // Initialize calibration state for new brand if it doesn't exist
    if (!calibrationStates[brandId]) {
      setCalibrationStates(prev => ({
        ...prev,
        [brandId]: { ...priceForkDefaultState }
      }));
      setLastSavedStates(prev => ({
        ...prev,
        [brandId]: { ...priceForkDefaultState }
      }));
    }
  };
  const [testItems, setTestItems] = useState<PriceForkTestItem[]>(() =>
    mockPriceForkTestItems.map((item) => {
      const pricePoints = getSekPriceOptions(partnerId, item.brand);
      const snapped = snapToNearestPricePoint(
        item.aiSuggestedPrice,
        pricePoints.length > 0 ? pricePoints : [item.aiSuggestedPrice]
      );
      return {
        ...item,
        aiSuggestedPrice: snapped
      };
    })
  );
  const [isTesting, setIsTesting] = useState(false);
  const [activePrompt, setActivePrompt] = useState<PriceForkInsightPrompt['id'] | null>('brand-groups');

  const hasUnsavedChanges = useMemo(() => {
    return (
      JSON.stringify(calibrationState) !== JSON.stringify(lastSavedState) ||
      priceMatrixRows !== lastSavedPriceMatrixRows ||
      brandGroupOverrides !== lastSavedBrandGroupOverrides
    );
  }, [calibrationState, lastSavedState, priceMatrixRows, lastSavedPriceMatrixRows, brandGroupOverrides, lastSavedBrandGroupOverrides]);

  const handleParameterChange = (id: string, value: number | string | boolean) => {
    setCalibrationStates((prev) => ({
      ...prev,
      [selectedBrandId]: {
        ...(prev[selectedBrandId] || { ...priceForkDefaultState }),
        [id]: value
      }
    }));
  };

  const getMaterialWeightFromState = useCallback(
    (state: PriceForkCalibrationState, material: PriceForkTestItem['material']) => {
      // Material weights are capped at x5 (the slider max in the Calibration tab).
      const clampMultiplier = (n: number) => Math.min(5, Math.max(1, n));
      if (material === 'leather') {
        return clampMultiplier(Number(state.materialLeatherWeight ?? priceForkDefaultState.materialLeatherWeight));
      }
      if (material === 'silk') {
        return clampMultiplier(Number(state.materialSilkWeight ?? priceForkDefaultState.materialSilkWeight));
      }
      if (material === 'suede') {
        return clampMultiplier(Number(state.materialSuedeWeight ?? priceForkDefaultState.materialSuedeWeight));
      }
      if (material === 'cashmere') {
        return clampMultiplier(Number(state.materialCashmereWeight ?? priceForkDefaultState.materialCashmereWeight ?? 1));
      }
      return 1;
    },
    []
  );

  const getTierWeightFromState = useCallback((state: PriceForkCalibrationState, tier: PriceForkTestItem['brandTier']) => {
    const clampMultiplier = (n: number) => Math.min(30, Math.max(1, n));
    switch (tier) {
      case 'Premium':
        return clampMultiplier(Number(state.tierPremiumWeight ?? priceForkDefaultState.tierPremiumWeight));
      case 'High':
        return clampMultiplier(Number(state.tierHighWeight ?? priceForkDefaultState.tierHighWeight));
      case 'Mid':
        return clampMultiplier(Number(state.tierMidWeight ?? priceForkDefaultState.tierMidWeight));
      case 'Low':
        // Low is always the base price in the matrix.
        return 1;
      default:
        return 1.0;
    }
  }, []);

  const getPricePointsForItem = useCallback(
    (item: PriceForkTestItem) => {
      const points = getSekPriceOptions(partnerId, item.brand);
      if (points.length) {
        return points;
      }

      const baseline = Math.max(item.purchasePrice * 1.4, item.aiSuggestedPrice);
      const step = 10;
      return Array.from({ length: 8 }, (_, idx) => Math.round(baseline + step * idx));
    },
    [partnerId]
  );

  // True when any of the four global material weights differs from the last save.
  const materialWeightsChanged = () =>
    MATRIX_MATERIALS.some(
      (mat) =>
        mat.key !== 'other' &&
        getMaterialWeightFromState(calibrationState, mat.key) !==
          getMaterialWeightFromState(lastSavedState, mat.key)
    );

  // Sub-categories that carry their own per-row material-weight override(s).
  const perRowWeightRows = priceMatrixRows.filter(
    (r) => r.materialWeights && Object.keys(r.materialWeights).length > 0
  );

  const commitSave = (rows: PriceMatrixRow[] = priceMatrixRows) => {
    setLastSavedStates((prev) => ({
      ...prev,
      [selectedBrandId]: { ...calibrationState }
    }));
    setPriceMatrixRows(rows);
    setLastSavedPriceMatrixRows(rows);
    setLastSavedBrandGroupOverrides(brandGroupOverrides);
    onSaveCalibration?.(selectedBrandId, calibrationState);
    setShowWeightReconcile(false);
  };

  const handleSave = () => {
    // Only interrupt when a global weight changed AND the matrix has per-row
    // weights that would otherwise shadow it — there's a real choice to make.
    if (materialWeightsChanged() && perRowWeightRows.length > 0) {
      setShowWeightReconcile(true);
      return;
    }
    commitSave();
  };

  const handleRunSimulation = () => {
    setIsTesting(true);
    const selected = pickRandomSubset(mockPriceForkTestItems, 5).map((item) => {
      const pricePoints = getSekPriceOptions(partnerId, item.brand);
      const snapped = snapToNearestPricePoint(
        item.aiSuggestedPrice,
        pricePoints.length > 0 ? pricePoints : [item.aiSuggestedPrice]
      );
      return {
        ...item,
        aiSuggestedPrice: snapped,
        manualOverridePrice: undefined,
        status: 'pending'
      };
    });
    // Simulate latency for the UX; in production hook up to API
    window.setTimeout(() => {
      setTestItems(
        selected.map((item) => {
          const tierWeight = getTierWeightFromState(calibrationState, item.brandTier);
          const materialWeight = getMaterialWeightFromState(calibrationState, item.material);
          const candidatePrice = item.aiSuggestedPrice * tierWeight * materialWeight;
          const pricePoints = getPricePointsForItem(item);
          const snappedPrice = snapToNearestPricePoint(candidatePrice, pricePoints);
          return {
            ...item,
            aiSuggestedPrice: snappedPrice,
            manualOverridePrice: undefined,
            status: 'pending'
          };
        })
      );
      setIsTesting(false);
    }, 700);
  };

  const activeInsight = useMemo(() => {
    if (!activePrompt) return null;
    if (activePrompt === 'brand-groups') {
      return (
        <div className="space-y-4">
          {mockBrandSegments.map((segment) => (
            <Card key={segment.tier} className="bg-surface border border-outline-variant">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="title-medium text-on-surface">{segment.tier} Brands</CardTitle>
                    <CardDescription className="body-small text-on-surface-variant">
                      {segment.description}
                    </CardDescription>
                  </div>
                  <Badge
                    variant="secondary"
                    className={cn(
                      'rounded-lg',
                      segment.tier === 'Premium'
                        ? 'bg-primary-container text-on-primary-container'
                        : segment.tier === 'Mid'
                        ? 'bg-secondary-container text-on-secondary-container'
                        : 'bg-tertiary-container text-on-tertiary-container'
                    )}
                  >
                    Tier
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-outline-variant/60">
                      <TableHead className="w-[40%] text-on-surface-variant">Brand</TableHead>
                      <TableHead className="text-on-surface-variant">Sell-through</TableHead>
                      <TableHead className="text-on-surface-variant">Uplift vs base</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {segment.brands.map((brand) => (
                      <TableRow key={brand.name} className="border-outline-variant/40">
                        <TableCell className="body-medium">{brand.name}</TableCell>
                        <TableCell className="body-medium">{brand.avgSellThrough}%</TableCell>
                        <TableCell className={cn('body-medium', brand.upliftVsBase >= 0 ? 'text-primary' : 'text-error')}>
                          {brand.upliftVsBase >= 0 ? '+' : ''}
                          {brand.upliftVsBase}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (activePrompt === 'category-mapping') {
      return (
        <Card className="bg-surface border border-outline-variant">
          <CardHeader>
            <CardTitle className="title-medium text-on-surface">Category mapping confidence</CardTitle>
            <CardDescription className="body-small text-on-surface-variant">
              Partner to retailer category translations with sample sizes and uplift impact.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-outline-variant/60">
                  <TableHead className="w-[25%] text-on-surface-variant">Partner category</TableHead>
                  <TableHead className="w-[35%] text-on-surface-variant">Retailer mapping</TableHead>
                  <TableHead className="text-on-surface-variant">Confidence</TableHead>
                  <TableHead className="text-on-surface-variant">Avg uplift</TableHead>
                  <TableHead className="text-on-surface-variant">Sample size</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockCategoryMappings.map((mapping) => {
                  const { badgeClass } = getConfidenceStyles(mapping.confidence);
                  return (
                    <TableRow key={mapping.partnerCategory} className="border-outline-variant/40">
                      <TableCell className="body-medium">{mapping.partnerCategory}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="body-medium text-on-surface">{mapping.retailerCategory}</span>
                          <span className="body-small text-on-surface-variant">
                            Alignment score: {(mapping.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn('rounded-lg px-3 py-1 body-small font-medium', badgeClass)}>
                          {(mapping.confidence * 100).toFixed(0)}%
                        </Badge>
                      </TableCell>
                      <TableCell className={cn('body-medium', mapping.avgUplift >= 0 ? 'text-primary' : 'text-error')}>
                        {mapping.avgUplift >= 0 ? '+' : ''}
                        {(mapping.avgUplift * 100).toFixed(0)}%
                      </TableCell>
                      <TableCell className="body-medium">{mapping.sampleSize}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      );
    }

    if (activePrompt === 'pricing-logic') {
      return (
        <Card className="bg-surface border border-outline-variant">
          <CardHeader>
            <CardTitle className="title-medium text-on-surface">Pricing engine narrative</CardTitle>
            <CardDescription className="body-small text-on-surface-variant">
              Detailed explanation of how the AI composed the current recommendation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {pricingLogicNarrative.map((step, index) => (
              <div key={step} className="flex gap-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container font-semibold">
                  {index + 1}
                </div>
                <p className="body-medium text-on-surface">{step}</p>
              </div>
            ))}
            <div className="rounded-xl border border-outline-dim bg-surface p-4">
              <div className="flex items-center gap-3">
                <Wand2 className="w-5 h-5 text-primary" />
                <div>
                  <div className="title-small text-on-surface">Next calibration checkpoints</div>
                  <p className="body-small text-on-surface-variant">
                    Validate markdown cadence after 21 days, then compare uplift vs. floor margin for premium brands.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return null;
  }, [activePrompt]);

  return (
    <div className="min-h-screen bg-surface">
      {/* Save-time reconciliation: global material weights changed while the matrix
          carries per-sub-category weight overrides. Ask how to apply the change. */}
      <Dialog open={showWeightReconcile} onOpenChange={setShowWeightReconcile}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>You changed the global material weights</DialogTitle>
            <DialogDescription>
              {perRowWeightRows.length === 1
                ? '1 sub-category has a material weight you set manually in the price matrix.'
                : `${perRowWeightRows.length} sub-categories have material weights you set manually in the price matrix.`}{' '}
              Choose how the new global weights should apply to {perRowWeightRows.length === 1 ? 'it' : 'them'}.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <ReconcileChoice
              label="Keep my manual matrix weights"
              description="Sub-categories you customized keep their weight. All others use the new global weights."
              disabled={perRowWeightRows.length === 0}
              onClick={() => commitSave(priceMatrixRows)}
            />
            <ReconcileChoice
              label="Use the new global weights everywhere"
              description="Replaces your manual matrix weights so every sub-category uses the new global weights."
              onClick={() =>
                commitSave(priceMatrixRows.map((r) => ({ ...r, materialWeights: undefined })))
              }
            />
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-col sm:gap-2">
            <Button
              variant="ghost"
              className="w-full rounded-lg"
              onClick={() => setShowWeightReconcile(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Top App Bar */}
      <PortalTopAppBar
        title="Price Fork calibration"
        onBack={onBack}
        actions={
          <>
            {hasUnsavedChanges && (
              <span className="w-2 h-2 bg-primary rounded-full inline-block" aria-label="Unsaved changes" />
            )}
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!hasUnsavedChanges}
              className="rounded-lg"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Save
            </Button>
          </>
        }
      />
      <div className="px-4 md:px-6 py-2 bg-primary-container/20 border-b border-primary/10">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-primary flex-shrink-0" />
          <p className="body-small text-on-surface">
            <span className="font-medium">Applies to API-integrated order creation only.</span> Price Fork automatically sets suggested sales prices for items sourced via API integration. Manual order creation is not affected by these settings.
          </p>
        </div>
      </div>
      {hasUnsavedChanges && (
        <div className="px-4 md:px-6 py-2 bg-warning-container/80 border-b border-warning/20">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 text-warning animate-spin" />
            <p className="body-small text-on-warning-container">
              Unsaved changes. Run tests on updated parameters and save to version the changes.
            </p>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="w-full max-w-none px-4 md:px-6 py-6 space-y-8">
        {/* Brand Selector */}
        <div className="flex items-center gap-4">
          <Label htmlFor="brand-select" className="label-medium text-on-surface">
            Brand:
          </Label>
          <Select value={selectedBrandId} onValueChange={handleBrandChange}>
            <SelectTrigger id="brand-select" className="w-48 bg-surface-container-high border-outline rounded-lg h-[44px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {brands.map((brand) => (
                <SelectItem key={brand.id} value={brand.id}>
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-4">
          {/* Tab styling aligned with other portal tab rows (see side sheets using Tabs) */}
          <TabsList className="grid w-full grid-cols-3 gap-2 bg-transparent p-0 h-auto border-b border-outline-variant">
            <TabsTrigger
              value="calibration"
              className={`relative rounded-lg px-4 py-3 transition-colors ${
                activeTab === 'calibration'
                  ? 'bg-primary-container text-on-primary-container'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <span className="title-small">Calibration</span>
              {activeTab === 'calibration' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
            </TabsTrigger>
            <TabsTrigger
              value="brand-groups"
              className={`relative rounded-lg px-4 py-3 transition-colors ${
                activeTab === 'brand-groups'
                  ? 'bg-primary-container text-on-primary-container'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <span className="title-small">Brand groups</span>
              {activeTab === 'brand-groups' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
            </TabsTrigger>
            <TabsTrigger
              value="price-matrix"
              className={`relative rounded-lg px-4 py-3 transition-colors ${
                activeTab === 'price-matrix'
                  ? 'bg-primary-container text-on-primary-container'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <span className="title-small">Price matrix</span>
              {activeTab === 'price-matrix' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calibration" className="space-y-8">
            <section className="space-y-6">
          <Card className="bg-surface-container-high border border-outline-variant">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="title-medium text-on-surface">Calibration controls</CardTitle>
                <CardDescription className="body-small text-on-surface-variant">
                  Adjust weights and thresholds that guide the AI recommendation engine.
                </CardDescription>
              </div>
              <Badge variant="outline" className="rounded-lg">
                Version 1.4.2
              </Badge>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              {calibrationParameters
                // Keep item-level margin floor, hide order-level for now.
                .filter((parameter) => parameter.id !== 'marginFloorOrder')
                .map((parameter) => {
                const value = calibrationState[parameter.id] ?? priceForkDefaultState[parameter.id as keyof PriceForkCalibrationState];
                const formattedValue = parameter.format ? parameter.format(value as number) : value;
                return (
                  <div
                    key={parameter.id}
                    className="rounded-xl border border-outline-variant/60 bg-surface p-4 space-y-4 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="title-small text-on-surface">{parameter.label}</div>
                        {parameter.description && (
                          <p className="body-small text-on-surface-variant mt-1">{parameter.description}</p>
                        )}
                      </div>
                      <Badge variant="secondary" className="rounded-lg px-3">
                        {formattedValue as string}
                      </Badge>
                    </div>

                    {parameter.type === 'slider' && (
                      <div className="pt-2 space-y-3">
                        <Slider
                          value={[Number(value)]}
                          min={parameter.min}
                          max={parameter.max}
                          step={parameter.step}
                          onValueChange={(vals: number[]) => handleParameterChange(parameter.id, Number(vals[0]))}
                        />
                        <div className="flex justify-between text-label-small text-on-surface-variant">
                          <span>{parameter.min}</span>
                          <span>{parameter.max}</span>
                        </div>
                      </div>
                    )}

                    {parameter.type === 'number' && (
                      <Input
                        type="number"
                        min={parameter.min}
                        max={parameter.max}
                        step={parameter.step}
                        value={Number(value)}
                        onChange={(event) => handleParameterChange(parameter.id, Number(event.target.value))}
                        className="bg-surface-container-high border-outline rounded-lg h-[44px]"
                      />
                    )}
                  </div>
                );
              })}

              <div className="rounded-xl border border-outline-variant/60 bg-surface p-4 md:col-span-2 space-y-4 shadow-xs">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="title-small text-on-surface">Material weights</div>
                    <p className="body-small text-on-surface-variant mt-1">
                      Adjust how strongly each material scales the suggested sales price.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { id: 'materialLeatherWeight', label: 'Leather', value: Number(calibrationState.materialLeatherWeight ?? priceForkDefaultState.materialLeatherWeight) },
                    { id: 'materialSilkWeight', label: 'Silk', value: Number(calibrationState.materialSilkWeight ?? priceForkDefaultState.materialSilkWeight) },
                    { id: 'materialSuedeWeight', label: 'Suede', value: Number(calibrationState.materialSuedeWeight ?? priceForkDefaultState.materialSuedeWeight) },
                    { id: 'materialCashmereWeight', label: 'Cashmere', value: Number(calibrationState.materialCashmereWeight ?? priceForkDefaultState.materialCashmereWeight ?? 1) }
                  ].map((material) => (
                    <div key={material.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="label-medium text-on-surface">{material.label}</span>
                        <Badge variant="outline" className="rounded-lg">
                          {formatWeightLabel(material.value)}
                        </Badge>
                      </div>
                      <Slider
                        value={[material.value]}
                        min={1}
                        max={5}
                        step={0.1}
                        onValueChange={(vals: number[]) => handleParameterChange(material.id, Number(vals[0]))}
                      />
                      <div className="flex justify-between text-label-small text-on-surface-variant">
                        <span>x1.0</span>
                        <span>x5.0</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {SHOW_CALIBRATION_ACTIONS_AND_TEST_ITEMS && (
          <Card className="bg-surface-container-high border border-outline-variant">
            <CardHeader>
              <CardTitle className="title-medium text-on-surface">Calibration actions</CardTitle>
              <CardDescription className="body-small text-on-surface-variant">
                Run simulations or export current parameters for audit.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Button
                onClick={handleRunSimulation}
                disabled={isTesting}
                className="rounded-lg w-full md:max-w-md"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Running tests
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Run calibration on sample items
                  </>
                )}
              </Button>
              <Button variant="ghost" className="rounded-lg justify-start">
                <DownloadCloud className="w-4 h-4 mr-2" />
                Export latest calibration
              </Button>
            </CardContent>
          </Card>
          )}
            </section>

            {SHOW_CALIBRATION_ACTIONS_AND_TEST_ITEMS && (
            <section className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h2 className="title-large text-on-surface mb-1">Test items</h2>
              <p className="body-medium text-on-surface-variant">
                Validate the suggested price vs. margin impact before publishing.
              </p>
            </div>
            <div className="flex items-center gap-2">
            </div>
          </div>
          <Card className="bg-surface border border-outline-variant overflow-hidden">
            <ScrollArea className="w-full" type="scroll">
              <Table>
                <TableHeader>
                  <TableRow className="bg-surface-container border-outline-variant/60">
                    <TableHead className="text-on-surface-variant w-[26rem]">Item</TableHead>
                    <TableHead className="text-on-surface-variant">Purchase</TableHead>
                    <TableHead className="text-on-surface-variant">Suggested price</TableHead>
                    <TableHead className="text-on-surface-variant">Margin</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {testItems.map((item) => {
                    const margin = calcMargin(item.purchasePrice, item.aiSuggestedPrice);
                    return (
                      <TableRow key={item.id} className="border-outline-variant/40">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="w-14 h-14 rounded-lg object-cover border border-outline-variant/60"
                            />
                            <div className="space-y-1">
                              <div className="label-medium text-on-surface">{item.title}</div>
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="outline" className="rounded-lg">
                                  {item.brand}
                                </Badge>
                                <Badge variant="outline" className="rounded-lg text-on-surface-variant">
                                  {item.condition}
                                </Badge>
                                <Badge variant="outline" className="rounded-lg text-on-surface-variant">
                                  Material: {item.material}
                                </Badge>
                                <span className="body-small text-on-surface-variant">
                                  {item.partnerCategory} → {item.category}
                                </span>
                              </div>
                              {item.notes && (
                                <p className="body-small text-on-surface-variant">{item.notes}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="body-medium text-on-surface">
                          {item.purchasePrice.toLocaleString('en-US', { style: 'currency', currency: 'EUR' })}
                        </TableCell>
                        <TableCell className="body-medium text-on-surface">
                          {item.aiSuggestedPrice.toLocaleString('en-US', { style: 'currency', currency: 'EUR' })}
                        </TableCell>
                        <TableCell className={cn('body-medium', margin >= 0 ? 'text-primary' : 'text-error')}>
                          {margin >= 0 ? '+' : ''}
                          {(margin * 100).toFixed(0)}%
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </ScrollArea>
          </Card>
            </section>
            )}

          </TabsContent>

          <TabsContent value="brand-groups" className="space-y-6">
            <Card className="bg-surface border border-outline-variant">
              <CardHeader>
                <CardTitle className="title-medium text-on-surface">Item brand → Brand group mapping</CardTitle>
                <CardDescription className="body-small text-on-surface-variant">
                  Review and override the AI classification for item brands. This affects which price group is used.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search + filter aligned with portal search bars / table filters */}
                <div className="flex flex-col md:flex-row gap-3 md:items-center">
                  <div className="relative w-full md:max-w-2xl">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                      <Search className="w-5 h-5" />
                    </div>
                    <Input
                      value={brandGroupSearch}
                      onChange={(e) => setBrandGroupSearch(e.target.value)}
                      placeholder="Search item brand"
                      className="w-full h-12 pl-10 pr-12 bg-surface-container rounded-lg border border-outline-variant focus:border-primary focus:outline-none text-on-surface body-large"
                    />
                    {brandGroupSearch.trim().length > 0 && (
                      <button
                        type="button"
                        onClick={() => setBrandGroupSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center hover:opacity-70 transition-opacity"
                        aria-label="Clear search"
                      >
                        <X className="w-5 h-5 text-on-surface-variant" />
                      </button>
                    )}
                  </div>
                  <div className="w-full md:w-48">
                    <Select value={brandGroupFilter} onValueChange={(v) => setBrandGroupFilter(v as any)}>
                      <SelectTrigger className="bg-surface-container-high border border-outline rounded-lg min-h-[48px] body-large">
                        <SelectValue placeholder="Brand group" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all" className="min-h-[48px] md:min-h-0 py-3 md:py-1.5 touch-manipulation">All</SelectItem>
                        {PRICE_GROUPS.map((g) => (
                          <SelectItem key={g} value={g} className="min-h-[48px] md:min-h-0 py-3 md:py-1.5 touch-manipulation">
                            {g}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-outline-variant">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-surface-container border-b border-outline-variant">
                        <TableHead className="px-3 py-3 text-left title-small text-on-surface">Item brand</TableHead>
                        <TableHead className="px-3 py-3 text-left title-small text-on-surface">AI brand group</TableHead>
                        <TableHead className="px-3 py-3 text-left title-small text-on-surface">Override</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {brandGroupRows.map((row) => (
                        <TableRow key={row.itemBrand} className="border-outline-variant/40">
                          <TableCell className="body-medium text-on-surface">{row.itemBrand}</TableCell>
                          <TableCell className="body-medium text-on-surface-variant">{row.aiGroup}</TableCell>
                          <TableCell className="w-[320px]">
                            <Select
                              value={row.group}
                              onValueChange={(v) =>
                                setBrandGroupOverrides((prev) => ({ ...prev, [row.itemBrand]: v as any }))
                              }
                            >
                              <SelectTrigger
                                className="w-[300px] min-w-[300px] max-w-[300px] shrink-0 bg-surface-container-high border-outline rounded-lg h-[44px] whitespace-nowrap overflow-hidden"
                                style={{ width: 300, minWidth: 300, maxWidth: 300 }}
                              >
                                <SelectValue className="block w-full whitespace-nowrap overflow-hidden text-ellipsis" />
                              </SelectTrigger>
                              <SelectContent>
                                {PRICE_GROUPS.map((g) => (
                                  <SelectItem key={`${row.itemBrand}-${g}`} value={g}>{g}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                      {brandGroupRows.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={3} className="body-medium text-on-surface-variant py-6">
                            No brands found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="price-matrix" className="space-y-6">
            <Card className="bg-surface border border-outline-variant">
              <CardHeader>
                <CardTitle className="title-medium text-on-surface">Prices per category & brand group</CardTitle>
                <CardDescription className="body-small text-on-surface-variant">
                  Define one SEK ladder price per brand group for each category/sub-category pair for {selectedBrandName || 'this brand'}.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col md:flex-row gap-3 md:items-center">
                  <div className="relative w-full md:max-w-2xl">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                      <Search className="w-5 h-5" />
                    </div>
                    <Input
                      value={priceMatrixSearch}
                      onChange={(e) => setPriceMatrixSearch(e.target.value)}
                      placeholder="Search category / sub-category"
                      className="w-full h-12 pl-10 pr-12 bg-surface-container rounded-lg border border-outline-variant focus:border-primary focus:outline-none text-on-surface body-large"
                    />
                    {priceMatrixSearch.trim().length > 0 && (
                      <button
                        type="button"
                        onClick={() => setPriceMatrixSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center hover:opacity-70 transition-opacity"
                        aria-label="Clear search"
                      >
                        <X className="w-5 h-5 text-on-surface-variant" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="body-small text-on-surface-variant mb-3">
                  Tip: copy a block of prices from Excel or a CSV, click a cell, and paste. Values snap to the nearest valid price automatically.
                </p>

                {/* Fixed-layout table to keep columns aligned with other portal tables */}
                <div className="overflow-x-auto rounded-lg border border-outline-variant bg-surface">
                  <table className="w-full min-w-[1700px] table-fixed border-collapse">
                    <colgroup>
                      <col style={{ width: '14rem' }} />
                      <col style={{ width: '14rem' }} />
                      <col style={{ width: '8rem' }} />
                      <col style={{ width: '11rem' }} />
                      <col style={{ width: '11rem' }} />
                      <col style={{ width: '11rem' }} />
                      <col style={{ width: '11rem' }} />
                      <col style={{ width: '9rem' }} />
                    </colgroup>
                    <thead className="bg-surface-container border-b border-outline-variant">
                      <tr>
                        <th className="px-3 py-3 text-left title-small text-on-surface">Category</th>
                        <th className="px-3 py-3 text-left title-small text-on-surface">Sub-category</th>
                        <th className="px-3 py-3 text-left title-small text-on-surface">Material</th>
                        <th className="px-3 py-3 text-left title-small text-on-surface">Base price (Low)</th>
                        <th className="px-3 py-3 text-left title-small text-on-surface">Mid</th>
                        <th className="px-3 py-3 text-left title-small text-on-surface">High</th>
                        <th className="px-3 py-3 text-left title-small text-on-surface">Premium</th>
                        <th className="px-3 py-3 text-right title-small text-on-surface">Reset</th>
                      </tr>
                    </thead>
                    {filteredPriceMatrixRows.map((row) => {
                      const hasOverrides =
                        (!!row.priceOverrides && Object.keys(row.priceOverrides).length > 0) ||
                        (!!row.materialWeights && Object.keys(row.materialWeights).length > 0);
                      return (
                        <tbody
                          key={row.key}
                          className="border-b-2 border-outline-variant last:border-b-0"
                        >
                          {MATRIX_MATERIALS.map((mat, matIdx) => {
                            const isStandard = mat.key === 'other';
                            // Material weight applies across all brand-group tiers for this
                            // sub-category. Falls back to the global calibration weight.
                            const effectiveMaterialWeight = isStandard
                              ? 1
                              : (row.materialWeights?.[mat.key] ?? getMaterialWeightFromState(lastSavedState, mat.key));
                            const cellPad = isStandard ? 'py-3' : 'py-1.5';
                            return (
                              <tr
                                key={`${row.key}-${mat.key}`}
                                className={cn(
                                  'hover:bg-surface-container/40 transition-colors',
                                  matIdx > 0 && 'border-t border-outline-variant/30'
                                )}
                              >
                                {matIdx === 0 && (
                                  <td
                                    rowSpan={MATRIX_MATERIALS.length}
                                    className="px-3 py-3 body-medium text-on-surface align-top border-r border-outline-variant/40"
                                  >
                                    <div className="flex items-center gap-2">
                                      {row.category}
                                      {row.isFallback && (
                                        <Badge variant="outline" className="rounded-lg text-on-surface-variant">Fallback</Badge>
                                      )}
                                    </div>
                                  </td>
                                )}
                                {matIdx === 0 && (
                                  <td
                                    rowSpan={MATRIX_MATERIALS.length}
                                    className="px-3 py-3 body-medium text-on-surface align-top border-r border-outline-variant/40"
                                  >
                                    {row.subcategory}
                                  </td>
                                )}

                                {/* Material label + (material rows) editable weight */}
                                <td className={cn('px-3 align-top', cellPad)}>
                                  <div className="label-medium text-on-surface">{mat.label}</div>
                                  {isStandard ? (
                                    <div className="body-small text-on-surface-variant mt-0.5">Base ×1.00</div>
                                  ) : (
                                    <MaterialWeightInput
                                      weight={effectiveMaterialWeight}
                                      disabled={false}
                                      onCommit={(w) => setMatrixMaterialWeight(row.key, mat.key, w)}
                                    />
                                  )}
                                </td>

                                {/* Tier cells: Base price (Low, on Standard) / Mid / High / Premium */}
                                {MATRIX_TIERS.map((tier) => {
                                  const isBaseCell = isStandard && tier === 'Low';

                                  if (isBaseCell) {
                                    const baseAnnotation = pasteAnnotations?.get(pkey(row.key, mat.key, tier));
                                    return (
                                      <td key={`${row.key}-${mat.key}-${tier}`} className={cn('px-3 align-top', cellPad)}>
                                        <MatrixPriceCell
                                          value={row.basePrice}
                                          suggested={null}
                                          isBase
                                          pricePoints={sekPricePoints}
                                          pending={baseAnnotation}
                                          disabled={false}
                                          triggerWidthClass="w-[150px]"
                                          onPickLadder={(n) => setMatrixBasePrice(row.key, n)}
                                          onCommitTyped={(n) => setMatrixBasePrice(row.key, n)}
                                          onPasteCapture={handleMatrixPaste(row.key, tier)}
                                        />
                                        {baseAnnotation && (
                                          <div className="body-small text-on-surface-variant mt-1">
                                            {baseAnnotation.changed ? `Snapped from ${baseAnnotation.raw}` : 'Pasted'}
                                          </div>
                                        )}
                                      </td>
                                    );
                                  }

                                  const pts = sekPricePoints.length
                                    ? sekPricePoints
                                    : (row.basePrice != null ? [row.basePrice] : []);
                                  // Brand-group price for this tier: Base price for Low, otherwise the
                                  // directly-entered price (set via dropdown or paste — no tier-weight derivation).
                                  const currentOverridePrice = row.priceOverrides?.['other']?.[tier];
                                  const brandGroupPrice = tier === 'Low'
                                    ? row.basePrice
                                    : (currentOverridePrice ?? null);
                                  const cellAnnotation = pasteAnnotations?.get(pkey(row.key, 'other', tier));
                                  if (isStandard) {
                                    return (
                                      <td key={`${row.key}-${mat.key}-${tier}`} className={cn('px-3 align-top', cellPad)}>
                                        <MatrixPriceCell
                                          value={currentOverridePrice ?? null}
                                          suggested={null}
                                          isBase={false}
                                          pricePoints={sekPricePoints}
                                          pending={cellAnnotation}
                                          disabled={false}
                                          triggerWidthClass="w-[150px]"
                                          onPickLadder={(n) => writeMatrixOverride(row.key, 'other', tier, n)}
                                          onClearToSuggested={() => clearMatrixOverride(row.key, 'other', tier)}
                                          onCommitTyped={(n) => writeMatrixOverride(row.key, 'other', tier, n)}
                                          onPasteCapture={handleMatrixPaste(row.key, tier)}
                                        />
                                        {cellAnnotation && (
                                          <div className="body-small text-on-surface-variant mt-1">
                                            {cellAnnotation.changed ? `Snapped from ${cellAnnotation.raw}` : 'Pasted'}
                                          </div>
                                        )}
                                      </td>
                                    );
                                  }

                                  // Material row: read-only derived price = brand-group price × material weight.
                                  const derivedPrice = brandGroupPrice == null
                                    ? null
                                    : snapToNearestPricePoint(brandGroupPrice * effectiveMaterialWeight, pts);
                                  return (
                                    <td key={`${row.key}-${mat.key}-${tier}`} className={cn('px-3 align-top', cellPad)}>
                                      <div className="flex items-center w-[150px] min-h-[40px] px-3 rounded-lg border border-outline-variant bg-surface-container/40 text-sm text-on-surface-variant">
                                        {derivedPrice != null ? `${derivedPrice} SEK` : '—'}
                                      </div>
                                    </td>
                                  );
                                })}

                                {matIdx === 0 && (
                                  <td
                                    rowSpan={MATRIX_MATERIALS.length}
                                    className="px-3 py-3 align-top text-right border-l border-outline-variant/40"
                                  >
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="rounded-lg px-2"
                                      disabled={!hasOverrides}
                                      onClick={() => {
                                        setPriceMatrixRows((prev) =>
                                          prev.map((r) =>
                                            r.key === row.key
                                              ? { ...r, priceOverrides: undefined, materialWeights: undefined }
                                              : r
                                          )
                                        );
                                      }}
                                    >
                                      Reset prices
                                    </Button>
                                  </td>
                                )}
                              </tr>
                            );
                          })}
                        </tbody>
                      );
                    })}
                    {filteredPriceMatrixRows.length === 0 && (
                      <tbody>
                        <tr>
                          <td colSpan={8} className="px-3 py-6 body-medium text-on-surface-variant">
                            No categories found.
                          </td>
                        </tr>
                      </tbody>
                    )}
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}


