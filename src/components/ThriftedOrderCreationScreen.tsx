import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { HIGHLIGHT_NEW } from '../config/featureHighlights';
import { flushSync } from 'react-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { SharedHeader } from './ui/shared-header';
import { useMediaQuery } from './ui/use-mobile';
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
import { Partner, type Warehouse } from './PartnerWarehouseSelector';
import { getCurrencyFromCountry } from '../data/partnerPricing';
import { OrderItem } from './OrderCreationScreen';
import { 
  generateThriftedTemplateCSV, 
  downloadCSV, 
  parseCSV, 
  exportThriftedItemsToCSV,
  mapSubcategoryToCategory,
  getAllThriftedSubcategories,
  THRIFTED_VALID_VALUES,
  THRIFTED_IMPORT_CHUNK_SIZE,
  getThriftedTemplateAvailability,
  hasDuplicateFieldErrors,
  processMockThriftedImport,
  stripCurrentOrderConflictsFromThriftedImport,
  sortByNameAlpha,
  sortStoresByCode,
  type ThriftedImportProgress,
  type ThriftedImportResult,
} from '../utils/spreadsheetUtils';

type CreationStep = 'setup' | 'items';
type CreationMethod = 'manual' | 'bulk';
type ValidationFilter = 'all' | 'errors' | 'valid' | 'duplicates';

interface ThriftedOrderCreationScreenProps {
  onBack: () => void;
  onCreateOrder: (items: OrderItem[], storeSelection: StoreSelection, shouldRegister?: boolean) => void;
  currentPartner?: Partner;
  brands?: Brand[];
  countries?: Country[];
  stores?: Store[];
  warehouses?: Warehouse[];
  // For editing existing order
  existingOrderId?: string;
  existingItems?: OrderItem[];
  existingStoreSelection?: StoreSelection;
  existingWarehouseId?: string;
  orderStatus?: 'pending' | 'draft' | 'registered';
}

