/**
 * CalculatorDemoScreen.tsx — Calculation Engine Demo
 *
 * Visual validation screen that runs the cabinet and drawer calculators
 * with standard sample cabinets and shows the results. Useful for
 * confirming that the calculation engine produces correct cut dimensions
 * before building the full project workflow UI.
 *
 * Three tabs:
 *   Base Cabinet — standard 36" base with toe kick
 *   Wall Cabinet — 30" wall with double doors
 *   Drawer       — standard 5-tall drawer box
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { calculateCabinetParts } from '../utils/cabinetCalculator';
import { calculateDrawerParts } from '../utils/drawerCalculator';
import { formatForDisplay } from '../utils/unitConversion';
import { Cabinet, Drawer, Part } from '../types';
import {
  BASE_CABINET_HEIGHT_MM,
  BASE_CABINET_DEPTH_MM,
  WALL_CABINET_HEIGHT_MM,
  WALL_CABINET_DEPTH_MM,
  STANDARD_TOE_KICK_HEIGHT_MM,
} from '../constants/cabinetDefaults';

// =============================================================================
// SAMPLE DATA
// =============================================================================

const SAMPLE_BASE_CABINET: Cabinet = {
  id: 'demo-base',
  projectId: 'demo',
  type: 'base',
  width: 914,                        // 36"
  height: BASE_CABINET_HEIGHT_MM,    // 34.5"
  depth: BASE_CABINET_DEPTH_MM,      // 24"
  toeKickOption: 'standard',
  toeKickHeight: STANDARD_TOE_KICK_HEIGHT_MM,
  joineryMethod: 'pocket_hole',
};

const SAMPLE_WALL_CABINET: Cabinet = {
  id: 'demo-wall',
  projectId: 'demo',
  type: 'wall',
  width: 762,                        // 30"
  height: WALL_CABINET_HEIGHT_MM,    // 30"
  depth: WALL_CABINET_DEPTH_MM,      // 12"
  toeKickOption: 'none',
  toeKickHeight: 0,
  joineryMethod: 'pocket_hole',
};

const SAMPLE_DRAWER: Drawer = {
  id: 'demo-drawer',
  cabinetId: 'demo-base',
  width: 559,     // 22" — typical inner box width after slide clearances
  height: 127,    // 5"  — standard utility drawer height
  depth: 508,     // 20" — typical box depth
  cornerJoinery: 'pocket_hole',
  bottomMethod: 'applied',
  frontMaterial: '1/2" Plywood',
};

// =============================================================================
// TYPES
// =============================================================================

type TabId = 'base' | 'wall' | 'drawer';

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

/**
 * Small inline badge showing the grain direction with a directional arrow.
 * Colors match a simple traffic-light convention:
 *   Blue   = fixed vertical (must not rotate)
 *   Green  = fixed horizontal (must not rotate)
 *   Orange = either direction (optimizer can rotate freely)
 */
function GrainBadge({ grain }: { grain: Part['grainDirection'] }) {
  const arrow = grain === 'vertical' ? '↕' : grain === 'horizontal' ? '↔' : '↻';
  const color = grain === 'vertical' ? '#1565C0' : grain === 'horizontal' ? '#2E7D32' : '#E65100';
  return (
    <Text style={[styles.grainBadge, { color }]}>
      {arrow} {grain}
    </Text>
  );
}

/**
 * A single row in the parts list.
 * Shows: name / material / notes on the left, width × height / thickness / grain on the right.
 */
function PartRow({ part }: { part: Part }) {
  const fmt = (mm: number) => formatForDisplay(mm, 'imperial');
  return (
    <View style={styles.partRow}>
      <View style={styles.partLeft}>
        <Text style={styles.partName}>{part.name}</Text>
        <Text style={styles.partMaterial}>{part.material}</Text>
        {part.notes !== '' && (
          <Text style={styles.partNotes} numberOfLines={2}>{part.notes}</Text>
        )}
      </View>
      <View style={styles.partRight}>
        <Text style={styles.partDims}>{fmt(part.width)} × {fmt(part.height)}</Text>
        <Text style={styles.partThickness}>t: {fmt(part.thickness)}</Text>
        <GrainBadge grain={part.grainDirection} />
      </View>
    </View>
  );
}

// =============================================================================
// MAIN SCREEN
// =============================================================================

