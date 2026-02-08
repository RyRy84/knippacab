# KnippaCab Development Plan

**Referenced Documents:**
- `SHEET_OPTIMIZER_RESEARCH.md` - Comprehensive competitive analysis of 10+ cutting optimization tools, algorithm recommendations, feature priorities, and implementation guidelines (see Phase 2)
- `CLAUDE.md` - Technical context and project overview for Claude Code

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

### **Phase 2: Sheet Goods Optimizer (Week 3)** ⭐ **RESEARCH COMPLETE**
*Goal: The killer feature — visual cutting diagrams*

**📖 DETAILED RESEARCH AVAILABLE:** See `SHEET_OPTIMIZER_RESEARCH.md` for:
- Competitive analysis of CutList Evolution, CutList Plus, SmartCut, MaxCut, and 6+ other tools
- Algorithm selection guidance (Guillotine vs Shelf vs Genetic)
- User pain points from forums and app reviews
- Feature prioritization (V1 must-haves, Tier 2/3, V2 opportunities)
- TypeScript interfaces and implementation examples
- Edge banding, offcut management, CNC integration considerations

**Deliverable:** Tier 1 gets visual 2D cutting layouts.

**V1 Must-Have Features (Research-Validated):**
1. **Guillotine bin packing algorithm** (table-saw friendly, practical cut sequences)
2. Grain direction constraints (vertical parts = vertical grain, auto-assigned)
3. SVG diagram renderer (React Native SVG) with:
   - Part labels and dimensions
   - Grain direction arrows
   - Color-coded by cabinet (multi-cabinet projects)
   - Cut sequence numbers (guillotine mode)
4. Sheet utilization percentage display
5. Waste calculation
6. PDF export

**What's still simple:**
- Fixed sheet size: 4'x8' only
- One material type
- Auto-assigned grain direction
- Efficiency mode only (guillotine mode in Tier 2)

**Tier 2 Features (from research):**
- Guillotine vs Efficiency mode toggle
- Edge banding tracking
- Minimum offcut size setting

**V2 Opportunities (from research):**
- DXF export for CNC (validated hobbyist demand)
- Advanced CNC mode (nested parts, tab placement)
- Offcut management (save/reuse waste)
- Linear optimization (boards, trim)

**Algorithm Decision (Research-Backed):**
- **V1:** Guillotine algorithm (First-Fit Decreasing Height)
  - Fast calculation
  - Practical table saw cuts
  - 80-85% efficiency typical
  - Best for DIY users
- **V1.5:** Add Shelf algorithm for efficiency mode
- **V2:** Consider genetic algorithm only if justified by user data

**Key Research Insights:**
- Users care more about *practical cutting sequences* than 2% efficiency gains
- "Optimizer says 1 sheet but I needed 2" is #1 complaint (caused by poor kerf/grain handling)
- Mobile-native + one-time purchase = major competitive advantage
- CutList Evolution's "ML claims" likely marketing; traditional algorithms already near-optimal

**Validation:** Cut list from Phase 1 shows a labeled 2D diagram where to cut each part on a plywood sheet.

**Implementation Guidance:** See `SHEET_OPTIMIZER_RESEARCH.md` sections:
- "Algorithm Considerations" for bin packing approach
- "Core Features Analysis" for feature details  
- "Implementation Recommendations" for TypeScript code examples

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
5. **Sheet optimizer accounts for all parts** from all cabinets (see Phase 2 research for multi-cabinet optimization)
6. **Project save/load** (SQLite)

**What becomes powerful:**
- Design full kitchen runs
- Visualize how cabinets fit together
- Minimize waste across multiple cabinets
- Edit individual cabinets independently
- Detect spacing issues early

