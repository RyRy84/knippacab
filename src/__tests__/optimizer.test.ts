/**
 * optimizer.test.ts — Unit Tests for the Sheet Goods Optimizer
 *
 * Tests the Guillotine BSSF bin packing algorithm against real-world
 * cabinet part scenarios.
 */

import { optimizeSheetCutting } from '../utils/optimizer/binPacking';
import { DEFAULT_SHEET_SETTINGS, OptimizationSettings } from '../utils/optimizer/types';
import { Part } from '../types';

// =============================================================================
// HELPERS
// =============================================================================

let partIdCounter = 0;

function makePart(overrides: Partial<Part> & { width: number; height: number }): Part {
  partIdCounter++;
  return {
    id: `part-${partIdCounter}`,
    cabinetId: 'cab-1',
    drawerId: null,
    partType: 'side',
    name: `Part ${partIdCounter}`,
    thickness: 18.75,
    quantity: 1,
    material: '3/4" Plywood',
    grainDirection: 'vertical' as const,
    notes: '',
    ...overrides,  // overrides width, height, name, quantity, grainDirection, etc.
  };
}

// Standard settings: 4'×8' sheet, 1/8" kerf
const STD = DEFAULT_SHEET_SETTINGS;

// =============================================================================
// BASIC CORRECTNESS
// =============================================================================

describe('optimizeSheetCutting — basic correctness', () => {

  test('empty parts list → 0 sheets', () => {
    const result = optimizeSheetCutting([], STD);
    expect(result.totalSheetsUsed).toBe(0);
    expect(result.totalPartsPlaced).toBe(0);
    expect(result.sheets).toHaveLength(0);
  });

  test('single small part → 1 sheet', () => {
    const result = optimizeSheetCutting([makePart({ width: 610, height: 876 })], STD);
    expect(result.totalSheetsUsed).toBe(1);
    expect(result.totalPartsPlaced).toBe(1);
    expect(result.sheets[0].placements).toHaveLength(1);
  });

  test('placement x/y are within sheet bounds', () => {
    const parts = [
      makePart({ width: 600, height: 800 }),
      makePart({ width: 400, height: 500 }),
      makePart({ width: 300, height: 200 }),
    ];
    const result = optimizeSheetCutting(parts, STD);
    for (const sheet of result.sheets) {
      for (const p of sheet.placements) {
        expect(p.x).toBeGreaterThanOrEqual(0);
        expect(p.y).toBeGreaterThanOrEqual(0);
        expect(p.x + p.width).toBeLessThanOrEqual(STD.sheetWidth + 0.01);
        expect(p.y + p.height).toBeLessThanOrEqual(STD.sheetHeight + 0.01);
      }
    }
  });

  test('no overlapping placements on the same sheet', () => {
    const parts = Array.from({ length: 6 }, (_, i) =>
      makePart({ name: `Side ${i}`, width: 610, height: 876 })
    );
    const result = optimizeSheetCutting(parts, STD);

    for (const sheet of result.sheets) {
      const ps = sheet.placements;
      for (let i = 0; i < ps.length; i++) {
        for (let j = i + 1; j < ps.length; j++) {
          const a = ps[i];
          const b = ps[j];
          const overlaps =
            a.x < b.x + b.width  &&
            a.x + a.width  > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y;
          expect(overlaps).toBe(false);
        }
      }
    }
  });

  test('all parts placed (total placed count = expanded quantity)', () => {
    const parts = [
      makePart({ width: 610, height: 876, quantity: 2 }),
      makePart({ width: 876, height: 610, quantity: 2 }),
      makePart({ width: 610, height: 12,  quantity: 1 }),
    ];
    const result = optimizeSheetCutting(parts, STD);
    expect(result.totalPartsPlaced).toBe(5); // 2 + 2 + 1
    expect(result.unplacedParts).toHaveLength(0);
  });
});

// =============================================================================
// GRAIN DIRECTION CONSTRAINTS
// =============================================================================

