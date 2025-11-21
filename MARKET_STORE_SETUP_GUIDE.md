# Quick Setup Guide: Markets & Stores Management

## How to Access

### Step 1: Open Settings
1. Log in as an **Admin** user
2. Click the **Settings** icon (⚙️) in the navigation

### Step 2: Navigate to Portal Configuration
1. In the Settings menu, click **"Portal configuration"**

### Step 3: Find Markets & Stores
1. Scroll down to the **"System configuration"** section
2. Click the **"Markets & Stores"** card

## Quick Actions

### Enable a New Market
```
Settings → Portal Configuration → Markets & Stores → Markets tab → 
Find the market → Toggle "Store App Access" and/or "Partner Portal Access"
```

### Enable a New Store
```
Settings → Portal Configuration → Markets & Stores → Stores tab → 
Find the store → Toggle "Store App Access" and/or "Partner Portal Access"
```

### View All Stores for a Brand
```
Settings → Portal Configuration → Markets & Stores → 
Click "View Markets" on a brand → Click "View Stores" on a market
```

## Interface Overview

### Three Main Tabs
- **Brands**: Manage brand-level access
- **Markets**: Manage country/market access
- **Stores**: Manage individual store access

### Access Toggles
Each entity has two independent toggles:
- **Store App Access**: Controls if store staff can access
- **Partner Portal Access**: Controls if partners can access

### Navigation Features
- **Search bar**: Filter by name or code
- **Breadcrumbs**: Show current context (Brand > Market)
- **Quick navigation buttons**: "View Markets" and "View Stores"

## Access Control Hierarchy

```
Brand (WEEKDAY)
├── Store App: ✓ Enabled
├── Partner Portal: ✓ Enabled
└── Markets
    ├── Sweden
    │   ├── Store App: ✓ Enabled
    │   ├── Partner Portal: ✓ Enabled
    │   └── Stores
    │       ├── Drottninggatan 63 (SE0655)
    │       │   ├── Store App: ✓ Enabled
    │       │   └── Partner Portal: ✓ Enabled
    │       └── Södermalm Store (SE0656)
    │           ├── Store App: ✓ Enabled
    │           └── Partner Portal: ✗ Disabled
    └── Denmark
        ├── Store App: ✓ Enabled
        ├── Partner Portal: ✓ Enabled
        └── Stores...
```

## Common Use Cases

### 1. Launch a New Brand in the Partner Portal
1. Go to Markets & Stores
2. In Brands view, find the brand
3. Toggle "Partner Portal Access" to ON
4. Optionally navigate to Markets and Stores to enable specific ones

### 2. Temporarily Disable a Market
1. Go to Markets & Stores
2. Click the "Markets" tab
3. Find the market you want to disable
4. Toggle the appropriate access OFF

### 3. Add a New Store Location
1. Go to Markets & Stores
2. Click "Add New" button (currently placeholder)
3. Fill in store details
4. Set access permissions
5. Save

### 4. Audit Which Stores Have Partner Portal Access
1. Go to Markets & Stores
2. Click "Stores" tab
3. Use search to filter
4. Review the "Partner Portal Access" toggle status for each store

## Tips

- **Use Search**: Type to quickly find specific brands, markets, or stores
- **Filter by Brand**: Click "View Markets" on a brand to see only that brand's markets
- **Breadcrumb Navigation**: Click breadcrumbs to quickly go back to parent level
- **Visual Indicators**: 
  - Blue toggle = Enabled
  - Gray toggle = Disabled
- **Icons**: 
  - 🏢 Building = Brand
  - 🌍 Globe = Market
  - 🏪 Store = Store

## Permissions Required

- **Admin**: Full access to enable/disable and manage all entities
- **Brand Admin**: (Future) Manage only their brand's markets and stores
- **Store Staff**: Cannot access this feature
- **Partners**: Cannot access this feature

## Important Notes

⚠️ **Current Status**: This feature uses mock data for demonstration. When backend is connected, all changes will persist to the database.

⚠️ **No Undo**: Be careful when disabling access - there is currently no confirmation dialog (this will be added in a future update).

⚠️ **Add New**: The "Add New" button currently shows a placeholder. Full CRUD operations will be implemented with backend integration.

## Troubleshooting

### "I don't see Markets & Stores in Portal Configuration"
- Ensure you're logged in as an **Admin** user
- Only Admins can see the System Configuration section

### "The toggles don't seem to save"
- Currently, the feature uses local state (mock data)
- Changes will persist when backend API is integrated

### "I can't add new brands/markets/stores"
- This feature is planned but not yet implemented
- Use the "Add New" button for the placeholder UI

## Next Steps

After enabling markets and stores, you may want to:
1. **Configure user access** (Settings → Store User Access / Partner User Access)
2. **Set up pricing** (Portal Configuration → Pricing section)
3. **Configure attributes** (Portal Configuration → Attributes section)
4. **Invite users** to the newly enabled markets/stores

## Support

For questions or issues:
- Check the full documentation in `MARKET_STORE_MANAGEMENT.md`
- Review the technical implementation details
- Contact your system administrator for access issues



