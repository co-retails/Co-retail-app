# Agent Instructions & Project Architecture

This document serves as a guide for AI agents and developers to understand the project structure, routing architecture, and component patterns of the Digital Showroom MVP.

---

## ⚠️ MANDATORY DESIGN RULES - READ FIRST

**These rules are NON-NEGOTIABLE. Violating them will result in rejected code.**

### 1. **ALWAYS Use Semantic Color Tokens**

❌ **NEVER** use these:
```tsx
className="bg-white text-black border-gray-300"
className="bg-blue-500 text-red-600"
```

✅ **ALWAYS** use semantic tokens from `:root` in `index.css`:
```tsx
className="bg-surface text-on-surface border-outline-variant"
className="bg-primary text-on-primary"
className="bg-error text-on-error"
```

**Available Color Tokens:**
```css
/* Surfaces */
bg-surface                    /* Main background: #fff */
bg-surface-container          /* Cards: #fafaf7 */
bg-surface-container-high     /* Elevated: #f5f5f1 */
bg-surface-container-highest  /* Highest: #f0f0eb */
bg-surface-variant            /* Variant: #f0f0eb */

/* Primary (Dark charcoal) */
bg-primary                    /* #2c2c24 */
text-on-primary              /* #fff */
bg-primary-container         /* Beige: #f0f0eb */
text-on-primary-container    /* #2c2c24 */

/* Tertiary (Green) */
bg-tertiary                  /* #669f2a */
text-on-tertiary            /* #fff */
bg-tertiary-container       /* #e5f1d6 */
text-on-tertiary-container  /* #1d2e0b */

/* Error (Red) */
bg-error                    /* #e50010 */
text-on-error              /* #fff */
bg-error-container         /* #ffdad6 */
text-on-error-container    /* #410002 */

/* Success (Green) */
bg-success-container       /* #c6e6b3 */
text-on-success-container  /* #1d350d */

/* Text */
text-on-surface            /* Primary text: #2c2c24 */
text-on-surface-variant    /* Secondary text: #72726c */

/* Borders */
border-outline             /* Standard: #bebeb6 */
border-outline-variant     /* Subtle: #dcdcd7 */
```

### 2. **ALWAYS Use Typography Scale Classes**

❌ **NEVER** use these:
```tsx
className="text-2xl font-bold"
className="text-sm font-medium"
```

✅ **ALWAYS** use Material Design 3 typography scale:
```tsx
className="title-large text-on-surface"
className="body-medium text-on-surface-variant"
className="label-small text-on-surface-variant"
```

**Typography Scale:**
```css
/* Display - Hero text (rare) */
display-large / display-medium / display-small

/* Headline - Section headers */
headline-large / headline-medium / headline-small

/* Title - Subsection headers, card titles */
title-large    /* Top app bar titles */
title-medium   /* Card titles, list headers */
title-small    /* Smaller headers */

/* Body - Content text */
body-large     /* Emphasized body text */
body-medium    /* Standard body text */
body-small     /* Supporting text */

/* Label - UI component text */
label-large    /* Button text */
label-medium   /* Chip text */
label-small    /* Supporting labels, metadata */
```

### 3. **ALWAYS Follow Screen Structure Pattern**

Every screen MUST follow this structure:

```tsx
export default function MyScreen({ onBack }: MyScreenProps) {
  return (
    <div className="bg-surface min-h-screen flex flex-col">
      {/* 1. Top App Bar - Sticky */}
      <div className="sticky top-0 bg-surface z-10 border-b border-outline-variant">
        <div className="flex items-center h-16 px-4 md:px-6">
          <button onClick={onBack} className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-surface-container-high">
            <ArrowLeft className="w-6 h-6 text-on-surface" />
          </button>
          <h1 className="title-large text-on-surface flex-1">Screen Title</h1>
        </div>
      </div>
      
      {/* 2. Scrollable Content */}
      <div className="flex-1 pt-6 pb-24">
        {/* Content here */}
      </div>
      
      {/* 3. Bottom Actions (if needed) - Sticky */}
      <div className="sticky bottom-0 bg-surface border-t border-outline-variant p-4">
        <Button className="w-full bg-primary text-on-primary">
          Primary Action
        </Button>
      </div>
    </div>
  );
}
```

