import { useState, useMemo, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import PartnerSalesReport, { SalesDataPoint } from './PartnerSalesReport';
import PartnerStockReport, { StockReportData, TimePeriod } from './PartnerStockReport';
import type { Store, Brand, Country } from './StoreSelector';
import { Partner as WarehousePartner } from './PartnerWarehouseSelector';

export interface PartnerReportsScreenProps {
  onBack: () => void;
  salesData: SalesDataPoint[];
  stockData: StockReportData;
  stores: Store[];
  brands: Brand[];
  countries: Country[];
  partners: WarehousePartner[];
  partnerId?: string;
  currentUserRole?: 'admin' | 'partner' | 'store-staff' | 'buyer';
}

type ReportTab = 'sales' | 'stock';
type UnifiedTimePeriod = 'month' | 'daily' | 'week' | 'sevenDays' | 'fourteenDays' | 'thirtyDays' | 'dateRange';

export default function PartnerReportsScreen({
  onBack,
  salesData,
  stockData,
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
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>(partnerId || 'all');
  const [selectedBrandId, setSelectedBrandId] = useState<string>('all');
  const [selectedCountryId, setSelectedCountryId] = useState<string>('all');
  const [selectedStoreId, setSelectedStoreId] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>(
    salesData[salesData.length - 1]?.month || ''
  );
  const [selectedWeek, setSelectedWeek] = useState<string>('');
  const [dateRangeStart, setDateRangeStart] = useState<string>('');
  const [dateRangeEnd, setDateRangeEnd] = useState<string>('');

  // Set partner filter to current partner if user is a partner
  useEffect(() => {
    if (!canChangePartner && partnerId) {
      setSelectedPartnerId(partnerId);
    }
  }, [canChangePartner, partnerId]);

  // Filter available brands, countries, and stores based on selected partner
  const filteredBrands = useMemo(() => {
    if (selectedPartnerId === 'all' || !canChangePartner) {
      return brands;
    }
    const partner = partners.find(p => p.id === selectedPartnerId);
    if (partner?.brandIds && partner.brandIds.length > 0) {
      return brands.filter(brand => partner.brandIds!.includes(brand.id));
    }
    return brands;
  }, [selectedPartnerId, partners, brands, canChangePartner]);

  const filteredCountries = useMemo(() => {
    if (selectedPartnerId === 'all' || !canChangePartner) {
      return countries;
    }
    // Filter countries based on brands associated with the partner
    const partner = partners.find(p => p.id === selectedPartnerId);
    if (partner?.brandIds && partner.brandIds.length > 0) {
      return countries.filter(country => 
        partner.brandIds!.includes(country.brandId)
      );
    }
    return countries;
  }, [selectedPartnerId, partners, countries, canChangePartner]);

  const filteredStores = useMemo(() => {
    if (selectedPartnerId === 'all' || !canChangePartner) {
      return stores;
    }
    // Filter stores based on brands associated with the partner
    const partner = partners.find(p => p.id === selectedPartnerId);
    if (partner?.brandIds && partner.brandIds.length > 0) {
      return stores.filter(store => 
        partner.brandIds!.includes(store.brandId)
      );
    }
    return stores;
  }, [selectedPartnerId, partners, stores, canChangePartner]);

  // Reset brand/country/store filters when partner changes
  useEffect(() => {
    if (selectedPartnerId !== 'all' && canChangePartner) {
      // Reset filters that are no longer valid for the selected partner
      const partner = partners.find(p => p.id === selectedPartnerId);
      if (partner?.brandIds) {
        if (selectedBrandId !== 'all' && !partner.brandIds.includes(selectedBrandId)) {
          setSelectedBrandId('all');
        }
        if (selectedCountryId !== 'all') {
          const validCountry = countries.find(c => c.id === selectedCountryId);
          if (validCountry && !partner.brandIds.includes(validCountry.brandId)) {
            setSelectedCountryId('all');
          }
        }
        if (selectedStoreId !== 'all') {
          const validStore = stores.find(s => s.id === selectedStoreId);
          if (validStore && !partner.brandIds.includes(validStore.brandId)) {
            setSelectedStoreId('all');
          }
        }
      }
    }
  }, [selectedPartnerId, partners, brands, countries, stores, selectedBrandId, selectedCountryId, selectedStoreId, canChangePartner]);


  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <div className="w-full bg-surface border-b border-outline-variant sticky top-0 z-10">
        <div className="px-4 md:px-6 py-4">
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
          </div>
        </div>
      </div>

      {/* Global Filters - Compact Single Row */}
      <div className="w-full bg-surface border-b border-outline-variant sticky top-[145px] z-10">
        <div className="px-4 md:px-6 py-3">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Partner Filter - Editable for Admins and Brand Admins, Read-only display for Partners */}
            <div className="flex items-center gap-2">
              <label className="label-small text-on-surface-variant whitespace-nowrap">Partner:</label>
              {canChangePartner ? (
                <Select
                  value={selectedPartnerId}
                  onValueChange={(value: string) => setSelectedPartnerId(value)}
                >
                  <SelectTrigger 
                    className="bg-surface-container border border-outline-variant rounded-lg min-h-[56px] h-14 body-medium min-w-[150px]"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-surface-container-high border border-outline">
                    <SelectItem value="all" className="body-medium">All Partners</SelectItem>
                    {partners.map(partner => (
                      <SelectItem key={partner.id} value={partner.id} className="body-medium">
                        {partner.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="bg-surface-container border border-outline-variant rounded-lg min-h-[56px] h-14 px-4 flex items-center body-medium min-w-[150px]">
                  <span className="text-on-surface">
                    {partners.find(p => p.id === selectedPartnerId)?.name || 'Unknown Partner'}
                  </span>
                </div>
              )}
            </div>

            {/* Time Period */}
            <div className="flex items-center gap-2">
              <label className="label-small text-on-surface-variant whitespace-nowrap">Time Period:</label>
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
                    className="bg-surface-container border border-outline-variant rounded-lg min-h-[56px] h-14 body-medium min-w-[120px]"
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
                      className="bg-surface-container border border-outline-variant rounded-lg min-h-[56px] h-14 body-medium min-w-[150px]"
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
                    className="bg-surface-container border border-outline-variant rounded-lg min-h-[56px] h-14 body-medium min-w-[150px] px-4"
                  />
                )}
                {selectedTimePeriod === 'dateRange' && (
                  <>
                    <Input
                      type="date"
                      value={dateRangeStart}
                      onChange={(e) => setDateRangeStart(e.target.value)}
                      className="bg-surface-container border border-outline-variant rounded-lg min-h-[56px] h-14 body-medium min-w-[150px] px-4"
                      placeholder="Start date"
                    />
                    <span className="text-on-surface-variant body-medium">to</span>
                    <Input
                      type="date"
                      value={dateRangeEnd}
                      onChange={(e) => setDateRangeEnd(e.target.value)}
                      className="bg-surface-container border border-outline-variant rounded-lg min-h-[56px] h-14 body-medium min-w-[150px] px-4"
                      placeholder="End date"
                    />
                  </>
                )}
              </div>
            </div>

            {/* Brand Filter */}
            <div className="flex items-center gap-2">
              <label className="label-small text-on-surface-variant whitespace-nowrap">Brand:</label>
              <Select
                value={selectedBrandId}
                onValueChange={setSelectedBrandId}
              >
                <SelectTrigger 
                  className="bg-surface-container border border-outline-variant rounded-lg min-h-[56px] h-14 body-medium min-w-[120px]"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-surface-container-high border border-outline">
                  <SelectItem value="all" className="body-medium">All</SelectItem>
                  {filteredBrands.map(brand => (
                    <SelectItem key={brand.id} value={brand.id} className="body-medium">
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Country Filter */}
            <div className="flex items-center gap-2">
              <label className="label-small text-on-surface-variant whitespace-nowrap">Country:</label>
              <Select
                value={selectedCountryId}
                onValueChange={setSelectedCountryId}
              >
                <SelectTrigger 
                  className="bg-surface-container border border-outline-variant rounded-lg min-h-[56px] h-14 body-medium min-w-[120px]"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-surface-container-high border border-outline">
                  <SelectItem value="all" className="body-medium">All</SelectItem>
                  {filteredCountries.map(country => (
                    <SelectItem key={country.id} value={country.id} className="body-medium">
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Store Filter */}
            <div className="flex items-center gap-2">
              <label className="label-small text-on-surface-variant whitespace-nowrap">Store:</label>
              <Select
                value={selectedStoreId}
                onValueChange={setSelectedStoreId}
              >
                <SelectTrigger 
                  className="bg-surface-container border border-outline-variant rounded-lg min-h-[56px] h-14 body-medium min-w-[150px]"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-surface-container-high border border-outline">
                  <SelectItem value="all" className="body-medium">All Stores</SelectItem>
                  {filteredStores.map(store => (
                    <SelectItem key={store.id} value={store.id} className="body-medium">
                      {store.name}
                    </SelectItem>
                  ))}
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
            selectedBrandId={selectedBrandId}
            selectedCountryId={selectedCountryId}
            selectedStoreId={selectedStoreId}
            selectedWeek={selectedWeek}
            dateRangeStart={dateRangeStart}
            dateRangeEnd={dateRangeEnd}
            partnerId={selectedPartnerId === 'all' ? undefined : selectedPartnerId}
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
            selectedBrandId={selectedBrandId}
            selectedCountryId={selectedCountryId}
            selectedStoreId={selectedStoreId}
            partnerId={selectedPartnerId === 'all' ? undefined : selectedPartnerId}
          />
        )}
      </div>
    </div>
  );
}

