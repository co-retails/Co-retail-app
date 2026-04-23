import React, { useState, useRef, useMemo, useCallback } from 'react';
import { flushSync } from 'react-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { SharedHeader } from './ui/shared-header';
import { useMediaQuery } from './ui/use-mobile';
import { Section } from './ui/section';
import { EmptyState } from './ui/empty-state';
import { ItemDetailsTable, ItemDetailsTableItem } from './ItemDetailsTable';
import { ItemCard, BaseItem } from './ItemCard';
import { toast } from 'sonner@2.0.3';
import StoreSelector, { type StoreSelection } from './StoreSelector';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Alert, AlertDescription } from './ui/alert';
import { 
  PackageIcon, 
  TruckIcon,
  ArrowLeftIcon,
  CalendarIcon,
  MapPinIcon,
  PencilIcon,
  Store as StoreIcon,
  AlertTriangleIcon,
  RotateCcw,
  CheckIcon,
  PlusIcon,
  ScanIcon,
  QrCodeIcon,
  MoreVertical,
  Trash2Icon,
  RotateCcwIcon,
  UploadIcon,
  DownloadIcon,
  FileSpreadsheetIcon,
  XIcon,
  Box as BoxIcon,
  Package,
  XCircle
} from 'lucide-react';
import { OrderItem } from './OrderCreationScreen';
import { PartnerOrder } from './PartnerDashboard';
import { DeliveryNote, Box } from './BoxManagementScreen';
import { ReturnDelivery } from './ShippingScreen';
import ActiveScanner from './ActiveScanner';
import BoxLabelSideSheet from './BoxLabelSideSheet';
import BoxCard from './BoxCard';
import ShippingLabelScreen from './ShippingLabelScreen';
import { 
  generateThriftedTemplateCSV, 
  downloadCSV, 
  parseCSV, 
  convertToThriftedOrderItems,
  exportThriftedItemsToCSV,
  exportReturnItemsToCSV,
  THRIFTED_VALID_VALUES,
  mapSubcategoryToCategory,
  getAllThriftedSubcategories,
  getAllThriftedSubcategoriesForBrand,
  getThriftedValidValues
} from '../utils/spreadsheetUtils';
import { getCurrencyFromCountry, getPriceOptionsForCurrency } from '../data/partnerPricing';
import PartnerWarehouseSelector, {
  type Partner,
  type Warehouse,
} from './PartnerWarehouseSelector';

export type DetailType = 'order' | 'shipment' | 'return';

export interface DetailItem extends ItemDetailsTableItem {}

interface OrderShipmentDetailsScreenProps {
  type: DetailType;
  data: PartnerOrder | DeliveryNote | ReturnDelivery;
  onBack: () => void;
  storeName?: string;
  storeCode?: string;
  partnerName?: string;
  warehouseName?: string;
  receiverLabel?: string;
  onNavigateToRetailerIdScan?: () => void;
  /** Pass `{ lineItems }` when registering from editable rows (e.g. Thrifted) so parent can persist items. */
  onRegisterOrder?: (payload?: { lineItems?: OrderItem[] }) => void;
  onCreateDeliveryNote?: (orderId: string) => void;
  isAdmin?: boolean;
  onAddBox?: (deliveryNoteId: string, boxLabel: string) => void;
  onOpenBoxDetails?: (box: Box) => void;
  orderItems?: OrderItem[];
  onUnregisterBox?: (boxId: string) => void;
  onDeleteBox?: (boxId: string) => void;
  relatedOrders?: Array<{
    id: string;
    externalOrderId?: string;
  }>;
  onSaveAndClose?: () => void;
  /** Persist Thrifted draft line items (partner app); then screen calls onBack. */
  onSaveThriftedOrderDraft?: (orderId: string, items: OrderItem[]) => void;
  onRegisterDelivery?: (shippingLabel?: string) => void;
  onUpdateReturnDeliveryStatus?: (deliveryId: string, status: 'Returned') => void;
  onCancelReturn?: (deliveryId: string, reason: string) => void;
  currentUserRole?: 'partner' | 'store-staff' | 'admin';
  countries?: Array<{ id: string; name: string; brandId: string }>;
  stores?: Array<{ id: string; name: string; code: string; countryId: string; brandId: string }>;
  brands?: Array<{ id: string; name: string }>;
  onUpdateBoxLabel?: (boxId: string, newLabel: string) => void;
  onUpdateReceiver?: (orderId: string, selection: StoreSelection) => void;
  /** Partner sending warehouses — used to edit sender (Thrifted draft / registered). */
  warehouses?: Warehouse[];
  /** Update sending warehouse for the open order or delivery note (parent resolves id from details). */
  onUpdateSenderWarehouse?: (warehouseId: string) => void;
  /** Partner list for sender warehouse sheet (same component family as receiver store picker). */
  partners?: Partner[];
}

/** Brand names from app catalog for Thrifted item-brand autocomplete */
function useBrandAutocompleteOptions(
  brands: Array<{ id: string; name: string }>
): string[] {
  return useMemo(
    () =>
      brands
        .map((b) => b.name?.trim())
        .filter((n): n is string => Boolean(n)),
    [brands]
  );
}

// Valid price points for SEK (Swedish Krona) - Sellpy partner market
const PRICE_OPTIONS_SEK = [50, 75, 100, 120, 150, 200, 250, 300, 400, 500, 600, 750, 1000, 1200, 1500, 2000];

