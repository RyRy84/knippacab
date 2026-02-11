# KnippaCab Development Roadmap

**Purpose:** Guide development from foundation to MVP with clear milestones and deliverables.  
**Last Updated:** February 11, 2026
**Current Phase:** Phase 5 — PDF Export & Final Polish (IN PROGRESS — 5.1 complete)

---

## Vision Statement

Build a cross-platform cabinet design app that **eliminates calculation errors** in woodworking by automating reveal calculations, joinery dimension adjustments, and sheet goods optimization. Target DIY woodworkers from beginner to intermediate skill levels who need professional-quality cutting plans without the professional-level math.

**Core Differentiator:** Mobile-first measurement input + joinery-aware calculations + grain-intelligent cutting optimization in a single tool.

---

## Development Philosophy

1. **Build tangible features first** - Users can touch/test immediately
2. **Grow with configurability** - Let users adapt to their needs
3. **Layer complexity gradually** - Simple defaults, advanced options available
4. **Document as we build** - Future AI collaborators need context
5. **Test with real scenarios** - Every feature validated with actual cabinet projects

---

## Current State ✅

**Completed:**
- ✅ Project scaffolded (Expo + React Native + TypeScript)
- ✅ Folder structure established
- ✅ Unit conversion utility (`src/utils/unitConversion.ts`)
- ✅ TypeScript types defined (`src/types/index.ts`) — including `PartType` union
- ✅ Cabinet constants (`src/constants/cabinetDefaults.ts`)
- ✅ Navigation framework with placeholder screens
- ✅ App is runnable and navigable
- ✅ Cabinet dimension calculator (`src/utils/cabinetCalculator.ts`) — generates all parts incl. doors
- ✅ Drawer dimension calculator (`src/utils/drawerCalculator.ts`) — generates all parts incl. drawer face
- ✅ Reveal & gap calculator (`src/utils/revealCalculator.ts`)
- ✅ Grain direction logic (`src/utils/grainLogic.ts`)
- ✅ SQLite database (schema, migrations, CRUD queries)
- ✅ Web platform stubs for SQLite (`init.web.ts`, `queries.web.ts`)
- ✅ Zustand stores: projectStore, settingsStore, uiStore
- ✅ Unit tests — 93 tests passing (cabinetCalculator, drawerCalculator, revealCalculator, grainLogic)
- ✅ CalculatorDemoScreen — visual validation of calculation engine (3 tabs)
- ✅ ProjectSetupScreen — functional form (name, units, joinery)
- ✅ CabinetBuilderScreen — type selector, width + preset buttons, toe kick, joinery; edit mode; loading state
- ✅ ReviewEditScreen — cabinet cards with Edit/Delete/drawer count badge, "Generate Cut List"

- ✅ CuttingPlanScreen — functional cut list screen (parts grouped by material, grain direction badges, export placeholder)
- ✅ DrawerBuilderScreen — drawer count stepper, per-drawer height inputs, auto-balance, corner joinery + bottom method selectors
- ✅ MeasurementInput component — fractional Imperial input (`"36 1/2"`, `"3' 6"`) + Metric, with parsing and canonical re-format on blur
- ✅ `src/utils/optimizer/types.ts` — all Phase 4 types (OptimizationSettings, ExpandedPart, PlacedPart, SheetLayout, OptimizationResult)
- ✅ `src/utils/optimizer/binPacking.ts` — Guillotine BSSF bin packing with grain-direction constraints
- ✅ `src/components/CuttingDiagram.tsx` — SVG cutting diagram (parts colour-coded by cabinet, labels, grain symbols, rotation indicator)
- ✅ `src/screens/VisualDiagramScreen.tsx` — full cutting diagram screen with settings panel, multi-material tabs, per-sheet SVG diagrams

- ✅ **`expo-print` installed** — SDK 54 compatible PDF generation library
- ✅ **`src/utils/pdfGenerator.ts`** — PDF generation module (cover page, cut list table, inline SVG cutting diagrams, `exportToPdf()`)
- ✅ **Export PDF button wired** in `CuttingPlanScreen` and `VisualDiagramScreen` — replaces placeholder Alert with real PDF export + loading state

