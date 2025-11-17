export type CalibrationParameterType = 'slider' | 'number' | 'select' | 'toggle';

export interface CalibrationParameterDefinition {
  id: string;
  label: string;
  description?: string;
  type: CalibrationParameterType;
  min?: number;
  max?: number;
  step?: number;
  options?: { label: string; value: string }[];
  defaultValue: number | string | boolean;
  format?: (value: number | string | boolean) => string;
}

export interface PriceForkCalibrationState {
  [key: string]: number | string | boolean;
}

export interface PriceForkTestItem {
  id: string;
  sku: string;
  title: string;
  brand: string;
  brandTier: 'Haute couture' | 'Premium' | 'High' | 'Mid' | 'Low' | 'Strategic low';
  category: string;
  partnerCategory: string;
  condition: 'Pristine' | 'Excellent' | 'Good' | 'Fair';
  material: 'leather' | 'silk' | 'suede' | 'other';
  purchasePrice: number;
  aiSuggestedPrice: number;
  aiConfidence: number;
  manualOverridePrice?: number;
  status: 'pending' | 'accepted' | 'rejected';
  imageUrl: string;
  notes?: string;
}

export interface PriceForkBrandSegment {
  tier: 'Haute couture' | 'Premium' | 'High' | 'Mid' | 'Low' | 'Strategic low';
  description: string;
  brands: { name: string; avgSellThrough: number; upliftVsBase: number }[];
}

export interface PriceForkCategoryMapping {
  partnerCategory: string;
  retailerCategory: string;
  confidence: number;
  avgUplift: number;
  sampleSize: number;
}

export interface PriceForkInsightPrompt {
  id: 'brand-groups' | 'category-mapping' | 'pricing-logic';
  label: string;
  description: string;
}

export interface PriceForkComparisonSample {
  id: string;
  title: string;
  imageUrl: string;
  partnerPrice: number;
  aiSuggestedPrice: number;
  aiConfidence: number;
  margin: number;
  brand: string;
  condition: string;
}

export const calibrationParameters: CalibrationParameterDefinition[] = [
  {
    id: 'marginFloor',
    label: 'Margin floor',
    description: 'Minimum gross margin percentage the AI must respect.',
    type: 'number',
    min: 15,
    max: 60,
    step: 1,
    defaultValue: 32,
    format: (value) => `${value}%`
  }
];

export const brandTierWeights: CalibrationParameterDefinition[] = [
  {
    id: 'tierHauteCoutureWeight',
    label: 'Haute couture',
    description: 'Weight adjustment for haute couture brands.',
    type: 'slider',
    min: 0.5,
    max: 2.0,
    step: 0.05,
    defaultValue: 1.5,
    format: (value) => `${((value as number) - 1) * 100 >= 0 ? '+' : ''}${Math.round(((value as number) - 1) * 100)}%`
  },
  {
    id: 'tierPremiumWeight',
    label: 'Premium',
    description: 'Weight adjustment for premium brands.',
    type: 'slider',
    min: 0.5,
    max: 2.0,
    step: 0.05,
    defaultValue: 1.35,
    format: (value) => `${((value as number) - 1) * 100 >= 0 ? '+' : ''}${Math.round(((value as number) - 1) * 100)}%`
  },
  {
    id: 'tierHighWeight',
    label: 'High',
    description: 'Weight adjustment for high-tier brands.',
    type: 'slider',
    min: 0.5,
    max: 2.0,
    step: 0.05,
    defaultValue: 1.15,
    format: (value) => `${((value as number) - 1) * 100 >= 0 ? '+' : ''}${Math.round(((value as number) - 1) * 100)}%`
  },
  {
    id: 'tierMidWeight',
    label: 'Mid',
    description: 'Weight adjustment for mid-tier brands.',
    type: 'slider',
    min: 0.5,
    max: 2.0,
    step: 0.05,
    defaultValue: 1.0,
    format: (value) => `${((value as number) - 1) * 100 >= 0 ? '+' : ''}${Math.round(((value as number) - 1) * 100)}%`
  },
  {
    id: 'tierLowWeight',
    label: 'Low',
    description: 'Weight adjustment for low-tier brands.',
    type: 'slider',
    min: 0.5,
    max: 2.0,
    step: 0.05,
    defaultValue: 0.85,
    format: (value) => `${((value as number) - 1) * 100 >= 0 ? '+' : ''}${Math.round(((value as number) - 1) * 100)}%`
  },
  {
    id: 'tierStrategicLowWeight',
    label: 'Strategic low',
    description: 'Weight adjustment for strategic low-tier brands.',
    type: 'slider',
    min: 0.5,
    max: 2.0,
    step: 0.05,
    defaultValue: 0.75,
    format: (value) => `${((value as number) - 1) * 100 >= 0 ? '+' : ''}${Math.round(((value as number) - 1) * 100)}%`
  }
];

