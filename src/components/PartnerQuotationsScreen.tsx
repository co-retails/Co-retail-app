import React, { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Label } from './ui/label';
import { 
  ArrowLeft,
  Search,
  MessageSquare,
  Send,
  Package,
  Eye,
  DollarSign
} from 'lucide-react';
import { ShowroomOrder, ShowroomMessage, RFQStatus } from './ShowroomTypes';

interface PartnerQuotationsScreenProps {
  onBack: () => void;
  quotations: ShowroomOrder[];
  messages: Record<string, ShowroomMessage[]>;
  onSendMessage: (orderId: string, message: string) => void;
  onViewQuotation: (quotationId: string) => void;
  onApproveQuote: (quotationId: string, finalPrice: number) => void;
  onRejectQuote: (quotationId: string, reason: string) => void;
  initialTab?: QuotationTab;
}

type QuotationTab = 'pending' | 'negotiation' | 'accepted' | 'declined' | 'all';

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

export default function PartnerQuotationsScreen({
  onBack,
  quotations,
  messages,
  onSendMessage,
  onViewQuotation,
  onApproveQuote,
  onRejectQuote,
  initialTab
}: PartnerQuotationsScreenProps) {
  const [activeTab, setActiveTab] = useState<QuotationTab>(initialTab || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuotationId, setSelectedQuotationId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [suggestPriceDialogOpen, setSuggestPriceDialogOpen] = useState(false);
  const [selectedProductForPrice, setSelectedProductForPrice] = useState<{
    quotationId: string;
    productId: string;
    productName: string;
    currentPrice: number;
  } | null>(null);
  const [suggestedPrice, setSuggestedPrice] = useState('');

  // Filter quotations by tab
  const filteredQuotations = quotations.filter(quotation => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        quotation.id.toLowerCase().includes(query) ||
        quotation.buyerName.toLowerCase().includes(query) ||
        quotation.buyerCompany.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Tab filter
    if (activeTab === 'all') return true;
    return quotation.status === activeTab;
  });

  // Count quotations by status for tabs
  const counts = {
    pending: quotations.filter(q => q.status === 'pending').length,
    negotiation: quotations.filter(q => q.status === 'negotiation').length,
    accepted: quotations.filter(q => q.status === 'accepted').length,
    declined: quotations.filter(q => q.status === 'declined').length,
    all: quotations.length
  };

  const tabs: Array<{ id: QuotationTab; label: string }> = [
    { id: 'all', label: `All (${counts.all})` },
    { id: 'pending', label: `Pending (${counts.pending})` },
    { id: 'negotiation', label: `Negotiation (${counts.negotiation})` },
    { id: 'accepted', label: `Accepted (${counts.accepted})` },
    { id: 'declined', label: `Declined (${counts.declined})` }
  ];

  const handleSendMessage = () => {
    if (!selectedQuotationId || !messageText.trim()) return;
    onSendMessage(selectedQuotationId, messageText);
    setMessageText('');
  };

  const handleSuggestPrice = (quotationId: string, productId: string, productName: string, currentPrice: number) => {
    setSelectedProductForPrice({ quotationId, productId, productName, currentPrice });
    setSuggestedPrice(currentPrice.toString());
    setSuggestPriceDialogOpen(true);
  };

  const handleSubmitSuggestedPrice = () => {
    if (!selectedProductForPrice) return;
    // Here you would call a prop function to handle the price suggestion
    // For now, we'll send it as a message
    const priceMessage = `Suggested price for ${selectedProductForPrice.productName}: $${suggestedPrice}`;
    onSendMessage(selectedProductForPrice.quotationId, priceMessage);
    setSuggestPriceDialogOpen(false);
    setSuggestedPrice('');
    setSelectedProductForPrice(null);
  };

  const selectedQuotation = selectedQuotationId 
    ? quotations.find(q => q.id === selectedQuotationId)
    : null;

  const quotationMessages = selectedQuotationId 
    ? messages[selectedQuotationId] || []
    : [];

  return (
    <div className="min-h-screen bg-surface flex pb-20 md:pb-0">
      {/* Left Panel - Quotations List */}
      <div className={`${selectedQuotationId ? 'hidden md:flex' : 'flex'} flex-col flex-1 border-r border-outline-variant max-w-full md:max-w-md lg:max-w-lg`}>
        {/* Top App Bar */}
        <div className="sticky top-0 bg-surface z-10 border-b border-outline-variant">
          <div className="flex items-center h-16 px-4 md:px-6">
            <h1 className="title-large text-on-surface flex-1">
              Quotation requests
            </h1>
          </div>

          {/* Search Bar */}
          <div className="px-4 md:px-6 pb-3">
            <div className="relative max-w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
              <Input
                type="search"
                placeholder="Search by RFQ ID or buyer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-surface-container border-outline"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="overflow-x-auto">
            <div className="flex border-b border-outline-variant">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    px-4 py-3 whitespace-nowrap border-b-2 transition-colors title-small
                    ${activeTab === tab.id 
                      ? 'border-primary text-on-surface' 
                      : 'border-transparent text-on-surface-variant hover:bg-surface-container-high'
                    }
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quotations List */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-6 space-y-3">
          {filteredQuotations.length === 0 ? (
            <div className="text-center py-16">
              <Package className="w-12 h-12 text-on-surface-variant mx-auto mb-4" />
              <h3 className="title-medium text-on-surface mb-2">No quotations found</h3>
              <p className="body-medium text-on-surface-variant">
                {searchQuery 
                  ? 'Try adjusting your search query'
                  : activeTab === 'all'
                  ? 'Quotation requests will appear here'
                  : 'No quotations with this status'
                }
              </p>
            </div>
          ) : (
            filteredQuotations.map(quotation => (
              <button
                key={quotation.id}
                onClick={() => {
                  // On mobile, open details directly; on desktop, show messages panel
                  if (window.innerWidth < 768) {
                    onViewQuotation(quotation.id);
                  } else {
                    setSelectedQuotationId(quotation.id);
                  }
                }}
                className={`w-full bg-surface-container border rounded-lg p-4 hover:bg-surface-container-high transition-colors text-left ${
                  selectedQuotationId === quotation.id 
                    ? 'border-primary bg-surface-container-high' 
                    : 'border-outline-variant'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className="bg-secondary-container text-on-secondary-container">
                        RFQ
                      </Badge>
                      <Badge className={statusColors[quotation.status as RFQStatus]}>
                        {statusLabels[quotation.status as RFQStatus]}
                      </Badge>
                    </div>
                    <div className="title-small text-on-surface mb-1">
                      RFQ #{quotation.id}
                    </div>
                    <div className="body-small text-on-surface-variant">
                      {quotation.buyerName} ({quotation.buyerCompany})
                    </div>
                  </div>
                  
                  {(messages[quotation.id]?.length || 0) > 0 && (
                    <MessageSquare className="w-5 h-5 text-primary flex-shrink-0 ml-4" />
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-outline-variant">
                  <div className="body-small text-on-surface-variant">
                    {quotation.items.length} {quotation.items.length === 1 ? 'item' : 'items'} • 
                    {' '}{quotation.items.reduce((sum, item) => sum + item.quantity, 0)} units
                  </div>
                  <div className="title-small text-on-surface">
                    ${quotation.subtotal.toFixed(2)}
                  </div>
                </div>

                <div className="body-small text-on-surface-variant mt-2">
                  {new Date(quotation.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>

                {/* View Details Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewQuotation(quotation.id);
                  }}
                  className="mt-3 w-full gap-2 border-outline"
                >
                  <Eye className="w-4 h-4" />
                  View details
                </Button>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right Panel - Messages & Details */}
      {selectedQuotation && (
        <div className={`${selectedQuotationId ? 'flex' : 'hidden md:flex'} flex-col flex-1 md:h-screen md:max-h-screen`}>
          {/* Header */}
          <div className="flex-shrink-0 bg-surface z-10 border-b border-outline-variant">
            <div className="flex items-center h-16 px-4 md:px-6">
              <button 
                className="md:hidden w-12 h-12 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors mr-2"
                onClick={() => setSelectedQuotationId(null)}
                aria-label="Back to list"
              >
                <ArrowLeft className="w-6 h-6 text-on-surface" />
              </button>
              
              <div className="flex-1">
                <h2 className="title-medium text-on-surface">RFQ #{selectedQuotation.id}</h2>
                <p className="body-small text-on-surface-variant">
                  {selectedQuotation.buyerName} • {selectedQuotation.buyerCompany}
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewQuotation(selectedQuotation.id)}
                className="gap-2 border-outline"
              >
                <Eye className="w-4 h-4" />
                View details
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-6 space-y-4">
            {quotationMessages.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-on-surface-variant mx-auto mb-4" />
                <p className="body-medium text-on-surface-variant">
                  No messages yet. Start the conversation below.
                </p>
              </div>
            ) : (
              quotationMessages.map(message => (
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

            {/* Product pricing suggestions for requested/negotiation status */}
            {selectedQuotation && (selectedQuotation.status === 'requested' || selectedQuotation.status === 'negotiation') && (
              <div className="border-t border-outline-variant pt-4 mt-4">
                <h3 className="title-small text-on-surface mb-3">Suggest pricing</h3>
                <div className="space-y-2">
                  {selectedQuotation.items.map((item, index) => (
                    <Card key={index} className="p-3 bg-surface-container border-outline-variant">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="body-medium text-on-surface">{item.productName}</p>
                          <p className="body-small text-on-surface-variant">
                            Qty: {item.quantity} • Current: ${item.price?.toFixed(2) || '0.00'}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSuggestPrice(
                            selectedQuotation.id,
                            item.productId,
                            item.productName,
                            item.price || 0
                          )}
                          className="gap-2 border-outline flex-shrink-0"
                        >
                          <DollarSign className="w-4 h-4" />
                          Suggest price
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Message Input - Fixed at bottom */}
          <div className="sticky bottom-0 border-t border-outline-variant bg-surface p-4 md:px-6">
            <div className="flex gap-2">
              <Textarea
                placeholder="Type your message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="flex-1 min-h-[60px] bg-surface-container border-outline resize-none"
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
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Empty state when no quotation is selected */}
      {!selectedQuotationId && (
        <div className="hidden md:flex flex-1 items-center justify-center bg-surface">
          <div className="text-center">
            <MessageSquare className="w-16 h-16 text-on-surface-variant mx-auto mb-4" />
            <p className="title-medium text-on-surface mb-2">Select a quotation</p>
            <p className="body-medium text-on-surface-variant">
              Choose a quotation request to view details and messages
            </p>
          </div>
        </div>
      )}

      {/* Price Suggestion Dialog */}
      <Dialog open={suggestPriceDialogOpen} onOpenChange={setSuggestPriceDialogOpen}>
        <DialogContent className="bg-surface border-outline-variant">
          <DialogHeader>
            <DialogTitle className="title-large text-on-surface">Suggest price</DialogTitle>
            <DialogDescription className="body-medium text-on-surface-variant">
              Enter your suggested price for this product.
            </DialogDescription>
          </DialogHeader>
          {selectedProductForPrice && (
            <div className="space-y-4">
              <div>
                <p className="body-medium text-on-surface mb-1">{selectedProductForPrice.productName}</p>
                <p className="body-small text-on-surface-variant">
                  Current price: ${selectedProductForPrice.currentPrice.toFixed(2)}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="suggested-price" className="body-medium text-on-surface">
                  Suggested price
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
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSuggestPriceDialogOpen(false)}
              className="border-outline"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitSuggestedPrice}
              disabled={!suggestedPrice || parseFloat(suggestedPrice) <= 0}
            >
              Submit suggestion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
