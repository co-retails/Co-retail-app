import React, { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { 
  ArrowLeft, 
  Search, 
  Filter,
  MoreVertical,
  Edit,
  Copy,
  Archive,
  Upload,
  AlertCircle,
  Check,
  FileText
} from 'lucide-react';
import { ShowroomProduct, ProductType, ProductStatus } from './ShowroomTypes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface ShowroomProductsScreenProps {
  onBack: () => void;
  products: ShowroomProduct[];
  onEditProduct: (productId: string) => void;
  onDuplicateProduct: (productId: string) => void;
  onArchiveProduct: (productId: string) => void;
  onBulkAction: (action: 'publish' | 'unpublish' | 'assign_linesheet', productIds: string[]) => void;
  onImport: () => void;
  onCreateLineSheet?: () => void;
}

type FilterType = 'all' | 'active' | 'draft' | 'missing_media' | ProductType;

const productTypeLabels: Record<ProductType, string> = {
  resell: 'Resell',
  external: 'External',
  produce_on_demand: 'On-Demand',
  white_label: 'Pick & Buy',
  co_lab: 'Co-Lab'
};

const productTypeBadgeColors: Record<ProductType, string> = {
  resell: 'bg-tertiary-container text-on-tertiary-container',
  external: 'bg-primary-container text-on-primary-container',
  produce_on_demand: 'bg-accent/10 text-accent',
  white_label: 'bg-surface-container-highest text-on-surface',
  co_lab: 'bg-secondary-container text-on-secondary-container'
};

