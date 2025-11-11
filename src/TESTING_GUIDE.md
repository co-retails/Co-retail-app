# Testing Guide: Partner Portal Features

## Recent Updates

### 1. "Create Delivery Note" for Registered Orders
✅ **Status:** Implemented and wired up in App.tsx

### 2. "Mark as Returned" Restriction
✅ **Status:** Fixed - Now only available in Partner mode

---

## How to Test "Create Delivery Note" Feature

### Prerequisites
You MUST be in the correct mode to see registered orders:

1. **Switch to Partner Mode**
   - Click the role switcher in the navigation (top-right on desktop, hamburger menu on mobile)
   - Select "Partner" from the role options

2. **Verify Partner Selection**
   - Make sure you're viewing as **"Sellpy Operations"** (Partner ID: 1)
   - NOT the Chinese partner "Shenzhen Fashion Manufacturing"

3. **Navigate to Orders & Shipments**
   - From Partner Dashboard, click "Orders & Shipments" 
   - OR use bottom/side navigation to go to "Orders"

4. **Ensure you're on the "Orders" Tab**
   - This is the first tab (shows pending, registered, and in-review orders)
   - The tab might be labeled "Orders" or show a pending/order icon

### Finding Registered Orders

Look for orders with these characteristics:
- **Status Badge:** "Ready for Packaging" (green/secondary color badge)
- **Status in data:** `status: 'registered'`
- **Test Order IDs to look for:**
  - `SEL-ORD-2024-111` (22 items, 1 box)
  - `SEL-ORD-2024-112` (18 items, 1 box)
  - `SEL-ORD-2024-102` (32 items, 1 box)

### Using the Feature

#### On Mobile:
1. Find a registered order in the list
2. Look for the **three-dot menu icon (⋮)** on the right side of the card
3. Tap the menu icon
4. You should see "Create delivery note" with a package icon
5. Tap to navigate to Box Management screen

#### On Desktop:
1. Find a registered order in the table
2. Look for the **three-dot menu icon (⋮)** in the last column
3. Click the menu icon
4. Select "Create delivery note" (with package icon)
5. You'll be navigated to Box Management screen

### What Should Happen:
- Clicking "Create delivery note" should navigate you to the **Box Management** screen
- There you can create a delivery note for the selected order

---

## How to Test "Mark as Returned" Restriction

### In Partner Mode (Should Work):

1. **Switch to Partner Mode** (as above)
2. **Navigate to Orders & Shipments**
3. **Click on the "Returns" Tab**
4. **Find a return delivery** with status "Pending pickup" or "In transit"
5. **Look for action buttons:**
   - **Mobile:** "Mark as returned" button visible on card
   - **Desktop:** Three-dot menu (⋮) with "Mark as returned" option

### In Store Staff Mode (Should NOT Work):

1. **Switch to Store Staff Mode**
   - Click role switcher
   - Select "Store Staff"

2. **Navigate to Orders & Shipments**
3. **Click on the "Returns" Tab**
4. **Find return deliveries**
5. **Verify NO action buttons:**
   - ❌ No "Mark as returned" button on mobile cards
   - ❌ No three-dot menu on desktop table
   - ✅ Returns are **read-only** for store staff

### Why This Change:
Store staff can **view** return deliveries but cannot mark them as returned. Only partners can update the status of return deliveries.

---

## Troubleshooting

### "I don't see registered orders"

**Check these:**
1. ✅ Are you in **Partner mode**? (Not Store Staff, not Buyer)
2. ✅ Are you viewing **Sellpy Operations** partner? (Partner ID: 1)
3. ✅ Are you on the **Orders tab**? (First tab, not In-Transit or Delivered)
4. ✅ Do you see ANY orders at all in the list?

**If you see orders but none are "registered":**
- Check the mock data in `/data/mockData.ts`
- Look for `mockPartnerOrders` array
- Verify there are orders with `status: 'registered'`
- Our test data includes orders: `SEL-ORD-2024-111`, `SEL-ORD-2024-112`, `SEL-ORD-2024-102`

