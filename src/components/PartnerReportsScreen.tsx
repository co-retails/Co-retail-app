import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import PartnerSalesReport, { SalesDataPoint } from './PartnerSalesReport';
import PartnerStockReport, { StockReportData, TimePeriod } from './PartnerStockReport';
import type { Store, Brand, Country } from './StoreSelector';

export interface PartnerReportsScreenProps {
  onBack: () => void;
  salesData: SalesDataPoint[];
  stockData: StockReportData;
  stores: Store[];
  brands: Brand[];
  countries: Country[];
  partnerId?: string;
}

type ReportTab = 'sales' | 'stock';
type UnifiedTimePeriod = 'month' | 'daily' | 'sevenDays' | 'fourteenDays' | 'thirtyDays';

export default function PartnerReportsScreen({
  onBack,
  salesData,
  stockData,
  stores,
  brands,
  countries,
  partnerId
}: PartnerReportsScreenProps) {
  const [activeTab, setActiveTab] = useState<ReportTab>('sales');
  
  // Global filter state - unified time period for both reports
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<UnifiedTimePeriod>('month');
  const [selectedBrandId, setSelectedBrandId] = useState<string>('all');
  const [selectedCountryId, setSelectedCountryId] = useState<string>('all');
  const [selectedStoreId, setSelectedStoreId] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>(
    salesData[salesData.length - 1]?.month || ''
  );

  const getPeriodLabel = (period: UnifiedTimePeriod) => {
    switch (period) {
      case 'month': return 'Month';
      case 'daily': return 'Yesterday';
      case 'sevenDays': return '7 Days';
      case 'fourteenDays': return '14 Days';
      case 'thirtyDays': return '30 Days';
    }
  };

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
            {/* Time Period */}
            <div className="flex items-center gap-2">
              <label className="label-small text-on-surface-variant whitespace-nowrap">Time Period:</label>
              <div className="flex items-center gap-2">
                <Select
                  value={selectedTimePeriod}
                  onValueChange={(value) => setSelectedTimePeriod(value as UnifiedTimePeriod)}
                >
                  <SelectTrigger 
                    className="bg-surface-container border border-outline-variant rounded-lg min-h-[56px] h-14 body-medium min-w-[120px]"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-surface-container-high border border-outline">
                    <SelectItem value="month" className="body-medium">Month</SelectItem>
                    <SelectItem value="daily" className="body-medium">Yesterday</SelectItem>
                    <SelectItem value="sevenDays" className="body-medium">7 Days</SelectItem>
                    <SelectItem value="fourteenDays" className="body-medium">14 Days</SelectItem>
                    <SelectItem value="thirtyDays" className="body-medium">30 Days</SelectItem>
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
                  {brands.map(brand => (
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
                  {countries.map(country => (
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
                  {stores.map(store => (
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
            stores={stores}
            brands={brands}
            countries={countries}
            selectedMonth={selectedMonth}
            selectedTimePeriod={selectedTimePeriod}
            selectedBrandId={selectedBrandId}
            selectedCountryId={selectedCountryId}
            selectedStoreId={selectedStoreId}
            partnerId={partnerId}
          />
        )}
        {activeTab === 'stock' && (
          <PartnerStockReport
            stockData={stockData}
            stores={stores}
            brands={brands}
            countries={countries}
            selectedTimePeriod={selectedTimePeriod === 'month' ? 'thirtyDays' : selectedTimePeriod as TimePeriod}
            selectedBrandId={selectedBrandId}
            selectedCountryId={selectedCountryId}
            selectedStoreId={selectedStoreId}
            partnerId={partnerId}
          />
        )}
      </div>
    </div>
  );
}