// Mock items for demonstration - in real app this would come from API
const generateMockItems = (count: number, type: DetailType, partnerName?: string, orderStatus?: string): DetailItem[] => {
  const brands = ['WEEKDAY', 'COS', 'Monki', 'H&M'];
  const categories = ['Clothing', 'Shoes', 'Accessories'];
  const subcategories = ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Sneakers', 'Boots', 'Bags', 'Scarves'];
  const colors = ['Black', 'White', 'Blue', 'Red', 'Gray', 'Green', 'Navy', 'Beige'];
  const sizes = ['XS', 'S', 'M', 'L', 'XL', '36', '37', '38', '39', '40'];

  // Determine if this is a Thrifted or Sellpy order
  const isThrifted = partnerName === 'Thrifted';
  const isSellpy = partnerName === 'Sellpy Operations' || partnerName === 'Sellpy';
  const isPending = orderStatus === 'pending';

  return Array.from({ length: count }, (_, index) => {
    // Use valid SEK price points instead of random prices
    const price = PRICE_OPTIONS_SEK[Math.floor(Math.random() * PRICE_OPTIONS_SEK.length)];
    const purchasePrice = parseFloat((price * (0.4 + Math.random() * 0.3)).toFixed(2)); // 40-70% of retail price
    
    // For Thrifted pending orders: all items must be valid (no errors)
    // For Sellpy pending orders: some items should have validation errors
    let itemStatus: 'error' | undefined = undefined;
    let fieldErrors: Record<string, string> | undefined = undefined;
    let errors: string[] | undefined = undefined;
    let retailerItemId: string | undefined = undefined;

    if (type === 'order' && isPending) {
      if (isThrifted) {
        // Thrifted pending orders: all items valid, all have retailer IDs
        retailerItemId = `RID-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        itemStatus = undefined;
      } else if (isSellpy) {
        // Sellpy pending orders: ~30% of items have validation errors
        // Note: Category and subcategory are ALWAYS filled in for Sellpy (AI price fork suggests them)
        const hasError = index % 3 === 0; // Every 3rd item has an error
        if (hasError) {
          itemStatus = 'error';
          // Create realistic validation errors (category/subcategory are never errors for Sellpy)
          const errorTypes = [
            { field: 'brand', message: 'Item brand is required' },
            { field: 'size', message: 'Size is required' },
            { field: 'color', message: 'Color is required' },
            { field: 'price', message: 'Select valid price' }
          ];
          const errorType = errorTypes[Math.floor(Math.random() * errorTypes.length)];
          fieldErrors = { [errorType.field]: errorType.message };
          errors = [errorType.message];
        } else {
          // Some valid items may not have retailer IDs yet
          retailerItemId = Math.random() > 0.4 ? `RID-${Math.random().toString(36).substring(2, 8).toUpperCase()}` : undefined;
        }
      } else {
        // Other partners: default behavior
        retailerItemId = Math.random() > 0.3 ? `RID-${Math.random().toString(36).substring(2, 8).toUpperCase()}` : undefined;
      }
    } else {
      // Non-pending orders or other types: default behavior
      retailerItemId = type === 'order' && Math.random() > 0.3 ? `RID-${Math.random().toString(36).substring(2, 8).toUpperCase()}` : undefined;
      itemStatus = type === 'return' ? undefined : (Math.random() > 0.8 ? 'pending' : undefined);
    }
    
    // For Sellpy orders, ALWAYS generate partnerItemId (External ID)
    // For other partners, also generate it but it's optional
    const selectedBrand = itemStatus === 'error' && fieldErrors?.brand ? brands[0] : brands[Math.floor(Math.random() * brands.length)];
    const partnerItemId = isSellpy 
      ? `${selectedBrand.substring(0, 2).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${index + 1}`
      : `${selectedBrand.substring(0, 2).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    
    // For Sellpy orders, category and subcategory are ALWAYS filled in (AI price fork suggests them)
    // For other partners, category/subcategory may be empty if there's an error
    const selectedCategory = categories[Math.floor(Math.random() * categories.length)];
    const selectedSubcategory = subcategories[Math.floor(Math.random() * subcategories.length)];
    const category = isSellpy 
      ? selectedCategory  // Always filled for Sellpy
      : (itemStatus === 'error' && fieldErrors?.category ? '' : selectedCategory);
    const subcategory = isSellpy 
      ? selectedSubcategory  // Always filled for Sellpy
      : subcategories[Math.floor(Math.random() * subcategories.length)];
    
    return {
      id: `item-${type}-${index + 1}`,
      itemId: type === 'return' ? `RET-${Math.random().toString(36).substring(2, 8).toUpperCase()}` : '',
      brand: itemStatus === 'error' && fieldErrors?.brand ? '' : selectedBrand,
      gender: Math.random() > 0.5 ? 'Women' : 'Men',
      category: category,
      subcategory: subcategory,
      size: itemStatus === 'error' && fieldErrors?.size ? undefined : (Math.random() > 0.7 ? undefined : sizes[Math.floor(Math.random() * sizes.length)]),
      color: itemStatus === 'error' && fieldErrors?.color ? '' : colors[Math.floor(Math.random() * colors.length)],
      price: itemStatus === 'error' && fieldErrors?.price ? 0 : price,
      purchasePrice: purchasePrice,
      status: itemStatus,
      partnerItemId: partnerItemId,
      retailerItemId: retailerItemId,
      source: 'detail-mock' as const,
      fieldErrors: fieldErrors,
      errors: errors
    };
  });
};

export default function OrderShipmentDetailsScreen({
  type,
  data,
  onBack,
  storeName: storeNameProp,
  storeCode: storeCodeProp,
  partnerName: partnerNameProp,
  warehouseName: warehouseNameProp,
  receiverLabel,
  onNavigateToRetailerIdScan,
  onRegisterOrder,
  onCreateDeliveryNote,
  isAdmin = false,
  onAddBox,
  onOpenBoxDetails,
  orderItems = [],
  onUpdateReceiver,
  onUnregisterBox,
  onDeleteBox,
  relatedOrders = [],
  onSaveAndClose,
  onSaveThriftedOrderDraft,
  onRegisterDelivery,
  onUpdateReturnDeliveryStatus,
  onCancelReturn,
  currentUserRole,
  countries = [],
  stores = [],
  brands = [],
  onUpdateBoxLabel,
  warehouses = [],
  onUpdateSenderWarehouse,
  partners = []
}: OrderShipmentDetailsScreenProps) {
  const brandAutocompleteOptions = useBrandAutocompleteOptions(brands);

  // State for editable items
  const [editableItems, setEditableItems] = useState<DetailItem[]>([]);
  const [validationFilter, setValidationFilter] = useState<'all' | 'errors' | 'valid'>('all');
  const [showAddBoxDialog, setShowAddBoxDialog] = useState(false);
  const [boxLabel, setBoxLabel] = useState('');
  const [showBoxLabelScan, setShowBoxLabelScan] = useState(false);
  const [boxBeingEdited, setBoxBeingEdited] = useState<Box | null>(null);
  
  // State for Thrifted order editing
  const [showReplaceDialog, setShowReplaceDialog] = useState(false);
  const [pendingUploadItems, setPendingUploadItems] = useState<OrderItem[]>([]);
  const [uploadError, setUploadError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isTableCompact = useMediaQuery('(max-width: 1023px)');
  const [requestOpenMobileItemId, setRequestOpenMobileItemId] = useState<string | null>(null);
  const [requestScrollToItemId, setRequestScrollToItemId] = useState<string | null>(null);
  const clearOpenMobileRequest = useCallback(() => setRequestOpenMobileItemId(null), []);
  const clearScrollRequest = useCallback(() => setRequestScrollToItemId(null), []);

  const getTitle = () => {
    switch (type) {
      case 'order':
        return 'Order details';
      case 'shipment':
        return 'Delivery details';
      case 'return':
        return 'Return details';
      default:
        return 'Details';
    }
  };

  const getStatusColor = () => {
    if (type === 'order') {
      const order = data as PartnerOrder;
      switch (order.status) {
        case 'approval': return 'text-warning';
        case 'pending': return 'text-on-surface-variant';
        case 'draft': return 'text-on-surface-variant';
        case 'registered': return 'text-tertiary';
        case 'in-transit': return 'text-primary';
        case 'delivered': return 'text-success';
        case 'in-review': return 'text-warning';
        default: return 'text-on-surface-variant';
      }
    } else if (type === 'shipment') {
      const shipment = data as DeliveryNote;
      switch (shipment.status) {
        case 'draft': return 'text-on-surface-variant';
        case 'pending': return 'text-on-surface-variant';
        case 'registered': return 'text-primary';
        case 'delivered': return 'text-success';
        case 'rejected': return 'text-error';
        default: return 'text-on-surface-variant';
      }
    } else {
      const returnData = data as ReturnDelivery;
      switch (returnData.status) {
        case 'Pending': return 'text-on-surface-variant';
        case 'In transit': return 'text-primary';
        case 'Returned': return 'text-success';
        case 'Cancelled': return 'text-error';
        default: return 'text-on-surface-variant';
      }
    }
  };

  const getStatusDisplay = () => {
    if (type === 'order') {
      const order = data as PartnerOrder;
      switch (order.status) {
        case 'approval': return 'Approval';
        case 'pending': return 'Pending';
        case 'draft': return 'Draft';
        case 'registered': return 'Ready for Packaging';
        case 'in-transit': return 'In Transit';
        case 'delivered': return 'Delivered';
        case 'in-review': return 'In Review';
        default: return order.status;
      }
    } else if (type === 'shipment') {
      const shipment = data as DeliveryNote;
      switch (shipment.status) {
        case 'draft': return 'Draft';
        case 'pending': return 'Pending';
        case 'packing': return 'Packing';
        case 'registered': return 'In Transit';
        case 'delivered': return 'Delivered';
        case 'partially-delivered': return 'Partially Delivered';
        case 'cancelled': return 'Cancelled';
        case 'rejected': return 'Rejected';
        default: return shipment.status;
      }
    } else {
      const returnData = data as ReturnDelivery;
      return returnData.status;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'order':
        return <PackageIcon size={24} />;
      case 'shipment':
        return <TruckIcon size={24} />;
      case 'return':
        return <RotateCcw size={24} />;
      default:
        return <PackageIcon size={24} />;
    }
  };

  const getItemCount = () => {
    if (type === 'order') {
      return (data as PartnerOrder).itemCount;
    } else if (type === 'shipment') {
      // For shipments, we'll use the related order's item count or estimate from boxes
      return (data as DeliveryNote).boxes.length * 8; // Estimate 8 items per box
    } else {
      return (data as ReturnDelivery).items;
    }
  };

  const getDate = () => {
    if (type === 'order') {
      return (data as PartnerOrder).createdDate;
    } else if (type === 'shipment') {
      return (data as DeliveryNote).createdDate;
    } else {
      return (data as ReturnDelivery).date;
    }
  };

  const returnDelivery = type === 'return' ? (data as ReturnDelivery) : null;
  type PartnerOrderWithMeta = PartnerOrder & {
    partnerId?: string;
    partnerName?: string;
    receivingStoreId?: string;
    receivingStoreName?: string;
    storeCode?: string;
    warehouseName?: string;
  };
  type DeliveryNoteWithMeta = DeliveryNote & {
    partnerId?: string;
    partnerName?: string;
    storeId?: string;
    storeCode?: string;
    storeName?: string;
    warehouseName?: string;
  };
  const partnerOrderData = type === 'order' ? (data as PartnerOrderWithMeta) : undefined;
  const deliveryNoteData = type === 'shipment' ? (data as DeliveryNoteWithMeta) : undefined;
  const candidateStoreIds = [
    partnerOrderData?.receivingStoreId,
    deliveryNoteData?.storeId,
    returnDelivery?.storeId,
  ].filter((value): value is string => Boolean(value));
  const candidateStoreCodes = [
    storeCodeProp,
    partnerOrderData?.storeCode,
    deliveryNoteData?.storeCode,
    returnDelivery?.storeCode,
  ].filter((value): value is string => Boolean(value));
  const candidateStoreNames = [
    storeNameProp,
    partnerOrderData?.receivingStoreName,
    deliveryNoteData?.storeName,
    returnDelivery?.storeName,
    receiverLabel,
  ].filter((value): value is string => Boolean(value));
  const receivingStore = stores?.find((store) => {
    if (candidateStoreIds.some((id) => id === store.id)) return true;
    if (candidateStoreCodes.some((code) => code === store.code)) return true;
    if (candidateStoreNames.some((name) => name === store.name)) return true;
    return false;
  });
  const storeName = storeNameProp || partnerOrderData?.receivingStoreName || receivingStore?.name || returnDelivery?.storeName || receiverLabel;
  const storeCode = storeCodeProp || receivingStore?.code || returnDelivery?.storeCode || deliveryNoteData?.storeCode;
  const partnerName = partnerNameProp || partnerOrderData?.partnerName || deliveryNoteData?.partnerName || returnDelivery?.partnerName;
  const warehouseName = warehouseNameProp || partnerOrderData?.warehouseName || deliveryNoteData?.warehouseName || returnDelivery?.warehouseName;
  const currentOrderId = type === 'order'
    ? (data as PartnerOrder).id
    : type === 'shipment'
    ? (data as DeliveryNote).orderId
    : undefined;
  const currentReceiverSelection = useMemo<StoreSelection | undefined>(() => {
    if (receivingStore) {
      return {
        brandId: receivingStore.brandId,
        countryId: receivingStore.countryId,
        storeId: receivingStore.id,
        storeCode: receivingStore.code
      };
    }
    if (partnerOrderData?.receivingStoreId && stores) {
      const match = stores.find((store) => store.id === partnerOrderData.receivingStoreId);
      if (match) {
        return {
          brandId: match.brandId,
          countryId: match.countryId,
          storeId: match.id,
          storeCode: match.code
        };
      }
    }
    if (storeCode && stores) {
      const match = stores.find((store) => store.code === storeCode);
      if (match) {
        return {
          brandId: match.brandId,
          countryId: match.countryId,
          storeId: match.id,
          storeCode: match.code
        };
      }
    }
    return undefined;
  }, [receivingStore, partnerOrderData?.receivingStoreId, stores, storeCode]);
  const summaryDateValue = getDate();
  const formattedSummaryDate = summaryDateValue
    ? new Date(summaryDateValue).toISOString().split('T')[0]
    : '—';
  const statusDisplay = getStatusDisplay();
  const statusColor = getStatusColor();

  const getPrimaryIdentifierLabel = () => {
    if (type === 'order') {
      const order = data as PartnerOrder;
      return order.id ? `Order ${order.id}` : 'Order —';
    }
    if (type === 'shipment') {
      const shipment = data as DeliveryNote;
      return shipment.id ? `Delivery note ${shipment.id}` : 'Delivery note —';
    }
    return returnDelivery?.deliveryId ? `Return ${returnDelivery.deliveryId}` : 'Return —';
  };

  // Check if order is pending (editable)
  const orderStatus = type === 'order' ? (data as PartnerOrder).status : undefined;
  const isPendingOrder = type === 'order' && (orderStatus === 'pending' || orderStatus === 'draft');
  
  // Check if order is in approval status (only Admins can see)
  const isApprovalOrder = type === 'order' && (data as PartnerOrder).status === 'approval' && isAdmin;
  
  // Check if this is a Sellpy order (show prices)
  const isSellpyOrder = partnerName === 'Sellpy Operations' || partnerName === 'Sellpy';
  
  // Check if this is a Thrifted order
  const isThriftedOrder = partnerName === 'Thrifted';
  const thriftedValidValues = useMemo(
    () => getThriftedValidValues(receivingStore?.brandId),
    [receivingStore?.brandId]
  );
  
  // Check if Thrifted order is editable (pending status) - for item editing, CSV, etc.
  const isThriftedEditable = isThriftedOrder && isPendingOrder;
  // Check if receiver can be edited: Thrifted orders (pending or Ready for Packaging) and Thrifted deliveries (Pending, Packing, In transit)
  const isOrderReceiverEditable =
    isThriftedOrder &&
    type === 'order' &&
    ((data as PartnerOrder).status === 'pending' || (data as PartnerOrder).status === 'draft' || (data as PartnerOrder).status === 'registered');
  const isDeliveryReceiverEditable =
    isThriftedOrder &&
    type === 'shipment' &&
    ((data as DeliveryNote).status === 'draft' ||
      (data as DeliveryNote).status === 'packing' ||
      (data as DeliveryNote).status === 'registered');
  const isReceiverEditable = isOrderReceiverEditable || isDeliveryReceiverEditable;

  const shipmentNoteStatus = type === 'shipment' ? (data as DeliveryNote).status : undefined;
  const isOrderSenderEditable =
    isThriftedOrder &&
    type === 'order' &&
    (orderStatus === 'pending' || orderStatus === 'draft' || orderStatus === 'registered');
  const isShipmentSenderEditable =
    isThriftedOrder &&
    type === 'shipment' &&
    (shipmentNoteStatus === 'draft' ||
      shipmentNoteStatus === 'packing' ||
      shipmentNoteStatus === 'registered');
  const canEditSenderByStatus = isOrderSenderEditable || isShipmentSenderEditable;
  
  const [isReceiverSelectorOpen, setIsReceiverSelectorOpen] = useState(false);
  const [isSenderWarehouseOpen, setIsSenderWarehouseOpen] = useState(false);

  // Get brand name from store
  const receiverBrand = receivingStore 
    ? brands.find(b => b.id === receivingStore.brandId)?.name
    : (receiverLabel || undefined);
  
  // Get country name from store
  const countryName = receivingStore 
    ? countries.find(c => c.id === receivingStore.countryId)?.name
    : undefined;
  
  // Get currency from country
  const currency = countryName ? getCurrencyFromCountry(countryName) : undefined;
  
  // Get partner ID from partner name
  const partnerId = partnerOrderData?.partnerId
    || deliveryNoteData?.partnerId
    || returnDelivery?.partnerId
    || (
      partnerName === 'Sellpy Operations' || partnerName === 'Sellpy' 
        ? '1' 
        : partnerName === 'Thrifted' 
        ? '2' 
        : partnerName === 'Shenzhen Fashion Manufacturing'
        ? '6'
        : undefined
    );

  const partnerWarehouses = useMemo(() => {
    if (!partnerId) return warehouses;
    return warehouses.filter((w) => w.partnerId === partnerId);
  }, [warehouses, partnerId]);

  const currentSenderWarehouseId =
    type === 'order'
      ? (data as PartnerOrder).warehouseId
      : type === 'shipment'
        ? (data as DeliveryNote).warehouseId
        : undefined;

  const isSenderEditable =
    Boolean(onUpdateSenderWarehouse) &&
    canEditSenderByStatus &&
    partnerWarehouses.length > 0 &&
    Boolean(partnerId);

  // Validation function for Thrifted items
  // For Thrifted, partners fill in subcategory, category is auto-mapped
  const validateThriftedItem = (item: DetailItem): boolean => {
    // External ID (sku / partnerItemId) is optional for Thrifted partner drafts

    // Mandatory: Retailer ID
    if (!item.retailerItemId || !item.retailerItemId.trim()) return false;
    
    // Mandatory: Brand
    if (!item.brand || !item.brand.trim()) return false;
    
          // Mandatory: Category (must be selected first)
          if (!item.category || !item.category.trim()) return false;
          if (!THRIFTED_VALID_VALUES.categories.includes(item.category.trim())) return false;
          
          // Mandatory: Subcategory (must be valid for selected category)
          if (!item.subcategory || !item.subcategory.trim()) return false;
          const validSubcategories = THRIFTED_VALID_VALUES.subcategories[item.category.trim()] || [];
          if (!validSubcategories.includes(item.subcategory.trim())) return false;
    
    // Mandatory: Size
    if (!item.size || !item.size.trim()) return false;
    
    // Mandatory: Color
    if (!item.color || !item.color.trim()) return false;
    if (!THRIFTED_VALID_VALUES.colors.includes(item.color.trim())) return false;
    
    // Mandatory: Price
    if (!item.price || item.price <= 0) return false;
    if (!THRIFTED_VALID_VALUES.prices.includes(item.price)) return false;
    
    return true;
  };
  
  // Helper function to validate and set field errors for a Thrifted item
  const validateAndSetFieldErrors = (item: DetailItem): DetailItem => {
    const isValid = validateThriftedItem(item);
    const fieldErrors: Record<string, string> = {};

    if (!item.retailerItemId || !item.retailerItemId.trim()) {
      fieldErrors.retailerItemId = 'Required (Mandatory)';
    }
    if (!item.brand || !item.brand.trim()) fieldErrors.brand = 'Required';
    if (!item.category || !item.category.trim()) {
      fieldErrors.category = 'Required';
    } else if (!THRIFTED_VALID_VALUES.categories.includes(item.category.trim())) {
      fieldErrors.category = 'Invalid category';
    }
    if (!item.subcategory || !item.subcategory.trim()) {
      fieldErrors.subcategory = 'Required';
    } else if (item.category) {
      const validSubcategories = THRIFTED_VALID_VALUES.subcategories[item.category.trim()] || [];
      if (!validSubcategories.includes(item.subcategory.trim())) {
        fieldErrors.subcategory = 'Invalid subcategory for selected category';
      }
    }
    if (!item.size || !item.size.trim()) fieldErrors.size = 'Required';
    if (!item.color || !item.color.trim()) fieldErrors.color = 'Required';
    else if (!THRIFTED_VALID_VALUES.colors.includes(item.color.trim())) {
      fieldErrors.color = 'Invalid color';
    }
    if (!item.price || item.price <= 0) {
      fieldErrors.price = 'Required (Mandatory)';
    } else if (!THRIFTED_VALID_VALUES.prices.includes(item.price)) {
      fieldErrors.price = 'Invalid price';
    }
    
    return {
      ...item,
      status: isValid ? undefined : 'error',
      fieldErrors: Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined,
      errors: Object.keys(fieldErrors).length > 0 ? Object.values(fieldErrors) : undefined
    };
  };


  // Generate mock items based on the expected count
  // Use useMemo to stabilize baseItems and prevent recalculation on every render
  const itemCount = getItemCount();
  const baseItems = useMemo(() => {
    return generateMockItems(itemCount, type, partnerName, orderStatus);
  }, [itemCount, type, partnerName, orderStatus]);
  
  // Use editableItems if it has items, otherwise use orderItems if provided, otherwise use baseItems if order has items
  // For newly created orders (itemCount === 0), editableItems starts empty and user adds items manually
  // For existing orders (itemCount > 0), use baseItems if orderItems not provided
  const allItems = editableItems.length > 0
    ? editableItems
    : orderItems && orderItems.length > 0 
    ? orderItems.map(item => ({
        ...item,
        partnerItemId: item.partnerItemId || item.sku || item.itemId,
        subcategory: item.subcategory || '', // Preserve subcategory, don't use gender as fallback
        imageUrl: undefined
      }))
    : (itemCount > 0 ? baseItems : []); // Use baseItems for existing orders with items, empty array for new orders
  
  // Filter items based on validation status
  // For Thrifted orders: validate all mandatory fields
  // For approval orders, don't validate on Retailer ID (it will be added after approval)
  const items = allItems.filter(item => {
    if (isThriftedOrder && isPendingOrder) {
      // For Thrifted pending orders: validate all mandatory fields
      if (validationFilter === 'errors') return !validateThriftedItem(item);
      if (validationFilter === 'valid') return validateThriftedItem(item);
    } else if (isApprovalOrder) {
      // For approval orders: validate everything except Retailer ID
      if (validationFilter === 'errors') return item.status === 'error' || !item.price || item.price <= 0;
      if (validationFilter === 'valid') return item.status !== 'error' && item.price && item.price > 0;
    } else {
      // For other orders: validate including Retailer ID
      if (validationFilter === 'errors') return item.status === 'error' || !item.retailerItemId || !item.price || item.price <= 0;
      if (validationFilter === 'valid') return item.status !== 'error' && item.retailerItemId && item.price && item.price > 0;
    }
    return true;
  });
  
  // Count items by validation status
  // For Thrifted orders: validate all mandatory fields
  // For approval orders, don't validate on Retailer ID
  const itemsWithErrors = isThriftedOrder && isPendingOrder
    ? allItems.filter(item => !validateThriftedItem(item)).length
    : isApprovalOrder
    ? allItems.filter(item => item.status === 'error' || !item.price || item.price <= 0).length
    : allItems.filter(item => item.status === 'error' || !item.retailerItemId || !item.price || item.price <= 0).length;
    
  const validItems = isThriftedOrder && isPendingOrder
    ? allItems.filter(item => validateThriftedItem(item)).length
    : isApprovalOrder
    ? allItems.filter(item => item.status !== 'error' && item.price && item.price > 0).length
    : allItems.filter(item => item.status !== 'error' && item.retailerItemId && item.price && item.price > 0).length;
  
  // Check if all items are valid for registration
  // For Thrifted orders: validate all mandatory fields
  // For approval orders: don't require retailer ID (will be added after approval)
  // For other orders: require retailer ID and price
  const canRegister =
    type === 'order' &&
    allItems.length >= 1 &&
    (isApprovalOrder
      ? allItems.every((item) => item.price && item.price > 0 && item.status !== 'error')
      : isThriftedOrder
        ? allItems.every((item) => validateThriftedItem(item))
        : allItems.every(
            (item) =>
              item.retailerItemId &&
              item.retailerItemId.trim() !== '' &&
              item.price &&
              item.price > 0 &&
              item.status !== 'error'
          ));

  const summaryBadgeText = (() => {
    if (type === 'shipment') {
      const shipment = data as DeliveryNote;
      const boxCount = shipment.boxes.length;
      return `${boxCount} ${boxCount === 1 ? 'box' : 'boxes'}`;
    }
    const count = items.length;
    return `${count} ${count === 1 ? 'item' : 'items'}`;
  })();

  const summaryCardClassName = type === 'shipment' ? 'bg-surface border border-outline-variant' : undefined;

  const renderSummaryDetails = () => {
    if (type === 'shipment') {
      const shipment = data as DeliveryNote;
      const senderName = warehouseName || partnerName || '—';
      const receiverName = receivingStore?.name || storeName || receiverLabel || '—';
      const receiverCode = receivingStore?.code || storeCode;
      const receiverBrandLabel = receiverBrand && (receivingStore?.name || storeName)
        ? ` (${receiverBrand})`
        : '';

      // Calculate accurate item counts (excluding removed items)
      const availableOrderItems = orderItems.filter(item => item.status !== 'removed');
      const totalItems = availableOrderItems.length;
      
      return (
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 body-small text-on-surface-variant">
              <span>Order: {shipment.orderId}</span>
              <span className="text-on-surface-variant">•</span>
              <span>Boxes: {shipment.boxes.length}</span>
              <span className="text-on-surface-variant">•</span>
              <span>Items: {totalItems}</span>
            </div>
            {shipment.status === 'registered' && shipment.shippingLabel && (
              <div className="pt-2">
                <div className="label-small text-on-surface-variant mb-1">
                  Shipping Label
                </div>
                <div className="body-medium text-on-surface">
                  {shipment.shippingLabel}
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-on-surface-variant">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                      <StoreIcon size={16} />
                    </span>
                    <span className="body-small">Sender</span>
                  </div>
                  {isSenderEditable && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0 h-9 w-9 text-primary hover:bg-primary/10"
                      onClick={() => setIsSenderWarehouseOpen(true)}
                      aria-label="Edit sender warehouse"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <p className="body-medium text-on-surface">
                  {senderName}
                  {warehouseName && partnerName ? ` (${partnerName})` : ''}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-on-surface-variant">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-secondary/10 text-secondary flex items-center justify-center">
                      <MapPinIcon size={16} />
                    </span>
                    <span className="body-small">Receiver</span>
                  </div>
                  {isReceiverEditable && onUpdateReceiver && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0 h-9 w-9 text-primary hover:bg-primary/10"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsReceiverSelectorOpen(true);
                      }}
                      disabled={!stores?.length || !brands?.length || !countries?.length || !currentOrderId}
                      aria-label="Edit receiving store"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <p className="body-medium text-on-surface">
                  {receiverName}
                  {receiverBrandLabel}
                </p>
                {receiverCode && (
                  <p className="body-small text-on-surface-variant">
                    {receiverCode}
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      );
    }

    if (type === 'return' && returnDelivery) {
      const receiverPrimaryLabel = returnDelivery.partnerName || partnerName || '—';
      const receiverSecondaryLabel = returnDelivery.warehouseName || warehouseName;

      return (
        <CardContent className="pt-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-on-surface-variant">
              <span className="w-8 h-8 rounded-full bg-secondary/10 text-secondary flex items-center justify-center">
                <MapPinIcon size={16} />
              </span>
              <span className="body-small">Receiver (Partner)</span>
            </div>
            <p className="body-medium text-on-surface">{receiverPrimaryLabel}</p>
            {receiverSecondaryLabel && (
              <p className="body-small text-on-surface-variant">{receiverSecondaryLabel}</p>
            )}
          </div>
        </CardContent>
      );
    }

    return (
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(warehouseName || partnerName) && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-on-surface-variant">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <StoreIcon size={16} />
                  </span>
                  <span className="body-small">Sender</span>
                </div>
                {isSenderEditable && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 h-9 w-9 text-primary hover:bg-primary/10"
                    onClick={() => setIsSenderWarehouseOpen(true)}
                    aria-label="Edit sender warehouse"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <p className="body-medium text-on-surface">{warehouseName || partnerName}</p>
              {warehouseName && partnerName && (
                <p className="body-small text-on-surface-variant">{partnerName}</p>
              )}
            </div>
          )}

          {(receiverLabel || storeName || storeCode) && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-on-surface-variant">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-secondary/10 text-secondary flex items-center justify-center">
                    <MapPinIcon size={16} />
                  </span>
                  <span className="body-small">Receiver</span>
                </div>
                {isReceiverEditable && onUpdateReceiver && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 h-9 w-9 text-primary hover:bg-primary/10"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsReceiverSelectorOpen(true);
                    }}
                    disabled={!stores?.length || !brands?.length || !countries?.length || !currentOrderId}
                    aria-label="Edit receiving store"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <p className="body-medium text-on-surface">{receiverLabel || storeName}</p>
              {storeName && receiverLabel && receiverLabel !== storeName && (
                <p className="body-small text-on-surface-variant">{storeName}</p>
              )}
              {storeCode && (
                <p className="body-small text-on-surface-variant">{storeCode}</p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    );
  };
  
  // Initialize editable items on mount
  // If orderItems is provided, use it. Otherwise, if order has items (itemCount > 0), use baseItems
  // Don't initialize if order is new (itemCount === 0) - let user add items manually
  React.useEffect(() => {
    if (editableItems.length === 0) {
      if (orderItems && orderItems.length > 0) {
        // Initialize with orderItems if provided and not empty
        const mappedItems = orderItems.map(item => ({
          ...item,
          sku: item.sku || item.partnerItemId || item.itemId,
          partnerItemId: item.partnerItemId || item.sku || item.itemId,
          subcategory: item.subcategory || '', // Preserve subcategory, don't use gender as fallback
          imageUrl: undefined
        }));
        // Validate and set field errors for Thrifted orders
        if (isThriftedOrder && isPendingOrder) {
          setEditableItems(mappedItems.map(item => validateAndSetFieldErrors(item)));
        } else {
          setEditableItems(mappedItems);
        }
      } else if (itemCount > 0 && baseItems.length > 0) {
        // For existing orders with items but no orderItems prop, use baseItems
        // Map partnerItemId to sku for consistency
        const mappedBaseItems = baseItems.map(item => ({
          ...item,
          sku: item.sku || item.partnerItemId || item.itemId,
          partnerItemId: item.partnerItemId || item.sku || item.itemId
        }));
        // Validate and set field errors for Thrifted orders
        if (isThriftedOrder && isPendingOrder) {
          setEditableItems(mappedBaseItems.map(item => validateAndSetFieldErrors(item)));
        } else {
          setEditableItems(mappedBaseItems);
        }
      }
      // Don't initialize for new orders (itemCount === 0) - let user add items manually
    }
  }, [orderItems, itemCount]); // Only depend on orderItems and itemCount, baseItems is stable via useMemo
  
  // Handler to save changes and close (for Thrifted and approval orders)
  const handleSaveAndClose = () => {
    if (
      type === 'order' &&
      partnerName === 'Thrifted' &&
      isThriftedEditable &&
      onSaveThriftedOrderDraft
    ) {
      const order = data as PartnerOrder;
      onSaveThriftedOrderDraft(order.id, editableItems);
      // Parent navigates to Orders (Draft); do not call onBack() or handleBack() would miss this screen.
      return;
    }
    onBack();
  };
  
  // Handler to delete item
  const handleDeleteItem = (itemId: string) => {
    setEditableItems(prev => prev.filter(item => item.id !== itemId));
  };

  // Handler to update item attribute
  const handleUpdateItemAttribute = (itemId: string, field: keyof DetailItem, value: any) => {
    setEditableItems(prev => {
      const updated = prev.map(item => {
        if (item.id !== itemId) return item;
        
        const updatedItem = { ...item, [field]: value };

        if (field === 'partnerItemId') {
          const stringValue = typeof value === 'string' ? value : (value != null ? value.toString() : '');
          updatedItem.partnerItemId = stringValue;
          updatedItem.sku = stringValue;
        }
        
        // For Thrifted orders, update validation status
        if (isThriftedOrder && isPendingOrder) {
          // When category changes, clear subcategory if it's not valid for the new category
          if (field === 'category') {
            const trimmedCategory = value && value.toString ? value.toString().trim() : '';
            if (trimmedCategory && THRIFTED_VALID_VALUES.categories.includes(trimmedCategory)) {
              const validSubcategories = THRIFTED_VALID_VALUES.subcategories[trimmedCategory] || [];
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
          // Re-validate the item
          const isValid = validateThriftedItem(updatedItem);
          updatedItem.status = isValid ? undefined : 'error';
          
          // Update field errors with clear marking for mandatory fields
          const fieldErrors: Record<string, string> = {};

          // Retailer ID is mandatory - mark clearly
          if (!updatedItem.retailerItemId || !updatedItem.retailerItemId.trim()) {
            fieldErrors.retailerItemId = 'Required (Mandatory)';
          }
          
          if (!updatedItem.brand || !updatedItem.brand.trim()) fieldErrors.brand = 'Required';
          
          // Category is required first
          if (!updatedItem.category || !updatedItem.category.trim()) {
            fieldErrors.category = 'Required';
          } else if (!THRIFTED_VALID_VALUES.categories.includes(updatedItem.category.trim())) {
            fieldErrors.category = 'Invalid category';
          }
          
          // Subcategory is required and must be valid for selected category
          if (!updatedItem.subcategory || !updatedItem.subcategory.trim()) {
            fieldErrors.subcategory = 'Required';
          } else if (updatedItem.category) {
            const validSubcategories = THRIFTED_VALID_VALUES.subcategories[updatedItem.category.trim()] || [];
            if (!validSubcategories.includes(updatedItem.subcategory.trim())) {
              fieldErrors.subcategory = 'Invalid subcategory for selected category';
            }
          }
          
          if (!updatedItem.size || !updatedItem.size.trim()) fieldErrors.size = 'Required';
          if (!updatedItem.color || !updatedItem.color.trim()) fieldErrors.color = 'Required';
          else if (!THRIFTED_VALID_VALUES.colors.includes(updatedItem.color.trim())) {
            fieldErrors.color = 'Invalid color';
          }
          
          // Price is mandatory - mark clearly
          if (!updatedItem.price || updatedItem.price <= 0) {
            fieldErrors.price = 'Required (Mandatory)';
          } else if (!THRIFTED_VALID_VALUES.prices.includes(updatedItem.price)) {
            fieldErrors.price = 'Invalid price';
          }
          
          updatedItem.fieldErrors = Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined;
          updatedItem.errors = Object.keys(fieldErrors).length > 0 ? Object.values(fieldErrors) : undefined;
        }
        
        return updatedItem;
      });
      return updated;
    });
  };
  
  // CSV import handlers for Thrifted orders
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
        const { items, errors } = convertToThriftedOrderItems(csvRows);
        
        if (items.length === 0) {
          setUploadError('No valid items found in the file');
          return;
        }

        setPendingUploadItems(items);
        
        if (allItems.length > 0) {
          // Show replace dialog if items already exist
          setShowReplaceDialog(true);
        } else {
          // Directly add items
          setEditableItems(items.map(item => ({
            ...item,
            partnerItemId: item.sku || item.itemId,
            subcategory: item.subcategory || '',
            imageUrl: undefined
          })));
          setUploadError('');
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
    setEditableItems(pendingUploadItems.map(item => ({
      ...item,
      partnerItemId: item.partnerItemId || item.sku || item.itemId,
      subcategory: item.subcategory || '', // Preserve subcategory, don't use gender as fallback
      imageUrl: undefined
    })));
    setPendingUploadItems([]);
    setShowReplaceDialog(false);
    setUploadError('');
  };

  const handleAppendItems = () => {
    setEditableItems(prev => [...prev, ...pendingUploadItems.map(item => ({
      ...item,
      partnerItemId: item.partnerItemId || item.sku || item.itemId,
      subcategory: item.subcategory || '', // Preserve subcategory, don't use gender as fallback
      imageUrl: undefined
    }))]);
    setPendingUploadItems([]);
    setShowReplaceDialog(false);
    setUploadError('');
  };
  
  // Handler to add a new row manually
  const handleAddItem = () => {
    const newId = `item-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    const newItem: DetailItem = {
      id: newId,
      itemId: '',
      sku: '',
      category: '',
      subcategory: '', // Partners fill subcategory, category is auto-mapped
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
        subcategory: 'Required',
        size: 'Required',
        brand: 'Required',
        color: 'Required',
        price: 'Required (Mandatory)',
        retailerItemId: 'Required (Mandatory)'
      }
    };
    flushSync(() => {
      setEditableItems((prev) => [...prev, newItem]);
      setValidationFilter('all');
    });
    if (isTableCompact) {
      setRequestOpenMobileItemId(newId);
      setRequestScrollToItemId(null);
    } else {
      setRequestScrollToItemId(newId);
      setRequestOpenMobileItemId(null);
    }
  };
  
  // Handler to remove an item
  const handleRemoveItem = (itemId: string) => {
    setEditableItems(prev => prev.filter(item => item.id !== itemId));
  };
  
  // Handler to export items
  const handleExportItems = () => {
    const csv = exportThriftedItemsToCSV(editableItems.map(item => ({
      ...item,
      sku: item.sku || item.itemId,
      gender: item.gender || item.subcategory || ''
    })));
    downloadCSV(csv, `thrifted-order-items-${Date.now()}.csv`);
  };

  // Handler to export return items
  const handleExportReturnItems = () => {
    const returnDelivery = data as ReturnDelivery;
    const csv = exportReturnItemsToCSV(items.map(item => ({
      id: item.id,
      itemId: item.partnerItemId || item.itemId || '',
      brand: item.brand || '',
      gender: item.gender || '',
      category: item.category || '',
      subcategory: item.subcategory || '',
      size: item.size || '',
      color: item.color || '',
      price: item.price || 0,
      partnerItemId: item.partnerItemId,
      retailerItemId: item.retailerItemId
    })));
    const filename = `return-items-${returnDelivery.deliveryId || returnDelivery.id}-${Date.now()}.csv`;
    downloadCSV(csv, filename);
  };

  // Box management handlers
  const handleBoxClick = (box: Box) => {
    if (onOpenBoxDetails) {
      onOpenBoxDetails(box);
    }
  };

  const handleBoxLabelScanned = (label: string) => {
    setBoxLabel(label);
    setShowBoxLabelScan(false);
  };

  const handleAddBox = () => {
    if (!boxLabel.trim()) {
      toast.error('Please enter a box label');
      return;
    }

    if (type === 'shipment' && onAddBox) {
      const shipment = data as DeliveryNote;
      onAddBox(shipment.id, boxLabel.trim());
      setBoxLabel('');
      setShowAddBoxDialog(false);
      toast.success(`Box ${boxLabel.trim()} added`);
    }
  };

  // Check if this is an in transit return
  const isInTransitReturn = returnDelivery?.status === 'In transit';

  // Handler for cancel return (admin only)
  const handleCancelReturn = () => {
    if (!returnDelivery || !onCancelReturn) return;
    if (confirm('Are you sure you want to cancel this return? This action cannot be undone.')) {
      onCancelReturn(returnDelivery.id, 'Missing return');
    }
  };

  // Handler for mark as returned (partner only)
  const handleMarkAsReturned = () => {
    if (!returnDelivery || !onUpdateReturnDeliveryStatus) return;
    onUpdateReturnDeliveryStatus(returnDelivery.id, 'Returned');
  };

  // Right element for header - cancel button for admins on in transit returns
  const headerRightElement = type === 'return' && isInTransitReturn && isAdmin && onCancelReturn ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-on-surface-variant"
          aria-label="More actions"
        >
          <MoreVertical size={20} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem
          onClick={handleCancelReturn}
          className="text-error focus:text-error focus:bg-error-container"
        >
          <XIcon className="mr-2 h-4 w-4" />
          Cancel return
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : undefined;

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col bg-surface">
      <SharedHeader 
        title={getTitle()}
        onBack={onBack}
        showBackButton={true}
        rightElement={headerRightElement}
      />

      <div
        className={`flex-1 min-h-0 overflow-y-auto overflow-x-hidden w-full px-4 md:px-6 py-4 md:py-6 space-y-6 ${
          type === 'order' && partnerName === 'Thrifted' && isThriftedEditable
            ? 'pb-[max(36rem,55vh)] md:pb-[46rem]'
            : type === 'order' && partnerName === 'Thrifted'
              ? 'pb-48 md:pb-56'
            : 'pb-32 md:pb-40'
        }`}
      >
        {/* Summary Card */}
        <Card className={summaryCardClassName}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 p-2 bg-surface-container-high rounded-lg">
                {getIcon()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="body-small text-on-surface-variant">{formattedSummaryDate}</span>
                  <span className="text-on-surface-variant">•</span>
                  <span className={`body-small ${statusColor || 'text-on-surface-variant'}`}>
                    {statusDisplay || '—'}
                  </span>
                </div>
                <CardTitle className="title-medium text-on-surface mt-1">
                  {getPrimaryIdentifierLabel()}
                </CardTitle>
              </div>
              <Badge 
                variant="secondary" 
                className="bg-primary-container text-on-primary-container"
              >
                {summaryBadgeText}
              </Badge>
            </div>
          </CardHeader>
          {renderSummaryDetails()}
        </Card>

            {type === 'shipment' && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="title-medium text-on-surface">Boxes ({(data as DeliveryNote).boxes.length})</h3>
                  {onAddBox && ((data as DeliveryNote).status === 'draft' || (data as DeliveryNote).status === 'packing') && (
                    <Button
                      onClick={() => setShowAddBoxDialog(true)}
                      className="bg-primary hover:bg-primary/90 focus:bg-primary/90 active:bg-primary/80 text-on-primary transition-colors h-[48px] px-4 rounded-lg"
                      size="lg"
                    >
                      <PlusIcon size={20} className="mr-2" />
                      <span className="label-large">Add box</span>
                    </Button>
                  )}
                </div>
                {(data as DeliveryNote).boxes.length > 0 ? (
                  <Card className="mb-4 bg-transparent border border-outline-variant overflow-hidden">
                    <CardContent className="p-0">
                      <div className="divide-y divide-outline-variant">
                        {(data as DeliveryNote).boxes.map((box) => {
                          const shipmentStatus = (data as DeliveryNote).status;
                          // Determine box status display
                          let statusDisplay: string;
                          if (shipmentStatus === 'registered') {
                            statusDisplay = 'In Transit';
                          } else if (shipmentStatus === 'packing') {
                            statusDisplay = box.status === 'registered' ? 'Registered' : 'Packing';
                          } else {
                            statusDisplay = box.status === 'registered' ? 'Registered' : box.status === 'pending' ? 'Packing' : box.status === 'in-transit' ? 'In Transit' : box.status === 'delivered' ? 'Delivered' : box.status === 'rejected' ? 'Rejected' : box.status === 'cancelled' ? 'Cancelled' : box.status;
                          }
                          const boxDate = new Date(box.createdDate).toISOString().split('T')[0];
                          const orderNumber = (data as DeliveryNote).orderId || '';
                          // Hide menu for In transit deliveries (status === 'registered')
                          const isInTransit = shipmentStatus === 'registered';
                          const showUnregister = !isInTransit && box.status === 'registered' && onUnregisterBox;
                          const showDelete = !isInTransit && box.status === 'pending' && onDeleteBox;
                          const showEditLabel = !isInTransit && box.status === 'registered';
                          const showMenu = showUnregister || showDelete || showEditLabel;

                          const menuSlot = showMenu ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button
                                  className="w-12 h-12 md:w-8 md:h-8 flex items-center justify-center rounded-full hover:bg-surface-container-highest focus:bg-surface-container-highest active:bg-surface transition-colors touch-manipulation min-w-[48px] min-h-[48px] md:min-w-0 md:min-h-0"
                                  onClick={(e: React.MouseEvent) => {
                                    e.stopPropagation();
                                  }}
                                  aria-label="More actions"
                                >
                                  <MoreVertical className="w-4 h-4 text-on-surface-variant" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="bg-surface-container border border-outline-variant rounded-[12px] p-2 w-64 z-[10000]"
                                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                              >
                                {showUnregister && (
                                  <DropdownMenuItem
                                    onClick={(e: React.MouseEvent) => {
                                      e.stopPropagation();
                                      onUnregisterBox!(box.id);
                                    }}
                                    className="px-3 py-2 rounded-[8px] hover:bg-surface-container-high focus:bg-surface-container-high cursor-pointer"
                                  >
                                    <RotateCcwIcon className="w-4 h-4 mr-2" />
                                    <span className="body-medium text-on-surface">Unregister</span>
                                  </DropdownMenuItem>
                                )}
                                {showDelete && (
                                  <DropdownMenuItem
                                    onClick={(e: React.MouseEvent) => {
                                      e.stopPropagation();
                                      onDeleteBox!(box.id);
                                    }}
                                    className="px-3 py-2 rounded-[8px] hover:bg-surface-container-high focus:bg-surface-container-high cursor-pointer text-error"
                                  >
                                    <Trash2Icon className="w-4 h-4 mr-2" />
                                    <span className="body-medium">Delete</span>
                                  </DropdownMenuItem>
                                )}
                                {showEditLabel && (
                                  <DropdownMenuItem
                                    onClick={(e: React.MouseEvent) => {
                                      e.stopPropagation();
                                      setBoxBeingEdited(box);
                                    }}
                                    className="px-3 py-2 rounded-[8px] hover:bg-surface-container-high focus:bg-surface-container-high cursor-pointer"
                                  >
                                    <PencilIcon className="w-4 h-4 mr-2" />
                                    <span className="body-medium text-on-surface">Edit box label</span>
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : undefined;

                          return (
                            <BoxCard
                              key={box.id}
                              date={boxDate}
                              status={statusDisplay}
                              boxLabel={box.qrLabel}
                              boxId={box.id}
                              orderNumber={orderNumber}
                              itemCount={box.items.length}
                              onSelect={() => handleBoxClick(box)}
                              menuSlot={menuSlot}
                            />
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 px-6">
                    <Package className="w-16 h-16 text-on-surface-variant mb-4" />
                    <h3 className="title-medium text-on-surface mb-2">
                      No boxes found
                    </h3>
                    <p className="body-medium text-on-surface-variant text-center">
                      This delivery has no boxes
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Order Summary - Pricing Info (for Sellpy orders) */}
            {isSellpyOrder && type === 'order' && currentUserRole !== 'partner' && (
              <div className="mt-4">
                <div className="flex justify-end gap-3 md:gap-6 flex-wrap">
                  <div>
                    <p className="label-small text-on-surface-variant mb-1">Total Retail Price</p>
                    <p className="title-medium text-on-surface">{items.reduce((sum, item) => sum + item.price, 0).toFixed(0)} SEK</p>
                  </div>
                  <div>
                    <p className="label-small text-on-surface-variant mb-1">Total Sales Margin</p>
                    <p className="title-medium text-primary">
                      {(() => {
                        const totalRetail = items.reduce((sum, item) => sum + item.price, 0);
                        const totalPurchase = items.reduce((sum, item) => sum + (item.purchasePrice || 0), 0);
                        const margin = totalRetail > 0 ? ((totalRetail - totalPurchase) / totalRetail) * 100 : 0;
                        return `${margin.toFixed(1)}%`;
                      })()}
                    </p>
                  </div>
                </div>
              </div>
            )}

        {/* Items List - Only show for orders and returns, not for shipments (delivery notes) */}
        {type !== 'shipment' && (
          <Section title="Items">
            {/* Validation Filter and Add Row Button - Show for pending and approval orders */}
            {type === 'order' && ((data as PartnerOrder).status === 'pending' || (data as PartnerOrder).status === 'draft' || isApprovalOrder) && (
              <div className="mb-4 flex flex-wrap gap-2 items-center justify-between">
                {allItems.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={validationFilter === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setValidationFilter('all')}
                    >
                      <span className="label-medium">All ({allItems.length})</span>
                    </Button>
                    {itemsWithErrors > 0 && (
                      <Button
                        variant={validationFilter === 'errors' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setValidationFilter('errors')}
                      >
                        <AlertTriangleIcon size={14} className="mr-1" />
                        <span className="label-medium">Missing/Errors ({itemsWithErrors})</span>
                      </Button>
                    )}
                    <Button
                      variant={validationFilter === 'valid' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setValidationFilter('valid')}
                    >
                      <CheckIcon size={14} className="mr-1" />
                      <span className="label-medium">Valid ({validItems})</span>
                    </Button>
                  </div>
                ) : (
                  <div></div>
                )}
                {isThriftedEditable && (
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleAddItem}
                      className="bg-primary text-on-primary gap-2"
                    >
                      <PlusIcon size={16} />
                      <span className="label-large">Add Row</span>
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
                        variant="outline"
                        size="sm"
                        className="gap-2"
                      >
                        <UploadIcon size={16} />
                        <span className="label-large">Re-import CSV</span>
                      </Button>
                    </div>
                    {editableItems.length > 0 && (
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
                )}
              </div>
            )}
            
            {/* Show upload error if any */}
            {isThriftedEditable && uploadError && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangleIcon className="h-4 w-4" />
                <AlertDescription className="body-small">{uploadError}</AlertDescription>
              </Alert>
            )}
            
            {/* Show table for editable Thrifted orders even when empty, or when there are items */}
            {(isThriftedEditable || items.length > 0) ? (
              <>
                {type === 'return' ? (
                  // For returns: use ItemCard layout like ItemsScreen
                  <>
                    {/* Export button for In transit returns (partner role only) */}
                    {(() => {
                      const returnDelivery = data as ReturnDelivery;
                      const isInTransit = returnDelivery?.status === 'In transit';
                      const isPartner = currentUserRole === 'partner';
                      return isInTransit && isPartner && items.length > 0 ? (
                        <div className="mb-4 flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleExportReturnItems}
                            className="gap-2"
                          >
                            <DownloadIcon size={16} />
                            <span className="label-large">Export Items</span>
                          </Button>
                        </div>
                      ) : null;
                    })()}
                    <style>{`
                      .return-item-card-wrapper > div > div.flex {
                        padding-left: 1rem !important;
                        padding-right: 1rem !important;
                      }
                    `}</style>
                    <div className="flex flex-col gap-2">
                      {items.map((item) => {
                        // Get return delivery status for items
                        const returnDelivery = data as ReturnDelivery;
                        const returnStatus = returnDelivery?.status || 'Pending';
                        
                        // Map return status to item status
                        let itemStatus: string | undefined;
                        if (returnStatus === 'Pending') {
                          itemStatus = 'Pending';
                        } else if (returnStatus === 'In transit') {
                          itemStatus = 'In transit';
                        } else if (returnStatus === 'Returned') {
                          itemStatus = 'Returned';
                        } else {
                          itemStatus = returnStatus;
                        }
                        
                        // Map DetailItem to BaseItem format
                        const baseItem: BaseItem = {
                          id: item.id,
                          itemId: item.itemId || '',
                          title: `${item.brand || ''} ${item.category || item.subcategory || ''}`.trim() || 'Item',
                          brand: item.brand || '',
                          category: item.category || item.subcategory || '',
                          size: item.size,
                          color: item.color,
                          price: item.price || 0,
                          status: itemStatus,
                          date: new Date().toISOString().split('T')[0], // Use current date as fallback
                          partnerItemId: item.partnerItemId,
                          retailerItemId: item.retailerItemId
                        };
                        
                        return (
                          <div key={item.id} className="bg-surface-container border border-outline-variant rounded-lg overflow-hidden return-item-card-wrapper">
                            <ItemCard
                              item={baseItem}
                              variant="items-list"
                              showActions={false}
                              showSelection={false}
                              userRole={isAdmin ? 'admin' : 'store-staff'}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <ItemDetailsTable
                    items={items.map(item => ({
                      ...item,
                      partnerItemId: item.partnerItemId || item.sku || item.itemId,
                      subcategory: item.subcategory || '', // Preserve subcategory for all orders
                      date: item.date || (type === 'order' ? (data as PartnerOrder).createdDate : type === 'shipment' ? (data as DeliveryNote).createdDate : undefined)
                    }))}
                    requestOpenMobileItemId={requestOpenMobileItemId}
                    onRequestOpenMobileItemIdConsumed={clearOpenMobileRequest}
                    requestScrollToItemId={requestScrollToItemId}
                    onRequestScrollToItemIdConsumed={clearScrollRequest}
                    showRetailerId={type !== 'shipment' && !isApprovalOrder} // Hide retailer ID for approval orders
                    showPrice={type === 'order' || type === 'return'} // Always show price for orders and returns (sales price for store-staff/admin)
                    showPurchasePrice={type !== 'return' && (isApprovalOrder || (isSellpyOrder && isAdmin))} // Show purchase price for Approval orders or Sellpy orders for Admins, but NOT for returns
                    showMargin={type !== 'return' && (isApprovalOrder || (isSellpyOrder && isAdmin))} // Show margin % for approval orders or Sellpy orders for Admins
                    showStatus={type === 'return'}
                    isEditable={isThriftedEditable || ((isPendingOrder || isApprovalOrder) && isAdmin)} // Allow editing for Thrifted pending orders or pending/approval orders (Admins only)
                    onUpdateItem={handleUpdateItemAttribute}
                    onDeleteItem={isThriftedEditable || ((isPendingOrder || isApprovalOrder) && isAdmin) ? handleDeleteItem : undefined}
                    subcategoryOptions={isThriftedOrder ? getAllThriftedSubcategoriesForBrand(receivingStore?.brandId) : undefined}
                    subcategoryLabel={isThriftedOrder ? "Subcategory" : undefined}
                    brandAsInput={isThriftedOrder}
                    categoryOptions={isThriftedOrder ? thriftedValidValues.categories : undefined} // Show category dropdown for Thrifted (auto-mapped)
                    hideCategoryForThrifted={false} // Show category column for cascading dropdown
                    subcategoriesByCategory={isThriftedOrder ? thriftedValidValues.subcategories : undefined} // Provide category-to-subcategory mapping
                    requireCategoryBeforeSubcategory={!isThriftedOrder}
                    partnerId={partnerId}
                    countryName={countryName}
                    currency={currency}
                    orderStatus={type === 'order' ? (data as PartnerOrder).status : type === 'shipment' ? (data as DeliveryNote).status : undefined}
                    isAdmin={isAdmin}
                    thriftedPartnerTable={isThriftedOrder}
                    brandAutocompleteOptions={brandAutocompleteOptions}
                  />
                )}
              </>
            ) : allItems.length > 0 ? (
              <EmptyState
                icon={<AlertTriangleIcon />}
                title={`No ${validationFilter === 'errors' ? 'items with errors' : 'valid items'}`}
                description={`All items are ${validationFilter === 'errors' ? 'complete' : 'missing retailer IDs or have errors'}`}
              />
            ) : (
              <EmptyState
                icon={<AlertTriangleIcon />}
                title="No items found"
                description="This order contains no items to display"
              />
            )}
          </Section>
        )}

        {/* Action Buttons for Sellpy Orders - Fixed bottom bar */}
        {type === 'order' && (partnerName === 'Sellpy Operations' || partnerName === 'Sellpy') && (
          <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-outline-variant z-20">
            <div className="px-4 md:px-6 py-4 pb-safe flex flex-row flex-wrap gap-3 justify-end">
              {/* Pending status: Add retailer IDs - right aligned on desktop */}
              {((data as PartnerOrder).status === 'pending' || (data as PartnerOrder).status === 'draft') && onNavigateToRetailerIdScan && (
                <div className="flex justify-start md:justify-end flex-1 md:flex-initial min-w-[220px]">
                  <Button 
                    onClick={onNavigateToRetailerIdScan}
                    size="lg"
                    className="w-full md:w-auto bg-primary text-on-primary hover:bg-primary/90 focus:bg-primary/90 active:bg-primary/80 disabled:bg-on-surface/12 disabled:text-on-surface/38 transition-colors px-6 py-3 rounded-lg min-h-[56px] h-[56px]"
                  >
                    <PackageIcon size={20} className="mr-2" />
                    <span className="label-large">Add retailer IDs</span>
                  </Button>
                </div>
              )}

              {/* Approval status: Save & Close and Approve order (Admin only) */}
              {isApprovalOrder && isAdmin && (
                <div className="flex flex-row gap-3 w-full md:max-w-md">
                  <Button 
                    onClick={handleSaveAndClose}
                    variant="outline"
                    size="lg"
                    className="flex-1 border-outline text-on-surface hover:bg-surface-container-high transition-colors px-6 py-3 rounded-lg h-[56px]"
                  >
                    <span className="label-large">Save & Close</span>
                  </Button>
                  {onRegisterOrder && (
                    <Button 
                      onClick={() => {
                        // Approve order - change status from approval to pending
                        if (onRegisterOrder) {
                          onRegisterOrder();
                        }
                      }}
                      size="lg"
                      className="flex-1 bg-primary text-on-primary hover:bg-primary/90 focus:bg-primary/90 active:bg-primary/80 transition-colors px-6 py-3 rounded-lg h-[56px]"
                    >
                      <CheckIcon size={20} className="mr-2" />
                      <span className="label-large">Approve</span>
                    </Button>
                  )}
                </div>
              )}

              {/* Other action buttons - right aligned on desktop */}
              {(data as PartnerOrder).status !== 'pending' && (data as PartnerOrder).status !== 'approval' && (
                <>
                  {/* Completed status: Register order */}
                  {(data as PartnerOrder).status === 'completed' && onRegisterOrder && (
                    <div className="flex justify-start md:justify-end flex-1 md:flex-initial min-w-[220px]">
                      <Button 
                        onClick={() => onRegisterOrder({ lineItems: allItems })}
                        disabled={!canRegister}
                        size="lg"
                        className="w-full md:w-auto bg-primary text-on-primary hover:bg-primary/90 focus:bg-primary/90 active:bg-primary/80 disabled:bg-on-surface/12 disabled:text-on-surface/38 transition-colors px-6 py-3 rounded-lg min-h-[56px] h-[56px]"
                      >
                        <CheckIcon size={20} className="mr-2" />
                        <span className="label-large">Register order</span>
                      </Button>
                    </div>
                  )}

                  {/* Registered status: Create delivery note */}
                  {(data as PartnerOrder).status === 'registered' && onCreateDeliveryNote && (
                    <div className="flex justify-start md:justify-end flex-1 md:flex-initial min-w-[220px]">
                      <Button 
                        onClick={() => onCreateDeliveryNote((data as PartnerOrder).id)}
                        size="lg"
                        className="w-full md:w-auto bg-primary text-on-primary hover:bg-primary/90 focus:bg-primary/90 active:bg-primary/80 disabled:bg-on-surface/12 disabled:text-on-surface/38 transition-colors px-6 py-3 rounded-lg min-h-[56px] h-[56px]"
                      >
                        <PackageIcon size={20} className="mr-2" />
                        <span className="label-large">Create delivery note</span>
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons for Thrifted and other manual partners - Fixed bottom bar */}
        {type === 'order' && partnerName === 'Thrifted' && (
          <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-outline-variant z-50">
            <div className="px-4 md:px-6 py-4 pb-safe w-full flex flex-col md:flex-row md:justify-end md:items-center gap-3">
              {/* Mobile: Full width evenly spaced buttons */}
              <div className="flex flex-row gap-3 w-full md:hidden">
                {isThriftedEditable && (
                  <>
                    <Button
                      onClick={handleSaveAndClose}
                      variant="outline"
                      size="lg"
                      className="flex-1 border-outline text-on-surface hover:bg-surface-container-high transition-colors px-6 py-3 rounded-lg h-[56px]"
                    >
                      <span className="label-large">Save & Close</span>
                    </Button>
                    {onRegisterOrder && (
                      <Button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (canRegister && onRegisterOrder) {
                            onRegisterOrder({ lineItems: allItems });
                          }
                        }}
                        disabled={!canRegister}
                        size="lg"
                        className="flex-1 bg-primary text-on-primary hover:bg-primary/90 focus:bg-primary/90 active:bg-primary/80 disabled:bg-on-surface/12 disabled:text-on-surface/38 transition-colors px-6 py-3 rounded-lg h-[56px]"
                      >
                        <CheckIcon size={20} className="mr-2" />
                        <span className="label-large">Register order</span>
                      </Button>
                    )}
                  </>
                )}

                {!isThriftedEditable && (data as PartnerOrder).status === 'registered' && onCreateDeliveryNote && (
                  <Button
                    onClick={() => onCreateDeliveryNote((data as PartnerOrder).id)}
                    size="lg"
                    className="w-full bg-primary text-on-primary hover:bg-primary/90 focus:bg-primary/90 active:bg-primary/80 disabled:bg-on-surface/12 disabled:text-on-surface/38 transition-colors px-6 py-3 rounded-lg min-h-[56px] h-[56px]"
                  >
                    <PackageIcon size={20} className="mr-2" />
                    <span className="label-large">Create delivery note</span>
                  </Button>
                )}
              </div>

              {/* Desktop: flush right, natural button widths */}
              <div className="hidden md:flex flex-row flex-wrap gap-3 justify-end shrink-0 w-full">
                {isThriftedEditable && (
                  <>
                    <Button
                      onClick={handleSaveAndClose}
                      variant="outline"
                      size="lg"
                      className="shrink-0 min-w-[160px] border-outline text-on-surface hover:bg-surface-container-high transition-colors px-6 py-3 rounded-lg h-[56px]"
                    >
                      <span className="label-large">Save & Close</span>
                    </Button>
                    {onRegisterOrder && (
                      <Button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (canRegister && onRegisterOrder) {
                            onRegisterOrder({ lineItems: allItems });
                          }
                        }}
                        disabled={!canRegister}
                        size="lg"
                        className="shrink-0 min-w-[180px] bg-primary text-on-primary hover:bg-primary/90 focus:bg-primary/90 active:bg-primary/80 disabled:bg-on-surface/12 disabled:text-on-surface/38 transition-colors px-6 py-3 rounded-lg h-[56px]"
                      >
                        <CheckIcon size={20} className="mr-2" />
                        <span className="label-large">Register order</span>
                      </Button>
                    )}
                  </>
                )}

                {!isThriftedEditable && (data as PartnerOrder).status === 'registered' && onCreateDeliveryNote && (
                  <Button
                    onClick={() => onCreateDeliveryNote((data as PartnerOrder).id)}
                    size="lg"
                    className="shrink-0 min-w-[220px] bg-primary text-on-primary hover:bg-primary/90 focus:bg-primary/90 active:bg-primary/80 disabled:bg-on-surface/12 disabled:text-on-surface/38 transition-colors px-6 py-3 rounded-lg min-h-[56px] h-[56px]"
                  >
                    <PackageIcon size={20} className="mr-2" />
                    <span className="label-large">Create delivery note</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Box Dialog */}
      {type === 'shipment' && (
        <Dialog open={showAddBoxDialog} onOpenChange={setShowAddBoxDialog}>
          <DialogContent className="bg-surface border border-outline-variant max-w-md">
            <DialogHeader>
              <DialogTitle className="title-large">Add Box</DialogTitle>
              <DialogDescription className="body-medium">
                Enter a label for the new box or scan the box label
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {showBoxLabelScan ? (
                <div className="space-y-3">
                  <ActiveScanner
                    onScan={() => {
                      // Simulate scanning - in real app this would use camera
                      const mockLabel = `BOX-${Date.now().toString().slice(-6)}`;
                      handleBoxLabelScanned(mockLabel);
                    }}
                    onManualEntry={handleBoxLabelScanned}
                    isScanning={false}
                    showManualEntry={true}
                    onClose={() => setShowBoxLabelScan(false)}
                  />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="boxLabel">Box Label</Label>
                    <Input
                      id="boxLabel"
                      value={boxLabel}
                      onChange={(e) => setBoxLabel(e.target.value)}
                      placeholder="e.g., BOX-001"
                      className="bg-surface-container-high"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddBox();
                        }
                      }}
                    />
                  </div>
                  
                  <Button
                    variant="outline"
                    onClick={() => setShowBoxLabelScan(true)}
                    className="w-full"
                  >
                    <ScanIcon size={16} className="mr-2" />
                    <span className="label-medium">Scan Box Label</span>
                  </Button>
                </>
              )}
            </div>

            <DialogFooter className="w-full">
              <div className={`w-full ${partnerName !== 'Thrifted' ? 'grid grid-cols-2 gap-3' : ''}`}>
                {partnerName !== 'Thrifted' && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAddBoxDialog(false);
                      setBoxLabel('');
                      setShowBoxLabelScan(false);
                    }}
                    className="h-[56px]"
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  onClick={handleAddBox}
                  disabled={!boxLabel.trim()}
                  className={`bg-primary text-on-primary h-[56px] ${partnerName === 'Thrifted' ? 'w-full' : ''}`}
                >
                  Add Box
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Replace Items Dialog for Thrifted Orders */}
      {isThriftedEditable && (
        <Dialog open={showReplaceDialog} onOpenChange={setShowReplaceDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="title-large">Replace or Append Items?</DialogTitle>
              <DialogDescription className="body-medium">
                You have {allItems.length} existing items. The uploaded file contains {pendingUploadItems.length} items.
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
      )}

      {/* Action Buttons for Pending/Packing Shipments - Fixed bottom bar */}
      {type === 'shipment' && ((data as DeliveryNote).status === 'draft' || (data as DeliveryNote).status === 'packing') && (
        <div className="fixed bottom-0 left-0 right-0 bg-surface-container border-t border-outline-variant p-4 z-20 pb-safe">
          <div className="flex flex-row gap-3 items-center">
            {(() => {
              const shipment = data as DeliveryNote;
              // Calculate accurate item counts (excluding removed items)
              const availableOrderItems = orderItems.filter(item => item.status !== 'removed');
              const totalItems = availableOrderItems.length;
              const assignedItems = shipment.boxes.flatMap(box => box.items).length;
              const unassignedItems = totalItems - assignedItems;
              
              return (
                <>
                  <div className="hidden md:flex items-center gap-2 text-on-surface-variant body-small md:mr-auto">
                    <PackageIcon size={16} />
                    <span>{assignedItems} of {totalItems} items in {shipment.boxes.length} box{shipment.boxes.length !== 1 ? 'es' : ''}</span>
                  </div>
                  
                  <div className="flex flex-row gap-3 w-full md:w-auto md:ml-auto">
                    {onSaveAndClose && (
                      <Button
                        variant="outline"
                        onClick={onSaveAndClose}
                        className="flex-1 border-outline text-on-surface hover:bg-surface-container-high transition-colors px-6 py-3 rounded-lg min-h-[56px]"
                        size="lg"
                      >
                        <span className="label-large">Save & Close</span>
                      </Button>
                    )}
                    
                    {onRegisterDelivery && (
                      <Button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('[OrderShipmentDetailsScreen] Register Delivery button clicked');
                          // Trigger shipping label screen via callback
                          onRegisterDelivery?.();
                        }}
                        disabled={shipment.boxes.length === 0 || unassignedItems > 0 || shipment.boxes.some(box => box.items.length === 0)}
                        className="flex-1 bg-primary text-on-primary hover:bg-primary/90 focus:bg-primary/90 active:bg-primary/80 transition-colors px-6 py-3 rounded-lg min-h-[56px]"
                        size="lg"
                      >
                        <CheckIcon size={20} className="mr-2" />
                        <span className="label-large">Register Delivery</span>
                      </Button>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Action Buttons for In Transit Returns - Fixed bottom bar (Partner only) */}
      {type === 'return' && isInTransitReturn && currentUserRole === 'partner' && onUpdateReturnDeliveryStatus && (
        <div className="fixed bottom-0 left-0 right-0 bg-surface-container border-t border-outline-variant p-4 z-20 pb-safe">
          <div className="flex flex-col md:flex-row md:justify-end gap-3 md:px-2">
            <Button
              onClick={handleMarkAsReturned}
              className="w-full md:w-auto bg-primary text-on-primary"
              size="lg"
            >
              <CheckIcon size={20} className="mr-2" />
              <span className="label-large">Mark as returned</span>
            </Button>
          </div>
        </div>
      )}

      {(type === 'order' || type === 'shipment') && isReceiverEditable && onUpdateReceiver && (
        <StoreSelector
          isOpen={isReceiverSelectorOpen}
          onClose={() => setIsReceiverSelectorOpen(false)}
          onConfirm={(selection) => {
            if (currentOrderId) {
              onUpdateReceiver(currentOrderId, selection);
            }
            setIsReceiverSelectorOpen(false);
          }}
          brands={brands || []}
          countries={countries || []}
          stores={stores || []}
          currentSelection={currentReceiverSelection}
        />
      )}

      {partnerId && (
        <PartnerWarehouseSelector
          isOpen={isSenderWarehouseOpen}
          onClose={() => setIsSenderWarehouseOpen(false)}
          onConfirm={(selection) => {
            onUpdateSenderWarehouse?.(selection.warehouseId);
            setIsSenderWarehouseOpen(false);
          }}
          partners={partners}
          warehouses={warehouses}
          currentSelection={{
            partnerId,
            warehouseId: currentSenderWarehouseId || '',
          }}
          lockToPartnerId={partnerId}
        />
      )}
      <BoxLabelSideSheet
        isOpen={Boolean(boxBeingEdited)}
        onOpenChange={(open) => {
          if (!open) {
            setBoxBeingEdited(null);
          }
        }}
        onSubmit={(label) => {
          if (boxBeingEdited && onUpdateBoxLabel) {
            onUpdateBoxLabel(boxBeingEdited.id, label);
            setBoxBeingEdited(null);
          }
        }}
        onCancel={() => setBoxBeingEdited(null)}
        initialLabel={boxBeingEdited?.qrLabel}
        title="Edit Box Label"
        description="Update the label used for this box"
        primaryActionLabel="Save label"
        showBackButton={false}
      />
      
    </div>
  );
}