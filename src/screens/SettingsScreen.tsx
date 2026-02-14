/**
 * SettingsScreen.tsx — App-Wide Settings (Phase 5.2)
 *
 * Lets users configure global preferences that apply across all projects:
 *   - Display units (Imperial / Metric)
 *   - Default joinery method for new cabinets
 *   - Default saw kerf for the sheet goods optimizer
 *   - Default toe kick option for base cabinets
 *   - Default sheet size (width/height) for the optimizer
 *
 * All settings persist to SQLite via the settingsStore and are loaded on
 * app launch. Individual projects can override units and joinery.
 *
 * ZUSTAND SELECTORS: single-value pattern (web safety).
 */

import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useSettingsStore } from '../store/settingsStore';
import { MeasurementUnit, JoineryMethod, ToeKickOption } from '../types';
import MeasurementInput from '../components/MeasurementInput';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Settings'>;
};

// =============================================================================
// OPTION DEFINITIONS
// =============================================================================

const UNIT_OPTIONS: { value: MeasurementUnit; label: string }[] = [
  { value: 'imperial', label: 'Imperial (in / ft)' },
  { value: 'metric',   label: 'Metric (mm)' },
];

const JOINERY_OPTIONS: { value: JoineryMethod; label: string; description: string }[] = [
  { value: 'pocket_hole',  label: 'Pocket Hole Screws', description: 'Beginner-friendly, quick assembly' },
  { value: 'butt_screws',  label: 'Butt Joints + Screws', description: 'Simplest method, basic tools only' },
  { value: 'dado_rabbet',  label: 'Dado & Rabbet + Glue', description: 'Intermediate — strongest box joint' },
  { value: 'dowel',        label: 'Dowel Joints + Glue', description: 'Intermediate — clean look, no visible hardware' },
];

const TOE_KICK_OPTIONS: { value: ToeKickOption; label: string }[] = [
  { value: 'standard', label: 'Standard 4" (102mm)' },
  { value: 'custom',   label: 'Custom Height' },
  { value: 'none',     label: 'None (feet/frame)' },
];

// =============================================================================
// SCREEN
// =============================================================================

export default function SettingsScreen({ navigation }: Props) {

  // ── Store — single-value selectors ─────────────────────────────────
  const units           = useSettingsStore(s => s.units);
  const defaultJoinery  = useSettingsStore(s => s.defaultJoinery);
  const defaultSawKerf  = useSettingsStore(s => s.defaultSawKerf);
  const defaultToeKick  = useSettingsStore(s => s.defaultToeKick);
  const defaultSheetWidth  = useSettingsStore(s => s.defaultSheetWidth);
  const defaultSheetHeight = useSettingsStore(s => s.defaultSheetHeight);

  const setUnits              = useSettingsStore(s => s.setUnits);
  const setDefaultJoinery     = useSettingsStore(s => s.setDefaultJoinery);
  const setDefaultSawKerf     = useSettingsStore(s => s.setDefaultSawKerf);
  const setDefaultToeKick     = useSettingsStore(s => s.setDefaultToeKick);
  const setDefaultSheetWidth  = useSettingsStore(s => s.setDefaultSheetWidth);
  const setDefaultSheetHeight = useSettingsStore(s => s.setDefaultSheetHeight);

  return (
    <View style={styles.screen}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>

        {/* ── Units ──────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Display Units</Text>
          <View style={styles.segmentedRow}>
            {UNIT_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.segment, units === opt.value && styles.segmentActive]}
                onPress={() => setUnits(opt.value)}
              >
                <Text style={[styles.segmentText, units === opt.value && styles.segmentTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Default Joinery ────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Default Joinery Method</Text>
          <Text style={styles.sectionHint}>Used for new cabinets unless overridden per-project</Text>
          {JOINERY_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.radioRow, defaultJoinery === opt.value && styles.radioRowActive]}
              onPress={() => setDefaultJoinery(opt.value)}
            >
              <View style={[styles.radioOuter, defaultJoinery === opt.value && styles.radioOuterActive]}>
                {defaultJoinery === opt.value && <View style={styles.radioInner} />}
              </View>
              <View style={styles.radioTextWrap}>
                <Text style={[styles.radioLabel, defaultJoinery === opt.value && styles.radioLabelActive]}>
                  {opt.label}
                </Text>
                <Text style={styles.radioDesc}>{opt.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Default Toe Kick ───────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Default Toe Kick</Text>
          <View style={styles.segmentedRow}>
            {TOE_KICK_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.segment, defaultToeKick === opt.value && styles.segmentActive]}
                onPress={() => setDefaultToeKick(opt.value)}
              >
                <Text style={[styles.segmentText, defaultToeKick === opt.value && styles.segmentTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Sheet Goods Defaults ───────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sheet Goods Defaults</Text>
          <Text style={styles.sectionHint}>Default sheet size and saw kerf for the cutting optimizer</Text>
          <View style={styles.inputRow}>
            <View style={styles.inputField}>
              <MeasurementInput
                label="SHEET WIDTH"
                valueInMm={defaultSheetWidth}
                onChangeValue={(v) => { if (v !== null) setDefaultSheetWidth(v); }}
                units={units}
                minMm={100}
                hint="Standard: 8' (2440mm)"
              />
            </View>
            <View style={styles.inputField}>
              <MeasurementInput
                label="SHEET HEIGHT"
                valueInMm={defaultSheetHeight}
                onChangeValue={(v) => { if (v !== null) setDefaultSheetHeight(v); }}
                units={units}
                minMm={100}
                hint="Standard: 4' (1220mm)"
              />
            </View>
          </View>
          <MeasurementInput
            label="SAW KERF"
            valueInMm={defaultSawKerf}
            onChangeValue={(v) => { if (v !== null) setDefaultSawKerf(v); }}
            units="metric"
            minMm={0}
            maxMm={10}
            hint={'Blade kerf in mm — default 3.175mm (1/8")'}
          />
        </View>

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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
    gap: 20,
  },

  // ── Section ───────────────────────────────────────────────────────
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 4,
  },
  sectionHint: {
    fontSize: 12,
    color: '#9E9E9E',
    marginBottom: 12,
  },

  // ── Segmented Control ──────────────────────────────────────────────
  segmentedRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  segment: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
  },
  segmentActive: {
    backgroundColor: '#1565C0',
    borderColor: '#1565C0',
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#616161',
  },
  segmentTextActive: {
    color: '#FFFFFF',
  },

  // ── Radio Buttons ──────────────────────────────────────────────────
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 4,
    backgroundColor: '#FAFAFA',
  },
  radioRowActive: {
    backgroundColor: '#E3F2FD',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#BDBDBD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
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
  radioTextWrap: {
    flex: 1,
  },
  radioLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#424242',
  },
  radioLabelActive: {
    color: '#1565C0',
  },
  radioDesc: {
    fontSize: 12,
    color: '#9E9E9E',
    marginTop: 1,
  },

  // ── Input Row ──────────────────────────────────────────────────────
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 4,
  },
  inputField: {
    flex: 1,
  },
});
