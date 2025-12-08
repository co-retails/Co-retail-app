import { useState, useEffect } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ItemCard, BaseItem } from './ItemCard';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { AlertCircleIcon, Package, Trash2Icon } from 'lucide-react';
import ItemDetailsDialog, { ItemDetails, StatusHistoryEntry } from './ItemDetailsDialog';
import { OrderItem } from './OrderCreationScreen';
import { getPriceOptionsForCurrency } from '../data/partnerPricing';

export interface ItemDetailsTableItem extends OrderItem {
  id: string;
  status?: 'pending' | 'scanned' | 'error';
  purchasePrice?: number;
  imageUrl?: string;
  errors?: string[];
  fieldErrors?: Record<string, string>; // Field-specific error messages
  date?: string; // Date for display in item cards
  sku?: string; // SKU/partner item ID
  statusHistory?: StatusHistoryEntry[];
}

interface ItemDetailsTableProps {
  items: ItemDetailsTableItem[];
  showRetailerId?: boolean;
  showPrice?: boolean;
  showPurchasePrice?: boolean;
  showMargin?: boolean; // Show margin % per item row
  showStatus?: boolean;
  isEditable?: boolean;
  onUpdateItem?: (itemId: string, field: keyof ItemDetailsTableItem, value: any) => void;
  onDeleteItem?: (itemId: string) => void;
  subcategoryOptions?: string[]; // Custom subcategory options (e.g., for conditions)
  subcategoryLabel?: string; // Custom label for subcategory column
  brandAsInput?: boolean; // Use text input instead of dropdown for brand
  categoryOptions?: string[]; // Custom category options
  hideCategoryForThrifted?: boolean; // Hide category column for Thrifted orders (category is auto-mapped from subcategory)
  subcategoriesByCategory?: Record<string, string[]>; // Map of category to subcategories for cascading dropdown
  partnerId?: string; // Partner ID for price lookup
  countryName?: string; // Country name for currency lookup
  currency?: string; // Currency code (if known, otherwise derived from country)
  orderStatus?: string; // Order status to pass to item cards for status display
  isAdmin?: boolean; // Whether user is admin (for purchase price and margin visibility)
}

// Dropdown options for editable attributes
const BRAND_OPTIONS = ['WEEKDAY', 'COS', 'Monki', 'H&M', '& Other Stories', 'Arket'];
const CATEGORY_OPTIONS = ['Clothing', 'Shoes', 'Accessories', 'Bags'];
const SUBCATEGORY_OPTIONS = ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Sneakers', 'Boots', 'Sandals', 'Bags', 'Scarves', 'Jewelry'];
const COLOR_OPTIONS = ['Black', 'White', 'Blue', 'Red', 'Gray', 'Green', 'Navy', 'Beige', 'Brown', 'Pink', 'Yellow', 'Purple'];
const SIZE_OPTIONS = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '34', '36', '37', '38', '39', '40', '41', '42', '43', '44'];

