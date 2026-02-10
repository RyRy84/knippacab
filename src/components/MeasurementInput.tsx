/**
 * MeasurementInput.tsx — Reusable Measurement Input Component
 *
 * The core UX widget for KnippaCab. Lets users type measurements in their
 * preferred unit system and converts the result to mm for internal storage.
 *
 * ── HOW IT WORKS ──────────────────────────────────────────────────────────────
 *
 * This is a "controlled-while-blurred, free-form-while-focused" input.
 *
 *   • Parent owns the value as a mm number (or null if no valid value yet).
 *   • While the user is typing, the component shows their raw text and
 *     silently parses after each keystroke. Valid parses call onChangeValue.
 *   • On blur, the component re-formats the value into a clean display string
 *     (e.g. "36 1/2"") so the user sees consistent output.
 *   • When the parent updates valueInMm from outside (e.g. AutoBalance),
 *     the component reformats immediately — but only if not focused.
 *
 * ── IMPERIAL PARSING ──────────────────────────────────────────────────────────
 *
 *   Handled by parseImperialInput() in unitConversion.ts. Examples:
 *     "36"          → 36.000 in
 *     "36 1/2"      → 36.500 in
 *     "36-1/2"      → 36.500 in
 *     "3'6"         → 42.000 in
 *     "3' 6 1/2"    → 42.500 in
 *     "3'-6-3/16"   → 42.1875 in
 *
 * ── METRIC PARSING ────────────────────────────────────────────────────────────
 *
 *   "914"   → 914 mm  |  "914.4"  → 914.4 mm  |  "914 mm"  → 914 mm
 *
 * ── C# COMPARISON NOTES ───────────────────────────────────────────────────────
 *
 *   • useRef() ≈ a class field that doesn't trigger a re-render when changed.
 *     Here we use it to track focus state without causing an extra render cycle.
 *   • useEffect() ≈ an event handler on "prop changed". Runs after render
 *     whenever listed dependencies change. Not like a constructor.
 *   • ViewStyle type ≈ CssStyleDeclaration in WPF, but for React Native's
 *     flexbox layout model.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import {
  UnitSystem,
  parseMeasurementInput,
  mmToFractionalInches,
  formatFractionalInches,
} from '../utils/unitConversion';

// =============================================================================
// TYPES
// =============================================================================

export interface MeasurementInputProps {
  /** Section label rendered above the input field */
  label: string;

  /** Current value in millimeters — the single source of truth from the parent */
  valueInMm: number | null;

  /** Called with the parsed mm value every time the user enters a valid number.
   *  Called with null when the field is cleared. */
  onChangeValue: (mm: number | null) => void;

  /** Which unit system the user has selected — drives parsing and formatting */
  units: UnitSystem;

  /** Minimum allowed value in mm. Shown as an error on blur if violated. */
  minMm?: number;

  /** Maximum allowed value in mm. Shown as an error on blur if violated. */
  maxMm?: number;

  /** Placeholder text. Defaults to unit-appropriate example if not supplied. */
  placeholder?: string;

  /** Optional hint line shown below the input (hidden when there is an error) */
  hint?: string;

  /** External error message (from form-level validation in the parent screen).
   *  Shown below the input, overridden by internal parse errors. */
  error?: string;

  /** Override the outer container's layout/spacing */
  containerStyle?: ViewStyle;
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Format a mm value as the string we show when the field is not focused.
 *   Imperial → "36 1/2""  (fractional inches)
 *   Metric   → "914.4"    (decimal mm, no suffix — user knows from label)
 */
function formatValueForDisplay(mm: number, units: UnitSystem): string {
  if (units === 'imperial') {
    return formatFractionalInches(mmToFractionalInches(mm));
  }
  // parseFloat removes trailing zeros: "914.0" → "914", "914.40" → "914.4"
  return parseFloat(mm.toFixed(1)).toString();
}

// =============================================================================
// COMPONENT
// =============================================================================

