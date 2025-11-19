import React from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Input } from './ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { AlertCircleIcon } from 'lucide-react';
import { OrderItem } from './OrderCreationScreen';

export interface ItemDetailsTableItem extends OrderItem {
  id: string;
  status?: 'pending' | 'scanned' | 'error';
  purchasePrice?: number;
  imageUrl?: string;
  errors?: string[];
  fieldErrors?: Record<string, string>; // Field-specific error messages
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
  subcategoryOptions?: string[]; // Custom subcategory options (e.g., for conditions)
  subcategoryLabel?: string; // Custom label for subcategory column
  brandAsInput?: boolean; // Use text input instead of dropdown for brand
  categoryOptions?: string[]; // Custom category options
  hideCategoryForThrifted?: boolean; // Hide category column for Thrifted orders (category is auto-mapped from subcategory)
  subcategoriesByCategory?: Record<string, string[]>; // Map of category to subcategories for cascading dropdown
}

// Dropdown options for editable attributes
const BRAND_OPTIONS = ['WEEKDAY', 'COS', 'Monki', 'H&M', '& Other Stories', 'Arket'];
const CATEGORY_OPTIONS = ['Clothing', 'Shoes', 'Accessories', 'Bags'];
const SUBCATEGORY_OPTIONS = ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Sneakers', 'Boots', 'Sandals', 'Bags', 'Scarves', 'Jewelry'];
const COLOR_OPTIONS = ['Black', 'White', 'Blue', 'Red', 'Gray', 'Green', 'Navy', 'Beige', 'Brown', 'Pink', 'Yellow', 'Purple'];
const SIZE_OPTIONS = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '34', '36', '37', '38', '39', '40', '41', '42', '43', '44'];

// Valid price points for SEK (Swedish Krona) - Sellpy partner market
// These correspond to the price ladder steps for the market and partner
const PRICE_OPTIONS_SEK = [50, 75, 100, 120, 150, 200, 250, 300, 400, 500, 600, 750, 1000, 1200, 1500, 2000];

export function ItemDetailsTable({
  items,
  showRetailerId = true,
  showPrice = false,
  showPurchasePrice = false,
  showMargin = false,
  showStatus = false,
  isEditable = false,
  onUpdateItem,
  subcategoryOptions = SUBCATEGORY_OPTIONS,
  subcategoryLabel = 'Subcategory',
  brandAsInput = false,
  categoryOptions = CATEGORY_OPTIONS,
  hideCategoryForThrifted = false,
  subcategoriesByCategory,
}: ItemDetailsTableProps) {
  return (
    <>
      {/* Mobile View - Cards */}
      <div className="md:hidden space-y-2">
        {items.map((item) => {
          const hasError = item.status === 'error';
          const errorFields = Object.keys(item.fieldErrors || {});
          return (
          <div 
            key={item.id}
            className={`border rounded-lg p-4 ${
              hasError 
                ? 'border-error bg-error-container/10' 
                : 'border-outline-variant bg-surface'
            }`}
          >
            <div className="flex gap-3">
              {/* Image */}
              <div className="w-16 h-16 rounded overflow-hidden bg-surface-container flex-shrink-0">
                {item.imageUrl ? (
                  <ImageWithFallback
                    src={item.imageUrl}
                    alt={`${item.brand} ${item.category}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-surface-container-high flex items-center justify-center">
                    <span className="label-small text-on-surface-variant">No Image</span>
                  </div>
                )}
              </div>

              {/* Item Details */}
              <div className="flex-1 min-w-0">
                <div className="body-medium text-on-surface mb-1">
                  {item.brand}{!hideCategoryForThrifted && item.category && ` • ${item.category}`}
                </div>
                <div className="body-small text-on-surface-variant mb-2">
                  {item.subcategory}{item.size && ` • ${item.size}`} • {item.color}
                </div>
                
                <div className="grid grid-cols-2 gap-2 label-small text-on-surface-variant">
                  {showRetailerId && (
                    <div>
                      <span className="opacity-70">Item ID:</span>
                      <div className="text-on-surface">{item.retailerItemId || '—'}</div>
                    </div>
                  )}
                  <div>
                    <span className="opacity-70">External ID:</span>
                    <div className="text-on-surface">{item.partnerItemId || '—'}</div>
                  </div>
                </div>

                {/* Price Info */}
                {(showPrice || showPurchasePrice || showMargin) && (
                  <div className="mt-2 pt-2 border-t border-outline-variant">
                    <div className="flex gap-4 flex-wrap">
                      {showPurchasePrice && (
                        <div className="label-small">
                          <span className="text-on-surface-variant opacity-70">Purchase:</span>
                          <span className="text-on-surface ml-1">
                            {item.purchasePrice?.toFixed(2) || '0.00'} SEK
                          </span>
                        </div>
                      )}
                      {showPrice && (
                        <div className="label-small">
                          <span className="text-on-surface-variant opacity-70">Price:</span>
                          <span className="text-on-surface ml-1">
                            {item.price} SEK
                          </span>
                        </div>
                      )}
                      {showMargin && item.price && item.purchasePrice && (
                        <div className="label-small">
                          <span className="text-on-surface-variant opacity-70">Margin:</span>
                          <span className="text-primary ml-1">
                            {item.price > 0 ? (((item.price - item.purchasePrice) / item.price) * 100).toFixed(1) : '0.0'}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Status */}
                {showStatus && item.status && (
                  <div className="mt-2">
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
                  </div>
                )}

                {/* Validation Errors */}
                {hasError && errorFields.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-error/20">
                    <div className="flex items-start gap-2">
                      <AlertCircleIcon className="w-4 h-4 text-error flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="label-small text-error mb-1">Validation Errors:</p>
                        <ul className="space-y-1 body-small text-on-error-container">
                          {errorFields.map((field) => (
                            <li key={field}>• {item.fieldErrors![field]}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
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
                <span className="label-medium text-on-surface">Price (SEK)*</span>
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
                  {item.imageUrl ? (
                    <ImageWithFallback
                      src={item.imageUrl}
                      alt={`${item.brand} ${item.category}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-surface-container-high flex items-center justify-center">
                      <span className="label-small text-on-surface-variant">No Image</span>
                    </div>
                  )}
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
                            {item.price > 0 && <span className="text-right w-full block">{item.price} SEK</span>}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {PRICE_OPTIONS_SEK.map((price) => (
                            <SelectItem key={price} value={price.toString()} className="body-medium">
                              {price} SEK
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="body-medium text-on-surface">
                        {item.price} SEK
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
            </tr>
          );
          })}
        </tbody>
      </table>
      </div>
    </>
  );
}
