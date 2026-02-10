/**
 * cabinetDefaults.ts — Standard Cabinet Dimensions and Defaults
 *
 * All dimensions are in millimeters (mm). Imperial equivalents are shown
 * in comments. These constants define the "smart defaults" used in Tier 1
 * mode — when a user picks "Base Cabinet / 24 inches", everything else
 * is filled in from these values automatically.
 *
 * WHY MILLIMETERS EVERYWHERE?
 * All internal math uses mm. This eliminates the error-prone dance of
 * converting between inches, feet, and fractions during calculations.
 * Conversions happen ONLY at the display layer (src/utils/unitConversion.ts).
 *
 * C# COMPARISON NOTES:
 * - TypeScript doesn't have a `const` class or static class — instead, we
 *   export individual named constants (like C# `public static readonly` fields,
 *   but at module scope instead of inside a class).
 * - `as const` on arrays creates a readonly tuple, similar to C# readonly arrays.
 */

// =============================================================================
// MATERIAL THICKNESSES
// =============================================================================

/**
 * Cabinet box side panels, top, bottom, and shelves: 3/4" plywood.
 * Note: "3/4 inch" plywood in North America actually measures ~18.75mm —
 * not exactly 19.05mm (the true 3/4"). We use 18.75mm to match the
 * industry convention used in most cabinet books and CNC programs.
 */
export const THICKNESS_3_4_INCH_MM = 18.75;

/**
 * Drawer boxes and sometimes cabinet backs (heavier duty): 1/2" plywood.
 * True 1/2" = 12.7mm. Actual sheets often measure 12mm, but we use the
 * nominal value for cut list accuracy — adjust in Pro Mode if needed.
 */
export const THICKNESS_1_2_INCH_MM = 12.7;

/**
 * Cabinet back panels: 1/4" plywood or hardboard.
 * True 1/4" = 6.35mm. Thin backs save weight and material cost; they're
 * hidden from view and don't carry structural load in frameless cabinets.
 */
export const THICKNESS_1_4_INCH_MM = 6.35;

// =============================================================================
// BASE CABINET DEFAULTS
// =============================================================================

/**
 * Standard base cabinet box height: 34.5" (876mm).
 * This is the HEIGHT OF THE BOX, not the total installed height.
 *
 * Installed height = box height + countertop thickness (typically +38mm/1.5")
 *   → 876 + 38 = 914mm total ≈ 36" — the universal U.S. countertop height.
 *
 * The TOE KICK (102mm) is a separate component that goes UNDER the box.
 * It is NOT included in this height value. See Cabinet.toeKickHeight.
 */
export const BASE_CABINET_HEIGHT_MM = 876; // 34.5"

/**
 * Standard base cabinet depth: 24" (610mm).
 * This is the OUTER depth of the box including the back panel.
 * Countertop overhangs the box by ~25mm (1") in front.
 */
export const BASE_CABINET_DEPTH_MM = 610; // 24"

/**
 * Standard toe kick height: 4" (102mm).
 * Creates the recessed space at the base of the cabinet so you can stand
 * close without banging your feet. This is the height of the kickplate
 * board that runs along the front of the cabinet base.
 */
export const STANDARD_TOE_KICK_HEIGHT_MM = 102; // 4"

// =============================================================================
// WALL CABINET DEFAULTS
// =============================================================================

/**
 * Standard wall cabinet height: 30" (762mm).
 * Most common for 8-foot ceilings. Heights of 36", 39", and 42" are used
 * when cabinets extend to the ceiling or for a different look.
 */
export const WALL_CABINET_HEIGHT_MM = 762; // 30"

/**
 * Standard wall cabinet depth: 12" (305mm).
 * Shallow enough to not block sight lines across the kitchen.
 * Some builders use 15" (381mm) for extra storage — user-configurable.
 */
export const WALL_CABINET_DEPTH_MM = 305; // 12"

// =============================================================================
// TALL CABINET DEFAULTS
// =============================================================================

/**
 * Standard tall cabinet height: 84" (2134mm).
 * Full-height pantry or utility cabinet. Floor-to-ceiling options go up to
 * 96" (2438mm). This value targets a standard 8-foot ceiling installation.
 */
export const TALL_CABINET_HEIGHT_MM = 2134; // 84"

/**
 * Standard tall cabinet depth: 24" (610mm).
 * Same depth as base cabinets so the countertop run stays flush.
 */
export const TALL_CABINET_DEPTH_MM = 610; // 24"

// =============================================================================
// STANDARD CABINET WIDTHS
// =============================================================================

/**
 * Standard cabinet widths in mm — the discrete sizes used in Tier 1 mode.
 * These map to the industry standard U.S. cabinet widths:
 *   9", 12", 15", 18", 21", 24", 27", 30", 33", 36", 39", 42", 48"
 *
 * Most cabinet manufacturers build in 3" increments. The sheet goods
 * optimizer works best when parts come from these standard sizes — they
 * pack efficiently on 4'×8' sheets.
 */
