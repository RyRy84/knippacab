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

- Remote: github.com/RyRy84/knippacab (to be created)
- Branch strategy: main for stable, feature branches for new work
- Commit style: conventional commits (feat:, fix:, docs:, refactor:)
