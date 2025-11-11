import React, { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { 
  Bookmark, 
  Trash2, 
  ShoppingCart,
  Leaf,
  Info,
  ArrowLeft
} from 'lucide-react';
import { ShowroomProduct } from './ShowroomTypes';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

interface BuyerWishlistScreenProps {
  wishlistProducts: ShowroomProduct[];
  onBack: () => void;
  onRemoveFromWishlist: (productId: string) => void;
  onAddToCart: (productId: string, quantity: number) => void;
  onProductClick: (productId: string) => void;
}

const productTypeLabels = {
  resell: 'Resell',
  external: 'External Brand',
  produce_on_demand: 'On-Demand',
  white_label: 'Pick & Buy',
  co_lab: 'Co-Lab'
};

export default function BuyerWishlistScreen({
  wishlistProducts,
  onBack,
  onRemoveFromWishlist,
  onAddToCart,
  onProductClick
}: BuyerWishlistScreenProps) {
  const [productToRemove, setProductToRemove] = useState<string | null>(null);

  const handleRemove = (productId: string) => {
    setProductToRemove(productId);
  };

  const confirmRemove = () => {
    if (productToRemove) {
      onRemoveFromWishlist(productToRemove);
      setProductToRemove(null);
    }
  };

  return (
    <div className="min-h-screen bg-surface pb-20 md:pb-0 md:pl-20">
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
          
          <div className="flex-1">
            <h1 className="title-large text-on-surface">Wishlist</h1>
            <p className="body-small text-on-surface-variant">
              {wishlistProducts.length} {wishlistProducts.length === 1 ? 'product' : 'products'}
            </p>
          </div>
        </div>
      </div>

      <div className="w-full px-4 md:px-6 py-4 md:py-6">
        {wishlistProducts.length === 0 ? (
          <Card className="p-12 bg-surface-container border-outline-variant text-center">
            <Bookmark className="w-16 h-16 text-on-surface-variant mx-auto mb-4 opacity-50" />
            <h2 className="title-medium text-on-surface mb-2">Your wishlist is empty</h2>
            <p className="body-medium text-on-surface-variant mb-6">
              Save products you're interested in to easily find them later
            </p>
            <Button 
              onClick={onBack}
              className="bg-primary text-on-primary"
            >
              Browse products
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {wishlistProducts.map(product => (
              <Card 
                key={product.id}
                className="bg-surface-container border-outline-variant overflow-hidden"
              >
                {/* Image */}
                <button
                  onClick={() => onProductClick(product.id)}
                  className="w-full aspect-square bg-surface-container-highest relative overflow-hidden group"
                >
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

                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
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

                  {/* Remove from wishlist button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(product.id);
                    }}
                    className="absolute top-2 right-2 w-8 h-8 bg-primary/90 hover:bg-primary rounded-full flex items-center justify-center backdrop-blur-sm transition-colors"
                  >
                    <Bookmark className="w-5 h-5 text-on-primary fill-current" />
                  </button>
                </button>

                {/* Content */}
                <div className="p-4">
                  <div className="body-small text-on-surface-variant mb-1">{product.partnerName}</div>
                  <h3 className="title-small text-on-surface mb-1 line-clamp-2 min-h-[40px]">{product.title}</h3>
                  <div className="body-small text-on-surface-variant mb-2">{product.brand}</div>
                  
                  <div className="flex items-baseline gap-2 mb-3">
                    <div className="title-medium text-on-surface">${product.wholesalePrice}</div>
                    {product.priceTiers.length > 0 && (
                      <div className="body-small text-on-surface-variant">
                        from ${Math.min(...product.priceTiers.map(t => t.price))}
                      </div>
                    )}
                  </div>

                  {product.moq > 1 && (
                    <div className="body-small text-on-surface-variant mb-3 flex items-center gap-1">
                      <Info className="w-4 h-4" />
                      MOQ: {product.moq} units
                    </div>
                  )}

                  {product.leadTime && (
                    <div className="body-small text-on-surface-variant mb-3">
                      Lead time: {product.leadTime} days
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button 
                      onClick={() => onAddToCart(product.id, product.moq)}
                      className="flex-1 bg-primary text-on-primary"
                      size="sm"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to cart
                    </Button>
                    <Button 
                      onClick={() => handleRemove(product.id)}
                      variant="outline"
                      size="sm"
                      className="border-outline"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!productToRemove} onOpenChange={(open) => !open && setProductToRemove(null)}>
        <AlertDialogContent className="bg-surface border-outline-variant">
          <AlertDialogHeader>
            <AlertDialogTitle className="title-large text-on-surface">
              Remove from wishlist?
            </AlertDialogTitle>
            <AlertDialogDescription className="body-medium text-on-surface-variant">
              This product will be removed from your wishlist. You can add it back anytime.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-outline">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmRemove}
              className="bg-error text-on-error hover:bg-error/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
