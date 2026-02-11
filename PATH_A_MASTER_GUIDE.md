# Path A: Quick Wins - Master Guide

**Created:** February 11, 2026
**Last Updated:** February 11, 2026
**For:** Claude Code implementation sessions
**Goal:** UX improvements and polish features on top of the completed Phase 4 foundation

---

## Overview

Path A consists of 3 progressively complex features that improve the app. Complete them in order for the best learning experience.

**Note:** Phase 4 (sheet optimizer, visual cutting diagram) is **already complete** as of Feb 10, 2026. Path A focuses on UX completeness and polish before Phase 5 (PDF export).

**Total Time:** 2.5–4 hours remaining (A1 already done)
**Risk Level:** Low (won't break existing functionality)
**Value:** High (immediate UX improvements)

---

## Session A1: Add Drawer Parts to Cut List ✅ COMPLETE
**Completed:** February 10, 2026 (commit `5dad451`)
**File:** SESSION_A1_DRAWER_PARTS.md

**What Was Done:**
CuttingPlanScreen and VisualDiagramScreen both include drawer parts (fronts, backs, sides, bottoms) in their parts lists. Drawer grain directions were also corrected in the same commit.

---

## Session A2: Edit Cabinet Functionality ⭐ START HERE
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

Once you've completed A2 and A3, you'll have:
1. ✅ Complete cut list (cabinets + drawers) — done
2. ✅ Full CRUD operations (create, read, update, delete)
3. ✅ Professional UI polish
4. ✅ Phase 4 optimizer + visual diagram — already done

**Then you're ready for:**
- **Phase 5** (PDF Export & Final Polish) — the last major milestone before V1 release

---

## Success Checklist

After each session, verify:

**A1 Checklist:** ✅ COMPLETE
- [x] Drawer parts appear in cut list
- [x] Parts grouped correctly by material
- [x] Grain badges show correct direction
- [x] No crashes with 0 drawers or 0 cabinets

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

When A2 and A3 are complete, move to **Phase 5 (PDF Export & Final Polish)**:
- PDF generation from the cut list and cutting diagrams
- Hardware list / BOM export
- Final app polish and store preparation

Phase 4 (bin packing, SVG diagram, multi-sheet) is fully complete — see CLAUDE.md for the full implementation details.