import React, { useMemo, useState } from 'react';
import {
  calibrationParameters,
  mockBrandSegments,
  mockCategoryMappings,
  mockComparisonSamples,
  mockPriceForkTestItems,
  priceForkDefaultState,
  PriceForkCalibrationState,
  PriceForkInsightPrompt,
  PriceForkTestItem,
  pricingLogicNarrative,
  priceForkPromptDefinitions
} from '../data/priceFork';
import { cn } from './ui/utils';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Slider } from './ui/slider';
import { Input } from './ui/input';
import { Switch } from './ui/switch';
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
import { Progress } from './ui/progress';
import {
  Brain,
  CheckCircle2,
  DownloadCloud,
  FileText,
  Filter,
  Gauge,
  Loader2,
  RefreshCw,
  Sparkles,
  UploadCloud,
  Wand2,
  XCircle
} from 'lucide-react';

interface PriceForkCalibrationScreenProps {
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

export default function PriceForkCalibrationScreen({
  onSaveCalibration
}: PriceForkCalibrationScreenProps) {
  const [calibrationState, setCalibrationState] = useState<PriceForkCalibrationState>({ ...priceForkDefaultState });
  const [lastSavedState, setLastSavedState] = useState<PriceForkCalibrationState>({ ...priceForkDefaultState });
  const [testItems, setTestItems] = useState<PriceForkTestItem[]>(mockPriceForkTestItems);
  const [isTesting, setIsTesting] = useState(false);
  const [activePrompt, setActivePrompt] = useState<PriceForkInsightPrompt['id'] | null>('brand-groups');

  const hasUnsavedChanges = useMemo(() => {
    return JSON.stringify(calibrationState) !== JSON.stringify(lastSavedState);
  }, [calibrationState, lastSavedState]);

  const confidenceThreshold = Number(calibrationState.confidenceThreshold ?? priceForkDefaultState.confidenceThreshold);

  const summaryMetrics = useMemo(() => {
    const accepted = testItems.filter((item) => item.status === 'accepted');
    const rejected = testItems.filter((item) => item.status === 'rejected');
    const flaggedForReview = testItems.filter(
      (item) => item.aiConfidence < confidenceThreshold && item.status === 'pending'
    );
    const avgUplift =
      testItems.reduce((acc, item) => acc + calcMargin(item.purchasePrice, item.aiSuggestedPrice), 0) /
      (testItems.length || 1);
    return {
      acceptanceRate: testItems.length ? accepted.length / testItems.length : 0,
      rejectionRate: testItems.length ? rejected.length / testItems.length : 0,
      avgUplift,
      flaggedForReview: flaggedForReview.length,
      flaggedItems: flaggedForReview
    };
  }, [testItems, confidenceThreshold]);

  const handleParameterChange = (id: string, value: number | string | boolean) => {
    setCalibrationState((prev) => ({
      ...prev,
      [id]: value
    }));
  };

  const handleReset = () => {
    setCalibrationState({ ...priceForkDefaultState });
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
              status: value === undefined ? 'pending' : item.status
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
          const adjustment = (Number(calibrationState.inventoryMomentum) ?? 0) * 50;
          const conditionAdjustment =
            (Number(calibrationState.conditionAdjustment) ?? 0) * (item.condition === 'Fair' ? -25 : item.condition === 'Good' ? -10 : 8);
          const brandBoost =
            (Number(calibrationState.brandWeighting) ?? 0) *
            (item.brandTier === 'Premium' ? 40 : item.brandTier === 'Mid' ? 18 : -8);
          const newPrice = Math.max(
            item.purchasePrice * (1 + Number(calibrationState.marginFloor) / 100),
            item.aiSuggestedPrice + adjustment + conditionAdjustment + brandBoost
          );
          return {
            ...item,
            aiSuggestedPrice: Math.round(newPrice),
            aiConfidence: Math.min(0.98, Math.max(0.45, item.aiConfidence + (adjustment / 500))),
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
            <Card key={segment.tier} className="bg-surface-container-high border border-outline-variant">
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
                      'rounded-full',
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
        <Card className="bg-surface-container-high border border-outline-variant">
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
                        <Badge className={cn('rounded-full px-3 py-1 body-small font-medium', badgeClass)}>
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
        <Card className="bg-surface-container-high border border-outline-variant">
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
    <div className="min-h-screen bg-surface pb-24 md:pb-12">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-10 space-y-10">
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container label-medium">
            <Sparkles className="w-4 h-4" />
            AI-powered pricing
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="display-small text-on-surface">Price Fork Calibration</h1>
              <p className="body-large text-on-surface-variant max-w-2xl">
                Tune the AI engine, test on real inventory, and surface insights before publishing changes to partners.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                className="rounded-full"
                onClick={handleReset}
                disabled={!hasUnsavedChanges}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button
                className="rounded-full"
                onClick={handleSave}
                disabled={!hasUnsavedChanges}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Save calibration
              </Button>
            </div>
          </div>
          {hasUnsavedChanges && (
            <div className="rounded-lg bg-warning-container/80 border border-warning px-4 py-3 flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-warning animate-spin" />
              <div>
                <p className="title-small text-on-warning-container">Unsaved calibration</p>
                <p className="body-small text-on-warning-container/80">
                  Run tests on updated parameters and save to version the changes.
                </p>
              </div>
            </div>
          )}
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.3fr,1fr]">
          <Card className="bg-surface-container-high border border-outline-variant">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="title-medium text-on-surface">Calibration controls</CardTitle>
                <CardDescription className="body-small text-on-surface-variant">
                  Adjust weights and thresholds that guide the AI recommendation engine.
                </CardDescription>
              </div>
              <Badge variant="outline" className="rounded-full">
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
                      <Badge variant="secondary" className="rounded-full px-3">
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

                    {parameter.type === 'select' && parameter.options && (
                      <Select
                        value={String(value)}
                        onValueChange={(newValue) => handleParameterChange(parameter.id, newValue)}
                      >
                        <SelectTrigger className="bg-surface-container-high border border-outline rounded-lg h-[44px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {parameter.options.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    {parameter.type === 'toggle' && (
                      <div className="flex items-center justify-between border border-outline rounded-lg px-4 py-3 bg-surface-container-high">
                        <div>
                          <div className="title-small text-on-surface">Enabled</div>
                          <p className="body-small text-on-surface-variant">Allow AI to schedule markdowns.</p>
                        </div>
                        <Switch
                          checked={Boolean(value)}
                          onCheckedChange={(checked) => handleParameterChange(parameter.id, checked)}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="bg-surface-container-high border border-outline-variant">
              <CardHeader>
                <CardTitle className="title-medium text-on-surface">Impact summary</CardTitle>
                <CardDescription className="body-small text-on-surface-variant">
                  Live metrics from the current calibration against sample inventory.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-primary-container text-on-primary-container">
                    <div className="label-medium uppercase opacity-80">Acceptance</div>
                    <div className="title-large">{Math.round(summaryMetrics.acceptanceRate * 100)}%</div>
                    <p className="body-small opacity-80">
                      Based on {testItems.length} evaluated items.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-tertiary-container text-on-tertiary-container">
                    <div className="label-medium uppercase opacity-80">Avg uplift</div>
                    <div className="title-large">
                      {(summaryMetrics.avgUplift * 100).toFixed(0)}%
                    </div>
                    <p className="body-small opacity-80">vs purchase price</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="body-medium text-on-surface">Confidence threshold</span>
                    <Badge className="rounded-full bg-secondary-container text-on-secondary-container">
                      ≥ {(confidenceThreshold * 100).toFixed(0)}%
                    </Badge>
                  </div>
                  <Progress value={confidenceThreshold * 100} className="h-2" />
                </div>
                <Separator className="bg-outline-variant/60" />
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-on-surface-variant" />
                    <span className="label-medium text-on-surface">Flagged for review</span>
                  </div>
                  {summaryMetrics.flaggedForReview === 0 ? (
                    <p className="body-small text-on-surface-variant">
                      No items below the confidence threshold. Increase volume to validate more scenarios.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      <p className="body-small text-on-surface-variant">
                        {summaryMetrics.flaggedForReview} items require manual review ({Math.round((summaryMetrics.flaggedForReview / testItems.length) * 100)}% of sample).
                      </p>
                      <div className="flex flex-col gap-2">
                        {summaryMetrics.flaggedItems.slice(0, 3).map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between rounded-lg border border-outline-dim px-3 py-2 bg-surface"
                          >
                            <div className="flex flex-col">
                              <span className="label-medium text-on-surface">{item.title}</span>
                              <span className="body-small text-on-surface-variant">{item.brand}</span>
                            </div>
                            <Badge className="rounded-full bg-warning-container text-on-warning-container">
                              {(item.aiConfidence * 100).toFixed(0)}% confidence
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
                  className="rounded-full"
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
                <Button variant="outline" className="rounded-full">
                  <UploadCloud className="w-4 h-4 mr-2" />
                  Upload sample set (.csv)
                </Button>
                <Button variant="ghost" className="rounded-full justify-start">
                  <DownloadCloud className="w-4 h-4 mr-2" />
                  Export latest calibration
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h2 className="title-large text-on-surface">Test items</h2>
              <p className="body-medium text-on-surface-variant">
                Validate the suggested price vs. margin impact before publishing.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="rounded-full">
                <FileText className="w-4 h-4 mr-2" />
                View acceptance log
              </Button>
              <Button variant="ghost" className="rounded-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh data
              </Button>
            </div>
          </div>
          <Card className="bg-surface-container-high border border-outline-variant overflow-hidden">
            <ScrollArea className="w-full" type="scroll">
              <Table>
                <TableHeader>
                  <TableRow className="bg-surface-container-highest border-outline-variant/60">
                    <TableHead className="text-on-surface-variant w-[26rem]">Item</TableHead>
                    <TableHead className="text-on-surface-variant">Purchase</TableHead>
                    <TableHead className="text-on-surface-variant">AI price</TableHead>
                    <TableHead className="text-on-surface-variant">Margin</TableHead>
                    <TableHead className="text-on-surface-variant">Confidence</TableHead>
                    <TableHead className="text-on-surface-variant">Final price</TableHead>
                    <TableHead className="text-on-surface-variant text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {testItems.map((item) => {
                    const margin = calcMargin(item.purchasePrice, item.aiSuggestedPrice);
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
                                <Badge variant="outline" className="rounded-full">
                                  {item.brand}
                                </Badge>
                                <Badge variant="outline" className="rounded-full text-on-surface-variant">
                                  {item.condition}
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
                          <Badge className={cn('rounded-full px-3 py-1 body-small font-medium', badgeClass)}>
                            {(item.aiConfidence * 100).toFixed(0)}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            className="w-32 bg-surface border-outline rounded-lg"
                            value={item.manualOverridePrice ?? ''}
                            placeholder={item.aiSuggestedPrice.toString()}
                            onChange={(event) => {
                              const parsed = event.target.value === '' ? undefined : Number(event.target.value);
                              handleOverridePrice(item.id, parsed);
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col items-end gap-2">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className={cn(
                                  'rounded-full',
                                  item.status === 'accepted' && 'bg-primary-container text-on-primary-container border-none'
                                )}
                                onClick={() => handleAcceptItem(item.id)}
                              >
                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className={cn(
                                  'rounded-full',
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
                                'rounded-full px-3',
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
              <div className="flex items-center gap-2">
                <Gauge className="w-5 h-5 text-on-surface-variant" />
                <CardTitle className="title-medium text-on-surface">AI insight prompts</CardTitle>
              </div>
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
                    onClick={() => setActivePrompt(prompt.id)}
                    className={cn(
                      'rounded-full',
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

          <Card className="bg-surface-container-high border border-outline-variant">
            <CardHeader className="space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-on-surface-variant" />
                <CardTitle className="title-medium text-on-surface">AI comparison</CardTitle>
              </div>
              <CardDescription className="body-small text-on-surface-variant">
                Randomized sample of items with AI-suggested price vs partner reference.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 md:grid-cols-3">
                {mockComparisonSamples.map((sample) => {
                  const marginPercent = sample.margin * 100;
                  return (
                    <div
                      key={sample.id}
                      className="rounded-xl border border-outline-variant/60 bg-surface overflow-hidden shadow-xs"
                    >
                      <img
                        src={sample.imageUrl}
                        alt={sample.title}
                        className="w-full h-40 object-cover"
                      />
                      <div className="p-4 space-y-3">
                        <div>
                          <div className="label-medium text-on-surface truncate">{sample.title}</div>
                          <p className="body-small text-on-surface-variant">{sample.brand}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between body-small text-on-surface-variant">
                            <span>Partner price</span>
                            <span className="text-on-surface">
                              {sample.partnerPrice.toLocaleString('en-US', { style: 'currency', currency: 'EUR' })}
                            </span>
                          </div>
                          <div className="flex items-center justify-between body-small text-on-surface-variant">
                            <span>AI suggested</span>
                            <span className="text-primary font-medium">
                              {sample.aiSuggestedPrice.toLocaleString('en-US', { style: 'currency', currency: 'EUR' })}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <Badge className="rounded-full bg-secondary-container text-on-secondary-container">
                            {(sample.aiConfidence * 100).toFixed(0)}% confidence
                          </Badge>
                          <span className={cn('label-medium', marginPercent >= 0 ? 'text-primary' : 'text-error')}>
                            {marginPercent >= 0 ? '+' : ''}
                            {marginPercent.toFixed(0)}% margin
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Separator className="bg-outline-variant/60" />
              <div className="rounded-xl border border-outline-dim bg-surface-container-highest p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <span className="title-small text-on-surface">Rollout readiness checklist</span>
                </div>
                <ul className="list-disc list-inside space-y-2 body-small text-on-surface-variant">
                  <li>Confirm uplift ≥ {Number(calibrationState.marginFloor) + 5}% for premium tier.</li>
                  <li>Review flagged low-confidence items before publishing to partners.</li>
                  <li>Export calibration summary to archive with version label.</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}


