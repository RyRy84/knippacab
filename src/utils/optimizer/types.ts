/**
 * optimizer/types.ts — Shared Types for the Sheet Goods Optimizer
 *
 * These types flow through the entire Phase 4 pipeline:
 *   Part[] (from calculators) → optimizeSheetCutting() → OptimizationResult
 *                                                              ↓
 *                                                    CuttingDiagram (SVG)
 */

import { GrainDirection, PartType } from '../../types';

// =============================================================================
// SETTINGS
// =============================================================================

/**
 * Configuration that controls how the optimizer runs.
 * All dimensions are in mm — same as the rest of the app.
 *
 * Standard 4'×8' sheet: 2440mm × 1220mm
 * Standard table saw kerf: 3.175mm (1/8")
 */
export interface OptimizationSettings {
  /** Sheet width in mm. Default 2440mm (8 feet). */
  sheetWidth: number;
  /** Sheet height in mm. Default 1220mm (4 feet). */
  sheetHeight: number;
  /** Saw blade kerf in mm. Default 3.175mm (1/8"). */
  sawKerf: number;
  /** Distance to trim from each edge before placing parts, mm. Default 0. */
  trimMargin: number;
}

export const DEFAULT_SHEET_SETTINGS: OptimizationSettings = {
  sheetWidth: 2440,
  sheetHeight: 1220,
  sawKerf: 3.175,
  trimMargin: 0,
};

// =============================================================================
// INTERNAL TYPES (used only inside binPacking.ts)
// =============================================================================

/**
 * A single part instance to be placed — quantity has already been expanded.
 * E.g. a Part with quantity=2 becomes two ExpandedParts.
 *
 * C# analogy: this is like a "flattened" view model derived from the Part entity.
 */
export interface ExpandedPart {
  partId: string;
  instanceIndex: number;   // 0-based; shown in label when quantity > 1
  name: string;            // already includes "(1/2)" suffix if quantity > 1
  width: number;           // mm
  height: number;          // mm
  thickness: number;       // mm — used to group parts by material
  material: string;
  grainDirection: GrainDirection;
  partType: PartType;
  cabinetId: string;
  canRotate: boolean;      // true only for grainDirection === 'either'
}

// =============================================================================
// PUBLIC OUTPUT TYPES
// =============================================================================

/**
 * A single part that has been successfully placed on a sheet.
 * x/y are the top-left corner on the sheet in mm.
 */
export interface PlacedPart {
  partId: string;
  instanceIndex: number;
  name: string;
  /** Actual placed width in mm — may be the original height if rotated. */
  width: number;
  /** Actual placed height in mm — may be the original width if rotated. */
  height: number;
  /** Left edge position on the sheet, in mm. */
  x: number;
  /** Top edge position on the sheet, in mm. */
  y: number;
  sheetIndex: number;
  /** true if the part was rotated 90° from its original orientation. */
  rotated: boolean;
  grainDirection: GrainDirection;
  material: string;
  partType: PartType;
  cabinetId: string;
}

/**
 * A rectangular waste area on a sheet — the remaining free space
 * after all parts have been placed.
 */
export interface WasteRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Everything needed to render and label one physical sheet.
 */
export interface SheetLayout {
  sheetIndex: number;
  placements: PlacedPart[];
  /** Remaining free rectangles — used to shade waste areas in the SVG. */
  wasteRects: WasteRect[];
  /** Total area covered by placed parts, mm². */
  usedAreaMm2: number;
  /** Total sheet area (full sheet dimensions, not just usable), mm². */
  totalAreaMm2: number;
  /** Percentage of sheet area covered by parts. */
  utilizationPercent: number;
}

/**
 * The full result returned by optimizeSheetCutting().
 * This is what VisualDiagramScreen receives and passes to CuttingDiagram.
 */
export interface OptimizationResult {
  sheets: SheetLayout[];
  totalSheetsUsed: number;
  totalPartsPlaced: number;
  /** Weighted average utilization across all sheets, %. */
  overallUtilizationPercent: number;
  /** Part names that couldn't be placed (dimensions exceed a single sheet). */
  unplacedParts: string[];
  /** The settings used for this optimization — stored for display. */
  settings: OptimizationSettings;
}
