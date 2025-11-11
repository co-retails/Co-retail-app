import React from 'react';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export default function ResponsiveLayout({ children, className = '' }: ResponsiveLayoutProps) {
  return (
    <div className={`min-h-screen bg-surface ${className}`}>
      {/* Content area with responsive padding */}
      <div className="pb-20 md:pb-0 md:pl-20 min-h-screen">
        {children}
      </div>
    </div>
  );
}