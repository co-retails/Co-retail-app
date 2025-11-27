# Markets & Stores Management

## Overview

The Markets & Stores Management feature allows administrators to enable and configure brands, markets (countries), and stores for both the Store App and Partner Portal.

## Location

The Markets & Stores Management screen is accessible from:
- **Settings** → **Portal Configuration** → **System Configuration** → **Markets & Stores**

This feature is only accessible to users with **Admin** role.

## Features

### 1. Multi-Level View
The interface provides three hierarchical views:
- **Brands**: Top-level brand management
- **Markets**: Country/market management within brands
- **Stores**: Individual store management within markets

### 2. Hierarchical Navigation
- Navigate from Brands → Markets → Stores
- Breadcrumb navigation shows current context
- Filters automatically apply based on parent selections

### 3. Access Control Toggles
For each brand, market, and store, you can independently control:
- **Store App Access**: Enable/disable access for store staff
- **Partner Portal Access**: Enable/disable access for partners

### 4. Search Functionality
- Search across all levels (brands, markets, stores)
- Real-time filtering as you type
- Search by name or store code

### 5. Visual Hierarchy
Each level has distinct visual indicators:
- **Brands**: Building icon with primary color
- **Markets**: Globe icon with secondary color
- **Stores**: Store icon with tertiary color

## User Interface

### Brands View
- Lists all brands in the system
- Shows access toggles for Store App and Partner Portal
- "View Markets" button to navigate to associated countries

### Markets View
- Lists countries/markets, optionally filtered by selected brand
- Shows which brand each market belongs to
- Access toggles for both apps
- "View Stores" button to navigate to stores in that market

### Stores View
- Lists individual stores, optionally filtered by brand and/or country
- Displays store code, brand, and country information
- Access toggles for both apps
- Most granular level of control

## Access Patterns

### Typical Workflows

#### Enable a new market for a brand:
1. Navigate to Settings → Portal Configuration
2. Click on "Markets & Stores" under System Configuration
3. Click on the "Markets" tab
4. Find the market you want to enable
5. Toggle "Store App Access" and/or "Partner Portal Access"

#### Enable a new store:
1. Navigate to Markets & Stores
2. Click on "Stores" tab
3. (Optional) Filter by brand or navigate through brand → market hierarchy
4. Find the store you want to enable
5. Toggle access for the appropriate apps

#### View all stores for a specific brand:
1. Navigate to Markets & Stores
2. In the Brands view, click "View Markets" for the desired brand
3. Click "Stores" tab or click "View Stores" from a specific market

## Data Model

### Brand
```typescript
interface Brand {
  id: string;
  name: string;
  enabled: boolean;
  enabledForStoreApp: boolean;
  enabledForPartnerPortal: boolean;
}
```

### Country (Market)
```typescript
interface Country {
  id: string;
  name: string;
  brandId: string;
  enabled: boolean;
  enabledForStoreApp: boolean;
  enabledForPartnerPortal: boolean;
}
```

### Store
```typescript
interface Store {
  id: string;
  name: string;
  code: string;
  countryId: string;
  brandId: string;
  enabled: boolean;
  enabledForStoreApp: boolean;
  enabledForPartnerPortal: boolean;
}
```

## Future Enhancements

### Planned Features
1. **Add New Entities**: Currently placeholder, will allow adding new brands, markets, and stores
2. **Bulk Operations**: Enable/disable multiple entities at once
3. **Import/Export**: CSV import/export for bulk updates
4. **History/Audit**: Track changes to access settings
5. **Validation Rules**: Warn when disabling critical entities
6. **Dependencies**: Auto-disable child entities when parent is disabled
7. **Permissions**: More granular role-based permissions beyond just Admin

### Backend Integration
The current implementation uses mock data. When integrated with a backend:
- API endpoints needed:
  - `GET /api/brands` - List all brands with access settings
  - `PUT /api/brands/:id` - Update brand access settings
  - `GET /api/countries` - List all countries/markets
  - `PUT /api/countries/:id` - Update market access settings
  - `GET /api/stores` - List all stores
  - `PUT /api/stores/:id` - Update store access settings
  - `POST /api/brands` - Create new brand
  - `POST /api/countries` - Create new market
  - `POST /api/stores` - Create new store

## Technical Implementation

### Components
- **MarketStoreManagementScreen.tsx**: Main component with state management and UI
- **PortalConfigurationLanding.tsx**: Updated to include Markets & Stores card
- **PortalConfigurationManager.tsx**: Updated routing to include new screen

### State Management
- Local component state for current view mode, filters, and selections
- Toggle functions update state optimistically (would include API calls in production)

### Responsive Design
- Full mobile support with touch-friendly toggles
- Sheet/drawer pattern for mobile navigation
- Desktop-optimized card grid layouts

## Permissions

### Admin Only
This feature is restricted to users with Admin role because:
- System-wide impact of enabling/disabling brands or markets
- Affects access control for all users across the platform
- Critical business configuration

### Future Granular Permissions
Potential future roles:
- **Brand Manager**: Manage markets and stores within their brand
- **Market Manager**: Manage stores within their market
- **View Only**: Read-only access to configuration

## Testing

To test the new feature:
1. Log in as an Admin user
2. Open Settings (gear icon)
3. Click "Portal configuration"
4. Scroll to "System configuration" section
5. Click "Markets & Stores"
6. Test toggling access for different brands, markets, and stores
7. Test navigation between views
8. Test search functionality
9. Test breadcrumb navigation

## Notes

- Changes are currently stored in component state only
- In production, changes would be persisted to backend via API
- Consider adding confirmation dialogs for disabling entities with active users
- May want to show counts of affected users/partners when changing access




