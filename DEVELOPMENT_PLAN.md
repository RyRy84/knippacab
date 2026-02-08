# KnippaCab Development Plan

**Related Documentation:**
- `SHEET_OPTIMIZER_RESEARCH.md` - Comprehensive competitive analysis and feature research (26KB)
- `CLAUDE.md` - Technical context for Claude Code
- `ROADMAP.md` - High-level product vision

---

## Design Philosophy: Progressive Complexity

**Core Principle:** Start users with "one-click" simplicity, reveal advanced controls as they gain confidence.

Like a video game tutorial: early levels give you one button to press, later levels unlock full control schemes. We want DIYers to succeed on their first cabinet, then discover they can customize everything as they learn.

**Project Scope Evolution:** From single cabinet calculator → full kitchen design system → AR-powered visualization tool.

---

## UX Strategy: Three Tiers of Complexity

### Tier 1: "Quick Start" Mode (80% of users)
**Goal:** Build a standard base cabinet in under 2 minutes.

**User sees:**
- Cabinet type picker with photos (Base / Wall / Tall / Corner)
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
- **NEW:** 2D layout view to arrange multiple cabinets side-by-side
- **NEW:** Optimization mode toggle (Efficiency vs Guillotine) - see `SHEET_OPTIMIZER_RESEARCH.md`

