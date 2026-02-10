# Drawer Builder Screen - Implementation Plan

**Phase:** 3.3 - User Interface Implementation  
**Priority:** Next immediate task after CuttingPlanScreen  
**Complexity:** Medium (similar pattern to CabinetBuilderScreen)  
**Estimated Time:** 4-6 hours

---

## Overview

The Drawer Builder Screen allows users to add drawers to a cabinet by specifying quantity, heights, and construction methods. It integrates with the existing `drawerCalculator.ts` engine which is already fully tested and functional.

**User Flow:**
```
CabinetBuilderScreen → [Add Drawers] → DrawerBuilderScreen → [Add to Cabinet] → CabinetBuilderScreen
```

---

## Context & Prerequisites

### What Already Exists ✅

1. **Calculator Engine** (`src/utils/drawerCalculator.ts`):
   - `calculateDrawerParts()` - generates all drawer parts
   - `adjustDrawerForJoinery()` - handles corner joinery and bottom methods
   - Fully tested (93 unit tests include drawer tests)

2. **Type Definitions** (`src/types/index.ts`):
   ```typescript
   interface Drawer {
     id: string;
     cabinetId: string;
     height: number; // mm
     cornerJoinery: DrawerCornerJoinery;
     bottomMethod: DrawerBottomMethod;
   }

   type DrawerCornerJoinery = 'pocket_hole' | 'butt_joint' | 'dado';
   type DrawerBottomMethod = 'applied' | 'captured_dado' | 'screwed';
   ```

3. **Store Methods** (`src/store/projectStore.ts`):
   - `addDrawer(cabinetId: string, drawer: Omit<Drawer, 'id' | 'cabinetId'>)` - saves drawer
   - `deleteDrawer(drawerId: string)` - removes drawer
   - Database CRUD already implemented

4. **Constants** (`src/constants/cabinetDefaults.ts`):
   - `DEFAULT_DRAWER_CLEARANCE` = 12mm (space between drawers and above bottom drawer)
   - Standard material thickness values
   - Dado depth constant

### Navigation Setup Required

**Update CabinetBuilderScreen:**
- Add "Add Drawers" button that navigates to DrawerBuilderScreen
- Pass cabinetId as route param

**DrawerBuilderScreen Navigation:**
- Receives `cabinetId` from route params
- On save: navigate back to CabinetBuilderScreen
- On cancel: navigate back to CabinetBuilderScreen

---

## UI Design Specification

### Screen Layout

```
┌─────────────────────────────────────────┐
│ ← Drawer Builder                        │ [Header]
├─────────────────────────────────────────┤
│                                         │
│ [Cabinet Context Card]                  │ [Info panel]
│ Base Cabinet: 914mm W × 876mm H         │
│ Available Height: 840mm                 │
│ (after clearances)                      │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│ Number of Drawers                       │ [Input Section]
│ [ - ] 3 [ + ]                          │
│                                         │
│ Drawer Heights (Equal Distribution)     │
│ ┌─────────────────────────┐            │
│ │ Drawer 1: [200] mm      │            │
│ │ Drawer 2: [200] mm      │            │
│ │ Drawer 3: [200] mm      │            │
│ └─────────────────────────┘            │
│                                         │
│ [Auto-Balance Heights]                  │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│ Construction Methods                    │ [Method Selectors]
│                                         │
│ Corner Joinery                         │
│ ( ) Pocket Hole Screws (Default)      │
│ ( ) Butt Joints                        │
│ ( ) Dado Joints                        │
│                                         │
│ Bottom Attachment                       │
│ ( ) Applied (Nailed Under)             │
│ ( ) Captured in Dado Groove            │
│ ( ) Screwed from Below                 │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│ [Preview Card]                          │ [Live Calculation]
│ 3 drawers will generate:               │
│ • 6 drawer sides (vertical grain)      │
│ • 6 drawer fronts/backs (horiz grain)  │
│ • 3 drawer bottoms (either grain)      │
│ • 3 drawer faces (horiz grain)         │
│                                         │
│ Total parts: 18                         │
│                                         │
└─────────────────────────────────────────┘
│ [Cancel]  [Add Drawers to Cabinet]     │ [Footer]
└─────────────────────────────────────────┘
```

---

## Component Structure

### File: `src/screens/DrawerBuilderScreen.tsx`

