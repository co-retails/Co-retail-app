// Types for sales report data
export interface SalesDataPoint {
  month: string;
  totalSold: number;
  byStore: Array<{ storeId: string; storeName: string; sold: number }>;
  byBrand: Array<{ brandId: string; brandName: string; sold: number }>;
}

