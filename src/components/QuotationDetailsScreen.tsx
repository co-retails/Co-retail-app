import React, { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { Label } from './ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  ArrowLeft,
  Package,
  User,
  Building2,
  Calendar,
  DollarSign,
  Clock,
  FileText,
  CheckCircle,
  XCircle,
  MessageSquare
} from 'lucide-react';
import { ShowroomOrder, ShowroomMessage, RFQStatus } from './ShowroomTypes';

interface QuotationDetailsScreenProps {
  quotation: ShowroomOrder;
  messages: ShowroomMessage[];
  onBack: () => void;
  onSendMessage: (message: string) => void;
  onApproveQuote: (finalPrice: number) => void;
  onRejectQuote: (reason: string) => void;
}

const statusLabels: Record<RFQStatus, string> = {
  pending: 'Pending',
  negotiation: 'Negotiation',
  accepted: 'Accepted',
  declined: 'Declined',
};

const statusColors: Record<RFQStatus, string> = {
  pending: 'bg-secondary-container text-on-secondary-container',
  negotiation: 'bg-accent/10 text-accent',
  accepted: 'bg-tertiary-container text-on-tertiary-container',
  declined: 'bg-error-container text-on-error-container',
};

export default function QuotationDetailsScreen({
  quotation,
  messages,
  onBack,
  onSendMessage,
  onApproveQuote,
  onRejectQuote
}: QuotationDetailsScreenProps) {
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showSuggestPriceDialog, setShowSuggestPriceDialog] = useState(false);
  const [finalPrice, setFinalPrice] = useState(quotation.subtotal.toString());
  const [rejectReason, setRejectReason] = useState('');
  const [messageText, setMessageText] = useState('');
  const [selectedItemForPrice, setSelectedItemForPrice] = useState<{
    index: number;
    productName: string;
    currentPrice: number;
  } | null>(null);
  const [suggestedPrice, setSuggestedPrice] = useState('');
  const [itemSuggestedPrices, setItemSuggestedPrices] = useState<Record<number, number>>({});

  const handleApprove = () => {
    const price = parseFloat(finalPrice);
    if (!isNaN(price) && price > 0) {
      onApproveQuote(price);
      setShowApproveDialog(false);
    }
  };

  const handleReject = () => {
    if (rejectReason.trim()) {
      onRejectQuote(rejectReason);
      setShowRejectDialog(false);
    }
  };

  const handleSendMessage = () => {
    if (messageText.trim()) {
      onSendMessage(messageText);
      setMessageText('');
    }
  };

  const handleSuggestItemPrice = (index: number, productName: string, currentPrice: number) => {
    setSelectedItemForPrice({ index, productName, currentPrice });
    setSuggestedPrice(currentPrice.toString());
    setShowSuggestPriceDialog(true);
  };

  const handleSubmitSuggestedPrice = () => {
    if (!selectedItemForPrice) return;
    const price = parseFloat(suggestedPrice);
    if (!isNaN(price) && price > 0) {
      // Store the suggested price
      setItemSuggestedPrices(prev => ({
        ...prev,
        [selectedItemForPrice.index]: price
      }));
      // Send as message
      onSendMessage(`Suggested price for ${selectedItemForPrice.productName}: $${price.toFixed(2)}`);
      setShowSuggestPriceDialog(false);
      setSelectedItemForPrice(null);
      setSuggestedPrice('');
    }
  };

  const totalQuantity = quotation.items.reduce((sum, item) => sum + item.quantity, 0);
  const canApprove = quotation.status === 'requested' || quotation.status === 'negotiation';
  const canReject = quotation.status === 'requested' || quotation.status === 'negotiation';
  const canSuggestPrice = quotation.status === 'requested' || quotation.status === 'negotiation';

  return (
    <div className="min-h-screen bg-surface flex flex-col">
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
            <h1 className="title-large text-on-surface">
              RFQ #{quotation.id}
            </h1>
          </div>

          {canApprove && (
            <Button
              onClick={() => setShowApproveDialog(true)}
              className="mr-2"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve
            </Button>
          )}

          {canReject && (
            <Button
              variant="outline"
              onClick={() => setShowRejectDialog(true)}
              className="border-error text-error hover:bg-error-container/10"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 md:px-6 py-6 w-full space-y-6">
          {/* Status Flow Guide */}
          {(quotation.status === 'requested' || quotation.status === 'negotiation') && (
            <Card className="bg-primary-container border border-primary">
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-5 h-5 text-on-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="title-small text-on-primary-container mb-2">
                      {quotation.status === 'requested' ? 'New Quotation Request' : 'Negotiation in Progress'}
                    </h3>
                    <p className="body-small text-on-primary-container mb-3">
                      {quotation.status === 'requested' 
                        ? 'Review the buyer\'s request and respond with your quote. You can suggest prices for individual items or use the messaging section to discuss details before approving.'
                        : 'Continue negotiating with the buyer through messages. You can suggest new prices for individual items. When you reach an agreement, approve the quote with your final price.'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <div className="flex items-center gap-2 body-small text-on-primary-container">
                        <div className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs">1</div>
                        <span>Suggest prices per item</span>
                      </div>
                      <div className="flex items-center gap-2 body-small text-on-primary-container">
                        <div className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs">2</div>
                        <span>Discuss via messages</span>
                      </div>
                      <div className="flex items-center gap-2 body-small text-on-primary-container">
                        <div className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs">3</div>
                        <span>Approve with final price</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {quotation.status === 'quote_approved' && (
            <Card className="bg-tertiary-container border border-tertiary">
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-tertiary flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-on-tertiary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="title-small text-on-tertiary-container mb-2">Quote Approved - Awaiting Buyer</h3>
                    <p className="body-small text-on-tertiary-container">
                      Your quote has been approved. The buyer will review and can accept to convert this into a purchase order.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {quotation.status === 'rejected' && (
            <Card className="bg-error-container border border-error">
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-error flex items-center justify-center flex-shrink-0">
                    <XCircle className="w-5 h-5 text-on-error" />
                  </div>
                  <div className="flex-1">
                    <h3 className="title-small text-on-error-container mb-2">Quotation Rejected</h3>
                    <p className="body-small text-on-error-container">
                      This quotation request has been rejected and cannot be modified.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Status & Overview Card */}
          <Card className="bg-surface-container border border-outline-variant">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-secondary-container text-on-secondary-container">
                      RFQ
                    </Badge>
                    <Badge className={statusColors[quotation.status as RFQStatus]}>
                      {statusLabels[quotation.status as RFQStatus]}
                    </Badge>
                  </div>
                  <h2 className="headline-small text-on-surface">
                    Quotation Request #{quotation.id}
                  </h2>
                </div>
                <div className="text-right">
                  <div className="headline-medium text-on-surface">
                    ${quotation.subtotal.toFixed(2)}
                  </div>
                  <div className="body-small text-on-surface-variant">
                    Total Value
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-on-surface-variant mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="label-small text-on-surface-variant">Buyer</div>
                    <div className="body-medium text-on-surface">{quotation.buyerName}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-on-surface-variant mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="label-small text-on-surface-variant">Company</div>
                    <div className="body-medium text-on-surface">{quotation.buyerCompany}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-on-surface-variant mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="label-small text-on-surface-variant">Created Date</div>
                    <div className="body-medium text-on-surface">
                      {new Date(quotation.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>

                {quotation.requestedDeliveryDate && (
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-on-surface-variant mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="label-small text-on-surface-variant">Requested Delivery</div>
                      <div className="body-medium text-on-surface">
                        {new Date(quotation.requestedDeliveryDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Package className="w-5 h-5 text-on-surface-variant mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="label-small text-on-surface-variant">Total Items</div>
                    <div className="body-medium text-on-surface">
                      {quotation.items.length} {quotation.items.length === 1 ? 'item' : 'items'} • {totalQuantity} units
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-on-surface-variant mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="label-small text-on-surface-variant">Shipping Terms</div>
                    <div className="body-medium text-on-surface">{quotation.shippingTerms}</div>
                  </div>
                </div>
              </div>

              {quotation.notes && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <div className="label-small text-on-surface-variant mb-1">Notes</div>
                    <div className="body-medium text-on-surface whitespace-pre-wrap">
                      {quotation.notes}
                    </div>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Items List */}
          <Card className="bg-surface-container border border-outline-variant">
            <div className="p-6">
              <h3 className="title-large text-on-surface mb-4">Requested Items</h3>
              
              <div className="space-y-3">
                {quotation.items.map((item, index) => (
                  <div 
                    key={index}
                    className="bg-surface border border-outline-variant rounded-lg p-4"
                  >
                    <div className="flex items-start gap-4">
                      {item.image && (
                        <div className="w-16 h-16 bg-surface-variant rounded-lg flex-shrink-0 overflow-hidden">
                          <img 
                            src={item.image} 
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="title-medium text-on-surface mb-1">
                              {item.title}
                            </h4>
                            <div className="body-small text-on-surface-variant">
                              SKU: {item.sku}
                              {item.variant && ` • ${item.variant}`}
                            </div>
                          </div>
                          
                          <div className="text-right flex-shrink-0">
                            <div className="title-medium text-on-surface">
                              ${item.subtotal.toFixed(2)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 pt-2 border-t border-outline-variant">
                          <div className="body-small text-on-surface-variant">
                            Quantity: <span className="text-on-surface">{item.quantity}</span>
                          </div>
                          <div className="body-small text-on-surface-variant">
                            Unit Price: <span className="text-on-surface">${item.pricePerUnit.toFixed(2)}</span>
                          </div>
                        </div>

                        {/* Suggested Price Display */}
                        {itemSuggestedPrices[index] && (
                          <div className="mt-2 pt-2 border-t border-outline-variant">
                            <div className="flex items-center gap-2 p-2 bg-tertiary-container rounded-lg">
                              <DollarSign className="w-4 h-4 text-on-tertiary-container" />
                              <div className="flex-1">
                                <span className="body-small text-on-tertiary-container">
                                  Your suggested price: <span className="title-small">${itemSuggestedPrices[index].toFixed(2)}</span> per unit
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Size Breakdown if available */}
                        {item.sizeBreakdown && item.sizeBreakdown.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-outline-variant">
                            <div className="label-small text-on-surface-variant mb-1">Size Breakdown</div>
                            <div className="flex flex-wrap gap-2">
                              {item.sizeBreakdown.map((sizeItem, sizeIndex) => (
                                <Badge 
                                  key={sizeIndex}
                                  className="bg-surface-container-high text-on-surface"
                                >
                                  {sizeItem.size}: {sizeItem.quantity}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Suggest Price Button */}
                        {canSuggestPrice && (
                          <div className="mt-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSuggestItemPrice(index, item.title, item.pricePerUnit)}
                              className="gap-2 border-outline"
                            >
                              <DollarSign className="w-4 h-4" />
                              Suggest price for this item
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between items-center">
                <div className="title-medium text-on-surface">Total</div>
                <div className="headline-small text-on-surface">${quotation.subtotal.toFixed(2)}</div>
              </div>
            </div>
          </Card>

          {/* Messages Section */}
          <Card className="bg-surface-container border border-outline-variant">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-on-surface" />
                <h3 className="title-large text-on-surface">Messages</h3>
              </div>

              {/* Messages */}
              <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-on-surface-variant mx-auto mb-2" />
                    <p className="body-medium text-on-surface-variant">
                      No messages yet. Start the conversation below.
                    </p>
                  </div>
                ) : (
                  messages.map(message => (
                    <div
                      key={message.id}
                      className={`flex ${message.authorRole === 'partner' ? 'justify-end' : 'justify-start'}`}
                    >
                      <Card className={`max-w-[70%] p-3 ${
                        message.authorRole === 'partner'
                          ? 'bg-primary-container border-primary-container'
                          : 'bg-surface-container border-outline-variant'
                      }`}>
                        <div className="body-small text-on-surface-variant mb-1">
                          {message.author} • {new Date(message.createdAt).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        <div className="body-medium text-on-surface whitespace-pre-wrap">
                          {message.body}
                        </div>
                      </Card>
                    </div>
                  ))
                )}
              </div>

              {/* Message Input */}
              <div className="flex gap-2">
                <Textarea
                  placeholder="Type your message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="flex-1 min-h-[60px] bg-surface border-outline resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim()}
                  className="self-end"
                >
                  Send
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent className="bg-surface border border-outline-variant">
          <DialogHeader>
            <DialogTitle className="title-large text-on-surface">
              Approve Quotation
            </DialogTitle>
            <DialogDescription className="body-medium text-on-surface-variant">
              Set the final price for this quotation. This will update the quote status to "Approved".
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <label className="label-medium text-on-surface mb-2 block">
              Final Price ($)
            </label>
            <Input
              type="number"
              value={finalPrice}
              onChange={(e) => setFinalPrice(e.target.value)}
              className="bg-surface-container border-outline"
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowApproveDialog(false)}
              className="w-full sm:w-auto border-outline"
            >
              Cancel
            </Button>
            <Button
              onClick={handleApprove}
              disabled={!finalPrice || parseFloat(finalPrice) <= 0}
              className="w-full sm:w-auto"
            >
              Approve quote
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="bg-surface border border-outline-variant">
          <DialogHeader>
            <DialogTitle className="title-large text-on-surface">
              Reject Quotation
            </DialogTitle>
            <DialogDescription className="body-medium text-on-surface-variant">
              Please provide a reason for rejecting this quotation request.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <label className="label-medium text-on-surface mb-2 block">
              Rejection Reason
            </label>
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="bg-surface-container border-outline min-h-[100px]"
              placeholder="E.g., Unable to meet the requested quantities, pricing doesn't work for our margins..."
            />
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowRejectDialog(false)}
              className="w-full sm:w-auto border-outline"
            >
              Cancel
            </Button>
            <Button
              onClick={handleReject}
              disabled={!rejectReason.trim()}
              className="w-full sm:w-auto bg-error hover:bg-error/90 text-on-error"
            >
              Reject quote
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suggest Item Price Dialog */}
      <Dialog open={showSuggestPriceDialog} onOpenChange={setShowSuggestPriceDialog}>
        <DialogContent className="bg-surface border border-outline-variant">
          <DialogHeader>
            <DialogTitle className="title-large text-on-surface">Suggest price</DialogTitle>
            <DialogDescription className="body-medium text-on-surface-variant">
              Suggest a new price for this specific item.
            </DialogDescription>
          </DialogHeader>
          {selectedItemForPrice && (
            <div className="space-y-4">
              <div>
                <p className="body-medium text-on-surface mb-1">{selectedItemForPrice.productName}</p>
                <p className="body-small text-on-surface-variant">
                  Current price: ${selectedItemForPrice.currentPrice.toFixed(2)} per unit
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="suggested-price" className="body-medium text-on-surface">
                  Suggested price per unit ($)
                </Label>
                <Input
                  id="suggested-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={suggestedPrice}
                  onChange={(e) => setSuggestedPrice(e.target.value)}
                  placeholder="Enter suggested price"
                  className="bg-surface-container border-outline"
                />
              </div>
            </div>
          )}
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowSuggestPriceDialog(false)}
              className="w-full sm:w-auto border-outline"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitSuggestedPrice}
              disabled={!suggestedPrice || parseFloat(suggestedPrice) <= 0}
              className="w-full sm:w-auto"
            >
              Submit suggestion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