**What still uses defaults:**
- Reveals (most users don't know what this means yet)
- Joinery method (pocket holes still default)
- Grain direction (auto-assigned)

**Output:** Same as Tier 1, but with their custom measurements + visual layout of cabinet arrangement.

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
- **NEW:** Edge banding tracking - see `SHEET_OPTIMIZER_RESEARCH.md` §14
- **NEW:** Offcut management - see `SHEET_OPTIMIZER_RESEARCH.md` §7
- **NEW:** Minimum offcut size setting - see `SHEET_OPTIMIZER_RESEARCH.md` Pain Point #6
- **NEW:** Corner cabinet angle/depth customization
- **NEW:** 3D cabinet preview (V2)
- **NEW:** AR room visualization (V2)

**Output:** Full professional-grade cut list with assembly instructions adapted to their joinery choices + 3D/AR visualization.

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

### **Phase 2: Sheet Goods Optimizer (Week 3)** ⭐
*Goal: The killer feature — visual cutting diagrams*

**📚 Primary Reference:** `SHEET_OPTIMIZER_RESEARCH.md` - Full 26KB competitive analysis

**Deliverable:** Tier 1 gets visual 2D cutting layouts.

**Features (Research-Validated):**
1. **Guillotine bin packing algorithm** (see Research §Algorithm Considerations)
   - Table-saw friendly edge-to-edge cuts
   - First-Fit Decreasing Height variation
   - 80-85% efficiency typical (competitive with alternatives)
2. **Grain direction constraints** (see Research §2 - Critical Feature)
   - Vertical parts = vertical grain (locked)
   - Horizontal parts = horizontal grain (locked)
   - Hidden parts = rotation allowed
   - Visual grain arrows in diagram
3. **SVG diagram renderer** (React Native SVG)
   - Part labels with dimensions
   - Grain direction indicators
   - Color-coded by cabinet (multi-cabinet support)
   - Cut sequence numbers (Guillotine mode)
4. **Sheet utilization display**
   - Percentage efficiency
   - Waste area calculation
   - Usable offcut identification
5. **Conservative defaults** (see Research Pain Point #1)
   - Blade kerf: 1/8" (3.175mm) default
   - Accounts for kerf in all dimensions
   - Prevents "says 1 sheet, needs 2" problem

**What's still simple:**
- Fixed sheet size: 4'x8' only (1220×2440mm metric)
- One material type
- Auto-assigned grain direction (no manual override yet)
- Efficiency mode only (Guillotine mode in Phase 3)

**Research Insights Applied:**
- Competitors achieve 85-95% efficiency, we target 80-85% with simpler Guillotine algorithm (trade-off: easier cutting sequences)
- User pain point: "Can't follow cutting sequence" → we'll add cut numbers
- User pain point: "Grain doesn't match" → auto-assign grain based on part type
- See `SHEET_OPTIMIZER_RESEARCH.md` §Competitive Differentiation for full strategy

**Validation:** Cut list from Phase 1 shows a labeled 2D diagram where to cut each part on a plywood sheet with grain arrows and numbered cuts.

---

### **Phase 3: Unit System & Customization (Week 4)**
*Goal: Unlock Tier 2 for users who need it*

**Deliverable:** Custom dimensions + unit switching + optimization modes.

**Features:**
1. Imperial/Metric toggle in project settings
2. Custom dimension inputs (width/height/depth)
3. Toe kick options (standard/custom/none)
4. Material thickness picker
5. Basic drawer support (drawer box only, no faces yet)
6. **NEW: Optimization mode toggle** (see `SHEET_OPTIMIZER_RESEARCH.md` §5)
   - Efficiency mode (minimize waste, complex cuts OK)
   - Guillotine mode (practical table saw cuts, may have more waste)
   - Cut preference selection (length cuts first / width cuts first)

**What becomes flexible:**
- Cabinet dimensions
- Toe kick settings
- Material thickness
- Cutting optimization strategy

**What's still defaulted:**
- Reveals
- Joinery method
- Grain direction (still auto-assigned)

**Validation:** User can create a 27.5" wide × 38" tall custom base cabinet with 5" toe kick, select Guillotine mode for table-saw-friendly cuts.

---

### **Phase 4: Multi-Cabinet Projects & 2D Layout (Week 5-6)**
*Goal: Design an entire kitchen, not just one cabinet*

**Deliverable:** Projects contain multiple cabinets with visual layout planning.

**Features:**
1. **"Add Cabinet" workflow** from Review screen
2. **Cabinet list management** (edit/delete/duplicate/reorder)
3. **2D Floor Plan View** (NEW):
   - Drag-and-drop cabinet placement
   - Side-by-side arrangement with measurements
   - Wall length calculator
   - Gap/filler detection between cabinets
   - Top-down view showing depth and width
   - Export layout as image/PDF
4. **Combined cut list** across all cabinets
5. **Sheet optimizer accounts for all parts** from all cabinets
   - Color-coded by cabinet in diagram (see `SHEET_OPTIMIZER_RESEARCH.md` §6)
   - Multi-sheet handling when needed (see Research §11)
6. **Project save/load** (SQLite)

**What becomes powerful:**
- Design full kitchen runs
- Visualize how cabinets fit together
- Minimize waste across multiple cabinets
- Edit individual cabinets independently
- Detect spacing issues early

**Validation:** User designs a 3-cabinet kitchen (24" sink base + two 18" bases), arranges them in 2D layout view to see total run length (66"), and gets one optimized cutting plan with parts color-coded by cabinet.

---

### **Phase 4.5: Corner Cabinet Solutions (Week 6-7)**
*Goal: Handle the most complex cabinet type — corners*

**Deliverable:** Support for corner base and wall cabinets.

**Corner Cabinet Types Supported:**
1. **Diagonal Corner (Lazy Susan base)**
   - 36" or 42" face width
   - Angled front, two perpendicular sides
   - Optional lazy Susan hardware specs
2. **Blind Corner (L-shaped)**
   - One cabinet "reaches into" the corner
   - Requires return depth calculation
   - Pull-out shelf hardware recommendations
3. **90° Corner Wall Cabinet**
   - Open shelving or bi-fold door options
   - Requires corner posts/fillers

**Features:**
1. Corner cabinet type picker (diagonal / blind / 90° wall)
2. Corner-specific dimension calculator
   - Diagonal cabinets: angled face width, side depth
   - Blind corners: return depth, access opening width
3. Hardware recommendations (lazy Susan, pull-out shelves)
4. Integration with 2D layout (corner cabinets snap to wall intersections)
5. Cut list adjustments for angled cuts (diagonal faces)

**Complexity Considerations:**
- **Tier 1:** Only diagonal corners with standard 36" size
- **Tier 2:** Custom diagonal width, blind corner option
- **Tier 3:** Full angle/depth control, custom access openings

**Validation:** User adds a 36" diagonal corner base to a kitchen layout, positions it at wall intersection in 2D view, receives cut list including angled face pieces and lazy Susan specs.

---

### **Phase 5: Joinery & Pro Features (Week 8-9)**
*Goal: Unlock Tier 3 for woodworkers who know what they're doing*

**Deliverable:** Full joinery control + reveal customization + advanced optimizer features.

**Features:**
1. Joinery method selector (pocket hole / dado / butt / dowel)
2. Dado depth settings (adjust cut list dimensions for dado joints)
3. Reveal calculator (custom side/top/bottom reveals)
4. Drawer construction options (corner joinery + bottom method)
5. Material library (custom materials with costs)
6. Saw kerf adjustment
7. Assembly instructions adapted to joinery choice
8. **NEW: Edge banding tracking** (see `SHEET_OPTIMIZER_RESEARCH.md` §4)
   - Auto-detect visible edges
   - Calculate linear feet needed
   - Add to hardware shopping list
   - Visual indicators on cutting diagram
9. **NEW: Offcut management** (see Research §7)
   - Save waste pieces from completed layouts
   - Add to stock library
   - Optimizer uses offcuts before new sheets
10. **NEW: Minimum offcut size** (see Research Pain Point #6)
    - User sets preferred minimum (e.g., 12"×12")
    - Optimizer penalizes tiny unusable scraps

**What becomes fully customizable:**
- Every dimension that affects joinery
- Material choices and costs
- Hardware recommendations
- Optimization strategy and constraints

**What's still guided:**
- Default suggestions based on skill level
- Warnings for incompatible choices (e.g., dado + thin ply)

**Validation:** A skilled woodworker can specify dado joints with 1/4" depth, custom reveals, captured drawer bottoms, and minimum 12"×12" offcuts, and get accurate dimensions with realistic cutting plan.

---

### **Phase 6: Doors & Drawer Faces (Week 10)**
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

### **Phase 7: Polish & Export (Week 11-12)**
*Goal: Production-ready output*

**Deliverable:** PDF export, cost estimation, material shopping list.

**Features:**
1. PDF export (cut list + diagrams + 2D layout)
   - Cutting diagrams with grain arrows, cut sequences
   - Edge banding indicators (if enabled)
   - Offcut identification
2. Material cost estimation
3. Hardware shopping list with quantities
   - Includes edge banding linear feet (if tracked)
4. Cut list export to CSV
5. 2D cabinet wireframe preview per cabinet
6. Print-friendly layouts
7. Email/share project files

**What becomes professional:**
- Share plans with others
- Take to the lumberyard with confidence
- Estimate total project cost

**Validation:** User exports a complete kitchen plan as PDF with 2D layout, cutting diagrams (with grain arrows and cut sequences), edge banding requirements, and shopping list, estimates $800 in materials, and builds it successfully.

---

## V2 Features: 3D Visualization & Augmented Reality

### **Phase 8: 3D Cabinet Visualization (V2 - Week 13-15)**
*Goal: See what you're building before you build it*

**Deliverable:** Interactive 3D models of individual cabinets and full kitchen layouts.

**Technology Stack:**
- **React Native:** Three.js via expo-gl + expo-three
- **Alternative:** Babylon.js for React Native
- **Rendering:** WebGL-based 3D on mobile devices

**Features:**
1. **3D Cabinet Preview:**
   - Rendered box with doors, drawers, hardware
   - Rotate/zoom/pan with touch gestures
   - Material textures (wood grain simulation)
   - Toggle between wireframe and solid views
2. **Full Kitchen 3D View:**
   - All cabinets arranged based on 2D layout
   - Walk-through camera mode
   - Wall/floor/ceiling context for scale
   - Countertop visualization
3. **3D Export:**
   - Export 3D models as OBJ/STL for further editing
   - Screenshot renders for presentations

**Integration Points:**
- "View in 3D" button on any cabinet in Review screen
- "3D Kitchen Preview" button in 2D layout view
- 3D toggle in navigation (2D Layout ⇄ 3D View)

**Performance Considerations:**
- Simplified geometry for mobile (low-poly models)
- Level of detail (LOD) based on camera distance
- Lazy loading 3D assets
- Web version gets full-quality renders

**Validation:** User designs a 5-cabinet kitchen, switches to 3D view, rotates camera to see how cabinets look from multiple angles, verifies door swing clearances.

---

### **Phase 9: Augmented Reality Preview (V2 - Week 16-18)**
*Goal: Killer mobile feature — see cabinets in your actual kitchen*

**Deliverable:** AR camera mode that overlays cabinet designs in real space.

**Technology Stack:**
- **iOS:** ARKit via expo-ar (or react-native-arkit)
- **Android:** ARCore via expo-ar
- **Plane detection:** Floor/wall surface recognition
- **Lighting estimation:** Match virtual cabinets to room lighting

**Features:**
1. **AR Placement Mode:**
   - Open phone camera with AR overlay
   - Point at wall/floor to detect surfaces
   - Tap to place cabinet at 1:1 scale
   - Cabinets appear life-size in room
2. **AR Interactions:**
   - Move cabinets along wall
   - Rotate to test different arrangements
   - Scale reference (show dimensions on-screen)
   - See multiple cabinets together in space
3. **AR Measurement Tools:**
   - Measure wall lengths by pointing camera
   - Auto-detect room corners
   - Verify cabinet fit before building
4. **AR Screenshots/Video:**
   - Capture photo of virtual cabinets in real room
   - Record video walkthrough
   - Share with family/contractors for approval

**Use Cases:**
- **Pre-design:** Measure kitchen with AR ruler, input dimensions
- **Design validation:** See if 36" cabinet fits next to fridge
- **Client presentations:** Contractors show clients virtual cabinets
- **Marketing:** "See before you build" feature in app store

**Technical Challenges:**
- Accurate plane detection on varied surfaces
- Lighting/shadow matching for realism
- Performance on older devices
- Calibration for different camera sensors

**Progressive Rollout:**
- **V2.0:** Basic AR placement (single cabinet)
- **V2.1:** Multi-cabinet AR (full kitchen)
- **V2.2:** AR measurement tools
- **V2.3:** Room scanning & auto-fit

**Validation:** User opens AR mode, points camera at kitchen wall, places virtual 24" base cabinet, sees it matches physical space, confirms it fits next to existing appliances, takes screenshot to share with spouse.

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
  grainDirectionConstraints: true,
  cutSequenceNumbers: true,  // NEW - from research
  
  // Phase 3
  customDimensions: true,
  metricUnits: true,
  drawerSupport: true,
  optimizationModeToggle: true,  // NEW - Efficiency vs Guillotine
  
  // Phase 4
  multiCabinetProjects: true,
  layout2D: true,
  multiSheetSupport: true,  // NEW - from research
  colorCodedParts: true,  // NEW - from research
  projectSaveLoad: true,
  
  // Phase 4.5
  cornerCabinets: true,
  
  // Phase 5 - Pro Mode (unlock after 3 saved projects or manual toggle)
  joinerySelector: false,  // Tier 3
  revealCustomization: false,  // Tier 3
  dadoSettings: false,  // Tier 3
  materialLibrary: false,  // Tier 3
  edgeBandingTracking: false,  // NEW - Tier 3
  offcutManagement: false,  // NEW - Tier 3
  minimumOffcutSize: false,  // NEW - Tier 3
  manualLayoutAdjustment: false,  // NEW - Tier 3
  
  // Phase 6
  doorCalculator: true,
  drawerFaceCalculator: true,
  
  // Phase 7
  pdfExport: true,
  costEstimation: true,
  
  // V2 Features
  visualization3D: false,  // Phase 8
  augmentedReality: false,  // Phase 9
  dxfExport: false,  // V2 - CNC integration (see Research §14)
  advancedCNCMode: false,  // V2 - nested parts, tabs (see Research §14)
};
```

**Why this works:**
- Early users don't see incomplete features
- Advanced users can opt-in via settings
- We can ship incomplete builds for testing
- Easy to AB test feature complexity
- V2 features can be beta-tested with subset of users

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
│   Optimization: Guillotine ▼    │  ← NEW
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

### Pattern 4: "2D Layout Canvas" (NEW)
```
┌─────────────────────────────────┐
│ Kitchen Layout          [+ Add] │
│                                 │
│  ╔═══╗ ╔═══╗ ╔═══╗             │
│  ║ 18║ ║ 24║ ║ 18║  ← Cabinets │
│  ╚═══╝ ╚═══╝ ╚═══╝             │
│                                 │
│  Total run: 60"                 │
│  [2D View] [3D View] [AR View]  │  ← Mode toggles
└─────────────────────────────────┘
```

### Pattern 5: "Optimization Mode Toggle" (NEW - from Research)
```
┌─────────────────────────────────┐
│ Cutting Optimization            │
│                                 │
│ ● Guillotine (Table Saw)        │  ← Default for DIY
│   Simple cuts, easy to follow   │
│                                 │
│ ○ Efficiency (Advanced)         │
│   Minimum waste, complex cuts   │
│                                 │
│   Cut Preference: Length ▼      │  ← Shows if Guillotine
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
6. Selects "Guillotine" optimization for table saw
7. Gets accurate cut list with numbered cutting sequence

**Pass criteria:** User sees 2-3 new options, not 20. Still feels in control. Cutting diagram shows practical cut sequence.

---

### Tier 3 Validation Test
1. Experienced woodworker opens app
2. Immediately enables "Pro Mode"
3. Selects dado joinery
4. Sets 1/4" dado depth
5. Customizes reveals to 2mm
6. Enables edge banding tracking
7. Sets minimum offcut size to 12"×12"
8. Cut list reflects dado depth in dimensions
9. Cutting diagram shows edge banding indicators
10. Offcuts larger than 12"×12" preserved

**Pass criteria:** Every dimension is adjustable, nothing feels locked down. Advanced features work correctly.

---

### Multi-Cabinet Validation Test (NEW)
1. User creates base cabinet (24")
2. Taps "Add Cabinet"
3. Creates second cabinet (30")
4. Switches to 2D Layout view
5. Drags cabinets side-by-side
6. Sees total run length (54")
7. Gets combined cut list for both
8. Cutting diagram shows parts color-coded by cabinet

**Pass criteria:** Layout feels intuitive, combined cut list shows all parts from both cabinets with optimized sheet usage, color coding helps identify which parts belong to which cabinet.

---

### Corner Cabinet Validation Test (NEW)
1. User starts new kitchen project
2. Adds 36" diagonal corner base
3. Adds 24" base on left side
4. Adds 30" base on right side
5. 2D layout auto-snaps corner to wall intersection
6. Cut list includes angled face pieces
7. Lazy Susan hardware appears in shopping list

**Pass criteria:** Corner cabinet integrates seamlessly, dimensions account for angled cuts, layout shows proper corner placement.

---

### Sheet Optimizer Validation Test (NEW - from Research)
1. User creates 4-cabinet kitchen project
2. All parts auto-generate with grain directions
3. Optimizer runs (< 5 seconds for 40 parts)
4. Cutting diagram shows:
   - Parts arranged efficiently (>80% utilization)
   - Grain arrows on all parts
   - Cut sequence numbers (Guillotine mode)
   - Parts color-coded by cabinet
   - Waste areas shaded
5. User switches to Efficiency mode
6. Diagram updates with different layout (higher utilization, more complex cuts)
7. User exports PDF with diagrams

**Pass criteria:** 
- Optimization completes quickly
- Grain constraints respected (vertical parts never rotated)
- Guillotine mode produces table-saw-friendly cuts
- Efficiency mode achieves >85% utilization
- PDF export includes all diagrams with labels

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

### Week 3: Optimizer (Phase 2) ⭐
**📚 Before starting: Read `SHEET_OPTIMIZER_RESEARCH.md` in full**

**Claude Code tasks:**
1. Sheet optimizer module (src/utils/sheetOptimizer.ts)
   - **Guillotine bin packing algorithm** (see Research §Algorithm Considerations)
   - Grain direction constraints (see Research §2)
   - Returns layout coordinates with cut sequences
   - TypeScript interfaces from Research §Implementation Recommendations
2. Cutting diagram component (React Native SVG)
   - Renders 4'x8' sheet (or 1220×2440mm)
   - Draws rectangles for each part
   - Labels with part names and dimensions
   - Shows grain direction with arrows (see Research §2)
   - Shows cut sequence numbers (see Research §6)
   - Color-codes by cabinet (multi-cabinet prep)
3. Waste calculation display
   - Utilization percentage
   - Waste area in sq ft or sq m
   - Identify usable offcuts

**Key Research Insights to Apply:**
- Conservative kerf default (1/8" = 3.175mm)
- Auto-assign grain based on part type (sides=vertical, tops=horizontal)
- Cut sequence numbering solves major user pain point
- Target 80-85% efficiency (realistic for Guillotine algorithm)

**Algorithm Resources (from Research):**
- Consider `bin-packing` npm package (evaluate if it supports grain constraints)
- Or implement custom Guillotine First-Fit Decreasing Height
- See Research §Algorithm Considerations for pseudocode

**Deliverable:** Cut list includes visual diagram with grain arrows, cut numbers, and efficiency stats.

---

### Week 4: Flexibility (Phase 3)
**Claude Code tasks:**
1. Project settings screen
   - Unit system toggle (Imperial/Metric)
   - Default joinery picker
   - Saw kerf input
2. Custom dimension inputs (CabinetBuilder Tier 2 UI)
3. Drawer builder screen (basic drawer box)
4. SQLite persistence layer (prep for multi-cabinet)
5. **NEW: Optimization mode toggle** (see `SHEET_OPTIMIZER_RESEARCH.md` §5)
   - Guillotine vs Efficiency mode UI
   - Cut preference selector (length/width first) for Guillotine
   - Update optimizer to support both algorithms

**Deliverable:** Users can design custom cabinets and choose optimization strategy.

---

### Week 5-6: Multi-Cabinet & 2D Layout (Phase 4)
**Claude Code tasks:**
1. Project data model expansion (multiple cabinets per project)
2. Cabinet list/management UI (add/edit/delete/duplicate)
3. **2D Layout Canvas** (NEW - major feature):
   - React Native SVG canvas for layout
   - Cabinet drag-and-drop positioning
   - Wall length measurement display
   - Gap detection between cabinets
   - Top-down view renderer
4. Combined cut list aggregator
5. Sheet optimizer multi-cabinet support
   - **Color-code parts by cabinet** (see `SHEET_OPTIMIZER_RESEARCH.md` §6)
   - Multi-sheet handling (see Research §11)

**Deliverable:** Full kitchen design capability with visual layout and color-coded cutting diagrams.

---

### Week 6-7: Corner Cabinets (Phase 4.5)
**Claude Code tasks:**
1. Corner cabinet types (src/types - add DiagonalCorner, BlindCorner, NinetyCorner)
2. Corner cabinet calculator (src/utils/cornerCabinetCalculator.ts)
   - Diagonal face angle math
   - Blind corner return depth logic
   - 90° corner post/filler calculations
3. Corner cabinet UI (type picker with diagrams)
4. 2D layout corner snapping logic
5. Hardware recommendations (lazy Susan, pull-outs)

**Deliverable:** Corner cabinet support with proper geometry.

---

### Week 8-9: Pro Mode (Phase 5)
**📚 Reference: `SHEET_OPTIMIZER_RESEARCH.md` §Advanced Features**

**Claude Code tasks:**
1. Joinery selector component
2. Reveal customization screen
3. Dado dimension calculator (adjusts cut list)
4. Material library (CRUD for custom materials)
5. Drawer construction options UI
6. **NEW: Edge banding tracker** (see Research §4)
   - Auto-detect visible edges on parts
   - Calculate linear feet needed
   - Add to hardware shopping list
   - Show indicators on cutting diagram
7. **NEW: Offcut management** (see Research §7)
   - Save waste pieces from layouts
   - Stock library with offcut dimensions
   - Optimizer uses offcuts before new sheets
8. **NEW: Minimum offcut size setting** (see Research Pain Point #6)
   - User preference for minimum useful size
   - Optimizer penalizes tiny scraps

**Deliverable:** Experienced users have full control over optimization, edge banding, and material reuse.

---

### Week 10: Completion (Phase 6)
**Claude Code tasks:**
1. Door calculator (single/double logic)
2. Drawer face calculator
3. Hardware recommendations

**Deliverable:** Complete cabinets, not just boxes.

---

### Week 11-12: Production (Phase 7)
**Claude Code tasks:**
1. PDF export (jsPDF integration)
   - Include 2D layout view in PDF
   - Cutting diagrams with grain arrows and cut sequences
   - Edge banding indicators (if enabled)
2. Cost estimation calculator
3. Material shopping list generator
   - Includes edge banding linear feet
4. CSV export
5. Project sharing (export/import)

**Deliverable:** Professional-quality output ready to share.

---

### Week 13-15: 3D Visualization (V2 - Phase 8)
**Research & Planning:**
- Evaluate Three.js vs Babylon.js for React Native
- Test performance on mid-range Android devices
- Design 3D cabinet mesh templates

**Claude Code tasks:**
1. 3D rendering engine integration (expo-gl + expo-three)
2. Cabinet mesh generator (from dimensions → 3D geometry)
3. Material/texture system (wood grain, hardware)
4. 3D camera controls (orbit, pan, zoom)
5. 3D scene composer (multi-cabinet kitchen view)
6. Screenshot/export functionality

**Deliverable:** Interactive 3D preview of cabinets and full kitchens.

---

### Week 16-18: Augmented Reality (V2 - Phase 9)
**Research & Planning:**
- ARKit/ARCore compatibility testing
- Plane detection accuracy validation
- Lighting estimation tuning

**Claude Code tasks:**
1. AR camera interface (expo-ar integration)
2. Plane detection & surface tracking
3. Cabinet placement system (tap-to-place)
4. AR interaction controls (move/rotate cabinets)
5. AR measurement tools (wall length, corner detection)
6. AR capture (photo/video with virtual cabinets)
7. AR calibration settings

**Deliverable:** AR mode that overlays life-size cabinets in real rooms via phone camera.

---

## Success Metrics

### For Tier 1 Users (DIYers):
- Time to first cut list: < 2 minutes
- % who complete first cabinet: > 80%
- % who feel overwhelmed: < 10%
- **NEW (Research-validated):** % who understand cutting diagram on first view: > 70%

### For Tier 2 Users (Customizers):
- % who find "Advanced Options": > 60%
- % who successfully customize dimensions: > 90%
- **NEW:** % who use 2D layout view: > 50%
- **NEW:** % who try both optimization modes: > 30%

### For Tier 3 Users (Pros):
- % who enable Pro Mode: 5-10%
- % who use dado joinery: > 50% of Tier 3
- % who report accurate dimensions: > 95%
- **NEW:** % who use offcut management: > 40% of Tier 3
- **NEW:** % who enable edge banding tracking: > 60% of Tier 3

### For Multi-Cabinet Projects (NEW):
- Average cabinets per project: 4-6
- % of projects with corner cabinets: 30-40%
- % who use 2D layout before cutting: > 70%

### For Sheet Optimizer (Research-Validated):
- Average utilization percentage: > 82% (Guillotine), > 88% (Efficiency)
- Optimization time for 50 parts: < 5 seconds
- % who find cutting sequence helpful: > 75%
- % who say optimizer prevented waste: > 65%

### For V2 Features (3D & AR):
- **3D Visualization:**
  - % who view 3D at least once: > 60%
  - % who prefer 3D over 2D for review: 20-30%
  - 3D load time: < 3 seconds
- **Augmented Reality:**
  - % who try AR mode: 40-50% (mobile only)
  - % who use AR for measurements: 20-30%
  - % who share AR screenshots: 30-40%
  - AR placement accuracy: ±2 inches

---

## Open Questions & Future Considerations

### Questions We'll Answer During Development:
1. **Sheet size flexibility:** Should we let Tier 2 users pick sheet size, or keep 4x8 default until Tier 3?
2. **Material library scope:** Start with 3 preset materials, or let Tier 1 users add custom from the start?
3. **Drawer quantity:** Auto-suggest drawer count based on cabinet height, or require manual input?
4. **Reveal presets:** Offer "tight" vs "standard" vs "loose" reveal presets before full customization?
5. **Hardware integration:** Link to actual products (affiliate?) or just give specs?
6. **2D layout grid:** Snap to 1" increments, or allow free placement?
7. **Corner cabinet defaults:** Start with 36" diagonal only, or offer 42" option in Tier 1?
8. **3D performance:** Minimum device specs for smooth 3D rendering?
9. **AR accuracy:** How to handle rooms with poor lighting or dark walls?
10. **NEW (from Research):** Should we show CNC-specific optimization mode in V1, or wait for V2 DXF export?

### Variables We Might Be Missing:
- **Edge banding:** ~~Do we calculate edge banding length/quantity?~~ ✅ **YES - Phase 5 (Research §4)**
- **Back panel options:** Hardboard vs plywood vs shiplap? (Tier 3)
- **Shelf quantity/adjustability:** Fixed shelves vs adjustable holes? (Phase 4)
- ~~**Corner cabinet support:** Lazy Susan mechanics?~~ ✅ **NOW PHASE 4.5**
- **Overlay types:** Full overlay vs inset vs partial? (Phase 6, Tier 3)
- **Hinge types:** European cup vs butt hinges? (Phase 6)
- **Finish allowances:** Does paint/stain thickness affect reveals? (Tier 3, edge case)
- **Multi-sheet optimization:** ~~What if parts don't fit on one sheet?~~ ✅ **Phase 4 (Research §11)**
- **2D layout wall dimensions:** How to input room boundaries/obstacles?
- **Cabinet spacing:** Auto-calculate fillers between non-standard gaps?
- **Appliance integration:** Show fridge/stove/dishwasher in 2D/3D layout?
- **Countertop overhang:** Does 2D layout show countertop edges?
- **3D export formats:** OBJ, STL, or both for external CAD tools?
- **AR room persistence:** Save AR placements between sessions?
- **Multi-user collaboration:** Share projects for family/contractor input?
- **NEW (from Research):** Linear material optimization (boards, trim) - worth V1 or V2?
- **NEW (from Research):** DXF export priority - how many users actually need CNC integration?
- **NEW (from Research):** Offcut photos with camera integration - valuable or overkill?
- **NEW (from Research):** Grain matching sets for adjacent parts - too niche?

---

## Communication Between Claude Instances

### For Claude Code:
**Files to check first:**
1. `DEVELOPMENT_PLAN.md` (this file) → see current phase and priority tasks
2. `SHEET_OPTIMIZER_RESEARCH.md` → detailed competitive analysis and implementation guidance
3. `CLAUDE.md` → technical context

**When starting a session:**
1. Check git log for last commit message (shows completed features)
2. Read current phase section in this file
3. **If working on Phase 2-5:** Read relevant sections of `SHEET_OPTIMIZER_RESEARCH.md`
4. Implement next task in the priority list
5. Update this file's "Current Status" section (below) when completing a phase

**Phase 2 Specific (Sheet Optimizer):**
- Read `SHEET_OPTIMIZER_RESEARCH.md` IN FULL before writing code
- Use TypeScript interfaces from Research §Implementation Recommendations
- Follow algorithm guidance from Research §Algorithm Considerations
- Apply user pain point solutions from Research §Competitive Differentiation

### For Claude.ai:
**Files to reference:**
1. This file + `CLAUDE.md` for technical decisions
2. `SHEET_OPTIMIZER_RESEARCH.md` for optimizer feature planning

**When planning features:**
1. Check which phase we're in
2. Ensure new features match the tier system
3. Don't over-engineer for Tier 3 when building Tier 1
4. Consider progressive disclosure in every UI decision
5. **Reference research when discussing optimizer features**

---

## Current Status

**Last Updated:** 2026-02-08

**Completed:**
- ✅ Project scaffolding (Expo + dependencies)
- ✅ Folder structure
- ✅ Unit conversion utility (src/utils/unitConversion.ts)
- ✅ TypeScript types (src/types/index.ts)
- ✅ Cabinet constants (src/constants/cabinetDefaults.ts)
- ✅ Navigation setup + placeholder screens
- ✅ **Sheet optimizer competitive research** (SHEET_OPTIMIZER_RESEARCH.md - 26KB analysis)

**Current Phase:** Phase 1 - Minimal Viable Cabinet

**Next Task:** Cabinet calculator module (src/utils/cabinetCalculator.ts)

**Blockers:** None

**Notes:** 
- Foundation is solid
- Comprehensive sheet optimizer research completed (Feb 8, 2026)
- Research validates that sheet optimizer is THE killer feature
- Clear implementation path: Guillotine algorithm for V1, color-coded diagrams, cut sequences
- Expanded plan now covers full kitchen design workflow (multi-cabinet projects, corner solutions, 2D layout) and V2 vision (3D visualization, AR preview)
- Ready to build first tangible feature (cabinet calculation logic)

**Research Findings Summary:**
- Competitors charge $50-300/year; our $39-49 one-time price is highly competitive
- User pain points: unrealistic cuts, poor grain handling, complex UIs
- Guillotine algorithm prioritizes practical table-saw cuts over maximum efficiency
- Color-coding parts by cabinet solves shop organization problem
- Edge banding tracking, offcut management are valuable Tier 3 features
- See `SHEET_OPTIMIZER_RESEARCH.md` for full 26KB analysis

---

## Notes for Ryan

**Remember:**
- Don't build Tier 3 features in Phase 1 — resist the temptation!
- Test on real DIYers (not just yourself) to validate Tier 1 simplicity
- If you're confused by a term, your users will be too → simplify or hide in Tier 3
- Every new input field is cognitive load → default it until proven necessary
- **NEW:** Multi-cabinet projects are core to V1, not an afterthought — design single-cabinet features with multi-cabinet scaling in mind
- **NEW:** Corner cabinets are complex but essential — don't skip them, but keep Tier 1 simple (diagonal only)
- **NEW:** 2D layout is a differentiator — invest in polish here, it's what users will share on social media
- **NEW:** 3D/AR are V2 — don't let them distract from shipping V1, but keep them in mind architecturally
- **NEW (Research):** Sheet optimizer is THE killer feature — read SHEET_OPTIMIZER_RESEARCH.md before Phase 2

**When in doubt:**
- Start with the simplest version that works
- Ship it
- Learn what users actually need
- Add granularity based on real feedback

**When building the sheet optimizer (Phase 2):**
- Read `SHEET_OPTIMIZER_RESEARCH.md` first (don't skip this!)
- Guillotine algorithm = table-saw friendly (our differentiator)
- Grain direction auto-assignment prevents user errors
- Cut sequence numbers solve major user pain point
- Target 80-85% efficiency (don't over-optimize for 2% gains)
- Color-coding by cabinet = unique feature vs competitors

**Philosophy:**
> "A beginner should be able to design their first cabinet without knowing what a 'reveal' is. An expert should be able to specify reveals down to the millimeter. Both should feel the app was built for them."

**Extended Philosophy (Multi-Cabinet & Visualization):**
> "A DIYer should be able to layout their whole kitchen in 2D, see it in 3D, preview it in AR in their actual space, get a complete cut list and shopping list, and build it confidently — all from their phone while standing in their kitchen."

**Research-Validated Philosophy (Sheet Optimizer):**
> "Practical cutting sequences matter more than squeezing out 2% efficiency. A DIYer with a table saw needs edge-to-edge cuts they can follow. The grain needs to look right. The parts need to be labeled clearly. Efficiency is great, but usability is better."
