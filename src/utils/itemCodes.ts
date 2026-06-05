/**
 * Item code helpers for the store app.
 *
 * The store carries two kinds of items after a data migration:
 *
 *  - **Legacy / migrated items** — item IDs are 6 digits long and were printed
 *    as 2D **Data Matrix** codes whose payload is 43 digits.
 *  - **New (co-retail) items** — item IDs are proper 12-digit GTINs and are
 *    printed as regular 1D **barcodes**.
 *
 * Which code an item uses is normally derived from the item ID length, but an
 * explicit `idFormat` can override the heuristic, and an explicit `dataMatrix`
 * payload can be stored on migrated items.
 */

export type ItemCodeType = 'datamatrix' | 'barcode';

/** Length of a legacy / migrated item ID. */
export const LEGACY_ITEM_ID_LENGTH = 6;
/** Length of a new GTIN-based item ID. */
export const GTIN_ITEM_ID_LENGTH = 12;
/** Length of the data-matrix payload printed on legacy items. */
export const DATA_MATRIX_LENGTH = 43;

/** Fields any item-like object may expose for code resolution. */
export interface ItemCodeFields {
  itemId?: string;
  /** Explicit override; when set it wins over the length heuristic. */
  idFormat?: 'legacy' | 'gtin';
  /** Explicit 43-digit data-matrix payload for migrated items. */
  dataMatrix?: string;
}

type ItemCodeInput = ItemCodeFields | string | null | undefined;

function resolveItemId(input: ItemCodeInput): string {
  if (!input) return '';
  return (typeof input === 'string' ? input : input.itemId ?? '').trim();
}

/** A 6-digit numeric ID is a legacy / migrated item. */
export function isLegacyItemId(itemId?: string): boolean {
  return !!itemId && new RegExp(`^\\d{${LEGACY_ITEM_ID_LENGTH}}$`).test(itemId.trim());
}

/** A 12-digit numeric ID is a new GTIN-based item. */
export function isGtinItemId(itemId?: string): boolean {
  return !!itemId && new RegExp(`^\\d{${GTIN_ITEM_ID_LENGTH}}$`).test(itemId.trim());
}

/**
 * Resolve which code an item shows. Honors an explicit `idFormat`, otherwise
 * falls back to the item-ID length heuristic (6-digit → data matrix).
 */
export function getItemCodeType(input: ItemCodeInput): ItemCodeType {
  if (input && typeof input === 'object') {
    if (input.idFormat === 'legacy') return 'datamatrix';
    if (input.idFormat === 'gtin') return 'barcode';
  }
  return isLegacyItemId(resolveItemId(input)) ? 'datamatrix' : 'barcode';
}

/** True when the item is a migrated legacy item (shows a data matrix). */
export function isMigratedItem(input: ItemCodeInput): boolean {
  return getItemCodeType(input) === 'datamatrix';
}

/**
 * Deterministically expand a (usually 6-digit) item ID into a stable 43-digit
 * data-matrix payload, so a migrated item always renders the same code.
 *
 * The item ID is the **last 6 digits** of the payload, so the 37-digit prefix is
 * generated deterministically and the ID is appended at the end.
 */
export function generateDataMatrixValue(itemId: string): string {
  const id = (itemId || '0').replace(/\D/g, '').slice(-LEGACY_ITEM_ID_LENGTH).padStart(LEGACY_ITEM_ID_LENGTH, '0');
  let seed = 0;
  for (let i = 0; i < id.length; i++) {
    seed = (seed * 31 + id.charCodeAt(i)) >>> 0;
  }
  let prefix = '';
  const prefixLength = DATA_MATRIX_LENGTH - LEGACY_ITEM_ID_LENGTH;
  while (prefix.length < prefixLength) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    prefix += (seed % 10).toString();
  }
  return prefix.slice(0, prefixLength) + id;
}

/**
 * The 6-digit item ID encoded in a 43-digit data-matrix payload — the last 6
 * digits. Used both to display the short ID and to assign a new ID when a QR /
 * data-matrix code is scanned.
 */
export function getQrItemId(dataMatrix: string): string {
  return (dataMatrix || '').replace(/\D/g, '').slice(-LEGACY_ITEM_ID_LENGTH);
}

/**
 * The 43-digit data-matrix payload for an item: the explicit `dataMatrix` field
 * when valid, otherwise a value derived deterministically from the item ID.
 */
export function getDataMatrixValue(input: ItemCodeInput): string {
  if (input && typeof input === 'object' && input.dataMatrix) {
    const explicit = input.dataMatrix.trim();
    if (new RegExp(`^\\d{${DATA_MATRIX_LENGTH}}$`).test(explicit)) return explicit;
  }
  return generateDataMatrixValue(resolveItemId(input));
}

/**
 * The value encoded in the 1D barcode for GTIN / new items. A 12-digit GTIN is
 * encoded as-is; anything else preserves the legacy `9`-prefixed encoding.
 */
export function getBarcodeValue(input: ItemCodeInput): string {
  const itemId = resolveItemId(input);
  if (isGtinItemId(itemId)) return itemId;
  return `9${itemId}`;
}
