import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Store as StoreIcon,
  Globe,
  Building2,
  Search,
  Check,
  X,
  Edit2,
  Save
} from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { useMediaQuery } from './ui/use-mobile';

interface Brand {
  id: string;
  name: string;
  enabled: boolean;
  enabledForStoreApp: boolean;
  enabledForPartnerPortal: boolean;
}

interface Country {
  id: string;
  name: string;
  brandId: string;
  enabled: boolean;
  enabledForStoreApp: boolean;
  enabledForPartnerPortal: boolean;
}

interface Store {
  id: string;
  name: string;
  code: string;
  countryId: string;
  brandId: string;
  enabled: boolean;
  enabledForStoreApp: boolean;
  enabledForPartnerPortal: boolean;
}

interface MarketStoreManagementScreenProps {
  onBack: () => void;
}

type ViewMode = 'brands' | 'countries' | 'stores';
type EditMode = 'none' | 'brand' | 'country' | 'store';

export function MarketStoreManagementScreen({ onBack }: MarketStoreManagementScreenProps) {
  const isLargeScreen = useMediaQuery('(min-width: 640px)');
  
  // Mock initial data - in real app this would come from props or API
  const [brands, setBrands] = useState<Brand[]>([
    { id: '1', name: 'WEEKDAY', enabled: true, enabledForStoreApp: true, enabledForPartnerPortal: true },
    { id: '2', name: 'COS', enabled: true, enabledForStoreApp: true, enabledForPartnerPortal: true },
    { id: '3', name: 'Monki', enabled: true, enabledForStoreApp: true, enabledForPartnerPortal: false },
    { id: '4', name: 'H&M', enabled: true, enabledForStoreApp: true, enabledForPartnerPortal: true },
  ]);

  const [countries, setCountries] = useState<Country[]>([
    { id: '1', name: 'Sweden', brandId: '1', enabled: true, enabledForStoreApp: true, enabledForPartnerPortal: true },
    { id: '2', name: 'Denmark', brandId: '1', enabled: true, enabledForStoreApp: true, enabledForPartnerPortal: true },
    { id: '3', name: 'Norway', brandId: '1', enabled: true, enabledForStoreApp: true, enabledForPartnerPortal: false },
    { id: '9', name: 'Spain', brandId: '2', enabled: true, enabledForStoreApp: true, enabledForPartnerPortal: true },
    { id: '18', name: 'Sweden', brandId: '3', enabled: true, enabledForStoreApp: true, enabledForPartnerPortal: false },
    { id: '28', name: 'Germany', brandId: '4', enabled: true, enabledForStoreApp: true, enabledForPartnerPortal: true },
  ]);

  const [stores, setStores] = useState<Store[]>([
    { id: '1', name: 'Drottninggatan 63', code: 'SE0655', countryId: '1', brandId: '1', enabled: true, enabledForStoreApp: true, enabledForPartnerPortal: true },
    { id: '2', name: 'Södermalm Store', code: 'SE0656', countryId: '1', brandId: '1', enabled: true, enabledForStoreApp: true, enabledForPartnerPortal: false },
    { id: '3', name: 'Copenhagen Central', code: 'DK0123', countryId: '2', brandId: '1', enabled: true, enabledForStoreApp: true, enabledForPartnerPortal: true },
    { id: '10', name: 'Barcelona Passeig', code: 'ES0001', countryId: '9', brandId: '2', enabled: true, enabledForStoreApp: true, enabledForPartnerPortal: true },
  ]);

  const [viewMode, setViewMode] = useState<ViewMode>('brands');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null);
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [editMode, setEditMode] = useState<EditMode>('none');

  // Filter data based on search and selections
  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCountries = countries.filter(country => {
    const matchesSearch = country.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBrand = !selectedBrandId || country.brandId === selectedBrandId;
    return matchesSearch && matchesBrand;
  });

  const filteredStores = stores.filter(store => {
    const matchesSearch = 
      store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBrand = !selectedBrandId || store.brandId === selectedBrandId;
    const matchesCountry = !selectedCountryId || store.countryId === selectedCountryId;
    return matchesSearch && matchesBrand && matchesCountry;
  });

  const handleToggleBrandAccess = (brandId: string, field: 'enabledForStoreApp' | 'enabledForPartnerPortal') => {
    setBrands(brands.map(brand =>
      brand.id === brandId
        ? { ...brand, [field]: !brand[field] }
        : brand
    ));
  };

  const handleToggleCountryAccess = (countryId: string, field: 'enabledForStoreApp' | 'enabledForPartnerPortal') => {
    setCountries(countries.map(country =>
      country.id === countryId
        ? { ...country, [field]: !country[field] }
        : country
    ));
  };

  const handleToggleStoreAccess = (storeId: string, field: 'enabledForStoreApp' | 'enabledForPartnerPortal') => {
    setStores(stores.map(store =>
      store.id === storeId
        ? { ...store, [field]: !store[field] }
        : store
    ));
  };

  const handleAddNew = () => {
    setIsAddSheetOpen(true);
    if (viewMode === 'brands') setEditMode('brand');
    else if (viewMode === 'countries') setEditMode('country');
    else setEditMode('store');
  };

  const getBreadcrumb = () => {
    const parts: string[] = [];
    if (selectedBrandId) {
      const brand = brands.find(b => b.id === selectedBrandId);
      if (brand) parts.push(brand.name);
    }
    if (selectedCountryId && viewMode === 'stores') {
      const country = countries.find(c => c.id === selectedCountryId);
      if (country) parts.push(country.name);
    }
    return parts.join(' > ');
  };

  const renderBrandsView = () => (
    <div className="space-y-2">
      {filteredBrands.map((brand) => (
        <Card key={brand.id} className="p-4 border-outline-variant bg-surface-container">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-on-primary-container" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="title-medium text-on-surface mb-2">{brand.name}</h3>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="body-small text-on-surface-variant">Store App Access</span>
                  <button
                    onClick={() => handleToggleBrandAccess(brand.id, 'enabledForStoreApp')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      brand.enabledForStoreApp ? 'bg-primary' : 'bg-outline'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        brand.enabledForStoreApp ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="body-small text-on-surface-variant">Partner Portal Access</span>
                  <button
                    onClick={() => handleToggleBrandAccess(brand.id, 'enabledForPartnerPortal')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      brand.enabledForPartnerPortal ? 'bg-primary' : 'bg-outline'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        brand.enabledForPartnerPortal ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedBrandId(brand.id);
                setViewMode('countries');
              }}
              className="text-primary hover:bg-primary-container"
            >
              View Markets
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );

  const renderCountriesView = () => (
    <div className="space-y-2">
      {filteredCountries.map((country) => {
        const brand = brands.find(b => b.id === country.brandId);
        return (
          <Card key={country.id} className="p-4 border-outline-variant bg-surface-container">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-secondary-container flex items-center justify-center flex-shrink-0">
                <Globe className="w-5 h-5 text-on-secondary-container" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="title-medium text-on-surface">{country.name}</h3>
                  {brand && (
                    <Badge variant="outline" className="text-xs">
                      {brand.name}
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-2 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="body-small text-on-surface-variant">Store App Access</span>
                    <button
                      onClick={() => handleToggleCountryAccess(country.id, 'enabledForStoreApp')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        country.enabledForStoreApp ? 'bg-primary' : 'bg-outline'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          country.enabledForStoreApp ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="body-small text-on-surface-variant">Partner Portal Access</span>
                    <button
                      onClick={() => handleToggleCountryAccess(country.id, 'enabledForPartnerPortal')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        country.enabledForPartnerPortal ? 'bg-primary' : 'bg-outline'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          country.enabledForPartnerPortal ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedCountryId(country.id);
                  if (!selectedBrandId) setSelectedBrandId(country.brandId);
                  setViewMode('stores');
                }}
                className="text-primary hover:bg-primary-container"
              >
                View Stores
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );

  const renderStoresView = () => (
    <div className="space-y-2">
      {filteredStores.map((store) => {
        const country = countries.find(c => c.id === store.countryId);
        const brand = brands.find(b => b.id === store.brandId);
        return (
          <Card key={store.id} className="p-4 border-outline-variant bg-surface-container">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-tertiary-container flex items-center justify-center flex-shrink-0">
                <StoreIcon className="w-5 h-5 text-on-tertiary-container" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="title-medium text-on-surface">{store.name}</h3>
                  <Badge variant="outline" className="text-xs">
                    {store.code}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  {brand && (
                    <span className="body-small text-on-surface-variant">{brand.name}</span>
                  )}
                  {country && (
                    <>
                      <span className="text-on-surface-variant">•</span>
                      <span className="body-small text-on-surface-variant">{country.name}</span>
                    </>
                  )}
                </div>
                
                <div className="space-y-2 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="body-small text-on-surface-variant">Store App Access</span>
                    <button
                      onClick={() => handleToggleStoreAccess(store.id, 'enabledForStoreApp')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        store.enabledForStoreApp ? 'bg-primary' : 'bg-outline'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          store.enabledForStoreApp ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="body-small text-on-surface-variant">Partner Portal Access</span>
                    <button
                      onClick={() => handleToggleStoreAccess(store.id, 'enabledForPartnerPortal')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        store.enabledForPartnerPortal ? 'bg-primary' : 'bg-outline'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          store.enabledForPartnerPortal ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );

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
            <h1 className="title-large text-on-surface">Markets & Stores</h1>
            <p className="body-small text-on-surface-variant">
              Enable brands, markets, and stores for Store App and Partner Portal
            </p>
          </div>

          <Button
            onClick={handleAddNew}
            size="sm"
            className="bg-primary text-on-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New
          </Button>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="border-b border-outline-variant bg-surface">
        <div className="flex px-4 md:px-6">
          <button
            onClick={() => {
              setViewMode('brands');
              setSelectedBrandId(null);
              setSelectedCountryId(null);
            }}
            className={`px-4 py-3 border-b-2 transition-colors ${
              viewMode === 'brands'
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="label-large">Brands</span>
          </button>
          <button
            onClick={() => {
              setViewMode('countries');
              setSelectedCountryId(null);
            }}
            className={`px-4 py-3 border-b-2 transition-colors ${
              viewMode === 'countries'
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="label-large">Markets</span>
          </button>
          <button
            onClick={() => setViewMode('stores')}
            className={`px-4 py-3 border-b-2 transition-colors ${
              viewMode === 'stores'
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="label-large">Stores</span>
          </button>
        </div>
      </div>

      {/* Breadcrumb and Filters */}
      {(selectedBrandId || selectedCountryId) && (
        <div className="bg-surface-container-low px-4 md:px-6 py-3 border-b border-outline-variant">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                setSelectedBrandId(null);
                setSelectedCountryId(null);
                setViewMode('brands');
              }}
              className="text-primary hover:underline label-medium"
            >
              All Brands
            </button>
            {selectedBrandId && (
              <>
                <span className="text-on-surface-variant">/</span>
                <button
                  onClick={() => {
                    setSelectedCountryId(null);
                    setViewMode('countries');
                  }}
                  className="text-primary hover:underline label-medium"
                >
                  {brands.find(b => b.id === selectedBrandId)?.name}
                </button>
              </>
            )}
            {selectedCountryId && (
              <>
                <span className="text-on-surface-variant">/</span>
                <span className="label-medium text-on-surface">
                  {countries.find(c => c.id === selectedCountryId)?.name}
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="px-4 md:px-6 py-4 bg-surface">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
          <Input
            type="text"
            placeholder={`Search ${viewMode}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-surface-container border-outline-variant"
          />
        </div>
      </div>

      {/* Content */}
      <div className="px-4 md:px-6 py-4">
        {viewMode === 'brands' && renderBrandsView()}
        {viewMode === 'countries' && renderCountriesView()}
        {viewMode === 'stores' && renderStoresView()}

        {((viewMode === 'brands' && filteredBrands.length === 0) ||
          (viewMode === 'countries' && filteredCountries.length === 0) ||
          (viewMode === 'stores' && filteredStores.length === 0)) && (
          <Card className="p-12 border-outline-variant bg-surface-container text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center">
                <Search className="w-8 h-8 text-on-surface-variant" />
              </div>
              <div>
                <h3 className="title-medium text-on-surface mb-1">No results found</h3>
                <p className="body-medium text-on-surface-variant">
                  Try adjusting your search or filters
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Add New Sheet - Placeholder for future implementation */}
      <Sheet open={isAddSheetOpen} onOpenChange={setIsAddSheetOpen}>
        <SheetContent
          side={isLargeScreen ? "right" : "bottom"}
          className={`
            bg-surface-container-high border-outline-variant
            ${isLargeScreen ? 'h-full w-full max-w-md' : 'rounded-t-3xl max-h-[90vh]'}
          `}
        >
          <SheetHeader>
            <SheetTitle className="text-on-surface">
              Add New {editMode === 'brand' ? 'Brand' : editMode === 'country' ? 'Market' : 'Store'}
            </SheetTitle>
            <SheetDescription className="text-on-surface-variant">
              This feature will be implemented with backend integration
            </SheetDescription>
          </SheetHeader>
          
          <div className="mt-6">
            <p className="body-medium text-on-surface-variant">
              Adding new {editMode === 'brand' ? 'brands' : editMode === 'country' ? 'markets' : 'stores'} will be available once connected to the backend API.
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

