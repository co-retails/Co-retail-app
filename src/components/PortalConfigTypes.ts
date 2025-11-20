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

export interface CountryOverride {
  id: string;
  brandId: string;
  countryCode: string;
  attributeId: string;
  mandatory?: boolean; // Can only tighten (true), not loosen
  visible: boolean;
  allowedValueIds?: string[]; // Restrict to subset
  localizedLabels?: Record<string, string>; // Value code -> localized label
}

export interface SEKPriceLadder {
  id: string;
  brandId: string;
  partnerId: string;
  steps: number[]; // Ascending SEK values
  lastEdited: string;
  lastEditedBy: string;
  publishedAt?: string;
}

export type CurrencyCode = 'SEK' | 'EUR' | 'GBP' | 'USD' | 'DKK' | 'NOK';

export type MappingRuleType = 'nearest' | 'floor' | 'ceil' | 'table';

export interface CurrencyMapping {
  id: string;
  brandId: string;
  partnerId: string;
  currency: CurrencyCode;
  ruleType: MappingRuleType;
  mappingTable?: Array<{ localPrice: number; sekPrice: number }>; // For table type
  fxSource?: string; // Read-only FX source reference
  lastEdited: string;
  lastEditedBy: string;
  publishedAt?: string;
}

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

// Effective configuration (computed from master + overrides)
export interface EffectiveAttribute extends Attribute {
  isOverridden: boolean;
  overrideSource?: 'country' | 'partner';
  effectiveMandatory: boolean;
  effectiveValues?: DropdownValue[];
}

// GTIN Mapping Types
export type PartnerType = 'Main Partner' | 'Premium Partner' | 'Sellpy';

export interface GtinMapping {
  id: string;
  brandId?: string;
  partnerType: PartnerType;
  partnerId?: string; // Only for overrides
  category?: string; // Only for US partners
  gtin: string;
  articleNumber: string;
  source: 'inherited' | 'override';
  lastEdited: string;
  lastEditedBy: string;
  publishedAt?: string;
}

export interface GtinMappingStats {
  totalMappings: number;
  inheritedCount: number;
  overrideCount: number;
  storageEfficiency: number; // Percentage of mappings that are inherited vs overrides
}
