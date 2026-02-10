# Claude Code Session Plan - Phase 1 Completion & Phase 3 UI Start

**Date Created:** February 9, 2026  
**Session Goal:** Complete Phase 1 with tests, add visual progress check, then build foundational UI screens  
**Expected Duration:** 2-3 hours of coding time  
**Target Outcome:** Ryan can test the app end-to-end and see his calculation engine in action

---

## Session Overview

This session follows a strategic three-part approach:

### Part 1: Test Calculators First ✅
Build unit tests to validate the calculation engine is bulletproof before UI work.

### Part 2: Visual Progress Check 👀
Create a quick demonstration screen to see calculations in action immediately.

### Part 3: Build Core UI (Phase 3 Start) 🎨
Implement the three critical screens needed for end-to-end workflow.

---

## PART 1: Unit Tests for Calculation Engine (1 hour)

### Objective
Validate that all four calculators work correctly with real-world scenarios.

### Files to Create
```
src/__tests__/
  ├── cabinetCalculator.test.ts
  ├── drawerCalculator.test.ts
  ├── revealCalculator.test.ts
  └── grainLogic.test.ts
```

### Setup Jest Testing Framework

**Step 1.1: Install Testing Dependencies**
```bash
npx expo install jest-expo jest @testing-library/react-native @types/jest
```

**Step 1.2: Add Jest Config to package.json**
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch"
  },
  "jest": {
    "preset": "jest-expo",
    "transformIgnorePatterns": [
      "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)"
    ]
  }
}
```

### Test Suite 1: cabinetCalculator.test.ts

**Test Cases to Implement:**

```typescript
import { calculateCabinetParts } from '../utils/cabinetCalculator';
import { Cabinet } from '../types';

describe('cabinetCalculator', () => {
  
  test('Base cabinet with pocket screws and standard toe kick', () => {
    const cabinet: Cabinet = {
      id: 'test-1',
      projectId: 'proj-1',
      type: 'base',
      width: 914,        // 36 inches
      height: 876,       // 34.5 inches
      depth: 610,        // 24 inches
      toeKickOption: 'standard',
      toeKickHeight: 102,  // 4 inches
      joineryMethod: 'pocket_hole',
    };

    const parts = calculateCabinetParts(cabinet);

    // Should have 6 parts: 2 sides, top, bottom, back, toe kick
    expect(parts).toHaveLength(6);

    // Sides should be full height (876mm)
    const sides = parts.filter(p => p.partType === 'side');
    expect(sides).toHaveLength(2);
    expect(sides[0].height).toBe(876);

    // Top and bottom should fit between sides
    const top = parts.find(p => p.partType === 'top');
    expect(top?.width).toBe(914 - (2 * 19));  // Cabinet width - 2x side thickness

    // Back should exist
    const back = parts.find(p => p.partType === 'back');
    expect(back).toBeDefined();
    expect(back?.material).toBe('1/4" Plywood');

    // Toe kick should exist
    const toeKick = parts.find(p => p.partType === 'toe_kick');
    expect(toeKick).toBeDefined();
  });

  test('Wall cabinet with dado joints (no toe kick)', () => {
    const cabinet: Cabinet = {
      id: 'test-2',
      projectId: 'proj-1',
      type: 'wall',
      width: 762,        // 30 inches
      height: 762,       // 30 inches
      depth: 305,        // 12 inches
      toeKickOption: 'none',
      toeKickHeight: 0,
      joineryMethod: 'dado_rabbet',
    };

    const parts = calculateCabinetParts(cabinet);

    // Should have 5 parts: 2 sides, top, bottom, back (no toe kick)
    expect(parts).toHaveLength(5);

    // Top and bottom should be WIDER due to dado depth
    const top = parts.find(p => p.partType === 'top');
    const expectedWidth = 762 - (2 * 19) + (2 * 6.35); // dado adds 6.35mm each side
    expect(top?.width).toBeCloseTo(expectedWidth, 1);

    // Sides should have dado note
    const sides = parts.filter(p => p.partType === 'side');
    expect(sides[0].notes).toContain('dado');
  });

  test('Base cabinet with custom toe kick height', () => {
    const cabinet: Cabinet = {
      id: 'test-3',
      projectId: 'proj-1',
      type: 'base',
      width: 610,
      height: 876,
      depth: 610,
      toeKickOption: 'custom',
      toeKickHeight: 150,  // Custom 150mm (about 6 inches)
      joineryMethod: 'pocket_hole',
    };

    const parts = calculateCabinetParts(cabinet);

    const toeKick = parts.find(p => p.partType === 'toe_kick');
    expect(toeKick?.height).toBe(150);
  });

  test('Cabinet with no toe kick (feet or frame)', () => {
    const cabinet: Cabinet = {
      id: 'test-4',
      projectId: 'proj-1',
      type: 'base',
      width: 914,
      height: 876,
      depth: 610,
      toeKickOption: 'none',
      toeKickHeight: 0,
      joineryMethod: 'pocket_hole',
    };

    const parts = calculateCabinetParts(cabinet);

    // Should NOT have toe kick
    const toeKick = parts.find(p => p.partType === 'toe_kick');
    expect(toeKick).toBeUndefined();

    // Should have 5 parts total
    expect(parts).toHaveLength(5);
  });
});
```

### Test Suite 2: drawerCalculator.test.ts

**Test Cases to Implement:**

```typescript
import { calculateDrawerParts } from '../utils/drawerCalculator';
import { Drawer } from '../types';

