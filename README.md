# KnippaCab - Cabinet Design App

**Cross-platform mobile app for DIY woodworkers**

KnippaCab eliminates calculation errors in cabinet building by automating reveal calculations, joinery dimension adjustments, and sheet goods optimization.

## Features

✅ **Complete workflow**: Create project → add cabinets → add drawers → view cut list  
✅ **Joinery-aware calculations**: Supports pocket hole, dado, butt joints, and dowels  
✅ **Grain direction logic**: Auto-assigns grain orientation for professional results  
✅ **Multi-cabinet projects**: Design entire kitchens, not just single cabinets  
✅ **Cross-platform**: iOS, Android, and Web from single codebase  

🚧 **In Development**:  
- Sheet goods optimizer with visual cutting diagrams (Phase 4)  
- PDF export for shop-ready documentation (Phase 5)  

## Tech Stack

- **Framework**: React Native + Expo  
- **Language**: TypeScript  
- **State**: Zustand  
- **Database**: SQLite (expo-sqlite)  
- **Navigation**: React Navigation  
- **Graphics**: React Native SVG  

## Project Status

**Current Phase**: Phase 4 - Sheet Goods Optimization  
**Last Updated**: February 11, 2026  
**Lines of Code**: 6,500+  
**Test Coverage**: 93 unit tests passing  

### Completed Phases:
- ✅ Phase 1: Foundation & Core Calculations
- ✅ Phase 2: Data Persistence & Project Management
- ✅ Phase 3: User Interface Implementation

## Documentation

### For Planning (Claude.ai):
- **[ROADMAP.md](ROADMAP.md)** - Strategic overview and phase breakdown
- **[FEATURE_BACKLOG.md](FEATURE_BACKLOG.md)** - V2+ deferred features
- **[SHEET_OPTIMIZER_RESEARCH.md](SHEET_OPTIMIZER_RESEARCH.md)** - Competitive analysis

### For Implementation (Claude Code):
- **[WORK_PLAN.md](WORK_PLAN.md)** - Current phase implementation steps
- **[CLAUDE.md](CLAUDE.md)** - Technical context for AI development

### For Design Decisions:
- **[UX_DECISIONS.md](UX_DECISIONS.md)** - Design rationale with examples

### Archives:
- **docs/archive/** - Completed session plans and historical docs

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI (optional but recommended)

### Installation

```bash
# Clone repository
git clone https://github.com/RyRy84/knippacab.git
cd knippacab

# Install dependencies
npm install

# Start development server
npx expo start

# Run tests
npm test
```

### Development

```bash
# Start on web (fastest iteration)
npx expo start --web

# Start on iOS simulator
npx expo start --ios

# Start on Android emulator
npx expo start --android
```

## Project Structure

```
KnippaCab/
├── src/
│   ├── screens/          # Full-page UI components
│   ├── components/       # Reusable UI components
│   ├── navigation/       # React Navigation setup
│   ├── utils/            # Calculation logic
│   ├── constants/        # Standard dimensions
│   ├── types/            # TypeScript definitions
│   ├── db/               # SQLite schema and queries
│   ├── store/            # Zustand state management
│   └── __tests__/        # Unit tests
├── docs/                 # Documentation
│   └── archive/          # Historical/completed docs
├── ROADMAP.md            # Strategic roadmap
├── WORK_PLAN.md          # Implementation plan
├── CLAUDE.md             # AI development context
└── README.md             # This file
```

## Contributing

This is a personal project currently in active development. Feedback and suggestions are welcome via GitHub issues.

## Philosophy

> "A beginner should be able to design their first cabinet without knowing what a 'reveal' is. An expert should be able to specify reveals down to the millimeter. Both should feel the app was built for them."

**Progressive Complexity**: The app uses a three-tier approach:
- **Tier 1**: One-click simplicity with smart defaults
- **Tier 2**: Custom dimensions and basic options
- **Tier 3**: Full professional control

## Competitive Advantage

- **Mobile-first**: Most competitors are desktop-only
- **One-time purchase**: Competitors charge $108-288/year subscriptions
- **Practical algorithms**: Prioritizes table-saw-friendly cuts over max efficiency
- **Integrated workflow**: From measurement to cut list in one app

## License

TBD (Not yet released)

## Acknowledgments

- Built with assistance from Claude (Anthropic)
- Inspired by the woodworking community's need for better mobile tools
- Special thanks to beta testers (TBD)
