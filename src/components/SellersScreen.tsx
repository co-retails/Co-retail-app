import React, { useState } from 'react';
import svgPaths from "../imports/svg-z1lgxri6b0";
import navSvgPaths from "../imports/svg-uvbj8etlds";

export interface Seller {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  itemCount: number;
  lastSubmitted: string;
  type: 'B2B' | 'Private';
  avatar?: string;
}

interface SellersScreenProps {
  onBack: () => void;
  onNavigateToHome?: () => void;
  onNavigateToItems?: () => void;
  onNavigateToScan?: () => void;
  onNavigateToShipping?: () => void;
}



function SearchBar({ searchTerm, onSearchChange }: { 
  searchTerm: string; 
  onSearchChange: (value: string) => void 
}) {
  return (
    <div className="relative w-full mb-4 md:max-w-2xl">
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5">
          <svg className="w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
            <path clipRule="evenodd" d={svgPaths.p3938ac00} fill="var(--on-surface-variant)" fillRule="evenodd" />
          </svg>
        </div>
        <input
          type="text"
          id="sellers-search"
          name="sellers-search"
          placeholder="Search for name, email or phone nr"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full h-12 pl-10 pr-4 bg-surface-container rounded-lg border border-outline-variant focus:border-primary focus:outline-none text-on-surface body-large"
        />
      </div>
    </div>
  );
}

function FilterControls({ b2bOnly, onToggleB2B }: {
  b2bOnly: boolean;
  onToggleB2B: () => void;
}) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <button 
          className="flex items-center gap-3"
          onClick={onToggleB2B}
        >
          <div className="relative w-5 h-5">
            <svg className="w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
              <path 
                clipRule="evenodd" 
                d={svgPaths.p20ac8400} 
                fill={b2bOnly ? "var(--primary)" : "var(--outline-variant)"} 
                fillRule="evenodd" 
              />
            </svg>
            {b2bOnly && (
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-3 h-3" fill="white" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
          <span className="body-large text-on-surface">
            B2B sellers only
          </span>
        </button>
      </div>
    </div>
  );
}

function EmptyState({ onShowAllSellers }: { onShowAllSellers: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="space-y-6">
        <div className="space-y-2">
          <h4 className="headline-small text-on-surface">
            Find sellers
          </h4>
          <p className="body-medium text-on-surface-variant">
            Search for sellers or view all registered sellers
          </p>
        </div>
        
        <div className="space-y-3">
          {/* M3 Filled Button */}
          <button 
            className="bg-primary hover:bg-primary/90 focus:bg-primary/90 active:bg-primary/80 text-on-primary transition-colors px-6 py-3 rounded-lg min-h-[48px] w-full label-large"
            onClick={onShowAllSellers}
          >
            Show all sellers
          </button>
          
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-outline-variant"></div>
            <span className="body-small text-on-surface-variant">
              or
            </span>
            <div className="flex-1 h-px bg-outline-variant"></div>
          </div>
          
          <p className="body-medium text-on-surface-variant">
            Use the search above to find specific sellers
          </p>
        </div>
      </div>
    </div>
  );
}

function SellerListItem({ seller, onSelect }: { seller: Seller; onSelect: () => void }) {
  return (
    <button
      className="w-full bg-surface-container hover:bg-surface-container-high transition-colors border-b border-outline-variant"
      onClick={onSelect}
    >
      {/* M3 Compact Two-line List Item - Optimized for mobile */}
      <div className="flex items-center gap-3 px-3 py-2.5">
        
        {/* Leading Element - Smaller Avatar */}
        <div className="flex-shrink-0 w-10 h-10 bg-surface-container rounded-full flex items-center justify-center">
          <svg className="w-5 h-5" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
            <path d={svgPaths.p2f742f00} fill="var(--on-surface-variant)" />
          </svg>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 min-w-0 text-left">
          {/* Primary Text - Seller Name (smaller) */}
          <div className="text-sm font-medium text-on-surface leading-tight mb-0.5 tracking-[0.25px]">
            <span className="block truncate">{seller.name}</span>
          </div>
          
          {/* Secondary Text - Item count, type, and date (combined) */}
          <div className="flex items-center gap-1.5">
            <div 
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: seller.type === 'B2B' ? 'var(--tertiary)' : 'var(--outline)' }}
            />
            <span className="text-xs text-on-surface-variant leading-tight tracking-[0.4px] truncate">
              {seller.itemCount} items • {seller.type} • {new Date(seller.lastSubmitted).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              })}
            </span>
          </div>
        </div>
        
        {/* Trailing Element - Just the arrow */}
        <div className="flex-shrink-0">
          <div className="w-5 h-5 flex items-center justify-center">
            <svg className="w-4 h-4" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
              <path 
                clipRule="evenodd" 
                d="M8.59 16.59L13.17 12L8.59 7.41L10 6L16 12L10 18L8.59 16.59Z" 
                fill="var(--on-surface-variant)" 
                fillRule="evenodd" 
              />
            </svg>
          </div>
        </div>
      </div>
    </button>
  );
}

