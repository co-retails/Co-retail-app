# Markets & Stores Management - Architecture & Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Admin User                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      Settings Menu                               │
│                   (AdminSettingsSheet)                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓ Click "Portal configuration"
┌─────────────────────────────────────────────────────────────────┐
│                 PortalConfigurationManager                       │
│                    (Route Controller)                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓
                    ┌─────────┴─────────┐
                    │                   │
            Landing Page          Markets & Stores
                    │                   │
                    ↓                   ↓
      ┌─────────────────────┐  ┌──────────────────────┐
      │ System Configuration │  │ MarketStoreManagement│
      │      Section         │  │       Screen         │
      └─────────────────────┘  └──────────────────────┘
```

## Component Hierarchy

```
MarketStoreManagementScreen
├── Header
│   ├── Back Button
│   ├── Title & Description
│   └── Add New Button (placeholder)
│
├── View Mode Tabs
│   ├── Brands Tab
│   ├── Markets Tab
│   └── Stores Tab
│
├── Breadcrumb Navigation (conditional)
│   └── Brand > Market navigation
│
├── Search Bar
│   └── Real-time filter input
│
├── Content Area
│   ├── Brand Cards
│   │   ├── Brand Icon
│   │   ├── Brand Name
│   │   ├── Store App Toggle
│   │   ├── Partner Portal Toggle
│   │   └── View Markets Button
│   │
│   ├── Market Cards
│   │   ├── Market Icon
│   │   ├── Market Name
│   │   ├── Brand Badge
│   │   ├── Store App Toggle
│   │   ├── Partner Portal Toggle
│   │   └── View Stores Button
│   │
│   └── Store Cards
│       ├── Store Icon
│       ├── Store Name & Code
│       ├── Brand & Market Context
│       ├── Store App Toggle
│       └── Partner Portal Toggle
│
└── Add New Sheet (placeholder)
    └── Future CRUD implementation
```

## Data Flow

### Initial Load
```
Component Mount
      ↓
Initialize State
├── brands: Brand[]
├── countries: Country[]
├── stores: Store[]
├── viewMode: 'brands'
├── searchQuery: ''
├── selectedBrandId: null
└── selectedCountryId: null
      ↓
Render Brands View
```

### Toggle Access Flow
```
User Clicks Toggle
      ↓
Toggle Handler
├── Identify entity type (brand/market/store)
├── Identify field (enabledForStoreApp/enabledForPartnerPortal)
└── Identify entity id
      ↓
Update State (Optimistic)
├── Map through array
├── Find matching entity by id
├── Toggle the field
└── Return new array
      ↓
Re-render Component
      ↓
[Future: API Call]
├── POST /api/{entity-type}/{id}
├── Handle success
└── Handle error (rollback on failure)
```

### Navigation Flow
```
Brands View
      ↓ Click "View Markets"
Set selectedBrandId
Set viewMode: 'markets'
      ↓
Markets View (filtered by brand)
      ↓ Click "View Stores"
Set selectedCountryId
Set viewMode: 'stores'
      ↓
Stores View (filtered by brand & country)
      ↓ Click Breadcrumb
Clear selections as needed
Navigate back through hierarchy
```

### Search & Filter Flow
```
User Types in Search
      ↓
searchQuery State Updated
      ↓
Filter Functions Execute
├── filteredBrands = brands.filter(...)
├── filteredCountries = countries.filter(...)
└── filteredStores = stores.filter(...)
      ↓
Render Filtered Results
```

## State Management

### Component State Structure
```typescript
{
  // Data
  brands: Brand[]
  countries: Country[]
  stores: Store[]
  
  // View Control
  viewMode: 'brands' | 'countries' | 'stores'
  searchQuery: string
  selectedBrandId: string | null
  selectedCountryId: string | null
  
  // UI State
  isAddSheetOpen: boolean
  editMode: 'none' | 'brand' | 'country' | 'store'
}
```

### State Transitions
```
Initial State
├── viewMode: 'brands'
├── selectedBrandId: null
├── selectedCountryId: null
└── searchQuery: ''

User Clicks "View Markets" on a Brand
├── viewMode: 'countries'
├── selectedBrandId: '{brandId}'
├── selectedCountryId: null
└── searchQuery: '' (preserved or cleared)

User Clicks "View Stores" on a Market
├── viewMode: 'stores'
├── selectedBrandId: '{brandId}' (inherited)
├── selectedCountryId: '{countryId}'
└── searchQuery: '' (preserved or cleared)

User Clicks Breadcrumb "All Brands"
├── viewMode: 'brands'
├── selectedBrandId: null
├── selectedCountryId: null
└── searchQuery: ''
```

## API Integration (Future)

### Planned API Endpoints

```
GET /api/config/markets-stores
Response:
{
  brands: Brand[],
  countries: Country[],
  stores: Store[]
}

PUT /api/brands/{id}
Request: { enabledForStoreApp: boolean, enabledForPartnerPortal: boolean }
Response: { success: boolean, brand: Brand }

PUT /api/countries/{id}
Request: { enabledForStoreApp: boolean, enabledForPartnerPortal: boolean }
Response: { success: boolean, country: Country }

PUT /api/stores/{id}
Request: { enabledForStoreApp: boolean, enabledForPartnerPortal: boolean }
Response: { success: boolean, store: Store }

