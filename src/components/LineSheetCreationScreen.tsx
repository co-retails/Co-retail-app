import React, { useState } from 'react';
import { ArrowLeft, Plus, X, Calendar, DollarSign, Globe, Eye, EyeOff, Check } from 'lucide-react';
import { ShowroomProduct, LineSheet } from './ShowroomTypes';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

interface LineSheetCreationScreenProps {
  products: ShowroomProduct[];
  onBack: () => void;
  onCreate: (lineSheet: Omit<LineSheet, 'id' | 'createdAt'>) => void;
  onUpdate?: (lineSheetId: string, lineSheet: Omit<LineSheet, 'id' | 'createdAt'>) => void;
  partnerId: string;
  editingLineSheet?: LineSheet | null;
}

export default function LineSheetCreationScreen({
  products,
  onBack,
  onCreate,
  onUpdate,
  partnerId,
  editingLineSheet
}: LineSheetCreationScreenProps) {
  const isEditMode = !!editingLineSheet;
  
  const [name, setName] = useState(editingLineSheet?.name || '');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(editingLineSheet?.productIds || []);
  const [startDate, setStartDate] = useState(editingLineSheet?.availabilityWindow.start || '');
  const [endDate, setEndDate] = useState(editingLineSheet?.availabilityWindow.end || '');
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>(editingLineSheet?.markets || []);
  const [visibility, setVisibility] = useState<'private' | 'public'>(editingLineSheet?.visibility || 'private');
  const [searchQuery, setSearchQuery] = useState('');

  // Available markets (country codes)
  const availableMarkets = [
    { code: 'SE', name: 'Sweden' },
    { code: 'NO', name: 'Norway' },
    { code: 'DK', name: 'Denmark' },
    { code: 'FI', name: 'Finland' },
    { code: 'DE', name: 'Germany' },
    { code: 'UK', name: 'United Kingdom' },
    { code: 'FR', name: 'France' },
    { code: 'ES', name: 'Spain' },
    { code: 'IT', name: 'Italy' },
    { code: 'NL', name: 'Netherlands' },
    { code: 'CN', name: 'China' },
    { code: 'IN', name: 'India' }
  ];

  const toggleProduct = (productId: string) => {
    setSelectedProductIds(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const toggleMarket = (marketCode: string) => {
    setSelectedMarkets(prev =>
      prev.includes(marketCode)
        ? prev.filter(code => code !== marketCode)
        : [...prev, marketCode]
    );
  };

  const filteredProducts = products.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = () => {
    if (!name.trim() || selectedProductIds.length === 0 || !startDate || !endDate || selectedMarkets.length === 0) {
      return;
    }

    const lineSheet: Omit<LineSheet, 'id' | 'createdAt'> = {
      partnerId,
      name,
      productIds: selectedProductIds,
      availabilityWindow: {
        start: startDate,
        end: endDate
      },
      markets: selectedMarkets,
      visibility,
      status: editingLineSheet?.status || 'active'
    };

    if (isEditMode && onUpdate && editingLineSheet) {
      onUpdate(editingLineSheet.id, lineSheet);
    } else {
      onCreate(lineSheet);
    }
  };

  const isValid = name.trim() && selectedProductIds.length > 0 && startDate && endDate && selectedMarkets.length > 0;

  return (
    <div className="min-h-screen bg-surface pb-24">
      {/* Spacer for top nav on desktop */}
      <div className="hidden md:block h-16"></div>
      {/* Top App Bar */}
      <div className="sticky top-0 md:top-16 bg-surface z-[90] border-b border-outline-variant">
        <div className="flex items-center h-16 px-4 md:px-6">
          <button 
            className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors mr-2"
            onClick={onBack}
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6 text-on-surface" />
          </button>
          
          <h1 className="title-large text-on-surface flex-1">{isEditMode ? 'Edit line sheet' : 'Create line sheet'}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 md:px-6 py-6 max-w-4xl mx-auto space-y-6">
        {/* Basic Information */}
        <Card className="p-4 bg-surface-container border border-outline-variant">
          <h2 className="title-medium text-on-surface mb-4">Basic information</h2>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="label-large text-on-surface mb-2">
                Line sheet name *
              </Label>
              <Input
                id="name"
                placeholder="e.g., Spring 2025 Collection"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-surface border-outline"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-date" className="label-large text-on-surface mb-2">
                  Available from *
                </Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-surface border-outline"
                />
              </div>

              <div>
                <Label htmlFor="end-date" className="label-large text-on-surface mb-2">
                  Available until *
                </Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-surface border-outline"
                />
              </div>
            </div>

            <div>
              <Label className="label-large text-on-surface mb-2">Visibility</Label>
              <div className="flex gap-3">
                <button
                  onClick={() => setVisibility('private')}
                  className={`flex-1 p-3 rounded-lg border transition-colors ${
                    visibility === 'private'
                      ? 'bg-primary-container border-primary text-on-primary-container'
                      : 'bg-surface-container border-outline-variant text-on-surface'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <EyeOff className="w-4 h-4" />
                    <span className="label-large">Private</span>
                  </div>
                  <p className="body-small mt-1 opacity-80">
                    Only accessible via link
                  </p>
                </button>

                <button
                  onClick={() => setVisibility('public')}
                  className={`flex-1 p-3 rounded-lg border transition-colors ${
                    visibility === 'public'
                      ? 'bg-primary-container border-primary text-on-primary-container'
                      : 'bg-surface-container border-outline-variant text-on-surface'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Eye className="w-4 h-4" />
                    <span className="label-large">Public</span>
                  </div>
                  <p className="body-small mt-1 opacity-80">
                    Visible in showroom
                  </p>
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Target Markets */}
        <Card className="p-4 bg-surface-container border border-outline-variant">
          <h2 className="title-medium text-on-surface mb-2">Target markets *</h2>
          <p className="body-small text-on-surface-variant mb-4">
            Select which markets can access this line sheet
          </p>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {availableMarkets.map((market) => {
              const isSelected = selectedMarkets.includes(market.code);
              return (
                <button
                  key={market.code}
                  onClick={() => toggleMarket(market.code)}
                  className={`p-3 rounded-lg border transition-colors text-left ${
                    isSelected
                      ? 'bg-primary-container border-primary'
                      : 'bg-surface border-outline-variant hover:bg-surface-container-high'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`label-large ${isSelected ? 'text-on-primary-container' : 'text-on-surface'}`}>
                        {market.name}
                      </p>
                      <p className={`body-small ${isSelected ? 'text-on-primary-container opacity-80' : 'text-on-surface-variant'}`}>
                        {market.code}
                      </p>
                    </div>
                    {isSelected && (
                      <Check className="w-5 h-5 text-on-primary-container" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Product Selection */}
        <Card className="p-4 bg-surface-container border border-outline-variant">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="title-medium text-on-surface">Products *</h2>
              <p className="body-small text-on-surface-variant">
                {selectedProductIds.length} of {products.length} products selected
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="mb-4">
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-surface border-outline"
            />
          </div>

          {/* Product List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredProducts.map((product) => {
              const isSelected = selectedProductIds.includes(product.id);
              return (
                <button
                  key={product.id}
                  onClick={() => toggleProduct(product.id)}
                  className={`w-full p-3 rounded-lg border transition-colors ${
                    isSelected
                      ? 'bg-primary-container border-primary'
                      : 'bg-surface border-outline-variant hover:bg-surface-container-high'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                      isSelected
                        ? 'bg-primary border-primary'
                        : 'border-outline-variant'
                    }`}>
                      {isSelected && <Check className="w-4 h-4 text-on-primary" />}
                    </div>

                    {product.images[0] && (
                      <div className="w-12 h-12 rounded overflow-hidden bg-surface-container-high flex-shrink-0">
                        <img 
                          src={product.images[0]} 
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="flex-1 text-left min-w-0">
                      <p className={`body-medium truncate ${isSelected ? 'text-on-primary-container' : 'text-on-surface'}`}>
                        {product.title}
                      </p>
                      <p className={`body-small ${isSelected ? 'text-on-primary-container opacity-80' : 'text-on-surface-variant'}`}>
                        {product.sku} • ${product.wholesalePrice}
                      </p>
                    </div>

                    <Badge variant={isSelected ? 'default' : 'outline'} className="flex-shrink-0">
                      {product.category}
                    </Badge>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-outline-variant p-4 md:px-6">
        <div className="max-w-4xl mx-auto flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onBack}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 bg-primary text-on-primary hover:bg-primary/90"
            onClick={handleSave}
            disabled={!isValid}
          >
            {isEditMode ? 'Save changes' : 'Create line sheet'}
          </Button>
        </div>
      </div>
    </div>
  );
}