### "I don't see the three-dot menu on registered orders"

**Possible causes:**
1. The order is not actually "registered" status
2. The `onCreateDeliveryNoteForOrder` prop is not being passed to ShippingScreen
3. You're looking at a different type of order (showroom orders, delivery notes)

**Verification:**
- Check browser console for any errors
- Verify the order has `status: 'registered'` in the data
- The dropdown should only appear for orders with exact status 'registered'

### "Mark as returned" still shows in Store Staff mode

**This should be fixed now.** If you still see it:
1. Hard refresh the browser (Ctrl+Shift+R or Cmd+Shift+R)
2. Check that you're really in Store Staff mode (check the role switcher)
3. The code now explicitly checks `currentUserRole === 'partner'` before showing the button

---

## Code Changes Summary

### Files Modified:

1. **`/components/ShippingScreen.tsx`**
   - ✅ Added dropdown menu to `PartnerOrderItem` component (lines 618-640)
   - ✅ Added desktop table dropdown for registered orders (lines 2090-2128)
   - ✅ Removed "Mark as returned" from Store Staff view (lines 1471, 1534-1556)
   - ✅ Prop: `onCreateDeliveryNoteForOrder` properly destructured (line 910)

2. **`/App.tsx`**
   - ✅ Added handler: `handleCreateDeliveryNoteForOrder` (lines 382-389)
   - ✅ Passed prop to ShippingScreen (line 796)
   - ✅ Added `onNavigateToRetailerIdScan` to OrderDetailsScreen (line 953)

3. **`/data/mockData.ts`**
   - ✅ Added test orders: `SEL-ORD-2024-111`, `SEL-ORD-2024-112` (lines 1747-1770)

### Design System Compliance:

All UI elements use Material 3 design tokens:
- **Colors:** `bg-surface-container-high`, `text-on-surface-variant`, `bg-primary`, `text-on-primary`
- **Typography:** `label-large` for menu items, `body-medium` for table text
- **Shape:** `rounded-full` for icon buttons, Material 3 dropdown styling
- **Interactive States:** Proper hover, focus, active states with design system tokens

---

## Expected Behavior Summary

### Partner Mode - Orders Tab:
- ✅ See pending, registered, and in-review orders
- ✅ Registered orders have three-dot menu (⋮)
- ✅ Menu shows "Create delivery note" option
- ✅ Clicking navigates to Box Management

### Partner Mode - Returns Tab:
- ✅ See return deliveries
- ✅ Can mark returns as "Returned" via button/menu

### Store Staff Mode - Returns Tab:
- ✅ See return deliveries (read-only)
- ❌ Cannot mark returns as "Returned"
- ✅ No action buttons or menus visible

### Store Staff Mode - Shipments Tab:
- ✅ See new deliveries
- ✅ Can scan to receive
- ✅ Standard delivery receiving flow

---

## Quick Diagnostic

**To verify your current state, open browser console and type:**

```javascript
// Check current role
console.log('Current Role:', currentUserRole);

// Check current partner ID
console.log('Current Partner ID:', currentPartnerId);

// Check if you should see orders
console.log('Should show orders:', currentUserRole === 'partner' && currentPartnerId === '1');

// Check registered orders in data
console.log('Registered orders:', partnerOrders.filter(o => o.status === 'registered'));
```

**Expected Output for "Create Delivery Note" to work:**
- Current Role: `"partner"`
- Current Partner ID: `"1"`
- Should show orders: `true`
- Registered orders: Array with at least 3 orders

---

## Need Help?

If features still aren't showing:
1. Check browser console for errors
2. Verify you're in the correct mode (Partner vs Store Staff)
3. Verify the partner selection (Sellpy Operations vs Chinese partner)
4. Check that mock data exists for the scenario you're testing
5. Try hard refresh to clear any cached code (Ctrl+Shift+R / Cmd+Shift+R)
6. Run the diagnostic script above in browser console
