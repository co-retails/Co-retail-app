// Types for stock report data
export interface StockReportData {
  month: string;
  totalItems: number;
  byStore: Array<{ storeId: string; storeName: string; items: number }>;
  byBrand: Array<{ brandId: string; brandName: string; items: number }>;
}

