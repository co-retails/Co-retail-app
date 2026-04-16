import { useState, useMemo } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Download, Filter, X } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { Store, Brand, Country } from './StoreSelector';
import type { Item } from './ItemsScreen';
import { getSekPriceOptions } from '../data/partnerPricing';
import ItemStatusFilterBottomSheet from './ItemStatusFilterBottomSheet';
import svgPaths from '../imports/svg-7un8q74kd7';
import { mockDeliveryNotes, mockDeliveries } from '../data/mockData';
import { sortOptionsAlpha } from '../utils/spreadsheetUtils';

export interface PartnerItemStatusReportProps {
  items: Item[];
  stores: Store[];
  brands: Brand[];
  countries: Country[];
  selectedTimePeriod: 'month' | 'daily' | 'week' | 'sevenDays' | 'fourteenDays' | 'thirtyDays' | 'dateRange';
  selectedBrandIds: string[];
  selectedCountryIds: string[];
  selectedStoreIds: string[];
  selectedMonth?: string;
  selectedWeek?: string;
  dateRangeStart?: string;
  dateRangeEnd?: string;
  partnerId?: string;
}

// Map item status for partner reports - Broken and Missing show as Sold
// In transit return is shown as "In transit return"
const mapStatusForPartner = (item: Item): string => {
  if (item.status === 'Broken' || item.status === 'Missing') {
    return 'Sold';
  }
  if (item.status === 'In transit' && item.orderType === 'return') {
    return 'In transit return';
  }
  return item.status;
};

function getUniqueStrings(items: Item[], getter: (item: Item) => string | undefined): string[] {
  const values = new Set<string>();
  items.forEach((item) => {
    const value = getter(item);
    if (value) values.add(value);
  });
  return Array.from(values);
}

