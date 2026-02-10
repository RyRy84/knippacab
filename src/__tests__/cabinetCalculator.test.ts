/**
 * cabinetCalculator.test.ts
 *
 * Unit tests for the core cabinet part generation logic.
 * Tests validate part counts, dimensions, joinery adjustments,
 * and toe kick behaviour across all cabinet types.
 */

import { calculateCabinetParts, calculateToeKickHeight } from '../utils/cabinetCalculator';
import { Cabinet } from '../types';
import {
  THICKNESS_3_4_INCH_MM,
  THICKNESS_1_4_INCH_MM,
  DADO_DEPTH_MM,
  STANDARD_TOE_KICK_HEIGHT_MM,
  DEFAULT_BOX_MATERIAL,
  DEFAULT_BACK_MATERIAL,
} from '../constants/cabinetDefaults';

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeBaseCabinet(overrides: Partial<Cabinet> = {}): Cabinet {
  return {
    id: 'test-cab',
    projectId: 'test-proj',
    type: 'base',
    width: 914,        // 36"
    height: 876,       // 34.5"
    depth: 610,        // 24"
    toeKickOption: 'standard',
    toeKickHeight: STANDARD_TOE_KICK_HEIGHT_MM,
    joineryMethod: 'pocket_hole',
    ...overrides,
  };
}

// ─── Part count ──────────────────────────────────────────────────────────────

describe('calculateCabinetParts — part count', () => {
  test('base cabinet with standard toe kick returns 6 parts', () => {
    const parts = calculateCabinetParts(makeBaseCabinet());
    expect(parts).toHaveLength(6); // left, right, top, bottom, back, toe kick
  });

  test('base cabinet with no toe kick returns 5 parts', () => {
    const parts = calculateCabinetParts(
      makeBaseCabinet({ toeKickOption: 'none', toeKickHeight: 0 })
    );
    expect(parts).toHaveLength(5);
  });

  test('wall cabinet with no toe kick returns 5 parts', () => {
    const parts = calculateCabinetParts(
      makeBaseCabinet({ type: 'wall', toeKickOption: 'none', toeKickHeight: 0 })
    );
    expect(parts).toHaveLength(5);
  });
});

// ─── Side panels ─────────────────────────────────────────────────────────────

describe('calculateCabinetParts — side panels', () => {
  test('generates exactly 2 side panels', () => {
    const parts = calculateCabinetParts(makeBaseCabinet());
    const sides = parts.filter(p => p.name === 'Left Side' || p.name === 'Right Side');
    expect(sides).toHaveLength(2);
  });

  test('side height equals cabinet box height', () => {
    const cabinet = makeBaseCabinet({ height: 876 });
    const parts = calculateCabinetParts(cabinet);
    const leftSide = parts.find(p => p.name === 'Left Side');
    expect(leftSide?.height).toBe(876);
  });

  test('side width (depth direction) equals depth minus back thickness', () => {
    const cabinet = makeBaseCabinet({ depth: 610 });
    const parts = calculateCabinetParts(cabinet);
    const side = parts.find(p => p.name === 'Left Side');
    expect(side?.width).toBeCloseTo(610 - THICKNESS_1_4_INCH_MM, 1);
  });

  test('sides have 3/4" thickness', () => {
    const parts = calculateCabinetParts(makeBaseCabinet());
    const side = parts.find(p => p.name === 'Left Side');
    expect(side?.thickness).toBe(THICKNESS_3_4_INCH_MM);
  });

  test('sides have vertical grain', () => {
    const parts = calculateCabinetParts(makeBaseCabinet());
    const side = parts.find(p => p.name === 'Left Side');
    expect(side?.grainDirection).toBe('vertical');
  });
});

// ─── Top / Bottom panels ──────────────────────────────────────────────────────

