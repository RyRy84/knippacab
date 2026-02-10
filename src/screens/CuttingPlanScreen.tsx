/**
 * CuttingPlanScreen.tsx — Cut List Grouped by Material
 *
 * Phase 3, Milestone 3.5 — the final screen before the sheet optimizer.
 *
 * This screen:
 *   1. Reads all cabinets from projectStore
 *   2. Calls calculateCabinetParts() for each cabinet
 *   3. Collects all resulting Parts into one flat array
 *   4. Groups them by material (e.g., '3/4" Plywood', '1/4" Plywood')
 *   5. Renders material section headers + part cards with grain direction indicators
 *   6. Shows a summary bar (total cabinets, total parts)
 *   7. Provides an Export placeholder button and a link to the visual diagram
 *
 * STYLING: Follows ReviewEditScreen card-based patterns (same colors, shadows,
 * border radii, footer layout). The section headers use a light tinted background
 * to visually separate material groups without adding heavy chrome.
 *
 * ZUSTAND NOTE: All store reads use the single-value selector pattern.
 * See CLAUDE.md "Known Web Gotchas" — object-literal selectors crash on web.
 */

import React, { useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useProjectStore } from '../store/projectStore';
import { Part, MeasurementUnit, GrainDirection } from '../types';
import { calculateCabinetParts } from '../utils/cabinetCalculator';
import { calculateDrawerParts } from '../utils/drawerCalculator';
import { formatForDisplay } from '../utils/unitConversion';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CuttingPlan'>;
};

// =============================================================================
// GRAIN DIRECTION DISPLAY HELPERS
// =============================================================================

/**
 * Arrow characters that visualise grain direction at a glance.
 * ↑ = vertical (grain runs up/down, like tree rings on a standing trunk)
 * → = horizontal (grain runs left/right, like a board lying flat)
 * ↕ = either direction (no constraint — optimiser can rotate freely)
 */
const GRAIN_ARROWS: Record<GrainDirection, string> = {
  vertical:   '↑',
  horizontal: '→',
  either:     '↕',
};

const GRAIN_LABELS: Record<GrainDirection, string> = {
  vertical:   'Vertical',
  horizontal: 'Horiz.',
  either:     'Either',
};

/** Distinct tint colours so each grain direction is instantly recognisable. */
const GRAIN_COLORS: Record<GrainDirection, string> = {
  vertical:   '#1565C0',  // blue  — matches the project header
  horizontal: '#2E7D32',  // green — matches the Generate button
  either:     '#E65100',  // orange
};

// =============================================================================
// SUB-COMPONENT: Part Card
// =============================================================================

/**
 * PartCard — one row in the cut list.
 *
 * Left side:  human-readable name, W×H dimensions, optional notes
 * Right side: grain direction badge (coloured arrow + label), quantity if >1
 */
function PartCard({ part, units }: { part: Part; units: MeasurementUnit }) {
  const fmt = (mm: number) => formatForDisplay(mm, units);
  const grainColor = GRAIN_COLORS[part.grainDirection];

  return (
    <View style={styles.partCard}>

      {/* ── Left: name + dimensions + notes ──────────────────────────── */}
      <View style={styles.partCardLeft}>
        <Text style={styles.partName}>{part.name}</Text>
        <Text style={styles.partDims}>
          {fmt(part.width)}&nbsp;W&nbsp;×&nbsp;{fmt(part.height)}&nbsp;H
        </Text>
        {part.notes ? (
          <Text style={styles.partNotes}>{part.notes}</Text>
        ) : null}
      </View>

      {/* ── Right: grain badge + quantity ────────────────────────────── */}
      <View style={styles.partCardRight}>
        <View style={[styles.grainBadge, { borderColor: grainColor }]}>
          <Text style={[styles.grainArrow, { color: grainColor }]}>
            {GRAIN_ARROWS[part.grainDirection]}
          </Text>
          <Text style={[styles.grainLabel, { color: grainColor }]}>
            {GRAIN_LABELS[part.grainDirection]}
          </Text>
        </View>
        {part.quantity > 1 && (
          <Text style={styles.partQty}>× {part.quantity}</Text>
        )}
      </View>

    </View>
  );
}

// =============================================================================
// SUB-COMPONENT: Material Section
// =============================================================================

/**
 * MaterialSection — groups all parts that come from the same sheet material.
 *
 * Example: all 3/4" Plywood parts (sides, tops, bottoms, toe kicks) appear
 * under one '3/4" Plywood' header before the 1/4" Plywood back panels.
 *
 * The `totalParts` badge counts individual pieces (quantity-aware), so two
 * side panels with quantity=1 each count as 2 parts.
 */
function MaterialSection({
  material,
  parts,
  units,
}: {
  material: string;
  parts: Part[];
  units: MeasurementUnit;
}) {
  // Sum quantities so the badge shows actual piece count, not line count.
  const totalPieces = parts.reduce((sum, p) => sum + p.quantity, 0);

  return (
    <View style={styles.materialSection}>

      {/* ── Section header ──────────────────────────────────────────── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{material}</Text>
        <View style={styles.sectionBadge}>
          <Text style={styles.sectionBadgeText}>
            {totalPieces} {totalPieces === 1 ? 'pc' : 'pcs'}
          </Text>
        </View>
      </View>

      {/* ── Part cards ──────────────────────────────────────────────── */}
      {parts.map(part => (
        <PartCard key={part.id} part={part} units={units} />
      ))}

    </View>
  );
}

