import React, { useState } from 'react';
import { ArrowLeft, Plus, Search, Filter, Edit2, Trash2 } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface CountryOverridesScreenProps {
  onBack: () => void;
}

interface CountryOverride {
  id: string;
  brandName: string;
  countryCode: string;
  countryName: string;
  attributeOverrides: number;
  lastModified: string;
  modifiedBy: string;
}

const mockOverrides: CountryOverride[] = [
  {
    id: '1',
    brandName: 'H&M',
    countryCode: 'SE',
    countryName: 'Sweden',
    attributeOverrides: 5,
    lastModified: '2024-12-01',
    modifiedBy: 'Admin User'
  },
  {
    id: '2',
    brandName: 'COS',
    countryCode: 'DE',
    countryName: 'Germany',
    attributeOverrides: 3,
    lastModified: '2024-11-28',
    modifiedBy: 'Admin User'
  },
  {
    id: '3',
    brandName: 'Weekday',
    countryCode: 'FR',
    countryName: 'France',
    attributeOverrides: 7,
    lastModified: '2024-11-25',
    modifiedBy: 'System'
  },
];

export function CountryOverridesScreen({ onBack }: CountryOverridesScreenProps) {
  const [overrides, setOverrides] = useState<CountryOverride[]>(mockOverrides);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOverrides = overrides.filter(override =>
    override.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    override.countryName.toLowerCase().includes(searchQuery.toLowerCase())
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
            <div className="title-large text-on-surface">Country overrides</div>
            <div className="body-medium text-on-surface-variant">
              Brand→Country specific attribute rules
            </div>
          </div>
          <Button className="gap-2">
            <Plus className="w-5 h-5" />
            <span>Add override</span>
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="border-b border-outline-variant bg-surface-container-low">
        <div className="w-full px-4 md:px-6 py-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
              <input
                type="text"
                placeholder="Search by brand or country..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-11 pr-4 rounded-lg border border-outline bg-surface-container text-on-surface body-large placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="w-5 h-5" />
              <span>Filter</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl px-4 md:px-6 py-6">
        {filteredOverrides.length === 0 ? (
          <Card className="p-12 border-outline bg-surface-container text-center">
            <div className="title-large text-on-surface mb-2">No overrides found</div>
            <div className="body-medium text-on-surface-variant mb-6">
              {searchQuery 
                ? 'Try adjusting your search criteria'
                : 'Create country-specific overrides for brand attribute rules'}
            </div>
            <Button>
              <Plus className="w-5 h-5 mr-2" />
              <span>Add first override</span>
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredOverrides.map((override) => (
              <Card 
                key={override.id} 
                className="p-6 border-outline-variant bg-surface-container hover:bg-surface-container-high transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="title-medium text-on-surface">
                        {override.brandName}
                      </div>
                      <Badge variant="outline" className="border-outline bg-surface-container-highest">
                        <span className="label-small text-on-surface-variant">{override.countryCode}</span>
                      </Badge>
                    </div>
                    <div className="body-medium text-on-surface-variant mb-3">
                      {override.countryName} • {override.attributeOverrides} attribute overrides
                    </div>
                    <div className="body-small text-on-surface-variant">
                      Last modified {override.lastModified} by {override.modifiedBy}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-highest transition-colors"
                      aria-label="Edit override"
                    >
                      <Edit2 className="w-5 h-5 text-on-surface-variant" />
                    </button>
                    <button
                      className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-error-container transition-colors"
                      aria-label="Delete override"
                    >
                      <Trash2 className="w-5 h-5 text-error" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