export default function CalculatorDemoScreen() {
  const [activeTab, setActiveTab] = useState<TabId>('base');

  // Run calculators once; useMemo prevents re-calculating on every render.
  // Doors and drawer faces are now included directly in the parts arrays.
  const baseParts   = useMemo(() => calculateCabinetParts(SAMPLE_BASE_CABINET), []);
  const wallParts   = useMemo(() => calculateCabinetParts(SAMPLE_WALL_CABINET), []);
  const drawerParts = useMemo(() => calculateDrawerParts(SAMPLE_DRAWER), []);

  const fmt = (mm: number) => formatForDisplay(mm, 'imperial');

  const tabs: { id: TabId; label: string }[] = [
    { id: 'base',   label: 'Base 36"' },
    { id: 'wall',   label: 'Wall 30"' },
    { id: 'drawer', label: 'Drawer' },
  ];

  return (
    <View style={styles.screen}>

      {/* ── Tab bar ──────────────────────────────────────────────────────── */}
      <View style={styles.tabBar}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.activeTab]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>

        {/* ──── BASE CABINET TAB ─────────────────────────────────────────── */}
        {activeTab === 'base' && (
          <>
            <View style={styles.configCard}>
              <Text style={styles.configTitle}>Base Cabinet — 36" × 34.5" × 24"</Text>
              <Text style={styles.configDetail}>Pocket Hole Joinery  |  Standard 4" Toe Kick</Text>
            </View>

            <Text style={styles.sectionHeader}>PARTS ({baseParts.length} pieces — doors included)</Text>
            {baseParts.map(p => <PartRow key={p.id} part={p} />)}
          </>
        )}

        {/* ──── WALL CABINET TAB ─────────────────────────────────────────── */}
        {activeTab === 'wall' && (
          <>
            <View style={styles.configCard}>
              <Text style={styles.configTitle}>Wall Cabinet — 30" × 30" × 12"</Text>
              <Text style={styles.configDetail}>Pocket Hole Joinery  |  No Toe Kick</Text>
            </View>

            <Text style={styles.sectionHeader}>PARTS ({wallParts.length} pieces — doors included)</Text>
            {wallParts.map(p => <PartRow key={p.id} part={p} />)}
          </>
        )}

        {/* ──── DRAWER TAB ───────────────────────────────────────────────── */}
        {activeTab === 'drawer' && (
          <>
            <View style={styles.configCard}>
              <Text style={styles.configTitle}>Drawer Box — 22" × 5" × 20"</Text>
              <Text style={styles.configDetail}>Pocket Hole Corners  |  Applied Bottom</Text>
              <Text style={styles.configNote}>
                Internal box dimensions (after slide clearances applied in UI)
              </Text>
            </View>

            <Text style={styles.sectionHeader}>PARTS ({drawerParts.length} pieces — face included)</Text>
            {drawerParts.map(p => <PartRow key={p.id} part={p} />)}
          </>
        )}

      </ScrollView>
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

  // Tab bar
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#1565C0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#FFFFFF',
    backgroundColor: '#1976D2',
  },
  tabText: {
    color: 'rgba(255,255,255,0.65)',
    fontWeight: '600',
    fontSize: 14,
  },
  activeTabText: {
    color: '#FFFFFF',
  },

  // Scroll
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 48,
  },

  // Config card (blue accent)
  configCard: {
    backgroundColor: '#E3F2FD',
    borderLeftWidth: 4,
    borderLeftColor: '#1565C0',
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
  },
  configTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0D47A1',
    marginBottom: 4,
  },
  configDetail: {
    fontSize: 13,
    color: '#1565C0',
  },
  configNote: {
    fontSize: 11,
    color: '#5C6BC0',
    marginTop: 4,
    fontStyle: 'italic',
  },

  // Section headers
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#757575',
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 8,
  },

  // Part rows
  partRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    padding: 12,
    marginBottom: 6,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 2,
  },
  partLeft: {
    flex: 1,
    paddingRight: 12,
  },
  partName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
  },
  partMaterial: {
    fontSize: 12,
    color: '#757575',
    marginTop: 2,
  },
  partNotes: {
    fontSize: 11,
    color: '#9E9E9E',
    marginTop: 4,
    fontStyle: 'italic',
  },
  partRight: {
    alignItems: 'flex-end',
  },
  partDims: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1565C0',
  },
  partThickness: {
    fontSize: 12,
    color: '#9E9E9E',
    marginTop: 2,
  },
  grainBadge: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },

  // Info cards (doors)
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  infoLabel: {
    fontSize: 13,
    color: '#616161',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#212121',
  },
});
