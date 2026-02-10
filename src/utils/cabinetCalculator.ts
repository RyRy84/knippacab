/**
 * cabinetCalculator.ts — Cabinet Part Dimension Calculator
 *
 * The core calculation engine for Phase 1. Takes a Cabinet configuration
 * and returns an array of Part objects representing every piece that needs
 * to be cut — the raw material for the cut list and sheet optimizer.
 *
 * WHAT THIS MODULE DOES:
 * Given a cabinet's type, dimensions, joinery method, and toe kick setting,
 * this calculator generates every panel needed to build the box:
 *   - Side panels (left and right)
 *   - Top and bottom panels
 *   - Back panel (thinner material)
 *   - Toe kick board (base cabinets only)
 *
 * FRAMELESS BOX CONSTRUCTION:
 * We use the standard "side panels are full height" assembly:
 *   - Left and right sides run the FULL height of the box
 *   - Top and bottom panels fit BETWEEN the sides (inset)
 *   - This means top/bottom width = cabinet width − (2 × side thickness)
 *   - Back panel captures in a rabbet or sits behind everything
 *
 * JOINERY IMPACT ON DIMENSIONS:
 * With pocket_hole or butt_screws (no adjustment):
 *   Top/Bottom width = cabinetWidth − (2 × sideThickness)
 *
 * With dado_rabbet (+dado depth for top/bottom):
 *   The dado is cut INTO each side panel. The top/bottom slides INTO the dado.
 *   Top/Bottom width = cabinetWidth − (2 × sideThickness) + (2 × dadoDepth)
 *   The panel is WIDER because it must extend into the groove on each side.
 *   Side panels get a note to cut the dado groove.
 *
 * C# COMPARISON NOTES:
 * - This module exports a primary function (calculateCabinetParts) that acts
 *   like a C# static method. In OOP terms it's a "service" function —
 *   it takes data, processes it, and returns new data. No class needed.
 *
 * - The `Omit<Part, 'id' | 'cabinetId' | 'drawerId'>` type is like C# with
 *   a subset of an interface. It says: "a Part object but without those 3 fields"
 *   (because we add them ourselves in the addPart helper).
 *
 * - The local `parts` array and `addPart()` helper inside the main function
 *   is equivalent to using a C# List<Part> with a helper method or local lambda.
 */

import { Cabinet, Part, JoineryMethod, ToeKickOption } from '../types';
import {
  THICKNESS_3_4_INCH_MM,
  THICKNESS_1_4_INCH_MM,
  DADO_DEPTH_MM,
  STANDARD_TOE_KICK_HEIGHT_MM,
  DEFAULT_BOX_MATERIAL,
  DEFAULT_BACK_MATERIAL,
} from '../constants/cabinetDefaults';
import { assignGrainDirection } from './grainLogic';

// =============================================================================
// TYPES
// =============================================================================

/**
 * The subset of Part fields that the addPart() helper requires the caller to
 * supply. The `id`, `cabinetId`, and `drawerId` fields are filled in
 * automatically by the helper function.
 *
 * C# equivalent:
 *   A constructor parameter object where some fields are injected automatically.
 */
type PartInput = Omit<Part, 'id' | 'cabinetId' | 'drawerId'>;

// =============================================================================
// MAIN EXPORTED FUNCTION
// =============================================================================

/**
 * Calculate all cut parts for a single cabinet.
 *
 * This is the primary function of Phase 1. It generates every Part that
 * needs to be cut to build the cabinet box described by the `cabinet` argument.
 *
 * Parts are returned in a logical order:
 *   1. Side panels (left, right)
 *   2. Top and bottom panels
 *   3. Back panel
 *   4. Toe kick (base cabinets with toeKickOption !== "none")
 *
 * All dimensions are in millimeters.
 *
 * @param cabinet - The cabinet configuration from the user's input
 * @returns Array of Part objects ready for the cut list and optimizer
 *
 * @example
 * // Standard 24" base cabinet with pocket holes:
 * const parts = calculateCabinetParts({
 *   id: 'cab-1', projectId: 'proj-1',
 *   type: 'base', width: 610, height: 876, depth: 610,
 *   toeKickOption: 'standard', toeKickHeight: 102,
 *   joineryMethod: 'pocket_hole',
 * });
 * // Returns: 2 sides + top + bottom + back + toe kick = 6 parts
 */
