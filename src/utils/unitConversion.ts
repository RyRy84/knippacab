/**
 * unitConversion.ts — Unit Conversion Utilities for KnippaCab
 *
 * CORE PRINCIPLE: All internal math uses millimeters (mm).
 * We only convert to inches/feet for display when the user picks Imperial.
 * This avoids floating-point drift from repeated conversions.
 *
 * C# COMPARISON NOTES:
 * - TypeScript "export function" ≈ C# "public static method" in a static class.
 *   There's no class wrapping needed — each exported function is directly importable.
 * - TypeScript "interface" ≈ C# "interface" or "record", but with structural typing
 *   (any object with the right shape matches — no explicit "implements" needed).
 * - "readonly" on interface properties ≈ C# "{ get; }" (init-only).
 * - "as const" ≈ C# "const" but works on entire objects, making all values literal types.
 */

// =============================================================================
// CONSTANTS
// =============================================================================

/** Millimeters per inch — the fundamental conversion factor. */
export const MM_PER_INCH: number = 25.4;

/** Inches per foot. */
export const INCHES_PER_FOOT: number = 12;

/**
 * Default saw blade kerf width: 1/8" = 3.175mm.
 * This is the material lost with each cut. User can override in project settings,
 * but this is the standard for most table saw blades.
 */
export const DEFAULT_SAW_KERF_MM: number = 3.175;

/**
 * The denominator for fractional inch display precision.
 * 16 means we round to the nearest 1/16".
 * Woodworkers commonly measure to 1/16" — going finer (1/32", 1/64")
 * is overkill for cabinet work.
 */
export const FRACTION_PRECISION: number = 16;

// =============================================================================
// TYPES
// =============================================================================

/**
 * Represents a measurement broken into feet, whole inches, and a fraction.
 * Example: 2'-6 3/8" would be { feet: 2, inches: 6, numerator: 3, denominator: 8 }
 *
 * C# equivalent would be something like:
 *   public record FeetInches(int Feet, int Inches, int Numerator, int Denominator);
 *
 * "readonly" here means once you create this object, you shouldn't mutate it.
 * TypeScript won't enforce this at runtime (unlike C# records), but it gives
 * compile-time errors if you try to reassign a property.
 */
export interface FeetInches {
  readonly feet: number;
  readonly inches: number;
  readonly numerator: number;    // Top of the fraction (e.g., 3 in 3/16)
  readonly denominator: number;  // Bottom of the fraction (e.g., 16 in 3/16)
}

/**
 * Represents a measurement as whole inches + a fraction.
 * Example: 24 3/16" would be { inches: 24, numerator: 3, denominator: 16 }
 *
 * Use this when you don't need the feet component — most cabinet parts
 * are under 4 feet, so inches-only is often clearer.
 */
export interface FractionalInches {
  readonly inches: number;
  readonly numerator: number;
  readonly denominator: number;
}

/**
 * Which unit system the user has selected for display.
 * "metric" = show mm/cm, "imperial" = show inches/feet.
 *
 * C# comparison: This is a "string literal union type" — similar to a C# enum
 * but more lightweight. TypeScript doesn't have a separate enum keyword needed here;
 * the type itself restricts the allowed values.
 *
 *   C#:    enum UnitSystem { Metric, Imperial }
 *   TS:    type UnitSystem = "metric" | "imperial"
 *
 * The TS version is just a string at runtime, but the compiler enforces
 * that only "metric" or "imperial" can be assigned.
 */
export type UnitSystem = "metric" | "imperial";

// =============================================================================
// BASIC CONVERSIONS — mm <-> decimal inches
// =============================================================================

/**
 * Convert millimeters to decimal inches.
 *
 * Example: mmToInches(25.4) → 1.0
 * Example: mmToInches(610)  → 24.015748...
 *
 * @param mm - The value in millimeters
 * @returns The equivalent value in decimal inches
 */
export function mmToInches(mm: number): number {
  return mm / MM_PER_INCH;
}