**What We Have:**
**Phases 1–4 + Phase 5.1 are complete.** Full end-to-end workflow operational:
create project → add cabinets → add drawers → review list → view cut list → view cutting diagram → **export to PDF**.
The full optimizer pipeline is validated with 156 unit tests. Web version runs cleanly.

**Git Commits:** 19 total
**Lines of Code:** ~10,500+
**Can Run?** Yes (`npx expo start --web`)

---

## Phase 1: Foundation & Core Calculations 🔨

**Goal:** Build the calculation engine that makes the app valuable - door/drawer dimension calculators with joinery awareness.

**Timeline:** 2-3 weeks  
**Complexity:** Medium (pure logic, well-defined math)

### Milestones

#### 1.1 Cabinet Dimension Calculator (`src/utils/cabinetCalculator.ts`)
**What:** Functions that calculate all cabinet part dimensions based on type, size, joinery method, and toe kick option.

**Key Functions:**
```typescript
calculateCabinetParts(cabinet: Cabinet): Part[]
adjustForJoinery(part: Part, joinery: JoineryMethod): Part
calculateDoorDimensions(cabinetWidth, cabinetHeight): { width, height }
calculateToeKickHeight(option: ToeKickOption, customHeight?: number): number
```

**Test Cases:**
- Base cabinet, pocket screws, standard toe kick → correct part dimensions
- Wall cabinet, dado joints → parts adjusted for 6.35mm dado depth  
- Base cabinet, no toe kick → sides are shorter
- Custom toe kick at 120mm → correct height adjustment

**Success Criteria:**
- [x] All standard cabinet types calculate correctly
- [x] Joinery adjustments work for all 4 methods
- [x] Toe kick options all calculate properly
- [x] Unit tests pass for edge cases

**Deliverable:** Working calculator module with comprehensive tests

---

#### 1.2 Drawer Dimension Calculator (`src/utils/drawerCalculator.ts`)
**What:** Calculate drawer box and face dimensions based on construction method.

**Key Functions:**
```typescript
calculateDrawerParts(drawer: Drawer): Part[]
adjustDrawerForJoinery(parts: Part[], cornerJoinery, bottomMethod): Part[]
calculateDrawerFaceDimensions(drawerWidth, drawerHeight): { width, height }
```

**Test Cases:**
- Pocket screw corners + applied bottom → standard dimensions
- Dado corners + captured bottom → front/back shorter, bottom sized for grooves
- Multiple drawer heights in one cabinet → faces calculated with reveals

**Success Criteria:**
- [x] All 3 corner joinery methods calculate correctly
- [x] All 3 bottom attachment methods work
- [x] Drawer faces sized properly with reveals
- [x] Unit tests pass

**Deliverable:** Working drawer calculator with tests

---

#### 1.3 Reveal & Gap Calculator (`src/utils/revealCalculator.ts`)
**What:** The "magic" that eliminates manual reveal math - calculates door/drawer face dimensions with proper gaps.

**Key Functions:**
```typescript
calculateSingleDoorDims(cabinetWidth, cabinetHeight): { width, height }
calculateDoubleDoorDims(cabinetWidth, cabinetHeight): { leftWidth, rightWidth, height }
calculateDrawerFaceDims(openingWidth, openingHeight): { width, height }
```

**Test Cases:**
- 914mm wide cabinet → 911mm door (3mm reveal)
- 914mm wide cabinet, double doors → 2× 453.25mm doors (3mm side reveal + 3mm center gap)
- Stack of 3 drawers → faces calculated with 3mm gaps between

**Success Criteria:**
- [x] Single doors sized correctly
- [x] Double doors sized correctly with center gap
- [x] Drawer faces account for reveals
- [x] Works in both Imperial and Metric display

**Deliverable:** Reveal calculator that handles all scenarios

---

#### 1.4 Material & Grain Direction Logic (`src/utils/grainLogic.ts`)
**What:** Determine which parts can rotate for cutting optimization vs. must maintain grain direction.

**Key Functions:**
```typescript
assignGrainDirection(part: Part): GrainDirection
canRotatePart(part: Part): boolean
getOptimalOrientation(part: Part): 'horizontal' | 'vertical'
```

