import React, { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { 
  Search, 
  Filter,
  ShoppingCart,
  Bookmark,
  BookmarkPlus,
  Leaf
} from 'lucide-react';
import { ShowroomProduct, ProductType } from './ShowroomTypes';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from './ui/sheet';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';

interface BuyerShowroomBrowseProps {
  products: ShowroomProduct[];
  onProductClick: (productId: string) => void;
  onAddToCart: (productId: string, quantity: number) => void;
  cartItemCount: number;
  onViewCart: () => void;
  wishlistProductIds: string[];
  onToggleWishlist: (productId: string) => void;
}

interface Filters {
  productTypes: ProductType[];
  brands: string[];
  categories: string[];
  suppliers: string[];
  priceRange: { min: number; max: number } | null;
  availability: boolean;
  sustainability: boolean;
}

const productTypeLabels: Record<ProductType, string> = {
  resell: 'Resell',
  external: 'External Brand',
  produce_on_demand: 'On-Demand',
  white_label: 'Pick & Buy',
  co_lab: 'Co-Lab'
};

export default function BuyerShowroomBrowse({
  products,
  onProductClick,
  onAddToCart,
  cartItemCount,
  onViewCart,
  wishlistProductIds,
  onToggleWishlist
}: BuyerShowroomBrowseProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Filters>({
    productTypes: [],
    brands: [],
    categories: [],
    suppliers: [],
    priceRange: null,
    availability: false,
    sustainability: false
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter to only show white_label (Pick & Buy) products
  const whiteLabelProducts = products.filter(p => p.productType === 'white_label');

  // Extract unique values for filters
  const uniqueBrands = Array.from(new Set(whiteLabelProducts.map(p => p.brand))).sort();
  const uniqueCategories = Array.from(new Set(whiteLabelProducts.map(p => p.category))).sort();
  const uniqueSuppliers = Array.from(new Set(whiteLabelProducts.map(p => p.partnerName))).sort();

  // Filter products
  const filteredProducts = whiteLabelProducts.filter(product => {
    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        product.title.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Product type filter
    if (filters.productTypes.length > 0 && !filters.productTypes.includes(product.productType)) {
      return false;
    }

    // Brand filter
    if (filters.brands.length > 0 && !filters.brands.includes(product.brand)) {
      return false;
    }

    // Category filter
    if (filters.categories.length > 0 && !filters.categories.includes(product.category)) {
      return false;
    }

    // Supplier filter
    if (filters.suppliers.length > 0 && !filters.suppliers.includes(product.partnerName)) {
      return false;
    }

    // Price range filter
    if (filters.priceRange) {
      if (product.wholesalePrice < filters.priceRange.min || product.wholesalePrice > filters.priceRange.max) {
        return false;
      }
    }

    // Availability filter
    if (filters.availability) {
      const now = new Date();
      const availStart = new Date(product.availabilityWindow.start);
      const availEnd = new Date(product.availabilityWindow.end);
      if (now < availStart || now > availEnd) return false;
    }

    // Sustainability filter
    if (filters.sustainability && (!product.sustainabilityFlags || product.sustainabilityFlags.length === 0)) {
      return false;
    }

    return true;
  });

  const toggleProductType = (type: ProductType) => {
    setFilters(prev => ({
      ...prev,
      productTypes: prev.productTypes.includes(type)
        ? prev.productTypes.filter(t => t !== type)
        : [...prev.productTypes, type]
    }));
  };

  const toggleBrand = (brand: string) => {
    setFilters(prev => ({
      ...prev,
      brands: prev.brands.includes(brand)
        ? prev.brands.filter(b => b !== brand)
        : [...prev.brands, brand]
    }));
  };

  const toggleCategory = (category: string) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const toggleSupplier = (supplier: string) => {
    setFilters(prev => ({
      ...prev,
      suppliers: prev.suppliers.includes(supplier)
        ? prev.suppliers.filter(s => s !== supplier)
        : [...prev.suppliers, supplier]
    }));
  };

  const clearFilters = () => {
    setFilters({
      productTypes: [],
      brands: [],
      categories: [],
      suppliers: [],
      priceRange: null,
      availability: false,
      sustainability: false
    });
  };

  const activeFilterCount = 
    filters.productTypes.length + 
    filters.brands.length + 
    filters.categories.length + 
    filters.suppliers.length +
    (filters.priceRange ? 1 : 0) +
    (filters.availability ? 1 : 0) +
    (filters.sustainability ? 1 : 0);

  return (
    <div className="min-h-screen bg-surface">
      {/* Top App Bar */}
      <div className="sticky top-0 bg-surface z-10 border-b border-outline-variant">
        <div className="flex items-center h-16 px-4 md:px-6">
          <h1 className="title-large text-on-surface flex-1">
            Browse products
          </h1>

          <Button 
            variant="ghost" 
            size="sm"
            onClick={onViewCart}
            className="relative hover:bg-surface-container-high"
          >
            <ShoppingCart className="w-6 h-6 text-on-surface" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-error text-on-error w-5 h-5 rounded-full flex items-center justify-center text-xs">
                {cartItemCount}
              </span>
            )}
          </Button>
        </div>

        {/* Search Bar */}
        <div className="px-4 md:px-6 pb-3 flex gap-2">
          <div className="relative flex-1 md:flex-none md:w-[576px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
            <Input
              type="search"
              placeholder="Search products, brands, SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-surface-container border-outline"
            />
          </div>

          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="outline" 
                size="icon"
                className="relative border-outline hover:bg-surface-container-high"
              >
                <Filter className="w-5 h-5" />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-error text-on-error w-5 h-5 rounded-full flex items-center justify-center text-xs">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md bg-surface p-0 flex flex-col">
              <SheetHeader className="px-6 pt-6 pb-4 border-b border-outline-variant">
                <SheetTitle className="title-large text-on-surface">Filters</SheetTitle>
                <SheetDescription className="body-medium text-on-surface-variant">
                  Refine your product search by type, supplier, brand, category, and more
                </SheetDescription>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto px-6 py-6">
                <div className="space-y-6">
                  {/* Product Type */}
                  <div className="space-y-4">
                    <h3 className="title-small text-on-surface">Product type</h3>
                    <div className="space-y-3">
                      {(Object.keys(productTypeLabels) as ProductType[]).map(type => (
                        <div key={type} className="flex items-center gap-3">
                          <Checkbox
                            id={`type-${type}`}
                            checked={filters.productTypes.includes(type)}
                            onCheckedChange={() => toggleProductType(type)}
                          />
                          <Label htmlFor={`type-${type}`} className="body-medium text-on-surface cursor-pointer">
                            {productTypeLabels[type]}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Supplier */}
                  <div className="space-y-4">
                    <h3 className="title-small text-on-surface">Supplier</h3>
                    <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                      {uniqueSuppliers.map(supplier => (
                        <div key={supplier} className="flex items-center gap-3">
                          <Checkbox
                            id={`supplier-${supplier}`}
                            checked={filters.suppliers.includes(supplier)}
                            onCheckedChange={() => toggleSupplier(supplier)}
                          />
                          <Label htmlFor={`supplier-${supplier}`} className="body-medium text-on-surface cursor-pointer">
                            {supplier}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Brand */}
                  <div className="space-y-4">
                    <h3 className="title-small text-on-surface">Brand</h3>
                    <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                      {uniqueBrands.map(brand => (
                        <div key={brand} className="flex items-center gap-3">
                          <Checkbox
                            id={`brand-${brand}`}
                            checked={filters.brands.includes(brand)}
                            onCheckedChange={() => toggleBrand(brand)}
                          />
                          <Label htmlFor={`brand-${brand}`} className="body-medium text-on-surface cursor-pointer">
                            {brand}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Category */}
                  <div className="space-y-4">
                    <h3 className="title-small text-on-surface">Category</h3>
                    <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                      {uniqueCategories.map(category => (
                        <div key={category} className="flex items-center gap-3">
                          <Checkbox
                            id={`category-${category}`}
                            checked={filters.categories.includes(category)}
                            onCheckedChange={() => toggleCategory(category)}
                          />
                          <Label htmlFor={`category-${category}`} className="body-medium text-on-surface cursor-pointer">
                            {category}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Availability */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id="availability"
                        checked={filters.availability}
                        onCheckedChange={(checked) => 
                          setFilters(prev => ({ ...prev, availability: checked as boolean }))
                        }
                      />
                      <Label htmlFor="availability" className="body-medium text-on-surface cursor-pointer">
                        Available now
                      </Label>
                    </div>
                  </div>

                  {/* Sustainability */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id="sustainability"
                        checked={filters.sustainability}
                        onCheckedChange={(checked) => 
                          setFilters(prev => ({ ...prev, sustainability: checked as boolean }))
                        }
                      />
                      <Label htmlFor="sustainability" className="body-medium text-on-surface cursor-pointer flex items-center gap-1">
                        <Leaf className="w-4 h-4" />
                        Sustainable products
                      </Label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-outline-variant bg-surface px-6 py-4 mt-auto">
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={clearFilters}
                    className="flex-1 border-outline"
                  >
                    Clear all
                  </Button>
                  <Button 
                    onClick={() => setIsFilterOpen(false)}
                    className="flex-1 bg-primary text-on-primary"
                  >
                    Show {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Active filter chips */}
        {activeFilterCount > 0 && (
          <div className="px-4 md:px-6 pb-3 flex gap-2 overflow-x-auto">
            {filters.productTypes.map(type => (
              <Badge 
                key={type}
                className="bg-secondary-container text-on-secondary-container whitespace-nowrap"
              >
                {productTypeLabels[type]}
                <button 
                  onClick={() => toggleProductType(type)}
                  className="ml-1 hover:bg-on-secondary-container/10 rounded-full"
                >
                  ×
                </button>
              </Badge>
            ))}
            {filters.suppliers.map(supplier => (
              <Badge 
                key={supplier}
                className="bg-tertiary-container text-on-tertiary-container whitespace-nowrap"
              >
                {supplier}
                <button 
                  onClick={() => toggleSupplier(supplier)}
                  className="ml-1 hover:bg-on-tertiary-container/10 rounded-full"
                >
                  ×
                </button>
              </Badge>
            ))}
            {filters.brands.map(brand => (
              <Badge 
                key={brand}
                className="bg-secondary-container text-on-secondary-container whitespace-nowrap"
              >
                {brand}
                <button 
                  onClick={() => toggleBrand(brand)}
                  className="ml-1 hover:bg-on-secondary-container/10 rounded-full"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Product Grid */}
      <div className="px-4 md:px-6 py-6">
        <div className="mb-6 body-medium text-on-surface-variant">
          {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {filteredProducts.map(product => (
            <button
              key={product.id}
              onClick={() => onProductClick(product.id)}
              className="group bg-surface-container border border-outline-variant rounded-xl overflow-hidden hover:shadow-lg transition-all text-left"
            >
              {/* Image */}
              <div className="aspect-square bg-surface-container-highest relative overflow-hidden">
                {product.images.length > 0 ? (
                  <img 
                    src={product.images[0]} 
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="body-small text-on-surface-variant">No image</span>
                  </div>
                )}

                {/* Badges overlay */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  <Badge className="bg-primary-container/90 text-on-primary-container backdrop-blur-sm">
                    {productTypeLabels[product.productType]}
                  </Badge>
                  {product.sustainabilityFlags && product.sustainabilityFlags.length > 0 && (
                    <Badge className="bg-tertiary-container/90 text-on-tertiary-container backdrop-blur-sm flex items-center gap-1">
                      <Leaf className="w-3 h-3" />
                      Sustainable
                    </Badge>
                  )}
                </div>

                {/* MOQ Badge */}
                {product.moq > 1 && (
                  <div className="absolute bottom-3 right-3">
                    <Badge className="bg-surface/90 text-on-surface backdrop-blur-sm">
                      MOQ: {product.moq}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4 space-y-2">
                <div className="label-large text-primary">{product.partnerName}</div>
                <h3 className="title-small text-on-surface line-clamp-2 min-h-[40px]">{product.title}</h3>
                <div className="body-medium text-on-surface-variant">{product.brand}</div>
                
                <div className="flex items-baseline gap-2 pt-1">
                  <div className="title-medium text-on-surface">${product.wholesalePrice}</div>
                  {product.priceTiers.length > 0 && (
                    <div className="body-small text-on-surface-variant">
                      from ${Math.min(...product.priceTiers.map(t => t.price))}
                    </div>
                  )}
                </div>

                {product.leadTime && (
                  <div className="body-small text-on-surface-variant">
                    Lead time: {product.leadTime} days
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <Search className="w-12 h-12 text-on-surface-variant mx-auto mb-4" />
            <h3 className="title-medium text-on-surface mb-2">No products found</h3>
            <p className="body-medium text-on-surface-variant mb-4">
              Try adjusting your search or filters
            </p>
            {activeFilterCount > 0 && (
              <Button onClick={clearFilters} variant="outline" className="border-outline">
                Clear filters
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}