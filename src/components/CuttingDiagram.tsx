/**
 * CuttingDiagram.tsx — SVG Cutting Diagram for One Sheet
 *
 * Renders a single SheetLayout as a proportionally-scaled SVG showing:
 *   • Sheet background (grey waste area)
 *   • Placed parts as colour-coded rectangles, one colour per cabinet
 *   • Part labels: name, finished dimensions, grain direction indicator
 *   • Rotation badge (↻) for parts placed in a rotated orientation
 *
 * C# analogy: this is a pure "view" component — it reads data and produces
 * pixels.  No state, no side-effects, just `props → SVG`.
 *
 * ── LABEL DENSITY TIERS ───────────────────────────────────────────────────────
 *   Small parts  (rendered min-side < MIN_LABEL_PX)  → colour only, no text
 *   Medium parts (min-side < MIN_DETAIL_PX)          → name + grain symbol
 *   Large parts  (min-side ≥ MIN_DETAIL_PX)          → name + dims + grain symbol
 *
 * ── COLOUR SCHEME ─────────────────────────────────────────────────────────────
 *   Up to 10 cabinets get distinct fill colours from CABINET_COLORS[].
 *   Colour index is assigned by first-appearance order across sheet.placements.
 *   Stroke uses the corresponding dark variant for contrast.
 */

import React, { useMemo } from 'react';
import Svg, { Rect, Text as SvgText, G, ClipPath, Defs } from 'react-native-svg';
import { SheetLayout, OptimizationSettings } from '../utils/optimizer/types';
import { mmToFractionalInches, formatFractionalInches } from '../utils/unitConversion';
import { MeasurementUnit } from '../types';

// =============================================================================
// CONSTANTS
// =============================================================================

/** Fill colours for cabinet parts — cycled by insertion order of cabinetId. */
const CABINET_COLORS = [
  '#4C9BE8', // blue
  '#5CB85C', // green
  '#E8964C', // orange
  '#9B5CE8', // purple
  '#E05252', // red
  '#2EC4B6', // teal
  '#E8C34C', // amber
  '#E84C9B', // pink
  '#4C75E8', // indigo
  '#7AC43E', // lime
];

/** Darker variants used for strokes and text — index-matched to CABINET_COLORS. */
const CABINET_DARK = [
  '#1A6BC4',
  '#2E8A2E',
  '#C46A12',
  '#6A2EC4',
  '#A81818',
  '#0E9189',
  '#C49312',
  '#C41A6A',
  '#1A45C4',
  '#4A9418',
];

const SHEET_BG     = '#CCCCCC';  // waste area / uncovered sheet
const SHEET_BORDER = '#888888';
const PART_STROKE  = 1.5;        // px, device-independent

/** Minimum rendered width OR height (px) needed to show any text label. */
const MIN_LABEL_PX  = 28;
/** Minimum rendered width OR height (px) needed to show dimension text. */
const MIN_DETAIL_PX = 55;

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Format a mm value for display in the diagram label.
 * Imperial → fractional inches without the trailing " (space is tight).
 * Metric   → integer mm.
 */
