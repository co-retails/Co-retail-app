# Merged Branches Summary — March 19, 2026

Three remote branches were merged into `main` and cleaned up.

---

## 1. `feature/rejected-reason-bottom-sheet`

**PR #5** · Author: Katya Runnberg · 3 files changed (+191, −12)

### What it does
Adds a **Rejected Reason Bottom Sheet** to the item rejection workflow:

- **New component**: `RejectedReasonBottomSheet` — a styled bottom sheet (matching `BulkEditModal` design) presenting predefined rejection reasons:
  - Broken on arrival
  - Dirty
  - Not accepted brand/material/season
  - Wrong store
- **Item Details flow**: When an item in `Available` status is rejected **within 24 hours** of arrival, the bottom sheet opens for the user to select a reason before confirming.
- **Persistence**: The rejected reason is saved on the item object and displayed read-only in item details once set. Reason is preserved even if status changes to `Returned`.
- **Status constraints**: `Rejected` only appears as an option when `canRejectItem` is true (Available + within 24h). Statuses like Storage, Draft, In transit, and Returned are excluded from the reject flow.
- **Demo data**: Added a demo item ("Striped Cotton Blouse") with `lastInStoreAt` within 24h for testing.

### Files changed
| File | Change |
|------|--------|
| `ItemDetailsDialog.tsx` | Intercepts Available→Rejected status change, opens bottom sheet |
| `ItemsScreen.tsx` | Wires bottom sheet into the reject flow, adds demo item |
| `RejectedReasonBottomSheet.tsx` | **New** — the rejection reason picker component |

---

## 2. `fix/2026-03-09-local-main-rejected-reason-sync`

**PR #6** · Author: Katya Runnberg · 5 files changed (+96, −92 net across merges)

### What it does
A **sync/fix branch** that reconciled multiple local merges of the rejected-reason feature and resolved conflicts:

- **Duplicate declaration fix**: Removed a duplicate `canRejectItem` helper that was introduced when merging overlapping feature branches locally, which caused a **blank screen runtime error**.
- **Conflict resolution**: Resolved merge conflicts in `RejectedReasonBottomSheet.tsx` from a parallel feature branch (`feature/2025-03-09-rejected-reason-bottom-sheet`).
- **Refactored `ItemsScreen.tsx`**: Significant cleanup (−92 lines), consolidating duplicated logic from the parallel branches.
- **Minor `ItemCard.tsx` fix**: Small adjustment to item card rendering.

### Files changed
| File | Change |
|------|--------|
| `ItemDetailsDialog.tsx` | Removed 32 lines of duplicate `canRejectItem` declaration |
| `ItemsScreen.tsx` | Major refactor/cleanup (117 lines removed, simplified) |
| `ItemCard.tsx` | Minor fix |
| `RejectedReasonBottomSheet.tsx` | Conflict resolution |

---

## 3. `feature/2026-03-16-access-controls-settings`

**Single commit** · Author: Katya Runnberg · 18 files changed (+2,020, −1,118) — **the largest branch**

### What it does
Implements **role-aware access controls** and a major **settings UX overhaul**:

- **Role-based visibility**: Partner/admin visibility rules now govern what's shown across the dashboard, orders, and reports. Different roles see different navigation items and actions.
- **`AdminSettingsSheet`**: Refactored (354 lines changed) with clearer role/view switching controls and mobile-friendly layout.
- **`PartnerUserAccessScreen`**: Major rewrite (+1,063 lines changed) — likely the full partner user management UI with role assignment, permissions, and access control lists.
- **`StoreUserAccessScreen`**: Major rewrite (+1,027 lines changed) — store-level user access management with similar scope.
- **New `SwitchViewSheet`**: A new component (103 lines) for switching between partner/store views.
- **`RoleSwitcher` + `RoleSwitcherSheet`**: Updated role switching UI for the new access model.
- **Navigation updates**: `useNavigationHandlers`, `useAppState`, and `navigationConfig` updated to respect role-based access rules.
- **Mock data**: New `userAccessMockData.ts` (170 lines) providing test data for user access screens.
- **Cursor rules**: Added `.cursor/rules/git-workflow.mdc` and `pr-commands-from-main.mdc` for dev workflow documentation.

### Files changed
| File | Change |
|------|--------|
| `App.tsx` | Role-aware routing (+128 lines changed) |
| `AdminSettingsSheet.tsx` | Settings UX overhaul |
| `PartnerUserAccessScreen.tsx` | Major rewrite — partner access management |
| `StoreUserAccessScreen.tsx` | Major rewrite — store access management |
| `SwitchViewSheet.tsx` | **New** — view switching component |
| `userAccessMockData.ts` | **New** — mock data for access screens |
| `RoleSwitcher.tsx` | Updated role switching |
| `RoleSwitcherSheet.tsx` | Updated role switching sheet |
| `ShippingReportScreen.tsx` | Role-aware visibility |
| `ShippingScreen.tsx` | Role-aware visibility |
| `OrderDetailsScreen.tsx` | Role-aware visibility |
| `OrderShipmentDetailsScreen.tsx` | Minor update |
| `PartnerDashboard.tsx` | Role-aware visibility |
| `useAppState.ts` | Role state management |
| `useNavigationHandlers.ts` | Role-aware navigation |
| `navigationConfig.ts` | Updated nav config |
| `.cursor/rules/git-workflow.mdc` | **New** — dev workflow rules |
| `.cursor/rules/pr-commands-from-main.mdc` | **New** — PR workflow rules |