### 4. **NEVER Wrap Screens in ResponsiveLayout**

❌ **WRONG:**
```tsx
export default function MyScreen() {
  return (
    <ResponsiveLayout>  {/* NO! Already in App.tsx */}
      <div>Content</div>
    </ResponsiveLayout>
  );
}
```

✅ **CORRECT:**
```tsx
export default function MyScreen() {
  return (
    <div className="bg-surface min-h-screen">
      <div>Content</div>
    </div>
  );
}
```

### 5. **ALWAYS Use Proper Touch Targets (48px minimum)**

```tsx
{/* ✅ CORRECT - 48px minimum for mobile */}
<button className="min-h-[48px] min-w-[48px] flex items-center justify-center">
  <Icon className="w-6 h-6" />
</button>

{/* ❌ WRONG - Too small for touch */}
<button className="h-6 w-6">
  <Icon />
</button>
```

### 6. **Material Design 3 Component Patterns**

**Card with Icon:**
```tsx
<Card className="bg-surface-container border border-outline-variant">
  <CardContent className="p-4">
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 bg-primary-container rounded-[12px] flex items-center justify-center">
        <Icon className="w-6 h-6 text-on-primary-container" />
      </div>
      <div className="flex-1">
        <h3 className="title-medium text-on-surface">Title</h3>
        <p className="body-small text-on-surface-variant">Description</p>
      </div>
    </div>
  </CardContent>
</Card>
```

**List Item:**
```tsx
<div className="flex items-center gap-3 px-4 py-3 hover:bg-surface-container-high cursor-pointer">
  <div className="w-10 h-10 bg-surface-container-highest rounded-full flex items-center justify-center">
    <Icon className="w-5 h-5 text-on-surface-variant" />
  </div>
  <div className="flex-1">
    <div className="label-small text-on-surface-variant">Supporting text</div>
    <div className="body-medium text-on-surface">Primary text</div>
  </div>
</div>
```

**Button Variants:**
```tsx
{/* Primary (filled) - Use for main actions */}
<Button className="bg-primary text-on-primary hover:bg-primary/90">
  Primary Action
</Button>

{/* Outlined - Use for secondary actions */}
<Button variant="outline" className="border-outline text-on-surface">
  Secondary Action
</Button>

{/* Text - Use for tertiary actions */}
<Button variant="ghost" className="text-primary">
  Tertiary Action
</Button>
```

### 7. **Accessibility Requirements**

```tsx
{/* ✅ Always include aria-label for icon buttons */}
<button aria-label="Go back" onClick={onBack}>
  <ArrowLeft />
</button>

{/* ✅ Use proper semantic HTML */}
<h1 className="title-large">Title</h1>  {/* Not <div> */}

{/* ✅ Ensure keyboard navigation */}
<div 
  role="button" 
  tabIndex={0}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
>
  Clickable Item
</div>
```

### Quick Reference Checklist

Before submitting code, verify:
- [ ] All colors use semantic tokens (no `bg-white`, `text-black`, `bg-blue-500`)
- [ ] All typography uses scale classes (no `text-2xl`, `font-bold`)
- [ ] Screen follows standard structure (TopAppBar, content, bottom actions)
- [ ] No `ResponsiveLayout` wrapper in individual screens
- [ ] All touch targets are minimum 48px (`min-h-[48px]`)
- [ ] Proper accessibility attributes (`aria-label`, `role`, `tabIndex`)
- [ ] TypeScript types defined (no `any`)

---

## 1. Project Structure

