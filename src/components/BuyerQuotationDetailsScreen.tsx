import React, { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
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
  Building2,
  Calendar,
  Clock,
  FileText,
  CheckCircle2,
  XCircle,
  MessageSquare,
  AlertCircle,
  Edit2,
  DollarSign,
  Save,
  X
} from 'lucide-react';
import { QuotationRequest } from './BuyerQuotationsScreen';

interface BuyerQuotationDetailsScreenProps {
  quotation: QuotationRequest;
  onBack: () => void;
  onAcceptQuotation: () => void;
  onDeclineQuotation: (reason: string) => void;
  onSendMessage?: (message: string) => void;
  onUpdateQuotation?: (updates: Partial<QuotationRequest>) => void;
}

const statusLabels: Record<QuotationRequest['status'], string> = {
  pending: 'Pending',
  received: 'Received',
  accepted: 'Accepted',
  declined: 'Declined',
};

const statusColors: Record<QuotationRequest['status'], string> = {
  pending: 'bg-secondary-container text-on-secondary-container',
  received: 'bg-primary-container text-on-primary-container',
  accepted: 'bg-tertiary-container text-on-tertiary-container',
  declined: 'bg-error-container text-on-error-container',
};

export default function BuyerQuotationDetailsScreen({
  quotation,
  onBack,
  onAcceptQuotation,
  onDeclineQuotation,
  onSendMessage,
  onUpdateQuotation
}: BuyerQuotationDetailsScreenProps) {
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [showDeclineDialog, setShowDeclineDialog] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [messageText, setMessageText] = useState('');
  
  // Inline editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState<QuotationRequest | null>(null);

  const handleAccept = () => {
    onAcceptQuotation();
    setShowAcceptDialog(false);
  };

  const handleDecline = () => {
    if (declineReason.trim()) {
      onDeclineQuotation(declineReason);
      setShowDeclineDialog(false);
    }
  };

  const handleSendMessage = () => {
    if (onSendMessage && messageText.trim()) {
      onSendMessage(messageText);
      setMessageText('');
    }
  };

  const handleStartEdit = () => {
    setEditingQuotation({ ...quotation });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditingQuotation(null);
    setIsEditing(false);
  };

  const handleSaveEdit = () => {
    if (!editingQuotation || !onUpdateQuotation) return;
    onUpdateQuotation(editingQuotation);
    setIsEditing(false);
    setEditingQuotation(null);
  };

  // Use editing quotation if in edit mode, otherwise use original
  const displayQuotation = isEditing && editingQuotation ? editingQuotation : quotation;
  const totalQuantity = displayQuotation.items.reduce((sum, item) => sum + item.quantity, 0);
  const canRespond = quotation.status === 'received';
  const canEdit = quotation.status === 'pending' && onUpdateQuotation;
  const isValidUntilPassed = quotation.validUntil && new Date(quotation.validUntil) < new Date();

  // Extract suggested prices from messages
  const suggestedPrices: Record<string, number> = {};
  quotation.messages?.forEach(message => {
    const match = message.body.match(/Suggested price for (.+?): \$(\d+\.?\d*)/);
    if (match && message.authorRole === 'partner') {
      suggestedPrices[match[1]] = parseFloat(match[2]);
    }
  });

  return (
    <div className="min-h-screen bg-surface flex flex-col pb-20 md:pb-0">
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
          
          <div className="flex-1">
            <h1 className="title-large text-on-surface">
              {isEditing ? 'Edit Quotation' : 'Quotation details'}
            </h1>
          </div>

          {/* Edit Mode Actions */}
          {isEditing ? (
            <>
              <Button
                onClick={handleCancelEdit}
                variant="outline"
                className="mr-2 border-outline"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSaveEdit}
                className="bg-primary text-on-primary hover:bg-primary/90"
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </>
          ) : (
            <>
              {canEdit && (
                <Button
                  onClick={handleStartEdit}
                  variant="outline"
                  className="mr-2 border-outline"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}

              {canRespond && !isValidUntilPassed && (
                <>
                  <Button
                    onClick={() => setShowAcceptDialog(true)}
                    className="mr-2 bg-tertiary text-on-tertiary hover:bg-tertiary/90"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Accept
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => setShowDeclineDialog(true)}
                    className="border-error text-error hover:bg-error-container/10"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Decline
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 md:px-6 py-6 w-full space-y-6">
          {/* Status Flow Guide */}
          {quotation.status === 'pending' && !isEditing && (
            <Card className="bg-secondary-container border border-outline">
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-on-secondary-container flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-secondary-container" />
                  </div>
                  <div className="flex-1">
                    <h3 className="title-small text-on-secondary-container mb-2">Awaiting Partner Response</h3>
                    <p className="body-small text-on-secondary-container">
                      Your quotation request has been sent to {quotation.partnerName}. They will review and send you a quote with pricing and lead time. You can edit this request while it's pending.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Edit Mode Notice */}
          {isEditing && (
            <Card className="bg-primary-container border border-primary">
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Edit2 className="w-5 h-5 text-on-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="title-small text-on-primary-container mb-2">Editing Mode</h3>
                    <p className="body-small text-on-primary-container">
                      You can edit product names, SKUs, quantities, and specifications. Changes will be saved when you click the Save button above.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {quotation.status === 'received' && !isValidUntilPassed && (
            <Card className="bg-primary-container border border-primary">
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-on-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="title-small text-on-primary-container mb-2">Quote Received - Review Required</h3>
                    <p className="body-small text-on-primary-container mb-3">
                      The partner has provided a quote. Review the details below and decide whether to accept or decline.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <div className="flex items-center gap-2 body-small text-on-primary-container">
                        <div className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs">1</div>
                        <span>Review pricing and terms</span>
                      </div>
                      <div className="flex items-center gap-2 body-small text-on-primary-container">
                        <div className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs">2</div>
                        <span>Discuss via messages if needed</span>
                      </div>
                      <div className="flex items-center gap-2 body-small text-on-primary-container">
                        <div className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs">3</div>
                        <span>Click "Accept" or "Decline"</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {isValidUntilPassed && quotation.status === 'received' && (
            <Card className="bg-error-container border border-error">
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-error flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-5 h-5 text-on-error" />
                  </div>
                  <div className="flex-1">
                    <h3 className="title-small text-on-error-container mb-2">Quote Expired</h3>
                    <p className="body-small text-on-error-container">
                      This quote has expired. Please contact the partner to request a new quote.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {quotation.status === 'accepted' && (
            <Card className="bg-tertiary-container border border-tertiary">
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-tertiary flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-on-tertiary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="title-small text-on-tertiary-container mb-2">Quotation Accepted</h3>
                    <p className="body-small text-on-tertiary-container">
                      You have accepted this quotation. A purchase order will be created based on these terms.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {quotation.status === 'declined' && (
            <Card className="bg-error-container border border-error">
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-error flex items-center justify-center flex-shrink-0">
                    <XCircle className="w-5 h-5 text-on-error" />
                  </div>
                  <div className="flex-1">
                    <h3 className="title-small text-on-error-container mb-2">Quotation Declined</h3>
                    <p className="body-small text-on-error-container">
                      You have declined this quotation. This quotation is now closed.
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
                    <Badge className={statusColors[quotation.status]}>
                      {statusLabels[quotation.status]}
                    </Badge>
                    {isValidUntilPassed && quotation.status === 'received' && (
                      <Badge className="bg-error-container text-on-error-container">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Expired
                      </Badge>
                    )}
                  </div>
                  <h2 className="headline-small text-on-surface">
                    Quotation Request {quotation.id}
                  </h2>
                </div>
                {quotation.quotedPrice && (
                  <div className="text-right">
                    <div className="headline-medium text-on-surface">
                      ${quotation.quotedPrice.toLocaleString()}
                    </div>
                    <div className="body-small text-on-surface-variant">
                      Quoted Price
                    </div>
                  </div>
                )}
              </div>

              <Separator className="my-4" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-on-surface-variant mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="label-small text-on-surface-variant">Partner</div>
                    <div className="body-medium text-on-surface">{quotation.partnerName}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-on-surface-variant mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="label-small text-on-surface-variant">Request Date</div>
                    <div className="body-medium text-on-surface">
                      {new Date(quotation.createdDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>

                {quotation.responseDate && (
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-on-surface-variant mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="label-small text-on-surface-variant">Response Date</div>
                      <div className="body-medium text-on-surface">
                        {new Date(quotation.responseDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {quotation.leadTime && (
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-on-surface-variant mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="label-small text-on-surface-variant">Lead Time</div>
                      <div className="body-medium text-on-surface">
                        {quotation.leadTime} days
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Package className="w-5 h-5 text-on-surface-variant mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="label-small text-on-surface-variant">Total Items</div>
                    <div className="body-medium text-on-surface">
                      {displayQuotation.items.length} {displayQuotation.items.length === 1 ? 'item' : 'items'} • {totalQuantity} units
                    </div>
                  </div>
                </div>

                {quotation.validUntil && (
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-on-surface-variant mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="label-small text-on-surface-variant">Valid Until</div>
                      <div className={`body-medium ${isValidUntilPassed ? 'text-error' : 'text-on-surface'}`}>
                        {new Date(quotation.validUntil).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                        {isValidUntilPassed && ' (Expired)'}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {quotation.message && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <div className="label-small text-on-surface-variant mb-1">Partner Message</div>
                    <div className="body-medium text-on-surface whitespace-pre-wrap">
                      {quotation.message}
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
                {displayQuotation.items.map((item, index) => {
                  // Calculate total from size breakdown if it exists
                  const totalFromSizes = item.sizeBreakdown?.reduce((sum, s) => sum + s.quantity, 0) || item.quantity;
                  
                  return (
                    <div 
                      key={index}
                      className={`border rounded-lg p-4 ${isEditing ? 'bg-surface-container-high border-primary' : 'bg-surface border-outline-variant'}`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Product Image */}
                        {item.imageUrl && !isEditing && (
                          <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-surface-container-high">
                            <img 
                              src={item.imageUrl} 
                              alt={item.productName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80?text=No+Image';
                              }}
                            />
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          {/* Product Name */}
                          {isEditing ? (
                            <div className="space-y-2 mb-3">
                              <Label className="body-small text-on-surface">Product Name</Label>
                              <Input
                                value={item.productName}
                                onChange={(e) => {
                                  if (!editingQuotation) return;
                                  const newItems = [...editingQuotation.items];
                                  newItems[index] = { ...item, productName: e.target.value };
                                  setEditingQuotation({ ...editingQuotation, items: newItems });
                                }}
                                className="bg-surface border-outline"
                              />
                            </div>
                          ) : (
                            <h4 className="title-medium text-on-surface mb-1">
                              {item.productName}
                            </h4>
                          )}

                          {/* SKU */}
                          {isEditing ? (
                            <div className="space-y-2 mb-3">
                              <Label className="body-small text-on-surface">SKU</Label>
                              <Input
                                value={item.sku}
                                onChange={(e) => {
                                  if (!editingQuotation) return;
                                  const newItems = [...editingQuotation.items];
                                  newItems[index] = { ...item, sku: e.target.value };
                                  setEditingQuotation({ ...editingQuotation, items: newItems });
                                }}
                                className="bg-surface border-outline"
                              />
                            </div>
                          ) : (
                            <div className="body-small text-on-surface-variant mb-2">
                              SKU: {item.sku}
                            </div>
                          )}

                          {/* Specifications */}
                          {isEditing && (
                            <div className="space-y-2 mb-3">
                              <Label className="body-small text-on-surface">Specifications</Label>
                              <Textarea
                                value={item.specifications || ''}
                                onChange={(e) => {
                                  if (!editingQuotation) return;
                                  const newItems = [...editingQuotation.items];
                                  newItems[index] = { ...item, specifications: e.target.value };
                                  setEditingQuotation({ ...editingQuotation, items: newItems });
                                }}
                                className="bg-surface border-outline"
                                placeholder="Enter any specific requirements..."
                              />
                            </div>
                          )}
                          {!isEditing && item.specifications && (
                            <div className="body-small text-on-surface-variant mb-2">
                              Specs: {item.specifications}
                            </div>
                          )}

                          {/* Quantity Section */}
                          {item.sizeBreakdown && item.sizeBreakdown.length > 0 ? (
                            <div className="mt-2 pt-2 border-t border-outline-variant">
                              <div className="label-small text-on-surface-variant mb-2">
                                {isEditing ? 'Quantity by Size' : 'Size Breakdown'}
                              </div>
                              {isEditing ? (
                                <div className="grid grid-cols-2 gap-2 mb-2">
                                  {item.sizeBreakdown.map((sizeItem, sizeIndex) => (
                                    <div key={sizeIndex} className="flex items-center gap-2">
                                      <Label className="body-small text-on-surface-variant min-w-[40px]">
                                        {sizeItem.size}:
                                      </Label>
                                      <Input
                                        type="number"
                                        min="0"
                                        value={sizeItem.quantity}
                                        onChange={(e) => {
                                          if (!editingQuotation) return;
                                          const newItems = [...editingQuotation.items];
                                          const newSizeBreakdown = [...(item.sizeBreakdown || [])];
                                          newSizeBreakdown[sizeIndex] = {
                                            ...sizeItem,
                                            quantity: parseInt(e.target.value) || 0
                                          };
                                          // Update total quantity based on size breakdown
                                          const newTotal = newSizeBreakdown.reduce((sum, s) => sum + s.quantity, 0);
                                          newItems[index] = {
                                            ...item,
                                            sizeBreakdown: newSizeBreakdown,
                                            quantity: newTotal
                                          };
                                          setEditingQuotation({ ...editingQuotation, items: newItems });
                                        }}
                                        className="bg-surface border-outline flex-1"
                                      />
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="flex flex-wrap gap-2">
                                  {item.sizeBreakdown.map((sizeItem, sizeIndex) => (
                                    <Badge 
                                      key={sizeIndex}
                                      className="bg-surface-container-high text-on-surface border border-outline-variant"
                                    >
                                      {sizeItem.size}: {sizeItem.quantity}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                              <div className="p-2 bg-surface-container-high rounded-lg mt-2">
                                <span className="body-small text-on-surface-variant">
                                  Total: <span className="text-on-surface">{totalFromSizes} units</span>
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="mt-2 pt-2 border-t border-outline-variant">
                              {isEditing ? (
                                <div className="space-y-2">
                                  <Label className="body-small text-on-surface">Total Quantity</Label>
                                  <Input
                                    type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) => {
                                      if (!editingQuotation) return;
                                      const newItems = [...editingQuotation.items];
                                      newItems[index] = { ...item, quantity: parseInt(e.target.value) || 0 };
                                      setEditingQuotation({ ...editingQuotation, items: newItems });
                                    }}
                                    className="bg-surface border-outline"
                                  />
                                </div>
                              ) : (
                                <div className="body-small text-on-surface-variant">
                                  Total Quantity: <span className="text-on-surface">{item.quantity} units</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Suggested Price Display */}
                          {!isEditing && suggestedPrices[item.productName] && (
                            <div className="mt-2 pt-2 border-t border-outline-variant">
                              <div className="flex items-center gap-2 p-2 bg-primary-container rounded-lg">
                                <DollarSign className="w-4 h-4 text-on-primary-container" />
                                <div className="flex-1">
                                  <span className="body-small text-on-primary-container">
                                    Partner suggested price: <span className="title-small">${suggestedPrices[item.productName].toFixed(2)}</span> per unit
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {quotation.quotedPrice && (
                <>
                  <Separator className="my-4" />
                  <div className="flex justify-between items-center">
                    <div className="title-medium text-on-surface">Total Quoted Price</div>
                    <div className="headline-small text-on-surface">${quotation.quotedPrice.toLocaleString()}</div>
                  </div>
                  
                  {quotation.items.length > 0 && (
                    <div className="mt-2 flex justify-end">
                      <div className="body-small text-on-surface-variant">
                        ≈ ${(quotation.quotedPrice / totalQuantity).toFixed(2)} per unit
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </Card>

          {/* Messages Section - Always show for communication */}
          <Card className="bg-surface-container border border-outline-variant">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-on-surface" />
                <h3 className="title-large text-on-surface">Messages</h3>
              </div>

              {/* Messages */}
              <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                {!quotation.messages || quotation.messages.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-on-surface-variant mx-auto mb-2" />
                    <p className="body-medium text-on-surface-variant">
                      No messages yet. Start the conversation below.
                    </p>
                  </div>
                ) : (
                  quotation.messages.map(message => (
                    <div
                      key={message.id}
                      className={`flex ${message.authorRole === 'buyer' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] rounded-lg p-3 ${
                        message.authorRole === 'buyer'
                          ? 'bg-primary-container border border-primary/20'
                          : 'bg-surface border border-outline-variant'
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
                      </div>
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

          {/* Action Recommendations */}
          {quotation.status === 'received' && (
            <Card className={`border ${isValidUntilPassed ? 'bg-error-container/10 border-error' : 'bg-primary-container/10 border-primary'}`}>
              <div className="p-6">
                <div className="flex items-start gap-3">
                  {isValidUntilPassed ? (
                    <>
                      <AlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="title-medium text-error mb-1">Quotation Expired</h3>
                        <p className="body-medium text-on-surface-variant">
                          This quotation has expired. Please contact the partner to request a new quote.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <FileText className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="title-medium text-on-surface mb-1">Action Required</h3>
                        <p className="body-medium text-on-surface-variant">
                          Review the quotation details and decide whether to accept or decline this offer.
                          {quotation.validUntil && ` You have until ${new Date(quotation.validUntil).toLocaleDateString()} to respond.`}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Accept Dialog */}
      <Dialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
        <DialogContent className="bg-surface border border-outline-variant">
          <DialogHeader>
            <DialogTitle className="title-large text-on-surface">
              Accept Quotation
            </DialogTitle>
            <DialogDescription className="body-medium text-on-surface-variant">
              Are you sure you want to accept this quotation? This will create a purchase order based on the quoted terms.
            </DialogDescription>
          </DialogHeader>

          {quotation.quotedPrice && (
            <div className="py-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="body-medium text-on-surface-variant">Quoted Price:</span>
                <span className="title-medium text-on-surface">${quotation.quotedPrice.toLocaleString()}</span>
              </div>
              {quotation.leadTime && (
                <div className="flex justify-between items-center">
                  <span className="body-medium text-on-surface-variant">Lead Time:</span>
                  <span className="body-medium text-on-surface">{quotation.leadTime} days</span>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowAcceptDialog(false)}
              className="w-full sm:w-auto border-outline"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAccept}
              className="w-full sm:w-auto bg-tertiary text-on-tertiary hover:bg-tertiary/90"
            >
              Confirm Accept
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Decline Dialog */}
      <Dialog open={showDeclineDialog} onOpenChange={setShowDeclineDialog}>
        <DialogContent className="bg-surface border border-outline-variant">
          <DialogHeader>
            <DialogTitle className="title-large text-on-surface">
              Decline Quotation
            </DialogTitle>
            <DialogDescription className="body-medium text-on-surface-variant">
              Please provide a reason for declining this quotation. This will be sent to the partner.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Label className="body-medium text-on-surface mb-2">Reason for declining</Label>
            <Textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="Enter your reason..."
              className="mt-2 min-h-[100px] bg-surface border-outline"
            />
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeclineDialog(false);
                setDeclineReason('');
              }}
              className="w-full sm:w-auto border-outline"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDecline}
              disabled={!declineReason.trim()}
              className="w-full sm:w-auto bg-error text-on-error hover:bg-error/90"
            >
              Confirm Decline
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
