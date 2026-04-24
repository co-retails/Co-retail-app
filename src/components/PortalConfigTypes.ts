// Portal Configuration Types

export type UserRole = 'admin' | 'partner' | 'store_staff';

export type AttributeType = 'text' | 'number' | 'date' | 'list' | 'multi-select';
export type InputType = 'free-text' | 'dropdown' | 'chips';

export interface Attribute {
  id: string;
  key: string;
  label: string;
  description?: string;
  type: AttributeType;
  inputType: InputType;
  mandatory: boolean;
  helpText?: string;
  brandId: string;
  status: 'active' | 'inactive';
  usedByCategories: number;
  lastEdited: string;
  lastEditedBy: string;
  createdAt: string;
}

export interface DropdownValue {
  id: string;
  code: string;
  label: string;
  sort: number;
  active: boolean;
  attributeId: string;
}

export type CurrencyCode = 'SEK' | 'EUR' | 'GBP' | 'USD' | 'DKK' | 'NOK';

export interface PartnerPricing {
  id: string;
  brandId: string;
  partnerId: string;
  pricePoints: PricePoint[]; // All price points with multi-currency values
  lastEdited: string;
  lastEditedBy: string;
  publishedAt?: string;
}

export interface PricePoint {
  sekPrice: number; // The base SEK price from the ladder
  currencyPrices: Record<CurrencyCode, number | null>; // Fixed prices for each currency
}

export interface ConfigVersion {
  id: string;
  version: number;
  publishedAt: string;
  publishedBy: string;
  notes?: string;
  payload: any; // JSON snapshot
}

export interface ValidationError {
  row: number;
  field: string;
  message: string;
  allowedValues?: string[];
}

export interface Brand {
  id: string;
  name: string;
  code: string;
}

export interface Country {
  code: string;
  name: string;
}

export interface Partner {
  id: string;
  name: string;
  code: string;
}