```
src/
├── App.tsx                    # Main entry point with routing logic
├── components/                # All UI components and screens
│   ├── *Screen.tsx           # Full-page screen components
│   ├── ui/                   # Reusable UI primitives (shadcn/ui)
│   ├── ResponsiveLayout.tsx  # App shell wrapper
│   └── ResponsiveNavigation.tsx # Navigation bar/rail
├── hooks/                     # Custom React hooks
│   ├── useAppState.ts        # Central state management
│   └── useNavigationHandlers.ts # Navigation logic
├── data/                      # Mock data files
│   └── mockData.ts           # Primary mock data source
├── utils/                     # Utility functions
│   └── navigationConfig.ts   # Navigation configuration
├── guidelines/                # Design & development guidelines
│   └── Guidelines.md         # Material Design 3 guidelines
└── index.css                  # Global styles & design tokens
```

---

## 2. Routing Architecture

**CRITICAL**: This project uses a **custom routing system**, NOT `react-router-dom`.

### How Routing Works
1. **State-Based Routing**: The current screen is stored in `state.currentScreen` (type `Screen` in `src/hooks/useAppState.ts`).
2. **Navigation**: Use `setCurrentScreen` from `useAppState` or helper handlers from `useNavigationHandlers`.
   ```tsx
   // Example navigation
   setCurrentScreen('shipping');
   // Or use navigation handlers
   handleNavigateToShipping();
   ```
3. **Rendering**: `App.tsx` conditionally renders components based on `currentScreen` value.
4. **Lazy Loading**: Many screens use `React.lazy` and `Suspense` for code splitting.

### Adding a New Screen
1. **Create Component**: Add `MyNewScreen.tsx` in `src/components/`.
2. **Update Type**: Add `'my-new-screen'` to the `Screen` type in `src/hooks/useAppState.ts`.
3. **Import**: Add import in `App.tsx` (use `React.lazy` for secondary screens).
4. **Add Route**: Add rendering condition in `App.tsx`:
   ```tsx
   {currentScreen === 'my-new-screen' && <MyNewScreen {...props} />}
   ```
5. **Navigation Handler** (optional): Add navigation function in `useNavigationHandlers.ts` if needed.

---

## 3. User Roles & Views

**CRITICAL**: This application supports **three distinct user roles** with different interfaces, navigation, and data access.

### The Three Roles

#### 1. **Store Staff** (`'store-staff'`)
- **Purpose**: Store employees managing inventory, receiving deliveries, and handling returns
- **Home Screen**: `DeliveryHomeScreen` (home)
- **Navigation**: Home, Items, Scan, Shipping
- **Key Features**:
  - Receive deliveries from partners
  - Manage store inventory
  - Process returns to partners
  - Stock checking
  - Scan items

#### 2. **Partner** (`'partner'`)
- **Purpose**: Partner companies (suppliers/manufacturers) managing orders and shipments to stores
- **Home Screen**: `PartnerDashboard` (partner-dashboard)
- **Navigation**: Dashboard, Shipping (or Showroom for certain partners)
- **Key Features**:
  - Create orders for stores
  - Manage delivery notes and boxes
  - Track shipments to stores
  - Digital showroom (for manufacturing partners)
  - Quotation management

#### 3. **Buyer** (`'buyer'`)
- **Purpose**: Retail buyers browsing and ordering from partner showrooms
- **Home Screen**: `BuyerDashboard` (buyer-dashboard)
- **Navigation**: Dashboard, Browse, Quotations
- **Key Features**:
  - Browse partner showrooms
  - Request quotations
  - Manage purchase orders
  - Track shipments

### Role State Management

The current role is stored in `currentUserRole` from `useAppState`:

```tsx
const { currentUserRole, setCurrentUserRole } = useAppState();
// currentUserRole: 'store-staff' | 'partner' | 'buyer'
```

### Role-Specific Navigation

Navigation destinations change based on `currentUserRole`. See `src/utils/navigationConfig.ts`:

