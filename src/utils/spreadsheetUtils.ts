import { OrderItem } from '../components/OrderCreationScreen';
import { MASTER_VALUES_DEMO } from '../data/masterValuesDemo';

// Valid dropdown values for validation
export const VALID_VALUES = {
  brands: ['H&M', 'WEEKDAY', 'COS', 'Monki', 'Zara', 'Arket', 'Other Stories'],
  genders: ['Men', 'Women', 'Kids', 'Unisex'],
  categories: ['Clothing', 'Shoes', 'Accessories'],
  subcategories: {
    'Clothing': ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Activewear', 'Swimwear'],
    'Shoes': ['Sneakers', 'Boots', 'Sandals', 'Formal', 'Flats'],
    'Accessories': ['Bags', 'Jewelry', 'Belts', 'Hats', 'Scarves', 'Sunglasses']
  },
  sizes: ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
  colors: ['Black', 'White', 'Gray', 'Navy', 'Blue', 'Red', 'Pink', 'Green', 'Yellow', 'Brown', 'Beige', 'Purple', 'Orange', 'Silver', 'Gold', 'Multicolor'],
  prices: [49, 99, 149, 199, 249, 299, 349, 399, 449, 499, 599, 699, 799, 899, 999, 1299, 1599, 1999]
};

// Thrifted-specific valid values
function getMasterCategoryBrandKey(brandId?: string | null): keyof typeof MASTER_VALUES_DEMO.categoriesByBrand {
  const normalized = (brandId ?? '').trim().toLowerCase();
  if (normalized === 'hm' || normalized === 'h&m') return 'H&M';
  if (normalized === 'cos') return 'COS';
  if (normalized === 'arket') return 'ARKET';
  return 'WEEKDAY';
}

function getMasterSizesBrandKey(brandId?: string | null): keyof typeof MASTER_VALUES_DEMO.sizesByBrand {
  const normalized = (brandId ?? '').trim().toLowerCase();
  if (normalized === 'hm' || normalized === 'h&m') return 'H&M';
  if (normalized === 'cos') return 'COS';
  if (normalized === 'arket') return 'ARKET';
  return 'WEEKDAY/MONKI';
}

function getMasterGendersBrandKey(brandId?: string | null): keyof typeof MASTER_VALUES_DEMO.gendersByBrand {
  const normalized = (brandId ?? '').trim().toLowerCase();
  if (normalized === 'hm' || normalized === 'h&m') return 'H&M';
  if (normalized === 'cos') return 'COS';
  if (normalized === 'arket') return 'ARKET';
  return 'WEEKDAY/MONKI';
}

function getMasterSekPricesBrandKey(
  brandId?: string | null
): keyof typeof MASTER_VALUES_DEMO.sekPricesByBrand {
  const normalized = (brandId ?? '').trim().toLowerCase();
  if (normalized === 'hm' || normalized === 'h&m') return 'hm';
  if (normalized === 'monki') return 'Monki';
  return 'weekday';
}

export function getThriftedValidValues(brandId?: string | null) {
  const categoriesKey = getMasterCategoryBrandKey(brandId);
  const sizesKey = getMasterSizesBrandKey(brandId);
  const gendersKey = getMasterGendersBrandKey(brandId);
  const pricesKey = getMasterSekPricesBrandKey(brandId);

  const subcategoriesByCategory = Object.fromEntries(
    Object.entries(MASTER_VALUES_DEMO.categoriesByBrand[categoriesKey]).map(([category, subcategories]) => [
      category,
      [...subcategories].sort((a, b) => a.localeCompare(b))
    ])
  ) as Record<string, string[]>;

  return {
    categories: Object.keys(subcategoriesByCategory).sort((a, b) => a.localeCompare(b)),
    subcategories: subcategoriesByCategory,
    genders: [...MASTER_VALUES_DEMO.gendersByBrand[gendersKey]].sort((a, b) => a.localeCompare(b)),
    sizes: [...MASTER_VALUES_DEMO.sizesByBrand[sizesKey]],
    prices: [...MASTER_VALUES_DEMO.sekPricesByBrand[pricesKey]],
    colors: [...MASTER_VALUES_DEMO.colors].sort((a, b) => a.localeCompare(b))
  };
}

// Keep existing constant for backwards compatibility (defaults to Weekday-ish set)
export const THRIFTED_VALID_VALUES = getThriftedValidValues('weekday');

export const THRIFTED_IMPORT_CHUNK_SIZE = 1000;
export const MOCK_THRIFTED_TEMPLATE_ENDPOINT_LIVE = false;

const FIELD_ERROR_SEPARATOR = ' | ';
const DUPLICATE_SKU_IN_FILE = 'Duplicate SKU in this upload file';
const DUPLICATE_ITEM_ID_IN_FILE = 'Duplicate Item ID in this upload file';
const DUPLICATE_SKU_IN_ORDER = 'Duplicate SKU already exists in the current order';
const DUPLICATE_ITEM_ID_IN_ORDER = 'Duplicate Item ID already exists in the current order';

export type ThriftedImportOutcome = 'imported' | 'rejected' | 'skipped';

