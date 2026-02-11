# KnippaCab Development Roadmap

**Last Updated:** February 11, 2026  
**Current Phase:** Phase 4 - Sheet Goods Optimization (Ready to Start)

---

## Vision Statement

Build a cross-platform cabinet design app that **eliminates calculation errors** in woodworking by automating reveal calculations, joinery dimension adjustments, and sheet goods optimization.

**Core Differentiator:** Mobile-first + joinery-aware calculations + grain-intelligent cutting optimization + one-time purchase pricing.

---

## Current State (Phase 3 Complete ✅)

### What's Working:
- ✅ **Complete end-to-end workflow**: Create project → add cabinets → add drawers → review list → view cut list
- ✅ **Calculation engine**: 93 unit tests passing - all cabinet/drawer math validated
- ✅ **Data persistence**: SQLite on native, in-memory on web
- ✅ **Core UI screens**: ProjectSetup, CabinetBuilder, DrawerBuilder, ReviewEdit, CuttingPlan
- ✅ **Grain direction logic**: Auto-assigned based on part type

### Tech Stack:
- React Native + Expo (iOS, Android, Web)
- TypeScript
- Zustand (state management)
- SQLite (expo-sqlite)
- React Navigation
- 6,500+ lines of code, 15 commits

---

## Phase 1: Foundation & Core Calculations ✅ COMPLETE

