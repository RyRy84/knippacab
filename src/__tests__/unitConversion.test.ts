/**
 * unitConversion.test.ts — Tests for Unit Conversion and Measurement Parsing
 *
 * Covers the new parseImperialInput / parseMeasurementInput functions
 * that power the MeasurementInput component, plus a few sanity checks on
 * the core conversion functions.
 */

import {
  // Core conversions
  mmToInches,
  inchesToMm,
  mmToFractionalInches,
  formatFractionalInches,
  formatForDisplay,
  // New parsers
  parseImperialInput,
  parseMetricInput,
  parseMeasurementInput,
} from '../utils/unitConversion';

// =============================================================================
// parseImperialInput — string → decimal inches
// =============================================================================

describe('parseImperialInput', () => {

  // ── Plain numbers ─────────────────────────────────────────────────────────

  test('plain whole number: "36" → 36', () => {
    expect(parseImperialInput('36')).toBe(36);
  });

  test('plain decimal: "36.5" → 36.5', () => {
    expect(parseImperialInput('36.5')).toBe(36.5);
  });

  test('trailing inch symbol stripped: "36"" → 36', () => {
    expect(parseImperialInput('36"')).toBe(36);
  });

  // ── Fractional inches ─────────────────────────────────────────────────────

  test('fraction only: "1/2" → 0.5', () => {
    expect(parseImperialInput('1/2')).toBeCloseTo(0.5, 5);
  });

  test('fraction only: "3/16" → 0.1875', () => {
    expect(parseImperialInput('3/16')).toBeCloseTo(0.1875, 5);
  });

  test('whole + fraction, space: "36 1/2" → 36.5', () => {
    expect(parseImperialInput('36 1/2')).toBeCloseTo(36.5, 5);
  });

  test('whole + fraction, dash: "36-1/2" → 36.5', () => {
    expect(parseImperialInput('36-1/2')).toBeCloseTo(36.5, 5);
  });

  test('whole + fraction with inch symbol: "36 1/2"" → 36.5', () => {
    expect(parseImperialInput('36 1/2"')).toBeCloseTo(36.5, 5);
  });

  test('whole + sixteenths: "24 3/16" → 24.1875', () => {
    expect(parseImperialInput('24 3/16')).toBeCloseTo(24.1875, 5);
  });

  // ── Feet only ─────────────────────────────────────────────────────────────

  test('feet only: "3\'" → 36', () => {
    expect(parseImperialInput("3'")).toBe(36);
  });

  test('feet only: "4\'" → 48', () => {
    expect(parseImperialInput("4'")).toBe(48);
  });

  // ── Feet + inches ─────────────────────────────────────────────────────────

  test('feet+inches, no separator: "3\'6" → 42', () => {
    expect(parseImperialInput("3'6")).toBe(42);
  });

  test('feet+inches, space: "3\' 6" → 42', () => {
    expect(parseImperialInput("3' 6")).toBe(42);
  });

  test('feet+inches, dash: "3\'-6" → 42', () => {
    expect(parseImperialInput("3'-6")).toBe(42);
  });

  test('feet+inches+symbol: "3\' 6\"" → 42', () => {
    expect(parseImperialInput("3' 6\"")).toBe(42);
  });

  // ── Feet + inches + fraction ───────────────────────────────────────────────

  test('feet+inches+fraction, spaces: "3\' 6 1/2" → 42.5', () => {
    expect(parseImperialInput("3' 6 1/2")).toBeCloseTo(42.5, 5);
  });

  test('feet+inches+fraction, dashes: "3\'-6-1/2" → 42.5', () => {
    expect(parseImperialInput("3'-6-1/2")).toBeCloseTo(42.5, 5);
  });

  test('feet+inches+fraction+symbol: "3\' 6 1/2\"" → 42.5', () => {
    expect(parseImperialInput("3' 6 1/2\"")).toBeCloseTo(42.5, 5);
  });

  test('feet+inches+sixteenths: "2\' 4 3/16" → 28.1875', () => {
    expect(parseImperialInput("2' 4 3/16")).toBeCloseTo(28.1875, 5);
  });

  // ── Edge cases ────────────────────────────────────────────────────────────

  test('empty string → null', () => {
    expect(parseImperialInput('')).toBeNull();
  });

  test('whitespace-only → null', () => {
    expect(parseImperialInput('   ')).toBeNull();
  });

  test('letters → null', () => {
    expect(parseImperialInput('abc')).toBeNull();
  });

  test('zero: "0" → 0', () => {
    expect(parseImperialInput('0')).toBe(0);
  });

  test('zero with symbol: "0"" → 0', () => {
    expect(parseImperialInput('0"')).toBe(0);
  });
});

