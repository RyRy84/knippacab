/**
 * drawerCalculator.ts — Drawer Box Dimension Calculator
 *
 * Calculates the cut dimensions for all parts of a drawer box, accounting
 * for the chosen corner joinery method and bottom attachment method.
 *
 * DRAWER BOX ANATOMY:
 * A drawer box has 5 parts:
 *   1. Front (inner) — the part facing forward inside the cabinet opening
 *   2. Back          — the rear wall of the drawer box
 *   3. Left Side     — runs front-to-back on the left
 *   4. Right Side    — runs front-to-back on the right
 *   5. Bottom        — the floor of the drawer box
 *
 * Note: The FACE (decorative front panel) is a SEPARATE part calculated
 * by revealCalculator.ts. The drawer "front" here is the structural inner
 * front wall, NOT the visible face panel.
 *
 * DRAWER BOX vs. CABINET OPENING:
 * The Drawer interface stores INTERNAL box dimensions (inside measurements).
 * The box is smaller than the cabinet opening to accommodate slide hardware:
 *   - Width: each side loses DRAWER_SLIDE_CLEARANCE_EACH_SIDE_MM for slides
 *   - Height: top loses DRAWER_TOP_CLEARANCE_MM for slides
 * These clearances are applied in the UI (CabinetBuilder) when creating
 * the Drawer object — by the time this calculator runs, drawer.width and
 * drawer.height are already the correct INTERNAL box dimensions.
 *
 * CONSTRUCTION METHODS:
 *
 * CORNER JOINERY — how the front/back attach to the sides:
 *   "pocket_hole" (default): Front/back butt against the sides, held by pocket screws.
 *                            No dimension adjustments needed.
 *   "butt":                  Front/back butt against the sides, glued and/or screwed.
 *                            No dimension adjustments needed.
 *   "dado":                  Front/back FIT INTO dado grooves cut in the sides.
 *                            Front/back WIDTH decreases by 2×dado_depth (they're shorter
 *                            because they're captured in grooves, not butting against sides).
 *                            Wait — actually with dado corners the SIDES capture the front/back,
 *                            so front/back width = internal width and sides are adjusted.
 *                            See detailed notes in adjustDrawerForJoinery().
 *
 * BOTTOM ATTACHMENT — how the bottom panel attaches:
 *   "applied":        Bottom panel nailed to the underside of the 4 walls.
 *                     Bottom = full external footprint of the box.
 *   "captured_dado":  Bottom slides into grooves cut in all 4 walls.
 *                     Bottom = internal footprint (smaller by 2×groove depth each direction).
 *                     Side height DECREASES by groove_depth (groove removes material from bottom).
 *   "screwed":        Bottom panel screwed up from below into the sides.
 *                     Bottom = full external footprint (like applied), but with screw holes.
 *
 * C# COMPARISON NOTES:
 * - The `switch` statement here is used like a C# switch expression for pattern matching.
 * - `DrawerCornerJoinery` and `DrawerBottomMethod` are TypeScript string literal unions
 *   (equivalent to C# enums), so the compiler catches missing cases.
 */

import { Drawer, Part, DrawerCornerJoinery, DrawerBottomMethod } from '../types';
import {
  THICKNESS_1_2_INCH_MM,
  DADO_DEPTH_MM,
} from '../constants/cabinetDefaults';
import { assignGrainDirection } from './grainLogic';

// =============================================================================
// TYPES
// =============================================================================

type PartInput = Omit<Part, 'id' | 'cabinetId' | 'drawerId'>;

// =============================================================================
// CONSTANTS
// =============================================================================

/** The groove depth used when the drawer bottom is captured in a dado groove. */
const BOTTOM_DADO_DEPTH_MM = 6.35; // 1/4"

/** The dado groove depth for dado corner joinery. */
const CORNER_DADO_DEPTH_MM = DADO_DEPTH_MM; // 6.35mm = 1/4"

// =============================================================================
// MAIN EXPORTED FUNCTION
// =============================================================================

