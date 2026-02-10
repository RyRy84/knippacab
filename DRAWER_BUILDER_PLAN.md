# DrawerBuilderScreen — Implementation Plan & Reference

**Status:** ✅ IMPLEMENTED (February 10, 2026)
**Phase:** 3, Milestone 3.3
**File:** `src/screens/DrawerBuilderScreen.tsx`

---

## Overview

The Drawer Builder Screen allows users to add drawers to a cabinet by specifying
quantity, heights, and construction methods. It integrates with the existing
`drawerCalculator.ts` engine which is fully tested and functional.

**Actual User Flow (as built):**
```
ReviewEditScreen → [Add Drawers button on cabinet card]
               → navigation.navigate('DrawerBuilder', { cabinetId: cabinet.id })
               → DrawerBuilderScreen
               → [Add N Drawers to Cabinet]
               → navigation.goBack() → ReviewEditScreen
```

> **Note:** The original plan described navigation from CabinetBuilderScreen.
> The implementation places the entry point on ReviewEditScreen cabinet cards
> instead — this is cleaner because the cabinet already exists when drawers are added.

---

## Context & Prerequisites

### What Already Existed ✅

1. **Calculator Engine** (`src/utils/drawerCalculator.ts`)
   - `calculateDrawerParts()` — generates all 5 drawer parts (front, back, 2 sides, bottom)
   - `adjustDrawerForJoinery()` — corner joinery and bottom method adjustments
   - Fully tested (93 unit tests include drawer tests)

2. **Type Definitions** (`src/types/index.ts`)
   ```typescript
   interface Drawer {
     id: string;
     cabinetId: string;
     width: number; height: number; depth: number; // mm
     cornerJoinery: DrawerCornerJoinery;
     bottomMethod: DrawerBottomMethod;
     frontMaterial: string;
   }
   type DrawerCornerJoinery = 'pocket_hole' | 'butt' | 'dado';
   type DrawerBottomMethod  = 'applied' | 'captured_dado' | 'screwed';
   ```

3. **Store Methods** (`src/store/projectStore.ts`)
   - `addDrawer(cabinetId, input)` — saves drawer to SQLite and state
   - `deleteDrawer(drawerId)` — removes drawer

