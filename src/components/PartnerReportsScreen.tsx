import { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';
import { Checkbox } from './ui/checkbox';
import PartnerSalesReport, { SalesDataPoint } from './PartnerSalesReport';
import PartnerStockReport, { StockReportData, TimePeriod } from './PartnerStockReport';
import PartnerItemStatusReport from './PartnerItemStatusReport';
import type { Store, Brand, Country } from './StoreSelector';
import { Partner as WarehousePartner } from './PartnerWarehouseSelector';
import type { Item } from './ItemsScreen';
import type { CurrencyCode } from './PortalConfigTypes';

export interface PartnerReportsScreenProps {
  onBack: () => void;
  salesData: SalesDataPoint[];
  stockData: StockReportData;
  items: Item[];
  stores: Store[];
  brands: Brand[];
  countries: Country[];
  partners: WarehousePartner[];
  partnerId?: string;
  currentUserRole?: 'admin' | 'partner' | 'store-staff' | 'buyer';
}

type ReportTab = 'sales' | 'stock' | 'item-status';
type UnifiedTimePeriod = 'month' | 'daily' | 'week' | 'sevenDays' | 'fourteenDays' | 'thirtyDays' | 'dateRange';

export default function PartnerReportsScreen({
  onBack,
  salesData,
  stockData,
  items,
  stores,
  brands,
  countries,
  partners,
  partnerId,
  currentUserRole = 'partner'
}: PartnerReportsScreenProps) {
  const [activeTab, setActiveTab] = useState<ReportTab>('sales');
  
  // Determine if user can change partner filter (Admins and Brand Admins)
  const canChangePartner = currentUserRole === 'admin' || currentUserRole === 'store-staff';
  
  // Global filter state - unified time period for both reports
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<UnifiedTimePeriod>('month');
  const [selectedPartnerIds, setSelectedPartnerIds] = useState<string[]>(partnerId ? [partnerId] : []);
  const [selectedBrandIds, setSelectedBrandIds] = useState<string[]>([]);
  const [selectedCountryIds, setSelectedCountryIds] = useState<string[]>([]);
  const [selectedStoreIds, setSelectedStoreIds] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(
    salesData[salesData.length - 1]?.month || ''
  );
  const [selectedWeek, setSelectedWeek] = useState<string>('');
  const [dateRangeStart, setDateRangeStart] = useState<string>('');
  const [dateRangeEnd, setDateRangeEnd] = useState<string>('');
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>('SEK');

  // Set partner filter to current partner if user is a partner
  useEffect(() => {
    if (!canChangePartner && partnerId) {
      setSelectedPartnerIds([partnerId]);
    }
  }, [canChangePartner, partnerId]);

  // Get all brand IDs from selected partners
  const selectedPartnerBrandIds = useMemo(() => {
    if (selectedPartnerIds.length === 0 || !canChangePartner) {
      return null; // null means all brands
    }
    const allBrandIds = new Set<string>();
    selectedPartnerIds.forEach(partnerId => {
      const partner = partners.find(p => p.id === partnerId);
      if (partner?.brandIds) {
        partner.brandIds.forEach(brandId => allBrandIds.add(brandId));
      }
    });
    return Array.from(allBrandIds);
  }, [selectedPartnerIds, partners, canChangePartner]);

  // Filter available brands, countries, and stores based on selected partners
  const filteredBrands = useMemo(() => {
    if (!selectedPartnerBrandIds) {
      return brands;
    }
    return brands.filter(brand => selectedPartnerBrandIds.includes(brand.id));
  }, [selectedPartnerBrandIds, brands]);

  const filteredCountries = useMemo(() => {
    if (!selectedPartnerBrandIds) {
      return countries;
    }
    return countries.filter(country => 
      selectedPartnerBrandIds.includes(country.brandId)
    );
  }, [selectedPartnerBrandIds, countries]);

  const filteredStores = useMemo(() => {
    if (!selectedPartnerBrandIds) {
      return stores;
    }
    return stores.filter(store => 
      selectedPartnerBrandIds.includes(store.brandId)
    );
  }, [selectedPartnerBrandIds, stores]);

  // Reset brand/country/store filters when partner changes
  useEffect(() => {
    if (selectedPartnerBrandIds && canChangePartner) {
      // Remove filters that are no longer valid for the selected partners
      setSelectedBrandIds(prev => prev.filter(id => selectedPartnerBrandIds.includes(id)));
      setSelectedCountryIds(prev => {
        return prev.filter(id => {
          const country = countries.find(c => c.id === id);
          return country && selectedPartnerBrandIds.includes(country.brandId);
        });
      });
      setSelectedStoreIds(prev => {
        return prev.filter(id => {
          const store = stores.find(s => s.id === id);
          return store && selectedPartnerBrandIds.includes(store.brandId);
        });
      });
    }
  }, [selectedPartnerBrandIds, partners, brands, countries, stores, canChangePartner]);

  // Helper functions for multiselect
  const handlePartnerToggle = (partnerId: string) => {
    setSelectedPartnerIds(prev => 
      prev.includes(partnerId) 
        ? prev.filter(id => id !== partnerId)
        : [...prev, partnerId]
    );
  };

  const handleBrandToggle = (brandId: string) => {
    setSelectedBrandIds(prev => 
      prev.includes(brandId) 
        ? prev.filter(id => id !== brandId)
        : [...prev, brandId]
    );
  };

  const handleCountryToggle = (countryId: string) => {
    setSelectedCountryIds(prev => 
      prev.includes(countryId) 
        ? prev.filter(id => id !== countryId)
        : [...prev, countryId]
    );
  };

  const handleStoreToggle = (storeId: string) => {
    setSelectedStoreIds(prev => 
      prev.includes(storeId) 
        ? prev.filter(id => id !== storeId)
        : [...prev, storeId]
    );
  };

  // Get display text for multiselect filters
  const getPartnerDisplayText = () => {
    if (selectedPartnerIds.length === 0) return 'All Partners';
    if (selectedPartnerIds.length === 1) {
      return partners.find(p => p.id === selectedPartnerIds[0])?.name || '1 selected';
    }
    return `${selectedPartnerIds.length} selected`;
  };

  const getBrandDisplayText = () => {
    if (selectedBrandIds.length === 0) return 'All Brands';
    if (selectedBrandIds.length === 1) {
      return filteredBrands.find(b => b.id === selectedBrandIds[0])?.name || '1 selected';
    }
    return `${selectedBrandIds.length} selected`;
  };

  const getCountryDisplayText = () => {
    if (selectedCountryIds.length === 0) return 'All Countries';
    if (selectedCountryIds.length === 1) {
      return filteredCountries.find(c => c.id === selectedCountryIds[0])?.name || '1 selected';
    }
    return `${selectedCountryIds.length} selected`;
  };

  const getStoreDisplayText = () => {
    if (selectedStoreIds.length === 0) return 'All Stores';
    if (selectedStoreIds.length === 1) {
      return filteredStores.find(s => s.id === selectedStoreIds[0])?.name || '1 selected';
    }
    return `${selectedStoreIds.length} selected`;
  };


  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <div className="w-full bg-surface border-b border-outline-variant sticky top-0 z-20" id="reports-header">
        <div className="px-4 md:px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="hover:bg-surface-container-high"
            >
              <ArrowLeft className="h-5 w-5 text-on-surface" />
            </Button>
            <div>
              <h1 className="headline-medium text-on-surface">Reports</h1>
              <p className="body-small text-on-surface-variant mt-1">
                Sales and stock analytics for partners
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-outline-variant">
            <button
              onClick={() => setActiveTab('sales')}
              className={`relative px-6 py-3 transition-colors ${
                activeTab === 'sales'
                  ? 'text-primary'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="label-large">Sales Report</span>
              {activeTab === 'sales' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('stock')}
              className={`relative px-6 py-3 transition-colors ${
                activeTab === 'stock'
                  ? 'text-primary'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="label-large">Stock Report</span>
              {activeTab === 'stock' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('item-status')}
              className={`relative px-6 py-3 transition-colors ${
                activeTab === 'item-status'
                  ? 'text-primary'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="label-large">Item Status</span>
              {activeTab === 'item-status' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Global Filters - Compact Single Row */}
      <div className="w-full bg-surface border-b border-outline-variant sticky top-[145px] z-10" id="reports-filters">
        <div className="px-4 md:px-6 py-3 max-w-7xl mx-auto">
          <div className="flex items-end gap-3 flex-wrap">
            {/* Partner Filter - Multiselect for Admins, Read-only display for Partners */}
            <div className="flex flex-col gap-1">
              <label className="label-small text-on-surface-variant whitespace-nowrap">Partner</label>
              {canChangePartner ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="bg-surface-container border border-outline-variant rounded-lg h-12 md:h-10 px-3 body-medium min-w-[150px] min-h-[48px] md:min-h-0 justify-between"
                    >
                      <span className="truncate">{getPartnerDisplayText()}</span>
                      <ChevronDown className="h-4 w-4 opacity-50 ml-2 flex-shrink-0" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search partners..." />
                      <CommandList>
                        <CommandEmpty>No partners found.</CommandEmpty>
                        <CommandGroup>
                          {partners.map((partner) => (
                            <CommandItem
                              key={partner.id}
                              value={partner.name}
                              onSelect={() => handlePartnerToggle(partner.id)}
                              className="flex items-center gap-2 cursor-pointer py-3 md:py-1.5 min-h-[44px] md:min-h-0"
                            >
                              <Checkbox
                                checked={selectedPartnerIds.includes(partner.id)}
                                className="pointer-events-none"
                              />
                              <span className="body-medium">{partner.name}</span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              ) : (
                <div className="bg-surface-container border border-outline-variant rounded-lg h-12 md:h-10 px-4 flex items-center body-medium min-w-[150px] min-h-[48px] md:min-h-0">
                  <span className="text-on-surface">
                    {partners.find(p => p.id === selectedPartnerIds[0])?.name || 'Unknown Partner'}
                  </span>
                </div>
              )}
            </div>

            {/* Time Period */}
            <div className="flex flex-col gap-1">
              <label className="label-small text-on-surface-variant whitespace-nowrap">Time Period</label>
              <div className="flex items-center gap-2">
                <Select
                  value={selectedTimePeriod}
                  onValueChange={(value: string) => {
                    setSelectedTimePeriod(value as UnifiedTimePeriod);
                    // Reset date range and week when switching away
                    if (value !== 'dateRange') {
                      setDateRangeStart('');
                      setDateRangeEnd('');
                    }
                    if (value !== 'week') {
                      setSelectedWeek('');
                    }
                  }}
                >
                  <SelectTrigger 
                    className="bg-surface-container border border-outline-variant rounded-lg h-12 md:h-10 px-3 body-medium min-w-[120px] min-h-[48px] md:min-h-0 [&[data-size=default]]:!h-12 md:[&[data-size=default]]:!h-10"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-surface-container-high border border-outline">
                    <SelectItem value="month" className="body-medium">Month</SelectItem>
                    <SelectItem value="daily" className="body-medium">Yesterday</SelectItem>
                    <SelectItem value="week" className="body-medium">Week</SelectItem>
                    <SelectItem value="sevenDays" className="body-medium">7 Days</SelectItem>
                    <SelectItem value="fourteenDays" className="body-medium">14 Days</SelectItem>
                    <SelectItem value="thirtyDays" className="body-medium">30 Days</SelectItem>
                    <SelectItem value="dateRange" className="body-medium">Date Range</SelectItem>
                  </SelectContent>
                </Select>
                {selectedTimePeriod === 'month' && (
                  <Select
                    value={selectedMonth}
                    onValueChange={setSelectedMonth}
                  >
                    <SelectTrigger 
                      className="bg-surface-container border border-outline-variant rounded-lg h-12 md:h-10 px-3 body-medium min-w-[150px] min-h-[48px] md:min-h-0 [&[data-size=default]]:!h-12 md:[&[data-size=default]]:!h-10"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-surface-container-high border border-outline">
                      {salesData.map(data => (
                        <SelectItem key={data.month} value={data.month} className="body-medium">
                          {new Date(data.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {selectedTimePeriod === 'week' && (
                  <Input
                    type="week"
                    value={selectedWeek}
                    onChange={(e) => setSelectedWeek(e.target.value)}
                    className="bg-surface-container border border-outline-variant rounded-lg h-12 md:h-10 px-3 body-medium min-w-[150px] min-h-[48px] md:min-h-0"
                  />
                )}
                {selectedTimePeriod === 'dateRange' && (
                  <>
                    <Input
                      type="date"
                      value={dateRangeStart}
                      onChange={(e) => setDateRangeStart(e.target.value)}
                      className="bg-surface-container border border-outline-variant rounded-lg h-12 md:h-10 px-3 body-medium min-w-[150px] min-h-[48px] md:min-h-0"
                      placeholder="Start date"
                    />
                    <span className="text-on-surface-variant body-medium flex items-center h-12 md:h-10">to</span>
                    <Input
                      type="date"
                      value={dateRangeEnd}
                      onChange={(e) => setDateRangeEnd(e.target.value)}
                      className="bg-surface-container border border-outline-variant rounded-lg h-12 md:h-10 px-3 body-medium min-w-[150px] min-h-[48px] md:min-h-0"
                      placeholder="End date"
                    />
                  </>
                )}
              </div>
            </div>

            {/* Brand Filter - Multiselect */}
            <div className="flex flex-col gap-1">
              <label className="label-small text-on-surface-variant whitespace-nowrap">Brand</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="bg-surface-container border border-outline-variant rounded-lg h-12 md:h-10 px-3 body-medium min-w-[120px] min-h-[48px] md:min-h-0 justify-between"
                  >
                    <span className="truncate">{getBrandDisplayText()}</span>
                    <ChevronDown className="h-4 w-4 opacity-50 ml-2 flex-shrink-0" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search brands..." />
                    <CommandList>
                      <CommandEmpty>No brands found.</CommandEmpty>
                      <CommandGroup>
                        {filteredBrands.map((brand) => (
                          <CommandItem
                            key={brand.id}
                            value={brand.name}
                            onSelect={() => handleBrandToggle(brand.id)}
                            className="flex items-center gap-2 cursor-pointer py-3 md:py-1.5 min-h-[44px] md:min-h-0"
                          >
                            <Checkbox
                              checked={selectedBrandIds.includes(brand.id)}
                              className="pointer-events-none"
                            />
                            <span className="body-medium">{brand.name}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Country Filter - Multiselect */}
            <div className="flex flex-col gap-1">
              <label className="label-small text-on-surface-variant whitespace-nowrap">Country</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="bg-surface-container border border-outline-variant rounded-lg h-12 md:h-10 px-3 body-medium min-w-[120px] min-h-[48px] md:min-h-0 justify-between"
                  >
                    <span className="truncate">{getCountryDisplayText()}</span>
                    <ChevronDown className="h-4 w-4 opacity-50 ml-2 flex-shrink-0" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search countries..." />
                    <CommandList>
                      <CommandEmpty>No countries found.</CommandEmpty>
                      <CommandGroup>
                        {filteredCountries.map((country) => (
                          <CommandItem
                            key={country.id}
                            value={country.name}
                            onSelect={() => handleCountryToggle(country.id)}
                            className="flex items-center gap-2 cursor-pointer py-3 md:py-1.5 min-h-[44px] md:min-h-0"
                          >
                            <Checkbox
                              checked={selectedCountryIds.includes(country.id)}
                              className="pointer-events-none"
                            />
                            <span className="body-medium">{country.name}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Store Filter - Multiselect */}
            <div className="flex flex-col gap-1">
              <label className="label-small text-on-surface-variant whitespace-nowrap">Store</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="bg-surface-container border border-outline-variant rounded-lg h-12 md:h-10 px-3 body-medium min-w-[150px] min-h-[48px] md:min-h-0 justify-between"
                  >
                    <span className="truncate">{getStoreDisplayText()}</span>
                    <ChevronDown className="h-4 w-4 opacity-50 ml-2 flex-shrink-0" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[250px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search stores..." />
                    <CommandList>
                      <CommandEmpty>No stores found.</CommandEmpty>
                      <CommandGroup>
                        {filteredStores.map((store) => (
                          <CommandItem
                            key={store.id}
                            value={`${store.name} ${store.code}`}
                            onSelect={() => handleStoreToggle(store.id)}
                            className="flex items-center gap-2 cursor-pointer py-3 md:py-1.5 min-h-[44px] md:min-h-0"
                          >
                            <Checkbox
                              checked={selectedStoreIds.includes(store.id)}
                              className="pointer-events-none"
                            />
                            <span className="body-medium">{store.name}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Currency Filter */}
            <div className="flex flex-col gap-1">
              <label className="label-small text-on-surface-variant whitespace-nowrap">Currency</label>
              <Select
                value={selectedCurrency}
                onValueChange={(value: CurrencyCode) => setSelectedCurrency(value)}
              >
                <SelectTrigger 
                  className="bg-surface-container border border-outline-variant rounded-lg h-12 md:h-10 px-3 body-medium min-w-[100px] min-h-[48px] md:min-h-0 [&[data-size=default]]:!h-12 md:[&[data-size=default]]:!h-10"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-surface-container-high border border-outline">
                  <SelectItem value="SEK" className="body-medium">SEK</SelectItem>
                  <SelectItem value="EUR" className="body-medium">EUR</SelectItem>
                  <SelectItem value="USD" className="body-medium">USD</SelectItem>
                  <SelectItem value="GBP" className="body-medium">GBP</SelectItem>
                  <SelectItem value="NOK" className="body-medium">NOK</SelectItem>
                  <SelectItem value="DKK" className="body-medium">DKK</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 md:px-6 py-6 max-w-7xl mx-auto">
        {activeTab === 'sales' && (
          <PartnerSalesReport
            salesData={salesData}
            stores={filteredStores}
            brands={filteredBrands}
            countries={filteredCountries}
            selectedMonth={selectedMonth}
            selectedTimePeriod={selectedTimePeriod}
            selectedBrandId={selectedBrandIds.length === 0 ? 'all' : selectedBrandIds.length === 1 ? selectedBrandIds[0]! : 'all'}
            selectedCountryId={selectedCountryIds.length === 0 ? 'all' : selectedCountryIds.length === 1 ? selectedCountryIds[0]! : 'all'}
            selectedStoreId={selectedStoreIds.length === 0 ? 'all' : selectedStoreIds.length === 1 ? selectedStoreIds[0]! : 'all'}
            selectedWeek={selectedWeek}
            dateRangeStart={dateRangeStart}
            dateRangeEnd={dateRangeEnd}
            partnerId={selectedPartnerIds.length === 0 ? undefined : selectedPartnerIds.length === 1 ? selectedPartnerIds[0] : undefined}
            currency={selectedCurrency}
          />
        )}
        {activeTab === 'stock' && (
          <PartnerStockReport
            stockData={stockData}
            stores={filteredStores}
            brands={filteredBrands}
            countries={filteredCountries}
            selectedTimePeriod={
              selectedTimePeriod === 'month' || selectedTimePeriod === 'week' || selectedTimePeriod === 'dateRange'
                ? 'thirtyDays'
                : selectedTimePeriod as TimePeriod
            }
            originalTimePeriod={selectedTimePeriod}
            selectedMonth={selectedMonth}
            selectedWeek={selectedWeek}
            dateRangeStart={dateRangeStart}
            dateRangeEnd={dateRangeEnd}
            selectedBrandId={selectedBrandIds.length === 0 ? 'all' : selectedBrandIds.length === 1 ? selectedBrandIds[0]! : 'all'}
            selectedCountryId={selectedCountryIds.length === 0 ? 'all' : selectedCountryIds.length === 1 ? selectedCountryIds[0]! : 'all'}
            selectedStoreId={selectedStoreIds.length === 0 ? 'all' : selectedStoreIds.length === 1 ? selectedStoreIds[0]! : 'all'}
            partnerId={selectedPartnerIds.length === 0 ? undefined : selectedPartnerIds.length === 1 ? selectedPartnerIds[0] : undefined}
            currency={selectedCurrency}
          />
        )}
        {activeTab === 'item-status' && (
          <PartnerItemStatusReport
            items={items}
            stores={filteredStores}
            brands={filteredBrands}
            countries={filteredCountries}
            selectedTimePeriod={selectedTimePeriod}
            selectedBrandIds={selectedBrandIds}
            selectedCountryIds={selectedCountryIds}
            selectedStoreIds={selectedStoreIds}
            selectedMonth={selectedMonth}
            selectedWeek={selectedWeek}
            dateRangeStart={dateRangeStart}
            dateRangeEnd={dateRangeEnd}
            partnerId={selectedPartnerIds.length === 0 ? undefined : selectedPartnerIds.length === 1 ? selectedPartnerIds[0] : undefined}
          />
        )}
      </div>
    </div>
  );
}