```typescript
import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useProjectStore } from '../store/projectStore';
import { calculateDrawerParts } from '../utils/drawerCalculator';
import { mmToInches } from '../utils/unitConversion';

type Props = NativeStackScreenProps<RootStackParamList, 'DrawerBuilder'>;

export default function DrawerBuilderScreen({ route, navigation }: Props) {
  const { cabinetId } = route.params;
  
  // Get cabinet from store to show context
  const cabinets = useProjectStore(s => s.cabinets);
  const cabinet = cabinets.find(c => c.id === cabinetId);
  const units = useProjectStore(s => s.currentProject?.units);
  const addDrawer = useProjectStore(s => s.addDrawer);
  
  // State
  const [numDrawers, setNumDrawers] = useState(3);
  const [heights, setHeights] = useState<number[]>([200, 200, 200]); // mm
  const [cornerJoinery, setCornerJoinery] = useState<DrawerCornerJoinery>('pocket_hole');
  const [bottomMethod, setBottomMethod] = useState<DrawerBottomMethod>('applied');
  
  // Calculations
  const availableHeight = useMemo(() => {
    if (!cabinet) return 0;
    // Cabinet interior height minus clearances
    return cabinet.height - (DEFAULT_DRAWER_CLEARANCE * (numDrawers + 1));
  }, [cabinet, numDrawers]);
  
  const equalHeight = useMemo(() => {
    return Math.floor(availableHeight / numDrawers);
  }, [availableHeight, numDrawers]);
  
  // Preview calculation
  const previewParts = useMemo(() => {
    if (!cabinet) return [];
    const allParts: Part[] = [];
    heights.forEach((height, idx) => {
      const drawer: Omit<Drawer, 'id' | 'cabinetId'> = {
        height,
        cornerJoinery,
        bottomMethod,
      };
      const parts = calculateDrawerParts(cabinet, drawer, idx + 1);
      allParts.push(...parts);
    });
    return allParts;
  }, [cabinet, heights, cornerJoinery, bottomMethod]);
  
  // Handlers
  const handleNumDrawersChange = (delta: number) => {
    const newNum = Math.max(1, Math.min(10, numDrawers + delta));
    setNumDrawers(newNum);
    // Recalculate equal distribution
    const newHeights = Array(newNum).fill(equalHeight);
    setHeights(newHeights);
  };
  
  const handleAutoBalance = () => {
    const balanced = Array(numDrawers).fill(equalHeight);
    setHeights(balanced);
  };
  
  const handleHeightChange = (index: number, value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;
    const newHeights = [...heights];
    newHeights[index] = units === 'imperial' ? inchesToMm(numValue) : numValue;
    setHeights(newHeights);
  };
  
  const handleSave = () => {
    if (!cabinet) return;
    
    // Save each drawer
    heights.forEach((height) => {
      addDrawer(cabinetId, {
        height,
        cornerJoinery,
        bottomMethod,
      });
    });
    
    // Navigate back
    navigation.goBack();
  };
  
  const handleCancel = () => {
    navigation.goBack();
  };
  
  // Render
  return (
    <ScrollView style={styles.container}>
      {/* Cabinet Context Card */}
      <View style={styles.contextCard}>
        <Text style={styles.contextTitle}>
          {cabinet?.type} Cabinet: {displayDimension(cabinet?.width, units)} W × {displayDimension(cabinet?.height, units)} H
        </Text>
        <Text style={styles.contextSubtitle}>
          Available Height: {displayDimension(availableHeight, units)}
        </Text>
        <Text style={styles.contextNote}>
          (after {DEFAULT_DRAWER_CLEARANCE}mm clearances between drawers)
        </Text>
      </View>
      
      {/* Number of Drawers */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Number of Drawers</Text>
        <View style={styles.stepperRow}>
          <TouchableOpacity 
            style={styles.stepperButton}
            onPress={() => handleNumDrawersChange(-1)}
          >
            <Text style={styles.stepperButtonText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.stepperValue}>{numDrawers}</Text>
          <TouchableOpacity 
            style={styles.stepperButton}
            onPress={() => handleNumDrawersChange(1)}
          >
            <Text style={styles.stepperButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Drawer Heights */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Drawer Heights</Text>
        {heights.map((height, idx) => (
          <View key={idx} style={styles.inputRow}>
            <Text style={styles.inputLabel}>Drawer {idx + 1}:</Text>
            <TextInput
              style={styles.input}
              value={String(units === 'imperial' ? mmToInches(height).toFixed(2) : height)}
              onChangeText={(val) => handleHeightChange(idx, val)}
              keyboardType="numeric"
            />
            <Text style={styles.inputUnit}>{units === 'imperial' ? 'in' : 'mm'}</Text>
          </View>
        ))}
        <TouchableOpacity 
          style={styles.autoBalanceButton}
          onPress={handleAutoBalance}
        >
          <Text style={styles.autoBalanceButtonText}>Auto-Balance Heights</Text>
        </TouchableOpacity>
      </View>
      
      {/* Corner Joinery */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Corner Joinery</Text>
        <RadioGroup
          options={[
            { value: 'pocket_hole', label: 'Pocket Hole Screws', description: 'Easiest, requires jig' },
            { value: 'butt_joint', label: 'Butt Joints', description: 'Simplest, screws or nails' },
            { value: 'dado', label: 'Dado Joints', description: 'Stronger, requires router' },
          ]}
          selected={cornerJoinery}
          onSelect={setCornerJoinery}
        />
      </View>
      
      {/* Bottom Attachment */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bottom Attachment</Text>
        <RadioGroup
          options={[
            { value: 'applied', label: 'Applied (Nailed Under)', description: 'Easiest, bottom nailed to underside' },
            { value: 'captured_dado', label: 'Captured in Dado Groove', description: 'Stronger, router required' },
            { value: 'screwed', label: 'Screwed from Below', description: 'Simple, bottom screwed up into sides' },
          ]}
          selected={bottomMethod}
          onSelect={setBottomMethod}
        />
      </View>
      
      {/* Preview */}
      <View style={styles.previewCard}>
        <Text style={styles.previewTitle}>Preview</Text>
        <Text style={styles.previewText}>
          {numDrawers} {numDrawers === 1 ? 'drawer' : 'drawers'} will generate:
        </Text>
        <Text style={styles.previewDetail}>
          • {numDrawers * 2} drawer sides (vertical grain)
        </Text>
        <Text style={styles.previewDetail}>
          • {numDrawers * 2} drawer fronts/backs (horizontal grain)
        </Text>
        <Text style={styles.previewDetail}>
          • {numDrawers} drawer bottoms (either grain)
        </Text>
        <Text style={styles.previewDetail}>
          • {numDrawers} drawer faces (horizontal grain)
        </Text>
        <Text style={styles.previewTotal}>
          Total parts: {previewParts.length}
        </Text>
      </View>
      
      {/* Footer Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.button, styles.cancelButton]}
          onPress={handleCancel}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, styles.saveButton]}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>Add Drawers to Cabinet</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
```

