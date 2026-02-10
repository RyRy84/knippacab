# SESSION PLAN: Smart Dual Display Measurement Input

## Context

User research shows woodworkers think in fractions (24 1/2") but may have digital tools outputting decimals (24.473"). V1 accepts both formats, preserves exact values, and displays dual format for clarity.

**See:** FEATURE_BACKLOG.md, UX_DECISIONS.md for full rationale and research findings.

## Goal

Implement "Solution 1: Smart Dual Display" - accept fractional and decimal input, show both formats.

## Design Decisions (Already Made)

- **No rounding/snapping in V1** - Preserve exact decimal input until we get user feedback
- **Dual display format** - "24.473 (24 15/32")" shows both decimal and closest fraction
- **Accept both formats** - Users can type "24 1/2" OR "24.5"
- **Default precision** - 1/16" for V1 (hardcoded), user preference in V2
- **Fraction simplification** - Always reduce (8/16 → 1/2)

## Tasks

### 1. Extend src/utils/measurements.ts

Add four new functions to the existing measurements utility:

#### parseImperialInput(input: string): number | null

**Purpose:** Parse user input in either fractional or decimal format and return decimal inches.

**Supported formats:**
- Fractional with space: `"24 1/2"` → `24.5`
- Fractional with dash: `"24-1/2"` → `24.5`
- Decimal: `"24.5"` → `24.5`
- Complex decimal: `"24.473"` → `24.473` (exact, no rounding)

**Implementation notes:**
- Use regex: `/^(\d+)[\s\-]?(\d+)\/(\d+)$/` for fractional
- Use `parseFloat()` for decimal
- Return `null` for invalid input (division by zero, NaN, etc.)
- **Do NOT round or snap** - preserve exact decimal values

**Example:**
```typescript
parseImperialInput("24 1/2");   // → 24.5
parseImperialInput("24-1/2");   // → 24.5
parseImperialInput("24.5");     // → 24.5
parseImperialInput("24.473");   // → 24.473 (exact)
parseImperialInput("24 1/0");   // → null (division by zero)
parseImperialInput("abc");      // → null (invalid)
```

---

#### decimalToFraction(decimal: number, precision: 16 | 32 = 16): string

**Purpose:** Convert a decimal inch value to the closest fractional representation.

**Behavior:**
- Find closest fraction at specified precision (1/16 or 1/32)
- Always simplify fractions using GCD
- Return clean string format

**Examples:**
```typescript
decimalToFraction(24.5, 16);      // → "24 1/2"
decimalToFraction(24.75, 16);     // → "24 3/4"
decimalToFraction(24.3125, 16);   // → "24 5/16"
decimalToFraction(24.473, 32);    // → "24 15/32" (approximate)
decimalToFraction(25.0, 16);      // → "25" (no fraction)
```

**Implementation notes:**
- Extract whole inches: `Math.floor(decimal)`
- Calculate remainder: `decimal - whole`
- Find closest numerator: `Math.round(remainder * precision)`
- Simplify using GCD helper function
- Handle edge case: `numerator === precision` → whole number + 1

---

#### formatDualDisplay(decimal: number, precision: 16 | 32 = 16): string

**Purpose:** Create the dual-format display string for UI.

**Format:** `"<decimal> (<fraction>")"`

**Examples:**
```typescript
formatDualDisplay(24.5, 16);      // → "24.500 (24 1/2")"
formatDualDisplay(24.473, 32);    // → "24.473 (24 15/32")"
formatDualDisplay(15.1875, 16);   // → "15.188 (15 3/16")"
```

**Implementation:**
- Show decimal with 3 decimal places (`.toFixed(3)`)
- Call `decimalToFraction()` for fractional part
- Combine in parentheses format

---

#### simplifyFraction(numerator: number, denominator: number): {num: number, den: number}

**Purpose:** Reduce fractions to simplest form using GCD algorithm.

**Examples:**
```typescript
simplifyFraction(8, 16);   // → {num: 1, den: 2}
simplifyFraction(12, 16);  // → {num: 3, den: 4}
simplifyFraction(1, 2);    // → {num: 1, den: 2} (already simple)
```

**Implementation:**
```typescript
function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

const divisor = gcd(numerator, denominator);
return {
  num: numerator / divisor,
  den: denominator / divisor
};
```

---

### 2. Create src/components/MeasurementInput.tsx

**Purpose:** Reusable input component for measurements that accepts both fractional and decimal input.

#### Props Interface

```typescript
interface MeasurementInputProps {
  value: number;                    // Stored value in mm
  onValueChange: (mm: number) => void;
  label: string;
  units: 'imperial' | 'metric';    // From project.units
  precision?: 16 | 32;             // Default 16 for V1
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
}
```

#### Component Behavior

1. **Display:**
   - If `units === 'imperial'`: Convert mm → inches, show dual format
   - If `units === 'metric'`: Show mm with "mm" suffix

2. **Input handling:**
   - User types in TextInput
   - On change: Call `parseImperialInput()` or `parseFloat()` depending on units
   - If valid: Convert to mm, call `onValueChange(mm)`
   - If invalid: Show subtle error indicator (red border)

3. **Real-time display:**
   - While typing, show what user typed
   - On blur or when valid, update to dual format
   - Example flow:
     - User types: `"24"` → Show: `"24"`
     - User types: `"24 "` → Show: `"24 "`
     - User types: `"24 1"` → Show: `"24 1"`
     - User types: `"24 1/2"` → Parse → Show: `"24.500 (24 1/2")"`

#### Styling

