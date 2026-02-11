/**
 * CabinetBuilderScreen.tsx — Add or Edit a Cabinet
 *
 * Handles two modes:
 *   - CREATE (no cabinetId in route params): configures a new cabinet and calls addCabinet()
 *   - EDIT   (cabinetId passed via route params): pre-fills existing cabinet data
 *             and calls updateCabinet() on save
 *
 * All user inputs are in mm internally (MeasurementInput handles parsing/formatting).
 */

import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity,
  ScrollView, StyleSheet, Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { useProjectStore } from '../store/projectStore';
import { CabinetType, JoineryMethod, ToeKickOption } from '../types';
import { inchesToMm } from '../utils/unitConversion';
import MeasurementInput from '../components/MeasurementInput';
import {
  BASE_CABINET_HEIGHT_MM, BASE_CABINET_DEPTH_MM,
  WALL_CABINET_HEIGHT_MM, WALL_CABINET_DEPTH_MM,
  TALL_CABINET_HEIGHT_MM, TALL_CABINET_DEPTH_MM,
  STANDARD_TOE_KICK_HEIGHT_MM,
} from '../constants/cabinetDefaults';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CabinetBuilder'>;
  route: RouteProp<RootStackParamList, 'CabinetBuilder'>;
};

// =============================================================================
// TYPE CONFIG MAPS
// =============================================================================

const TYPE_DEFAULTS: Record<CabinetType, { heightMm: number; depthMm: number; label: string; description: string }> = {
  base: {
    heightMm: BASE_CABINET_HEIGHT_MM,
    depthMm: BASE_CABINET_DEPTH_MM,
    label: 'Base',
    description: '34.5" H × 24" D  •  Gets countertop',
  },
  wall: {
    heightMm: WALL_CABINET_HEIGHT_MM,
    depthMm: WALL_CABINET_DEPTH_MM,
    label: 'Wall',
    description: '30" H × 12" D  •  Mounted above counter',
  },
  tall: {
    heightMm: TALL_CABINET_HEIGHT_MM,
    depthMm: TALL_CABINET_DEPTH_MM,
    label: 'Tall',
    description: '84" H × 24" D  •  Pantry / oven / utility',
  },
};

const JOINERY_LABELS: Record<JoineryMethod, string> = {
  pocket_hole: 'Pocket Hole',
  butt_screws: 'Butt + Screws',
  dado_rabbet: 'Dado + Rabbet',
  dowel: 'Dowel Joints',
};

const TOE_KICK_OPTIONS: { value: ToeKickOption; label: string }[] = [
  { value: 'standard', label: 'Standard 4"' },
  { value: 'custom',   label: 'Custom height' },
  { value: 'none',     label: 'None' },
];

// =============================================================================
// SCREEN
// =============================================================================