---

## Key Features

### 1. Cabinet Context Display
**Purpose:** Remind user which cabinet they're adding drawers to

**Implementation:**
```typescript
const cabinet = cabinets.find(c => c.id === cabinetId);
const availableHeight = cabinet.height - (DEFAULT_DRAWER_CLEARANCE * (numDrawers + 1));
```

Shows:
- Cabinet type, width, height
- Available height (after clearances)
- Clearance explanation

### 2. Dynamic Drawer Count
**Purpose:** Let user specify 1-10 drawers with stepper control

**Implementation:**
- Use +/- buttons (better than number input for mobile)
- Min: 1, Max: 10 (reasonable limit)
- When count changes, recalculate equal distribution
- Update heights array to match new count

### 3. Individual Height Inputs
**Purpose:** Allow custom height per drawer

**Features:**
- One input per drawer
- Label: "Drawer 1:", "Drawer 2:", etc.
- Converts between mm/inches based on user units
- Validates input (positive numbers only)

### 4. Auto-Balance Button
**Purpose:** Quick way to distribute height equally

**Calculation:**
```typescript
const availableHeight = cabinet.height - (DEFAULT_DRAWER_CLEARANCE * (numDrawers + 1));
const equalHeight = Math.floor(availableHeight / numDrawers);
```

Accounts for:
- Clearance above top drawer (12mm)
- Clearance between each drawer (12mm each)
- Clearance below bottom drawer (12mm)

### 5. Construction Method Selectors
**Purpose:** Let user choose joinery and bottom attachment

**Implementation:**
- Radio button groups (single selection per category)
- Include brief descriptions (not overwhelming)
- Default: pocket_hole + applied (easiest methods)

Options match existing calculator:
```typescript
type DrawerCornerJoinery = 'pocket_hole' | 'butt_joint' | 'dado';
type DrawerBottomMethod = 'applied' | 'captured_dado' | 'screwed';
```

### 6. Live Preview
**Purpose:** Show what will be generated before saving

**Implementation:**
- Call `calculateDrawerParts()` in useMemo
- Count parts by type (sides, fronts/backs, bottoms, faces)
- Show grain orientation
- Display total part count

Helps user understand:
- What they're creating
- How many parts will be in cut list
- Validation that calculator is working

### 7. Save to Store
**Purpose:** Persist drawers to database

**Implementation:**
```typescript
heights.forEach((height) => {
  addDrawer(cabinetId, {
    height,
    cornerJoinery,
    bottomMethod,
  });
});
```

