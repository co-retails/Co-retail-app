import React from 'react';
import { ArrowLeft } from 'lucide-react';
import svgPaths from "../imports/svg-z1lgxri6b0";

export interface Partner {
  id: string;
  name: string;
  logo?: string;
  connectionStatus: 'connected' | 'disconnected';
  itemsToReturn: number;
}

interface PartnerSelectionScreenProps {
  partners: Partner[];
  onSelectPartner: (partner: Partner) => void;
  onBack: () => void;
}

function Header({ onBack }: { onBack: () => void }) {
  return (
    <div className="sticky top-0 bg-surface z-10 border-b border-outline-variant">
      <div className="flex items-center h-16 px-4">
        {/* Back button */}
        <button 
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest transition-colors mr-2"
          onClick={onBack}
          aria-label="Go back"
        >
          <ArrowLeft className="w-6 h-6 text-on-surface" />
        </button>
        
        {/* Title */}
        <h1 className="title-large text-on-surface flex-1">
          Select Partner
        </h1>
        
        {/* No trailing icon - follows M3 guidelines */}
      </div>
    </div>
  );
}

function PartnerItem({ partner, onSelect, isLast = false }: { 
  partner: Partner; 
  onSelect: () => void;
  isLast?: boolean;
}) {
  return (
    <button 
      className={`bg-surface-container cursor-pointer hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest transition-colors w-full text-left ${
        !isLast ? 'border-b border-outline-variant' : ''
      }`}
      onClick={onSelect}
    >
      {/* M3 List Item - Three-line with leading icon and trailing chevron */}
      <div className="flex items-center gap-4 px-4 py-3">
        
        {/* Leading Visual - Partner Icon */}
        <div className="flex-shrink-0 w-12 h-12 bg-surface-container rounded-lg flex items-center justify-center">
          <div className="w-6 h-6">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
              <path d={svgPaths.p2f742f00} fill="var(--on-surface-variant)" />
            </svg>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Primary Text - Partner Name */}
          <div className="title-medium text-on-surface leading-tight mb-1">
            {partner.name}
          </div>
          
          {/* Secondary Text - Items to Return */}
          <div className="body-medium text-on-surface-variant leading-tight mb-1">
            {partner.itemsToReturn} items to return
          </div>
          
          {/* Supporting Text - Connection Status */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              partner.connectionStatus === 'connected' ? 'bg-tertiary' : 'bg-outline'
            }`} />
            <div className="label-medium text-on-surface-variant leading-tight capitalize">
              {partner.connectionStatus}
            </div>
          </div>
        </div>
        
        {/* Trailing Element - Chevron */}
        <div className="flex-shrink-0 w-6 h-6 text-on-surface-variant">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
            <path clipRule="evenodd" d="M8.59 16.59L13.17 12L8.59 7.41L10 6L16 12L10 18L8.59 16.59Z" fill="currentColor" fillRule="evenodd" />
          </svg>
        </div>
      </div>
    </button>
  );
}

export default function PartnerSelectionScreen({ partners, onSelectPartner, onBack }: PartnerSelectionScreenProps) {
  return (
    <div className="bg-surface relative size-full">
      <Header onBack={onBack} />
      
      {/* Content - M3 Grid: 16px mobile, 24px tablet+ */}
      <div className="px-4 md:px-6 pt-4 md:pt-6">
        
        {/* Instructions */}
        <div className="mb-6">
          <div className="body-medium text-on-surface-variant">
            Select the partner to create a return. You can scan items with any status to add them to the return.
          </div>
        </div>

        {/* Partner Count */}
        <div className="mb-3">
          <div className="body-medium text-on-surface-variant">
            {partners.length} partners available
          </div>
        </div>

        {/* Partner List */}
        <div className="flex flex-col gap-2">
          {partners.map((partner, index) => (
            <div key={partner.id} className="bg-surface border border-outline-variant rounded-lg overflow-hidden">
              <PartnerItem 
                partner={partner} 
                onSelect={() => onSelectPartner(partner)}
                isLast={index === partners.length - 1}
              />
            </div>
          ))}
        </div>

        {/* Empty state if no partners */}
        {partners.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="text-center space-y-2">
              <h5 className="title-medium text-on-surface">
                No partners available
              </h5>
              <p className="body-medium text-on-surface-variant">
                Connect with partners to manage returns
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}