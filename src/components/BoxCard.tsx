import React from 'react';
import { Package } from 'lucide-react';
import { useIsListRowBumped, useListRowFonts } from './ui/list-row-card';

export interface BoxCardProps {
  /** Primary short identifier / QR label of the box */
  boxLabel?: string;
  /** Internal box id */
  boxId?: string;
  /** Linked order number */
  orderNumber?: string;
  /** Created date (string, already formatted) */
  date?: string;
  /** Box status (human-readable). "Delivered" gets a green highlight pill automatically. */
  status?: string;
  /** Number of items in the box */
  itemCount?: number;
  /** Sender / partner name (optional, shown as secondary metadata) */
  sender?: string;
  /** Delivery / delivery-note label associated with this box (optional) */
  deliveryLabel?: string;
  /** Click handler — if provided, the card becomes a button */
  onSelect?: () => void;
  /** Slot for the trailing more-actions / dropdown menu (rendered after item count) */
  menuSlot?: React.ReactNode;
  /** Optional leading element override (defaults to Package icon in a circular pill) */
  leadingSlot?: React.ReactNode;
  /** Extra className applied to the root row */
  className?: string;
  /** Whether to hide the item count in the trailing slot */
  hideItemCount?: boolean;
}

/**
 * Shared list-row card for rendering a Box in the store/partner apps.
 *
 * Applies the same mobile/tablet "bumped" typography treatment as DeliveryCard
 * and ItemCard (items-list variant): min-height 112px and fonts stepped up one
 * M3 level below 1024px so labels remain legible on smaller devices without
 * truncation.
 */
export default function BoxCard({
  boxLabel,
  boxId,
  orderNumber,
  date,
  status,
  itemCount,
  sender,
  deliveryLabel,
  onSelect,
  menuSlot,
  leadingSlot,
  className = '',
  hideItemCount = false,
}: BoxCardProps) {
  const bumped = useIsListRowBumped();
  const fonts = useListRowFonts();
  const rowStyle: React.CSSProperties | undefined = bumped ? { minHeight: '112px' } : undefined;

  const interactive = typeof onSelect === 'function';

  const rowClasses = [
    'flex items-center gap-3 px-4 py-3 bg-surface-container transition-colors',
    interactive ? 'hover:bg-surface-container-high cursor-pointer' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!interactive) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect?.();
    }
  };

  return (
    <div
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={interactive ? onSelect : undefined}
      onKeyDown={interactive ? handleKeyDown : undefined}
      style={rowStyle}
      className={rowClasses}
    >
      {/* Leading Element */}
      {leadingSlot ?? (
        <div className="flex-shrink-0 w-10 h-10 bg-surface-container-highest rounded-full flex items-center justify-center">
          <Package className="w-5 h-5 text-on-surface-variant" />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Line 1 — date • status */}
        {(date || status) && (
          <div className={`${fonts.label} mb-1`}>
            {date && <span className="text-on-surface-variant">{date}</span>}
            {date && status ? <span className="text-on-surface-variant"> • </span> : ''}
            {status && (
              status === 'Delivered' ? (
                <span className="inline-block bg-success-container text-on-surface px-1.5 py-0.5 rounded">
                  {status}
                </span>
              ) : (
                <span className="text-on-surface">{status}</span>
              )
            )}
          </div>
        )}

        {/* Line 2 — box label (prominent) */}
        {boxLabel && (
          <div className={`${fonts.bodyMd} text-on-surface mb-1 break-words`}>
            <span className={`${fonts.label} text-on-surface-variant`}>Box Label: </span>
            {boxLabel}
          </div>
        )}

        {/* Line 3 — box id */}
        {boxId && (
          <div className={`${fonts.label} text-on-surface-variant mb-1 break-words`}>
            <span className={`${fonts.label} text-on-surface-variant`}>Box ID: </span>
            {boxId}
          </div>
        )}

        {/* Line 4 — order nr */}
        {orderNumber && (
          <div className={`${fonts.body} text-on-surface-variant ${sender || deliveryLabel ? 'mb-1' : ''} break-words`}>
            <span className={`${fonts.label} text-on-surface-variant`}>Order nr: </span>
            {orderNumber}
          </div>
        )}

        {/* Line 5 — sender / delivery */}
        {(sender || deliveryLabel) && (
          <div className={`${fonts.body} text-on-surface-variant break-words`}>
            {sender && (
              <>
                <span className={`${fonts.label} text-on-surface-variant`}>Sender: </span>
                {sender}
              </>
            )}
            {sender && deliveryLabel && ' • '}
            {deliveryLabel && (
              <>
                <span className={`${fonts.label} text-on-surface-variant`}>Delivery: </span>
                {deliveryLabel}
              </>
            )}
          </div>
        )}
      </div>

      {/* Trailing Elements */}
      <div className="flex-shrink-0 flex items-center gap-2">
        {!hideItemCount && typeof itemCount === 'number' && (
          <div className={`${fonts.body} text-on-surface whitespace-nowrap`}>
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </div>
        )}
        {menuSlot}
      </div>
    </div>
  );
}