**Rules:**
- Cabinet sides → vertical grain (cannot rotate)
- Cabinet tops/bottoms → horizontal grain (cannot rotate)
- Cabinet backs → vertical preferred (can rotate if needed)
- Drawer sides → vertical (cannot rotate)
- Drawer fronts/backs → horizontal (cannot rotate)
- Drawer bottoms → either (can rotate)
- Hidden shelves → either (can rotate)

**Success Criteria:**
- [x] All part types assigned correct grain rules
- [x] Rotation permissions accurate
- [x] Logic documented with reasoning

**Deliverable:** Grain direction rule engine

---

### Phase 1 Success Criteria

**Can we calculate a complete cabinet?**
- [x] User inputs: Base cabinet, 914mm wide, pocket screws, standard toe kick
- [x] App calculates: All part dimensions including adjusted door size
- [x] Output: Complete parts list with grain directions
- [x] Verified: Manual calculation matches app output (93 unit tests)

**Testing Strategy:**
- Unit tests for each calculator function
- Integration test: Full cabinet calculation end-to-end
- Real-world validation: Build actual test cabinet from app's cut list

**Risk Mitigation:**
- Edge cases documented (zero dimensions, negative values, extreme sizes)
- Dado depth configurable (not hardcoded)
- Imperial/Metric conversions tested thoroughly

---

## Phase 2: Data Persistence & Project Management 💾

**Goal:** Let users save their work and manage multiple projects.

**Timeline:** 1-2 weeks  
**Complexity:** Low-Medium (standard CRUD operations)

### Milestones

#### 2.1 SQLite Database Setup (`src/db/`)
**What:** Initialize database, create tables, write migration system.

**Files:**
- `src/db/schema.ts` - Table definitions
- `src/db/init.ts` - Database initialization
- `src/db/migrations.ts` - Version management
- `src/db/queries.ts` - CRUD operations

**Tables:**
- Projects
- Cabinets  
- Drawers
- Parts (auto-generated, cached)

**Success Criteria:**
- [ ] Database creates on first app launch
- [ ] Tables created with correct schema
- [ ] Foreign key relationships work
- [ ] Can insert/query data

---

#### 2.2 State Management with Zustand (`src/store/`)
**What:** Global app state for current project, UI state, preferences.

**Stores:**
- `projectStore.ts` - Current project, cabinets, drawers
- `uiStore.ts` - Navigation state, modal visibility
- `settingsStore.ts` - User preferences (units, default joinery)

**Why Zustand:** Simpler than Redux, less boilerplate, works well with TypeScript.

**Success Criteria:**
- [ ] State persists across navigation
- [ ] Changes trigger UI updates
- [ ] Store syncs with SQLite
- [ ] TypeScript types enforced

---

#### 2.3 CRUD Operations for Projects
**What:** Create, read, update, delete projects and cabinets.

**Features:**
- Create new project with settings
- Save project to database
- Load existing project
- Edit project details
- Delete project (with confirmation)
- Auto-save on changes

**Success Criteria:**
- [ ] Can create and save project
- [ ] Can load saved project
- [ ] Edits persist to database
- [ ] Delete removes all related data

---

### Phase 2 Success Criteria

**Can a user save and reload their work?**
- [ ] Create project with 3 cabinets
- [ ] Close app completely
- [ ] Reopen app
- [ ] Load project - all data intact

**Testing Strategy:**
- Database migrations tested on fresh install
- CRUD operations tested for all entities
- State persistence tested across app lifecycle

---

## Phase 3: User Interface Implementation 🎨

**Goal:** Build the actual screens where users input data and review results.

**Timeline:** 3-4 weeks  
**Complexity:** High (UX design + React Native learning curve)

### Milestones

#### 3.1 Project Setup Screen (REAL Implementation)
**Current:** Placeholder that just navigates  
**Target:** Functional input form

**Features:**
- Project name input
- Unit selection (Imperial/Metric) with toggle
- Default joinery method picker (radio buttons/dropdown)
- Default saw kerf setting
- "Create Project" button → navigates to Cabinet Builder

**Form Validation:**
- Project name required
- All fields pre-filled with sensible defaults

**Success Criteria:**
- [x] Form inputs work (controlled components)
- [x] Validation provides helpful feedback
- [x] Creates project in database
- [x] Navigates with project ID in route params

---

#### 3.2 Cabinet Builder Screen (REAL Implementation)
**The core UX of the app**

