import * as React from 'react';
import { Check, ChevronDown, X, Search } from 'lucide-react';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './ui/command';
import {
  FullScreenDialog,
  FullScreenDialogContent,
  FullScreenDialogTitle,
} from './ui/full-screen-dialog';
import { VisuallyHidden } from './ui/visually-hidden';
import { useMediaQuery } from './ui/use-mobile';
import { filterBrandsByQuery } from '../utils/spreadsheetUtils';
import { cn } from './ui/utils';

const ALL_VALUE = 'all';

interface BrandPickerProps {
  value: string;
  onChange: (brand: string) => void;
  brands: string[];
  placeholder?: string;
  allOptionLabel?: string;
  triggerClassName?: string;
  triggerId?: string;
}

export default function BrandPicker({
  value,
  onChange,
  brands,
  placeholder = 'Select brand',
  allOptionLabel,
  triggerClassName,
  triggerId,
}: BrandPickerProps) {
  // Full-screen on phones only; tablet+ uses the popover variant.
  const isMobile = useMediaQuery('(max-width: 639px)');
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');

  React.useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  const filtered = React.useMemo(
    () => (query.trim() ? filterBrandsByQuery(brands, query, 200) : brands),
    [brands, query],
  );

  const triggerLabel =
    allOptionLabel && (value === ALL_VALUE || !value)
      ? allOptionLabel
      : value || placeholder;

  const handleSelect = (brand: string) => {
    onChange(brand);
    setOpen(false);
  };

  if (isMobile) {
    return (
      <>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          id={triggerId}
          onClick={() => setOpen(true)}
          className={cn('justify-between', triggerClassName)}
        >
          <span className="truncate">{triggerLabel}</span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
        <FullScreenDialog open={open} onOpenChange={setOpen}>
          <FullScreenDialogContent className="flex flex-col p-0 bg-surface" fullWidth>
            <VisuallyHidden>
              <FullScreenDialogTitle>Select brand</FullScreenDialogTitle>
            </VisuallyHidden>
            <div className="flex items-center gap-1 border-b border-outline-variant px-2 flex-shrink-0">
              <Search className="ml-2 h-5 w-5 shrink-0 text-on-surface-variant" />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search brands..."
                className="flex-1 bg-transparent outline-none px-2 py-3 min-h-[56px] body-large text-on-surface placeholder:text-on-surface-variant"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="flex-shrink-0 h-12 w-12"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {allOptionLabel && (
                <button
                  type="button"
                  onClick={() => handleSelect(ALL_VALUE)}
                  className={cn(
                    'w-full flex items-center justify-between px-4 min-h-[56px] py-3 text-left body-large',
                    value === ALL_VALUE || !value
                      ? 'bg-accent text-on-accent'
                      : 'text-on-surface',
                  )}
                >
                  <span>{allOptionLabel}</span>
                  {(value === ALL_VALUE || !value) && (
                    <Check className="w-5 h-5 opacity-90" />
                  )}
                </button>
              )}
              {filtered.length === 0 ? (
                <div className="px-4 py-8 text-center body-medium text-on-surface-variant">
                  No brand found.
                </div>
              ) : (
                filtered.map((brand) => (
                  <button
                    key={brand}
                    type="button"
                    onClick={() => handleSelect(brand)}
                    className={cn(
                      'w-full flex items-center justify-between px-4 min-h-[56px] py-3 text-left body-large',
                      value === brand
                        ? 'bg-accent text-on-accent'
                        : 'text-on-surface',
                    )}
                  >
                    <span>{brand}</span>
                    {value === brand && <Check className="w-5 h-5 opacity-90" />}
                  </button>
                ))
              )}
            </div>
          </FullScreenDialogContent>
        </FullScreenDialog>
      </>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          id={triggerId}
          className={cn('justify-between', triggerClassName)}
        >
          <span className="truncate">{triggerLabel}</span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <style>{`[data-brand-picker-content]{animation:none!important;transition:none!important}`}</style>
      <PopoverContent
        data-brand-picker-content=""
        className="p-0 w-[calc(100vw-2rem)] sm:w-72"
        align="start"
      >
        <Command>
          <CommandInput placeholder="Search brands..." />
          <CommandList>
            <CommandEmpty>No brand found.</CommandEmpty>
            <CommandGroup heading="Brands">
              {allOptionLabel && (
                <CommandItem
                  value={ALL_VALUE}
                  onSelect={() => handleSelect(ALL_VALUE)}
                  className={cn(
                    'flex items-center justify-between min-h-[44px] md:min-h-0 py-3 md:py-1.5 touch-manipulation',
                    (value === ALL_VALUE || !value) && 'bg-accent text-on-accent',
                  )}
                >
                  <span>{allOptionLabel}</span>
                  {(value === ALL_VALUE || !value) && (
                    <Check className="w-4 h-4 opacity-90" />
                  )}
                </CommandItem>
              )}
              {brands.map((brand) => (
                <CommandItem
                  key={brand}
                  value={brand.toLowerCase()}
                  onSelect={() => handleSelect(brand)}
                  className={cn(
                    'flex items-center justify-between min-h-[44px] md:min-h-0 py-3 md:py-1.5 touch-manipulation',
                    value === brand && 'bg-accent text-on-accent',
                  )}
                >
                  <span>{brand}</span>
                  {value === brand && <Check className="w-4 h-4 opacity-90" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