export const priceForkDefaultState: PriceForkCalibrationState = {
  marginFloor: calibrationParameters.find((param) => param.id === 'marginFloor')?.defaultValue ?? 32,
  tierHauteCoutureWeight: brandTierWeights.find((param) => param.id === 'tierHauteCoutureWeight')?.defaultValue ?? 1.5,
  tierPremiumWeight: brandTierWeights.find((param) => param.id === 'tierPremiumWeight')?.defaultValue ?? 1.35,
  tierHighWeight: brandTierWeights.find((param) => param.id === 'tierHighWeight')?.defaultValue ?? 1.15,
  tierMidWeight: brandTierWeights.find((param) => param.id === 'tierMidWeight')?.defaultValue ?? 1.0,
  tierLowWeight: brandTierWeights.find((param) => param.id === 'tierLowWeight')?.defaultValue ?? 0.85,
  tierStrategicLowWeight: brandTierWeights.find((param) => param.id === 'tierStrategicLowWeight')?.defaultValue ?? 0.75,
  materialLeatherWeight: 1.1,
  materialSilkWeight: 1.08,
  materialSuedeWeight: 1.05
};

export const mockPriceForkTestItems: PriceForkTestItem[] = [
  {
    id: 'pf-item-001',
    sku: 'THR-ACN-001',
    title: 'Acne Studios Leather Moto Jacket',
    brand: 'Acne Studios',
    brandTier: 'Premium',
    category: 'Outerwear',
    partnerCategory: 'Leather Jackets',
    condition: 'Excellent',
    material: 'leather',
    purchasePrice: 165,
    aiSuggestedPrice: 320,
    aiConfidence: 0.88,
    manualOverridePrice: undefined,
    status: 'pending',
    imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80',
    notes: 'Comparable style sold out in 5 days last season.'
  },
  {
    id: 'pf-item-002',
    sku: 'THR-GNN-112',
    title: 'Ganni Mohair Blend Cardigan',
    brand: 'Ganni',
    brandTier: 'Premium',
    category: 'Knitwear',
    partnerCategory: 'Cardigans',
    condition: 'Good',
    material: 'silk',
    purchasePrice: 58,
    aiSuggestedPrice: 120,
    aiConfidence: 0.74,
    manualOverridePrice: undefined,
    status: 'pending',
    imageUrl: 'https://images.unsplash.com/photo-1537832816519-689ad163238b?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'pf-item-003',
    sku: 'THR-LVT-674',
    title: 'Levi’s 501 Vintage Denim',
    brand: 'Levi’s',
    brandTier: 'Mid',
    category: 'Denim',
    partnerCategory: 'Jeans',
    condition: 'Pristine',
    material: 'other',
    purchasePrice: 32,
    aiSuggestedPrice: 80,
    aiConfidence: 0.92,
    manualOverridePrice: undefined,
    status: 'accepted',
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=400&q=80',
    notes: 'Manual override applied last week (+8% vs baseline).'
  },
  {
    id: 'pf-item-004',
    sku: 'THR-HNM-432',
    title: 'H&M Conscious Linen Dress',
    brand: 'H&M Conscious',
    brandTier: 'Low',
    category: 'Dresses',
    partnerCategory: 'Summer Dresses',
    condition: 'Fair',
    material: 'other',
    purchasePrice: 14,
    aiSuggestedPrice: 35,
    aiConfidence: 0.58,
    manualOverridePrice: undefined,
    status: 'pending',
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf13ab?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'pf-item-005',
    sku: 'THR-DRM-221',
    title: 'Dr. Martens 1460 Boots',
    brand: 'Dr. Martens',
    brandTier: 'Mid',
    category: 'Footwear',
    partnerCategory: 'Boots',
    condition: 'Excellent',
    material: 'leather',
    purchasePrice: 72,
    aiSuggestedPrice: 150,
    aiConfidence: 0.81,
    manualOverridePrice: undefined,
    status: 'pending',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80'
  }
];

