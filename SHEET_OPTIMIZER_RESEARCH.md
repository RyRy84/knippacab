# Sheet Goods Optimizer - Competitive Research & Feature Analysis

**Last Updated:** 2026-02-08

## Executive Summary

Based on extensive research of cutting optimization tools including CutList Evolution (Cut Revolution), CutList Optimizer, MaxCut, CutList Plus, and others, this document outlines the essential features, user pain points, and opportunities for KnippaCab's sheet optimizer to deliver exceptional value.

**Key Finding:** Most optimizers achieve 80-90% material efficiency, but CutList Evolution claims "up to 10% better" through machine learning. However, user complaints center on **ease of use**, **grain direction accuracy**, **practical cutting sequences**, and **CNC integration** — not raw optimization percentage.

---

## Competitive Landscape

### Premium Tools ($50-300/year or one-time)

#### CutList Evolution / Cut Revolution Suite
**Products:**
- **Cutlist Evolution** - Web-based professional tool (£5/month starter, higher tiers)
- **SmartCut App** - iOS mobile app with subscriptions
- **SmartCut API** - Integration for businesses

**Strengths:**
- Machine learning algorithm that "constantly improves"
- Claims 90%+ efficiency reliably, "up to 10% better than competitors"
- Web-based (access anywhere, cross-device sync)
- Second optimization pass to minimize number of cuts
- Sheet & linear material support
- Edge banding tracking
- Offcut management (feed waste into future projects)
- Trim stock options
- Multiple optimization levels/strategies

**Weaknesses (from reviews):**
- Learning curve for first-time users
- Interface not as intuitive as claimed
- Subscription fatigue (users want one-time purchase)
- Limited offline capability (web-dependent)
- Some users report needing 2 sheets when optimizer says 1 needed

**Pricing:**
- Freemium model with limitations
- Pro tier: ~£5-10/month
- iOS app: Subscription-based, can pause

#### CutList Plus fx
**Price:** $89-$299 (one-time, tiered)
**Platform:** Windows desktop

**Strengths:**
- Established reputation (mentioned in forums since 2005)
- Both sheet goods AND linear (board feet calculator)
- Material cost estimation built-in
- Mature feature set
- Loyal user base
- Mobile viewer apps (iOS/Android) included free

**Weaknesses:**
- Windows-only (not cross-platform)
- Desktop-only (no native mobile app for creation)
- Slow to load (user complaints)
- Confusing start screen
- Learning curve if not used regularly
- Interface feels dated

#### CutList Optimizer (cutlistoptimizer.com)
**Price:** Subscription ($8.99 unlock mentioned)
**Platform:** Web + Android app

**Strengths:**
- Online web app + Android mobile
- Cross-device sync (cloud-based)
- Material types support
- Edge banding
- Grain direction
- CSV import/export
- PDF export
- Imperial/metric + fractions

**Weaknesses:**
- Subscription model (monthly payments)
- Customer support issues reported (payment charged but app locked)
- Free tier very limited
- Algorithm sometimes produces inefficient layouts

### Mid-Tier Tools ($30-90 one-time)

#### MaxCut
**Price:** Free
**Strengths:**
- Price (free!)
- Grain direction support
- Simple interface
**Weaknesses:**
- Limited features vs paid tools
- Less sophisticated optimization

#### SheetCut Optimizer (Measure Square)
**Price:** In-app purchases
**Platform:** iOS mobile app

**Strengths:**
- True mobile-native app
- Up to 6 optimization levels (higher level = better yield but more complex cuts)
- Fast calculation (even 100+ parts in seconds)
- PDF + CAD export (DXF)
- Rotatable parts option

**Weaknesses:**
- Confusing "cut level" concept (not well explained)
- No thickness/material management
- Popup keyboard issues reported
- No multi-material project support (needs separate lists per thickness)

### Free/Hobbyist Tools

#### optiCutter
**Price:** Free tier available
**Platform:** Web-based

**Strengths:**
- Completely free for basic use
- Fast heuristic algorithms
- Simple interface

