import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { SharedHeader } from './ui/shared-header';
import { ItemDetailsTable } from './ItemDetailsTable';
import type { ItemDetailsTableItem } from './ItemDetailsTable';
import { 
  ArrowLeftIcon, 
  PlusIcon, 
  CheckIcon, 
  AlertTriangleIcon,
  TrashIcon,
  UploadIcon,
  DownloadIcon,
  FileSpreadsheetIcon,
  XIcon,
  EditIcon,
  PackageIcon,
  StoreIcon
} from 'lucide-react';
import { Store, Brand, Country, StoreSelection } from './StoreSelector';
import { Partner } from './PartnerWarehouseSelector';
import { getCurrencyFromCountry } from '../data/partnerPricing';
import { OrderItem } from './OrderCreationScreen';
import { 
  generateThriftedTemplateCSV, 
  downloadCSV, 
  parseCSV, 
  convertToThriftedOrderItems, 
  exportThriftedItemsToCSV,
  mapSubcategoryToCategory,
  getAllThriftedSubcategories,
  THRIFTED_VALID_VALUES
} from '../utils/spreadsheetUtils';

type CreationStep = 'setup' | 'items';
type CreationMethod = 'manual' | 'bulk';
type ValidationFilter = 'all' | 'errors' | 'valid';

interface ThriftedOrderCreationScreenProps {
  onBack: () => void;
  onCreateOrder: (items: OrderItem[], storeSelection: StoreSelection, shouldRegister?: boolean) => void;
  currentPartner?: Partner;
  brands?: Brand[];
  countries?: Country[];
  stores?: Store[];
  // For editing existing order
  existingOrderId?: string;
  existingItems?: OrderItem[];
  existingStoreSelection?: StoreSelection;
  orderStatus?: 'pending' | 'registered';
}

