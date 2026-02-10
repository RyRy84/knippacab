/**
 * index.ts — Core TypeScript Type Definitions for KnippaCab
 *
 * This file defines all the shared interfaces and type aliases used across
 * the app: projects, cabinets, drawers, parts, and the various enumerations
 * for joinery methods, cabinet types, etc.
 *
 * DESIGN DECISIONS:
 * - All dimension fields are stored in millimeters (mm). Convert to Imperial
 *   only for display using src/utils/unitConversion.ts.
 * - We use string literal union types instead of numeric enums. Why?
 *   1. They're human-readable in JSON, logs, and database rows ("base" vs 0).
 *   2. They don't need a reverse mapping (numeric enums create {0: "Base", "Base": 0}).
 *   3. They serialize/deserialize cleanly to/from SQLite text columns.
 *
 * C# COMPARISON NOTES:
 * - String literal union types are like C# enums, but they're just strings at runtime.
 *
 *     C#:  enum CabinetType { Base, Wall, Tall }
 *     TS:  type CabinetType = "base" | "wall" | "tall"
 *
 *   In C# you'd write `CabinetType.Base`, in TS you'd write `"base"` directly.
 *   The compiler still catches typos — `"bse"` would be a type error.
 *
 * - TypeScript interfaces are structurally typed (duck typing). If an object has
 *   all the right properties with the right types, it satisfies the interface —
 *   no explicit `implements` keyword needed.
 *
 *     C#:  class Cabinet : ICabinet { ... }        // must declare explicitly
 *     TS:  const cab: Cabinet = { id: "1", ... }   // just needs the right shape
 *
 * - `readonly` on interface properties ≈ C# `{ get; init; }` — you can set it
 *   when creating the object, but the compiler prevents reassignment afterward.
 *   NOTE: This is compile-time only; JavaScript doesn't enforce it at runtime.
 */

// =============================================================================
// ENUMERATIONS (String Literal Union Types)
// =============================================================================

/**
 * The user's preferred measurement system for display.
 * - "metric": show values in mm (e.g., "609.6 mm")
 * - "imperial": show values in fractional inches (e.g., '24"' or '2\'-6 3/8"')
 *
 * This is the app-wide type used in Project settings and UI components.
 * It's identical to `UnitSystem` in unitConversion.ts — they're interchangeable.
 * We define it here as the canonical "source of truth" for the rest of the app.
 */
export type MeasurementUnit = "metric" | "imperial";

/**
 * Cabinet joinery method — determines how box parts connect to each other.
 * This affects the cut list: dado & rabbet joints require adding dado depth
 * to the side panel dimensions (typically 6-10mm deeper).
 *
 * - "butt_screws":    Simplest — parts butt together, held by screws. No cut adjustment.
 * - "pocket_hole":    Default for V1 — Kreg-style angled pocket screws. No cut adjustment.
 * - "dado_rabbet":    Intermediate — grooves cut into panels for shelves/sides. Adds dado depth.
 * - "dowel":          Intermediate — drilled holes with wooden dowels + glue. No cut adjustment.
 *
 * The string values use underscores (not spaces or camelCase) so they're safe
 * as database values, URL params, and JSON keys without escaping.
 */
export type JoineryMethod = "butt_screws" | "pocket_hole" | "dado_rabbet" | "dowel";

/**
 * Toe kick configuration for base cabinets.
 * - "standard": Uses the industry standard 4" (102mm) toe kick height.
 * - "custom":   User specifies a custom toe kick height (stored in Cabinet.toeKickHeight).
 * - "none":     No toe kick — cabinet sits on feet, a frame, or directly on the floor.
 *
 * Wall and tall cabinets typically don't have a toe kick, but it's still
 * tracked on the Cabinet interface so the type is consistent.
 */
export type ToeKickOption = "standard" | "custom" | "none";

/**
 * Cabinet type — determines default dimensions and construction rules.
 * - "base": Standard lower cabinet. Default: 34.5" (876mm) H × 24" (610mm) D.
 *           Gets a countertop (adds ~1.5" to total installed height).
 * - "wall": Upper cabinet mounted to wall. Typically 12"-15" deep, 30"-42" tall.
 * - "tall": Full-height cabinet (pantry, oven, utility). 84"-96" tall, 12"-24" deep.
 *
 * Frameless (European-style) construction only in V1 — face-frame is V2.
 */
export type CabinetType = "base" | "wall" | "tall";

/**
 * Grain direction for sheet goods and solid wood.
 * The sheet goods optimizer uses this to ensure parts are cut with the grain
 * running the correct way — critical for veneered plywood and wood panels.
 *
 * - "horizontal": Grain must run along the width (left-to-right when installed).
 * - "vertical":   Grain must run along the height (top-to-bottom when installed).
 * - "either":     No grain constraint — part can be rotated freely to optimize yield.
 *                 Used for MDF, melamine, or non-visible parts like cabinet backs.
 */
export type GrainDirection = "horizontal" | "vertical" | "either";

