# Session A1: Add Drawer Parts to CuttingPlanScreen

**Status: ✅ COMPLETE** — Implemented in commit `5dad451` (February 10, 2026) as part of Phase 4 completion. All changes below are already in the codebase.

## Goal
Update CuttingPlanScreen to include drawer parts in the cut list alongside cabinet parts.

## Actual State (as of Feb 10, 2026)
- ✅ `calculateDrawerParts` imported in CuttingPlanScreen.tsx (line 33)
- ✅ `drawers` read from projectStore with single-value selector (line 173)
- ✅ `allParts` useMemo iterates both `cabinets` and `drawers` (lines 179–188)
- ✅ `[cabinets, drawers]` dependency array (line 188)
- ✅ Summary header shows drawer count alongside cabinet count (lines 234–235)
- ✅ VisualDiagramScreen.tsx also includes drawer parts in optimizer input (lines 84, 118–119)

## What Needs to Change

### File: `src/screens/CuttingPlanScreen.tsx`

**Step 1: Add drawer imports**
```typescript
// Add to existing imports
import { calculateDrawerParts } from '../utils/drawerCalculator';
```

**Step 2: Read drawers from store**
```typescript
// Add after the cabinets selector (around line 140)
const drawers = useProjectStore(s => s.drawers);
```

**Step 3: Update the allParts useMemo to include drawer parts**
```typescript
// Replace the existing allParts useMemo with this:
const allParts: Part[] = useMemo(() => {
  const parts: Part[] = [];
  
  // Add cabinet parts
  for (const cabinet of cabinets) {
    const cabinetParts = calculateCabinetParts(cabinet);
    parts.push(...cabinetParts);
  }
  
  // Add drawer parts
  for (const drawer of drawers) {
    const drawerParts = calculateDrawerParts(drawer);
    parts.push(...drawerParts);
  }
  
  return parts;
}, [cabinets, drawers]); // Note: added drawers to dependency array
```

## Testing Steps
1. Create a project with at least one cabinet
2. Add drawers to that cabinet via DrawerBuilderScreen
3. Navigate to CuttingPlanScreen
4. Verify drawer parts appear in the cut list:
   - Should see "Drawer Front", "Drawer Back", "Drawer Left Side", "Drawer Right Side", "Drawer Bottom"
   - Should be grouped with other parts of the same material
   - Should have correct grain direction badges

## Success Criteria
- [x] No TypeScript errors
- [x] Drawer parts appear in cut list
- [x] Parts are correctly grouped by material
- [x] Grain direction badges show correctly
- [x] Quantities are accurate
- [x] App doesn't crash when project has no drawers
- [x] App doesn't crash when project has no cabinets

## Result
The cut list shows ALL parts needed for the project — cabinet parts and drawer parts — making it a complete cutting plan. Drawer grain direction was also corrected in the same commit (sides → vertical, bottom → either).