```tsx
// Store Staff Navigation
['Home', 'Items', 'Scan', 'Shipping']

// Partner Navigation (varies by partner type)
['Dashboard', 'Shipping'] // For Sellpy and most partners
['Dashboard', 'Showroom', 'Quotations'] // For manufacturing partners

// Buyer Navigation
['Dashboard', 'Browse', 'Quotations']
```

### Role-Specific Screens

Some screens are **exclusive to specific roles**:

**Store Staff Only:**
- `home` - DeliveryHomeScreen
- `items` - ItemsScreen
- `sellers` - SellersScreen
- `stock-check` - StockCheckScreen
- `partner-selection` - PartnerSelectionScreen
- `return-management` - ReturnManagementScreen

**Partner Only:**
- `partner-dashboard` - PartnerDashboard
- `order-creation` - OrderCreationScreen
- `box-management` - BoxManagementScreen
- `delivery-note-creation` - DeliveryNoteCreationScreen
- `showroom-dashboard` - PartnerShowroomDashboard (manufacturing partners)
- `partner-quotations` - PartnerQuotationsScreen

**Buyer Only:**
- `buyer-dashboard` - BuyerDashboard
- `buyer-wishlist` - BuyerWishlistScreen
- `buyer-quotations` - BuyerQuotationsScreen
- `buyer-orders` - BuyerPurchaseOrdersScreen
- `buyer-shipments` - BuyerShipmentsScreen

**Shared Screens:**
- `shipping` - ShippingScreen (different tabs/data based on role)
- `showroom-browse` - BuyerShowroomBrowse (buyers browse, partners manage)
- `scan` - ScanScreen (different contexts)

### Role Switching

Users can switch roles using the `RoleSwitcher` component:

```tsx
<RoleSwitcher
  currentRole={currentUserRole}
  onRoleChange={(role) => {
    setCurrentUserRole(role);
    // Navigate to appropriate home screen
    if (role === 'partner') setCurrentScreen('partner-dashboard');
    else if (role === 'buyer') setCurrentScreen('buyer-dashboard');
    else setCurrentScreen('home');
  }}
/>
```

### Data Filtering by Role

Many screens filter data based on `currentUserRole`:

```tsx
// Example: ShippingScreen shows different data
if (currentUserRole === 'partner') {
  // Show deliveries FROM this partner TO stores
  // Filter by currentPartnerWarehouseSelection.partnerId
} else if (currentUserRole === 'store-staff') {
  // Show deliveries TO this store FROM partners
  // Filter by currentStoreSelection.storeId
}
```

### Context Selectors by Role

Each role has its own context selector:

**Store Staff:**
```tsx
currentStoreSelection: {
  brandId: string;
  countryId: string;
  storeId: string;
}
```

**Partner:**
```tsx
currentPartnerWarehouseSelection: {
  partnerId: string;
  warehouseId: string;
}
```

**Buyer:**
```tsx
currentRetailerSelection: {
  brandId?: string;
  countryId?: string;
}
```

### Important: Role-Aware Component Development

When creating or modifying screens:

1. **Check which role(s) can access the screen**
   ```tsx
   // In App.tsx
   {currentScreen === 'my-screen' && currentUserRole === 'partner' && (
     <MyScreen {...props} />
   )}
   ```

2. **Pass userRole prop when behavior differs**
   ```tsx
   interface MyScreenProps {
     userRole?: 'store-staff' | 'partner' | 'buyer';
     // ...
   }
   ```

3. **Filter data appropriately**
   ```tsx
   const filteredData = currentUserRole === 'partner'
     ? data.filter(item => item.partnerId === currentPartnerWarehouseSelection.partnerId)
     : data.filter(item => item.storeId === currentStoreSelection.storeId);
   ```

4. **Use role-appropriate navigation**
   ```tsx
   const handleBack = () => {
     if (currentUserRole === 'partner') {
       setCurrentScreen('partner-dashboard');
     } else if (currentUserRole === 'buyer') {
       setCurrentScreen('buyer-dashboard');
     } else {
       setCurrentScreen('home');
     }
   };
   ```

