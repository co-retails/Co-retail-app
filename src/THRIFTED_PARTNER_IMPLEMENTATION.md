# Thrifted Partner Implementation

## Overview
Added a new partner called "Thrifted" with comprehensive bulk upload and manual order creation capabilities. The flow supports both spreadsheet-based bulk uploads and manual item entry, with robust validation against dropdown values.

This remains a prototype. All import behavior is mocked client-side in the browser; there is no real upload backend, no persisted template endpoint, and no server-side validation service behind the flow.

## What Was Added

### 1. Partner Configuration
- **Partner**: Thrifted (ID: '2', Code: 'THRIFT')
- **Product Type**: Resale (same as Sellpy)
- **Warehouses**: 
  - Thrifted Oslo Distribution (NO-WH-001)
  - Thrifted Copenhagen Hub (DK-WH-001)
- **Mock Orders**: 3 sample orders (pending and registered status)

### 2. New Components

#### `ThriftedOrderCreationScreen.tsx`
Main order creation screen with three modes:
- **Select Mode**: Choose between manual or bulk upload
- **Manual Mode**: Form-based item entry with dropdowns
- **Bulk Mode**: CSV upload with validation

**Features**:
- Store/receiver selection with StoreSelector integration
- Real-time validation with error filtering
- Export current items to CSV for editing
- Replace all items by uploading new spreadsheet
- Duplicate detection within the uploaded file and, for append previews, against the current in-memory order
- Structured upload summary showing imported, rejected, skipped, and duplicate row counts
- Mock chunked processing for files over 1,000 rows with one combined result and determinate progress UI
- Validation error display and filtering (All/Errors/Valid/Duplicates)
- Template download button gated behind a mock availability flag instead of always downloading locally
- Mobile-responsive design following M3 guidelines

#### `spreadsheetUtils.ts`
Utility functions for CSV handling:
- `generateTemplateCSV()`: Creates downloadable template with instructions
- `parseCSV()`: Parses uploaded CSV files
- `convertToOrderItems()`: Converts CSV rows to OrderItems with validation
- `processMockThriftedImport()`: Simulates chunked CSV import processing and emits progress updates
- `convertToThriftedOrderItems()`: Converts CSV rows into Thrifted order items with duplicate-aware summaries
- `stripCurrentOrderConflictsFromThriftedImport()`: Rebuilds a replace preview without current-order duplicate conflicts
- `exportItemsToCSV()`: Exports current items for re-editing
- `validateItemData()`: Validates individual items against dropdown values
- `downloadCSV()`: Browser download utility

**Valid Values** (enforced in validation):
- Brands: H&M, WEEKDAY, COS, Monki, Zara, Arket, Other Stories
- Genders: Men, Women, Kids, Unisex
- Categories: Clothing, Shoes, Accessories
- Subcategories: Context-specific (e.g., Tops, Bottoms, Sneakers, Bags)
- Sizes: XXS-XXL, 28-46
- Colors: Black, White, Gray, Navy, Blue, Red, Pink, Green, Yellow, Brown, Beige, Purple, Orange, Silver, Gold, Multicolor
- Retailer Item ID: Free text, optional (can be added during creation or later)

### 3. Flow Details

#### Create New Order Flow
1. **Partner Dashboard** → Click "Create new order"
2. **Mode Selection**:
   - Select receiving store (Brand → Country → Store)
   - Choose creation method:
     - Add Items Manually
     - Bulk Upload via Spreadsheet

#### Manual Entry Flow
1. Fill in item form with validated dropdowns
2. Add items one by one
3. View all items with validation status
4. Filter by validation status (All/Errors/Valid)
5. Fix any validation errors
6. Create order when all items are valid

#### Bulk Upload Flow
1. If the mock template endpoint is marked live, download the CSV template
2. Fill template with item data:
   - Template includes valid values as comments
   - Mandatory fields marked with *
   - Example row provided
3. Upload completed CSV
4. Prototype detects row count and processes the file locally in 1,000-row chunks
5. System validates all rows, checks duplicates within the file, and previews duplicate conflicts against the current order when append mode is possible
6. View a structured upload summary with imported, rejected, skipped, and duplicate counts
7. Review rows directly in the UI using All / Valid / Errors / Duplicates filters
8. Fix errors directly in UI or export/re-upload CSV
9. Choose whether to replace or append when an order already has items

#### Post-Creation Flow (Different from Sellpy)
1. Order created with either "pending" or "registered" status (user choice)
2. **No scan flow** - Retailer IDs added directly in UI or spreadsheet
3. If created as pending: Register order from order details screen
4. Create delivery note
5. Add boxes (BoxManagementScreen)
6. Ship to store

**Key Difference from Sellpy**: Thrifted does NOT use the RetailerIdScanScreen. Retailer IDs are entered manually in the creation form or spreadsheet, and can be edited directly in the order details screen.