POST /api/brands
Request: { name: string, enabledForStoreApp: boolean, enabledForPartnerPortal: boolean }
Response: { success: boolean, brand: Brand }
```

### Error Handling Flow
```
User Toggles Access
      ↓
Optimistic State Update (UI immediately reflects change)
      ↓
API Call
      ├─ Success
      │   └─ Keep optimistic state
      └─ Error
          ├─ Rollback state to previous value
          ├─ Show error toast/notification
          └─ Log error for debugging
```

## Filtering Logic

### Brand Filtering
```javascript
filteredBrands = brands.filter(brand =>
  brand.name.toLowerCase().includes(searchQuery.toLowerCase())
)
```

### Country Filtering
```javascript
filteredCountries = countries.filter(country => {
  const matchesSearch = country.name.toLowerCase().includes(searchQuery.toLowerCase())
  const matchesBrand = !selectedBrandId || country.brandId === selectedBrandId
  return matchesSearch && matchesBrand
})
```

### Store Filtering
```javascript
filteredStores = stores.filter(store => {
  const matchesSearch = 
    store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    store.code.toLowerCase().includes(searchQuery.toLowerCase())
  const matchesBrand = !selectedBrandId || store.brandId === selectedBrandId
  const matchesCountry = !selectedCountryId || store.countryId === selectedCountryId
  return matchesSearch && matchesBrand && matchesCountry
})
```

## Security Model

### Current (UI Level)
```
User Authentication
      ↓
Check User Role
      ├─ Admin → Full Access ✅
      └─ Other → No Access ❌
      ↓
Render Admin Settings
      ↓
Check Role Again in Portal Config
      ├─ Admin → Show System Configuration ✅
      └─ Other → Hide Section ❌
```

### Future (API Level)
```
API Request
      ↓
Authenticate Request (JWT/Session)
      ↓
Authorize User Role
      ├─ Admin → Proceed ✅
      ├─ Brand Admin → Limited Access (future)
      └─ Other → 403 Forbidden ❌
      ↓
Validate Request Data
      ↓
Process Request
      ↓
Audit Log Entry
      ↓
Return Response
```

## Responsive Design Breakpoints

```
Mobile (< 640px)
├── Bottom sheet for add/edit
├── Full-width cards
├── Stacked toggle switches
└── Single column layout

Tablet (640px - 1024px)
├── Right panel for add/edit
├── Two-column card grid
├── Inline toggle switches
└── Compact navigation

Desktop (> 1024px)
├── Right panel for add/edit
├── Three-column card grid
├── Inline toggle switches
└── Full navigation with breadcrumbs
```

## Performance Considerations

### Current Performance
```
Rendering
├── Small dataset (< 100 entities per type)
├── No virtualization needed
└── Fast filtering with native methods

State Updates
├── Immutable updates (spread operator)
├── No unnecessary re-renders
└── Efficient React reconciliation
```

### Future Optimizations (if needed)
```
For Large Datasets (1000+ entities)
├── Virtual scrolling (react-window)
├── Pagination (server-side)
├── Debounced search
├── Memoized filter functions
└── React.memo on card components
```

## Integration Points

### Connects To:
- **PortalConfigurationManager**: Route handling
- **PortalConfigurationLanding**: Entry point card
- **AdminSettingsSheet**: Navigation source
- **UI Components**: Card, Button, Badge, Input, Sheet, etc.

### Used By:
- Admin users only

### Future Connections:
- **User Access Management**: Link users to enabled stores
- **Partner Settings**: Link partners to enabled stores
- **Audit Log**: Track changes made in this screen
- **Analytics**: Monitor access patterns

## Testing Strategy

### Unit Tests (Future)
```
Component Tests
├── Renders correctly with mock data
├── Toggle switches update state
├── Search filters results
├── Navigation works correctly
└── Breadcrumbs show correct context

State Management Tests
├── Initial state is correct
├── Toggle handler updates correctly
├── Filter functions work correctly
└── Navigation updates state correctly
```

### Integration Tests (Future)
```
API Integration Tests
├── Fetches data correctly
├── Updates persist to backend
├── Error handling works
└── Optimistic updates rollback on error
```

### E2E Tests (Future)
```
User Flow Tests
├── Admin can access feature
├── Admin can toggle access
├── Admin can navigate hierarchy
├── Admin can search entities
└── Non-admin cannot access
```

## Deployment Architecture

```
Frontend (React + Vite)
├── MarketStoreManagementScreen component
├── Bundle size: ~15KB gzipped
└── Assets: Icons, styles

[Future] Backend API
├── Node.js / Express (or similar)
├── REST API endpoints
├── Database (PostgreSQL / MongoDB)
└── Redis cache for frequent queries

[Future] CDN
├── Static assets
└── Edge caching for config data
```

## Monitoring & Analytics (Future)

### Metrics to Track
```
Usage Metrics
├── Number of toggle changes per day
├── Most frequently accessed brands/markets
├── Time spent on screen
└── Search query patterns

Performance Metrics
├── Component render time
├── API response time
├── Cache hit rate
└── Error rate

Business Metrics
├── Number of enabled brands
├── Number of enabled markets per brand
├── Number of enabled stores
└── Access configuration changes over time
```

---

**Document Version**: 1.0  
**Last Updated**: November 21, 2025  
**Maintained By**: Development Team




