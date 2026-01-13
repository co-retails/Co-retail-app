import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Download, ChevronDown, Clock, ChevronRight, Package, Truck } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';
import { Checkbox } from './ui/checkbox';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import type { Store, Brand, Country } from './StoreSelector';
import { Partner as WarehousePartner } from './PartnerWarehouseSelector';
import { DeliveryNote, Box } from './BoxManagementScreen';

export interface ShippingReportScreenProps {
  onBack: () => void;
  deliveryNotes: DeliveryNote[];
  stores: Store[];
  brands: Brand[];
  countries: Country[];
  partners: WarehousePartner[];
  currentUserRole?: 'admin' | 'store-staff' | 'partner' | 'buyer';
  userBrandIds?: string[]; // For Brand Admin filtering
}

type DeliveryStatus = 'Pending' | 'Packing' | 'In Transit' | 'Partly Delivered' | 'Delivered' | 'Cancelled' | 'Rejected';

interface DeliveryMetrics {
  totalDeliveries: number;
  deliveriesInTransit: number;
  deliveriesOI21: number;
  deliveriesDelivered: number;
  deliveriesPartiallyDelivered: number;
  deliveriesCancelled: number;
  deliveriesRejected: number;
  boxesTotal: number;
  boxesInTransit: number;
  boxesOI21: number;
  boxesDelivered: number;
  boxesCancelled: number;
  boxesRejected: number;
  avgDaysInTransit: number;
  avgDaysInTransitBox: number;
  medianDaysInTransit: number;
  rejectionRate: number;
  partialRate: number;
}

interface DeliveryRow {
  deliveryNoteId: string;
  externalOrderNumber: string | null;
  partner: string;
  store: string;
  status: DeliveryStatus;
  inTransitDate: string | null;
  daysInTransit: number | null;
  boxesTotal: number;
  boxesDelivered: number;
  boxesInTransit: number;
  boxesOI21: number;
  rejectedReason: string | null;
  isOI21: boolean;
  hasDataQualityIssue: boolean;
  deliveryNote: DeliveryNote;
}