export interface ThriftedImportDuplicateSummary {
  withinFileSku: number;
  withinFileItemId: number;
  currentOrderSku: number;
  currentOrderItemId: number;
  affectedRows: number;
}

export interface ThriftedImportSummary {
  totalRows: number;
  importedCount: number;
  rejectedCount: number;
  skippedCount: number;
  duplicateRows: number;
  chunkSize: number;
  chunkCount: number;
}

export interface ThriftedImportProgress {
  currentChunk: number;
  totalChunks: number;
  processedRows: number;
  totalRows: number;
  percentage: number;
}

export interface ThriftedImportResult {
  items: OrderItem[];
  errors: string[];
  summary: ThriftedImportSummary;
  duplicates: ThriftedImportDuplicateSummary;
  progress: ThriftedImportProgress;
  existingOrderConflictsIncluded: boolean;
}

export interface ThriftedImportOptions {
  existingItems?: OrderItem[];
  chunkSize?: number;
  onProgress?: (progress: ThriftedImportProgress) => void;
}

export interface ThriftedTemplateAvailability {
  endpointLive: boolean;
  buttonLabel: string;
  helperText: string;
}

interface DuplicateTrackingContext {
  seenUploadSkus: Set<string>;
  seenUploadItemIds: Set<string>;
  existingSkus: Set<string>;
  existingItemIds: Set<string>;
}

function normalizeDuplicateKey(value?: string | null): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed.toLowerCase() : null;
}

function splitFieldErrorSegments(message?: string): string[] {
  return (message ?? '')
    .split(FIELD_ERROR_SEPARATOR)
    .map((segment) => segment.trim())
    .filter(Boolean);
}

function getFieldErrorSegments(fieldErrors?: Record<string, string>): string[] {
  return Object.values(fieldErrors ?? {}).flatMap((message) => splitFieldErrorSegments(message));
}

function mergeFieldError(
  fieldErrors: Record<string, string>,
  fieldName: string,
  message: string
): void {
  const messages = splitFieldErrorSegments(fieldErrors[fieldName]);
  if (messages.includes(message)) {
    return;
  }
  fieldErrors[fieldName] = [...messages, message].join(FIELD_ERROR_SEPARATOR);
}

function rebuildItemErrorsFromFieldErrors(fieldErrors?: Record<string, string>): string[] | undefined {
  const messages = getFieldErrorSegments(fieldErrors);
  return messages.length > 0 ? messages : undefined;
}

export function isDuplicateFieldErrorMessage(message?: string): boolean {
  return splitFieldErrorSegments(message).some((segment) =>
    segment.toLowerCase().startsWith('duplicate ')
  );
}

export function isCurrentOrderDuplicateFieldErrorMessage(message?: string): boolean {
  return splitFieldErrorSegments(message).some((segment) =>
    segment.toLowerCase().includes('current order')
  );
}

export function hasDuplicateFieldErrors(
  item?: Pick<OrderItem, 'fieldErrors'> | null
): boolean {
  return getFieldErrorSegments(item?.fieldErrors).some((segment) =>
    isDuplicateFieldErrorMessage(segment)
  );
}

export function hasNonDuplicateFieldErrors(
  item?: Pick<OrderItem, 'fieldErrors'> | null
): boolean {
  return getFieldErrorSegments(item?.fieldErrors).some(
    (segment) => !isDuplicateFieldErrorMessage(segment)
  );
}

export function getThriftedImportOutcome(
  item?: Pick<OrderItem, 'fieldErrors'> | null
): ThriftedImportOutcome {
  const messages = getFieldErrorSegments(item?.fieldErrors);
  if (messages.length === 0) {
    return 'imported';
  }
  return messages.some((segment) => !isDuplicateFieldErrorMessage(segment))
    ? 'rejected'
    : 'skipped';
}

export function getThriftedTemplateAvailability(): ThriftedTemplateAvailability {
  if (MOCK_THRIFTED_TEMPLATE_ENDPOINT_LIVE) {
    return {
      endpointLive: true,
      buttonLabel: 'Download Template',
      helperText: 'Using a mocked template endpoint backed by the local prototype generator.'
    };
  }

  return {
    endpointLive: false,
    buttonLabel: 'Template Not Live Yet',
    helperText: 'The prototype keeps this disabled until the mocked template endpoint is marked as live.'
  };
}

function createDuplicateTrackingContext(existingItems: OrderItem[] = []): DuplicateTrackingContext {
  const existingSkus = new Set<string>();
  const existingItemIds = new Set<string>();

  existingItems.forEach((item) => {
    const skuKey = normalizeDuplicateKey(item.sku || item.partnerItemId || item.itemId);
    const itemIdKey = normalizeDuplicateKey(item.retailerItemId);

    if (skuKey) {
      existingSkus.add(skuKey);
    }
    if (itemIdKey) {
      existingItemIds.add(itemIdKey);
    }
  });

  return {
    seenUploadSkus: new Set<string>(),
    seenUploadItemIds: new Set<string>(),
    existingSkus,
    existingItemIds,
  };
}

