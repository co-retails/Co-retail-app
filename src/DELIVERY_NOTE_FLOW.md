# Delivery Note Creation Flow - Implementation Guide

## Overview

The delivery note creation flow allows partners to package order items into boxes and register shipments for delivery to stores. This flow is available for all partners (Thrifted, Sellpy Operations, and any future partners).

## User Flows

### Flow 1: Create Delivery Note After Registration

1. Partner creates and registers an order
2. PostRegistrationDialog appears with two options:
   - **"Create Delivery Note"** - Opens delivery note creation screen
   - **"View Order List"** - Returns to shipping/orders list
3. If "Create Delivery Note" clicked:
   - Opens DeliveryNoteCreationScreen with order details
   - Shows order summary (total items, store info)
   - Partner adds boxes and assigns items
   - Registers delivery note

### Flow 2: Create Delivery Note from Order Details

1. Partner opens a **registered** order from the orders list
2. OrderShipmentDetailsScreen shows order details
3. Bottom action button: **"Create Delivery Note"**
4. When clicked:
   - Opens DeliveryNoteCreationScreen with order details
   - Same packaging and registration process

## Delivery Note Creation Screen

### Order Information Card
- **Total Items**: Count of all items in order
- **Assigned**: Number of items added to boxes
- **Unassigned**: Items not yet in any box (must be 0 to register)
- **Boxes**: Number of complete boxes with items / total boxes
- **Receiving Store**: Store name and code

### Box Management

#### Adding Boxes
Two methods available:

1. **Scan Box Label**
   - Opens camera scanner
   - Scans QR code or barcode on box
   - Automatically creates box with scanned label
   - Validates no duplicate labels

2. **Enter Manually**
   - Opens dialog with text input
   - Type or paste box label (e.g., "BOX-001")
   - Press Enter or click "Add Box"
   - Validates no duplicate labels

#### Box Card Display
Each box shows:
- Box label (e.g., "BOX-001")
- Item count badge
- List of items in box (if any)
- Two action buttons:
  - **"Scan Item"** - Open scanner to scan items into box
  - **"Add Manually"** - Select items from list
- Remove box button (X icon, top right)

### Adding Items to Boxes

#### Method 1: Scan Items
1. Click "Scan Item" on a box
2. Camera scanner opens
3. Scan item barcode/QR code (retailer ID, item ID, or partner item ID)
4. Item automatically added to box
5. Toast confirmation shown
6. Scanner stays open for next item
7. Close scanner when done

#### Method 2: Manual Selection
1. Click "Add Manually" on a box
2. Dialog shows all unassigned items
3. Check boxes next to items to select
4. Click "Add X Item(s)" to confirm
5. Selected items move to box

### Item Display in Boxes
Each item in a box shows:
- Item ID
- Brand • Category
- Retailer ID (if available)
- Remove button (X icon)

### Unassigned Items Alert
- Red alert card appears when items not assigned
- Shows up to 5 unassigned items
- Shows count of additional items
- Must assign all items before registration

### Registration

#### Validation Rules
- ✅ At least one box must exist
- ✅ All boxes must have items (no empty boxes)
- ✅ All order items must be assigned to boxes
- ✅ No validation errors on items

#### Registration Button
- Fixed bottom bar
- Shows progress: "X of Y items in Z box(es)"
- **"Cancel"** button - Returns without saving
- **"Register Delivery"** button - Creates delivery note
  - Disabled if validation fails
  - On success:
    - Creates delivery note record
    - Updates order status to 'in-transit'
    - Shows success toast
    - Returns to partner dashboard

## Component Architecture

### DeliveryNoteCreationScreen
**Location**: `/components/DeliveryNoteCreationScreen.tsx`

**Props**:
```typescript
interface DeliveryNoteCreationScreenProps {
  onBack: () => void;
  orderId: string;
  orderItems: OrderItem[];
  onCreateDeliveryNote: (deliveryNote: DeliveryNote) => void;
  receivingStore?: { name: string; code: string; };
  partnerName?: string;
}
```

**Key State**:
- `boxes: Box[]` - All boxes in delivery
- `currentBoxId` - Box currently being edited
- `dialogMode` - Which dialog is open
- `scanMode` - Camera scanner mode (box or item)

**Data Structures**:
```typescript
interface Box {
  id: string;
  qrLabel: string;
  items: OrderItem[];
  status: 'pending' | 'complete';
  createdDate: string;
}

interface DeliveryNote {
  id: string;
  orderId: string;
  boxes: Box[];
  status: 'pending' | 'registered' | 'in-transit' | 'delivered';
  createdDate: string;
  registeredDate?: string;
}
```

### PostRegistrationDialog
**Location**: `/components/PostRegistrationDialog.tsx`

Updated to use Material 3 typography:
- `title-large` for dialog title
- `label-large` for button text
- `body-small` for labels
- `title-medium` for order ID

### ActiveScanner
**Location**: `/components/ActiveScanner.tsx`

Reused for both box label and item scanning:
- **Box mode**: Scans box QR codes/barcodes
- **Item mode**: Scans item barcodes (retailer ID, item ID, partner item ID)

## Navigation Flow

### AppRouter Integration
**Location**: `/components/AppRouter.tsx`

```typescript
case 'delivery-note-creation':
  // Get order data from detailsScreenData
  // Generate order items
  // Render DeliveryNoteCreationScreen
  // Handle onCreateDeliveryNote callback:
  //   - Add delivery note to state
  //   - Update order status to 'in-transit'
  //   - Navigate to partner-dashboard
```

