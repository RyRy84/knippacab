# KnippaCab - Claude Code Project Guide

## Project Overview

KnippaCab is a cross-platform cabinet design app built with **React Native + Expo**. It helps DIY woodworkers and professionals design frameless (European-style) cabinets, calculate dimensions, generate cut lists, and optimize sheet goods cutting patterns.

**Core value:** Eliminate calculation errors that waste expensive materials — automate reveal calculations, joinery dimension adjustments, and cutting optimization.

## Tech Stack

- **Framework:** React Native with Expo (cross-platform: Android, iOS, Web)
- **Language:** TypeScript
- **Navigation:** React Navigation
- **State Management:** Zustand (lightweight, similar to simple Redux)
- **Local Database:** SQLite (expo-sqlite)
- **2D Graphics:** React Native SVG (for cutting diagrams)
- **PDF Export:** jsPDF or react-native-pdf (evaluate during development)
- **Units:** All internal math in millimeters; display converts to user preference (Imperial/Metric)

## Project Structure

```
KnippaCab/
├── CLAUDE.md              # This file — project context for Claude Code
├── app.json               # Expo config
├── package.json
├── tsconfig.json
├── App.tsx                # Entry point
├── src/
│   ├── screens/           # Full screens (Home, ProjectSetup, CabinetBuilder, etc.)
│   ├── components/        # Reusable UI components
│   ├── navigation/        # React Navigation setup and route definitions
│   ├── utils/             # Pure logic modules (unit conversion, calculations)
│   ├── constants/         # Standard dimensions, defaults, enums
│   ├── types/             # TypeScript interfaces and type definitions
│   ├── db/                # SQLite schema, queries, migration helpers
│   └── assets/            # Images, icons, fonts
```

## Key Architecture Decisions (Already Made)

1. **Frameless cabinets only for V1** — simpler standardized math, face-frame deferred to V2
2. **All math internally in mm** — convert to inches/feet only for display when user selects Imperial
3. **Joinery method affects cut list dimensions** — dado joints add depth to relevant parts
4. **Toe kick is a V1 feature** — options: Standard 4" / Custom height / None (feet/frame)
5. **Sheet goods optimizer is the killer feature** — 2D bin packing with grain direction constraints
6. **Default joinery: Pocket screws** — beginner-friendly, user can override per cabinet

## Construction Standards Reference

### Standard Reveals (Frameless)
- Side reveals: 1.5mm each side (3mm total)
- Between double doors: 3mm gap
- Top reveal: 3mm
- Bottom reveal: 0-3mm

### Door Calculations
```
Single door width = Cabinet width - 3mm
Double door width (each) = (Cabinet width - 3mm) / 2 - 1.5mm
Door height = Cabinet height - 3mm (top) - 0mm (bottom, base cabs)
```

### Standard Dimensions (Base Cabinets)
- Height: 34.5" (876mm) — 36" with 1.5" countertop
- Depth: 24" (610mm) box
- Widths: 9", 12", 15", 18", 21", 24", 27", 30", 33", 36", 39", 42", 48"
- Toe kick: 4" (102mm) standard

### Saw Kerf
- Default: 1/8" (3.175mm), user-configurable

## V1 MVP Feature Set

### Must-Have
1. Manual measurement input (Imperial + Metric)
2. Cabinet configuration (type, dimensions, toe kick, joinery method)
3. Cabinet type picker (base/wall/tall with standard presets)
4. Drawer builder (corner joinery + bottom method selection)
5. Automated door/drawer face calculator (reveal math)
6. Cut list generator (grain direction, joinery adjustments, grouped by material)
7. Sheet goods optimizer with visual 2D cutting diagram

### Nice-to-Have V1
- 2D cabinet wireframe preview
- Material cost estimation
- Hardware recommendations based on joinery
- Save/load projects (local SQLite)
- Assembly instructions adapted to joinery method

### Explicitly V2
- 3D visualization
- Bluetooth measuring device integration
- Face-frame cabinet support
- Cloud sync
- Dovetail drawer construction

## Joinery Methods Supported (V1)

| Method | Difficulty | Cut List Impact |
|--------|-----------|-----------------|
| Butt Joints + Screws | Beginner | No adjustment |
| Pocket Hole Screws | Beginner (DEFAULT) | No adjustment |
| Dado & Rabbet + Glue | Intermediate | Add dado depth to relevant dims |
| Dowel Joints + Glue | Intermediate | No adjustment |

