/**
 * grainLogic.test.ts
 *
 * Unit tests for grain direction assignment and rotation rules.
 * These rules directly control which parts the sheet optimizer can rotate
 * on the cutting sheet — getting them wrong wastes expensive plywood.
 */

import { assignGrainDirection, canRotatePart } from '../utils/grainLogic';

// ─── assignGrainDirection ─────────────────────────────────────────────────────

describe('assignGrainDirection', () => {
  test('Left Side → vertical', () => {
    expect(assignGrainDirection('Left Side')).toBe('vertical');
  });

  test('Right Side → vertical', () => {
    expect(assignGrainDirection('Right Side')).toBe('vertical');
  });

  test('Drawer Left Side → vertical', () => {
    expect(assignGrainDirection('Drawer Left Side')).toBe('vertical');
  });

  test('Drawer Right Side → vertical', () => {
    expect(assignGrainDirection('Drawer Right Side')).toBe('vertical');
  });

  test('Top Panel → horizontal', () => {
    expect(assignGrainDirection('Top Panel')).toBe('horizontal');
  });

  test('Bottom Panel → horizontal', () => {
    expect(assignGrainDirection('Bottom Panel')).toBe('horizontal');
  });

  test('Shelf → horizontal', () => {
    expect(assignGrainDirection('Shelf')).toBe('horizontal');
  });

  test('Drawer Front → horizontal', () => {
    expect(assignGrainDirection('Drawer Front')).toBe('horizontal');
  });

  test('Drawer Back → horizontal', () => {
    expect(assignGrainDirection('Drawer Back')).toBe('horizontal');
  });

  test('Toe Kick → horizontal', () => {
    expect(assignGrainDirection('Toe Kick')).toBe('horizontal');
  });

  test('Back Panel → either', () => {
    expect(assignGrainDirection('Back Panel')).toBe('either');
  });

  test('Drawer Bottom → either', () => {
    expect(assignGrainDirection('Drawer Bottom')).toBe('either');
  });

  test('Nailer → either', () => {
    expect(assignGrainDirection('Nailer')).toBe('either');
  });

  test('unknown part name falls back to "either"', () => {
    expect(assignGrainDirection('Mystery Part XYZ')).toBe('either');
  });
});

// ─── canRotatePart ────────────────────────────────────────────────────────────

describe('canRotatePart', () => {
  test('"either" parts CAN rotate', () => {
    expect(canRotatePart('either')).toBe(true);
  });

  test('"vertical" parts CANNOT rotate', () => {
    expect(canRotatePart('vertical')).toBe(false);
  });

  test('"horizontal" parts CANNOT rotate', () => {
    expect(canRotatePart('horizontal')).toBe(false);
  });
});

// ─── Integration: part name → rotation decision ───────────────────────────────

describe('grain logic end-to-end', () => {
  test('side panels cannot be rotated on the cutting sheet', () => {
    const grain = assignGrainDirection('Left Side');
    expect(canRotatePart(grain)).toBe(false);
  });

  test('top/bottom panels cannot be rotated on the cutting sheet', () => {
    const grain = assignGrainDirection('Top Panel');
    expect(canRotatePart(grain)).toBe(false);
  });

  test('back panels CAN be rotated by the optimizer', () => {
    const grain = assignGrainDirection('Back Panel');
    expect(canRotatePart(grain)).toBe(true);
  });

  test('drawer bottoms CAN be rotated by the optimizer', () => {
    const grain = assignGrainDirection('Drawer Bottom');
    expect(canRotatePart(grain)).toBe(true);
  });
});
