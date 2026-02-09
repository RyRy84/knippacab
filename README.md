# KnippaCab

**A cross-platform cabinet design app that eliminates calculation errors in woodworking.**

Built with React Native + Expo • TypeScript • Currently in development (Phase 1)

---

## What is KnippaCab?

KnippaCab helps DIY woodworkers design frameless cabinets, calculate precise dimensions, and optimize material cutting patterns. The app automates the tedious mathematics that causes expensive mistakes in the shop.

**Core Features:**
- Automated reveal calculations (door/drawer face dimensions)
- Joinery-aware dimension adjustments (pocket screws, dado joints, etc.)
- Intelligent sheet goods optimization with grain direction constraints
- Complete cut lists in Imperial or Metric units
- Visual 2D cutting diagrams for the shop

**Who It's For:**
- DIY woodworkers building custom cabinets
- Weekend hobbyists who want professional results
- Anyone tired of manual cabinet math and wasted materials

---

## Current Status

🚧 **In Active Development** - Phase 1: Foundation & Core Calculations

**What Works:**
- ✅ Project structure and navigation
- ✅ Unit conversion utilities (mm ↔ Imperial)
- ✅ TypeScript types and cabinet constants
- ✅ Basic app navigation

**What's Next:**
- Cabinet dimension calculator
- Drawer dimension calculator  
- Reveal & gap calculator
- Grain direction logic

See [ROADMAP.md](ROADMAP.md) for detailed development plan.

---

## Why KnippaCab?

### The Problem
Cabinet building involves complex calculations:
- Door reveals: 3mm gaps on all sides, 3mm between double doors
- Joinery adjustments: Dado joints need extra length for groove depth
- Toe kick options: Standard 4" / custom height / none (affects all calculations)
- Sheet optimization: Grain direction constraints limit how parts can be arranged
- Unit conversions: Working between Imperial measurements and metric standards

**One math error = wasted plywood = expensive mistake.**

### The Solution
KnippaCab automates every calculation:
- Enter cabinet dimensions → app calculates door sizes with perfect reveals
- Choose joinery method → app adjusts part dimensions automatically
- Generate cut list → app optimizes sheet layouts respecting grain direction
- Export PDF → take professional cutting diagrams directly to the shop

---

## Tech Stack

- **Framework:** React Native with Expo (iOS, Android, Web)
- **Language:** TypeScript
- **Navigation:** React Navigation (native stack)
- **State:** Zustand (lightweight state management)
- **Database:** SQLite (expo-sqlite for local persistence)
- **Graphics:** React Native SVG (cutting diagrams)
- **PDF Export:** jsPDF or react-native-pdf (TBD)

**Design Principles:**
- All internal math in millimeters (convert for display)
- Frameless (European-style) cabinets for V1
- Mobile-first but works everywhere
- Offline-capable (no cloud dependency)

---

## Project Structure

```
KnippaCab/
├── ROADMAP.md              # Development phases and milestones
├── HANDOFF.md              # AI collaboration protocols
├── CLAUDE.md               # Technical context for AI assistants
├── src/
│   ├── screens/            # Full-page screens
│   ├── components/         # Reusable UI components
│   ├── navigation/         # Route definitions
│   ├── utils/              # Pure logic (calculators, converters)
│   ├── constants/          # Standard dimensions, defaults
│   ├── types/              # TypeScript interfaces
│   ├── db/                 # SQLite schema and queries
│   └── assets/             # Images, icons, fonts
```

---

## Getting Started (Development)

**Prerequisites:**
- Node.js 18+ and npm
- Expo CLI: `npm install -g expo-cli`

**Setup:**
```bash
git clone https://github.com/RyRy84/knippacab.git
cd knippacab
npm install
```

**Run:**
```bash
npx expo start          # Choose platform (web/iOS/Android)
npx expo start --web    # Start directly in browser (fastest iteration)
```

**Test:**
```bash
npm test                # Run unit tests (when implemented)
npx tsc --noEmit        # TypeScript type checking
```

---

## Documentation

### For Developers
- **[ROADMAP.md](ROADMAP.md)** - Phased development plan with milestones
- **[CLAUDE.md](CLAUDE.md)** - Technical context, patterns, module reference
- **[HANDOFF.md](HANDOFF.md)** - AI collaboration workflows

### For Understanding the Domain
- **[knippacab-notes.md](https://github.com/RyRy84/project-management/blob/main/Projects/knippacab-notes.md)** - Cabinet standards, construction methods, research

---

## Development Workflow

This project uses a hybrid AI-assisted development approach:

**Claude.ai** → Planning, architecture, algorithm design  
**Claude Code** → Implementation, testing, debugging

See [HANDOFF.md](HANDOFF.md) for context handoff protocols.

---

## Roadmap Highlights

**Phase 1** (Current) - Core Calculations  
Build the math engine: cabinet/drawer calculators, reveal logic

**Phase 2** - Data Persistence  
SQLite setup, state management, CRUD operations

**Phase 3** - User Interface  
Real screens with forms, inputs, live previews

**Phase 4** - Sheet Optimization  
Bin packing algorithm + SVG cutting diagrams

**Phase 5** - Polish & Launch  
PDF export, settings, testing, app store release

See full [ROADMAP.md](ROADMAP.md) for detailed milestones.

---

## V1 MVP Scope

**What's Included:**
- Manual measurement input (Imperial + Metric)
- Frameless cabinet design (base/wall/tall types)
- 4 joinery methods (pocket screws, butt joints, dado, dowels)
- 3 toe kick options (standard/custom/none)
- 3 drawer construction methods (corner joinery + bottom attachment)
- Automated door/drawer face calculations
- Cut list generator (grouped by material, grain-aware)
- Sheet goods optimizer (visual 2D cutting diagrams)
- PDF export for shop use

**What's Deferred to V2:**
- 3D visualization
- Bluetooth measuring devices
- Face-frame cabinet support
- Cloud sync
- Advanced joinery (dovetails)

---

## Contributing

This is currently a solo project in active development. Not yet accepting contributions, but feel free to:
- ⭐ Star the repo if interested
- 👀 Watch for updates
- 💬 Open issues for feature suggestions or bug reports (when app is usable)

---

## License

TBD - License to be determined before public release

---

## Contact

**Developer:** Ryan Knippa  
**Project Management:** [RyRy84/project-management](https://github.com/RyRy84/project-management)  
**Repository:** [RyRy84/knippacab](https://github.com/RyRy84/knippacab)

---

## Acknowledgments

Built with assistance from:
- **Claude Opus 4.5** (Anthropic) - Architecture and planning via Claude.ai
- **Claude Code** - Implementation and testing

Cabinet construction standards research sourced from woodworking communities, manufacturer specifications, and industry best practices.

---

**Status:** 🚧 Early Development - Not yet functional for end users  
**Last Updated:** February 7, 2026