function createProgressSnapshot(
  processedRows: number,
  totalRows: number,
  chunkSize: number
): ThriftedImportProgress {
  const totalChunks = totalRows === 0 ? 0 : Math.ceil(totalRows / chunkSize);
  const currentChunk = processedRows === 0 ? 0 : Math.ceil(processedRows / chunkSize);

  return {
    currentChunk,
    totalChunks,
    processedRows,
    totalRows,
    percentage: totalRows === 0 ? 100 : Math.round((processedRows / totalRows) * 100),
  };
}

function summarizeThriftedImport(
  items: OrderItem[],
  totalRows: number,
  chunkSize: number
): Pick<ThriftedImportResult, 'errors' | 'summary' | 'duplicates'> {
  const duplicates: ThriftedImportDuplicateSummary = {
    withinFileSku: 0,
    withinFileItemId: 0,
    currentOrderSku: 0,
    currentOrderItemId: 0,
    affectedRows: 0,
  };
  const errors = new Set<string>();
  let importedCount = 0;
  let rejectedCount = 0;
  let skippedCount = 0;
  let duplicateRows = 0;

  items.forEach((item) => {
    const outcome = getThriftedImportOutcome(item);
    const messages = getFieldErrorSegments(item.fieldErrors);
    const hasDuplicate = messages.some((segment) => isDuplicateFieldErrorMessage(segment));

    if (outcome === 'imported') {
      importedCount += 1;
    } else if (outcome === 'rejected') {
      rejectedCount += 1;
    } else {
      skippedCount += 1;
    }

    if (hasDuplicate) {
      duplicateRows += 1;
    }

    messages.forEach((message) => {
      switch (message) {
        case DUPLICATE_SKU_IN_FILE:
          duplicates.withinFileSku += 1;
          break;
        case DUPLICATE_ITEM_ID_IN_FILE:
          duplicates.withinFileItemId += 1;
          break;
        case DUPLICATE_SKU_IN_ORDER:
          duplicates.currentOrderSku += 1;
          break;
        case DUPLICATE_ITEM_ID_IN_ORDER:
          duplicates.currentOrderItemId += 1;
          break;
        default:
          break;
      }
    });

    (item.errors && item.errors.length > 0 ? item.errors : messages).forEach((message) => {
      errors.add(message);
    });
  });

  duplicates.affectedRows = duplicateRows;

  return {
    errors: Array.from(errors),
    summary: {
      totalRows,
      importedCount,
      rejectedCount,
      skippedCount,
      duplicateRows,
      chunkSize,
      chunkCount: totalRows === 0 ? 0 : Math.ceil(totalRows / chunkSize),
    },
    duplicates,
  };
}

function stripFieldErrorSegments(
  fieldErrors: Record<string, string> | undefined,
  predicate: (message: string) => boolean
): Record<string, string> | undefined {
  if (!fieldErrors) {
    return undefined;
  }

  const nextFieldErrors = Object.entries(fieldErrors).reduce<Record<string, string>>((acc, [key, value]) => {
    const remainingMessages = splitFieldErrorSegments(value).filter((message) => !predicate(message));
    if (remainingMessages.length > 0) {
      acc[key] = remainingMessages.join(FIELD_ERROR_SEPARATOR);
    }
    return acc;
  }, {});

  return Object.keys(nextFieldErrors).length > 0 ? nextFieldErrors : undefined;
}

export function stripCurrentOrderConflictsFromThriftedImport(
  result: ThriftedImportResult
): ThriftedImportResult {
  const items = result.items.map((item) => {
    const fieldErrors = stripFieldErrorSegments(
      item.fieldErrors,
      (message) => isCurrentOrderDuplicateFieldErrorMessage(message)
    );

    return {
      ...item,
      fieldErrors,
      errors: rebuildItemErrorsFromFieldErrors(fieldErrors),
    };
  });

  const snapshot = summarizeThriftedImport(items, result.summary.totalRows, result.summary.chunkSize);

  return {
    ...result,
    items,
    errors: snapshot.errors,
    summary: snapshot.summary,
    duplicates: snapshot.duplicates,
    existingOrderConflictsIncluded: false,
  };
}

function buildBaseThriftedOrderItem(
  row: Record<string, string>,
  rowNumber: number
): OrderItem {
  const validation = validateThriftedItemData(row, rowNumber);
  const subcategory = row['Subcategory*']?.trim() || row['Subcategory']?.trim() || '';
  const category = mapSubcategoryToCategory(subcategory) || '';

  return {
    id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    itemId: row['SKU']?.trim() || '',
    sku: row['SKU']?.trim() || '',
    retailerItemId: (row['Retailer ID*']?.trim() || row['Retailer ID']?.trim()) || '',
    brand: (row['Brand*']?.trim() || row['Brand']?.trim() || row['Item brand*']?.trim() || row['Item brand']?.trim()) || '',
    category,
    subcategory,
    size: (row['Size*']?.trim() || row['Size']?.trim()) || '',
    color: (row['Color*']?.trim() || row['Color']?.trim()) || '',
    gender: (row['Gender*']?.trim() || row['Gender']?.trim()) || '',
    price: parseFloat(row['Price (SEK)*'] || row['Price (SEK)'] || '0') || 0,
    status: 'draft',
    errors: validation.errors,
    fieldErrors: validation.fieldErrors,
    source: 'excel'
  };
}

