/**
 * grainLogic.ts — Grain Direction Rules for Cabinet Parts
 *
 * Determines the required grain direction for each cabinet or drawer part.
 * This is used by the sheet goods optimizer (Phase 2) to ensure that
 * grain-locked parts cannot be rotated on the cutting sheet.
 *
 * WHY GRAIN DIRECTION MATTERS:
 * Plywood has a face veneer with visible grain lines running in one direction.
 * For a professional result, the grain must run the correct way on each part:
 *
 *   - A cabinet SIDE PANEL is tall → grain should run vertically (top to bottom).
 *     If the grain ran horizontally on a tall panel, it would look like the
 *     plywood was installed sideways — immediately obvious and unprofessional.
 *
 *   - A cabinet SHELF is horizontal → grain should run left to right.
 *     A shelf with vertical grain would look fine for some species, but
 *     horizontal grain is the convention and matches the visible cabinet top.
 *
 *   - A BACK PANEL is hidden → grain direction doesn't matter visually.
 *     We mark these as "either" so the optimizer can rotate them freely
 *     to minimize waste on the cutting sheet.
 *
 * MATCHING LOGIC:
 * Parts are identified by the NAME assigned by cabinetCalculator.ts and
 * drawerCalculator.ts. We use startsWith() matching so names like
 * "Left Side" and "Right Side" both match the "Side" rule.
 *
 * C# COMPARISON NOTES:
 * - These functions are like C# static utility methods in a helper class,
 *   but exported from a module instead of a class. Usage:
 *     C#:  GrainLogic.AssignGrainDirection("Left Side")
 *     TS:  assignGrainDirection("Left Side")   // imported from module
 *
 * - The pattern-matching approach (checking prefixes) is similar to using
 *   a switch statement with string.StartsWith() in C#.
 */

import { GrainDirection } from '../types';

// =============================================================================
// GRAIN RULES — Part Name → Grain Direction
// =============================================================================

/**
 * Parts that MUST have VERTICAL grain (grain runs top-to-bottom when installed).
 * These are tall, upright panels where horizontal grain would look wrong.
 * Prefix matching — "Left Side" and "Right Side" both match "Side".
 */
const VERTICAL_GRAIN_PREFIXES: readonly string[] = [
  'Left Side',
  'Right Side',
  'Door',             // matches 'Door', 'Door Left', 'Door Right' — always vertical
];

/**
 * Parts that MUST have HORIZONTAL grain (grain runs left-to-right when installed).
 * These are wide, horizontal panels where the grain should flow with the width.
 *
 * DRAWER SIDES: The long dimension of a drawer side is its depth (front-to-back,
 * e.g. 18-20").  That dimension runs horizontally when installed, so the grain
 * must also run horizontally to follow the long axis — just like the front/back.
 * A drawer side with vertical grain would show grain running across the short
 * height (4-6"), which wastes veneer and looks wrong once installed.
 */
const HORIZONTAL_GRAIN_PREFIXES: readonly string[] = [
  'Top Panel',
  'Bottom Panel',
  'Shelf',
  'Drawer Left Side',
  'Drawer Right Side',
  'Drawer Front',
  'Drawer Back',
  'Drawer Face',      // drawer face panels are typically wider than tall → horizontal
  'Toe Kick',
];

/**
 * Parts where grain direction doesn't matter (hidden or non-visual).
 * The optimizer can rotate these freely for maximum cutting efficiency.
 * Listed here for documentation — anything not in the above lists also
 * falls through to "either" via the default return.
 */
const EITHER_GRAIN_PREFIXES: readonly string[] = [
  'Back Panel',
  'Drawer Bottom',
  'Nailer',
];

// =============================================================================
// EXPORTED FUNCTIONS
// =============================================================================

/**
 * Determine the grain direction for a part based on its name.
 *
 * Used by cabinetCalculator.ts and drawerCalculator.ts when generating
 * Part objects. Also used by the sheet goods optimizer to know which
 * parts can be rotated on the cutting sheet.
 *
 * @param partName - The human-readable name assigned to the part
 *                  (e.g., "Left Side", "Top Panel", "Back Panel")
 * @returns The required grain direction: "vertical", "horizontal", or "either"
 *
 * @example
 * assignGrainDirection("Left Side")   // → "vertical"
 * assignGrainDirection("Top Panel")   // → "horizontal"
 * assignGrainDirection("Back Panel")  // → "either"
 * assignGrainDirection("Shelf")       // → "horizontal"
 */
export function assignGrainDirection(partName: string): GrainDirection {
  // Check vertical grain parts first (sides — most important to get right)
  for (const prefix of VERTICAL_GRAIN_PREFIXES) {
    if (partName.startsWith(prefix)) {
      return 'vertical';
    }
  }

  // Check horizontal grain parts
  for (const prefix of HORIZONTAL_GRAIN_PREFIXES) {
    if (partName.startsWith(prefix)) {
      return 'horizontal';
    }
  }

  // Explicit "either" parts (back panels, hidden components)
  // These are checked for documentation but the fallthrough default would
  // also return "either" — we keep this check for clarity.
  for (const prefix of EITHER_GRAIN_PREFIXES) {
    if (partName.startsWith(prefix)) {
      return 'either';
    }
  }

  // Default: unknown parts are treated as "either" so the optimizer
  // is never blocked by a missing grain rule.
  return 'either';
}

/**
 * Determine whether a part can be rotated 90° on the cutting sheet.
 *
 * Parts with a fixed grain direction (vertical or horizontal) CANNOT be
 * rotated — the grain would end up running the wrong way when installed.
 *
 * Parts with "either" grain CAN be rotated freely. The sheet optimizer
 * uses this to fill leftover spaces after placing grain-locked parts.
 *
 * @param grainDirection - The grain direction of the part
 * @returns true if the part may be rotated, false if it must stay as-is
 *
 * @example
 * canRotatePart("either")     // → true   (back panels, toe kicks)
 * canRotatePart("vertical")   // → false  (side panels)
 * canRotatePart("horizontal") // → false  (tops, bottoms, shelves)
 */
export function canRotatePart(grainDirection: GrainDirection): boolean {
  return grainDirection === 'either';
}

/**
 * Get the optimal orientation for display in the cut list UI.
 * Used to show grain direction indicators (arrows) on each part.
 *
 * This is a thin wrapper that makes the intent explicit at the call site —
 * "getOptimalOrientation(part.grainDirection)" reads more clearly than
 * just using the grain direction string directly in the UI.
 *
 * @param grainDirection - The grain direction of the part
 * @returns The same grain direction string for use in display components
 */
export function getOptimalOrientation(
  grainDirection: GrainDirection
): GrainDirection {
  return grainDirection;
}
