import React from 'react';
import { Bookmark, TruckIcon, Tag, Store, User, QrCode, ClipboardList, ShoppingBag, FileText, Sparkles } from 'lucide-react';
import svgPaths from "../imports/svg-8iuolkmxl8";
import TopNavigationBar from './TopNavigationBar';

interface NavigationDestination {
  id: string;
  label: string;
  icon: string;
  onClick: () => void;
  desktopLabel?: string; // Optional desktop-specific label
}

interface ResponsiveNavigationProps {
  activeDestination: string;
  destinations: NavigationDestination[];
  userInitials?: string;
  onSettingsClick?: () => void;
}

function NavigationBar({ activeDestination, destinations }: ResponsiveNavigationProps) {
  const renderIcon = (destination: NavigationDestination, isActive: boolean) => {
    const color = isActive ? "var(--primary)" : "var(--on-surface-variant)";
    
    if (destination.id === 'price-fork') {
      return <Sparkles className="w-6 h-6" style={{ color }} />;
    }
    // Use lucide-react icons for specific destinations
    if (destination.id === 'buyer-wishlist') {
      return (
        <Bookmark 
          className="w-6 h-6" 
          fill={isActive ? "var(--primary)" : "none"}
          stroke={color}
          strokeWidth={2}
        />
      );
    }
    
    if (destination.id === 'price-fork') {
      return <Sparkles className="w-6 h-6" style={{ color }} />;
    }
    if (destination.id === 'shipping') {
      return <TruckIcon className="w-6 h-6" style={{ color }} />;
    }
    
    if (destination.id === 'items') {
      return <Tag className="w-6 h-6" style={{ color }} />;
    }
    
    if (destination.id === 'scan') {
      return <QrCode className="w-6 h-6" style={{ color }} />;
    }
    
    if (destination.id === 'sellers') {
      return <User className="w-6 h-6" style={{ color }} />;
    }
    
    if (destination.id === 'home' || destination.id === 'buyer-dashboard' || destination.id === 'partner-dashboard') {
      return <Store className="w-6 h-6" style={{ color }} />;
    }
    
    if (destination.id === 'showroom-browse' || destination.id === 'showroom-dashboard') {
      return <ShoppingBag className="w-6 h-6" style={{ color }} />;
    }
    
    if (destination.id === 'buyer-orders') {
      return <ClipboardList className="w-6 h-6" style={{ color }} />;
    }
    
    if (destination.id === 'buyer-quotations' || destination.id === 'partner-quotations' || destination.id === 'documents') {
      return <FileText className="w-6 h-6" style={{ color }} />;
    }
    
    // Fallback to SVG path for other icons
    return (
      <svg className="w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <path 
          d={svgPaths[destination.icon as keyof typeof svgPaths]} 
          fill={color} 
        />
      </svg>
    );
  };

  return (
    <div className="fixed bg-surface bottom-0 left-0 right-0 z-10 border-t border-outline-variant md:hidden">
      <div className="max-w-[375px] mx-auto flex">
        {destinations.map((destination) => {
          const isActive = activeDestination === destination.id;
          
          return (
            <button
              key={destination.id}
              className={`flex-1 flex flex-col items-center justify-center py-3 px-2 transition-colors min-h-[56px] touch-manipulation ${
                !isActive ? 'hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest' : ''
              }`}
              onClick={destination.onClick}
            >
              {isActive ? (
                <div className="w-8 h-8 bg-secondary-container rounded-2xl flex items-center justify-center mb-1">
                  <div className="w-6 h-6">
                    {renderIcon(destination, isActive)}
                  </div>
                </div>
              ) : (
                <div className="w-6 h-6 mb-1">
                  {renderIcon(destination, isActive)}
                </div>
              )}
              <span className={`label-medium text-xs ${
                isActive ? 'text-on-surface' : 'text-on-surface-variant'
              }`}>
                {destination.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function NavigationRail({ activeDestination, destinations }: ResponsiveNavigationProps) {
  const renderIcon = (destination: NavigationDestination, isActive: boolean) => {
    const color = isActive ? "var(--on-secondary-container)" : "var(--on-surface-variant)";
    
    // Use lucide-react icons for specific destinations
    if (destination.id === 'buyer-wishlist') {
      return (
        <Bookmark 
          className="w-6 h-6" 
          fill={isActive ? "var(--on-secondary-container)" : "none"}
          stroke={color}
          strokeWidth={2}
        />
      );
    }
    
    if (destination.id === 'shipping') {
      return <TruckIcon className="w-6 h-6" style={{ color }} />;
    }
    
    if (destination.id === 'items') {
      return <Tag className="w-6 h-6" style={{ color }} />;
    }
    
    if (destination.id === 'scan') {
      return <QrCode className="w-6 h-6" style={{ color }} />;
    }
    
    if (destination.id === 'sellers') {
      return <User className="w-6 h-6" style={{ color }} />;
    }
    
    if (destination.id === 'home' || destination.id === 'buyer-dashboard' || destination.id === 'partner-dashboard') {
      return <Store className="w-6 h-6" style={{ color }} />;
    }
    
    if (destination.id === 'showroom-browse' || destination.id === 'showroom-dashboard') {
      return <ShoppingBag className="w-6 h-6" style={{ color }} />;
    }
    
    if (destination.id === 'buyer-orders') {
      return <ClipboardList className="w-6 h-6" style={{ color }} />;
    }
    
    if (destination.id === 'buyer-quotations' || destination.id === 'partner-quotations' || destination.id === 'documents') {
      return <FileText className="w-6 h-6" style={{ color }} />;
    }
    
    // Fallback to SVG path for other icons
    return (
      <svg className="w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <path 
          d={svgPaths[destination.icon as keyof typeof svgPaths]} 
          fill={color} 
        />
      </svg>
    );
  };

  return (
    <div className="hidden md:flex fixed left-0 top-0 bottom-0 z-10 w-20 bg-surface border-r border-outline-variant flex-col">
      {/* App Logo/Brand Area */}
      <div className="flex items-center justify-center py-6 border-b border-outline-variant">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
          <span className="label-large text-on-primary font-semibold">R</span>
        </div>
      </div>
      
      {/* Navigation Items */}
      <nav className="flex-1 flex flex-col gap-3 py-6 px-3">
        {destinations.map((destination) => {
          const isActive = activeDestination === destination.id;
          
          return (
            <button
              key={destination.id}
              className={`relative w-14 h-14 rounded-2xl flex items-center justify-center transition-colors group ${
                isActive 
                  ? 'bg-secondary-container' 
                  : 'hover:bg-surface-container-high focus:bg-surface-container-high active:bg-surface-container-highest'
              }`}
              onClick={destination.onClick}
              title={destination.label}
            >
              <div className="w-6 h-6">
                {renderIcon(destination, isActive)}
              </div>
              
              {/* Active Indicator */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
              )}
              
              {/* Tooltip for larger screens */}
              <div className="absolute left-full ml-2 px-2 py-1 bg-surface-container-highest rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 hidden lg:block">
                <span className="label-medium text-on-surface">{destination.label}</span>
              </div>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export default function ResponsiveNavigation({ 
  activeDestination, 
  destinations, 
  userInitials = 'JD',
  onSettingsClick 
}: ResponsiveNavigationProps) {
  return (
    <>
      <NavigationBar activeDestination={activeDestination} destinations={destinations} />
      <TopNavigationBar 
        activeDestination={activeDestination} 
        destinations={destinations}
        userInitials={userInitials}
        onSettingsClick={onSettingsClick || (() => {})}
      />
    </>
  );
}

export type { NavigationDestination };