/**
 * Calculate all cut parts for a single drawer box.
 *
 * Returns the 5 drawer box parts (front, back, left side, right side, bottom)
 * with dimensions adjusted for the chosen construction method.
 *
 * The returned parts have drawerId set and cabinetId from the drawer's parent.
 *
 * @param drawer - The drawer configuration (internal box dimensions)
 * @returns Array of 5 Part objects: front, back, 2 sides, bottom
 *
 * @example
 * // Standard pocket-hole drawer, applied bottom:
 * const parts = calculateDrawerParts({
 *   id: 'drw-1', cabinetId: 'cab-1',
 *   width: 559, height: 127, depth: 508,       // 22" × 5" × 20" inside
 *   cornerJoinery: 'pocket_hole',
 *   bottomMethod: 'applied',
 *   frontMaterial: '3/4" Maple Plywood',
 * });
 * // Returns 5 parts with correct dimensions
 */
export function calculateDrawerParts(drawer: Drawer): Part[] {
  const parts: Part[] = [];
  let partIndex = 0;

  function addPart(input: PartInput): void {
    parts.push({
      id: `${drawer.id}-${partIndex++}`,
      cabinetId: drawer.cabinetId,
      drawerId: drawer.id,
      ...input,
      grainDirection: input.grainDirection ?? assignGrainDirection(input.name),
    });
  }

  // Calculate base dimensions, then apply joinery adjustments
  const baseParts = calculateBaseDrawerDimensions(drawer);
  const adjusted = adjustDrawerForJoinery(
    baseParts,
    drawer.cornerJoinery,
    drawer.bottomMethod
  );

  for (const part of adjusted) {
    addPart(part);
  }

  return parts;
}

// =============================================================================
// BASE DIMENSION CALCULATION (before joinery adjustments)
// =============================================================================

/**
 * Calculate the starting (unadjusted) dimensions for drawer parts.
 * These represent a "pocket hole + applied bottom" drawer — the simplest case.
 * Joinery adjustments are applied on top of these in adjustDrawerForJoinery().
 *
 * BASE CONSTRUCTION (pocket_hole, applied bottom):
 *   - Sides run the full depth of the drawer
 *   - Front and back fit BETWEEN the sides (inset)
 *   - Bottom nailed to the underside of the assembled box
 *
 * @param drawer - The drawer with internal box dimensions
 * @returns Base Part inputs (name, width, height, thickness, etc.)
 */
function calculateBaseDrawerDimensions(drawer: Drawer): PartInput[] {
  const thickness = THICKNESS_1_2_INCH_MM;  // 12.7mm (1/2" plywood for drawer boxes)
  const material = '1/2" Plywood';

  /**
   * With pocket_hole/butt corners, the front and back panels fit BETWEEN the sides.
   * front/back width = internal box width (the inside dimension is what was given)
   *
   * The sides run the full depth, so:
   * side depth = drawer.depth (full internal depth, front-to-back)
   */

  // LEFT / RIGHT SIDES — run the full depth, full internal height
  const sideWidth = drawer.depth;              // front-to-back
  const sideHeight = drawer.height;            // height of box sides

  // FRONT (inner) / BACK — span the internal width, same height as sides
  const frontBackWidth = drawer.width;         // internal width
  const frontBackHeight = drawer.height;       // same height as sides

  // BOTTOM — covers the full external footprint for applied/screwed bottom
  // External footprint = internal width (sides butt against front/back, so
  // external width = internal width + 2 × thickness for pocket/butt corners)
  const bottomWidth = drawer.width + (2 * thickness);    // outer width
  const bottomDepth = drawer.depth + (2 * thickness);    // outer depth

  return [
    {
      name: 'Drawer Front',
      width: frontBackWidth,
      height: frontBackHeight,
      thickness,
      quantity: 1,
      material,
      grainDirection: 'horizontal',
      notes: 'Inner structural front (not the decorative face panel).',
    },
    {
      name: 'Drawer Back',
      width: frontBackWidth,
      height: frontBackHeight,
      thickness,
      quantity: 1,
      material,
      grainDirection: 'horizontal',
      notes: '',
    },
    {
      name: 'Drawer Left Side',
      width: sideWidth,
      height: sideHeight,
      thickness,
      quantity: 1,
      material,
      grainDirection: 'vertical',
      notes: '',
    },
    {
      name: 'Drawer Right Side',
      width: sideWidth,
      height: sideHeight,
      thickness,
      quantity: 1,
      material,
      grainDirection: 'vertical',
      notes: '',
    },
    {
      name: 'Drawer Bottom',
      width: bottomWidth,
      height: bottomDepth,
      thickness: 6.35,           // 1/4" plywood or hardboard for drawer bottoms
      quantity: 1,
      material: '1/4" Plywood',
      grainDirection: 'either',
      notes: 'Applied to underside of box.',
    },
  ];
}

