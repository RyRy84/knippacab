# KnippaCab Work Plan

**Last Updated:** February 13, 2026
**For:** Claude Code implementation sessions

---

## Current State: All Phases COMPLETE ✅ — V1 MVP Feature-Complete

All 5 development phases are fully implemented. The full end-to-end workflow is operational:

```
Create project → Add cabinets → Add drawers → Review list
  → Cut list (+ hardware shopping list) → Visual cutting diagram (SVG) → Export PDF
```

**20+ commits · ~12,000+ lines of code · 172 passing unit tests · Runs on web (`npx expo start --web`)**

---

## What's Built

### Phase 1: Foundation ✅
- Unit conversion + fractional Imperial display
- Cabinet & drawer dimension calculators (joinery-aware)
- Reveal calculator (door & drawer face dimensions)
- Grain direction logic
- SQLite schema + migrations + CRUD queries
- Web platform stubs (bypasses SQLite WASM requirement)
- Zustand stores (projectStore, settingsStore, uiStore)

### Phase 2: Data Persistence ✅
- SQLite fully wired to all store actions
- Projects/cabinets/drawers persist across sessions (native)
- Web uses in-memory Zustand only (acceptable for dev/demo)

### Phase 3: Core UI Screens ✅
- **HomeScreen** — project list, create/open/delete, Settings button
- **ProjectSetupScreen** — name, units, default joinery
- **CabinetBuilderScreen** — type selector, MeasurementInput width + preset buttons, toe kick, joinery; edit mode; loading state
- **ReviewEditScreen** — cabinet cards with Edit/Delete/Add-Drawers, drawer count badge, disabled "Generate Cut List" when empty
- **DrawerBuilderScreen** — drawer count, per-drawer heights (MeasurementInput), auto-balance, corner joinery + bottom method; loading state
- **CuttingPlanScreen** — all parts grouped by material, grain badges, hardware shopping list, summary header
- **MeasurementInput component** — fractional Imperial (`"36 1/2"`, `"3' 6"`) + Metric with parse/reformat

### Phase 4: Sheet Goods Optimizer ✅
- **`src/utils/optimizer/binPacking.ts`** — Guillotine BSSF with grain constraints, multi-sheet, kerf accounting
- **`src/components/CuttingDiagram.tsx`** — SVG diagram: cabinet colour-coded parts, grain symbols, rotation indicators, 3-tier label density
- **`src/screens/VisualDiagramScreen.tsx`** — settings panel (sheet size, kerf from persisted defaults), material tabs, per-sheet SVG cards, utilization stats
- 17 optimizer unit tests

### Phase 5: Polish & MVP Completion ✅

#### 5.1 PDF Export ✅
- **`expo-print`** installed (SDK 54 compatible)
- **`src/utils/pdfGenerator.ts`** — Cover page, cut list table, cutting diagrams, hardware table
- **Export PDF** wired in `CuttingPlanScreen` and `VisualDiagramScreen`

#### 5.2 Settings Persistence ✅
- **`src/screens/SettingsScreen.tsx`** — Full settings screen (units, joinery, toe kick, sheet size, kerf)
- **settingsStore** expanded: `defaultSheetWidth`, `defaultSheetHeight` persisted to SQLite
- **VisualDiagramScreen** initialises from persisted settings
- **Navigation** updated: Settings route + button on HomeScreen

#### 5.3 Hardware Recommendations ✅
- **`src/utils/hardwareRecommendations.ts`** — Pure function: screws, hinges, slides, accessories
- **CuttingPlanScreen** — hardware shopping list UI section
- **PDF export** — hardware table with category headers
- 16 unit tests

### Path A: UX Polish ✅ COMPLETE

| Session | Feature | Commit |
|---------|---------|--------|
| A1 | Drawer parts in cut list | `5dad451` |
| A2 | Edit cabinet functionality | `04ced75` |
| A3 | Drawer badges, preset buttons, loading states | `c308b97` |

**Total tests:** 172 passing (7 test suites)

---

## What's Next (V1 Release Prep)

1. **Home Screen Project Management** — load/display saved projects (native), rename, delete
2. **Production readiness** — app icon, splash screen, store assets, iOS/Android builds
3. **V2 planning** — review FEATURE_BACKLOG.md

---

## Running the App

```bash
npx expo start          # Start dev server (press w for web)
npx expo start --web    # Start directly in web mode
npm test                # Run 172 unit tests
npx tsc --noEmit        # TypeScript type check
```

---

## Architecture Notes

- All internal math in **mm** — display converts via `formatForDisplay(mm, units)`
- Zustand selectors must use **single-value pattern** (see CLAUDE.md Web Gotchas)
- Optimizer runs per-material (separate `optimizeSheetCutting()` call for 3/4" vs 1/4" plywood)
- `Part.partType` is the machine-readable discriminator; `Part.name` is the human label

---

## Key Files

```
src/screens/SettingsScreen.tsx            # App-wide settings
src/screens/CuttingPlanScreen.tsx         # Cut list + hardware shopping list
src/screens/VisualDiagramScreen.tsx       # SVG cutting diagrams
src/utils/pdfGenerator.ts                 # PDF export (cover + cut list + diagrams + hardware)
src/utils/hardwareRecommendations.ts      # Hardware shopping list generator
src/utils/optimizer/binPacking.ts         # Guillotine BSSF algorithm
src/store/settingsStore.ts                # Persisted user preferences
```
