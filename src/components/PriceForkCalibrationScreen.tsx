import { useCallback, useMemo, useState } from 'react';
import {
  brandTierWeights,
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
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ArrowLeft, Brain, DownloadCloud, FileText, Info, Loader2, RefreshCw, Sparkles, UploadCloud, Wand2, XCircle, Search, X } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'calibration' | 'brand-groups' | 'price-matrix' | 'fallback-rule'>('calibration');
  
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
    'Haute couture',
    'Premium',
    'High',
    'Mid',
    'Low',
    'Strategic low',
  ];

  // Brand → group (AI mapping) UI state (mocked)
  const [brandGroupOverrides, setBrandGroupOverrides] = useState<Record<string, PriceForkTestItem['brandTier']>>({});
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
    /** Base price = Strategic low group price */
    basePrice: number | null;
  };

  const sekPricePoints = useMemo(() => {
    const pts = getSekPriceOptions(partnerId, selectedBrandName);
    return pts.length ? pts : getSekPriceOptions(partnerId);
  }, [partnerId, selectedBrandName]);

  const seedMatrixRows = useMemo<PriceMatrixRow[]>(() => {
    const uniq = new Map<string, { category: string; subcategory: string }>();
    mockPriceForkTestItems.forEach((it) => {
      const category = it.category || it.partnerCategory || 'Other';
      const subcategory = it.subcategory || it.partnerCategory || 'Other';
      const key = `${category}::${subcategory}`;
      if (!uniq.has(key)) uniq.set(key, { category, subcategory });
    });
    return Array.from(uniq.entries()).map(([key, v]) => ({
      key,
      category: v.category,
      subcategory: v.subcategory,
      isFallback: false,
      basePrice: null,
    }));
  }, []);

  const [priceMatrixRows, setPriceMatrixRows] = useState<PriceMatrixRow[]>(seedMatrixRows);
  const [priceMatrixSearch, setPriceMatrixSearch] = useState('');

  // Fallback candidates = low-confidence category mappings (mocked)
  const fallbackCandidates = useMemo(() => {
    return mockCategoryMappings
      .filter((m) => m.confidence < 0.7)
      .map((m) => ({
        key: `${m.partnerCategory}::${m.retailerCategory}`,
        category: m.retailerCategory,
        sourceLabel: m.partnerCategory,
        confidence: m.confidence,
      }));
  }, []);

  const [fallbackSourceLabelDraft, setFallbackSourceLabelDraft] = useState<Record<string, string>>({});

  const filteredPriceMatrixRows = useMemo(() => {
    const q = priceMatrixSearch.trim().toLowerCase();
    return priceMatrixRows
      .filter((r) =>
        q ? `${r.category} ${r.subcategory}`.toLowerCase().includes(q) : true
      );
  }, [priceMatrixRows, priceMatrixSearch]);

  // Fallback rule UI state
  const [fallbackMultiplier, setFallbackMultiplier] = useState<number>(2.5);

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
    return JSON.stringify(calibrationState) !== JSON.stringify(lastSavedState);
  }, [calibrationState, lastSavedState]);

  const handleParameterChange = (id: string, value: number | string | boolean) => {
    setCalibrationStates((prev) => ({
      ...prev,
      [selectedBrandId]: {
        ...(prev[selectedBrandId] || { ...priceForkDefaultState }),
        [id]: value
      }
    }));
  };

  const getMaterialWeight = useCallback(
    (material: PriceForkTestItem['material']) => {
      if (material === 'leather') {
        return Number(calibrationState.materialLeatherWeight ?? priceForkDefaultState.materialLeatherWeight);
      }
      if (material === 'silk') {
        return Number(calibrationState.materialSilkWeight ?? priceForkDefaultState.materialSilkWeight);
      }
      if (material === 'suede') {
        return Number(calibrationState.materialSuedeWeight ?? priceForkDefaultState.materialSuedeWeight);
      }
      return 1;
    },
    [calibrationState]
  );

  const getTierWeight = useCallback(
    (tier: PriceForkTestItem['brandTier']) => {
      switch (tier) {
        case 'Haute couture':
          return Number(calibrationState.tierHauteCoutureWeight ?? priceForkDefaultState.tierHauteCoutureWeight);
        case 'Premium':
          return Number(calibrationState.tierPremiumWeight ?? priceForkDefaultState.tierPremiumWeight);
        case 'High':
          return Number(calibrationState.tierHighWeight ?? priceForkDefaultState.tierHighWeight);
        case 'Mid':
          return Number(calibrationState.tierMidWeight ?? priceForkDefaultState.tierMidWeight);
        case 'Low':
          return Number(calibrationState.tierLowWeight ?? priceForkDefaultState.tierLowWeight);
        case 'Strategic low':
          return Number(calibrationState.tierStrategicLowWeight ?? priceForkDefaultState.tierStrategicLowWeight);
        default:
          return 1.0;
      }
    },
    [calibrationState]
  );

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

  const handleReset = () => {
    setCalibrationStates((prev) => ({
      ...prev,
      [selectedBrandId]: { ...priceForkDefaultState }
    }));
    setTestItems((prev) =>
      prev.map((item) => {
        const pricePoints = getPricePointsForItem(item);
        const snapped = snapToNearestPricePoint(item.aiSuggestedPrice, pricePoints);
        return {
          ...item,
          aiSuggestedPrice: snapped,
          manualOverridePrice: undefined,
          status: 'pending'
        };
      })
    );
  };

  const handleSave = () => {
    setLastSavedStates((prev) => ({
      ...prev,
      [selectedBrandId]: { ...calibrationState }
    }));
    onSaveCalibration?.(selectedBrandId, calibrationState);
  };

  const handleAcceptItem = (id: string) => {
    setTestItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: 'accepted',
              manualOverridePrice: item.aiSuggestedPrice
            }
          : item
      )
    );
  };

  const handleRejectItem = (id: string) => {
    setTestItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: 'rejected'
            }
          : item
      )
    );
  };

  const handleOverridePrice = (id: string, value: number | undefined) => {
    setTestItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              manualOverridePrice: value,
              status: 'pending'
            }
          : item
      )
    );
  };

  const handleRunSimulation = () => {
    setIsTesting(true);
    // Simulate latency for the UX; in production hook up to API
    window.setTimeout(() => {
      setTestItems((prev) =>
        prev.map((item) => {
          const tierWeight = getTierWeight(item.brandTier);
          const materialWeight = getMaterialWeight(item.material);

          const candidatePrice = item.aiSuggestedPrice * tierWeight * materialWeight;
          const pricePoints = getPricePointsForItem(item);
          const snappedPrice = snapToNearestPricePoint(candidatePrice, pricePoints);

          return {
            ...item,
            aiSuggestedPrice: snappedPrice,
            manualOverridePrice: item.status === 'accepted' ? snappedPrice : item.manualOverridePrice,
            aiConfidence: item.aiConfidence,
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
      {/* Top App Bar */}
      <div className="sticky top-0 z-10 bg-surface border-b border-outline-variant">
        <div className="flex items-center h-16 px-4 md:px-6">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-full hover:bg-surface-container-high transition-colors mr-2"
            aria-label="Back"
          >
            <ArrowLeft className="h-6 w-6 text-on-surface-variant" />
          </button>
          <div className="flex-1">
            <h1 className="title-large text-on-surface">
              Price Fork calibration
              {hasUnsavedChanges && (
                <span className="ml-2 w-2 h-2 bg-primary rounded-full inline-block" />
              )}
            </h1>
            <p className="body-small text-on-surface-variant">
              Configure AI pricing parameters per brand. Tune the AI engine, test on real inventory, and surface insights before publishing changes to partners.
            </p>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={!hasUnsavedChanges}
              className="rounded-lg"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!hasUnsavedChanges}
              className="rounded-lg"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
        <div className="px-4 md:px-6 py-2 bg-primary-container/20 border-t border-primary/10">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-primary flex-shrink-0" />
            <p className="body-small text-on-surface">
              <span className="font-medium">Applies to API-integrated order creation only.</span> Price Fork automatically sets suggested sales prices for items sourced via API integration. Manual order creation is not affected by these settings.
            </p>
          </div>
        </div>
        {hasUnsavedChanges && (
          <div className="px-4 md:px-6 py-2 bg-warning-container/80 border-t border-warning/20">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-warning animate-spin" />
              <p className="body-small text-on-warning-container">
                Unsaved changes. Run tests on updated parameters and save to version the changes.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-8">
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
          <TabsList className="grid w-full grid-cols-4 gap-2 bg-transparent p-0 h-auto border-b border-outline-variant">
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
            <TabsTrigger
              value="fallback-rule"
              className={`relative rounded-lg px-4 py-3 transition-colors ${
                activeTab === 'fallback-rule'
                  ? 'bg-primary-container text-on-primary-container'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <span className="title-small">Fallback rule</span>
              {activeTab === 'fallback-rule' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
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
                .filter((parameter) => !parameter.id.toLowerCase().includes('marginfloor'))
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
                    <div className="title-small text-on-surface">Brand tier weights</div>
                    <p className="body-small text-on-surface-variant mt-1">
                      Adjust how strongly each brand tier influences the suggested price.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {brandTierWeights.map((tier) => {
                    const value = calibrationState[tier.id] ?? priceForkDefaultState[tier.id as keyof PriceForkCalibrationState];
                    const formattedValue = formatWeightLabel(Number(value));
                    return (
                      <div key={tier.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="label-medium text-on-surface">{tier.label}</span>
                          <Badge variant="outline" className="rounded-lg">
                            {formattedValue as string}
                          </Badge>
                        </div>
                        <Slider
                          value={[Number(value)]}
                          min={1}
                          max={5}
                          step={0.1}
                          onValueChange={(vals: number[]) => handleParameterChange(tier.id, Number(vals[0]))}
                        />
                        <div className="flex justify-between text-label-small text-on-surface-variant">
                          <span>x1.0</span>
                          <span>x5.0</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-xl border border-outline-variant/60 bg-surface p-4 md:col-span-2 space-y-4 shadow-xs">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="title-small text-on-surface">Material weights</div>
                    <p className="body-small text-on-surface-variant mt-1">
                      Adjust how strongly each material scales the suggested sales price.
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  {[
                    { id: 'materialLeatherWeight', label: 'Leather', value: Number(calibrationState.materialLeatherWeight ?? priceForkDefaultState.materialLeatherWeight) },
                    { id: 'materialSilkWeight', label: 'Silk', value: Number(calibrationState.materialSilkWeight ?? priceForkDefaultState.materialSilkWeight) },
                    { id: 'materialSuedeWeight', label: 'Suede', value: Number(calibrationState.materialSuedeWeight ?? priceForkDefaultState.materialSuedeWeight) }
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
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

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
                className="rounded-lg"
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
              <Button variant="outline" className="rounded-lg">
                <UploadCloud className="w-4 h-4 mr-2" />
                Upload sample set (.csv)
              </Button>
              <Button variant="ghost" className="rounded-lg justify-start">
                <DownloadCloud className="w-4 h-4 mr-2" />
                Export latest calibration
              </Button>
            </CardContent>
          </Card>
            </section>

            <section className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h2 className="title-large text-on-surface mb-1">Test items</h2>
              <p className="body-medium text-on-surface-variant">
                Validate the suggested price vs. margin impact before publishing.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="rounded-lg">
                <FileText className="w-4 h-4 mr-2" />
                View acceptance log
              </Button>
              <Button variant="ghost" size="sm" className="rounded-lg">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh data
              </Button>
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
                    <TableHead className="text-on-surface-variant">Confidence</TableHead>
                    <TableHead className="text-on-surface-variant">Select price point</TableHead>
                    <TableHead className="text-on-surface-variant text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {testItems.map((item) => {
                    const pricePoints = getPricePointsForItem(item);
                    const finalPrice = item.manualOverridePrice ?? item.aiSuggestedPrice;
                    const margin = calcMargin(item.purchasePrice, finalPrice);
                    const { badgeClass } = getConfidenceStyles(item.aiConfidence);
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
                        <TableCell>
                          <Badge className={cn('rounded-lg px-3 py-1 body-small font-medium', badgeClass)}>
                            {(item.aiConfidence * 100).toFixed(0)}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={finalPrice.toString()}
                            onValueChange={(selected: string) => {
                              const parsed = Number(selected);
                              handleOverridePrice(item.id, Number.isNaN(parsed) ? undefined : parsed);
                            }}
                          >
                            <SelectTrigger className="w-40 bg-surface border-outline rounded-lg h-[44px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {pricePoints.map((price) => (
                                <SelectItem key={`${item.id}-${price}`} value={price.toString()}>
                                  {price.toLocaleString('en-US', { style: 'currency', currency: 'EUR' })}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col items-end gap-2">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className={cn(
                                  'rounded-lg',
                                  item.status === 'accepted' && 'bg-primary-container text-on-primary-container border-none'
                                )}
                                onClick={() => handleAcceptItem(item.id)}
                              >
                                <Sparkles className="w-4 h-4 mr-1" />
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className={cn(
                                  'rounded-lg',
                                  item.status === 'rejected' && 'bg-error-container/90 text-on-error-container'
                                )}
                                onClick={() => handleRejectItem(item.id)}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                        <Badge
                          variant="outline"
                          className={cn(
                            'rounded-lg px-3',
                            item.status === 'accepted'
                              ? 'border-primary text-primary'
                              : item.status === 'rejected'
                              ? 'border-error text-error'
                              : 'border-outline text-on-surface-variant'
                          )}
                        >
                          {item.status === 'accepted'
                            ? 'Accepted'
                            : item.status === 'rejected'
                            ? 'Rejected'
                            : 'Pending'}
                        </Badge>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </ScrollArea>
          </Card>
            </section>

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
                <CardTitle className="title-medium text-on-surface">Prices per category & price group</CardTitle>
                <CardDescription className="body-small text-on-surface-variant">
                  Define one SEK ladder price per price group for each category/sub-category pair for {selectedBrandName || 'this brand'}.
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

                {/* Fixed-layout table to keep columns aligned with other portal tables */}
                <div className="overflow-x-auto rounded-lg border border-outline-variant bg-surface">
                  <table className="w-full min-w-[1500px] table-fixed border-collapse">
                    <colgroup>
                      <col style={{ width: '18rem' }} />
                      <col style={{ width: '18rem' }} />
                      <col style={{ width: '12rem' }} /> {/* Base */}
                      <col style={{ width: '10.5rem' }} />
                      <col style={{ width: '10.5rem' }} />
                      <col style={{ width: '10.5rem' }} />
                      <col style={{ width: '10.5rem' }} />
                      <col style={{ width: '10.5rem' }} />
                    </colgroup>
                    <thead className="bg-surface-container border-b border-outline-variant">
                      <tr>
                        <th className="px-3 py-3 text-left title-small text-on-surface">Category</th>
                        <th className="px-3 py-3 text-left title-small text-on-surface">Sub-category</th>
                        <th className="px-3 py-3 text-left title-small text-on-surface">Base price</th>
                        <th className="px-3 py-3 text-left title-small text-on-surface">Low</th>
                        <th className="px-3 py-3 text-left title-small text-on-surface">Mid</th>
                        <th className="px-3 py-3 text-left title-small text-on-surface">High</th>
                        <th className="px-3 py-3 text-left title-small text-on-surface">Premium</th>
                        <th className="px-3 py-3 text-left title-small text-on-surface">Haute couture</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPriceMatrixRows.map((row) => (
                        <tr key={row.key} className="border-b border-outline-variant last:border-b-0 hover:bg-surface-container/50 transition-colors">
                          <td className="px-3 py-3 body-medium text-on-surface align-middle">
                            <div className="flex items-center gap-2">
                              {row.category}
                              {row.isFallback && (
                                <Badge variant="outline" className="rounded-lg text-on-surface-variant">Fallback</Badge>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-3 body-medium text-on-surface align-middle">{row.subcategory}</td>
                          <td className="px-3 py-3 align-middle">
                            <Select
                              value={row.basePrice != null ? String(row.basePrice) : ''}
                              onValueChange={(v) => {
                                const parsed = Number(v);
                                setPriceMatrixRows((prev) =>
                                  prev.map((r) =>
                                    r.key !== row.key
                                      ? r
                                      : { ...r, basePrice: Number.isNaN(parsed) ? null : parsed }
                                  )
                                );
                              }}
                            >
                              <SelectTrigger className="w-[200px] min-w-[200px] max-w-[200px] shrink-0 bg-surface-container-high border border-outline rounded-lg min-h-[48px] body-large whitespace-nowrap overflow-hidden">
                                <SelectValue placeholder="—" className="block w-full whitespace-nowrap overflow-hidden text-ellipsis" />
                              </SelectTrigger>
                              <SelectContent>
                                {sekPricePoints.map((p) => (
                                  <SelectItem key={`${row.key}-base-${p}`} value={String(p)} className="min-h-[48px] md:min-h-0 py-3 md:py-1.5 touch-manipulation">
                                    {p} SEK
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                          {(['Low', 'Mid', 'High', 'Premium', 'Haute couture'] as const).map((label) => {
                            const tier = (label === 'Low'
                              ? 'Low'
                              : label === 'Mid'
                                ? 'Mid'
                                : label === 'High'
                                  ? 'High'
                                  : label === 'Premium'
                                    ? 'Premium'
                                    : 'Haute couture') as PriceForkTestItem['brandTier'];
                            const multiplier = getTierWeight(tier);
                            const computed = row.basePrice == null
                              ? null
                              : snapToNearestPricePoint(row.basePrice * multiplier, sekPricePoints.length ? sekPricePoints : [row.basePrice]);
                            return (
                              <td key={`${row.key}-${tier}`} className="px-3 py-3 align-middle">
                                <div className="body-medium text-on-surface">
                                  {computed == null ? '—' : `${computed} SEK`}
                                </div>
                                <div className="body-small text-on-surface-variant">
                                  {formatWeightLabel(multiplier)}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                      {filteredPriceMatrixRows.length === 0 && (
                        <tr>
                          <td colSpan={8} className="px-3 py-6 body-medium text-on-surface-variant">
                            No categories found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <Separator className="bg-outline-variant/60" />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="title-small text-on-surface">Fallback-mapped categories</div>
                      <p className="body-small text-on-surface-variant">
                        Categories currently relying on a fallback rule (mocked via low-confidence mappings). Add them to the table to define group prices.
                      </p>
                    </div>
                  </div>
                  <div className="overflow-x-auto rounded-lg border border-outline-variant">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-surface-container border-outline-variant/60">
                          <TableHead className="text-on-surface-variant">Mapped category</TableHead>
                          <TableHead className="text-on-surface-variant">Source label</TableHead>
                          <TableHead className="text-on-surface-variant">Confidence</TableHead>
                          <TableHead className="text-on-surface-variant text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {fallbackCandidates.map((c) => (
                          <TableRow key={c.key} className="border-outline-variant/40">
                            <TableCell className="body-medium text-on-surface">{c.category}</TableCell>
                            <TableCell className="body-medium text-on-surface-variant">
                              <Input
                                value={fallbackSourceLabelDraft[c.key] ?? c.sourceLabel}
                                onChange={(e) =>
                                  setFallbackSourceLabelDraft((prev) => ({ ...prev, [c.key]: e.target.value }))
                                }
                                className="bg-surface-container-high border-outline rounded-lg h-[44px] w-[260px]"
                              />
                            </TableCell>
                            <TableCell className="body-medium text-on-surface-variant">
                              {(c.confidence * 100).toFixed(0)}%
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-lg"
                                onClick={() => {
                                  setPriceMatrixRows((prev) => {
                                    const source = (fallbackSourceLabelDraft[c.key] ?? c.sourceLabel).trim() || c.sourceLabel;
                                    const key = `${c.category}::${source}`;
                                    if (prev.some((r) => r.key === key)) return prev;
                                    return [
                                      { key, category: c.category, subcategory: source, isFallback: true, basePrice: null },
                                      ...prev,
                                    ];
                                  });
                                }}
                              >
                                Add
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {fallbackCandidates.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={4} className="body-medium text-on-surface-variant py-6">
                              No fallback candidates found.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fallback-rule" className="space-y-6">
            <Card className="bg-surface border border-outline-variant">
              <CardHeader>
                <CardTitle className="title-medium text-on-surface">Fallback pricing rule</CardTitle>
                <CardDescription className="body-small text-on-surface-variant">
                  When a category/sub-category price is missing, suggest price as a multiplier of the Sellpy EUR purchase price.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="label-medium text-on-surface">Multiplier</Label>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      step={0.1}
                      value={fallbackMultiplier}
                      onChange={(e) => setFallbackMultiplier(Number(e.target.value))}
                      className="bg-surface-container-high border-outline rounded-lg h-[44px]"
                    />
                    <p className="body-small text-on-surface-variant">
                      Suggested price = purchasePriceEUR × {fallbackMultiplier.toFixed(1)} (then mapped to nearest SEK ladder point in the order UI).
                    </p>
                  </div>
                  <div className="rounded-xl border border-outline-variant/60 bg-surface p-4">
                    <div className="title-small text-on-surface mb-2">Example</div>
                    <div className="space-y-1 body-medium text-on-surface-variant">
                      <div>Purchase price: €18.00</div>
                      <div>Rule: × {fallbackMultiplier.toFixed(1)}</div>
                      <div className="text-on-surface">
                        Candidate: €{(18 * fallbackMultiplier).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}


