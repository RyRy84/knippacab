/**
 * pdfGenerator.ts — PDF Export for KnippaCab
 *
 * Generates a shop-ready PDF containing:
 *   1. Cover page  — project name, date, material summary table
 *   2. Cut list    — all parts grouped by material in a table
 *   3. Cutting diagrams — one inline SVG per sheet of material
 *
 * ── APPROACH ─────────────────────────────────────────────────────────────────
 * Uses expo-print which renders an HTML string through a WebView and produces
 * a PDF via the platform's native print system:
 *   Web:    → browser print dialog (Save as PDF option)
 *   iOS:    → AirPrint / Save to Files
 *   Android → system print manager
 *
 * Cutting diagrams are generated as inline SVG strings directly from the
 * SheetLayout data — no DOM capture needed, works cross-platform.
 *
 * ── COLOUR SCHEME ────────────────────────────────────────────────────────────
 * Cabinet colours match CuttingDiagram.tsx exactly so the PDF diagrams look
 * identical to what the user sees on-screen.
 */

import * as Print from 'expo-print';
import { Part, MeasurementUnit } from '../types';
import {
  OptimizationResult,
  OptimizationSettings,
  SheetLayout,
} from './optimizer/types';
import { formatForDisplay } from './unitConversion';

// =============================================================================
// CONSTANTS — mirrors CuttingDiagram.tsx colour palette
// =============================================================================

/** Fill colours, one per cabinet (cycled by first-appearance order). */
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

/** Darker stroke/text variants, index-matched to CABINET_COLORS. */
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

// =============================================================================
// HELPERS
// =============================================================================

/** Format a mm value for display in the user's preferred unit system. */
function fmtDim(mm: number, units: MeasurementUnit): string {
  return formatForDisplay(mm, units);
}

/** Minimal HTML entity escaping for safe text embedding. */
function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Render a grain direction badge as an HTML <span>. */
function grainBadge(grain: string): string {
  const cls =
    grain === 'vertical'   ? 'grain-v' :
    grain === 'horizontal' ? 'grain-h' : 'grain-e';
  const arrow =
    grain === 'vertical'   ? '↑' :
    grain === 'horizontal' ? '→' : '↕';
  const label =
    grain === 'vertical'   ? 'Vert' :
    grain === 'horizontal' ? 'Horiz' : 'Either';
  return `<span class="grain-badge ${cls}">${arrow} ${label}</span>`;
}

/**
 * Build a cabinetId → colour index map from all SheetLayouts.
 * Colour is assigned by first-appearance order across all placements.
 */
function buildColorMap(sheets: SheetLayout[]): Map<string, number> {
  const map = new Map<string, number>();
  let next = 0;
  for (const sheet of sheets) {
    for (const p of sheet.placements) {
      if (!map.has(p.cabinetId)) {
        map.set(p.cabinetId, next % CABINET_COLORS.length);
        next++;
      }
    }
  }
  return map;
}

// =============================================================================
// SVG GENERATION — pure string, no React dependency
// =============================================================================

/**
 * Generates a standalone SVG string for a single SheetLayout.
 *
 * All coordinates are scaled from mm to pixels using:
 *   px = mm × (svgWidth / settings.sheetWidth)
 *
 * Labels follow the same three-tier density as CuttingDiagram.tsx:
 *   small parts  (min-side < 20 px) → fill only, no text
 *   medium parts (min-side < 45 px) → part name only
 *   large parts  (min-side ≥ 45 px) → name + mm dimensions + rotation note
 */
