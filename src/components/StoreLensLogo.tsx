import React from 'react';
import { cn } from './ui/utils';
import svgPaths from '../imports/svg-8iuolkmxl8';

/** Store Lens wordmark SVG — same asset as Partner dashboard header. */
export function StoreLensLogo({
  className,
  heightClass = 'h-[28px]',
  widthClass = 'w-[153px]',
}: {
  className?: string;
  heightClass?: string;
  widthClass?: string;
}) {
  return (
    <div className={cn(heightClass, widthClass, className)} aria-hidden>
      <svg className="block size-full" fill="none" preserveAspectRatio="xMidYMid meet" viewBox="0 0 153 28">
        <path d={svgPaths.p2523a00} fill="#1A1A1A" />
      </svg>
    </div>
  );
}
