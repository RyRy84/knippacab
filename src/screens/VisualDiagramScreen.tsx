/**
 * VisualDiagramScreen.tsx — Sheet Goods Cutting Diagram
 *
 * The payoff screen of Phase 4. Shows a visual cutting diagram for every sheet
 * of material needed for the current project.
 *
 * ── DATA FLOW ─────────────────────────────────────────────────────────────────
 *   projectStore (cabinets, drawers)
 *     → calculateCabinetParts() + calculateDrawerParts()   (all parts)
 *     → group by part.material                             (per-sheet-type)
 *     → optimizeSheetCutting()                             (Guillotine BSSF)
 *     → CuttingDiagram SVG per SheetLayout                 (rendered here)
 *
 * ── SETTINGS ──────────────────────────────────────────────────────────────────
 *   Sheet width/height and saw kerf are shown in a collapsible panel.
 *   Editing any setting re-runs the optimizer immediately (no explicit button).
 *   Values are stored in component state and NOT persisted — they reset on
 *   navigation away (persist via SQLite settings is a V2 task).
 *
 * ── MULTI-MATERIAL ────────────────────────────────────────────────────────────
 *   When a project has parts from >1 material (e.g. 3/4" and 1/4" plywood)
 *   a row of tab buttons appears.  Each material runs its own optimizer pass
 *   (you can't cut 1/4" and 3/4" ply from the same physical sheet).
 *
 * ── WEB GOTCHAS ───────────────────────────────────────────────────────────────
 *   Single-value Zustand selectors throughout — see CLAUDE.md Known Web Gotchas.
 *   onLayout used to measure container width before rendering SVG.
 */

import React, { useMemo, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, LayoutChangeEvent, ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useProjectStore } from '../store/projectStore';
import { calculateCabinetParts } from '../utils/cabinetCalculator';
import { calculateDrawerParts } from '../utils/drawerCalculator';
import { optimizeSheetCutting } from '../utils/optimizer/binPacking';
import {
  OptimizationSettings,
  OptimizationResult,
  DEFAULT_SHEET_SETTINGS,
} from '../utils/optimizer/types';
import { Part, MeasurementUnit } from '../types';
import { formatForDisplay } from '../utils/unitConversion';
import CuttingDiagram from '../components/CuttingDiagram';
import MeasurementInput from '../components/MeasurementInput';
import { exportToPdf } from '../utils/pdfGenerator';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'VisualDiagram'>;
};

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Format a percentage for the utilization display.
 * e.g. 73.56 → "73.6%"
 */
function fmtPct(pct: number): string {
  return `${pct.toFixed(1)}%`;
}

/**
 * Shorten a long material name for the tab button.
 * e.g. '3/4" Baltic Birch Plywood' → '3/4" Baltic...'
 */
function shortMaterial(mat: string): string {
  return mat.length > 18 ? mat.slice(0, 16) + '…' : mat;
}

// =============================================================================
// SCREEN
// =============================================================================

