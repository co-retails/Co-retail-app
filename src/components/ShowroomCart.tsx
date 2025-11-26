import React, { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { 
  ArrowLeft,
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  AlertCircle
} from 'lucide-react';
import { CartItem } from './ShowroomTypes';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';

interface ShowroomCartProps {
  onBack: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: (type: 'rfq', notes?: string) => void;
}

export default function ShowroomCart({
  onBack,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout
}: ShowroomCartProps) {
  const [notes, setNotes] = useState('');

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.pricePerUnit * item.quantity), 0);

  // Group items by partner
  const itemsByPartner = cartItems.reduce((acc, item) => {
    if (!acc[item.partnerId]) {
      acc[item.partnerId] = {
        partnerName: item.partnerName,
        items: []
      };
    }
    acc[item.partnerId].items.push(item);
    return acc;
  }, {} as Record<string, { partnerName: string; items: CartItem[] }>);

  // Check MOQ violations
  const moqViolations = cartItems.filter(item => item.quantity < item.moq);

  const canCheckout = cartItems.length > 0 && moqViolations.length === 0;

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Spacer for top nav on desktop */}
      <div className="hidden md:block h-16"></div>
      {/* Top App Bar */}
      <div className="sticky top-0 md:top-16 bg-surface z-[90] border-b border-outline-variant">
        <div className="flex items-center h-16 px-4 md:px-6">
          <button 
            className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest transition-colors mr-2"
            onClick={onBack}
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6 text-on-surface" />
          </button>
          
          <h1 className="title-large text-on-surface flex-1">
            Cart
          </h1>

          <Badge className="bg-primary-container text-on-primary-container">
            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
          </Badge>
        </div>
      </div>

      {cartItems.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <ShoppingBag className="w-16 h-16 text-on-surface-variant mb-4" />
          <h2 className="title-medium text-on-surface mb-2">Your cart is empty</h2>
          <p className="body-medium text-on-surface-variant mb-6">
            Browse products and add items to your cart
          </p>
          <Button onClick={onBack} className="bg-primary text-on-primary">
            Start shopping
          </Button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 md:px-6 py-4 md:py-6 space-y-6">
            {/* MOQ Warnings */}
            {moqViolations.length > 0 && (
              <div className="p-4 bg-error-container rounded-lg border border-outline-variant">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-on-error-container flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="body-medium text-on-error-container mb-1">
                      Minimum order quantity not met
                    </div>
                    <div className="body-small text-on-error-container">
                      Some items don't meet their minimum order quantity. Please adjust quantities before checkout.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Cart Items by Partner */}
            {Object.entries(itemsByPartner).map(([partnerId, { partnerName, items }]) => (
              <div key={partnerId} className="space-y-2">
                <h2 className="title-small text-on-surface px-2">
                  {partnerName}
                </h2>
                
                <div className="bg-surface-container border border-outline-variant rounded-lg divide-y divide-outline-variant">
                  {items.map(item => {
                    const meetsMinimum = item.quantity >= item.moq;
                    
                    return (
                      <div key={item.productId} className="p-4">
                        <div className="flex gap-4">
                          {/* Image */}
                          {item.image && (
                            <img 
                              src={item.image} 
                              alt={item.title}
                              className="w-20 h-20 rounded-lg object-cover bg-surface-container-highest flex-shrink-0"
                            />
                          )}

                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <h3 className="body-medium text-on-surface mb-1 line-clamp-2">
                              {item.title}
                            </h3>
                            <div className="body-small text-on-surface-variant mb-2">
                              SKU: {item.sku}
                              {item.variant && ` • ${item.variant}`}
                            </div>

                            {/* MOQ Warning */}
                            {!meetsMinimum && (
                              <div className="flex items-center gap-1 mb-2">
                                <AlertCircle className="w-4 h-4 text-error" />
                                <span className="body-small text-error">
                                  Minimum order: {item.moq} units
                                </span>
                              </div>
                            )}

                            {/* Price & Quantity Controls */}
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="title-small text-on-surface">
                                  ${(item.pricePerUnit * item.quantity).toFixed(2)}
                                </div>
                                <div className="body-small text-on-surface-variant">
                                  ${item.pricePerUnit.toFixed(2)} per unit
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => {
                                    const newQty = item.quantity - 1;
                                    if (newQty >= 1) {
                                      onUpdateQuantity(item.productId, newQty);
                                    }
                                  }}
                                  disabled={item.quantity <= 1}
                                  className="h-8 w-8 border-outline hover:bg-surface-container-high"
                                >
                                  <Minus className="w-4 h-4" />
                                </Button>
                                <span className="body-medium text-on-surface w-10 text-center">
                                  {item.quantity}
                                </span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                                  className="h-8 w-8 border-outline hover:bg-surface-container-high"
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => onRemoveItem(item.productId)}
                                  className="h-8 w-8 text-error hover:bg-error-container"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Order Notes */}
            <div className="bg-surface-container border border-outline-variant rounded-lg p-4">
              <Label htmlFor="notes" className="body-medium text-on-surface mb-2 block">
                Quotation notes (optional)
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any special requirements, customization requests, or questions for the seller..."
                className="min-h-[100px] border-outline bg-surface"
              />
            </div>
          </div>
        </div>
      )}

      {/* Bottom Summary Bar */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-outline-variant p-4 z-10">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="body-small text-on-surface-variant mb-1">Subtotal</div>
                <div className="title-large text-on-surface">${subtotal.toFixed(2)}</div>
              </div>
              <div className="text-right">
                <div className="body-small text-on-surface-variant">
                  {cartItems.reduce((sum, item) => sum + item.quantity, 0)} total units
                </div>
                <div className="body-small text-on-surface-variant">
                  from {Object.keys(itemsByPartner).length} {Object.keys(itemsByPartner).length === 1 ? 'partner' : 'partners'}
                </div>
              </div>
            </div>

            <Button
              onClick={() => onCheckout('rfq', notes)}
              disabled={!canCheckout}
              className="w-full bg-primary text-on-primary h-12"
            >
              Request quote
            </Button>

            {!canCheckout && moqViolations.length > 0 && (
              <div className="text-center body-small text-error mt-2">
                Please meet minimum order quantities before requesting quote
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}