describe('drawerCalculator', () => {

  test('Standard drawer with pocket holes and applied bottom', () => {
    const drawer: Drawer = {
      id: 'drawer-1',
      cabinetId: 'cab-1',
      width: 850,      // Internal box width
      height: 150,     // Internal box height
      depth: 560,      // Internal box depth
      cornerJoinery: 'pocket_hole',
      bottomMethod: 'applied',
    };

    const parts = calculateDrawerParts(drawer);

    // Should have 5 parts
    expect(parts).toHaveLength(5);

    // Front and back
    const front = parts.find(p => p.partType === 'drawer_front_inner');
    expect(front?.width).toBe(850);

    // Sides run front to back
    const sides = parts.filter(p => p.partType === 'drawer_side');
    expect(sides).toHaveLength(2);
    expect(sides[0].height).toBe(150);

    // Applied bottom should be external dimensions
    const bottom = parts.find(p => p.partType === 'drawer_bottom');
    expect(bottom?.material).toBe('1/4" Plywood');
  });

  test('Drawer with dado corners and captured bottom', () => {
    const drawer: Drawer = {
      id: 'drawer-2',
      cabinetId: 'cab-1',
      width: 850,
      height: 150,
      depth: 560,
      cornerJoinery: 'dado',
      bottomMethod: 'captured_dado',
    };

    const parts = calculateDrawerParts(drawer);

    // Front and back should be adjusted for dado
    const front = parts.find(p => p.partType === 'drawer_front_inner');
    // Should be narrower because it fits INTO dado grooves
    
    // Bottom should be sized for captured groove
    const bottom = parts.find(p => p.partType === 'drawer_bottom');
    expect(bottom).toBeDefined();
  });

  test('Multiple drawers maintain consistent construction', () => {
    // Create 3 drawers of different heights
    const drawer1Height = 100;
    const drawer2Height = 150;
    const drawer3Height = 200;

    const drawer1 = calculateDrawerParts({
      id: 'd1', cabinetId: 'c1', width: 850, height: drawer1Height,
      depth: 560, cornerJoinery: 'pocket_hole', bottomMethod: 'applied'
    });

    const drawer2 = calculateDrawerParts({
      id: 'd2', cabinetId: 'c1', width: 850, height: drawer2Height,
      depth: 560, cornerJoinery: 'pocket_hole', bottomMethod: 'applied'
    });

    // All should have 5 parts each
    expect(drawer1).toHaveLength(5);
    expect(drawer2).toHaveLength(5);

    // Heights should be different
    const d1Side = drawer1.find(p => p.partType === 'drawer_side');
    const d2Side = drawer2.find(p => p.partType === 'drawer_side');
    expect(d1Side?.height).toBe(drawer1Height);
    expect(d2Side?.height).toBe(drawer2Height);
  });
});
```

### Test Suite 3: revealCalculator.test.ts

**Test Cases to Implement:**

```typescript
import {
  calculateSingleDoorDims,
  calculateDoubleDoorDims,
  calculateDrawerFaceDims,
} from '../utils/revealCalculator';

describe('revealCalculator', () => {

  test('Single door: 914mm cabinet = 911mm door', () => {
    const result = calculateSingleDoorDims(914, 876);

    // Width: 914mm - 3mm reveal = 911mm
    expect(result.width).toBe(911);

    // Height: 876mm - 3mm top reveal - 0mm bottom = 873mm
    expect(result.height).toBe(873);
  });

  test('Double doors: 914mm cabinet = 2x 453.25mm doors', () => {
    const result = calculateDoubleDoorDims(914, 876);

    // Each door: (914mm - 3mm side reveals - 3mm center gap) / 2
    // = (914 - 6) / 2 = 454mm each
    // But with center gap, each loses 1.5mm more
    expect(result.leftWidth).toBeCloseTo(453.25, 2);
    expect(result.rightWidth).toBeCloseTo(453.25, 2);
    expect(result.height).toBe(873);
  });

  test('Drawer face with standard reveals', () => {
    const openingWidth = 850;
    const openingHeight = 150;

    const result = calculateDrawerFaceDims(openingWidth, openingHeight);

    // Width: 850 - 3mm = 847mm
    expect(result.width).toBe(847);

    // Height depends on reveal settings
    expect(result.height).toBeLessThan(openingHeight);
  });

  test('Stacked drawers have gaps between faces', () => {
    // Simulate 3 drawers stacked vertically
    const cabinetHeight = 600;
    const drawerHeights = [150, 200, 250];  // Total = 600

    // Each face should be opening - reveal
    const face1 = calculateDrawerFaceDims(850, drawerHeights[0]);
    const face2 = calculateDrawerFaceDims(850, drawerHeights[1]);
    const face3 = calculateDrawerFaceDims(850, drawerHeights[2]);

    // Sum of face heights should be less than cabinet height
    // due to reveals creating gaps
    const totalFaceHeight = face1.height + face2.height + face3.height;
    expect(totalFaceHeight).toBeLessThan(cabinetHeight);
  });
});
```

### Test Suite 4: grainLogic.test.ts

**Test Cases to Implement:**

```typescript
import { assignGrainDirection, canRotatePart } from '../utils/grainLogic';
import { Part } from '../types';

