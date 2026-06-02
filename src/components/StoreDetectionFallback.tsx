import { useState, useEffect, useMemo } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { Check, ChevronRight, TriangleAlert } from 'lucide-react';
import { useMediaQuery } from './ui/use-mobile';
import { sortStoresByCode } from '../utils/spreadsheetUtils';
import type { Store, Brand, StoreSelection } from './StoreSelector';

interface StoreDetectionFallbackProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selection: StoreSelection) => void;
  /** Stores the signed-in user is allowed to operate. */
  accessibleStores: Store[];
  brands: Brand[];
}

/**
 * Shown when the device fails to detect which store it belongs to during SSO
 * sign-in and the user has more than one accessible store. They pick from the
 * stores they have access to before continuing. Users with a single accessible
 * store have it auto-selected silently and never reach this flow.
 */
export default function StoreDetectionFallback({
  isOpen,
  onClose,
  onConfirm,
  accessibleStores,
  brands
}: StoreDetectionFallbackProps) {
  const isLargeScreen = useMediaQuery('(min-width: 640px)');

  const sortedStores = useMemo(() => sortStoresByCode(accessibleStores), [accessibleStores]);
  const noStores = sortedStores.length === 0;

  const [selectedStoreId, setSelectedStoreId] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelectedStoreId('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, accessibleStores]);

  const brandName = (brandId: string) => brands.find((b) => b.id === brandId)?.name ?? '';

  const confirm = (storeId: string) => {
    const store = sortedStores.find((s) => s.id === storeId);
    if (!store) return;
    onConfirm({
      brandId: store.brandId,
      countryId: store.countryId,
      storeId: store.id,
      storeCode: store.code
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side={isLargeScreen ? 'right' : 'bottom'}
        containerZIndex={10000}
        className={`
          bg-surface-container-high border-outline-variant p-0 gap-0 overflow-hidden flex flex-col
          ${isLargeScreen ? 'h-full w-full max-w-md' : 'rounded-t-3xl max-h-[90vh]'}
        `}
      >
        {!isLargeScreen && (
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-8 h-1 bg-outline-variant rounded-full" />
          </div>
        )}

        <SheetHeader className={`relative flex-shrink-0 ${isLargeScreen ? 'px-6 pt-6 pb-3' : 'px-6 pb-3'}`}>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-warning-container flex-shrink-0">
              <TriangleAlert className="w-5 h-5 text-on-warning-container" />
            </div>
            <SheetTitle className="title-large text-on-surface text-left flex-1">
              Store not detected
            </SheetTitle>
          </div>
          <SheetDescription className="sr-only">
            We could not automatically detect this device's store. Select your store to continue.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {/* Explanation */}
          <div className="bg-warning-container text-on-warning-container rounded-lg p-4 mb-6">
            <p className="body-medium">
              We couldn't automatically detect which store this device belongs to. Select the
              store you are working in to continue.
            </p>
          </div>

          {noStores && (
            <div className="text-center py-8">
              <p className="body-large text-on-surface">No stores assigned to your account.</p>
              <p className="body-small text-on-surface-variant mt-1">
                Contact your administrator to get store access.
              </p>
            </div>
          )}

          {/* Pick one of the accessible stores (confirms immediately) */}
          {!noStores && (
            <div>
              <p className="body-small text-on-surface-variant mb-3">
                Choose your store ({sortedStores.length} available)
              </p>
              <div className="space-y-1">
                {sortedStores.map((store) => {
                  const isSelected = selectedStoreId === store.id;
                  return (
                    <button
                      key={store.id}
                      onClick={() => {
                        setSelectedStoreId(store.id);
                        confirm(store.id);
                      }}
                      className={`
                        w-full flex items-center justify-between p-4 rounded-lg min-h-[48px] touch-manipulation
                        bg-surface-container hover:bg-surface-container-high active:bg-surface-container-highest transition-colors
                        ${isSelected ? 'bg-secondary-container' : ''}
                      `}
                    >
                      <div className="flex-1 text-left min-w-0">
                        <div className={`body-large truncate ${isSelected ? 'text-on-secondary-container' : 'text-on-surface'}`}>
                          {store.name}
                        </div>
                        <div className={`body-small truncate ${isSelected ? 'text-on-secondary-container' : 'text-on-surface-variant'}`}>
                          {brandName(store.brandId)} · {store.code}
                        </div>
                      </div>
                      {isSelected ? (
                        <Check className="h-5 w-5 text-on-secondary-container flex-shrink-0" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-on-surface-variant flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
