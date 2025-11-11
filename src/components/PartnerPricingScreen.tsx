import React, { useMemo, useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit2, Trash2, Filter } from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from './ui/dropdown-menu';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';
import {
  partnerPriceBooks,
  sekPriceLadders as sharedSekPriceLadders,
  pricingBrands,
  getBrandOptionsForPartner as fetchBrandOptionsForPartner,
  brandNameById
} from '../data/partnerPricing';

interface PartnerPricingScreenProps {
  onBack: () => void;
}

// Mock data for partners and currencies
const mockPartners = [
  { id: '1', name: 'Sellpy Operations', code: 'SELLPY' },
  { id: '2', name: 'Thrifted', code: 'THRIFT' },
  { id: '6', name: 'Shenzhen Fashion Manufacturing', code: 'SFM' },
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
const defaultNonSekCurrency = mockCurrencies.find((currency) => currency !== 'SEK') ?? 'EUR';
const sekkLadders = sharedSekPriceLadders;

const getLadderSteps = (brandId: string, partnerId: string): number[] => {
  return (
    sekkLadders.find(
      (ladder) => ladder.brandId === brandId && ladder.partnerId === partnerId
    )?.steps ?? []
  );
};

const getBrandOptionsForPartner = (partnerId: string): { id: string; name: string }[] =>
  fetchBrandOptionsForPartner(partnerId);

const initialPricePoints: PricePoint[] = partnerPriceBooks.map((book) => {
  const nonSekCurrencies = Object.keys(book.prices).filter((currency) => currency !== 'SEK');
  const defaultCurrency = nonSekCurrencies[0] ?? defaultNonSekCurrency;

  return {
    id: book.id,
    partnerId: book.partnerId,
    partnerName: book.partnerName,
    brandId: book.brandId,
    currency: defaultCurrency,
    prices: book.prices
  };
});

export function PartnerPricingScreen({ onBack }: PartnerPricingScreenProps) {
  const [pricePoints, setPricePoints] = useState<PricePoint[]>(initialPricePoints);
  const [selectedPartners, setSelectedPartners] = useState<string[]>(allPartnerIds);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [editingPricePoint, setEditingPricePoint] = useState<PricePoint | null>(null);
  const [editingCurrency, setEditingCurrency] = useState<string | null>(null);
  const [formState, setFormState] = useState({
    partnerId: allPartnerIds[0],
    brandId: getBrandOptionsForPartner(allPartnerIds[0])[0]?.id ?? brands[0].id,
    currency: defaultNonSekCurrency,
    pricesText: ''
  });

  const brandNameMap = useMemo(() => ({ ...brandNameById }), []);

  const partnerFilterSet = useMemo(
    () => new Set(selectedPartners),
    [selectedPartners]
  );

  const displayedPartners = useMemo(() => {
    if (!selectedPartners.length) {
      return [] as typeof mockPartners;
    }
    return mockPartners.filter((partner) => partnerFilterSet.has(partner.id));
  }, [partnerFilterSet, selectedPartners]);

  const brandOptionsForCurrentPartner = useMemo(
    () => getBrandOptionsForPartner(formState.partnerId),
    [formState.partnerId]
  );

  const hasVisiblePricePoints = useMemo(
    () =>
      displayedPartners.some((partner) =>
        pricePoints.some((pp) => pp.partnerId === partner.id)
      ),
    [displayedPartners, pricePoints]
  );

  useEffect(() => {
    if (
      !brandOptionsForCurrentPartner.some(
        (brand) => brand.id === formState.brandId
      )
    ) {
      const fallbackBrandId =
        brandOptionsForCurrentPartner[0]?.id ?? brands[0].id;
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
    if (formState.currency === 'SEK') {
      return [];
    }
    return parsePriceList(formState.pricesText);
  }, [formState.currency, formState.pricesText]);

  const resetFormState = () => {
    const defaultPartnerId = allPartnerIds[0];
    const defaultBrandId =
      getBrandOptionsForPartner(defaultPartnerId)[0]?.id ?? brands[0].id;
    setFormState({
      partnerId: defaultPartnerId,
      brandId: defaultBrandId,
      currency: defaultNonSekCurrency,
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
    const nonSekCurrencies = Object.keys(pricePoint.prices).filter(
      (currency) => currency !== 'SEK'
    );
    const defaultCurrency = nonSekCurrencies[0] ?? defaultNonSekCurrency;
    setEditingCurrency(defaultCurrency);
    setFormState({
      partnerId: pricePoint.partnerId,
      brandId: pricePoint.brandId,
      currency: defaultCurrency,
      pricesText: pricePoint.prices[defaultCurrency]?.join('\n') ?? ''
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
    if (formState.currency === 'SEK') {
      toast.error('SEK price points are managed by the SEK price ladder.');
      return;
    }

    if (!parsedPrices.length) {
      toast.error('Add at least one price point.');
      return;
    }

    const partner = mockPartners.find((p) => p.id === formState.partnerId);
    if (!partner) {
      toast.error('Select a partner.');
      return;
    }

    const ladderSteps = getLadderSteps(formState.brandId, formState.partnerId);
    if (!ladderSteps.length) {
      toast.error('No SEK price ladder configured for this partner and brand.');
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
          updatedPrices.SEK = ladderSteps;

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
                SEK: ladderSteps,
                [formState.currency]: parsedPrices
              }
            };
          })
        );
        toast.success('Price set updated');
      } else {
        const newPricePoint: PricePoint = {
          id: Date.now().toString(),
          partnerId: formState.partnerId,
          partnerName: partner.name,
          brandId: formState.brandId,
          currency: formState.currency,
          prices: {
            SEK: ladderSteps,
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

  const isAllSelected = selectedPartners.length === allPartnerIds.length;

  const handleSelectAllPartners = (checked: boolean | 'indeterminate') => {
    const isChecked = checked === true;
    if (isChecked) {
      setSelectedPartners(allPartnerIds);
    } else {
      setSelectedPartners([]);
    }
  };

  const handlePartnerFilterToggle = (
    partnerId: string,
    checked: boolean | 'indeterminate'
  ) => {
    const isChecked = checked === true;
    setSelectedPartners((prev) => {
      if (isChecked) {
        if (prev.includes(partnerId)) {
          return prev;
        }
        const nextSet = new Set([...prev, partnerId]);
        return allPartnerIds.filter((id) => nextSet.has(id));
      }

      return prev.filter((id) => id !== partnerId);
    });
  };

  const handlePartnerSelect = (partnerId: string) => {
    const nextBrandOptions = getBrandOptionsForPartner(partnerId);
    const nextBrandId = nextBrandOptions[0]?.id ?? brands[0].id;

    setFormState({
      partnerId,
      brandId: nextBrandId,
      currency: defaultNonSekCurrency,
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
    if (currency === 'SEK') {
      toast.error('SEK price points are managed by the SEK price ladder.');
      return;
    }

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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="w-4 h-4" />
                  <span>
                    {isAllSelected
                      ? 'All partners'
                      : selectedPartners.length
                      ? `${selectedPartners.length} selected`
                      : 'Select partners'}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuCheckboxItem
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAllPartners}
                >
                  All partners
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                {mockPartners.map((partner) => (
                  <DropdownMenuCheckboxItem
                    key={partner.id}
                    checked={selectedPartners.includes(partner.id)}
                    onCheckedChange={(checked) =>
                      handlePartnerFilterToggle(partner.id, checked)
                    }
                  >
                    {partner.name}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button className="gap-2" onClick={openCreateDialog}>
              <Plus className="w-5 h-5" />
              <span>Add price set</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl px-4 md:px-6 py-6">
        <div className="space-y-6">
          {!selectedPartners.length && (
            <Card className="p-6 border-outline bg-surface-container">
              <div className="title-medium text-on-surface mb-2">Select partners to view pricing</div>
              <div className="body-medium text-on-surface-variant">
                Use the filter in the top right to choose which partner price sets to display.
              </div>
            </Card>
          )}

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
                    const sekSteps = getLadderSteps(
                      pricePoint.brandId,
                      pricePoint.partnerId
                    );
                    const sekChips =
                      sekSteps.length > 0
                        ? sekSteps
                        : pricePoint.prices.SEK ?? [];
                    const currencyEntries = Object.entries(pricePoint.prices).filter(
                      ([currency]) => currency !== 'SEK'
                    );
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
                                ? `${currencyCount} additional currency set${
                                    currencyCount > 1 ? 's' : ''
                                  } configured`
                                : 'No additional currencies configured'}
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

                        <div className="space-y-4">
                          <div>
                            <p className="label-medium text-on-surface-variant mb-2">
                              SEK price ladder
                            </p>
                            {sekChips.length ? (
                              <div className="flex flex-wrap gap-2">
                                {sekChips.map((price, index) => (
                                  <span
                                    key={`sek-${pricePoint.id}-${index}`}
                                    className="label-medium px-3 py-1 rounded-full bg-surface-container-high text-on-surface"
                                  >
                                    {price} SEK
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="body-small text-on-surface-variant">
                                No SEK price ladder configured.
                              </p>
                            )}
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
                                No additional currency price points have been added yet.
                              </p>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {selectedPartners.length > 0 && !hasVisiblePricePoints && pricePoints.length > 0 && (
            <Card className="p-6 border-outline bg-surface-container text-center">
              <div className="title-medium text-on-surface mb-2">
                No price sets for the selected partners
              </div>
              <div className="body-medium text-on-surface-variant">
                Add a price set to get started or adjust the partner filter.
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
        onOpenChange={(open) => {
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
                        disabled={currency === 'SEK'}
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
              {formState.currency === 'SEK' ? (
                <p className="body-small text-on-surface-variant">
                  SEK price points follow the SEK price ladder and cannot be edited here.
                </p>
              ) : parsedPrices.length ? (
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
              disabled={formState.currency === 'SEK' || !parsedPrices.length}
            >
              {dialogMode === 'edit' ? 'Save changes' : 'Add price set'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