---

## 4. State Management

The application uses `useAppState` hook for centralized state management.

### Key State Slices
- **Navigation**: `currentScreen`, `shippingInitialTab`
- **User Context**: `currentUserRole`, `currentStoreSelection`, `currentPartnerWarehouseSelection`
- **Data Collections**: `deliveries`, `partnerOrders`, `deliveryNotes`, `returnItems`, etc.
- **Selected Items**: `selectedDelivery`, `selectedPartner`, `selectedOrder`, etc.
- **UI State**: `isRoleSwitcherSheetOpen`, `showPostRegistrationDialog`, etc.

### Usage Pattern
```tsx
import { useAppState } from '../hooks/useAppState';

function MyScreen() {
  const {
    currentScreen,
    setCurrentScreen,
    deliveries,
    setDeliveries,
    selectedDelivery,
    setSelectedDelivery
  } = useAppState();
  
  // Use state as needed
}
```

---

## 5. Screen Structure & Component Patterns

### Standard Screen Structure

All screen components should follow this structure:

```tsx
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ArrowLeft, IconName } from 'lucide-react';

interface MyScreenProps {
  onBack: () => void;
  // Other props
}

// 1. Top App Bar Component (if needed)
function TopAppBar({ onBack, title }: { onBack: () => void; title: string }) {
  return (
    <div className="sticky top-0 bg-surface z-10 border-b border-outline-variant">
      <div className="flex items-center h-16 px-4 md:px-6">
        <button
          className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors mr-2"
          onClick={onBack}
          aria-label="Go back"
        >
          <ArrowLeft className="w-6 h-6 text-on-surface" />
        </button>
        <h1 className="title-large text-on-surface flex-1">{title}</h1>
      </div>
    </div>
  );
}

// 2. Main Screen Component
export default function MyScreen({ onBack }: MyScreenProps) {
  return (
    <div className="bg-surface min-h-screen flex flex-col">
      {/* Top App Bar */}
      <TopAppBar onBack={onBack} title="Screen Title" />
      
      {/* Scrollable Content */}
      <div className="flex-1 pt-6 pb-24">
        {/* Content goes here */}
      </div>
      
      {/* Fixed Bottom Actions (if needed) */}
      <div className="sticky bottom-0 bg-surface border-t border-outline-variant p-4">
        <Button>Primary Action</Button>
      </div>
    </div>
  );
}
```

### Key Patterns

1. **Top App Bar**: Sticky header with back button, title, and optional actions
2. **Content Area**: Scrollable main content with padding
3. **Bottom Actions**: Sticky bottom bar for primary actions (CTAs)
4. **Cards**: Use for grouping related information
5. **Lists**: Use for collections of items

---

## 6. Design System & Styling

### Material Design 3 Guidelines

This project follows **Material Design 3** principles. See `src/guidelines/Guidelines.md` for complete details.

### Color System

Use **semantic color tokens** from `index.css`, NOT hardcoded colors:

```css
/* Surface colors */
bg-surface                    /* Main background */
bg-surface-container          /* Cards, containers */
bg-surface-container-high     /* Elevated containers */
bg-surface-container-highest  /* Highest elevation */

/* Primary colors */
bg-primary                    /* Primary actions */
text-on-primary              /* Text on primary */
bg-primary-container         /* Tinted containers */
text-on-primary-container    /* Text on primary container */

/* Text colors */
text-on-surface              /* Primary text */
text-on-surface-variant      /* Secondary text */

/* Borders */
border-outline               /* Standard borders */
border-outline-variant       /* Subtle borders */

/* Status colors */
bg-error / text-error        /* Error states */
bg-success-container         /* Success states */
bg-tertiary                  /* Tertiary actions */
```

### Typography Scale

Use **semantic typography classes**:

