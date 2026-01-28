import React, { useState, useMemo } from 'react';
import { Card, CardContent } from './ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LabelList, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from './ui/chart';
import { Package, TrendingDown, TrendingUp, AlertCircle, DollarSign, Clock } from 'lucide-react';
import type { Store, Brand, Country } from './StoreSelector';

export interface StockDataPoint {
  category: string;
  storeId: string;
  storeName: string;
  inStock: number;
  expired?: number; // Items in stock that are expired
  inOrder?: number; // Items ordered but not yet delivered
  sold: number;
  averagePrice?: number;
  averageDaysToSell?: number;
}

export interface DailyStockDataPoint {
  date: string;
  totalStock: number;
}

export interface StockReportData {
  daily: StockDataPoint[];
  sevenDays: StockDataPoint[];
  fourteenDays: StockDataPoint[];
  thirtyDays: StockDataPoint[];
  dailyStockByMonth?: {
    currentMonth: DailyStockDataPoint[];
    previousMonth: DailyStockDataPoint[];
  };
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
  originalTimePeriod?: 'month' | 'daily' | 'week' | 'sevenDays' | 'fourteenDays' | 'thirtyDays' | 'dateRange';
  selectedMonth?: string;
  selectedWeek?: string;
  dateRangeStart?: string;
  dateRangeEnd?: string;
  currency?: string;
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

// Exchange rates (mock - in production would come from API or configuration)
const EXCHANGE_RATES: Record<string, number> = {
  SEK: 1,      // Base currency
  EUR: 0.087,  // 1 SEK = 0.087 EUR (approx 11.5 SEK per EUR)
  USD: 0.093,  // 1 SEK = 0.093 USD (approx 10.8 SEK per USD)
  GBP: 0.076,  // 1 SEK = 0.076 GBP (approx 13.2 SEK per GBP)
  NOK: 1.0,    // 1 SEK = 1.0 NOK (approximate)
  DKK: 0.65    // 1 SEK = 0.65 DKK (approx 1.54 SEK per DKK)
};

const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string): number => {
  if (fromCurrency === toCurrency) return amount;
  // Convert from SEK to target currency
  if (fromCurrency === 'SEK') {
    return amount * (EXCHANGE_RATES[toCurrency] || 1);
  }
  // Convert from target currency back to SEK, then to new currency
  const sekAmount = amount / (EXCHANGE_RATES[fromCurrency] || 1);
  return sekAmount * (EXCHANGE_RATES[toCurrency] || 1);
};

const formatCurrency = (amount: number, currency: string): string => {
  const converted = convertCurrency(amount, 'SEK', currency);
  return `${converted.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ${currency}`;
};

