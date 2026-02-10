/**
 * ProjectSetupScreen.tsx — Create a New Project
 *
 * Collects the project name, display unit preference, and default joinery
 * method. On submit, creates the project via the store (persists to SQLite
 * on native, in-memory on web) and navigates to ReviewEdit to start adding cabinets.
 */

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useProjectStore } from '../store/projectStore';
import { MeasurementUnit, JoineryMethod } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ProjectSetup'>;
};

// =============================================================================
// CONSTANTS
// =============================================================================

const JOINERY_OPTIONS: {
  value: JoineryMethod;
  label: string;
  badge?: string;
  description: string;
}[] = [
  {
    value: 'pocket_hole',
    label: 'Pocket Hole',
    badge: 'DEFAULT',
    description: 'Quick & beginner-friendly. Angled pocket screws — no dimension adjustments.',
  },
  {
    value: 'butt_screws',
    label: 'Butt + Screws',
    description: 'Simple glue and screw construction. Good for painted MDF cabinets.',
  },
  {
    value: 'dado_rabbet',
    label: 'Dado + Rabbet',
    description: 'Strong grooved joints. Adds dado depth to top/bottom panel widths.',
  },
  {
    value: 'dowel',
    label: 'Dowel Joints',
    description: 'Clean dowel and glue construction. Requires doweling jig.',
  },
];

// =============================================================================
// SCREEN
// =============================================================================

export default function ProjectSetupScreen({ navigation }: Props) {
  const [name, setName]       = useState('');
  const [units, setUnits]     = useState<MeasurementUnit>('imperial');
  const [joinery, setJoinery] = useState<JoineryMethod>('pocket_hole');

  const createProject = useProjectStore(s => s.createProject);

  function handleCreate() {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert('Name Required', 'Please enter a project name before continuing.');
      return;
    }
    createProject({ name: trimmed, units, defaultJoinery: joinery });
    // Go to ReviewEdit — it shows an empty cabinet list and the "Add Cabinet" button.
    // Using navigate (not replace) for reliable web compatibility; the back button
    // from ReviewEdit intentionally returns here if the user wants to reconfigure.
    navigation.navigate('ReviewEdit');
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* ── Project Name ────────────────────────────────────────────────── */}
      <Text style={styles.sectionLabel}>PROJECT NAME *</Text>
      <TextInput
        style={styles.textInput}
        placeholder="e.g. Kitchen Reno 2026"
        placeholderTextColor="#BDBDBD"
        value={name}
        onChangeText={setName}
        autoFocus
        returnKeyType="done"
        maxLength={80}
      />

      {/* ── Display Units ───────────────────────────────────────────────── */}
      <Text style={styles.sectionLabel}>DISPLAY UNITS</Text>
      <View style={styles.toggleRow}>
        {(['imperial', 'metric'] as MeasurementUnit[]).map(u => (
          <TouchableOpacity
            key={u}
            style={[styles.toggleBtn, units === u && styles.toggleBtnActive]}
            onPress={() => setUnits(u)}
          >
            <Text style={[styles.toggleBtnText, units === u && styles.toggleBtnActiveText]}>
              {u === 'imperial' ? 'Imperial  (in)' : 'Metric  (mm)'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Default Joinery ─────────────────────────────────────────────── */}
      <Text style={styles.sectionLabel}>DEFAULT JOINERY METHOD</Text>
      <Text style={styles.sectionSub}>
        Sets the default for new cabinets — can be changed per cabinet.
      </Text>
      {JOINERY_OPTIONS.map(opt => {
        const active = joinery === opt.value;
        return (
          <TouchableOpacity
            key={opt.value}
            style={[styles.joineryCard, active && styles.joineryCardActive]}
            onPress={() => setJoinery(opt.value)}
            activeOpacity={0.75}
          >
            <View style={[styles.radioOuter, active && styles.radioOuterActive]}>
              {active && <View style={styles.radioInner} />}
            </View>
            <View style={styles.joineryTextBlock}>
              <View style={styles.joineryTitleRow}>
                <Text style={[styles.joineryTitle, active && styles.joineryTitleActive]}>
                  {opt.label}
                </Text>
                {opt.badge && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{opt.badge}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.joineryDesc}>{opt.description}</Text>
            </View>
          </TouchableOpacity>
        );
      })}

      {/* ── Buttons ─────────────────────────────────────────────────────── */}
      <TouchableOpacity style={styles.createBtn} onPress={handleCreate}>
        <Text style={styles.createBtnText}>Create Project</Text>
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

  // Section labels
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#757575',
    letterSpacing: 1,
    marginTop: 20,
    marginBottom: 8,
  },
  sectionSub: {
    fontSize: 12,
    color: '#9E9E9E',
    marginBottom: 10,
    marginTop: -4,
  },

  // Text input
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#212121',
  },

  // Unit toggle
  toggleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  toggleBtnActive: {
    borderColor: '#1565C0',
    backgroundColor: '#E3F2FD',
  },
  toggleBtnText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#757575',
  },
  toggleBtnActiveText: {
    color: '#1565C0',
    fontWeight: '700',
  },

  // Joinery cards
  joineryCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 14,
    marginBottom: 8,
  },
  joineryCardActive: {
    borderColor: '#1565C0',
    backgroundColor: '#F5F9FF',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#BDBDBD',
    marginRight: 12,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
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
  joineryTextBlock: {
    flex: 1,
  },
  joineryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  joineryTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#424242',
  },
  joineryTitleActive: {
    color: '#1565C0',
  },
  badge: {
    backgroundColor: '#1565C0',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  joineryDesc: {
    fontSize: 12,
    color: '#757575',
    lineHeight: 17,
  },

  // Action buttons
  createBtn: {
    backgroundColor: '#1565C0',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 24,
  },
  createBtnText: {
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