export default function ShippingReportScreen({
  onBack,
  deliveryNotes,
  stores,
  brands,
  countries,
  partners,
  currentUserRole = 'admin',
  userBrandIds
}: ShippingReportScreenProps) {
  // Filter state
  const [selectedBrandIds, setSelectedBrandIds] = useState<string[]>([]);
  const [selectedCountryIds, setSelectedCountryIds] = useState<string[]>([]);
  const [selectedStoreIds, setSelectedStoreIds] = useState<string[]>([]);
  const [selectedPartnerIds, setSelectedPartnerIds] = useState<string[]>([]);
  const [dateRangeStart, setDateRangeStart] = useState<string>('');
  const [dateRangeEnd, setDateRangeEnd] = useState<string>('');
  const [filterOI21, setFilterOI21] = useState<boolean>(false);
  const [selectedStatuses, setSelectedStatuses] = useState<DeliveryStatus[]>([]);
  const [selectedDeliveryNote, setSelectedDeliveryNote] = useState<DeliveryNote | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());
  const [expandedDeliveries, setExpandedDeliveries] = useState<Set<string>>(new Set());

  // URL parameter persistence
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('brands')) setSelectedBrandIds(params.get('brands')!.split(','));
    if (params.get('countries')) setSelectedCountryIds(params.get('countries')!.split(','));
    if (params.get('stores')) setSelectedStoreIds(params.get('stores')!.split(','));
    if (params.get('partners')) setSelectedPartnerIds(params.get('partners')!.split(','));
    if (params.get('dateFrom')) setDateRangeStart(params.get('dateFrom')!);
    if (params.get('dateTo')) setDateRangeEnd(params.get('dateTo')!);
    if (params.get('oi21') === 'true') setFilterOI21(true);
    if (params.get('statuses')) setSelectedStatuses(params.get('statuses')!.split(',') as DeliveryStatus[]);
  }, []);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedBrandIds.length > 0) params.set('brands', selectedBrandIds.join(','));
    if (selectedCountryIds.length > 0) params.set('countries', selectedCountryIds.join(','));
    if (selectedStoreIds.length > 0) params.set('stores', selectedStoreIds.join(','));
    if (selectedPartnerIds.length > 0) params.set('partners', selectedPartnerIds.join(','));
    if (dateRangeStart) params.set('dateFrom', dateRangeStart);
    if (dateRangeEnd) params.set('dateTo', dateRangeEnd);
    if (filterOI21) params.set('oi21', 'true');
    if (selectedStatuses.length > 0) params.set('statuses', selectedStatuses.join(','));
    
    const newUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
    window.history.replaceState({}, '', newUrl);
  }, [selectedBrandIds, selectedCountryIds, selectedStoreIds, selectedPartnerIds, dateRangeStart, dateRangeEnd, filterOI21, selectedStatuses]);

  // Role-based brand filtering for Brand Admins
  const availableBrands = useMemo(() => {
    if (currentUserRole === 'admin') return brands;
    if (userBrandIds && userBrandIds.length > 0) {
      return brands.filter(b => userBrandIds.includes(b.id));
    }
    return brands;
  }, [brands, currentUserRole, userBrandIds]);

  // Cascading filters: Brand → Country → Store
  const filteredCountries = useMemo(() => {
    if (selectedBrandIds.length === 0) return countries;
    return countries.filter(c => selectedBrandIds.includes(c.brandId));
  }, [countries, selectedBrandIds]);

  const filteredStores = useMemo(() => {
    let filtered = stores;
    if (selectedBrandIds.length > 0) {
      filtered = filtered.filter(s => selectedBrandIds.includes(s.brandId));
    }
    if (selectedCountryIds.length > 0) {
      filtered = filtered.filter(s => selectedCountryIds.includes(s.countryId));
    }
    return filtered;
  }, [stores, selectedBrandIds, selectedCountryIds]);

  // Helper: Map delivery note status to report status
  const mapDeliveryStatus = (status: DeliveryNote['status']): DeliveryStatus => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'packing': return 'Packing';
      case 'registered': return 'In Transit';
      case 'delivered': return 'Delivered';
      case 'partially-delivered': return 'Partly Delivered';
      case 'cancelled': return 'Cancelled';
      case 'rejected': return 'Rejected';
      default: return 'Pending';
    }
  };

  // Helper: Calculate days in transit
  const calculateDaysInTransit = (inTransitDate: string | null, deliveredDate?: string): number | null => {
    if (!inTransitDate) return null;
    const start = new Date(inTransitDate);
    const end = deliveredDate ? new Date(deliveredDate) : new Date();
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Helper: Get in-transit date from delivery note
  const getInTransitDate = (note: DeliveryNote): string | null => {
    // Use shipmentDate if available, otherwise use createdDate
    return note.shipmentDate || note.createdDate || null;
  };

  // Helper: Get delivered date from boxes
  const getDeliveredDate = (note: DeliveryNote): string | null => {
    const deliveredBoxes = note.boxes.filter(b => b.status === 'delivered');
    if (deliveredBoxes.length === 0) return null;
    // Use the earliest delivered box date (would need to be added to Box interface)
    return note.createdDate; // Placeholder - in real implementation, boxes would have deliveredDate
  };

  // Filter delivery notes based on all filters
  const filteredDeliveryNotes = useMemo(() => {
    // Exclude pending and packing deliveries
    let filtered = deliveryNotes.filter(note => 
      note.status !== 'pending' && note.status !== 'packing'
    );

    // Brand filter (via store)
    if (selectedBrandIds.length > 0) {
      const brandStoreIds = filteredStores.map(s => s.id);
      filtered = filtered.filter(note => 
        note.storeId && brandStoreIds.includes(note.storeId)
      );
    }

    // Country filter (via store)
    if (selectedCountryIds.length > 0) {
      const countryStoreIds = filteredStores.map(s => s.id);
      filtered = filtered.filter(note => 
        note.storeId && countryStoreIds.includes(note.storeId)
      );
    }

    // Store filter
    if (selectedStoreIds.length > 0) {
      filtered = filtered.filter(note => 
        note.storeId && selectedStoreIds.includes(note.storeId)
      );
    }

    // Partner filter
    if (selectedPartnerIds.length > 0) {
      filtered = filtered.filter(note => 
        note.partnerId && selectedPartnerIds.includes(note.partnerId)
      );
    }

    // Date filter (always based on In Transit date)
    if (dateRangeStart || dateRangeEnd) {
      filtered = filtered.filter(note => {
        const dateToCheck = getInTransitDate(note);
        if (!dateToCheck) return false;
        const noteDate = new Date(dateToCheck);
        if (dateRangeStart && noteDate < new Date(dateRangeStart)) return false;
        if (dateRangeEnd && noteDate > new Date(dateRangeEnd)) return false;
        return true;
      });
    }

    // OI-21 filter (> 21 days in transit) - includes deliveries with overdue boxes
    if (filterOI21) {
      filtered = filtered.filter(note => {
        const inTransitDate = getInTransitDate(note);
        if (!inTransitDate) return false;
        const days = calculateDaysInTransit(inTransitDate);
        const isOverdue = days !== null && days > 21;
        
        if (!isOverdue) return false;
        
        // Check if delivery itself is overdue (In Transit status)
        const status = mapDeliveryStatus(note.status);
        if (status === 'In Transit') {
          return true;
        }
        
        // Check if any boxes are overdue (> 21 days in transit)
        // Boxes use the delivery's in-transit date, so if delivery is overdue,
        // any boxes still in-transit are also overdue
        const hasOverdueBoxes = note.boxes.some(box => box.status === 'in-transit');
        
        return hasOverdueBoxes;
      });
    }

    // Status filter
    if (selectedStatuses.length > 0) {
      filtered = filtered.filter(note => {
        const reportStatus = mapDeliveryStatus(note.status);
        return selectedStatuses.includes(reportStatus);
      });
    }

    return filtered;
  }, [deliveryNotes, selectedBrandIds, selectedCountryIds, selectedStoreIds, selectedPartnerIds, dateRangeStart, dateRangeEnd, filterOI21, selectedStatuses, filteredStores]);

  // Calculate metrics
  const metrics = useMemo((): DeliveryMetrics => {
    const deliveries = filteredDeliveryNotes;
    
    // Delivery-level metrics
    const totalDeliveries = deliveries.length;
    const deliveriesInTransit = deliveries.filter(d => {
      const status = mapDeliveryStatus(d.status);
      return status === 'In Transit';
    }).length;
    
    const deliveriesOI21 = deliveries.filter(d => {
      const status = mapDeliveryStatus(d.status);
      if (status !== 'In Transit') return false;
      const inTransitDate = getInTransitDate(d);
      if (!inTransitDate) return false;
      const days = calculateDaysInTransit(inTransitDate);
      return days !== null && days > 21;
    }).length;

    const deliveriesDelivered = deliveries.filter(d => mapDeliveryStatus(d.status) === 'Delivered').length;
    const deliveriesPartiallyDelivered = deliveries.filter(d => mapDeliveryStatus(d.status) === 'Partly Delivered').length;
    const deliveriesCancelled = deliveries.filter(d => mapDeliveryStatus(d.status) === 'Cancelled').length;
    const deliveriesRejected = deliveries.filter(d => mapDeliveryStatus(d.status) === 'Rejected').length;

    // Box-level metrics
    const allBoxes = deliveries.flatMap(d => d.boxes);
    const boxesTotal = allBoxes.length;
    const boxesInTransit = allBoxes.filter(b => b.status === 'in-transit').length;
    
    const boxesOI21 = allBoxes.filter(b => {
      if (b.status !== 'in-transit') return false;
      const delivery = deliveries.find(d => d.boxes.includes(b));
      if (!delivery) return false;
      const inTransitDate = getInTransitDate(delivery);
      if (!inTransitDate) return false;
      const days = calculateDaysInTransit(inTransitDate);
      return days !== null && days > 21;
    }).length;

    const boxesDelivered = allBoxes.filter(b => b.status === 'delivered').length;
    const boxesCancelled = allBoxes.filter(b => b.status === 'cancelled').length;
    const boxesRejected = allBoxes.filter(b => b.status === 'rejected').length;

    // Timeliness metrics
    const deliveryDaysInTransit = deliveries
      .map(d => {
        const inTransitDate = getInTransitDate(d);
        if (!inTransitDate) return null;
        const deliveredDate = getDeliveredDate(d);
        return calculateDaysInTransit(inTransitDate, deliveredDate || undefined);
      })
      .filter((d): d is number => d !== null);

    const avgDaysInTransit = deliveryDaysInTransit.length > 0
      ? deliveryDaysInTransit.reduce((sum, d) => sum + d, 0) / deliveryDaysInTransit.length
      : 0;

    const sortedDays = [...deliveryDaysInTransit].sort((a, b) => a - b);
    const medianDaysInTransit: number = sortedDays.length > 0
      ? sortedDays[Math.floor(sortedDays.length / 2)] ?? 0
      : 0;

    // Box-level average (simplified - would need box-level dates in real implementation)
    const avgDaysInTransitBox = avgDaysInTransit; // Placeholder

    // Quality metrics
    const rejectionRate: number = (deliveriesDelivered + deliveriesRejected) > 0
      ? (deliveriesRejected / (deliveriesDelivered + deliveriesRejected)) * 100
      : 0;

    const partialRate: number = totalDeliveries > 0
      ? (deliveriesPartiallyDelivered / totalDeliveries) * 100
      : 0;

    return {
      totalDeliveries,
      deliveriesInTransit,
      deliveriesOI21,
      deliveriesDelivered,
      deliveriesPartiallyDelivered,
      deliveriesCancelled,
      deliveriesRejected,
      boxesTotal,
      boxesInTransit,
      boxesOI21,
      boxesDelivered,
      boxesCancelled,
      boxesRejected,
      avgDaysInTransit,
      avgDaysInTransitBox,
      medianDaysInTransit,
      rejectionRate,
      partialRate
    };
  }, [filteredDeliveryNotes]);

  // Prepare table rows
  const tableRows = useMemo((): DeliveryRow[] => {
    return filteredDeliveryNotes.map(note => {
      const status = mapDeliveryStatus(note.status);
      const inTransitDate = getInTransitDate(note);
      // Only calculate days in transit for In Transit, Delivered, Partly Delivered, Cancelled, or Rejected statuses
      const daysInTransit = (status === 'Pending' || status === 'Packing') 
        ? null 
        : calculateDaysInTransit(inTransitDate);
      const isOI21 = status === 'In Transit' && daysInTransit !== null && daysInTransit > 21;
      const hasDataQualityIssue = !inTransitDate && (status === 'In Transit' || status === 'Delivered' || status === 'Partly Delivered');

      const boxesInTransit = note.boxes.filter(b => b.status === 'in-transit').length;
      const boxesOI21 = note.boxes.filter(b => {
        if (b.status !== 'in-transit') return false;
        const days = daysInTransit;
        return days !== null && days > 21;
      }).length;

      const store = stores.find(s => s.id === note.storeId);
      const partner = partners.find(p => p.id === note.partnerId);
      const brand = store ? brands.find(b => b.id === store.brandId) : null;

      return {
        deliveryNoteId: note.id,
        externalOrderNumber: note.externalOrderId || null,
        partner: partner?.name || note.partnerName || 'Unknown',
        store: store 
          ? `${store.name} (${store.code})${brand ? ` • ${brand.name}` : ''}` 
          : note.storeCode || 'Unknown',
        status,
        inTransitDate,
        daysInTransit,
        boxesTotal: note.boxes.length,
        boxesDelivered: note.boxes.filter(b => b.status === 'delivered').length,
        boxesInTransit,
        boxesOI21,
        rejectedReason: status === 'Rejected' ? 'Rejected' : null, // Would come from note.rejectedReason in real implementation
        isOI21,
        hasDataQualityIssue,
        deliveryNote: note
      };
    });
  }, [filteredDeliveryNotes, stores, partners, brands]);

  // Multiselect helpers
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

  const handlePartnerToggle = (partnerId: string) => {
    setSelectedPartnerIds(prev => 
      prev.includes(partnerId) 
        ? prev.filter(id => id !== partnerId)
        : [...prev, partnerId]
    );
  };

  const toggleDeliveryExpansion = (deliveryNoteId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the detail drawer
    setExpandedDeliveries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(deliveryNoteId)) {
        newSet.delete(deliveryNoteId);
      } else {
        newSet.add(deliveryNoteId);
      }
      return newSet;
    });
  };

  // Helper: Calculate days in transit for a box
  const calculateBoxDaysInTransit = (box: Box, deliveryNote: DeliveryNote): number | null => {
    // Boxes use the delivery's in-transit date
    const inTransitDate = getInTransitDate(deliveryNote);
    if (!inTransitDate) return null;
    
    // Only calculate for boxes that are in-transit or delivered
    if (box.status !== 'in-transit' && box.status !== 'delivered') return null;
    
    return calculateDaysInTransit(inTransitDate);
  };

  const getBrandDisplayText = (): string => {
    if (selectedBrandIds.length === 0) return 'All Brands';
    if (selectedBrandIds.length === 1) {
      const brand = availableBrands.find(b => b.id === selectedBrandIds[0]);
      return brand?.name || '1 selected';
    }
    return `${selectedBrandIds.length} selected`;
  };

  const getCountryDisplayText = (): string => {
    if (selectedCountryIds.length === 0) return 'All Countries';
    if (selectedCountryIds.length === 1) {
      const country = filteredCountries.find(c => c.id === selectedCountryIds[0]);
      return country?.name || '1 selected';
    }
    return `${selectedCountryIds.length} selected`;
  };

  const getStoreDisplayText = (): string => {
    if (selectedStoreIds.length === 0) return 'All Stores';
    if (selectedStoreIds.length === 1) {
      const store = filteredStores.find(s => s.id === selectedStoreIds[0]);
      return store?.name || '1 selected';
    }
    return `${selectedStoreIds.length} selected`;
  };

  const getPartnerDisplayText = (): string => {
    if (selectedPartnerIds.length === 0) return 'All Partners';
    if (selectedPartnerIds.length === 1) {
      const partner = partners.find(p => p.id === selectedPartnerIds[0]);
      return partner?.name || '1 selected';
    }
    return `${selectedPartnerIds.length} selected`;
  };

  const handleExportCSV = () => {
    const headers = [
      'DeliveryNoteId',
      'External Order Number',
      'Partner',
      'Store',
      'Status',
      'InTransitDate',
      'DaysInTransit',
      'BoxesTotal',
      'BoxesDelivered',
      'BoxesInTransit'
    ];

    const rows = tableRows.map(row => [
      row.deliveryNoteId,
      row.externalOrderNumber || '',
      row.partner,
      row.store,
      row.status,
      row.inTransitDate || '',
      row.daysInTransit?.toString() || '',
      row.boxesTotal.toString(),
      row.boxesDelivered.toString(),
      row.boxesInTransit.toString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `shipping-report-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleRefresh = () => {
    setLastRefreshTime(new Date());
    // In real implementation, this would refetch data
  };

  const handleRowClick = (row: DeliveryRow) => {
    setSelectedDeliveryNote(row.deliveryNote);
    setIsDrawerOpen(true);
  };

  const getStatusColor = (status: DeliveryStatus) => {
    switch (status) {
      case 'Delivered': return 'bg-tertiary-container text-on-tertiary-container';
      case 'In Transit': return 'bg-primary-container text-on-primary-container';
      case 'Partly Delivered': return 'bg-secondary-container text-on-secondary-container';
      case 'Rejected': return 'bg-error-container text-on-error-container';
      case 'Cancelled': return 'bg-error-container text-on-error-container';
      default: return 'bg-surface-container text-on-surface';
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <div className="w-full bg-surface border-b border-outline-variant sticky top-0 z-20">
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
            <div className="flex-1">
              <h1 className="headline-medium text-on-surface">Shipping Report</h1>
              <p className="body-small text-on-surface-variant mt-1">
                Last updated: {lastRefreshTime.toLocaleTimeString()} • 
                {dateRangeStart && dateRangeEnd 
                  ? ` ${new Date(dateRangeStart).toLocaleDateString()} - ${new Date(dateRangeEnd).toLocaleDateString()}`
                  : ' All dates'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="border-outline-variant"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                className="border-outline-variant"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      <div className="w-full bg-surface border-b border-outline-variant sticky top-[120px] z-10">
        <div className="px-4 md:px-6 py-3 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Brand Filter */}
            <div className="flex items-center gap-2">
              <label className="label-small text-on-surface-variant whitespace-nowrap flex items-center h-12 md:h-10">Brand:</label>
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
                <PopoverContent 
                  className="w-[200px] p-0" 
                  align="start"
                  style={{ zIndex: 10060 }}
                >
                  <Command>
                    <CommandInput placeholder="Search brands..." />
                    <CommandList>
                      <CommandEmpty>No brands found.</CommandEmpty>
                      <CommandGroup>
                        {availableBrands.map((brand) => (
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

            {/* Country Filter */}
            <div className="flex items-center gap-2">
              <label className="label-small text-on-surface-variant whitespace-nowrap flex items-center h-12 md:h-10">Country:</label>
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
                <PopoverContent 
                  className="w-[200px] p-0" 
                  align="start"
                  style={{ zIndex: 10060 }}
                >
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

            {/* Store Filter */}
            <div className="flex items-center gap-2">
              <label className="label-small text-on-surface-variant whitespace-nowrap flex items-center h-12 md:h-10">Store:</label>
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
                <PopoverContent 
                  className="w-[250px] p-0" 
                  align="start"
                  style={{ zIndex: 10060 }}
                >
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

            {/* Partner Filter */}
            <div className="flex items-center gap-2">
              <label className="label-small text-on-surface-variant whitespace-nowrap flex items-center h-12 md:h-10">Partner:</label>
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
                <PopoverContent 
                  className="w-[200px] p-0" 
                  align="start"
                  style={{ zIndex: 10060 }}
                >
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
            </div>

            {/* Date Range */}
            <div className="flex items-center gap-2">
              <label className="label-small text-on-surface-variant whitespace-nowrap flex items-center h-12 md:h-10">Date:</label>
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={dateRangeStart}
                  onChange={(e) => setDateRangeStart(e.target.value)}
                  className="bg-surface-container border border-outline-variant rounded-lg h-12 md:h-10 px-3 body-medium min-w-[150px] min-h-[48px] md:min-h-0"
                />
                <span className="text-on-surface-variant body-medium flex items-center h-12 md:h-10">to</span>
                <Input
                  type="date"
                  value={dateRangeEnd}
                  onChange={(e) => setDateRangeEnd(e.target.value)}
                  className="bg-surface-container border border-outline-variant rounded-lg h-12 md:h-10 px-3 body-medium min-w-[150px] min-h-[48px] md:min-h-0"
                />
              </div>
            </div>
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <Button
              variant={filterOI21 ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterOI21(!filterOI21)}
              className="h-8"
            >
              Overdue (&gt; 21 days)
            </Button>
          </div>
        </div>
      </div>

      {/* Delivery Table - Desktop */}
      <div className="px-4 md:px-6 py-6 max-w-7xl mx-auto">
        <Card className="bg-surface-container border border-outline-variant rounded-lg hidden md:block">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-outline-variant bg-surface-container-high">
                    <th className="text-left py-3 px-4 label-medium text-on-surface-variant">DeliveryNoteId</th>
                    <th className="text-left py-3 px-4 label-medium text-on-surface-variant">External Order Number</th>
                    <th className="text-left py-3 px-4 label-medium text-on-surface-variant">Partner</th>
                    <th className="text-left py-3 px-4 label-medium text-on-surface-variant">Store</th>
                    <th className="text-left py-3 px-4 label-medium text-on-surface-variant">Status</th>
                    <th className="text-left py-3 px-4 label-medium text-on-surface-variant">InTransitDate</th>
                    <th className="text-right py-3 px-4 label-medium text-on-surface-variant">DaysInTransit</th>
                    <th className="text-right py-3 px-4 label-medium text-on-surface-variant">BoxesTotal</th>
                    <th className="text-right py-3 px-4 label-medium text-on-surface-variant">BoxesDelivered</th>
                    <th className="text-right py-3 px-4 label-medium text-on-surface-variant">BoxesInTransit</th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((row) => {
                    const isExpanded = expandedDeliveries.has(row.deliveryNoteId);
                    const deliveryNote = row.deliveryNote;
                    
                    return (
                      <React.Fragment key={row.deliveryNoteId}>
                        {/* Delivery Row */}
                        <tr
                          onClick={() => handleRowClick(row)}
                          className={`border-b border-outline-variant hover:bg-surface-container-high cursor-pointer ${
                            row.isOI21 ? 'bg-error-container/20' : ''
                          }`}
                        >
                          <td className="py-3 px-4 body-medium text-on-surface">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => toggleDeliveryExpansion(row.deliveryNoteId, e)}
                                className="p-1 hover:bg-surface-container-highest rounded"
                                aria-label={isExpanded ? "Collapse boxes" : "Expand boxes"}
                              >
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4 text-on-surface-variant" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 text-on-surface-variant" />
                                )}
                              </button>
                              <div className="w-6 h-6 bg-surface-container-highest rounded-full flex items-center justify-center">
                                <Truck className="w-3.5 h-3.5 text-on-surface-variant" />
                              </div>
                              {row.deliveryNoteId}
                            </div>
                          </td>
                          <td className="py-3 px-4 body-medium text-on-surface">
                            {row.externalOrderNumber || '-'}
                          </td>
                          <td className="py-3 px-4 body-medium text-on-surface">{row.partner}</td>
                          <td className="py-3 px-4 body-medium text-on-surface">{row.store}</td>
                          <td className="py-3 px-4 body-medium text-on-surface">
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(row.status)}>
                                {row.status}
                              </Badge>
                              {row.isOI21 && (
                                <Badge variant="destructive" className="text-xs">
                                  Overdue
                                </Badge>
                              )}
                              {row.hasDataQualityIssue && (
                                <Badge variant="outline" className="text-xs" title="Missing In Transit date">
                                  DQ
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 body-medium text-on-surface">
                            {row.inTransitDate ? new Date(row.inTransitDate).toLocaleDateString() : '-'}
                          </td>
                          <td className="py-3 px-4 body-medium text-on-surface text-right">
                            {row.daysInTransit !== null ? row.daysInTransit : '-'}
                          </td>
                          <td className="py-3 px-4 body-medium text-on-surface text-right">{row.boxesTotal}</td>
                          <td className="py-3 px-4 body-medium text-on-surface text-right">{row.boxesDelivered}</td>
                          <td className="py-3 px-4 body-medium text-on-surface text-right">{row.boxesInTransit}</td>
                        </tr>
                        
                        {/* Box Rows - Only show when expanded */}
                        {isExpanded && deliveryNote.boxes.map((box) => {
                          const boxDaysInTransit = calculateBoxDaysInTransit(box, deliveryNote);
                          const boxStatus = box.status === 'registered' ? 'In Transit' : 
                                           box.status === 'in-transit' ? 'In Transit' :
                                           box.status === 'delivered' ? 'Delivered' :
                                           box.status === 'rejected' ? 'Rejected' :
                                           box.status === 'cancelled' ? 'Cancelled' :
                                           box.status === 'pending' ? 'Pending' : 'Packing';
                          const isBoxOI21 = box.status === 'in-transit' && boxDaysInTransit !== null && boxDaysInTransit > 21;
                          
                          return (
                            <tr
                              key={box.id}
                              className="bg-surface-container-high/50 border-b border-outline-variant/50"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <td className="py-1.5 px-4 body-small text-on-surface-variant">
                                <div className="flex items-center gap-2 pl-8">
                                  <div className="w-6 h-6 bg-surface-container-highest rounded-full flex items-center justify-center">
                                    <Package className="w-3.5 h-3.5 text-on-surface-variant" />
                                  </div>
                                  {box.qrLabel}
                                </div>
                              </td>
                              <td className="py-1.5 px-4 body-small text-on-surface-variant">
                                {row.externalOrderNumber || '—'}
                              </td>
                              <td className="py-1.5 px-4 body-small text-on-surface-variant">—</td>
                              <td className="py-1.5 px-4 body-small text-on-surface-variant">—</td>
                              <td className="py-1.5 px-4 body-small text-on-surface">
                                <div className="flex items-center gap-2">
                                  <Badge className={getStatusColor(boxStatus as DeliveryStatus)} variant="outline">
                                    {boxStatus}
                                  </Badge>
                                  {isBoxOI21 && (
                                    <Badge variant="destructive" className="text-xs">
                                      Overdue
                                    </Badge>
                                  )}
                                </div>
                              </td>
                              <td className="py-1.5 px-4 body-small text-on-surface-variant">
                                {row.inTransitDate ? new Date(row.inTransitDate).toLocaleDateString() : '-'}
                              </td>
                              <td className="py-1.5 px-4 body-small text-on-surface text-right">
                                {boxDaysInTransit !== null ? boxDaysInTransit : '-'}
                              </td>
                              <td className="py-1.5 px-4 body-small text-on-surface-variant text-right">—</td>
                              <td className="py-1.5 px-4 body-small text-on-surface-variant text-right">—</td>
                              <td className="py-1.5 px-4 body-small text-on-surface-variant text-right">—</td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
              {tableRows.length === 0 && (
                <div className="p-12 text-center">
                  <p className="body-medium text-on-surface-variant">No deliveries found for the selected filters</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Delivery Cards - Mobile */}
        <div className="md:hidden space-y-4">
          {tableRows.map((row) => {
            const isExpanded = expandedDeliveries.has(row.deliveryNoteId);
            const deliveryNote = row.deliveryNote;
            
            return (
              <Card 
                key={row.deliveryNoteId}
                className={`bg-surface-container border border-outline-variant rounded-lg ${
                  row.isOI21 ? 'bg-error-container/20' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div 
                    className="space-y-3"
                    onClick={() => handleRowClick(row)}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2 flex-1">
                        <button
                          onClick={(e) => toggleDeliveryExpansion(row.deliveryNoteId, e)}
                          className="p-1 hover:bg-surface-container-highest rounded"
                          aria-label={isExpanded ? "Collapse boxes" : "Expand boxes"}
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-on-surface-variant" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-on-surface-variant" />
                          )}
                        </button>
                        <div className="w-6 h-6 bg-surface-container-highest rounded-full flex items-center justify-center">
                          <Truck className="w-3.5 h-3.5 text-on-surface-variant" />
                        </div>
                        <div>
                          <p className="body-medium text-on-surface font-medium">{row.deliveryNoteId}</p>
                          <p className="body-small text-on-surface-variant">{row.partner}</p>
                          <p className="body-small text-on-surface-variant">{row.store}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(row.status)}>
                          {row.status}
                        </Badge>
                        {row.isOI21 && (
                          <Badge variant="destructive" className="text-xs">
                            Overdue
                          </Badge>
                        )}
                        {row.hasDataQualityIssue && (
                          <Badge variant="outline" className="text-xs" title="Missing In Transit date">
                            DQ
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-outline-variant">
                      <div>
                        <p className="label-small text-on-surface-variant">External Order Number</p>
                        <p className="body-medium text-on-surface">
                          {row.externalOrderNumber || '-'}
                        </p>
                      </div>
                      <div>
                        <p className="label-small text-on-surface-variant">In Transit Date</p>
                        <p className="body-medium text-on-surface">
                          {row.inTransitDate ? new Date(row.inTransitDate).toLocaleDateString() : '-'}
                        </p>
                      </div>
                      <div>
                        <p className="label-small text-on-surface-variant">Days In Transit</p>
                        <p className="body-medium text-on-surface">
                          {row.daysInTransit !== null ? row.daysInTransit : '-'}
                        </p>
                      </div>
                      <div>
                        <p className="label-small text-on-surface-variant">Boxes Total</p>
                        <p className="body-medium text-on-surface">{row.boxesTotal}</p>
                      </div>
                      <div>
                        <p className="label-small text-on-surface-variant">Boxes Delivered</p>
                        <p className="body-medium text-on-surface">{row.boxesDelivered}</p>
                      </div>
                      <div>
                        <p className="label-small text-on-surface-variant">Boxes In Transit</p>
                        <p className="body-medium text-on-surface">{row.boxesInTransit}</p>
                      </div>
                    </div>
                  </div>

                  {/* Box List - Expanded */}
                  {isExpanded && deliveryNote.boxes.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-outline-variant space-y-2">
                      {deliveryNote.boxes.map((box) => {
                        const boxDaysInTransit = calculateBoxDaysInTransit(box, deliveryNote);
                        const boxStatus = box.status === 'registered' ? 'In Transit' : 
                                         box.status === 'in-transit' ? 'In Transit' :
                                         box.status === 'delivered' ? 'Delivered' :
                                         box.status === 'rejected' ? 'Rejected' :
                                         box.status === 'cancelled' ? 'Cancelled' :
                                         box.status === 'pending' ? 'Pending' : 'Packing';
                        const isBoxOI21 = box.status === 'in-transit' && boxDaysInTransit !== null && boxDaysInTransit > 21;
                        
                        return (
                          <div
                            key={box.id}
                            className="bg-surface-container-high/50 rounded-lg p-3"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-surface-container-highest rounded-full flex items-center justify-center">
                                  <Package className="w-3.5 h-3.5 text-on-surface-variant" />
                                </div>
                                <p className="body-small text-on-surface font-medium">{box.qrLabel}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={getStatusColor(boxStatus as DeliveryStatus)} variant="outline">
                                  {boxStatus}
                                </Badge>
                                {isBoxOI21 && (
                                  <Badge variant="destructive" className="text-xs">
                                    Overdue
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-on-surface-variant">
                              <span>Days: {boxDaysInTransit !== null ? boxDaysInTransit : '-'}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
          {tableRows.length === 0 && (
            <div className="p-12 text-center">
              <p className="body-medium text-on-surface-variant">No deliveries found for the selected filters</p>
            </div>
          )}
        </div>
      </div>

      {/* Detail Drawer */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader className="px-6">
            <SheetTitle className="headline-small text-on-surface">
              {selectedDeliveryNote?.id}
            </SheetTitle>
          </SheetHeader>
          
          {selectedDeliveryNote && (
            <div className="px-6 mt-6 pb-6 space-y-6">
              {/* Delivery Summary */}
              <Card className="bg-surface-container border border-outline-variant">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="body-small text-on-surface-variant">Partner</p>
                      <p className="body-medium text-on-surface">{selectedDeliveryNote.partnerName || 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="body-small text-on-surface-variant">Store</p>
                      <p className="body-medium text-on-surface">
                        {stores.find(s => s.id === selectedDeliveryNote.storeId)?.name || selectedDeliveryNote.storeCode || 'Unknown'}
                      </p>
                    </div>
                    <div>
                      <p className="body-small text-on-surface-variant">Status</p>
                      <Badge className={getStatusColor(mapDeliveryStatus(selectedDeliveryNote.status))}>
                        {mapDeliveryStatus(selectedDeliveryNote.status)}
                      </Badge>
                    </div>
                    <div>
                      <p className="body-small text-on-surface-variant">Days In Transit</p>
                      <p className="body-medium text-on-surface">
                        {calculateDaysInTransit(getInTransitDate(selectedDeliveryNote)) ?? '-'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Box List */}
              <div>
                <h3 className="title-medium text-on-surface mb-4">Boxes ({selectedDeliveryNote.boxes.length})</h3>
                <div className="space-y-3">
                  {selectedDeliveryNote.boxes.map((box) => {
                    const boxDaysInTransit = calculateDaysInTransit(getInTransitDate(selectedDeliveryNote));
                    const isBoxOI21 = box.status === 'in-transit' && boxDaysInTransit !== null && boxDaysInTransit > 21;
                    
                    return (
                      <Card key={box.id} className="bg-surface-container border border-outline-variant">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="body-medium text-on-surface">{box.qrLabel}</p>
                              <p className="body-small text-on-surface-variant">
                                {box.items.length} items
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(mapDeliveryStatus(selectedDeliveryNote.status))}>
                                {box.status}
                              </Badge>
                              {isBoxOI21 && (
                                <Badge variant="destructive" className="text-xs">
                                  OI-21
                                </Badge>
                              )}
                            </div>
                          </div>
                          {boxDaysInTransit !== null && (
                            <div className="flex items-center gap-2 mt-2">
                              <Clock className="h-4 w-4 text-on-surface-variant" />
                              <span className="body-small text-on-surface-variant">
                                {boxDaysInTransit} days in transit
                              </span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h3 className="title-medium text-on-surface mb-4">Timeline</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <div>
                      <p className="body-medium text-on-surface">Registered</p>
                      <p className="body-small text-on-surface-variant">
                        {new Date(selectedDeliveryNote.createdDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {selectedDeliveryNote.shipmentDate && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <div>
                        <p className="body-medium text-on-surface">In Transit</p>
                        <p className="body-small text-on-surface-variant">
                          {new Date(selectedDeliveryNote.shipmentDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedDeliveryNote.status === 'delivered' && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-tertiary" />
                      <div>
                        <p className="body-medium text-on-surface">Delivered</p>
                        <p className="body-small text-on-surface-variant">
                          {getDeliveredDate(selectedDeliveryNote) 
                            ? new Date(getDeliveredDate(selectedDeliveryNote)!).toLocaleDateString()
                            : 'Date not available'}
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedDeliveryNote.status === 'rejected' && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-error" />
                      <div>
                        <p className="body-medium text-on-surface">Rejected</p>
                        <p className="body-small text-on-surface-variant">Rejected delivery</p>
                      </div>
                    </div>
                  )}
                  {selectedDeliveryNote.status === 'cancelled' && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-error" />
                      <div>
                        <p className="body-medium text-on-surface">Cancelled</p>
                        <p className="body-small text-on-surface-variant">Cancelled delivery</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