- Match existing app styling (see DrawerBuilderScreen inputs)
- Label above input
- Border: 1px solid #ccc (normal), red (error)
- Padding: 12px
- Font size: 16px
- Keyboard type: `"numbers-and-punctuation"` for Imperial

#### Example Usage

```typescript
<MeasurementInput
  value={drawer.height}           // mm from state
  onValueChange={(mm) => updateHeight(index, mm)}
  label="Height"
  units={currentProject.units}
  precision={16}
  placeholder="8 1/2 or 8.5"
/>
```

---

### 3. Update src/screens/DrawerBuilderScreen.tsx

**Changes:**

1. Import `MeasurementInput` component
2. Replace all drawer height `TextInput` components with `MeasurementInput`
3. Pass `currentProject.units` to each `MeasurementInput`
4. Remove manual inch-to-mm conversion logic (component handles it)

**Before:**
```typescript
<TextInput
  value={heights[index]}
  onChangeText={(text) => updateHeight(index, parseFloat(text))}
  placeholder="8.5"
  keyboardType="decimal-pad"
/>
```

**After:**
```typescript
<MeasurementInput
  value={inchesToMm(heights[index])}  // Convert to mm for component
  onValueChange={(mm) => updateHeight(index, mmToInches(mm))}
  label={`Drawer ${index + 1} Height`}
  units={currentProject.units}
  placeholder="8 1/2 or 8.5"
/>
```

---

### 4. Unit Tests

Create: **src/utils/__tests__/measurementInput.test.ts**

#### Test parseImperialInput

```typescript
describe('parseImperialInput', () => {
  test('parses fractional with space', () => {
    expect(parseImperialInput('24 1/2')).toBe(24.5);
  });

  test('parses fractional with dash', () => {
    expect(parseImperialInput('24-1/2')).toBe(24.5);
  });

  test('parses decimal', () => {
    expect(parseImperialInput('24.5')).toBe(24.5);
  });

  test('preserves exact decimal (no rounding)', () => {
    expect(parseImperialInput('24.473')).toBe(24.473);
  });

  test('returns null for invalid input', () => {
    expect(parseImperialInput('abc')).toBeNull();
    expect(parseImperialInput('24 1/0')).toBeNull();
  });
});
```

#### Test decimalToFraction

```typescript
describe('decimalToFraction', () => {
  test('converts simple fractions', () => {
    expect(decimalToFraction(24.5, 16)).toBe('24 1/2');
    expect(decimalToFraction(24.25, 16)).toBe('24 1/4');
  });

  test('simplifies fractions', () => {
    // 24.5 at 32nd precision would be 16/32, should simplify to 1/2
    expect(decimalToFraction(24.5, 32)).toBe('24 1/2');
  });

  test('handles whole numbers', () => {
    expect(decimalToFraction(24.0, 16)).toBe('24');
  });

  test('finds closest approximation', () => {
    expect(decimalToFraction(24.473, 32)).toBe('24 15/32');
  });
});
```

#### Test formatDualDisplay

```typescript
describe('formatDualDisplay', () => {
  test('formats exact fraction match', () => {
    expect(formatDualDisplay(24.5, 16)).toBe('24.500 (24 1/2")');
  });

  test('formats approximate fraction', () => {
    expect(formatDualDisplay(24.473, 32)).toBe('24.473 (24 15/32")');
  });

  test('shows 3 decimal places', () => {
    expect(formatDualDisplay(24.1, 16)).toContain('24.100');
  });
});
```

---

## Testing Checklist

Manual testing in the app:

- [ ] Input `"24 1/2"` displays as `"24.500 (24 1/2")"`
- [ ] Input `"24.5"` displays as `"24.500 (24 1/2")"`
- [ ] Input `"24.473"` displays as `"24.473 (24 15/32")"`
- [ ] Input `"15 3/16"` works correctly
- [ ] Invalid input (e.g., `"abc"`) shows red border
- [ ] Clearing input doesn't crash
- [ ] Switching project units (imperial ↔ metric) converts display
- [ ] Component works in DrawerBuilderScreen
- [ ] All unit tests pass (`npm test`)

---

## Implementation Notes

### Critical Reminders

1. **No rounding in V1** - `parseImperialInput()` must preserve exact decimals
2. **Fractional display is approximate** - The `(24 15/32")` part is closest approximation only
3. **Database always stores mm** - Component converts to/from inches at UI layer
4. **Precision hardcoded to 16** - User preference setting deferred to V2

### Edge Cases to Handle

- Empty input (should be valid, return 0 or null)
- Very large numbers (999+)
- Negative numbers (allow but may need validation elsewhere)
- Incomplete fractions (`"24 1/"`) - should show as invalid until complete

### Existing Code to Reuse

- `mmToInches()` / `inchesToMm()` from `src/utils/unitConversion.ts`
- `reduceFraction()` already exists in `unitConversion.ts` - may be able to reuse

### Style Consistency

- Match input styling from `DrawerBuilderScreen`
- Use same fonts, padding, borders
- Error state should be subtle (red border only, no alert)

---

## Success Criteria

✅ User can type fractional measurements naturally (`"24 1/2"`)
✅ User can type decimal measurements (`"24.5"`)
✅ Display shows both formats for clarity
✅ Exact decimals are preserved (no rounding)
✅ Component is reusable across all screens
✅ All unit tests pass
✅ Works on web, iOS, Android

---

## Future Enhancements (V2)

Tracked in FEATURE_BACKLOG.md:
- User-selectable precision (1/16, 1/32, 1/64)
- Optional decimal rounding/snapping
- Fractional picker modal
- Inline slider/stepper

See UX_DECISIONS.md for detailed rationale on all design decisions.
