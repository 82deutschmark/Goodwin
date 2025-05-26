# Fix Build Errors Plan

**Date:** 2025-05-25
**Author:** Cascade (gpt-4.1-nano-2025-04-14)

## Objective
Resolve all build errors and lint warnings blocking deployment for the OpenAI Responses Starter App. Ensure all code is robust, maintainable, and compliant with project conventions and best practices for a non-technical user.

---

## Checklist of Tasks

- [ ] Fix all incorrect imports from `@/lib/prisma` to use named export (`prisma`), not default.
- [ ] Refactor `openai` package usage in `imageGenerationService.ts` and related files to use `OpenAI` class (no `Configuration` or `OpenAIApi`).
- [ ] Remove all unused variables flagged by ESLint in all affected files.
- [ ] Fix React hook dependency array warnings in all affected components.
- [ ] Escape all unescaped single quotes in JSX (per lint rules).
- [ ] Update module-level comments in all modified files with author/model and explanations.
- [ ] Summarize all changes in the changelog with timestamp and author/model.
- [ ] Propose a build/test after changes.

## Files to Modify
- `app/api/credits/consume/route.ts`
- `app/api/user/credits/route.ts`
- `lib/services/imageGenerationService.ts`
- `app/api/image-generator/route.ts`
- `app/api/auth/[...nextauth]/route.ts`
- `app/api/stripe/webhook/route.ts`
- `app/buy-credits/page.tsx`
- `components/CreditBalanceDisplay.tsx`
- `components/CreditHistoryDisplay.tsx`
- `components/MechanicAssistant.tsx`
- `lib/services/creditService.ts`
- `lib/services/goodwinService.ts`
- `lib/services/mechanicService.ts`
- `docs/changelog.md` (append summary)

## Files to Create
- None (unless documentation gaps are discovered)

## Notes
- All changes must be modular and clearly commented for maintainability.
- No code should be shown to the user directly.
- All updates must be appended to the changelog with the current timestamp and author/model.
- If any errors are encountered during the process, pause and consult the user for further input.

---

## Status
*Plan created and saved. Proceeding with file modifications and lint/build fixes.*