describe('grainLogic', () => {

  test('Cabinet sides must be vertical grain', () => {
    const part: Part = {
      id: 'p1',
      cabinetId: 'c1',
      drawerId: undefined,
      partType: 'side',
      width: 610,
      height: 876,
      thickness: 19,
      material: '3/4" Plywood',
      quantity: 1,
      grainDirection: 'horizontal', // Will be overridden
      notes: '',
    };

    const direction = assignGrainDirection(part);
    expect(direction).toBe('vertical');

    const rotatable = canRotatePart(part);
    expect(rotatable).toBe(false);
  });

  test('Cabinet tops/bottoms must be horizontal grain', () => {
    const topPart: Part = {
      id: 'p2',
      cabinetId: 'c1',
      drawerId: undefined,
      partType: 'top',
      width: 876,
      height: 610,
      thickness: 19,
      material: '3/4" Plywood',
      quantity: 1,
      grainDirection: 'horizontal',
      notes: '',
    };

    const direction = assignGrainDirection(topPart);
    expect(direction).toBe('horizontal');
    expect(canRotatePart(topPart)).toBe(false);
  });

  test('Cabinet backs can rotate if needed', () => {
    const backPart: Part = {
      id: 'p3',
      cabinetId: 'c1',
      drawerId: undefined,
      partType: 'back',
      width: 876,
      height: 876,
      thickness: 6,
      material: '1/4" Plywood',
      quantity: 1,
      grainDirection: 'vertical',
      notes: '',
    };

    // Back prefers vertical but can rotate
    expect(canRotatePart(backPart)).toBe(true);
  });

  test('Drawer bottoms can rotate freely', () => {
    const bottomPart: Part = {
      id: 'p4',
      cabinetId: 'c1',
      drawerId: 'd1',
      partType: 'drawer_bottom',
      width: 850,
      height: 560,
      thickness: 6,
      material: '1/4" Plywood',
      quantity: 1,
      grainDirection: 'either',
      notes: '',
    };

    const direction = assignGrainDirection(bottomPart);
    expect(direction).toBe('either');
    expect(canRotatePart(bottomPart)).toBe(true);
  });
});
```

### Success Criteria for Part 1
- [ ] All test files created
- [ ] Jest runs without errors
- [ ] All tests pass
- [ ] Coverage shows calculators are working correctly
- [ ] Tests document expected behavior clearly

---

## PART 2: Visual Progress Check Screen (30 minutes)

### Objective
Create a demonstration screen that shows calculations working with real data, so Ryan can see results immediately.

### File to Create
```
src/screens/CalculatorDemoScreen.tsx
```

### Implementation Details

See the full TypeScript implementation in the detailed version of this document. The demo screen should:

- Show three tabs: Base Cabinet, Wall Cabinet, Drawer
- Display input configuration for selected demo
- Calculate and show all parts with grain direction indicators
- Calculate and show door/face dimensions
- Provide summary statistics

### Navigation Updates

Add to `src/navigation/types.ts`:
```typescript
CalculatorDemo: undefined;
```

Add to `AppNavigator.tsx`:
```typescript
<Stack.Screen 
  name="CalculatorDemo" 
  component={CalculatorDemoScreen}
  options={{ title: 'Calculator Demo' }}
/>
```

Add to `HomeScreen.tsx`:
```typescript
<Button
  title="🔧 Test Calculator Demo"
  onPress={() => navigation.navigate('CalculatorDemo')}
  color="#4CAF50"