/**
 * Convert decimal inches to millimeters.
 *
 * Example: inchesToMm(1)    → 25.4
 * Example: inchesToMm(24)   → 609.6
 *
 * @param inches - The value in decimal inches
 * @returns The equivalent value in millimeters
 */
export function inchesToMm(inches: number): number {
  return inches * MM_PER_INCH;
}

// =============================================================================
// BASIC CONVERSIONS — mm <-> feet
// =============================================================================

/**
 * Convert millimeters to decimal feet.
 *
 * Example: mmToFeet(914.4) → 3.0
 *
 * @param mm - The value in millimeters
 * @returns The equivalent value in decimal feet
 */
export function mmToFeet(mm: number): number {
  return mm / (MM_PER_INCH * INCHES_PER_FOOT);
}

/**
 * Convert decimal feet to millimeters.
 *
 * Example: feetToMm(4) → 1219.2
 *
 * @param feet - The value in decimal feet
 * @returns The equivalent value in millimeters
 */
export function feetToMm(feet: number): number {
  return feet * MM_PER_INCH * INCHES_PER_FOOT;
}

// =============================================================================
// FRACTIONAL INCH HELPERS
// =============================================================================

/**
 * Reduce a fraction to its simplest form using the Greatest Common Divisor.
 * For example: 8/16 → 1/2, 4/16 → 1/4, 6/16 → 3/8.
 *
 * This makes displayed fractions cleaner — woodworkers expect to see
 * "1/2" not "8/16".
 *
 * C# comparison: This is a standalone helper function. In C# you'd probably
 * put this in a MathHelpers static class. In TypeScript, we just export it
 * (or keep it module-private by not exporting — here we export it for testing).
 *
 * @param numerator - Top of the fraction
 * @param denominator - Bottom of the fraction
 * @returns A tuple [reducedNumerator, reducedDenominator]
 */
export function reduceFraction(
  numerator: number,
  denominator: number
): [number, number] {
  // Handle the zero case: 0/16 = 0/1 (or just "no fraction")
  if (numerator === 0) {
    return [0, denominator];
  }

  // Euclidean algorithm to find GCD — same as you'd write in C#.
  // We use Math.abs() because numerator could theoretically be negative.
  let a: number = Math.abs(numerator);
  let b: number = Math.abs(denominator);

  while (b !== 0) {
    const temp: number = b;
    b = a % b;
    a = temp;
  }
  // 'a' is now the GCD

  return [numerator / a, denominator / a];
}

// =============================================================================
// MM → FRACTIONAL INCHES (for display)
// =============================================================================

/**
 * Convert mm to fractional inches (rounded to nearest 1/16").
 *
 * This is the key display function for Imperial mode. Woodworkers think
 * in fractions (e.g., "24 3/16 inches"), not decimals (e.g., "24.1875 inches").
 *
 * HOW IT WORKS:
 * 1. Convert mm → decimal inches (e.g., 614.3625mm → 24.1875")
 * 2. Separate into whole inches (24) and remainder (0.1875)
 * 3. Multiply remainder by 16 to get sixteenths (0.1875 × 16 = 3)
 * 4. Round to nearest sixteenth, then reduce the fraction (3/16 is already reduced)
 * 5. Return { inches: 24, numerator: 3, denominator: 16 }
 *
 * @param mm - The value in millimeters
 * @param precision - Fraction denominator (default 16 for 1/16"). Must be a power of 2.
 * @returns A FractionalInches object
 */
export function mmToFractionalInches(
  mm: number,
  precision: number = FRACTION_PRECISION
): FractionalInches {
  const totalInches: number = mmToInches(mm);

  // Math.sign() gives -1, 0, or 1 — preserves negative values correctly.
  // Math.abs() + Math.floor() gets us the whole inches without the sign interfering.
  const sign: number = Math.sign(totalInches);
  const absInches: number = Math.abs(totalInches);

  // Separate whole inches from the fractional remainder
  const wholeInches: number = Math.floor(absInches);
  const remainder: number = absInches - wholeInches;

  // Convert the remainder to sixteenths (or whatever precision), then round
  // Example: 0.1875 * 16 = 3.0 → rounds to 3 → means 3/16"
  let numerator: number = Math.round(remainder * precision);

  // Edge case: if rounding pushes us to a full unit (e.g., 15.9/16 rounds to 16/16),
  // we need to carry over to the next whole inch.
  let finalWholeInches: number = wholeInches;
  if (numerator >= precision) {
    finalWholeInches += 1;
    numerator -= precision;
  }

  // Reduce the fraction for cleaner display: 8/16 → 1/2, 4/16 → 1/4, etc.
  const [reducedNum, reducedDen] = reduceFraction(numerator, precision);

  return {
    inches: sign * finalWholeInches,
    numerator: reducedNum,
    denominator: reducedDen,
  };
}