### 4. Validation Rules

**Mandatory Fields**:
- Item ID
- Brand (must match valid list)
- Gender (must match valid list)
- Category (must match valid list)
- Subcategory (must match valid list for category)
- Color (must match valid list)
- Price (must be > 0 and ≤ 99,999 SEK)

**Optional Fields**:
- Retailer Item ID (free text, can be added anytime)
- Size (validated if provided)
- Purchase Price (must be ≥ 0 if provided)

**Validation Features**:
- Real-time validation on manual entry
- Batch validation on CSV upload
- Row-specific error messages for CSV imports
- Duplicate warnings for SKU and Item ID collisions
- Separate treatment of rejected rows (validation failures) vs. skipped rows (duplicate collisions)
- Aggregated summary cards for imported, rejected, skipped, and duplicate row counts
- Clear indication of which values are invalid
- Suggestions for valid values in error messages

### 5. Export/Re-import Feature
- Export button on order edit screen
- Downloads current items as CSV in template format
- Edit in spreadsheet application
- Upload to replace all items
- Validation runs on upload
- Confirmation dialog if replacing existing items

### 6. Mock-Only Behavior
- The upload flow is entirely client-side and does not call a real API
- Chunking, progress, and combined results are simulated locally to match the eventual UX contract
- Template download availability is controlled by `MOCK_THRIFTED_TEMPLATE_ENDPOINT_LIVE` in `spreadsheetUtils.ts`
- When the mock template endpoint flag is off, the UI shows a disabled button instead of silently generating a file

## How to Test

### Test Bulk Upload
1. Switch to Partner role
2. Select "Thrifted" partner
3. Click "Create new order"
4. Select receiving store (e.g., Oslo Main Street)
5. Click "Bulk Upload via Spreadsheet"
6. If needed, toggle `MOCK_THRIFTED_TEMPLATE_ENDPOINT_LIVE` to `true` before testing the template button; otherwise prepare a CSV manually
7. Fill with sample data (use valid values from template comments)
8. Upload CSV
9. Observe progress, chunking, duplicate warnings, and the structured result summary
10. Fix any errors or duplicate rows
11. Create order

### Test Manual Entry
1. Follow steps 1-4 above
2. Click "Add Items Manually"
3. Fill in item form using dropdowns
4. Optionally add Retailer Item ID
5. Add multiple items
6. Test validation filter buttons
7. Test inline Retailer ID editing for added items
8. Choose to either "Save as Pending" or "Register Order"

### Test Export/Re-import
1. Create order with items (manual or bulk)
2. Click "Export" button
3. Edit downloaded CSV
4. Upload modified CSV
5. Confirm replacement
6. Verify items updated

## Technical Notes

### Design System Compliance
- Uses CSS variables from `/styles/globals.css`
- Typography: Only uses defined font faces (label, title, body, headline)
- Colors: Uses M3 color tokens (primary, surface, on-surface, etc.)
- Spacing: Uses consistent spacing scale
- Components: Leverages shadcn/ui components

### Reused Components
- `StoreSelector`: For receiver selection
- `ItemCard`: For item display (mobile)
- `ItemDetailsTable`: For item display (desktop)
- `SharedHeader`: For consistent navigation
- `Card`, `Badge`, `Alert`: For UI consistency
- `Dialog`: For confirmations and uploads

### State Management
- Local state within ThriftedOrderCreationScreen
- OrderItem interface from OrderCreationScreen (shared)
- Integration with useAppState for navigation

### Future Enhancements
- Real-time collaborative editing
- Barcode scanning for Item ID
- Image upload for items
- Price suggestion based on brand/category
- Bulk edit mode for fixing multiple items
- Optional transition from mocked import processing to a real backend if the prototype graduates

## Files Modified/Created

### Created
- `/components/ThriftedOrderCreationScreen.tsx` - Main order creation screen
- `/utils/spreadsheetUtils.ts` - CSV utilities and validation
- `/THRIFTED_PARTNER_IMPLEMENTATION.md` - This documentation

### Modified
- `/data/mockData.ts` - Added Thrifted partner, warehouses, and sample orders
- `/components/AppRouter.tsx` - Added order-creation route with partner detection and registration support
- `/components/OrderShipmentDetailsScreen.tsx` - Added action buttons for Thrifted orders (Register/Create Delivery Note)
- `/utils/spreadsheetUtils.ts` - Added Retailer Item ID column to template and export

### No Changes Required
- PartnerDashboard already shows "Create new order" for non-Sellpy partners
- BoxManagementScreen works with all partners

### Important Differences from Sellpy
- **NO RetailerIdScanScreen** for Thrifted - retailer IDs are entered manually
- Thrifted orders can be registered immediately upon creation
- Retailer IDs can be edited inline in order details
