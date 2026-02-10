/**
 * DrawerBuilderScreen.tsx — Add Drawers to a Cabinet
 *
 * Phase 3, Milestone 3.3 — lets the user configure one or more drawer boxes
 * to attach to an existing cabinet. On save each drawer is written to the
 * project store (and to SQLite on native).
 *
 * WHAT THE USER CONTROLS:
 *   1. Number of drawers (1–10) — stepper with + / − buttons
 *   2. Height of each drawer opening (inches) — individual inputs
 *      OR "Auto-Balance" toggle distributes cabinet height equally
 *   3. Corner joinery method — pocket hole / butt + screws / dado
 *   4. Bottom attachment method — applied / captured dado / screwed
 *
 * DIMENSION MATH (applied before saving):
 *   Drawer box width  = cabinet.width  − (2 × DRAWER_SLIDE_CLEARANCE_EACH_SIDE_MM)
 *   Drawer box height = opening height − DRAWER_TOP_CLEARANCE_MM
 *   Drawer box depth  = cabinet.depth  − DRAWER_BOX_DEPTH_SETBACK_MM (2" clearance)
 *
 * Navigation: DrawerBuilder receives { cabinetId } as a route param.
 * The screen looks up the cabinet from the store using that ID.
 *
 * ZUSTAND NOTE: All store reads use single-value selectors.
 * See CLAUDE.md "Known Web Gotchas".
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { useProjectStore } from '../store/projectStore';
import { DrawerCornerJoinery, DrawerBottomMethod } from '../types';
import { inchesToMm, mmToInches, formatForDisplay } from '../utils/unitConversion';
import {
  DRAWER_SLIDE_CLEARANCE_EACH_SIDE_MM,
  DRAWER_TOP_CLEARANCE_MM,
} from '../constants/cabinetDefaults';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'DrawerBuilder'>;
  route: RouteProp<RootStackParamList, 'DrawerBuilder'>;
};

// =============================================================================
// CONSTANTS
// =============================================================================

/** Clearance from front of cabinet to back of drawer face + slide adjustment. */
const DRAWER_BOX_DEPTH_SETBACK_MM = 50.8; // 2"

const MAX_DRAWERS = 10;
const MIN_DRAWER_HEIGHT_IN = 3; // minimum useful drawer height (inches)

// =============================================================================
// OPTION MAPS
// =============================================================================

const CORNER_JOINERY_OPTIONS: { value: DrawerCornerJoinery; label: string; description: string }[] = [
  {
    value: 'pocket_hole',
    label: 'Pocket Hole',
    description: 'Quick & strong. No dimension adjustments.',
  },
  {
    value: 'butt',
    label: 'Butt + Screws',
    description: 'Simplest method. Glue and screw.',
  },
  {
    value: 'dado',
    label: 'Dado',
    description: 'Strongest joint. Sides capture front/back in a groove.',
  },
];

const BOTTOM_METHOD_OPTIONS: { value: DrawerBottomMethod; label: string; description: string }[] = [
  {
    value: 'applied',
    label: 'Applied',
    description: 'Nailed to underside. Easiest to build.',
  },
  {
    value: 'captured_dado',
    label: 'Captured Dado',
    description: 'Bottom slides into grooves. Strongest and cleanest.',
  },
  {
    value: 'screwed',
    label: 'Screwed',
    description: 'Screwed from below. Easy to replace if damaged.',
  },
];

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Given a cabinet height (in mm) and a drawer count, return an array of
 * equal height strings in decimal inches, each rounded to 2 decimal places.
 */
function distributeHeightsEvenly(cabinetHeightMm: number, count: number): string[] {
  const totalIn = mmToInches(cabinetHeightMm);
  const each = totalIn / count;
  return Array.from({ length: count }, () => each.toFixed(2));
}

/**
 * Parse a string array of inch values and return the total in inches.
 * Invalid / empty entries count as 0.
 */
function sumHeightsIn(heights: string[]): number {
  return heights.reduce((sum, h) => {
    const v = parseFloat(h);
    return sum + (isNaN(v) ? 0 : v);
  }, 0);
}

// =============================================================================
// SCREEN
// =============================================================================

