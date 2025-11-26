import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { 
  ShoppingBag, 
  Bookmark, 
  FileText, 
  Package,
  TrendingUp,
  Clock,
  ChevronRight,
  ShoppingCart,
  Sparkles,
  UserCircle,
  Settings,
  ChevronDown,
  ClipboardList,
  TruckIcon
} from 'lucide-react';
import svgPaths from "../imports/svg-8iuolkmxl8";
import RetailerCountrySelector, { Brand, Country, RetailerCountrySelection } from './RetailerCountrySelector';

export interface BuyerStats {
  activeOrders: number;
  pendingQuotations: number;
  wishlistItems: number;
  shipmentsInTransit: number;
}

interface BuyerDashboardProps {
  stats: BuyerStats;
  onBrowseProducts: () => void;
  onViewWishlist: () => void;
  onViewOrders: () => void;
  onViewQuotations: () => void;
  onViewShipments: () => void;
  onAdminClick?: () => void;
  brands: Brand[];
  countries: Country[];
  currentRetailerSelection: RetailerCountrySelection;
  onRetailerSelectionChange: (selection: RetailerCountrySelection) => void;
}

function StatusBarIPhone() {
  return (
    <div className="h-[44px] overflow-clip relative shrink-0 w-full md:hidden">
      <div className="absolute h-[11.336px] right-[14.67px] top-[17.33px] w-[66.661px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 67 12">
          <path d={svgPaths.p18c81cf0} fill="#212121" opacity="0.35" stroke="white" />
          <path d={svgPaths.p3d3cbf00} fill="#212121" opacity="0.4" />
          <path d={svgPaths.p3cceaf80} fill="#212121" />
          <path clipRule="evenodd" d={svgPaths.p1d7c8600} fill="#212121" fillRule="evenodd" />
          <path clipRule="evenodd" d={svgPaths.p3e2de00} fill="#212121" fillRule="evenodd" />
        </svg>
      </div>
      <div className="absolute h-[21px] left-[24px] rounded-[24px] top-[12px] w-[54px]">
        <div className="absolute font-normal h-[20px] leading-[0] left-[27px] text-[#212121] text-[15px] text-center top-px tracking-[-0.5px] translate-x-[-50%] w-[54px]">
          <p className="leading-[20px]">9:41</p>
        </div>
      </div>
    </div>
  );
}

