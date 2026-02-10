/**
 * ReviewEditScreen.tsx — Cabinet List for Current Project
 *
 * Shows all cabinets added to the current project.
 * From here the user can:
 *   - Add another cabinet (→ CabinetBuilder)
 *   - Delete a cabinet (with confirmation)
 *   - Proceed to generate the cut list (→ CuttingPlan)
 *
 * Each cabinet card shows the type, dimensions, joinery, and toe kick
 * so the user can confirm everything looks right before generating.
 */

import React from 'react';
import {
  View, Text, TouchableOpacity,
  ScrollView, StyleSheet, Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useProjectStore } from '../store/projectStore';
import { Cabinet, CabinetType, JoineryMethod, MeasurementUnit } from '../types';
import { formatForDisplay } from '../utils/unitConversion';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ReviewEdit'>;
};

// =============================================================================
// DISPLAY MAPS
// =============================================================================

const TYPE_BADGE_COLORS: Record<CabinetType, string> = {
  base:  '#1565C0',
  wall:  '#2E7D32',
  tall:  '#6A1B9A',
};

const TYPE_LABELS: Record<CabinetType, string> = {
  base: 'BASE',
  wall: 'WALL',
  tall: 'TALL',
};

const JOINERY_LABELS: Record<JoineryMethod, string> = {
  pocket_hole:  'Pocket Hole',
  butt_screws:  'Butt + Screws',
  dado_rabbet:  'Dado + Rabbet',
  dowel:        'Dowel Joints',
};

// =============================================================================
// SUB-COMPONENT: Cabinet Card
// =============================================================================

function CabinetCard({
  cabinet,
  index,
  units,
  onDelete,
}: {
  cabinet: Cabinet;
  index: number;
  units: MeasurementUnit;
  onDelete: () => void;
}) {
  const fmt = (mm: number) => formatForDisplay(mm, units);

  const toeKickLabel = (() => {
    if (cabinet.type !== 'base') return null;
    if (cabinet.toeKickOption === 'none') return 'None';
    if (cabinet.toeKickOption === 'standard') return `Standard (${fmt(cabinet.toeKickHeight)})`;
    return `Custom (${fmt(cabinet.toeKickHeight)})`;
  })();

  return (
    <View style={styles.card}>
      {/* ── Header: number, type badge, delete ────────────────────────── */}
      <View style={styles.cardHeader}>
        <Text style={styles.cardNumber}>#{index + 1}</Text>
        <View style={[styles.typeBadge, { backgroundColor: TYPE_BADGE_COLORS[cabinet.type] }]}>
          <Text style={styles.typeBadgeText}>{TYPE_LABELS[cabinet.type]}</Text>
        </View>
        <View style={styles.cardHeaderSpacer} />
        <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
          <Text style={styles.deleteBtnText}>Delete</Text>
        </TouchableOpacity>
      </View>

      {/* ── Dimensions ────────────────────────────────────────────────── */}
      <Text style={styles.cardDims}>
        {fmt(cabinet.width)}W  ×  {fmt(cabinet.height)}H  ×  {fmt(cabinet.depth)}D
      </Text>

      {/* ── Detail rows ───────────────────────────────────────────────── */}
      <Text style={styles.cardDetail}>
        <Text style={styles.cardDetailLabel}>Joinery: </Text>
        {JOINERY_LABELS[cabinet.joineryMethod]}
      </Text>
      {toeKickLabel !== null && (
        <Text style={styles.cardDetail}>
          <Text style={styles.cardDetailLabel}>Toe kick: </Text>
          {toeKickLabel}
        </Text>
      )}
    </View>
  );
}

// =============================================================================
// SCREEN
// =============================================================================

export default function ReviewEditScreen({ navigation }: Props) {
  const { currentProject, cabinets, deleteCabinet } = useProjectStore(s => ({
    currentProject:  s.currentProject,
    cabinets:        s.cabinets,
    deleteCabinet:   s.deleteCabinet,
  }));

  const units: MeasurementUnit = currentProject?.units ?? 'imperial';

  function handleDelete(cabinet: Cabinet, index: number) {
    Alert.alert(
      'Delete Cabinet',
      `Remove Cabinet #${index + 1} (${TYPE_LABELS[cabinet.type]}, ${formatForDisplay(cabinet.width, units)} wide)? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteCabinet(cabinet.id) },
      ]
    );
  }

  function handleGenerateCutList() {
    if (cabinets.length === 0) {
      Alert.alert('No Cabinets', 'Add at least one cabinet before generating a cut list.');
      return;
    }
    navigation.navigate('CuttingPlan');
  }

  return (
    <View style={styles.screen}>

      {/* ── Project header ──────────────────────────────────────────────── */}
      <View style={styles.projectHeader}>
        <Text style={styles.projectName} numberOfLines={1}>
          {currentProject?.name ?? 'No Project'}
        </Text>
        <Text style={styles.cabinetCount}>
          {cabinets.length === 0
            ? 'No cabinets added yet'
            : `${cabinets.length} ${cabinets.length === 1 ? 'cabinet' : 'cabinets'}`}
        </Text>
      </View>

      {/* ── Cabinet list ────────────────────────────────────────────────── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {cabinets.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconBox}>
              <Text style={styles.emptyIconText}>[ ]</Text>
            </View>
            <Text style={styles.emptyTitle}>No cabinets yet</Text>
            <Text style={styles.emptySubtitle}>
              Tap "Add Cabinet" below to configure your first cabinet and start building your cut list.
            </Text>
          </View>
        ) : (
          cabinets.map((cabinet, index) => (
            <CabinetCard
              key={cabinet.id}
              cabinet={cabinet}
              index={index}
              units={units}
              onDelete={() => handleDelete(cabinet, index)}
            />
          ))
        )}
      </ScrollView>

      {/* ── Footer action buttons ────────────────────────────────────────── */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('CabinetBuilder')}
        >
          <Text style={styles.addBtnText}>+ Add Cabinet</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.generateBtn, cabinets.length === 0 && styles.generateBtnDisabled]}
          onPress={handleGenerateCutList}
        >
          <Text style={[styles.generateBtnText, cabinets.length === 0 && styles.generateBtnTextDisabled]}>
            Generate Cut List
          </Text>
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

  // Project header banner
  projectHeader: {
    backgroundColor: '#1565C0',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  projectName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cabinetCount: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 3,
  },

  // Scroll area
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: 56,
    paddingHorizontal: 32,
  },
  emptyIconBox: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  emptyIconText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1565C0',
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

  // Cabinet card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardNumber: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9E9E9E',
    marginRight: 8,
    minWidth: 24,
  },
  typeBadge: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  cardHeaderSpacer: {
    flex: 1,
  },
  deleteBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#EF5350',
  },
  deleteBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF5350',
  },
  cardDims: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  cardDetail: {
    fontSize: 13,
    color: '#616161',
    marginTop: 2,
  },
  cardDetailLabel: {
    fontWeight: '600',
    color: '#424242',
  },

  // Footer
  footer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    padding: 16,
    gap: 10,
  },
  addBtn: {
    backgroundColor: '#1565C0',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  addBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  generateBtn: {
    backgroundColor: '#2E7D32',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  generateBtnDisabled: {
    backgroundColor: '#E0E0E0',
  },
  generateBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  generateBtnTextDisabled: {
    color: '#9E9E9E',
  },
});