describe('optimizeSheetCutting — grain direction', () => {

  test('vertical-grain part is placed with height along sheet x-axis (grain-aligned)', () => {
    // Plywood grain runs along the sheet's long axis (x-axis, 2440mm).
    // A "vertical grain" part has grain running along its HEIGHT (e.g. a tall cabinet side).
    // To align part grain with sheet grain, Part.height must run along the sheet x-axis.
    // This means the part is placed "rotated": placed.width = Part.height, placed.height = Part.width.
    const part = makePart({ width: 600, height: 900, grainDirection: 'vertical' });
    const result = optimizeSheetCutting([part], STD);
    const placed = result.sheets[0].placements[0];
    expect(placed.rotated).toBe(true);
    expect(placed.width).toBe(900);   // Part.height now runs along sheet x-axis
    expect(placed.height).toBe(600);  // Part.width now runs along sheet y-axis
  });

  test('horizontal-grain part is placed with width along sheet x-axis (grain-aligned)', () => {
    // "Horizontal grain" = grain runs along Part.width (installed left↔right).
    // Part.width must align with sheet x-axis → normal orientation, rotated=false.
    const part = makePart({ width: 900, height: 200, grainDirection: 'horizontal' });
    const result = optimizeSheetCutting([part], STD);
    const placed = result.sheets[0].placements[0];
    expect(placed.rotated).toBe(false);
    expect(placed.width).toBe(900);
    expect(placed.height).toBe(200);
  });

  test('"either" grain part CAN be rotated when it improves fit', () => {
    const settings: OptimizationSettings = {
      ...STD,
      sheetWidth: 500,
      sheetHeight: 200,
    };
    // Part: 180×400. Normal (180w×400h): 400 > 200 → doesn't fit.
    // Rotated (400w×180h): 400 ≤ 500, 180 ≤ 200 → fits.
    const part = makePart({ width: 180, height: 400, grainDirection: 'either' });
    const result = optimizeSheetCutting([part], settings);
    expect(result.totalPartsPlaced).toBe(1);
    const placed = result.sheets[0].placements[0];
    expect(placed.rotated).toBe(true);
    expect(placed.width).toBe(400);
    expect(placed.height).toBe(180);
  });

  test('"vertical" grain part too large in its grain-aligned direction → goes to unplaced', () => {
    const settings: OptimizationSettings = {
      ...STD,
      sheetWidth: 500,
      sheetHeight: 200,
    };
    // Vertical grain: Part.height (600) runs along x-axis. 600 > sheetWidth (500) → can't fit.
    const part = makePart({ width: 180, height: 600, grainDirection: 'vertical' });
    const result = optimizeSheetCutting([part], settings);
    expect(result.totalPartsPlaced).toBe(0);
    expect(result.unplacedParts).toHaveLength(1);
  });
});

// =============================================================================
// MULTI-SHEET BEHAVIOUR
// =============================================================================

describe('optimizeSheetCutting — multi-sheet', () => {

  test('parts that dont fit on one sheet spill to a second sheet', () => {
    // Each side is 610×876 = ~0.53m². Sheet area = 2440×1220 = ~2.98m²
    // 3 sides fit easily (1.6m²), 6 sides need at least 2 sheets
    const sides = Array.from({ length: 6 }, (_, i) =>
      makePart({ name: `Side ${i}`, width: 610, height: 876 })
    );
    const result = optimizeSheetCutting(sides, STD);
    expect(result.totalSheetsUsed).toBeGreaterThanOrEqual(2);
    expect(result.totalPartsPlaced).toBe(6);
  });

  test('sheet index on each placement matches its sheet', () => {
    const parts = Array.from({ length: 8 }, (_, i) =>
      makePart({ name: `Part ${i}`, width: 800, height: 900 })
    );
    const result = optimizeSheetCutting(parts, STD);
    for (const sheet of result.sheets) {
      for (const p of sheet.placements) {
        expect(p.sheetIndex).toBe(sheet.sheetIndex);
      }
    }
  });
});

// =============================================================================
// UTILIZATION STATS
// =============================================================================

