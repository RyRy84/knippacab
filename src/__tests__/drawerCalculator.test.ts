/**
 * drawerCalculator.test.ts
 *
 * Unit tests for drawer box part generation across all construction methods.
 */

import { calculateDrawerParts, calculateDrawerFaceDimensions } from '../utils/drawerCalculator';
import { Drawer } from '../types';
import { THICKNESS_1_2_INCH_MM } from '../constants/cabinetDefaults';

// ─── Helper ───────────────────────────────────────────────────────────────────

function makeDrawer(overrides: Partial<Drawer> = {}): Drawer {
  return {
    id: 'drawer-test',
    cabinetId: 'cab-test',
    width: 850,
    height: 150,
    depth: 560,
    cornerJoinery: 'pocket_hole',
    bottomMethod: 'applied',
    frontMaterial: '3/4" Plywood',
    ...overrides,
  };
}

// ─── Part count ───────────────────────────────────────────────────────────────

describe('calculateDrawerParts — part count', () => {
  test('always returns exactly 5 parts', () => {
    expect(calculateDrawerParts(makeDrawer())).toHaveLength(5);
  });

  test('dado corners + captured bottom still returns 5 parts', () => {
    expect(calculateDrawerParts(
      makeDrawer({ cornerJoinery: 'dado', bottomMethod: 'captured_dado' })
    )).toHaveLength(5);
  });
});

// ─── Part identification ──────────────────────────────────────────────────────

describe('calculateDrawerParts — part names', () => {
  test('generates front, back, left side, right side, and bottom', () => {
    const parts = calculateDrawerParts(makeDrawer());
    expect(parts.find(p => p.name === 'Drawer Front')).toBeDefined();
    expect(parts.find(p => p.name === 'Drawer Back')).toBeDefined();
    expect(parts.find(p => p.name === 'Drawer Left Side')).toBeDefined();
    expect(parts.find(p => p.name === 'Drawer Right Side')).toBeDefined();
    expect(parts.find(p => p.name === 'Drawer Bottom')).toBeDefined();
  });

  test('all parts have drawerId set', () => {
    const parts = calculateDrawerParts(makeDrawer({ id: 'drw-99' }));
    expect(parts.every(p => p.drawerId === 'drw-99')).toBe(true);
  });

  test('all parts have correct cabinetId', () => {
    const parts = calculateDrawerParts(makeDrawer({ cabinetId: 'cab-42' }));
    expect(parts.every(p => p.cabinetId === 'cab-42')).toBe(true);
  });
});

// ─── Dimensions ──────────────────────────────────────────────────────────────

describe('calculateDrawerParts — dimensions', () => {
  test('drawer side width (depth direction) equals drawer depth', () => {
    const parts = calculateDrawerParts(makeDrawer({ depth: 560 }));
    const side = parts.find(p => p.name === 'Drawer Left Side');
    expect(side?.width).toBe(560);
  });

  test('drawer side height equals drawer height', () => {
    const parts = calculateDrawerParts(makeDrawer({ height: 150 }));
    const side = parts.find(p => p.name === 'Drawer Left Side');
    expect(side?.height).toBe(150);
  });

  test('front/back width equals drawer internal width', () => {
    const parts = calculateDrawerParts(makeDrawer({ width: 850 }));
    const front = parts.find(p => p.name === 'Drawer Front');
    expect(front?.width).toBe(850);
  });

  test('drawer side uses 1/2" material', () => {
    const parts = calculateDrawerParts(makeDrawer());
    const side = parts.find(p => p.name === 'Drawer Left Side');
    expect(side?.thickness).toBe(THICKNESS_1_2_INCH_MM);
  });

  test('drawer bottom uses 1/4" plywood', () => {
    const parts = calculateDrawerParts(makeDrawer());
    const bottom = parts.find(p => p.name === 'Drawer Bottom');
    expect(bottom?.material).toBe('1/4" Plywood');
  });
});

// ─── Different heights ────────────────────────────────────────────────────────

describe('calculateDrawerParts — height variation', () => {
  test('taller drawer produces taller side panels', () => {
    const parts100 = calculateDrawerParts(makeDrawer({ height: 100 }));
    const parts200 = calculateDrawerParts(makeDrawer({ height: 200 }));

    const side100 = parts100.find(p => p.name === 'Drawer Left Side');
    const side200 = parts200.find(p => p.name === 'Drawer Left Side');

    expect(side100?.height).toBe(100);
    expect(side200?.height).toBe(200);
  });
});

// ─── Grain directions ─────────────────────────────────────────────────────────

describe('calculateDrawerParts — grain directions', () => {
  test('drawer sides have vertical grain', () => {
    const parts = calculateDrawerParts(makeDrawer());
    const side = parts.find(p => p.name === 'Drawer Left Side');
    expect(side?.grainDirection).toBe('vertical');
  });

  test('drawer front/back have horizontal grain', () => {
    const parts = calculateDrawerParts(makeDrawer());
    const front = parts.find(p => p.name === 'Drawer Front');
    const back  = parts.find(p => p.name === 'Drawer Back');
    expect(front?.grainDirection).toBe('horizontal');
    expect(back?.grainDirection).toBe('horizontal');
  });

  test('drawer bottom has "either" grain', () => {
    const parts = calculateDrawerParts(makeDrawer());
    const bottom = parts.find(p => p.name === 'Drawer Bottom');
    expect(bottom?.grainDirection).toBe('either');
  });
});

// ─── Bottom method notes ─────────────────────────────────────────────────────

describe('calculateDrawerParts — bottom method notes', () => {
  test('captured_dado bottom has groove note on all walls', () => {
    const parts = calculateDrawerParts(makeDrawer({ bottomMethod: 'captured_dado' }));
    const bottom = parts.find(p => p.name === 'Drawer Bottom');
    expect(bottom?.notes.toLowerCase()).toContain('dado');
  });

  test('applied bottom has application note', () => {
    const parts = calculateDrawerParts(makeDrawer({ bottomMethod: 'applied' }));
    const bottom = parts.find(p => p.name === 'Drawer Bottom');
    expect(bottom?.notes.toLowerCase()).toContain('nail');
  });
});

// ─── calculateDrawerFaceDimensions ───────────────────────────────────────────

describe('calculateDrawerFaceDimensions', () => {
  test('face is narrower than opening by 3mm', () => {
    const face = calculateDrawerFaceDimensions(850, 150);
    expect(face.width).toBe(847);
  });

  test('face height is shorter than opening', () => {
    const face = calculateDrawerFaceDimensions(850, 150);
    expect(face.height).toBeLessThan(150);
  });
});