export default function MeasurementInput({
  label,
  valueInMm,
  onChangeValue,
  units,
  minMm,
  maxMm,
  placeholder,
  hint,
  error: externalError,
  containerStyle,
}: MeasurementInputProps) {

  // ── State ───────────────────────────────────────────────────────────────────

  // The raw string shown inside the TextInput.
  // Starts formatted if an initial value was passed in.
  const [displayText, setDisplayText] = useState<string>(
    valueInMm !== null && valueInMm !== undefined
      ? formatValueForDisplay(valueInMm, units)
      : ''
  );

  // Visual focus ring — drives border color style only.
  const [isFocused, setIsFocused] = useState(false);

  // Validation error generated during parse/range check on blur.
  const [internalError, setInternalError] = useState<string | null>(null);

  // Ref tracks focus for the useEffect below without adding it to deps.
  // Using a ref instead of state avoids a stale-closure problem:
  // if isFocused were in the effect deps, the effect would re-run on every
  // focus/blur, potentially overwriting text the user is still typing.
  const isFocusedRef = useRef(false);

  // ── Sync display when parent updates valueInMm (e.g. AutoBalance) ──────────
  // This effect watches the incoming mm value.  When it changes from outside
  // and the field is not focused, we re-format the display string to match.
  useEffect(() => {
    if (isFocusedRef.current) return; // User is actively typing — don't override
    if (valueInMm === null || valueInMm === undefined) {
      setDisplayText('');
    } else {
      setDisplayText(formatValueForDisplay(valueInMm, units));
    }
  }, [valueInMm, units]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  function handleChangeText(text: string) {
    setDisplayText(text);
    setInternalError(null); // Clear stale errors while typing

    if (!text.trim()) {
      onChangeValue(null);
      return;
    }

    // Parse on every keystroke so the parent value stays current.
    // If the text isn't parseable yet (e.g. user just typed "3'")
    // we don't update the parent — we wait for a complete value.
    const mm = parseMeasurementInput(text, units);
    if (mm !== null && mm >= 0) {
      onChangeValue(mm);
    }
  }

  function handleFocus() {
    setIsFocused(true);
    isFocusedRef.current = true;
    setInternalError(null);
  }

  function handleBlur() {
    setIsFocused(false);
    isFocusedRef.current = false;

    // Empty field — clear value and errors
    if (!displayText.trim()) {
      setInternalError(null);
      onChangeValue(null);
      return;
    }

    // Attempt a full parse
    const mm = parseMeasurementInput(displayText, units);

    if (mm === null) {
      const exampleImperial = "e.g. 36, 36 1/2, or 3'6\"";
      const exampleMetric   = 'e.g. 914 or 914.4';
      setInternalError(
        units === 'imperial'
          ? `Unrecognized format. Try ${exampleImperial}`
          : `Unrecognized format. Try ${exampleMetric}`
      );
      return;
    }

    // Range validation
    if (minMm !== undefined && mm < minMm) {
      const minLabel = formatValueForDisplay(minMm, units);
      const suffix   = units === 'imperial' ? '' : ' mm';
      setInternalError(`Minimum is ${minLabel}${suffix}`);
      return;
    }
    if (maxMm !== undefined && mm > maxMm) {
      const maxLabel = formatValueForDisplay(maxMm, units);
      const suffix   = units === 'imperial' ? '' : ' mm';
      setInternalError(`Maximum is ${maxLabel}${suffix}`);
      return;
    }

    // All good — reformat to canonical display (e.g. "36.5" → "36 1/2"")
    setInternalError(null);
    setDisplayText(formatValueForDisplay(mm, units));
    onChangeValue(mm);
  }

  // ── Derived values ──────────────────────────────────────────────────────────

  // Internal errors take priority over external ones
  const activeError = internalError ?? externalError ?? null;
  const hasError    = activeError !== null;

  // Imperial needs full keyboard for apostrophes, slashes, spaces.
  // Metric only needs numbers + decimal.
  const keyboardType = units === 'imperial' ? 'default' : 'decimal-pad';

  const defaultPlaceholder = units === 'imperial'
    ? "e.g. 36 or 3'6\""
    : 'e.g. 914';

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <View style={containerStyle}>
      <Text style={styles.label}>{label}</Text>

      <View style={[
        styles.inputRow,
        isFocused && styles.inputRowFocused,
        hasError  && styles.inputRowError,
      ]}>
        <TextInput
          style={styles.input}
          value={displayText}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder ?? defaultPlaceholder}
          placeholderTextColor="#BDBDBD"
          keyboardType={keyboardType}
          returnKeyType="done"
          autoCorrect={false}
          autoCapitalize="none"
          spellCheck={false}
        />
        <Text style={[styles.unitBadge, hasError && styles.unitBadgeError]}>
          {units === 'imperial' ? 'in' : 'mm'}
        </Text>
      </View>

      {/* Show hint text when there's no error; show error when present */}
      {!hasError && hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
      {hasError ? (
        <Text style={styles.error}>{activeError}</Text>
      ) : null}
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({

  // Section label above the input (matches ALL-CAPS style in other screens)
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#757575',
    letterSpacing: 1,
    marginBottom: 8,
    textTransform: 'uppercase',
  },

  // Row that wraps the TextInput + unit badge
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 8,
  },
  inputRowFocused: {
    borderColor: '#1565C0',
    // Subtle shadow on focus (web renders this as box-shadow)
    shadowColor: '#1565C0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  inputRowError: {
    borderColor: '#C62828',
  },

  // The actual TextInput — flex: 1 so it fills available width
  input: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#212121',
    // Remove default TextInput outline on web
    outlineWidth: 0,
  } as any, // 'outlineWidth' is a web-only style not in RN types

  // "in" / "mm" badge on the right side of the input row
  unitBadge: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 13,
    fontWeight: '600',
    color: '#9E9E9E',
    borderLeftWidth: 1,
    borderLeftColor: '#E0E0E0',
    minWidth: 42,
    textAlign: 'center',
  },
  unitBadgeError: {
    color: '#C62828',
    borderLeftColor: '#FFCDD2',
  },

  // Helper text — shown below input when no error
  hint: {
    fontSize: 11,
    color: '#9E9E9E',
    marginTop: 5,
    lineHeight: 15,
  },

  // Validation error message — shown below input
  error: {
    fontSize: 11,
    color: '#C62828',
    marginTop: 5,
    lineHeight: 15,
  },
});
