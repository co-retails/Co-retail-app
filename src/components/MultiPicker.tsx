import * as React from 'react';
import { ChevronDown, X, Search } from 'lucide-react';
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
import { Checkbox } from './ui/checkbox';
import {
  FullScreenDialog,
  FullScreenDialogContent,
  FullScreenDialogTitle,
} from './ui/full-screen-dialog';
import { VisuallyHidden } from './ui/visually-hidden';
import { useMediaQuery } from './ui/use-mobile';
import { cn } from './ui/utils';

export interface MultiPickerOption {
  id: string;
  label: string;
  /** Optional secondary line shown beneath the label. */
  subtitle?: string;
  /** Override the haystack used for fuzzy search. Defaults to `label + subtitle`. */
  searchValue?: string;
}

interface MultiPickerProps {
  options: MultiPickerOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  triggerClassName?: string;
  triggerId?: string;
  /** A11y title for the mobile full-screen dialog. */
  title?: string;
  /**
   * When true, the picker always renders as a popover (no full-screen on
   * mobile). Use for short lists (e.g. retailer/brand with 2-3 options).
   */
  compact?: boolean;
  /** Hide the search input. Use for very short lists where search adds noise. */
  hideSearch?: boolean;
}

export default function MultiPicker({
  options,
  selectedIds,
  onChange,
  placeholder = 'Select…',
  searchPlaceholder = 'Search…',
  emptyText = 'No results.',
  triggerClassName,
  triggerId,
  title = 'Select',
  compact = false,
  hideSearch = false,
}: MultiPickerProps) {
  // Full-screen on phones only; tablet+ uses the popover variant.
  // When `compact` is set, skip the full-screen variant entirely.
  const isFullscreen = useMediaQuery('(max-width: 639px)') && !compact;
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');

  React.useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => {
      const haystack = (
        o.searchValue ?? `${o.label} ${o.subtitle ?? ''}`
      ).toLowerCase();
      return haystack.includes(q);
    });
  }, [options, query]);

  const toggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((x) => x !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const triggerLabel =
    selectedIds.length === 0 ? placeholder : `${selectedIds.length} selected`;

  if (isFullscreen) {
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
              <FullScreenDialogTitle>{title}</FullScreenDialogTitle>
            </VisuallyHidden>
            <div className="flex items-center gap-1 border-b border-outline-variant px-2 flex-shrink-0">
              <Search className="ml-2 h-5 w-5 shrink-0 text-on-surface-variant" />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
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
              {filtered.length === 0 ? (
                <div className="px-4 py-8 text-center body-medium text-on-surface-variant">
                  {emptyText}
                </div>
              ) : (
                filtered.map((opt) => {
                  const isSelected = selectedIds.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => toggle(opt.id)}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 min-h-[56px] py-3 text-left',
                        isSelected
                          ? 'bg-accent text-on-accent'
                          : 'text-on-surface',
                      )}
                    >
                      <Checkbox
                        checked={isSelected}
                        className="pointer-events-none flex-shrink-0"
                      />
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="body-large truncate">{opt.label}</span>
                        {opt.subtitle && (
                          <span
                            className={cn(
                              'body-small truncate',
                              isSelected
                                ? 'text-on-accent'
                                : 'text-on-surface-variant',
                            )}
                          >
                            {opt.subtitle}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
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
      <style>{`[data-multi-picker-content]{animation:none!important;transition:none!important;width:var(--radix-popover-trigger-width)!important}`}</style>
      <PopoverContent
        data-multi-picker-content=""
        className="p-0"
        align="start"
      >
        <Command>
          {!hideSearch && <CommandInput placeholder={searchPlaceholder} />}
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => {
                const isSelected = selectedIds.includes(opt.id);
                return (
                  <CommandItem
                    key={opt.id}
                    value={opt.searchValue ?? `${opt.label} ${opt.subtitle ?? ''}`}
                    onSelect={() => toggle(opt.id)}
                    className={cn(
                      'flex items-center gap-2 cursor-pointer py-3 md:py-1.5 min-h-[44px] md:min-h-0 touch-manipulation',
                      isSelected && 'bg-accent text-on-accent',
                    )}
                  >
                    <Checkbox
                      checked={isSelected}
                      className="pointer-events-none flex-shrink-0"
                    />
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="body-medium truncate">{opt.label}</span>
                      {opt.subtitle && (
                        <span
                          className={cn(
                            'body-small truncate',
                            isSelected
                              ? 'text-on-accent'
                              : 'text-on-surface-variant',
                          )}
                        >
                          {opt.subtitle}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
