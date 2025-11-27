# Screenshots for Order and Delivery Flows Documentation

This folder contains screenshots for the backend implementation guide. Please add your screenshots here following the naming convention below.

## Naming Convention

- **Sellpy screenshots**: `sellpy-XX-description.png` (where XX is a two-digit number, 01-13)
- **Thrifted screenshots**: `thrifted-XX-description.png` (where XX is a two-digit number, 01-14)

## Screenshot Checklist

### Sellpy Flow Screenshots (13 total)

1. **sellpy-01-orders-list.png**
   - Screen: `ShippingScreen.tsx` - "Orders" tab
   - Show: Pending Sellpy orders list

2. **sellpy-02-order-details.png**
   - Screen: `OrderDetailsScreen.tsx`
   - Show: Order details with items needing retailer IDs

3. **sellpy-03-items-with-errors.png**
   - Screen: `OrderDetailsScreen.tsx`
   - Show: Items with error status and edit functionality

4. **sellpy-04-retailer-id-scan.png**
   - Screen: `RetailerIdScanScreen.tsx`
   - Show: Two-step scanning process (Partner QR → Retailer ID)

5. **sellpy-05-order-progress.png**
   - Screen: `OrderDetailsScreen.tsx`
   - Show: Progress of items with retailer IDs

6. **sellpy-06-register-order.png**
   - Screen: `OrderDetailsScreen.tsx`
   - Show: "Register Order" button and completion state

7. **sellpy-07-post-registration-dialog.png**
   - Screen: Post-registration dialog
   - Show: Dialog with options to create delivery note or view order list

8. **sellpy-08-delivery-note-creation.png**
   - Screen: `DeliveryNoteCreationScreen.tsx`
   - Show: Box management and item assignment

9. **sellpy-09-box-management.png**
   - Screen: `BoxManagementScreen.tsx`
   - Show: Alternative view for box management

10. **sellpy-10-shipments-tab.png**
    - Screen: `ShippingScreen.tsx` - "Shipments" tab
    - Show: In-transit deliveries

11. **sellpy-11-delivery-note-details.png**
    - Screen: `OrderShipmentDetailsScreen.tsx`
    - Show: Delivery note details

12. **sellpy-12-inbound-tab.png**
    - Screen: `ShippingScreen.tsx` - "Inbound" tab
    - Show: Inbound deliveries for store staff

13. **sellpy-13-receive-delivery.png**
    - Screen: `ReceiveDeliveryScreen.tsx`
    - Show: Scanning interface and box lists (Not scanned / Scanned tabs)

### Thrifted Flow Screenshots (14 total)

1. **thrifted-01-receiver-selection.png**
   - Screen: `ThriftedOrderCreationScreen.tsx` - Step 1
   - Show: Receiver selection (Brand → Country → Store)

2. **thrifted-02-method-selection.png**
   - Screen: `ThriftedOrderCreationScreen.tsx` - Step 2
   - Show: Method selection (Manual Entry or Bulk Upload)

3. **thrifted-03-manual-entry.png**
   - Screen: `ThriftedOrderCreationScreen.tsx` - Step 3
   - Show: Manual item entry with validated dropdowns

4. **thrifted-04-bulk-upload.png**
   - Screen: `ThriftedOrderCreationScreen.tsx` - Step 3
   - Show: CSV bulk upload with validation

5. **thrifted-05-order-details.png**
   - Screen: `OrderShipmentDetailsScreen.tsx`
   - Show: Order details with validation filter

6. **thrifted-06-validation-filter.png**
   - Screen: `OrderShipmentDetailsScreen.tsx`
   - Show: Validation filter (All / Missing/Errors / Valid)

7. **thrifted-07-edit-item.png**
   - Screen: `OrderShipmentDetailsScreen.tsx`
   - Show: Edit item dialog with validation

8. **thrifted-08-validation-errors.png**
   - Screen: `ThriftedOrderCreationScreen.tsx`
   - Show: Validation error display

9. **thrifted-09-delivery-note-creation.png**
   - Screen: `DeliveryNoteCreationScreen.tsx`
   - Show: Box management and item assignment

10. **thrifted-10-box-management.png**
    - Screen: `BoxManagementScreen.tsx`
    - Show: Alternative view for box management

11. **thrifted-11-shipments-tab.png**
    - Screen: `ShippingScreen.tsx` - "Shipments" tab
    - Show: In-transit deliveries

12. **thrifted-12-delivery-note-details.png**
    - Screen: `OrderShipmentDetailsScreen.tsx`
    - Show: Delivery note details

13. **thrifted-13-inbound-tab.png**
    - Screen: `ShippingScreen.tsx` - "Inbound" tab
    - Show: Inbound deliveries for store staff

14. **thrifted-14-receive-delivery.png**
    - Screen: `ReceiveDeliveryScreen.tsx`
    - Show: Scanning interface and box lists (Not scanned / Scanned tabs)

## Tips for Taking Screenshots

1. **Use consistent resolution**: Recommended 1920x1080 or higher
2. **Capture full screen context**: Show relevant UI elements and navigation
3. **Highlight important elements**: Use annotations or arrows if needed
4. **Use PNG format**: Better quality for documentation
5. **Name files exactly**: Match the exact filename listed above
6. **Test image paths**: After adding screenshots, verify they display correctly in the markdown document

## How to Add Screenshots

1. Take screenshots using your preferred tool (e.g., Cmd+Shift+4 on Mac, Snipping Tool on Windows)
2. Save them in this `screenshots/` folder with the exact filenames listed above
3. The markdown document will automatically reference them using relative paths
4. Verify the images display correctly by opening the markdown file in a markdown viewer