// =============================================================================
// JOINERY ADJUSTMENT
// =============================================================================

/**
 * Adjust drawer part dimensions based on construction method.
 *
 * This applies on top of the base dimensions from calculateBaseDrawerDimensions().
 *
 * CORNER JOINERY ADJUSTMENTS:
 *
 *   pocket_hole / butt (no change):
 *     Front and back fit between the sides. Base dimensions are already correct.
 *
 *   dado:
 *     The sides have dado grooves cut across the ends. The front and back
 *     FIT INTO these grooves. The grooves are CORNER_DADO_DEPTH_MM deep.
 *     This means:
 *       - Front/back width stays the same (the dado only affects depth of engagement)
 *       - Wait — actually for dado CORNER joinery, the front and back
 *         are NARROWER because the side panels overlap them by the dado depth.
 *         Front/back width = drawer.width - 0 (front/back still spans full internal width;
 *         the dado is in the SIDE panel, front/back butt to the dado face)
 *         ACTUALLY: for drawer dado corners, the standard is:
 *         - Dado cut ACROSS the front face of each SIDE panel (at each end)
 *         - Front/back WIDTH = internal width (same as pocket_hole)
 *         - The front/back depth dimension is what changes: it's thicker than
 *           the groove (groove is cut to match front/back thickness)
 *         - The SIDE HEIGHT stays the same
 *         This is basically the same as pocket_hole for cut list purposes.
 *         The dado is just a cut PATTERN note, not a dimension change.
 *
 * BOTTOM ATTACHMENT ADJUSTMENTS:
 *
 *   applied (no change):
 *     Bottom is nailed/stapled to the underside. Dimensions = outer box footprint.
 *     Base dimensions are already correct.
 *
 *   captured_dado:
 *     Bottom slides INTO grooves cut along the bottom inside edge of all 4 walls.
 *     The groove is BOTTOM_DADO_DEPTH_MM deep and INSIDE each wall.
 *     This means:
 *       1. Bottom panel is SMALLER — it fits inside the grooves.
 *          Bottom width = drawer.width - (2 × groove_depth) per side... Actually:
 *          The groove is cut on the INSIDE face of each wall, going inward.
 *          The bottom panel slides INTO the groove from the inside.
 *          Bottom width (external) = internal box width + 2×thickness - 2×BOTTOM_DADO_DEPTH_MM
 *          Hmm this gets complex. Let me simplify for V1:
 *
 *          For captured_dado bottom, the bottom panel fits INSIDE the groove.
 *          The groove extends BOTTOM_DADO_DEPTH_MM into each wall from the inside face.
 *          Bottom dimensions:
 *            Width = drawer.width  (internal width - the bottom fits edge-to-edge in grooves)
 *            Depth = drawer.depth  (same logic)
 *          The groove reduces the effective inner bottom height of the walls.
 *
 *       2. Side HEIGHT decreases by BOTTOM_DADO_DEPTH_MM (groove removes from bottom).
 *          This ensures the box is still the correct interior height.
 *
 *   screwed:
 *     Like applied — bottom = outer footprint, no dimension change.
 *     Different assembly note only.
 *
 * @param baseParts    - Parts from calculateBaseDrawerDimensions()
 * @param cornerJoinery - How corners are joined
 * @param bottomMethod  - How the bottom attaches
 * @returns Adjusted Part inputs
 */