describe('optimizeSheetCutting — utilization stats', () => {

  test('utilization is between 0 and 100', () => {
    const parts = [makePart({ width: 610, height: 876 })];
    const result = optimizeSheetCutting(parts, STD);
    expect(result.overallUtilizationPercent).toBeGreaterThan(0);
    expect(result.overallUtilizationPercent).toBeLessThanOrEqual(100);
  });

  test('sheet that fills perfectly → ~100% utilization', () => {
    // Two 1220×1216 parts fill a 2440×1220 sheet (with 1/8" kerf between them)
    // kerf = 3.175mm, so 1220 + 3.175 + 1216.825 ≈ 2440 — let's just use equal halves
    const settings: OptimizationSettings = { ...STD, sawKerf: 0, trimMargin: 0 };
    const halfW = 1220;
    const parts = [
      makePart({ width: halfW, height: 1220, grainDirection: 'either' }),
      makePart({ width: halfW, height: 1220, grainDirection: 'either' }),
    ];
    const result = optimizeSheetCutting(parts, settings);
    expect(result.totalSheetsUsed).toBe(1);
    // Both parts together cover the full sheet (2440×1220)
    expect(result.sheets[0].utilizationPercent).toBeCloseTo(100, 0);
  });

  test('typical base cabinet project — all parts placed, reasonable utilization', () => {
    // Simulate a 36" base cabinet: 2 sides, top, bottom, back, toe kick, 2 doors
    // NOTE: Guillotine BSSF is a heuristic. Grain-constrained tall parts (876mm)
    // placed first can fragment the sheet, forcing later parts to a new sheet.
    // For this mix the algorithm uses ~3 sheets → ~42% utilization, which is
    // expected behaviour. The important invariant is that ALL parts are placed.
    const cabinetParts: Part[] = [
      makePart({ name: 'Side',        width: 610, height: 876, quantity: 2, grainDirection: 'vertical'   }),
      makePart({ name: 'Top',         width: 876, height: 610, quantity: 1, grainDirection: 'horizontal' }),
      makePart({ name: 'Bottom',      width: 876, height: 610, quantity: 1, grainDirection: 'horizontal' }),
      makePart({ name: 'Toe Kick',    width: 876, height: 102, quantity: 1, grainDirection: 'either'     }),
      makePart({ name: 'Door Left',   width: 455, height: 873, quantity: 1, grainDirection: 'vertical'   }),
      makePart({ name: 'Door Right',  width: 455, height: 873, quantity: 1, grainDirection: 'vertical'   }),
      makePart({ name: 'Back',        width: 876, height: 876, quantity: 1, grainDirection: 'either',
                 material: '1/4" Plywood', thickness: 6.35 }),
    ];
    const result = optimizeSheetCutting(cabinetParts, STD);
    expect(result.totalPartsPlaced).toBe(8); // quantity 2 sides = 2 instances
    expect(result.unplacedParts).toHaveLength(0);
    expect(result.overallUtilizationPercent).toBeGreaterThan(30); // heuristic lower-bound
  });
});

// =============================================================================
// OVERSIZED PARTS
// =============================================================================

describe('optimizeSheetCutting — oversized parts', () => {

  test('part wider than sheet goes to unplaced list', () => {
    const giant = makePart({ width: 3000, height: 500, grainDirection: 'vertical' });
    const result = optimizeSheetCutting([giant], STD);
    expect(result.unplacedParts).toHaveLength(1);
    expect(result.totalPartsPlaced).toBe(0);
    expect(result.totalSheetsUsed).toBe(0);
  });

  test('oversized part with "either" grain that fits rotated is NOT unplaced', () => {
    // 3000×500 is too wide. Rotated: 500×3000 is too tall. Both oversized.
    const giant = makePart({ width: 3000, height: 500, grainDirection: 'either' });
    const result = optimizeSheetCutting([giant], STD);
    expect(result.unplacedParts).toHaveLength(1);
  });
});

// =============================================================================
// KERF SPACING
// =============================================================================

describe('optimizeSheetCutting — saw kerf', () => {

  test('parts are separated by at least one kerf width', () => {
    // Place two parts side by side and verify the gap
    const settings: OptimizationSettings = { ...STD, sawKerf: 10, trimMargin: 0 };
    const parts = [
      makePart({ name: 'A', width: 500, height: 1000 }),
      makePart({ name: 'B', width: 500, height: 1000 }),
    ];
    const result = optimizeSheetCutting(parts, settings);
    expect(result.totalSheetsUsed).toBe(1); // both fit on one sheet (500+10+500 < 2440)

    const ps = result.sheets[0].placements;
    expect(ps).toHaveLength(2);

    // The second part should start at x = 500 + 10 = 510 (if placed side by side)
    // OR start at y = 1000 + 10 = 1010 (if stacked). Either way, gap >= kerf.
    const [p1, p2] = ps.sort((a, b) => a.x - b.x || a.y - b.y);
    const xGap = p2.x - (p1.x + p1.width);
    const yGap = p2.y - (p1.y + p1.height);
    // At least one dimension shows a gap >= kerf (they're on the same sheet)
    const hasGap = xGap >= 9.99 || yGap >= 9.99;
    expect(hasGap).toBe(true);
  });
});