4. **Constants** (`src/constants/cabinetDefaults.ts`)
   - `DRAWER_SLIDE_CLEARANCE_EACH_SIDE_MM` = 12.7mm (1/2" per side)
   - `DRAWER_TOP_CLEARANCE_MM` = 12.7mm (1/2" top)

---

## Navigation Setup (as implemented)

**`src/navigation/types.ts`** — updated:
```typescript
DrawerBuilder: { cabinetId: string };  // was: undefined
```

**`ReviewEditScreen.tsx`** — added "Add Drawers" button to each cabinet card:
```typescript
<TouchableOpacity onPress={() => navigation.navigate('DrawerBuilder', { cabinetId: cabinet.id })}>
  <Text>+ Add Drawers</Text>
</TouchableOpacity>
```

---

## UI Design (as built)

### Screen Layout

```
┌─────────────────────────────────────────┐
│ [Purple context card]                   │
│ Adding drawers to: Base Cabinet         │
│ 36.0" W × 34.5" H                      │
│ Available height: 34.50"               │
├─────────────────────────────────────────┤
│ NUMBER OF DRAWERS                       │
│   [−]        2        [+]              │
│           drawers                       │
├─────────────────────────────────────────┤
│ DRAWER HEIGHTS (inches)  [Auto-Balance] │
│                                         │
│  Drawer 1: [ 17.25 ] "                 │
│  Drawer 2: [ 17.25 ] "                 │
│                                         │
│ [Used: 34.50"  Available: 34.50" ...]  │
├─────────────────────────────────────────┤
│ CORNER JOINERY                         │
│ ◉ Pocket Hole — Quick & strong ...     │
│ ○ Butt + Screws — Simplest method      │
│ ○ Dado — Strongest joint ...           │
├─────────────────────────────────────────┤
│ BOTTOM ATTACHMENT                       │
│ ◉ Applied — Nailed to underside        │
│ ○ Captured Dado — Slides into groove   │
│ ○ Screwed — Screwed from below         │
├─────────────────────────────────────────┤
│ [Add 2 Drawers to Cabinet] (purple)    │
│ [Cancel]                               │
└─────────────────────────────────────────┘
```

---

## Component Structure

### State
| Variable | Type | Default | Purpose |
|---|---|---|---|
| `drawerCount` | `number` | `1` | How many drawers to add |
| `heightsIn` | `string[]` | `['6.00']` | One entry per drawer in inches |
| `autoBalance` | `boolean` | `false` | Whether to auto-distribute heights |
| `cornerJoinery` | `DrawerCornerJoinery` | `'pocket_hole'` | Corner joint method |
| `bottomMethod` | `DrawerBottomMethod` | `'applied'` | Bottom panel attachment |

### Dimension Math (applied on save)
```
Drawer box width  = cabinet.width  − (2 × 12.7mm)   ← slide clearance each side
Drawer box height = inchesToMm(user_input) − 12.7mm  ← top clearance for slides
Drawer box depth  = cabinet.depth  − 50.8mm          ← 2" front setback
```

---

## Key Features

### 1. Cabinet Context Card
- Shows cabinet type + W×H dimensions + available height in inches
- Purple accent colour (`#6A1B9A`) — visually distinct from cabinet-level blue

### 2. Drawer Count Stepper (1–10)
- Large − / + circular buttons
- Centred count with "drawer / drawers" label
- Disabled state when at bounds

### 3. Height Inputs with Auto-Balance
- One TextInput per drawer labelled "Drawer 1", etc.
- **Auto-Balance toggle pill**: evenly distributes `cabinet.height` in inches across all drawers
- Typing manually turns Auto-Balance off automatically
- Height summary bar (green/red) shows: Used / Available / Remaining

### 4. Radio Cards (Corner Joinery + Bottom Method)
- Full-width cards with radio indicator, label, and one-line description
- Same radio card pattern as ProjectSetupScreen joinery selector

### 5. Validation
| Rule | Behaviour |
|---|---|
| Drawer height < 3" | Alert: "Drawer N height must be at least 3 inches." |
| Total heights > cabinet height | Alert: prevents save |
| Cabinet ID not found in store | Error state with "Go Back" button |

---

## Save Behaviour

For each drawer `i` (0-indexed):
```typescript
addDrawer(cabinetId, {
  width:  cabinet.width  - (2 * DRAWER_SLIDE_CLEARANCE_EACH_SIDE_MM),
  height: Math.max(1, inchesToMm(parseFloat(heightsIn[i])) - DRAWER_TOP_CLEARANCE_MM),
  depth:  Math.max(1, cabinet.depth - DRAWER_BOX_DEPTH_SETBACK_MM),   // 50.8mm = 2"
  cornerJoinery,
  bottomMethod,
});
```

After saving all drawers: `navigation.goBack()`.

---

## Files Changed

| File | Change |
|---|---|
| `src/screens/DrawerBuilderScreen.tsx` | Full implementation (was 47-line placeholder) |
| `src/screens/ReviewEditScreen.tsx` | "Add Drawers" purple button added to each cabinet card |
| `src/navigation/types.ts` | `DrawerBuilder: { cabinetId: string }` (was `undefined`) |

---

## Known Limitations / Future Work

- **No drawer count display** on ReviewEditScreen cabinet cards
  (future: show "2 drawers" badge — Phase UX polish)
- **No drawer editing/deleting from UI** — drawer data persists in store/SQLite,
  but there is no edit or delete UI yet (future milestone)
- **Drawer parts not yet in CuttingPlanScreen** — `CuttingPlanScreen` currently
  only calls `calculateCabinetParts()`; a future update adds `calculateDrawerParts()`
  for each drawer in the project (Option B in NEXT_SESSION_PLAN.md)
- **Depth setback hardcoded at 2"** — configurable slide depth goes in Phase 5 Pro Mode
- **Height available = full cabinet height** — a future refinement subtracts a bottom
  rail/stretcher if one is used

---

## Testing Checklist

- [x] Renders correctly with cabinet context
- [x] Drawer count stepper works (1–10, disabled at bounds)
- [x] Height inputs update per drawer
- [x] Auto-Balance distributes heights evenly
- [x] Typing custom height turns off Auto-Balance
- [x] Summary bar turns red when over cabinet height
- [x] Corner joinery radio cards single-select correctly
- [x] Bottom method radio cards single-select correctly
- [x] Save validates min height and total
- [x] Save calls addDrawer for each drawer
- [x] Cancel navigates back without saving
- [x] TypeScript type-check passes (`npx tsc --noEmit`)