export function calculateCabinetParts(cabinet: Cabinet): Part[] {
  const parts: Part[] = [];
  let partIndex = 0;

  /**
   * Helper: add a Part to the list, auto-filling id, cabinetId, drawerId.
   * This keeps the part-creation calls below clean and readable.
   */
  function addPart(input: PartInput): void {
    const name = input.name;
    parts.push({
      id: `${cabinet.id}-${partIndex++}`,
      cabinetId: cabinet.id,
      drawerId: null,
      ...input,
      // Auto-assign grain direction from part name if not explicitly set
      grainDirection: input.grainDirection ?? assignGrainDirection(name),
    });
  }

  // ─── CALCULATE SHARED DIMENSIONS ──────────────────────────────────────────

  const sideThickness = THICKNESS_3_4_INCH_MM;   // 18.75mm (3/4")
  const backThickness = THICKNESS_1_4_INCH_MM;   // 6.35mm (1/4")

  /**
   * The "inner depth" is how deep the side panels and top/bottom panels are.
   * The back panel sits in a rabbet or behind the box — we subtract its
   * thickness so the side panels end at the back face without protruding.
   *
   * For pocket_hole / butt joints: back sits flush against the box back edge.
   * For dado_rabbet: back captured in a 6.35mm rabbet cut into the sides.
   * Either way, the side panel depth calculation is the same in V1.
   */
  const panelDepth = cabinet.depth - backThickness;

  /**
   * For pocket_hole and butt joints: top/bottom fit BETWEEN the sides.
   * Width = cabinet outer width − (2 × side thickness)
   *
   * For dado_rabbet: top/bottom extend INTO the dado on each side.
   * Width += 2 × dado depth (the panel is wider, reaching into each groove)
   */
  const topBottomBaseWidth = cabinet.width - (2 * sideThickness);
  const topBottomWidth = cabinet.joineryMethod === 'dado_rabbet'
    ? topBottomBaseWidth + (2 * DADO_DEPTH_MM)
    : topBottomBaseWidth;

  // Notes for dado joints (added to side panels and top/bottom)
  const dadoSideNote = cabinet.joineryMethod === 'dado_rabbet'
    ? `Cut dado ${DADO_DEPTH_MM}mm deep × ${sideThickness}mm wide for top/bottom panels. Cut ${backThickness}mm rabbet along back edge for back panel.`
    : '';
  const dadoTopBottomNote = cabinet.joineryMethod === 'dado_rabbet'
    ? `Extends ${DADO_DEPTH_MM}mm into dado groove on each side panel.`
    : '';

  // ─── SIDE PANELS ──────────────────────────────────────────────────────────

  addPart({
    name: 'Left Side',
    width: panelDepth,          // depth direction (front to back)
    height: cabinet.height,     // full box height (vertical)
    thickness: sideThickness,
    quantity: 1,
    material: DEFAULT_BOX_MATERIAL,
    grainDirection: 'vertical',
    notes: dadoSideNote,
  });

  addPart({
    name: 'Right Side',
    width: panelDepth,
    height: cabinet.height,
    thickness: sideThickness,
    quantity: 1,
    material: DEFAULT_BOX_MATERIAL,
    grainDirection: 'vertical',
    notes: dadoSideNote,
  });

  // ─── TOP PANEL ────────────────────────────────────────────────────────────

  addPart({
    name: 'Top Panel',
    width: topBottomWidth,      // horizontal span between (or into) sides
    height: panelDepth,         // depth direction
    thickness: sideThickness,
    quantity: 1,
    material: DEFAULT_BOX_MATERIAL,
    grainDirection: 'horizontal',
    notes: dadoTopBottomNote,
  });

  // ─── BOTTOM PANEL ─────────────────────────────────────────────────────────

  addPart({
    name: 'Bottom Panel',
    width: topBottomWidth,
    height: panelDepth,
    thickness: sideThickness,
    quantity: 1,
    material: DEFAULT_BOX_MATERIAL,
    grainDirection: 'horizontal',
    notes: dadoTopBottomNote,
  });

  // ─── BACK PANEL ───────────────────────────────────────────────────────────

  /**
   * The back panel covers the full outer width and full box height.
   * With pocket_hole / butt joints: nailed/stapled flush to the back edge.
   * With dado_rabbet: captured in a rabbet cut along the back edge of the sides
   *   (and optionally the top/bottom). We use the same full-size dimension
   *   either way — the rabbet depth just means it recesses into the frame.
   */
  addPart({
    name: 'Back Panel',
    width: cabinet.width,
    height: cabinet.height,
    thickness: backThickness,
    quantity: 1,
    material: DEFAULT_BACK_MATERIAL,
    grainDirection: 'vertical',   // preferred, but can rotate if optimizer needs
    notes: cabinet.joineryMethod === 'dado_rabbet'
      ? `Slides into ${backThickness}mm rabbet cut along back edges of sides.`
      : 'Flush with back edge of sides, top, and bottom.',
  });

  // ─── TOE KICK ─────────────────────────────────────────────────────────────

  /**
   * The toe kick board is a horizontal panel at the base of the cabinet front.
   * It creates the recessed space at floor level so you can stand close.
   *
   * Toe kick fits BETWEEN the side panels (same rule as top/bottom):
   *   Width = cabinet width − (2 × side thickness)
   *
   * Only added for base cabinets with toeKickOption !== 'none'.
   * (Wall and tall cabinets typically don't have toe kicks.)
   *
   * NOTE: With dado_rabbet joinery, the toe kick does NOT get the dado
   * adjustment — it's a structural kickplate, not captured in a groove.
   */
  const toeKickHeight = calculateToeKickHeight(
    cabinet.toeKickOption,
    cabinet.toeKickHeight
  );

  if (toeKickHeight > 0) {
    addPart({
      name: 'Toe Kick',
      width: cabinet.width - (2 * sideThickness),   // between the sides
      height: toeKickHeight,
      thickness: sideThickness,
      quantity: 1,
      material: DEFAULT_BOX_MATERIAL,
      grainDirection: 'either',
      notes: 'Horizontal kickplate at base of cabinet front.',
    });
  }

  return parts;
}

