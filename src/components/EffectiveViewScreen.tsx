import React, { useState } from 'react';
import { ArrowLeft, Search, ChevronDown, Eye } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface EffectiveViewScreenProps {
  onBack: () => void;
}

interface AttributeConfig {
  id: string;
  name: string;
  type: 'text' | 'dropdown' | 'number' | 'boolean';
  mandatory: boolean;
  defaultValue?: string;
  validValues?: string[];
  computedFrom: string;
}

const mockAttributes: AttributeConfig[] = [
  {
    id: '1',
    name: 'Brand',
    type: 'dropdown',
    mandatory: true,
    validValues: ['H&M', 'COS', 'Weekday', 'Monki'],
    computedFrom: 'Dictionary + Dropdown Values'
  },
  {
    id: '2',
    name: 'Gender',
    type: 'dropdown',
    mandatory: true,
    validValues: ['Men', 'Women', 'Kids', 'Unisex'],
    computedFrom: 'Dictionary + Dropdown Values'
  },
  {
    id: '3',
    name: 'Category',
    type: 'dropdown',
    mandatory: true,
    validValues: ['Clothing', 'Shoes', 'Accessories'],
    computedFrom: 'Dictionary + Dropdown Values + Country Override (SE)'
  },
  {
    id: '4',
    name: 'Price',
    type: 'number',
    mandatory: true,
    computedFrom: 'Dictionary + SEK Price Ladder'
  },
  {
    id: '5',
    name: 'Description',
    type: 'text',
    mandatory: false,
    computedFrom: 'Dictionary'
  },
];

export function EffectiveViewScreen({ onBack }: EffectiveViewScreenProps) {
  const [selectedBrand, setSelectedBrand] = useState('H&M');
  const [selectedCountry, setSelectedCountry] = useState('SE');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAttributes = mockAttributes.filter(attr =>
    attr.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
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
            <div className="title-large text-on-surface">Effective view</div>
            <div className="body-medium text-on-surface-variant">
              Preview computed configuration for a Brand & Country
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-outline-variant bg-surface-container-low">
        <div className="max-w-6xl px-4 md:px-6 py-4">
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="label-large text-on-surface-variant">Brand:</span>
              <button className="h-10 px-4 rounded-lg border border-outline bg-surface-container hover:bg-surface-container-high transition-colors flex items-center gap-2">
                <span className="body-large text-on-surface">{selectedBrand}</span>
                <ChevronDown className="w-5 h-5 text-on-surface-variant" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="label-large text-on-surface-variant">Country:</span>
              <button className="h-10 px-4 rounded-lg border border-outline bg-surface-container hover:bg-surface-container-high transition-colors flex items-center gap-2">
                <span className="body-large text-on-surface">{selectedCountry}</span>
                <ChevronDown className="w-5 h-5 text-on-surface-variant" />
              </button>
            </div>
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                <input
                  type="text"
                  id="effective-view-search"
                  name="effective-view-search"
                  placeholder="Search attributes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-11 pr-4 rounded-lg border border-outline bg-surface-container text-on-surface body-large placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl px-4 md:px-6 py-6">
        <div className="mb-6 p-4 rounded-lg bg-primary-container border border-outline-variant">
          <div className="flex items-start gap-3">
            <Eye className="w-5 h-5 text-on-primary-container flex-shrink-0 mt-0.5" />
            <div>
              <div className="title-small text-on-primary-container mb-1">
                Preview mode
              </div>
              <div className="body-medium text-on-primary-container">
                This view shows the computed configuration after applying dictionary rules, dropdown values, 
                price ladders, and country-specific overrides for {selectedBrand} in {selectedCountry}.
              </div>
            </div>
          </div>
        </div>

        {filteredAttributes.length === 0 ? (
          <Card className="p-12 border-outline bg-surface-container text-center">
            <div className="title-large text-on-surface mb-2">No attributes found</div>
            <div className="body-medium text-on-surface-variant">
              Try adjusting your search criteria
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredAttributes.map((attr) => (
              <Card 
                key={attr.id} 
                className="p-6 border-outline-variant bg-surface-container"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="title-medium text-on-surface">{attr.name}</div>
                      {attr.mandatory && (
                        <Badge variant="outline" className="border-error bg-error-container">
                          <span className="label-small text-on-error-container">Mandatory</span>
                        </Badge>
                      )}
                      <Badge variant="outline" className="border-outline bg-surface-container-highest">
                        <span className="label-small text-on-surface-variant capitalize">{attr.type}</span>
                      </Badge>
                    </div>
                    <div className="body-small text-on-surface-variant">
                      Computed from: {attr.computedFrom}
                    </div>
                  </div>
                </div>

                {attr.validValues && (
                  <div>
                    <div className="label-medium text-on-surface-variant mb-2">Valid values:</div>
                    <div className="flex flex-wrap gap-2">
                      {attr.validValues.map((value, index) => (
                        <span
                          key={index}
                          className="label-medium px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container"
                        >
                          {value}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {attr.defaultValue && (
                  <div className="mt-3">
                    <div className="label-medium text-on-surface-variant mb-1">Default value:</div>
                    <div className="body-medium text-on-surface">{attr.defaultValue}</div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
