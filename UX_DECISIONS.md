# KnippaCab UX Decisions

Documentation of key UX decisions, their rationale, and future research questions.

---

## Measurement Input

### Fractional vs Decimal Input (V1)

**Decision:** Accept both fractional and decimal formats; preserve exact user input  
**Date:** 2025-02-10  
**Status:** Implemented in V1

**Rationale:**
- Woodworkers naturally think in fractions ("24 1/2 inches")
- Digital tools (calipers, laser measures) output decimals ("24.473 inches")
- Some users may want to enter precise decimals for CNC work
- V1 preserves all precision until we gather real-world user feedback

**Implementation:**
- Input field accepts multiple formats:
  - Fractional: `24 1/2`, `24-1/2`, `15 3/16`
  - Decimal: `24.5`, `24.473`, `15.1875`
- Display shows both formats for clarity: `24.473 (24 15/32")`
- Internally store exact millimeter equivalent (e.g., 621.4042mm)
- Fractional display uses closest 1/32" approximation (configurable to 1/16" or 1/64" in future)

**Parsing Logic:**
```typescript
// Fractional input: "24 1/2" or "24-1/2"
const fractionPattern = /^(\d+)[\s\-]?(\d+)\/(\d+)$/;

// Decimal input: "24.5" or "24.473"
const decimal = parseFloat(input);
```

**Alternative Considered:**  
Round all decimal inputs to nearest 1/16" or 1/32" increment

**Why Rejected for V1:**  
- Need real-world usage data before removing user precision
- May frustrate users with digital measuring tools
- Can always add optional rounding in V2 based on feedback

**Future Research Questions:**
1. What percentage of users enter decimals vs fractions?
2. Do users with digital calipers expect rounding or exact preservation?
3. Does the dual display format (decimal + fraction) cause confusion?
4. Should we add visual indicator when decimal doesn't exactly match a fraction?

---

### Display Precision (V1)

**Decision:** Show 3 decimal places for imperial, closest 1/32" fractional approximation  
**Date:** 2025-02-10  
**Status:** Implemented in V1

**Display Format:**
```
User Input    → Stored (mm)  → Display
24 1/2        → 622.3         → 24.500 (24 1/2")
24.5          → 622.3         → 24.500 (24 1/2")
24.473        → 621.4042      → 24.473 (24 15/32")  ← approximate
15.1875       → 385.7625      → 15.188 (15 3/16")   ← exact match
```

**Rationale:**
- 3 decimal places = 0.001" precision (approximately 0.025mm)
- Covers all realistic measurement scenarios for woodworking
- 1/32" fractional display matches fine woodworking standard
- Going beyond 3 decimals adds noise without practical benefit

**Future Considerations:**
- User setting for decimal places (1-4)?
- Dynamic precision based on input?
  - `24.5` displays as `24.5` not `24.500`
  - `24.473` displays as `24.473`
- Display metric equivalent alongside imperial?
  - `24.500 (24 1/2") [622.3mm]`

---

### Fraction Simplification (V1)

**Decision:** Always simplify fractions in display  
**Date:** 2025-02-10  
**Status:** Implemented in V1

**Examples:**
- `4/8` → `1/2`
- `8/16` → `1/2`
- `16/32` → `1/2`
- `12/16` → `3/4`
- `20/32` → `5/8`

**Rationale:**
- Cleaner, more professional display
- Matches how woodworkers verbally communicate measurements
- Reduces cognitive load when scanning cut lists
- Industry standard practice

**Implementation:**
```typescript
function reduceFraction(numerator: number, denominator: number) {
  const gcd = (a: number, b: number): number => 
    b === 0 ? a : gcd(b, a % b);
  const divisor = gcd(numerator, denominator);
  return {
    numerator: numerator / divisor,
    denominator: denominator / divisor
  };
}
```

**Edge Cases Handled:**
- User enters `24 4/8` → Store as 24.5 → Display as `24.500 (24 1/2")`
- User enters `24 16/16` → Store as 25.0 → Display as `25.000 (25")`

---

### No Rounding in V1 (Deferred to V2)

**Decision:** Do NOT round decimal inputs; preserve exact values  
**Date:** 2025-02-10  
**Status:** Active decision for V1

**Rationale:**
- Need real user feedback before potentially removing precision
- Different use cases have different needs:
  - Traditional woodworker with tape measure: May prefer auto-rounding to 1/16"
  - CNC operator with digital caliper: Needs exact decimals
  - Beginner DIYer: May not notice/care either way
- Better to preserve precision and add optional rounding later than vice versa

**Current Behavior:**
```
User enters: 24.473"
Stored:      621.4042mm (exact)
Displayed:   24.473 (24 15/32")  ← fractional part is closest approximation
Cut list:    24.473" or 621.4mm depending on units
```

