import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { 
  Package, 
  Upload, 
  FileText, 
  TrendingUp,
  AlertCircle,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Copy,
  Archive,
  Check,
  Plus,
  Eye,
  EyeOff,
  Calendar,
  Globe,
  Trash2,
  Share2
} from 'lucide-react';
import { ShowroomProduct, ShowroomAnalytics, ProductType, ProductStatus, LineSheet } from './ShowroomTypes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface PartnerShowroomDashboardProps {
  onNavigateToProducts: () => void;
  onNavigateToImport: () => void;
  onNavigateToLineSheets: () => void;
  products: ShowroomProduct[];
  lineSheets: LineSheet[];
  catalogHealth: {
    total: number;
    active: number;
    draft: number;
    missingMedia: number;
    missingAttributes: number;
  };
  analytics: ShowroomAnalytics;
  onEditProduct: (productId: string) => void;
  onDuplicateProduct: (productId: string) => void;
  onArchiveProduct: (productId: string) => void;
  onBulkAction: (action: 'publish' | 'unpublish' | 'assign_linesheet', productIds: string[]) => void;
  onCreateLineSheet: () => void;
  onEditLineSheet?: (lineSheetId: string) => void;
  onDeleteLineSheet?: (lineSheetId: string) => void;
  onShareLineSheet?: (lineSheetId: string) => void;
  onViewLineSheet?: (lineSheetId: string) => void;
  activeTab?: 'products' | 'linesheets';
  onTabChange?: (tab: 'products' | 'linesheets') => void;
}

type TabType = 'products' | 'linesheets';
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

