/**
 * revealCalculator.ts — Door and Drawer Face Dimension Calculator
 *
 * Calculates the FINISHED dimensions of doors and drawer faces for
 * frameless (European-style) cabinets using standard reveal gaps.
 *
 * WHAT ARE REVEALS?
 * "Reveals" are the small visible gaps between the door/drawer face and the
 * cabinet box. In frameless construction, these are very small (1.5–3mm).
 * They're one of the trickiest parts of cabinet building to get right manually —
 * KnippaCab automates them entirely so users never need to think about this.
 *
 * THE MATH:
 * The door/face is always SMALLER than the cabinet opening by the sum of all
 * reveals on that side. For example, a single door in a 914mm wide cabinet:
 *
 *   Door width = 914mm − (1.5mm left reveal + 1.5mm right reveal)
 *              = 914mm − 3mm
 *              = 911mm
 *
 * STANDARD FRAMELESS REVEALS (from CLAUDE.md):
 *   Side reveals:    1.5mm each side (3mm total horizontal)
 *   Top reveal:      3mm
 *   Bottom reveal:   0mm (base cabs — door flush with box bottom)
 *   Between doors:   3mm center gap (1.5mm per door edge)
 *
 * WHY 1.5mm AND 3mm (NOT ROUNDER NUMBERS)?
 * These are the European 32mm system standards for frameless (full-overlay) cabinets.
 * The small reveals allow ±2mm of adjustment via hinge adjustment screws, which
 * is enough to align doors perfectly even if the box isn't perfectly square.
 *
 * C# COMPARISON NOTES:
 * - These are pure functions — no instance state, no side effects.
 *   C# equivalent: static methods in a static utility class.
 * - Return types use anonymous objects: { width, height }
 *   C# equivalent: return a ValueTuple (width, height) or a small record type.
 * - All inputs and outputs are in mm. The caller handles unit display.
 */

import {
  REVEAL_SIDE_MM,
  REVEAL_TOP_MM,
  REVEAL_BOTTOM_MM,
  REVEAL_BETWEEN_DOORS_MM,
} from '../constants/cabinetDefaults';

// =============================================================================
// DOOR CALCULATORS
// =============================================================================

/**
 * Calculate dimensions for a SINGLE DOOR covering the full cabinet opening.
 *
 * Used when the user selects "1 door" for the cabinet. The door covers the
 * full opening width minus the side reveals on each side.
 *
 * Formula:
 *   width  = cabinetWidth  − (2 × REVEAL_SIDE_MM)     // 3mm total horizontal
 *   height = cabinetHeight − REVEAL_TOP_MM − REVEAL_BOTTOM_MM
 *
 * @param cabinetWidth  - Outer width of the cabinet box in mm
 * @param cabinetHeight - Height of the cabinet opening (box height) in mm
 * @returns The finished door width and height in mm
 *
 * @example
 * calculateSingleDoorDims(914, 876)
 * // → { width: 911, height: 873 }
 * // Door is 911mm wide (914 − 3mm reveals) × 873mm tall (876 − 3mm top reveal)
 */
export function calculateSingleDoorDims(
  cabinetWidth: number,
  cabinetHeight: number
): { width: number; height: number } {
  const width = cabinetWidth - (REVEAL_SIDE_MM * 2);
  const height = cabinetHeight - REVEAL_TOP_MM - REVEAL_BOTTOM_MM;
  return { width, height };
}

/**
 * Calculate dimensions for a PAIR OF DOORS covering the full cabinet opening.
 *
 * Used when the user selects "2 doors" for the cabinet. The opening is shared
 * between two doors with a center gap between them.
 *
 * The total usable width is split evenly, then each door loses half the
 * center gap on its inner edge:
 *
 *   totalDoorWidth   = cabinetWidth − (2 × REVEAL_SIDE_MM)
 *   eachDoorWidth    = (totalDoorWidth − REVEAL_BETWEEN_DOORS_MM) / 2
 *                    = (cabinetWidth − 3mm − 3mm) / 2
 *                    = (cabinetWidth − 6mm) / 2
 *
 * Both doors are identical width (symmetric).
 *
 * @param cabinetWidth  - Outer width of the cabinet box in mm
 * @param cabinetHeight - Height of the cabinet opening in mm
 * @returns Left and right door widths (always equal) and height in mm
 *
 * @example
 * calculateDoubleDoorDims(914, 762)
 * // Total usable = 914 − 3 = 911mm
 * // Each door = (911 − 3) / 2 = 454mm
 * // → { leftWidth: 454, rightWidth: 454, height: 759 }
 */
