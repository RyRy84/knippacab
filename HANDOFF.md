# Context Handoff Guide

**Purpose:** Quick reference for transitioning work between Claude.ai and Claude Code  
**Last Updated:** February 7, 2026

---

## Current Session Protocol

When switching between Claude.ai and Claude Code, use these commands to maintain context:

### Starting Claude Code Session

```bash
# Claude Code automatically reads CLAUDE.md
# For phase-specific work, also reference:
claude "I need to work on [feature name] from ROADMAP.md Phase [X], Milestone [X.X]. 
Please read ROADMAP.md and CLAUDE.md, then let's start building."
```

### Ending Claude Code Session

Before ending a Claude Code session, have it update CLAUDE.md:

```bash
"Update CLAUDE.md with the module we just built - add it to the 'Implemented Modules' 
section with API reference like you did for unitConversion.ts"
```

### Returning to Claude.ai

When you come back to chat here, just say:
```
"Check the latest commits on knippacab repo and catch me up on what we've built"
```

---

## File Organization

### Documentation Files (Always Check First)

1. **ROADMAP.md** - What to build next, success criteria
2. **CLAUDE.md** - Technical context, implemented modules, project structure  
3. **Projects/knippacab-notes.md** (in project-management repo) - Research, decisions, background

### Code Files

**Completed:**
- `src/utils/unitConversion.ts` - mm ↔ Imperial conversions
- `src/types/index.ts` - All TypeScript interfaces
- `src/constants/cabinetDefaults.ts` - Standard dimensions
- `src/navigation/AppNavigator.tsx` - Navigation setup
- `src/screens/*.tsx` - Placeholder screens

**Next to Build:** (See ROADMAP.md Phase 1)
- `src/utils/cabinetCalculator.ts`
- `src/utils/drawerCalculator.ts`  
- `src/utils/revealCalculator.ts`
- `src/utils/grainLogic.ts`

---

## Key Principles for Handoffs

### Claude Code Should:
1. Read ROADMAP.md to know success criteria for current task
2. Reference CLAUDE.md for existing modules and patterns
3. Update CLAUDE.md when completing a module (add to "Implemented Modules")
4. Write commit messages that reference ROADMAP milestone (e.g., "feat: cabinet calculator (Phase 1.1)")
5. Create unit tests for utility functions

### Claude.ai Should:
1. Check recent commits to see what's been built
2. Review roadmap to identify next milestone
3. Provide architectural guidance and planning
4. Update roadmap when priorities shift
5. Answer "why" questions about design decisions

### Both Should:
- Keep documentation in sync with code
- Test ideas against real cabinet scenarios
- Prioritize readable code (Ryan is learning TypeScript)
- Commit frequently with clear messages

---

## When to Use Which Tool

### Use Claude Code For:
- Building utility functions and logic modules
- Implementing screens and UI components
- Setting up database schema
- Writing tests
- Debugging runtime errors
- Installing packages

### Use Claude.ai For:
- Planning new phases
- Architectural decisions
- Algorithm research and design
- UX flow discussions
- Reviewing roadmap priorities
- Understanding "how should this work?" questions

### Use Both For:
- Complex features requiring planning + implementation
- Example: Start with Claude.ai to design algorithm → Claude Code to implement → Claude.ai to review results

---

## Progress Tracking

### How to Know What's Done

**Check Git commits:**
```bash
git log --oneline --graph
```

**Check CLAUDE.md "Implemented Modules" section** - lists completed modules with API reference

**Check ROADMAP.md "Current State" section** - checkboxes show completion

### How to Update Progress

**After completing a milestone:**
1. Claude Code: Update CLAUDE.md with new module
2. Claude Code: Commit with message referencing roadmap
3. Claude.ai: Update ROADMAP.md checkboxes
4. Claude.ai: Update "Current State" summary

---

## Common Scenarios

### Scenario 1: "I want to add a new calculator function"

**Approach:**
1. Claude.ai: Discuss what it should calculate, edge cases, test cases
2. Claude Code: Implement function in appropriate file
3. Claude Code: Write unit tests
4. Claude Code: Update CLAUDE.md with function signature
5. Claude.ai: Review and suggest improvements if needed

### Scenario 2: "I'm confused about how something works"

