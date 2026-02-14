/**
 * settingsStore.ts — User Preferences (Zustand)
 *
 * Holds the user's app-wide preferences. These apply to all projects
 * unless a project overrides them (e.g., a project can have its own units).
 *
 * PERSISTENCE:
 * Settings are stored in the SQLite `settings` table (key-value pairs).
 * On app launch, call `loadSettings()` to hydrate the store from the DB.
 * Every update function writes to the DB immediately.
 *
 * ZUSTAND v5 NOTES:
 * - `create<State>()((set, get) => ({ ... }))` — the double () is required
 *   for TypeScript type inference in Zustand v5.
 * - `set({ key: value })` partially updates state (merges, not replaces).
 * - `get()` reads current state from inside action functions.
 *
 * C# COMPARISON NOTES:
 * - The Zustand store is like a C# singleton service class that both holds
 *   state and provides methods to update it.
 * - React components "subscribe" to the store by calling `useSettingsStore()`
 *   — they re-render automatically when the relevant state changes.
 *   This is like INotifyPropertyChanged but automatic and fine-grained.
 *
 * USAGE IN COMPONENTS:
 * ```tsx
 * import { useSettingsStore } from '../store/settingsStore';
 *
 * function MyScreen() {
 *   const units = useSettingsStore((s) => s.units);
 *   const setUnits = useSettingsStore((s) => s.setUnits);
 *   return <Button onPress={() => setUnits('metric')} />;
 * }
 * ```
 */

import { create } from 'zustand';
import { MeasurementUnit, JoineryMethod, ToeKickOption } from '../types';
import { getSetting, setSetting } from '../db/queries';
import {
  DEFAULT_SAW_KERF_MM,
} from '../constants/cabinetDefaults';
import { DEFAULT_SHEET_SETTINGS } from '../utils/optimizer/types';

// =============================================================================
// STATE TYPE
// =============================================================================

interface SettingsState {
  // ─── Preferences ────────────────────────────────────────────────────────
  /** Display unit system for measurements. Applied across the whole app. */
  units: MeasurementUnit;

  /** Default joinery method for new cabinets in any project. */
  defaultJoinery: JoineryMethod;

  /** Default saw kerf in mm. Used by the sheet goods optimizer. */
  defaultSawKerf: number;

  /** Default toe kick option for new base cabinets. */
  defaultToeKick: ToeKickOption;

  /** Default sheet width in mm for the optimizer. */
  defaultSheetWidth: number;

  /** Default sheet height in mm for the optimizer. */
  defaultSheetHeight: number;

  // ─── Actions ────────────────────────────────────────────────────────────
  /** Load all settings from the database into this store. Call once at startup. */
  loadSettings: () => void;

  /** Update the display unit system and persist to DB. */
  setUnits: (units: MeasurementUnit) => void;

  /** Update the default joinery method and persist to DB. */
  setDefaultJoinery: (joinery: JoineryMethod) => void;

  /** Update the default saw kerf and persist to DB. */
  setDefaultSawKerf: (kerfMm: number) => void;

  /** Update the default toe kick option and persist to DB. */
  setDefaultToeKick: (option: ToeKickOption) => void;

  /** Update the default sheet width and persist to DB. */
  setDefaultSheetWidth: (widthMm: number) => void;

  /** Update the default sheet height and persist to DB. */
  setDefaultSheetHeight: (heightMm: number) => void;
}

// =============================================================================
// STORE
// =============================================================================

export const useSettingsStore = create<SettingsState>()((set) => ({
  // ─── Initial state (app defaults before DB is loaded) ───────────────────
  units: 'imperial',
  defaultJoinery: 'pocket_hole',
  defaultSawKerf: DEFAULT_SAW_KERF_MM,
  defaultToeKick: 'standard',
  defaultSheetWidth: DEFAULT_SHEET_SETTINGS.sheetWidth,
  defaultSheetHeight: DEFAULT_SHEET_SETTINGS.sheetHeight,

  // ─── Actions ────────────────────────────────────────────────────────────

  loadSettings: () => {
    // Read each setting from DB, falling back to the defaults above
    const units = getSetting('units', 'imperial') as MeasurementUnit;
    const defaultJoinery = getSetting('defaultJoinery', 'pocket_hole') as JoineryMethod;
    const defaultSawKerf = parseFloat(getSetting('defaultSawKerf', String(DEFAULT_SAW_KERF_MM)));
    const defaultToeKick = getSetting('defaultToeKick', 'standard') as ToeKickOption;
    const defaultSheetWidth = parseFloat(getSetting('defaultSheetWidth', String(DEFAULT_SHEET_SETTINGS.sheetWidth)));
    const defaultSheetHeight = parseFloat(getSetting('defaultSheetHeight', String(DEFAULT_SHEET_SETTINGS.sheetHeight)));

    set({ units, defaultJoinery, defaultSawKerf, defaultToeKick, defaultSheetWidth, defaultSheetHeight });
  },

  setUnits: (units) => {
    setSetting('units', units);
    set({ units });
  },

  setDefaultJoinery: (defaultJoinery) => {
    setSetting('defaultJoinery', defaultJoinery);
    set({ defaultJoinery });
  },

  setDefaultSawKerf: (defaultSawKerf) => {
    setSetting('defaultSawKerf', String(defaultSawKerf));
    set({ defaultSawKerf });
  },

  setDefaultToeKick: (defaultToeKick) => {
    setSetting('defaultToeKick', defaultToeKick);
    set({ defaultToeKick });
  },

  setDefaultSheetWidth: (defaultSheetWidth) => {
    setSetting('defaultSheetWidth', String(defaultSheetWidth));
    set({ defaultSheetWidth });
  },

  setDefaultSheetHeight: (defaultSheetHeight) => {
    setSetting('defaultSheetHeight', String(defaultSheetHeight));
    set({ defaultSheetHeight });
  },
}));
