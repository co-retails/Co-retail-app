import { useMemo, useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit2, Trash2 } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from './ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import {
  partnerPriceBooks,
  pricingBrands,
  getBrandOptionsForPartner as fetchBrandOptionsForPartner,
  brandNameById
} from '../data/partnerPricing';

interface PartnerPricingScreenProps {
  onBack: () => void;
}

// Mock data for partners and currencies (Shenzhen hidden from selection)
const mockPartners = [
  { id: '1', name: 'Sellpy Operations', code: 'SELLPY' },
  { id: '2', name: 'Thrifted', code: 'THRIFT' },
];

const mockCurrencies = ['SEK', 'EUR', 'USD', 'GBP', 'NOK'];

interface PricePoint {
  id: string;
  partnerId: string;
  partnerName: string;
  brandId: string;
  currency: string;
  prices: Record<string, number[]>;
}

const brands = pricingBrands;
const allPartnerIds = mockPartners.map((partner) => partner.id);
const defaultCurrency = mockCurrencies[0] ?? 'EUR';

const getBrandOptionsForPartner = (partnerId: string): { id: string; name: string }[] =>
  fetchBrandOptionsForPartner(partnerId);

const initialPricePoints: PricePoint[] = partnerPriceBooks.map((book) => {
  const currencies = Object.keys(book.prices);
  const defaultCurrencyForBook = currencies[0] ?? defaultCurrency;

  return {
    id: book.id,
    partnerId: book.partnerId,
    partnerName: book.partnerName,
    brandId: book.brandId,
    currency: defaultCurrencyForBook || defaultCurrency,
    prices: book.prices
  };
});

