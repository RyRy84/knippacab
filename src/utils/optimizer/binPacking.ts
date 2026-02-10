/**
 * binPacking.ts — Guillotine Sheet Goods Optimizer
 *
 * Implements a Guillotine Best-Short-Side-Fit (BSSF) bin packing algorithm
 * to arrange cabinet parts on standard plywood sheets with minimum waste.
 *
 * ── ALGORITHM OVERVIEW ────────────────────────────────────────────────────────
 *
 * 1. Expand all parts by their quantity into individual instances.
 * 2. Sort by area descending — placing large parts first reduces fragmentation.
 * 3. For each part, find the "best" free rectangle across all open sheets:
 *      Score = min(freeRect.width - partWidth, freeRect.height - partHeight)
 *      (lower score = tighter fit = less wasted space around the part)
 * 4. Place the part at the top-left of the chosen free rect.
 * 5. Split the remaining free space into two sub-rectangles (Guillotine split).
 *    Split direction: "Shorter Leftover Axis" — splits along whichever side
 *    has less leftover, producing more useful free rects for future parts.
 * 6. If no free rect fits on any open sheet, open a new sheet.
 * 7. Repeat until all parts are placed.
 *
 * ── GRAIN DIRECTION ───────────────────────────────────────────────────────────
 *
 * A plywood sheet's grain runs along its LONG axis — the 2440mm width direction
 * (horizontal in the cutting diagram).  For a cut part to have the correct grain
 * when installed, its grain-aligned dimension must be placed along the sheet's
 * x-axis.
 *
 *   'horizontal' grain  — grain runs along Part.width  (installed left↔right)
 *                         → place NORMAL: Part.width  along sheet x-axis
 *   'vertical'   grain  — grain runs along Part.height (installed top↕bottom)
 *                         → place ROTATED: Part.height along sheet x-axis
 *   'either'     grain  — no constraint; optimizer chooses better BSSF fit
 *
 * This means a cabinet side (610 deep × 876 tall, vertical grain) is placed as
 * 876mm wide × 610mm tall on the sheet — so the grain runs horizontally on the
 * sheet and vertically in the installed cabinet.  The `rotated` flag on the
 * resulting PlacedPart is true for all vertical-grain parts, which is correct
 * and expected — it is NOT an exception, it is the required orientation.
 *
 * ── PERFORMANCE ───────────────────────────────────────────────────────────────
 *
 * Typical cabinet project: 20–60 parts, 2–3 sheets.
 * This algorithm is O(n × k) where n = parts and k = free rects per sheet.
 * For a 60-part project with 3 sheets: ~1000 comparisons. Runs in < 1ms.
 *
 * ── C# COMPARISON NOTE ────────────────────────────────────────────────────────
 *
 * The mutable `freeRects` arrays are like C# List<Rectangle> — they're passed
 * by reference and modified in-place (splice/push). This is intentional: the
 * algorithm mutates the free rect list as it places each part.
 */

import { Part } from '../../types';
import {
  OptimizationSettings,
  DEFAULT_SHEET_SETTINGS,
  ExpandedPart,
  PlacedPart,
  WasteRect,
  SheetLayout,
  OptimizationResult,
} from './types';

// =============================================================================
// INTERNAL FREE-RECTANGLE TYPE
// =============================================================================

/** A rectangular region of free space on a sheet where a part might be placed. */
interface FreeRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Arrange all cabinet parts onto the minimum number of sheets.
 *
 * @param parts    - All Part[] from calculateCabinetParts() + calculateDrawerParts()
 * @param settings - Sheet dimensions, kerf, and trim margin
 * @returns        - Placements, utilization stats, and waste areas per sheet
 */
