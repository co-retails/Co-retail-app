import React from 'react';
import { Settings } from 'lucide-react';
import { NavigationDestination } from './ResponsiveNavigation';
import { MarkResellLogo } from './MarkResellLogo';

interface TopNavigationBarProps {
  activeDestination: string;
  destinations: NavigationDestination[];
  userInitials: string;
  onSettingsClick: () => void;
}

export default function TopNavigationBar({ 
  activeDestination, 
  destinations, 
  userInitials,
  onSettingsClick 
}: TopNavigationBarProps) {
  // Don't render if no destinations
  if (!destinations || destinations.length === 0) {
    return null;
  }

  return (
    <div 
      className="hidden md:flex fixed top-0 left-0 right-0 z-[100] h-16 backdrop-blur-sm"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(208, 208, 218, 0.3)',
      }}
    >
      <div className="w-full flex items-center justify-between px-8">
        {/* Left side: Logo and Navigation Tabs */}
        <div className="flex items-center gap-8">
          {/* Logo */}
          <div 
            className="flex items-center justify-center"
            style={{ transition: 'transform 200ms ease' }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <MarkResellLogo size={40} />
          </div>
          
          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 h-full">
            {destinations && destinations.length > 0 ? (
              destinations
                .filter(destination => !destination.hideOnDesktop)
                .map((destination) => {
                const isActive = activeDestination === destination.id;
                
                return (
                  <button
                    key={destination.id}
                    className={`relative px-4 py-2 flex items-center rounded-lg transition-all ${
                      isActive
                        ? 'text-on-surface'
                        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                    }`}
                    style={{
                      backgroundColor: isActive ? 'rgba(56, 117, 202, 0.12)' : undefined,
                      transition: 'all 200ms ease',
                    }}
                    onClick={destination.onClick}
                  >
                    <span 
                      className="label-large whitespace-nowrap"
                      style={{ 
                        fontWeight: isActive ? 600 : 500,
                        transition: 'font-weight 200ms ease',
                      }}
                    >
                      {destination.desktopLabel || destination.label}
                    </span>
                    
                    {/* Active Indicator - pill background + underline */}
                    {isActive && (
                      <div 
                        className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
                        style={{
                          backgroundColor: 'var(--primary)',
                          boxShadow: '0 1px 6px rgba(56, 117, 202, 0.4)'
                        }}
                      />
                    )}
                  </button>
                );
              })
            ) : (
              <span className="text-on-surface-variant label-medium">No navigation items</span>
            )}
          </nav>
        </div>
        
        {/* Right side: User Initials and Settings */}
        <div className="flex items-center gap-3">
          {/* User Initials */}
          <button 
            className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center hover:shadow-md"
            style={{
              border: '1px solid rgba(208, 208, 218, 0.3)',
              transition: 'all 200ms ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <span className="label-large text-on-secondary-container" style={{ fontWeight: 600 }}>
              {userInitials}
            </span>
          </button>
          
          {/* Settings Icon */}
          <button
            onClick={onSettingsClick}
            className="inline-flex items-center justify-center p-2 rounded-xl hover:bg-surface-container-high min-h-[48px] min-w-[48px] md:min-h-[40px] md:min-w-[40px] touch-manipulation"
            style={{ transition: 'all 200ms ease' }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            aria-label="Settings"
          >
            <Settings className="h-5 w-5 text-on-surface-variant" />
          </button>
        </div>
      </div>
    </div>
  );
}
