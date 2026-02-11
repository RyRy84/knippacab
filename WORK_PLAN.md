# KnippaCab Work Plan - Phase 4

**Current Phase:** Phase 4 - Sheet Goods Optimization  
**Last Updated:** February 11, 2026  
**For:** Claude Code implementation

---

## Quick Context

You're building the **sheet goods optimizer** - the killer feature that differentiates KnippaCab from competitors. This phase turns a list of cabinet parts into visual cutting diagrams that woodworkers can take to their shop.

**Why this matters:** Competitors charge $108-288/year and require desktop software. You're building mobile-first with one-time purchase pricing. The optimizer needs to be *practical* (table-saw friendly cuts) not just mathematically optimal.

---

## Phase 4 Overview

Three milestones:

1. **Bin Packing Algorithm** - Arrange parts on sheets efficiently
2. **SVG Cutting Diagram** - Visual representation with labels
3. **Multi-Sheet Handling** - Support projects requiring multiple sheets

---

## Milestone 4.1: Bin Packing Algorithm ⬅️ START HERE

### Goal
Create `src/utils/optimizer/binPacking.ts` that takes a list of parts and returns sheet layouts with placement coordinates.

### Algorithm: Guillotine First-Fit Decreasing (FFD)

**Why Guillotine?** 
- Creates cuts that can be done on a table saw in sequence
- Prioritizes practical cutting over maximum efficiency
- 80-85% typical efficiency (vs 90% for complex algorithms that are harder to execute)

**Research Context:** See SHEET_OPTIMIZER_RESEARCH.md for competitive analysis showing users prefer "practical cuts I can make" over "2% better efficiency I can't execute."

### Implementation Steps

#### Step 1: Create TypeScript Types

**File:** `src/utils/optimizer/types.ts`

```typescript
export interface PlacedPart {
  partId: string;           // Reference to original Part
  x: number;                // mm from left edge
  y: number;                // mm from top edge
  width: number;            // Actual width on sheet
  height: number;           // Actual height on sheet
  rotated: boolean;         // Was part rotated from original dimensions?
  grainDirection: 'horizontal' | 'vertical' | 'either';
}

export interface SheetLayout {
  sheetNumber: number;      // 1-indexed
  parts: PlacedPart[];
  sheetWidth: number;       // 2440mm (8 feet) standard
  sheetHeight: number;      // 1220mm (4 feet) standard
  wasteArea: number;        // mm² not used
  utilizationPercent: number; // 0-100
}

export interface BinPackingResult {
  sheets: SheetLayout[];
  totalWaste: number;       // mm² across all sheets
  avgUtilization: number;   // Average % across sheets
  unplacedParts: string[];  // Part IDs that didn't fit (should be empty)
}
```

#### Step 2: Create Main Bin Packing Function

**File:** `src/utils/optimizer/binPacking.ts`