export function optimizeSheetCutting(
  parts: Part[],
  settings: OptimizationSettings = DEFAULT_SHEET_SETTINGS
): OptimizationResult {

  // ── Usable sheet area after trim margins ─────────────────────────────────
  const usableW  = settings.sheetWidth  - 2 * settings.trimMargin;
  const usableH  = settings.sheetHeight - 2 * settings.trimMargin;
  const originX  = settings.trimMargin;
  const originY  = settings.trimMargin;
  const kerf     = settings.sawKerf;

  // ── Expand parts by quantity & filter oversized ───────────────────────────
  const unplacedParts: string[] = [];
  const expanded: ExpandedPart[] = [];

  for (const part of parts) {
    const w = part.width;
    const h = part.height;
    const grain = part.grainDirection;

    // A part is oversized if it cannot fit on a fresh sheet in its required grain orientation.
    //   'vertical'   → must be placed h×w (height along x-axis): h ≤ usableW, w ≤ usableH
    //   'horizontal' → must be placed w×h (width along x-axis):  w ≤ usableW, h ≤ usableH
    //   'either'     → try both orientations
    let canFit: boolean;
    if (grain === 'vertical') {
      canFit = h <= usableW && w <= usableH;
    } else if (grain === 'horizontal') {
      canFit = w <= usableW && h <= usableH;
    } else {
      canFit = (w <= usableW && h <= usableH) || (h <= usableW && w <= usableH);
    }

    if (!canFit) {
      for (let i = 0; i < part.quantity; i++) {
        unplacedParts.push(`${part.name} (too large for sheet)`);
      }
      continue;
    }

    for (let i = 0; i < part.quantity; i++) {
      // Include instance numbering in the label when there are multiple copies
      const label = part.quantity > 1
        ? `${part.name} ${i + 1}/${part.quantity}`
        : part.name;

      expanded.push({
        partId: part.id,
        instanceIndex: i,
        name: label,
        width: w,
        height: h,
        thickness: part.thickness,
        material: part.material,
        grainDirection: grain,
        partType: part.partType,
        cabinetId: part.cabinetId,
      });
    }
  }

  // ── Sort by area descending ───────────────────────────────────────────────
  // Large parts placed first → fewer fragmented free rects → better packing
  expanded.sort((a, b) => (b.width * b.height) - (a.width * a.height));

  // ── Guillotine packing ────────────────────────────────────────────────────
  // One array of free rects per open sheet.
  // Each sheet starts with a single free rect covering the entire usable area.
  const sheetFreeRects: FreeRect[][] = [];
  const allPlacements: PlacedPart[] = [];

  for (const ep of expanded) {
    let placed = false;

    // Try to fit the part into an already-open sheet
    for (let si = 0; si < sheetFreeRects.length; si++) {
      const placement = tryPlace(ep, sheetFreeRects[si], si, kerf);
      if (placement) {
        allPlacements.push(placement);
        placed = true;
        break;
      }
    }

    if (!placed) {
      // Open a new sheet
      const si = sheetFreeRects.length;
      sheetFreeRects.push([{ x: originX, y: originY, width: usableW, height: usableH }]);
      const placement = tryPlace(ep, sheetFreeRects[si], si, kerf);
      if (placement) {
        allPlacements.push(placement);
      } else {
        // Shouldn't happen — we already verified the part fits on a fresh sheet
        unplacedParts.push(ep.name);
      }
    }
  }

  // ── Build per-sheet results ───────────────────────────────────────────────
  const totalSheetArea = settings.sheetWidth * settings.sheetHeight;

  const sheets: SheetLayout[] = sheetFreeRects.map((freeRects, si) => {
    const placements  = allPlacements.filter(p => p.sheetIndex === si);
    const usedArea    = placements.reduce((sum, p) => sum + p.width * p.height, 0);
    const utilization = totalSheetArea > 0 ? (usedArea / totalSheetArea) * 100 : 0;

    return {
      sheetIndex: si,
      placements,
      wasteRects: freeRects as WasteRect[],
      usedAreaMm2: usedArea,
      totalAreaMm2: totalSheetArea,
      utilizationPercent: utilization,
    };
  });

  // ── Overall stats ─────────────────────────────────────────────────────────
  const totalUsedArea   = allPlacements.reduce((s, p) => s + p.width * p.height, 0);
  const totalPossible   = sheets.length * totalSheetArea;
  const overallUtil     = totalPossible > 0 ? (totalUsedArea / totalPossible) * 100 : 0;

  return {
    sheets,
    totalSheetsUsed: sheets.length,
    totalPartsPlaced: allPlacements.length,
    overallUtilizationPercent: overallUtil,
    unplacedParts,
    settings,
  };
}

// =============================================================================
// INTERNAL HELPERS
// =============================================================================

/**
 * Try to place a part in one of the free rects on a sheet.
 * Scores all free rects in both orientations (if rotation is allowed),
 * picks the one with the best short-side fit, places the part, and
 * splits the used rect into at most 2 sub-rects.
 *
 * Returns null if the part doesn't fit anywhere on this sheet.
 */