export default function PartnerStockReport({
  stockData,
  stores,
  brands,
  countries,
  selectedTimePeriod,
  selectedStoreId,
  selectedBrandId,
  selectedCountryId,
  partnerId,
  originalTimePeriod,
  selectedMonth,
  selectedWeek,
  dateRangeStart,
  dateRangeEnd,
  currency = 'SEK'
}: PartnerStockReportProps) {

  // Filter and aggregate data by category
  const categoryData = useMemo(() => {
    const periodData = stockData[selectedTimePeriod];
    if (!periodData || !Array.isArray(periodData)) {
      return [];
    }
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
      const expired = categoryItems.reduce((sum, item) => sum + (item.expired || 0), 0);
      const inOrder = categoryItems.reduce((sum, item) => sum + (item.inOrder || 0), 0);
      const sold = categoryItems.reduce((sum, item) => sum + item.sold, 0);
      const inStockRegular = inStock - expired; // Regular in stock (not expired)
      const total = inStock + inOrder + sold;
      
      return {
        category,
        inStock,
        inStockRegular,
        expired,
        inOrder,
        sold,
        total,
        sellThroughRate: total > 0 ? ((sold / total) * 100).toFixed(1) : '0.0'
      };
    }).filter(item => item.total > 0); // Only show categories with data

    // Calculate total stock count (inStock + inOrder) for percentage calculation
    const totalStockCount = aggregated.reduce((sum, item) => sum + item.inStock + item.inOrder, 0);

    // Add percentage of total stock count
    const withPercentages = aggregated.map(item => ({
      ...item,
      percentageOfTotal: totalStockCount > 0 
        ? (((item.inStock + item.inOrder) / totalStockCount) * 100).toFixed(1)
        : '0.0'
    }));

    return withPercentages.sort((a, b) => b.total - a.total);
  }, [stockData, selectedTimePeriod, selectedStoreId, selectedBrandId, selectedCountryId, stores]);

  // Calculate totals including stock value, average price, and average days to sell
  const totals = useMemo(() => {
    const periodData = stockData[selectedTimePeriod];
    if (!periodData || !Array.isArray(periodData)) {
      return { inStock: 0, inStockRegular: 0, expired: 0, inOrder: 0, sold: 0, total: 0, stockValue: 0, averagePrice: 0, averageDaysToSell: 0 };
    }
    let filtered = periodData;

    // Apply filters
    if (selectedStoreId !== 'all') {
      filtered = filtered.filter(item => item.storeId === selectedStoreId);
    }
    if (selectedBrandId !== 'all') {
      const brandStoreIds = stores
        .filter(store => store.brandId === selectedBrandId)
        .map(store => store.id);
      filtered = filtered.filter(item => brandStoreIds.includes(item.storeId));
    }
    if (selectedCountryId !== 'all') {
      const countryStoreIds = stores
        .filter(store => store.countryId === selectedCountryId)
        .map(store => store.id);
      filtered = filtered.filter(item => countryStoreIds.includes(item.storeId));
    }

    const categoryTotals = categoryData.reduce(
      (acc, item) => ({
        inStock: acc.inStock + item.inStock,
        inStockRegular: acc.inStockRegular + item.inStockRegular,
        expired: acc.expired + item.expired,
        inOrder: acc.inOrder + item.inOrder,
        sold: acc.sold + item.sold,
        total: acc.total + item.total
      }),
      { inStock: 0, inStockRegular: 0, expired: 0, inOrder: 0, sold: 0, total: 0 }
    );

    // Price mapping by category (fallback if averagePrice is not in data)
    const categoryPrices: Record<string, number> = {
      'Tops': 299, 'Dresses': 399, 'Jeans': 599, 'Trousers': 449, 'Shorts': 249,
      'Skirts': 349, 'Jackets': 799, 'Coats': 899, 'Hoodies': 399, 'Sweaters': 449,
      'Shoes': 699, 'Accessories': 149, 'Other': 199
    };
    
    const categoryDaysToSell: Record<string, number> = {
      'Tops': 12, 'Dresses': 15, 'Jeans': 10, 'Trousers': 14, 'Shorts': 8,
      'Skirts': 13, 'Jackets': 18, 'Coats': 20, 'Hoodies': 11, 'Sweaters': 16,
      'Shoes': 14, 'Accessories': 9, 'Other': 10
    };

    // Calculate stock value (sum of inStock * averagePrice)
    const stockValue = filtered.reduce((sum, item) => {
      const price = item.averagePrice || categoryPrices[item.category] || 400;
      return sum + (item.inStock * price);
    }, 0);

    // Calculate average price (weighted by quantity)
    const totalItems = filtered.reduce((sum, item) => sum + item.inStock + item.sold, 0);
    const totalValue = filtered.reduce((sum, item) => {
      const price = item.averagePrice || categoryPrices[item.category] || 400;
      return sum + ((item.inStock + item.sold) * price);
    }, 0);
    const averagePrice = totalItems > 0 ? totalValue / totalItems : 0;

    // Calculate average days to sell (weighted by quantity sold)
    const totalSold = filtered.reduce((sum, item) => sum + item.sold, 0);
    const totalDaysWeighted = filtered.reduce((sum, item) => {
      const days = item.averageDaysToSell || categoryDaysToSell[item.category] || 12;
      return sum + (item.sold * days);
    }, 0);
    const averageDaysToSell = totalSold > 0 ? totalDaysWeighted / totalSold : 0;

    return {
      ...categoryTotals,
      stockValue,
      averagePrice,
      averageDaysToSell
    };
  }, [categoryData, stockData, selectedTimePeriod, selectedStoreId, selectedBrandId, selectedCountryId, stores]);

  const overallSellThroughRate = totals.total > 0 
    ? ((totals.sold / totals.total) * 100).toFixed(1)
    : '0.0';

  // Prepare chart data for stock count by category
  const chartData = useMemo(() => {
    return categoryData.map(item => ({
      category: item.category,
      'In Stock': item.inStockRegular,
      'Expired': item.expired,
      'In Order': item.inOrder,
      'Sold': item.sold,
      'Total In Stock': item.inStockRegular + item.expired, // For stacked bar label
      percentage: item.percentageOfTotal
    }));
  }, [categoryData]);

  // Prepare daily stock chart data (current month vs previous month)
  const dailyStockChartData = useMemo(() => {
    if (!stockData.dailyStockByMonth) return [];
    
    const currentMonth = stockData.dailyStockByMonth.currentMonth || [];
    const previousMonth = stockData.dailyStockByMonth.previousMonth || [];
    
    // Create maps keyed by day of month (1-31) for easy comparison
    const currentMap = new Map<number, number>();
    const previousMap = new Map<number, number>();
    
    currentMonth.forEach(d => {
      const dateObj = new Date(d.date);
      const dayOfMonth = dateObj.getDate();
      currentMap.set(dayOfMonth, d.totalStock);
    });
    
    previousMonth.forEach(d => {
      const dateObj = new Date(d.date);
      const dayOfMonth = dateObj.getDate();
      previousMap.set(dayOfMonth, d.totalStock);
    });
    
    // Get all days that exist in either month (1-31)
    const allDays = new Set<number>();
    currentMonth.forEach(d => {
      const dateObj = new Date(d.date);
      allDays.add(dateObj.getDate());
    });
    previousMonth.forEach(d => {
      const dateObj = new Date(d.date);
      allDays.add(dateObj.getDate());
    });
    
    // Create data points aligned by day of month
    return Array.from(allDays).sort((a, b) => a - b).map(day => {
      return {
        date: day.toString(),
        'Selected Period': currentMap.get(day) ?? null,
        'Last Month': previousMap.get(day) ?? null
      };
    });
  }, [stockData]);

  // Prepare stock value by category chart data with previous period comparison
  const stockValueChartData = useMemo(() => {
    const periodData = stockData[selectedTimePeriod];
    if (!periodData || !Array.isArray(periodData)) {
      return [];
    }
    let filtered = periodData;

    // Determine previous period for comparison
    let previousPeriodData: StockDataPoint[] | undefined;
    const previousPeriodMap: Record<TimePeriod, TimePeriod | null> = {
      'daily': null,
      'sevenDays': 'daily',
      'fourteenDays': 'sevenDays',
      'thirtyDays': 'fourteenDays'
    };
    const previousPeriod = previousPeriodMap[selectedTimePeriod];
    if (previousPeriod && stockData[previousPeriod]) {
      previousPeriodData = stockData[previousPeriod];
    }

    // Apply filters to current period
    if (selectedStoreId !== 'all') {
      filtered = filtered.filter(item => item.storeId === selectedStoreId);
    }
    if (selectedBrandId !== 'all') {
      const brandStoreIds = stores
        .filter(store => store.brandId === selectedBrandId)
        .map(store => store.id);
      filtered = filtered.filter(item => brandStoreIds.includes(item.storeId));
    }
    if (selectedCountryId !== 'all') {
      const countryStoreIds = stores
        .filter(store => store.countryId === selectedCountryId)
        .map(store => store.id);
      filtered = filtered.filter(item => countryStoreIds.includes(item.storeId));
    }

    // Apply same filters to previous period
    let previousFiltered: StockDataPoint[] = [];
    if (previousPeriodData) {
      previousFiltered = previousPeriodData;
      if (selectedStoreId !== 'all') {
        previousFiltered = previousFiltered.filter(item => item.storeId === selectedStoreId);
      }
      if (selectedBrandId !== 'all') {
        const brandStoreIds = stores
          .filter(store => store.brandId === selectedBrandId)
          .map(store => store.id);
        previousFiltered = previousFiltered.filter(item => brandStoreIds.includes(item.storeId));
      }
      if (selectedCountryId !== 'all') {
        const countryStoreIds = stores
          .filter(store => store.countryId === selectedCountryId)
          .map(store => store.id);
        previousFiltered = previousFiltered.filter(item => countryStoreIds.includes(item.storeId));
      }
    }

    // Price mapping by category (fallback if averagePrice is not in data)
    const categoryPrices: Record<string, number> = {
      'Tops': 299, 'Dresses': 399, 'Jeans': 599, 'Trousers': 449, 'Shorts': 249,
      'Skirts': 349, 'Jackets': 799, 'Coats': 899, 'Hoodies': 399, 'Sweaters': 449,
      'Shoes': 699, 'Accessories': 149, 'Other': 199
    };

    // Aggregate by category for both periods
    const categoryValues = CATEGORIES.map(category => {
      const categoryItems = filtered.filter(item => item.category === category);
      const stockValue = categoryItems.reduce((sum, item) => {
        const price = item.averagePrice || categoryPrices[item.category] || 400;
        return sum + (item.inStock * price);
      }, 0);

      const previousCategoryItems = previousFiltered.filter(item => item.category === category);
      const previousStockValue = previousCategoryItems.reduce((sum, item) => {
        const price = item.averagePrice || categoryPrices[item.category] || 400;
        return sum + (item.inStock * price);
      }, 0);
      
      return {
        category,
        'Current Period': stockValue,
        'Previous Period': previousStockValue
      };
    }).filter(item => item['Current Period'] > 0 || item['Previous Period'] > 0);

    return categoryValues.sort((a, b) => b['Current Period'] - a['Current Period']);
  }, [stockData, selectedTimePeriod, selectedStoreId, selectedBrandId, selectedCountryId, stores]);

  // Debug: Log chart data
  React.useEffect(() => {
    console.log('Stock Chart Data:', chartData);
    console.log('Category Data:', categoryData);
    console.log('Selected Time Period:', selectedTimePeriod);
    console.log('Stock Data:', stockData);
  }, [chartData, categoryData, selectedTimePeriod, stockData]);

  const soldBarColor = '#4b5563'; // Dark grey for sold

  const chartConfig = {
    'In Stock': {
      label: 'In Stock',
      color: '#2563eb', // Blue gradient for in-stock
    },
    'Expired': {
      label: 'Expired',
      color: '#1e40af', // Darker blue for expired
    },
    'In Order': {
      label: 'In Order',
      color: '#9ca3af', // Light grey for in order
    },
    'Sold': {
      label: 'Sold',
      color: soldBarColor, // Dark grey for sold
    },
  };

  const getPeriodLabelForTimePeriod = (period: TimePeriod) => {
    switch (period) {
      case 'daily': return 'Today';
      case 'sevenDays': return '7 Days';
      case 'fourteenDays': return '14 Days';
      case 'thirtyDays': return '30 Days';
    }
  };

  // Get period type label
  const getPeriodTypeLabel = () => {
    if (originalTimePeriod) {
      switch (originalTimePeriod) {
        case 'month': return 'Month';
        case 'daily': return 'Yesterday';
        case 'week': return 'Week';
        case 'sevenDays': return '7 Days';
        case 'fourteenDays': return '14 Days';
        case 'thirtyDays': return '30 Days';
        case 'dateRange': return 'Date Range';
        default: return getPeriodLabelForTimePeriod(selectedTimePeriod);
      }
    }
    return getPeriodLabelForTimePeriod(selectedTimePeriod);
  };

  // Get selected date/week/month label
  const getSelectedDateLabel = () => {
    if (originalTimePeriod === 'month' && selectedMonth) {
      return new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    if (originalTimePeriod === 'week' && selectedWeek) {
      const [year, week] = selectedWeek.split('-W');
      return `Week ${week}, ${year}`;
    }
    if (originalTimePeriod === 'dateRange' && dateRangeStart && dateRangeEnd) {
      const start = new Date(dateRangeStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const end = new Date(dateRangeEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      return `${start} - ${end}`;
    }
    if (originalTimePeriod === 'daily') {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return yesterday.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }
    // For other periods, show current date range
    const today = new Date();
    const startDate = new Date(today);
    const daysBack = originalTimePeriod === 'sevenDays' ? 7 : originalTimePeriod === 'fourteenDays' ? 14 : 30;
    startDate.setDate(startDate.getDate() - daysBack);
    const start = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const end = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${start} - ${end}`;
  };

  // Get previous period label
  const getPreviousPeriodLabel = () => {
    if (originalTimePeriod === 'month' && selectedMonth) {
      const monthDate = new Date(selectedMonth + '-01');
      const prevMonth = new Date(monthDate);
      prevMonth.setMonth(prevMonth.getMonth() - 1);
      return `Previous Month: ${prevMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
    }
    if (originalTimePeriod === 'week' && selectedWeek) {
      const parts = selectedWeek.split('-W');
      if (parts.length === 2) {
        const [year, week] = parts;
        const weekNum = parseInt(week || '1');
        if (weekNum > 1) {
          return `Previous Week: Week ${weekNum - 1}, ${year}`;
        } else {
          const prevYear = parseInt(year || '2024') - 1;
          return `Previous Week: Week 52, ${prevYear}`;
        }
      }
    }
    if (originalTimePeriod === 'dateRange' && dateRangeStart && dateRangeEnd) {
      const start = new Date(dateRangeStart);
      const end = new Date(dateRangeEnd);
      const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const prevStart = new Date(start);
      prevStart.setDate(prevStart.getDate() - daysDiff);
      const prevEnd = new Date(end);
      prevEnd.setDate(prevEnd.getDate() - daysDiff);
      const prevStartStr = prevStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const prevEndStr = prevEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      return `Previous Period: ${prevStartStr} - ${prevEndStr}`;
    }
    if (originalTimePeriod === 'daily') {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dayBefore = new Date(yesterday);
      dayBefore.setDate(dayBefore.getDate() - 1);
      return `Previous Day: ${dayBefore.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
    }
    // For other periods
    const periodType = getPeriodTypeLabel();
    return `Previous ${periodType}`;
  };

  // Get display label for the original time period (before conversion) - combined format
  const getDisplayPeriodLabel = () => {
    const periodType = getPeriodTypeLabel();
    const dateLabel = getSelectedDateLabel();
    return `${periodType}: ${dateLabel}`;
  };

  // Get display label with previous period for charts with comparison
  const getDisplayPeriodLabelWithPrevious = () => {
    const current = getDisplayPeriodLabel();
    const previous = getPreviousPeriodLabel();
    return `${current} vs ${previous}`;
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-surface-container border border-outline-variant rounded-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="body-medium text-on-surface-variant">Stock Count</span>
              <Package className="h-5 w-5 text-chart-1" />
            </div>
            <p className="display-small text-on-surface">{totals.inStock.toLocaleString()}</p>
            <p className="body-small text-on-surface-variant mt-1">Total items in stock</p>
          </CardContent>
        </Card>

        <Card className="bg-surface-container border border-outline-variant rounded-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="body-medium text-on-surface-variant">Stock Value</span>
              <DollarSign className="h-5 w-5 text-chart-1" />
            </div>
            <p className="display-small text-on-surface">{formatCurrency(totals.stockValue, currency)}</p>
            <p className="body-small text-on-surface-variant mt-1">total inventory value</p>
          </CardContent>
        </Card>

        <Card className="bg-surface-container border border-outline-variant rounded-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="body-medium text-on-surface-variant">Average Price</span>
              <DollarSign className="h-5 w-5 text-chart-2" />
            </div>
            <p className="display-small text-on-surface">{formatCurrency(totals.averagePrice, currency)}</p>
            <p className="body-small text-on-surface-variant mt-1">per item</p>
          </CardContent>
        </Card>

        <Card className="bg-surface-container border border-outline-variant rounded-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="body-medium text-on-surface-variant">Avg Days to Sell</span>
              <Clock className="h-5 w-5 text-chart-3" />
            </div>
            <p className="display-small text-on-surface">{Math.round(totals.averageDaysToSell)}</p>
            <p className="body-small text-on-surface-variant mt-1">days</p>
          </CardContent>
        </Card>
      </div>

      {/* Stock Count by Category Chart */}
      <Card className="bg-surface-container border border-outline-variant rounded-lg">
        <CardContent className="p-6">
          <h3 className="title-medium text-on-surface mb-4">
            Stock Count by Category - {getDisplayPeriodLabel()}
          </h3>
          {chartData && chartData.length > 0 ? (
            <div className="w-full" style={{ height: '450px' }}>
              <ChartContainer config={chartConfig} className="h-full w-full [&]:!aspect-auto">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }} barGap={0}>
                  <defs>
                    <linearGradient id="blueGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#60a5fa" stopOpacity={1} />
                      <stop offset="50%" stopColor="#3b82f6" stopOpacity={1} />
                      <stop offset="100%" stopColor="#2563eb" stopOpacity={1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--outline-variant))" />
                  <XAxis 
                    dataKey="category" 
                    stroke="hsl(var(--on-surface-variant))"
                    style={{ fontSize: '12px' }}
                    angle={-45}
                    textAnchor="end"
                    height={120}
                    tick={(props) => {
                      const { x, y, payload } = props;
                      const data = chartData[payload.index];
                      return (
                        <g transform={`translate(${x},${y})`}>
                          <text x={0} y={0} dy={16} textAnchor="end" fill="hsl(var(--on-surface-variant))" fontSize="12px">
                            {payload.value}
                          </text>
                          <text x={0} y={0} dy={32} textAnchor="end" fill="hsl(var(--on-surface-variant))" fontSize="10px" fontWeight="500">
                            {data?.percentage || '0.0'}%
                          </text>
                        </g>
                      );
                    }}
                  />
                  <YAxis 
                    stroke="hsl(var(--on-surface-variant))"
                    style={{ fontSize: '12px' }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="Expired" fill="#1e40af" radius={[0, 0, 0, 0]} stackId="stock" />
                  <Bar dataKey="In Stock" fill="url(#blueGradient)" radius={[8, 8, 0, 0]} stackId="stock">
                    <LabelList 
                      dataKey="Total In Stock" 
                      position="top" 
                      style={{ fontSize: '11px', fill: 'hsl(var(--on-surface))' }}
                      formatter={(value: number) => value > 0 ? value : ''}
                    />
                  </Bar>
                  <Bar dataKey="In Order" fill="#9ca3af" radius={[8, 8, 0, 0]}>
                    <LabelList 
                      dataKey="In Order" 
                      position="top" 
                      style={{ fontSize: '11px', fill: 'hsl(var(--on-surface))' }}
                      formatter={(value: number) => value > 0 ? value : ''}
                    />
                  </Bar>
                  <Bar dataKey="Sold" fill={soldBarColor} radius={[8, 8, 0, 0]}>
                    <LabelList 
                      dataKey="Sold" 
                      position="top" 
                      style={{ fontSize: '11px', fill: 'hsl(var(--on-surface))' }}
                      formatter={(value: number) => value > 0 ? value : ''}
                    />
                  </Bar>
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
              Category Breakdown - {getDisplayPeriodLabel()}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container-high">
                  <th className="text-left py-3 px-4 label-medium text-on-surface-variant">Category</th>
                  <th className="text-right py-3 px-4 label-medium text-on-surface-variant">In Stock</th>
                  <th className="text-right py-3 px-4 label-medium text-on-surface-variant">Expired</th>
                  <th className="text-right py-3 px-4 label-medium text-on-surface-variant">In Order</th>
                  <th className="text-right py-3 px-4 label-medium text-on-surface-variant">Sold</th>
                  <th className="text-right py-3 px-4 label-medium text-on-surface-variant">Total</th>
                  <th className="text-right py-3 px-4 label-medium text-on-surface-variant">% of Total</th>
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
                            <AlertCircle className="h-4 w-4 text-error" />
                          )}
                          {isHighSellThrough && (
                            <TrendingUp className="h-4 w-4 text-chart-2" />
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 body-medium text-on-surface text-right">
                        {item.inStockRegular.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 body-medium text-on-surface text-right">
                        {item.expired.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 body-medium text-on-surface text-right">
                        {item.inOrder.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 body-medium text-on-surface text-right">
                        {item.sold.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 body-medium text-on-surface text-right">
                        {item.total.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 body-medium text-on-surface text-right">
                        {item.percentageOfTotal}%
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
                    {totals.inStockRegular.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 title-small text-on-surface text-right font-semibold">
                    {totals.expired.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 title-small text-on-surface text-right font-semibold">
                    {totals.inOrder.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 title-small text-on-surface text-right font-semibold">
                    {totals.sold.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 title-small text-on-surface text-right font-semibold">
                    {totals.total.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 title-small text-on-surface text-right font-semibold">
                    100.0%
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

      {/* Stock Value by Category Chart */}
      {stockValueChartData.length > 0 && (
        <Card className="bg-surface-container border border-outline-variant rounded-lg">
          <CardContent className="p-6">
            <h3 className="title-medium text-on-surface mb-4">
              Stock Value by Category - {getDisplayPeriodLabelWithPrevious()}
            </h3>
            <div className="w-full" style={{ height: '400px' }}>
              <ChartContainer 
                config={{
                  'Current Period': { label: getDisplayPeriodLabel(), color: '#2563eb' },
                  'Previous Period': { label: 'Previous Period', color: '#4b5563' }
                }} 
                className="h-full w-full [&]:!aspect-auto"
              >
                <BarChart data={stockValueChartData}>
                  <defs>
                    <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#60a5fa" stopOpacity={1} />
                      <stop offset="50%" stopColor="#3b82f6" stopOpacity={1} />
                      <stop offset="100%" stopColor="#2563eb" stopOpacity={1} />
                    </linearGradient>
                  </defs>
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
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    formatter={(value: number) => formatCurrency(value, currency)}
                  />
                  <Legend />
                  <Bar 
                    dataKey="Current Period" 
                    fill="url(#blueGradient)" 
                    radius={[8, 8, 0, 0]} 
                  />
                  <Bar 
                    dataKey="Previous Period" 
                    fill="#4b5563" 
                    radius={[8, 8, 0, 0]} 
                  />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Daily Stock Trend Chart */}
      {dailyStockChartData.length > 0 && (
        <Card className="bg-surface-container border border-outline-variant rounded-lg">
          <CardContent className="p-6">
            <h3 className="title-medium text-on-surface mb-4">
              Total Stock per Day - {getDisplayPeriodLabelWithPrevious()}
            </h3>
            <div className="w-full" style={{ height: '400px' }}>
              <ChartContainer 
                config={{
                  'Selected Period': { label: getDisplayPeriodLabel(), color: '#2563eb' },
                  'Last Month': { label: 'Last Month', color: '#4b5563' }
                }} 
                className="h-full w-full [&]:!aspect-auto"
              >
                <LineChart data={dailyStockChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--outline-variant))" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--on-surface-variant))"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="hsl(var(--on-surface-variant))"
                    style={{ fontSize: '12px' }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="Selected Period" 
                    stroke="#2563eb" 
                    strokeWidth={3}
                    dot={{ r: 5, fill: '#2563eb' }}
                    activeDot={{ r: 7, fill: '#2563eb' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Last Month" 
                    stroke="#4b5563" 
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    dot={{ r: 5, fill: '#4b5563' }}
                    activeDot={{ r: 7, fill: '#4b5563' }}
                  />
                </LineChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