function addDuplicateErrorsToThriftedOrderItem(
  item: OrderItem,
  rowNumber: number,
  tracking: DuplicateTrackingContext
): OrderItem {
  const fieldErrors = { ...(item.fieldErrors || {}) };
  const errors = [...(item.errors || [])];

  const skuKey = normalizeDuplicateKey(item.sku || item.itemId);
  const itemIdKey = normalizeDuplicateKey(item.retailerItemId);

  if (skuKey) {
    if (tracking.seenUploadSkus.has(skuKey)) {
      mergeFieldError(fieldErrors, 'sku', DUPLICATE_SKU_IN_FILE);
      errors.push(`Row ${rowNumber}: ${DUPLICATE_SKU_IN_FILE}`);
    } else {
      tracking.seenUploadSkus.add(skuKey);
    }

    if (tracking.existingSkus.has(skuKey)) {
      mergeFieldError(fieldErrors, 'sku', DUPLICATE_SKU_IN_ORDER);
      errors.push(`Row ${rowNumber}: ${DUPLICATE_SKU_IN_ORDER}`);
    }
  }

  if (itemIdKey) {
    if (tracking.seenUploadItemIds.has(itemIdKey)) {
      mergeFieldError(fieldErrors, 'retailerItemId', DUPLICATE_ITEM_ID_IN_FILE);
      errors.push(`Row ${rowNumber}: ${DUPLICATE_ITEM_ID_IN_FILE}`);
    } else {
      tracking.seenUploadItemIds.add(itemIdKey);
    }

    if (tracking.existingItemIds.has(itemIdKey)) {
      mergeFieldError(fieldErrors, 'retailerItemId', DUPLICATE_ITEM_ID_IN_ORDER);
      errors.push(`Row ${rowNumber}: ${DUPLICATE_ITEM_ID_IN_ORDER}`);
    }
  }

  return {
    ...item,
    fieldErrors: Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined,
    errors: errors.length > 0 ? Array.from(new Set(errors)) : undefined,
  };
}

function buildThriftedImportItems(
  csvRows: Array<Record<string, string>>,
  existingItems: OrderItem[] = []
): OrderItem[] {
  const tracking = createDuplicateTrackingContext(existingItems);

  return csvRows.map((row, index) => {
    const rowNumber = index + 2;
    const baseItem = buildBaseThriftedOrderItem(row, rowNumber);
    return addDuplicateErrorsToThriftedOrderItem(baseItem, rowNumber, tracking);
  });
}

/** Case-insensitive A–Z sort for category / subcategory / color dropdowns */
export function sortOptionsAlpha(values: readonly string[]): string[] {
  return [...values].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
}

const normBrandLetters = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

/** Whether typed letters appear in order inside the brand (e.g. "lv" → "Levi's"). */
function brandMatchesLetterSubsequence(brand: string, query: string): boolean {
  const b = normBrandLetters(brand);
  const q = normBrandLetters(query);
  if (!q) return true;
  let j = 0;
  for (let i = 0; i < b.length && j < q.length; i++) {
    if (b[i] === q[j]) j += 1;
  }
  return j === q.length;
}

/**
 * Brand typeahead: exact / starts-with / contains / letter-subsequence (punctuation ignored).
 * Prioritizes stronger matches first.
 */
export function filterBrandsByQuery(
  suggestions: readonly string[],
  query: string,
  limit = 40
): string[] {
  const uniq = [...new Set(suggestions.map((s) => s.trim()).filter(Boolean))];
  const q = query.trim();
  if (!q) {
    return sortOptionsAlpha(uniq).slice(0, limit);
  }
  const qLower = q.toLowerCase();
  const scored = uniq
    .map((brand) => {
      const l = brand.toLowerCase();
      let score = 0;
      if (l === qLower) score = 100;
      else if (l.startsWith(qLower)) score = 80;
      else if (l.includes(qLower)) score = 60;
      else if (brandMatchesLetterSubsequence(brand, q)) score = 40;
      else score = -1;
      return { brand, score };
    })
    .filter((x) => x.score >= 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.brand.localeCompare(b.brand, undefined, { sensitivity: 'base' })
    )
    .slice(0, limit)
    .map((x) => x.brand);
  return scored;
}

/** Letter sizes for store item size dropdowns (shown before numeric bands). */
const LETTER_SIZE_ORDER = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL'] as const;

function isAllDigitsSize(s: string): boolean {
  return /^\d+$/.test(s.trim());
}

function isOneSizeLabel(s: string): boolean {
  return s.trim().localeCompare('one size', undefined, { sensitivity: 'base' }) === 0;
}

function letterSizeIndex(s: string): number | null {
  const t = s.trim();
  const idx = LETTER_SIZE_ORDER.findIndex(
    (x) => x.localeCompare(t, undefined, { sensitivity: 'base' }) === 0
  );
  return idx >= 0 ? idx : null;
}

/**
 * Sort size options: letter sizes (XXS → XXL) first, then numeric sizes ascending, then "One size".
 */