function fmtDim(mm: number, units: MeasurementUnit): string {
  if (units === 'imperial') {
    // formatFractionalInches produces e.g. '24 3/16"' — strip the trailing "
    return formatFractionalInches(mmToFractionalInches(mm)).replace(/"$/, '');
  }
  return `${Math.round(mm)}`;
}

/**
 * Shows the part's INSTALLED grain direction — what direction the grain will run
 * when the piece is assembled into the cabinet.
 *
 * ↕  vertical grain   — grain runs top-to-bottom when installed (e.g. side panels)
 * ↔  horizontal grain — grain runs left-to-right when installed (e.g. top/bottom panels)
 *    (blank for 'either' — no grain constraint on these parts)
 *
 * We deliberately show the installed direction (not the cut direction) so the
 * woodworker can cross-check the diagram: every ↕ part is correctly placed on the
 * sheet with its long dimension horizontal, and will be installed vertically.
 */
function grainSymbol(direction: string): string {
  if (direction === 'vertical')   return '↕';
  if (direction === 'horizontal') return '↔';
  return '';
}

// =============================================================================
// TYPES
// =============================================================================

export interface CuttingDiagramProps {
  /** The single sheet to render. */
  sheet: SheetLayout;
  /** Settings used for the optimisation (sheet dimensions, kerf). */
  settings: OptimizationSettings;
  /**
   * Available pixel width — the SVG will scale to fill this exactly.
   * Pass the result of onLayout from the parent View.
   */
  containerWidth: number;
  /** Display units for dimension labels. Defaults to 'imperial'. */
  units?: MeasurementUnit;
}

// =============================================================================
// COMPONENT
// =============================================================================

export default function CuttingDiagram({
  sheet,
  settings,
  containerWidth,
  units = 'imperial',
}: CuttingDiagramProps) {

  // ── Scale: map mm → pixels ─────────────────────────────────────────────────
  // Keep aspect ratio — sheet height scales with the same factor.
  const scale     = containerWidth / settings.sheetWidth;
  const svgWidth  = containerWidth;
  const svgHeight = settings.sheetHeight * scale;

  // ── Cabinet colour map ─────────────────────────────────────────────────────
  // Assign a colour index to each cabinetId in first-appearance order.
  // useMemo prevents re-computing on every render when props haven't changed.
  const cabinetColorMap = useMemo<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    let nextIdx = 0;
    for (const p of sheet.placements) {
      if (!(p.cabinetId in map)) {
        map[p.cabinetId] = nextIdx % CABINET_COLORS.length;
        nextIdx++;
      }
    }
    return map;
  }, [sheet.placements]);

  return (
    <Svg width={svgWidth} height={svgHeight}>

      {/* ── Sheet background (grey = waste / uncovered) ── */}
      <Rect
        x={0} y={0}
        width={svgWidth} height={svgHeight}
        fill={SHEET_BG}
        stroke={SHEET_BORDER}
        strokeWidth={1}
      />

      {/* ── Placed parts ── */}
      {sheet.placements.map(part => {

        // Scaled pixel coordinates
        const px = part.x      * scale;
        const py = part.y      * scale;
        const pw = part.width  * scale;
        const ph = part.height * scale;

        const colorIdx = cabinetColorMap[part.cabinetId] ?? 0;
        const fill     = CABINET_COLORS[colorIdx];
        const dark     = CABINET_DARK[colorIdx];

        // Label density
        const minSide   = Math.min(pw, ph);
        const showLabel  = minSide >= MIN_LABEL_PX;
        const showDetail = minSide >= MIN_DETAIL_PX;

        // Text sizing: scale proportionally but clamp to readable range
        const fontSize = Math.max(8, Math.min(13, minSide * 0.12));
        const lineH    = fontSize * 1.35;

        // Build label lines (filter empty)
        // ↻ only shown for 'either' grain parts rotated by the optimizer (non-obvious choice).
        // Vertical/horizontal grain parts are always in their required orientation — not surprising.
        const rotatedBadge = (part.grainDirection === 'either' && part.rotated) ? ' ↻' : '';
        const nameText = part.name + rotatedBadge;
        const dimText  = `${fmtDim(part.width, units)} × ${fmtDim(part.height, units)}`;
        const grain    = grainSymbol(part.grainDirection);

        const lines: string[] = [nameText];
        if (showDetail) lines.push(dimText);
        if (grain)      lines.push(grain);

        // Vertically center the text block within the part
        const blockH = lines.length * lineH;
        const cx     = px + pw / 2;
        const cy     = py + ph / 2;
        const textY0 = cy - blockH / 2 + lineH * 0.75; // first baseline

        // Unique clip-path id for this part instance
        const clipId = `clip-${part.partId}-${part.instanceIndex}`;

        return (
          <G key={`${part.partId}-${part.instanceIndex}`}>
            <Defs>
              {/* Clip text to the part's bounding rectangle */}
              <ClipPath id={clipId}>
                <Rect x={px + 1} y={py + 1} width={Math.max(0, pw - 2)} height={Math.max(0, ph - 2)} />
              </ClipPath>
            </Defs>

            {/* Part fill rectangle */}
            <Rect
              x={px} y={py}
              width={pw} height={ph}
              fill={fill}
              stroke={dark}
              strokeWidth={PART_STROKE}
            />

            {/* Labels (clipped to part bounds) */}
            {showLabel && (
              <G clipPath={`url(#${clipId})`}>
                {lines.map((line, li) => (
                  <SvgText
                    key={li}
                    x={cx}
                    y={textY0 + li * lineH}
                    fontSize={fontSize}
                    fill={dark}
                    fontWeight="700"
                    textAnchor="middle"
                  >
                    {line}
                  </SvgText>
                ))}
              </G>
            )}
          </G>
        );
      })}

    </Svg>
  );
}
