import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import type { Store as StoreRecord, Country as CountryRecord, Brand as BrandRecord } from './StoreSelector';
import type { Partner as WarehousePartner } from './PartnerWarehouseSelector';

// Types for report data
export interface SalesDataPoint {
  month: string;
  totalSold: number;
  byStore: Array<{ storeId: string; storeName: string; sold: number }>;
  byBrand: Array<{ brandId: string; brandName: string; sold: number }>;
}

export interface StockReportData {
  month: string;
  totalItems: number;
  byStore: Array<{ storeId: string; storeName: string; items: number }>;
  byBrand: Array<{ brandId: string; brandName: string; items: number }>;
}

interface PartnerReportsScreenProps {
  onBack: () => void;
  salesData: SalesDataPoint[];
  stockData: StockReportData[];
  stores: StoreRecord[];
  brands: BrandRecord[];
  countries: CountryRecord[];
  partners: WarehousePartner[];
  partnerId?: string;
  currentUserRole?: string;
}

export default function PartnerReportsScreen({
  onBack,
  salesData,
  stockData,
  stores,
  brands,
  countries,
  partners,
  partnerId,
  currentUserRole
}: PartnerReportsScreenProps) {
  return (
    <div className="bg-surface min-h-screen flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-surface border-b border-outline-variant">
        <div className="flex items-center gap-4 px-4 md:px-6 py-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="rounded-full"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="title-large text-on-surface">Reports</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="bg-surface-container border border-outline-variant rounded-lg p-6">
            <h2 className="title-medium text-on-surface mb-4">Sales & Stock Analytics</h2>
            <p className="body-medium text-on-surface-variant">
              Reports functionality coming soon. This screen will display sales and stock analytics data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