export function sortStoreItemSizes(values: readonly string[]): string[] {
  return [...values].sort((a, b) => {
    const aOne = isOneSizeLabel(a);
    const bOne = isOneSizeLabel(b);
    if (aOne !== bOne) return aOne ? 1 : -1;

    const aNum = isAllDigitsSize(a);
    const bNum = isAllDigitsSize(b);
    if (aNum && bNum) return parseInt(a, 10) - parseInt(b, 10);
    if (aNum !== bNum) return aNum ? 1 : -1;

    const ia = letterSizeIndex(a);
    const ib = letterSizeIndex(b);
    if (ia !== null && ib !== null) return ia - ib;
    if (ia !== null) return -1;
    if (ib !== null) return 1;

    return a.localeCompare(b, undefined, { sensitivity: 'base' });
  });
}

/**
 * Compare store codes (e.g. AT0200, SE0038 vs SE0100): letter prefix A–Z, then numeric suffix.
 */
export function compareStoreCode(a: string, b: string): number {
  const re = /^([A-Za-z]+)(\d+)$/;
  const ma = a.trim().match(re);
  const mb = b.trim().match(re);
  if (ma && mb) {
    const pref = ma[1].localeCompare(mb[1], undefined, { sensitivity: 'base' });
    if (pref !== 0) return pref;
    return parseInt(ma[2], 10) - parseInt(mb[2], 10);
  }
  return a.localeCompare(b, undefined, { sensitivity: 'base', numeric: true });
}

export function sortStoresByCode<T extends { code: string }>(stores: readonly T[]): T[] {
  return [...stores].sort((x, y) => compareStoreCode(x.code, y.code));
}

/** Case-insensitive A–Z by `name` (brands, countries, partners, warehouses). */
export function sortByNameAlpha<T extends { name: string }>(items: readonly T[]): T[] {
  return [...items].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
  );
}

/**
 * Map subcategory to its parent category for Thrifted orders
 */
export function mapSubcategoryToCategory(subcategory: string): string | null {
  for (const [category, subcategories] of Object.entries(THRIFTED_VALID_VALUES.subcategories)) {
    if (subcategories.includes(subcategory)) {
      return category;
    }
  }
  return null;
}

/**
 * Get all subcategories for Thrifted orders (flattened list)
 */
export function getAllThriftedSubcategories(): string[] {
  return Object.values(THRIFTED_VALID_VALUES.subcategories).flat();
}

export function mapThriftedSubcategoryToCategory(
  subcategory: string,
  options: Pick<ReturnType<typeof getThriftedValidValues>, 'subcategories'>
): string | null {
  for (const [category, subcategories] of Object.entries(options.subcategories)) {
    if (subcategories.includes(subcategory)) {
      return category;
    }
  }
  return null;
}

export function getAllThriftedSubcategoriesForBrand(brandId?: string | null): string[] {
  return Object.values(getThriftedValidValues(brandId).subcategories).flat();
}

// Column definitions with mandatory flags
export const TEMPLATE_COLUMNS = [
  { key: 'itemId', label: 'Item ID*', mandatory: true },
  { key: 'retailerItemId', label: 'Retailer Item ID', mandatory: false },
  { key: 'brand', label: 'Item brand*', mandatory: true },
  { key: 'gender', label: 'Gender*', mandatory: true },
  { key: 'category', label: 'Category*', mandatory: true },
  { key: 'subcategory', label: 'Subcategory*', mandatory: true },
  { key: 'size', label: 'Size', mandatory: false },
  { key: 'color', label: 'Color*', mandatory: true },
  { key: 'price', label: 'Price (SEK)*', mandatory: true }
];

// Thrifted column definitions - partners only fill in subcategory, category is auto-mapped
export const THRIFTED_TEMPLATE_COLUMNS = [
  { key: 'sku', label: 'SKU*', mandatory: true },
  { key: 'retailerItemId', label: 'Retailer ID*', mandatory: true },
  { key: 'brand', label: 'Item brand*', mandatory: true },
  { key: 'subcategory', label: 'Subcategory*', mandatory: true },
  { key: 'size', label: 'Size*', mandatory: true },
  { key: 'color', label: 'Color*', mandatory: true },
  { key: 'gender', label: 'Gender*', mandatory: true },
  { key: 'price', label: 'Price (SEK)*', mandatory: true }
];

/**
 * Generate CSV template for bulk upload (Sellpy/regular partner)
 */
export function generateTemplateCSV(): string {
  const headers = TEMPLATE_COLUMNS.map(col => col.label).join(',');
  const exampleRow = 'THR-001,RET-001,H&M,Women,Clothing,Tops,M,Black,149';
  const validationRow = `# Valid values:
# Item brand: ${VALID_VALUES.brands.join(', ')}
# Gender: ${VALID_VALUES.genders.join(', ')}
# Category: ${VALID_VALUES.categories.join(', ')}
# Subcategory (Clothing): ${VALID_VALUES.subcategories.Clothing.join(', ')}
# Subcategory (Shoes): ${VALID_VALUES.subcategories.Shoes.join(', ')}
# Subcategory (Accessories): ${VALID_VALUES.subcategories.Accessories.join(', ')}
# Size: ${VALID_VALUES.sizes.join(', ')}
# Color: ${VALID_VALUES.colors.join(', ')}
# Price: ${VALID_VALUES.prices.join(', ')}
# Note: Retailer Item ID is optional but recommended`;
  
  return `${validationRow}\n\n${headers}\n${exampleRow}`;
}

