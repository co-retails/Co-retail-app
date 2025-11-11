import React, { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Textarea } from './ui/textarea';
import { 
  ArrowLeft, 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Eye,
  MessageSquare,
  Calendar,
  Package,
  Send,
  Edit2
} from 'lucide-react';

export interface QuotationRequest {
  id: string;
  partnerId: string;
  partnerName: string;
  status: 'pending' | 'negotiation' | 'accepted' | 'declined';
  createdDate: string;
  responseDate?: string;
  items: {
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
    specifications?: string;
    imageUrl?: string;
    sizeBreakdown?: Array<{
      size: string;
      quantity: number;
    }>;
  }[];
  message?: string;
  quotedPrice?: number;
  leadTime?: number;
  validUntil?: string;
  messages?: Array<{
    id: string;
    author: string;
    authorRole: 'buyer' | 'partner';
    body: string;
    createdAt: string;
  }>;
}

interface BuyerQuotationsScreenProps {
  quotations: QuotationRequest[];
  onBack: () => void;
  onViewQuotation: (quotationId: string) => void;
  onAcceptQuotation: (quotationId: string) => void;
  onDeclineQuotation: (quotationId: string) => void;
  onSendMessage?: (quotationId: string, message: string) => void;
  onUpdateQuotation?: (quotationId: string, updates: Partial<QuotationRequest>) => void;
}