function sheetToSvg(
  sheet: SheetLayout,
  settings: OptimizationSettings,
  colorMap: Map<string, number>,
  svgWidth: number = 540,
): string {
  const scale     = svgWidth / settings.sheetWidth;
  const svgHeight = Math.round(settings.sheetHeight * scale);

  const elements: string[] = [];

  // Sheet background (waste area)
  elements.push(
    `<rect x="0" y="0" width="${svgWidth}" height="${svgHeight}" ` +
    `fill="#CCCCCC" stroke="#888888" stroke-width="1"/>`,
  );

  for (const p of sheet.placements) {
    const ci   = colorMap.get(p.cabinetId) ?? 0;
    const fill = CABINET_COLORS[ci];
    const dark = CABINET_DARK[ci];

    const x = Math.round(p.x * scale);
    const y = Math.round(p.y * scale);
    const w = Math.max(1, Math.round(p.width  * scale));
    const h = Math.max(1, Math.round(p.height * scale));

    elements.push(
      `<rect x="${x}" y="${y}" width="${w}" height="${h}" ` +
      `fill="${fill}" stroke="${dark}" stroke-width="1.5"/>`,
    );

    const minSide = Math.min(w, h);
    const cx      = x + w / 2;
    const cy      = y + h / 2;
    const clipId  = `cl-${p.partId.replace(/[^a-zA-Z0-9]/g, '')}-${p.instanceIndex}`;

    if (minSide >= 45) {
      // Full label: name + raw mm dimensions
      const rawW   = p.rotated ? p.height : p.width;  // original part dim
      const rawH   = p.rotated ? p.width  : p.height;
      const dims   = `${Math.round(rawW)}×${Math.round(rawH)} mm`;
      const rotMark = p.rotated ? ' ↻' : '';
      const name   = esc(p.name);
      elements.push(
        `<clipPath id="${clipId}">` +
          `<rect x="${x + 2}" y="${y + 2}" width="${w - 4}" height="${h - 4}"/>` +
        `</clipPath>` +
        `<g clip-path="url(#${clipId})" font-family="Arial,sans-serif" fill="${dark}" text-anchor="middle">` +
          `<text x="${cx}" y="${cy - 7}" font-size="9" font-weight="bold">${name}${rotMark}</text>` +
          `<text x="${cx}" y="${cy + 6}" font-size="8">${dims}</text>` +
        `</g>`,
      );
    } else if (minSide >= 20) {
      // Minimal label: shortened name only
      const label = esc(p.name.length > 14 ? p.name.slice(0, 12) + '…' : p.name);
      elements.push(
        `<clipPath id="${clipId}">` +
          `<rect x="${x + 1}" y="${y + 1}" width="${w - 2}" height="${h - 2}"/>` +
        `</clipPath>` +
        `<text x="${cx}" y="${cy + 4}" font-family="Arial,sans-serif" font-size="8" ` +
        `font-weight="bold" fill="${dark}" text-anchor="middle" clip-path="url(#${clipId})">${label}</text>`,
      );
    }
  }

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" ` +
    `width="${svgWidth}" height="${svgHeight}" ` +
    `viewBox="0 0 ${svgWidth} ${svgHeight}" ` +
    `style="display:block;max-width:100%;">` +
    `<defs></defs>` +
    elements.join('') +
    `</svg>`
  );
}

// =============================================================================
// CSS — print-friendly stylesheet embedded in the HTML document
// =============================================================================