/**
 * Generate CSV template for Thrifted bulk upload
 */
export function generateThriftedTemplateCSV(): string {
  const headers = THRIFTED_TEMPLATE_COLUMNS.map(col => col.label).join(',');
  const exampleRow = 'THR-001,RET-12345,Levi\'s,Tops,M,Blue,Women,150';
  const allSubcategories = getAllThriftedSubcategories();
  const validationRow = `# Thrifted Order Template - Valid values:
# Subcategory: ${allSubcategories.join(', ')}
# Gender: ${THRIFTED_VALID_VALUES.genders.join(', ')}
# Color: ${THRIFTED_VALID_VALUES.colors.join(', ')}
# Price (SEK): ${THRIFTED_VALID_VALUES.prices.join(', ')}
# Note: All fields marked with * are required (Retailer ID* and Price (SEK)* are mandatory)
# Note: Category is automatically mapped from Subcategory`;
  
  return `${validationRow}\n\n${headers}\n${exampleRow}`;
}

/**
 * Download CSV file
 */
export function downloadCSV(content: string, filename: string = 'thrifted-order-template.csv'): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Parse CSV content to array of objects
 */
export function parseCSV(content: string): Array<Record<string, string>> {
  const lines = content.split('\n').filter(line => {
    const trimmed = line.trim();
    return trimmed && !trimmed.startsWith('#');
  });
  
  if (lines.length < 2) {
    throw new Error('CSV file must contain headers and at least one data row');
  }
  
  const headers = lines[0].split(',').map(h => h.trim().replace('*', ''));
  const rows: Array<Record<string, string>> = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const row: Record<string, string> = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    
    rows.push(row);
  }
  
  return rows;
}

/**
 * Validate a single item against dropdown values
 */
export function validateItemData(item: Record<string, string>, rowNumber: number): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Required field validation
  if (!item['Item ID']?.trim()) {
    errors.push(`Row ${rowNumber}: Item ID is required`);
  }
  
  const brandValue = item['Brand']?.trim() || item['Item brand']?.trim() || item['Item brand*']?.trim();
  if (!brandValue) {
    errors.push(`Row ${rowNumber}: Item brand is required`);
  } else if (!VALID_VALUES.brands.includes(brandValue)) {
    errors.push(`Row ${rowNumber}: Invalid Item brand "${brandValue}". Must be one of: ${VALID_VALUES.brands.join(', ')}`);
  }
  
  if (!item['Gender']?.trim()) {
    errors.push(`Row ${rowNumber}: Gender is required`);
  } else if (!VALID_VALUES.genders.includes(item['Gender'].trim())) {
    errors.push(`Row ${rowNumber}: Invalid Gender "${item['Gender']}". Must be one of: ${VALID_VALUES.genders.join(', ')}`);
  }
  
  if (!item['Category']?.trim()) {
    errors.push(`Row ${rowNumber}: Category is required`);
  } else if (!VALID_VALUES.categories.includes(item['Category'].trim())) {
    errors.push(`Row ${rowNumber}: Invalid Category "${item['Category']}". Must be one of: ${VALID_VALUES.categories.join(', ')}`);
  }
  
  if (!item['Subcategory']?.trim()) {
    errors.push(`Row ${rowNumber}: Subcategory is required`);
  } else if (item['Category'] && VALID_VALUES.subcategories[item['Category'] as keyof typeof VALID_VALUES.subcategories]) {
    const validSubcategories = VALID_VALUES.subcategories[item['Category'] as keyof typeof VALID_VALUES.subcategories];
    if (!validSubcategories.includes(item['Subcategory'].trim())) {
      errors.push(`Row ${rowNumber}: Invalid Subcategory "${item['Subcategory']}" for ${item['Category']}. Must be one of: ${validSubcategories.join(', ')}`);
    }
  }
  
  // Size is optional but validate if provided
  if (item['Size']?.trim() && !VALID_VALUES.sizes.includes(item['Size'].trim())) {
    errors.push(`Row ${rowNumber}: Invalid Size "${item['Size']}". Must be one of: ${VALID_VALUES.sizes.join(', ')}`);
  }
  
  if (!item['Color']?.trim()) {
    errors.push(`Row ${rowNumber}: Color is required`);
  } else if (!VALID_VALUES.colors.includes(item['Color'].trim())) {
    errors.push(`Row ${rowNumber}: Invalid Color "${item['Color']}". Must be one of: ${VALID_VALUES.colors.join(', ')}`);
  }
  
  if (!item['Price (SEK)']?.trim()) {
    errors.push(`Row ${rowNumber}: Price is required`);
  } else {
    const price = parseFloat(item['Price (SEK)']);
    if (isNaN(price) || price <= 0) {
      errors.push(`Row ${rowNumber}: Price must be a positive number`);
    }
    if (!VALID_VALUES.prices.includes(price)) {
      errors.push(`Row ${rowNumber}: Invalid Price "${price}". Must be one of: ${VALID_VALUES.prices.join(', ')}`);
    }
  }
  
  return { valid: errors.length === 0, errors };
}