export const STANDARD_CABINET_WIDTHS_MM: readonly number[] = [
  229,  // 9"
  305,  // 12"
  381,  // 15"
  457,  // 18"
  533,  // 21"
  610,  // 24"
  686,  // 27"
  762,  // 30"
  838,  // 33"
  914,  // 36"
  990,  // 39"
  1067, // 42"
  1219, // 48"
] as const;

// =============================================================================
// FRAMELESS REVEALS (Standard Gaps for European/Frameless Cabinets)
// =============================================================================

/**
 * Side reveal: gap between the door/drawer face edge and the cabinet side panel.
 * Applied on EACH SIDE, so total horizontal reveal = 2 × REVEAL_SIDE_MM = 3mm.
 *
 * This small gap allows the door to open without rubbing the cabinet side,
 * and gives the installer ~2mm of adjustment room with the hinge screws.
 */
export const REVEAL_SIDE_MM = 1.5;

/**
 * Top reveal: gap at the top of the door/drawer face.
 * 3mm is the standard for frameless cabinets. This gap is visible when the
 * door is closed, so it should be consistent across all cabinet openings.
 */
export const REVEAL_TOP_MM = 3.0;

/**
 * Bottom reveal: gap at the bottom of the door/drawer face for base cabinets.
 * 0mm means the door goes all the way to the bottom of the box opening.
 * Wall cabinets typically have a small bottom reveal too — but we keep this
 * at 0mm for the base cabinet calculation and let the caller set it per type.
 */
export const REVEAL_BOTTOM_MM = 0;

/**
 * Gap between two doors meeting at the center of a double-door cabinet.
 * 3mm total center gap = 1.5mm per door at the meeting edge.
 * This prevents the door edges from touching when both are closed.
 */
export const REVEAL_BETWEEN_DOORS_MM = 3.0;

/**
 * Gap between vertically stacked drawer faces.
 * 3mm between each pair of adjacent drawer faces maintains visual consistency
 * with the door reveals.
 */
export const REVEAL_BETWEEN_DRAWERS_MM = 3.0;

// =============================================================================
// JOINERY DEFAULTS
// =============================================================================

/**
 * Dado depth for dado_rabbet joinery.
 * When cutting dadoes in side panels to capture the top/bottom panels,
 * the groove depth is typically 1/4" (6.35mm). This is added to the width
 * of top/bottom panels — they extend INTO the dado on each side.
 *
 * Standard range: 6-10mm. Deeper dadoes are stronger but remove more material.
 * Pro Mode lets users override this value.
 */
export const DADO_DEPTH_MM = 6.35; // 1/4"

// =============================================================================
// DRAWER CLEARANCES
// =============================================================================

/**
 * Clearance between the drawer box side and the cabinet opening — per side.
 * Total width reduction = 2 × DRAWER_SLIDE_CLEARANCE_EACH_SIDE_MM.
 *
 * 12.7mm (1/2") per side is standard for Blum, Grass, and Accuride 3/4-extension
 * and full-extension slides. The 1/2" gives room for the slide body.
 *
 * Some European slides (Legrabox, Tandem Plus) use narrower clearances —
 * this will be a Pro Mode override in Phase 5.
 */
export const DRAWER_SLIDE_CLEARANCE_EACH_SIDE_MM = 12.7; // 1/2"

/**
 * Clearance between the top of the drawer box and the cabinet opening.
 * Allows the slide hardware and provides smooth operation.
 */
export const DRAWER_TOP_CLEARANCE_MM = 12.7; // 1/2"

// =============================================================================
// CUTTING / OPTIMIZATION DEFAULTS
// =============================================================================

/**
 * Default saw kerf (blade width).
 * Added between every part during sheet goods optimization to account for
 * material lost to the saw blade.
 *
 * Standard table saw blade: 1/8" (3.175mm).
 * Thin-kerf blades: 3/32" (2.381mm).
 * CNC router bits: 1/16" (1.587mm).
 *
 * We default to 1/8" — the most common DIY table saw. Pro Mode allows override.
 */
export const DEFAULT_SAW_KERF_MM = 3.175; // 1/8"

// =============================================================================
// DEFAULT MATERIAL LABELS
// =============================================================================

/** Default material description for cabinet box panels (sides, top, bottom). */
export const DEFAULT_BOX_MATERIAL = '3/4" Plywood';

/** Default material description for cabinet back panels. */
export const DEFAULT_BACK_MATERIAL = '1/4" Plywood';

/** Default material description for drawer box panels. */
export const DEFAULT_DRAWER_BOX_MATERIAL = '1/2" Plywood';
