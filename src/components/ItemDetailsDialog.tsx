import React, { useState, useRef } from 'react';
import { 
  FullScreenDialog as Dialog,
  FullScreenDialogContent as DialogContent,
  FullScreenDialogDescription as DialogDescription,
  FullScreenDialogTitle as DialogTitle
} from './ui/full-screen-dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { VisuallyHidden } from './ui/visually-hidden';
import { ArrowLeft, Edit3, Check, X, QrCode, Package, Calendar, Tag, Euro, Clock, MapPin, History, RefreshCw, Camera } from 'lucide-react';
import svgPaths from '../imports/svg-7un8q74kd7';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import ActiveScanner from './ActiveScanner';
import { toast } from 'sonner@2.0.3';

export interface ItemDetails {
  id: string;
  itemId: string;
  title: string;
  brand: string;
  category: string;
  subcategory?: string;
  size?: string;
  color?: string;
  price: number;
  status: string;
  date: string;
  deliveryId?: string;
  image?: string; // Full-size product image
  thumbnail?: string; // Thumbnail/fallback image
  daysRemaining?: number;
  source?: string;
  orderNumber?: string;
}

export interface StatusHistoryEntry {
  status: string;
  timestamp: string;
  user?: string;
  note?: string;
}

interface ItemDetailsDialogProps {
  item: ItemDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (itemId: string, updates: Partial<ItemDetails>) => void;
  statusHistory?: StatusHistoryEntry[];
  priceOptions?: number[];
  priceCurrency?: string;
}

type EditField = 'itemId' | 'title' | 'brand' | 'category' | 'subcategory' | 'size' | 'color' | 'price' | 'status' | 'deliveryId' | null;

const AVAILABLE_STATUSES = [
  'In transit',
  'In Store',
  'In Store 2nd try',
  'Sold',
  'To return',
  'Return - In transit',
  'Pick up',
  'Charity',
  'Archived'
];

const AVAILABLE_BRANDS = [
  'H&M',
  'Weekday',
  'COS',
  'ARKET',
  'Monki',
  'Zara',
  'Mango',
  'Uniqlo',
  'Other'
];

const AVAILABLE_CATEGORIES = [
  'Tops',
  'Dresses',
  'Jeans',
  'Trousers',
  'Shorts',
  'Skirts',
  'Jackets',
  'Coats',
  'Hoodies',
  'Sweaters',
  'Shoes',
  'Accessories',
  'Other'
];

const AVAILABLE_SIZES = [
  'XXS',
  'XS',
  'S',
  'M',
  'L',
  'XL',
  'XXL',
  '32',
  '34',
  '36',
  '38',
  '40',
  '42',
  '44',
  '46',
  'One size'
];

const AVAILABLE_COLORS = [
  'Black',
  'White',
  'Gray',
  'Beige',
  'Brown',
  'Red',
  'Pink',
  'Orange',
  'Yellow',
  'Green',
  'Blue',
  'Purple',
  'Multi-color'
];