export default function PartnerItemStatusReport({
  items,
  stores,
  brands,
  countries,
  selectedTimePeriod,
  selectedBrandIds,
  selectedCountryIds,
  selectedStoreIds,
  selectedMonth,
  selectedWeek,
  dateRangeStart,
  dateRangeEnd,
  partnerId
}: PartnerItemStatusReportProps) {
  // Additional filters for item status report
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedItemBrands, setSelectedItemBrands] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedPrices, setSelectedPrices] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Get unique values for filters
  const availableStatuses = useMemo(() => {
    const statuses = new Set<string>();
    items.forEach(item => {
      const mappedStatus = mapStatusForPartner(item);
      statuses.add(mappedStatus);
    });
    return sortOptionsAlpha(Array.from(statuses));
  }, [items]);

  const availableCategories = useMemo(
    () => sortOptionsAlpha(getUniqueStrings(items, (item) => item.category)),
    [items]
  );
  const availableItemBrands = useMemo(
    () => sortOptionsAlpha(getUniqueStrings(items, (item) => item.brand)),
    [items]
  );
  const availableColors = useMemo(
    () => sortOptionsAlpha(getUniqueStrings(items, (item) => item.color)),
    [items]
  );

  // Get available price points - use partner price points if available, otherwise use unique prices from items
  const availablePricePoints = useMemo(() => {
    // Try to get price points for the selected partner
    if (partnerId) {
      const partnerPricePoints = getSekPriceOptions(partnerId);
      if (partnerPricePoints.length > 0) {
        return partnerPricePoints.sort((a, b) => a - b);
      }
    }
    // Fallback: get unique prices from items
    const uniquePrices = new Set<number>();
    items.forEach(item => {
      if (item.price) {
        uniquePrices.add(item.price);
      }
    });
    return Array.from(uniquePrices).sort((a, b) => a - b);
  }, [items, partnerId]);

  // Filter items based on all criteria
  const filteredItems = useMemo(() => {
    let filtered = items;

    // Filter by time period
    if (selectedTimePeriod === 'month' && selectedMonth) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.date);
        const monthStr = `${itemDate.getFullYear()}-${String(itemDate.getMonth() + 1).padStart(2, '0')}`;
        return monthStr === selectedMonth;
      });
    } else if (selectedTimePeriod === 'week' && selectedWeek) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.date);
        const weekStr = getWeekString(itemDate);
        return weekStr === selectedWeek;
      });
    } else if (selectedTimePeriod === 'dateRange' && dateRangeStart && dateRangeEnd) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.date);
        const start = new Date(dateRangeStart);
        const end = new Date(dateRangeEnd);
        return itemDate >= start && itemDate <= end;
      });
    } else if (selectedTimePeriod === 'daily') {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate.toDateString() === yesterday.toDateString();
      });
    } else if (selectedTimePeriod === 'sevenDays') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= sevenDaysAgo;
      });
    } else if (selectedTimePeriod === 'fourteenDays') {
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= fourteenDaysAgo;
      });
    } else if (selectedTimePeriod === 'thirtyDays') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= thirtyDaysAgo;
      });
    }

    // Filter by store
    if (selectedStoreIds.length > 0) {
      // Note: Items don't have direct store reference, so we'll need to filter by delivery/store context
      // For now, we'll skip this filter if items don't have store info
    }

    // Filter by brand (from global filters)
    if (selectedBrandIds.length > 0) {
      const brandNames = selectedBrandIds
        .map(id => brands.find(b => b.id === id)?.name)
        .filter(Boolean) as string[];
      if (brandNames.length > 0) {
        filtered = filtered.filter(item => brandNames.includes(item.brand));
      }
    }

    // Filter by country (indirectly through stores)
    if (selectedCountryIds.length > 0) {
      const countryStoreIds = stores
        .filter(store => selectedCountryIds.includes(store.countryId))
        .map(store => store.id);
      // Note: Items don't have direct store reference, so this filter may not work perfectly
      // In a real implementation, items would have storeId or deliveryId that links to stores
    }

    // Filter by status (additional filter)
    if (selectedStatuses.length > 0) {
      filtered = filtered.filter(item => {
        const mappedStatus = mapStatusForPartner(item);
        return selectedStatuses.includes(mappedStatus);
      });
    }

    // Filter by category (additional filter)
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(item => selectedCategories.includes(item.category));
    }

    // Filter by item brand (additional filter)
    if (selectedItemBrands.length > 0) {
      filtered = filtered.filter(item => selectedItemBrands.includes(item.brand));
    }

    // Filter by color (additional filter)
    if (selectedColors.length > 0) {
      filtered = filtered.filter(item => item.color && selectedColors.includes(item.color));
    }

    // Filter by selected price points
    if (selectedPrices.length > 0) {
      filtered = filtered.filter(item => selectedPrices.includes(item.price));
    }

    // Filter by search query (searches across all item fields)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(item => {
        const searchableText = [
          item.itemId,
          item.title,
          item.brand,
          item.category,
          item.size,
          item.color,
          item.price?.toString(),
          mapStatusForPartner(item),
          item.date,
          item.orderNumber,
          item.boxLabel,
          item.partnerItemId,
          item.sellerName,
          item.source
        ].filter(Boolean).join(' ').toLowerCase();
        return searchableText.includes(query);
      });
    }

    return filtered;
  }, [
    items,
    selectedTimePeriod,
    selectedMonth,
    selectedWeek,
    dateRangeStart,
    dateRangeEnd,
    selectedStoreIds,
    selectedBrandIds,
    selectedCountryIds,
    brands,
    stores,
    selectedStatuses,
    selectedCategories,
    selectedItemBrands,
    selectedColors,
    selectedPrices,
    searchQuery
  ]);

  // Helper function to get week string
  const getWeekString = (date: Date): string => {
    const year = date.getFullYear();
    const startOfYear = new Date(year, 0, 1);
    const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
    const week = Math.ceil((days + startOfYear.getDay() + 1) / 7);
    return `${year}-W${String(week).padStart(2, '0')}`;
  };

  // Clear all additional filters
  const clearFilters = () => {
    setSelectedStatuses([]);
    setSelectedCategories([]);
    setSelectedItemBrands([]);
    setSelectedColors([]);
    setSelectedPrices([]);
    setSearchQuery('');
  };

  const hasActiveFilters = selectedStatuses.length > 0 ||
    selectedCategories.length > 0 ||
    selectedItemBrands.length > 0 ||
    selectedColors.length > 0 ||
    selectedPrices.length > 0 ||
    searchQuery.trim().length > 0;

  // Export to CSV
  const handleExport = () => {
    if (filteredItems.length === 0) {
      const event = new CustomEvent('toast', {
        detail: { message: 'No items to export', type: 'error' }
      });
      window.dispatchEvent(event);
      return;
    }

    const headers = [
      'Date',
      'Item ID',
      'External Item ID',
      'Item Brand',
      'Category',
      'Size',
      'Color',
      'Order Number',
      'Box Label',
      'Price (SEK)',
      'Status',
      'Store'
    ];

    const rows = filteredItems.map(item => {
      const mappedStatus = mapStatusForPartner(item);
      // Get store from delivery
      let storeDisplay = '';
      if (item.deliveryId) {
        // Try to find in DeliveryNotes first (by id)
        let delivery = mockDeliveryNotes.find(d => d.id === item.deliveryId);
        
        // If not found, try mockDeliveries (by deliveryId field)
        if (!delivery) {
          const deliveryRecord = mockDeliveries.find(d => d.deliveryId === item.deliveryId);
          if (deliveryRecord && deliveryRecord.receivingStoreId) {
            const store = stores.find(s => s.id === deliveryRecord.receivingStoreId);
            if (store) {
              storeDisplay = `${store.code} ${store.name}`;
            }
          }
        } else {
          // Found in DeliveryNotes
          const store = stores.find(s => 
            s.id === delivery.storeId || 
            s.code === delivery.storeCode
          );
          if (store) {
            storeDisplay = `${store.code} ${store.name}`;
          } else if (delivery.storeCode) {
            storeDisplay = delivery.storeCode;
          }
        }
      }
      return [
        item.date || '',
        item.itemId || '',
        item.partnerItemId || '',
        item.brand || '',
        item.category || '',
        item.size || '',
        item.color || '',
        item.orderNumber || '',
        item.boxLabel || '',
        item.price?.toString() || '',
        mappedStatus,
        storeDisplay
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `item-status-report-${dateStr}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    const event = new CustomEvent('toast', {
      detail: { message: 'Report exported successfully', type: 'success' }
    });
    window.dispatchEvent(event);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="headline-medium text-on-surface">Item Status Report</h2>
          <p className="body-medium text-on-surface-variant mt-1">
            Filter and export items by status and attributes
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ItemStatusFilterBottomSheet
            selectedStatuses={selectedStatuses}
            selectedCategories={selectedCategories}
            selectedItemBrands={selectedItemBrands}
            selectedColors={selectedColors}
            selectedPrices={selectedPrices}
            availableStatuses={availableStatuses}
            availableCategories={availableCategories}
            availableItemBrands={availableItemBrands}
            availableColors={availableColors}
            availablePricePoints={availablePricePoints}
            onStatusChange={setSelectedStatuses}
            onCategoryChange={setSelectedCategories}
            onBrandChange={setSelectedItemBrands}
            onColorChange={setSelectedColors}
            onPriceChange={setSelectedPrices}
            onClearAll={clearFilters}
          >
            <Button
              variant="outline"
              className="bg-surface-container border border-outline-variant rounded-lg h-12 md:h-10 px-4 body-medium min-h-[48px] md:min-h-0"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <span className="ml-2 bg-primary text-on-primary rounded-full px-2 py-0.5 text-xs">
                  {selectedStatuses.length + selectedCategories.length + selectedItemBrands.length + selectedColors.length + selectedPrices.length}
                </span>
              )}
            </Button>
          </ItemStatusFilterBottomSheet>
          <Button
            onClick={handleExport}
            className="bg-primary text-on-primary rounded-lg h-12 md:h-10 px-4 body-medium min-h-[48px] md:min-h-0"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative w-full mb-4 md:max-w-2xl">
        <div className="relative">
          {/* Search icon on the left */}
          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none z-10">
            <svg className="w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
              <path clipRule="evenodd" d={svgPaths.p3938ac00} fill="var(--on-surface-variant)" fillRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            id="item-status-search"
            name="item-status-search"
            placeholder="Search across all item fields..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full h-12 pl-10 ${searchQuery.length > 0 ? 'pr-12' : 'pr-4'} bg-surface-container rounded-lg border border-outline-variant focus:border-primary focus:outline-none text-on-surface body-large`}
          />
          {/* Clear button - only shown when there's text */}
          {searchQuery.length > 0 && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center hover:opacity-70 transition-opacity touch-manipulation z-20"
              aria-label="Clear search"
            >
              <X className="w-5 h-5 text-on-surface-variant" />
            </button>
          )}
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="body-medium text-on-surface-variant">
          {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} found
        </p>
      </div>

      {/* Items Table */}
      {filteredItems.length > 0 ? (
        <Card className="bg-surface border border-outline-variant rounded-lg">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ position: 'relative', zIndex: 1 }}>
                  <tr className="border-b border-outline-variant bg-surface-container-high">
                    <th className="text-left py-3 px-4 label-medium text-on-surface-variant sticky left-0 bg-surface-container-high" style={{ zIndex: 1 }}>
                      Image
                    </th>
                    <th className="text-left py-3 px-4 label-medium text-on-surface-variant">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 label-medium text-on-surface-variant">
                      Item ID
                    </th>
                    <th className="text-left py-3 px-4 label-medium text-on-surface-variant">
                      External Item ID
                    </th>
                    <th className="text-left py-3 px-4 label-medium text-on-surface-variant">
                      Item Brand
                    </th>
                    <th className="text-left py-3 px-4 label-medium text-on-surface-variant">
                      Category
                    </th>
                    <th className="text-left py-3 px-4 label-medium text-on-surface-variant">
                      Size
                    </th>
                    <th className="text-left py-3 px-4 label-medium text-on-surface-variant">
                      Color
                    </th>
                    <th className="text-left py-3 px-4 label-medium text-on-surface-variant">
                      Order Number
                    </th>
                    <th className="text-left py-3 px-4 label-medium text-on-surface-variant">
                      Box Label
                    </th>
                    <th className="text-left py-3 px-4 label-medium text-on-surface-variant">
                      Store
                    </th>
                    <th className="text-right py-3 px-4 label-medium text-on-surface-variant">
                      Price (SEK)
                    </th>
                    <th className="text-left py-3 px-4 label-medium text-on-surface-variant">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => {
                    const displayStatus = mapStatusForPartner(item);
                    return (
                      <tr
                        key={item.id}
                        className="border-b border-outline-variant hover:bg-surface-container-high transition-colors"
                      >
                        <td className="py-3 px-4 sticky left-0 bg-surface" style={{ zIndex: 1 }}>
                          <div className="w-16 h-16 bg-surface-container-high rounded overflow-hidden flex-shrink-0">
                            <ImageWithFallback
                              src={item.thumbnail || item.image}
                              alt={item.title || item.itemId}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </td>
                        <td className="py-3 px-4 body-small text-on-surface-variant">
                          {item.date ? new Date(item.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
                        </td>
                        <td className="py-3 px-4 body-medium text-on-surface font-medium">
                          {item.itemId}
                        </td>
                        <td className="py-3 px-4 body-medium text-on-surface">
                          {item.partnerItemId || '-'}
                        </td>
                        <td className="py-3 px-4 body-medium text-on-surface">
                          {item.brand}
                        </td>
                        <td className="py-3 px-4 body-medium text-on-surface">
                          {item.category}
                        </td>
                        <td className="py-3 px-4 body-medium text-on-surface">
                          {item.size || '-'}
                        </td>
                        <td className="py-3 px-4 body-medium text-on-surface">
                          {item.color || '-'}
                        </td>
                        <td className="py-3 px-4 body-medium text-on-surface">
                          {item.orderNumber || '-'}
                        </td>
                        <td className="py-3 px-4 body-medium text-on-surface">
                          {item.boxLabel || '-'}
                        </td>
                        <td className="py-3 px-4 body-medium text-on-surface">
                          {(() => {
                            // Get store from delivery using deliveryId
                            // Try to find in DeliveryNotes first (by id)
                            if (item.deliveryId) {
                              let delivery = mockDeliveryNotes.find(d => d.id === item.deliveryId);
                              
                              // If not found, try mockDeliveries (by deliveryId field)
                              if (!delivery) {
                                const deliveryRecord = mockDeliveries.find(d => d.deliveryId === item.deliveryId);
                                if (deliveryRecord && deliveryRecord.receivingStoreId) {
                                  const store = stores.find(s => s.id === deliveryRecord.receivingStoreId);
                                  if (store) {
                                    return `${store.code} ${store.name}`;
                                  }
                                }
                              } else {
                                // Found in DeliveryNotes
                                const store = stores.find(s => 
                                  s.id === delivery.storeId || 
                                  s.code === delivery.storeCode
                                );
                                if (store) {
                                  return `${store.code} ${store.name}`;
                                }
                                // If store not found but we have storeCode, show that
                                if (delivery.storeCode) {
                                  return delivery.storeCode;
                                }
                              }
                            }
                            // If no delivery found, show "-"
                            return '-';
                          })()}
                        </td>
                        <td className="py-3 px-4 body-medium text-on-surface text-right">
                          {item.price}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                            displayStatus === 'Sold' ? 'bg-chart-2 text-on-chart-2' :
                            displayStatus === 'Available' ? 'bg-chart-1 text-on-chart-1' :
                            displayStatus === 'Returned' ? 'bg-chart-3 text-on-chart-3' :
                            displayStatus === 'In transit' || displayStatus === 'In transit return' ? 'bg-chart-4 text-on-chart-4' :
                            'bg-surface-container-high text-on-surface'
                          }`}>
                            {displayStatus}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-surface-container border border-outline-variant rounded-lg">
          <CardContent className="p-12 text-center">
            <p className="body-large text-on-surface-variant">
              No items found matching the selected filters
            </p>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="mt-4 text-primary"
              >
                Clear filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