/**
 * Convert CSV rows to OrderItems with validation
 */
export function convertToOrderItems(csvRows: Array<Record<string, string>>): { items: OrderItem[]; errors: string[] } {
  const items: OrderItem[] = [];
  const allErrors: string[] = [];
  
  csvRows.forEach((row, index) => {
    const rowNumber = index + 2; // +2 because row 1 is headers and we're 0-indexed
    const validation = validateItemData(row, rowNumber);
    
    const item: OrderItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      itemId: row['Item ID']?.trim() || '',
      retailerItemId: row['Retailer Item ID']?.trim() || undefined,
      brand: (row['Brand']?.trim() || row['Item brand']?.trim() || row['Item brand*']?.trim()) || '',
      gender: row['Gender']?.trim() || '',
      category: row['Category']?.trim() || '',
      subcategory: row['Subcategory']?.trim() || '',
      size: row['Size']?.trim() || '',
      color: row['Color']?.trim() || '',
      price: parseFloat(row['Price (SEK)']) || 0,
      status: validation.valid ? undefined : 'error',
      errors: validation.errors,
      source: 'excel',
      partnerItemId: row['Item ID']?.trim() || '' // Use Item ID as partner item ID for Thrifted
    };
    
    items.push(item);
    if (!validation.valid) {
      allErrors.push(...validation.errors);
    }
  });
  
  return { items, errors: allErrors };
}

/**
 * Validate Thrifted item data
 * For Thrifted, partners only fill in subcategory, category is auto-mapped
 */
export function validateThriftedItemData(item: Record<string, string>, rowNumber: number): { 
  valid: boolean; 
  errors: string[];
  fieldErrors: Record<string, string>;
} {
  const errors: string[] = [];
  const fieldErrors: Record<string, string> = {};
  
  // Required field validation - SKU
  if (!item['SKU']?.trim()) {
    const error = 'SKU is required';
    errors.push(`Row ${rowNumber}: ${error}`);
    fieldErrors.sku = error;
  }
  
  // Required field validation - Retailer ID (mandatory)
  if (!item['Retailer ID*']?.trim() && !item['Retailer ID']?.trim()) {
    const error = 'Retailer ID is required';
    errors.push(`Row ${rowNumber}: ${error}`);
    fieldErrors.retailerItemId = error;
  }
  
  // Required field validation - Item brand
  const brandValue = item['Brand*']?.trim() || item['Brand']?.trim() || item['Item brand*']?.trim() || item['Item brand']?.trim();
  if (!brandValue) {
    const error = 'Item brand is required';
    errors.push(`Row ${rowNumber}: ${error}`);
    fieldErrors.brand = error;
  }
  
  // Required field validation - Subcategory (partners fill this, category is auto-mapped)
  const subcategory = item['Subcategory*']?.trim() || item['Subcategory']?.trim();
  if (!subcategory) {
    const error = 'Subcategory is required';
    errors.push(`Row ${rowNumber}: ${error}`);
    fieldErrors.subcategory = error;
  } else {
    const allSubcategories = getAllThriftedSubcategories();
    if (!allSubcategories.includes(subcategory)) {
      const error = `Invalid subcategory. Must be one of: ${allSubcategories.join(', ')}`;
      errors.push(`Row ${rowNumber}: ${error}`);
      fieldErrors.subcategory = error;
    } else {
      // Auto-map subcategory to category
      const mappedCategory = mapSubcategoryToCategory(subcategory);
      if (!mappedCategory) {
        const error = `Subcategory "${subcategory}" does not map to a valid category`;
        errors.push(`Row ${rowNumber}: ${error}`);
        fieldErrors.subcategory = error;
      }
    }
  }
  
  // Required field validation - Size
  if (!item['Size*']?.trim() && !item['Size']?.trim()) {
    const error = 'Size is required';
    errors.push(`Row ${rowNumber}: ${error}`);
    fieldErrors.size = error;
  }
  
  // Required field validation - Color
  const color = item['Color*']?.trim() || item['Color']?.trim();
  if (!color) {
    const error = 'Color is required';
    errors.push(`Row ${rowNumber}: ${error}`);
    fieldErrors.color = error;
  } else if (!THRIFTED_VALID_VALUES.colors.includes(color)) {
    const error = `Invalid color. Must be one of: ${THRIFTED_VALID_VALUES.colors.join(', ')}`;
    errors.push(`Row ${rowNumber}: ${error}`);
    fieldErrors.color = error;
  }
  
  // Required field validation - Gender
  const gender = item['Gender*']?.trim() || item['Gender']?.trim();
  if (!gender) {
    const error = 'Gender is required';
    errors.push(`Row ${rowNumber}: ${error}`);
    fieldErrors.gender = error;
  } else if (!THRIFTED_VALID_VALUES.genders.includes(gender)) {
    const error = `Invalid gender. Must be one of: ${THRIFTED_VALID_VALUES.genders.join(', ')}`;
    errors.push(`Row ${rowNumber}: ${error}`);
    fieldErrors.gender = error;
  }
  
  // Required field validation - Price (mandatory)
  const priceStr = item['Price (SEK)*']?.trim() || item['Price (SEK)']?.trim();
  if (!priceStr) {
    const error = 'Price is required';
    errors.push(`Row ${rowNumber}: ${error}`);
    fieldErrors.price = error;
  } else {
    const price = parseFloat(priceStr);
    if (isNaN(price) || price <= 0) {
      const error = 'Price must be a positive number';
      errors.push(`Row ${rowNumber}: ${error}`);
      fieldErrors.price = error;
    } else if (!THRIFTED_VALID_VALUES.prices.includes(price)) {
      const error = `Invalid price. Must be one of: ${THRIFTED_VALID_VALUES.prices.join(', ')}`;
      errors.push(`Row ${rowNumber}: ${error}`);
      fieldErrors.price = error;
    }
  }
  
  return { valid: errors.length === 0, errors, fieldErrors };
}