/**
 * Drawer box corner joinery — how the four sides of the drawer box connect.
 * - "pocket_hole": Default — quick and strong, uses angled pocket screws at corners.
 * - "butt":        Simplest — sides butt together, glued and/or screwed.
 * - "dado":        Strongest — front/back captured in dado grooves cut into the sides.
 *                  Adds dado depth to the front/back piece width calculation.
 *
 * Note: Dovetails are explicitly V2 (they require more complex math and tooling).
 */
export type DrawerCornerJoinery = "pocket_hole" | "butt" | "dado";

/**
 * How the drawer bottom panel attaches to the drawer box.
 * - "applied":        Bottom panel nailed/stapled to the underside of the box.
 *                     Easiest to build; bottom is cut to full box footprint size.
 * - "captured_dado":  Bottom slides into dado grooves cut into all four sides.
 *                     Strongest and cleanest; requires dado cuts and affects side height.
 * - "screwed":        Bottom panel screwed up from below into the sides.
 *                     Good middle ground — easy to replace if damaged.
 */
export type DrawerBottomMethod = "applied" | "captured_dado" | "screwed";

/**
 * The structural role of a part within a cabinet or drawer.
 * Used by the sheet optimizer to group and sort parts, and by the cut list
 * UI to assign icons, labels, and grain direction rules.
 *
 * Cabinet box parts: side, top, bottom, back, toe_kick
 * Door parts:        door (single), door_left, door_right (double)
 * Drawer box parts:  drawer_front_inner, drawer_back, drawer_side,
 *                    drawer_bottom, drawer_face (decorative face panel)
 */
export type PartType =
  | 'side'
  | 'top'
  | 'bottom'
  | 'back'
  | 'toe_kick'
  | 'door'
  | 'door_left'
  | 'door_right'
  | 'drawer_front_inner'
  | 'drawer_back'
  | 'drawer_side'
  | 'drawer_bottom'
  | 'drawer_face';

// =============================================================================
// CORE DATA INTERFACES
// =============================================================================

/**
 * A KnippaCab project — the top-level container for a set of cabinets.
 *
 * A project represents one kitchen, bathroom, closet, etc. It holds the
 * user's preferences (unit system, default joinery) and owns multiple cabinets.
 *
 * C# equivalent:
 *   public record Project(string Id, string Name, ...);
 *
 * The `id` field is a string (not a number) to support UUIDs from SQLite.
 * SQLite doesn't have a native UUID type, but we'll generate them in code
 * and store as TEXT for portability.
 */
export interface Project {
  /** Unique identifier (UUID string). Generated when the project is created. */
  readonly id: string;

  /** User-given name for the project (e.g., "Kitchen Reno 2025"). */
  name: string;

  /** The user's preferred display unit for this project. */
  units: MeasurementUnit;

  /**
   * Default joinery method for new cabinets added to this project.
   * Individual cabinets can override this — the project-level default
   * just saves the user from picking it every time.
   */
  defaultJoinery: JoineryMethod;

  /** When the project was first created (ISO 8601 string). */
  readonly createdAt: string;

  /** When any part of the project was last modified (ISO 8601 string). */
  modifiedAt: string;
}

/**
 * A single cabinet within a project.
 *
 * All dimensions are in millimeters. The width, height, and depth represent
 * the outer dimensions of the cabinet box (not including countertop, doors,
 * or trim).
 *
 * DIMENSION NOTES:
 * - width:  Left-to-right when facing the cabinet.
 * - height: Top-to-bottom of the cabinet box itself.
 *           For base cabinets, this is typically 34.5" (876mm) WITHOUT countertop.
 * - depth:  Front-to-back, including the back panel.
 *           Base cabinet standard is 24" (610mm).
 *
 * TOE KICK:
 * The toeKickHeight is subtracted from the total installed height (not from `height`).
 * The cabinet box `height` is the height of the box above the toe kick.
 * Example: 34.5" total - 4" toe kick = 30.5" box height sitting on a 4" toe kick frame.
 */
export interface Cabinet {
  /** Unique identifier (UUID string). */
  readonly id: string;

  /** Which project this cabinet belongs to. Foreign key → Project.id. */
  readonly projectId: string;

  /** Base, wall, or tall — affects default dimensions and construction rules. */
  type: CabinetType;

  /** Outer box width in mm (left-to-right). Standard base widths: 229mm–1219mm (9"–48"). */
  width: number;

  /** Outer box height in mm (top-to-bottom of the box, not including countertop). */
  height: number;

  /** Outer box depth in mm (front-to-back). Standard base depth: 610mm (24"). */
  depth: number;

  /** Toe kick configuration. Wall cabinets typically use "none". */
  toeKickOption: ToeKickOption;

  /**
   * Toe kick height in mm. Only meaningful when toeKickOption is "standard" or "custom".
   * - "standard" → 102mm (4")
   * - "custom"   → user-specified value
   * - "none"     → 0 (ignored)
   */
  toeKickHeight: number;

  /**
   * Joinery method for this specific cabinet.
   * Defaults to the project's defaultJoinery but can be overridden per cabinet.
   * Affects cut list calculations — dado_rabbet adds depth to side panels.
   */
  joineryMethod: JoineryMethod;
}