```css
display-large / display-medium / display-small     /* Hero text */
headline-large / headline-medium / headline-small  /* Section headers */
title-large / title-medium / title-small           /* Subsection headers */
body-large / body-medium / body-small              /* Body text */
label-large / label-medium / label-small           /* Labels, buttons */
```

### Common Component Patterns

#### Card with Icon
```tsx
<Card className="bg-surface-container border border-outline-variant">
  <CardContent className="p-4">
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 bg-primary-container rounded-[12px] flex items-center justify-center">
        <Icon className="w-6 h-6 text-on-primary-container" />
      </div>
      <div className="flex-1">
        <h3 className="title-medium text-on-surface">Title</h3>
        <p className="body-small text-on-surface-variant">Description</p>
      </div>
    </div>
  </CardContent>
</Card>
```

#### List Item
```tsx
<div className="flex items-center gap-3 px-4 py-3 hover:bg-surface-container-high cursor-pointer">
  <div className="w-10 h-10 bg-surface-container-highest rounded-full flex items-center justify-center">
    <Icon className="w-5 h-5 text-on-surface-variant" />
  </div>
  <div className="flex-1">
    <div className="label-small text-on-surface-variant">Supporting text</div>
    <div className="body-medium text-on-surface">Primary text</div>
  </div>
</div>
```

#### Button Variants
```tsx
{/* Primary (filled) */}
<Button className="bg-primary text-on-primary hover:bg-primary/90">
  Primary Action
</Button>

{/* Outlined */}
<Button variant="outline" className="border-outline text-on-surface">
  Secondary Action
</Button>

{/* Text button */}
<Button variant="ghost" className="text-primary">
  Tertiary Action
</Button>
```

---

## 7. Common Errors to Avoid

### ❌ DO NOT:

1. **Wrap screens in ResponsiveLayout**
   ```tsx
   // ❌ WRONG - ResponsiveLayout is already in App.tsx
   export default function MyScreen() {
     return (
       <ResponsiveLayout>
         <div>Content</div>
       </ResponsiveLayout>
     );
   }
   ```
   
   ```tsx
   // ✅ CORRECT
   export default function MyScreen() {
     return (
       <div className="bg-surface min-h-screen">
         <div>Content</div>
       </div>
     );
   }
   ```

2. **Use hardcoded colors**
   ```tsx
   // ❌ WRONG
   <div className="bg-white text-black border-gray-300">
   
   // ✅ CORRECT
   <div className="bg-surface text-on-surface border-outline-variant">
   ```

3. **Use react-router-dom**
   ```tsx
   // ❌ WRONG
   import { useNavigate } from 'react-router-dom';
   
   // ✅ CORRECT
   import { useAppState } from '../hooks/useAppState';
   const { setCurrentScreen } = useAppState();
   ```

4. **Forget to add screen to Screen type**
   ```tsx
   // ❌ WRONG - Just adding to App.tsx
   {currentScreen === 'new-screen' && <NewScreen />}
   
   // ✅ CORRECT - First add to useAppState.ts
   export type Screen = 
     | 'home'
     | 'new-screen'  // Add here first
     | ...
   ```

5. **Use non-semantic typography**
   ```tsx
   // ❌ WRONG
   <h1 className="text-2xl font-bold">
   
   // ✅ CORRECT
   <h1 className="title-large text-on-surface">
   ```

6. **Use `w-full` with `flex-row` layouts**
   ```tsx
   // ❌ WRONG - Buttons will stack even in flex-row
   <div className="flex flex-row gap-3">
     <Button className="w-full md:w-auto">Save</Button>
     <Button className="w-full md:w-auto">Register</Button>
   </div>
   
   // ✅ CORRECT - Buttons stay side-by-side
   <div className="flex flex-row gap-3">
     <Button className="flex-1">Save</Button>
     <Button className="flex-1">Register</Button>
   </div>
   ```
   **Why**: `w-full` (width: 100%) overrides flexbox behavior. Use `flex-1` for equal space sharing.