export default function ItemDetailsDialog({ 
  item, 
  isOpen, 
  onClose, 
  onSave,
  statusHistory = [],
  priceOptions,
  priceCurrency
}: ItemDetailsDialogProps) {
  const [editingField, setEditingField] = useState<EditField>(null);
  const [editValues, setEditValues] = useState<Partial<ItemDetails>>({});
  const [showIdScanner, setShowIdScanner] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedId, setScannedId] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!item) return null;

  const handleStartEdit = (field: EditField) => {
    if (field) {
      setEditingField(field);
      setEditValues({ [field]: item[field] });
    }
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setEditValues({});
  };

  const handleSaveEdit = (field: EditField) => {
    if (field && editValues[field] !== undefined) {
      const updates = { [field]: editValues[field] };
      
      // Add status change to history if status is being updated
      if (field === 'status') {
        toast.success(`Status updated to ${editValues[field]}`);
      } else {
        toast.success(`${field.charAt(0).toUpperCase() + field.slice(1)} updated`);
      }
      
      onSave(item.id, updates);
      setEditingField(null);
      setEditValues({});
    }
  };

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      const mockId = `${Math.floor(100000 + Math.random() * 900000)}`;
      setScannedId(mockId);
      setIsScanning(false);
    }, 1500);
  };

  const handleManualEntry = (newId: string) => {
    setScannedId(newId);
  };

  const handleConfirmNewId = () => {
    if (scannedId.trim()) {
      onSave(item.id, { itemId: scannedId });
      toast.success(`Item ID updated to ${scannedId}`);
      setShowIdScanner(false);
      setScannedId('');
      onClose();
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('Image size must be less than 10MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setUploadedImage(result);
        onSave(item.id, { image: result });
        toast.success('Image uploaded successfully');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTakePhoto = () => {
    cameraInputRef.current?.click();
  };

  const handleUploadImage = () => {
    fileInputRef.current?.click();
  };

  const displayImage = uploadedImage || item.image || item.thumbnail;
  const hasNoImage = !displayImage;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'in store':
        return 'bg-success-container text-on-success-container';
      case 'pending':
        return 'bg-surface-container-high text-on-surface-variant';
      case 'to return':
      case 'expired':
        return 'bg-error-container text-error';
      case 'archived':
        return 'bg-surface-container-highest text-on-surface-variant';
      case 'in store 2nd try':
        return 'bg-secondary-container text-on-secondary-container';
      case 'sold':
        return 'bg-tertiary-container text-on-tertiary-container';
      default:
        return 'bg-surface-container-high text-on-surface-variant';
    }
  };

  const formatPriceValue = (amount?: number) => {
    if (amount === undefined || amount === null || Number.isNaN(amount)) {
      return 'Not set';
    }

    const currency = priceCurrency || 'EUR';
    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency
      }).format(amount);
    } catch {
      return `${currency} ${amount.toFixed(2)}`;
    }
  };

  const priceSelectOptions =
    priceOptions?.map((option) => ({
      value: option.toString(),
      label: formatPriceValue(option)
    })) ?? [];

  const EditableField = ({
    field,
    label,
    value,
    icon: Icon,
    type = 'text',
    options,
    formatValue
  }: {
    field: EditField;
    label: string;
    value: any;
    icon: any;
    type?: 'text' | 'number' | 'select';
    options?: Array<string | { value: string; label: string }>;
    formatValue?: (value: any) => React.ReactNode;
  }) => {
    const isEditing = editingField === field;
    const currentValue = isEditing ? (editValues[field] ?? value) : value;
    const normalizedOptions =
      options?.map((option) =>
        typeof option === 'string'
          ? { value: option, label: option }
          : { value: option.value, label: option.label }
      ) ?? [];

    let selectOptions = normalizedOptions;
    if (
      type === 'select' &&
      normalizedOptions.length > 0 &&
      currentValue !== undefined &&
      currentValue !== null
    ) {
      const currentStringValue = currentValue.toString();
      if (!normalizedOptions.some((option) => option.value === currentStringValue)) {
        selectOptions = [
          ...normalizedOptions,
          {
            value: currentStringValue,
            label:
              formatValue?.(currentValue) ??
              (typeof currentValue === 'string' ? currentValue : currentStringValue)
          }
        ];
      }
    }

    return (
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <Icon className="w-5 h-5 text-on-surface-variant flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="label-small text-on-surface-variant mb-1">{label}</p>
            {isEditing ? (
              <div className="flex items-center gap-2">
                {type === 'select' ? (
                  <Select
                    value={
                      currentValue !== undefined && currentValue !== null
                        ? currentValue.toString()
                        : ''
                    }
                    onValueChange={(val) =>
                      setEditValues({
                        ...editValues,
                        [field]:
                          field === 'price'
                            ? Number.isNaN(Number(val))
                              ? val
                              : parseFloat(val)
                            : val
                      })
                    }
                  >
                    <SelectTrigger className="bg-surface-container-high border border-outline rounded-lg h-10">
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    type={type}
                    value={currentValue?.toString() || ''}
                    onChange={(e) => setEditValues({ ...editValues, [field]: type === 'number' ? parseFloat(e.target.value) : e.target.value })}
                    className="bg-surface-container-high border border-outline rounded-lg h-10"
                    autoFocus
                  />
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleSaveEdit(field)}
                  className="h-8 w-8 flex-shrink-0 text-primary hover:bg-primary-container"
                >
                  <Check size={16} />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleCancelEdit}
                  className="h-8 w-8 flex-shrink-0 text-on-surface-variant hover:bg-surface-container-high"
                >
                  <X size={16} />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {field === 'status' ? (
                  <Badge className={`${getStatusColor(currentValue)} px-2 py-0.5 rounded-full`}>
                    {currentValue}
                  </Badge>
                ) : formatValue ? (
                  <p className="body-large text-on-surface break-words">
                    {formatValue(currentValue)}
                  </p>
                ) : (
                  <p className="body-large text-on-surface break-words">
                    {currentValue || 'Not set'}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
        {!isEditing && (
          <Button
            size="icon"
            variant="ghost"
            onClick={() => handleStartEdit(field)}
            className="h-8 w-8 flex-shrink-0 text-on-surface-variant hover:bg-surface-container-high"
          >
            <Edit3 size={14} />
          </Button>
        )}
      </div>
    );
  };

  if (showIdScanner) {
    return (
      <Dialog open={isOpen} onOpenChange={() => {
        setShowIdScanner(false);
        setScannedId('');
      }}>
        <DialogContent className="bg-surface border-0 m-0 p-0 rounded-none flex flex-col [&>button]:hidden">
          <VisuallyHidden>
            <DialogTitle>Scan new item ID</DialogTitle>
            <DialogDescription>Scan or enter a new ID for this item</DialogDescription>
          </VisuallyHidden>
          
          {/* Header */}
          <div className="bg-surface-container border-b border-outline-variant flex-shrink-0">
            <div className="px-4 py-3">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowIdScanner(false);
                    setScannedId('');
                  }}
                  className="text-on-surface-variant"
                  aria-label="Back"
                >
                  <ArrowLeft size={20} />
                </Button>
                <div className="flex-1">
                  <h1 className="title-large text-on-surface">Scan new item ID</h1>
                  <p className="body-small text-on-surface-variant">
                    Current ID: {item.itemId}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Scanner */}
          <div className="flex-1 overflow-y-auto p-4">
            <ActiveScanner
              onScan={handleScan}
              onManualEntry={handleManualEntry}
              isScanning={isScanning}
              showManualEntry={true}
            />

            {scannedId && (
              <div className="mt-4 p-4 bg-success-container rounded-lg">
                <p className="body-medium text-on-success-container mb-2">New ID scanned:</p>
                <p className="title-large text-on-success-container">{scannedId}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-surface-container border-t border-outline-variant p-4 flex-shrink-0">
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowIdScanner(false);
                  setScannedId('');
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmNewId}
                disabled={!scannedId.trim()}
                className="flex-1"
              >
                Confirm
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-surface border-0 m-0 p-0 rounded-none flex flex-col [&>button]:hidden">
        <VisuallyHidden>
          <DialogTitle>Item details</DialogTitle>
          <DialogDescription>View and edit item information</DialogDescription>
        </VisuallyHidden>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Image Section */}
          {displayImage ? (
            <div className="relative w-full aspect-square bg-surface-container-high">
              {/* Back arrow on top of image */}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="absolute top-4 left-4 bg-surface-container-highest/90 text-on-surface hover:bg-surface-container-high shadow-md z-10"
                aria-label="Back"
              >
                <ArrowLeft size={20} />
              </Button>
              <ImageWithFallback
                src={displayImage}
                alt={item.title || item.brand}
                className="w-full h-full object-cover"
              />
              {/* Edit image overlay button */}
              <div className="absolute bottom-4 right-4 flex gap-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleTakePhoto}
                  className="bg-surface-container-highest text-on-surface hover:bg-surface-container-high shadow-md"
                >
                  <Camera size={16} className="mr-2" />
                  Take photo
                </Button>
              </div>
            </div>
          ) : (
            /* No image - back arrow in top left */
            <div className="relative w-full">
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="absolute top-4 left-4 bg-surface-container-highest/90 text-on-surface hover:bg-surface-container-high shadow-md z-10"
                aria-label="Back"
              >
                <ArrowLeft size={20} />
              </Button>
            </div>
          )}

          {/* Hidden file inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Item Information */}
          <div className="p-4 space-y-6">
            {/* No Image State - Show small thumbnail and add image options */}
            {hasNoImage && (
              <div className="bg-surface-container rounded-lg p-4 border border-outline-variant">
                <div className="flex items-start gap-4">
                  {/* Small thumbnail placeholder */}
                  <div className="flex-shrink-0 w-20 h-20 bg-surface-container-high rounded-lg flex items-center justify-center">
                    <Package className="w-10 h-10 text-on-surface-variant opacity-30" />
                  </div>
                  
                  {/* Add image options */}
                  <div className="flex-1">
                    <p className="body-medium text-on-surface mb-2">No image</p>
                    <p className="body-small text-on-surface-variant mb-3">Add an image to help identify this item</p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleTakePhoto}
                        className="flex-1"
                      >
                        <Camera size={14} className="mr-2" />
                        Take photo
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Item ID - Replaces Title */}
            <div className="flex items-center justify-between gap-3">
              <h2 className="title-large text-on-surface mb-1 flex-1 min-w-0 break-words">
                Item ID: {item.itemId}
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowIdScanner(true)}
                className="flex items-center gap-2 flex-shrink-0"
              >
                <QrCode size={14} />
                Scan
              </Button>
            </div>

            <Separator className="bg-outline-variant" />

            {/* Editable Fields */}
            <div className="space-y-4">
              {/* Status */}
              <EditableField
                field="status"
                label="Status"
                value={item.status}
                icon={RefreshCw}
                type="select"
                options={AVAILABLE_STATUSES}
              />

              {/* Price */}
              <EditableField
                field="price"
                label={`Price${priceCurrency ? ` (${priceCurrency})` : ''}`}
                value={item.price}
                icon={Euro}
                type={priceSelectOptions.length ? 'select' : 'number'}
                options={priceSelectOptions}
                formatValue={(val) =>
                  val !== undefined && val !== null
                    ? formatPriceValue(
                        typeof val === 'number' ? val : parseFloat(val as string)
                      )
                    : 'Not set'
                }
              />

              {/* Brand */}
              <EditableField
                field="brand"
                label="Brand"
                value={item.brand}
                icon={Tag}
                type="select"
                options={AVAILABLE_BRANDS}
              />

              {/* Category */}
              <EditableField
                field="category"
                label="Category"
                value={item.category}
                icon={Tag}
                type="select"
                options={AVAILABLE_CATEGORIES}
              />

              {/* Subcategory */}
              {(item.subcategory || editingField === 'subcategory') && (
                <EditableField
                  field="subcategory"
                  label="Subcategory"
                  value={item.subcategory}
                  icon={Tag}
                />
              )}

              {/* Size */}
              <EditableField
                field="size"
                label="Size"
                value={item.size}
                icon={Package}
                type="select"
                options={AVAILABLE_SIZES}
              />

              {/* Color */}
              <EditableField
                field="color"
                label="Color"
                value={item.color}
                icon={Package}
                type="select"
                options={AVAILABLE_COLORS}
              />

              <Separator className="bg-outline-variant" />

              {/* Date */}
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-on-surface-variant flex-shrink-0" />
                <div>
                  <p className="label-small text-on-surface-variant">Registered date</p>
                  <p className="body-large text-on-surface">{item.date}</p>
                </div>
              </div>

              {/* Days Remaining */}
              {item.daysRemaining !== undefined && (
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-on-surface-variant flex-shrink-0" />
                  <div>
                    <p className="label-small text-on-surface-variant">Days remaining</p>
                    <p className="body-large text-on-surface">{item.daysRemaining} days</p>
                  </div>
                </div>
              )}

              {/* Delivery ID */}
              {(item.deliveryId || editingField === 'deliveryId') && (
                <EditableField
                  field="deliveryId"
                  label="Delivery ID"
                  value={item.deliveryId}
                  icon={MapPin}
                />
              )}

              {/* Source */}
              {item.source && (
                <div className="flex items-center gap-3">
                  <Tag className="w-5 h-5 text-on-surface-variant flex-shrink-0" />
                  <div>
                    <p className="label-small text-on-surface-variant">Source</p>
                    <p className="body-large text-on-surface">{item.source}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Status History Section at Bottom */}
          {showHistory && statusHistory.length > 0 && (
            <div className="p-4 bg-surface-container-low border-t border-outline-variant">
              <h3 className="title-medium text-on-surface mb-3">Status history</h3>
              <div className="space-y-3">
                {statusHistory.map((entry, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-primary"></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <Badge className={`${getStatusColor(entry.status)} px-2 py-0.5 rounded-full`}>
                          {entry.status}
                        </Badge>
                        <span className="label-small text-on-surface-variant">{entry.timestamp}</span>
                      </div>
                      {entry.user && (
                        <p className="body-small text-on-surface-variant">By {entry.user}</p>
                      )}
                      {entry.note && (
                        <p className="body-small text-on-surface mt-1">{entry.note}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* History Button at Bottom */}
          {statusHistory.length > 0 && (
            <div className="p-4 bg-surface-container border-t border-outline-variant flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
                className="w-full text-on-surface-variant"
              >
                <History size={16} className="mr-2" />
                {showHistory ? 'Hide History' : 'Show History'}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