/**
 * Convert CSV rows to Thrifted OrderItems with validation
 * Auto-maps subcategory to category
 */
export function convertToThriftedOrderItems(
  csvRows: Array<Record<string, string>>,
  options: Pick<ThriftedImportOptions, 'existingItems' | 'chunkSize'> = {}
): Pick<ThriftedImportResult, 'items' | 'errors' | 'summary' | 'duplicates'> {
  const chunkSize = options.chunkSize ?? THRIFTED_IMPORT_CHUNK_SIZE;
  const items = buildThriftedImportItems(csvRows, options.existingItems ?? []);
  const snapshot = summarizeThriftedImport(items, csvRows.length, chunkSize);

  return {
    items,
    errors: snapshot.errors,
    summary: snapshot.summary,
    duplicates: snapshot.duplicates,
  };
}

/**
 * Mock the eventual backend import behavior while keeping all processing client-side.
 * Splits rows into 1,000-row chunks, emits determinate progress, and returns one
 * combined result object for the UI.
 */
export async function processMockThriftedImport(
  csvRows: Array<Record<string, string>>,
  options: ThriftedImportOptions = {}
): Promise<ThriftedImportResult> {
  const chunkSize = options.chunkSize ?? THRIFTED_IMPORT_CHUNK_SIZE;
  const existingItems = options.existingItems ?? [];
  const tracking = createDuplicateTrackingContext(existingItems);
  const items: OrderItem[] = [];

  options.onProgress?.(createProgressSnapshot(0, csvRows.length, chunkSize));

  for (let start = 0; start < csvRows.length; start += chunkSize) {
    const chunk = csvRows.slice(start, start + chunkSize);

    chunk.forEach((row, index) => {
      const rowNumber = start + index + 2;
      const baseItem = buildBaseThriftedOrderItem(row, rowNumber);
      items.push(addDuplicateErrorsToThriftedOrderItem(baseItem, rowNumber, tracking));
    });

    const processedRows = Math.min(start + chunk.length, csvRows.length);
    options.onProgress?.(createProgressSnapshot(processedRows, csvRows.length, chunkSize));

    if (processedRows < csvRows.length) {
      await new Promise<void>((resolve) => {
        setTimeout(resolve, 0);
      });
    }
  }

  const snapshot = summarizeThriftedImport(items, csvRows.length, chunkSize);

  return {
    items,
    errors: snapshot.errors,
    summary: snapshot.summary,
    duplicates: snapshot.duplicates,
    progress: createProgressSnapshot(csvRows.length, csvRows.length, chunkSize),
    existingOrderConflictsIncluded: existingItems.length > 0,
  };
}

/**
 * Export order items to CSV
 */
export function exportItemsToCSV(items: OrderItem[]): string {
  const headers = TEMPLATE_COLUMNS.map(col => col.label).join(',');
  const rows = items.map(item => {
    return [
      item.itemId,
      item.retailerItemId || '',
      item.brand,
      item.gender,
      item.category,
      item.subcategory,
      item.size || '',
      item.color,
      item.price.toString()
    ].join(',');
  });
  
  return `${headers}\n${rows.join('\n')}`;
}

/**
 * Export Thrifted order items to CSV
 * Exports subcategory (not category) since that's what partners fill in
 */
export function exportThriftedItemsToCSV(items: OrderItem[]): string {
  const headers = THRIFTED_TEMPLATE_COLUMNS.map(col => col.label).join(',');
  const rows = items.map(item => {
    return [
      item.sku || item.itemId || '',
      item.retailerItemId || '',
      item.brand || '',
      item.subcategory || '', // Export subcategory, not category
      item.size || '',
      item.color || '',
      item.gender || '',
      item.price.toString()
    ].join(',');
  });
  
  return `${headers}\n${rows.join('\n')}`;
}

/**
 * Export return items to CSV
 * Uses standard format with all item details
 */
export function exportReturnItemsToCSV(items: OrderItem[]): string {
  const headers = TEMPLATE_COLUMNS.map(col => col.label).join(',');
  const rows = items.map(item => {
    return [
      item.partnerItemId || item.itemId || '',
      item.retailerItemId || '',
      item.brand || '',
      item.gender || '',
      item.category || '',
      item.subcategory || '',
      item.size || '',
      item.color || '',
      item.price.toString()
    ].join(',');
  });
  
  return `${headers}\n${rows.join('\n')}`;
}