function tryPlace(
  part: ExpandedPart,
  freeRects: FreeRect[],
  sheetIndex: number,
  kerf: number
): PlacedPart | null {

  let bestScore = Infinity;
  let bestRect: FreeRect | null = null;
  let bestRotated = false;

  for (const rect of freeRects) {
    if (part.grainDirection === 'vertical') {
      // Grain runs along Part.height (installed top↕bottom).
      // Must place Part.height along sheet x-axis → placed as (h wide × w tall), rotated=true.
      const pw = part.height;
      const ph = part.width;
      if (pw <= rect.width && ph <= rect.height) {
        const score = Math.min(rect.width - pw, rect.height - ph);
        if (score < bestScore) { bestScore = score; bestRect = rect; bestRotated = true; }
      }

    } else if (part.grainDirection === 'horizontal') {
      // Grain runs along Part.width (installed left↔right).
      // Must place Part.width along sheet x-axis → placed as (w wide × h tall), rotated=false.
      if (part.width <= rect.width && part.height <= rect.height) {
        const score = Math.min(rect.width - part.width, rect.height - part.height);
        if (score < bestScore) { bestScore = score; bestRect = rect; bestRotated = false; }
      }

    } else {
      // 'either': try both orientations, pick best BSSF score.
      if (part.width <= rect.width && part.height <= rect.height) {
        const score = Math.min(rect.width - part.width, rect.height - part.height);
        if (score < bestScore) { bestScore = score; bestRect = rect; bestRotated = false; }
      }
      if (part.width !== part.height &&
          part.height <= rect.width && part.width <= rect.height) {
        const score = Math.min(rect.width - part.height, rect.height - part.width);
        if (score < bestScore) { bestScore = score; bestRect = rect; bestRotated = true; }
      }
    }
  }

  if (!bestRect) return null;

  // Actual placed dimensions (may be swapped if rotated)
  const pw = bestRotated ? part.height : part.width;
  const ph = bestRotated ? part.width  : part.height;

  // Split the chosen free rect
  splitRect(freeRects, bestRect, pw, ph, kerf);

  return {
    partId:         part.partId,
    instanceIndex:  part.instanceIndex,
    name:           part.name,
    width:          pw,
    height:         ph,
    x:              bestRect.x,
    y:              bestRect.y,
    sheetIndex,
    rotated:        bestRotated,
    grainDirection: part.grainDirection,
    material:       part.material,
    partType:       part.partType,
    cabinetId:      part.cabinetId,
  };
}

/**
 * Guillotine split: after placing a part (pw × ph) at the top-left of `usedRect`,
 * split the remaining space into at most 2 sub-rectangles and add them to
 * `freeRects` (replacing `usedRect`).
 *
 * Split rule — "Shorter Leftover Axis":
 *   - leftoverW = rect.width  - pw - kerf  (space to the right of the part)
 *   - leftoverH = rect.height - ph - kerf  (space above the part)
 *   - If leftoverW < leftoverH → horizontal split
 *     Right sub: (x+pw+kerf, y,         leftoverW, ph)           narrow, part-height
 *     Top  sub:  (x,         y+ph+kerf, rect.width, leftoverH)   full-width
 *   - Else → vertical split
 *     Right sub: (x+pw+kerf, y,         leftoverW, rect.height)  full-height
 *     Top  sub:  (x,         y+ph+kerf, pw,         leftoverH)   part-width
 *
 * The "shorter leftover axis" rule tends to produce larger, more usable free rects
 * compared to always splitting horizontally or always vertically.
 */
function splitRect(
  freeRects: FreeRect[],
  usedRect: FreeRect,
  pw: number,
  ph: number,
  kerf: number
): void {
  // Remove the rect we just used
  const idx = freeRects.indexOf(usedRect);
  if (idx !== -1) freeRects.splice(idx, 1);

  const leftoverW = usedRect.width  - pw - kerf;
  const leftoverH = usedRect.height - ph - kerf;

  if (leftoverW < leftoverH) {
    // Horizontal split: narrow right strip + full-width top strip
    if (leftoverW > 0) {
      freeRects.push({
        x:      usedRect.x + pw + kerf,
        y:      usedRect.y,
        width:  leftoverW,
        height: ph,
      });
    }
    if (leftoverH > 0) {
      freeRects.push({
        x:      usedRect.x,
        y:      usedRect.y + ph + kerf,
        width:  usedRect.width,
        height: leftoverH,
      });
    }
  } else {
    // Vertical split: full-height right strip + narrow top strip
    if (leftoverW > 0) {
      freeRects.push({
        x:      usedRect.x + pw + kerf,
        y:      usedRect.y,
        width:  leftoverW,
        height: usedRect.height,
      });
    }
    if (leftoverH > 0) {
      freeRects.push({
        x:      usedRect.x,
        y:      usedRect.y + ph + kerf,
        width:  pw,
        height: leftoverH,
      });
    }
  }
}
