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
- Unit tests (calculations, utilities)
- Integration tests (APIs, forms)
- Manual testing (happy path + edge cases)
- No console errors

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
npm run dev          # Start dev server
npm run db:generate  # Generate migration
npm run db:migrate   # Apply migration
npm test             # Run tests
```

### Git Commit Format
```
<type>(scope): <subject>

Refs: #task-X.X
```

### Project Structure
```
/tasks/
  AGENTS.md, GAP_ANALYSIS.md, PHASE_1-5.md
/src/
  app/, components/, context/, db/, types/
```

---

## Quality Checklist

- [ ] TypeScript types correct (no `any`)
- [ ] Error handling implemented
- [ ] Input validation present
- [ ] Tests included
- [ ] No console.log in production
- [ ] Follows existing patterns

---

**Remember:** Quality over speed. Test before commit.

*Full workflow: `tasks/DEVELOPMENT_WORKFLOW.md`*
