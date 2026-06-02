import { TriangleAlert, X } from 'lucide-react';

interface StoreManualSelectionBannerProps {
  storeName: string;
  onDismiss: () => void;
}

/**
 * Persistent notice shown after a store user manually selects their store
 * because device→store detection failed. Reminds them to verify the right
 * store is active; they can re-pick by tapping the store name in the header.
 */
export default function StoreManualSelectionBanner({
  storeName,
  onDismiss
}: StoreManualSelectionBannerProps) {
  return (
    <div className="w-full bg-warning-container text-on-warning-container border-b border-outline-variant">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-start gap-3">
        <TriangleAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="label-large">Store selected manually — {storeName}</p>
          <p className="body-small opacity-90">
            If this is correct you're all set, otherwise you can change it by clicking the store
            name below.
          </p>
        </div>
        <button
          onClick={onDismiss}
          aria-label="Dismiss notice"
          className="inline-flex items-center justify-center rounded-full min-h-[48px] min-w-[48px] hover:bg-on-warning-container/10 transition-colors touch-manipulation flex-shrink-0"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
