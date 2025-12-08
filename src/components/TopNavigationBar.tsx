import React from 'react';
import { Settings } from 'lucide-react';
import { NavigationDestination } from './ResponsiveNavigation';

interface TopNavigationBarProps {
  activeDestination: string;
  destinations: NavigationDestination[];
  userInitials: string;
  onSettingsClick: () => void;
}

// Mark Resell Logo SVG Component
function MarkResellLogo() {
  return (
    <svg width="40" height="40" viewBox="0 0 1000 1000" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="1000" height="1000" fill="white"/>
      <path d="M676.104 178C746.363 178 788.888 202.616 813.243 237.506C837.031 271.583 842 313.406 842 345.357C842 410.909 810.634 496.237 747.685 580.401C715.738 623.115 665.681 667.911 618.93 704.373C572.195 740.822 527.581 769.855 505.895 780.728L500.517 783.424L495.138 780.728C473.452 769.855 428.838 740.822 382.104 704.373C335.353 667.911 285.296 623.115 253.349 580.401C190.467 496.328 158 410.99 158 345.357L158.004 343.849C158.169 312.025 163.628 270.98 187.312 237.451C211.923 202.61 254.674 178 324.93 178C387.537 178 432.032 218.083 461.448 262.329C479.107 288.891 491.921 317.763 500.516 342.456C509.111 317.763 521.925 288.891 539.584 262.329C569 218.083 613.496 178 676.104 178Z" stroke="#222222" strokeWidth="24"/>
      <circle cx="170.909" cy="310" r="92" transform="rotate(-60 170.909 310)" fill="#222222" stroke="white" strokeWidth="24"/>
      <path d="M104.82 412.246L219.015 382.346L256.355 477.32L143.592 518.362L104.82 412.246Z" fill="white"/>
      <path d="M171.244 418.907L154.868 514.258L245.079 481.424L171.244 418.907Z" fill="#222222"/>
      <path d="M829.066 564.868L725.273 502.514L770.019 413.902L878.776 464.617L829.066 564.868Z" fill="white"/>
      <path d="M788.896 515.389L867.899 459.545L780.893 418.974L788.896 515.389Z" fill="#222222"/>
    </svg>
  );
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
    <div className="hidden md:flex fixed top-0 left-0 right-0 z-[100] h-16 bg-surface">
      <div className="w-full flex items-center justify-between px-6">
        {/* Left side: Logo and Navigation Tabs */}
        <div className="flex items-center gap-6">
          {/* Logo */}
          <div className="flex items-center justify-center">
            <MarkResellLogo />
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
                    className={`px-4 h-full flex items-center transition-colors relative ${
                      isActive
                        ? 'text-on-surface'
                        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                    }`}
                    onClick={destination.onClick}
                  >
                    <span className="label-large whitespace-nowrap">
                      {destination.desktopLabel || destination.label}
                    </span>
                    
                    {/* Active Indicator - positioned at bottom of navigation bar */}
                    {isActive && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
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
        <div className="flex items-center gap-4">
          {/* User Initials */}
          <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center">
            <span className="label-large text-on-secondary-container font-medium">
              {userInitials}
            </span>
          </div>
          
          {/* Settings Icon */}
          <button
            onClick={onSettingsClick}
            className="p-2 rounded-full hover:bg-surface-container-high transition-colors"
            aria-label="Settings"
          >
            <Settings className="h-6 w-6 text-on-surface-variant" />
          </button>
        </div>
      </div>
    </div>
  );
}