/**
 * A drawer within a cabinet.
 *
 * Drawers have their own joinery and bottom attachment methods, independent
 * of the cabinet's joinery method. A cabinet can have 0 or more drawers.
 *
 * All dimensions are the INTERNAL box dimensions in mm:
 * - width:  Inside width of the drawer box (cabinet opening width minus slide clearances).
 * - height: Inside height of the drawer box sides.
 * - depth:  Inside depth front-to-back (how far the drawer extends).
 *
 * The drawer FRONT (face) is a separate part that covers the opening and
 * is calculated using the door/drawer reveal formulas in CLAUDE.md.
 */
export interface Drawer {
  /** Unique identifier (UUID string). */
  readonly id: string;

  /** Which cabinet this drawer belongs to. Foreign key → Cabinet.id. */
  readonly cabinetId: string;

  /** Internal box width in mm (inside measurement, accounting for slide clearances). */
  width: number;

  /** Internal box height in mm (side panel height). */
  height: number;

  /** Internal box depth in mm (front-to-back). */
  depth: number;

  /** How the four sides of the drawer box connect at the corners. */
  cornerJoinery: DrawerCornerJoinery;

  /** How the bottom panel is attached to the drawer box. */
  bottomMethod: DrawerBottomMethod;

  /**
   * Material for the drawer front face (e.g., "3/4 Maple Plywood").
   * The front face is the decorative panel visible when the drawer is closed.
   * This can differ from the box material — boxes are often cheaper plywood
   * while fronts match the cabinet doors.
   */
  frontMaterial: string;
}

/**
 * A single part (piece of material) in the cut list.
 *
 * Parts are auto-generated from cabinet and drawer configurations.
 * Each part represents one piece that needs to be cut from sheet goods or lumber.
 *
 * Examples of parts for a base cabinet:
 * - Left side panel    (vertical grain, 3/4" plywood)
 * - Right side panel   (vertical grain, 3/4" plywood)
 * - Top panel          (horizontal grain, 3/4" plywood)
 * - Bottom panel       (horizontal grain, 3/4" plywood)
 * - Back panel         (either grain, 1/4" plywood)
 * - Shelf              (horizontal grain, 3/4" plywood)
 * - Toe kick board     (either grain, 3/4" plywood)
 *
 * IMPORTANT: `width` and `height` here are the FINISHED cut dimensions in mm.
 * The sheet goods optimizer uses these (plus saw kerf) to lay out cuts on sheets.
 *
 * Why both cabinetId AND drawerId?
 * - Cabinet parts (sides, top, bottom, back, shelves) → cabinetId is set, drawerId is null.
 * - Drawer parts (sides, front, back, bottom)         → both are set so we know which drawer.
 * This lets us group the cut list by cabinet AND by drawer within that cabinet.
 */
export interface Part {
  /** Unique identifier (UUID string). */
  readonly id: string;

  /** Which cabinet this part belongs to. Always set. Foreign key → Cabinet.id. */
  readonly cabinetId: string;

  /**
   * Which drawer this part belongs to, if it's a drawer part.
   * Null for cabinet-level parts (sides, top, bottom, back, shelves).
   * Foreign key → Drawer.id.
   */
  readonly drawerId: string | null;

  /**
   * The structural role of this part (e.g., 'side', 'door_left', 'drawer_face').
   * Used by the sheet optimizer and cut list UI for grouping, sorting, and icons.
   * Mirrors the `name` field but machine-readable instead of human-readable.
   */
  partType: PartType;

  /**
   * Human-readable name describing what this part is.
   * Examples: "Left Side", "Bottom Panel", "Drawer Front", "Back Panel", "Shelf"
   */
  name: string;

  /**
   * Finished cut width in mm.
   * This is the dimension along the "width" of the part as it will be installed.
   * For the sheet goods optimizer, this is one of the two dimensions it needs to place.
   */
  width: number;

  /**
   * Finished cut height in mm.
   * This is the dimension along the "height" of the part as it will be installed.
   * For the sheet goods optimizer, this is the other dimension it needs to place.
   */
  height: number;

  /**
   * Material thickness in mm.
   * Common values: 18.75mm (3/4"), 12.5mm (1/2"), 6.35mm (1/4").
   * Used for grouping — you can only cut parts of the same thickness from the same sheet.
   */
  thickness: number;

  /**
   * How many identical copies of this part to cut.
   * Usually 1 or 2 (e.g., 2 side panels, 1 bottom).
   * The optimizer treats each copy as a separate rectangle to place on a sheet.
   */
  quantity: number;

  /**
   * Material description (e.g., "3/4 Maple Plywood", "1/4 Birch Plywood").
   * Used for grouping the cut list — parts of the same material are cut from the same sheets.
   */
  material: string;

  /**
   * Grain direction constraint for the sheet goods optimizer.
   * - "vertical"/"horizontal": Part must be oriented so grain runs this direction.
   * - "either": Part can be rotated freely to minimize waste.
   */
  grainDirection: GrainDirection;

  /**
   * Optional notes about this part (e.g., "edge band front edge", "drill shelf pin holes").
   * Displayed in the cut list and assembly instructions.
   */
  notes: string;
}
