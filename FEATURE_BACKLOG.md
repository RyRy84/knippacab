# KnippaCab Feature Backlog

Features deferred to V2+ based on user feedback and prioritization.

## Measurement & Input

### Precision Settings (V2)
**Priority:** Medium  
**User Story:** As a user, I want to choose my preferred measurement precision (1/16", 1/32", 1/64") so the app matches my workflow.

**Implementation Notes:**
- Add to Project Setup or global Settings
- Options: 1/16", 1/32", 1/64"
- Default: 1/16" (industry standard for cabinet making)
- Affects display granularity for fractional conversions
- Does NOT affect calculation precision (always use exact decimals internally)

**Research Needed:**
- Do users want per-project setting or global preference?
- Should precision affect input validation?
- What percentage of users need 1/32" vs 1/64"?

**References:**
- Industry standard: 1/16" for general cabinet work, 1/32" for fine woodworking
- Research shows 1/64" is rarely used except in machining/CNC contexts

---

### Decimal Rounding/Snapping (V2)
**Priority:** Low-Medium  
**User Story:** As a user, when I input decimal measurements like "24.473", I want the app to optionally snap to the nearest fractional increment.

**Decision Point:** Gather user feedback first
- Do users with digital calipers want exact decimals preserved?
- Do users entering decimals expect/want automatic rounding to fractions?
- Should this be automatic or optional (user preference toggle)?
- What threshold should trigger rounding vs preserving exact value?

**Implementation Options:**
1. **Silent rounding** - Automatically snap all inputs to nearest fraction
   - Pro: Clean, matches tape measure reality
   - Con: May surprise users expecting precision

2. **Visual feedback** - Show "rounded" indicator when snapping occurs
   - Pro: Transparent behavior
   - Con: Extra UI noise

3. **User preference toggle** - "Snap to fractions" checkbox in settings
   - Pro: Gives users control
   - Con: Another setting to configure

4. **Smart threshold** - Only snap if within ±0.01" of a fraction
   - Pro: Preserves intentional precision
   - Con: Complex behavior to explain

**V1 Behavior (Current):**  
Preserve exact decimal input, display closest fractional approximation for reference only.

Example: User enters `24.473` → Stored as 621.4042mm → Displays as `24.473 (24 15/32")` where the fractional part is approximate.

**Future Research Questions:**
1. Do users notice/care about the fractional approximation in parentheses?
2. Do users with digital calipers want exact decimals or prefer rounding?
3. Does showing "24.473 (24 15/32")" cause confusion?
4. Should we add a visual indicator when decimal doesn't exactly match a fraction?

---

## Input Methods

### Fractional Picker Modal (V2)
**Priority:** Medium  
**User Story:** As a mobile user, I want a visual picker to select fractional measurements without typing.

**Implementation:**
- Small icon/button next to measurement input fields
- Tapping opens modal with three-column picker wheels:
  - Column 1: Whole inches (0-120)
  - Column 2: Numerator (0-31 for 1/32" precision)
  - Column 3: Denominator (2, 4, 8, 16, 32)
- Native iOS/Android picker component for touch-friendly scrolling
- "Set" and "Cancel" buttons
- Automatically simplifies fractions (8/16 → 1/2)

**Advantages:**
- Touch-friendly for mobile
- No keyboard needed
- Prevents invalid fractions
- Familiar iOS/Android pattern

**Disadvantages:**
- Extra tap to open modal (slower workflow)
- May annoy power users who type quickly

**Design Decision:**
- Make this OPTIONAL alongside text input (not a replacement)
- Power users can keep typing; beginners can use picker

---

### Inline Slider/Stepper (Future Consideration)
**Priority:** Low  
**User Story:** As a user, I want a visual slider to fine-tune measurements with immediate feedback.

**Implementation:**
- Expandable precision control under input field
- Two-slider system:
  - Slider 1: Whole inches (0-120)
  - Slider 2: Fractional increments snapped to 1/16 or 1/32
- Collapses to save screen space when not in use
- Visual hash marks at each increment

**Advantages:**
- Visual feedback during adjustment
- Prevents impossible values
- Granular control without keyboard

**Disadvantages:**
- Complex custom component (significant dev time)
- Takes substantial screen space when expanded
- Slower than typing for experienced users
- May be confusing on small phone screens

**Research Needed:**
- User testing to compare picker vs slider preference
- Mobile screen size constraints
- Accessibility considerations (slider thumb size for touch)

---

## Advanced Input Features (Future)

### Voice Input for Measurements
**Priority:** Low  
Example: User says "twenty-four and a half inches" → Converts to 24.5"

### Camera OCR for Tape Measure
**Priority:** Low  
Point camera at tape measure, app reads and inputs the measurement

### Bluetooth Measuring Device Integration
**Priority:** Medium (already in V2 list)  
Direct input from digital calipers, laser measures, etc.

---

## Related Features

### Smart Unit Detection
**Priority:** Low  
Auto-detect if user enters metric ("610") vs imperial ("24") and convert appropriately.

### Measurement History/Favorites
**Priority:** Low  
Quickly recall commonly used dimensions (e.g., "Standard base height").

### Tolerance Warnings
**Priority:** Medium  
Alert users when measurements are unusually small/large or when total drawer heights exceed cabinet height.

---

## Notes

- All measurement features should support both Imperial and Metric units
- Maintain consistent behavior between input methods (typing, picker, slider)
- Preserve backward compatibility with existing projects
- Consider accessibility (screen readers, large touch targets)
- Test on various phone screen sizes (small iPhone SE to large Android tablets)