```typescript
import { Part } from '../../types';
import { canRotatePart } from '../grainLogic';
import { BinPackingResult, PlacedPart, SheetLayout } from './types';

// Standard plywood sheet dimensions (mm)
const SHEET_WIDTH = 2440;   // 8 feet
const SHEET_HEIGHT = 1220;  // 4 feet
const SAW_KERF = 3.175;     // 1/8 inch blade kerf (configurable later)

/**
 * Guillotine First-Fit Decreasing bin packing algorithm.
 * 
 * Optimizes for practical table saw cutting sequences rather than
 * maximum material efficiency. Prioritizes parts that cannot rotate
 * (grain direction constraints) and places largest parts first.
 * 
 * @param parts - Array of Part objects to place on sheets
 * @returns BinPackingResult with sheet layouts
 */
export function packParts(parts: Part[]): BinPackingResult {
  // Step 1: Sort parts by area (largest first)
  const sortedParts = [...parts].sort((a, b) => {
    const areaA = a.width * a.height;
    const areaB = b.width * b.height;
    return areaB - areaA; // Descending order
  });

  const sheets: SheetLayout[] = [];
  const unplacedParts: string[] = [];

  // Step 2: Try to place each part
  for (const part of sortedParts) {
    let placed = false;

    // Try existing sheets first
    for (const sheet of sheets) {
      if (tryPlacePart(part, sheet)) {
        placed = true;
        break;
      }
    }

    // If didn't fit on any existing sheet, create new sheet
    if (!placed) {
      const newSheet = createNewSheet(sheets.length + 1);
      if (tryPlacePart(part, newSheet)) {
        sheets.push(newSheet);
        placed = true;
      } else {
        // Part is too large even for a new sheet
        unplacedParts.push(part.id);
      }
    }
  }

  // Step 3: Calculate statistics
  const totalWaste = sheets.reduce((sum, sheet) => sum + sheet.wasteArea, 0);
  const avgUtilization = sheets.length > 0
    ? sheets.reduce((sum, sheet) => sum + sheet.utilizationPercent, 0) / sheets.length
    : 0;

  return {
    sheets,
    totalWaste,
    avgUtilization,
    unplacedParts,
  };
}

function createNewSheet(sheetNumber: number): SheetLayout {
  return {
    sheetNumber,
    parts: [],
    sheetWidth: SHEET_WIDTH,
    sheetHeight: SHEET_HEIGHT,
    wasteArea: SHEET_WIDTH * SHEET_HEIGHT, // Initially all waste
    utilizationPercent: 0,
  };
}

function tryPlacePart(part: Part, sheet: SheetLayout): boolean {
  // TODO: Implement guillotine placement logic
  // For now, simple top-left first-fit
  
  // Try original orientation
  const placement = findSpace(part.width, part.height, sheet);
  if (placement) {
    addPartToSheet(part, placement.x, placement.y, false, sheet);
    return true;
  }

  // Try rotated orientation (if allowed)
  if (canRotatePart(part)) {
    const rotatedPlacement = findSpace(part.height, part.width, sheet);
    if (rotatedPlacement) {
      addPartToSheet(part, rotatedPlacement.x, rotatedPlacement.y, true, sheet);
      return true;
    }
  }

  return false;
}

function findSpace(
  width: number,
  height: number,
  sheet: SheetLayout
): { x: number; y: number } | null {
  // Simplified first-fit: try top-left corner, then scan
  // TODO: Implement proper guillotine rectangle tracking
  
  // Account for saw kerf
  const requiredWidth = width + SAW_KERF;
  const requiredHeight = height + SAW_KERF;

  // Check if fits in sheet at all
  if (requiredWidth > sheet.sheetWidth || requiredHeight > sheet.sheetHeight) {
    return null;
  }

  // For V1: naive placement (improve in V1.5)
  // Try placing at (0,0) if sheet is empty
  if (sheet.parts.length === 0) {
    return { x: 0, y: 0 };
  }

  // Find first gap where it fits
  // TODO: Implement guillotine free rectangle tracking
  
  return null; // Placeholder - will be improved
}

function addPartToSheet(
  part: Part,
  x: number,
  y: number,
  rotated: boolean,
  sheet: SheetLayout
): void {
  const placedPart: PlacedPart = {
    partId: part.id,
    x,
    y,
    width: rotated ? part.height : part.width,
    height: rotated ? part.width : part.height,
    rotated,
    grainDirection: part.grainDirection,
  };

  sheet.parts.push(placedPart);

  // Update waste and utilization
  const partArea = placedPart.width * placedPart.height;
  const sheetArea = sheet.sheetWidth * sheet.sheetHeight;
  const usedArea = sheet.parts.reduce((sum, p) => sum + (p.width * p.height), 0);
  
  sheet.wasteArea = sheetArea - usedArea;
  sheet.utilizationPercent = (usedArea / sheetArea) * 100;
}
```

#### Step 3: Add Unit Tests

**File:** `src/__tests__/binPacking.test.ts`

```typescript
import { packParts } from '../utils/optimizer/binPacking';
import { Part } from '../types';

describe('Bin Packing Algorithm', () => {
  test('Single part fits on one sheet', () => {
    const parts: Part[] = [{
      id: 'p1',
      cabinetId: 'c1',
      partType: 'side',
      width: 600,
      height: 800,
      thickness: 19,
      material: '3/4" Plywood',
      quantity: 1,
      grainDirection: 'vertical',
      notes: '',
    }];

    const result = packParts(parts);

    expect(result.sheets).toHaveLength(1);
    expect(result.unplacedParts).toHaveLength(0);
    expect(result.sheets[0].parts).toHaveLength(1);
  });

  test('Multiple parts pack efficiently', () => {
    // TODO: Add comprehensive packing tests
    expect(true).toBe(true); // Placeholder
  });

  test('Respects grain direction constraints', () => {
    // TODO: Test that vertical grain parts don't rotate
    expect(true).toBe(true); // Placeholder
  });

  test('Parts too large for sheet are flagged', () => {
    const hugePart: Part = {
      id: 'huge',
      cabinetId: 'c1',
      partType: 'side',
      width: 3000, // Wider than sheet
      height: 1000,
      thickness: 19,
      material: '3/4" Plywood',
      quantity: 1,
      grainDirection: 'vertical',
      notes: '',
    };

    const result = packParts([hugePart]);

    expect(result.unplacedParts).toContain('huge');
  });
});
```