/>
```

### Success Criteria for Part 2
- [ ] Demo screen displays sample cabinet parts
- [ ] Can switch between base/wall/drawer demos
- [ ] All calculations display in Imperial units
- [ ] Grain direction arrows show correctly
- [ ] Door dimensions calculate properly
- [ ] Ryan can click through and see calculations working

---

## PART 3: Build Core UI Screens (1-1.5 hours)

### Screen 1: ProjectSetupScreen.tsx

**Replace placeholder with functional form:**

Features:
- Project name input with validation
- Unit toggle (Imperial/Metric)
- Default joinery method selector (4 cards)
- Create/Cancel buttons
- Calls `createProject` from store
- Navigates to Home on success

### Screen 2: CabinetBuilderScreen.tsx

**Simplified V1 implementation:**

Features:
- Cabinet type selector (Base/Wall/Tall buttons)
- Dimension inputs (Width/Height/Depth in inches)
- Joinery method selector
- Toe kick options (base cabinets only)
- Add Cabinet button → saves to database
- Cancel button

### Screen 3: ReviewEditScreen.tsx

**List all cabinets with actions:**

Features:
- Project header with cabinet count
- Cabinet cards showing:
  - Type badge
  - Dimensions
  - Joinery method
  - Toe kick option (if base)
  - Delete button
- Empty state when no cabinets
- "Add Cabinet" button
- "Generate Cut List" button (navigates to CuttingPlan)

### Success Criteria for Part 3
- [ ] Can create a new project with settings
- [ ] Can add multiple cabinets with different configurations
- [ ] Cabinets persist to database
- [ ] Can view all cabinets in review screen
- [ ] Can delete cabinets
- [ ] Can navigate back and forth smoothly
- [ ] Basic validation works (e.g., project name required)

---

## Post-Session Checklist

After Claude Code completes this session, verify:

**Part 1 (Tests):**
- [ ] Run `npm test` — all tests pass
- [ ] Review test coverage — calculators are tested
- [ ] Tests document expected behavior clearly

**Part 2 (Demo):**
- [ ] Run app and navigate to Calculator Demo
- [ ] Switch between Base/Wall/Drawer demos
- [ ] All calculations display correctly
- [ ] Grain direction icons show

**Part 3 (UI):**
- [ ] Create a test project
- [ ] Add 2-3 cabinets with different configurations
- [ ] View them in Review screen
- [ ] Delete one cabinet
- [ ] Confirm data persists (close/reopen app)

---

## Commit Strategy

Claude Code should make commits at these milestones:

1. **After Part 1:** `test: add unit tests for Phase 1 calculators (Phase 1.5)`
2. **After Part 2:** `feat: add calculator demo screen for visual validation (Phase 1.5)`
3. **After Part 3:** `feat: implement core UI screens - ProjectSetup, CabinetBuilder, ReviewEdit (Phase 3.1-3.4)`

---

## Update Documentation

Before ending the session, Claude Code should update:

**ROADMAP.md:**
- [x] Check off Phase 1 milestones 1.1-1.4 as complete
- [x] Check off Phase 1.5 (Testing) as complete
- [x] Mark Phase 3, Milestones 3.1, 3.2, 3.4 as complete
- Update "Current State" section with new status

**CLAUDE.md:**
- Add test files to "Implemented Modules"
- Add demo screen to screen list
- Note that three core UI screens are now functional

---

## Expected Outcome

After this session, Ryan will have:

1. **Validated Calculators** — Unit tests prove the math works
2. **Visual Confirmation** — Demo screen shows calculations in action
3. **Working Workflow** — Can create project → add cabinets → review list

**Most importantly:** Ryan can now **test the app as a user** and provide feedback on the experience before diving deeper into advanced features.

---

## Next Session Preview

**Option A is DONE ✅ — CuttingPlanScreen is now functional.**

The end-to-end workflow is complete: create project → add cabinets → review → cut list.

Remaining options:

**Option B: Add Drawer Support (Phase 3.3)**
- Implement `DrawerBuilderScreen.tsx` (placeholder exists, needs real UI)
- Wire up `calculateDrawerParts()` to the UI
- Let users add drawers to cabinets, have those parts appear in the cut list

**Option C: Sheet Goods Optimizer (Phase 4 — The Killer Feature)**
- Build `src/utils/optimizer/binPacking.ts` — Guillotine FFD algorithm
- Build SVG cutting diagram component
- See `SHEET_OPTIMIZER_RESEARCH.md` for full algorithm guidance

**Option D: Improve UX Polish**
- Preset size quick-select buttons on CabinetBuilderScreen
- Real-time dimension preview on CabinetBuilderScreen
- Edit cabinet (pre-filled builder) from ReviewEditScreen

Ryan decides based on what he wants to test next!

---

**Ready to Start? Copy this command for Claude Code:**

```bash
claude "Let's complete Phase 1 and start Phase 3 UI. Read NEXT_SESSION_PLAN.md and follow it step-by-step. Start with Part 1 (unit tests), then Part 2 (demo screen), then Part 3 (core UI screens). Update ROADMAP.md and CLAUDE.md when done."
```
