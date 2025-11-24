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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from './ui/table';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { ArrowLeft, Upload, Download, Plus, Trash2, ArrowRight } from 'lucide-react';
import { CurrencyMapping, MappingRuleType, CurrencyCode, Brand, Partner } from './PortalConfigTypes';
import { toast } from 'sonner@2.0.3';

interface CurrencyMappingScreenProps {
  onBack: () => void;
}

export function CurrencyMappingScreen({ onBack }: CurrencyMappingScreenProps) {
  const [selectedBrand, setSelectedBrand] = useState<string>('weekday');
  const [selectedPartner, setSelectedPartner] = useState<string>('sellpy');
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>('EUR');
  const [ruleType, setRuleType] = useState<MappingRuleType>('nearest');
  const [sampleLocalPrice, setSampleLocalPrice] = useState('');

  // Mock data
  const brands: Brand[] = [
    { id: 'weekday', name: 'Weekday', code: 'WD' },
    { id: 'monki', name: 'Monki', code: 'MK' }
  ];

  const partners: Partner[] = [
    { id: 'sellpy', name: 'Sellpy (China)', code: 'SP' },
    { id: 'partner2', name: 'Partner B', code: 'PB' }
  ];

  const currencies: CurrencyCode[] = ['EUR', 'GBP', 'USD', 'DKK', 'NOK'];

  // Mock SEK ladder
  const sekLadder = [50, 75, 100, 120, 150, 200, 250, 300, 400, 500, 600, 750, 1000];

  // Mock mapping table for "table" rule type
  const [mappingTable, setMappingTable] = useState([
    { localPrice: 10, sekPrice: 120 },
    { localPrice: 20, sekPrice: 250 },
    { localPrice: 30, sekPrice: 400 }
  ]);

  const [newLocalPrice, setNewLocalPrice] = useState('');
  const [newSekPrice, setNewSekPrice] = useState('');

  // FX rate (mock - in real app would come from central source)
  const fxRates: Record<CurrencyCode, number> = {
    EUR: 11.5,
    GBP: 13.2,
    USD: 10.8,
    DKK: 1.54,
    NOK: 1.0
  };

  const handleAddMapping = () => {
    const local = parseFloat(newLocalPrice);
    const sek = parseFloat(newSekPrice);

    if (isNaN(local) || isNaN(sek)) {
      toast.error('Please enter valid numbers');
      return;
    }

    if (!sekLadder.includes(sek)) {
      toast.error('SEK price must be from the valid ladder');
      return;
    }

    setMappingTable([...mappingTable, { localPrice: local, sekPrice: sek }].sort((a, b) => a.localPrice - b.localPrice));
    setNewLocalPrice('');
    setNewSekPrice('');
    toast.success('Mapping added');
  };

  const handleRemoveMapping = (index: number) => {
    setMappingTable(mappingTable.filter((_, i) => i !== index));
    toast.success('Mapping removed');
  };

  const calculatePreview = () => {
    const local = parseFloat(sampleLocalPrice);
    if (isNaN(local)) return null;

    const sekEquivalent = local * fxRates[selectedCurrency];
    let mappedSek: number | null = null;

    if (ruleType === 'nearest') {
      mappedSek = sekLadder.reduce((prev, curr) =>
        Math.abs(curr - sekEquivalent) < Math.abs(prev - sekEquivalent) ? curr : prev
      );
    } else if (ruleType === 'floor') {
      mappedSek = sekLadder.filter((s) => s <= sekEquivalent).pop() || null;
    } else if (ruleType === 'ceil') {
      mappedSek = sekLadder.find((s) => s >= sekEquivalent) || null;
    } else if (ruleType === 'table') {
      const match = mappingTable.find((m) => m.localPrice === local);
      mappedSek = match?.sekPrice || null;
    }

    return { sekEquivalent, mappedSek };
  };

  const preview = calculatePreview();

  const handlePublish = () => {
    toast.success('Currency mapping published successfully');
  };

  return (
    <div className="min-h-screen bg-surface pb-20 md:pb-0">
      {/* Top App Bar */}
      <div className="sticky top-0 bg-surface z-10 border-b border-outline-variant">
        <div className="flex items-center h-16 px-4 md:px-6">
          <button
            className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest transition-colors mr-2"
            onClick={onBack}
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6 text-on-surface" />
          </button>

          <div className="flex-1">
            <h1 className="title-large text-on-surface">Currency → SEK mapping</h1>
            <p className="body-small text-on-surface-variant">
              Map foreign currencies to valid SEK price points
            </p>
          </div>

          <Button onClick={handlePublish} className="bg-primary text-on-primary">
            Publish mapping
          </Button>
        </div>

        {/* Context Bar */}
        <div className="border-t border-outline-variant bg-surface-container px-4 md:px-6 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="label-medium text-on-surface-variant">Brand:</span>
              <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                <SelectTrigger className="w-[180px] bg-surface-container-high border border-outline rounded-lg min-h-[40px]">
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

            <div className="flex items-center gap-2">
              <span className="label-medium text-on-surface-variant">Partner:</span>
              <Select value={selectedPartner} onValueChange={setSelectedPartner}>
                <SelectTrigger className="w-[200px] bg-surface-container-high border border-outline rounded-lg min-h-[40px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {partners.map((partner) => (
                    <SelectItem key={partner.id} value={partner.id}>
                      {partner.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="label-medium text-on-surface-variant">Currency:</span>
              <Select value={selectedCurrency} onValueChange={(v) => setSelectedCurrency(v as CurrencyCode)}>
                <SelectTrigger className="w-[120px] bg-surface-container-high border border-outline rounded-lg min-h-[40px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((curr) => (
                    <SelectItem key={curr} value={curr}>
                      {curr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl px-4 md:px-6 py-6 space-y-6">
        {/* Info Card */}
        <Card className="p-4 border-outline bg-surface-container">
          <p className="body-medium text-on-surface-variant">
            💡 When partners upload with foreign currency, the system converts & maps to valid SEK steps.
            Uploads are rejected if no mapping exists.
          </p>
        </Card>

        {/* Rule Type Selection */}
        <Card className="p-6 border-outline-variant bg-surface-container">
          <h2 className="title-medium text-on-surface mb-4">Mapping rule type</h2>
          <RadioGroup value={ruleType} onValueChange={(v) => setRuleType(v as MappingRuleType)}>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <RadioGroupItem value="nearest" id="nearest" />
                <div className="flex-1">
                  <Label htmlFor="nearest" className="body-medium text-on-surface cursor-pointer">
                    Nearest
                  </Label>
                  <p className="body-small text-on-surface-variant">
                    Convert to SEK via FX rate, then map to nearest allowed step
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <RadioGroupItem value="floor" id="floor" />
                <div className="flex-1">
                  <Label htmlFor="floor" className="body-medium text-on-surface cursor-pointer">
                    Floor
                  </Label>
                  <p className="body-small text-on-surface-variant">
                    Round down to closest lower step
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <RadioGroupItem value="ceil" id="ceil" />
                <div className="flex-1">
                  <Label htmlFor="ceil" className="body-medium text-on-surface cursor-pointer">
                    Ceil
                  </Label>
                  <p className="body-small text-on-surface-variant">
                    Round up to closest higher step
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <RadioGroupItem value="table" id="table" />
                <div className="flex-1">
                  <Label htmlFor="table" className="body-medium text-on-surface cursor-pointer">
                    Explicit table
                  </Label>
                  <p className="body-small text-on-surface-variant">
                    Define exact mappings for specific local prices
                  </p>
                </div>
              </div>
            </div>
          </RadioGroup>
        </Card>

        {/* FX Rate Info (for non-table types) */}
        {ruleType !== 'table' && (
          <Card className="p-6 border-outline-variant bg-surface-container">
            <h2 className="title-medium text-on-surface mb-3">Exchange rate</h2>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="border-outline bg-surface px-4 py-2">
                <span className="body-large text-on-surface">
                  1 {selectedCurrency} = {fxRates[selectedCurrency]} SEK
                </span>
              </Badge>
              <span className="body-small text-on-surface-variant">(Central FX source)</span>
            </div>
          </Card>
        )}

        {/* Explicit Table (only for table type) */}
        {ruleType === 'table' && (
          <Card className="p-6 border-outline-variant bg-surface-container">
            <div className="flex items-center justify-between mb-4">
              <h2 className="title-medium text-on-surface">Mapping table</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="border-outline hover:bg-surface-container-high">
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
                <Button variant="outline" size="sm" className="border-outline hover:bg-surface-container-high">
                  <Upload className="w-4 h-4 mr-2" />
                  Import CSV
                </Button>
              </div>
            </div>

            {/* Add Row Form */}
            <div className="mb-4 p-4 bg-surface rounded-lg border border-outline-variant">
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <Label htmlFor="localPrice" className="label-medium text-on-surface mb-2 block">
                    Local price ({selectedCurrency})
                  </Label>
                  <Input
                    id="localPrice"
                    type="number"
                    placeholder="10.00"
                    value={newLocalPrice}
                    onChange={(e) => setNewLocalPrice(e.target.value)}
                    className="bg-surface-container border-outline"
                  />
                </div>

                <ArrowRight className="w-5 h-5 text-on-surface-variant mb-3" />

                <div className="flex-1">
                  <Label htmlFor="sekPrice" className="label-medium text-on-surface mb-2 block">
                    SEK price
                  </Label>
                  <Select value={newSekPrice} onValueChange={setNewSekPrice}>
                    <SelectTrigger className="bg-surface-container border-outline">
                      <SelectValue placeholder="Select SEK" />
                    </SelectTrigger>
                    <SelectContent>
                      {sekLadder.map((sek) => (
                        <SelectItem key={sek} value={sek.toString()}>
                          {sek} SEK
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleAddMapping} className="bg-primary text-on-primary">
                  <Plus className="w-5 h-5 mr-2" />
                  Add
                </Button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-outline-variant hover:bg-surface-container-high">
                    <TableHead className="body-medium text-on-surface-variant">
                      Local price ({selectedCurrency})
                    </TableHead>
                    <TableHead className="body-medium text-on-surface-variant">
                      Maps to SEK
                    </TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mappingTable.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="h-20 text-center body-medium text-on-surface-variant">
                        No mappings defined. Add your first mapping above.
                      </TableCell>
                    </TableRow>
                  ) : (
                    mappingTable.map((mapping, index) => (
                      <TableRow key={index} className="border-outline-variant hover:bg-surface-container-high">
                        <TableCell>
                          <span className="body-medium text-on-surface">
                            {mapping.localPrice.toFixed(2)} {selectedCurrency}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-primary-container text-on-primary-container">
                            <span className="label-medium">{mapping.sekPrice} SEK</span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveMapping(index)}
                            className="hover:bg-error-container text-error"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}

        {/* Preview Widget */}
        <Card className="p-6 border-outline-variant bg-surface-container">
          <h2 className="title-medium text-on-surface mb-4">Preview converter</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="sample" className="label-medium text-on-surface mb-2 block">
                Enter sample {selectedCurrency} price
              </Label>
              <Input
                id="sample"
                type="number"
                placeholder="e.g., 25.00"
                value={sampleLocalPrice}
                onChange={(e) => setSampleLocalPrice(e.target.value)}
                className="bg-surface border-outline max-w-xs"
              />
            </div>

            {preview && (
              <div className="p-4 bg-surface rounded-lg border border-outline-variant">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="body-small text-on-surface-variant mb-1">Input</p>
                    <p className="title-medium text-on-surface">
                      {parseFloat(sampleLocalPrice).toFixed(2)} {selectedCurrency}
                    </p>
                  </div>

                  {ruleType !== 'table' && (
                    <div>
                      <p className="body-small text-on-surface-variant mb-1">FX converted</p>
                      <p className="title-medium text-on-surface">
                        {preview.sekEquivalent.toFixed(2)} SEK
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="body-small text-on-surface-variant mb-1">Mapped to</p>
                    <p className="title-medium text-accent">
                      {preview.mappedSek !== null ? `${preview.mappedSek} SEK` : 'No match'}
                    </p>
                  </div>
                </div>

                {preview.mappedSek === null && (
                  <p className="body-small text-error mt-3">
                    ⚠️ This price cannot be mapped. Upload would be rejected.
                  </p>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