// =============================================================================
// JOINERY ADJUSTMENT
// =============================================================================

/**
 * Adjust a single part's dimensions and notes for the given joinery method.
 *
 * This function is exposed for use by the UI preview panel and tests —
 * it applies the same logic used internally by calculateCabinetParts(),
 * but to a single part so you can preview the effect of changing joinery.
 *
 * Currently handles dado_rabbet adjustments for top/bottom panels.
 * Pocket_hole, butt_screws, and dowel require no dimension changes.
 *
 * @param part    - The Part to adjust (not mutated — returns a new Part)
 * @param joinery - The joinery method to apply
 * @returns A new Part with adjusted dimensions and notes
 */
export function adjustForJoinery(part: Part, joinery: JoineryMethod): Part {
  if (joinery !== 'dado_rabbet') {
    // No dimension changes for pocket_hole, butt_screws, or dowel
    return part;
  }

  // Dado/rabbet: widen top and bottom panels to extend into the dado grooves
  if (part.name === 'Top Panel' || part.name === 'Bottom Panel') {
    const adjustment = 2 * DADO_DEPTH_MM;
    return {
      ...part,
      width: part.width + adjustment,
      notes: `Extends ${DADO_DEPTH_MM}mm into dado groove on each side panel. ${part.notes}`.trim(),
    };
  }

  // Side panels: add note about required dado cuts (no dimension change needed)
  if (part.name === 'Left Side' || part.name === 'Right Side') {
    const dadoNote = `Cut dado ${DADO_DEPTH_MM}mm deep × ${THICKNESS_3_4_INCH_MM}mm wide for top/bottom panels.`;
    return {
      ...part,
      notes: part.notes ? `${part.notes} ${dadoNote}` : dadoNote,
    };
  }

  return part;
}

// =============================================================================
// TOE KICK HEIGHT CALCULATOR
// =============================================================================

/**
 * Resolve the actual toe kick height in mm based on the option and custom value.
 *
 * The three options from the Cabinet interface:
 *   "standard" → always returns STANDARD_TOE_KICK_HEIGHT_MM (102mm / 4")
 *   "custom"   → returns the customHeight argument (user-specified in mm)
 *   "none"     → returns 0 (no toe kick, no part generated)
 *
 * @param option       - The toe kick option from Cabinet.toeKickOption
 * @param customHeight - The custom height in mm (only used when option === "custom")
 * @returns Toe kick height in mm, or 0 if no toe kick
 *
 * @example
 * calculateToeKickHeight("standard")         // → 102
 * calculateToeKickHeight("custom", 127)      // → 127  (5" custom)
 * calculateToeKickHeight("none")             // → 0
 */
export function calculateToeKickHeight(
  option: ToeKickOption,
  customHeight?: number
): number {
  switch (option) {
    case 'standard':
      return STANDARD_TOE_KICK_HEIGHT_MM;
    case 'custom':
      return customHeight ?? STANDARD_TOE_KICK_HEIGHT_MM; // fallback to standard if not set
    case 'none':
      return 0;
  }
}

// =============================================================================
// DOOR DIMENSION SHORTCUT
// =============================================================================

/**
 * Calculate door dimensions directly from cabinet dimensions.
 * Convenience wrapper around revealCalculator functions, exposed here
 * so callers only need to import from cabinetCalculator.
 *
 * @param cabinetWidth  - Cabinet outer width in mm
 * @param cabinetHeight - Cabinet box height in mm
 * @param doubleDoor    - true = double doors, false/omitted = single door
 * @returns Door dimension(s) in mm
 */
export function calculateDoorDimensions(
  cabinetWidth: number,
  cabinetHeight: number,
  doubleDoor = false
): { width: number; height: number } | { leftWidth: number; rightWidth: number; height: number } {
  // Inline the reveal math here to avoid a circular import
  // (revealCalculator imports from cabinetDefaults, cabinetCalculator imports from both)
  const SIDE_REVEAL = 1.5;   // mm
  const TOP_REVEAL = 3.0;    // mm
  const BOTTOM_REVEAL = 0;   // mm
  const CENTER_GAP = 3.0;    // mm (between double doors)

  const height = cabinetHeight - TOP_REVEAL - BOTTOM_REVEAL;

  if (doubleDoor) {
    const totalUsable = cabinetWidth - (SIDE_REVEAL * 2);
    const eachWidth = (totalUsable - CENTER_GAP) / 2;
    return { leftWidth: eachWidth, rightWidth: eachWidth, height };
  }

  return {
    width: cabinetWidth - (SIDE_REVEAL * 2),
    height,
  };
}
