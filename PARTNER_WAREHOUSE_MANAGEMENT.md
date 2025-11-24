# Partner & Warehouse Management

## Overview

The Partner & Warehouse Management feature allows administrators to add, edit, and manage partners and their associated warehouses through an intuitive admin interface.

## Access

**Location:** Admin Settings → Portal Configuration → Partners & Warehouses

**Required Role:** Admin only

## Features

### 1. Partner Management

#### Add New Partner
- Click the **"Add Partner"** button in the header
- Fill in the required fields:
  - **Partner Name*** (e.g., "Sellpy Operations")
  - **Partner Code*** (e.g., "SELLPY") - automatically converted to uppercase
  - **Product Type** (White Label, Resell, Wholesale, Other)
- Click **"Add Partner"** to save

#### Edit Partner
- Click the **edit icon** (pencil) on any partner card
- Modify the partner details
- Click **"Update Partner"** to save changes

#### Delete Partner
- Click the **delete icon** (trash) on any partner card
- Confirm deletion
- **Note:** Partners with associated warehouses cannot be deleted. Delete all warehouses first.

### 2. Warehouse Management

#### Add New Warehouse
Two ways to add a warehouse:
1. Click the **"+" button** on a specific partner card (pre-selects that partner)
2. Click a partner to expand it, then add warehouses from there

Fill in the required fields:
- **Partner*** (select from dropdown)
- **Warehouse Name*** (e.g., "Stockholm Central Warehouse")
- **Warehouse Code*** (e.g., "SE-WH-001") - automatically converted to uppercase
- **Location*** (e.g., "Stockholm, Sweden")

Click **"Add Warehouse"** to save

#### Edit Warehouse
- Expand a partner by clicking on their card
- Click the **edit icon** on the warehouse you want to modify
- Modify warehouse details
- **Note:** Partner cannot be changed when editing a warehouse
- Click **"Update Warehouse"** to save changes

#### Delete Warehouse
- Expand a partner by clicking on their card
- Click the **delete icon** on the warehouse you want to remove
- Confirm deletion

### 3. View Warehouses
- Click on any partner card to expand/collapse and view their warehouses
- The warehouse count is displayed on each partner card
- Warehouses are shown in a nested list under their parent partner

## Data Structure

### Partner
```typescript
{
  id: string;              // Unique identifier
  name: string;            // Display name
  code: string;            // Short code (uppercase)
  productType?: string;    // 'white-label' | 'resell' | 'wholesale' | 'other'
}
```

### Warehouse
```typescript
{
  id: string;              // Unique identifier
  name: string;            // Display name
  code: string;            // Short code (uppercase)
  location: string;        // Geographic location
  partnerId: string;       // Foreign key to Partner
}
```

## Integration with Partner Settings

After adding a new partner, you can configure their specific business rules and policies:

1. Go to **Admin Settings → Partner Settings**
2. Select the brand, partner, and optionally a country
3. Configure partner-specific policies such as:
   - Commission rates
   - Return policies
   - Delivery handling rules
   - And more...

## Workflow Example

### Setting up a new partner with warehouses:

1. **Add the Partner**
   - Navigate to Portal Configuration → Partners & Warehouses
   - Click "Add Partner"
   - Enter: Name: "Nordic Textiles", Code: "NORDIC", Type: "Wholesale"
   - Save

2. **Add Warehouses**
   - Click the "+" on the Nordic Textiles card
   - Add first warehouse: "Oslo Distribution Center", Code: "NO-WH-001", Location: "Oslo, Norway"
   - Add second warehouse: "Stockholm Hub", Code: "SE-WH-002", Location: "Stockholm, Sweden"

3. **Configure Partner Settings** (Optional)
   - Go to Admin Settings → Partner Settings
   - Select Brand and the newly created partner
   - Configure business rules and policies specific to this partner

4. **Ready to Use**
   - The partner and warehouses are now available throughout the system
   - Partner Portal users can create orders selecting these warehouses
   - Store App can receive shipments from these warehouses

## System Impact

When you add or modify partners and warehouses:

- **Partner Portal**: New partners appear in partner selection dropdowns
- **Store App**: New warehouses appear when receiving deliveries
- **Order Creation**: Partner-warehouse combinations are available for order routing
- **Shipping Screen**: Deliveries can be tracked by partner and warehouse
- **Return Management**: Return orders can be routed to the correct warehouse

## Validation Rules

### Partner Validation
- Name is required and cannot be empty
- Code is required and cannot be empty
- Code is automatically converted to uppercase

### Warehouse Validation
- Partner must be selected
- Name is required and cannot be empty
- Code is required and cannot be empty
- Location is required and cannot be empty
- Code is automatically converted to uppercase

### Deletion Rules
- Partners with associated warehouses cannot be deleted
- Delete all warehouses first before removing a partner
- Warehouses can be deleted at any time

## Technical Implementation

### Files Created/Modified

1. **PartnerWarehouseManagementScreen.tsx** - Main management UI
2. **PortalConfigurationManager.tsx** - Added route for new screen
3. **PortalConfigurationLanding.tsx** - Added menu item
4. **useAppState.ts** - Added partners and warehouses state
5. **App.tsx** - Added handler functions and wired up props

### State Management

Partners and warehouses are managed through the central `useAppState` hook:

```typescript
const [partners, setPartners] = useState<Partner[]>(mockWarehousePartners);
const [warehouses, setWarehouses] = useState<Warehouse[]>(mockWarehouses);
```

### CRUD Operations

All operations (Create, Read, Update, Delete) are handled in-memory with state updates that propagate throughout the application.

## Future Enhancements

Potential improvements for future versions:

1. **Backend Integration**: Connect to a real database/API
2. **Search & Filter**: Add search and filtering capabilities for large lists
3. **Bulk Operations**: Import/export partners and warehouses via CSV
4. **Validation**: Additional validation rules (unique codes, etc.)
5. **Audit Trail**: Track who created/modified partners and warehouses
6. **Advanced Settings**: Partner-specific configurations in the management screen
7. **Relationships**: Visualize partner-warehouse relationships in a diagram
8. **Permissions**: Fine-grained permissions for different admin roles

## Support

For issues or questions about Partner & Warehouse Management, contact the development team or refer to the technical documentation.