### Navigation Handlers
**Location**: `/hooks/useNavigationHandlers.ts`

Added back navigation:
```typescript
else if (currentScreen === 'delivery-note-creation') {
  setCurrentScreen('partner-dashboard');
}
```

### App.tsx Handlers

**handleCreateDeliveryNoteFromDialog**:
```typescript
const handleCreateDeliveryNoteFromDialog = () => {
  setShowPostRegistrationDialog(false);
  setCurrentScreen('delivery-note-creation');
};
```

**handleCreateDeliveryNoteForOrder**:
```typescript
const handleCreateDeliveryNoteForOrder = (orderId: string) => {
  const order = partnerOrders.find(o => o.id === orderId);
  if (order) {
    setCurrentScreen('delivery-note-creation');
  }
};
```

## Material 3 Design Compliance

### Typography Classes Used
- `title-large` - Screen title, dialog titles
- `title-medium` - Card titles, order ID
- `title-small` - Box labels, item IDs
- `label-large` - Button text
- `label-medium` - Filter buttons, action button labels
- `label-small` - Field labels, helper text
- `body-medium` - Descriptions, instructions
- `body-small` - Secondary information, metadata

### Color Tokens
- `bg-surface` - Screen background
- `bg-surface-container` - Card backgrounds
- `bg-surface-container-low` - Summary card background
- `text-on-surface` - Primary text
- `text-on-surface-variant` - Secondary text, labels
- `bg-primary`, `text-on-primary` - Primary action buttons
- `bg-primary-container`, `text-on-primary-container` - Icons in cards
- `border-outline`, `border-outline-variant` - Borders, dividers
- `bg-error-container`, `text-error` - Error states
- `border-error` - Error borders

### Component Patterns
- **Cards**: `bg-surface-container`, `border-outline`, `rounded-xl`
- **Buttons**: Size `lg` for primary actions, `sm` for secondary
- **Icons**: 16px for small actions, 20px for primary buttons, 48px for empty states
- **Spacing**: Consistent `gap-2`, `gap-3`, `gap-4`, `space-y-4`, `space-y-6`
- **Alerts**: Error variant for validation messages
- **Dialogs**: Consistent footer with Cancel + Primary action

## Testing Scenarios

### Scenario 1: Complete Flow (Scan)
1. Create and register order
2. Click "Create Delivery Note" in dialog
3. Click "Scan Box Label"
4. Scan box QR code → Box added
5. Click "Scan Item" on box
6. Scan 5 items → All added to box
7. Repeat for second box
8. Verify all items assigned
9. Click "Register Delivery"
10. Verify delivery note created
11. Verify order status = 'in-transit'
12. Verify return to dashboard

### Scenario 2: Manual Entry
1. Open registered order
2. Click "Create delivery note"
3. Click "Enter Box Label Manually"
4. Type "BOX-001" → Box added
5. Click "Add Manually" on box
6. Select 10 items from list
7. Click "Add 10 Item(s)"
8. Verify items in box
9. Create second box
10. Assign remaining items
11. Click "Register Delivery"

### Scenario 3: Error Handling
1. Start delivery note creation
2. Add box
3. Try adding same box label → Error toast
4. Add items to box
5. Try adding same item again → Error toast (not in available items)
6. Add box with no items
7. Try to register → Error message
8. Remove empty box
9. Leave some items unassigned
10. Try to register → Error message
11. Assign all items
12. Register successfully

### Scenario 4: Remove and Edit
1. Add 3 boxes
2. Add items to boxes
3. Remove item from box 2
4. Verify item back in unassigned
5. Remove box 3 (with items)
6. Verify all items back in unassigned
7. Reassign items
8. Register delivery

### Scenario 5: Cancel
1. Start delivery note creation
2. Add boxes and items
3. Click "Cancel"
4. Verify return without saving
5. Open order again
6. Verify no delivery note created

## Partner-Specific Behavior

### All Partners (Thrifted, Sellpy Operations, etc.)
- Same delivery note creation flow
- Same box and item management
- Same validation rules
- Same navigation patterns

### Order Prerequisites
- **Thrifted**: Order must be registered (no retailer ID required)
- **Sellpy Operations**: Order must be registered (retailer IDs added via scan screen)

## Future Enhancements

1. **Box Templates**: Save common box configurations
2. **Bulk Box Creation**: Add multiple boxes at once
3. **Item Suggestions**: Auto-suggest items based on categories
4. **Weight/Dimensions**: Track box weight and size
5. **Print Labels**: Generate printable box labels
6. **Barcode Generation**: Create barcodes for boxes without QR codes
7. **Box History**: View previous packing patterns
8. **Packing Optimization**: Suggest optimal item distribution
9. **Multi-Warehouse**: Support splitting across warehouses
10. **Tracking Integration**: Link to carrier tracking systems

## Accessibility

- All buttons have clear labels
- Dialogs use proper ARIA attributes
- Scanner provides fallback for manual entry
- Error messages are clear and actionable
- Focus management in dialogs
- Keyboard navigation supported

## Performance Considerations

- Items virtualized in large lists (100+ items)
- Dialogs use lazy rendering
- Scanner uses requestAnimationFrame for smooth video
- State updates batched for multiple items
- Toast notifications debounced

## Localization Ready

All user-facing strings extracted to constants:
- Button labels
- Dialog titles
- Error messages
- Toast notifications
- Field labels
- Instructions

Ready for i18n implementation with no code changes needed.