**Weaknesses:**
- Limited features in free tier
- Basic optimization only

---

## Core Features Analysis

### Essential Features (Must-Have for V1)

#### 1. **Material Types & Dimensions**
- Sheet material (2D): plywood, MDF, acrylic, etc.
- Linear material (1D): lumber, trim, pipes, bars
- Custom sheet sizes (not just 4x8)
  - Standard: 4x8, 4x4, 5x5
  - Metric: 2440x1220mm, custom
- Material thickness tracking (group parts by thickness)

**KnippaCab Advantage:** Auto-generate from cabinet design, but allow manual override

---

#### 2. **Grain Direction / Part Orientation**
**Critical Importance:** Mentioned in nearly every forum discussion

**Implementation Levels:**
- **Basic:** Binary (grain matters / doesn't matter)
- **Standard:** Per-part grain direction (vertical/horizontal/any)
- **Advanced:** Visual grain direction arrows in diagram

**User Pain Point:** 
> "I would rather buy an extra sheet of plywood rather live with some glaring tonal mismatch in a cabinet because a piece of software told me I'd save a few bucks."

**KnippaCab Strategy:**
- Default: Auto-assign grain based on part type (vertical parts = vertical grain, horizontal = horizontal)
- Tier 2: Manual override per part
- Tier 3: Grain matching priority slider (optimize grain vs minimize waste)

---

#### 3. **Blade Width / Kerf**
**Standard Kerf Widths:**
- Table saw: 1/8" (3.175mm) typical
- Thin kerf: 3/32" (2.381mm)
- CNC: 1/16" (1.587mm) typical
- Laser: Near-zero (cosmetic only)

**Implementation:**
- User-configurable saw kerf
- Presets for common saw types
- Visual representation in cutting diagram

**KnippaCab Default:** 1/8" (matches table saw, most common DIY tool)

---

#### 4. **Edge Banding**
**What It Is:** Thin strips applied to exposed plywood edges
- Wood veneer (real wood)
- PVC/ABS (plastic)
- Melamine (pre-finished)

**Tracking Needs:**
- Which edges need banding (L1, L2, W1, W2)
- Banding thickness (deducted from part dimensions)
- Banding length totals for shopping list

**Implementation:**
- Visual: Small squares on diagram edges needing banding
- Automatic for cabinet parts (front edges typically banded)
- Manual toggle per part in Tier 2/3

**KnippaCab Integration:** 
- Auto-mark visible cabinet edges for banding
- Calculate total linear feet needed
- Add to hardware shopping list

---

#### 5. **Optimization Strategy**
**Two Main Approaches:**

**A. Efficiency Mode (Default)**
- Minimize material waste
- Pack parts tightly
- Result: Least sheets used, but potentially complex cutting sequence

**B. Guillotine Mode / Cut Preference**
- Optimize for practical cutting method
- Options:
  - **Length cuts first:** Rip full sheet lengthwise, then crosscut
  - **Width cuts first:** Crosscut sheet, then rip strips
  - **Edge-to-edge only:** Straight cuts across entire sheet (table saw friendly)

**User Pain Point:**
> "Optimizer doesn't always arrange parts the way I would cut them from the plywood given I might want my waste pieces optimized in a different size."

**CNC Considerations:**
> "Wait til you start optimizing for CNC when your logic is full length X/Y axis rips only and you're no longer constrained by that method and parts can be tucked in small notches and waste areas."

**KnippaCab Approach:**
- Default: Efficiency mode (most sheets saved)
- Tier 2: Guillotine mode toggle with cut preference
- Tier 3: Manual layout adjustment (drag parts to reposition)

---

#### 6. **Visual Cutting Diagram**
**Critical Features:**
- Clear part labels (with dimensions)
- Color coding (by part type or cabinet)
- Grain direction indicators (arrows)
- Cut sequence numbers (for guillotine mode)
- Measurements on all cuts
- Sheet utilization percentage
- Waste areas highlighted

**Export Formats:**
- PDF (print for shop)
- Image (PNG/JPEG for sharing)
- CAD (DXF for CNC)

**KnippaCab Differentiator:** 
- Color-code parts by cabinet (multi-cabinet projects)
- Show "Cut 1, Cut 2" sequence for DIY users
- Toggle: Detailed labels vs minimal (for clean prints)

---

#### 7. **Offcut Management / Reusable Waste**
**What It Solves:** Previous project waste becomes stock for next project

**Features:**
- Save waste pieces from completed layouts
- Add to stock library with dimensions
- Optimizer uses offcuts before suggesting new sheets
- Track which project generated each offcut

**User Benefit:** 
- Reduce total material cost
- Use up shop scrap systematically
- Environmental sustainability angle

**KnippaCab Implementation:**
- "Save Offcuts" button after optimization
- Offcuts stored in project database
- Show offcut utilization percentage when used
- V2: Photo of offcut + barcode/tag for physical tracking

---

#### 8. **Stock Management**
**What It Is:** Inventory of available materials

**Features:**
- Pre-defined stock (4x8 sheets, common lumber sizes)
- Custom stock (leftover pieces, odd sizes)
- Quantity tracking (3x 4x8 sheets available)
- Material cost per sheet
- Stock depletion as projects consume materials

**KnippaCab Approach:**
- Simple: Assume infinite 4x8 sheets (Tier 1)
- Advanced: Stock library with quantities (Tier 2)
- Pro: Cost tracking, stock alerts when low (Tier 3)

---

#### 9. **Trim / Margin**
**What It Is:** Clean edge around sheet perimeter

**Purpose:**
- Remove factory edge defects
- Create clean starting edge
- Account for damaged/unusable perimeter

**Typical Values:**
- None: 0" (use full sheet)
- Standard: 1/4" - 1/2" per edge
- Heavy: 1" per edge (badly damaged stock)

**KnippaCab Default:** 
- 0" (most plywood is factory-square)
- User-configurable in Tier 2

---

### Advanced Features (Tier 2/3 or V2)

#### 10. **Multiple Optimization Levels**
**What It Is:** Trade-off between efficiency and calculation time

**Levels:**
- Quick (1-2 seconds): Good enough for simple projects
- Standard (5-10 seconds): Balanced
- Deep (30+ seconds): Best possible efficiency
- Exhaustive (1-5 minutes): Try many permutations

**When It Matters:**
- Small projects (<20 parts): Quick is fine
- Large projects (100+ parts): Deep makes sense
- Complex grain requirements: Exhaustive

**KnippaCab Approach:**
- Auto-select based on part count
- Manual override in Tier 3
- Show time estimate before calculating

---

#### 11. **Multi-Sheet Optimization**
**Scenario:** Parts don't fit on one sheet

**Features:**
- Automatically plan across multiple sheets
- Minimize total sheets needed
- Label which parts go on which sheet
- Show sheet utilization for each sheet
- Consistent grain direction across sheets

**KnippaCab Challenge:** 
- Most cabinet projects use 1-3 sheets
- Over-engineering this is overkill for V1
- Implement basic version (use sheets until parts fit)

---

#### 12. **Rotatable Parts**
**What It Is:** Allow optimizer to rotate parts 90° for better fit

**Considerations:**
- Only rotate if grain direction allows
- Some parts must maintain orientation (drawer fronts)
- Visual indicator when part is rotated

**KnippaCab Default:**
- Auto-rotate parts where grain doesn't matter
- Respect grain-locked parts automatically

---

#### 13. **Import/Export**
**Import Formats:**
- CSV (part list with dimensions)
- Excel/XLSX
- SketchUp cut lists
- Other CAD tools

**Export Formats:**
- PDF (diagrams + cut list)
- CSV (cut list data)
- DXF (CNC-ready vectors)
- Image (PNG/JPEG)

**KnippaCab Priority:**
- V1: PDF + CSV export
- V2: DXF export for CNC users

---

#### 14. **CNC Integration**
**What CNC Users Need:**

**File Format:**
- DXF or SVG with labeled toolpaths
- Coordinates for each cut
- Part boundaries as closed polygons

**Cutting Constraints:**
- Different kerf than table saw (typically 1/16")
- Can handle complex nesting (parts in waste areas)
- May need tab placement (hold-downs)
- Tool change sequences

**Advanced CNC Features:**
- Optimize for minimal tool changes
- Respect safe zones (clamps, fixtures)
- Generate G-code directly (V2)

**KnippaCab Strategy:**
- V1: DXF export (basic CNC support)
- V2: Advanced CNC optimization mode
  - Tab placement recommendations
  - Nested part priority (cut inner parts first)
  - Shapeoko/X-Carve presets

**Market Opportunity:** 
> "Hobbyist CNC demand is real — Shapeoko, X-Carve, Maslow users need simple DXF export"

---

#### 15. **Interactive Manual Adjustment**
**What It Is:** Drag-and-drop part repositioning

**Use Cases:**
- User prefers different waste placement
- Want larger offcut in specific location
- Optimize for specific cutting sequence

**Implementation:**
- Post-optimization mode: "Adjust Layout"
- Drag parts, optimizer re-fits surrounding parts
- Recalculate utilization percentage
- Lock parts in place option

**KnippaCab Tier:**
- Tier 3 feature (power users only)
- Most users trust the algorithm

---

## User Pain Points & Opportunities

### Pain Point #1: "Optimizer Says 1 Sheet, Reality Says 2"
**Root Cause:** Algorithm doesn't account for:
- Grain direction constraints properly
- Practical cutting sequence
- Saw blade width in all dimensions
- User's actual cutting tools (not everyone has table saw + track saw)

**KnippaCab Solution:**
- Conservative kerf defaults (1/8" not 1/16")
- Clear grain direction visualization
- "Safety margin" option (adds 5% buffer)
- Guillotine mode for realistic table saw cuts

---

### Pain Point #2: "Too Complex For Occasional Use"
**User Quote:**
> "I might make one or two cabinet projects in a year and I'm likely to forget most of what I learned in the 8 to 12 months between projects."

**KnippaCab Solution:**
- Tier 1 requires zero learning (one button press)
- Smart defaults for everything
- In-app tips/tooltips on first use
- Progressive disclosure (only show advanced features when needed)

---

### Pain Point #3: "Great Algorithm, Terrible UI"
**Common Complaints:**
- Confusing start screen
- Unintuitive settings
- Slow load times
- Settings buried in menus
- Too many options presented at once

**KnippaCab Solution:**
- Mobile-first design (touch-optimized)
- Fast startup (<2 seconds)
- Settings only when needed (defaults work for 80%)
- Visual feedback (real-time preview)

---

### Pain Point #4: "Can't Match Grain Across Adjacent Parts"
**Scenario:** Cabinet has two side-by-side panels that should look continuous

**Current Tools:** 
- Either ignore grain entirely
- Or enforce grain but don't optimize for visual continuity

**KnippaCab Opportunity:**
- Mark parts as "grain-matched set"
- Optimizer places them from same area of sheet
- Visual indicator in diagram
- Tier 3 feature (advanced woodworking)

---

### Pain Point #5: "No Good Mobile Apps"
**Market Gap:** 
- Most tools are desktop (Windows-only)
- Web apps work on mobile but clunky
- SmartCut iOS is best, but subscription + limited features

**KnippaCab Advantage:**
- Native mobile from day one
- Works offline
- Touch-optimized interface
- Fast calculation (no web round-trip)

---

### Pain Point #6: "Waste Pieces Too Small To Reuse"
**User Quote:**
> "I might want my waste pieces optimized in a different size."

**Scenario:** 
- Optimizer creates maximum efficiency
- Results in 20 small waste pieces
- User would prefer 2 large offcuts (even if less efficient overall)

**Solution Options:**
- "Target offcut size" setting (e.g., prefer 12"x12" or larger)
- Optimizer penalizes solutions with many tiny scraps
- Post-optimization: Show offcut sizes, let user manually adjust

**KnippaCab Approach:**
- Tier 2: Minimum offcut size setting
- Tier 3: Manual adjustment mode

---

### Pain Point #7: "Can't See Cut Sequence"
**Problem:** 
- Diagram shows final layout
- Doesn't show order of cuts
- User must figure out cutting sequence themselves

**Guillotine Mode Solutions:**
- Number cuts in sequence (1, 2, 3...)
- Separate diagrams per cutting step
- Animated sequence (V2)

**KnippaCab V1:**
- Cut sequence numbers in guillotine mode
- Step-by-step PDF export

---

## Algorithm Considerations

### Bin Packing Algorithms (2D Cutting Stock Problem)

**Common Approaches:**

#### 1. Guillotine Algorithm
- **Pros:** Fast, realistic (matches table saw cuts)
- **Cons:** Less efficient than nested approaches
- **Use:** Default for DIY users

#### 2. Shelf Algorithm
- **Pros:** Good balance of speed and efficiency
- **Cons:** More complex than guillotine
- **Use:** Balanced mode

#### 3. Maximal Rectangles
- **Pros:** Very efficient packing
- **Cons:** Complex cutting sequences
- **Use:** Efficiency mode (CNC-friendly)

#### 4. Genetic/Evolutionary Algorithms
- **Pros:** Can find near-optimal solutions
- **Cons:** Slow (minutes for complex projects)
- **Use:** "Deep optimization" mode

**KnippaCab Strategy:**
- V1: Guillotine algorithm (fast, predictable, DIY-friendly)
- V1.5: Add shelf algorithm for efficiency mode
- V2: Genetic algorithm for pro users

---

### Grain Direction Constraints

**Implementation:**
- Treat grain as rotation lock (0° or 90° only)
- Parts with "vertical grain" must stay portrait
- Parts with "horizontal grain" must stay landscape
- Parts with "no preference" can rotate freely

**Optimization Impact:**
- Reduces solution space significantly
- May require extra sheets vs fully-free rotation
- Worth it for visual quality

---

### Machine Learning (CutList Evolution's Claim)

**What They Likely Do:**
- Train model on millions of cutting layouts
- Learn heuristics for part placement
- Improve over time based on real usage

**Reality Check:**
- 2D bin packing is well-studied (NP-hard problem)
- Traditional algorithms already near-optimal
- ML might get 2-5% better, not 10%
- Marketing claim likely exaggerated

**KnippaCab Approach:**
- Focus on good UX + solid algorithm
- Don't over-promise efficiency gains
- Be transparent: "Uses industry-standard optimization with grain-aware constraints"

---

## Feature Priority for KnippaCab

### V1 Must-Have (Phase 2 - Week 3)
1. ✅ Sheet size input (default 4x8)
2. ✅ Blade kerf setting (default 1/8")
3. ✅ Grain direction per part (auto-assigned from cabinet parts)
4. ✅ Visual cutting diagram (SVG with labels)
5. ✅ Utilization percentage
6. ✅ Waste calculation
7. ✅ PDF export

### V1 Nice-to-Have (Phase 2-3)
8. Multiple sheets when needed
9. Part color coding by cabinet
10. Cut sequence numbers (guillotine mode)
11. Metric unit support

### Tier 2 Features (Phase 4-5)
12. Guillotine vs efficiency mode toggle
13. Custom stock sizes
14. Minimum offcut size setting
15. Edge banding tracking

### Tier 3 Features (Phase 5-7)
16. Offcut management (save & reuse)
17. Stock inventory system
18. Manual layout adjustment
19. Optimization level selector
20. Grain matching for adjacent parts

### V2 Features (Future)
21. DXF export for CNC
22. Advanced CNC mode (nested parts, tab placement)
23. Linear material optimization (boards, trim)
24. Import from SketchUp/CAD
25. Machine learning optimization (if justified)
26. Animated cutting sequence
27. AR overlay on actual plywood sheets

---

## Implementation Recommendations

### Phase 2 (Week 3) - Core Optimizer

**Claude Code Tasks:**

```typescript
// src/utils/sheetOptimizer.ts

interface Part {
  id: string;
  name: string;
  width: number;  // mm
  height: number; // mm
  quantity: number;
  grainDirection: 'horizontal' | 'vertical' | 'any';
  canRotate: boolean; // derived from grain
}

interface Sheet {
  width: number;  // mm (default 2440 for 4x8)
  height: number; // mm (default 1220)
}

interface OptimizationSettings {
  sawKerf: number; // mm (default 3.175 for 1/8")
  mode: 'efficiency' | 'guillotine';
  trimMargin: number; // mm per edge
}

interface PlacedPart {
  part: Part;
  x: number;
  y: number;
  rotated: boolean;
  sheetIndex: number;
}

interface OptimizationResult {
  placements: PlacedPart[];
  sheetsUsed: number;
  utilizationPercentage: number;
  wasteArea: number;
  offcuts: { x: number; y: number; width: number; height: number }[];
}

export function optimizeSheetCutting(
  parts: Part[],
  sheet: Sheet,
  settings: OptimizationSettings
): OptimizationResult {
  // 1. Expand parts by quantity
  // 2. Sort parts (largest first)
  // 3. Apply grain direction constraints
  // 4. Run guillotine or shelf algorithm
  // 5. Calculate utilization
  // 6. Identify waste areas
  // 7. Return results
}
```

**Algorithm Choice:**
- Start with **Guillotine algorithm** (First Fit Decreasing Height)
- Sort parts by height (descending)
- Place parts left-to-right, top-to-bottom
- Respect grain direction (no rotation if locked)
- Account for kerf between all parts

**Resources:**
- Paper: "A Thousand Ways to Pack the Bin" (competitive survey)
- Library: Consider `bin-packing` npm package (adapt for grain constraints)
- Test: Use known layouts to validate accuracy

---

### Diagram Rendering (React Native SVG)

**Component Structure:**
```typescript
// src/components/CuttingDiagram.tsx

<Svg width={canvasWidth} height={canvasHeight}>
  {/* Sheet outline */}
  <Rect width={sheetWidth} height={sheetHeight} stroke="black" fill="white" />
  
  {/* Placed parts */}
  {placements.map(placement => (
    <G key={placement.part.id}>
      {/* Part rectangle */}
      <Rect 
        x={placement.x} 
        y={placement.y}
        width={placement.part.width}
        height={placement.part.height}
        fill={getColorForPart(placement.part)}
        stroke="black"
      />
      
      {/* Part label */}
      <Text 
        x={placement.x + placement.part.width / 2}
        y={placement.y + placement.part.height / 2}
        textAnchor="middle"
      >
        {placement.part.name}
        {'\n'}
        {formatDimension(placement.part.width)} x {formatDimension(placement.part.height)}
      </Text>
      
      {/* Grain direction arrow (if applicable) */}
      {placement.part.grainDirection !== 'any' && (
        <GrainArrow direction={placement.part.grainDirection} x={...} y={...} />
      )}
    </G>
  ))}
  
  {/* Waste areas (shaded) */}
  {offcuts.map((offcut, i) => (
    <Rect key={`waste-${i}`} {...offcut} fill="lightgray" opacity={0.3} />
  ))}
  
  {/* Utilization text */}
  <Text x={10} y={sheetHeight + 30}>
    Utilization: {utilizationPercentage.toFixed(1)}% | Waste: {formatArea(wasteArea)}
  </Text>
</Svg>
```

---

### PDF Export

**Library:** `react-native-pdf` or `jsPDF`

**Export Contents:**
1. **Page 1:** Cutting diagram (full size, labeled)
2. **Page 2:** Cut list table (all parts with dimensions)
3. **Page 3:** Assembly sequence (if multi-cabinet)

**Format:**
- Landscape orientation (better for diagrams)
- Print-ready (black & white, high contrast)
- Checkboxes next to each part (mark as cut)

---

### Edge Banding Integration

**Auto-Detection:**
- Cabinet sides: Band front edge (L1 or L2)
- Shelves: Band front edge (L1 or L2)
- Drawer fronts: Band all 4 edges
- Backs: No banding (hidden)

**Shopping List Addition:**
```typescript
interface EdgeBandingItem {
  material: 'wood-veneer' | 'pvc' | 'melamine';
  thickness: number; // mm
  totalLinearLength: number; // mm
  color: string; // match plywood species
}
```

**Calculation:**
- Sum all banded edges
- Add 10% waste factor
- Round up to nearest roll size (typically 25', 50', 250')

---

## Competitive Differentiation Summary

**How KnippaCab Wins:**

1. **Mobile-Native + Fast**
   - Most competitors are desktop or web-only
   - SmartCut iOS is closest, but subscription-locked
   
2. **Integrated Workflow**
   - Other tools are standalone optimizers
   - KnippaCab generates parts from cabinet design automatically
   
3. **Grain-Aware Defaults**
   - Auto-assign grain based on part purpose
   - Visual grain direction in diagram
   
4. **Multi-Cabinet Color Coding**
   - Color parts by which cabinet they belong to
   - Easier to organize during cutting
   
5. **One-Time Purchase**
   - Competitors mostly subscriptions
   - Target price: $39-49 (vs $108-288/year)
   
6. **DIY-First UX**
   - Guillotine mode for realistic table saw cuts
   - Cut sequence numbers
   - Progressive complexity (hide advanced features)

---

## Open Questions & Future Research

1. **Algorithm Library:** Build from scratch or adapt existing bin-packing library?
2. **CNC Priority:** How many users actually need DXF export in V1?
3. **Offcut Photos:** Worth adding camera integration to tag physical offcuts?
4. **Grain Matching:** Is "grain-matched sets" too niche for Tier 3?
5. **Linear Optimization:** Should V1 include lumber/trim optimization or defer to V2?
6. **Bluetooth Measuring:** Integrate with Bluetooth tape measures for stock input?
7. **3D Waste Visualization:** Show waste pieces in 3D preview mode (V2)?

---

## References & Resources

**Research Sources:**
- FineWoodworking forums (2005-2021 threads)
- Sawmill Creek community discussions
- Reddit r/woodworking cutlist threads
- CutList Evolution feature documentation
- CutList Plus comparison charts
- SmartCut iOS App Store reviews
- Google Play CutList Optimizer reviews

**Academic:**
- "The Cutting Stock Problem: A Survey" (2D bin packing)
- "A Thousand Ways to Pack the Bin" (algorithm comparison)

**Code Libraries:**
- bin-packing (npm) - 2D guillotine algorithm
- packer.js - Simple rectangle packing
- potpack - Fast 2D bin packing

**Related Standards:**
- ISO 11160 (Panel cutting optimization)
- DXF file format specification (for CNC export)

---

## Next Steps

**Immediate (Before Phase 2 Start):**
1. ✅ Complete this research document
2. Prototype guillotine algorithm with test data
3. Validate SVG rendering on mobile (test part count limits)
4. Decide: Build algorithm or adapt library?

**During Phase 2 (Week 3):**
1. Implement core optimizer module
2. Build SVG diagram component
3. Test with real cabinet parts (from Phase 1)
4. Add PDF export
5. Validate utilization percentage accuracy

**Validation Success Criteria:**
- 4-cabinet kitchen project uses 1-2 sheets (expected result)
- Grain direction visually correct in diagram
- Utilization >85% for typical cabinet parts
- PDF export prints clearly on standard paper

---

## Conclusion

The sheet goods optimizer is KnippaCab's **killer feature** that justifies the one-time purchase price. By combining:
- Intelligent grain-aware defaults
- Mobile-native performance
- Visual clarity (color-coded parts, grain arrows)
- Realistic cutting modes (guillotine for DIY)
- Integrated workflow (auto-generated from cabinet design)

...we can deliver a superior experience to the fragmented competition and validate the market opportunity for a $39-49 cabinet design app.

**Philosophy:** "Make the algorithm smart enough that Tier 1 users never think about optimization, but powerful enough that Tier 3 users can tweak every detail."
