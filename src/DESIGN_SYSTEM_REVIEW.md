# Design System Review - Post Figma Library Update

## Overview
This document provides a comprehensive review of all screens, bottom sheets, icons, and buttons after the new Figma library has been added. It identifies components that need updating to properly use the design system variables from `/styles/globals.css`.

## What Was Fixed

### 1. CSS Variables - globals.css ✅
**Status: COMPLETE**

Added all missing Material 3 color roles to make them available as Tailwind classes:

#### New Color Variables Added:
- `--surface` / `bg-surface` / `text-surface`
- `--on-surface` / `bg-on-surface` / `text-on-surface`
- `--surface-variant` / `bg-surface-variant` / `text-surface-variant`
- `--on-surface-variant` / `bg-on-surface-variant` / `text-on-surface-variant`
- `--surface-container` / `bg-surface-container` / `text-surface-container`
- `--surface-container-low` / `bg-surface-container-low`
- `--surface-container-high` / `bg-surface-container-high`
- `--surface-container-highest` / `bg-surface-container-highest`
- `--outline` / `border-outline`
- `--outline-variant` / `border-outline-variant`
- `--primary-container` / `bg-primary-container`
- `--on-primary-container` / `text-on-primary-container`
- `--secondary-container` / `bg-secondary-container`
- `--on-secondary-container` / `text-on-secondary-container`
- `--error` / `bg-error` / `text-error`
- `--on-error` / `bg-on-error` / `text-on-error`

All these variables are now properly mapped in the `@theme inline` section and available as Tailwind utility classes throughout the application.

---

## Components Status

### ✅ Components Already Using Design System Properly

These components are correctly using design system variables:

1. **ResponsiveNavigation.tsx** ✅
   - Uses: `bg-surface`, `border-outline-variant`, `bg-secondary-container`, `text-on-surface`, `text-on-surface-variant`
   - All color references use CSS variables

2. **ResponsiveLayout.tsx** ✅
   - Uses: `bg-surface`
   - Properly sets background for main layout

3. **ActiveScanner.tsx** ✅
   - Uses: `bg-surface-container`, `border-outline-variant`, `bg-surface-variant`, `bg-primary`, `text-on-primary`
   - All colors reference design system

4. **Button Component (ui/button.tsx)** ✅
   - Uses: `bg-primary`, `text-on-primary`, `bg-error`, `text-on-error`, `bg-secondary-container`, `text-on-secondary-container`, `border-outline`, `bg-surface-container-high`
   - Properly implements Material 3 button variants

5. **Sheet Component (ui/sheet.tsx)** ✅
   - Uses: `bg-background`
   - Properly styled bottom sheets

6. **BoxManagementScreen.tsx** ✅
   - Extensively uses: `text-on-surface-variant`, `text-on-surface`, `bg-secondary-container`, `text-on-secondary-container`, `bg-surface-container-high`, `border-outline`
   - Excellent example of M3 implementation

---

## ⚠️ Components That Need Review/Updates

### Critical: Figma Imported Files with Hardcoded Colors

The following imported Figma files contain hardcoded color values that should be replaced with design system variables:

#### 1. `/imports/StatusUpdateSearch.tsx` ⚠️
**Issues:**
- `bg-[#f20054]` - Should use `bg-error` or `bg-primary` depending on context
- `bg-[#d9d9d9]` - Should use `bg-surface-variant` or `bg-surface-container`

**Lines to update:** 37, 70, 159, 342, 428

#### 2. `/imports/StatusUpdate.tsx` ⚠️
**Issues:**
- `bg-[#f20054]` - Should use `bg-error` or `bg-primary`

**Line to update:** 35

#### 3. `/imports/Scan3.tsx` ⚠️
**Issues:**
- `bg-[#d9d9d9]` - Should use `bg-surface-variant`
- `bg-[rgba(0,0,0,0.4)]` - Could use a surface scrim or overlay color

**Lines to update:** 114, 243, 372, 501, 630, 747, 932, 933

#### 4. `/imports/NavbarFindSellerAlt.tsx` ⚠️
**Issues:**
- `bg-[#f20054]` - Should use design system primary/error color
- `bg-[rgba(121,116,126,0.08)]` - Should use `bg-surface-container` or surface variant
- `bg-[#1a1a1a]` - Should use `bg-on-surface` or `bg-primary`

**Lines to update:** 125, 366, 398

#### 5. `/imports/ItemsSelected.tsx` ⚠️
**Issues:**
- `bg-[#f20054]` - Should use design system color
- `bg-[#d9d9d9]` - Should use `bg-surface-variant`
- `bg-[rgba(121,116,126,0.08)]` - Should use surface container

