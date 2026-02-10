/**
 * revealCalculator.test.ts
 *
 * Unit tests for door and drawer face dimension calculations.
 * All expected values are derived from the standard frameless reveals
 * defined in cabinetDefaults.ts: 1.5mm sides, 3mm top, 0mm bottom, 3mm center.
 */

import {
  calculateSingleDoorDims,
  calculateDoubleDoorDims,
  calculateDrawerFaceDims,
  calculateStackedDrawerFaceDims,
  distributeDrawerHeights,
} from '../utils/revealCalculator';

// ─── Single door ──────────────────────────────────────────────────────────────

describe('calculateSingleDoorDims', () => {
  test('914mm cabinet → 911mm door width', () => {
    const result = calculateSingleDoorDims(914, 876);
    // Width: 914 - (1.5 × 2) = 911
    expect(result.width).toBe(911);
  });

  test('914mm × 876mm cabinet → 873mm door height', () => {
    const result = calculateSingleDoorDims(914, 876);
    // Height: 876 - 3mm top - 0mm bottom = 873
    expect(result.height).toBe(873);
  });

  test('door is always narrower than cabinet', () => {
    const result = calculateSingleDoorDims(610, 762);
    expect(result.width).toBeLessThan(610);
    expect(result.height).toBeLessThan(762);
  });

  test('works with 12" (305mm) wall cabinet', () => {
    const result = calculateSingleDoorDims(305, 762);
    expect(result.width).toBe(302);   // 305 - 3
    expect(result.height).toBe(759);  // 762 - 3
  });
});

// ─── Double doors ─────────────────────────────────────────────────────────────

describe('calculateDoubleDoorDims', () => {
  test('914mm cabinet → 454mm per door width', () => {
    const result = calculateDoubleDoorDims(914, 876);
    // totalUsable = 914 - 3 = 911
    // each door = (911 - 3) / 2 = 454
    expect(result.leftWidth).toBe(454);
    expect(result.rightWidth).toBe(454);
  });

  test('both doors are always equal width', () => {
    const result = calculateDoubleDoorDims(762, 762);
    expect(result.leftWidth).toBe(result.rightWidth);
  });

  test('height matches single door height', () => {
    const single = calculateSingleDoorDims(914, 876);
    const double = calculateDoubleDoorDims(914, 876);
    expect(double.height).toBe(single.height);
  });

  test('two double doors total width is less than cabinet width', () => {
    const result = calculateDoubleDoorDims(914, 876);
    const totalDoorWidth = result.leftWidth + result.rightWidth;
    expect(totalDoorWidth).toBeLessThan(914);
  });
});

// ─── Drawer face ──────────────────────────────────────────────────────────────

describe('calculateDrawerFaceDims', () => {
  test('850mm wide opening → 847mm face width', () => {
    const result = calculateDrawerFaceDims(850, 150);
    expect(result.width).toBe(847); // 850 - 3
  });

  test('face height is less than opening height', () => {
    const result = calculateDrawerFaceDims(850, 150);
    expect(result.height).toBeLessThan(150);
  });

  test('150mm opening → 147mm face height', () => {
    const result = calculateDrawerFaceDims(850, 150);
    // 150 - 3mm top reveal - 0mm bottom reveal = 147
    expect(result.height).toBe(147);
  });
});

// ─── Stacked drawer faces ─────────────────────────────────────────────────────

describe('calculateStackedDrawerFaceDims', () => {
  test('returns one face per opening height', () => {
    const faces = calculateStackedDrawerFaceDims(850, [150, 200, 250]);
    expect(faces).toHaveLength(3);
  });

  test('each face is narrower than the opening', () => {
    const faces = calculateStackedDrawerFaceDims(850, [150, 200]);
    expect(faces[0].width).toBe(847);
    expect(faces[1].width).toBe(847);
  });

  test('sum of face heights is less than sum of opening heights', () => {
    const openingHeights = [150, 200, 250];
    const faces = calculateStackedDrawerFaceDims(850, openingHeights);
    const totalFaceHeight = faces.reduce((sum, f) => sum + f.height, 0);
    const totalOpeningHeight = openingHeights.reduce((a, b) => a + b, 0);
    expect(totalFaceHeight).toBeLessThan(totalOpeningHeight);
  });
});

// ─── Height distribution ──────────────────────────────────────────────────────

describe('distributeDrawerHeights', () => {
  test('3 equal drawers in 876mm → ~289mm each', () => {
    const heights = distributeDrawerHeights(876, 3);
    expect(heights).toHaveLength(3);
    // Total reveals: 3 + 0 + (2 × 3) = 9mm → each = (876-9)/3 = 289mm
    expect(heights[0]).toBeCloseTo(289, 0);
  });

  test('all drawers have equal height', () => {
    const heights = distributeDrawerHeights(600, 4);
    expect(heights.every(h => h === heights[0])).toBe(true);
  });

  test('0 drawers returns empty array', () => {
    expect(distributeDrawerHeights(876, 0)).toHaveLength(0);
  });
});
