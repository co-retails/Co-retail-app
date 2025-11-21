# User Access Management Implementation

This document describes the user access management features added to the Digital Showroom MVP application.

## Overview

Two new screens have been added to allow administrators and managers to view user access across the store app and partner portal:

1. **Store User Access Management** - View users with access to store apps
2. **Partner User Access Management** - View users with access to partner portals

## Features

### Store User Access Screen

**Purpose**: Allow managers to view store staff and store manager accounts, with details about their store access.

**Access Levels**:
- **Admin**: Can view all store users across all brands
- **Brand Admin**: Can view store users from their own brand only
- **Store Manager**: No access to this screen

**Features**:
- Search by name, email, or store
- Filter by brand, country, role, and status
- View user details including:
  - Name and email
  - Role (Store Manager or Store Staff)
  - Store access (which stores they can access)
  - Last active timestamp
  - Active/inactive status
- Grouped display by brand and country
- Statistics showing total managers, staff, and active users
- Responsive design:
  - **Desktop (≥1024px)**: Table view with columns for efficient data scanning
  - **Mobile/Tablet (<1024px)**: Card-based layout for better mobile experience

**Navigation**: Settings → Access → Store user access

### Partner User Access Screen

**Purpose**: Allow partners and admins to view which accounts have access to the partner portal.

**Access Levels**:
- **Admin**: Can view all partner users across all partners and brands
- **Brand Admin**: Can view partner users from partners that work with their brand
- **Partner Admin**: Can view users from their own partner only

**Features**:
- Search by name, email, or partner
- Filter by partner, brand (admin only), and status
- View user details including:
  - Name and email
  - Partner affiliation
  - Brand access (which brands they work with)
  - Last active timestamp
  - Active/inactive status
- Grouped display by partner
- Statistics showing total partners, active, and inactive users
- Responsive design:
  - **Desktop (≥1024px)**: Table view with columns for efficient data scanning
  - **Mobile/Tablet (<1024px)**: Card-based layout for better mobile experience

**Navigation**: Settings → Access → Partner user access

## Technical Implementation

### New Files

1. **`src/data/userAccessMockData.ts`**
   - Mock data for store and partner user access
   - Type definitions for `StoreUserAccess` and `PartnerUserAccess`
   - Sample users across multiple brands, partners, and stores

2. **`src/components/StoreUserAccessScreen.tsx`**
   - Store user access management interface
   - Filtering, searching, and grouping logic
   - Role-based access control

3. **`src/components/PartnerUserAccessScreen.tsx`**
   - Partner user access management interface
   - Multi-level access control for admins, brand admins, and partner admins
   - Brand-based filtering

### Modified Files

1. **`src/hooks/useAppState.ts`**
   - Added `'store-user-access'` and `'partner-user-access'` screen types

2. **`src/hooks/useNavigationHandlers.ts`**
   - Added navigation handlers for the new screens
   - Updated back navigation logic

3. **`src/components/AdminSettingsSheet.tsx`**
   - Added menu items for Store user access and Partner user access
   - Added handler props for navigation
   - Restricted visibility to Brand Admin and above

4. **`src/App.tsx`**
   - Imported new screens with lazy loading
   - Added routes for both screens
   - Connected navigation handlers
   - Updated screen visibility logic

## Design Compliance

The implementation follows:

- **Material Design 3 (M3) Guidelines**:
  - Proper use of surface colors and elevation
  - Material Design typography scale
  - Appropriate spacing and padding
  - Touch target sizes (min 48px)
  - State layers for interactive elements

- **Store Lens Design System**:
  - Consistent color tokens (primary, secondary, tertiary containers)
  - Typography system (headline, title, body, label classes)
  - Component patterns (Cards, Badges, Buttons, Tables, etc.)
  - Responsive breakpoints
  - Sheet/modal patterns

- **Responsive Design**:
  - Mobile-first approach with adaptive layouts
  - **Desktop view (≥1024px)**: 
    - Clean table layout with header columns
    - Hover states on rows
    - Efficient data scanning
    - Sortable columns (future enhancement)
  - **Mobile/Tablet view (<1024px)**:
    - Card-based layout with complete details
    - Touch-friendly tap targets
    - Grouped content with clear hierarchy
  - Sticky headers for better UX
  - Smooth transitions between breakpoints

## Data Structure

### StoreUserAccess Interface
```typescript
interface StoreUserAccess {
  id: string;
  name: string;
  email: string;
  role: 'store-staff' | 'store-manager';
  brandId: string;
  brandName: string;
  countryId: string;
  countryName: string;
  storeIds: string[];      // Array of store IDs
  storeNames: string[];    // Corresponding store names
  storeCodes: string[];    // Corresponding store codes
  lastActive?: string;
  status: 'active' | 'inactive';
}
```

### PartnerUserAccess Interface
```typescript
interface PartnerUserAccess {
  id: string;
  name: string;
  email: string;
  role: 'partner-user';
  partnerId: string;
  partnerName: string;
  brandIds: string[];      // Brands this partner has access to
  brandNames: string[];
  lastActive?: string;
  status: 'active' | 'inactive';
}
```

## Mock Data

The implementation includes comprehensive mock data:
- **11 store users** across different brands, countries, and stores
- **9 partner users** across 3 different partners (Sellpy, Thrifted, Shenzhen Fashion Manufacturing)
- Examples of multi-store managers
- Examples of inactive users
- Realistic last active timestamps

## Usage

### For Admins
1. Click the settings icon in the top navigation
2. Navigate to "Access" section
3. Choose either "Store user access" or "Partner user access"
4. Use filters and search to find specific users
5. View comprehensive user details grouped by brand/partner

### For Brand Admins
- Can only see users from their own brand
- Brand filter is pre-selected and locked to their brand

### For Partner Admins
- Can only see users from their own partner
- Partner filter is pre-selected and locked to their partner

## Future Enhancements

Potential improvements that could be added:
1. User detail modal with edit capabilities
2. Add/remove user functionality
3. Permission management
4. User invitation system
5. Activity logs and audit trail
6. Bulk operations (export, status updates)
7. Email notifications
8. Integration with identity management systems