**V2 Research Questions:**
1. Do users notice the fractional approximation doesn't exactly match?
2. Do users expect/want automatic rounding to clean fractions?
3. Should rounding be:
   - Always on (silent)
   - Always on with visual indicator
   - User preference toggle
   - Smart threshold (only round if within ±0.01" of fraction)
4. What's the right threshold for "close enough" to snap?

**Possible V2 Implementations:**
See FEATURE_BACKLOG.md → "Decimal Rounding/Snapping"

---

## Input Field Design

### Dual Format Display

**Decision:** Show both decimal and fractional in one field  
**Date:** 2025-02-10

**Format:** `24.473 (24 15/32")`

**Advantages:**
- User sees both representations simultaneously
- No ambiguity about what value is stored
- Educational for users learning fractional/decimal conversion
- Reduces need to toggle between formats

**Disadvantages:**
- Takes more horizontal space
- May feel cluttered on small screens
- Parenthetical fraction might be ignored by users

**Alternative Considered:**
- Toggle button to switch display between decimal/fractional
- Separate fields for feet, inches, and fraction
- Only show format user entered

**Future Testing:**
- A/B test dual display vs toggle
- Eye-tracking to see if users read fractional part
- User interviews about display preference

---

### Keyboard Type

**Decision:** Use `numbers-and-punctuation` keyboard type  
**Date:** 2025-02-10

**Rationale:**
- Allows typing: `0-9`, `/`, `-`, `.`, space
- Supports both fractional (`24 1/2`) and decimal (`24.5`) input
- More convenient than switching to full keyboard

**Implementation:**
```typescript
<TextInput
  keyboardType="numbers-and-punctuation"
  placeholder="24 1/2 or 24.5"
/>
```

---

### Input Validation

**Decision:** Real-time parsing with graceful error handling  
**Date:** 2025-02-10

**Validation Rules:**
- Empty input: Valid (field can be blank until user fills it)
- Incomplete fraction (e.g., `24 1/`): Show current valid state, don't clear field
- Invalid denominator (e.g., `24 1/0`): Return null, show error indicator
- Negative values: Allow (for edge cases), but warn if unlikely
- Overly large values (e.g., `999`): Allow but warn if exceeds realistic cabinet dimensions

**Error Display:**
- Subtle red border on invalid input
- No intrusive alerts or blocking behavior
- Error clears as soon as input becomes valid again

---

## Metric vs Imperial Units

### Internal Storage

**Decision:** All internal calculations and database storage use millimeters  
**Date:** Project inception  
**Status:** Core architecture decision

**Rationale:**
- Millimeters are whole numbers for most woodworking dimensions
- Avoids floating-point accumulation errors
- International standard (ISO)
- Easier to work with programmatically (no feet/inch conversion)

**Conversion happens only at UI layer:**
```typescript
// User input → Storage
const inches = parseImperialInput("24 1/2");  // → 24.5
const mm = inchesToMm(inches);                // → 622.3

// Storage → Display
const inches = mmToInches(622.3);             // → 24.5
const display = formatDualDisplay(inches);     // → "24.500 (24 1/2\")"
```

---

### Unit Selection

**Decision:** Per-project unit preference  
**Date:** Project inception

**Location:** Set during project creation (ProjectSetupScreen)

**Scope:** Affects display throughout project:
- All input field placeholders
- All dimension displays in cabinet cards
- Cut list output format
- Export PDF units

**Not affected by unit preference:**
- Internal calculations (always mm)
- Database storage (always mm)
- API responses (if implemented)

**Future Consideration:**
- Global default unit preference in Settings
- Quick toggle in UI to preview in other units without changing project
- Mixed units in same project (e.g., metric for small details, imperial for overall dimensions)

---

## Future UX Research Areas

### Input Method Preferences
- Text typing vs picker modal vs slider - which is fastest/preferred?
- Does preference vary by experience level (beginner vs expert)?
- Does preference vary by device (phone vs tablet vs desktop)?

### Measurement Confidence
- How confident are users in their manual measurements?
- Would measurement validation/warnings be helpful or annoying?
- Should app suggest "standard" dimensions when user is close?

### Error Recovery
- What do users do when they mistype a measurement?
- Do they use backspace/delete or clear field and retype?
- Would "undo last input" be valuable?

### Copy/Paste Behavior
- Do users copy dimensions from other sources?
- What formats do they paste (Excel, PDFs, text)?
- Should app auto-detect and parse pasted formats?

---

## Accessibility Considerations

### Screen Readers
- Dual format display reads as: "24.473 inches, approximately 24 and 15 32nds inches"
- Input fields have descriptive labels
- Error states announced to assistive technology

### Large Text / Zoom
- Input fields enlarge with system text size settings
- Dual display remains readable at 200% zoom
- Touch targets minimum 44×44 points (iOS HIG)

### Color Blindness
- Error states use both color AND icon/text
- Grain direction badges use pattern/text, not just color
- High contrast mode supported

---

## Cross-Platform Considerations

### iOS
- Uses native number pad with decimal point
- Fractional picker would use `UIPickerView`
- Haptic feedback on invalid input

### Android  
- Uses numeric keyboard with punctuation
- Fractional picker would use native picker component
- Material Design error states

### Web
- Standard HTML `<input type="text">` (not `type="number"` due to browser inconsistencies)
- Desktop users can type faster, so text input preferred over pickers
- Tab/Enter navigation support

---

## Related Decisions

See also:
- FEATURE_BACKLOG.md → Measurement & Input section
- CLAUDE.md → "Units: All internal math in millimeters"
- src/utils/unitConversion.ts → Implementation details