export function calculateDoubleDoorDims(
  cabinetWidth: number,
  cabinetHeight: number
): { leftWidth: number; rightWidth: number; height: number } {
  const totalUsableWidth = cabinetWidth - (REVEAL_SIDE_MM * 2);
  const eachDoorWidth = (totalUsableWidth - REVEAL_BETWEEN_DOORS_MM) / 2;
  const height = cabinetHeight - REVEAL_TOP_MM - REVEAL_BOTTOM_MM;
  return {
    leftWidth: eachDoorWidth,
    rightWidth: eachDoorWidth,
    height,
  };
}

// =============================================================================
// DRAWER FACE CALCULATORS
// =============================================================================

/**
 * Calculate dimensions for a SINGLE DRAWER FACE (front panel).
 *
 * The drawer face is slightly smaller than its opening in the cabinet.
 * This function calculates ONE face for a given opening height.
 *
 * For multiple stacked drawers, use calculateStackedDrawerFaceDims() instead.
 *
 * @param openingWidth  - Width of this drawer's opening in the cabinet (mm)
 * @param openingHeight - Height of this drawer's opening in the cabinet (mm)
 * @returns The finished drawer face width and height in mm
 *
 * @example
 * calculateDrawerFaceDims(914, 200)
 * // → { width: 911, height: 197 }
 * // Face is 911mm wide × 197mm tall (200 − 3mm top reveal, 0mm bottom)
 */
export function calculateDrawerFaceDims(
  openingWidth: number,
  openingHeight: number
): { width: number; height: number } {
  const width = openingWidth - (REVEAL_SIDE_MM * 2);
  const height = openingHeight - REVEAL_TOP_MM - REVEAL_BOTTOM_MM;
  return { width, height };
}

/**
 * Calculate dimensions for MULTIPLE STACKED DRAWER FACES in one cabinet.
 *
 * Takes an array of drawer opening heights (one per drawer, from top to bottom)
 * and returns the finished face dimensions for each. Openings already account
 * for the gaps between drawers — the caller (cabinetCalculator) is responsible
 * for distributing the opening heights correctly.
 *
 * @param openingWidth   - Width of the cabinet opening in mm (same for all drawers)
 * @param openingHeights - Array of opening heights, one per drawer (top to bottom)
 * @returns Array of { width, height } for each drawer face, in the same order
 *
 * @example
 * // Cabinet with 3 equal drawers, 876mm tall, 914mm wide:
 * // Gap deduction: 3mm top + 0mm bottom + 2×3mm between = 9mm total
 * // Each opening = (876 - 9) / 3 = 289mm
 * calculateStackedDrawerFaceDims(914, [289, 289, 289])
 * // → [
 * //     { width: 911, height: 286 },
 * //     { width: 911, height: 286 },
 * //     { width: 911, height: 286 },
 * //   ]
 */
export function calculateStackedDrawerFaceDims(
  openingWidth: number,
  openingHeights: number[]
): Array<{ width: number; height: number }> {
  return openingHeights.map((openingHeight) =>
    calculateDrawerFaceDims(openingWidth, openingHeight)
  );
}

// =============================================================================
// OPENING HEIGHT DISTRIBUTION
// =============================================================================

/**
 * Distribute available height across N equal drawers.
 *
 * Calculates the opening height for each drawer when the user wants N equal
 * drawers. Accounts for the reveals between drawers (3mm gap between each pair).
 *
 * This is the "auto-suggest equal division" used in the Drawer Builder screen.
 * Users can override individual heights after seeing the suggestion.
 *
 * Formula:
 *   Total reveal deducted = REVEAL_TOP_MM
 *                         + REVEAL_BOTTOM_MM
 *                         + (drawerCount − 1) × REVEAL_BETWEEN_DRAWERS_MM
 *   Each opening height   = (availableHeight − totalRevealDeducted) / drawerCount
 *
 * @param availableHeight - The cabinet box height available for drawers in mm
 * @param drawerCount     - Number of equal-height drawers to fill the space
 * @returns Array of equal opening heights (length = drawerCount), in mm
 *
 * @example
 * distributeDrawerHeights(876, 3)
 * // Total reveals = 3 + 0 + (2 × 3) = 9mm
 * // Each opening = (876 - 9) / 3 = 289mm
 * // → [289, 289, 289]
 */
export function distributeDrawerHeights(
  availableHeight: number,
  drawerCount: number
): number[] {
  if (drawerCount <= 0) return [];

  const totalRevealDeducted =
    REVEAL_TOP_MM +
    REVEAL_BOTTOM_MM +
    (drawerCount - 1) * 3.0; // REVEAL_BETWEEN_DRAWERS_MM

  const eachOpeningHeight = (availableHeight - totalRevealDeducted) / drawerCount;

  return Array(drawerCount).fill(Math.round(eachOpeningHeight * 10) / 10);
}