export function ItemDetailsTable({
  items,
  showRetailerId = true,
  showPrice = false,
  showPurchasePrice = false,
  showMargin = false,
  showStatus = false,
  isEditable = false,
  onUpdateItem,
  onDeleteItem,
  subcategoryOptions = SUBCATEGORY_OPTIONS,
  subcategoryLabel = 'Subcategory',
  brandAsInput = false,
  categoryOptions = CATEGORY_OPTIONS,
  hideCategoryForThrifted = false,
  subcategoriesByCategory,
  partnerId,
  countryName,
  currency,
  orderStatus,
  isAdmin = false,
}: ItemDetailsTableProps) {
  const [mobileDetailsItem, setMobileDetailsItem] = useState<ItemDetailsTableItem | null>(null);
  const detailFieldMap: Partial<Record<keyof ItemDetails, keyof ItemDetailsTableItem>> = {
    brand: 'brand',
    category: 'category',
    subcategory: 'subcategory',
    size: 'size',
    color: 'color',
    price: 'price',
    status: 'status',
    itemId: 'retailerItemId'
  };

  const mapToItemDetails = (item: ItemDetailsTableItem): ItemDetails => ({
    id: item.id,
    itemId: (item.retailerItemId || item.itemId || item.partnerItemId || '') as string,
    title: (item.partnerItemId || item.itemId || item.brand || 'Item') as string,
    brand: item.brand || '',
    category: item.category || '',
    subcategory: item.subcategory,
    size: item.size,
    color: item.color,
    price: item.price || 0,
    status: item.status || 'Pending',
    date: (item.date || new Date().toISOString().split('T')[0]) as string,
    deliveryId: (item as any).deliveryId,
    thumbnail: item.imageUrl
  });

  const handleMobileDetailsSave = (itemId: string, updates: Partial<ItemDetails>) => {
    if (!mobileDetailsItem) return;
    const updatedItem = { ...mobileDetailsItem };

    (Object.entries(updates) as [keyof ItemDetails, ItemDetails[keyof ItemDetails]][]).forEach(([key, value]) => {
      const mappedField = detailFieldMap[key];
      if (!mappedField || value === undefined) return;
      (updatedItem as any)[mappedField] = value;
      onUpdateItem?.(itemId, mappedField, value);
    });

    setMobileDetailsItem(updatedItem);
  };

  useEffect(() => {
    if (!mobileDetailsItem) return;
    const latest = items.find((item) => item.id === mobileDetailsItem.id);
    if (latest) {
      setMobileDetailsItem(latest);
    }
  }, [items, mobileDetailsItem?.id]);

  // Get price options based on partner, brand, and currency
  // For now, we'll use the first item's brand to determine price options
  // In a real implementation, this might need to be per-item
  const firstItemBrand = items[0]?.brand;
  const priceOptions = partnerId && currency
    ? getPriceOptionsForCurrency(partnerId, firstItemBrand, currency)
    : [];
  
  const displayCurrency = currency || 'SEK'; // Default to SEK if not provided
  return (
    <>
      {/* Mobile View - Cards */}
      <div className="md:hidden space-y-2">
        {items.map((item) => {
          const hasError = item.status === 'error';
          const errorFields = Object.entries(item.fieldErrors || {});
          const baseItem: BaseItem = {
            id: item.id,
            brand: item.brand || '—',
            category: item.category || '',
            subcategory: item.subcategory || '',
            size: item.size,
            color: item.color,
            price: item.price || 0,
            purchasePrice: item.purchasePrice,
            partnerItemId: item.partnerItemId || item.sku || item.itemId,
            retailerItemId: item.retailerItemId,
            thumbnail: item.imageUrl,
            status: item.status,
            date: item.date || new Date().toISOString().split('T')[0], // Add date for display
            errors: hasError ? errorFields.map(([field, message]) => `${field}: ${message}`) : undefined,
            currency: displayCurrency
          };

          const marginValue = showMargin && item.price && item.purchasePrice
            ? ((item.price - item.purchasePrice) / item.price) * 100
            : undefined;

          return (
            <ItemCard
              key={item.id}
              item={baseItem}
              variant="order-details"
              onClick={() => setMobileDetailsItem(item)}
              showActions={false}
              showSelection={false}
              orderDetailsConfig={{
                partnerLabel: 'External ID',
                retailerLabel: 'Item ID*',
                showPartnerId: true,
                showRetailerId: showRetailerId,
                showCategory: !hideCategoryForThrifted,
                showSubcategory: true,
                showSize: true,
                showColor: true,
                showPrice,
                showPurchasePrice: isAdmin && showPurchasePrice,
                showMargin: isAdmin && showMargin,
                currency: displayCurrency,
                marginValue,
                orderStatus,
                isAdmin,
                extraFields: showStatus ? [{
                  label: 'Status',
                  value: item.status
                }] : undefined,
                errorMessages: hasError ? errorFields.map(([field, message]) => `${field}: ${message}`) : undefined
              }}
            />
          );
        })}
      </div>

      {/* Desktop View - Table */}
      <div className="hidden md:block border border-outline-variant rounded-lg overflow-hidden bg-surface">
      <table className="w-full">
        <thead className="bg-surface-container">
          <tr className="border-b border-outline-variant">
            <th className="px-4 py-3 text-left">
              <span className="label-medium text-on-surface">Image</span>
            </th>
            {showRetailerId && (
              <th className="px-4 py-3 text-left">
                <span className="label-medium text-on-surface">Item ID*</span>
              </th>
            )}
            <th className="px-4 py-3 text-left">
              <span className="label-medium text-on-surface">External ID</span>
            </th>
            <th className="px-4 py-3 text-left">
              <span className="label-medium text-on-surface">Item brand</span>
            </th>
            {!hideCategoryForThrifted && (
              <th className="px-4 py-3 text-left">
                <span className="label-medium text-on-surface">Category</span>
              </th>
            )}
            <th className="px-4 py-3 text-left">
              <span className="label-medium text-on-surface">{subcategoryLabel}</span>
            </th>
            <th className="px-4 py-3 text-left">
              <span className="label-medium text-on-surface">Size</span>
            </th>
            <th className="px-4 py-3 text-left">
              <span className="label-medium text-on-surface">Color</span>
            </th>
            {showPurchasePrice && (
              <th className="px-4 py-3 text-right">
                <span className="label-medium text-on-surface">Purchase Price</span>
              </th>
            )}
            {showPrice && (
              <th className="px-4 py-3 text-right">
                <span className="label-medium text-on-surface">Price ({displayCurrency})*</span>
              </th>
            )}
            {showMargin && (
              <th className="px-4 py-3 text-right">
                <span className="label-medium text-on-surface">Margin %</span>
              </th>
            )}
            {showStatus && (
              <th className="px-4 py-3 text-center">
                <span className="label-medium text-on-surface">Status</span>
              </th>
            )}
            {isEditable && onDeleteItem && (
              <th className="px-4 py-3 text-right">
                <span className="label-medium text-on-surface">Actions</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-surface">
          {items.map((item, index) => {
            const hasError = item.status === 'error';
            return (
            <tr 
              key={item.id}
              className={`${index !== items.length - 1 ? 'border-b border-outline-variant' : ''} ${hasError ? 'bg-error-container/10' : 'hover:bg-surface-container/50'} transition-colors`}
            >
              {/* Image */}
              <td className="px-4 py-3">
                <div className="w-12 h-12 rounded overflow-hidden bg-surface-container flex items-center justify-center">
                  <ImageWithFallback
                    src={item.imageUrl}
                    alt={`${item.brand} ${item.category}`}
                    className="w-full h-full object-cover"
                    fallback={<Package className="w-5 h-5 text-on-surface-variant/60" />}
                  />
                </div>
              </td>

              {/* Retailer ID */}
              {showRetailerId && (
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {isEditable && onUpdateItem ? (
                      <Input
                        value={item.retailerItemId || ''}
                        onChange={(e) => onUpdateItem(item.id, 'retailerItemId', e.target.value)}
                        placeholder="Enter Item ID*"
                        className={`h-9 w-full body-medium ${
                          item.fieldErrors?.retailerItemId 
                            ? 'border-error focus:border-error bg-error-container/10' 
                            : 'border-outline-variant focus:border-primary bg-surface-container'
                        }`}
                      />
                    ) : (
                      item.retailerItemId ? (
                        <span className="body-medium text-on-surface">{item.retailerItemId}</span>
                      ) : (
                        <span className="body-medium text-on-surface-variant">—</span>
                      )
                    )}
                    {item.fieldErrors?.retailerItemId && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <AlertCircleIcon className="w-4 h-4 text-error flex-shrink-0" />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="bg-error-container text-on-error-container">
                            <p className="body-small">{item.fieldErrors.retailerItemId}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </td>
              )}

              {/* External ID */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  {isEditable && onUpdateItem && brandAsInput ? (
                    <Input
                      value={item.partnerItemId || ''}
                      onChange={(e) => onUpdateItem(item.id, 'partnerItemId', e.target.value)}
                      placeholder="Enter SKU"
                      className={`h-9 w-full body-medium ${
                        item.fieldErrors?.partnerItemId || item.fieldErrors?.sku
                          ? 'border-error focus:border-error bg-error-container/10' 
                          : 'border-outline-variant focus:border-primary bg-surface-container'
                      }`}
                    />
                  ) : (
                    <span className="body-medium text-on-surface">{item.partnerItemId || '—'}</span>
                  )}
                  {(item.fieldErrors?.partnerItemId || item.fieldErrors?.sku) && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <AlertCircleIcon className="w-4 h-4 text-error flex-shrink-0" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="bg-error-container text-on-error-container">
                          <p className="body-small">{item.fieldErrors?.partnerItemId || item.fieldErrors?.sku}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </td>

              {/* Brand */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  {isEditable && onUpdateItem ? (
                    brandAsInput ? (
                      <Input
                        value={item.brand || ''}
                        onChange={(e) => onUpdateItem(item.id, 'brand', e.target.value)}
                        placeholder="Enter item brand"
                        className={`h-9 w-full body-medium ${
                          item.fieldErrors?.brand 
                            ? 'border-error focus:border-error bg-error-container/10' 
                            : 'border-outline-variant focus:border-primary bg-surface-container'
                        }`}
                      />
                    ) : (
                      <Select
                        value={item.brand || undefined}
                        onValueChange={(value) => onUpdateItem(item.id, 'brand', value)}
                      >
                        <SelectTrigger className={`h-9 w-full body-medium ${
                          item.fieldErrors?.brand 
                            ? 'border-error focus:border-error bg-error-container/10' 
                            : 'border-outline-variant focus:border-primary bg-surface-container'
                        }`}>
                          <SelectValue placeholder="Select item brand" />
                        </SelectTrigger>
                        <SelectContent>
                          {BRAND_OPTIONS.map((brand) => (
                            <SelectItem key={brand} value={brand} className="body-medium">
                              {brand}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )
                  ) : (
                    <span className="body-medium text-on-surface">{item.brand}</span>
                  )}
                  {item.fieldErrors?.brand && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <AlertCircleIcon className="w-4 h-4 text-error flex-shrink-0" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="bg-error-container text-on-error-container">
                          <p className="body-small">{item.fieldErrors.brand}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </td>

              {/* Category - Show for cascading dropdown (required before subcategory) */}
              {!hideCategoryForThrifted && (
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {isEditable && onUpdateItem ? (
                      <Select
                        value={item.category || undefined}
                        onValueChange={(value) => {
                          // When category changes, clear subcategory if it's not valid for the new category
                          onUpdateItem(item.id, 'category', value);
                          if (subcategoriesByCategory && item.subcategory) {
                            const validSubcategories = subcategoriesByCategory[value] || [];
                            if (!validSubcategories.includes(item.subcategory)) {
                              onUpdateItem(item.id, 'subcategory', '');
                            }
                          }
                        }}
                      >
                        <SelectTrigger className={`h-9 w-full body-medium ${
                          item.fieldErrors?.category 
                            ? 'border-error focus:border-error bg-error-container/10' 
                            : 'border-outline-variant focus:border-primary bg-surface-container'
                        }`}>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categoryOptions.map((category) => (
                            <SelectItem key={category} value={category} className="body-medium">
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="body-medium text-on-surface">{item.category}</span>
                    )}
                    {item.fieldErrors?.category && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <AlertCircleIcon className="w-4 h-4 text-error flex-shrink-0" />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="bg-error-container text-on-error-container">
                            <p className="body-small">{item.fieldErrors.category}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </td>
              )}

              {/* Subcategory - Cascading dropdown (requires category selection first) */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  {isEditable && onUpdateItem ? (
                    <Select
                      value={item.subcategory || undefined}
                      onValueChange={(value) => onUpdateItem(item.id, 'subcategory', value)}
                      disabled={!item.category && !!subcategoriesByCategory}
                    >
                      <SelectTrigger className={`h-9 w-full body-medium ${
                        item.fieldErrors?.subcategory 
                          ? 'border-error focus:border-error bg-error-container/10' 
                          : 'border-outline-variant focus:border-primary bg-surface-container'
                      } ${!item.category && subcategoriesByCategory ? 'opacity-50' : ''}`}>
                        <SelectValue placeholder={
                          !item.category && subcategoriesByCategory 
                            ? `Select category first` 
                            : `Select ${subcategoryLabel.toLowerCase()}`
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {(() => {
                          // If subcategoriesByCategory is provided, filter by selected category
                          if (subcategoriesByCategory && item.category) {
                            const validSubcategories = subcategoriesByCategory[item.category] || [];
                            return validSubcategories.map((subcategory) => (
                              <SelectItem key={subcategory} value={subcategory} className="body-medium">
                                {subcategory}
                              </SelectItem>
                            ));
                          }
                          // Otherwise use all subcategoryOptions
                          return subcategoryOptions.map((subcategory) => (
                            <SelectItem key={subcategory} value={subcategory} className="body-medium">
                              {subcategory}
                            </SelectItem>
                          ));
                        })()}
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className="body-medium text-on-surface">{item.subcategory}</span>
                  )}
                  {item.fieldErrors?.subcategory && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <AlertCircleIcon className="w-4 h-4 text-error flex-shrink-0" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="bg-error-container text-on-error-container">
                          <p className="body-small">{item.fieldErrors.subcategory}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </td>

              {/* Size */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  {isEditable && onUpdateItem ? (
                    <Select
                      value={item.size || undefined}
                      onValueChange={(value) => onUpdateItem(item.id, 'size', value)}
                    >
                      <SelectTrigger className={`h-9 w-full body-medium ${
                        item.fieldErrors?.size 
                          ? 'border-error focus:border-error bg-error-container/10' 
                          : 'border-outline-variant focus:border-primary bg-surface-container'
                      }`}>
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        {SIZE_OPTIONS.map((size) => (
                          <SelectItem key={size} value={size} className="body-medium">
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className="body-medium text-on-surface">{item.size || '—'}</span>
                  )}
                  {item.fieldErrors?.size && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <AlertCircleIcon className="w-4 h-4 text-error flex-shrink-0" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="bg-error-container text-on-error-container">
                          <p className="body-small">{item.fieldErrors.size}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </td>

              {/* Color */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  {isEditable && onUpdateItem ? (
                    <Select
                      value={item.color || undefined}
                      onValueChange={(value) => onUpdateItem(item.id, 'color', value)}
                    >
                      <SelectTrigger className={`h-9 w-full body-medium ${
                        item.fieldErrors?.color 
                          ? 'border-error focus:border-error bg-error-container/10' 
                          : 'border-outline-variant focus:border-primary bg-surface-container'
                      }`}>
                        <SelectValue placeholder="Select color" />
                      </SelectTrigger>
                      <SelectContent>
                        {COLOR_OPTIONS.map((color) => (
                          <SelectItem key={color} value={color} className="body-medium">
                            {color}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className="body-medium text-on-surface">{item.color}</span>
                  )}
                  {item.fieldErrors?.color && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <AlertCircleIcon className="w-4 h-4 text-error flex-shrink-0" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="bg-error-container text-on-error-container">
                          <p className="body-small">{item.fieldErrors.color}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </td>

              {/* Purchase Price */}
              {showPurchasePrice && (
                <td className="px-4 py-3 text-right">
                  <span className="body-medium text-on-surface">
                    {item.purchasePrice?.toFixed(2) || '0.00'} SEK
                  </span>
                </td>
              )}

              {/* Price */}
              {showPrice && (
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {isEditable && onUpdateItem ? (
                      <Select
                        value={item.price > 0 ? item.price.toString() : ''}
                        onValueChange={(value) => onUpdateItem(item.id, 'price', parseFloat(value))}
                      >
                        <SelectTrigger className={`h-9 w-28 body-medium ${
                          item.fieldErrors?.price 
                            ? 'border-error focus:border-error bg-error-container/10' 
                            : 'border-outline-variant focus:border-primary bg-surface-container'
                        }`}>
                          <SelectValue placeholder="Select price*">
                            {item.price > 0 && <span className="text-right w-full block">{item.price} {displayCurrency}</span>}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {priceOptions.length > 0 ? (
                            priceOptions.map((price) => (
                              <SelectItem key={price} value={price.toString()} className="body-medium">
                                {price} {displayCurrency}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-prices" disabled className="body-medium">
                              No prices configured
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="body-medium text-on-surface">
                        {item.price} {displayCurrency}
                      </span>
                    )}
                    {item.fieldErrors?.price && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <AlertCircleIcon className="w-4 h-4 text-error flex-shrink-0" />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="bg-error-container text-on-error-container">
                            <p className="body-small">{item.fieldErrors.price}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </td>
              )}

              {/* Margin % */}
              {showMargin && (
                <td className="px-4 py-3 text-right">
                  <span className="body-medium text-primary">
                    {item.price && item.purchasePrice && item.price > 0
                      ? `${(((item.price - item.purchasePrice) / item.price) * 100).toFixed(1)}%`
                      : '—'}
                  </span>
                </td>
              )}

              {/* Status */}
              {showStatus && (
                <td className="px-4 py-3 text-center">
                  {item.status === 'pending' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-warning-container text-on-warning-container label-small">
                      Pending
                    </span>
                  )}
                  {item.status === 'scanned' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-primary-container text-on-primary-container label-small">
                      Scanned
                    </span>
                  )}
                </td>
              )}

              {/* Delete button */}
              {isEditable && onDeleteItem && (
                <td className="px-4 py-3 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteItem(item.id)}
                    className="text-error hover:text-error hover:bg-error-container/10"
                  >
                    <Trash2Icon className="w-4 h-4" />
                  </Button>
                </td>
              )}
            </tr>
          );
          })}
        </tbody>
      </table>
      </div>

      <ItemDetailsDialog
        item={mobileDetailsItem ? mapToItemDetails(mobileDetailsItem) : null}
        isOpen={!!mobileDetailsItem}
        onClose={() => setMobileDetailsItem(null)}
        onSave={handleMobileDetailsSave}
        statusHistory={mobileDetailsItem?.statusHistory}
        priceOptions={priceOptions}
        priceCurrency={displayCurrency}
      />
    </>
  );
}