const PAGE_CSS = `
  @page { size: letter; margin: 0.75in; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 10pt;
    color: #212121;
  }

  /* ── Typography ─────────────────────────────────────────────────────────── */
  h1 { font-size: 22pt; color: #1565C0; margin-bottom: 4px; }
  h2 {
    font-size: 13pt; color: #1565C0;
    margin: 16px 0 6px;
    border-bottom: 1.5px solid #1565C0;
    padding-bottom: 4px;
  }
  h3 { font-size: 11pt; color: #2E7D32; margin: 14px 0 4px; }

  /* ── Page breaks ────────────────────────────────────────────────────────── */
  .page-break { page-break-before: always; }

  /* ── Cover page ─────────────────────────────────────────────────────────── */
  .cover-subtitle { font-size: 12pt; color: #757575; margin-top: 3px; }

  .summary-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin: 16px 0;
  }
  .summary-card {
    background: #F5F5F5;
    border-radius: 6px;
    padding: 10px 14px;
    border-left: 4px solid #1565C0;
  }
  .summary-card .value { font-size: 20pt; font-weight: bold; color: #1565C0; line-height: 1.1; }
  .summary-card .label { font-size: 8pt; color: #757575; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px; }

  /* ── Material summary table (cover) ─────────────────────────────────────── */
  .material-summary { width: 100%; border-collapse: collapse; margin: 10px 0; }
  .material-summary th {
    background: #1565C0; color: white;
    text-align: left; padding: 6px 10px; font-size: 9pt;
  }
  .material-summary td { padding: 5px 10px; border-bottom: 1px solid #E0E0E0; font-size: 9pt; }
  .material-summary tr:nth-child(even) td { background: #F5F5F5; }

  /* ── Cut list table ──────────────────────────────────────────────────────── */
  .cut-list-table { width: 100%; border-collapse: collapse; margin: 8px 0; }
  .cut-list-table th {
    background: #2E7D32; color: white;
    text-align: left; padding: 6px 8px; font-size: 8.5pt;
  }
  .cut-list-table td {
    padding: 5px 8px; border-bottom: 1px solid #E0E0E0;
    font-size: 8.5pt; vertical-align: middle;
  }
  .cut-list-table tr:nth-child(even) td { background: #F9F9F9; }
  .cut-list-table .dim { font-variant-numeric: tabular-nums; white-space: nowrap; }

  /* ── Grain direction badges ──────────────────────────────────────────────── */
  .grain-badge {
    display: inline-block; padding: 1px 6px;
    border-radius: 3px; font-size: 7.5pt; font-weight: bold;
  }
  .grain-v { background: #BBDEFB; color: #1565C0; }
  .grain-h { background: #C8E6C9; color: #2E7D32; }
  .grain-e { background: #FFE0B2; color: #E65100; }

  /* ── Cutting diagram section ─────────────────────────────────────────────── */
  .sheet-card { margin-bottom: 24px; }
  .sheet-header {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 6px;
  }
  .sheet-title { font-size: 10pt; font-weight: bold; color: #212121; }

  .util-badge {
    padding: 2px 8px; border-radius: 10px;
    font-size: 8pt; font-weight: bold;
  }
  .util-good { background: #C8E6C9; color: #2E7D32; }
  .util-ok   { background: #FFF9C4; color: #F57F17; }
  .util-low  { background: #FFCDD2; color: #C62828; }

  /* ── Parts legend under each diagram ────────────────────────────────────── */
  .part-legend { width: 100%; border-collapse: collapse; margin-top: 6px; }
  .part-legend td {
    padding: 3px 8px; font-size: 8pt;
    border-bottom: 1px solid #F0F0F0; vertical-align: middle;
  }
  .swatch {
    width: 10px; height: 10px; border-radius: 2px;
    display: inline-block; vertical-align: middle; margin-right: 4px;
  }

  /* ── Footer ──────────────────────────────────────────────────────────────── */
  .footer {
    margin-top: 28px; border-top: 1px solid #E0E0E0;
    padding-top: 8px; font-size: 8pt; color: #9E9E9E;
  }
`;

// =============================================================================
// HTML SECTIONS
// =============================================================================

function renderCoverPage(opts: {
  projectName: string;
  projectDate: string;
  units: MeasurementUnit;
  cabinetCount: number;
  drawerCount: number;
  totalPieces: number;
  totalSheets: number;
  avgUtilization: number;
  settings: OptimizationSettings;
  partsByMaterial: Map<string, Part[]>;
  optimizationResults: Map<string, OptimizationResult>;
}): string {
  const {
    projectName, projectDate, units,
    cabinetCount, drawerCount, totalPieces, totalSheets,
    avgUtilization, settings, partsByMaterial, optimizationResults,
  } = opts;

  const matRows = Array.from(partsByMaterial.entries())
    .map(([mat, parts]) => {
      const pcs    = parts.reduce((s, p) => s + p.quantity, 0);
      const result = optimizationResults.get(mat);
      const sheets = result?.totalSheetsUsed ?? 0;
      const util   = result && result.sheets.length > 0
        ? (result.sheets.reduce((s, sh) => s + sh.utilizationPercent, 0) / result.sheets.length).toFixed(1)
        : '—';
      return (
        `<tr>` +
        `<td>${esc(mat)}</td>` +
        `<td style="text-align:center">${pcs}</td>` +
        `<td style="text-align:center">${sheets}</td>` +
        `<td style="text-align:center">${util}%</td>` +
        `</tr>`
      );
    })
    .join('');

  const drawerNote = drawerCount > 0
    ? ` &nbsp;·&nbsp; ${drawerCount} ${drawerCount === 1 ? 'drawer' : 'drawers'}`
    : '';

  return `
<div style="margin-bottom:20px">
  <h1>${esc(projectName)}</h1>
  <p class="cover-subtitle">Cabinet Cut List &amp; Cutting Plan &nbsp;·&nbsp; ${esc(projectDate)}</p>
</div>

<div class="summary-grid">
  <div class="summary-card">
    <div class="value">${cabinetCount}</div>
    <div class="label">${cabinetCount === 1 ? 'Cabinet' : 'Cabinets'}${drawerNote}</div>
  </div>
  <div class="summary-card">
    <div class="value">${totalPieces}</div>
    <div class="label">Total Pieces</div>
  </div>
  <div class="summary-card">
    <div class="value">${totalSheets}</div>
    <div class="label">${totalSheets === 1 ? 'Sheet' : 'Sheets'} Needed</div>
  </div>
</div>

<h2>Material Summary</h2>
<table class="material-summary">
  <thead>
    <tr>
      <th>Material</th>
      <th style="text-align:center">Pieces</th>
      <th style="text-align:center">Sheets</th>
      <th style="text-align:center">Avg Utilization</th>
    </tr>
  </thead>
  <tbody>${matRows}</tbody>
</table>

<p style="font-size:8pt;color:#9E9E9E;margin-top:10px;">
  Sheet: ${fmtDim(settings.sheetWidth, units)} × ${fmtDim(settings.sheetHeight, units)}
  &nbsp;·&nbsp; Kerf: ${fmtDim(settings.sawKerf, units)}
  &nbsp;·&nbsp; Avg utilization: ${avgUtilization.toFixed(1)}%
</p>`;
}

