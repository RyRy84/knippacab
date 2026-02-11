# Session A1: Add Drawer Parts to CuttingPlanScreen

## Goal
Update CuttingPlanScreen to include drawer parts in the cut list alongside cabinet parts.

## Current State
- CuttingPlanScreen.tsx only shows cabinet parts
- Uses `calculateCabinetParts()` to get parts from cabinets
- Groups parts by material and displays them
- Drawers exist in the database but their parts aren't shown

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
- [ ] No TypeScript errors
- [ ] Drawer parts appear in cut list
- [ ] Parts are correctly grouped by material
- [ ] Grain direction badges show correctly
- [ ] Quantities are accurate
- [ ] App doesn't crash when project has no drawers
- [ ] App doesn't crash when project has no cabinets

## Expected Result
The cut list will now show ALL parts needed for the project - both cabinet parts and drawer parts, making it a complete cutting plan.

## Estimated Time
30 minutes
