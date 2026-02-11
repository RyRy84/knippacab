# Path A: Quick Wins - Master Guide

**Created:** February 11, 2026  
**For:** Claude Code implementation sessions  
**Goal:** Build React Native skills with focused, achievable features before Phase 4

---

## Overview

Path A consists of 3 progressively complex features that improve the app while teaching important React Native patterns. Complete them in order for the best learning experience.

**Total Time:** 3-5 hours  
**Risk Level:** Low (won't break existing functionality)  
**Value:** High (immediate UX improvements + skill building)

---

## Session A1: Add Drawer Parts to Cut List ⭐ START HERE
**Time:** 30 minutes  
**Complexity:** ⚫ Easy  
**File:** SESSION_A1_DRAWER_PARTS.md

**What You'll Learn:**
- Combining data from multiple sources in React
- useMemo for performance optimization
- Array spreading and concatenation

**What It Does:**
Currently the cut list only shows cabinet parts. This adds drawer parts (fronts, backs, sides, bottoms) to complete the cutting plan.

**Command for Claude Code:**
```bash
Read SESSION_A1_DRAWER_PARTS.md and implement the changes to add drawer parts to the cutting plan screen
```

---

## Session A2: Edit Cabinet Functionality ⭐ DO SECOND
**Time:** 1-2 hours  
**Complexity:** ⚫⚫ Medium  
**File:** SESSION_A2_EDIT_CABINET.md

**What You'll Learn:**
- Navigation route parameters
- Conditional rendering (create vs edit mode)
- Pre-filling forms with existing data
- Update vs create patterns in state management

**What It Does:**
Users can currently only delete cabinets. This adds an Edit button that lets them modify existing cabinets without starting over.

**Command for Claude Code:**
```bash
Read SESSION_A2_EDIT_CABINET.md and implement edit cabinet functionality with form pre-filling and update logic
```

---

## Session A3: Visual Polish ⭐ DO THIRD
**Time:** 1-2 hours  
**Complexity:** ⚫ Easy to ⚫⚫ Medium  
**File:** SESSION_A3_VISUAL_POLISH.md

**What You'll Learn:**
- Component composition
- Loading states and async operations
- Better empty states
- Inline validation feedback
- Touch-friendly UI patterns

**What It Does:**
Three polish features:
1. Drawer count badges on cabinet cards
2. Preset size quick-select buttons
3. Better empty states and loading indicators

**Command for Claude Code:**
```bash
Read SESSION_A3_VISUAL_POLISH.md and implement all three polish features: drawer badges, preset buttons, and improved states
```

---

## After Path A is Complete

Once you've completed all three sessions, you'll have:
1. ✅ Complete cut list (cabinets + drawers)
2. ✅ Full CRUD operations (create, read, update, delete)
3. ✅ Professional UI polish
4. ✅ Solid React Native fundamentals

**Then you're ready for:**
- **Phase 4** (Sheet Optimizer) with confidence
- **Phase 5** (PDF Export & Final Polish)
- Or your own custom features!

---

## Success Checklist

After each session, verify:

**A1 Checklist:**
- [ ] Drawer parts appear in cut list
- [ ] Parts grouped correctly by material
- [ ] Grain badges show correct direction
- [ ] No crashes with 0 drawers or 0 cabinets

**A2 Checklist:**
- [ ] Edit button appears on cabinet cards
- [ ] Form pre-fills with cabinet data
- [ ] Updates save to database
- [ ] Can still create new cabinets

**A3 Checklist:**
- [ ] Drawer badges show on cabinet cards
- [ ] Preset buttons work and highlight
- [ ] Empty states look professional
- [ ] Loading spinners appear during saves

---

## Tips for Working with Claude Code

1. **Read the session doc first** - Don't just copy the command
2. **Test after each change** - Run the app and verify it works
3. **Commit frequently** - One commit per session is good
4. **Check TypeScript errors** - Run `npx tsc --noEmit` before committing
5. **Ask questions** - If something's unclear, ask Claude Code to explain

---

## Troubleshooting

**If A1 shows duplicate parts:**
- Check that you're not calling calculateDrawerParts twice
- Verify drawers array doesn't have duplicate entries

**If A2 doesn't pre-fill the form:**
- Console.log the existingCabinet to verify it's found
- Check that route.params.cabinetId is being passed correctly

**If A3 preset buttons don't update width:**
- Verify setWidthInches is called with a string, not number
- Check that value matches exactly (use === comparison)

---

## Next Steps After Path A

When you're ready to tackle Phase 4 (the visual cutting diagram), WORK_PLAN.md has detailed implementation steps for:
- Milestone 4.1: Bin packing algorithm
- Milestone 4.2: SVG diagram rendering  
- Milestone 4.3: Multi-sheet handling

But take your time with Path A first - these skills will make Phase 4 much easier!