**Features:**
1. **Cabinet Type Selector**
   - Three buttons: Base / Wall / Tall
   - Tapping one shows preset dimensions

2. **Dimension Inputs**
   - Width, Height, Depth (in user's preferred units)
   - Standard size quick-select buttons (914mm, 762mm, etc.)
   - Custom input fields for exact dimensions

3. **Toe Kick Options (Base cabinets only)**
   - Radio buttons: Standard 4" / Custom / None
   - If Custom: number input for height

4. **Joinery Method Selector**
   - Dropdown or segmented control
   - Shows project default, allows override
   - Info icon → explains each method

5. **Live Preview Panel**
   - Shows calculated door dimensions
   - Shows total part count
   - Updates as user changes inputs

6. **Action Buttons**
   - "Add Drawers" → navigates to Drawer Builder
   - "Add to Project" → saves cabinet, returns to list
   - "Cancel"

**Success Criteria:**
- [x] All inputs work smoothly
- [x] Units convert properly (mm ↔ inches)
- [ ] Preview updates in real-time (deferred — defaults card shown instead)
- [x] Cabinet saves to database
- [x] Form clears after save

---

#### 3.3 Drawer Builder Screen
**Opens from Cabinet Builder**

**Features:**
1. **Number of Drawers Selector**
   - Number input or stepper (1-10)

2. **Drawer Heights Input**
   - List of height inputs (one per drawer)
   - Auto-suggests equal division
   - User can customize each

3. **Construction Method Selectors**
   - Corner joinery dropdown
   - Bottom attachment dropdown
   - Info icons explain each

4. **Live Calculation Display**
   - Shows drawer box dimensions
   - Shows drawer face dimensions
   - Updates as user changes options

5. **Action Buttons**
   - "Add Drawers to Cabinet" → saves, returns to Cabinet Builder
   - "Cancel"

**Success Criteria:**
- [x] Dynamic drawer count works
- [x] Heights auto-suggest intelligently
- [x] Construction methods calculate correctly
- [x] Saves drawer configs to database

---

#### 3.4 Review/Edit Screen
**Shows all cabinets in current project**

**Features:**
1. **Project Header**
   - Project name
   - Total cabinets count
   - Edit project settings button

2. **Cabinet List**
   - Card for each cabinet showing:
     - Type badge (Base/Wall/Tall)
     - Dimensions
     - Joinery method
     - Drawer count (if any)
   - Tap card → edit cabinet
   - Swipe → delete (with confirmation)

3. **Action Buttons**
   - "Add Another Cabinet"
   - "Generate Cut List" → navigates to Cut List screen

**Success Criteria:**
- [x] Lists all cabinets
- [ ] Edit navigates back to builder (pre-filled) — deferred to next session
- [x] Delete removes from database
- [x] UI updates immediately

---

#### 3.5 Cut List Screen
**Shows all parts calculated from all cabinets**

**Features:**
1. **Parts List (Grouped by Material)**
   - Group headers: "3/4\" Plywood Sides", "1/4\" Plywood Backs", etc.
   - Each part shows:
     - Part name (e.g., "Base Cabinet Side #1")
     - Dimensions (in user's units)
     - Quantity
     - Grain direction indicator (arrow icon)
   - Total count per material type

2. **View Options**
   - Toggle: Simple / Detailed
   - Simple: Just dimensions
   - Detailed: + Grain direction, joinery notes, cabinet reference

3. **Export Button**
   - "Export PDF" (placeholder for Phase 4)
   - "Share" (uses native share sheet)

**Success Criteria:**
- [x] Parts calculated from all cabinets
- [x] Grouped logically
- [x] Dimensions shown in correct units
- [x] Grain indicators clear

---

### Phase 3 Success Criteria

**Can a user complete the workflow?**
- [ ] Create new project
- [ ] Build 2 cabinets with different joinery
- [ ] Add drawers to one cabinet
- [ ] Review cut list
- [ ] All data persists correctly

**Testing Strategy:**
- Manual UI testing on web, iOS, Android
- Accessibility review (screen reader, color contrast)
- Real user testing with non-technical woodworker

**Risk Mitigation:**
- Start with web (fastest iteration)
- Use React Native Paper or similar UI library (consistent components)
- Mock complex calculations first, integrate later

---

## Phase 4: Sheet Goods Optimization 🎯

**Goal:** The killer feature - visual cutting diagrams that respect grain direction.

**Timeline:** 3-4 weeks  
**Complexity:** Very High (algorithm + visualization)

### Milestones

#### 4.1 Bin Packing Algorithm (`src/utils/optimizer/`)
**What:** Arrange parts on standard sheets to minimize waste.

**Approach:** Start with **First-Fit Decreasing (FFD)** algorithm

**Algorithm Steps:**
1. Sort parts by area (largest first)
2. For each part:
   - Try to place in existing sheet (top-left, then row-wise)
   - If doesn't fit, start new sheet
3. Account for saw kerf between parts
4. Respect grain direction constraints (cannot rotate certain parts)

**Files:**
- `src/utils/optimizer/binPacking.ts` - Core algorithm
- `src/utils/optimizer/placement.ts` - Part placement logic
- `src/utils/optimizer/sheetLayout.ts` - Sheet layout data structure

**Test Cases:**
- 8 cabinet sides (vertical grain) → should pack efficiently
- Mixed parts (rotatable + non-rotatable) → respects constraints
- Large parts (>1220mm) → flags as "needs special handling"

**Success Criteria:**
- [x] Algorithm runs without errors
- [x] Produces valid layouts (no overlaps) — verified by unit tests
- [x] Respects grain constraints
- [x] Completes in <2 seconds for typical project (~1ms actual)
- NOTE: Guillotine BSSF is a heuristic; efficiency varies by part combination.
  "Tightly constrained" projects (many tall grain-locked parts) may use 3 sheets
  where an ideal packer would use 2. Manual override is a V2 feature.

---

#### 4.2 SVG Cutting Diagram (`src/components/CuttingDiagram.tsx`) ✅ COMPLETE

**What:** Single-file component rendering one `SheetLayout` as a scaled SVG.

**Implemented:**
- Sheet background grey (waste = uncovered grey)
- Parts as colour-coded rectangles (10-colour palette, one per cabinet)
- 3-tier label density: small → colour only; medium → name; large → name+dims+grain
- Grain direction symbols (↕/↔) in labels
- Rotation indicator (↻) on rotated parts
- Text clipped to part bounds via SVG `<ClipPath>`
- `containerWidth` prop + `onLayout` for proportional scaling

---

#### 4.3 Visual Diagram Screen (`src/screens/VisualDiagramScreen.tsx`) ✅ COMPLETE

**What:** Full screen wiring together the optimizer and CuttingDiagram components.

**Implemented:**
- Blue header: project name + total sheets / parts / utilization %
- Collapsible settings panel: sheet width, sheet height, kerf (MeasurementInput)
- Settings changes reactively re-run the optimizer (useMemo)
- Multi-material tabs (only shown when >1 material group)
- Per-sheet cards: header with utilization badge + SVG diagram + part list
- Oversized parts shown in an orange warning card
- Export PDF placeholder button in footer

---

### Phase 4 Success Criteria

**Can the optimizer handle a real project?**
- [x] Project with cabinets + drawers: all parts placed correctly
- [x] Optimizes to minimum sheets (Guillotine BSSF heuristic)
- [x] Visual diagram renders at full project scale
- [x] 156 unit tests passing, 0 TypeScript errors
- [ ] Woodworker takes PDF to shop — deferred to Phase 5 (PDF export)

**Testing Strategy:**
- 17 optimizer unit tests covering correctness, grain constraints, multi-sheet, utilization, oversized parts, kerf spacing
- TypeScript strict-mode (zero errors)
- Manual QA on web via `npx expo start --web`

---

## Phase 5: Polish & MVP Completion 🚀

**Goal:** Professional quality, ready for real users.

**Timeline:** 2-3 weeks  
**Complexity:** Medium (refinement, not new features)

### Milestones

#### 5.1 PDF Export (`src/utils/pdfGenerator.ts`) ✅ COMPLETE

**What:** Generate shop-ready PDF documents.

**Implemented:**
- **`expo-print`** installed (SDK 54 compatible, HTML → PDF via platform print system)
- **`src/utils/pdfGenerator.ts`** — HTML/SVG PDF generation:
  - Cover page: project name, date, summary stats (cabinets/pieces/sheets), material summary table
  - Cut list section: all parts grouped by material, table with qty/width/height/thickness/grain badge/notes
  - Cutting diagram section: inline SVG per sheet, colour-coded by cabinet (same palette as screen), part labels + mm dimensions, utilization badge, parts legend
  - Print-friendly CSS (`@page` settings, page-break divs, letter size)
- **Export PDF** button wired in `CuttingPlanScreen` (runs optimizer with default settings) and `VisualDiagramScreen` (uses current settings)
- Loading state (ActivityIndicator) while generating

**Platform behaviour:**
- Web: browser print dialog → Save as PDF
- iOS: AirPrint / Save to Files sheet
- Android: system print manager

**`generatePdfHtml(opts)`** exported separately for future unit testing.

**Success Criteria:**
- [x] PDF generates successfully
- [x] Print-friendly layout (B&W-compatible grain badges, letter @page size)
- [x] Readable at 8.5×11 print size
- [x] Cover + cut list + cutting diagrams in one document

---

#### 5.2 Settings & Preferences
**What:** Let users customize app behavior.

**Settings:**
- **Units:** Imperial / Metric
- **Default Joinery:** Pocket / Butt / Dado / Dowel
- **Default Saw Kerf:** Number input
- **Default Toe Kick:** Standard / Custom (with height) / None
- **Theme:** Light / Dark (if time allows)

**Persistence:** Save to SQLite or AsyncStorage

**Success Criteria:**
- [ ] Settings save and persist
- [ ] Changes apply throughout app
- [ ] Defaults used in new projects

---

#### 5.3 Hardware Recommendations
**What:** Suggest screws, hinges, drawer slides based on joinery and cabinet type.

**Logic:**
- Pocket screw joinery → Kreg pocket screws (2-1/2" and 1-1/4")
- Dado joinery → Wood glue + 18-gauge brads
- Frameless cabinets → European cup hinges (107° or 120°)
- Drawer sizes → Appropriate slide lengths

**Display:**
- Simple list with quantities
- Optional: Links to purchase (Amazon, Rockler)

**Success Criteria:**
- [ ] Recommendations accurate
- [ ] Quantities calculated correctly
- [ ] Helpful to users (validated with testers)

---

#### 5.4 Error Handling & Validation
**What:** Graceful handling of edge cases and user errors.

**Scenarios:**
- User enters negative dimensions → show error, prevent save
- Cabinet too wide for sheet → warn before optimization
- Drawer heights exceed cabinet height → show error
- No cabinets in project → disable "Generate Cut List" button
- Database error → show friendly message, log for debugging

**UX Improvements:**
- Inline validation on inputs
- Helpful error messages (not technical jargon)
- Undo/redo on accidental deletes
- Confirmation dialogs for destructive actions

**Success Criteria:**
- [ ] No app crashes on bad input
- [ ] Errors explained clearly
- [ ] Users can recover from mistakes

---

#### 5.5 Testing & Bug Fixes
**What:** Systematic testing before release.

**Test Plan:**
1. **Unit Tests**
   - All calculator functions
   - Edge cases covered
   - 80%+ code coverage

2. **Integration Tests**
   - Full workflows (create → build → cut list → PDF)
   - Database operations
   - State management

3. **Manual Testing**
   - Build actual test cabinets from app output
   - Test on Android, iOS, Web
   - Different screen sizes

4. **User Acceptance Testing**
   - 5-10 beta testers (woodworkers)
   - Real projects
   - Feedback collection
   - Bug reporting

**Success Criteria:**
- [ ] No critical bugs
- [ ] Beta testers complete projects successfully
- [ ] Feedback incorporated

---

### Phase 5 Success Criteria

**Is the app ready for real users?**
- [ ] Complete workflow tested end-to-end
- [ ] Runs on all platforms (Android, iOS, Web)
- [ ] PDF export works
- [ ] No crashes on typical usage
- [ ] Documentation exists (README, user guide)
- [ ] At least 3 beta testers successfully build cabinets from app

**Launch Checklist:**
- [ ] App store assets ready (screenshots, description)
- [ ] Privacy policy written
- [ ] Terms of service written
- [ ] Support email set up
- [ ] Landing page created (explains app)
- [ ] Pricing decided (free vs paid)

---

## Success Metrics (Post-Launch)

**Engagement:**
- Daily Active Users (DAU)
- Projects created per user
- Cut lists generated
- PDFs exported

**Quality:**
- App crash rate (<1%)
- Average session length (>10 minutes indicates deep usage)
- Feature usage (which features most used?)

**Feedback:**
- App store ratings (target: 4.5+ stars)
- User reviews (qualitative feedback)
- Support emails (what do users struggle with?)

**Business:**
- Downloads
- Conversion to paid (if freemium model)
- Retention (30-day, 90-day)

---

## Critical Path Analysis

**Must be done in order:**
1. ✅ Foundation (types, constants, navigation)
2. Phase 1 → Calculations (can't build UI without logic)
3. Phase 2 → Data persistence (need storage before optimization)
4. Phase 3 → UI (can't test without interface)
5. Phase 4 → Optimization (needs all cabinets data)
6. Phase 5 → Polish (final layer)

**Can be parallelized:**
- Phase 3 (UI screens) - different screens can be built in parallel
- Phase 5 (PDF export + Settings) - independent features

**Blockers to watch:**
- React Native learning curve (Phase 3)
- SVG rendering performance (Phase 4)
- PDF generation library issues (Phase 5)

---

## Risk Mitigation

**Technical Risks:**
- **Risk:** Optimization algorithm too slow
  - **Mitigation:** Start simple (FFD), optimize if needed
- **Risk:** SVG doesn't render well on mobile
  - **Mitigation:** Test early, fallback to Canvas if needed
- **Risk:** SQLite migration errors
  - **Mitigation:** Comprehensive tests, version management

**Product Risks:**
- **Risk:** Users find UI confusing
  - **Mitigation:** Early user testing, iterate on feedback
- **Risk:** Calculations don't match real-world expectations
  - **Mitigation:** Build test cabinets, validate with experienced woodworkers

**Scope Risks:**
- **Risk:** Feature creep (adding V2 features to V1)
  - **Mitigation:** Strict MVP definition, parking lot for future ideas

---

## V2 Features (Post-MVP)

**Explicitly Deferred:**
- 3D visualization (nice-to-have, not essential)
- Bluetooth measuring devices (hardware integration complexity)
- Face-frame cabinet support (different math, smaller market)
- Cloud sync (infrastructure cost, privacy concerns)
- Dovetail drawer construction (advanced, niche)
- Room layout planner (scope too large)

**High Priority V2:**
- Better optimization algorithms (genetic, best-fit)
- Manual layout adjustment (drag parts on sheet)
- Material cost tracking and shopping integration
- Assembly instruction generator (step-by-step with images)

---

## How to Use This Roadmap

**For Ryan:**
- Check current phase to know what's next
- Review success criteria before moving to next phase
- Update "Current State" section as you progress

**For Claude.ai (Planning Sessions):**
- Reference this for architectural decisions
- Suggest which phase/milestone to tackle next
- Identify dependencies and blockers

**For Claude Code (Implementation):**
- Read relevant phase before starting work
- Follow success criteria as acceptance tests
- Update CLAUDE.md when modules completed
- Reference this roadmap in commit messages

**For All:**
This is a living document. Update it when:
- Scope changes
- New insights emerge
- Priorities shift
- Phases complete

---

**Phase 5.1 (PDF Export) is COMPLETE.** Full export works from both CuttingPlanScreen and VisualDiagramScreen.

Priority options for the next session:

**Option A: Settings Persistence (Phase 5.2 / 5.3)**
- Wire VisualDiagramScreen's sheet settings (width/height/kerf) to SQLite settings store
- So settings survive navigation and app restarts
- Also finish the full Phase 5.2 Settings screen

**Option B: Hardware Recommendations (Phase 5.3)**
- Suggest screws, hinges, drawer slides based on joinery method and cabinet type
- Simple list with quantities; include in PDF export

**Option C: Home Screen Project Management polish**
- Load and display saved projects on HomeScreen
- Allow opening, renaming, or deleting projects

**Command to Claude Code:**
```
Read CLAUDE.md and ROADMAP.md, then continue with Phase 5.
Phase 5.1 (PDF Export) is complete (156 tests, 0 TS errors).
Next priority: settings persistence or hardware recommendations.
```