## Drawer Construction Options (V1)

**Corner joinery:** Pocket hole (default) / Butt joints / Dado
**Bottom attachment:** Applied (nailed under) / Captured in dado groove / Screwed from below

## Database Tables

Projects, Cabinets, Drawers, Parts (auto-generated), CutSheets, Materials (library), Hardware (library), JoineryMethods (reference)

See `Projects/knippacab-notes.md` in RyRy84/project-management repo for full schema.

## Screen Flow

Home → Project Setup (name, units, default joinery) → Cabinet Builder (type, dimensions, toe kick, joinery) → Drawer Builder (within cabinet) → Review/Edit → Generate Cutting Plan → Visual Diagram → Export

## Development Notes

- **Developer background:** Experienced in Python and C#, learning React Native/TypeScript
- **Explain React Native concepts** when they differ significantly from C#/.NET patterns
- **Prefer explicit, readable code** over clever abstractions during the learning phase
- **Test on web first** (`npx expo start` → press `w`) for fastest iteration
- **Commit frequently** with descriptive messages

## Commands

```bash
npx expo start          # Start dev server
npx expo start --web    # Start directly in web mode
npx expo install <pkg>  # Install Expo-compatible package versions
```

## Git

- Remote: github.com/RyRy84/knippacab
- Branch strategy: main for stable, feature branches for new work
- Commit style: conventional commits (feat:, fix:, docs:, refactor:)

## Implemented Modules

### `src/utils/unitConversion.ts` — Unit Conversion & Display Formatting

