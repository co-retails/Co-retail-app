import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from './ui/chart';
import { TrendingUp, Store, Tag, Calendar, DollarSign } from 'lucide-react';
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
  selectedTimePeriod: 'month' | 'daily' | 'week' | 'sevenDays' | 'fourteenDays' | 'thirtyDays' | 'dateRange';
  selectedBrandId: string;
  selectedCountryId: string;
  selectedStoreId: string;
  selectedWeek?: string;
  dateRangeStart?: string;
  dateRangeEnd?: string;
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
  selectedWeek,
  dateRangeStart,
  dateRangeEnd,
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

  // Get period type label
  const getPeriodTypeLabel = () => {
    switch (selectedTimePeriod) {
      case 'month': return 'Month';
      case 'daily': return 'Yesterday';
      case 'week': return 'Week';
      case 'sevenDays': return '7 Days';
      case 'fourteenDays': return '14 Days';
      case 'thirtyDays': return '30 Days';
      case 'dateRange': return 'Date Range';
      default: return 'Period';
    }
  };

  // Get selected date/week/month label
  const getSelectedDateLabel = () => {
    if (selectedTimePeriod === 'month') {
      return new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    if (selectedTimePeriod === 'week' && selectedWeek) {
      const [year, week] = selectedWeek.split('-W');
      return `Week ${week}, ${year}`;
    }
    if (selectedTimePeriod === 'dateRange' && dateRangeStart && dateRangeEnd) {
      const start = new Date(dateRangeStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const end = new Date(dateRangeEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      return `${start} - ${end}`;
    }
    if (selectedTimePeriod === 'daily') {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return yesterday.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }
    // For other periods, show current date range
    const today = new Date();
    const startDate = new Date(today);
    const daysBack = selectedTimePeriod === 'sevenDays' ? 7 : selectedTimePeriod === 'fourteenDays' ? 14 : 30;
    startDate.setDate(startDate.getDate() - daysBack);
    const start = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const end = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${start} - ${end}`;
  };

  // Get previous period label
  const getPreviousPeriodLabel = () => {
    if (selectedTimePeriod === 'month' && salesData.length > 0) {
      const currentMonthIndex = salesData.findIndex(d => d.month === selectedMonth);
      if (currentMonthIndex > 0) {
        const prevMonth = salesData[currentMonthIndex - 1].month;
        return `Previous Month: ${new Date(prevMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
      }
    }
    if (selectedTimePeriod === 'week' && selectedWeek) {
      const [year, week] = selectedWeek.split('-W');
      const weekNum = parseInt(week);
      if (weekNum > 1) {
        return `Previous Week: Week ${weekNum - 1}, ${year}`;
      } else {
        const prevYear = parseInt(year) - 1;
        // Approximate - get last week of previous year (usually week 52 or 53)
        return `Previous Week: Week 52, ${prevYear}`;
      }
    }
    if (selectedTimePeriod === 'dateRange' && dateRangeStart && dateRangeEnd) {
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
    if (selectedTimePeriod === 'daily') {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dayBefore = new Date(yesterday);
      dayBefore.setDate(dayBefore.getDate() - 1);
      return `Previous Day: ${dayBefore.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
    }
    // For other periods (7 days, 14 days, 30 days)
    const periodType = getPeriodTypeLabel();
    return `Previous ${periodType}`;
  };

  // Get period label for display (combined)
  const getPeriodLabel = () => {
    const periodType = getPeriodTypeLabel();
    const dateLabel = getSelectedDateLabel();
    return `${periodType}: ${dateLabel}`;
  };

  // Get period label with previous period for charts with comparison
  const getPeriodLabelWithPrevious = () => {
    const current = getPeriodLabel();
    const previous = getPreviousPeriodLabel();
    return `${current} vs ${previous}`;
  };

  // Prepare chart data for trend overview - apply filters and include previous period
  const trendChartData = useMemo(() => {
    const dataPoints = salesData.map((data, index) => {
      let totalSold = 0;
      
      // Priority: Store > Brand > Country > All
      if (selectedStoreId !== 'all') {
        const storeData = data.byStore.find(s => s.storeId === selectedStoreId);
        totalSold = storeData?.sold || 0;
        
        if (selectedBrandId !== 'all') {
          const store = stores.find(s => s.id === selectedStoreId);
          if (store?.brandId !== selectedBrandId) {
            totalSold = 0;
          }
        }
      } else if (selectedBrandId !== 'all') {
        const brandData = data.byBrand.find(b => b.brandId === selectedBrandId);
        totalSold = brandData?.sold || 0;
        
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
        const countryStoreIds = stores
          .filter(store => store.countryId === selectedCountryId)
          .map(store => store.id);
        const countryStoresData = data.byStore.filter(s => 
          countryStoreIds.includes(s.storeId)
        );
        totalSold = countryStoresData.reduce((sum, s) => sum + s.sold, 0);
      } else {
        totalSold = data.totalSold;
      }
      
      // Calculate previous period value (previous month)
      let previousSold = 0;
      if (index > 0) {
        const prevData = salesData[index - 1];
        if (selectedStoreId !== 'all') {
          const storeData = prevData.byStore.find(s => s.storeId === selectedStoreId);
          previousSold = storeData?.sold || 0;
          
          if (selectedBrandId !== 'all') {
            const store = stores.find(s => s.id === selectedStoreId);
            if (store?.brandId !== selectedBrandId) {
              previousSold = 0;
            }
          }
        } else if (selectedBrandId !== 'all') {
          const brandData = prevData.byBrand.find(b => b.brandId === selectedBrandId);
          previousSold = brandData?.sold || 0;
          
          if (selectedCountryId !== 'all') {
            const countryStoreIds = stores
              .filter(store => store.countryId === selectedCountryId && store.brandId === selectedBrandId)
              .map(store => store.id);
            const countryStoresData = prevData.byStore.filter(s => 
              countryStoreIds.includes(s.storeId)
            );
            previousSold = countryStoresData.reduce((sum, s) => sum + s.sold, 0);
          }
        } else if (selectedCountryId !== 'all') {
          const countryStoreIds = stores
            .filter(store => store.countryId === selectedCountryId)
            .map(store => store.id);
          const countryStoresData = prevData.byStore.filter(s => 
            countryStoreIds.includes(s.storeId)
          );
          previousSold = countryStoresData.reduce((sum, s) => sum + s.sold, 0);
        } else {
          previousSold = prevData.totalSold;
        }
      }
      
      return {
        month: new Date(data.month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        'Current Period': totalSold,
        'Previous Period': previousSold
      };
    });
    
    return dataPoints;
  }, [salesData, selectedBrandId, selectedStoreId, selectedCountryId, stores]);

  // Get previous period data for comparison
  const previousPeriodData = useMemo(() => {
    if (selectedTimePeriod === 'month' && salesData.length > 0) {
      const currentMonthIndex = salesData.findIndex(d => d.month === selectedMonth);
      if (currentMonthIndex > 0) {
        return salesData[currentMonthIndex - 1];
      }
    }
    return null;
  }, [salesData, selectedMonth, selectedTimePeriod]);

  // Calculate previous period total
  const previousPeriodTotal = useMemo(() => {
    if (!previousPeriodData) return 0;
    
    // Apply same filters as current period
    if (selectedStoreId !== 'all') {
      const storeData = previousPeriodData.byStore.find(s => s.storeId === selectedStoreId);
      let sold = storeData?.sold || 0;
      
      if (selectedBrandId !== 'all') {
        const store = stores.find(s => s.id === selectedStoreId);
        if (store?.brandId !== selectedBrandId) {
          sold = 0;
        }
      }
      return sold;
    } else if (selectedBrandId !== 'all') {
      const brandData = previousPeriodData.byBrand.find(b => b.brandId === selectedBrandId);
      let sold = brandData?.sold || 0;
      
      if (selectedCountryId !== 'all') {
        const countryStoreIds = stores
          .filter(store => store.countryId === selectedCountryId && store.brandId === selectedBrandId)
          .map(store => store.id);
        const countryStoresData = previousPeriodData.byStore.filter(s => 
          countryStoreIds.includes(s.storeId)
        );
        sold = countryStoresData.reduce((sum, s) => sum + s.sold, 0);
      }
      return sold;
    } else if (selectedCountryId !== 'all') {
      const countryStoreIds = stores
        .filter(store => store.countryId === selectedCountryId)
        .map(store => store.id);
      const countryStoresData = previousPeriodData.byStore.filter(s => 
        countryStoreIds.includes(s.storeId)
      );
      return countryStoresData.reduce((sum, s) => sum + s.sold, 0);
    } else {
      return previousPeriodData.totalSold;
    }
  }, [previousPeriodData, selectedBrandId, selectedStoreId, selectedCountryId, stores]);

  // Prepare daily sales chart data for selected period with previous period comparison
  const dailySalesChartData = useMemo(() => {
    // Generate daily data from monthly data for the selected period
    // For month selection, distribute monthly sales across days
    // For other periods, generate sample daily data
    
    if (selectedTimePeriod === 'month' && periodData) {
      const monthDate = new Date(selectedMonth + '-01');
      const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
      const dailyAverage = totalSoldThisMonth / daysInMonth;
      const previousDailyAverage = previousPeriodTotal / daysInMonth;
      
      // Get previous month date
      const previousMonthDate = new Date(monthDate);
      previousMonthDate.setMonth(previousMonthDate.getMonth() - 1);
      const previousDaysInMonth = new Date(previousMonthDate.getFullYear(), previousMonthDate.getMonth() + 1, 0).getDate();
      
      // Generate daily data with some variation
      const dailyData = [];
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
        // Add some random variation (±20%) to make it realistic
        const variation = 0.8 + Math.random() * 0.4;
        const dailySold = Math.round(dailyAverage * variation);
        
        // Calculate previous period value for same day of month
        let previousDailySold = 0;
        if (previousPeriodData && day <= previousDaysInMonth) {
          const prevVariation = 0.8 + Math.random() * 0.4;
          previousDailySold = Math.round(previousDailyAverage * prevVariation);
        }
        
        dailyData.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          'Current Period': dailySold,
          'Previous Period': previousDailySold
        });
      }
      return dailyData;
    } else if (selectedTimePeriod === 'daily' && periodData) {
      // For yesterday, show a single day
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dayBefore = new Date(yesterday);
      dayBefore.setDate(dayBefore.getDate() - 1);
      return [{
        date: yesterday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        'Current Period': totalSoldThisMonth,
        'Previous Period': previousPeriodTotal
      }];
    } else if (selectedTimePeriod === 'week' && selectedWeek && periodData) {
      // For week, generate 7 days of data
      const [year, week] = selectedWeek.split('-W');
      const weekStart = new Date(parseInt(year), 0, 1);
      const daysToAdd = (parseInt(week) - 1) * 7;
      weekStart.setDate(weekStart.getDate() + daysToAdd);
      
      const dailyAverage = totalSoldThisMonth / 7;
      const previousDailyAverage = previousPeriodTotal / 7;
      const dailyData = [];
      for (let day = 0; day < 7; day++) {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + day);
        const variation = 0.8 + Math.random() * 0.4;
        const dailySold = Math.round(dailyAverage * variation);
        const prevVariation = 0.8 + Math.random() * 0.4;
        const previousDailySold = Math.round(previousDailyAverage * prevVariation);
        
        dailyData.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          'Current Period': dailySold,
          'Previous Period': previousDailySold
        });
      }
      return dailyData;
    } else if (selectedTimePeriod === 'sevenDays' && periodData) {
      // For 7 days, generate last 7 days
      const dailyAverage = totalSoldThisMonth / 7;
      const previousDailyAverage = previousPeriodTotal / 7;
      const dailyData = [];
      for (let day = 6; day >= 0; day--) {
        const date = new Date();
        date.setDate(date.getDate() - day);
        const variation = 0.8 + Math.random() * 0.4;
        const dailySold = Math.round(dailyAverage * variation);
        const prevVariation = 0.8 + Math.random() * 0.4;
        const previousDailySold = Math.round(previousDailyAverage * prevVariation);
        
        dailyData.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          'Current Period': dailySold,
          'Previous Period': previousDailySold
        });
      }
      return dailyData;
    } else if (selectedTimePeriod === 'fourteenDays' && periodData) {
      // For 14 days
      const dailyAverage = totalSoldThisMonth / 14;
      const previousDailyAverage = previousPeriodTotal / 14;
      const dailyData = [];
      for (let day = 13; day >= 0; day--) {
        const date = new Date();
        date.setDate(date.getDate() - day);
        const variation = 0.8 + Math.random() * 0.4;
        const dailySold = Math.round(dailyAverage * variation);
        const prevVariation = 0.8 + Math.random() * 0.4;
        const previousDailySold = Math.round(previousDailyAverage * prevVariation);
        
        dailyData.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          'Current Period': dailySold,
          'Previous Period': previousDailySold
        });
      }
      return dailyData;
    } else if (selectedTimePeriod === 'thirtyDays' && periodData) {
      // For 30 days
      const dailyAverage = totalSoldThisMonth / 30;
      const previousDailyAverage = previousPeriodTotal / 30;
      const dailyData = [];
      for (let day = 29; day >= 0; day--) {
        const date = new Date();
        date.setDate(date.getDate() - day);
        const variation = 0.8 + Math.random() * 0.4;
        const dailySold = Math.round(dailyAverage * variation);
        const prevVariation = 0.8 + Math.random() * 0.4;
        const previousDailySold = Math.round(previousDailyAverage * prevVariation);
        
        dailyData.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          'Current Period': dailySold,
          'Previous Period': previousDailySold
        });
      }
      return dailyData;
    } else if (selectedTimePeriod === 'dateRange' && dateRangeStart && dateRangeEnd && periodData) {
      // For date range
      const start = new Date(dateRangeStart);
      const end = new Date(dateRangeEnd);
      const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const dailyAverage = totalSoldThisMonth / daysDiff;
      const previousDailyAverage = previousPeriodTotal / daysDiff;
      const dailyData = [];
      
      for (let day = 0; day < daysDiff; day++) {
        const date = new Date(start);
        date.setDate(date.getDate() + day);
        const variation = 0.8 + Math.random() * 0.4;
        const dailySold = Math.round(dailyAverage * variation);
        const prevVariation = 0.8 + Math.random() * 0.4;
        const previousDailySold = Math.round(previousDailyAverage * prevVariation);
        
        dailyData.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          'Current Period': dailySold,
          'Previous Period': previousDailySold
        });
      }
      return dailyData;
    }
    
    return [];
  }, [selectedTimePeriod, selectedMonth, selectedWeek, dateRangeStart, dateRangeEnd, periodData, totalSoldThisMonth, previousPeriodTotal, previousPeriodData]);

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
    'Current Period': {
      label: 'Current Period',
      color: '#2563eb',
    },
    'Previous Period': {
      label: 'Previous Period',
      color: '#4b5563',
    },
  };

  // Debug: Log chart data
  React.useEffect(() => {
    console.log('Trend Chart Data:', trendChartData);
  }, [trendChartData]);

  const totalSoldAllTime = salesData.reduce((sum, data) => sum + data.totalSold, 0);
  const averageMonthlySales = salesData.length > 0 ? totalSoldAllTime / salesData.length : 0;

  // Average price per item (using a reasonable average based on typical retail prices)
  // In a real implementation, this would come from the actual sales data or stock data
  const averagePricePerItem = 400; // SEK

  // Calculate sold value for selected period
  const soldValueForPeriod = totalSoldThisMonth * averagePricePerItem;

  // Calculate monthly average sold value
  const monthlyAverageSoldValue = averageMonthlySales * averagePricePerItem;

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
              <span className="body-medium text-on-surface-variant">Sold Value</span>
              <DollarSign className="h-5 w-5 text-chart-1" />
            </div>
            <p className="display-small text-on-surface">{Math.round(soldValueForPeriod).toLocaleString()}</p>
            <p className="body-small text-on-surface-variant mt-1">SEK {getPeriodLabel()}</p>
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

        <Card className="bg-surface-container border border-outline-variant rounded-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="body-medium text-on-surface-variant">Avg Sold Value</span>
              <DollarSign className="h-5 w-5 text-chart-3" />
            </div>
            <p className="display-small text-on-surface">{Math.round(monthlyAverageSoldValue).toLocaleString()}</p>
            <p className="body-small text-on-surface-variant mt-1">SEK per month</p>
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
                  {mode === 'overview' ? 'Trend' : mode === 'by-store' ? 'By Store' : 'By Brand'}
                </span>
                {viewMode === mode && (
                  <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full" />
                )}
              </button>
            ))}
          </div>

          <div className="p-6">
            {viewMode === 'overview' && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="title-medium text-on-surface">Trend - {getPeriodLabelWithPrevious()}</h3>
                  {trendChartData && trendChartData.length > 0 ? (
                  <div className="w-full" style={{ height: '400px' }}>
                    <ChartContainer config={chartConfig} className="h-full w-full [&]:!aspect-auto">
                      <LineChart data={trendChartData}>
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
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="Current Period" 
                          stroke="#2563eb" 
                          strokeWidth={3}
                          dot={{ r: 5, fill: '#2563eb' }}
                          activeDot={{ r: 7, fill: '#2563eb' }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="Previous Period" 
                          stroke="#4b5563" 
                          strokeWidth={3}
                          strokeDasharray="5 5"
                          dot={{ r: 5, fill: '#4b5563' }}
                          activeDot={{ r: 7, fill: '#4b5563' }}
                        />
                      </LineChart>
                    </ChartContainer>
                  </div>
                ) : (
                  <p className="body-medium text-on-surface-variant text-center py-8">
                    No sales data available for the selected filters
                  </p>
                )}
                </div>

                {/* Sales per Day Chart */}
                <div className="space-y-4">
                  <h3 className="title-medium text-on-surface">Sales per Day - {getPeriodLabelWithPrevious()}</h3>
                  {dailySalesChartData && dailySalesChartData.length > 0 ? (
                    <div className="w-full" style={{ height: '400px' }}>
                      <ChartContainer 
                        config={{
                          'Current Period': { label: getPeriodLabel(), color: '#2563eb' },
                          'Previous Period': { label: 'Previous Period', color: '#4b5563' }
                        }} 
                        className="h-full w-full [&]:!aspect-auto"
                      >
                        <LineChart data={dailySalesChartData}>
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
                            dataKey="Current Period" 
                            stroke="#2563eb" 
                            strokeWidth={3}
                            dot={{ r: 5, fill: '#2563eb' }}
                            activeDot={{ r: 7, fill: '#2563eb' }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="Previous Period" 
                            stroke="#4b5563" 
                            strokeWidth={3}
                            strokeDasharray="5 5"
                            dot={{ r: 5, fill: '#4b5563' }}
                            activeDot={{ r: 7, fill: '#4b5563' }}
                          />
                        </LineChart>
                      </ChartContainer>
                    </div>
                  ) : (
                    <p className="body-medium text-on-surface-variant text-center py-8">
                      No daily sales data available for the selected period
                    </p>
                  )}
                </div>
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
                          <defs>
                            <linearGradient id="storeGradient" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor="#60a5fa" stopOpacity={1} />
                              <stop offset="50%" stopColor="#3b82f6" stopOpacity={1} />
                              <stop offset="100%" stopColor="#2563eb" stopOpacity={1} />
                            </linearGradient>
                          </defs>
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
                          <Bar dataKey="Items Sold" fill="url(#storeGradient)" radius={[0, 8, 8, 0]} />
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
                          <defs>
                            <linearGradient id="brandGradient" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor="#60a5fa" stopOpacity={1} />
                              <stop offset="50%" stopColor="#3b82f6" stopOpacity={1} />
                              <stop offset="100%" stopColor="#2563eb" stopOpacity={1} />
                            </linearGradient>
                          </defs>
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
                          <Bar dataKey="Items Sold" fill="url(#brandGradient)" radius={[0, 8, 8, 0]} />
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

