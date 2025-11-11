import React, { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { 
  ArrowLeft,
  Search,
  Eye,
  FileText,
  MessageSquare
} from 'lucide-react';
import { ShowroomOrder, RFQStatus } from './ShowroomTypes';

interface ShowroomOrdersScreenProps {
  onBack: () => void;
  orders: ShowroomOrder[];
  onViewOrder: (orderId: string) => void;
  userRole: 'partner' | 'buyer';
  showBackButton?: boolean; // Optional prop to control back button visibility
}

type QuotationTab = 'pending' | 'negotiation' | 'accepted' | 'all';

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

export default function ShowroomOrdersScreen({
  onBack,
  orders,
  onViewOrder,
  userRole,
  showBackButton = true // Default to true if not provided
}: ShowroomOrdersScreenProps) {
  const [activeTab, setActiveTab] = useState<QuotationTab>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter to only show RFQ/quotation type orders
  const quotations = orders.filter(order => order.type === 'rfq');

  // Filter quotations by tab
  const filteredQuotations = quotations.filter(order => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        order.id.toLowerCase().includes(query) ||
        (userRole === 'partner' ? order.buyerName : order.partnerName).toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Tab filter - cast status to RFQStatus since we know these are rfq orders
    const rfqStatus = order.status as RFQStatus;
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return rfqStatus === 'pending';
    if (activeTab === 'negotiation') return rfqStatus === 'negotiation';
    if (activeTab === 'accepted') return rfqStatus === 'accepted';
    return true;
  });

  // Count quotations by status for tabs
  const counts = {
    pending: quotations.filter(o => o.status === 'pending').length,
    negotiation: quotations.filter(o => o.status === 'negotiation').length,
    accepted: quotations.filter(o => o.status === 'accepted').length,
    all: quotations.length
  };

  const tabs: Array<{ id: QuotationTab; label: string }> = [
    { id: 'all', label: `All (${counts.all})` },
    { id: 'pending', label: `Pending (${counts.pending})` },
    { id: 'negotiation', label: `Negotiation (${counts.negotiation})` },
    { id: 'accepted', label: `Accepted (${counts.accepted})` },
  ];

  return (
    <div className="min-h-screen bg-surface">
      {/* Top App Bar */}
      <div className="sticky top-0 bg-surface z-10 border-b border-outline-variant">
        <div className="flex items-center h-16 px-4 md:px-6">
          {userRole !== 'partner' && showBackButton && (
            <button 
              className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest transition-colors mr-2"
              onClick={onBack}
              aria-label="Go back"
            >
              <ArrowLeft className="w-6 h-6 text-on-surface" />
            </button>
          )}
          
          <h1 className="title-large text-on-surface flex-1">
            Quotations
          </h1>
        </div>

        {/* Search Bar */}
        <div className="px-4 md:px-6 pb-3">
          <div className="relative max-w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
            <Input
              type="search"
              placeholder={`Search by quotation ID${userRole === 'partner' ? ' or buyer' : ''}...`}
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
      <div className="w-full px-4 md:px-6 py-4 md:py-6 space-y-3">
        {filteredQuotations.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-12 h-12 text-on-surface-variant mx-auto mb-4" />
            <h3 className="title-medium text-on-surface mb-2">No quotations found</h3>
            <p className="body-medium text-on-surface-variant">
              {searchQuery 
                ? 'Try adjusting your search query'
                : activeTab === 'all'
                ? 'Quotations will appear here when buyers request quotes'
                : 'No quotations with this status'
              }
            </p>
          </div>
        ) : (
          filteredQuotations.map(order => {
            const rfqStatus = order.status as RFQStatus;
            
            return (
              <button
                key={order.id}
                onClick={() => onViewOrder(order.id)}
                className="w-full bg-surface-container border border-outline-variant rounded-lg p-4 hover:bg-surface-container-high transition-colors text-left"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className="bg-secondary-container text-on-secondary-container">
                        QUOTATION
                      </Badge>
                      <Badge className={statusColors[rfqStatus]}>
                        {statusLabels[rfqStatus]}
                      </Badge>
                    </div>
                    <div className="title-small text-on-surface mb-1">
                      RFQ #{order.id}
                    </div>
                    <div className="body-small text-on-surface-variant">
                      {userRole === 'partner' 
                        ? `Buyer: ${order.buyerName} (${order.buyerCompany})`
                        : `Partner: ${order.partnerName}`
                      }
                    </div>
                  </div>
                  
                  <Eye className="w-5 h-5 text-on-surface-variant flex-shrink-0 ml-4" />
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-outline-variant">
                  <div className="body-small text-on-surface-variant">
                    {order.items.length} {order.items.length === 1 ? 'item' : 'items'} • 
                    {' '}{order.items.reduce((sum, item) => sum + item.quantity, 0)} units
                  </div>
                  <div className="title-small text-on-surface">
                    ${order.subtotal.toFixed(2)}
                  </div>
                </div>

                <div className="body-small text-on-surface-variant mt-2">
                  {new Date(order.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>

                {/* Partner: Show respond action for requested quotations */}
                {userRole === 'partner' && rfqStatus === 'requested' && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-outline-variant">
                    <Button
                      size="sm"
                      className="flex-1 bg-primary text-on-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewOrder(order.id);
                      }}
                    >
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Respond to quote
                    </Button>
                  </div>
                )}

                {/* Show indicator for in negotiation */}
                {rfqStatus === 'negotiation' && (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-outline-variant">
                    <MessageSquare className="w-4 h-4 text-secondary" />
                    <span className="body-small text-secondary">
                      Negotiation in progress
                    </span>
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}