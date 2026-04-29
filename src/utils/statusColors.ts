/**
 * Central status → M3 token color + display-label registry.
 *
 * Replaces ~17 in-file `getStatusColor` / `getStatusBadge*` switch helpers
 * scattered across the codebase. Status strings are normalized to lower-case
 * with hyphenated whitespace before lookup, so "In transit", "in transit",
 * and "in-transit" all resolve to the same entry.
 *
 * Three surfaces are exposed:
 *  - `getStatusBadgeClasses(status)` — `bg-X-container text-on-X-container`
 *    for filled pill / badge components.
 *  - `getStatusTextColor(status)` — `text-X` for label-only contexts.
 *  - `getStatusLabel(status)` — human-friendly display string (e.g. backend
 *    `registered` → UI label "Ready for Packing"). Falls back to a sentence-
 *    cased version of the status for any value not in `STATUS_LABELS`.
 *
 * If a status isn't in the map, the color helpers return a neutral surface
 * fallback and `getStatusLabel` returns a sentence-cased version of the input.
 */

const NEUTRAL_BADGE = 'bg-surface-container-high text-on-surface-variant';
const NEUTRAL_TEXT = 'text-on-surface-variant';

/**
 * Canonical lookup key — lowercase, whitespace collapsed to hyphens.
 * Examples: "In transit" → "in-transit", "Partly Delivered" → "partly-delivered".
 */
export function normalizeStatus(status: string | null | undefined): string {
  if (!status) return '';
  return status.trim().toLowerCase().replace(/\s+/g, '-');
}

type StatusToneKey =
  | 'success'
  | 'tertiary'
  | 'primary'
  | 'secondary'
  | 'warning'
  | 'error'
  | 'neutral';

const TONE_BADGE: Record<StatusToneKey, string> = {
  success: 'bg-success-container text-on-success-container',
  tertiary: 'bg-tertiary-container text-on-tertiary-container',
  primary: 'bg-primary-container text-on-primary-container',
  secondary: 'bg-secondary-container text-on-secondary-container',
  warning: 'bg-warning-container text-on-warning-container',
  error: 'bg-error-container text-on-error-container',
  neutral: NEUTRAL_BADGE,
};

const TONE_TEXT: Record<StatusToneKey, string> = {
  success: 'text-success',
  tertiary: 'text-tertiary',
  primary: 'text-primary',
  secondary: 'text-secondary',
  warning: 'text-warning',
  error: 'text-error',
  neutral: NEUTRAL_TEXT,
};

/**
 * Single source of truth for status → tone mapping.
 *
 * When the same status string was previously rendered with conflicting tones
 * across screens, the choice noted next to the entry was made:
 * - `delivered` → success  (was success in 3 places, tertiary in 1)
 * - `returned`  → success  (return-flow completion; item-state callsites
 *                          shift from tertiary → success — minor visual diff)
 */
const STATUS_TONE: Record<string, StatusToneKey> = {
  // success / positive completion
  available: 'success',
  delivered: 'success',
  returned: 'success',

  // tertiary / final celebrated
  sold: 'tertiary',
  published: 'tertiary',

  // primary / in-motion
  'in-transit': 'primary',
  packing: 'primary',
  registered: 'primary',
  // Both spellings appear in upstream data; both alias to the same tone.
  'partially-delivered': 'primary',
  'partly-delivered': 'primary',

  // warning / needs attention
  approval: 'warning',
  pending: 'warning',

  // error / negative
  rejected: 'error',
  missing: 'error',
  broken: 'error',
  cancelled: 'error',

  // neutral / inactive
  draft: 'neutral',
};

/**
 * Backend-string → user-facing display label overrides.
 * Any status not in this map falls back to a sentence-cased version of the
 * normalized key (e.g. `pending` → "Pending").
 *
 * Backend values are unchanged; only the rendered label differs.
 */
const STATUS_LABELS: Record<string, string> = {
  registered: 'Ready for Packing',
  approval: 'Awaiting approval',
  // `in-transit` falls through to the sentence-case helper, which yields
  // "In transit" — the intended user-facing label for both partner orders
  // and delivery notes.
};

function sentenceCaseFromKey(key: string): string {
  if (!key) return '';
  const spaced = key.replace(/-/g, ' ');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/**
 * Returns the human-readable display string for a status. Looks up
 * `STATUS_LABELS` first, then falls back to a sentence-cased normalized key,
 * and finally to the raw input if normalization yields an empty string.
 */
export function getStatusLabel(status: string | null | undefined): string {
  const key = normalizeStatus(status);
  if (!key) return status ?? '';
  return STATUS_LABELS[key] ?? sentenceCaseFromKey(key);
}

/**
 * Returns Tailwind classes for a filled status pill / badge:
 *   `bg-X-container text-on-X-container`
 */
export function getStatusBadgeClasses(status: string | null | undefined): string {
  const tone = STATUS_TONE[normalizeStatus(status)];
  return tone ? TONE_BADGE[tone] : NEUTRAL_BADGE;
}

/**
 * Returns Tailwind class for label-only status text:
 *   `text-X`
 */
export function getStatusTextColor(status: string | null | undefined): string {
  const tone = STATUS_TONE[normalizeStatus(status)];
  return tone ? TONE_TEXT[tone] : NEUTRAL_TEXT;
}