**Approach:**
1. Claude.ai: Ask the question, reference specific file/function
2. Claude.ai: Explains with comparisons to C#/.NET if helpful
3. If needed, Claude Code: Add explanatory comments to code
4. Claude.ai: Update documentation if gap found

### Scenario 3: "Ready to start the next phase"

**Approach:**
1. Claude.ai: Review ROADMAP.md, check previous phase completion
2. Claude.ai: Discuss approach for first milestone
3. Claude Code: Implement first feature
4. Repeat for remaining milestones
5. Claude.ai: Review phase completion criteria

### Scenario 4: "Need to change direction or priorities"

**Approach:**
1. Claude.ai: Discuss the change and rationale
2. Claude.ai: Update ROADMAP.md with new priorities
3. Claude.ai: Update project-management notes if major shift
4. Claude Code: Continue with updated direction

---

## Testing Strategy

### During Development (Claude Code)
- Unit tests for calculator functions
- Quick manual tests: `npx expo start --web`
- Check TypeScript errors: `npx tsc --noEmit`

### Between Phases (Both)
- Integration testing (full workflow)
- Real-world validation (actual cabinet calculations)
- Performance testing (optimization algorithms)

### Before Milestones (Claude.ai)
- Review success criteria from ROADMAP.md
- Suggest additional test cases if gaps found
- Validate against cabinet construction standards

---

## Quick Command Reference

### Claude Code
```bash
# Start dev server
npx expo start --web

# Run tests (when set up)
npm test

# Check TypeScript
npx tsc --noEmit

# Install package
npx expo install <package-name>
```

### Git Workflow
```bash
# See what's changed
git status
git log --oneline -5

# Commit pattern
git commit -m "feat: [feature name] (Phase X.X from roadmap)"

# Push to GitHub
git push origin main
```

---

## Emergency Recovery

### If Context is Lost

**Fastest recovery:**
1. Read ROADMAP.md "Current State" section
2. Check latest commits: `git log --oneline -10`
3. Read CLAUDE.md "Implemented Modules"
4. Ask Claude.ai: "Where are we in the roadmap?"

**Full context rebuild:**
1. Read all three docs (ROADMAP.md, CLAUDE.md, knippacab-notes.md)
2. Review recent commits with diffs
3. Run the app to see current state
4. Identify gaps between roadmap and reality

---

## File Update Checklist

After implementing a feature, update these files:

**Always:**
- [ ] CLAUDE.md → Add to "Implemented Modules" if it's a utility module
- [ ] Git commit with descriptive message

**When completing a milestone:**
- [ ] ROADMAP.md → Check off completed tasks
- [ ] ROADMAP.md → Update "Current State" section

**When changing direction:**
- [ ] ROADMAP.md → Update priorities or phases
- [ ] knippacab-notes.md → Document why decision changed

---

## Examples of Good Handoffs

### Example 1: Planning to Implementation

**Claude.ai:**
> "Let's plan out the cabinet calculator. It needs to handle 4 joinery methods, 3 toe kick options, and calculate all part dimensions. Here's the function signature I'm thinking..."

**Claude Code:**
> "Build src/utils/cabinetCalculator.ts with the signature we discussed. Reference CLAUDE.md for types and constants. Include JSDoc comments and edge case handling."

### Example 2: Implementation to Review

**Claude Code:** (finishes building calculator)
> "I've implemented cabinetCalculator.ts with all 4 joinery methods. Here's what I built... [summary]. Tests pass for basic cases. Should I update CLAUDE.md now?"

**Claude.ai:** (after Claude Code updates docs)
> "Let me check the recent commit... [reviews]... Looks good! Let's add a test case for custom toe kick heights. Then we can move to Phase 1.2 (drawer calculator)."

### Example 3: Research to Decision

**Claude.ai:** (researches algorithms)
> "I found 3 possible approaches for sheet optimization. Here's the analysis... I recommend starting with FFD because... [rationale]. Let's update ROADMAP.md to reflect this choice."

**Claude Code:** (after roadmap update)
> "Build src/utils/optimizer/binPacking.ts using FFD algorithm per ROADMAP.md Phase 4.1. Follow the algorithm steps outlined in the roadmap."

---

**Remember:** The goal is seamless collaboration where any AI agent can pick up where another left off. Documentation is the bridge.