// =============================================================================
// SCREEN
// =============================================================================

export default function CuttingPlanScreen({ navigation }: Props) {

  // Single-value selectors — NEVER use an object-literal selector on web.
  // See CLAUDE.md "Known Web Gotchas" for the reason.
  const currentProject = useProjectStore(s => s.currentProject);
  const cabinets       = useProjectStore(s => s.cabinets);
  const drawers        = useProjectStore(s => s.drawers);

  const units: MeasurementUnit = currentProject?.units ?? 'imperial';

  // ── Collect all parts from all cabinets + drawers ──────────────────────
  // useMemo so we don't recalculate on every render.
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

  // ── Group parts by material ────────────────────────────────────────────
  // Map preserves insertion order, so groups appear in the order we first
  // encounter each material (3/4" plywood typically before 1/4" plywood).
  const partsByMaterial = useMemo(() => {
    const groups = new Map<string, Part[]>();
    for (const part of allParts) {
      const existing = groups.get(part.material);
      if (existing) {
        existing.push(part);
      } else {
        groups.set(part.material, [part]);
      }
    }
    return groups;
  }, [allParts]);

  // ── Summary counts ─────────────────────────────────────────────────────
  const totalPieces = useMemo(
    () => allParts.reduce((sum, p) => sum + p.quantity, 0),
    [allParts]
  );

  // ── Handlers ───────────────────────────────────────────────────────────
  function handleExport() {
    Alert.alert(
      'Export Coming Soon',
      'PDF and CSV export will be available in a future update. Your cut list data is ready — this button will wire up to the exporter once it is built.',
      [{ text: 'OK' }]
    );
  }

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <View style={styles.screen}>

      {/* ── Summary header ────────────────────────────────────────────────── */}
      <View style={styles.summaryHeader}>
        <Text style={styles.summaryProjectName} numberOfLines={1}>
          {currentProject?.name ?? 'Cut List'}
        </Text>
        <Text style={styles.summaryStats}>
          {cabinets.length} {cabinets.length === 1 ? 'cabinet' : 'cabinets'}
          {drawers.length > 0 ? `  ·  ${drawers.length} ${drawers.length === 1 ? 'drawer' : 'drawers'}` : ''}
          {'  ·  '}
          {totalPieces} {totalPieces === 1 ? 'piece' : 'pieces'} total
        </Text>
      </View>

      {/* ── Parts list ────────────────────────────────────────────────────── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        {allParts.length === 0 ? (

          /* Empty state — no cabinets in this project yet */
          <View style={styles.emptyState}>
            <View style={styles.emptyIconBox}>
              <Text style={styles.emptyIconText}>[  ]</Text>
            </View>
            <Text style={styles.emptyTitle}>No parts to show</Text>
            <Text style={styles.emptySubtitle}>
              Add cabinets to your project on the previous screen, then come back here to see the cut list.
            </Text>
          </View>

        ) : (

          /* One MaterialSection per unique material */
          Array.from(partsByMaterial.entries()).map(([material, parts]) => (
            <MaterialSection
              key={material}
              material={material}
              parts={parts}
              units={units}
            />
          ))

        )}
      </ScrollView>

      {/* ── Footer action buttons ─────────────────────────────────────────── */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.diagramBtn}
          onPress={() => navigation.navigate('VisualDiagram')}
        >
          <Text style={styles.diagramBtnText}>View Cutting Diagram</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.exportBtn} onPress={handleExport}>
          <Text style={styles.exportBtnText}>Export PDF</Text>
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

  // ── Summary header (green — distinct from the blue project header) ──────
  summaryHeader: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  summaryProjectName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  summaryStats: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.80)',
    marginTop: 3,
  },

  // ── Scroll area ─────────────────────────────────────────────────────────
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },

  // ── Empty state ─────────────────────────────────────────────────────────
  emptyState: {
    alignItems: 'center',
    paddingVertical: 56,
    paddingHorizontal: 32,
  },
  emptyIconBox: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  emptyIconText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2E7D32',
    letterSpacing: 1,
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
  },

  // ── Material section ────────────────────────────────────────────────────
  materialSection: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginBottom: 6,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#1B5E20',
    letterSpacing: 0.2,
  },
  sectionBadge: {
    backgroundColor: '#2E7D32',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  sectionBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // ── Part card ───────────────────────────────────────────────────────────
  partCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 2,
  },
  partCardLeft: {
    flex: 1,
    marginRight: 10,
  },
  partName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 2,
  },
  partDims: {
    fontSize: 13,
    color: '#616161',
    fontVariant: ['tabular-nums'],
  },
  partNotes: {
    fontSize: 11,
    color: '#9E9E9E',
    marginTop: 3,
    fontStyle: 'italic',
  },
  partCardRight: {
    alignItems: 'center',
    gap: 4,
  },
  grainBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    gap: 3,
  },
  grainArrow: {
    fontSize: 14,
    fontWeight: '700',
  },
  grainLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  partQty: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9E9E9E',
  },

  // ── Footer ──────────────────────────────────────────────────────────────
  footer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    padding: 16,
    gap: 10,
  },
  diagramBtn: {
    backgroundColor: '#1565C0',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  diagramBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  exportBtn: {
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2E7D32',
  },
  exportBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2E7D32',
  },
});
