# Next Claude Code Session - Quick Start Guide

**Created:** February 9, 2026 (Updated with Critical Fixes)  
**For:** Ryan  
**Session Goal:** Fix critical bugs, test calculators, add visual demo, build core UI screens

---

## 🚨 **IMPORTANT: Critical Fixes Required First!**

Before starting the main session, we need to fix two critical bugs that Ryan identified:

1. **Doors/faces missing from parts list** (they're calculated but not added)
2. **No grain direction assigned to doors/faces**

**These MUST be fixed first** so tests validate correct behavior.

---

## 🎯 What This Session Will Accomplish

By the end of this session, you'll be able to:

1. ✅ **Fixed calculators** that include doors/faces in parts list
2. ✅ **Run tests** that prove your calculators work correctly
3. 👀 **See calculations in action** via a demo screen
4. 🎨 **Use the app end-to-end** — create project → add cabinets → view list

---

## 📋 Session Structure

### **Part 0: CRITICAL FIXES FIRST (30-45 min)** 🚨
- Fix doors/faces missing from parts list
- Add grain direction for doors/faces
- Update TypeScript types
- **Outcome:** Calculators generate complete parts lists

### **Part 1: Unit Tests (1 hour)**
- Install Jest testing framework
- Write tests for all 4 calculators
- Validate math with real-world scenarios
- **Outcome:** Confidence that calculations are bulletproof

### **Part 2: Visual Demo (30 min)**
- Build a demonstration screen
- Show sample cabinets with calculated parts
- See grain direction, door dimensions, etc.
- **Outcome:** Immediate visual validation

### **Part 3: Core UI (1-1.5 hours)**
- Build ProjectSetupScreen (create new projects)
- Build CabinetBuilderScreen (add cabinets)
- Build ReviewEditScreen (view & manage cabinets)
- **Outcome:** Working end-to-end workflow

---

## 🚀 How to Start Claude Code Session

**TWO-STEP PROCESS:**

### **Step 1: Apply Critical Fixes**
```bash
claude "Read CRITICAL_FIXES.md completely and implement all 5 fixes. Test manually to verify doors/faces appear in parts list. Commit with message 'fix: add doors and drawer faces to parts list with grain direction (Critical Bug Fix)'. Then tell me when ready for next step."
```

### **Step 2: Main Session**
```bash
claude "Now read NEXT_SESSION_PLAN.md and implement all three parts step-by-step. Part 1 (unit tests), Part 2 (demo screen), Part 3 (core UI screens). Commit after each part. Update ROADMAP.md and CLAUDE.md when done."
```

**OR if you want Claude Code to do it all in one go:**

```bash
claude "First read and implement CRITICAL_FIXES.md completely, then proceed to NEXT_SESSION_PLAN.md. Do all parts in order: Critical Fixes → Part 1 (tests) → Part 2 (demo) → Part 3 (UI). Commit after each major section. Update ROADMAP.md and CLAUDE.md at the end."
```

---

## ✅ Success Checklist

After the session, verify these work:

### Critical Fixes (Part 0)
- [ ] Doors appear in parts list (not separate section)
- [ ] Drawer faces appear in parts list
- [ ] All doors have `grainDirection: 'vertical'`
- [ ] Wide drawer faces have horizontal grain
- [ ] Tall drawer faces have vertical grain

### Tests (Part 1)
```bash
npm test
```
- [ ] All tests pass
- [ ] No errors or warnings
- [ ] Part counts include doors/faces

### Demo Screen (Part 2)
```bash
npx expo start --web
```
- [ ] Navigate: Home → Calculator Demo
- [ ] Switch between Base/Wall/Drawer tabs
- [ ] See doors/faces WITH other parts (not separate)
- [ ] Grain arrows show for ALL parts including doors/faces

### Core UI (Part 3)
```bash
npx expo start --web
```
- [ ] Create new project (Home → New Project)
- [ ] Add 2-3 cabinets with different settings
- [ ] View cabinets in Review screen
- [ ] Delete a cabinet
- [ ] Close and reopen app — data persists

---

## 📊 What You'll Be Testing

After this session, you'll be able to test:

### **User Experience Flow**
1. Create a project called "Test Kitchen"
2. Add a 36" base cabinet with pocket screws
3. Add a 30" wall cabinet with dado joints
4. View both in the review screen
5. See dimensions formatted in your preferred units
6. **NEW:** See complete parts list including doors!

### **Calculation Accuracy**
- Base cabinet (36" wide) → 8 parts (box + toe kick + 2 doors)
- Wall cabinet (24" wide) → 6 parts (box + 1 door)
- Different joinery methods → different dimension adjustments
- Grain direction assigned correctly to EVERY part
- **NEW:** Doors always vertical grain
- **NEW:** Drawer faces grain based on aspect ratio

### **Data Persistence**
- Close the app completely
- Reopen it
- Your project and cabinets are still there

---

## 🎓 Learning Opportunities

This session demonstrates key React Native patterns:

**Part 0 (Critical Fixes):**
- Modifying existing utility functions
- TypeScript union type extensions
- Integration between multiple modules
- Pattern: Calculate dimensions → Generate Part objects

**Part 1 (Tests):**
- Jest testing framework setup
- TypeScript test patterns
- Testing pure functions vs. UI components

**Part 2 (Demo):**
- State management with `useState`
- Component composition (PartCard component)
- Conditional rendering (different demos)
- Styling with StyleSheet

**Part 3 (UI):**
- Form handling in React Native
- Navigation with React Navigation
- Zustand store integration
- TextInput and TouchableOpacity components

---

## 🔄 After You Test

Based on what you find, the next session can focus on:

**If everything works great:**
→ Build the Cut List screen (show all parts grouped by material)

**If you want more features first:**
→ Add Drawer Builder (let users add drawers to cabinets)

**If UX needs improvement:**
→ Polish the interface (quick-select buttons, better validation, help tooltips)

**Your feedback drives the next priority!**

---

## 📁 Files Being Created

### Part 0 (Critical Fixes) - Modified Files:
```
src/types/index.ts (add door/face part types)
src/utils/cabinetCalculator.ts (add door generation)
src/utils/drawerCalculator.ts (add face generation)
src/utils/grainLogic.ts (add door/face rules)
```

### Part 1 onwards - New Files:
```
src/__tests__/cabinetCalculator.test.ts
src/__tests__/drawerCalculator.test.ts
src/__tests__/revealCalculator.test.ts
src/__tests__/grainLogic.test.ts
src/screens/CalculatorDemoScreen.tsx
```

### Files Being Updated:
```
src/screens/HomeScreen.tsx (add demo link)
src/screens/ProjectSetupScreen.tsx (real implementation)
src/screens/CabinetBuilderScreen.tsx (real implementation)
src/screens/ReviewEditScreen.tsx (real implementation)
src/navigation/AppNavigator.tsx (add demo route)
src/navigation/types.ts (add demo type)
package.json (add Jest config and scripts)
ROADMAP.md (check off completed milestones)
CLAUDE.md (update with new modules)
```

---

## 🛠️ Troubleshooting

**If critical fixes don't work:**
- Check that imports were added correctly
- Verify `calculateSingleDoorDims` and `calculateDoubleDoorDims` are imported
- Look for TypeScript errors in the console
- Make sure part types were added to the union

**If tests fail:**
- Check that part counts match new expectations
- Verify doors/faces are being generated
- Look at the specific test failure message

**If demo screen doesn't show doors:**
- Verify critical fixes were applied
- Check that calculators are being called correctly
- Look for console errors in browser dev tools

**If UI screens don't save data:**
- Check that stores are imported
- Verify database is initialized in App.tsx
- Look for console errors in browser dev tools

---

## 💡 Pro Tips

1. **Fix first, test second** — Don't write tests for broken behavior
2. **Test incrementally** — Run `npm test` after Part 1 to catch issues early
3. **Use web first** — It's the fastest for testing (`npx expo start --web`)
4. **Check commits** — Claude Code should make 4 commits during this session
5. **Read the code** — The implementations have educational comments for you

---

## 📞 Need Help?

If something isn't clear during the session:

1. **Ask Claude Code** — "Can you explain why you did X?"
2. **Check CRITICAL_FIXES.md** — Details on the bug fixes
3. **Check NEXT_SESSION_PLAN.md** — Full technical specifications
4. **Review commits** — See what changed step-by-step
5. **Come back to Claude.ai** — Share what's confusing and I'll help

---

## 🎯 Expected Session Timeline

- **Part 0 (Critical Fixes):** 30-45 minutes
- **Part 1 (Tests):** 1 hour
- **Part 2 (Demo):** 30 minutes
- **Part 3 (UI):** 1-1.5 hours
- **Total:** 3-3.5 hours

**Perfect for a Saturday afternoon coding session!**

---

**You're ready! Start the session when you have 3-4 hours to code.**

Good luck! 🚀