7. **Claim completion without browser verification**
   ```tsx
   // ❌ WRONG
   "I've made the changes, the buttons should now be side-by-side"
   
   // ✅ CORRECT
   "I've made the changes. Let me verify in the browser at 375px width..."
   [Opens browser, navigates, resizes, takes screenshot]
   "Confirmed: buttons are now side-by-side on mobile. Screenshot shows..."
   ```

8. **Edit wrong component for user role**
   ```tsx
   // ❌ WRONG - Editing Store App when user meant Partner Portal
   DeliveryDetailsScreen.tsx  // Store App (receiving deliveries)
   
   // ✅ CORRECT - Verify which role/screen the user means
   DeliveryNoteCreationScreen.tsx  // Partner Portal (creating shipments)
   ```

### ✅ DO:

1. **Use semantic color tokens** from the design system
2. **Use typography scale classes** (title-large, body-medium, etc.)
3. **Follow the standard screen structure** (TopAppBar, content, bottom actions)
4. **Use state from useAppState** for navigation and data
5. **Add proper TypeScript types** for all props and state
6. **Include accessibility attributes** (aria-label, role, tabIndex)
7. **Make touch targets at least 48px** for mobile (min-h-[48px], min-w-[48px])
8. **Use `flex-1` for side-by-side buttons** in flex-row layouts
9. **Verify ALL UI changes in browser** at mobile viewport (375px) before claiming completion
10. **Confirm correct component** for user role (Store App vs Partner Portal vs Buyer)

---

## 8. Navigation Patterns

### Back Navigation
```tsx
// Always provide onBack prop
interface MyScreenProps {
  onBack: () => void;
}

// In App.tsx, handle back navigation
{currentScreen === 'my-screen' && (
  <MyScreen
    onBack={() => setCurrentScreen('previous-screen')}
  />
)}
```

### Forward Navigation
```tsx
// Use setCurrentScreen or navigation handlers
const handleNavigateToDetails = () => {
  setSelectedItem(item);
  setCurrentScreen('item-details');
};
```

### Tab-Based Navigation
```tsx
// Use shippingInitialTab for initial tab state
setShippingInitialTab('pending');
setCurrentScreen('shipping');
```

---

## 9. Data Flow Patterns

### Selecting Items for Detail Views
```tsx
// 1. Set the selected item in state
setSelectedDelivery(delivery);

// 2. Navigate to detail screen
setCurrentScreen('delivery-details');

// 3. In detail screen, use the selected item
const { selectedDelivery } = useAppState();
```

### Creating New Items
```tsx
// 1. Collect data in creation screen
const handleCreate = (newItem) => {
  // 2. Add to collection
  setDeliveries([...deliveries, newItem]);
  
  // 3. Navigate back or to confirmation
  setCurrentScreen('confirmation');
};
```

---

## 10. Key Files Reference

- **`src/App.tsx`**: Routing map and screen rendering
- **`src/hooks/useAppState.ts`**: State definitions and Screen type
- **`src/hooks/useNavigationHandlers.ts`**: Navigation helper functions
- **`src/components/ResponsiveLayout.tsx`**: Main app shell
- **`src/guidelines/Guidelines.md`**: Material Design 3 guidelines
- **`src/index.css`**: Design tokens and global styles
- **`src/data/mockData.ts`**: Mock data for development

---

## 11. Testing Your Screen

Before considering a screen complete:

1. ✅ Screen renders without errors
2. ✅ Back navigation works correctly
3. ✅ All interactive elements have proper touch targets (48px minimum)
4. ✅ Colors use semantic tokens (no hardcoded colors)
5. ✅ Typography uses scale classes
6. ✅ Responsive on mobile and desktop
7. ✅ Accessibility attributes present (aria-label, etc.)
8. ✅ Loading and empty states handled
9. ✅ TypeScript types are correct with no `any`