export default function ThriftedOrderCreationScreen({
  onBack,
  onCreateOrder,
  currentPartner,
  brands = [],
  countries = [],
  stores = [],
  warehouses = [],
  existingOrderId,
  existingItems = [],
  existingStoreSelection,
  existingWarehouseId,
  orderStatus = 'pending'
}: ThriftedOrderCreationScreenProps) {
  const [step, setStep] = useState<CreationStep>(existingOrderId ? 'items' : 'setup');
  const [creationMethod, setCreationMethod] = useState<CreationMethod>('bulk');
  const [showStoreEdit, setShowStoreEdit] = useState(!existingOrderId);
  const [orderItems, setOrderItems] = useState<OrderItem[]>(existingItems);
  
  // Store selection state
  const [selectedBrandId, setSelectedBrandId] = useState<string | undefined>(existingStoreSelection?.brandId);
  const [selectedCountryId, setSelectedCountryId] = useState<string | undefined>(existingStoreSelection?.countryId);
  const [selectedStoreId, setSelectedStoreId] = useState<string | undefined>(existingStoreSelection?.storeId);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | undefined>(
    existingWarehouseId ?? existingStoreSelection?.warehouseId
  );
  
  const [validationFilter, setValidationFilter] = useState<ValidationFilter>('all');
  const [uploadError, setUploadError] = useState<string>('');
  const [showReplaceDialog, setShowReplaceDialog] = useState(false);
  const [pendingAppendImport, setPendingAppendImport] = useState<ThriftedImportResult | null>(null);
  const [pendingReplaceImport, setPendingReplaceImport] = useState<ThriftedImportResult | null>(null);
  const [lastImportResult, setLastImportResult] = useState<ThriftedImportResult | null>(null);
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<ThriftedImportProgress | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isThriftedTableCompact = useMediaQuery('(max-width: 1023px)');
  const [requestOpenMobileItemId, setRequestOpenMobileItemId] = useState<string | null>(null);
  const [requestScrollToItemId, setRequestScrollToItemId] = useState<string | null>(null);
  const clearOpenMobileRequest = useCallback(() => setRequestOpenMobileItemId(null), []);
  const clearScrollRequest = useCallback(() => setRequestScrollToItemId(null), []);
  const templateAvailability = useMemo(() => getThriftedTemplateAvailability(), []);

  const isEditing = !!existingOrderId;
  const canEditItems = !isEditing || orderStatus === 'pending' || orderStatus === 'draft';
  const canEditLocation =
    !isEditing || orderStatus === 'pending' || orderStatus === 'draft' || orderStatus === 'registered';

  const partnerWarehouses = useMemo(
    () => warehouses.filter((w) => w.partnerId === currentPartner?.id),
    [warehouses, currentPartner?.id]
  );

  useEffect(() => {
    if (selectedWarehouseId || partnerWarehouses.length === 0) return;
    setSelectedWarehouseId(partnerWarehouses[0].id);
  }, [partnerWarehouses, selectedWarehouseId]);

  const sortedBrands = useMemo(() => sortByNameAlpha(brands), [brands]);

  const availableCountries = useMemo(() => {
    if (!selectedBrandId) return [];
    return sortByNameAlpha(countries.filter((c) => c.brandId === selectedBrandId));
  }, [countries, selectedBrandId]);

  const availableStores = useMemo(() => {
    if (!selectedBrandId || !selectedCountryId) return [];
    return sortStoresByCode(
      stores.filter(
        (s) => s.brandId === selectedBrandId && s.countryId === selectedCountryId
      )
    );
  }, [stores, selectedBrandId, selectedCountryId]);

  const selectedWarehouseRecord = selectedWarehouseId
    ? partnerWarehouses.find((w) => w.id === selectedWarehouseId)
    : undefined;

  // Build store selection object (includes sending warehouse)
  const storeSelection: StoreSelection | undefined =
    selectedBrandId && selectedCountryId && selectedStoreId && selectedWarehouseId
      ? {
          brandId: selectedBrandId,
          countryId: selectedCountryId,
          storeId: selectedStoreId,
          storeCode: stores.find((s) => s.id === selectedStoreId)?.code || '',
          warehouseId: selectedWarehouseId,
          warehouseName: selectedWarehouseRecord?.name || ''
        }
      : undefined;

  const selectedCountryRecord = selectedCountryId ? countries.find(c => c.id === selectedCountryId) : undefined;
  const selectedCurrency = selectedCountryRecord ? getCurrencyFromCountry(selectedCountryRecord.name) : undefined;
  const partnerIdForPricing = currentPartner?.id || '2';

  // Validation stats
  const totalItems = orderItems.length;
  const itemHasFieldErrors = (item: OrderItem) =>
    !!item.fieldErrors && Object.keys(item.fieldErrors).length > 0;
  const itemsWithErrors = orderItems.filter(itemHasFieldErrors).length;
  const validItems = orderItems.filter((item) => !itemHasFieldErrors(item)).length;
  const itemsWithDuplicateWarnings = orderItems.filter((item) => hasDuplicateFieldErrors(item)).length;

  // Filter items based on validation filter (only for bulk upload); memoized so ItemDetailsTable
  // does not get a new `items` reference on every render (avoids killing add-row effects).
  const filteredItems = useMemo(() => {
    if (creationMethod !== 'bulk') return orderItems;
    return orderItems.filter((item) => {
      if (validationFilter === 'duplicates') return hasDuplicateFieldErrors(item);
      if (validationFilter === 'errors') return itemHasFieldErrors(item);
      if (validationFilter === 'valid') return !itemHasFieldErrors(item);
      return true;
    });
  }, [creationMethod, orderItems, validationFilter]);

  const tableItemsForDisplay = useMemo(
    () =>
      filteredItems.map((item) => ({
        ...item,
        partnerItemId: item.partnerItemId ?? item.sku ?? '',
        subcategory: item.subcategory || '',
        price: item.price || 0,
        imageUrl: undefined,
        fieldErrors: item.fieldErrors,
      })),
    [filteredItems]
  );
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

  const getSuggestedValidationFilter = (result: ThriftedImportResult): ValidationFilter => {
    if (result.duplicates.affectedRows > 0) {
      return 'duplicates';
    }
    if (result.summary.rejectedCount > 0 || result.summary.skippedCount > 0) {
      return 'errors';
    }
    return 'all';
  };

  const clearPendingImports = () => {
    setPendingAppendImport(null);
    setPendingReplaceImport(null);
  };

  const readFileAsText = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve((event.target?.result as string) || '');
      reader.onerror = () => reject(new Error('Error reading file. Please ensure it is a valid CSV.'));
      reader.readAsText(file);
    });

  const applyImportResult = (result: ThriftedImportResult, mode: 'replace' | 'append') => {
    if (mode === 'replace') {
      setOrderItems(result.items);
    } else {
      setOrderItems((prev) => [...prev, ...result.items]);
    }

    setLastImportResult(result);
    setUploadProgress(result.progress);
    setUploadError('');
    setValidationFilter(getSuggestedValidationFilter(result));
    setStep('items');
    setShowStoreEdit(false);
    setShowReplaceDialog(false);
    clearPendingImports();
  };

  const renderImportSummary = (
    result: ThriftedImportResult,
    title: string,
    description: string
  ) => (
    <div className="rounded-xl border border-outline bg-surface-container p-4 space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <p className="label-large text-on-surface">{title}</p>
          <p className="body-small text-on-surface-variant mt-1">{description}</p>
        </div>
        <Badge variant="outline" className="label-medium">
          {result.summary.totalRows} rows
        </Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-lg bg-tertiary-container/60 px-3 py-2">
          <p className="label-small text-on-tertiary-container">Imported</p>
          <p className="title-medium text-on-tertiary-container">{result.summary.importedCount}</p>
        </div>
        <div className="rounded-lg bg-error-container/60 px-3 py-2">
          <p className="label-small text-on-error-container">Rejected</p>
          <p className="title-medium text-on-error-container">{result.summary.rejectedCount}</p>
        </div>
        <div className="rounded-lg bg-secondary-container/60 px-3 py-2">
          <p className="label-small text-on-secondary-container">Skipped</p>
          <p className="title-medium text-on-secondary-container">{result.summary.skippedCount}</p>
        </div>
        <div className="rounded-lg bg-surface-container-high px-3 py-2">
          <p className="label-small text-on-surface-variant">Duplicate rows</p>
          <p className="title-medium text-on-surface">{result.summary.duplicateRows}</p>
        </div>
      </div>

      <div className="rounded-lg bg-surface px-3 py-2">
        <p className="body-small text-on-surface-variant">
          Processed locally in {result.summary.chunkCount || 0} chunk{result.summary.chunkCount === 1 ? '' : 's'} of up to {result.summary.chunkSize.toLocaleString()} rows.
        </p>
      </div>

      {result.duplicates.affectedRows > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 body-small text-on-surface-variant">
          <div className="rounded-lg bg-surface px-3 py-2">
            Within file: {result.duplicates.withinFileItemId} duplicate Item ID{result.duplicates.withinFileItemId === 1 ? '' : 's'}, {result.duplicates.withinFileSku} duplicate SKU{result.duplicates.withinFileSku === 1 ? '' : 's'}.
          </div>
          <div className="rounded-lg bg-surface px-3 py-2">
            Current order: {result.duplicates.currentOrderItemId} Item ID conflict{result.duplicates.currentOrderItemId === 1 ? '' : 's'}, {result.duplicates.currentOrderSku} SKU conflict{result.duplicates.currentOrderSku === 1 ? '' : 's'}.
          </div>
        </div>
      )}
    </div>
  );

  const renderUploadStatus = () => (
    <>
      {isProcessingUpload && uploadProgress && (
        <div className="rounded-xl border border-outline bg-surface-container p-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="label-large text-on-surface">Processing upload</p>
              <p className="body-small text-on-surface-variant">
                Splitting the file locally into chunks of {THRIFTED_IMPORT_CHUNK_SIZE.toLocaleString()} rows.
              </p>
            </div>
            <Badge variant="outline" className="label-medium">
              {uploadProgress.percentage}%
            </Badge>
          </div>
          <Progress value={uploadProgress.percentage} />
          <p className="body-small text-on-surface-variant">
            Chunk {Math.max(uploadProgress.currentChunk, 1)} of {Math.max(uploadProgress.totalChunks, 1)}. {uploadProgress.processedRows.toLocaleString()} of {uploadProgress.totalRows.toLocaleString()} rows processed.
          </p>
        </div>
      )}

      {lastImportResult &&
        renderImportSummary(
          lastImportResult,
          'Last upload result',
          lastImportResult.existingOrderConflictsIncluded
            ? 'This summary includes duplicate checks against the current order for append mode.'
            : 'This summary reflects the rows currently staged from the last upload.'
        )}
    </>
  );

  const handleDownloadTemplate = () => {
    if (!templateAvailability.endpointLive) {
      return;
    }

    const template = generateThriftedTemplateCSV();
    downloadCSV(template, 'thrifted-order-template.csv');
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessingUpload(true);
    setUploadError('');
    setUploadProgress(null);
    clearPendingImports();

    try {
      const content = await readFileAsText(file);
      const csvRows = parseCSV(content);
      const appendPreview = await processMockThriftedImport(csvRows, {
        existingItems: orderItems,
        chunkSize: THRIFTED_IMPORT_CHUNK_SIZE,
        onProgress: setUploadProgress,
      });
      const replacePreview = stripCurrentOrderConflictsFromThriftedImport(appendPreview);

      if (appendPreview.summary.totalRows === 0) {
        setUploadError('No rows were found in the file.');
        return;
      }

      if (orderItems.length > 0) {
        setPendingAppendImport(appendPreview);
        setPendingReplaceImport(replacePreview);
        setShowReplaceDialog(true);
      } else {
        applyImportResult(replacePreview, 'replace');
      }
    } catch (error) {
      setUploadError(
        error instanceof Error
          ? error.message
          : 'Error reading file. Please ensure it is a valid CSV.'
      );
      setUploadProgress(null);
    } finally {
      setIsProcessingUpload(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleReplaceItems = () => {
    if (!pendingReplaceImport) {
      return;
    }

    applyImportResult(pendingReplaceImport, 'replace');
  };

  const handleAppendItems = () => {
    if (!pendingAppendImport) {
      return;
    }

    applyImportResult(pendingAppendImport, 'append');
  };

  const handleAddItem = () => {
    // Create an empty row for manual entry
    const newId = `item-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    const newItem: OrderItem = {
      id: newId,
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
      status: 'draft',
      source: 'manual',
      fieldErrors: {
        subcategory: 'Required',
        size: 'Required',
        brand: 'Required',
        color: 'Required',
        price: 'Required (Mandatory)',
        retailerItemId: 'Required (Mandatory)'
      },
      errors: Object.values({
        subcategory: 'Required',
        size: 'Required',
        brand: 'Required',
        color: 'Required',
        price: 'Required (Mandatory)',
        retailerItemId: 'Required (Mandatory)'
      }),
    };

    flushSync(() => {
      setOrderItems((prev) => [...prev, newItem]);
      // New rows have field errors until filled — ensure they are visible (e.g. not hidden behind "Valid" filter).
      setValidationFilter('all');
    });
    if (isThriftedTableCompact) {
      setRequestOpenMobileItemId(newId);
      setRequestScrollToItemId(null);
    } else {
      setRequestScrollToItemId(newId);
      setRequestOpenMobileItemId(null);
    }
  };

  const handleDeleteItem = (itemId: string) => {
    setOrderItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleUpdateItem = (itemId: string, field: keyof ItemDetailsTableItem, value: any) => {
    setOrderItems(prev => prev.map(item => {
      if (item.id !== itemId) return item;

      const stringish = (v: unknown) =>
        typeof v === 'string' ? v : v != null ? String(v) : '';

      let updatedItem: OrderItem;
      let actualField: keyof OrderItem = field as keyof OrderItem;
      let actualValue = value;

      // External ID: keep sku and partnerItemId in sync; do not overwrite retailer itemId
      if (field === 'partnerItemId' || field === 'sku') {
        const ext = stringish(value);
        updatedItem = { ...item, sku: ext, partnerItemId: ext };
        actualField = 'sku';
        actualValue = ext;
      } else {
        updatedItem = { ...item, [field]: value };
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
      
      if (actualField === 'sku') {
        delete fieldErrors.sku;
        delete fieldErrors.partnerItemId;
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
      
      const hasErrors = Object.keys(fieldErrors).length > 0;
      updatedItem.status = 'draft';
      updatedItem.fieldErrors = hasErrors ? fieldErrors : undefined;
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
  const canCreateOrder = storeSelection && orderItems.length > 0 && !isProcessingUpload;

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
                <CardTitle className="title-large text-on-surface">Receiving Store{HIGHLIGHT_NEW && <span className="new-badge">NEW</span>}</CardTitle>
                {storeSelection && !showStoreEdit && (
                  <p className="body-small text-on-surface-variant mt-0.5">
                    {selectedBrand?.name} • {selectedCountry?.name}
                    {selectedWarehouseRecord?.name ? ` • Sending: ${selectedWarehouseRecord.name}` : ''}
                  </p>
                )}
              </div>
            </div>
            {storeSelection && canEditLocation && step === 'items' && (
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="label-large text-on-surface">Brand</Label>
                  <Select
                    value={selectedBrandId}
                    onValueChange={(value: string) => {
                      setSelectedBrandId(value);
                      setSelectedCountryId(undefined);
                      setSelectedStoreId(undefined);
                    }}
                    disabled={!canEditLocation}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {sortedBrands.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id}>
                          <span className="body-large">{brand.name}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="label-large text-on-surface">Country</Label>
                  <Select
                    value={selectedCountryId}
                    onValueChange={(value: string) => {
                      setSelectedCountryId(value);
                      setSelectedStoreId(undefined);
                    }}
                    disabled={!selectedBrandId || !canEditLocation}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a country" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCountries.map((country) => (
                        <SelectItem key={country.id} value={country.id}>
                          <span className="body-large">{country.name}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

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
                    disabled={!selectedCountryId || !canEditLocation}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a store" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableStores.map((store) => (
                        <SelectItem key={store.id} value={store.id}>
                          <span className="body-large">
                            {store.name} ({store.code})
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="label-large text-on-surface">Warehouse (sender)</Label>
                <Select
                  value={selectedWarehouseId}
                  onValueChange={(value: string) => setSelectedWarehouseId(value)}
                  disabled={!canEditLocation || partnerWarehouses.length === 0}
                >
                  <SelectTrigger className="w-full md:max-w-md">
                    <SelectValue placeholder="Select sending warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    {partnerWarehouses.map((wh) => (
                      <SelectItem key={wh.id} value={wh.id}>
                        <span className="body-large">{wh.name}</span>
                        <span className="body-small text-on-surface-variant ml-2">({wh.location})</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {partnerWarehouses.length === 0 && (
                  <p className="body-small text-on-surface-variant">No warehouses available for this partner.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-1 py-2">
              <p className="title-medium text-on-surface">
                {selectedStore?.name} ({selectedStore?.code})
              </p>
              {selectedWarehouseRecord && (
                <p className="body-small text-on-surface-variant">
                  Sending warehouse: {selectedWarehouseRecord.name}
                </p>
              )}
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
              disabled={!canEditItems}
              className={`p-4 border rounded-xl transition-colors text-left ${
                creationMethod === 'manual'
                  ? 'border-primary bg-primary-container'
                  : 'border-outline hover:bg-surface-container-high'
              } ${!canEditItems ? 'opacity-50 cursor-not-allowed' : ''}`}
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
              disabled={!canEditItems}
              className={`p-4 border rounded-xl transition-colors text-left ${
                creationMethod === 'bulk'
                  ? 'border-primary bg-primary-container'
                  : 'border-outline hover:bg-surface-container-high'
              } ${!canEditItems ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                  creationMethod === 'bulk'
                    ? 'bg-primary text-on-primary'
                    : 'bg-primary-container text-on-primary-container'
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
                disabled={!templateAvailability.endpointLive || isProcessingUpload}
              >
                <DownloadIcon size={20} className="mr-2" />
                <span className="label-large">{templateAvailability.buttonLabel}</span>
              </Button>

              <div className="relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  disabled={isProcessingUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <Button
                  variant="default"
                  className="w-full bg-primary text-on-primary"
                  size="lg"
                  disabled={isProcessingUpload}
                >
                  <UploadIcon size={20} className="mr-2" />
                  <span className="label-large">
                    {isProcessingUpload ? 'Processing CSV...' : 'Upload CSV File'}
                  </span>
                </Button>
              </div>
            </div>

            <p className="body-small text-on-surface-variant">{templateAvailability.helperText}</p>

            {uploadError && (
              <Alert variant="destructive">
                <AlertTriangleIcon className="h-4 w-4" />
                <AlertDescription className="body-small">{uploadError}</AlertDescription>
              </Alert>
            )}

            {renderUploadStatus()}

            <div className="p-3 bg-surface-container rounded-lg">
              <p className="label-small text-on-surface-variant mb-2">CSV Format Requirements:</p>
              <ul className="space-y-1 body-small text-on-surface-variant">
                <li>• Required columns: SKU, Retailer ID*, Item brand, Subcategory, Size, Color, Gender, Price (SEK)*</li>
                <li>• <strong>Retailer ID*</strong> and <strong>Price (SEK)*</strong> are mandatory</li>
                <li>• Subcategory options: {getAllThriftedSubcategories().join(', ')}</li>
                <li>• Category is automatically mapped from Subcategory</li>
                <li>• Gender options: Women, Men, Kids, Unisex</li>
                <li>• Price must be one of the valid SEK price ladder values</li>
                <li>• Duplicate checks run within the file and, when appending, against the current order</li>
                <li>• Files larger than {THRIFTED_IMPORT_CHUNK_SIZE.toLocaleString()} rows are processed locally in chunks and merged into one result</li>
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
          disabled={!storeSelection || (creationMethod === 'bulk' && orderItems.length === 0) || isProcessingUpload}
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
    <div className="space-y-6">
      {/* Re-upload Section (for bulk uploads only) */}
      {canEditItems && creationMethod === 'bulk' && (
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
                disabled={!templateAvailability.endpointLive || isProcessingUpload}
              >
                <DownloadIcon size={20} />
                <span className="label-large">{templateAvailability.buttonLabel}</span>
              </Button>

              <div className="relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  disabled={isProcessingUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <Button
                  variant="default"
                  className="w-full bg-secondary text-on-secondary gap-2"
                  size="lg"
                  disabled={isProcessingUpload}
                >
                  <UploadIcon size={20} />
                  <span className="label-large">
                    {isProcessingUpload ? 'Processing CSV...' : `${orderItems.length > 0 ? 'Re-import' : 'Upload'} CSV`}
                  </span>
                </Button>
              </div>
            </div>

            <p className="body-small text-on-surface-variant">{templateAvailability.helperText}</p>

            {uploadError && (
              <Alert variant="destructive">
                <AlertTriangleIcon className="h-4 w-4" />
                <AlertDescription className="body-small">{uploadError}</AlertDescription>
              </Alert>
            )}

            {renderUploadStatus()}

            <div className="p-3 bg-surface-container rounded-lg">
              <p className="label-small text-on-surface-variant mb-2">CSV Format Requirements:</p>
              <ul className="space-y-1 body-small text-on-surface-variant">
                <li>• Required columns: SKU, Retailer ID*, Item brand, Subcategory, Size, Color, Gender, Price (SEK)*</li>
                <li>• <strong>Retailer ID*</strong> and <strong>Price (SEK)*</strong> are mandatory</li>
                <li>• Subcategory options: {getAllThriftedSubcategories().join(', ')}</li>
                <li>• Category is automatically mapped from Subcategory</li>
                <li>• Gender options: Women, Men, Kids, Unisex</li>
                <li>• Price must be one of the valid SEK price ladder values</li>
                <li>• Duplicate checks run within the file and, when appending, against the current order</li>
                <li>• Files larger than {THRIFTED_IMPORT_CHUNK_SIZE.toLocaleString()} rows are processed locally in chunks and merged into one result</li>
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
              {canEditItems && (
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
              {itemsWithDuplicateWarnings > 0 && (
                <Badge variant="outline" className="label-medium border-warning text-warning">
                  {itemsWithDuplicateWarnings} duplicates
                </Badge>
              )}
              {validItems > 0 && (
                <Badge variant="default" className="bg-tertiary-container text-on-tertiary-container label-medium">
                  {validItems} valid
                </Badge>
              )}
              {canEditItems && orderItems.length > 0 && (
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
                  {itemsWithDuplicateWarnings > 0 && (
                    <Button
                      variant={validationFilter === 'duplicates' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setValidationFilter('duplicates')}
                      className="label-large"
                    >
                      Duplicates ({itemsWithDuplicateWarnings})
                    </Button>
                  )}
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
                    {itemsWithErrors} item{itemsWithErrors > 1 ? 's have' : ' has'} row issues. Rejected rows have validation problems; skipped rows are duplicate collisions.
                  </AlertDescription>
                </Alert>
              )}

              {creationMethod === 'bulk' && itemsWithDuplicateWarnings > 0 && validationFilter === 'duplicates' && (
                <Alert className="mb-4 border-warning bg-warning-container/30">
                  <AlertTriangleIcon className="h-4 w-4 text-warning" />
                  <AlertDescription className="body-small text-on-warning-container">
                    {itemsWithDuplicateWarnings} item{itemsWithDuplicateWarnings > 1 ? 's are' : ' is'} flagged as duplicates. Use this filter to review collisions within the file or against the current order.
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}

          {/* Items Table/Cards */}
          {orderItems.length > 0 ? (
            <>
              <ItemDetailsTable
                items={tableItemsForDisplay}
                showRetailerId={true}
                showPurchasePrice={false}
                showPrice={true}
                showStatus={true}
                isEditable={canEditItems}
                onUpdateItem={handleUpdateItem}
                onDeleteItem={canEditItems ? handleDeleteItem : undefined}
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
                thriftedPartnerTable
                brandAutocompleteOptions={brandSuggestions}
                requestOpenMobileItemId={requestOpenMobileItemId}
                onRequestOpenMobileItemIdConsumed={clearOpenMobileRequest}
                requestScrollToItemId={requestScrollToItemId}
                onRequestScrollToItemIdConsumed={clearScrollRequest}
              />

              {/* Delete Items Actions */}
              {canEditItems && filteredItems.length > 0 && (
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
                    <span className="label-large">Delete {validationFilter === 'all' ? 'All' : validationFilter === 'errors' ? 'Error' : validationFilter === 'duplicates' ? 'Duplicate' : 'Valid'} Items</span>
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

      {/* In-flow space so the last table row clears the fixed footer (footer height + validation varies) */}
      <div
        aria-hidden
        className="w-full shrink-0 min-h-[min(48vh,36rem)] lg:min-h-[min(42vh,40rem)]"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-surface">
      <SharedHeader 
        title={isEditing ? "Edit Order" : "Create New Order"}
        onBack={onBack}
      />

      <div
        className={`px-4 md:px-6 lg:px-8 py-6 space-y-6 ${
          step === 'items'
            ? 'pb-[min(28rem,55vh)] lg:pb-[min(32rem,50vh)]'
            : 'pb-8'
        }`}
      >
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
                    {itemsWithDuplicateWarnings > 0 && (
                      <Badge variant="outline" className="border-warning text-warning">
                        {itemsWithDuplicateWarnings} duplicate{itemsWithDuplicateWarnings === 1 ? '' : 's'}
                      </Badge>
                    )}
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
      <Dialog
        open={showReplaceDialog}
        onOpenChange={(open) => {
          setShowReplaceDialog(open);
          if (!open) {
            clearPendingImports();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="title-large">Replace or Append Items?</DialogTitle>
            <DialogDescription className="body-medium">
              You have {orderItems.length} existing items. Review the mocked import outcomes before deciding whether to replace or append.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-3 py-2 md:grid-cols-2">
            {pendingReplaceImport &&
              renderImportSummary(
                pendingReplaceImport,
                'Replace preview',
                'Current-order duplicate checks are ignored because the existing rows would be replaced.'
              )}
            {pendingAppendImport &&
              renderImportSummary(
                pendingAppendImport,
                'Append preview',
                'Current-order duplicate checks stay active, so conflicting rows will be marked as skipped.'
              )}
          </div>

          <div className="flex flex-col gap-3 py-4">
            <Button
              onClick={handleReplaceItems}
              variant="destructive"
              size="lg"
              className="w-full"
              disabled={!pendingReplaceImport}
            >
              <XIcon size={20} className="mr-2" />
              <span className="label-large">Replace All Items</span>
            </Button>

            <Button
              onClick={handleAppendItems}
              variant="default"
              size="lg"
              className="w-full bg-primary text-on-primary"
              disabled={!pendingAppendImport}
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
                clearPendingImports();
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