export default function ShowroomProductsScreen({
  onBack,
  products,
  onEditProduct,
  onDuplicateProduct,
  onArchiveProduct,
  onBulkAction,
  onImport,
  onCreateLineSheet
}: ShowroomProductsScreenProps) {
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter to only show white_label (Pick & Buy) products
  const whiteLabelProducts = products.filter(p => p.productType === 'white_label');

  // Filter products
  const filteredProducts = whiteLabelProducts.filter(product => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        product.title.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Status/type filter
    if (activeFilter === 'all') return true;
    if (activeFilter === 'active') return product.status === 'active';
    if (activeFilter === 'draft') return product.status === 'draft';
    if (activeFilter === 'missing_media') return product.images.length === 0;
    return product.productType === activeFilter;
  });

  const toggleSelectAll = () => {
    if (selectedProducts.size === filteredProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(filteredProducts.map(p => p.id)));
    }
  };

  const toggleSelectProduct = (productId: string) => {
    const newSelection = new Set(selectedProducts);
    if (newSelection.has(productId)) {
      newSelection.delete(productId);
    } else {
      newSelection.add(productId);
    }
    setSelectedProducts(newSelection);
  };

  const filters: Array<{ id: FilterType; label: string; count?: number }> = [
    { id: 'all', label: 'All', count: whiteLabelProducts.length },
    { id: 'active', label: 'Active', count: whiteLabelProducts.filter(p => p.status === 'active').length },
    { id: 'draft', label: 'Draft', count: whiteLabelProducts.filter(p => p.status === 'draft').length },
    { id: 'missing_media', label: 'Missing media', count: whiteLabelProducts.filter(p => p.images.length === 0).length },
  ];

  return (
    <div className="min-h-screen bg-surface">
      {/* Top App Bar */}
      <div className="sticky top-0 bg-surface z-10 border-b border-outline-variant">
        <div className="flex items-center h-16 px-4 md:px-6">
          <button 
            className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest transition-colors mr-2"
            onClick={onBack}
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6 text-on-surface" />
          </button>
          
          <h1 className="title-large text-on-surface flex-1">
            Products
          </h1>

          <div className="flex gap-2">
            {onCreateLineSheet && (
              <Button
                onClick={onCreateLineSheet}
                variant="outline"
                size="sm"
                className="bg-surface-container border-outline hover:bg-surface-container-high"
              >
                <FileText className="w-4 h-4" />
                <span className="hidden md:inline">Line sheet</span>
              </Button>
            )}
            <Button
              onClick={onImport}
              size="sm"
              className="bg-primary text-on-primary hover:bg-primary/90"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden md:inline">Import</span>
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 md:px-6 pb-3">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
            <Input
              type="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-surface-container border-outline"
            />
          </div>
        </div>

        {/* Filter Chips */}
        <div className="px-4 md:px-6 pb-3 overflow-x-auto">
          <div className="flex gap-2">
            {filters.map(filter => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`
                  px-4 py-2 rounded-lg border whitespace-nowrap transition-colors label-medium
                  ${activeFilter === filter.id 
                    ? 'bg-secondary-container border-outline text-on-secondary-container' 
                    : 'bg-surface border-outline text-on-surface-variant hover:bg-surface-container-high'
                  }
                `}
              >
                {filter.label}
                {filter.count !== undefined && ` (${filter.count})`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedProducts.size > 0 && (
        <div className="sticky top-[180px] bg-primary-container border-b border-outline z-10">
          <div className="flex items-center gap-4 px-4 md:px-6 py-3">
            <span className="body-medium text-on-primary-container">
              {selectedProducts.size} selected
            </span>
            <div className="flex gap-2 ml-auto">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onBulkAction('publish', Array.from(selectedProducts))}
                className="text-on-primary-container hover:bg-primary-container/50"
              >
                Publish
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onBulkAction('unpublish', Array.from(selectedProducts))}
                className="text-on-primary-container hover:bg-primary-container/50"
              >
                Unpublish
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onBulkAction('assign_linesheet', Array.from(selectedProducts))}
                className="text-on-primary-container hover:bg-primary-container/50"
              >
                Assign to line sheet
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Products List/Table - M3 Grid: 16px mobile, 24px tablet+ */}
      <div className="w-full px-4 md:px-6 py-4 md:py-6">
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            {searchQuery || activeFilter !== 'all' ? (
              <>
                <AlertCircle className="w-12 h-12 text-on-surface-variant mb-4" />
                <h3 className="title-medium text-on-surface mb-2">No products found</h3>
                <p className="body-medium text-on-surface-variant mb-4">
                  Try adjusting your filters or search query
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchQuery('');
                    setActiveFilter('all');
                  }}
                  className="border-outline"
                >
                  Clear filters
                </Button>
              </>
            ) : (
              <>
                <Upload className="w-12 h-12 text-on-surface-variant mb-4" />
                <h3 className="title-medium text-on-surface mb-2">No products yet</h3>
                <p className="body-medium text-on-surface-variant mb-4">
                  Import your first products to get started
                </p>
                <Button onClick={onImport} className="bg-primary text-on-primary">
                  <Upload className="w-4 h-4 mr-2" />
                  Import products
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {/* Header row with select all */}
            <div className="hidden md:flex items-center gap-4 px-4 py-2 bg-surface-container-high rounded-lg">
              <Checkbox
                checked={selectedProducts.size === filteredProducts.length && filteredProducts.length > 0}
                onCheckedChange={toggleSelectAll}
              />
              <div className="flex-1 grid grid-cols-12 gap-4">
                <div className="col-span-4 label-medium text-on-surface-variant">Product</div>
                <div className="col-span-2 label-medium text-on-surface-variant">Type</div>
                <div className="col-span-2 label-medium text-on-surface-variant">Price</div>
                <div className="col-span-2 label-medium text-on-surface-variant">Stock</div>
                <div className="col-span-2 label-medium text-on-surface-variant">Status</div>
              </div>
              <div className="w-10" />
            </div>

            {/* Product rows */}
            {filteredProducts.map(product => (
              <div 
                key={product.id}
                className="flex items-center gap-4 p-4 bg-surface-container border border-outline-variant rounded-lg hover:bg-surface-container-high transition-colors"
              >
                <Checkbox
                  checked={selectedProducts.has(product.id)}
                  onCheckedChange={() => toggleSelectProduct(product.id)}
                />

                {/* Mobile/Tablet Layout */}
                <div className="flex-1 md:hidden">
                  <div className="flex items-start gap-3">
                    {product.images.length > 0 ? (
                      <img 
                        src={product.images[0]} 
                        alt={product.title}
                        className="w-16 h-16 rounded-lg object-cover bg-surface-container-highest"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-surface-container-highest flex items-center justify-center">
                        <AlertCircle className="w-6 h-6 text-on-surface-variant" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="title-small text-on-surface mb-1 line-clamp-1">{product.title}</div>
                      <div className="body-small text-on-surface-variant mb-2">SKU: {product.sku}</div>
                      <div className="flex flex-wrap gap-2">
                        <Badge className={productTypeBadgeColors[product.productType]}>
                          {productTypeLabels[product.productType]}
                        </Badge>
                        <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                          {product.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden md:flex flex-1 items-center gap-4">
                  <div className="grid grid-cols-12 gap-4 flex-1">
                    {/* Product Info */}
                    <div className="col-span-4 flex items-center gap-3">
                      {product.images.length > 0 ? (
                        <img 
                          src={product.images[0]} 
                          alt={product.title}
                          className="w-12 h-12 rounded-lg object-cover bg-surface-container-highest flex-shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-surface-container-highest flex items-center justify-center flex-shrink-0">
                          <AlertCircle className="w-5 h-5 text-on-surface-variant" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="body-medium text-on-surface line-clamp-1">{product.title}</div>
                        <div className="body-small text-on-surface-variant">SKU: {product.sku}</div>
                      </div>
                    </div>

                    {/* Type */}
                    <div className="col-span-2 flex items-center">
                      <Badge className={productTypeBadgeColors[product.productType]}>
                        {productTypeLabels[product.productType]}
                      </Badge>
                    </div>

                    {/* Price */}
                    <div className="col-span-2 flex items-center">
                      <div>
                        <div className="body-medium text-on-surface">${product.wholesalePrice}</div>
                        <div className="body-small text-on-surface-variant">MOQ: {product.moq}</div>
                      </div>
                    </div>

                    {/* Stock */}
                    <div className="col-span-2 flex items-center">
                      <div className="body-medium text-on-surface">
                        {product.stock !== undefined ? product.stock : '—'}
                      </div>
                    </div>

                    {/* Status */}
                    <div className="col-span-2 flex items-center">
                      <Badge 
                        className={
                          product.status === 'active' 
                            ? 'bg-tertiary-container text-on-tertiary-container' 
                            : 'bg-surface-container-highest text-on-surface-variant'
                        }
                      >
                        {product.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Actions Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="w-10 h-10 p-0 hover:bg-surface-container-highest"
                    >
                      <MoreVertical className="w-5 h-5 text-on-surface-variant" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => onEditProduct(product.id)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDuplicateProduct(product.id)}>
                      <Copy className="w-4 h-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onArchiveProduct(product.id)}
                      className="text-error"
                    >
                      <Archive className="w-4 h-4 mr-2" />
                      Archive
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}