export function PartnerPricingScreen({ onBack }: PartnerPricingScreenProps) {
  const [pricePoints, setPricePoints] = useState<PricePoint[]>(initialPricePoints);
  const [selectedPartner, setSelectedPartner] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [editingPricePoint, setEditingPricePoint] = useState<PricePoint | null>(null);
  const [editingCurrency, setEditingCurrency] = useState<string | null>(null);
  const [formState, setFormState] = useState({
    partnerId: allPartnerIds[0] || '',
    brandId: (allPartnerIds[0] && getBrandOptionsForPartner(allPartnerIds[0])[0]?.id) || brands[0]?.id || '',
    currency: defaultCurrency,
    pricesText: ''
  });

  const brandNameMap = useMemo(() => ({ ...brandNameById }), []);

  const displayedPartners = useMemo(() => {
    if (selectedPartner === 'all') {
      return mockPartners;
    }
    const partner = mockPartners.find((p) => p.id === selectedPartner);
    return partner ? [partner] : [];
  }, [selectedPartner]);

  const brandOptionsForCurrentPartner = useMemo(
    () => getBrandOptionsForPartner(formState.partnerId),
    [formState.partnerId]
  );

  useEffect(() => {
    if (
      !brandOptionsForCurrentPartner.some(
        (brand) => brand.id === formState.brandId
      )
    ) {
      const fallbackBrandId =
        brandOptionsForCurrentPartner[0]?.id || brands[0]?.id || '';
      setFormState((prev) => ({
        ...prev,
        brandId: fallbackBrandId
      }));
    }
  }, [brandOptionsForCurrentPartner, formState.brandId]);

  const parsePriceList = (input: string): number[] => {
    if (!input) return [];
    const matches = input.match(/-?\d+(?:[.,]\d+)?/g);
    if (!matches) return [];
    const unique = new Set<number>();
    matches.forEach((token) => {
      const value = parseFloat(token.replace(',', '.'));
      if (!Number.isNaN(value) && value >= 0) {
        unique.add(Math.round(value * 100) / 100);
      }
    });
    return Array.from(unique).sort((a, b) => a - b);
  };

  const parsedPrices = useMemo(() => {
    return parsePriceList(formState.pricesText);
  }, [formState.pricesText]);

  const resetFormState = () => {
    const defaultPartnerId = allPartnerIds[0] || '';
    const defaultBrandId =
      (defaultPartnerId && getBrandOptionsForPartner(defaultPartnerId)[0]?.id) || brands[0]?.id || '';
    setFormState({
      partnerId: defaultPartnerId,
      brandId: defaultBrandId,
      currency: defaultCurrency,
      pricesText: ''
    });
    setEditingPricePoint(null);
    setEditingCurrency(null);
  };

  const openCreateDialog = () => {
    setDialogMode('create');
    resetFormState();
    setIsDialogOpen(true);
  };

  const openEditDialog = (pricePoint: PricePoint) => {
    setDialogMode('edit');
    setEditingPricePoint(pricePoint);
    const currencies = Object.keys(pricePoint.prices);
    const defaultCurrencyForBook = currencies[0] ?? defaultCurrency;
    setEditingCurrency(defaultCurrencyForBook);
    setFormState({
      partnerId: pricePoint.partnerId,
      brandId: pricePoint.brandId,
      currency: defaultCurrencyForBook,
      pricesText: pricePoint.prices[defaultCurrencyForBook]?.join('\n') ?? ''
    });
    setIsDialogOpen(true);
  };

  const handleDeletePricePoint = (pricePoint: PricePoint) => {
    const brandName = brandNameMap[pricePoint.brandId] ?? pricePoint.brandId;
    const confirmDelete = confirm(
      `Delete all fixed prices for ${brandName} • ${pricePoint.partnerName}?`
    );
    if (!confirmDelete) return;

    setPricePoints((prev) => prev.filter((pp) => pp.id !== pricePoint.id));
    toast.success('Price set deleted');
  };

  const handleSavePricePoint = () => {
    if (!parsedPrices.length) {
      toast.error('Add at least one price point.');
      return;
    }

    const partner = mockPartners.find((p) => p.id === formState.partnerId);
    if (!partner) {
      toast.error('Select a partner.');
      return;
    }

    if (dialogMode === 'edit' && editingPricePoint) {
      const existingConflict = pricePoints.find(
        (pp) =>
          pp.id !== editingPricePoint.id &&
          pp.partnerId === formState.partnerId &&
          pp.brandId === formState.brandId
      );

      if (existingConflict) {
        toast.error(
          'A price set already exists for this partner and brand. Use "Add price set" to manage it.'
        );
        return;
      }

      setPricePoints((prev) =>
        prev.map((pp) => {
          if (pp.id !== editingPricePoint.id) {
            return pp;
          }

          const updatedPrices = { ...pp.prices };
          if (editingCurrency && editingCurrency !== formState.currency) {
            delete updatedPrices[editingCurrency];
          }
          updatedPrices[formState.currency] = parsedPrices;

          return {
            ...pp,
            partnerId: formState.partnerId,
            partnerName: partner.name,
            brandId: formState.brandId,
            currency: formState.currency,
            prices: updatedPrices
          };
        })
      );
      toast.success('Price set updated');
    } else {
      const existingRecord = pricePoints.find(
        (pp) =>
          pp.partnerId === formState.partnerId && pp.brandId === formState.brandId
      );

      if (existingRecord) {
        setPricePoints((prev) =>
          prev.map((pp) => {
            if (pp.id !== existingRecord.id) {
              return pp;
            }

            return {
              ...pp,
              currency: formState.currency,
              prices: {
                ...pp.prices,
                [formState.currency]: parsedPrices
              }
            };
          })
        );
        toast.success('Price set updated');
      } else {
        if (!formState.partnerId || !formState.brandId) {
          toast.error('Partner and brand are required.');
          return;
        }
        const newPricePoint: PricePoint = {
          id: Date.now().toString(),
          partnerId: formState.partnerId,
          partnerName: partner.name,
          brandId: formState.brandId,
          currency: formState.currency,
          prices: {
            [formState.currency]: parsedPrices
          }
        };

        setPricePoints((prev) => [...prev, newPricePoint]);
        toast.success('Price set added');
      }
    }

    setIsDialogOpen(false);
    resetFormState();
  };


  const handlePartnerSelect = (partnerId: string) => {
    const nextBrandOptions = getBrandOptionsForPartner(partnerId);
    const nextBrandId = nextBrandOptions[0]?.id || brands[0]?.id || '';

    setFormState({
      partnerId,
      brandId: nextBrandId,
      currency: defaultCurrency,
      pricesText: ''
    });
    setEditingCurrency(null);
  };

  const handleBrandSelect = (brandId: string) => {
    setFormState((prev) => ({
      ...prev,
      brandId,
      pricesText: ''
    }));
  };

  const handleCurrencySelect = (currency: string) => {
    setEditingCurrency(currency);
    setFormState((prev) => ({
      ...prev,
      currency,
      pricesText:
        dialogMode === 'edit' && editingPricePoint
          ? editingPricePoint.prices[currency]?.join('\n') ?? ''
          : ''
    }));
  };

  return (
    <>
      <div className="min-h-screen bg-surface pb-20 md:pb-0">
        {/* Top App Bar */}
      <div className="sticky top-0 bg-surface z-10 border-b border-outline-variant">
        <div className="flex items-center h-16 px-4 md:px-6 gap-2">
          <button
            className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest transition-colors"
            onClick={() => {
              onBack();
            }}
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6 text-on-surface" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="title-large text-on-surface">Partner pricing</div>
            <div className="body-medium text-on-surface-variant">
              Set fixed prices per currency for each partner
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button className="gap-2" onClick={openCreateDialog}>
              <Plus className="w-5 h-5" />
              <span>Add price set</span>
            </Button>
          </div>
        </div>

        {/* Context Bar */}
        <div className="border-t border-outline-variant bg-surface-container px-4 md:px-6 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="label-medium text-on-surface-variant">Partner:</span>
              <Select value={selectedPartner} onValueChange={setSelectedPartner}>
                <SelectTrigger className="w-[220px] bg-surface-container-high border border-outline rounded-lg min-h-[40px]">
                  <SelectValue placeholder="Select partner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All partners</SelectItem>
                  {mockPartners.map((partner) => (
                    <SelectItem key={partner.id} value={partner.id}>
                      {partner.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl px-4 md:px-6 py-6">
        <div className="space-y-6">
          {displayedPartners.map((partner) => {
            const partnerPrices = pricePoints.filter(
              (pricePoint) => pricePoint.partnerId === partner.id
            );

            if (!partnerPrices.length) {
              return null;
            }

            return (
              <div key={partner.id} className="space-y-4">
                <div className="title-large text-on-surface">{partner.name}</div>
                <div className="grid gap-4 md:grid-cols-2">
                  {partnerPrices.map((pricePoint) => {
                    const brandName =
                      brandNameMap[pricePoint.brandId] ?? pricePoint.brandId;
                    const currencyEntries = Object.entries(pricePoint.prices);
                    const currencyCount = currencyEntries.length;

                    return (
                      <Card
                        key={pricePoint.id}
                        className="p-6 border-outline-variant bg-surface-container"
                      >
                        <div className="flex items-start justify-between mb-4 gap-4">
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="title-medium text-on-surface">{brandName}</div>
                            <div className="body-medium text-on-surface-variant">
                              {currencyCount
                                ? `${currencyCount} currency set${
                                    currencyCount > 1 ? 's' : ''
                                  } configured`
                                : 'No currencies configured'}
                            </div>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <button
                              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors"
                              aria-label="Edit price set"
                              onClick={() => openEditDialog(pricePoint)}
                            >
                              <Edit2 className="w-5 h-5 text-on-surface-variant" />
                            </button>
                            <button
                              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-error-container transition-colors"
                              aria-label="Delete price set"
                              onClick={() => handleDeletePricePoint(pricePoint)}
                            >
                              <Trash2 className="w-5 h-5 text-error" />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {currencyEntries.length ? (
                            currencyEntries.map(([currency, prices]) => (
                              <div
                                key={`${pricePoint.id}-${currency}`}
                                className="space-y-2"
                              >
                                <div className="label-medium text-on-surface">
                                  {currency}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {prices.map((price, index) => (
                                    <span
                                      key={`${pricePoint.id}-${currency}-${index}`}
                                      className="label-large px-3 py-1 rounded-full bg-primary-container text-on-primary-container"
                                    >
                                      {price} {currency}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="body-small text-on-surface-variant">
                              No currency price points have been added yet.
                            </p>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {displayedPartners.length > 0 && !displayedPartners.some(p => pricePoints.some(pp => pp.partnerId === p.id)) && (
            <Card className="p-6 border-outline bg-surface-container">
              <div className="title-medium text-on-surface mb-2">No pricing configured</div>
              <div className="body-medium text-on-surface-variant">
                Add price sets using the "Add price set" button above.
              </div>
            </Card>
          )}

          {pricePoints.length === 0 && (
            <Card className="p-12 border-outline bg-surface-container text-center">
              <div className="title-large text-on-surface mb-2">
                No price points configured
              </div>
              <div className="body-medium text-on-surface-variant mb-6">
                Add price points to configure fixed prices per currency for each partner
              </div>
              <Button onClick={openCreateDialog}>
                <Plus className="w-5 h-5 mr-2" />
                <span>Add first price set</span>
              </Button>
            </Card>
          )}
        </div>
      </div>
      </div>
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open: boolean) => {
          setIsDialogOpen(open);
          if (!open) {
            resetFormState();
          }
        }}
      >
        <DialogContent className="bg-surface border-outline max-w-xl">
          <DialogHeader>
            <DialogTitle className="title-large text-on-surface">
              {dialogMode === 'edit' ? 'Edit price set' : 'Add price set'}
            </DialogTitle>
            <DialogDescription className="body-medium text-on-surface-variant">
              Paste price points directly from a spreadsheet or enter them manually separated by commas,
              spaces or new lines.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="partner-select" className="label-medium text-on-surface">
                  Partner
                </Label>
                <Select
                  value={formState.partnerId}
                  onValueChange={handlePartnerSelect}
                  disabled={dialogMode === 'edit'}
                >
                  <SelectTrigger
                    id="partner-select"
                    className="bg-surface border-outline"
                  >
                    <SelectValue placeholder="Choose partner" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockPartners.map((partner) => (
                      <SelectItem key={partner.id} value={partner.id}>
                        {partner.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand-select" className="label-medium text-on-surface">
                  Brand
                </Label>
                <Select
                  value={formState.brandId}
                  onValueChange={handleBrandSelect}
                  disabled={dialogMode === 'edit'}
                >
                  <SelectTrigger id="brand-select" className="bg-surface border-outline">
                    <SelectValue placeholder="Choose brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {brandOptionsForCurrentPartner.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency-select" className="label-medium text-on-surface">
                  Currency
                </Label>
                <Select
                  value={formState.currency}
                  onValueChange={handleCurrencySelect}
                >
                  <SelectTrigger
                    id="currency-select"
                    className="bg-surface border-outline"
                  >
                    <SelectValue placeholder="Choose currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockCurrencies.map((currency) => (
                      <SelectItem
                        key={currency}
                        value={currency}
                      >
                        {currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price-list" className="label-medium text-on-surface">
                Price points
              </Label>
              <Textarea
                id="price-list"
                value={formState.pricesText}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, pricesText: event.target.value }))
                }
                onPaste={(event) => {
                  const pasted = event.clipboardData.getData('text');
                  if (pasted) {
                    event.preventDefault();
                    setFormState((prev) => ({ ...prev, pricesText: pasted }));
                    toast.success('Pasted price points detected');
                  }
                }}
                className="bg-surface border-outline min-h-[140px]"
                placeholder={'Example:\n199\n249\n299'}
              />
              <p className="body-small text-on-surface-variant">
                Separate values with new lines, commas, tabs or spaces. Duplicates will be removed
                automatically.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="label-medium text-on-surface">Preview</Label>
              {parsedPrices.length ? (
                <div className="flex flex-wrap gap-2">
                  {parsedPrices.map((price) => (
                    <Badge
                      key={price}
                      variant="secondary"
                      className="bg-primary-container text-on-primary-container"
                    >
                      {price} {formState.currency}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="body-small text-on-surface-variant">
                  Paste prices to preview the resulting price points.
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                resetFormState();
              }}
              className="border-outline hover:bg-surface-container-high"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSavePricePoint}
              disabled={!parsedPrices.length}
            >
              {dialogMode === 'edit' ? 'Save changes' : 'Add price set'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