function renderCutList(
  partsByMaterial: Map<string, Part[]>,
  units: MeasurementUnit,
): string {
  const sections = Array.from(partsByMaterial.entries())
    .map(([mat, parts]) => {
      const rows = parts
        .map(p => {
          const notesHtml = p.notes ? `<br/><span style="font-size:7.5pt;color:#9E9E9E;font-style:italic">${esc(p.notes)}</span>` : '';
          return (
            `<tr>` +
            `<td>${esc(p.name)}${notesHtml}</td>` +
            `<td style="text-align:center">${p.quantity}</td>` +
            `<td class="dim">${fmtDim(p.width, units)}</td>` +
            `<td class="dim">${fmtDim(p.height, units)}</td>` +
            `<td class="dim">${fmtDim(p.thickness, units)}</td>` +
            `<td>${grainBadge(p.grainDirection)}</td>` +
            `</tr>`
          );
        })
        .join('');

      const totalPcs = parts.reduce((s, p) => s + p.quantity, 0);
      return `
<h3>${esc(mat)} <span style="font-weight:normal;font-size:9pt;color:#757575">(${totalPcs} ${totalPcs === 1 ? 'piece' : 'pieces'})</span></h3>
<table class="cut-list-table">
  <thead>
    <tr>
      <th>Part Name &amp; Notes</th>
      <th style="text-align:center">Qty</th>
      <th>Width</th>
      <th>Height</th>
      <th>Thickness</th>
      <th>Grain</th>
    </tr>
  </thead>
  <tbody>${rows}</tbody>
</table>`;
    })
    .join('');

  return sections;
}

function renderDiagramPages(
  optimizationResults: Map<string, OptimizationResult>,
  settings: OptimizationSettings,
  colorMap: Map<string, number>,
): string {
  const sections = Array.from(optimizationResults.entries())
    .map(([mat, result]) => {
      const sheetCards = result.sheets
        .map(sheet => {
          const svg      = sheetToSvg(sheet, settings, colorMap);
          const pct      = sheet.utilizationPercent;
          const utilCls  = pct >= 70 ? 'util-good' : pct >= 50 ? 'util-ok' : 'util-low';

          const legendRows = sheet.placements
            .map(p => {
              const ci    = colorMap.get(p.cabinetId) ?? 0;
              const color = CABINET_COLORS[ci];
              const rotNote = p.rotated ? ' <em>(rotated ↻)</em>' : '';
              const rawW  = p.rotated ? p.height : p.width;
              const rawH  = p.rotated ? p.width  : p.height;
              return (
                `<tr>` +
                `<td style="width:20px"><span class="swatch" style="background:${color}"></span></td>` +
                `<td>${esc(p.name)}${rotNote}</td>` +
                `<td style="font-variant-numeric:tabular-nums;white-space:nowrap">` +
                `${Math.round(rawW)} × ${Math.round(rawH)} mm</td>` +
                `</tr>`
              );
            })
            .join('');

          return `
<div class="sheet-card">
  <div class="sheet-header">
    <span class="sheet-title">Sheet ${sheet.sheetIndex + 1} of ${result.totalSheetsUsed}</span>
    <span class="util-badge ${utilCls}">${pct.toFixed(1)}% utilized</span>
  </div>
  ${svg}
  ${legendRows ? `<table class="part-legend"><tbody>${legendRows}</tbody></table>` : ''}
</div>`;
        })
        .join('');

      const unplacedNote = result.unplacedParts.length > 0
        ? `<p style="color:#C62828;font-size:9pt;margin-top:8px">` +
          `⚠ Oversized parts (exceeds sheet dimensions): ${result.unplacedParts.map(esc).join(', ')}` +
          `</p>`
        : '';

      return `
<h2>${esc(mat)} — Cutting Diagrams</h2>
<p style="font-size:8.5pt;color:#616161;margin-bottom:12px">
  ${result.totalSheetsUsed} ${result.totalSheetsUsed === 1 ? 'sheet' : 'sheets'} required
  &nbsp;·&nbsp; ${result.overallUtilizationPercent.toFixed(1)}% average utilization
</p>
${sheetCards}
${unplacedNote}`;
    })
    .join('<div class="page-break"></div>');

  return sections;
}