Each drawer saved separately with:
- Unique ID (generated by store)
- Cabinet ID reference (foreign key)
- Height, joinery, bottom method

---

## Navigation Integration

### Update CabinetBuilderScreen

**Add "Add Drawers" button:**
```typescript
<TouchableOpacity 
  style={styles.addDrawersButton}
  onPress={() => navigation.navigate('DrawerBuilder', { cabinetId: currentCabinetId })}
>
  <Text style={styles.addDrawersButtonText}>Add Drawers</Text>
</TouchableOpacity>
```

**Flow:**
1. User builds cabinet (enters dimensions, selects joinery)
2. Clicks "Add Drawers" → navigates to DrawerBuilderScreen
3. User configures drawers
4. Clicks "Add Drawers to Cabinet" → saves and navigates back
5. User then clicks "Add to Project" on CabinetBuilderScreen

**Alternative Flow (simpler):**
- Skip drawers initially
- Add cabinet without drawers
- From ReviewEditScreen, tap cabinet card → edit → add drawers
- This is V2 enhancement (edit existing cabinet)

### Update Navigation Types

**File: `src/navigation/types.ts`**
```typescript
export type RootStackParamList = {
  Home: undefined;
  ProjectSetup: undefined;
  CabinetBuilder: undefined;
  DrawerBuilder: { cabinetId: string }; // ADD THIS
  ReviewEdit: undefined;
  CuttingPlan: undefined;
  // ... other screens
};
```

---

## Validation & Error Handling

### Input Validation

