import { OrderItem } from '../components/OrderCreationScreen';

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
export const THRIFTED_VALID_VALUES = {
  categories: ['Clothing', 'Shoes', 'Accessories', 'Other'],
  genders: ['Women', 'Men', 'Kids', 'Unisex'],
  prices: [50, 75, 100, 120, 150, 200, 250, 300, 400, 500, 600, 750, 1000, 1200, 1500, 2000],
  colors: ['Black', 'White', 'Gray', 'Navy', 'Blue', 'Red', 'Pink', 'Green', 'Yellow', 'Brown', 'Beige', 'Purple', 'Orange', 'Silver', 'Gold', 'Multicolor']
};

// Column definitions with mandatory flags
export const TEMPLATE_COLUMNS = [
  { key: 'itemId', label: 'Item ID*', mandatory: true },
  { key: 'retailerItemId', label: 'Retailer Item ID', mandatory: false },
  { key: 'brand', label: 'Brand*', mandatory: true },
  { key: 'gender', label: 'Gender*', mandatory: true },
  { key: 'category', label: 'Category*', mandatory: true },
  { key: 'subcategory', label: 'Subcategory*', mandatory: true },
  { key: 'size', label: 'Size', mandatory: false },
  { key: 'color', label: 'Color*', mandatory: true },
  { key: 'price', label: 'Price (SEK)*', mandatory: true }
];

// Thrifted column definitions
export const THRIFTED_TEMPLATE_COLUMNS = [
  { key: 'sku', label: 'SKU*', mandatory: true },
  { key: 'retailerItemId', label: 'Retailer ID*', mandatory: true },
  { key: 'brand', label: 'Brand*', mandatory: true },
  { key: 'category', label: 'Category*', mandatory: true },
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
# Brand: ${VALID_VALUES.brands.join(', ')}
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
  const exampleRow = 'THR-001,RET-12345,Levi\'s,Clothing,M,Blue,Women,150';
  const validationRow = `# Thrifted Order Template - Valid values:
# Category: ${THRIFTED_VALID_VALUES.categories.join(', ')}
# Gender: ${THRIFTED_VALID_VALUES.genders.join(', ')}
# Color: ${THRIFTED_VALID_VALUES.colors.join(', ')}
# Price: ${THRIFTED_VALID_VALUES.prices.join(', ')}
# Note: All fields marked with * are required`;
  
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
  
  if (!item['Brand']?.trim()) {
    errors.push(`Row ${rowNumber}: Brand is required`);
  } else if (!VALID_VALUES.brands.includes(item['Brand'].trim())) {
    errors.push(`Row ${rowNumber}: Invalid Brand "${item['Brand']}". Must be one of: ${VALID_VALUES.brands.join(', ')}`);
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
      brand: row['Brand']?.trim() || '',
      gender: row['Gender']?.trim() || '',
      category: row['Category']?.trim() || '',
      subcategory: row['Subcategory']?.trim() || '',
      size: row['Size']?.trim() || '',
      color: row['Color']?.trim() || '',
      price: parseFloat(row['Price (SEK)']) || 0,
      status: validation.valid ? 'valid' : 'error',
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
 */
export function validateThriftedItemData(item: Record<string, string>, rowNumber: number): { 
  valid: boolean; 
  errors: string[];
  fieldErrors: Record<string, string>;
} {
  const errors: string[] = [];
  const fieldErrors: Record<string, string> = {};
  
  // Required field validation
  if (!item['SKU']?.trim()) {
    const error = 'SKU is required';
    errors.push(`Row ${rowNumber}: ${error}`);
    fieldErrors.sku = error;
  }
  
  if (!item['Retailer ID']?.trim()) {
    const error = 'Retailer ID is required';
    errors.push(`Row ${rowNumber}: ${error}`);
    fieldErrors.retailerItemId = error;
  }
  
  if (!item['Brand']?.trim()) {
    const error = 'Brand is required';
    errors.push(`Row ${rowNumber}: ${error}`);
    fieldErrors.brand = error;
  }
  
  if (!item['Category']?.trim()) {
    const error = 'Category is required';
    errors.push(`Row ${rowNumber}: ${error}`);
    fieldErrors.category = error;
  } else if (!THRIFTED_VALID_VALUES.categories.includes(item['Category'].trim())) {
    const error = `Invalid category. Must be one of: ${THRIFTED_VALID_VALUES.categories.join(', ')}`;
    errors.push(`Row ${rowNumber}: ${error}`);
    fieldErrors.category = error;
  }
  
  if (!item['Size']?.trim()) {
    const error = 'Size is required';
    errors.push(`Row ${rowNumber}: ${error}`);
    fieldErrors.size = error;
  }
  
  if (!item['Color']?.trim()) {
    const error = 'Color is required';
    errors.push(`Row ${rowNumber}: ${error}`);
    fieldErrors.color = error;
  } else if (!THRIFTED_VALID_VALUES.colors.includes(item['Color'].trim())) {
    const error = `Invalid color. Must be one of: ${THRIFTED_VALID_VALUES.colors.join(', ')}`;
    errors.push(`Row ${rowNumber}: ${error}`);
    fieldErrors.color = error;
  }
  
  // Gender is required
  if (!item['Gender*']?.trim()) {
    const error = 'Gender is required';
    errors.push(`Row ${rowNumber}: ${error}`);
    fieldErrors.gender = error;
  } else if (!THRIFTED_VALID_VALUES.genders.includes(item['Gender*'].trim())) {
    const error = `Invalid gender. Must be one of: ${THRIFTED_VALID_VALUES.genders.join(', ')}`;
    errors.push(`Row ${rowNumber}: ${error}`);
    fieldErrors.gender = error;
  }
  
  if (!item['Price (SEK)']?.trim()) {
    const error = 'Price is required';
    errors.push(`Row ${rowNumber}: ${error}`);
    fieldErrors.price = error;
  } else {
    const price = parseFloat(item['Price (SEK)']);
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
 */
export function convertToThriftedOrderItems(csvRows: Array<Record<string, string>>): { items: OrderItem[]; errors: string[] } {
  const items: OrderItem[] = [];
  const allErrors: string[] = [];
  
  csvRows.forEach((row, index) => {
    const rowNumber = index + 2; // +2 because row 1 is headers and we're 0-indexed
    const validation = validateThriftedItemData(row, rowNumber);
    
    const item: OrderItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      itemId: row['SKU']?.trim() || '',
      sku: row['SKU']?.trim() || '',
      retailerItemId: row['Retailer ID*']?.trim() || '',
      brand: row['Brand*']?.trim() || '',
      category: row['Category*']?.trim() || '',
      subcategory: '',
      size: row['Size*']?.trim() || '',
      color: row['Color*']?.trim() || '',
      gender: row['Gender*']?.trim() || '',
      price: parseFloat(row['Price (SEK)*']) || 0,
      status: validation.valid ? 'valid' : 'error',
      errors: validation.errors,
      fieldErrors: validation.fieldErrors,
      source: 'excel'
    };
    
    items.push(item);
    if (!validation.valid) {
      allErrors.push(...validation.errors);
    }
  });
  
  return { items, errors: allErrors };
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
 */
export function exportThriftedItemsToCSV(items: OrderItem[]): string {
  const headers = THRIFTED_TEMPLATE_COLUMNS.map(col => col.label).join(',');
  const rows = items.map(item => {
    return [
      item.sku || item.itemId || '',
      item.retailerItemId || '',
      item.brand,
      item.category,
      item.size || '',
      item.color,
      item.gender || '',
      item.price.toString()
    ].join(',');
  });
  
  return `${headers}\n${rows.join('\n')}`;
}
