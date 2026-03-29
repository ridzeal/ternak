# AGENTS.md - Development Guidelines

## 🚀 The 4 Golden Rules

### 1. Understand Completely 📖

**Before coding:**

- Read: `tasks/GAP_ANALYSIS.md`, relevant `PHASE_*.md`, Excel file
- Map all affected components (schema, API, UI, types)
- Identify dependencies and migration needs

### 2. Leverage Sub-Agents 🤖

**Use for parallel tasks:**

- `react-dev` → Components, forms, UI
- `javascript-pro` → TS/JS logic, utilities
- `system-architect` → Schema, architecture
- `Explore` → Fast codebase search

### 3. Test Thoroughly ✅

**Before marking complete:**

- **Playwright E2E tests for ANY UI or API changes** (REQUIRED)
- Unit tests (calculations, utilities)
- Integration tests (APIs, forms)
- Manual testing (happy path + edge cases)
- No console errors

**Test commands:**
```bash
just test            # Run all Playwright tests
just test-headed     # Run with visible browser
just test-ui         # Interactive UI mode
just seed            # Seed demo data (after reset)
just reset           # Full DB reset + seed
```

**Test location:** All E2E tests go in `tests/e2e/` folder

### 4. Regression Test 🔍

**Before every commit:**

```bash
npx tsc --noEmit && npm run lint && npm test && npm run build
```

- Verify existing features still work
- No breaking changes to existing data
- Check core workflows (cow CRUD, milking, events)

---

## Quick Reference

### Essential Commands

```bash
just dev             # Start dev server on port 7500 (RECOMMENDED)
just seed            # Seed demo data
just reset           # Reset DB + seed (DANGER: wipes all data)
just test            # Run Playwright tests
just test-ui         # Interactive test UI

# NPM alternatives
npm run dev          # Start dev server (port 3000)
npm run db:seed      # Seed demo data
npm run db:reset     # Reset DB + seed
npm run db:generate  # Generate migration
npm run db:migrate   # Apply migration
npm test             # Run tests
```

**Dev server:** `just dev` runs on **http://localhost:7500** by default

### Git Commit Format

```bash
<type>(scope): <subject>

Refs: #task-X.X
```

### Project Structure

```bash
/tasks/
  AGENTS.md, GAP_ANALYSIS.md, PHASE_1-5.md
/src/
  app/, components/, context/, db/, types/
```

---

## Quality Checklist

**BEFORE marking any task as complete:**

- [ ] **Playwright E2E test cases added** for the change (REQUIRED)
- [ ] **All tests passing** (`just test` or `npm run test`)
- [ ] TypeScript types correct (no `any`)
- [ ] Error handling implemented
- [ ] Input validation present
- [ ] No console.log in production
- [ ] Follows existing patterns

**Definition of Done:** A task is NOT complete until tests are written and passing.

---

**Remember:** Quality over speed. Test before commit.

*Full workflow: `tasks/DEVELOPMENT_WORKFLOW.md`*