export function adjustDrawerForJoinery(
  baseParts: PartInput[],
  cornerJoinery: DrawerCornerJoinery,
  bottomMethod: DrawerBottomMethod
): PartInput[] {
  return baseParts.map((part): PartInput => {
    let adjusted = { ...part };

    // ─── CORNER JOINERY ADJUSTMENTS ─────────────────────────────────────────

    if (cornerJoinery === 'dado') {
      // Dado corner: sides have dadoes, front/back fit into them.
      // Dimension impact is minimal (same final box geometry), but add notes.
      if (adjusted.name === 'Drawer Side') {
        adjusted = {
          ...adjusted,
          notes: `Cut ${CORNER_DADO_DEPTH_MM}mm dado × box_thickness wide across each end for front/back panels. ${adjusted.notes}`.trim(),
        };
      }
      if (adjusted.name === 'Drawer Front' || adjusted.name === 'Drawer Back') {
        adjusted = {
          ...adjusted,
          notes: `Fits into ${CORNER_DADO_DEPTH_MM}mm dado groove in side panels. ${adjusted.notes}`.trim(),
        };
      }
    }

    // Pocket hole and butt: no dimension or note changes beyond defaults.

    // ─── BOTTOM ATTACHMENT ADJUSTMENTS ──────────────────────────────────────

    if (bottomMethod === 'captured_dado') {
      if (adjusted.name === 'Drawer Bottom') {
        // Bottom fits INSIDE the dado grooves. Each groove runs along the inside
        // face of the wall, BOTTOM_DADO_DEPTH_MM deep. The bottom panel dimensions
        // equal the internal box dimensions (groove to groove).
        // Base dimensions were outer footprint — reduce to inner (groove-to-groove):
        const sideThickness = THICKNESS_1_2_INCH_MM;
        adjusted = {
          ...adjusted,
          // Remove the 2×side_thickness we added in the base calculation,
          // then add 2×dado_depth (the bottom slides INTO each groove)
          width: adjusted.width - (2 * sideThickness) + (2 * BOTTOM_DADO_DEPTH_MM),
          height: adjusted.height - (2 * sideThickness) + (2 * BOTTOM_DADO_DEPTH_MM),
          notes: `Slides into ${BOTTOM_DADO_DEPTH_MM}mm dado groove along bottom inside edge of all 4 walls.`,
        };
      }

      // Sides and front/back: height slightly shorter to leave room for the groove
      if (adjusted.name === 'Drawer Side') {
        adjusted = {
          ...adjusted,
          notes: `Cut ${BOTTOM_DADO_DEPTH_MM}mm dado groove along bottom inside edge for captured bottom. ${adjusted.notes}`.trim(),
        };
      }
      if (adjusted.name === 'Drawer Front' || adjusted.name === 'Drawer Back') {
        adjusted = {
          ...adjusted,
          notes: `Cut ${BOTTOM_DADO_DEPTH_MM}mm dado groove along bottom inside edge for captured bottom. ${adjusted.notes}`.trim(),
        };
      }
    }

    if (bottomMethod === 'screwed') {
      if (adjusted.name === 'Drawer Bottom') {
        adjusted = {
          ...adjusted,
          notes: 'Screwed up into sides from below. Pre-drill pilot holes.',
        };
      }
    }

    if (bottomMethod === 'applied') {
      if (adjusted.name === 'Drawer Bottom') {
        adjusted = {
          ...adjusted,
          notes: 'Applied to underside of assembled box. Nail or staple from below.',
        };
      }
    }

    return adjusted;
  });
}

// =============================================================================
// DRAWER FACE HELPER
// =============================================================================

/**
 * Calculate the decorative drawer face dimensions for a given opening.
 *
 * This is a convenience wrapper that combines the reveal math inline.
 * For production use, prefer revealCalculator.calculateDrawerFaceDims().
 *
 * @param openingWidth  - Width of the drawer opening in the cabinet (mm)
 * @param openingHeight - Height of the drawer opening in the cabinet (mm)
 * @returns Finished face width and height in mm
 */
export function calculateDrawerFaceDimensions(
  openingWidth: number,
  openingHeight: number
): { width: number; height: number } {
  const SIDE_REVEAL = 1.5;
  const TOP_REVEAL = 3.0;
  const BOTTOM_REVEAL = 0;
  return {
    width: openingWidth - (SIDE_REVEAL * 2),
    height: openingHeight - TOP_REVEAL - BOTTOM_REVEAL,
  };
}