**Purpose:** All internal math uses mm. This module handles every conversion between mm and Imperial (inches, feet+inches, fractional inches to 1/16" precision) and formats values for display.

**Constants:**
- `MM_PER_INCH` = 25.4
- `INCHES_PER_FOOT` = 12
- `DEFAULT_SAW_KERF_MM` = 3.175 (1/8" blade kerf — user-configurable in project settings)
- `FRACTION_PRECISION` = 16 (display rounds to nearest 1/16")

**Types:**
- `FractionalInches` — `{ inches, numerator, denominator }` (e.g., 24 3/16")
- `FeetInches` — `{ feet, inches, numerator, denominator }` (e.g., 3'-6 1/2")
- `UnitSystem` — `"metric" | "imperial"` (used by UI to pick display format)

**Core Functions:**

| Function | Direction | Example |
|----------|-----------|---------|
| `mmToInches(mm)` | mm → decimal inches | `25.4 → 1` |
| `inchesToMm(inches)` | decimal inches → mm | `24 → 609.6` |
| `mmToFeet(mm)` | mm → decimal feet | `914.4 → 3` |
| `feetToMm(feet)` | decimal feet → mm | `4 → 1219.2` |
| `mmToFractionalInches(mm)` | mm → FractionalInches | `614.3625 → {inches:24, num:3, den:16}` |
| `mmToFeetInches(mm)` | mm → FeetInches | `1000 → {feet:3, inches:3, num:3, den:8}` |
| `fractionalInchesToMm(inches, num, den)` | fractional inches → mm | `24, 3, 16 → 614.3625` |
| `feetInchesToMm(feet, inches, num, den)` | feet+inches → mm | `2, 6, 3, 8 → 771.525` |

**Display Formatters:**

| Function | Output Example |
|----------|---------------|
| `formatFractionalInches(value)` | `'24 3/16"'` |
| `formatFeetInches(value)` | `"3'-3 3/8\""` |
| `formatMm(mm)` | `"614.4 mm"` |
| `formatForDisplay(mm, unitSystem, useFeet?)` | Auto-formats based on user preference |

**Helper:** `reduceFraction(num, den)` — simplifies fractions for clean display (8/16 → 1/2).

**Usage pattern from UI components:**
```typescript
import { formatForDisplay } from "../utils/unitConversion";
// Display a stored mm value in the user's preferred units:
const label = formatForDisplay(876, "imperial");  // → '34 1/2"'
```

**Edge cases handled:** zero values, negative values, fraction rounding carry-over (15.9/16 → next whole inch → next foot), division-by-zero guard on denominator.

**Code style:** Heavily commented with C# comparison notes throughout. All functions have JSDoc with examples. Written for readability over cleverness — developer is learning TypeScript from a C#/.NET background.

---

### `src/utils/helpers.ts` — ID Generation & Date Utilities

- `generateId(): string` — UUID v4 without extra dependencies
- `nowIso(): string` — current UTC time as ISO 8601 string

---

### `src/db/schema.ts` — SQLite Table Definitions

SQL CREATE TABLE strings for: `projects`, `cabinets`, `drawers`, `settings`. Also index definitions. `CURRENT_SCHEMA_VERSION = 1`.

### `src/db/migrations.ts` — Migration Definitions

`MIGRATIONS: Migration[]` array. Each entry has `version`, `description`, `statements[]`. Add new entries to extend the schema — never edit existing ones.

### `src/db/init.ts` — Database Initialization

- `initDatabase(): void` — call once at app startup (idempotent). Opens `knippacab.db`, enables foreign keys, runs pending migrations.
- `getDb(): SQLiteDatabase` — returns the singleton (throws if not initialized).
- `closeDatabase(): void` — for testing/cleanup.

### `src/db/queries.ts` — CRUD Operations

| Entity | Functions |
|--------|-----------|
| Project | `getAllProjects`, `getProject`, `insertProject`, `updateProject`, `deleteProject` |
| Cabinet | `getCabinetsForProject`, `getCabinet`, `insertCabinet`, `updateCabinet`, `deleteCabinet` |
| Drawer | `getDrawersForCabinet`, `getDrawer`, `insertDrawer`, `updateDrawer`, `deleteDrawer` |
| Settings | `getSetting(key, default)`, `setSetting(key, value)` |

All use synchronous expo-sqlite API. Cascading deletes via foreign keys (project→cabinets→drawers).

---

### `src/store/settingsStore.ts` — User Preferences (Zustand)

State: `units`, `defaultJoinery`, `defaultSawKerf`, `defaultToeKick`.
Actions: `loadSettings()` (call at startup), `setUnits()`, `setDefaultJoinery()`, `setDefaultSawKerf()`, `setDefaultToeKick()`.
All setters persist to SQLite immediately.

### `src/store/projectStore.ts` — Project/Cabinet/Drawer State (Zustand)

State: `projects[]`, `currentProject`, `cabinets[]`, `drawers[]`.
Actions: `loadAllProjects`, `createProject`, `openProject`, `updateCurrentProject`, `deleteProject`, `closeProject`, `addCabinet`, `updateCabinet`, `deleteCabinet`, `duplicateCabinet`, `addDrawer`, `updateDrawer`, `deleteDrawer`, `getDrawersForCabinet`.
Every mutation writes to SQLite and updates in-memory state atomically.

### `src/store/uiStore.ts` — UI State (Zustand)

State: `isLoading`, `error`.
Actions: `setLoading`, `setError`, `clearError`.

---

### `src/constants/cabinetDefaults.ts` — Standard Dimensions & Defaults

**Purpose:** Single source of truth for all standard cabinet dimensions, material thicknesses, reveal gaps, and default values. All values in mm with Imperial equivalents in comments.

**Key Constants:**

| Constant | Value | Imperial |
|----------|-------|---------|
| `THICKNESS_3_4_INCH_MM` | 18.75 | 3/4" plywood |
| `THICKNESS_1_2_INCH_MM` | 12.7 | 1/2" plywood |
| `THICKNESS_1_4_INCH_MM` | 6.35 | 1/4" plywood |
| `BASE_CABINET_HEIGHT_MM` | 876 | 34.5" |
| `BASE_CABINET_DEPTH_MM` | 610 | 24" |
| `WALL_CABINET_HEIGHT_MM` | 762 | 30" |
| `WALL_CABINET_DEPTH_MM` | 305 | 12" |
| `TALL_CABINET_HEIGHT_MM` | 2134 | 84" |
| `TALL_CABINET_DEPTH_MM` | 610 | 24" |
| `STANDARD_TOE_KICK_HEIGHT_MM` | 102 | 4" |
| `REVEAL_SIDE_MM` | 1.5 | each side |
| `REVEAL_TOP_MM` | 3.0 | top gap |
| `REVEAL_BETWEEN_DOORS_MM` | 3.0 | center gap |
| `DADO_DEPTH_MM` | 6.35 | 1/4" dado |
| `DEFAULT_SAW_KERF_MM` | 3.175 | 1/8" |

**Also exports:** `STANDARD_CABINET_WIDTHS_MM[]` (9"–48" in 3" increments), drawer clearances, default material label strings.

---

### `src/utils/grainLogic.ts` — Grain Direction Rules

**Purpose:** Determines required grain direction for each part type. Used by the sheet goods optimizer to know which parts can be rotated on the cutting sheet.

**Key Functions:**

| Function | Returns | Notes |
|----------|---------|-------|
| `assignGrainDirection(partName)` | `GrainDirection` | Matches part name prefix |
| `canRotatePart(grainDirection)` | `boolean` | true only for "either" |
| `getOptimalOrientation(grainDirection)` | `GrainDirection` | Pass-through for display |

**Rules:** Sides → vertical, Tops/Bottoms/Shelves → horizontal, Backs/Toe Kicks → either.

---

### `src/utils/revealCalculator.ts` — Door & Drawer Face Dimensions

**Purpose:** Calculates finished door and drawer face dimensions by subtracting standard reveal gaps from the cabinet opening.

**Key Functions:**

| Function | Returns | Example |
|----------|---------|---------|
| `calculateSingleDoorDims(w, h)` | `{width, height}` | 914,876 → 911×873 |
| `calculateDoubleDoorDims(w, h)` | `{leftWidth, rightWidth, height}` | 914,762 → 454×454×759 |
| `calculateDrawerFaceDims(w, h)` | `{width, height}` | 914,200 → 911×197 |
| `calculateStackedDrawerFaceDims(w, heights[])` | `Array<{width, height}>` | Per-drawer faces |
| `distributeDrawerHeights(h, count)` | `number[]` | Equal height suggestion |

---

### `src/utils/cabinetCalculator.ts` — Cabinet Part Generator

**Purpose:** Phase 1 core module. Takes a `Cabinet` object and returns all `Part[]` needed to build the box, with correct dimensions, grain, joinery adjustments, and notes.

**Key Functions:**

| Function | Returns | Notes |
|----------|---------|-------|
| `calculateCabinetParts(cabinet)` | `Part[]` | 5–6 parts per cabinet |
| `adjustForJoinery(part, joinery)` | `Part` | Single-part joinery adjust |
| `calculateToeKickHeight(option, custom?)` | `number` | 0 if "none" |
| `calculateDoorDimensions(w, h, double?)` | `{width, height}` | Inline reveal math |

**Parts generated:** Left Side, Right Side, Top Panel, Bottom Panel, Back Panel, Toe Kick (if applicable).

**Dado adjustment:** For `dado_rabbet` joinery, Top/Bottom width += `2 × DADO_DEPTH_MM` (panels extend into grooves on each side).

---

### `src/utils/drawerCalculator.ts` — Drawer Box Part Generator

**Purpose:** Calculates the 5 parts of a drawer box (front, back, 2 sides, bottom), adjusted for corner joinery method and bottom attachment method.

**Key Functions:**

| Function | Returns | Notes |
|----------|---------|-------|
| `calculateDrawerParts(drawer)` | `Part[]` | 5 parts (drawerId set) |
| `adjustDrawerForJoinery(parts, corner, bottom)` | `PartInput[]` | Dimension + note adjustments |
| `calculateDrawerFaceDimensions(w, h)` | `{width, height}` | Decorative face size |

**Bottom method impact:** `captured_dado` → bottom panel is smaller (groove-to-groove) + notes added to all 4 walls. `applied`/`screwed` → full outer footprint.

---

### `src/db/init.web.ts` + `src/db/queries.web.ts` — Web Platform Stubs

**Purpose:** expo-sqlite v16 requires `wa-sqlite.wasm` + `SharedArrayBuffer` (COOP/COEP headers) which are unavailable in the Expo dev server. Metro automatically picks `.web.ts` over `.ts` for web builds, so these stubs completely bypass the native SQLite on web with no config changes needed.

- `init.web.ts` — `initDatabase()` is a no-op; `getDb()` throws; `closeDatabase()` is a no-op
- `queries.web.ts` — Read functions return empty arrays/null; write functions are no-ops *except* `insertProject()` which still creates and returns a real in-memory `Project` object (Zustand needs a return value)

**Web behavior:** Projects/cabinets live only in Zustand memory during the session. Data does not persist across page refreshes on web. This is acceptable for development and demo use.

---

### `src/types/index.ts` — TypeScript Types (Updated)

**`PartType` union** added to support machine-readable part identification (replacing fragile name-string matching in joinery logic):

```typescript
export type PartType =
  | 'side' | 'top' | 'bottom' | 'back' | 'toe_kick'
  | 'door' | 'door_left' | 'door_right'
  | 'drawer_front_inner' | 'drawer_back' | 'drawer_side'
  | 'drawer_bottom' | 'drawer_face';
```

`Part` interface now includes `partType: PartType` alongside the human-readable `name: string`.

---

### `src/screens/ProjectSetupScreen.tsx` — Create New Project (Functional)

**Purpose:** Collects project name, display unit preference, and default joinery method. On submit, calls `createProject()` from the store and navigates to ReviewEdit.

**UI:** Project name TextInput → unit toggle (Imperial/Metric two-button) → 4 joinery radio cards (pocket_hole default with "DEFAULT" badge, descriptions for each) → Create / Cancel.

**Validation:** Alerts if project name is empty. `navigation.replace('ReviewEdit')` used (not `navigate`) to prevent back-navigation to the setup form.

---

### `src/screens/CabinetBuilderScreen.tsx` — Add Cabinet to Project (Functional)

**Purpose:** Configures a single cabinet and calls `addCabinet()` from the store. All user inputs are in inches; converted to mm via `inchesToMm()` before storage.

**UI:** Cabinet type selector (3-button row: Base/Wall/Tall, auto-sets toe kick defaults) → Width TextInput in inches with standard sizes hint → defaults info card (yellow, shows type-specific H×D standards) → Toe kick options (3-button row, base cabinets only) → 2×2 joinery grid → Add Cabinet / Cancel.

**Type defaults map (`TYPE_DEFAULTS`):** Drives the description card and the height/depth values passed to `addCabinet()`.

---

### `src/screens/ReviewEditScreen.tsx` — Cabinet List for Current Project (Functional)

**Purpose:** Shows all cabinets in the current project. Serves as the hub between adding cabinets and generating the cut list.

**UI:**
- Blue project header with name and cabinet count
- Scrollable list of `CabinetCard` components (type colored badge, W×H×D dimensions, joinery label, toe kick if base)
- Each card has a red-outlined Delete button → `Alert.alert` confirmation → `deleteCabinet()`
- Empty state with descriptive placeholder when no cabinets exist
- Fixed footer: "Add Cabinet" (→ CabinetBuilder) + "Generate Cut List" (→ CuttingPlan, disabled when empty)

**Unit display:** Uses `currentProject.units` to call `formatForDisplay()` — shows imperial or metric automatically.

---

### `src/screens/CalculatorDemoScreen.tsx` — Calculation Engine Demo (Functional)

**Purpose:** Visual validation screen. Runs `calculateCabinetParts()` and `calculateDrawerParts()` with hardcoded sample inputs and displays all resulting parts. Useful for confirming the calculation engine before the full UI is built.

**Three tabs:** Base 36" (8 parts incl. 2 doors) | Wall 30" (7 parts incl. 2 doors) | Drawer (6 parts incl. face)

Each part row shows: name, material, notes (left) and W×H, thickness, grain direction badge (right).

---

### `src/__tests__/` — Unit Test Suites (93 tests, all passing)

| File | Describes | Tests |
|------|-----------|-------|
| `cabinetCalculator.test.ts` | Part counts, side dims, top/bottom dims, back panel, toe kick, doors, dado notes | 21 |
| `drawerCalculator.test.ts` | Part counts, side dims, front/back, bottom (all joinery methods), drawer face | 22 |
| `revealCalculator.test.ts` | Single door, double doors, drawer face, stacked drawers | 12 |
| `grainLogic.test.ts` | assignGrainDirection (all part types incl. doors/faces), canRotatePart, end-to-end | 19 |
| `unitConversion.test.ts` | All conversion functions, fractional display, edge cases | 19 |

Run with: `npm test`