export const mockBrandSegments: PriceForkBrandSegment[] = [
  {
    tier: 'Premium',
    description: 'High-demand designers with persistent waitlists and low markdown dependency.',
    brands: [
      { name: 'Acne Studios', avgSellThrough: 92, upliftVsBase: 38 },
      { name: 'Totême', avgSellThrough: 88, upliftVsBase: 31 },
      { name: 'Ganni', avgSellThrough: 84, upliftVsBase: 26 },
      { name: 'House of Dagmar', avgSellThrough: 81, upliftVsBase: 22 }
    ]
  },
  {
    tier: 'Mid',
    description: 'Popular brands with stable demand and moderate markdowns.',
    brands: [
      { name: 'Dr. Martens', avgSellThrough: 78, upliftVsBase: 18 },
      { name: 'Levi’s', avgSellThrough: 74, upliftVsBase: 12 },
      { name: 'Carhartt', avgSellThrough: 71, upliftVsBase: 9 },
      { name: 'Filippa K', avgSellThrough: 68, upliftVsBase: 7 }
    ]
  },
  {
    tier: 'Low',
    description: 'Long-tail assortment requiring markdowns to maintain velocity.',
    brands: [
      { name: 'H&M Conscious', avgSellThrough: 62, upliftVsBase: -4 },
      { name: 'Weekday', avgSellThrough: 58, upliftVsBase: -7 },
      { name: 'Monki', avgSellThrough: 55, upliftVsBase: -11 },
      { name: 'Selected Femme', avgSellThrough: 52, upliftVsBase: -15 }
    ]
  }
];

export const mockCategoryMappings: PriceForkCategoryMapping[] = [
  {
    partnerCategory: 'Leather Jackets',
    retailerCategory: 'Outerwear > Jackets > Leather',
    confidence: 0.91,
    avgUplift: 0.34,
    sampleSize: 142
  },
  {
    partnerCategory: 'Cardigans',
    retailerCategory: 'Knitwear > Cardigans',
    confidence: 0.83,
    avgUplift: 0.22,
    sampleSize: 187
  },
  {
    partnerCategory: 'Vintage Denim',
    retailerCategory: 'Denim > Jeans > Vintage',
    confidence: 0.79,
    avgUplift: 0.19,
    sampleSize: 204
  },
  {
    partnerCategory: 'Summer Dresses',
    retailerCategory: 'Dresses > Day Dresses',
    confidence: 0.68,
    avgUplift: 0.08,
    sampleSize: 156
  },
  {
    partnerCategory: 'Boots',
    retailerCategory: 'Footwear > Boots',
    confidence: 0.88,
    avgUplift: 0.27,
    sampleSize: 132
  }
];

export const priceForkPromptDefinitions: PriceForkInsightPrompt[] = [
  {
    id: 'brand-groups',
    label: 'Show Premium, Mid, Low Brand Groups',
    description: 'Review brand tiering and uplift impact.'
  },
  {
    id: 'category-mapping',
    label: 'Show Category Mapping',
    description: 'Validate partner vs retailer categories.'
  },
  {
    id: 'pricing-logic',
    label: 'Explain Current Pricing Logic',
    description: 'Understand which inputs drive the current recommendation.'
  }
];

export const pricingLogicNarrative = [
  'Base price seeded using median sell-through over the last six weeks for comparable SKUs.',
  'Brand weighting applies a +18% uplift because Acne Studios sits in the Premium cohort with 1.8x demand.',
  'Condition adjustment applies a -4% markdown (Excellent vs Pristine).',
  'Inventory momentum boosts price +6% to protect margin because leather category velocity is above target.',
  'Dynamic markdown schedule enabled: if unsold after 21 days, price cascades -12%, -22%, then locks at floor.'
];

export const mockComparisonSamples: PriceForkComparisonSample[] = [
  {
    id: 'cmp-001',
    title: 'Totême Cashmere Blend Coat',
    imageUrl: 'https://images.unsplash.com/photo-1603252110914-3f5ce87a9810?auto=format&fit=crop&w=400&q=80',
    partnerPrice: 299,
    aiSuggestedPrice: 345,
    aiConfidence: 0.89,
    margin: 0.41,
    brand: 'Totême',
    condition: 'Excellent'
  },
  {
    id: 'cmp-002',
    title: 'Weekday Oversized Blazer',
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf67ab?auto=format&fit=crop&w=400&q=80',
    partnerPrice: 89,
    aiSuggestedPrice: 92,
    aiConfidence: 0.63,
    margin: 0.28,
    brand: 'Weekday',
    condition: 'Good'
  },
  {
    id: 'cmp-003',
    title: 'Arket Alpaca Blend Sweater',
    imageUrl: 'https://images.unsplash.com/photo-1525171254930-643fc658b64e?auto=format&fit=crop&w=400&q=80',
    partnerPrice: 115,
    aiSuggestedPrice: 139,
    aiConfidence: 0.76,
    margin: 0.36,
    brand: 'Arket',
    condition: 'Pristine'
  }
];


