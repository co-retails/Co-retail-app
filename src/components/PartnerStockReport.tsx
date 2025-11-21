import React, { useState, useMemo } from 'react';
import { Card, CardContent } from './ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from './ui/chart';
import { Package, TrendingDown, TrendingUp, AlertCircle } from 'lucide-react';
import type { Store, Brand, Country } from './StoreSelector';

export interface StockDataPoint {
  category: string;
  storeId: string;
  storeName: string;
  inStock: number;
  sold: number;
}

export interface StockReportData {
  daily: StockDataPoint[];
  sevenDays: StockDataPoint[];
  fourteenDays: StockDataPoint[];
  thirtyDays: StockDataPoint[];
}

export interface PartnerStockReportProps {
  stockData: StockReportData;
  stores: Store[];
  brands: Brand[];
  countries: Country[];
  selectedTimePeriod: TimePeriod;
  selectedStoreId: string;
  selectedBrandId: string;
  selectedCountryId: string;
  partnerId?: string;
}

export type TimePeriod = 'daily' | 'sevenDays' | 'fourteenDays' | 'thirtyDays';

const CATEGORIES = [
  'Tops',
  'Dresses',
  'Jeans',
  'Trousers',
  'Shorts',
  'Skirts',
  'Jackets',
  'Coats',
  'Hoodies',
  'Sweaters',
  'Shoes',
  'Accessories',
  'Other'
];

