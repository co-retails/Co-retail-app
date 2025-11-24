import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import svgPaths from "../imports/svg-7un8q74kd7";
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
  Save,
  ChevronDown
} from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { useMediaQuery } from './ui/use-mobile';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Checkbox } from './ui/checkbox';

interface Brand {
  id: string;
  name: string;
  enabled: boolean;
  enabledForCoRetailApp: boolean;
}

interface Country {
  id: string;
  name: string;
  brandId: string;
  enabled: boolean;
  enabledForCoRetailApp: boolean;
}

interface Store {
  id: string;
  name: string;
  code: string;
  address?: string;
  salesPriceCurrency?: string;
  countryId: string;
  brandId: string;
  enabled: boolean;
  enabledForCoRetailApp: boolean;
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
    { id: '1', name: 'WEEKDAY', enabled: true, enabledForCoRetailApp: true },
    { id: '2', name: 'COS', enabled: true, enabledForCoRetailApp: true },
    { id: '3', name: 'Monki', enabled: true, enabledForCoRetailApp: false },
    { id: '4', name: 'H&M', enabled: true, enabledForCoRetailApp: true },
  ]);

  const [countries, setCountries] = useState<Country[]>([
    { id: '1', name: 'Sweden', brandId: '1', enabled: true, enabledForCoRetailApp: true },
    { id: '2', name: 'Denmark', brandId: '1', enabled: true, enabledForCoRetailApp: true },
    { id: '3', name: 'Norway', brandId: '1', enabled: true, enabledForCoRetailApp: false },
    { id: '9', name: 'Spain', brandId: '2', enabled: true, enabledForCoRetailApp: true },
    { id: '18', name: 'Sweden', brandId: '3', enabled: true, enabledForCoRetailApp: false },
    { id: '28', name: 'Germany', brandId: '4', enabled: true, enabledForCoRetailApp: true },
  ]);

  const [stores, setStores] = useState<Store[]>([
    { id: '1', name: 'Drottninggatan 63', code: 'SE0655', address: 'Drottninggatan 63, 111 36 Stockholm', countryId: '1', brandId: '1', enabled: true, enabledForCoRetailApp: true },
    { id: '2', name: 'Södermalm Store', code: 'SE0656', address: 'Götgatan 36, 118 30 Stockholm', countryId: '1', brandId: '1', enabled: true, enabledForCoRetailApp: false },
    { id: '3', name: 'Copenhagen Central', code: 'DK0123', address: 'Strøget 1, 1200 København', countryId: '2', brandId: '1', enabled: true, enabledForCoRetailApp: true },
    { id: '10', name: 'Barcelona Passeig', code: 'ES0001', address: 'Passeig de Gràcia 92, 08008 Barcelona', countryId: '9', brandId: '2', enabled: true, enabledForCoRetailApp: true },
  ]);

  const [viewMode, setViewMode] = useState<ViewMode>('brands');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrandIds, setSelectedBrandIds] = useState<string[]>([]);
  const [selectedMarketIds, setSelectedMarketIds] = useState<string[]>([]);
  const [selectedStoreIds, setSelectedStoreIds] = useState<string[]>([]);
  const [selectedCountryIds, setSelectedCountryIds] = useState<string[]>([]);
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [editMode, setEditMode] = useState<EditMode>('none');
  
  // Form state for Add New
  const [newBrandName, setNewBrandName] = useState('');
  const [newMarketCountry, setNewMarketCountry] = useState('');
  const [newMarketBrandId, setNewMarketBrandId] = useState('');
  const [newStoreCode, setNewStoreCode] = useState('');
  const [newStoreName, setNewStoreName] = useState('');
  const [newStoreAddress, setNewStoreAddress] = useState('');
  const [newStoreSalesPriceCurrency, setNewStoreSalesPriceCurrency] = useState('');
  const [newStoreBrandId, setNewStoreBrandId] = useState('');
  const [newStoreCountryId, setNewStoreCountryId] = useState('');

  // Filter data based on search and selections
  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCountries = countries.filter(country => {
    const matchesSearch = country.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBrand = selectedBrandIds.length === 0 || selectedBrandIds.includes(country.brandId);
    const matchesMarket = selectedMarketIds.length === 0 || selectedMarketIds.includes(country.id);
    return matchesSearch && matchesBrand && matchesMarket;
  });

  const filteredStores = stores.filter(store => {
    const matchesSearch = 
      store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBrand = selectedBrandIds.length === 0 || selectedBrandIds.includes(store.brandId);
    const matchesCountry = selectedCountryIds.length === 0 || selectedCountryIds.includes(store.countryId);
    const matchesStore = selectedStoreIds.length === 0 || selectedStoreIds.includes(store.id);
    return matchesSearch && matchesBrand && matchesCountry && matchesStore;
  });

  const handleToggleBrandAccess = (brandId: string) => {
    setBrands(brands.map(brand =>
      brand.id === brandId
        ? { ...brand, enabledForCoRetailApp: !brand.enabledForCoRetailApp }
        : brand
    ));
  };

  const handleToggleCountryAccess = (countryId: string) => {
    setCountries(countries.map(country =>
      country.id === countryId
        ? { ...country, enabledForCoRetailApp: !country.enabledForCoRetailApp }
        : country
    ));
  };

  const handleToggleStoreAccess = (storeId: string) => {
    setStores(stores.map(store =>
      store.id === storeId
        ? { ...store, enabledForCoRetailApp: !store.enabledForCoRetailApp }
        : store
    ));
  };

  const handleAddNew = () => {
    setIsAddSheetOpen(true);
    if (viewMode === 'brands') {
      setEditMode('brand');
      setNewBrandName('');
    } else if (viewMode === 'countries') {
      setEditMode('country');
      setNewMarketCountry('');
      setNewMarketBrandId('');
    } else {
      setEditMode('store');
      setNewStoreCode('');
      setNewStoreName('');
      setNewStoreAddress('');
      setNewStoreBrandId('');
      setNewStoreCountryId('');
    }
  };

  const handleSaveNewBrand = () => {
    if (!newBrandName.trim()) return;
    
    const newBrand: Brand = {
      id: `brand-${Date.now()}`,
      name: newBrandName.trim(),
      enabled: true,
      enabledForCoRetailApp: true // Auto-enabled
    };
    
    setBrands([...brands, newBrand]);
    setIsAddSheetOpen(false);
    setNewBrandName('');
  };

  const handleSaveNewMarket = () => {
    if (!newMarketCountry.trim() || !newMarketBrandId) return;
    
    const newMarket: Country = {
      id: `country-${Date.now()}`,
      name: newMarketCountry.trim(),
      brandId: newMarketBrandId,
      enabled: true,
      enabledForCoRetailApp: true // Auto-enabled
    };
    
    setCountries([...countries, newMarket]);
    setIsAddSheetOpen(false);
    setNewMarketCountry('');
    setNewMarketBrandId('');
  };

  const handleSaveNewStore = () => {
    if (!newStoreCode.trim() || !newStoreName.trim() || !newStoreAddress.trim() || !newStoreSalesPriceCurrency || !newStoreBrandId || !newStoreCountryId) return;
    
    const newStore: Store = {
      id: `store-${Date.now()}`,
      name: newStoreName.trim(),
      code: newStoreCode.trim(),
      address: newStoreAddress.trim(),
      salesPriceCurrency: newStoreSalesPriceCurrency,
      countryId: newStoreCountryId,
      brandId: newStoreBrandId,
      enabled: true,
      enabledForCoRetailApp: true // Auto-enabled
    };
    
    setStores([...stores, newStore]);
    setIsAddSheetOpen(false);
    setNewStoreCode('');
    setNewStoreName('');
    setNewStoreAddress('');
    setNewStoreSalesPriceCurrency('');
    setNewStoreBrandId('');
    setNewStoreCountryId('');
  };

  const getBreadcrumb = () => {
    const parts: string[] = [];
    if (selectedBrandIds.length === 1) {
      const brand = brands.find(b => b.id === selectedBrandIds[0]);
      if (brand) parts.push(brand.name);
    } else if (selectedBrandIds.length > 1) {
      parts.push(`${selectedBrandIds.length} brands`);
    }
    if (selectedCountryIds.length === 1 && viewMode === 'stores') {
      const country = countries.find(c => c.id === selectedCountryIds[0]);
      if (country) parts.push(country.name);
    } else if (selectedCountryIds.length > 1 && viewMode === 'stores') {
      parts.push(`${selectedCountryIds.length} markets`);
    }
    return parts.join(' > ');
  };

  const renderBrandsView = () => (
    <div className="space-y-3 max-w-4xl mx-auto">
      {filteredBrands.map((brand) => (
          <Card key={brand.id} className="p-4 md:p-6 border-outline-variant bg-surface-container">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-on-primary-container" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="title-medium text-on-surface mb-3">{brand.name}</h3>
              
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="label-medium text-on-surface">Co-retail app</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`label-small ${brand.enabledForCoRetailApp ? 'text-primary font-medium' : 'text-on-surface-variant'}`}>
                    {brand.enabledForCoRetailApp ? 'On' : 'Off'}
                  </span>
                  <button
                    onClick={() => handleToggleBrandAccess(brand.id)}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-200 ${
                      brand.enabledForCoRetailApp 
                        ? 'bg-primary' 
                        : 'bg-surface-container border-2 border-outline'
                    }`}
                    aria-label={`Toggle Co-retail app access for ${brand.name}`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full shadow-lg transition-all duration-200 ${
                        brand.enabledForCoRetailApp ? 'ring-2 ring-white/30' : ''
                      }`}
                      style={{ 
                        backgroundColor: '#FFFFFF',
                        transform: brand.enabledForCoRetailApp ? 'translateX(32px)' : 'translateX(4px)'
                      }}
                    />
                  </button>
                </div>
              </div>
              </div>
            
            <div className="flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedBrandIds([brand.id]);
                  setViewMode('countries');
                }}
                className="text-primary hover:bg-primary-container hidden md:flex"
              >
                View Markets
              </Button>
              <button
                onClick={() => {
                  setSelectedBrandIds([brand.id]);
                  setViewMode('countries');
                }}
                className="md:hidden text-primary hover:bg-primary-container p-2 rounded-full transition-colors"
                aria-label="View Markets"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  const renderCountriesView = () => (
    <div className="space-y-3 max-w-4xl mx-auto">
      {filteredCountries.map((country) => {
        const brand = brands.find(b => b.id === country.brandId);
        return (
          <Card key={country.id} className="p-4 md:p-6 border-outline-variant bg-surface-container">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary-container flex items-center justify-center flex-shrink-0">
                <Globe className="w-5 h-5 text-on-secondary-container" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <h3 className="title-medium text-on-surface">{country.name}</h3>
                  {brand && (
                    <Badge variant="outline" className="text-xs">
                      {brand.name}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center justify-between gap-3 mt-3">
                  <div className="flex-1">
                    <div className="label-medium text-on-surface">Co-retail app</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`label-small ${country.enabledForCoRetailApp ? 'text-primary font-medium' : 'text-on-surface-variant'}`}>
                      {country.enabledForCoRetailApp ? 'On' : 'Off'}
                    </span>
                    <button
                      onClick={() => handleToggleCountryAccess(country.id)}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-200 ${
                        country.enabledForCoRetailApp 
                          ? 'bg-primary' 
                          : 'bg-surface-container border-2 border-outline'
                      }`}
                      aria-label={`Toggle Co-retail app access for ${country.name}`}
                    >
                        <span
                          className={`inline-block h-6 w-6 transform rounded-full shadow-lg transition-all duration-200 ${
                            country.enabledForCoRetailApp ? 'ring-2 ring-white/30' : ''
                          }`}
                          style={{ 
                            backgroundColor: '#FFFFFF',
                            transform: country.enabledForCoRetailApp ? 'translateX(32px)' : 'translateX(4px)'
                          }}
                        />
                    </button>
                  </div>
                </div>
              </div>
              
            <div className="flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedCountryIds([country.id]);
                  if (selectedBrandIds.length === 0) setSelectedBrandIds([country.brandId]);
                  setViewMode('stores');
                }}
                className="text-primary hover:bg-primary-container hidden md:flex"
              >
                View Stores
              </Button>
              <button
                onClick={() => {
                  setSelectedCountryIds([country.id]);
                  if (selectedBrandIds.length === 0) setSelectedBrandIds([country.brandId]);
                  setViewMode('stores');
                }}
                className="md:hidden text-primary hover:bg-primary-container p-2 rounded-full transition-colors"
                aria-label="View Stores"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </Card>
        );
      })}
    </div>
  );

  const renderStoresView = () => (
    <div className="space-y-3 max-w-4xl mx-auto">
      {filteredStores.map((store) => {
        const country = countries.find(c => c.id === store.countryId);
        const brand = brands.find(b => b.id === store.brandId);
        return (
          <Card key={store.id} className="p-4 md:p-6 border-outline-variant bg-surface-container">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-tertiary-container flex items-center justify-center flex-shrink-0">
                <StoreIcon className="w-5 h-5 text-on-tertiary-container" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="title-medium text-on-surface">{store.name}</h3>
                  <Badge variant="outline" className="text-xs">
                    {store.code}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2 mb-3 flex-wrap">
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
                
                {store.address && (
                  <div className="body-small text-on-surface-variant mb-3">
                    {store.address}
                  </div>
                )}
                
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="label-medium text-on-surface">Co-retail app</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`label-small ${store.enabledForCoRetailApp ? 'text-primary font-medium' : 'text-on-surface-variant'}`}>
                      {store.enabledForCoRetailApp ? 'On' : 'Off'}
                    </span>
                    <button
                      onClick={() => handleToggleStoreAccess(store.id)}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-200 ${
                        store.enabledForCoRetailApp 
                          ? 'bg-primary' 
                          : 'bg-surface-container border-2 border-outline'
                      }`}
                      aria-label={`Toggle Co-retail app access for ${store.name}`}
                    >
                        <span
                          className={`inline-block h-6 w-6 transform rounded-full shadow-lg transition-all duration-200 ${
                            store.enabledForCoRetailApp ? 'ring-2 ring-white/30' : ''
                          }`}
                          style={{ 
                            backgroundColor: '#FFFFFF',
                            transform: store.enabledForCoRetailApp ? 'translateX(32px)' : 'translateX(4px)'
                          }}
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
              Enable brands, markets, and stores for Co-retail app
            </p>
          </div>

          <Button
            onClick={handleAddNew}
            className="bg-primary text-on-primary hover:bg-primary/90 h-10"
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
              setSelectedBrandIds([]);
              setSelectedMarketIds([]);
              setSelectedStoreIds([]);
              setSelectedCountryIds([]);
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
              setSelectedCountryIds([]);
              setSelectedMarketIds([]);
              setSelectedStoreIds([]);
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
            onClick={() => {
              setViewMode('stores');
              setSelectedMarketIds([]);
              setSelectedStoreIds([]);
            }}
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

      {/* Filters */}
      {(viewMode === 'countries' || viewMode === 'stores') && (
        <div className="bg-surface-container-low px-4 md:px-6 py-3 border-b border-outline-variant">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Brand Filter */}
            <div className="flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="label-medium text-on-surface-variant">Brand:</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="flex items-center justify-between gap-2 w-[200px] min-h-[40px] px-3 py-2 bg-surface-container-high border border-outline rounded-lg text-on-surface label-medium hover:bg-surface-container-highest transition-colors">
                      <span className="truncate">
                        {selectedBrandIds.length === 0
                          ? 'All brands'
                          : selectedBrandIds.length === brands.length
                          ? 'All brands'
                          : selectedBrandIds.length === 1
                          ? brands.find(b => b.id === selectedBrandIds[0])?.name || '1 selected'
                          : `${selectedBrandIds.length} selected`}
                      </span>
                      <ChevronDown className="w-4 h-4 opacity-50 flex-shrink-0" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-[200px] p-1 bg-surface border-outline">
                    <div className="max-h-[300px] overflow-y-auto">
                      <div
                        className="flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-surface-container-high cursor-pointer"
                        onClick={() => {
                          const allSelected = selectedBrandIds.length === brands.length;
                          setSelectedBrandIds(allSelected ? [] : brands.map(b => b.id));
                          setSelectedMarketIds([]);
                          setSelectedStoreIds([]);
                          if (viewMode === 'stores') {
                            setSelectedCountryIds([]);
                          }
                        }}
                      >
                        <Checkbox
                          checked={selectedBrandIds.length === brands.length}
                          onCheckedChange={(checked: boolean) => {
                            setSelectedBrandIds(checked ? brands.map(b => b.id) : []);
                            setSelectedMarketIds([]);
                            setSelectedStoreIds([]);
                            setSelectedCountryIds([]);
                          }}
                        />
                        <span className="body-medium text-on-surface">All brands</span>
                      </div>
                      <div className="h-px bg-outline-variant my-1" />
                      {brands.map((brand) => (
                        <div
                          key={brand.id}
                          className="flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-surface-container-high cursor-pointer"
                          onClick={() => {
                            if (selectedBrandIds.includes(brand.id)) {
                              setSelectedBrandIds(prev => prev.filter(id => id !== brand.id));
                            } else {
                              setSelectedBrandIds(prev => [...prev, brand.id]);
                            }
                            setSelectedMarketIds([]);
                            setSelectedStoreIds([]);
                            setSelectedCountryIds([]);
                          }}
                        >
                          <Checkbox
                            checked={selectedBrandIds.includes(brand.id)}
                            onCheckedChange={(checked: boolean) => {
                              if (checked) {
                                setSelectedBrandIds(prev => [...prev, brand.id]);
                              } else {
                                setSelectedBrandIds(prev => prev.filter(id => id !== brand.id));
                              }
                              setSelectedMarketIds([]);
                              setSelectedStoreIds([]);
                              if (viewMode === 'stores') {
                                setSelectedCountryIds([]);
                              }
                            }}
                          />
                          <span className="body-medium text-on-surface">{brand.name}</span>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Market Filter (in Markets view) */}
            {viewMode === 'countries' && (
              <div className="flex-shrink-0">
                <div className="flex items-center gap-2">
                  <span className="label-medium text-on-surface-variant">Market:</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button 
                        className="flex items-center justify-between gap-2 w-[200px] min-h-[40px] px-3 py-2 bg-surface-container-high border border-outline rounded-lg text-on-surface label-medium hover:bg-surface-container-highest transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={selectedBrandIds.length === 0}
                      >
                        <span className="truncate">
                          {selectedBrandIds.length === 0
                            ? 'Select brand first'
                            : (() => {
                                const availableMarkets = countries.filter(c => selectedBrandIds.includes(c.brandId));
                                if (selectedMarketIds.length === 0) {
                                  return 'All markets';
                                } else if (selectedMarketIds.length === availableMarkets.length) {
                                  return 'All markets';
                                } else if (selectedMarketIds.length === 1) {
                                  return countries.find(c => c.id === selectedMarketIds[0])?.name || '1 selected';
                                } else {
                                  return `${selectedMarketIds.length} selected`;
                                }
                              })()}
                        </span>
                        <ChevronDown className="w-4 h-4 opacity-50 flex-shrink-0" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-[200px] p-1 bg-surface border-outline">
                      <div className="max-h-[300px] overflow-y-auto">
                        {(() => {
                          const availableMarkets = countries.filter(c => selectedBrandIds.includes(c.brandId));
                          return (
                            <>
                              <div
                                className="flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-surface-container-high cursor-pointer"
                                onClick={() => {
                                  setSelectedMarketIds(selectedMarketIds.length === availableMarkets.length ? [] : availableMarkets.map(m => m.id));
                                }}
                              >
                                <Checkbox
                                  checked={selectedMarketIds.length === availableMarkets.length && availableMarkets.length > 0}
                                  onCheckedChange={(checked: boolean) => {
                                    setSelectedMarketIds(checked ? availableMarkets.map(m => m.id) : []);
                                  }}
                                />
                                <span className="body-medium text-on-surface">All markets</span>
                              </div>
                              <div className="h-px bg-outline-variant my-1" />
                              {availableMarkets.map((market) => (
                                <div
                                  key={market.id}
                                  className="flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-surface-container-high cursor-pointer"
                                  onClick={() => {
                                    if (selectedMarketIds.includes(market.id)) {
                                      setSelectedMarketIds(prev => prev.filter(id => id !== market.id));
                                    } else {
                                      setSelectedMarketIds(prev => [...prev, market.id]);
                                    }
                                  }}
                                >
                                  <Checkbox
                                    checked={selectedMarketIds.includes(market.id)}
                                    onCheckedChange={(checked: boolean) => {
                                      if (checked) {
                                        setSelectedMarketIds(prev => [...prev, market.id]);
                                      } else {
                                        setSelectedMarketIds(prev => prev.filter(id => id !== market.id));
                                      }
                                    }}
                                  />
                                  <span className="body-medium text-on-surface">{market.name}</span>
                                </div>
                              ))}
                            </>
                          );
                        })()}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}

            {/* Market Filter (only in Stores view) */}
            {viewMode === 'stores' && (
              <div className="flex-shrink-0">
                <div className="flex items-center gap-2">
                  <span className="label-medium text-on-surface-variant">Market:</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button 
                        className="flex items-center justify-between gap-2 w-[200px] min-h-[40px] px-3 py-2 bg-surface-container-high border border-outline rounded-lg text-on-surface label-medium hover:bg-surface-container-highest transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={selectedBrandIds.length === 0}
                      >
                        <span className="truncate">
                          {selectedBrandIds.length === 0
                            ? 'Select brand first'
                            : (() => {
                                const availableMarkets = countries.filter(c => selectedBrandIds.includes(c.brandId));
                                if (selectedCountryIds.length === 0) {
                                  return 'All markets';
                                } else if (selectedCountryIds.length === availableMarkets.length) {
                                  return 'All markets';
                                } else if (selectedCountryIds.length === 1) {
                                  return countries.find(c => c.id === selectedCountryIds[0])?.name || '1 selected';
                                } else {
                                  return `${selectedCountryIds.length} selected`;
                                }
                              })()}
                        </span>
                        <ChevronDown className="w-4 h-4 opacity-50 flex-shrink-0" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-[200px] p-1 bg-surface border-outline">
                      <div className="max-h-[300px] overflow-y-auto">
                        {(() => {
                          const availableMarkets = countries.filter(c => selectedBrandIds.includes(c.brandId));
                          return (
                            <>
                              <div
                                className="flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-surface-container-high cursor-pointer"
                                onClick={() => {
                                  setSelectedCountryIds(selectedCountryIds.length === availableMarkets.length ? [] : availableMarkets.map(m => m.id));
                                }}
                              >
                                <Checkbox
                                  checked={selectedCountryIds.length === availableMarkets.length && availableMarkets.length > 0}
                                  onCheckedChange={(checked: boolean) => {
                                    setSelectedCountryIds(checked ? availableMarkets.map(m => m.id) : []);
                                  }}
                                />
                                <span className="body-medium text-on-surface">All markets</span>
                              </div>
                              <div className="h-px bg-outline-variant my-1" />
                              {availableMarkets.map((market) => (
                                <div
                                  key={market.id}
                                  className="flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-surface-container-high cursor-pointer"
                                  onClick={() => {
                                    if (selectedCountryIds.includes(market.id)) {
                                      setSelectedCountryIds(prev => prev.filter(id => id !== market.id));
                                    } else {
                                      setSelectedCountryIds(prev => [...prev, market.id]);
                                    }
                                  }}
                                >
                                  <Checkbox
                                    checked={selectedCountryIds.includes(market.id)}
                                    onCheckedChange={(checked: boolean) => {
                                      if (checked) {
                                        setSelectedCountryIds(prev => [...prev, market.id]);
                                      } else {
                                        setSelectedCountryIds(prev => prev.filter(id => id !== market.id));
                                      }
                                    }}
                                  />
                                  <span className="body-medium text-on-surface">{market.name}</span>
                                </div>
                              ))}
                            </>
                          );
                        })()}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}

            {/* Store Filter (only in Stores view) */}
            {viewMode === 'stores' && (
              <div className="flex-shrink-0">
                <div className="flex items-center gap-2">
                  <span className="label-medium text-on-surface-variant">Store:</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button 
                        className="flex items-center justify-between gap-2 w-[200px] min-h-[40px] px-3 py-2 bg-surface-container-high border border-outline rounded-lg text-on-surface label-medium hover:bg-surface-container-highest transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={selectedBrandIds.length === 0}
                      >
                        <span className="truncate">
                          {selectedBrandIds.length === 0
                            ? 'Select brand first'
                            : (() => {
                                const availableStores = stores.filter(s => selectedBrandIds.includes(s.brandId));
                                if (selectedStoreIds.length === 0) {
                                  return 'All stores';
                                } else if (selectedStoreIds.length === availableStores.length) {
                                  return 'All stores';
                                } else if (selectedStoreIds.length === 1) {
                                  return stores.find(s => s.id === selectedStoreIds[0])?.name || '1 selected';
                                } else {
                                  return `${selectedStoreIds.length} selected`;
                                }
                              })()}
                        </span>
                        <ChevronDown className="w-4 h-4 opacity-50 flex-shrink-0" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-[200px] p-1 bg-surface border-outline">
                      <div className="max-h-[300px] overflow-y-auto">
                        {(() => {
                          const availableStores = stores.filter(s => selectedBrandIds.includes(s.brandId));
                          return (
                            <>
                              <div
                                className="flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-surface-container-high cursor-pointer"
                                onClick={() => {
                                  setSelectedStoreIds(selectedStoreIds.length === availableStores.length ? [] : availableStores.map(s => s.id));
                                }}
                              >
                                <Checkbox
                                  checked={selectedStoreIds.length === availableStores.length && availableStores.length > 0}
                                  onCheckedChange={(checked: boolean) => {
                                    setSelectedStoreIds(checked ? availableStores.map(s => s.id) : []);
                                  }}
                                />
                                <span className="body-medium text-on-surface">All stores</span>
                              </div>
                              <div className="h-px bg-outline-variant my-1" />
                              {availableStores.map((store) => {
                                const country = countries.find(c => c.id === store.countryId);
                                return (
                                  <div
                                    key={store.id}
                                    className="flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-surface-container-high cursor-pointer"
                                    onClick={() => {
                                      if (selectedStoreIds.includes(store.id)) {
                                        setSelectedStoreIds(prev => prev.filter(id => id !== store.id));
                                      } else {
                                        setSelectedStoreIds(prev => [...prev, store.id]);
                                      }
                                    }}
                                  >
                                    <Checkbox
                                      checked={selectedStoreIds.includes(store.id)}
                                      onCheckedChange={(checked: boolean) => {
                                        if (checked) {
                                          setSelectedStoreIds(prev => [...prev, store.id]);
                                        } else {
                                          setSelectedStoreIds(prev => prev.filter(id => id !== store.id));
                                        }
                                      }}
                                    />
                                    <div className="flex-1 min-w-0">
                                      <span className="body-medium text-on-surface block truncate">{store.name}</span>
                                      {country && (
                                        <span className="body-small text-on-surface-variant">{country.name}</span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </>
                          );
                        })()}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}

            {/* Clear Filters Button */}
            {(selectedBrandIds.length > 0 || selectedMarketIds.length > 0 || selectedStoreIds.length > 0 || selectedCountryIds.length > 0) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedBrandIds([]);
                  setSelectedMarketIds([]);
                  setSelectedStoreIds([]);
                  setSelectedCountryIds([]);
                }}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Breadcrumb (kept for navigation clarity) */}
      {(selectedBrandIds.length > 0 || selectedCountryIds.length > 0) && (
        <div className="bg-surface-container-low px-4 md:px-6 py-2 border-b border-outline-variant">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                setSelectedBrandIds([]);
                setSelectedCountryIds([]);
                setViewMode('brands');
              }}
              className="text-primary hover:underline label-small"
            >
              All Brands
            </button>
            {selectedBrandIds.length > 0 && (
              <>
                <span className="text-on-surface-variant">/</span>
                <button
                  onClick={() => {
                    setSelectedCountryIds([]);
                    setViewMode('countries');
                  }}
                  className="text-primary hover:underline label-small"
                >
                  {selectedBrandIds.length === 1 
                    ? brands.find(b => b.id === selectedBrandIds[0])?.name 
                    : `${selectedBrandIds.length} brands`}
                </button>
              </>
            )}
            {selectedCountryIds.length > 0 && (
              <>
                <span className="text-on-surface-variant">/</span>
                <span className="label-small text-on-surface">
                  {selectedCountryIds.length === 1 
                    ? countries.find(c => c.id === selectedCountryIds[0])?.name 
                    : `${selectedCountryIds.length} markets`}
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="px-4 md:px-6 py-4 bg-surface">
        <div className="relative w-full md:max-w-2xl">
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5">
              <svg className="w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                <path clipRule="evenodd" d={svgPaths.p3938ac00} fill="var(--on-surface-variant)" fillRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              placeholder={`Search ${viewMode}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-10 pr-4 bg-surface-container rounded-lg border border-outline-variant focus:border-primary focus:outline-none text-on-surface body-large"
            />
          </div>
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
          <Card className="p-8 md:p-12 border-outline-variant bg-surface-container text-center max-w-4xl mx-auto">
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

      {/* Add New Sheet */}
      <Sheet open={isAddSheetOpen} onOpenChange={setIsAddSheetOpen}>
        <SheetContent
          side={isLargeScreen ? "right" : "bottom"}
          className={`
            bg-surface border-outline-variant flex flex-col p-0
            ${isLargeScreen ? 'h-full w-full max-w-md' : 'rounded-t-3xl max-h-[90vh]'}
          `}
        >
          {/* Header */}
          <SheetHeader className="px-6 pt-6 pb-4 border-b border-outline-variant flex-shrink-0">
            <SheetTitle className="title-large text-on-surface">
              Add New {editMode === 'brand' ? 'Brand' : editMode === 'country' ? 'Market' : 'Store'}
            </SheetTitle>
            <SheetDescription className="body-medium text-on-surface-variant mt-2">
              {editMode === 'brand' && 'Create a new brand. The Co-retail app toggle will be enabled automatically.'}
              {editMode === 'country' && 'Create a new market. The Co-retail app toggle will be enabled automatically.'}
              {editMode === 'store' && 'Create a new store. The Co-retail app toggle will be enabled automatically.'}
            </SheetDescription>
          </SheetHeader>
          
          {/* Form Content - Scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {editMode === 'brand' && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="brand-name" className="label-large text-on-surface mb-2 block">
                    Brand Name *
                  </Label>
                  <Input
                    id="brand-name"
                    type="text"
                    placeholder="Enter brand name"
                    value={newBrandName}
                    onChange={(e) => setNewBrandName(e.target.value)}
                    className="bg-surface border-outline h-12 body-large"
                  />
                </div>
              </div>
            )}

            {editMode === 'country' && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="market-country" className="label-large text-on-surface mb-2 block">
                    Country *
                  </Label>
                  <Input
                    id="market-country"
                    type="text"
                    placeholder="Enter country name"
                    value={newMarketCountry}
                    onChange={(e) => setNewMarketCountry(e.target.value)}
                    className="bg-surface border-outline h-12 body-large"
                  />
                </div>
                
                <div>
                  <Label htmlFor="market-brand" className="label-large text-on-surface mb-2 block">
                    Brand *
                  </Label>
                  <Select
                    value={newMarketBrandId}
                    onValueChange={(value: string) => setNewMarketBrandId(value)}
                  >
                    <SelectTrigger className="bg-surface border-outline h-12 body-large">
                      <SelectValue placeholder="Select a brand" />
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
              </div>
            )}

            {editMode === 'store' && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="store-code" className="label-large text-on-surface mb-2 block">
                    Store Code *
                  </Label>
                  <Input
                    id="store-code"
                    type="text"
                    placeholder="Enter store code"
                    value={newStoreCode}
                    onChange={(e) => setNewStoreCode(e.target.value)}
                    className="bg-surface border-outline h-12 body-large"
                  />
                </div>
                
                <div>
                  <Label htmlFor="store-name" className="label-large text-on-surface mb-2 block">
                    Store Name *
                  </Label>
                  <Input
                    id="store-name"
                    type="text"
                    placeholder="Enter store name"
                    value={newStoreName}
                    onChange={(e) => setNewStoreName(e.target.value)}
                    className="bg-surface border-outline h-12 body-large"
                  />
                </div>
                
                <div>
                  <Label htmlFor="store-address" className="label-large text-on-surface mb-2 block">
                    Store Address *
                  </Label>
                  <Textarea
                    id="store-address"
                    placeholder="Enter store address"
                    value={newStoreAddress}
                    onChange={(e) => setNewStoreAddress(e.target.value)}
                    className="bg-surface border-outline min-h-[100px] body-large resize-none"
                    rows={4}
                  />
                </div>
                
                <div>
                  <Label htmlFor="store-sales-price-currency" className="label-large text-on-surface mb-2 block">
                    Sales Price Currency *
                  </Label>
                  <Select
                    value={newStoreSalesPriceCurrency}
                    onValueChange={(value: string) => setNewStoreSalesPriceCurrency(value)}
                  >
                    <SelectTrigger className="bg-surface border-outline h-12 body-large">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SEK">SEK - Swedish Krona</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      <SelectItem value="DKK">DKK - Danish Krone</SelectItem>
                      <SelectItem value="NOK">NOK - Norwegian Krone</SelectItem>
                      <SelectItem value="CHF">CHF - Swiss Franc</SelectItem>
                      <SelectItem value="PLN">PLN - Polish Zloty</SelectItem>
                      <SelectItem value="CZK">CZK - Czech Koruna</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="store-brand" className="label-large text-on-surface mb-2 block">
                    Brand *
                  </Label>
                  <Select
                    value={newStoreBrandId}
                    onValueChange={(value: string) => {
                      setNewStoreBrandId(value);
                      setNewStoreCountryId(''); // Reset country when brand changes
                    }}
                  >
                    <SelectTrigger className="bg-surface border-outline h-12 body-large">
                      <SelectValue placeholder="Select a brand" />
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
                
                <div>
                  <Label htmlFor="store-market" className="label-large text-on-surface mb-2 block">
                    Market *
                  </Label>
                  <Select
                    value={newStoreCountryId}
                    onValueChange={(value: string) => setNewStoreCountryId(value)}
                    disabled={!newStoreBrandId}
                  >
                    <SelectTrigger className="bg-surface border-outline h-12 body-large disabled:opacity-50">
                      <SelectValue placeholder={newStoreBrandId ? "Select a market" : "Select brand first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {countries
                        .filter(c => c.brandId === newStoreBrandId)
                        .map((country) => (
                          <SelectItem key={country.id} value={country.id}>
                            {country.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          {/* Footer with Actions - Fixed at bottom */}
          <div className="px-6 py-4 border-t border-outline-variant flex-shrink-0 bg-surface">
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setIsAddSheetOpen(false)}
                className="flex-1 h-12 body-large"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (editMode === 'brand') handleSaveNewBrand();
                  else if (editMode === 'country') handleSaveNewMarket();
                  else if (editMode === 'store') handleSaveNewStore();
                }}
                disabled={
                  editMode === 'brand' ? !newBrandName.trim() :
                  editMode === 'country' ? (!newMarketCountry.trim() || !newMarketBrandId) :
                  (!newStoreCode.trim() || !newStoreName.trim() || !newStoreAddress.trim() || !newStoreSalesPriceCurrency || !newStoreBrandId || !newStoreCountryId)
                }
                className="flex-1 h-12 bg-primary text-on-primary hover:bg-primary/90 body-large"
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

