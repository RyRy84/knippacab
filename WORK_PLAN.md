# KnippaCab Work Plan

**Last Updated:** February 11, 2026
**For:** Claude Code implementation sessions

---

## Current State: Phases 1–4 + Path A COMPLETE ✅

Phases 1–4 are fully implemented. The full end-to-end workflow is operational:

```
Create project → Add cabinets → Add drawers → Review list
  → Cut list (grouped by material) → Visual cutting diagram (SVG)
```

**19 commits · ~9,500+ lines of code · 156 passing unit tests · Runs on web (`npx expo start --web`)**

---

## What's Built (Phases 1–4)

### Phase 1: Foundation ✅
- Unit conversion + fractional Imperial display
- Cabinet & drawer dimension calculators (joinery-aware)
- Reveal calculator (door & drawer face dimensions)
- Grain direction logic
- SQLite schema + migrations + CRUD queries
- Web platform stubs (bypasses SQLite WASM requirement)
- Zustand stores (projectStore, settingsStore, uiStore)
- 93 unit tests

### Phase 2: Data Persistence ✅
- SQLite fully wired to all store actions
- Projects/cabinets/drawers persist across sessions (native)
- Web uses in-memory Zustand only (acceptable for dev/demo)

### Phase 3: Core UI Screens ✅
- **HomeScreen** — project list, create/open/delete
- **ProjectSetupScreen** — name, units, default joinery
- **CabinetBuilderScreen** — type selector, MeasurementInput width + preset buttons, toe kick, joinery; edit mode; loading state
- **ReviewEditScreen** — cabinet cards with Edit/Delete/Add-Drawers, drawer count badge, "Generate Cut List"
- **DrawerBuilderScreen** — drawer count, per-drawer heights (MeasurementInput), auto-balance, corner joinery + bottom method; loading state
- **CuttingPlanScreen** — all parts (cabinets + drawers) grouped by material, grain badges, summary header
- **MeasurementInput component** — fractional Imperial (`"36 1/2"`, `"3' 6"`) + Metric with parse/reformat

### Phase 4: Sheet Goods Optimizer ✅
- **`src/utils/optimizer/types.ts`** — `OptimizationSettings`, `ExpandedPart`, `PlacedPart`, `SheetLayout`, `OptimizationResult`
- **`src/utils/optimizer/binPacking.ts`** — Guillotine BSSF (Best-Short-Side-Fit) algorithm with grain constraints, multi-sheet, kerf accounting
- **`src/components/CuttingDiagram.tsx`** — SVG diagram: cabinet colour-coded parts, grain symbols, rotation indicators, 3-tier label density
- **`src/screens/VisualDiagramScreen.tsx`** — settings panel (sheet size, kerf), material tabs, per-sheet SVG cards, utilization stats, oversized-parts warning
- 17 optimizer unit tests (bounds, no overlaps, grain constraints, multi-sheet, oversized, kerf)

**Total tests:** 156 passing

---

## What's Next

### Path A: UX Polish ✅ COMPLETE

| Session | Feature | Commit |
|---------|---------|--------|
| A1 | Drawer parts in cut list | `5dad451` |
| A2 | Edit cabinet functionality | `04ced75` |
| A3 | Drawer badges, preset buttons, loading states | `c308b97` |

**Path A is fully complete. See PATH_A_MASTER_GUIDE.md for details.**

---

### Phase 5: PDF Export & Final Polish (Next Major Phase)

**Goal:** Allow users to export cut lists and cutting diagrams to PDF for use in the shop.

**Milestones:**
1. **5.1 — PDF Cut List** — export the material-grouped part list as a printable PDF
2. **5.2 — PDF Cutting Diagram** — embed the SVG cutting diagrams in the PDF
3. **5.3 — Final Polish** — loading states, error handling, app icon, splash screen, store assets

**Tech:** Evaluate `jsPDF` (web-compatible) vs `react-native-pdf-lib`. jsPDF is the likely choice for cross-platform.

**Entry point:** The "Export PDF" button in CuttingPlanScreen currently shows a placeholder alert — wire this up to the PDF generator.

---

## Running the App

```bash
npx expo start          # Start dev server (press w for web)
npx expo start --web    # Start directly in web mode
npm test                # Run 156 unit tests
npx tsc --noEmit        # TypeScript type check
```

---

## Architecture Notes

- All internal math in **mm** — display converts via `formatForDisplay(mm, units)`
- Zustand selectors must use **single-value pattern** (see CLAUDE.md Web Gotchas)
- Optimizer runs per-material (separate `optimizeSheetCutting()` call for 3/4" vs 1/4" plywood)
- `Part.partType` is the machine-readable discriminator; `Part.name` is the human label

---

## Key Files for Phase 5 (PDF Export)

```
src/screens/CuttingPlanScreen.tsx      # "Export PDF" button → wire to PDF generator
src/screens/VisualDiagramScreen.tsx    # "Export PDF" button → embed SVG diagrams
src/utils/pdfExport.ts                 # NEW — PDF generation module (create this)
```

**Recommended library:** `jsPDF` — web-compatible, no native build required.
Install with: `npx expo install jspdf`

**Phase 5 entry point:** The "Export PDF" buttons in CuttingPlanScreen and VisualDiagramScreen currently show `Alert.alert` placeholders. Wire those to the new `pdfExport.ts` module.