/**
 * Convert mm to feet + fractional inches.
 * Used for longer measurements like total cabinet run length.
 *
 * Example: 914.4mm → { feet: 3, inches: 0, numerator: 0, denominator: 16 }
 * Example: 1000mm  → { feet: 3, inches: 3, numerator: 3, denominator: 8 }
 *
 * @param mm - The value in millimeters
 * @param precision - Fraction denominator (default 16)
 * @returns A FeetInches object
 */
export function mmToFeetInches(
  mm: number,
  precision: number = FRACTION_PRECISION
): FeetInches {
  const totalInches: number = Math.abs(mmToInches(mm));
  const sign: number = Math.sign(mm);

  // Pull out the feet first
  const feet: number = Math.floor(totalInches / INCHES_PER_FOOT);
  const remainingInches: number = totalInches - feet * INCHES_PER_FOOT;

  // Now split the remaining inches into whole + fraction, same logic as above
  const wholeInches: number = Math.floor(remainingInches);
  const remainder: number = remainingInches - wholeInches;

  let numerator: number = Math.round(remainder * precision);

  // Handle carry-over: fraction rounds up to a full inch
  let finalWholeInches: number = wholeInches;
  let finalFeet: number = feet;
  if (numerator >= precision) {
    finalWholeInches += 1;
    numerator -= precision;
  }
  // Handle carry-over: inches rounds up to a full foot
  if (finalWholeInches >= INCHES_PER_FOOT) {
    finalFeet += 1;
    finalWholeInches -= INCHES_PER_FOOT;
  }

  const [reducedNum, reducedDen] = reduceFraction(numerator, precision);

  return {
    feet: sign < 0 ? -finalFeet : finalFeet,
    inches: finalWholeInches,
    numerator: reducedNum,
    denominator: reducedDen,
  };
}

// =============================================================================
// FRACTIONAL INCHES → MM (for input parsing)
// =============================================================================

/**
 * Convert fractional inches to mm.
 * Used when the user types in a measurement like "24 3/16".
 *
 * Example: fractionalInchesToMm(24, 3, 16) → 614.3625mm
 * Example: fractionalInchesToMm(0, 1, 2)   → 12.7mm  (that's 1/2")
 *
 * @param wholeInches - The whole inch part (e.g., 24)
 * @param numerator - Fraction top (e.g., 3). Pass 0 for no fraction.
 * @param denominator - Fraction bottom (e.g., 16). Pass 1 if no fraction to avoid divide-by-zero.
 * @returns The equivalent value in millimeters
 */
export function fractionalInchesToMm(
  wholeInches: number,
  numerator: number = 0,
  denominator: number = 1
): number {
  // Guard against division by zero — a denominator of 0 makes no sense.
  // In C# you might throw an ArgumentException; here we default to 1.
  const safeDenominator: number = denominator === 0 ? 1 : denominator;

  const totalInches: number = wholeInches + numerator / safeDenominator;
  return inchesToMm(totalInches);
}

/**
 * Convert feet + inches + fraction to mm.
 * Used when the user types something like 2'-6 3/8".
 *
 * Example: feetInchesToMm(2, 6, 3, 8) → 781.05mm
 *
 * @param feet - Whole feet
 * @param inches - Whole inches (0–11)
 * @param numerator - Fraction top (default 0)
 * @param denominator - Fraction bottom (default 1)
 * @returns The equivalent value in millimeters
 */
