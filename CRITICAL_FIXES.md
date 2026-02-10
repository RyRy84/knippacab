# CRITICAL FIXES - Read This FIRST Before NEXT_SESSION_PLAN.md

**Date:** February 9, 2026  
**Priority:** CRITICAL - Must be completed before other tasks  
**Estimated Time:** 30-45 minutes

---

## 🚨 ISSUES IDENTIFIED BY RYAN

During review of the calculator demo screen, Ryan identified two critical bugs:

###1️⃣ **Doors and Drawer Faces Missing from Parts List**

**Problem:** 
- Doors/faces are calculated separately but NOT added to parts array
- They won't appear in cut lists
- They won't be optimized in sheet cutting diagrams
- Demo screen shows them separately instead of integrated

**Impact:** HIGH - This breaks the core value proposition

### 2️⃣ **Grain Direction Not Assigned to Doors/Faces**

**Problem:**
- Door panels need vertical grain (always)
- Drawer faces need grain based on aspect ratio
- Currently no grain assignment for these parts

**Impact:** MEDIUM - Required for sheet optimization Phase 4

---

## ✅ FIXES REQUIRED (Complete BEFORE Part 1 of NEXT_SESSION_PLAN.md)

### Fix 1: Add Door Part Types to TypeScript

**File:** `src/types/index.ts`

Add to `PartType` union type:

```typescript
export type PartType =
  | 'side'
  | 'top'
  | 'bottom'
  | 'back'
  | 'toe_kick'
  | 'door'              // NEW: Single door
  | 'door_left'         // NEW: Left door in double door setup
  | 'door_right'        // NEW: Right door in double door setup
  | 'drawer_front_inner'
  | 'drawer_back'
  | 'drawer_side'
  | 'drawer_bottom'
  | 'drawer_face';      // NEW: Drawer face panel
```

### Fix 2: Modify Cabinet Calculator to Generate Door Parts

**File:** `src/utils/cabinetCalculator.ts`

**Add import at top:**
```typescript
import {
  calculateSingleDoorDims,
  calculateDoubleDoorDims,
} from './revealCalculator';
```

**Add at end of `calculateCabinetParts()` function, BEFORE `return parts;`:**

```typescript
// =============================================================================
// DOOR GENERATION (CRITICAL FIX - doors must be in parts list)
// =============================================================================

// All base and wall cabinets get doors in V1
// TODO Phase 2: Make doors optional via cabinet configuration
if (cabinet.type === 'base' || cabinet.type === 'wall') {
  // Determine single vs double doors
  // Rule: Cabinets wider than 600mm (≈24") get double doors
  const useDoubleDoors = cabinet.width > 600;

  if (useDoubleDoors) {
    const doorDims = calculateDoubleDoorDims(cabinet.width, cabinet.height);
    
    // Left door
    addPart({
      partType: 'door_left',
      width: doorDims.leftWidth,
      height: doorDims.height,
      thickness: THICKNESS_3_4_INCH_MM,
      material: DEFAULT_BOX_MATERIAL,
      quantity: 1,
      grainDirection: 'vertical',  // Doors ALWAYS vertical grain
      notes: 'Left door panel',
    });

    // Right door
    addPart({
      partType: 'door_right',
      width: doorDims.rightWidth,
      height: doorDims.height,
      thickness: THICKNESS_3_4_INCH_MM,
      material: DEFAULT_BOX_MATERIAL,
      quantity: 1,
      grainDirection: 'vertical',  // Doors ALWAYS vertical grain
      notes: 'Right door panel',
    });
  } else {
    // Single door for narrow cabinets
    const doorDims = calculateSingleDoorDims(cabinet.width, cabinet.height);
    
    addPart({
      partType: 'door',
      width: doorDims.width,
      height: doorDims.height,
      thickness: THICKNESS_3_4_INCH_MM,
      material: DEFAULT_BOX_MATERIAL,
      quantity: 1,
      grainDirection: 'vertical',  // Doors ALWAYS vertical grain
      notes: 'Door panel',
    });
  }
}

return parts;
```

### Fix 3: Modify Drawer Calculator to Generate Face Parts

**File:** `src/utils/drawerCalculator.ts`

**Add import at top:**
```typescript
import { calculateDrawerFaceDims } from './revealCalculator';
```

**Add at end of `calculateDrawerParts()` function, BEFORE `return parts;`:**

