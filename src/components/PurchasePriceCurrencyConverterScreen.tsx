import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from './ui/dialog';
import { ArrowLeft, Plus, Edit2, Trash2, HelpCircle, Save } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface PurchasePriceCurrencyConverterScreenProps {
  onBack: () => void;
}

interface CurrencyConverter {
  id: string;
  salesCurrency: string;
  exchangeRate: number; // Rate to convert from EUR (purchase price) to sales currency
  lastEdited: string;
  lastEditedBy: string;
}

// Available currencies for sales price (excluding EUR since purchase price is always in EUR)
const availableCurrencies = ['SEK', 'USD', 'GBP', 'NOK', 'DKK'];

// Mock data - in production, this would come from an API
const mockConverters: CurrencyConverter[] = [
  {
    id: '1',
    salesCurrency: 'SEK',
    exchangeRate: 11.5,
    lastEdited: '2024-01-15',
    lastEditedBy: 'Admin User'
  },
  {
    id: '2',
    salesCurrency: 'USD',
    exchangeRate: 1.1,
    lastEdited: '2024-01-15',
    lastEditedBy: 'Admin User'
  }
];

export function PurchasePriceCurrencyConverterScreen({
  onBack
}: PurchasePriceCurrencyConverterScreenProps) {
  const [converters, setConverters] = useState<CurrencyConverter[]>(mockConverters);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [editingConverter, setEditingConverter] = useState<CurrencyConverter | null>(null);
  const [formState, setFormState] = useState({
    salesCurrency: availableCurrencies[0],
    exchangeRate: ''
  });

  const getUsedCurrencies = () => {
    return new Set(converters.map((c) => c.salesCurrency));
  };

  const getAvailableCurrenciesForSelection = () => {
    const used = getUsedCurrencies();
    if (dialogMode === 'edit' && editingConverter) {
      // In edit mode, include the current currency
      return availableCurrencies;
    }
    // In create mode, exclude already used currencies
    return availableCurrencies.filter((curr) => !used.has(curr));
  };

  const resetFormState = () => {
    const available = getAvailableCurrenciesForSelection();
    setFormState({
      salesCurrency: available[0] || availableCurrencies[0],
      exchangeRate: ''
    });
    setEditingConverter(null);
  };

  const openCreateDialog = () => {
    setDialogMode('create');
    resetFormState();
    setIsDialogOpen(true);
  };

  const openEditDialog = (converter: CurrencyConverter) => {
    setDialogMode('edit');
    setEditingConverter(converter);
    setFormState({
      salesCurrency: converter.salesCurrency,
      exchangeRate: converter.exchangeRate.toString()
    });
    setIsDialogOpen(true);
  };

  const handleDeleteConverter = (converter: CurrencyConverter) => {
    const confirmDelete = confirm(
      `Delete currency converter for ${converter.salesCurrency}?`
    );
    if (!confirmDelete) return;

    setConverters((prev) => prev.filter((c) => c.id !== converter.id));
    toast.success('Currency converter deleted');
  };

  const handleSaveConverter = () => {
    const rate = parseFloat(formState.exchangeRate);

    if (isNaN(rate) || rate <= 0) {
      toast.error('Please enter a valid exchange rate greater than 0');
      return;
    }

    if (dialogMode === 'edit' && editingConverter) {
      setConverters((prev) =>
        prev.map((c) => {
          if (c.id !== editingConverter.id) {
            return c;
          }
          return {
            ...c,
            salesCurrency: formState.salesCurrency,
            exchangeRate: rate,
            lastEdited: new Date().toISOString().split('T')[0],
            lastEditedBy: 'Current User' // In production, get from auth context
          };
        })
      );
      toast.success('Currency converter updated');
    } else {
      // Check if currency already exists
      const existing = converters.find((c) => c.salesCurrency === formState.salesCurrency);
      if (existing) {
        toast.error(`A converter for ${formState.salesCurrency} already exists`);
        return;
      }

      const newConverter: CurrencyConverter = {
        id: Date.now().toString(),
        salesCurrency: formState.salesCurrency,
        exchangeRate: rate,
        lastEdited: new Date().toISOString().split('T')[0],
        lastEditedBy: 'Current User' // In production, get from auth context
      };

      setConverters((prev) => [...prev, newConverter]);
      toast.success('Currency converter added');
    }

    setIsDialogOpen(false);
    resetFormState();
  };

  return (
    <>
      <div className="min-h-screen bg-surface pb-20 md:pb-0">
        {/* Top App Bar */}
        <div className="sticky top-0 bg-surface z-10 border-b border-outline-variant">
          <div className="flex items-center h-16 px-4 md:px-6 gap-2">
            <button
              className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest transition-colors"
              onClick={onBack}
              aria-label="Go back"
            >
              <ArrowLeft className="w-6 h-6 text-on-surface" />
            </button>
            <div className="flex-1 min-w-0">
              <div className="title-large text-on-surface">Purchase price currency converter</div>
              <div className="body-medium text-on-surface-variant">
                Convert purchase prices from EUR to sales price currency
              </div>
            </div>
            <Button className="gap-2" onClick={openCreateDialog}>
              <Plus className="w-5 h-5" />
              <span>Add converter</span>
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl px-4 md:px-6 py-6">
          <div className="space-y-6">
            {/* Info Card */}
            <Card className="p-6 border-outline bg-surface-container">
              <div className="flex gap-3">
                <HelpCircle className="w-6 h-6 text-on-surface-variant flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <h3 className="title-medium text-on-surface">About purchase price conversion</h3>
                  <p className="body-medium text-on-surface-variant">
                    Purchase prices from Sellpy are always sent in EUR. To display purchase prices
                    and calculate margins correctly for markets with different sales price currencies,
                    you need to configure exchange rates to convert EUR purchase prices to the
                    sales price currency.
                  </p>
                  <p className="body-medium text-on-surface-variant">
                    <strong>Formula:</strong> Purchase Price ({formState.salesCurrency}) = Purchase Price (EUR) × Exchange Rate
                  </p>
                </div>
              </div>
            </Card>

            {/* Converters List */}
            {converters.length === 0 ? (
              <Card className="p-12 border-outline bg-surface-container text-center">
                <div className="title-large text-on-surface mb-2">
                  No currency converters configured
                </div>
                <div className="body-medium text-on-surface-variant mb-6">
                  Add a currency converter to enable purchase price conversion from EUR to your sales price currency
                </div>
                <Button onClick={openCreateDialog}>
                  <Plus className="w-5 h-5 mr-2" />
                  <span>Add first converter</span>
                </Button>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {converters.map((converter) => (
                  <Card
                    key={converter.id}
                    className="p-6 border-outline-variant bg-surface-container"
                  >
                    <div className="flex items-start justify-between mb-4 gap-4">
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="title-medium text-on-surface">
                          {converter.salesCurrency}
                        </div>
                        <div className="body-medium text-on-surface-variant">
                          Exchange rate: <strong>1 EUR = {converter.exchangeRate} {converter.salesCurrency}</strong>
                        </div>
                        <div className="body-small text-on-surface-variant mt-2">
                          Last edited: {converter.lastEdited} by {converter.lastEditedBy}
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors"
                          aria-label="Edit converter"
                          onClick={() => openEditDialog(converter)}
                        >
                          <Edit2 className="w-5 h-5 text-on-surface-variant" />
                        </button>
                        <button
                          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-error-container transition-colors"
                          aria-label="Delete converter"
                          onClick={() => handleDeleteConverter(converter)}
                        >
                          <Trash2 className="w-5 h-5 text-error" />
                        </button>
                      </div>
                    </div>

                    {/* Example calculation */}
                    <div className="mt-4 p-4 bg-surface-container-high rounded-lg border border-outline-variant">
                      <div className="label-medium text-on-surface-variant mb-2">Example calculation:</div>
                      <div className="body-small text-on-surface-variant space-y-1">
                        <div>Purchase Price (EUR): 10.00 EUR</div>
                        <div>
                          Purchase Price ({converter.salesCurrency}):{' '}
                          <strong>
                            {(10.0 * converter.exchangeRate).toFixed(2)} {converter.salesCurrency}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Available currencies info */}
            {getAvailableCurrenciesForSelection().length === 0 && converters.length > 0 && (
              <Card className="p-6 border-outline bg-surface-container">
                <div className="body-medium text-on-surface-variant">
                  All available currencies have been configured. Edit existing converters to update exchange rates.
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Dialog for Create/Edit */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            resetFormState();
          }
        }}
      >
        <DialogContent className="bg-surface border-outline max-w-lg">
          <DialogHeader>
            <DialogTitle className="title-large text-on-surface">
              {dialogMode === 'edit' ? 'Edit currency converter' : 'Add currency converter'}
            </DialogTitle>
            <DialogDescription className="body-medium text-on-surface-variant">
              Configure the exchange rate to convert purchase prices from EUR to your sales price currency.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="currency-select" className="label-medium text-on-surface">
                Sales price currency
              </Label>
              <Select
                value={formState.salesCurrency}
                onValueChange={(value) =>
                  setFormState((prev) => ({ ...prev, salesCurrency: value }))
                }
                disabled={dialogMode === 'edit'} // Currency cannot be changed when editing
              >
                <SelectTrigger
                  id="currency-select"
                  className="bg-surface border-outline"
                >
                  <SelectValue placeholder="Choose currency" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableCurrenciesForSelection().map((currency) => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {dialogMode === 'edit' && (
                <p className="body-small text-on-surface-variant">
                  Currency cannot be changed. Delete and create a new converter for a different currency.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="exchange-rate" className="label-medium text-on-surface">
                Exchange rate (EUR → {formState.salesCurrency})
              </Label>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-2 bg-surface-container rounded-lg border border-outline-variant">
                  <span className="body-medium text-on-surface">1 EUR =</span>
                </div>
                <Input
                  id="exchange-rate"
                  type="number"
                  step="0.0001"
                  min="0.0001"
                  value={formState.exchangeRate}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, exchangeRate: e.target.value }))
                  }
                  className="bg-surface border-outline"
                  placeholder="11.5"
                />
                <div className="flex items-center gap-2 px-3 py-2 bg-surface-container rounded-lg border border-outline-variant">
                  <span className="body-medium text-on-surface">{formState.salesCurrency}</span>
                </div>
              </div>
              <p className="body-small text-on-surface-variant">
                Enter the exchange rate to convert 1 EUR to {formState.salesCurrency}
              </p>
            </div>

            {/* Preview */}
            {formState.exchangeRate && !isNaN(parseFloat(formState.exchangeRate)) && (
              <div className="p-4 bg-surface-container-high rounded-lg border border-outline-variant">
                <div className="label-medium text-on-surface-variant mb-2">Preview:</div>
                <div className="body-small text-on-surface-variant space-y-1">
                  <div>Purchase Price (EUR): 10.00 EUR</div>
                  <div>
                    Purchase Price ({formState.salesCurrency}):{' '}
                    <strong>
                      {(10.0 * parseFloat(formState.exchangeRate)).toFixed(2)} {formState.salesCurrency}
                    </strong>
                  </div>
                </div>
              </div>
            )}
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
              onClick={handleSaveConverter}
              disabled={!formState.exchangeRate || isNaN(parseFloat(formState.exchangeRate)) || parseFloat(formState.exchangeRate) <= 0}
            >
              <Save className="w-4 h-4 mr-2" />
              {dialogMode === 'edit' ? 'Save changes' : 'Add converter'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

