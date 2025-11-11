import React, { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { 
  ArrowLeft,
  Minus,
  Plus,
  ShoppingCart,
  Leaf,
  Package,
  Truck,
  Info,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { ShowroomProduct, ProductType } from './ShowroomTypes';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from './ui/carousel';

interface ShowroomProductDetailProps {
  product: ShowroomProduct;
  onBack: () => void;
  onAddToCart: (quantity: number, variant?: string) => void;
}

const productTypeLabels: Record<ProductType, string> = {
  resell: 'Resell',
  external: 'External Brand Wholesale',
  produce_on_demand: 'Produce-on-Demand',
  white_label: 'Pick & Buy',
  co_lab: 'Co-Lab'
};

const productTypeDescriptions: Record<ProductType, string> = {
  resell: 'Pre-owned items from verified sources',
  external: 'Wholesale products from external brands',
  produce_on_demand: 'Custom production based on your order',
  white_label: 'Customizable with your brand',
  co_lab: 'Collaborative collection with shared branding'
};

// Common apparel sizes
const APPAREL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export default function ShowroomProductDetail({
  product,
  onBack,
  onAddToCart
}: ShowroomProductDetailProps) {
  // Check if this is an apparel category that should show size breakdown
  const isApparelCategory = product.category && 
    ['Outerwear', 'Knitwear', 'Dresses', 'Tops', 'Bottoms', 'Activewear'].includes(product.category);
  
  const [quantity, setQuantity] = useState(product.moq);
  const [selectedImage, setSelectedImage] = useState(0);
  
  // Size-based ordering state - default to true for apparel
  const [sizeQuantities, setSizeQuantities] = useState<Record<string, number>>(
    APPAREL_SIZES.reduce((acc, size) => ({ ...acc, [size]: 0 }), {})
  );
  const useSizeBreakdown = isApparelCategory;

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    if (quantity > product.moq) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleQuantityChange = (value: string) => {
    const num = parseInt(value);
    if (!isNaN(num) && num >= product.moq) {
      setQuantity(num);
    }
  };

  // Calculate price based on quantity and tiers
  const getPriceForQuantity = (qty: number): number => {
    if (product.priceTiers.length === 0) {
      return product.wholesalePrice;
    }

    // Find applicable tier
    const applicableTier = product.priceTiers
      .filter(tier => qty >= tier.minQuantity)
      .sort((a, b) => b.minQuantity - a.minQuantity)[0];

    return applicableTier ? applicableTier.price : product.wholesalePrice;
  };

  const handleSizeQuantityChange = (size: string, value: string) => {
    const num = parseInt(value);
    if (!isNaN(num) && num >= 0) {
      setSizeQuantities(prev => ({ ...prev, [size]: num }));
    }
  };

  const incrementSizeQuantity = (size: string) => {
    setSizeQuantities(prev => ({ ...prev, [size]: prev[size] + 1 }));
  };

  const decrementSizeQuantity = (size: string) => {
    setSizeQuantities(prev => ({ ...prev, [size]: Math.max(0, prev[size] - 1) }));
  };

  const totalSizeQuantity = Object.values(sizeQuantities).reduce((sum, qty) => sum + qty, 0);
  const effectiveQuantity = useSizeBreakdown ? totalSizeQuantity : quantity;
  const pricePerUnit = getPriceForQuantity(effectiveQuantity);
  const totalPrice = pricePerUnit * effectiveQuantity;

  const isAvailable = () => {
    const now = new Date();
    const start = new Date(product.availabilityWindow.start);
    const end = new Date(product.availabilityWindow.end);
    return now >= start && now <= end;
  };

  const canAddToCart = useSizeBreakdown 
    ? totalSizeQuantity >= product.moq 
    : quantity >= product.moq;

  return (
    <div className="min-h-screen bg-surface">
      {/* Top App Bar */}
      <div className="sticky top-0 bg-surface z-10 border-b border-outline-variant">
        <div className="flex items-center min-h-16 px-4 md:px-6 py-3">
          <button 
            className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest transition-colors mr-2 flex-shrink-0"
            onClick={onBack}
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6 text-on-surface" />
          </button>
          
          <div className="flex-1 min-w-0">
            <h1 className="title-large text-on-surface line-clamp-1">
              {product.title}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="body-small text-primary">{product.partnerName}</span>
              <span className="body-small text-on-surface-variant">•</span>
              <span className="body-small text-on-surface-variant">{product.brand}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 md:px-6 py-4 md:py-6 pb-20 md:pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
          {/* Left Column - Images */}
          <div className="space-y-4">
            {/* Image Carousel */}
            {product.images.length > 0 ? (
              <div className="relative">
                <Carousel className="w-full">
                  <CarouselContent>
                    {product.images.map((image, index) => (
                      <CarouselItem key={index}>
                        <div className="aspect-square bg-surface-container rounded-lg overflow-hidden">
                          <img 
                            src={image} 
                            alt={`${product.title} - Image ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/600x600?text=Image+Not+Found';
                            }}
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  {product.images.length > 1 && (
                    <>
                      <CarouselPrevious className="left-4 bg-surface/90 hover:bg-surface border-outline-variant" />
                      <CarouselNext className="right-4 bg-surface/90 hover:bg-surface border-outline-variant" />
                    </>
                  )}
                </Carousel>

                {/* Image Counter */}
                {product.images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-surface/90 backdrop-blur-sm rounded-full border border-outline-variant">
                    <span className="label-small text-on-surface">
                      {selectedImage + 1} / {product.images.length}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-square bg-surface-container rounded-lg overflow-hidden flex items-center justify-center">
                <Package className="w-16 h-16 text-on-surface-variant" />
              </div>
            )}

            {/* Thumbnail Gallery - Desktop optimized */}
            {product.images.length > 1 && (
              <div className="hidden md:block">
                <div className="grid grid-cols-5 gap-3">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                        selectedImage === index 
                          ? 'border-primary ring-2 ring-primary/20' 
                          : 'border-outline hover:border-primary/50'
                      }`}
                    >
                      <img 
                        src={image} 
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Thumbnail Gallery - Mobile optimized (scrollable) */}
            {product.images.length > 1 && (
              <div className="md:hidden">
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === index 
                          ? 'border-primary ring-2 ring-primary/20' 
                          : 'border-outline hover:border-primary/50'
                      }`}
                    >
                      <img 
                        src={image} 
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6 lg:space-y-8">
            {/* Title & Product Type */}
            <div>
              <h2 className="headline-small text-on-surface mb-3">{product.title}</h2>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-primary-container text-on-primary-container">
                  {productTypeLabels[product.productType]}
                </Badge>
                {product.sustainabilityFlags && product.sustainabilityFlags.length > 0 && (
                  <Badge className="bg-tertiary-container text-on-tertiary-container flex items-center gap-1">
                    <Leaf className="w-3 h-3" />
                    Sustainable
                  </Badge>
                )}
                {!isAvailable() && (
                  <Badge className="bg-error-container text-on-error-container">
                    Not currently available
                  </Badge>
                )}
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <h3 className="title-small text-on-surface mb-2">Description</h3>
                <p className="body-medium text-on-surface-variant">{product.description}</p>
              </div>
            )}

            {/* Key Details */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-surface-container rounded-lg">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Package className="w-4 h-4 text-on-surface-variant" />
                  <span className="body-small text-on-surface-variant">MOQ</span>
                </div>
                <div className="body-medium text-on-surface">{product.moq} units</div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Truck className="w-4 h-4 text-on-surface-variant" />
                  <span className="body-small text-on-surface-variant">Lead time</span>
                </div>
                <div className="body-medium text-on-surface">{product.leadTime} days</div>
              </div>
              {product.color && (
                <div>
                  <div className="body-small text-on-surface-variant mb-1">Color</div>
                  <div className="body-medium text-on-surface">{product.color}</div>
                </div>
              )}
              {product.size && (
                <div>
                  <div className="body-small text-on-surface-variant mb-1">Size</div>
                  <div className="body-medium text-on-surface">{product.size}</div>
                </div>
              )}
              {product.season && (
                <div>
                  <div className="body-small text-on-surface-variant mb-1">Season</div>
                  <div className="body-medium text-on-surface">{product.season}</div>
                </div>
              )}
              {product.fabric && (
                <div>
                  <div className="body-small text-on-surface-variant mb-1">Fabric</div>
                  <div className="body-medium text-on-surface">{product.fabric}</div>
                </div>
              )}
            </div>

            {/* Pricing Tiers */}
            {product.priceTiers.length > 0 && (
              <div>
                <h3 className="title-small text-on-surface mb-3">Volume pricing</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Quantity</TableHead>
                      <TableHead className="text-right">Price per unit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {product.priceTiers.map((tier, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {tier.minQuantity}
                          {tier.maxQuantity ? ` - ${tier.maxQuantity}` : '+'}
                        </TableCell>
                        <TableCell className="text-right">${tier.price.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Quantity Selector & Add to Cart */}
            <div className="pt-6 border-t border-outline-variant">
              <div className="space-y-4">
                {/* Price Display */}
                <div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <div className="title-large text-on-surface">${pricePerUnit.toFixed(2)}</div>
                    <div className="body-medium text-on-surface-variant">per unit</div>
                  </div>
                  <div className="body-small text-on-surface-variant">
                    Total: ${totalPrice.toFixed(2)} for {effectiveQuantity} units
                  </div>
                </div>

                {/* Size Breakdown Grid or Regular Quantity */}
                {useSizeBreakdown ? (
                  <div className="space-y-4">
                    <div>
                      <div className="title-small text-on-surface mb-1">Order by size</div>
                      <div className="body-small text-on-surface-variant">
                        Minimum total quantity: {product.moq} units
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {APPAREL_SIZES.map(size => (
                        <div key={size} className="space-y-2">
                          <Label className="label-large text-on-surface block">{size}</Label>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => decrementSizeQuantity(size)}
                              disabled={sizeQuantities[size] <= 0}
                              className="h-10 w-10 border-outline hover:bg-surface-container-high shrink-0"
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <Input
                              type="number"
                              value={sizeQuantities[size]}
                              onChange={(e) => handleSizeQuantityChange(size, e.target.value)}
                              min={0}
                              className="h-10 text-center border-outline flex-1 min-w-0"
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => incrementSizeQuantity(size)}
                              className="h-10 w-10 border-outline hover:bg-surface-container-high shrink-0"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    {totalSizeQuantity < product.moq && (
                      <div className="p-3 bg-error-container rounded-lg">
                        <div className="body-small text-on-error-container">
                          Total quantity ({totalSizeQuantity}) is below minimum order quantity ({product.moq})
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Regular Quantity Controls */
                  <div>
                    <Label className="body-small text-on-surface-variant mb-2 block">
                      Quantity (min. {product.moq})
                    </Label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={decrementQuantity}
                        disabled={quantity <= product.moq}
                        className="border-outline hover:bg-surface-container-high"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <Input
                        type="number"
                        value={quantity}
                        onChange={(e) => handleQuantityChange(e.target.value)}
                        min={product.moq}
                        className="w-24 text-center border-outline"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={incrementQuantity}
                        className="border-outline hover:bg-surface-container-high"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Add to Cart Button */}
                <Button
                  onClick={() => onAddToCart(useSizeBreakdown ? totalSizeQuantity : quantity)}
                  disabled={!isAvailable() || !canAddToCart}
                  className="w-full bg-primary text-on-primary h-12"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to cart
                </Button>

                {!isAvailable() && (
                  <div className="text-center body-small text-error">
                    This product is not currently available
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>;
}