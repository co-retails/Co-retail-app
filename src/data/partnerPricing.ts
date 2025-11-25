export interface PartnerPriceBook {
  id: string;
  partnerId: string;
  partnerName: string;
  brandId: string;
  brandName: string;
  prices: Record<string, number[]>;
}

export interface SekPriceLadder {
  id: string;
  partnerId: string;
  brandId: string;
  steps: number[];
}

export interface PricingBrand {
  id: string;
  name: string;
}

export const pricingBrands: PricingBrand[] = [
  { id: 'weekday', name: 'Weekday' },
  { id: 'monki', name: 'Monki' }
];

const brandIdByName: Record<string, string> = pricingBrands.reduce(
  (acc, brand) => {
    acc[brand.name.toLowerCase()] = brand.id;
    return acc;
  },
  {} as Record<string, string>
);

export const partnerPriceBooks: PartnerPriceBook[] = [
  {
    id: 'pp-1',
    partnerId: '1',
    partnerName: 'Sellpy Operations',
    brandId: 'weekday',
    brandName: 'Weekday',
    prices: {
      SEK: [95, 125, 150, 199, 249, 299, 349, 399],
      EUR: [9, 12, 15, 18, 22, 25, 30],
      USD: [9.5, 12.5, 15.5, 19, 23, 28, 34]
    }
  },
  {
    id: 'pp-2',
    partnerId: '2',
    partnerName: 'Thrifted',
    brandId: 'weekday',
    brandName: 'Weekday',
    prices: {
      SEK: [60, 90, 120, 150, 180, 210],
      NOK: [70, 95, 130, 160, 195, 225],
      EUR: [6, 9, 12, 15, 18, 21]
    }
  },
  {
    id: 'pp-3',
    partnerId: '6',
    partnerName: 'Shenzhen Fashion Manufacturing',
    brandId: 'weekday',
    brandName: 'Weekday',
    prices: {
      SEK: [120, 160, 210, 260, 320, 390],
      USD: [19, 24, 29, 34, 39, 45],
      EUR: [18, 23, 27, 32, 38, 44]
    }
  },
  {
    id: 'pp-4',
    partnerId: '1',
    partnerName: 'Sellpy Operations',
    brandId: 'monki',
    brandName: 'Monki',
    prices: {
      SEK: [80, 110, 145, 175, 210, 260],
      GBP: [7, 12, 15, 20, 25],
      EUR: [8, 13, 17, 22, 27]
    }
  },
  {
    id: 'pp-5',
    partnerId: '2',
    partnerName: 'Thrifted',
    brandId: 'monki',
    brandName: 'Monki',
    prices: {
      SEK: [55, 85, 115, 145, 175, 205],
      EUR: [5, 8, 11, 14, 17, 20]
    }
  }
];

export const sekPriceLadders: SekPriceLadder[] = partnerPriceBooks.map((book) => ({
  id: `${book.brandId}-${book.partnerId}`,
  partnerId: book.partnerId,
  brandId: book.brandId,
  steps: book.prices.SEK ?? []
}));

export const brandNameById: Record<string, string> = pricingBrands.reduce(
  (acc, brand) => {
    acc[brand.id] = brand.name;
    return acc;
  },
  {} as Record<string, string>
);

export function getBrandIdFromName(brandName?: string): string | undefined {
  if (!brandName) return undefined;
  const normalized = brandName.trim().toLowerCase();
  return brandIdByName[normalized];
}

export function getSekPriceOptions(partnerId?: string, brandNameOrId?: string): number[] {
  const normalizedBrandId =
    (brandNameOrId && (brandNameById[brandNameOrId] || getBrandIdFromName(brandNameOrId))) ||
    (brandNameOrId ? brandNameOrId.toLowerCase() : undefined);

  const tryGetForPartner = (id: string | undefined) => {
    if (!id) return undefined;

    const brandSpecificMatch =
      normalizedBrandId &&
      partnerPriceBooks.find(
        (book) => book.partnerId === id && book.brandId === normalizedBrandId && book.prices.SEK?.length
      );

    if (brandSpecificMatch) {
      return brandSpecificMatch.prices.SEK;
    }

    const fallbackMatch = partnerPriceBooks.find(
      (book) => book.partnerId === id && book.prices.SEK?.length
    );

    return fallbackMatch?.prices.SEK;
  };

  const partnerScoped = tryGetForPartner(partnerId);
  if (partnerScoped?.length) {
    return partnerScoped;
  }

  const globalFallback = partnerPriceBooks.find((book) => book.prices.SEK?.length)?.prices.SEK;
  return globalFallback ?? [];
}

export function getBrandOptionsForPartner(partnerId: string): PricingBrand[] {
  const partnerBrands = partnerPriceBooks
    .filter((book) => book.partnerId === partnerId)
    .map((book) => ({
      id: book.brandId,
      name: brandNameById[book.brandId] ?? book.brandName ?? book.brandId
    }));

  if (partnerBrands.length) {
    return partnerBrands;
  }

  return pricingBrands;
}

// Map country names to currency codes
const countryToCurrency: Record<string, string> = {
  'Sweden': 'SEK',
  'Denmark': 'DKK',
  'Norway': 'NOK',
  'Finland': 'EUR',
  'Netherlands': 'EUR',
  'Belgium': 'EUR',
  'Austria': 'EUR',
  'Switzerland': 'CHF',
  'Spain': 'EUR',
  'France': 'EUR',
  'Italy': 'EUR',
  'Portugal': 'EUR',
  'United Kingdom': 'GBP',
  'Ireland': 'EUR',
  'Germany': 'EUR',
  'Poland': 'PLN',
  'Czech Republic': 'CZK',
  'United States': 'USD',
  'Canada': 'CAD',
  'Russia': 'RUB',
  'Japan': 'JPY',
  'South Korea': 'KRW',
  'China': 'CNY',
  'Australia': 'AUD',
  'Mexico': 'MXN',
  'Brazil': 'BRL'
};

// Get currency code from country name
export function getCurrencyFromCountry(countryName: string): string {
  return countryToCurrency[countryName] || 'EUR'; // Default to EUR if country not found
}

// Get price options for a partner, brand, and currency
export function getPriceOptionsForCurrency(
  partnerId?: string,
  brandNameOrId?: string,
  currency?: string
): number[] {
  if (!partnerId || !currency) {
    return [];
  }

  const normalizedBrandId =
    (brandNameOrId && (brandNameById[brandNameOrId] || getBrandIdFromName(brandNameOrId))) ||
    (brandNameOrId ? brandNameOrId.toLowerCase() : undefined);

  const priceBook = partnerPriceBooks.find(
    (book) =>
      book.partnerId === partnerId &&
      (!normalizedBrandId || book.brandId === normalizedBrandId) &&
      book.prices[currency]?.length
  );

  return priceBook?.prices[currency] ?? [];
}