export function feetInchesToMm(
  feet: number,
  inches: number = 0,
  numerator: number = 0,
  denominator: number = 1
): number {
  const totalInches: number = feet * INCHES_PER_FOOT + inches;
  return fractionalInchesToMm(totalInches, numerator, denominator);
}

// =============================================================================
// DISPLAY FORMATTING — Convert to human-readable strings
// =============================================================================

/**
 * Format a FractionalInches value as a readable string like "24 3/16"".
 *
 * Handles edge cases:
 * - No fraction: "24""
 * - No whole inches: "3/16""
 * - Zero: "0""
 *
 * @param value - A FractionalInches object (from mmToFractionalInches)
 * @returns A formatted string like '24 3/16"'
 */
export function formatFractionalInches(value: FractionalInches): string {
  const { inches, numerator, denominator } = value;

  // Build the string piece by piece for clarity
  const hasFraction: boolean = numerator !== 0;
  const hasWhole: boolean = inches !== 0;

  if (!hasWhole && !hasFraction) {
    return '0"';
  }

  let result: string = "";

  if (hasWhole) {
    result += `${inches}`;
  }

  if (hasFraction) {
    // Add a space between whole number and fraction if both exist
    if (hasWhole) {
      result += " ";
    }
    result += `${numerator}/${denominator}`;
  }

  // Append the inch symbol
  result += '"';

  return result;
}

/**
 * Format a FeetInches value as a readable string like "2'-6 3/8"".
 *
 * @param value - A FeetInches object (from mmToFeetInches)
 * @returns A formatted string like '2\'-6 3/8"'
 */
export function formatFeetInches(value: FeetInches): string {
  const { feet, inches, numerator, denominator } = value;

  const hasFraction: boolean = numerator !== 0;
  const hasInches: boolean = inches !== 0 || hasFraction;
  const hasFeet: boolean = feet !== 0;

  // Special case: everything is zero
  if (!hasFeet && !hasInches) {
    return '0"';
  }

  let result: string = "";

  if (hasFeet) {
    result += `${feet}'`;
    // Add a separator dash if inches follow (e.g., 2'-6")
    if (hasInches) {
      result += "-";
    }
  }

  if (hasInches) {
    // Reuse our fractional formatter for the inches part
    const inchPart: FractionalInches = { inches, numerator, denominator };
    result += formatFractionalInches(inchPart);
  }

  return result;
}

/**
 * Format mm as a clean metric string.
 * Rounds to 1 decimal place — 0.1mm precision is more than enough for woodworking.
 *
 * Example: formatMm(614.3625) → "614.4 mm"
 *
 * @param mm - The value in millimeters
 * @returns A formatted string like "614.4 mm"
 */
export function formatMm(mm: number): string {
  // toFixed(1) rounds to 1 decimal and returns a string.
  // parseFloat() removes trailing zeros (e.g., "610.0" → 610, but "614.4" stays).
  const rounded: number = parseFloat(mm.toFixed(1));
  return `${rounded} mm`;
}

// =============================================================================
// CONVENIENCE — Format mm in the user's preferred unit system
// =============================================================================

/**
 * Format a mm value for display in whatever unit system the user has selected.
 * This is the main function you'll call from UI components.
 *
 * Example:
 *   formatForDisplay(609.6, "imperial") → '24"'
 *   formatForDisplay(609.6, "metric")   → "609.6 mm"
 *
 * @param mm - The internal value in millimeters
 * @param unitSystem - "metric" or "imperial"
 * @param useFeet - If true and imperial, format as feet+inches (for longer measurements)
 * @returns A human-readable string
 */
export function formatForDisplay(
  mm: number,
  unitSystem: UnitSystem,
  useFeet: boolean = false
): string {
  if (unitSystem === "metric") {
    return formatMm(mm);
  }

  // Imperial path
  if (useFeet) {
    const feetInches: FeetInches = mmToFeetInches(mm);
    return formatFeetInches(feetInches);
  }

  const fractional: FractionalInches = mmToFractionalInches(mm);
  return formatFractionalInches(fractional);
}