```typescript
// =============================================================================
// DRAWER FACE GENERATION (CRITICAL FIX - faces must be in parts list)
// =============================================================================

// Generate drawer face panel (decorative front)
const faceDims = calculateDrawerFaceDims(drawer.width, drawer.height);

// Determine grain direction based on aspect ratio
// Wide drawers (width > 1.5× height) → horizontal grain
// Tall/square drawers → vertical grain
const faceGrain: GrainDirection = 
  faceDims.width > (faceDims.height * 1.5) ? 'horizontal' : 'vertical';

addPart({
  partType: 'drawer_face',
  width: faceDims.width,
  height: faceDims.height,
  thickness: THICKNESS_3_4_INCH_MM,
  material: DEFAULT_BOX_MATERIAL,
  quantity: 1,
  grainDirection: faceGrain,
  notes: 'Decorative drawer face panel',
});

return parts;
```

### Fix 4: Update Grain Logic for New Part Types

**File:** `src/utils/grainLogic.ts`

**In `assignGrainDirection()` function, add these cases:**

```typescript
// Door panels - ALWAYS vertical grain for aesthetics
case 'door':
case 'door_left':
case 'door_right':
  return 'vertical';

// Drawer faces - grain based on aspect ratio
case 'drawer_face':
  // Wide drawers (width > 1.5× height) → horizontal grain
  // Tall/square drawers → vertical grain
  if (part.width > (part.height * 1.5)) {
    return 'horizontal';
  }
  return 'vertical';
```

**In `canRotatePart()` function, add these cases:**

```typescript
// Doors and drawer faces CANNOT rotate - grain direction is critical
case 'door':
case 'door_left':
case 'door_right':
case 'drawer_face':
  return false;
```

### Fix 5: Update Test Expectations

**File:** `src/__tests__/cabinetCalculator.test.ts`

Update the first test to expect doors:

```typescript
test('Base cabinet with pocket screws and standard toe kick', () => {
  // ... existing setup ...

  const parts = calculateCabinetParts(cabinet);

  // Should now have 8 parts: 2 sides, top, bottom, back, toe kick, 2 doors
  // (914mm wide cabinet gets double doors since > 600mm)
  expect(parts).toHaveLength(8);

  // Verify doors exist
  const doors = parts.filter(p => 
    p.partType === 'door' || 
    p.partType === 'door_left' || 
    p.partType === 'door_right'
  );
  expect(doors.length).toBeGreaterThan(0);

  // All doors should have vertical grain
  doors.forEach(door => {
    expect(door.grainDirection).toBe('vertical');
  });

  // Rest of test...
});
```

**File:** `src/__tests__/drawerCalculator.test.ts`

Update the first test to expect face:

```typescript
test('Standard drawer with pocket holes and applied bottom', () => {
  // ... existing setup ...

  const parts = calculateDrawerParts(drawer);

  // Should now have 6 parts: inner front, back, 2 sides, bottom, FACE
  expect(parts).toHaveLength(6);

  // Verify drawer face exists
  const face = parts.find(p => p.partType === 'drawer_face');
  expect(face).toBeDefined();
  
  // Face should have appropriate grain direction
  expect(['horizontal', 'vertical']).toContain(face?.grainDirection);

  // Rest of test...
});
```

---

## 📋 Success Criteria

After implementing these fixes:

- [ ] `npm test` passes (after writing tests in Part 1)
- [ ] Calculator demo shows doors/faces in the parts list (not separate)
- [ ] Doors have vertical grain direction
- [ ] Drawer faces have aspect-ratio-based grain direction
- [ ] Part counts match expectations (cabinets: +1 or +2, drawers: +1)

---

## 🔄 Workflow

**IMPORTANT:** Complete these fixes BEFORE starting Part 1 of NEXT_SESSION_PLAN.md

1. **Read this file completely**
2. **Implement all 5 fixes**
3. **Test manually** (create sample cabinet, check parts array)
4. **Commit:** `git commit -m "fix: add doors and drawer faces to parts list with grain direction (Critical Bug Fix #1 and #2)"`
5. **THEN proceed to NEXT_SESSION_PLAN.md Part 1** (tests will reflect the fixes)

---

## 💡 Why This Order?

1. Fix the calculators FIRST
2. THEN write tests that validate the fixed behavior
3. Demo screen will automatically show correct parts (it calls calculators)
4. UI screens will work correctly when they're built

**This avoids writing tests for broken behavior, then having to rewrite them.**

---

## 📝 Note on Issue #3 (Joinery Patterns)

Ryan also mentioned joinery hole patterns and hardware lists. This is marked as **Phase 5 enhancement** per agreement:

**Will NOT be implemented in this session:**
- Hole pattern specifications
- Screw/nail counts
- Hardware shopping lists
- Visual hole diagrams

**Will be added as TODO comments in code:**
```typescript
// TODO Phase 5: Add joinery hole pattern specifications
// TODO Phase 5: Calculate screw/nail quantities
// TODO Phase 5: Generate hardware shopping list
```

---

**Once you've completed these fixes, proceed to NEXT_SESSION_PLAN.md Part 1! 🚀**