export default function PartnerShowroomDashboard({
  onNavigateToProducts,
  onNavigateToImport,
  onNavigateToLineSheets,
  products,
  lineSheets,
  catalogHealth,
  analytics,
  onEditProduct,
  onDuplicateProduct,
  onArchiveProduct,
  onBulkAction,
  onCreateLineSheet,
  onEditLineSheet,
  onDeleteLineSheet,
  onShareLineSheet,
  onViewLineSheet,
  activeTab: controlledActiveTab,
  onTabChange
}: PartnerShowroomDashboardProps) {
  const [internalActiveTab, setInternalActiveTab] = useState<TabType>('products');
  const activeTab = controlledActiveTab || internalActiveTab;
  
  const handleTabChange = (tab: TabType) => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setInternalActiveTab(tab);
    }
  };
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter products to only show white_label (Pick & Buy) products
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
          <h1 className="title-large text-on-surface flex-1">
            Showroom
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-outline-variant">
          <button
            onClick={() => handleTabChange('products')}
            className="flex-1 pb-3 pt-2 px-4 relative"
          >
            <div className={`title-small text-center ${
              activeTab === 'products' ? 'text-on-surface' : 'text-on-surface-variant'
            }`}>
              My products
            </div>
            {activeTab === 'products' && (
              <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full" />
            )}
          </button>
          <button
            onClick={() => handleTabChange('linesheets')}
            className="flex-1 pb-3 pt-2 px-4 relative"
          >
            <div className={`title-small text-center ${
              activeTab === 'linesheets' ? 'text-on-surface' : 'text-on-surface-variant'
            }`}>
              Line sheets
            </div>
            {activeTab === 'linesheets' && (
              <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'products' && (
        <div>
          {/* Action Button - M3 Grid: 16px mobile, 24px tablet+ */}
          <div className="px-4 md:px-6 py-4 md:py-6">
            <Button 
              onClick={onNavigateToImport}
              variant="outline"
              className="w-full md:w-auto bg-surface-container border-outline hover:bg-surface-container-high"
            >
              <Upload className="w-5 h-5" />
              Import products
            </Button>
          </div>

          {/* Search Bar - M3 Grid: 16px mobile, 24px tablet+ */}
          <div className="px-4 md:px-6 pb-3">
            <div className="relative max-w-full md:max-w-md">
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

          {/* Filter Chips - M3 Grid: 16px mobile, 24px tablet+ */}
          <div className="px-4 md:px-6 pb-3 overflow-x-auto scrollbar-hide">
            <div className="flex gap-2">
              {filters.map(filter => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`
                    h-8 px-4 rounded-lg border whitespace-nowrap transition-colors label-medium flex items-center gap-1.5
                    ${activeFilter === filter.id 
                      ? 'bg-secondary-container border-outline text-on-secondary-container' 
                      : 'bg-surface border-outline text-on-surface-variant hover:bg-surface-container-high'
                    }
                  `}
                >
                  <span className="label-medium">
                    {filter.label}
                    {filter.count !== undefined && ` (${filter.count})`}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Bulk Actions Bar */}
          {selectedProducts.size > 0 && (
            <div className="sticky top-[120px] bg-primary-container border-b border-outline z-10">
              <div className="flex items-center gap-4 px-4 md:px-6 py-3">
                <span className="body-medium text-on-primary-container">
                  {selectedProducts.size} selected
                </span>
                <div className="flex gap-2 ml-auto">
                  <button 
                    onClick={() => onBulkAction('publish', Array.from(selectedProducts))}
                    className="px-3 py-1.5 bg-primary text-on-primary rounded-full hover:bg-primary/90 transition-colors label-medium"
                  >
                    Publish
                  </button>
                  <button 
                    onClick={() => onBulkAction('unpublish', Array.from(selectedProducts))}
                    className="px-3 py-1.5 bg-surface-container text-on-surface rounded-full hover:bg-surface-container-high transition-colors label-medium"
                  >
                    Unpublish
                  </button>
                  <button 
                    onClick={() => onBulkAction('assign_linesheet', Array.from(selectedProducts))}
                    className="px-3 py-1.5 bg-surface-container text-on-surface rounded-full hover:bg-surface-container-high transition-colors label-medium"
                  >
                    Assign to line sheet
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Products List - M3 Grid: 16px mobile, 24px tablet+ */}
          <div className="px-4 md:px-6 py-4 md:py-6">
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                {searchQuery || activeFilter !== 'all' ? (
                  <>
                    <AlertCircle className="w-12 h-12 text-on-surface-variant mb-4" />
                    <h3 className="title-medium text-on-surface mb-2">No products found</h3>
                    <p className="body-medium text-on-surface-variant mb-4">
                      Try adjusting your filters or search query
                    </p>
                    <button 
                      onClick={() => {
                        setSearchQuery('');
                        setActiveFilter('all');
                      }}
                      className="px-6 py-3 bg-primary text-on-primary rounded-lg hover:bg-primary/90 transition-colors label-large"
                    >
                      Clear filters
                    </button>
                  </>
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-on-surface-variant mb-4" />
                    <h3 className="title-medium text-on-surface mb-2">No products yet</h3>
                    <p className="body-medium text-on-surface-variant mb-4">
                      Import your first products to get started
                    </p>
                    <button 
                      onClick={onNavigateToImport}
                      className="px-6 py-3 bg-primary text-on-primary rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 label-large"
                    >
                      <Upload className="w-4 h-4" />
                      Import products
                    </button>
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
                            <Badge className={
                              product.status === 'active' 
                                ? 'bg-tertiary-container text-on-tertiary-container' 
                                : 'bg-surface-container-highest text-on-surface-variant'
                            }>
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
                        <button 
                          className="w-10 h-10 p-0 hover:bg-surface-container-highest rounded-full transition-colors flex items-center justify-center"
                        >
                          <MoreVertical className="w-5 h-5 text-on-surface-variant" />
                        </button>
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
      )}

      {activeTab === 'linesheets' && (
        <div className="px-4 md:px-6 py-4 md:py-6">
          {/* Action Button */}
          <div className="mb-6">
            <Button
              onClick={onCreateLineSheet}
              className="bg-primary text-on-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create line sheet
            </Button>
          </div>

          {/* Line Sheets List */}
          {lineSheets.length === 0 ? (
            <Card className="p-12 bg-surface-container border border-outline-variant text-center">
              <FileText className="w-12 h-12 text-on-surface-variant mx-auto mb-4" />
              <h3 className="title-large text-on-surface mb-2">No line sheets yet</h3>
              <p className="body-medium text-on-surface-variant mb-6">
                Create your first line sheet to showcase products to buyers
              </p>
            </Card>
          ) : (
            <div className="w-full space-y-3">
              {lineSheets.map((lineSheet) => (
                <Card
                  key={lineSheet.id}
                  className="p-4 bg-surface-container border border-outline-variant hover:bg-surface-container-high transition-colors cursor-pointer"
                  onClick={() => onViewLineSheet?.(lineSheet.id)}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary-container rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-on-primary-container" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="title-medium text-on-surface mb-1">{lineSheet.name}</h3>
                          <div className="flex items-center gap-3 flex-wrap">
                            <Badge 
                              className={
                                lineSheet.status === 'active' 
                                  ? 'bg-tertiary-container text-on-tertiary-container'
                                  : lineSheet.status === 'expired'
                                  ? 'bg-surface-container-highest text-on-surface-variant border border-outline'
                                  : 'bg-secondary-container text-on-secondary-container'
                              }
                            >
                              {lineSheet.status.charAt(0).toUpperCase() + lineSheet.status.slice(1)}
                            </Badge>
                            
                            <div className="flex items-center gap-1 text-on-surface-variant">
                              {lineSheet.visibility === 'public' ? (
                                <Eye className="w-4 h-4" />
                              ) : (
                                <EyeOff className="w-4 h-4" />
                              )}
                              <span className="body-small">{lineSheet.visibility}</span>
                            </div>
                          </div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-highest transition-colors">
                              <MoreVertical className="w-5 h-5 text-on-surface-variant" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            {onShareLineSheet && (
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                onShareLineSheet(lineSheet.id);
                              }}>
                                <Share2 className="w-4 h-4 mr-2" />
                                Share
                              </DropdownMenuItem>
                            )}
                            {onEditLineSheet && (
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                onEditLineSheet(lineSheet.id);
                              }}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                            )}
                            {onDeleteLineSheet && (
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteLineSheet(lineSheet.id);
                                }}
                                className="text-error"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Metadata */}
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-1 text-on-surface-variant">
                          <Package className="w-4 h-4" />
                          <span className="body-small">{lineSheet.productIds.length} products</span>
                        </div>
                        
                        <div className="flex items-center gap-1 text-on-surface-variant">
                          <Calendar className="w-4 h-4" />
                          <span className="body-small">
                            {new Date(lineSheet.availableFrom).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(lineSheet.availableUntil).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>

                        {lineSheet.targetMarkets && lineSheet.targetMarkets.length > 0 && (
                          <div className="flex items-center gap-1 text-on-surface-variant">
                            <Globe className="w-4 h-4" />
                            <span className="body-small">{lineSheet.targetMarkets.length} markets</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}