export default function BuyerQuotationsScreen({
  quotations,
  onBack,
  onViewQuotation,
  onAcceptQuotation,
  onDeclineQuotation,
  onSendMessage,
  onUpdateQuotation
}: BuyerQuotationsScreenProps) {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedQuotationId, setSelectedQuotationId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');

  const filteredQuotations = quotations.filter(quotation => {
    if (activeTab === 'all') return true;
    return quotation.status === activeTab;
  });

  const selectedQuotation = selectedQuotationId
    ? quotations.find(q => q.id === selectedQuotationId)
    : null;

  const quotationMessages = selectedQuotation?.messages || [];

  const handleSendMessage = () => {
    if (!selectedQuotationId || !messageText.trim() || !onSendMessage) return;
    onSendMessage(selectedQuotationId, messageText);
    setMessageText('');
  };

  const getStatusBadge = (status: QuotationRequest['status']) => {
    switch (status) {
      case 'pending':
        return (
          <Badge className="bg-secondary-container text-on-secondary-container">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case 'negotiation':
        return (
          <Badge className="bg-accent/10 text-accent">
            <MessageSquare className="w-3 h-3 mr-1" />
            Negotiation
          </Badge>
        );
      case 'accepted':
        return (
          <Badge className="bg-tertiary-container text-on-tertiary-container">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Accepted
          </Badge>
        );
      case 'declined':
        return (
          <Badge className="bg-error-container text-on-error-container">
            <XCircle className="w-3 h-3 mr-1" />
            Declined
          </Badge>
        );
    }
  };

  const getStatusIcon = (status: QuotationRequest['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-on-secondary-container" />;
      case 'negotiation':
        return <MessageSquare className="w-5 h-5 text-accent" />;
      case 'accepted':
        return <CheckCircle2 className="w-5 h-5 text-on-tertiary-container" />;
      case 'declined':
        return <XCircle className="w-5 h-5 text-on-error-container" />;
    }
  };

  const getStatusContainerColor = (status: QuotationRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-secondary-container';
      case 'negotiation':
        return 'bg-accent/10';
      case 'accepted':
        return 'bg-tertiary-container';
      case 'declined':
        return 'bg-error-container';
    }
  };

  const pendingCount = quotations.filter(q => q.status === 'pending').length;
  const negotiationCount = quotations.filter(q => q.status === 'negotiation').length;
  const acceptedCount = quotations.filter(q => q.status === 'accepted').length;
  const declinedCount = quotations.filter(q => q.status === 'declined').length;

  return (
    <div className="min-h-screen bg-surface flex pb-20 md:pb-0">
      {/* Left Panel - Quotations List */}
      <div className={`${selectedQuotationId ? 'hidden md:flex' : 'flex'} flex-col flex-1 border-r border-outline-variant max-w-full md:max-w-md lg:max-w-lg`}>
        {/* Top App Bar */}
        <div className="sticky top-0 bg-surface z-10 border-b border-outline-variant">
          <div className="flex items-center h-16 px-4 md:px-6">
            <div className="flex-1">
              <h1 className="title-large text-on-surface">Quotation requests</h1>
              <p className="body-small text-on-surface-variant">
                {quotations.length} total requests
              </p>
            </div>
          </div>

          {/* Custom Tabs */}
          <div className="border-b border-outline-variant">
            <div className="flex gap-1 overflow-x-auto">
              {[
                { value: 'all', label: `All (${quotations.length})` },
                { value: 'pending', label: `Pending (${pendingCount})` },
                { value: 'negotiation', label: `Negotiation (${negotiationCount})` },
                { value: 'accepted', label: `Accepted (${acceptedCount})` },
                { value: 'declined', label: `Declined (${declinedCount})` }
              ].map(tab => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`
                    px-4 py-3 whitespace-nowrap border-b-2 transition-colors title-small
                    ${activeTab === tab.value 
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-6 space-y-3">
          {filteredQuotations.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-16 h-16 text-on-surface-variant mx-auto mb-4 opacity-50" />
              <h2 className="title-medium text-on-surface mb-2">
                No {activeTab !== 'all' ? activeTab : ''} quotations
              </h2>
              <p className="body-medium text-on-surface-variant">
                {activeTab === 'pending' 
                  ? 'You have no pending quotation requests'
                  : activeTab === 'negotiation'
                  ? 'No quotations are currently in negotiation'
                  : 'Request quotations from Chinese partners for custom orders'}
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
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="title-small text-on-surface">{quotation.id}</h3>
                      {getStatusBadge(quotation.status)}
                    </div>
                    <p className="body-medium text-on-surface-variant">{quotation.partnerName}</p>
                  </div>
                  <div className={`w-10 h-10 ${getStatusContainerColor(quotation.status)} rounded-full flex items-center justify-center flex-shrink-0`}>
                    {getStatusIcon(quotation.status)}
                  </div>
                </div>

                {/* Items summary */}
                <div className="flex items-center gap-2 mb-3">
                  <Package className="w-4 h-4 text-on-surface-variant" />
                  <span className="body-small text-on-surface-variant">
                    {quotation.items.length} {quotation.items.length === 1 ? 'item' : 'items'}
                  </span>
                </div>

                {/* Date info */}
                <div className="flex items-center gap-4 mb-3 body-small text-on-surface-variant">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Created: {new Date(quotation.createdDate).toLocaleDateString()}
                  </div>
                  {quotation.responseDate && (
                    <div className="flex items-center gap-1">
                      Response: {new Date(quotation.responseDate).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {/* Quotation details for received status */}
                {quotation.status === 'received' && quotation.quotedPrice && (
                  <div className="p-3 bg-primary-container rounded-lg mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="body-medium text-on-primary-container">Quoted price</span>
                      <span className="title-medium text-on-primary-container">${quotation.quotedPrice.toLocaleString()}</span>
                    </div>
                    {quotation.leadTime && (
                      <div className="flex items-center justify-between mb-2">
                        <span className="body-small text-on-primary-container">Lead time</span>
                        <span className="body-small text-on-primary-container">{quotation.leadTime} days</span>
                      </div>
                    )}
                    {quotation.validUntil && (
                      <div className="flex items-center gap-1 body-small text-on-primary-container">
                        <Clock className="w-3 h-3" />
                        Valid until: {new Date(quotation.validUntil).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                )}

                {/* Message preview */}
                {quotation.message && (
                  <div className="p-3 bg-surface-container-high rounded-lg mb-3">
                    <div className="flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 text-on-surface-variant flex-shrink-0 mt-0.5" />
                      <p className="body-small text-on-surface-variant line-clamp-2">{quotation.message}</p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewQuotation(quotation.id);
                    }}
                    variant="outline"
                    size="sm"
                    className="flex-1 border-outline"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View details
                  </Button>
                  
                  {quotation.status === 'pending' && onUpdateQuotation && (
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewQuotation(quotation.id);
                      }}
                      variant="outline"
                      size="sm"
                      className="border-outline"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  )}
                  
                  {quotation.status === 'received' && (
                    <>
                      <Button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onAcceptQuotation(quotation.id);
                        }}
                        size="sm"
                        className="bg-tertiary text-on-tertiary hover:bg-tertiary/90"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Accept
                      </Button>
                      <Button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeclineQuotation(quotation.id);
                        }}
                        size="sm"
                        variant="outline"
                        className="border-error text-error hover:bg-error-container"
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right Panel - Messages */}
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
                <h2 className="title-medium text-on-surface">{selectedQuotation.id}</h2>
                <p className="body-small text-on-surface-variant">
                  {selectedQuotation.partnerName}
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-6 space-y-4">
            {quotationMessages.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-on-surface-variant mx-auto mb-4" />
                <p className="body-medium text-on-surface-variant">
                  No messages yet. {onSendMessage && 'Start the conversation below.'}
                </p>
              </div>
            ) : (
              quotationMessages.map(message => (
                <div
                  key={message.id}
                  className={`flex ${message.authorRole === 'buyer' ? 'justify-end' : 'justify-start'}`}
                >
                  <Card className={`max-w-[70%] p-3 ${
                    message.authorRole === 'buyer'
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

          {/* Message Input - Fixed at bottom */}
          {onSendMessage && (
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
          )}
        </div>
      )}

      {/* Empty state when no quotation is selected */}
      {!selectedQuotationId && (
        <div className="hidden md:flex flex-1 items-center justify-center bg-surface">
          <div className="text-center">
            <MessageSquare className="w-16 h-16 text-on-surface-variant mx-auto mb-4" />
            <p className="title-medium text-on-surface mb-2">Select a quotation</p>
            <p className="body-medium text-on-surface-variant">
              Choose a quotation request to view messages
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
