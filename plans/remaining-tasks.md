# Remaining Tasks - QYAM Admin Project

## Important Instructions
- **Update footer version** (`app/components/dashboardFooter.tsx` line 111) each time code changes are made
- Current version: **v1.1.0**

---

## Completed Tasks
- [x] Issue 3: Register users from within system with password reset
- [x] Issue 11: Update certificate PDF template
- [x] Phase 1 Static Data: successpillars.tsx user data + sample testimonials

---

## Remaining Tasks

### Issue 12: Reminder for Previous Requests
- **Status:** Not Started
- **Description:** Implement reminder functionality for previous requests
- **Details:** TBD - needs clarification on exact requirements

---

### Static Data Audit - Medium Priority (Optional)

1. **WordCloud.tsx** - Sample word cloud data
   - Location: `app/components/WordCloud.tsx`
   - Contains hardcoded sample words for the word cloud visualization

2. **Admin Components** - Empty content containers
   - Some admin components have placeholder/empty content

---

### TypeScript Errors Fix Plan

A detailed plan exists at: `.claude/plans/purring-discovering-sifakis.md`

**Summary:** ~70 TypeScript errors across the codebase including:
- `QUser` type missing fields (acceptenceState, noStudents, phone type mismatch, cvKey, region)
- `UserCertificate` type has invalid property
- `DashStatistics` type has invalid syntax
- Missing imports in auth.server.ts and statistics.server.ts
- Database layer type mismatches (phone type, StatusResponse generic, invalid Prisma includes)
- Admin route errors (fetcher.key, undefined to string assignments)
- Dashboard route errors (JsonifyObject type access, Article type reference)

**Files affected:** 23+ files

---

## Notes
- Last worked on: January 22, 2026
- Branch: `before-the-deleting-of-unused-pages`
