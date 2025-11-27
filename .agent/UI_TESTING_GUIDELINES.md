# UI Testing Guidelines

## Critical Rules for UI Changes

### 1. Always Verify in Browser Before Claiming Completion

**Rule**: Never claim a UI change is complete without visual verification in the browser at the correct viewport size.

**Process**:
1. Make the code change
2. Build/reload the app
3. Navigate to the exact screen
4. Resize to the target viewport (e.g., 375px for mobile)
5. Take a screenshot
6. Verify the change is visible and correct

### 2. Identify the Correct Component

**Common Pitfall**: This app has similar screens for different user roles:
- `DeliveryDetailsScreen.tsx` - Store App (for store staff viewing deliveries)
- `DeliveryNoteCreationScreen.tsx` - Partner Portal (for partners creating/managing shipments)

**Process**:
1. Ask clarifying questions about which user role/portal
2. Search for the screen name in the codebase
3. Check the file path and imports to confirm the correct component

### 3. Understand CSS Flexbox + Utility Class Interactions

**Common Issue**: `w-full` overrides flexbox behavior

```tsx
// ❌ WRONG - Buttons will stack even with flex-row
<div className="flex flex-row gap-3">
  <Button className="w-full md:w-auto">Button 1</Button>
  <Button className="w-full md:w-auto">Button 2</Button>
</div>

// ✅ CORRECT - Buttons will be side-by-side
<div className="flex flex-row gap-3">
  <Button className="flex-1">Button 1</Button>
  <Button className="flex-1">Button 2</Button>
</div>
```

**Key Learning**: 
- `w-full` = `width: 100%` forces full width, breaking flex row layout
- `flex-1` = `flex: 1 1 0%` allows items to share space equally within flex container

### 4. Navigation Testing Paths

**Partner Portal Testing Path**:
1. Switch to Partner role via Admin Settings
2. Select correct partner (e.g., "Sellpy Operations")
3. Select correct warehouse (e.g., "Stockholm Central Warehouse")
4. Navigate to "Shipping"
5. Click the correct tab:
   - **Orders** tab - for order creation/management
   - **Shipments** tab - for delivery note creation/management (Pending/Packing status)

### 5. Mobile Viewport Testing

**Standard Mobile Sizes**:
- iPhone SE: 375px × 667px
- iPhone 12/13/14: 390px × 844px
- Common test size: 375px width

**Always test at actual mobile width**, not just resizing the browser window partially.

## Checklist for UI Changes

- [ ] Identified the correct component/file
- [ ] Made the code change
- [ ] Built the application
- [ ] Navigated to the correct screen (with correct role/warehouse if applicable)
- [ ] Resized to target viewport
- [ ] Took screenshot showing the change
- [ ] Verified the change is correct
- [ ] Documented any learnings

## Common Patterns in This Codebase

### Button Layouts

**Side-by-side on all viewports**:
```tsx
<div className="flex flex-row gap-3">
  <Button className="flex-1">Save & Close</Button>
  <Button className="flex-1">Register</Button>
</div>
```

**Stacked on mobile, side-by-side on desktop**:
```tsx
<div className="flex flex-col md:flex-row gap-3">
  <Button className="w-full md:w-auto">Save & Close</Button>
  <Button className="w-full md:w-auto">Register</Button>
</div>
```

### Color Customization

When applying custom colors that aren't in the design system:
```tsx
// Use inline styles for custom colors
<Card 
  className="border-outline cursor-pointer hover:bg-[#F2E8DE]"
  style={{ backgroundColor: '#FAF0E6' }}
>
```