// =============================================================================
// parseMetricInput — string → mm
// =============================================================================

describe('parseMetricInput', () => {

  test('plain mm: "914" → 914', () => {
    expect(parseMetricInput('914')).toBe(914);
  });

  test('decimal mm: "914.4" → 914.4', () => {
    expect(parseMetricInput('914.4')).toBeCloseTo(914.4, 5);
  });

  test('mm suffix: "914 mm" → 914', () => {
    expect(parseMetricInput('914 mm')).toBe(914);
  });

  test('mm suffix, no space: "914mm" → 914', () => {
    expect(parseMetricInput('914mm')).toBe(914);
  });

  test('MM uppercase suffix: "914 MM" → 914', () => {
    expect(parseMetricInput('914 MM')).toBe(914);
  });

  test('empty string → null', () => {
    expect(parseMetricInput('')).toBeNull();
  });

  test('letters → null', () => {
    expect(parseMetricInput('abc')).toBeNull();
  });
});

// =============================================================================
// parseMeasurementInput — orchestrator
// =============================================================================

describe('parseMeasurementInput', () => {

  test('imperial "36" → 914.4 mm', () => {
    expect(parseMeasurementInput('36', 'imperial')).toBeCloseTo(36 * 25.4, 3);
  });

  test('imperial "36 1/2" → 927.1mm', () => {
    expect(parseMeasurementInput('36 1/2', 'imperial')).toBeCloseTo(36.5 * 25.4, 3);
  });

  test("imperial \"3' 6\"\" → 1066.8 mm", () => {
    expect(parseMeasurementInput("3' 6\"", 'imperial')).toBeCloseTo(42 * 25.4, 3);
  });

  test('metric "914" → 914 mm', () => {
    expect(parseMeasurementInput('914', 'metric')).toBe(914);
  });

  test('metric "610.5 mm" → 610.5 mm', () => {
    expect(parseMeasurementInput('610.5 mm', 'metric')).toBeCloseTo(610.5, 5);
  });

  test('imperial empty → null', () => {
    expect(parseMeasurementInput('', 'imperial')).toBeNull();
  });

  test('metric garbage → null', () => {
    expect(parseMeasurementInput('xyz', 'metric')).toBeNull();
  });
});

// =============================================================================
// Core conversion sanity checks
// =============================================================================

describe('core conversions', () => {

  test('25.4mm = 1 inch', () => {
    expect(mmToInches(25.4)).toBeCloseTo(1, 5);
  });

  test('1 inch = 25.4mm', () => {
    expect(inchesToMm(1)).toBeCloseTo(25.4, 5);
  });

  test('round-trip: 36 inches → mm → back', () => {
    const mm = inchesToMm(36);
    expect(mmToInches(mm)).toBeCloseTo(36, 5);
  });

  test('mmToFractionalInches: 614.3625mm → 24 3/16"', () => {
    const result = mmToFractionalInches(614.3625);
    expect(result.inches).toBe(24);
    expect(result.numerator).toBe(3);
    expect(result.denominator).toBe(16);
  });

  test('formatFractionalInches: 36 whole no fraction → "36""', () => {
    expect(formatFractionalInches({ inches: 36, numerator: 0, denominator: 16 })).toBe('36"');
  });

  test('formatFractionalInches: 36 1/2 → "36 1/2""', () => {
    expect(formatFractionalInches({ inches: 36, numerator: 1, denominator: 2 })).toBe('36 1/2"');
  });

  test('formatForDisplay imperial: 914.4mm → "36""', () => {
    expect(formatForDisplay(914.4, 'imperial')).toBe('36"');
  });

  test('formatForDisplay metric: 914.4mm → "914.4 mm"', () => {
    expect(formatForDisplay(914.4, 'metric')).toBe('914.4 mm');
  });
});
