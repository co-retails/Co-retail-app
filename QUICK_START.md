# Quick Start Guide for Agents

**Read this FIRST, then refer to detailed docs as needed.**

---

## 🚨 Critical Rules (Non-Negotiable)

1. **Colors**: ONLY use semantic tokens (`bg-surface`, `text-on-surface`, `bg-primary`) - NEVER `bg-white`, `text-black`, `bg-blue-500`
2. **Typography**: ONLY use M3 scale (`title-large`, `body-medium`, `label-small`) - NEVER `text-2xl`, `font-bold`
3. **Layout**: NEVER wrap screens in `<ResponsiveLayout>` (already in App.tsx)
4. **Routing**: Use `setCurrentScreen('screen-name')` - NEVER react-router-dom
5. **Touch Targets**: Minimum 48px (`min-h-[48px] min-w-[48px]`)
6. **Flexbox + Width**: NEVER use `w-full` with `flex-row` - use `flex-1` instead (see Flexbox Pitfalls below)
7. **Browser Verification**: ALWAYS verify UI changes in browser at mobile viewport (375px) before claiming completion

---

## 📁 Project Structure

```
src/
├── App.tsx                    # Routing (conditional rendering based on currentScreen)
├── components/*Screen.tsx     # Full-page screens
├── hooks/useAppState.ts       # State management + Screen type
├── data/mockData.ts           # Mock data
└── index.css                  # Design tokens
```

---

## 🎨 Design Tokens (Copy-Paste Ready)

### Colors
```tsx
// Surfaces
bg-surface                    // Main background
bg-surface-container          // Cards
bg-surface-container-high     // Elevated

// Primary (dark charcoal)
bg-primary text-on-primary
bg-primary-container text-on-primary-container

// Status
bg-error text-on-error
bg-success-container text-on-success-container
bg-tertiary text-on-tertiary

// Text
text-on-surface              // Primary text
text-on-surface-variant      // Secondary text

// Borders
border-outline border-outline-variant
```

### Typography
```tsx
title-large      // Top app bar titles
title-medium     // Card titles
body-medium      // Standard text
body-small       // Supporting text
label-small      // Metadata, labels
```

---

## 🏗️ Screen Template

```tsx
export default function MyScreen({ onBack }: MyScreenProps) {
  return (
    <div className="bg-surface min-h-screen flex flex-col">
      {/* Top App Bar */}
      <div className="sticky top-0 bg-surface z-10 border-b border-outline-variant">
        <div className="flex items-center h-16 px-4 md:px-6">
          <button onClick={onBack} className="w-12 h-12 rounded-full hover:bg-surface-container-high">
            <ArrowLeft className="w-6 h-6 text-on-surface" />
          </button>
          <h1 className="title-large text-on-surface flex-1">Title</h1>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 pt-6 pb-24">
        {/* Your content */}
      </div>
      
      {/* Bottom Actions (optional) */}
      <div className="sticky bottom-0 bg-surface border-t border-outline-variant p-4">
        <Button className="bg-primary text-on-primary">Action</Button>
      </div>
    </div>
  );
}
```

---

## 🔀 Routing

### Add New Screen
1. Add to `Screen` type in `useAppState.ts`: `| 'my-screen'`
2. Import in `App.tsx`: `import MyScreen from './components/MyScreen'`
3. Add route: `{currentScreen === 'my-screen' && <MyScreen onBack={...} />}`

### Navigate
```tsx
const { setCurrentScreen } = useAppState();
setCurrentScreen('my-screen');
```

---

## 👥 User Roles

Three roles with different UIs:

- **`store-staff`**: Home → DeliveryHomeScreen, Nav: Home/Items/Scan/Shipping
- **`partner`**: Home → PartnerDashboard, Nav: Dashboard/Shipping
- **`buyer`**: Home → BuyerDashboard, Nav: Dashboard/Browse/Quotations

Filter data by role:
```tsx
const { currentUserRole, currentStoreSelection, currentPartnerWarehouseSelection } = useAppState();

if (currentUserRole === 'partner') {
  // Filter by currentPartnerWarehouseSelection.partnerId
} else if (currentUserRole === 'store-staff') {
  // Filter by currentStoreSelection.storeId
}
```

---

## 📦 Common Patterns

**Card:**
```tsx
<Card className="bg-surface-container border border-outline-variant">
  <CardContent className="p-4">
    <div className="flex gap-4">
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
    <div className="label-small text-on-surface-variant">Supporting</div>
    <div className="body-medium text-on-surface">Primary</div>
  </div>
</div>
```

---

## ⚠️ Flexbox Pitfalls (Common Mistakes)

### Issue: `w-full` Breaks `flex-row` Layouts

**Problem**: Using `w-full` (width: 100%) on flex children forces them to stack even in `flex-row`.

❌ **WRONG** - Buttons stack on mobile:
```tsx
<div className="flex flex-row gap-3">
  <Button className="w-full md:w-auto">Save</Button>
  <Button className="w-full md:w-auto">Register</Button>
</div>
```

✅ **CORRECT** - Buttons side-by-side on mobile:
```tsx
<div className="flex flex-row gap-3">
  <Button className="flex-1">Save</Button>
  <Button className="flex-1">Register</Button>
</div>
```

**Why**: `w-full` (width: 100%) overrides flexbox behavior. Use `flex-1` to let items share space equally.

### Mobile Button Layouts

**Two buttons side-by-side:**
```tsx
<div className="flex flex-row gap-3">
  <Button variant="outline" className="flex-1">Cancel</Button>
  <Button className="flex-1 bg-primary text-on-primary">Confirm</Button>
</div>
```

**Single full-width button:**
```tsx
<Button className="w-full bg-primary text-on-primary">
  Primary Action
</Button>
```

---

## 🧪 Browser Verification (MANDATORY)

**NEVER claim completion without browser verification.**

### Process:
1. **Make code changes**
2. **Check dev server** is running (`npm run dev`)
3. **Navigate** to the screen (provide exact path)
4. **Resize** browser to mobile (375px width)
5. **Take screenshot** or describe what you see
6. **Verify** the change works as expected

### Mobile Viewport Sizes:
- **Mobile**: 375px width (iPhone SE)
- **Tablet**: 768px width (iPad)
- **Desktop**: 1024px+ width

### Component Identification

**Store App vs Partner Portal:**
- `DeliveryDetailsScreen.tsx` = Store App (receiving deliveries)
- `DeliveryNoteCreationScreen.tsx` = Partner Portal (creating shipments)

**Always verify** you're editing the correct component for the user's role.

---

## ✅ Pre-Submit Checklist

- [ ] Colors use semantic tokens (no `bg-white`, `bg-blue-500`)
- [ ] Typography uses M3 scale (no `text-2xl`, `font-bold`)
- [ ] No `<ResponsiveLayout>` wrapper
- [ ] Touch targets ≥ 48px
- [ ] Added to `Screen` type in `useAppState.ts`
- [ ] Accessibility: `aria-label`, `role`, `tabIndex`
- [ ] TypeScript types (no `any`)

---

## 📚 Detailed Documentation

For more details, see:
- **Full guide**: `AGENT_INSTRUCTIONS.md` (complete reference)
- **M3 guidelines**: `src/guidelines/Guidelines.md`
- **Design tokens**: `src/index.css` (lines 5297-5370)