export default function CabinetBuilderScreen({ navigation, route }: Props) {
  const currentProject = useProjectStore(s => s.currentProject);
  const cabinets       = useProjectStore(s => s.cabinets);
  const addCabinet     = useProjectStore(s => s.addCabinet);
  const updateCabinet  = useProjectStore(s => s.updateCabinet);

  // Determine mode — cabinetId in route params means we're editing an existing cabinet
  const cabinetId = route.params?.cabinetId;
  const isEditMode = !!cabinetId;
  const existingCabinet = isEditMode ? (cabinets.find(c => c.id === cabinetId) ?? null) : null;

  const units = currentProject?.units ?? 'imperial';

  // Pre-fill state from the existing cabinet when editing, otherwise use defaults
  const [cabinetType, setCabinetType] = useState<CabinetType>(
    existingCabinet?.type ?? 'base'
  );
  const [widthMm, setWidthMm] = useState<number | null>(
    existingCabinet?.width ?? null
  );
  const [joineryMethod, setJoineryMethod] = useState<JoineryMethod>(
    existingCabinet?.joineryMethod ?? currentProject?.defaultJoinery ?? 'pocket_hole'
  );
  const [toeKickOption, setToeKickOption] = useState<ToeKickOption>(
    existingCabinet?.toeKickOption ?? 'standard'
  );
  const [customToeKickMm, setCustomToeKickMm] = useState<number | null>(
    existingCabinet?.toeKickHeight ?? STANDARD_TOE_KICK_HEIGHT_MM
  );

  function handleSave() {
    if (!currentProject) {
      Alert.alert('No Project', 'Please create a project first.');
      navigation.navigate('ProjectSetup');
      return;
    }

    if (widthMm === null || widthMm <= 0) {
      Alert.alert('Width Required', 'Please enter a valid cabinet width.');
      return;
    }

    const defaults = TYPE_DEFAULTS[cabinetType];

    let toeKickHeightMm = 0;
    if (toeKickOption === 'standard') {
      toeKickHeightMm = STANDARD_TOE_KICK_HEIGHT_MM;
    } else if (toeKickOption === 'custom') {
      toeKickHeightMm = customToeKickMm ?? STANDARD_TOE_KICK_HEIGHT_MM;
    }

    if (isEditMode && cabinetId) {
      // Edit mode — update the existing cabinet
      updateCabinet(cabinetId, {
        type: cabinetType,
        width: widthMm,
        height: defaults.heightMm,
        depth: defaults.depthMm,
        toeKickOption,
        toeKickHeight: toeKickHeightMm,
        joineryMethod,
      });
    } else {
      // Create mode — add a new cabinet
      addCabinet({
        type: cabinetType,
        width: widthMm,
        height: defaults.heightMm,
        depth: defaults.depthMm,
        toeKickOption,
        toeKickHeight: toeKickHeightMm,
        joineryMethod,
      });
    }

    navigation.goBack();
  }

  const defaults = TYPE_DEFAULTS[cabinetType];

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* ── Cabinet Type ────────────────────────────────────────────────── */}
      <Text style={styles.sectionLabel}>CABINET TYPE</Text>
      <View style={styles.typeRow}>
        {(Object.keys(TYPE_DEFAULTS) as CabinetType[]).map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.typeBtn, cabinetType === t && styles.typeBtnActive]}
            onPress={() => {
              setCabinetType(t);
              // Wall cabinets don't get toe kicks
              if (t === 'wall') setToeKickOption('none');
              if (t === 'base') setToeKickOption('standard');
              if (t === 'tall') setToeKickOption('none');
            }}
          >
            <Text style={[styles.typeBtnText, cabinetType === t && styles.typeBtnTextActive]}>
              {TYPE_DEFAULTS[t].label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.typeDesc}>{defaults.description}</Text>

      {/* ── Width ───────────────────────────────────────────────────────── */}
      <MeasurementInput
        label="WIDTH"
        valueInMm={widthMm}
        onChangeValue={setWidthMm}
        units={units}
        minMm={inchesToMm(3)}
        hint={
          units === 'imperial'
            ? 'Standard sizes: 9, 12, 15, 18, 21, 24, 27, 30, 33, 36, 42, 48"'
            : 'Standard sizes: 229, 305, 381, 457, 533, 610, 686, 762, 838, 914 mm'
        }
        containerStyle={styles.measurementInputSpacing}
      />

      {/* ── Defaults Info ───────────────────────────────────────────────── */}
      <View style={styles.defaultsCard}>
        <Text style={styles.defaultsTitle}>Standard Defaults for {defaults.label} Cabinet</Text>
        <Text style={styles.defaultsLine}>Height: {defaults.description.split('•')[0].trim()}</Text>
        <Text style={styles.defaultsLine}>Depth: {defaults.description.split('×')[1]?.trim().split('•')[0].trim()}</Text>
        <Text style={styles.defaultsNote}>Height and depth can be customized in a future release.</Text>
      </View>

      {/* ── Toe Kick (base cabinets only) ────────────────────────────────── */}
      {cabinetType === 'base' && (
        <>
          <Text style={styles.sectionLabel}>TOE KICK</Text>
          <View style={styles.optionRow}>
            {TOE_KICK_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.optionBtn, toeKickOption === opt.value && styles.optionBtnActive]}
                onPress={() => setToeKickOption(opt.value)}
              >
                <Text style={[styles.optionBtnText, toeKickOption === opt.value && styles.optionBtnTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {toeKickOption === 'custom' && (
            <MeasurementInput
              label="CUSTOM TOE KICK HEIGHT"
              valueInMm={customToeKickMm}
              onChangeValue={setCustomToeKickMm}
              units={units}
              minMm={inchesToMm(1)}
              maxMm={inchesToMm(12)}
              hint={units === 'imperial' ? 'Standard is 4"' : 'Standard is 102 mm'}
              containerStyle={styles.measurementInputSpacing}
            />
          )}
        </>
      )}

      {/* ── Joinery Method ──────────────────────────────────────────────── */}
      <Text style={styles.sectionLabel}>JOINERY METHOD</Text>
      <View style={styles.joineryGrid}>
        {(Object.entries(JOINERY_LABELS) as [JoineryMethod, string][]).map(([val, label]) => (
          <TouchableOpacity
            key={val}
            style={[styles.joineryBtn, joineryMethod === val && styles.joineryBtnActive]}
            onPress={() => setJoineryMethod(val)}
          >
            <Text style={[styles.joineryBtnText, joineryMethod === val && styles.joineryBtnTextActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Action Buttons ──────────────────────────────────────────────── */}
      <TouchableOpacity style={styles.addBtn} onPress={handleSave}>
        <Text style={styles.addBtnText}>{isEditMode ? 'Save Changes' : 'Add Cabinet'}</Text>
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

  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#757575',
    letterSpacing: 1,
    marginTop: 20,
    marginBottom: 8,
  },

  // Cabinet type selector
  typeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  typeBtnActive: {
    borderColor: '#1565C0',
    backgroundColor: '#1565C0',
  },
  typeBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#616161',
  },
  typeBtnTextActive: {
    color: '#FFFFFF',
  },
  typeDesc: {
    fontSize: 12,
    color: '#9E9E9E',
    marginTop: 6,
    marginBottom: 2,
  },

  // Spacing wrapper for MeasurementInput instances
  measurementInputSpacing: {
    marginTop: 20,
  },

  // Defaults info card
  defaultsCard: {
    backgroundColor: '#FFF8E1',
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#F9A825',
  },
  defaultsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F57F17',
    marginBottom: 4,
  },
  defaultsLine: {
    fontSize: 12,
    color: '#795548',
    marginBottom: 1,
  },
  defaultsNote: {
    fontSize: 11,
    color: '#9E9E9E',
    marginTop: 4,
    fontStyle: 'italic',
  },

  // Option row (toe kick, etc.)
  optionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  optionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  optionBtnActive: {
    borderColor: '#1565C0',
    backgroundColor: '#E3F2FD',
  },
  optionBtnText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#616161',
  },
  optionBtnTextActive: {
    color: '#1565C0',
    fontWeight: '700',
  },

  // Joinery grid
  joineryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  joineryBtn: {
    width: '48%',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  joineryBtnActive: {
    borderColor: '#1565C0',
    backgroundColor: '#E3F2FD',
  },
  joineryBtnText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#616161',
    textAlign: 'center',
  },
  joineryBtnTextActive: {
    color: '#1565C0',
    fontWeight: '700',
  },

  // Action buttons
  addBtn: {
    backgroundColor: '#1565C0',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 28,
  },
  addBtnText: {
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