**Validation:** User designs a 3-cabinet kitchen (24" sink base + two 18" bases), arranges them in 2D layout view to see total run length (66"), and gets one optimized cutting plan.

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
2. Material cost estimation
3. Hardware shopping list with quantities
4. Cut list export to CSV
5. 2D cabinet wireframe preview per cabinet
6. Print-friendly layouts
7. Email/share project files

**What becomes professional:**
- Share plans with others
- Take to the lumberyard with confidence
- Estimate total project cost

**Validation:** User exports a complete kitchen plan as PDF with 2D layout, cutting diagrams, and shopping list, estimates $800 in materials, and builds it successfully.

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
  
  // Phase 3
  customDimensions: true,
  metricUnits: true,
  drawerSupport: true,
  
  // Phase 4
  multiCabinetProjects: true,
  layout2D: true,  // NEW
  projectSaveLoad: true,
  
  // Phase 4.5
  cornerCabinets: true,  // NEW
  
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
  
  // V2 Features
  visualization3D: false,  // Phase 8
  augmentedReality: false,  // Phase 9
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

### Multi-Cabinet Validation Test (NEW)
1. User creates base cabinet (24")
2. Taps "Add Cabinet"
3. Creates second cabinet (30")
4. Switches to 2D Layout view
5. Drags cabinets side-by-side
6. Sees total run length (54")
7. Gets combined cut list for both

**Pass criteria:** Layout feels intuitive, combined cut list shows all parts from both cabinets with optimized sheet usage.

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

### Week 3: Optimizer (Phase 2) ⭐ **SEE SHEET_OPTIMIZER_RESEARCH.md**
**Claude Code tasks:**
1. Sheet optimizer module (src/utils/sheetOptimizer.ts)
   - **Guillotine bin packing algorithm** (see research doc for approach)
   - Grain direction constraints
   - Returns layout coordinates
2. Cutting diagram component (React Native SVG)
   - Renders 4'x8' sheet
   - Draws rectangles for each part
   - Labels with part names
   - Shows grain direction with arrows
   - **Color-codes parts by cabinet** (from research)
   - **Cut sequence numbers** (from research - guillotine mode)
3. Waste calculation display
4. Utilization percentage

**Before starting:** Read `SHEET_OPTIMIZER_RESEARCH.md` sections:
- "Algorithm Considerations" (Guillotine approach)
- "Implementation Recommendations" (TypeScript code structure)
- "Diagram Rendering" (SVG component patterns)

**Deliverable:** Cut list includes visual diagram with grain arrows and color coding.

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

**Deliverable:** Users can design custom cabinets.

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
5. Sheet optimizer multi-cabinet support (see research doc for multi-sheet handling)

**Deliverable:** Full kitchen design capability with visual layout.

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
**Claude Code tasks:**
1. Joinery selector component
2. Reveal customization screen
3. Dado dimension calculator (adjusts cut list)
4. Material library (CRUD for custom materials)
5. Drawer construction options UI

**Deliverable:** Experienced users have full control.

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
   - Include cutting diagrams with color coding
2. Cost estimation calculator
3. Material shopping list generator
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

### For Tier 2 Users (Customizers):
- % who find "Advanced Options": > 60%
- % who successfully customize dimensions: > 90%
- **NEW:** % who use 2D layout view: > 50%

### For Tier 3 Users (Pros):
- % who enable Pro Mode: 5-10%
- % who use dado joinery: > 50% of Tier 3
- % who report accurate dimensions: > 95%

### For Multi-Cabinet Projects (NEW):
- Average cabinets per project: 4-6
- % of projects with corner cabinets: 30-40%
- % who use 2D layout before cutting: > 70%

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

### Variables We Might Be Missing:
- **Edge banding:** Do we calculate edge banding length/quantity? ← **YES per research, Tier 2 feature**
- **Back panel options:** Hardboard vs plywood vs shiplap? (Tier 3)
- **Shelf quantity/adjustability:** Fixed shelves vs adjustable holes? (Phase 4)
- ~~**Corner cabinet support:** Lazy Susan mechanics? (V2 - complex geometry)~~ ← NOW PHASE 4.5
- **Overlay types:** Full overlay vs inset vs partial? (Phase 6, Tier 3)
- **Hinge types:** European cup vs butt hinges? (Phase 6)
- **Finish allowances:** Does paint/stain thickness affect reveals? (Tier 3, edge case)
- **Multi-sheet optimization:** What if parts don't fit on one sheet? ← **YES per research, V1 feature**
- **2D layout wall dimensions:** How to input room boundaries/obstacles?
- **Cabinet spacing:** Auto-calculate fillers between non-standard gaps?
- **Appliance integration:** Show fridge/stove/dishwasher in 2D/3D layout?
- **Countertop overhang:** Does 2D layout show countertop edges?
- **3D export formats:** OBJ, STL, or both for external CAD tools?
- **AR room persistence:** Save AR placements between sessions?
- **Multi-user collaboration:** Share projects for family/contractor input?
- **Offcut management:** Save/reuse waste pieces? ← **YES per research, Tier 3 feature**
- **DXF export for CNC:** ← **YES per research, V2 priority** (validated Shapeoko/X-Carve demand)

---

## Communication Between Claude Instances

### For Claude Code:
**Files to check first:** 
1. `DEVELOPMENT_PLAN.md` → see current phase and priority tasks
2. `SHEET_OPTIMIZER_RESEARCH.md` → Phase 2 implementation details (when working on optimizer)
3. `CLAUDE.md` → technical project overview

**When starting a session:**
1. Check git log for last commit message (shows completed features)
2. Read current phase section in this file
3. **If Phase 2:** Read relevant sections of `SHEET_OPTIMIZER_RESEARCH.md` before coding
4. Implement next task in the priority list
5. Update this file's "Current Status" section (below) when completing a phase

### For Claude.ai:
**File to reference:** This file + `CLAUDE.md` for technical decisions + `SHEET_OPTIMIZER_RESEARCH.md` for optimizer strategy.

**When planning features:**
1. Check which phase we're in
2. Ensure new features match the tier system
3. Don't over-engineer for Tier 3 when building Tier 1
4. Consider progressive disclosure in every UI decision
5. Reference research docs for competitive context and user pain points

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
- ✅ **Sheet Optimizer Research** (comprehensive competitive analysis - see SHEET_OPTIMIZER_RESEARCH.md)

**Current Phase:** Phase 1 - Minimal Viable Cabinet

**Next Task:** Cabinet calculator module (src/utils/cabinetCalculator.ts)

**Blockers:** None

**Notes:** 
- Foundation is solid. Expanded plan now covers full kitchen design workflow (multi-cabinet projects, corner solutions, 2D layout) and V2 vision (3D visualization, AR preview).
- **NEW:** Comprehensive sheet optimizer research completed (Feb 8, 2026). See `SHEET_OPTIMIZER_RESEARCH.md` for:
  - Analysis of 10+ competing tools (CutList Evolution, CutList Plus, SmartCut, etc.)
  - Algorithm recommendation: Guillotine for V1 (table-saw friendly)
  - User pain points from forums/reviews
  - Feature priorities validated through competitive research
  - TypeScript implementation examples
  - This research confirms sheet optimizer is THE killer feature that justifies price point
- Ready to build first tangible feature (cabinet calculation logic), then move to Phase 2 (optimizer) with full research backing.

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
- **NEW (Feb 8):** Sheet optimizer research validates this is your competitive moat — mobile-native + practical cuts + one-time purchase beats all competitors

**When in doubt:**
- Start with the simplest version that works
- Ship it
- Learn what users actually need
- Add granularity based on real feedback

**Philosophy:**
> "A beginner should be able to design their first cabinet without knowing what a 'reveal' is. An expert should be able to specify reveals down to the millimeter. Both should feel the app was built for them."

**Extended Philosophy (Multi-Cabinet & Visualization):**
> "A DIYer should be able to layout their whole kitchen in 2D, see it in 3D, preview it in AR in their actual space, get a complete cut list and shopping list, and build it confidently — all from their phone while standing in their kitchen."

**Research-Backed Philosophy (Sheet Optimizer):**
> "Users don't need 95% efficiency if they can't actually make the cuts. Guillotine mode at 85% efficiency beats 'optimal' packing at 90% if the cutting sequence is impossible on a table saw. Mobile-native + practical = winner."