export default function PartnerStockReport({
  stockData,
  stores,
  brands,
  countries,
  selectedTimePeriod,
  selectedStoreId,
  selectedBrandId,
  selectedCountryId,
  partnerId
}: PartnerStockReportProps) {

  // Filter and aggregate data by category
  const categoryData = useMemo(() => {
    const periodData = stockData[selectedTimePeriod];
    let filtered = periodData;

    // Filter by store if selected
    if (selectedStoreId !== 'all') {
      filtered = filtered.filter(item => item.storeId === selectedStoreId);
    }
    
    // Filter by brand if selected
    if (selectedBrandId !== 'all') {
      const brandStoreIds = stores
        .filter(store => store.brandId === selectedBrandId)
        .map(store => store.id);
      filtered = filtered.filter(item => brandStoreIds.includes(item.storeId));
    }
    
    // Filter by country if selected
    if (selectedCountryId !== 'all') {
      const countryStoreIds = stores
        .filter(store => store.countryId === selectedCountryId)
        .map(store => store.id);
      filtered = filtered.filter(item => countryStoreIds.includes(item.storeId));
    }

    // Aggregate by category
    const aggregated = CATEGORIES.map(category => {
      const categoryItems = filtered.filter(item => item.category === category);
      const inStock = categoryItems.reduce((sum, item) => sum + item.inStock, 0);
      const sold = categoryItems.reduce((sum, item) => sum + item.sold, 0);
      const total = inStock + sold;
      
      return {
        category,
        inStock,
        sold,
        total,
        sellThroughRate: total > 0 ? ((sold / total) * 100).toFixed(1) : '0.0'
      };
    }).filter(item => item.total > 0); // Only show categories with data

    return aggregated.sort((a, b) => b.total - a.total);
  }, [stockData, selectedTimePeriod, selectedStoreId, selectedBrandId, selectedCountryId, stores]);

  // Calculate totals
  const totals = useMemo(() => {
    return categoryData.reduce(
      (acc, item) => ({
        inStock: acc.inStock + item.inStock,
        sold: acc.sold + item.sold,
        total: acc.total + item.total
      }),
      { inStock: 0, sold: 0, total: 0 }
    );
  }, [categoryData]);

  const overallSellThroughRate = totals.total > 0 
    ? ((totals.sold / totals.total) * 100).toFixed(1)
    : '0.0';

  // Prepare chart data
  const chartData = useMemo(() => {
    return categoryData.map(item => ({
      category: item.category,
      'In Stock': item.inStock,
      'Sold': item.sold
    }));
  }, [categoryData]);

  // Debug: Log chart data
  React.useEffect(() => {
    console.log('Stock Chart Data:', chartData);
    console.log('Category Data:', categoryData);
    console.log('Selected Time Period:', selectedTimePeriod);
    console.log('Stock Data:', stockData);
  }, [chartData, categoryData, selectedTimePeriod, stockData]);

  const chartConfig = {
    'In Stock': {
      label: 'In Stock',
      color: 'hsl(0, 0%, 0%)', // Black for items in stock
    },
    'Sold': {
      label: 'Sold',
      color: 'hsl(35, 30%, 65%)', // Medium beige
    },
  };

  const getPeriodLabel = (period: TimePeriod) => {
    switch (period) {
      case 'daily': return 'Today';
      case 'sevenDays': return '7 Days';
      case 'fourteenDays': return '14 Days';
      case 'thirtyDays': return '30 Days';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="headline-medium text-on-surface">Stock Report</h2>
          <p className="body-medium text-on-surface-variant mt-1">
            Monitor stock levels and sales performance by category
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-surface-container border border-outline-variant rounded-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="body-medium text-on-surface-variant">In Stock</span>
              <Package className="h-5 w-5 text-chart-2" />
            </div>
            <p className="display-small text-on-surface">{totals.inStock.toLocaleString()}</p>
            <p className="body-small text-on-surface-variant mt-1">items available</p>
          </CardContent>
        </Card>

        <Card className="bg-surface-container border border-outline-variant rounded-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="body-medium text-on-surface-variant">Sold</span>
              <TrendingUp className="h-5 w-5 text-chart-1" />
            </div>
            <p className="display-small text-on-surface">{totals.sold.toLocaleString()}</p>
            <p className="body-small text-on-surface-variant mt-1">items sold</p>
          </CardContent>
        </Card>

        <Card className="bg-surface-container border border-outline-variant rounded-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="body-medium text-on-surface-variant">Total</span>
              <Package className="h-5 w-5 text-on-surface-variant" />
            </div>
            <p className="display-small text-on-surface">{totals.total.toLocaleString()}</p>
            <p className="body-small text-on-surface-variant mt-1">total items</p>
          </CardContent>
        </Card>

        <Card className="bg-surface-container border border-outline-variant rounded-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="body-medium text-on-surface-variant">Sell-Through Rate</span>
              {parseFloat(overallSellThroughRate) >= 50 ? (
                <TrendingUp className="h-5 w-5 text-chart-2" />
              ) : (
                <TrendingDown className="h-5 w-5 text-chart-3" />
              )}
            </div>
            <p className="display-small text-on-surface">{overallSellThroughRate}%</p>
            <p className="body-small text-on-surface-variant mt-1">sold vs total</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card className="bg-surface-container border border-outline-variant rounded-lg">
        <CardContent className="p-6">
          <h3 className="title-medium text-on-surface mb-4">
            Stock Status by Category - {getPeriodLabel(selectedTimePeriod)}
          </h3>
          {chartData && chartData.length > 0 ? (
            <div className="w-full" style={{ height: '400px' }}>
              <ChartContainer config={chartConfig} className="h-full w-full [&]:!aspect-auto">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--outline-variant))" />
                  <XAxis 
                    dataKey="category" 
                    stroke="hsl(var(--on-surface-variant))"
                    style={{ fontSize: '12px' }}
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis 
                    stroke="hsl(var(--on-surface-variant))"
                    style={{ fontSize: '12px' }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="In Stock" fill="hsl(0, 0%, 0%)" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="Sold" fill="hsl(35, 30%, 65%)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </div>
          ) : (
            <p className="body-medium text-on-surface-variant text-center py-8">
              No stock data available for the selected period
            </p>
          )}
        </CardContent>
      </Card>

      {/* Detailed Table */}
      <Card className="bg-surface-container border border-outline-variant rounded-lg">
        <CardContent className="p-0">
          <div className="p-6 pb-4">
            <h3 className="title-medium text-on-surface">
              Category Breakdown - {getPeriodLabel(selectedTimePeriod)}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container-high">
                  <th className="text-left py-3 px-4 label-medium text-on-surface-variant">Category</th>
                  <th className="text-right py-3 px-4 label-medium text-on-surface-variant">In Stock</th>
                  <th className="text-right py-3 px-4 label-medium text-on-surface-variant">Sold</th>
                  <th className="text-right py-3 px-4 label-medium text-on-surface-variant">Total</th>
                  <th className="text-right py-3 px-4 label-medium text-on-surface-variant">Sell-Through Rate</th>
                </tr>
              </thead>
              <tbody>
                {categoryData.map((item, index) => {
                  const sellThroughRate = parseFloat(item.sellThroughRate);
                  const isLowStock = item.inStock < 10;
                  const isHighSellThrough = sellThroughRate >= 70;
                  
                  return (
                    <tr 
                      key={index} 
                      className={`border-b border-outline-variant hover:bg-surface-container-high ${
                        isLowStock ? 'bg-error-container/20' : ''
                      }`}
                    >
                      <td className="py-3 px-4 body-medium text-on-surface">
                        <div className="flex items-center gap-2">
                          {item.category}
                          {isLowStock && (
                            <AlertCircle className="h-4 w-4 text-error" title="Low stock" />
                          )}
                          {isHighSellThrough && (
                            <TrendingUp className="h-4 w-4 text-chart-2" title="High sell-through rate" />
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 body-medium text-on-surface text-right">
                        {item.inStock.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 body-medium text-on-surface text-right">
                        {item.sold.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 body-medium text-on-surface text-right">
                        {item.total.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 body-medium text-on-surface text-right">
                        <span className={sellThroughRate >= 50 ? 'text-chart-2' : 'text-on-surface'}>
                          {item.sellThroughRate}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-outline bg-surface-container-high">
                  <td className="py-3 px-4 title-small text-on-surface font-semibold">Total</td>
                  <td className="py-3 px-4 title-small text-on-surface text-right font-semibold">
                    {totals.inStock.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 title-small text-on-surface text-right font-semibold">
                    {totals.sold.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 title-small text-on-surface text-right font-semibold">
                    {totals.total.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 title-small text-on-surface text-right font-semibold">
                    {overallSellThroughRate}%
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