describe('calculateCabinetParts — top and bottom panels', () => {
  test('top/bottom width fits between sides (pocket hole)', () => {
    const cabinet = makeBaseCabinet({ width: 914, joineryMethod: 'pocket_hole' });
    const parts = calculateCabinetParts(cabinet);
    const top = parts.find(p => p.name === 'Top Panel');
    const expected = 914 - (2 * THICKNESS_3_4_INCH_MM);
    expect(top?.width).toBeCloseTo(expected, 1);
  });

  test('top/bottom width is WIDER for dado_rabbet joinery', () => {
    const pocketParts = calculateCabinetParts(makeBaseCabinet({ joineryMethod: 'pocket_hole' }));
    const dadoParts   = calculateCabinetParts(makeBaseCabinet({ joineryMethod: 'dado_rabbet' }));

    const pocketTop = pocketParts.find(p => p.name === 'Top Panel');
    const dadoTop   = dadoParts.find(p => p.name === 'Top Panel');

    const expectedDadoWidth = (pocketTop?.width ?? 0) + (2 * DADO_DEPTH_MM);
    expect(dadoTop?.width).toBeCloseTo(expectedDadoWidth, 1);
  });

  test('top/bottom have horizontal grain', () => {
    const parts = calculateCabinetParts(makeBaseCabinet());
    const top = parts.find(p => p.name === 'Top Panel');
    const bottom = parts.find(p => p.name === 'Bottom Panel');
    expect(top?.grainDirection).toBe('horizontal');
    expect(bottom?.grainDirection).toBe('horizontal');
  });
});

// ─── Back panel ───────────────────────────────────────────────────────────────

describe('calculateCabinetParts — back panel', () => {
  test('back panel uses 1/4" material', () => {
    const parts = calculateCabinetParts(makeBaseCabinet());
    const back = parts.find(p => p.name === 'Back Panel');
    expect(back?.thickness).toBe(THICKNESS_1_4_INCH_MM);
    expect(back?.material).toBe(DEFAULT_BACK_MATERIAL);
  });

  test('back panel covers full cabinet width and height', () => {
    const cabinet = makeBaseCabinet({ width: 914, height: 876 });
    const parts = calculateCabinetParts(cabinet);
    const back = parts.find(p => p.name === 'Back Panel');
    expect(back?.width).toBe(914);
    expect(back?.height).toBe(876);
  });
});

// ─── Toe kick ─────────────────────────────────────────────────────────────────

describe('calculateCabinetParts — toe kick', () => {
  test('standard toe kick has correct height (102mm / 4")', () => {
    const parts = calculateCabinetParts(makeBaseCabinet({ toeKickOption: 'standard' }));
    const toeKick = parts.find(p => p.name === 'Toe Kick');
    expect(toeKick?.height).toBe(STANDARD_TOE_KICK_HEIGHT_MM);
  });

  test('custom toe kick uses the specified height', () => {
    const parts = calculateCabinetParts(
      makeBaseCabinet({ toeKickOption: 'custom', toeKickHeight: 150 })
    );
    const toeKick = parts.find(p => p.name === 'Toe Kick');
    expect(toeKick?.height).toBe(150);
  });

  test('no toe kick when option is "none"', () => {
    const parts = calculateCabinetParts(
      makeBaseCabinet({ toeKickOption: 'none', toeKickHeight: 0 })
    );
    const toeKick = parts.find(p => p.name === 'Toe Kick');
    expect(toeKick).toBeUndefined();
  });
});

// ─── Dado joinery notes ───────────────────────────────────────────────────────

describe('calculateCabinetParts — dado_rabbet notes', () => {
  test('side panels get dado cutting note', () => {
    const parts = calculateCabinetParts(makeBaseCabinet({ joineryMethod: 'dado_rabbet' }));
    const side = parts.find(p => p.name === 'Left Side');
    expect(side?.notes.toLowerCase()).toContain('dado');
  });

  test('pocket_hole sides have no dado note', () => {
    const parts = calculateCabinetParts(makeBaseCabinet({ joineryMethod: 'pocket_hole' }));
    const side = parts.find(p => p.name === 'Left Side');
    expect(side?.notes).toBe('');
  });
});

// ─── calculateToeKickHeight ───────────────────────────────────────────────────

describe('calculateToeKickHeight', () => {
  test('"standard" returns 102mm', () => {
    expect(calculateToeKickHeight('standard')).toBe(STANDARD_TOE_KICK_HEIGHT_MM);
  });

  test('"custom" returns the provided value', () => {
    expect(calculateToeKickHeight('custom', 127)).toBe(127);
  });

  test('"custom" without value falls back to standard', () => {
    expect(calculateToeKickHeight('custom')).toBe(STANDARD_TOE_KICK_HEIGHT_MM);
  });

  test('"none" returns 0', () => {
    expect(calculateToeKickHeight('none')).toBe(0);
  });
});