export default function ThriftedOrderCreationScreen({
  onBack,
  onCreateOrder,
  currentPartner,
  brands = [],
  countries = [],
  stores = [],
  existingOrderId,
  existingItems = [],
  existingStoreSelection,
  orderStatus = 'pending'
}: ThriftedOrderCreationScreenProps) {
  const [step, setStep] = useState<CreationStep>(existingOrderId ? 'items' : 'setup');
  const [creationMethod, setCreationMethod] = useState<CreationMethod>('manual');
  const [showStoreEdit, setShowStoreEdit] = useState(!existingOrderId);
  const [orderItems, setOrderItems] = useState<OrderItem[]>(existingItems);
  
  // Store selection state
  const [selectedBrandId, setSelectedBrandId] = useState<string | undefined>(existingStoreSelection?.brandId);
  const [selectedCountryId, setSelectedCountryId] = useState<string | undefined>(existingStoreSelection?.countryId);
  const [selectedStoreId, setSelectedStoreId] = useState<string | undefined>(existingStoreSelection?.storeId);
  
  const [validationFilter, setValidationFilter] = useState<ValidationFilter>('all');
  const [uploadError, setUploadError] = useState<string>('');
  const [showReplaceDialog, setShowReplaceDialog] = useState(false);
  const [pendingUploadItems, setPendingUploadItems] = useState<OrderItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditing = !!existingOrderId;
  const canEdit = !isEditing || orderStatus === 'pending';

  // Get filtered countries and stores based on selections
  const availableCountries = selectedBrandId 
    ? countries.filter(c => c.brandId === selectedBrandId)
    : [];
  
  const availableStores = selectedBrandId && selectedCountryId
    ? stores.filter(s => s.brandId === selectedBrandId && s.countryId === selectedCountryId)
    : [];

  // Build store selection object
  const storeSelection: StoreSelection | undefined = selectedBrandId && selectedCountryId && selectedStoreId
    ? {
        brandId: selectedBrandId,
        countryId: selectedCountryId,
        storeId: selectedStoreId,
        storeCode: stores.find(s => s.id === selectedStoreId)?.code || ''
      }
    : undefined;

  const selectedCountryRecord = selectedCountryId ? countries.find(c => c.id === selectedCountryId) : undefined;
  const selectedCurrency = selectedCountryRecord ? getCurrencyFromCountry(selectedCountryRecord.name) : undefined;
  const partnerIdForPricing = currentPartner?.id || '2';

  // Validation stats
  const totalItems = orderItems.length;
  const itemsWithErrors = orderItems.filter(item => item.status === 'error').length;
  const validItems = orderItems.filter(item => item.status !== 'error').length;

  // Filter items based on validation filter (only for bulk upload)
  const filteredItems = creationMethod === 'bulk' 
    ? orderItems.filter(item => {
        if (validationFilter === 'errors') return item.status === 'error';
        if (validationFilter === 'valid') return item.status !== 'error';
        return true;
      })
    : orderItems; // For manual entry, show all items without filtering
  const brandSuggestions = useMemo(() => {
    const suggestionSet = new Set<string>();
    brands.forEach((brand) => suggestionSet.add(brand.name));
    orderItems.forEach((item) => {
      if (item.brand && item.brand.trim()) {
        suggestionSet.add(item.brand.trim());
      }
    });
    return Array.from(suggestionSet).sort((a, b) => a.localeCompare(b));
  }, [brands, orderItems]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const selector = 'input[placeholder="Enter item brand"]';
    const inputs = Array.from(document.querySelectorAll<HTMLInputElement>(selector));
    inputs.forEach((input) => input.setAttribute('list', 'thrifted-brand-suggestions'));
    return () => {
      inputs.forEach((input) => input.removeAttribute('list'));
    };
  }, [orderItems.length, filteredItems.length, validationFilter, step, canEdit]);

  const handleDownloadTemplate = () => {
    const template = generateThriftedTemplateCSV();
    downloadCSV(template, 'thrifted-order-template.csv');
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const csvRows = parseCSV(content);
        const { items } = convertToThriftedOrderItems(csvRows);
        
        if (items.length === 0) {
          setUploadError('No valid items found in the file');
          return;
        }

        setPendingUploadItems(items);
        
        if (orderItems.length > 0) {
          // Show replace dialog if items already exist
          setShowReplaceDialog(true);
        } else {
          // Directly add items and move to items step
          setOrderItems(items);
          setUploadError('');
          setStep('items');
        }
        
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        setUploadError('Error reading file. Please ensure it\'s a valid CSV.');
      }
    };
    reader.readAsText(file);
  };

  const handleReplaceItems = () => {
    setOrderItems(pendingUploadItems);
    setPendingUploadItems([]);
    setShowReplaceDialog(false);
    setUploadError('');
    setStep('items');
  };

  const handleAppendItems = () => {
    setOrderItems(prev => [...prev, ...pendingUploadItems]);
    setPendingUploadItems([]);
    setShowReplaceDialog(false);
    setUploadError('');
    setStep('items');
  };

  const handleAddItem = () => {
    // Create an empty row for manual entry
    const newItem: OrderItem = {
      id: `item-${Date.now()}-${Math.random()}`,
      itemId: '',
      sku: '',
      category: '', // Auto-mapped from subcategory
      subcategory: '', // Partners fill this
      size: '',
      brand: '',
      color: '',
      gender: '',
      price: 0,
      retailerItemId: '',
      status: 'error',
      errors: ['Required fields missing'],
      source: 'manual',
      fieldErrors: {
        sku: 'Required',
        subcategory: 'Required',
        size: 'Required',
        brand: 'Required',
        color: 'Required',
        price: 'Required (Mandatory)',
        retailerItemId: 'Required (Mandatory)'
      }
    };

    setOrderItems(prev => [...prev, newItem]);
  };

  const handleDeleteItem = (itemId: string) => {
    setOrderItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleUpdateItem = (itemId: string, field: keyof ItemDetailsTableItem, value: any) => {
    setOrderItems(prev => prev.map(item => {
      if (item.id !== itemId) return item;
      
      // Map fields for Thrifted orders (table uses different field names internally)
      let actualField = field;
      let actualValue = value;
      
      if (field === 'partnerItemId') {
        // partnerItemId maps to both sku and itemId
        actualField = 'sku' as keyof OrderItem;
      }
      
      // Update the field value
      const updatedItem = { ...item, [actualField]: actualValue };
      
      // For SKU, also update itemId to keep them in sync
      if (actualField === 'sku') {
        updatedItem.itemId = actualValue;
      }
      
      // When category changes, clear subcategory if it's not valid for the new category
      if (field === 'category') {
        const trimmedCategory = value && value.toString ? value.toString().trim() : '';
        if (trimmedCategory && THRIFTED_VALID_VALUES.categories.includes(trimmedCategory)) {
          const validSubcategories = THRIFTED_VALID_VALUES.subcategories[trimmedCategory as keyof typeof THRIFTED_VALID_VALUES.subcategories] || [];
          if (updatedItem.subcategory && !validSubcategories.includes(updatedItem.subcategory)) {
            updatedItem.subcategory = '';
          }
        } else if (!trimmedCategory) {
          updatedItem.category = '';
        }
      }

      if (field === 'subcategory') {
        const trimmedSubcategory = value && value.toString ? value.toString().trim() : '';
        if (trimmedSubcategory) {
          const mappedCategory = mapSubcategoryToCategory(trimmedSubcategory);
          if (mappedCategory) {
            updatedItem.subcategory = trimmedSubcategory;
            updatedItem.category = mappedCategory;
          }
        }
      }

      // Update field errors
      const fieldErrors = { ...(updatedItem.fieldErrors || {}) };
      
      // Validate updated field
      if (actualField === 'sku') {
        if (actualValue && actualValue.toString().trim() !== '') {
          delete fieldErrors.sku;
        } else {
          fieldErrors.sku = 'Required';
        }
      }
      
      // Retailer ID is mandatory - mark clearly
      if (actualField === 'retailerItemId') {
        if (actualValue && actualValue.toString().trim() !== '') {
          delete fieldErrors.retailerItemId;
        } else {
          fieldErrors.retailerItemId = 'Required (Mandatory)';
        }
      }
      
      // Category validation (auto-mapped but still validated when edited manually)
      if (field === 'category') {
        const trimmedCategory = actualValue && actualValue.toString ? actualValue.toString().trim() : '';
        if (trimmedCategory) {
          if (THRIFTED_VALID_VALUES.categories.includes(trimmedCategory)) {
            delete fieldErrors.category;
            const validSubcategories = THRIFTED_VALID_VALUES.subcategories[trimmedCategory as keyof typeof THRIFTED_VALID_VALUES.subcategories] || [];
            if (updatedItem.subcategory && !validSubcategories.includes(updatedItem.subcategory)) {
              updatedItem.subcategory = '';
              fieldErrors.subcategory = 'Select subcategory for this category';
            }
          } else {
            fieldErrors.category = 'Invalid category';
          }
        } else {
          delete fieldErrors.category;
        }
      }
      
      // Subcategory validation (auto-maps category)
      if (field === 'subcategory') {
        const trimmedSubcategory = actualValue && actualValue.toString ? actualValue.toString().trim() : '';
        if (trimmedSubcategory) {
          const mappedCategory = mapSubcategoryToCategory(trimmedSubcategory);
          if (mappedCategory) {
            updatedItem.subcategory = trimmedSubcategory;
            updatedItem.category = mappedCategory;
            delete fieldErrors.subcategory;
            delete fieldErrors.category;
          } else {
            fieldErrors.subcategory = 'Invalid subcategory';
          }
        } else {
          fieldErrors.subcategory = 'Required';
        }
      }
      
      if (actualField === 'size' || actualField === 'brand' || actualField === 'color') {
        if (actualValue && actualValue.toString().trim() !== '') {
          delete fieldErrors[actualField];
        } else {
          fieldErrors[actualField] = 'Required';
        }
      }
      
      // Price is mandatory - mark clearly
      if (actualField === 'price') {
        const numValue = typeof actualValue === 'string' ? parseFloat(actualValue) : actualValue;
        if (numValue && numValue > 0 && PRICE_OPTIONS_SEK.includes(numValue)) {
          delete fieldErrors.price;
        } else if (!numValue || numValue <= 0) {
          fieldErrors.price = 'Required (Mandatory)';
        } else {
          fieldErrors.price = 'Select valid price';
        }
      }
      
      // Update status based on errors
      const hasErrors = Object.keys(fieldErrors).length > 0;
      updatedItem.status = hasErrors ? 'error' : undefined;
      updatedItem.fieldErrors = fieldErrors;
      updatedItem.errors = hasErrors ? Object.values(fieldErrors) : [];
      
      return updatedItem;
    }));
  };

  // Price options for validation
  const PRICE_OPTIONS_SEK = [50, 75, 100, 120, 150, 200, 250, 300, 400, 500, 600, 750, 1000, 1200, 1500, 2000];

  const handleExportItems = () => {
    const csv = exportThriftedItemsToCSV(orderItems);
    downloadCSV(csv, `thrifted-order-items-${Date.now()}.csv`);
  };

  // Allow creating order even with validation errors (user can fix them later)
  const canCreateOrder = storeSelection && orderItems.length > 0;

  // Step navigation
  const handleContinueToItems = () => {
    if (storeSelection) {
      // For manual entry, create order immediately and go to order details screen
      if (creationMethod === 'manual') {
        onCreateOrder([], storeSelection, false);
      } else {
        // For bulk upload, go to items step to review/validate uploaded items
        setStep('items');
        setShowStoreEdit(false);
      }
    }
  };

  // Render receiving store selector (always visible at top)
  const renderStoreSelector = () => {
    const selectedBrand = brands.find(b => b.id === selectedBrandId);
    const selectedCountry = availableCountries.find(c => c.id === selectedCountryId);
    const selectedStore = availableStores.find(s => s.id === selectedStoreId);

    return (
      <Card className="bg-surface-container border-outline">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
                <StoreIcon size={20} className="text-on-primary-container" />
              </div>
              <div>
                <CardTitle className="title-large text-on-surface">Receiving Store</CardTitle>
                {storeSelection && !showStoreEdit && (
                  <p className="body-small text-on-surface-variant mt-0.5">
                    {selectedBrand?.name} • {selectedCountry?.name}
                  </p>
                )}
              </div>
            </div>
            {storeSelection && canEdit && step === 'items' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowStoreEdit(!showStoreEdit)}
                className="gap-2"
              >
                <EditIcon size={16} />
                <span className="label-large">Edit</span>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {showStoreEdit || !storeSelection ? (
            <div className="space-y-4">
              {/* Brand Selector */}
              <div className="space-y-2">
                <Label className="label-large text-on-surface">Brand</Label>
                <Select 
                  value={selectedBrandId} 
                  onValueChange={(value: string) => {
                    setSelectedBrandId(value);
                    setSelectedCountryId(undefined);
                    setSelectedStoreId(undefined);
                  }}
                  disabled={!canEdit}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map(brand => (
                      <SelectItem key={brand.id} value={brand.id}>
                        <span className="body-large">{brand.name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Country Selector */}
              <div className="space-y-2">
                <Label className="label-large text-on-surface">Country</Label>
                <Select 
                  value={selectedCountryId} 
                  onValueChange={(value: string) => {
                    setSelectedCountryId(value);
                    setSelectedStoreId(undefined);
                  }}
                  disabled={!selectedBrandId || !canEdit}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a country" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCountries.map(country => (
                      <SelectItem key={country.id} value={country.id}>
                        <span className="body-large">{country.name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Store Selector */}
              <div className="space-y-2">
                <Label className="label-large text-on-surface">Store</Label>
                <Select 
                  value={selectedStoreId} 
                  onValueChange={(value: string) => {
                    setSelectedStoreId(value);
                    if (step === 'items') {
                      setShowStoreEdit(false);
                    }
                  }}
                  disabled={!selectedCountryId || !canEdit}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a store" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableStores.map(store => (
                      <SelectItem key={store.id} value={store.id}>
                        <span className="body-large">{store.name} ({store.code})</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 py-2">
              <div className="flex-1">
                <p className="title-medium text-on-surface">
                  {selectedStore?.name} ({selectedStore?.code})
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // Render step 1: Setup (method selection + upload)
  const renderSetupStep = () => (
    <div className="space-y-6">
      <Card className="bg-surface-container-low border-outline">
        <CardHeader>
          <CardTitle className="title-large">Choose How to Add Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="body-medium text-on-surface-variant">
            Select your preferred method for adding items to this order.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              onClick={() => setCreationMethod('manual')}
              disabled={!canEdit}
              className={`p-4 border rounded-xl transition-colors text-left ${
                creationMethod === 'manual'
                  ? 'border-primary bg-primary-container'
                  : 'border-outline hover:bg-surface-container-high'
              } ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                  creationMethod === 'manual' 
                    ? 'bg-primary text-on-primary' 
                    : 'bg-primary-container text-on-primary-container'
                }`}>
                  <PlusIcon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="title-medium text-on-surface mb-1">Add Manually</p>
                  <p className="body-medium text-on-surface-variant">
                    Fill in item details one by one
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setCreationMethod('bulk')}
              disabled={!canEdit}
              className={`p-4 border rounded-xl transition-colors text-left ${
                creationMethod === 'bulk'
                  ? 'border-secondary bg-secondary-container'
                  : 'border-outline hover:bg-surface-container-high'
              } ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                  creationMethod === 'bulk'
                    ? 'bg-secondary text-on-secondary'
                    : 'bg-secondary-container text-on-secondary-container'
                }`}>
                  <FileSpreadsheetIcon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="title-medium text-on-surface mb-1">Bulk Upload</p>
                  <p className="body-medium text-on-surface-variant">
                    Upload multiple items via spreadsheet
                  </p>
                </div>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Upload Options (shown inline when bulk is selected) */}
      {creationMethod === 'bulk' && (
        <Card className="bg-surface-container-low border-outline">
          <CardHeader>
            <CardTitle className="title-large">Upload Spreadsheet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="body-medium text-on-surface-variant">
              Download the template, fill it with your items, and upload it back.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                onClick={handleDownloadTemplate}
                variant="outline"
                size="lg"
              >
                <DownloadIcon size={20} className="mr-2" />
                <span className="label-large">Download Template</span>
              </Button>

              <div className="relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <Button
                  variant="default"
                  className="w-full bg-primary text-on-primary"
                  size="lg"
                >
                  <UploadIcon size={20} className="mr-2" />
                  <span className="label-large">Upload CSV File</span>
                </Button>
              </div>
            </div>

            {uploadError && (
              <Alert variant="destructive">
                <AlertTriangleIcon className="h-4 w-4" />
                <AlertDescription className="body-small">{uploadError}</AlertDescription>
              </Alert>
            )}

            <div className="p-3 bg-surface-container rounded-lg">
              <p className="label-small text-on-surface-variant mb-2">CSV Format Requirements:</p>
              <ul className="space-y-1 body-small text-on-surface-variant">
                <li>• Required columns: SKU, Retailer ID*, Item brand, Subcategory, Size, Color, Gender, Price (SEK)*</li>
                <li>• <strong>Retailer ID*</strong> and <strong>Price (SEK)*</strong> are mandatory</li>
                <li>• Subcategory options: {getAllThriftedSubcategories().join(', ')}</li>
                <li>• Category is automatically mapped from Subcategory</li>
                <li>• Gender options: Women, Men, Kids, Unisex</li>
                <li>• Price must be one of the valid SEK price ladder values</li>
                <li>• Use the template to ensure correct format</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-end">
        <Button
          onClick={handleContinueToItems}
          disabled={!storeSelection || (creationMethod === 'bulk' && orderItems.length === 0)}
          size="lg"
          className="bg-primary text-on-primary gap-2"
        >
          <span className="label-large">Continue</span>
          <ArrowLeftIcon size={20} className="rotate-180" />
        </Button>
      </div>
    </div>
  );

  // Render step 2: Items management
  const renderItemsStep = () => (
    <div className="space-y-6 pb-32">
      {/* Re-upload Section (for bulk uploads only) */}
      {canEdit && creationMethod === 'bulk' && (
        <Card className="bg-surface-container-low border-outline">
          <CardHeader>
            <CardTitle className="title-large">Import Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="body-medium text-on-surface-variant">
              {orderItems.length > 0 
                ? 'Upload a new CSV file to replace or append items.'
                : 'Download the template, fill it with your items, and upload it to add items.'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                onClick={handleDownloadTemplate}
                variant="outline"
                size="lg"
                className="gap-2"
              >
                <DownloadIcon size={20} />
                <span className="label-large">Download Template</span>
              </Button>

              <div className="relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <Button
                  variant="default"
                  className="w-full bg-secondary text-on-secondary gap-2"
                  size="lg"
                >
                  <UploadIcon size={20} />
                  <span className="label-large">{orderItems.length > 0 ? 'Re-import' : 'Upload'} CSV</span>
                </Button>
              </div>
            </div>

            {uploadError && (
              <Alert variant="destructive">
                <AlertTriangleIcon className="h-4 w-4" />
                <AlertDescription className="body-small">{uploadError}</AlertDescription>
              </Alert>
            )}

            <div className="p-3 bg-surface-container rounded-lg">
              <p className="label-small text-on-surface-variant mb-2">CSV Format Requirements:</p>
              <ul className="space-y-1 body-small text-on-surface-variant">
                <li>• Required columns: SKU, Retailer ID*, Item brand, Subcategory, Size, Color, Gender, Price (SEK)*</li>
                <li>• <strong>Retailer ID*</strong> and <strong>Price (SEK)*</strong> are mandatory</li>
                <li>• Subcategory options: {getAllThriftedSubcategories().join(', ')}</li>
                <li>• Category is automatically mapped from Subcategory</li>
                <li>• Gender options: Women, Men, Kids, Unisex</li>
                <li>• Price must be one of the valid SEK price ladder values</li>
                <li>• Use the template to ensure correct format</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Items List/Table */}
      <Card className="bg-surface-container-low border-outline">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="title-large">Order Items ({totalItems})</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              {canEdit && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleAddItem}
                  className="bg-primary text-on-primary gap-2"
                >
                  <PlusIcon size={16} />
                  <span className="label-large">Add Row</span>
                </Button>
              )}
              {itemsWithErrors > 0 && (
                <Badge variant="destructive" className="label-medium">
                  {itemsWithErrors} errors
                </Badge>
              )}
              {validItems > 0 && (
                <Badge variant="default" className="bg-tertiary-container text-on-tertiary-container label-medium">
                  {validItems} valid
                </Badge>
              )}
              {canEdit && orderItems.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportItems}
                  className="gap-2"
                >
                  <DownloadIcon size={16} />
                  <span className="label-large">Export</span>
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {orderItems.length > 0 && (
            <>
              {/* Filter Tabs - Only show for bulk upload */}
              {creationMethod === 'bulk' && (
                <div className="flex gap-2 mb-4 flex-wrap">
                  <Button
                    variant={validationFilter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setValidationFilter('all')}
                    className="label-large"
                  >
                    All ({totalItems})
                  </Button>
                  <Button
                    variant={validationFilter === 'valid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setValidationFilter('valid')}
                    className="label-large"
                  >
                    Valid ({validItems})
                  </Button>
                  {itemsWithErrors > 0 && (
                    <Button
                      variant={validationFilter === 'errors' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setValidationFilter('errors')}
                      className="label-large"
                    >
                      Errors ({itemsWithErrors})
                    </Button>
                  )}
                </div>
              )}

              {/* Validation Errors Summary - Only show for bulk upload */}
              {creationMethod === 'bulk' && itemsWithErrors > 0 && validationFilter === 'errors' && (
                <Alert variant="destructive" className="mb-4">
                  <AlertTriangleIcon className="h-4 w-4" />
                  <AlertDescription className="body-small">
                    {itemsWithErrors} item{itemsWithErrors > 1 ? 's have' : ' has'} validation errors. Please fix the errors before creating the order.
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}

          {/* Items Table/Cards */}
          {orderItems.length > 0 ? (
            <>
              <ItemDetailsTable
                items={filteredItems.map(item => ({
                  ...item,
                  partnerItemId: item.sku || item.itemId,
                  subcategory: item.subcategory || '', // Use subcategory (not gender)
                  price: item.price || 0,
                  imageUrl: undefined,
                  fieldErrors: item.fieldErrors
                }))}
                showRetailerId={true}
                showPurchasePrice={false}
                showPrice={true}
                showStatus={false}
                isEditable={canEdit}
                onUpdateItem={handleUpdateItem}
                onDeleteItem={canEdit ? handleDeleteItem : undefined}
                subcategoryOptions={getAllThriftedSubcategories()}
                subcategoryLabel="Subcategory"
                brandAsInput={true}
                categoryOptions={THRIFTED_VALID_VALUES.categories} // Show category dropdown (auto-mapped from subcategory)
                hideCategoryForThrifted={false} // Show category column for cascading dropdown
                subcategoriesByCategory={THRIFTED_VALID_VALUES.subcategories} // Provide category-to-subcategory mapping
                requireCategoryBeforeSubcategory={false}
                partnerId={partnerIdForPricing}
                countryName={selectedCountryRecord?.name}
                currency={selectedCurrency}
              />

              {/* Delete Items Actions */}
              {canEdit && filteredItems.length > 0 && (
                <div className="mt-4 flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const itemsToDelete = filteredItems.map(i => i.id);
                      setOrderItems(prev => prev.filter(item => !itemsToDelete.includes(item.id)));
                    }}
                    className="gap-2"
                  >
                    <TrashIcon size={16} />
                    <span className="label-large">Delete {validationFilter === 'all' ? 'All' : validationFilter === 'errors' ? 'Error' : 'Valid'} Items</span>
                  </Button>
                </div>
              )}
            </>
          ) : (
            // Empty State
            <div className="py-12 text-center">
              <PackageIcon size={48} className="mx-auto text-on-surface-variant/50 mb-4" />
              <p className="body-large text-on-surface-variant mb-2">No items added yet</p>
              <p className="body-medium text-on-surface-variant">
                Click "Add Row" above to add your first item, or upload a CSV file.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      {!isEditing && (
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setStep('setup')}
            size="lg"
            className="gap-2"
          >
            <ArrowLeftIcon size={20} />
            <span className="label-large">Back to Setup</span>
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-surface">
      <SharedHeader 
        title={isEditing ? "Edit Order" : "Create New Order"}
        onBack={onBack}
      />

      <div className="px-4 md:px-6 lg:px-8 py-6 space-y-6 pb-32">
        <datalist id="thrifted-brand-suggestions">
          {brandSuggestions.map((brand) => (
            <option key={brand} value={brand} />
          ))}
        </datalist>
        {/* Receiving Store Selector (always visible at top) */}
        {renderStoreSelector()}

        {/* Alert if store not selected */}
        {!storeSelection && step === 'setup' && (
          <Alert className="border-warning bg-warning-container/20">
            <AlertTriangleIcon className="h-4 w-4 text-warning" />
            <AlertDescription className="body-small text-on-warning-container">
              Please select a receiving store above to continue.
            </AlertDescription>
          </Alert>
        )}

        {/* Render current step */}
        {step === 'setup' && storeSelection && renderSetupStep()}
        {step === 'items' && renderItemsStep()}
      </div>

      {/* Fixed Bottom Actions (only on items step) */}
      {step === 'items' && (
        <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-outline px-4 md:px-6 lg:px-8 py-4 safe-area-bottom z-50">
          <div className="max-w-screen-xl mx-auto">
            {/* Validation Summary */}
            {orderItems.length > 0 && (
              <div className="mb-3 flex items-center justify-center gap-2">
                {validItems === totalItems ? (
                  <div className="flex items-center gap-2 text-tertiary">
                    <CheckIcon size={16} />
                    <span className="body-small">All {totalItems} items valid</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <span className="body-small">{validItems} of {totalItems} items valid</span>
                    {itemsWithErrors > 0 && (
                      <Badge variant="destructive" className="bg-error-container text-on-error-container">
                        {itemsWithErrors} {itemsWithErrors === 1 ? 'error' : 'errors'}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {/* Mobile: Full width evenly spaced buttons */}
            <div className="flex gap-3 md:hidden">
              <Button
                variant="outline"
                size="lg"
                onClick={onBack}
                className="flex-1"
              >
                <span className="label-large">Cancel</span>
              </Button>
              
              {isEditing ? (
                <Button
                  onClick={() => storeSelection && onCreateOrder(orderItems, storeSelection, false)}
                  disabled={!canCreateOrder}
                  size="lg"
                  className="flex-1 bg-primary text-on-primary"
                >
                  <CheckIcon size={20} className="mr-2" />
                  <span className="label-large">Save Changes</span>
                </Button>
              ) : (
                <Button
                  onClick={() => storeSelection && onCreateOrder(orderItems, storeSelection, false)}
                  disabled={!canCreateOrder}
                  size="lg"
                  className="flex-1 bg-primary text-on-primary"
                >
                  <CheckIcon size={20} className="mr-2" />
                  <span className="label-large">Create</span>
                </Button>
              )}
            </div>

            {/* Desktop: Right-aligned buttons with max width */}
            <div className="hidden md:flex justify-end">
              <div className="flex gap-3 max-w-md w-full">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={onBack}
                  className="flex-1"
                >
                  <span className="label-large">Cancel</span>
                </Button>
                
                {isEditing ? (
                  <Button
                    onClick={() => storeSelection && onCreateOrder(orderItems, storeSelection, false)}
                    disabled={!canCreateOrder}
                    size="lg"
                    className="flex-1 bg-primary text-on-primary"
                  >
                    <CheckIcon size={20} className="mr-2" />
                    <span className="label-large">Save Changes</span>
                  </Button>
                ) : (
                  <Button
                    onClick={() => storeSelection && onCreateOrder(orderItems, storeSelection, false)}
                    disabled={!canCreateOrder}
                    size="lg"
                    className="flex-1 bg-primary text-on-primary"
                  >
                    <CheckIcon size={20} className="mr-2" />
                    <span className="label-large">Create</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Replace Items Dialog */}
      <Dialog open={showReplaceDialog} onOpenChange={setShowReplaceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="title-large">Replace or Append Items?</DialogTitle>
            <DialogDescription className="body-medium">
              You have {orderItems.length} existing items. The uploaded file contains {pendingUploadItems.length} items.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3 py-4">
            <Button
              onClick={handleReplaceItems}
              variant="destructive"
              size="lg"
              className="w-full"
            >
              <XIcon size={20} className="mr-2" />
              <span className="label-large">Replace All Items</span>
            </Button>

            <Button
              onClick={handleAppendItems}
              variant="default"
              size="lg"
              className="w-full bg-primary text-on-primary"
            >
              <PlusIcon size={20} className="mr-2" />
              <span className="label-large">Add to Existing Items</span>
            </Button>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowReplaceDialog(false);
                setPendingUploadItems([]);
              }}
            >
              <span className="label-large">Cancel</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
