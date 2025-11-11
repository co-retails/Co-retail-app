import React, { useState } from 'react';
import { Input } from './input';
import svgPaths from '../../imports/svg-wj1z1xxhnf';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({ value, onChange, onClear, placeholder = "Search", className = "" }: SearchBarProps) {
  const handleClear = () => {
    onChange('');
    onClear?.();
  };

  return (
    <div className={`relative ${className}`}>
      <div className="bg-white border-b border-outline-variant">
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="border-0 border-b border-outline-variant bg-transparent px-3 py-5 body-large text-on-surface placeholder:text-on-surface-variant focus-visible:ring-0 focus-visible:ring-offset-0 h-auto"
        />
        {value && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 size-[22px]"
            aria-label="Clear search"
          >
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 22">
              <g>
                <rect fill="var(--error)" height="22" rx="11" width="22" />
                <path d={svgPaths.pa388680} fill="white" />
              </g>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
