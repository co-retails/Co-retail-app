import { useMemo, useState } from 'react';
import { ArrowLeft, Plus, Search, Filter, Edit2, Trash2 } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Checkbox } from './ui/checkbox';

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

const getTodayString = () => {
  const iso = new Date().toISOString();
  const separatorIndex = iso.indexOf('T');
  return separatorIndex === -1 ? iso : iso.slice(0, separatorIndex);
};

export function CountryOverridesScreen({ onBack }: CountryOverridesScreenProps) {
  const [overrides, setOverrides] = useState<CountryOverride[]>(mockOverrides);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOverride, setEditingOverride] = useState<CountryOverride | null>(null);
  const [formData, setFormData] = useState<Omit<CountryOverride, 'id'>>({
    brandName: '',
    countryCode: '',
    countryName: '',
    attributeOverrides: 1,
    lastModified: getTodayString(),
    modifiedBy: 'Admin User'
  });
  const [activeBrands, setActiveBrands] = useState<string[]>([]);
  const [activeCountries, setActiveCountries] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const uniqueBrands = useMemo(() => {
    const names = new Set(overrides.map((o) => o.brandName));
    return Array.from(names).sort();
  }, [overrides]);

  const uniqueCountries = useMemo(() => {
    const codes = new Map<string, string>();
    overrides.forEach((override) => {
      if (!codes.has(override.countryCode)) {
        codes.set(override.countryCode, override.countryName);
      }
    });
    return Array.from(codes.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [overrides]);

  const filteredOverrides = overrides
    .filter(override =>
      override.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      override.countryName.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(override =>
      (activeBrands.length === 0 || activeBrands.includes(override.brandName)) &&
      (activeCountries.length === 0 || activeCountries.includes(override.countryCode))
    );

  const hasActiveFilters = activeBrands.length > 0 || activeCountries.length > 0;

  const openAddDialog = () => {
    setEditingOverride(null);
    setFormData({
      brandName: '',
      countryCode: '',
      countryName: '',
      attributeOverrides: 1,
      lastModified: getTodayString(),
      modifiedBy: 'Admin User'
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (override: CountryOverride) => {
    setEditingOverride(override);
    setFormData({
      brandName: override.brandName,
      countryCode: override.countryCode,
      countryName: override.countryName,
      attributeOverrides: override.attributeOverrides,
      lastModified: override.lastModified,
      modifiedBy: override.modifiedBy
    });
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingOverride(null);
  };

  const handleFormChange = <K extends keyof Omit<CountryOverride, 'id'>>(field: K, value: Omit<CountryOverride, 'id'>[K]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (field === 'attributeOverrides'
        ? (Number(value) || 0)
        : value) as Omit<CountryOverride, 'id'>[K]
    }));
  };

  const handleSaveOverride = () => {
    if (!formData.brandName.trim() || !formData.countryCode.trim() || !formData.countryName.trim()) {
      return;
    }

    if (editingOverride) {
      setOverrides((prev) =>
        prev.map((override) =>
          override.id === editingOverride.id
            ? {
                ...override,
                brandName: formData.brandName.trim(),
                countryCode: formData.countryCode.trim().toUpperCase(),
                countryName: formData.countryName.trim(),
                attributeOverrides: Number(formData.attributeOverrides) || 0,
                modifiedBy: formData.modifiedBy.trim() || override.modifiedBy,
                lastModified: formData.lastModified || getTodayString()
              }
            : override
        )
      );
    } else {
      const newOverride: CountryOverride = {
        id: Math.random().toString(36).slice(2),
        brandName: formData.brandName.trim(),
        countryCode: formData.countryCode.trim().toUpperCase(),
        countryName: formData.countryName.trim(),
        attributeOverrides: Number(formData.attributeOverrides) || 0,
        modifiedBy: formData.modifiedBy.trim() || 'Admin User',
        lastModified: formData.lastModified || getTodayString()
      };
      setOverrides((prev) => [newOverride, ...prev]);
    }

    handleDialogClose();
  };

  const handleDeleteOverride = (id: string) => {
    if (window.confirm('Delete this override?')) {
      setOverrides((prev) => prev.filter((override) => override.id !== id));
    }
  };

  const toggleBrandFilter = (brand: string) => {
    setActiveBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const toggleCountryFilter = (code: string) => {
    setActiveCountries((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const clearFilters = () => {
    setActiveBrands([]);
    setActiveCountries([]);
  };

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
          <Button className="gap-2" onClick={openAddDialog}>
            <span className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center">
              <Plus className="w-5 h-5 text-on-primary-container" />
            </span>
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
                id="country-overrides-search"
                name="country-overrides-search"
                placeholder="Search by brand or country..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-11 pr-4 rounded-lg border border-outline bg-surface-container text-on-surface body-large placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <PopoverTrigger asChild>
                <Button variant={hasActiveFilters ? 'default' : 'outline'} className="gap-2">
                  <Filter className="w-5 h-5" />
                  <span>{hasActiveFilters ? 'Filters active' : 'Filter'}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-4 space-y-4" align="end">
                <div>
                  <div className="label-medium text-on-surface mb-2">Brands</div>
                  <div className="space-y-2 max-h-32 overflow-auto pr-1">
                    {uniqueBrands.map((brand) => (
                      <label key={brand} className="flex items-center gap-3 text-on-surface">
                        <Checkbox
                          checked={activeBrands.includes(brand)}
                          onCheckedChange={() => toggleBrandFilter(brand)}
                        />
                        <span className="body-medium">{brand}</span>
                      </label>
                    ))}
                    {uniqueBrands.length === 0 && (
                      <p className="body-small text-on-surface-variant">No brands available</p>
                    )}
                  </div>
                </div>
                <div>
                  <div className="label-medium text-on-surface mb-2">Countries</div>
                  <div className="space-y-2 max-h-32 overflow-auto pr-1">
                    {uniqueCountries.map(([code, name]) => (
                      <label key={code} className="flex items-center gap-3 text-on-surface">
                        <Checkbox
                          checked={activeCountries.includes(code)}
                          onCheckedChange={() => toggleCountryFilter(code)}
                        />
                        <span className="body-medium">{name} ({code})</span>
                      </label>
                    ))}
                    {uniqueCountries.length === 0 && (
                      <p className="body-small text-on-surface-variant">No countries available</p>
                    )}
                  </div>
                </div>
                <div className="flex justify-between">
                  <Button variant="ghost" onClick={clearFilters} className="px-3">
                    Clear filters
                  </Button>
                  <Button onClick={() => setIsFilterOpen(false)} className="px-4">
                    Apply
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
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
            <Button onClick={openAddDialog}>
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
                      className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-primary-container transition-colors"
                      aria-label="Edit override"
                      onClick={() => openEditDialog(override)}
                    >
                      <Edit2 className="w-5 h-5 text-on-primary-container" />
                    </button>
                    <button
                      className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-error-container transition-colors"
                      aria-label="Delete override"
                      onClick={() => handleDeleteOverride(override.id)}
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
      <Dialog open={isDialogOpen} onOpenChange={(open: boolean) => (open ? setIsDialogOpen(true) : handleDialogClose())}>
        <DialogContent className="bg-surface text-on-surface">
          <DialogHeader>
            <DialogTitle className="title-large">
              {editingOverride ? 'Edit override' : 'Add override'}
            </DialogTitle>
            <DialogDescription className="body-medium text-on-surface-variant">
              Define brand and country specific attribute overrides.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="lastModified" className="label-medium text-on-surface">Last modified</Label>
              <Input
                id="lastModified"
                value={formData.lastModified}
                onChange={(e) => handleFormChange('lastModified', e.target.value)}
                placeholder="YYYY-MM-DD"
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="brand" className="label-medium text-on-surface">Brand name</Label>
              <Input
                id="brand"
                value={formData.brandName}
                onChange={(e) => handleFormChange('brandName', e.target.value)}
                placeholder="e.g. H&M"
              />
            </div>
            <div className="grid gap-3 md:grid-cols-2 md:gap-4">
              <div className="grid gap-2">
                <Label htmlFor="countryCode" className="label-medium text-on-surface">Country code</Label>
                <Input
                  id="countryCode"
                  value={formData.countryCode}
                  onChange={(e) => handleFormChange('countryCode', e.target.value.toUpperCase())}
                  placeholder="SE"
                  maxLength={2}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="countryName" className="label-medium text-on-surface">Country name</Label>
                <Input
                  id="countryName"
                  value={formData.countryName}
                  onChange={(e) => handleFormChange('countryName', e.target.value)}
                  placeholder="Sweden"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="attributeOverrides" className="label-medium text-on-surface">Attribute overrides</Label>
              <Input
                id="attributeOverrides"
                type="number"
                min={0}
                value={formData.attributeOverrides}
                onChange={(e) => handleFormChange('attributeOverrides', Number(e.target.value))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="modifiedBy" className="label-medium text-on-surface">Modified by</Label>
              <Input
                id="modifiedBy"
                value={formData.modifiedBy}
                onChange={(e) => handleFormChange('modifiedBy', e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <Button variant="outline" onClick={handleDialogClose}>
              Cancel
            </Button>
            <Button onClick={handleSaveOverride}>
              {editingOverride ? 'Save changes' : 'Create override'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
