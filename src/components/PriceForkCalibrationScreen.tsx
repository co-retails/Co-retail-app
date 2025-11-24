import React, { useCallback, useMemo, useState } from 'react';
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
import { cn } from './ui/utils';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Slider } from './ui/slider';
import { Input } from './ui/input';
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
import { ArrowLeft, Brain, DownloadCloud, FileText, Info, Loader2, RefreshCw, Sparkles, UploadCloud, Wand2, XCircle } from 'lucide-react';

interface PriceForkCalibrationScreenProps {
  partnerId: string;
  onBack?: () => void;
  onSaveCalibration?: (state: PriceForkCalibrationState) => void;
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

const snapToNearestPricePoint = (value: number, pricePoints: number[]) => {
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
  }, pricePoints[0]);
};

const formatWeightLabel = (weight: number) => {
  const percentage = (weight - 1) * 100;
  const rounded = Math.round(percentage);
  if (rounded === 0) return '±0%';
  return `${rounded > 0 ? '+' : ''}${rounded}%`;
};

export default function PriceForkCalibrationScreen({
  partnerId,
  onBack,
  onSaveCalibration
}: PriceForkCalibrationScreenProps) {
  const [calibrationState, setCalibrationState] = useState<PriceForkCalibrationState>({ ...priceForkDefaultState });
  const [lastSavedState, setLastSavedState] = useState<PriceForkCalibrationState>({ ...priceForkDefaultState });
  const [testItems, setTestItems] = useState<PriceForkTestItem[]>(() =>
    mockPriceForkTestItems.map((item) => {
      const pricePoints = getSekPriceOptions(partnerId, item.brand);
      const snapped = snapToNearestPricePoint(item.aiSuggestedPrice, pricePoints.length ? pricePoints : [item.aiSuggestedPrice]);
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
    setCalibrationState((prev) => ({
      ...prev,
      [id]: value
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
    setCalibrationState({ ...priceForkDefaultState });
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
    setLastSavedState({ ...calibrationState });
    onSaveCalibration?.(calibrationState);
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
          const marginFloorItem = Number(calibrationState.marginFloorItem ?? priceForkDefaultState.marginFloorItem);
          const materialWeight = getMaterialWeight(item.material);

          const base = Math.max(item.aiSuggestedPrice, item.purchasePrice * (1 + marginFloorItem / 100));
          const candidatePrice = base * tierWeight * materialWeight;
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
              Tune the AI engine, test on real inventory, and surface insights before publishing changes to partners.
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
              {calibrationParameters.map((parameter) => {
                const value = calibrationState[parameter.id];
                const formattedValue = parameter.format ? parameter.format(value) : value;
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
                          onValueChange={(vals) => handleParameterChange(parameter.id, Number(vals[0]))}
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
                    const value = calibrationState[tier.id];
                    const formattedValue = tier.format ? tier.format(value) : value;
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
                          min={tier.min}
                          max={tier.max}
                          step={tier.step}
                          onValueChange={(vals) => handleParameterChange(tier.id, Number(vals[0]))}
                        />
                        <div className="flex justify-between text-label-small text-on-surface-variant">
                          <span>{tier.min}</span>
                          <span>{tier.max}</span>
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
                      Adjust how strongly material influences the suggested price.
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
                        min={0.8}
                        max={1.4}
                        step={0.02}
                        onValueChange={(vals) => handleParameterChange(material.id, Number(vals[0]))}
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
                            onValueChange={(selected) => {
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

        <section className="grid gap-6 xl:grid-cols-[1fr,1.1fr]">
          <Card className="bg-surface-container-high border border-outline-variant">
            <CardHeader className="space-y-3">
              <CardTitle className="title-medium text-on-surface">AI insight prompts</CardTitle>
              <CardDescription className="body-small text-on-surface-variant">
                Trigger pre-defined prompts to inspect how the AI interprets brand segments, mappings, and logic.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {priceForkPromptDefinitions.map((prompt) => (
                  <Button
                    key={prompt.id}
                    variant={activePrompt === prompt.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActivePrompt(prompt.id)}
                    className={cn(
                      'rounded-lg',
                      activePrompt === prompt.id && 'bg-primary text-on-primary shadow-sm'
                    )}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {prompt.label}
                  </Button>
                ))}
              </div>
              <Separator className="bg-outline-variant/60" />
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-primary" />
                  <span className="label-medium text-on-surface">
                    {priceForkPromptDefinitions.find((prompt) => prompt.id === activePrompt)?.description}
                  </span>
                </div>
                <div className="space-y-4">{activeInsight}</div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}