1. **Drawer Heights:**
   - Must be positive numbers
   - Total height (sum + clearances) should not exceed cabinet interior height
   - Warning if total exceeds available space
   - Minimum height: 50mm (2") per drawer

2. **Number of Drawers:**
   - Min: 1, Max: 10
   - If user tries to go outside range, disable button

3. **Construction Methods:**
   - Always have one selected (default values set on mount)
   - No "none" option (drawers must have construction method)

### User Feedback

**Over-Height Warning:**
```typescript
const totalHeight = heights.reduce((sum, h) => sum + h, 0) + 
                    (DEFAULT_DRAWER_CLEARANCE * (numDrawers + 1));
const exceedsHeight = totalHeight > cabinet.height;

{exceedsHeight && (
  <View style={styles.warning}>
    <Text style={styles.warningText}>
      ⚠️ Total height exceeds cabinet interior. Auto-balance or reduce drawer heights.
    </Text>
  </View>
)}
```

**Save Button Disabled:**
- Disable if total height exceeds cabinet
- Disable if any height is ≤ 0
- Show tooltip explaining why disabled

---

## Styling Guidelines

### Match Existing Screens

**Follow patterns from:**
- ProjectSetupScreen (radio groups, section layout)
- CabinetBuilderScreen (input rows, footer buttons)
- ReviewEditScreen (card styling)

**Color Scheme:**
- Primary: #2563eb (blue)
- Success: #10b981 (green)
- Warning: #f59e0b (orange)
- Error: #ef4444 (red)
- Background: #f3f4f6 (light gray)
- Card: #ffffff (white)

**Typography:**
- Section titles: 18px, bold
- Input labels: 14px, medium
- Body text: 14px, regular
- Helper text: 12px, gray

### Responsive Considerations

**Mobile First:**
- Stepper buttons touch-friendly (min 44×44 points)
- Input fields full width on mobile
- Radio buttons with adequate spacing
- Footer buttons stacked on small screens

**Web Adaptation:**
- Side-by-side layout for larger screens
- Fixed max-width (600px) for readability
- Centered content

---

## Testing Strategy

### Manual Testing Checklist

**Drawer Count:**
- [ ] Increase drawer count to 10 → heights recalculate
- [ ] Decrease drawer count to 1 → heights recalculate
- [ ] Click +/− rapidly → no UI glitches

**Height Inputs:**
- [ ] Enter custom heights → preview updates
- [ ] Enter non-numeric → validation prevents
- [ ] Enter negative → validation prevents
- [ ] Total exceeds cabinet → warning shows
- [ ] Click auto-balance → heights distribute equally
- [ ] Switch units (Imperial ↔ Metric) → values convert

**Construction Methods:**
- [ ] Select each corner joinery → preview updates
- [ ] Select each bottom method → preview updates
- [ ] Defaults pre-selected on load

**Save & Navigation:**
- [ ] Click "Add Drawers to Cabinet" → drawers saved
- [ ] Navigate back to CabinetBuilder → drawers persisted
- [ ] Click "Cancel" → no drawers saved
- [ ] Drawers appear in ReviewEditScreen cabinet cards

**Integration:**
- [ ] Add cabinet with drawers → appears in cut list
- [ ] Drawer parts have correct grain direction
- [ ] Drawer faces calculated with reveals
- [ ] Joinery adjustments applied correctly

### Unit Test Additions

**File: `src/screens/__tests__/DrawerBuilderScreen.test.tsx`**

Test cases:
- Renders with cabinet context
- Calculates available height correctly
- Updates heights when drawer count changes
- Auto-balance distributes heights equally
- Warning shows when total exceeds cabinet height
- Preview updates when methods change
- Save calls addDrawer for each drawer
- Cancel navigates back without saving

---

## Success Criteria

**Phase 3.3 Complete When:**
- [x] DrawerBuilderScreen renders correctly
- [x] Cabinet context displays (type, dimensions, available height)
- [x] Drawer count stepper works (1-10 range)
- [x] Height inputs work (individual per drawer)
- [x] Auto-balance button distributes heights equally
- [x] Corner joinery selector works (3 options)
- [x] Bottom method selector works (3 options)
- [x] Live preview shows correct part counts and grain
- [x] Save button adds all drawers to store
- [x] Navigation works (to/from CabinetBuilder)
- [x] Validation prevents invalid inputs
- [x] Drawers appear in ReviewEditScreen
- [x] Drawers generate parts in CuttingPlanScreen
- [x] Unit/Imperial conversion works correctly
- [x] 0 TypeScript errors

**User Can:**
1. Add drawers to any cabinet
2. Specify custom heights or use auto-balance
3. Choose construction methods
4. See preview before saving
5. Navigate back and see changes persisted

---

## Next Steps After Completion

**Immediate:**
- Update ROADMAP.md (check off Phase 3.3)
- Update CLAUDE.md (document DrawerBuilderScreen)
- Commit with message: `feat: implement DrawerBuilderScreen (Phase 3.3)`

**Phase 3.4 Enhancement (Optional):**
- Edit existing cabinet from ReviewEditScreen
- Pre-fill DrawerBuilderScreen with existing drawer data
- Delete individual drawers

**Phase 4 Preparation:**
- All UI complete → ready for sheet optimization algorithm
- Drawer parts will be included in cutting diagrams
- Multi-cabinet projects with drawers testable

---

## Implementation Checklist for Claude Code

### Pre-Implementation
- [ ] Read CLAUDE.md for existing patterns
- [ ] Review DrawerCalculator.ts to understand data flow
- [ ] Check CabinetBuilderScreen for UI patterns to replicate
- [ ] Verify projectStore.addDrawer() method signature

### Development Steps
1. [ ] Create `src/screens/DrawerBuilderScreen.tsx`
2. [ ] Add DrawerBuilder to navigation types
3. [ ] Update CabinetBuilderScreen with "Add Drawers" button
4. [ ] Implement cabinet context display
5. [ ] Implement drawer count stepper
6. [ ] Implement height inputs with conversion
7. [ ] Implement auto-balance button
8. [ ] Implement corner joinery selector
9. [ ] Implement bottom method selector
10. [ ] Implement live preview calculation
11. [ ] Implement save handler (calls addDrawer)
12. [ ] Implement cancel handler (navigation)
13. [ ] Add validation and warnings
14. [ ] Style components (match existing screens)
15. [ ] Test navigation flow
16. [ ] Test with Imperial and Metric units
17. [ ] Verify drawers appear in ReviewEditScreen
18. [ ] Verify drawer parts in CuttingPlanScreen
19. [ ] Run TypeScript type check: `npx tsc --noEmit`
20. [ ] Update ROADMAP.md and CLAUDE.md

### Post-Implementation
- [ ] Test on web (`npx expo start --web`)
- [ ] Manual smoke test (complete workflow)
- [ ] Commit with descriptive message
- [ ] Update NEXT_SESSION_PLAN.md if exists

---

## Reference Links

**Related Files:**
- `src/utils/drawerCalculator.ts` - Calculator engine
- `src/types/index.ts` - Type definitions
- `src/store/projectStore.ts` - State management
- `src/constants/cabinetDefaults.ts` - Constants
- `src/screens/CabinetBuilderScreen.tsx` - Similar UI patterns
- `src/screens/ProjectSetupScreen.tsx` - Radio group patterns

**Documentation:**
- ROADMAP.md - Phase 3.3 specification
- CLAUDE.md - Module reference and patterns
- HANDOFF.md - AI collaboration protocols

---

**Ready to implement!** This screen completes the data input workflow and enables full end-to-end testing with drawers included in cut lists.
