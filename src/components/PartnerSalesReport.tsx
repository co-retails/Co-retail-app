import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from './ui/chart';
import { TrendingUp, Store, Tag, Calendar } from 'lucide-react';
import type { Store, Brand, Country } from './StoreSelector';

export interface SalesDataPoint {
  month: string;
  totalSold: number;
  byStore: { storeId: string; storeName: string; sold: number }[];
  byBrand: { brandId: string; brandName: string; sold: number }[];
}

export interface PartnerSalesReportProps {
  salesData: SalesDataPoint[];
  stores: Store[];
  brands: Brand[];
  countries: Country[];
  selectedMonth: string;
  selectedTimePeriod: 'month' | 'daily' | 'sevenDays' | 'fourteenDays' | 'thirtyDays';
  selectedBrandId: string;
  selectedCountryId: string;
  selectedStoreId: string;
  partnerId?: string;
}

type ViewMode = 'overview' | 'by-store' | 'by-brand';

const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export default function PartnerSalesReport({
  salesData,
  stores,
  brands,
  countries,
  selectedMonth,
  selectedTimePeriod,
  selectedBrandId,
  selectedCountryId,
  selectedStoreId,
  partnerId
}: PartnerSalesReportProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('overview');

  // Get data based on time period
  const periodData = useMemo(() => {
    if (selectedTimePeriod === 'month') {
      // Use selected month
      return salesData.find(d => d.month === selectedMonth) || salesData[salesData.length - 1];
    } else {
      // For other periods, aggregate recent months
      // Get the most recent month and use it as approximation
      // In a real implementation, you'd have daily/weekly data
      const mostRecentMonth = salesData[salesData.length - 1];
      if (!mostRecentMonth) return null;
      
      // For periods other than month, we'll use the most recent month's data
      // scaled proportionally (this is an approximation since we only have monthly data)
      return mostRecentMonth;
    }
  }, [salesData, selectedMonth, selectedTimePeriod]);

  // Calculate filtered total for current period
  const totalSoldThisMonth = useMemo(() => {
    if (!periodData) return 0;
    
    // Priority: Store > Brand > Country > All
    if (selectedStoreId !== 'all') {
      const storeData = periodData.byStore.find(s => s.storeId === selectedStoreId);
      let sold = storeData?.sold || 0;
      
      // If brand is also selected, verify the store belongs to that brand
      if (selectedBrandId !== 'all') {
        const store = stores.find(s => s.id === selectedStoreId);
        if (store?.brandId !== selectedBrandId) {
          sold = 0;
        }
      }
      return sold;
    } else if (selectedBrandId !== 'all') {
      const brandData = periodData.byBrand.find(b => b.brandId === selectedBrandId);
      let sold = brandData?.sold || 0;
      
      // If country is also selected, filter by stores in that country for this brand
      if (selectedCountryId !== 'all') {
        const countryStoreIds = stores
          .filter(store => store.countryId === selectedCountryId && store.brandId === selectedBrandId)
          .map(store => store.id);
        const countryStoresData = periodData.byStore.filter(s => 
          countryStoreIds.includes(s.storeId)
        );
        sold = countryStoresData.reduce((sum, s) => sum + s.sold, 0);
      }
      return sold;
    } else if (selectedCountryId !== 'all') {
      const countryStoreIds = stores
        .filter(store => store.countryId === selectedCountryId)
        .map(store => store.id);
      const countryStoresData = periodData.byStore.filter(s => 
        countryStoreIds.includes(s.storeId)
      );
      return countryStoresData.reduce((sum, s) => sum + s.sold, 0);
    } else {
      return periodData.totalSold;
    }
  }, [periodData, selectedBrandId, selectedStoreId, selectedCountryId, stores]);

  // Get period label for display
  const getPeriodLabel = () => {
    if (selectedTimePeriod === 'month') {
      return new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    switch (selectedTimePeriod) {
      case 'daily': return 'Yesterday';
      case 'sevenDays': return '7 Days';
      case 'fourteenDays': return '14 Days';
      case 'thirtyDays': return '30 Days';
      default: return 'This Month';
    }
  };

  // Prepare chart data for monthly overview - apply filters
  const monthlyChartData = useMemo(() => {
    return salesData.map(data => {
      let totalSold = 0;
      
      // Priority: Store > Brand > Country > All
      if (selectedStoreId !== 'all') {
        // Store filter is most specific
        const storeData = data.byStore.find(s => s.storeId === selectedStoreId);
        totalSold = storeData?.sold || 0;
        
        // If brand is also selected, verify the store belongs to that brand
        if (selectedBrandId !== 'all') {
          const store = stores.find(s => s.id === selectedStoreId);
          if (store?.brandId !== selectedBrandId) {
            totalSold = 0;
          }
        }
      } else if (selectedBrandId !== 'all') {
        // Brand filter
        const brandData = data.byBrand.find(b => b.brandId === selectedBrandId);
        totalSold = brandData?.sold || 0;
        
        // If country is also selected, filter by stores in that country for this brand
        if (selectedCountryId !== 'all') {
          const countryStoreIds = stores
            .filter(store => store.countryId === selectedCountryId && store.brandId === selectedBrandId)
            .map(store => store.id);
          const countryStoresData = data.byStore.filter(s => 
            countryStoreIds.includes(s.storeId)
          );
          totalSold = countryStoresData.reduce((sum, s) => sum + s.sold, 0);
        }
      } else if (selectedCountryId !== 'all') {
        // Country filter only
        const countryStoreIds = stores
          .filter(store => store.countryId === selectedCountryId)
          .map(store => store.id);
        const countryStoresData = data.byStore.filter(s => 
          countryStoreIds.includes(s.storeId)
        );
        totalSold = countryStoresData.reduce((sum, s) => sum + s.sold, 0);
      } else {
        // No filters - show all
        totalSold = data.totalSold;
      }
      
      return {
        month: new Date(data.month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        'Items Sold': totalSold
      };
    });
  }, [salesData, selectedBrandId, selectedStoreId, selectedCountryId, stores]);

  // Prepare chart data for store breakdown
  const storeChartData = useMemo(() => {
    if (!periodData) return [];
    let filteredStores = periodData.byStore;
    
    // Filter by store if selected
    if (selectedStoreId !== 'all') {
      filteredStores = filteredStores.filter(store => store.storeId === selectedStoreId);
    }
    
    // Filter by brand if selected
    if (selectedBrandId !== 'all') {
      const brandStoreIds = stores
        .filter(store => store.brandId === selectedBrandId)
        .map(store => store.id);
      filteredStores = filteredStores.filter(store => 
        brandStoreIds.includes(store.storeId)
      );
    }
    
    // Filter by country if selected
    if (selectedCountryId !== 'all') {
      const countryStoreIds = stores
        .filter(store => store.countryId === selectedCountryId)
        .map(store => store.id);
      filteredStores = filteredStores.filter(store => 
        countryStoreIds.includes(store.storeId)
      );
    }
    
    return filteredStores
      .map(store => ({
        name: store.storeName,
        'Items Sold': store.sold
      }))
      .sort((a, b) => b['Items Sold'] - a['Items Sold']);
  }, [periodData, selectedStoreId, selectedBrandId, selectedCountryId, stores]);

  // Prepare chart data for brand breakdown
  const brandChartData = useMemo(() => {
    if (!periodData) return [];
    let filteredBrands = periodData.byBrand;
    
    // Filter by selected brand if not 'all'
    if (selectedBrandId !== 'all') {
      filteredBrands = filteredBrands.filter(brand => brand.brandId === selectedBrandId);
    }
    
    // If country is selected, filter brands by stores in that country
    if (selectedCountryId !== 'all') {
      const countryStoreIds = stores
        .filter(store => store.countryId === selectedCountryId)
        .map(store => store.id);
      const countryBrandIds = stores
        .filter(store => countryStoreIds.includes(store.id))
        .map(store => store.brandId);
      filteredBrands = filteredBrands.filter(brand => 
        countryBrandIds.includes(brand.brandId)
      );
    }
    
    return filteredBrands
      .map(brand => ({
        name: brand.brandName,
        'Items Sold': brand.sold
      }))
      .sort((a, b) => b['Items Sold'] - a['Items Sold']);
  }, [periodData, selectedBrandId, selectedCountryId, stores]);

  const chartConfig = {
    'Items Sold': {
      label: 'Items Sold',
      color: 'hsl(var(--chart-1))',
    },
  };

  // Debug: Log chart data
  React.useEffect(() => {
    console.log('Monthly Chart Data:', monthlyChartData);
  }, [monthlyChartData]);

  const totalSoldAllTime = salesData.reduce((sum, data) => sum + data.totalSold, 0);
  const averageMonthlySales = salesData.length > 0 ? totalSoldAllTime / salesData.length : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="headline-medium text-on-surface">Sales Report</h2>
          <p className="body-medium text-on-surface-variant mt-1">
            Track monthly sales for commission-based invoicing
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-surface-container border border-outline-variant rounded-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="body-medium text-on-surface-variant">{getPeriodLabel()}</span>
              <TrendingUp className="h-5 w-5 text-chart-1" />
            </div>
            <p className="display-small text-on-surface">{totalSoldThisMonth.toLocaleString()}</p>
            <p className="body-small text-on-surface-variant mt-1">items sold</p>
          </CardContent>
        </Card>

        <Card className="bg-surface-container border border-outline-variant rounded-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="body-medium text-on-surface-variant">All Time</span>
              <Store className="h-5 w-5 text-chart-2" />
            </div>
            <p className="display-small text-on-surface">{totalSoldAllTime.toLocaleString()}</p>
            <p className="body-small text-on-surface-variant mt-1">total items sold</p>
          </CardContent>
        </Card>

        <Card className="bg-surface-container border border-outline-variant rounded-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="body-medium text-on-surface-variant">Monthly Average</span>
              <Tag className="h-5 w-5 text-chart-3" />
            </div>
            <p className="display-small text-on-surface">{Math.round(averageMonthlySales).toLocaleString()}</p>
            <p className="body-small text-on-surface-variant mt-1">items per month</p>
          </CardContent>
        </Card>
      </div>

      {/* View Mode Tabs */}
      <Card className="bg-surface-container border border-outline-variant rounded-lg">
        <CardContent className="p-0">
          <div className="flex border-b border-outline-variant">
            {(['overview', 'by-store', 'by-brand'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`flex-1 relative py-3 px-4 transition-colors ${
                  viewMode === mode
                    ? 'text-primary'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="label-medium capitalize">
                  {mode === 'overview' ? 'Monthly Trend' : mode === 'by-store' ? 'By Store' : 'By Brand'}
                </span>
                {viewMode === mode && (
                  <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full" />
                )}
              </button>
            ))}
          </div>

          <div className="p-6">
            {viewMode === 'overview' && (
              <div className="space-y-4">
                <h3 className="title-medium text-on-surface">Monthly Sales Trend</h3>
                {monthlyChartData && monthlyChartData.length > 0 ? (
                  <div className="w-full" style={{ height: '400px' }}>
                    <ChartContainer config={chartConfig} className="h-full w-full [&]:!aspect-auto">
                      <BarChart data={monthlyChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--outline-variant))" />
                        <XAxis 
                          dataKey="month" 
                          stroke="hsl(var(--on-surface-variant))"
                          style={{ fontSize: '12px' }}
                        />
                        <YAxis 
                          stroke="hsl(var(--on-surface-variant))"
                          style={{ fontSize: '12px' }}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="Items Sold" fill="hsl(var(--chart-1))" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ChartContainer>
                  </div>
                ) : (
                  <p className="body-medium text-on-surface-variant text-center py-8">
                    No sales data available for the selected filters
                  </p>
                )}
              </div>
            )}

            {viewMode === 'by-store' && (
              <div className="space-y-4">
                <h3 className="title-medium text-on-surface">
                  Sales by Store - {getPeriodLabel()}
                </h3>
                {storeChartData.length > 0 ? (
                  <>
                    <ChartContainer config={chartConfig} className="h-[400px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={storeChartData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--outline-variant))" />
                          <XAxis 
                            type="number"
                            stroke="hsl(var(--on-surface-variant))"
                            style={{ fontSize: '12px' }}
                          />
                          <YAxis 
                            type="category"
                            dataKey="name"
                            stroke="hsl(var(--on-surface-variant))"
                            style={{ fontSize: '12px' }}
                            width={150}
                          />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="Items Sold" fill="hsl(var(--chart-1))" radius={[0, 8, 8, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                    
                    {/* Store Table */}
                    <div className="mt-6">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-outline-variant">
                              <th className="text-left py-3 px-4 label-medium text-on-surface-variant">Store</th>
                              <th className="text-right py-3 px-4 label-medium text-on-surface-variant">Items Sold</th>
                              <th className="text-right py-3 px-4 label-medium text-on-surface-variant">% of Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {storeChartData.map((store, index) => {
                              const percentage = totalSoldThisMonth > 0 
                                ? ((store['Items Sold'] / totalSoldThisMonth) * 100).toFixed(1)
                                : '0.0';
                              return (
                                <tr key={index} className="border-b border-outline-variant hover:bg-surface-container-high">
                                  <td className="py-3 px-4 body-medium text-on-surface">{store.name}</td>
                                  <td className="py-3 px-4 body-medium text-on-surface text-right">{store['Items Sold'].toLocaleString()}</td>
                                  <td className="py-3 px-4 body-medium text-on-surface text-right">{percentage}%</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="body-medium text-on-surface-variant text-center py-8">No store data available for this month</p>
                )}
              </div>
            )}

            {viewMode === 'by-brand' && (
              <div className="space-y-4">
                <h3 className="title-medium text-on-surface">
                  Sales by Brand - {getPeriodLabel()}
                </h3>
                {brandChartData.length > 0 ? (
                  <>
                    <ChartContainer config={chartConfig} className="h-[400px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={brandChartData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--outline-variant))" />
                          <XAxis 
                            type="number"
                            stroke="hsl(var(--on-surface-variant))"
                            style={{ fontSize: '12px' }}
                          />
                          <YAxis 
                            type="category"
                            dataKey="name"
                            stroke="hsl(var(--on-surface-variant))"
                            style={{ fontSize: '12px' }}
                            width={150}
                          />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="Items Sold" fill="hsl(var(--chart-2))" radius={[0, 8, 8, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                    
                    {/* Brand Table */}
                    <div className="mt-6">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-outline-variant">
                              <th className="text-left py-3 px-4 label-medium text-on-surface-variant">Brand</th>
                              <th className="text-right py-3 px-4 label-medium text-on-surface-variant">Items Sold</th>
                              <th className="text-right py-3 px-4 label-medium text-on-surface-variant">% of Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {brandChartData.map((brand, index) => {
                              const percentage = totalSoldThisMonth > 0 
                                ? ((brand['Items Sold'] / totalSoldThisMonth) * 100).toFixed(1)
                                : '0.0';
                              return (
                                <tr key={index} className="border-b border-outline-variant hover:bg-surface-container-high">
                                  <td className="py-3 px-4 body-medium text-on-surface">{brand.name}</td>
                                  <td className="py-3 px-4 body-medium text-on-surface text-right">{brand['Items Sold'].toLocaleString()}</td>
                                  <td className="py-3 px-4 body-medium text-on-surface text-right">{percentage}%</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="body-medium text-on-surface-variant text-center py-8">No brand data available for this month</p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