export default function BuyerDashboard({
  stats,
  onBrowseProducts,
  onViewWishlist,
  onViewOrders,
  onViewQuotations,
  onViewShipments,
  onAdminClick,
  brands,
  countries,
  currentRetailerSelection,
  onRetailerSelectionChange
}: BuyerDashboardProps) {
  const [isRetailerSelectorOpen, setIsRetailerSelectorOpen] = useState(false);

  // Get current brand/country display name
  const getCurrentRetailerDisplay = () => {
    const currentBrand = brands.find(brand => brand.id === currentRetailerSelection.brandId);
    const currentCountry = countries.find(country => country.id === currentRetailerSelection.countryId);
    
    if (currentBrand && currentCountry) {
      return `${currentBrand.name} - ${currentCountry.name}`;
    }
    if (currentBrand) {
      return currentBrand.name;
    }
    if (currentCountry) {
      return currentCountry.name;
    }
    return 'All Retailers';
  };

  const handleRetailerSelectionConfirm = (selection: RetailerCountrySelection) => {
    onRetailerSelectionChange(selection);
  };

  return (
    <div className="min-h-screen bg-surface pb-20 md:pb-0">
      {/* Mobile Header - Full header with logo and selector */}
      <div className="w-full bg-surface border-b border-outline-variant md:hidden">
        <StatusBarIPhone />
        
        {/* Header Content */}
        <div className="px-4 md:px-6 py-3">
          {/* Top Row: Logo, Admin Icon */}
          <div className="flex items-center justify-between mb-4">
            {/* Spacer to balance layout */}
            <div className="w-10" />
            
            {/* Centered Logo */}
            <div className="flex flex-col items-center">
              <div className="h-[28px] w-[153px] mb-1">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 153 28">
                  <path d={svgPaths.p2523a00} fill="#1A1A1A" />
                </svg>
              </div>
              <div className="label-large text-on-surface tracking-wider uppercase">
                Buyer portal
              </div>
            </div>
            
            {/* Admin Settings Icon */}
            <button
              onClick={onAdminClick}
              className="p-2 rounded-full hover:bg-surface-container-high transition-colors"
              aria-label="Admin Settings"
            >
              <Settings className="h-6 w-6 text-on-surface-variant" />
            </button>
          </div>
          
          {/* Retailer/Country Selector Row */}
          <div className="flex justify-center">
            <button
              onClick={() => setIsRetailerSelectorOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-surface-container-high transition-colors"
            >
              <span className="title-medium text-on-surface">{getCurrentRetailerDisplay()}</span>
              <ChevronDown className="h-4 w-4 text-on-surface-variant" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Desktop Header - Logo and selector, positioned below top nav */}
      <div className="hidden md:flex flex-col items-center px-6 py-4 bg-surface" style={{ marginTop: '4rem' }}>
        {/* Logo */}
        <div className="flex flex-col items-center mb-3">
          <div className="h-[28px] w-[153px] mb-1">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 153 28">
              <path d={svgPaths.p2523a00} fill="#1A1A1A" />
            </svg>
          </div>
          <div className="label-large text-on-surface tracking-wider uppercase">
            Buyer portal
          </div>
        </div>
        
        {/* Retailer/Country Selector */}
        <button
          onClick={() => setIsRetailerSelectorOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-surface-container-high transition-colors"
        >
          <span className="title-medium text-on-surface">{getCurrentRetailerDisplay()}</span>
          <ChevronDown className="h-4 w-4 text-on-surface-variant" />
        </button>
      </div>

      {/* Main Content - M3 Grid: 16px mobile, 24px tablet+ */}
      <div className="w-full px-4 md:px-6 py-6 space-y-6">
        {/* Primary Action */}
        <Card className="p-6 bg-primary text-on-primary border-0 relative overflow-hidden">
          <Sparkles className="absolute top-4 right-4 w-16 h-16 opacity-20" />
          <div className="relative z-10">
            <h2 className="title-large mb-2">Explore partner showrooms</h2>
            <p className="body-medium mb-4 opacity-90">
              Discover products from verified partners worldwide
            </p>
            <Button 
              onClick={onBrowseProducts}
              className="bg-on-primary text-primary hover:bg-on-primary/90"
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Browse products
            </Button>
          </div>
        </Card>

        {/* Quick Actions */}
        <div>
          <h2 className="title-medium text-on-surface mb-4">Quick actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              onClick={onViewWishlist}
              className="flex items-center justify-between p-4 bg-surface-container border border-outline-variant rounded-lg hover:bg-surface-container-high transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-tertiary-container rounded-full flex items-center justify-center">
                  <Bookmark className="w-5 h-5 text-on-tertiary-container" />
                </div>
                <div>
                  <p className="title-small text-on-surface">Wishlist</p>
                  <p className="body-small text-on-surface-variant">
                    {stats.wishlistItems} {stats.wishlistItems === 1 ? 'product' : 'products'}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-on-surface-variant" />
            </button>

            <button
              onClick={onViewQuotations}
              className="flex items-center justify-between p-4 bg-surface-container border border-outline-variant rounded-lg hover:bg-surface-container-high transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-tertiary-container rounded-full flex items-center justify-center">
                  <FileText className="w-5 h-5 text-on-tertiary-container" />
                </div>
                <div>
                  <p className="title-small text-on-surface">Quotation requests</p>
                  <p className="body-small text-on-surface-variant">
                    {stats.pendingQuotations} pending
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-on-surface-variant" />
            </button>
          </div>
        </div>

        {/* Recent Activity placeholder */}
        <div>
          <h2 className="title-medium text-on-surface mb-4">Recent activity</h2>
          <Card className="p-6 bg-surface-container border-outline-variant text-center">
            <Clock className="w-12 h-12 text-on-surface-variant mx-auto mb-3 opacity-50" />
            <p className="body-medium text-on-surface-variant">
              Your recent activity will appear here
            </p>
          </Card>
        </div>
      </div>

      {/* Retailer Country Selector Modal */}
      <RetailerCountrySelector
        isOpen={isRetailerSelectorOpen}
        onClose={() => setIsRetailerSelectorOpen(false)}
        onConfirm={handleRetailerSelectionConfirm}
        brands={brands}
        countries={countries}
        currentSelection={currentRetailerSelection}
      />
    </div>
  );
}