**Lines to update:** 122, 146, 413, 545, 680, 811, 944, 1077, 1196, 1379, 1665

#### 6. `/imports/NewHomeBrandB2BView-12-2385.tsx` ⚠️
**Issues:**
- `bg-[#0274c5]` - Should use `bg-accent` or `bg-chart-1`

**Lines to update:** 463, 479, 497, 515, 533, 558

#### 7. `/imports/SalesData.tsx` ⚠️
**Issues:**
- `bg-[#0274c5]` - Should use `bg-accent` or `bg-chart-1`

**Lines to update:** 7, 23, 41, 59, 77, 102

#### 8. `/imports/StoreSelector.tsx` ⚠️
**Issues:**
- `bg-[#f20054]` - Should use design system color

**Line to update:** 133

#### 9. `/imports/ReviewItems.tsx` ⚠️
**Issues:**
- `bg-[#f20054]` - Should use design system color
- `bg-[#d9d9d9]` - Should use `bg-surface-variant`

**Lines to update:** 11, 261, 394, 527, 660

#### 10. `/imports/ReturnDetailsInReturn0.tsx` ⚠️
**Issues:**
- `bg-[#f20054]` - Should use design system color

**Lines to update:** 6, 210, 331

#### 11. `/imports/StockCheckStart.tsx` ⚠️
**Issues:**
- `bg-[#f20054]` - Should use design system color
- `bg-[#d9d9d9]` - Should use `bg-surface-variant`

**Lines to update:** 43, 195, 328, 459, 592, 850

#### 12. `/imports/ReceiveParcelToStore.tsx` ⚠️
**Issues:**
- `bg-[#f20054]` - Should use design system color

**Lines to update:** 69, 84, 519

#### 13. `/imports/OrdersNavigationBarIfOnlyB2B-12-7424.tsx` ⚠️
**Issues:**
- `bg-[#f20054]` - Should use design system color
- `bg-[rgba(121,116,126,0.12)]` - Should use surface container

**Lines to update:** 43, 66, 665

#### 14. `/imports/Admin.tsx` ⚠️
**Issues:**
- `bg-[#f4dcd6]` - Should use a design system surface/container color

**Line to update:** 20

---

## Design System Color Mapping Guide

### Recommended Replacements

Use this guide when updating hardcoded colors:

| Hardcoded Color | Purpose | Replace With |
|----------------|---------|--------------|
| `#f20054` (Pink/Red) | Primary actions, CTAs | `bg-error` or `bg-primary` |
| `#0274c5` (Blue) | Charts, data visualization | `bg-accent` or `bg-chart-1` |
| `#d9d9d9` (Light gray) | Placeholders, disabled states | `bg-surface-variant` or `bg-surface-container` |
| `#1a1a1a` (Dark gray/black) | Text, icons | `bg-primary` or `text-on-surface` |
| `rgba(121,116,126,0.08)` | Subtle backgrounds | `bg-surface-container` or `bg-surface-container-high` |
| `rgba(0,0,0,0.4)` | Overlays, scrims | Custom variable needed or use `bg-black/40` |
| `#f4dcd6` (Beige/Peach) | Avatar backgrounds | `bg-primary-container` or custom color |

---

## Typography System

### Available Typography Classes

The design system now properly supports Roboto font with these typography scales defined in CSS:

```css
/* Available font sizes from CSS variables */
--text-h1: 32px;    /* For large headings */
--text-h2: 28px;    /* For medium headings */
--text-h3: 24px;    /* For small headings */
--text-h4: 18px;    /* For sub-headings */
--text-base: 16px;  /* For body text */
--text-label: 14px; /* For labels and captions */
```

### Material 3 Typography Classes

These M3 classes are being used throughout the app (ensure consistency):

- **Display**: `display-large`, `display-medium`, `display-small`
- **Headline**: `headline-large`, `headline-medium`, `headline-small`
- **Title**: `title-large`, `title-medium`, `title-small`
- **Body**: `body-large`, `body-medium`, `body-small`
- **Label**: `label-large`, `label-medium`, `label-small`

**Note:** The app correctly avoids Tailwind text size classes (like `text-xl`, `text-2xl`) in favor of semantic M3 classes.

---

## Screens Requiring Background Color Review

### Screens that should verify they have proper backgrounds:

1. **DeliveryHomeScreen** - Check if using `bg-surface` or `bg-background`
2. **ShippingScreen** - Verify background color
3. **ReceiveDeliveryScreen** - Verify background color
4. **ItemsScreen** - Verify background color
5. **ScanScreen** - Already using `bg-surface-container` ✅
6. **SellersScreen** - Verify background color
7. **StatusUpdateScreen** - Verify background color
8. **AdminScreen** - Verify background color
9. **All Partner Portal Screens** - Verify they use `bg-surface` or `bg-background`

**Action needed:** Each screen's root container should have either:
- `bg-surface` (for main content areas)
- `bg-background` (for app-level backgrounds)
- Or be wrapped in `ResponsiveLayout` which provides `bg-surface`

---

## Bottom Sheets Review

### Components Using Sheets

All bottom sheets inherit styling from `/components/ui/sheet.tsx` which properly uses:
- `bg-background` for sheet content
- `text-foreground` for text

**Known sheets to verify:**
1. `AdminSettingsSheet` - Should be okay
2. `RoleSwitcherSheet` - Should be okay
3. `StoreFilterBottomSheet` - Should be okay
4. `PostRegistrationDialog` - Uses dialog, should be okay

---

## Icons Review

### Icon Color Usage

Icons throughout the app are using:
- SVG paths with `fill="var(--primary)"` ✅
- SVG paths with `fill="var(--on-surface-variant)"` ✅
- Lucide icons with proper text color classes ✅

**Status:** Icons appear to be properly styled with design system colors.

---

## Buttons Review

### Button Implementation Status

The button component (`/components/ui/button.tsx`) is **correctly implemented** with M3 design:

**Available variants:**
- `default`: Primary button with `bg-primary`, `text-on-primary`
- `destructive`: Error actions with `bg-error`, `text-on-error`
- `outline`: Outlined button with `border-outline`, `text-on-surface`
- `secondary`: Secondary button with `bg-secondary-container`, `text-on-secondary-container`
- `ghost`: Transparent with surface container hover states
- `link`: Text link style

**All buttons use:**
- Proper rounded corners: `rounded-lg` (Store Lens spec)
- Focus states with outline
- Hover/active state transitions
- `label-large` typography class

**Status:** Button system is properly implemented ✅

---

## Priority Action Items

### High Priority (Do First)

1. **Update Figma Import Files** - Replace all hardcoded `bg-[#...]` colors with design system variables
   - Start with most-used files: `StatusUpdateSearch.tsx`, `ItemsSelected.tsx`, `Scan3.tsx`

2. **Verify Screen Backgrounds** - Ensure all main screens have explicit background colors

3. **Test Dark Mode** - Verify that all screens work properly with the updated dark mode color tokens

### Medium Priority

4. **Audit Custom Components** - Check any custom components not reviewed here

5. **Update Documentation** - Document the color system for team reference

### Low Priority

6. **Optimize Color Palette** - Consider if all color variations are needed

7. **Create Color Usage Examples** - Build a component showcase

---

## Design System Benefits

### What's Now Available

✅ **Complete M3 Color System** - All Material 3 color roles available as Tailwind classes
✅ **Surface Layering** - Proper depth and elevation with surface containers
✅ **Semantic Colors** - Error, accent, outline variants for clear intent
✅ **Dark Mode Ready** - All colors have dark mode equivalents
✅ **Typography Scale** - Roboto font with M3 typography classes
✅ **Consistent Spacing** - Radius and shadow tokens defined

### Usage Example

```tsx
// ✅ Good - Using design system
<div className="bg-surface border border-outline-variant rounded-lg">
  <h2 className="headline-small text-on-surface">Title</h2>
  <p className="body-medium text-on-surface-variant">Description</p>
  <button className="bg-primary text-on-primary rounded-full px-6 py-2">
    Action
  </button>
</div>

// ❌ Bad - Using hardcoded values
<div className="bg-[#ffffff] border border-[#e5e5e5] rounded-lg">
  <h2 className="text-xl font-bold text-[#2c2c24]">Title</h2>
  <p className="text-base text-[#72726c]">Description</p>
  <button className="bg-[#f20054] text-white rounded-full px-6 py-2">
    Action
  </button>
</div>
```

---

## Summary

### Completed ✅
- Extended CSS variables with complete M3 color system
- Mapped all colors to Tailwind utility classes
- Identified all files needing updates

### Next Steps 📋
1. Update Figma imported files to use design system colors
2. Verify all screen components have proper backgrounds
3. Test dark mode thoroughly
4. Update any missed components using hardcoded colors

### Impact
Once the Figma import files are updated, the entire application will be fully integrated with the design system, allowing for:
- Easy theme switching
- Consistent color usage
- Better maintainability
- Full Material 3 compliance