**Delivered:**
- Cabinet calculator with joinery awareness (dado, pocket hole, butt, dowel)
- Drawer calculator with corner joinery and bottom attachment methods
- Reveal calculator (door/drawer face dimensions)
- Grain direction logic (vertical/horizontal/either based on part type)
- Material thickness constants (3/4", 1/2", 1/4" plywood)

---

## Phase 2: Data Persistence ✅ COMPLETE

**Delivered:**
- SQLite database schema (Projects, Cabinets, Drawers)
- Migration system for schema evolution
- CRUD operations for all entities
- Web platform stubs (in-memory fallback for web builds)
- Settings persistence (units, default joinery, saw kerf)

---

## Phase 3: User Interface ✅ COMPLETE

**Delivered:**
- ProjectSetupScreen: Name, units, default joinery
- CabinetBuilderScreen: Type selector, dimensions, toe kick options, joinery
- DrawerBuilderScreen: Drawer count stepper, per-drawer heights with auto-balance, corner joinery + bottom method
- ReviewEditScreen: Cabinet list with delete, navigation hub
- CuttingPlanScreen: Parts grouped by material, grain direction badges, dimension display

**Current Limitations:**
- No visual cutting diagrams yet (Phase 4)
- No PDF export yet (Phase 5)
- No edit cabinet functionality (deferred to Phase 5 polish)
- Drawer parts not yet included in CuttingPlanScreen (easy addition)

---

## Phase 4: Sheet Goods Optimization 🎯 NEXT UP

**Goal:** The killer feature - visual cutting diagrams with grain direction constraints

**Research Complete:** See SHEET_OPTIMIZER_RESEARCH.md for comprehensive competitive analysis

### Milestone 4.1: Bin Packing Algorithm
**What:** `src/utils/optimizer/binPacking.ts`

**Approach:** Guillotine First-Fit Decreasing (FFD)
- Sort parts by area (largest first)
- Place each part using guillotine cuts (table-saw friendly)
- Respect grain direction constraints (cannot rotate certain parts)
- Account for saw kerf between parts
- Target 80-85% material efficiency

**Key Considerations:**
- Guillotine algorithm prioritizes *practical cutting sequences* over max efficiency
- Users care more about "can I actually cut this on my table saw" than 2% efficiency gains
- Grain direction is non-negotiable for aesthetics

**Deliverable:** Function that takes `Part[]` and returns `SheetLayout[]` with placement coordinates

### Milestone 4.2: SVG Cutting Diagram
**What:** `src/components/CuttingDiagram/` + `src/screens/VisualDiagramScreen.tsx`

**Features:**
- React Native SVG rendering
- 4'×8' sheet to scale
- Part rectangles with labels (cabinet reference + part name)
- Color-coded by cabinet (multi-cabinet projects)
- Grain direction arrows
- Dimension labels (toggle on/off)
- Cut sequence numbers (guillotine mode)
- Waste areas shaded differently
- Zoom/pan support

**Deliverable:** Interactive visual diagram users can take to the shop

### Milestone 4.3: Multi-Sheet Handling
**What:** Handle projects requiring multiple sheets

**Features:**
- Sheet tabs (Sheet 1, Sheet 2, etc.)
- Utilization % per sheet
- Total waste calculation
- Material cost estimation (if user provides price per sheet)
- Parts list per sheet

**Deliverable:** Complete cutting plan for any size project

---

## Phase 5: Polish & V1 Launch 🚀

### Milestone 5.1: PDF Export
- Cut list tables
- Cutting diagrams (one per sheet)
- Material summary
- Print-friendly layout

### Milestone 5.2: UX Polish
- Edit cabinet (pre-fill builder with existing cabinet data)
- Drawer list/management within cabinet cards
- Preset size quick-select buttons on CabinetBuilder
- Drawer count badge on ReviewEdit cabinet cards
- Better empty states and loading indicators

### Milestone 5.3: Drawer Parts in Cut List
- Update CuttingPlanScreen to call `calculateDrawerParts()` for each drawer
- Merge drawer parts into grouped material list
- Verify grain direction assignments work correctly

### Milestone 5.4: Hardware Recommendations
- Hinge recommendations (European cup hinges for frameless)
- Drawer slide recommendations based on drawer depth
- Screw/hardware quantities (joinery-specific)

---

## V2 Features (Post-Launch)

**High Priority:**
- Corner cabinet support (diagonal corners with lazy Susan, blind corners)
- 2D layout planner (arrange multiple cabinets visually, measure total run)
- Better optimization algorithms (best-fit, genetic if needed)
- Manual layout adjustment (drag parts on cutting diagram)
- Edge banding calculation (linear footage per sheet)
- Offcut management (save/reuse waste pieces)

**Medium Priority:**
- 3D visualization (Three.js cabinet preview)
- Augmented reality (AR camera placement of cabinets in real space)
- Face-frame cabinet support (different reveal math)
- Cloud sync / project sharing

**Advanced Features:**
- DXF export for CNC (Shapeoko, X-Carve validated demand)
- CNC-specific features (nested parts, tab placement, toolpath optimization)
- Bluetooth measuring device integration
- Material cost tracking across projects
- Assembly instruction generator

---

## Success Metrics

**V1 Launch Goals:**
- Time to first cut list: < 2 minutes (for standard cabinet)
- 93+ unit tests passing (maintain test coverage)
- Works on iOS, Android, Web
- Zero critical bugs
- 3-5 beta testers build real cabinets from app output

**Engagement Targets (Post-Launch):**
- 80% of new users complete first cabinet
- 60% use cutting diagram (Phase 4)
- 40% create multi-cabinet projects
- < 1% app crash rate

---

## Critical Path

**Must Complete in Order:**
1. ✅ Phase 1: Calculations (foundation for everything)
2. ✅ Phase 2: Data persistence (needed for multi-cabinet)
3. ✅ Phase 3: UI (needed to test workflow)
4. **Phase 4: Optimization** ⬅️ **YOU ARE HERE**
5. Phase 5: Polish (final layer before launch)

**Can Parallelize:**
- PDF export + UX polish (Phase 5)
- Different UI screens (already done)

---

## Key Decisions Already Made

- **Frameless only for V1** (face-frame = V2)
- **All math in mm internally** (convert for display only)
- **Joinery affects cut lists** (dado adds depth to panels)
- **Toe kick options** (standard/custom/none)
- **Progressive complexity** (Tier 1: simple defaults → Tier 3: full control)
- **Mobile-first approach** (competitive advantage vs desktop-only tools)
- **One-time purchase pricing** (vs competitors' $108-288/year subscriptions)

---

## Documentation Structure

**For Planning (Claude.ai):**
- This file (ROADMAP.md) - strategic overview
- FEATURE_BACKLOG.md - V2+ deferred features
- SHEET_OPTIMIZER_RESEARCH.md - competitive analysis & algorithm guidance

**For Implementation (Claude Code):**
- WORK_PLAN.md - detailed implementation steps for current phase
- CLAUDE.md - technical context, implemented modules, gotchas

**For UX Decisions:**
- UX_DECISIONS.md - design rationale with examples

**Archived:**
- docs/archive/ - completed session plans and outdated implementation docs

---

## Next Steps

**Ready to start Phase 4?** See WORK_PLAN.md for detailed implementation steps.

**Command for Claude Code:**
```bash
Read WORK_PLAN.md and implement Phase 4 Milestone 4.1: 
bin packing algorithm (src/utils/optimizer/binPacking.ts)
```