export default function DrawerBuilderScreen({ navigation, route }: Props) {
  const { cabinetId } = route.params;

  // Single-value Zustand selectors (see CLAUDE.md web gotcha)
  const cabinets       = useProjectStore(s => s.cabinets);
  const addDrawer      = useProjectStore(s => s.addDrawer);
  const currentProject = useProjectStore(s => s.currentProject);

  const units = currentProject?.units ?? 'imperial';

  const cabinet = cabinets.find(c => c.id === cabinetId) ?? null;

  // ── Form state ─────────────────────────────────────────────────────────────
  const [drawerCount, setDrawerCount]           = useState(1);
  const [heightsIn, setHeightsIn]               = useState<string[]>(['6.00']);
  const [autoBalance, setAutoBalance]           = useState(false);
  const [cornerJoinery, setCornerJoinery]       = useState<DrawerCornerJoinery>('pocket_hole');
  const [bottomMethod, setBottomMethod]         = useState<DrawerBottomMethod>('applied');

  // Available height in inches (the full cabinet box height — drawer faces
  // cover the openings, so we use the full cabinet height as the design space).
  const availableIn = cabinet ? parseFloat(mmToInches(cabinet.height).toFixed(2)) : 0;

  // ── Sync heights array when count changes ──────────────────────────────────
  // When the user changes drawer count:
  //   - Truncate the array if count decreased
  //   - Append a default height if count increased
  //   - If autoBalance is on, redistribute evenly
  const syncHeightsToCount = useCallback((newCount: number, balance: boolean, cabHeightMm: number) => {
    if (balance && cabHeightMm > 0) {
      setHeightsIn(distributeHeightsEvenly(cabHeightMm, newCount));
      return;
    }
    setHeightsIn(prev => {
      if (newCount <= prev.length) return prev.slice(0, newCount);
      const defaultH = (availableIn / newCount).toFixed(2);
      return [...prev, ...Array.from({ length: newCount - prev.length }, () => defaultH)];
    });
  }, [availableIn]);

  // Run on mount to set a sensible initial height suggestion
  useEffect(() => {
    if (cabinet) {
      setHeightsIn(distributeHeightsEvenly(cabinet.height, 1));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cabinetId]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  function handleCountChange(delta: number) {
    const next = Math.max(1, Math.min(MAX_DRAWERS, drawerCount + delta));
    setDrawerCount(next);
    syncHeightsToCount(next, autoBalance, cabinet?.height ?? 0);
  }

  function handleAutoBalanceToggle() {
    const next = !autoBalance;
    setAutoBalance(next);
    if (next && cabinet) {
      setHeightsIn(distributeHeightsEvenly(cabinet.height, drawerCount));
    }
  }

  function handleHeightChange(index: number, value: string) {
    setHeightsIn(prev => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
    // Typing a custom height turns off auto-balance
    if (autoBalance) setAutoBalance(false);
  }

  function handleSave() {
    if (!cabinet) {
      Alert.alert('Error', 'Cabinet not found. Please go back and try again.');
      return;
    }

    // Validate all heights
    for (let i = 0; i < drawerCount; i++) {
      const h = parseFloat(heightsIn[i] ?? '0');
      if (isNaN(h) || h < MIN_DRAWER_HEIGHT_IN) {
        Alert.alert(
          'Invalid Height',
          `Drawer ${i + 1} height must be at least ${MIN_DRAWER_HEIGHT_IN} inches.`
        );
        return;
      }
    }

    const totalUsedIn = sumHeightsIn(heightsIn.slice(0, drawerCount));
    if (totalUsedIn > availableIn + 0.01) {
      Alert.alert(
        'Heights Exceed Cabinet',
        `Total drawer height (${formatForDisplay(inchesToMm(totalUsedIn), units)}) exceeds cabinet height (${formatForDisplay(cabinet.height, units)}).` +
        ' Reduce individual heights or the number of drawers.'
      );
      return;
    }

    // Save each drawer to the store
    for (let i = 0; i < drawerCount; i++) {
      const openingHeightMm = inchesToMm(parseFloat(heightsIn[i]));
      addDrawer(cabinetId, {
        // Subtract clearances so the box fits inside the opening
        width:  cabinet.width  - (2 * DRAWER_SLIDE_CLEARANCE_EACH_SIDE_MM),
        height: Math.max(1, openingHeightMm - DRAWER_TOP_CLEARANCE_MM),
        depth:  Math.max(1, cabinet.depth   - DRAWER_BOX_DEPTH_SETBACK_MM),
        cornerJoinery,
        bottomMethod,
      });
    }

    navigation.goBack();
  }

  // ── Derived display values ─────────────────────────────────────────────────
  const totalUsedIn = sumHeightsIn(heightsIn.slice(0, drawerCount));
  const remainingIn = availableIn - totalUsedIn;
  const isOverHeight = remainingIn < -0.01;

  // ==========================================================================
  // RENDER
  // ==========================================================================

  if (!cabinet) {
    return (
      <View style={styles.errorState}>
        <Text style={styles.errorText}>Cabinet not found. Please go back.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >

      {/* ── Cabinet context card ─────────────────────────────────────────── */}
      <View style={styles.contextCard}>
        <Text style={styles.contextTitle}>Adding drawers to:</Text>
        <Text style={styles.contextCabinet}>
          {cabinet.type.charAt(0).toUpperCase() + cabinet.type.slice(1)} Cabinet
          {'  '}
          <Text style={styles.contextDim}>
            {formatForDisplay(cabinet.width, units)} W
            {' × '}
            {formatForDisplay(cabinet.height, units)} H
          </Text>
        </Text>
        <Text style={styles.contextAvailable}>
          Available height: {formatForDisplay(cabinet.height, units)}
        </Text>
      </View>

      {/* ── Number of drawers ───────────────────────────────────────────── */}
      <Text style={styles.sectionLabel}>NUMBER OF DRAWERS</Text>
      <View style={styles.stepperRow}>
        <TouchableOpacity
          style={[styles.stepperBtn, drawerCount <= 1 && styles.stepperBtnDisabled]}
          onPress={() => handleCountChange(-1)}
          disabled={drawerCount <= 1}
        >
          <Text style={[styles.stepperBtnText, drawerCount <= 1 && styles.stepperBtnTextDisabled]}>−</Text>
        </TouchableOpacity>

        <View style={styles.stepperValue}>
          <Text style={styles.stepperValueText}>{drawerCount}</Text>
          <Text style={styles.stepperValueSub}>{drawerCount === 1 ? 'drawer' : 'drawers'}</Text>
        </View>

        <TouchableOpacity
          style={[styles.stepperBtn, drawerCount >= MAX_DRAWERS && styles.stepperBtnDisabled]}
          onPress={() => handleCountChange(1)}
          disabled={drawerCount >= MAX_DRAWERS}
        >
          <Text style={[styles.stepperBtnText, drawerCount >= MAX_DRAWERS && styles.stepperBtnTextDisabled]}>+</Text>
        </TouchableOpacity>
      </View>

      {/* ── Drawer heights ──────────────────────────────────────────────── */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionLabel}>DRAWER HEIGHTS (inches)</Text>
        <TouchableOpacity
          style={[styles.autoBalanceBtn, autoBalance && styles.autoBalanceBtnActive]}
          onPress={handleAutoBalanceToggle}
        >
          <Text style={[styles.autoBalanceBtnText, autoBalance && styles.autoBalanceBtnTextActive]}>
            {autoBalance ? 'Auto-Balanced ✓' : 'Auto-Balance'}
          </Text>
        </TouchableOpacity>
      </View>

      {Array.from({ length: drawerCount }, (_, i) => (
        <View key={i} style={styles.heightRow}>
          <Text style={styles.heightLabel}>Drawer {i + 1}</Text>
          <TextInput
            style={styles.heightInput}
            value={heightsIn[i] ?? ''}
            onChangeText={v => handleHeightChange(i, v)}
            keyboardType="decimal-pad"
            returnKeyType="done"
            placeholder="0.00"
            placeholderTextColor="#BDBDBD"
          />
          <Text style={styles.heightUnit}>"</Text>
        </View>
      ))}

      {/* ── Height usage summary ─────────────────────────────────────────── */}
      <View style={[styles.summaryBar, isOverHeight && styles.summaryBarError]}>
        <Text style={[styles.summaryText, isOverHeight && styles.summaryTextError]}>
          {'Used: '}{formatForDisplay(inchesToMm(totalUsedIn), units)}
          {'  ·  '}
          {'Available: '}{formatForDisplay(cabinet.height, units)}
          {'  ·  '}
          {'Remaining: '}{isOverHeight ? '−' : ''}{formatForDisplay(inchesToMm(Math.abs(remainingIn)), units)}
        </Text>
        {isOverHeight && (
          <Text style={styles.summaryErrorNote}>
            Total exceeds cabinet height — reduce heights.
          </Text>
        )}
      </View>

      {/* ── Corner joinery ──────────────────────────────────────────────── */}
      <Text style={styles.sectionLabel}>CORNER JOINERY</Text>
      {CORNER_JOINERY_OPTIONS.map(opt => (
        <TouchableOpacity
          key={opt.value}
          style={[styles.optionCard, cornerJoinery === opt.value && styles.optionCardActive]}
          onPress={() => setCornerJoinery(opt.value)}
        >
          <View style={styles.optionCardInner}>
            <View style={[styles.radioOuter, cornerJoinery === opt.value && styles.radioOuterActive]}>
              {cornerJoinery === opt.value && <View style={styles.radioInner} />}
            </View>
            <View style={styles.optionCardText}>
              <Text style={[styles.optionLabel, cornerJoinery === opt.value && styles.optionLabelActive]}>
                {opt.label}
              </Text>
              <Text style={styles.optionDesc}>{opt.description}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}

      {/* ── Bottom attachment ────────────────────────────────────────────── */}
      <Text style={styles.sectionLabel}>BOTTOM ATTACHMENT</Text>
      {BOTTOM_METHOD_OPTIONS.map(opt => (
        <TouchableOpacity
          key={opt.value}
          style={[styles.optionCard, bottomMethod === opt.value && styles.optionCardActive]}
          onPress={() => setBottomMethod(opt.value)}
        >
          <View style={styles.optionCardInner}>
            <View style={[styles.radioOuter, bottomMethod === opt.value && styles.radioOuterActive]}>
              {bottomMethod === opt.value && <View style={styles.radioInner} />}
            </View>
            <View style={styles.optionCardText}>
              <Text style={[styles.optionLabel, bottomMethod === opt.value && styles.optionLabelActive]}>
                {opt.label}
              </Text>
              <Text style={styles.optionDesc}>{opt.description}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}

      {/* ── Action buttons ──────────────────────────────────────────────── */}
      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveBtnText}>
          Add {drawerCount === 1 ? 'Drawer' : `${drawerCount} Drawers`} to Cabinet
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.cancelBtnText}>Cancel</Text>
      </TouchableOpacity>

    </ScrollView>
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
  content: {
    padding: 20,
    paddingBottom: 48,
  },

  // Error / not-found state
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#616161',
    textAlign: 'center',
    marginBottom: 20,
  },
  backBtn: {
    backgroundColor: '#1565C0',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },

  // Section labels (all-caps, grey — matches CabinetBuilderScreen)
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#757575',
    letterSpacing: 1,
    marginTop: 22,
    marginBottom: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 22,
    marginBottom: 8,
  },

  // Cabinet context card (purple tint to indicate drawer scope)
  contextCard: {
    backgroundColor: '#F3E5F5',
    borderRadius: 8,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: '#6A1B9A',
    marginTop: 4,
  },
  contextTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6A1B9A',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  contextCabinet: {
    fontSize: 15,
    fontWeight: '700',
    color: '#212121',
  },
  contextDim: {
    fontWeight: '400',
    color: '#616161',
  },
  contextAvailable: {
    fontSize: 12,
    color: '#7B1FA2',
    marginTop: 4,
  },

  // Drawer count stepper
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  stepperBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1565C0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnDisabled: {
    backgroundColor: '#E0E0E0',
  },
  stepperBtnText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 28,
  },
  stepperBtnTextDisabled: {
    color: '#9E9E9E',
  },
  stepperValue: {
    flex: 1,
    alignItems: 'center',
  },
  stepperValueText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#212121',
    lineHeight: 42,
  },
  stepperValueSub: {
    fontSize: 12,
    color: '#9E9E9E',
    marginTop: 2,
  },

  // Auto-balance toggle button
  autoBalanceBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#1565C0',
  },
  autoBalanceBtnActive: {
    backgroundColor: '#1565C0',
  },
  autoBalanceBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1565C0',
  },
  autoBalanceBtnTextActive: {
    color: '#FFFFFF',
  },

  // Drawer height input rows
  heightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 10,
  },
  heightLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#424242',
    width: 64,
  },
  heightInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    color: '#212121',
  },
  heightUnit: {
    fontSize: 16,
    fontWeight: '600',
    color: '#424242',
    width: 14,
  },

  // Height summary bar
  summaryBar: {
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 6,
  },
  summaryBarError: {
    backgroundColor: '#FFEBEE',
  },
  summaryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E7D32',
  },
  summaryTextError: {
    color: '#C62828',
  },
  summaryErrorNote: {
    fontSize: 11,
    color: '#C62828',
    marginTop: 3,
  },

  // Radio card option (corner joinery + bottom method)
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
  },
  optionCardActive: {
    borderColor: '#1565C0',
    backgroundColor: '#E3F2FD',
  },
  optionCardInner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#BDBDBD',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    flexShrink: 0,
  },
  radioOuterActive: {
    borderColor: '#1565C0',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1565C0',
  },
  optionCardText: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 2,
  },
  optionLabelActive: {
    color: '#1565C0',
  },
  optionDesc: {
    fontSize: 12,
    color: '#9E9E9E',
    lineHeight: 16,
  },

  // Action buttons
  saveBtn: {
    backgroundColor: '#6A1B9A',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 28,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cancelBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelBtnText: {
    fontSize: 15,
    color: '#757575',
  },
});
