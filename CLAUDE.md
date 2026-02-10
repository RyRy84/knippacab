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