// =============================================================================
// PUBLIC API
// =============================================================================

/** All inputs needed to generate the PDF. */
export interface PdfExportOptions {
  /** Project name shown on the cover page. */
  projectName: string;
  /** Display units used throughout the document. */
  units: MeasurementUnit;
  /** Number of cabinets in the project. */
  cabinetCount: number;
  /** Number of drawers in the project. */
  drawerCount: number;
  /** All parts from all cabinets and drawers. */
  allParts: Part[];
  /**
   * Optimization results keyed by material name.
   * One entry per material type (e.g. '3/4" Plywood', '1/4" Plywood').
   */
  optimizationResults: Map<string, OptimizationResult>;
  /** Sheet settings used for the optimization (size + kerf). */
  settings: OptimizationSettings;
}

/**
 * Generates the full HTML string for the PDF.
 * Exported separately so it can be tested without a device.
 */
export function generatePdfHtml(opts: PdfExportOptions): string {
  const {
    projectName, units, cabinetCount, drawerCount,
    allParts, optimizationResults, settings,
  } = opts;

  // ── Pre-compute aggregates ─────────────────────────────────────────────────

  const partsByMaterial = new Map<string, Part[]>();
  for (const p of allParts) {
    const list = partsByMaterial.get(p.material);
    if (list) list.push(p);
    else partsByMaterial.set(p.material, [p]);
  }

  const totalPieces = allParts.reduce((s, p) => s + p.quantity, 0);

  let totalSheets = 0;
  let sumUtilPct  = 0;
  let sheetCount  = 0;
  for (const result of optimizationResults.values()) {
    totalSheets += result.totalSheetsUsed;
    for (const sheet of result.sheets) {
      sumUtilPct += sheet.utilizationPercent;
      sheetCount++;
    }
  }
  const avgUtilization = sheetCount > 0 ? sumUtilPct / sheetCount : 0;

  // ── Build colour map across all sheets ────────────────────────────────────
  const allSheets: SheetLayout[] = [];
  for (const result of optimizationResults.values()) {
    allSheets.push(...result.sheets);
  }
  const colorMap = buildColorMap(allSheets);

  // ── Date string ─────────────────────────────────────────────────────────────
  const projectDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  // ── Build HTML sections ────────────────────────────────────────────────────

  const coverHtml    = renderCoverPage({
    projectName, projectDate, units,
    cabinetCount, drawerCount, totalPieces, totalSheets,
    avgUtilization, settings, partsByMaterial, optimizationResults,
  });

  const cutListHtml  = renderCutList(partsByMaterial, units);

  const diagramHtml  = renderDiagramPages(optimizationResults, settings, colorMap);

  const footerHtml   =
    `<div class="footer">` +
    `Generated by KnippaCab &nbsp;·&nbsp; ${esc(projectDate)}` +
    ` &nbsp;·&nbsp; Units: ${units === 'imperial' ? 'Imperial (fractional inches)' : 'Metric (mm)'}` +
    `</div>`;

  // ── Assemble full document ─────────────────────────────────────────────────
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>${esc(projectName)} — KnippaCab Cut List</title>
  <style>${PAGE_CSS}</style>
</head>
<body>

${coverHtml}

<div class="page-break"></div>

<h2>Cut List</h2>
${cutListHtml}

<div class="page-break"></div>

${diagramHtml}

${footerHtml}

</body>
</html>`;
}

/**
 * Generates a PDF and presents it to the user via the platform's native
 * print/export system.
 *
 * - Web:     opens browser print dialog (Save as PDF available)
 * - iOS:     opens AirPrint / Save to Files sheet
 * - Android: opens system print manager
 *
 * @throws if expo-print encounters an error (e.g. user cancels on iOS)
 */
export async function exportToPdf(opts: PdfExportOptions): Promise<void> {
  const html = generatePdfHtml(opts);
  await Print.printAsync({ html });
}