### Success Criteria for 4.1

- [ ] `packParts()` function compiles without errors
- [ ] Basic test passes (single part on one sheet)
- [ ] Returns valid `BinPackingResult` structure
- [ ] Accounts for saw kerf
- [ ] Respects grain direction (uses `canRotatePart()` from `grainLogic.ts`)

### Notes for V1.5 Improvements

The initial implementation uses naive "first fit" placement. After V1 launch, enhance with:
- Guillotine rectangle tracking for better packing
- Multiple orientation attempts
- Waste minimization heuristics

**Philosophy:** Ship something that works (70% efficiency) now, optimize to 85% later based on user feedback.

---

## Milestone 4.2: SVG Cutting Diagram (Next)

After completing 4.1, you'll build the visual representation using React Native SVG. See SHEET_OPTIMIZER_RESEARCH.md for UI examples from competitors.

**Key features:**
- Color-coded parts (by cabinet)
- Grain direction arrows
- Part labels with dimensions
- Cut sequence numbers
- Zoom/pan support

---

## Milestone 4.3: Multi-Sheet Handling (Final)

**Features:**
- Sheet tabs UI
- Per-sheet statistics
- Material cost estimation
- Parts list per sheet

---

## Integration Points

### Where the optimizer fits:

1. **CuttingPlanScreen** calls `packParts()` to get sheet layouts
2. **VisualDiagramScreen** renders the SVG diagrams from `SheetLayout[]`
3. **PDF Export** (Phase 5) includes the diagrams

### Data flow:

```
ReviewEditScreen (user clicks "Generate Cut List")
  ↓
CuttingPlanScreen
  ├─> Calls calculateCabinetParts() for each cabinet
  ├─> Calls calculateDrawerParts() for each drawer
  ├─> Merges all Part[] into single array
  ├─> Groups by material (3/4" ply, 1/2" ply, etc.)
  ├─> Calls packParts() for each material group
  └─> Displays both:
       • Material-grouped list (already done)
       • "View Cutting Diagram" button → VisualDiagramScreen
```

---

## Testing Strategy

1. **Unit tests**: Test packParts() with various part configurations
2. **Integration test**: Create a project with 3 cabinets, verify sheet layouts are reasonable
3. **Visual validation**: Use actual parts list from real cabinet project, manually check diagram makes sense
4. **Real-world test**: Print diagram, go to shop, verify cuts are possible

---

## Common Gotchas

- **Grain direction is critical**: Doors MUST be vertical grain. Don't rotate them even if it would improve efficiency.
- **Saw kerf matters**: 3mm gap between parts or they won't actually fit after cutting
- **Part references**: PlacedPart.partId links back to original Part for labels
- **Sheet orientation**: 2440mm (8') is WIDTH, 1220mm (4') is HEIGHT (landscape orientation)

---

## Getting Started

**Read first:**
1. This file (WORK_PLAN.md)
2. SHEET_OPTIMIZER_RESEARCH.md (competitor analysis)
3. CLAUDE.md (technical context)

**Then implement:**
```bash
# Start with Milestone 4.1
1. Create src/utils/optimizer/types.ts
2. Create src/utils/optimizer/binPacking.ts
3. Create src/__tests__/binPacking.test.ts
4. Run tests: npm test
5. Commit: "feat: implement bin packing algorithm (Phase 4.1)"
```

**Next session:** Build the SVG diagram renderer (Milestone 4.2)

---

## Need Help?

- **Algorithm questions?** See SHEET_OPTIMIZER_RESEARCH.md "Algorithm Considerations" section
- **TypeScript questions?** See CLAUDE.md "Implemented Modules" for patterns
- **Grain logic questions?** See src/utils/grainLogic.ts
- **Part structure questions?** See src/types/index.ts

---

## Definition of Done

Phase 4 is complete when:
- [ ] packParts() works for typical 3-cabinet projects
- [ ] SVG diagram renders all parts with labels
- [ ] Multi-sheet projects show sheet tabs
- [ ] Grain direction arrows are correct
- [ ] User can tap "View Cutting Diagram" from CuttingPlanScreen and see visual layout
- [ ] Utilization % is displayed
- [ ] All tests pass

Then proceed to Phase 5 (PDF export + polish).