export default function VisualDiagramScreen({ navigation }: Props) {

  // ── Store — single-value selectors (web safety) ───────────────────────
  const currentProject = useProjectStore(s => s.currentProject);
  const cabinets       = useProjectStore(s => s.cabinets);
  const drawers        = useProjectStore(s => s.drawers);

  const units: MeasurementUnit = currentProject?.units ?? 'imperial';

  // ── Optimizer settings state ──────────────────────────────────────────
  const [sheetWidth,  setSheetWidth]  = useState<number | null>(DEFAULT_SHEET_SETTINGS.sheetWidth);
  const [sheetHeight, setSheetHeight] = useState<number | null>(DEFAULT_SHEET_SETTINGS.sheetHeight);
  const [sawKerf,     setSawKerf]     = useState<number | null>(DEFAULT_SHEET_SETTINGS.sawKerf);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // ── SVG container width — set via onLayout ────────────────────────────
  const [containerWidth, setContainerWidth] = useState(0);
  const onDiagramLayout = useCallback(
    (e: LayoutChangeEvent) => setContainerWidth(e.nativeEvent.layout.width),
    []
  );

  // ── Selected material tab ─────────────────────────────────────────────
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);

  // ── Build OptimizationSettings from state ────────────────────────────
  const settings: OptimizationSettings = useMemo(() => ({
    sheetWidth:  sheetWidth  ?? DEFAULT_SHEET_SETTINGS.sheetWidth,
    sheetHeight: sheetHeight ?? DEFAULT_SHEET_SETTINGS.sheetHeight,
    sawKerf:     sawKerf     ?? DEFAULT_SHEET_SETTINGS.sawKerf,
    trimMargin:  DEFAULT_SHEET_SETTINGS.trimMargin,
  }), [sheetWidth, sheetHeight, sawKerf]);

  // ── Collect all parts ─────────────────────────────────────────────────
  const allParts: Part[] = useMemo(() => {
    const parts: Part[] = [];
    for (const cabinet of cabinets) {
      parts.push(...calculateCabinetParts(cabinet));
    }
    for (const drawer of drawers) {
      parts.push(...calculateDrawerParts(drawer));
    }
    return parts;
  }, [cabinets, drawers]);

  // ── Group parts by material ───────────────────────────────────────────
  const materialOrder: string[] = useMemo(() => {
    const seen = new Set<string>();
    const order: string[] = [];
    for (const p of allParts) {
      if (!seen.has(p.material)) {
        seen.add(p.material);
        order.push(p.material);
      }
    }
    return order;
  }, [allParts]);

  const partsByMaterial = useMemo<Map<string, Part[]>>(() => {
    const map = new Map<string, Part[]>();
    for (const p of allParts) {
      const list = map.get(p.material);
      if (list) list.push(p);
      else map.set(p.material, [p]);
    }
    return map;
  }, [allParts]);

  // ── Run optimizer for each material ──────────────────────────────────
  // Results keyed by material string.
  const optimizationResults = useMemo<Map<string, OptimizationResult>>(() => {
    const results = new Map<string, OptimizationResult>();
    for (const [material, parts] of partsByMaterial.entries()) {
      results.set(material, optimizeSheetCutting(parts, settings));
    }
    return results;
  }, [partsByMaterial, settings]);

  // ── Resolve active material tab ───────────────────────────────────────
  const activeMaterial = selectedMaterial && materialOrder.includes(selectedMaterial)
    ? selectedMaterial
    : (materialOrder[0] ?? null);

  const activeResult = activeMaterial
    ? (optimizationResults.get(activeMaterial) ?? null)
    : null;

  // ── Overall stats across ALL materials ───────────────────────────────
  const overallStats = useMemo(() => {
    let totalSheets = 0;
    let totalParts  = 0;
    let totalUsed   = 0;
    let totalArea   = 0;
    for (const result of optimizationResults.values()) {
      totalSheets += result.totalSheetsUsed;
      totalParts  += result.totalPartsPlaced;
      for (const sheet of result.sheets) {
        totalUsed += sheet.usedAreaMm2;
        totalArea += sheet.totalAreaMm2;
      }
    }
    const utilization = totalArea > 0 ? (totalUsed / totalArea) * 100 : 0;
    return { totalSheets, totalParts, utilization };
  }, [optimizationResults]);

  // ── Export state ──────────────────────────────────────────────────────
  const [isExporting, setIsExporting] = useState(false);

  // ── Handlers ─────────────────────────────────────────────────────────
  async function handleExport() {
    if (!currentProject || allParts.length === 0) {
      Alert.alert('Nothing to Export', 'Add cabinets to the project first.');
      return;
    }

    setIsExporting(true);
    try {
      await exportToPdf({
        projectName: currentProject.name,
        units,
        cabinetCount: cabinets.length,
        drawerCount: drawers.length,
        allParts,
        optimizationResults,
        settings,
      });
    } catch (err) {
      // User cancelled the print dialog — not a real error worth reporting.
      if (__DEV__) console.warn('PDF export cancelled or failed:', err);
    } finally {
      setIsExporting(false);
    }
  }

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <View style={styles.screen}>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {currentProject?.name ?? 'Cutting Diagram'}
        </Text>
        <View style={styles.headerStats}>
          <View style={styles.statPill}>
            <Text style={styles.statValue}>{overallStats.totalSheets}</Text>
            <Text style={styles.statLabel}>{overallStats.totalSheets === 1 ? 'sheet' : 'sheets'}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statPill}>
            <Text style={styles.statValue}>{overallStats.totalParts}</Text>
            <Text style={styles.statLabel}>{overallStats.totalParts === 1 ? 'part' : 'parts'}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statPill}>
            <Text style={styles.statValue}>{fmtPct(overallStats.utilization)}</Text>
            <Text style={styles.statLabel}>utilization</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>

        {/* ── Settings panel ─────────────────────────────────────────────── */}
        <TouchableOpacity
          style={styles.settingsToggle}
          onPress={() => setSettingsOpen(v => !v)}
          activeOpacity={0.7}
        >
          <Text style={styles.settingsToggleText}>
            {settingsOpen ? '▲' : '▼'}  Sheet Settings
          </Text>
          <Text style={styles.settingsToggleSub}>
            {formatForDisplay(settings.sheetWidth, units)} × {formatForDisplay(settings.sheetHeight, units)}
            {' · '}
            kerf {settings.sawKerf.toFixed(2)} mm
          </Text>
        </TouchableOpacity>

        {settingsOpen && (
          <View style={styles.settingsPanel}>
            <View style={styles.settingsRow}>
              <View style={styles.settingsField}>
                <MeasurementInput
                  label="SHEET WIDTH"
                  valueInMm={sheetWidth}
                  onChangeValue={setSheetWidth}
                  units={units}
                  minMm={100}
                  hint="Default: 8' (2440mm)"
                />
              </View>
              <View style={styles.settingsField}>
                <MeasurementInput
                  label="SHEET HEIGHT"
                  valueInMm={sheetHeight}
                  onChangeValue={setSheetHeight}
                  units={units}
                  minMm={100}
                  hint="Default: 4' (1220mm)"
                />
              </View>
            </View>
            <MeasurementInput
              label="SAW KERF"
              valueInMm={sawKerf}
              onChangeValue={setSawKerf}
              units="metric"
              minMm={0}
              maxMm={10}
              hint={'Blade kerf in mm — default 3.175mm (1/8")'}
            />
          </View>
        )}

        {/* ── Empty state ────────────────────────────────────────────────── */}
        {allParts.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No parts to optimise</Text>
            <Text style={styles.emptySubtitle}>
              Add cabinets on the previous screen, then come back here to see the cutting diagram.
            </Text>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.navigate('ReviewEdit')}
            >
              <Text style={styles.backBtnText}>Add Cabinets</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Material tabs ──────────────────────────────────────────────── */}
        {materialOrder.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabsScroll}
            contentContainerStyle={styles.tabsRow}
          >
            {materialOrder.map(mat => (
              <TouchableOpacity
                key={mat}
                style={[styles.tab, mat === activeMaterial && styles.tabActive]}
                onPress={() => setSelectedMaterial(mat)}
              >
                <Text style={[styles.tabText, mat === activeMaterial && styles.tabTextActive]}>
                  {shortMaterial(mat)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* ── Active material result ─────────────────────────────────────── */}
        {activeResult && activeMaterial && (
          <View>

            {/* Material sub-header */}
            <View style={styles.materialHeader}>
              <Text style={styles.materialName}>{activeMaterial}</Text>
              <Text style={styles.materialStats}>
                {activeResult.totalSheetsUsed} {activeResult.totalSheetsUsed === 1 ? 'sheet' : 'sheets'}
                {'  ·  '}
                {fmtPct(activeResult.overallUtilizationPercent)} utilization
              </Text>
            </View>

            {/* Unplaced parts warning */}
            {activeResult.unplacedParts.length > 0 && (
              <View style={styles.warningCard}>
                <Text style={styles.warningTitle}>
                  ⚠ {activeResult.unplacedParts.length} part(s) too large for sheet
                </Text>
                {activeResult.unplacedParts.map((name, i) => (
                  <Text key={i} style={styles.warningItem}>• {name}</Text>
                ))}
              </View>
            )}

            {/* One card per sheet */}
            <View onLayout={onDiagramLayout} style={styles.diagramContainer}>
              {containerWidth > 0 && activeResult.sheets.map(sheet => (
                <View key={sheet.sheetIndex} style={styles.sheetCard}>

                  {/* Sheet header */}
                  <View style={styles.sheetHeader}>
                    <Text style={styles.sheetLabel}>
                      Sheet {sheet.sheetIndex + 1} of {activeResult.totalSheetsUsed}
                    </Text>
                    <View style={[
                      styles.utilBadge,
                      sheet.utilizationPercent >= 75 ? styles.utilBadgeGood :
                      sheet.utilizationPercent >= 50 ? styles.utilBadgeMid  :
                      styles.utilBadgeLow,
                    ]}>
                      <Text style={styles.utilBadgeText}>
                        {fmtPct(sheet.utilizationPercent)}
                      </Text>
                    </View>
                  </View>

                  {/* SVG diagram */}
                  <CuttingDiagram
                    sheet={sheet}
                    settings={settings}
                    containerWidth={containerWidth}
                    units={units}
                  />

                  {/* Per-sheet part list */}
                  <View style={styles.sheetPartList}>
                    {sheet.placements.map(p => (
                      <View key={`${p.partId}-${p.instanceIndex}`} style={styles.sheetPartRow}>
                        <View style={styles.sheetPartDot} />
                        <Text style={styles.sheetPartName}>
                          {p.name}
                          {p.grainDirection === 'either' && p.rotated ? ' (rotated)' : ''}
                        </Text>
                        <Text style={styles.sheetPartDim}>
                          {formatForDisplay(p.width, units)} × {formatForDisplay(p.height, units)}
                        </Text>
                      </View>
                    ))}
                  </View>

                </View>
              ))}
            </View>
          </View>
        )}

      </ScrollView>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.exportBtn, isExporting && styles.exportBtnDisabled]}
          onPress={handleExport}
          disabled={isExporting}
        >
          {isExporting ? (
            <ActivityIndicator size="small" color="#1565C0" />
          ) : (
            <Text style={styles.exportBtnText}>Export PDF</Text>
          )}
        </TouchableOpacity>
      </View>

    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({

  screen: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },

  // ── Header ────────────────────────────────────────────────────────────
  header: {
    backgroundColor: '#1565C0',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
  },
  statPill: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 24,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 1,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },

  // ── Scroll ────────────────────────────────────────────────────────────
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
    gap: 12,
  },

  // ── Settings toggle ───────────────────────────────────────────────────
  settingsToggle: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
  },
  settingsToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#424242',
  },
  settingsToggleSub: {
    fontSize: 12,
    color: '#9E9E9E',
  },

  // ── Settings panel ────────────────────────────────────────────────────
  settingsPanel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    gap: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
  },
  settingsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  settingsField: {
    flex: 1,
  },

  // ── Empty state ───────────────────────────────────────────────────────
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#424242',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9E9E9E',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  backBtn: {
    backgroundColor: '#1565C0',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  backBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // ── Material tabs ─────────────────────────────────────────────────────
  tabsScroll: {
    flexShrink: 0,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 4,
  },
  tab: {
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#BDBDBD',
  },
  tabActive: {
    backgroundColor: '#1565C0',
    borderColor: '#1565C0',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#616161',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },

  // ── Material header ───────────────────────────────────────────────────
  materialHeader: {
    paddingHorizontal: 2,
    marginBottom: 4,
  },
  materialName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#212121',
  },
  materialStats: {
    fontSize: 12,
    color: '#9E9E9E',
    marginTop: 2,
  },

  // ── Warning card ──────────────────────────────────────────────────────
  warningCard: {
    backgroundColor: '#FFF3E0',
    borderRadius: 10,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#E65100',
    marginBottom: 8,
  },
  warningTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#E65100',
    marginBottom: 6,
  },
  warningItem: {
    fontSize: 12,
    color: '#BF360C',
    marginTop: 2,
  },

  // ── Diagram container ─────────────────────────────────────────────────
  diagramContainer: {
    gap: 16,
  },

  // ── Sheet card ────────────────────────────────────────────────────────
  sheetCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sheetLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#424242',
  },

  // Utilization badge — colour-coded: green ≥75%, amber 50-75%, red <50%
  utilBadge: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  utilBadgeGood: { backgroundColor: '#E8F5E9' },
  utilBadgeMid:  { backgroundColor: '#FFF8E1' },
  utilBadgeLow:  { backgroundColor: '#FFEBEE' },
  utilBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#424242',
  },

  // ── Per-sheet part list ───────────────────────────────────────────────
  sheetPartList: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    gap: 6,
  },
  sheetPartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sheetPartDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#BDBDBD',
  },
  sheetPartName: {
    flex: 1,
    fontSize: 12,
    color: '#424242',
  },
  sheetPartDim: {
    fontSize: 12,
    color: '#9E9E9E',
    fontVariant: ['tabular-nums'],
  },

  // ── Footer ────────────────────────────────────────────────────────────
  footer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    padding: 16,
  },
  exportBtn: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1565C0',
  },
  exportBtnDisabled: {
    opacity: 0.5,
  },
  exportBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1565C0',
  },
});