function SellersList({ sellers, onSelectSeller }: { 
  sellers: Seller[];
  onSelectSeller: (seller: Seller) => void;
}) {
  if (sellers.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-2">
          <h5 className="title-medium text-on-surface">
            No sellers found
          </h5>
          <p className="body-medium text-on-surface-variant">
            Try adjusting your search or filters
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      <div className="mb-3 px-4">
        <span className="body-medium text-on-surface-variant">
          {sellers.length} seller{sellers.length !== 1 ? 's' : ''} found
        </span>
      </div>
      
      <div className="flex flex-col gap-2">
        {sellers.map((seller, index) => (
          <div key={seller.id} className="bg-surface border border-outline-variant rounded-lg overflow-hidden">
            <SellerListItem 
              seller={seller} 
              onSelect={() => onSelectSeller(seller)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SellersScreen({ onBack, onNavigateToHome, onNavigateToItems, onNavigateToScan, onNavigateToShipping }: SellersScreenProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [b2bOnly, setB2bOnly] = useState(false);
  const [showAllSellers, setShowAllSellers] = useState(false);
  
  const [sellers] = useState<Seller[]>([
    {
      id: '1',
      name: 'Sellpy AB',
      email: 'contact@sellpy.se',
      itemCount: 245,
      lastSubmitted: '2024-12-09',
      type: 'B2B'
    },
    {
      id: '2',
      name: 'Kinda Kinks',
      email: 'info@kindakinks.com',
      itemCount: 89,
      lastSubmitted: '2024-12-08',
      type: 'B2B'
    },
    {
      id: '3',
      name: 'John Doe',
      email: 'john.doe@email.com',
      itemCount: 12,
      lastSubmitted: '2024-12-07',
      type: 'Private'
    },
    {
      id: '4',
      name: 'Fashion Hub AB',
      email: 'orders@fashionhub.se',
      itemCount: 156,
      lastSubmitted: '2024-12-06',
      type: 'B2B'
    },
    {
      id: '5',
      name: 'Anna Svensson',
      email: 'anna.svensson@gmail.com',
      itemCount: 8,
      lastSubmitted: '2024-12-05',
      type: 'Private'
    },
    {
      id: '6',
      name: 'Style Co',
      email: 'hello@styleco.com',
      itemCount: 67,
      lastSubmitted: '2024-12-04',
      type: 'B2B'
    }
  ]);

  const filteredSellers = sellers.filter(seller => {
    const matchesSearch = searchTerm === '' || 
      seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (seller.email && seller.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = !b2bOnly || seller.type === 'B2B';
    
    return matchesSearch && matchesType;
  });

  const shouldShowSellers = searchTerm.length > 0 || showAllSellers;

  const handleToggleB2B = () => {
    setB2bOnly(!b2bOnly);
  };

  const handleSelectSeller = (seller: Seller) => {
    // Seller selection logic would go here
  };

  const handleShowAllSellers = () => {
    setShowAllSellers(true);
  };

  return (
    <div className="bg-surface relative min-h-screen">
      {/* Spacer for top nav on desktop */}
      <div className="hidden md:block h-16"></div>
      {/* Header */}
      <div className="sticky top-0 md:top-16 bg-surface z-[90] border-b border-outline-variant md:shadow-sm">
        <div className="px-4 md:px-6 py-4">
          <h3 className="headline-small text-on-surface">Sellers</h3>
        </div>
      </div>

      {/* Content - M3 Grid: 16px mobile, 24px tablet+ */}
      <div className="px-4 md:px-6 pt-4 md:pt-6">
        
        {/* Search Bar */}
        <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

        {/* Filter Controls */}
        <FilterControls 
          b2bOnly={b2bOnly}
          onToggleB2B={handleToggleB2B}
        />

        {/* Content Area */}
        {!shouldShowSellers ? (
          <EmptyState onShowAllSellers={handleShowAllSellers} />
        ) : (
          <SellersList 
            sellers={filteredSellers}
            onSelectSeller={handleSelectSeller}
          />
        )}
      </div>
    </div>
  );
}