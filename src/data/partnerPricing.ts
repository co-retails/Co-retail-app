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
  { id: 'monki', name: 'Monki' },
  { id: 'hm', name: 'H&M' },
  { id: 'cos', name: 'COS' },
  { id: 'arket', name: 'Arket' }
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
      // Demo ladder from Excel (SEK, SE, weekday)
      SEK: [
        50, 60, 80, 100, 120, 150, 180, 200, 250, 300, 350, 400, 450, 500, 550,
        600, 650, 700, 750, 800, 850, 900, 950, 1000, 1050, 1100, 1200, 1300,
        1400, 1500, 1600, 1700, 1800, 1900, 2000, 2100, 2200, 2300, 2400, 2500
      ],
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
      // Demo ladder from Excel (SEK, SE, weekday)
      SEK: [
        50, 60, 80, 100, 120, 150, 180, 200, 250, 300, 350, 400, 450, 500, 550,
        600, 650, 700, 750, 800, 850, 900, 950, 1000, 1050, 1100, 1200, 1300,
        1400, 1500, 1600, 1700, 1800, 1900, 2000, 2100, 2200, 2300, 2400, 2500
      ],
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
      // Demo ladder from Excel (SEK, SE, Monki)
      SEK: [
        50, 60, 80, 100, 120, 150, 180, 200, 220, 240, 250, 280, 300, 320, 350,
        380, 400, 450, 500, 550, 600, 650, 700, 750, 800, 850, 900, 950, 1000,
        1050, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000,
        2100, 2200, 2300, 2400, 2500
      ],
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
      // Demo ladder from Excel (SEK, SE, Monki)
      SEK: [
        50, 60, 80, 100, 120, 150, 180, 200, 220, 240, 250, 280, 300, 320, 350,
        380, 400, 450, 500, 550, 600, 650, 700, 750, 800, 850, 900, 950, 1000,
        1050, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000,
        2100, 2200, 2300, 2400, 2500
      ],
      EUR: [5, 8, 11, 14, 17, 20]
    }
  },
  {
    id: 'pp-hm-1',
    partnerId: '1',
    partnerName: 'Sellpy Operations',
    brandId: 'hm',
    brandName: 'H&M',
    prices: {
      // Demo ladder from Excel (SEK, SE, hm)
      SEK: [
        49, 60, 69, 79, 90, 99, 149, 199, 249, 299, 349, 399, 449, 499, 549,
        599, 649, 699, 749, 799, 849, 899, 999, 1099, 1199, 1299, 1399, 1499,
        1599, 1699, 1799, 1899, 1999, 2499, 2999, 3499, 3999, 4999
      ],
      EUR: [5, 7, 9, 12, 15, 18, 22]
    }
  },
  {
    id: 'pp-hm-2',
    partnerId: '2',
    partnerName: 'Thrifted',
    brandId: 'hm',
    brandName: 'H&M',
    prices: {
      // Demo ladder from Excel (SEK, SE, hm)
      SEK: [
        49, 60, 69, 79, 90, 99, 149, 199, 249, 299, 349, 399, 449, 499, 549,
        599, 649, 699, 749, 799, 849, 899, 999, 1099, 1199, 1299, 1399, 1499,
        1599, 1699, 1799, 1899, 1999, 2499, 2999, 3499, 3999, 4999
      ],
      EUR: [5, 7, 9, 12, 15, 18, 22]
    }
  },
  {
    id: 'pp-cos-1',
    partnerId: '1',
    partnerName: 'Sellpy Operations',
    brandId: 'cos',
    brandName: 'COS',
    prices: {
      // No COS SEK ladder present in the shared Excel; reuse Weekday ladder for demo consistency.
      SEK: [
        50, 60, 80, 100, 120, 150, 180, 200, 250, 300, 350, 400, 450, 500, 550,
        600, 650, 700, 750, 800, 850, 900, 950, 1000, 1050, 1100, 1200, 1300,
        1400, 1500, 1600, 1700, 1800, 1900, 2000, 2100, 2200, 2300, 2400, 2500
      ]
    }
  },
  {
    id: 'pp-cos-2',
    partnerId: '2',
    partnerName: 'Thrifted',
    brandId: 'cos',
    brandName: 'COS',
    prices: {
      SEK: [
        50, 60, 80, 100, 120, 150, 180, 200, 250, 300, 350, 400, 450, 500, 550,
        600, 650, 700, 750, 800, 850, 900, 950, 1000, 1050, 1100, 1200, 1300,
        1400, 1500, 1600, 1700, 1800, 1900, 2000, 2100, 2200, 2300, 2400, 2500
      ]
    }
  },
  {
    id: 'pp-arket-1',
    partnerId: '1',
    partnerName: 'Sellpy Operations',
    brandId: 'arket',
    brandName: 'Arket',
    prices: {
      // No Arket SEK ladder present in the shared Excel; reuse Weekday ladder for demo consistency.
      SEK: [
        50, 60, 80, 100, 120, 150, 180, 200, 250, 300, 350, 400, 450, 500, 550,
        600, 650, 700, 750, 800, 850, 900, 950, 1000, 1050, 1100, 1200, 1300,
        1400, 1500, 1600, 1700, 1800, 1900, 2000, 2100, 2200, 2300, 2400, 2500
      ]
    }
  },
  {
    id: 'pp-arket-2',
    partnerId: '2',
    partnerName: 'Thrifted',
    brandId: 'arket',
    brandName: 'Arket',
    prices: {
      SEK: [
        50, 60, 80, 100, 120, 150, 180, 200, 250, 300, 350, 400, 450, 500, 550,
        600, 650, 700, 750, 800, 850, 900, 950, 1000, 1050, 1100, 1200, 1300,
        1400, 1500, 1600, 1700, 1800, 1900, 2000, 2100, 2200, 2300, 2400, 2500
      ]
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


