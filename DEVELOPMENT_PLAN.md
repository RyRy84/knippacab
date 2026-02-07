# KnippaCab Development Plan

## Design Philosophy: Progressive Complexity

**Core Principle:** Start users with "one-click" simplicity, reveal advanced controls as they gain confidence.

Like a video game tutorial: early levels give you one button to press, later levels unlock full control schemes. We want DIYers to succeed on their first cabinet, then discover they can customize everything as they learn.

---

## UX Strategy: Three Tiers of Complexity

### Tier 1: "Quick Start" Mode (80% of users)
**Goal:** Build a standard base cabinet in under 2 minutes.

**User sees:**
- Cabinet type picker with photos (Base / Wall / Tall)
- Width selector with standard sizes only (dropdown: 12", 18", 24", 30", 36")
- One button: "Calculate My Cabinet"

**What happens behind the scenes:**
- Uses all defaults from `cabinetDefaults.ts`
- Standard height/depth for the cabinet type
- Default reveals (1.5mm/3mm)
- Pocket hole joinery
- Standard 4" toe kick (base cabs only)
- 3/4" plywood for box, 1/2" for back
- Auto-generates cut list with grain direction already optimized

**Output:** Instant cut list with a simple 2D cutting diagram.

---

### Tier 2: "Custom Dimensions" Mode (15% of users)
**User unlocks this by:** Tapping "Advanced Options" toggle on the Quick Start screen.

**User now sees:**
- Custom dimensions input (still in their preferred units)
- Toe kick options: Standard / Custom height / None
- Material thickness picker (presets: 1/2", 5/8", 3/4")
- Optional: Number of drawers

**What still uses defaults:**
- Reveals (most users don't know what this means yet)
- Joinery method (pocket holes still default)
- Grain direction (auto-assigned)

**Output:** Same as Tier 1, but with their custom measurements.

---

### Tier 3: "Pro Mode" (5% of users, or Tier 2 users after 3+ projects)
**User unlocks this by:** Accessing "Pro Settings" in project settings, or after saving 3 projects.

**User now sees:**
- Reveal calculator (side/top/bottom individually adjustable)
- Joinery method selector per cabinet (pocket hole / dado / butt / dowel)
- Material library (add custom plywood grades, thicknesses, costs)
- Drawer construction details (corner joinery + bottom method)
- Dado depth settings (affects cut list dimensions)
- Saw kerf adjustment
- Manual grain direction override on any part

**Output:** Full professional-grade cut list with assembly instructions adapted to their joinery choices.

---

## Development Phases: Build Tangible → Add Granularity

### **Phase 1: Minimal Viable Cabinet (Week 1-2)**
*Goal: One working cabinet from input to cut list*

**Deliverable:** Tier 1 experience for base cabinets only.

**Features:**
1. ✅ Project setup screen (name only, defaults everything else)
2. ✅ Cabinet type picker (Base only for now)
3. ✅ Width selector (standard sizes dropdown)
4. Cabinet calculator (uses `cabinetDefaults.ts` for everything)
5. Cut list generator (parts with dimensions, no optimization yet)
6. Simple parts list display (grouped by material)

**What's hardcoded:**
- Units: Imperial only
- Joinery: Pocket holes only
- Materials: 3/4" ply box, 1/2" back
- Reveals: Standard (1.5mm/3mm)
- No drawers

**Validation:** A user can input "24-inch base cabinet" and get a cut list in under 60 seconds.

---

### **Phase 2: Sheet Goods Optimizer (Week 3)**
*Goal: The killer feature — visual cutting diagrams*

**Deliverable:** Tier 1 gets visual 2D cutting layouts.

**Features:**
1. Bin packing algorithm (implement guillotine or shelf algorithm)
2. Grain direction constraints (vertical parts = vertical grain)
3. SVG diagram renderer (React Native SVG)
4. Sheet utilization percentage display
5. Waste calculation

**What's still simple:**
- Fixed sheet size: 4'x8' only
- One material type
- Auto-assigned grain direction

**Validation:** Cut list from Phase 1 shows a labeled 2D diagram where to cut each part on a plywood sheet.

---

### **Phase 3: Unit System & Customization (Week 4)**
*Goal: Unlock Tier 2 for users who need it*

**Deliverable:** Custom dimensions + unit switching.

**Features:**
1. Imperial/Metric toggle in project settings
2. Custom dimension inputs (width/height/depth)
3. Toe kick options (standard/custom/none)
4. Material thickness picker
5. Basic drawer support (drawer box only, no faces yet)

**What becomes flexible:**
- Cabinet dimensions
- Toe kick settings
- Material thickness

**What's still defaulted:**
- Reveals
- Joinery method
- Grain direction

**Validation:** User can create a 27.5" wide x 38" tall custom base cabinet with 5" toe kick.

---

### **Phase 4: Multi-Cabinet Projects (Week 5)**
*Goal: Design an entire kitchen, not just one cabinet*

**Deliverable:** Projects contain multiple cabinets, unified cut list.

**Features:**
1. "Add Cabinet" button from Review screen
2. Cabinet list management (edit/delete/duplicate)
3. Combined cut list across all cabinets
4. Sheet optimizer accounts for all parts from all cabinets
5. Project save/load (SQLite)

**What becomes powerful:**
- Design full kitchen runs
- Minimize waste across multiple cabinets
- Edit individual cabinets independently

**Validation:** User designs a 3-cabinet kitchen (24" sink base + two 18" bases) and gets one optimized cutting plan.

---

### **Phase 5: Joinery & Pro Features (Week 6-7)**
*Goal: Unlock Tier 3 for woodworkers who know what they're doing*

**Deliverable:** Full joinery control + reveal customization.

**Features:**
1. Joinery method selector (pocket hole / dado / butt / dowel)
2. Dado depth settings (adjust cut list dimensions for dado joints)
3. Reveal calculator (custom side/top/bottom reveals)
4. Drawer construction options (corner joinery + bottom method)
5. Material library (custom materials with costs)
6. Saw kerf adjustment
7. Assembly instructions adapted to joinery choice

**What becomes fully customizable:**
- Every dimension that affects joinery
- Material choices and costs
- Hardware recommendations

**What's still guided:**
- Default suggestions based on skill level
- Warnings for incompatible choices (e.g., dado + thin ply)

**Validation:** A skilled woodworker can specify dado joints with 1/4" depth, custom reveals, and captured drawer bottoms, and get accurate dimensions.

---

### **Phase 6: Doors & Drawer Faces (Week 8)**
*Goal: Complete the cabinet — not just the box*

**Deliverable:** Door/drawer face calculator with reveal math.

**Features:**
1. Door calculator (single/double door logic)
2. Drawer face calculator (reveal-adjusted dimensions)
3. Hinge positioning guide
4. Handle/knob placement recommendations
5. Optional: Overlay type selector (full overlay default, inset for Tier 3)

**What becomes complete:**
- Full cabinet design including visible surfaces
- Hardware shopping list

**Validation:** User gets cut list for box + doors + drawer faces with correct reveals.

---

### **Phase 7: Polish & Export (Week 9-10)**
*Goal: Production-ready output*

**Deliverable:** PDF export, cost estimation, material shopping list.

**Features:**
1. PDF export (cut list + diagrams)
2. Material cost estimation
3. Hardware shopping list with quantities
4. Cut list export to CSV
5. 2D cabinet wireframe preview
6. Print-friendly layouts

**What becomes professional:**
- Share plans with others
- Take to the lumberyard with confidence
- Estimate total project cost

**Validation:** User exports a complete kitchen plan as PDF, estimates $800 in materials, and builds it successfully.

---

## Feature Flagging Strategy

Use a simple settings object to progressively unlock features:

```typescript
// src/constants/featureFlags.ts
export const FEATURE_FLAGS = {
  // Phase 1
  basicCabinetCalculator: true,
  
  // Phase 2
  sheetOptimizer: true,
  
  // Phase 3
  customDimensions: true,
  metricUnits: true,
  drawerSupport: true,
  
  // Phase 4
  multiCabinetProjects: true,
  projectSaveLoad: true,
  
  // Phase 5 - Pro Mode (unlock after 3 saved projects or manual toggle)
  joinerySelector: false,  // Tier 3
  revealCustomization: false,  // Tier 3
  dadoSettings: false,  // Tier 3
  materialLibrary: false,  // Tier 3
  
  // Phase 6
  doorCalculator: true,
  drawerFaceCalculator: true,
  
  // Phase 7
  pdfExport: true,
  costEstimation: true,
};
```

**Why this works:**
- Early users don't see incomplete features
- Advanced users can opt-in via settings
- We can ship incomplete builds for testing
- Easy to AB test feature complexity

---

## UI Patterns: Show Defaults, Offer Overrides

### Pattern 1: "Defaults with Edit Button"
```
┌─────────────────────────────────┐
│ Cabinet Dimensions              │
│                                 │
│ Width:  24"  (standard)         │
│ Height: 34.5" (standard base)   │
│ Depth:  24"  (standard base)    │
│                                 │
│         [Edit Dimensions]       │  ← Only shows if Tier 2+
└─────────────────────────────────┘
```

### Pattern 2: "Expandable Advanced Section"
```
┌─────────────────────────────────┐
│ ▼ Advanced Options              │  ← Collapsed by default
│                                 │
│   Joinery: Pocket Holes ▼       │
│   Toe Kick: Standard 4" ▼       │
│   Material: 3/4" Plywood ▼      │
│                                 │
└─────────────────────────────────┘
```

### Pattern 3: "Smart Defaults with Info"
```
┌─────────────────────────────────┐
│ Reveals                    ⓘ    │  ← Info icon explains
│                                 │
│ Using standard frameless        │
│ reveals (1.5mm sides, 3mm top)  │
│                                 │
│      [Customize Reveals]        │  ← Only shows in Tier 3
└─────────────────────────────────┘
```

---

## Testing Strategy: Validate Each Tier

### Tier 1 Validation Test
1. New user opens app
2. Taps "Base Cabinet"
3. Selects "24 inches" from dropdown
4. Taps "Calculate"
5. Sees cut list in under 60 seconds
6. Doesn't feel overwhelmed

**Pass criteria:** User never sees words like "dado," "reveal," or "joinery."

---

### Tier 2 Validation Test
1. User has built 1 cabinet successfully
2. Wants a custom 27" width (not standard)
3. Finds "Advanced Options" toggle
4. Enters custom width
5. Adjusts toe kick to 5"
6. Gets accurate cut list

**Pass criteria:** User sees 2-3 new options, not 20. Still feels in control.

---

### Tier 3 Validation Test
1. Experienced woodworker opens app
2. Immediately enables "Pro Mode"
3. Selects dado joinery
4. Sets 1/4" dado depth
5. Customizes reveals to 2mm
6. Cut list reflects dado depth in dimensions

**Pass criteria:** Every dimension is adjustable, nothing feels locked down.

---

## Implementation Priority: What to Build When

### Week 1-2: Foundation (Phase 1)
**Claude Code tasks:**
1. Cabinet calculator module (src/utils/cabinetCalculator.ts)
   - Takes width + type → returns parts list
   - Uses constants from cabinetDefaults.ts
   - Applies reveal math
2. CabinetBuilder screen (Tier 1 UI only)
   - Type picker (Base/Wall/Tall with photos)
   - Width dropdown (standard sizes)
   - "Calculate" button
3. Cut list display component
   - Simple table view
   - Group by material (box / back)
   - Show dimensions in user's units

**Deliverable:** Working app that calculates one cabinet.

---

### Week 3: Optimizer (Phase 2)
**Claude Code tasks:**
1. Sheet optimizer module (src/utils/sheetOptimizer.ts)
   - Bin packing algorithm
   - Grain direction constraints
   - Returns layout coordinates
2. Cutting diagram component (React Native SVG)
   - Renders 4'x8' sheet
   - Draws rectangles for each part
   - Labels with part names
   - Shows grain direction with arrows
3. Waste calculation display

**Deliverable:** Cut list includes visual diagram.

---

### Week 4-5: Flexibility (Phase 3-4)
**Claude Code tasks:**
1. Project settings screen
   - Unit system toggle (Imperial/Metric)
   - Default joinery picker
   - Saw kerf input
2. Custom dimension inputs (CabinetBuilder Tier 2 UI)
3. Drawer builder screen (basic drawer box)
4. Multi-cabinet project management
5. SQLite persistence layer

**Deliverable:** Users can design custom cabinets and save projects.

---

### Week 6-7: Pro Mode (Phase 5)
**Claude Code tasks:**
1. Joinery selector component
2. Reveal customization screen
3. Dado dimension calculator (adjusts cut list)
4. Material library (CRUD for custom materials)
5. Drawer construction options UI

**Deliverable:** Experienced users have full control.

---

### Week 8: Completion (Phase 6)
**Claude Code tasks:**
1. Door calculator (single/double logic)
2. Drawer face calculator
3. Hardware recommendations

**Deliverable:** Complete cabinets, not just boxes.

---

### Week 9-10: Production (Phase 7)
**Claude Code tasks:**
1. PDF export (jsPDF integration)
2. Cost estimation calculator
3. Material shopping list generator
4. CSV export

**Deliverable:** Professional-quality output.

---

## Success Metrics

### For Tier 1 Users (DIYers):
- Time to first cut list: < 2 minutes
- % who complete first cabinet: > 80%
- % who feel overwhelmed: < 10%

### For Tier 2 Users (Customizers):
- % who find "Advanced Options": > 60%
- % who successfully customize dimensions: > 90%

### For Tier 3 Users (Pros):
- % who enable Pro Mode: 5-10%
- % who use dado joinery: > 50% of Tier 3
- % who report accurate dimensions: > 95%

---

## Open Questions & Future Considerations

### Questions We'll Answer During Development:
1. **Sheet size flexibility:** Should we let Tier 2 users pick sheet size, or keep 4x8 default until Tier 3?
2. **Material library scope:** Start with 3 preset materials, or let Tier 1 users add custom from the start?
3. **Drawer quantity:** Auto-suggest drawer count based on cabinet height, or require manual input?
4. **Reveal presets:** Offer "tight" vs "standard" vs "loose" reveal presets before full customization?
5. **Hardware integration:** Link to actual products (affiliate?) or just give specs?

### Variables We Might Be Missing:
- **Edge banding:** Do we calculate edge banding length/quantity? (Probably Phase 6+)
- **Back panel options:** Hardboard vs plywood vs shiplap? (Tier 3)
- **Shelf quantity/adjustability:** Fixed shelves vs adjustable holes? (Phase 4)
- **Corner cabinet support:** Lazy Susan mechanics? (V2 - complex geometry)
- **Overlay types:** Full overlay vs inset vs partial? (Phase 6, Tier 3)
- **Hinge types:** European cup vs butt hinges? (Phase 6)
- **Finish allowances:** Does paint/stain thickness affect reveals? (Tier 3, edge case)
- **Multi-sheet optimization:** What if parts don't fit on one sheet? (Phase 2 stretch goal)

---

## Communication Between Claude Instances

### For Claude Code:
**File to check first:** `DEVELOPMENT_PLAN.md` → see current phase and priority tasks.

**When starting a session:**
1. Check git log for last commit message (shows completed features)
2. Read current phase section in this file
3. Implement next task in the priority list
4. Update this file's "Current Status" section (below) when completing a phase

### For Claude.ai:
**File to reference:** This file + `CLAUDE.md` for technical decisions.

**When planning features:**
1. Check which phase we're in
2. Ensure new features match the tier system
3. Don't over-engineer for Tier 3 when building Tier 1
4. Consider progressive disclosure in every UI decision

---

## Current Status

**Last Updated:** 2026-02-07

**Completed:**
- ✅ Project scaffolding (Expo + dependencies)
- ✅ Folder structure
- ✅ Unit conversion utility (src/utils/unitConversion.ts)
- ✅ TypeScript types (src/types/index.ts)
- ✅ Cabinet constants (src/constants/cabinetDefaults.ts)
- ✅ Navigation setup + placeholder screens

**Current Phase:** Phase 1 - Minimal Viable Cabinet

**Next Task:** Cabinet calculator module (src/utils/cabinetCalculator.ts)

**Blockers:** None

**Notes:** Foundation is solid. Ready to build first tangible feature (cabinet calculation logic).

---

## Notes for Ryan

**Remember:**
- Don't build Tier 3 features in Phase 1 — resist the temptation!
- Test on real DIYers (not just yourself) to validate Tier 1 simplicity
- If you're confused by a term, your users will be too → simplify or hide in Tier 3
- Every new input field is cognitive load → default it until proven necessary

**When in doubt:**
- Start with the simplest version that works
- Ship it
- Learn what users actually need
- Add granularity based on real feedback

**Philosophy:**
> "A beginner should be able to design their first cabinet without knowing what a 'reveal' is. An expert should be able to specify reveals down to the millimeter. Both should feel the app was built for them."
