# Frontend function-style alignment

Date: 2026-11-08  
Status: Implemented locally after explicit authorization; browser smoke check remains unverified.  
Repository: `norman-wong-svelte`

## 1. Objective

Apply the remaining findings from the second read-only style audit, specifically the three function conventions added to [the local style guide](../docs/STYLE_GUIDE.md):

1. Prefer arrow functions unless an ordinary function is necessary.
2. Omit return-type annotations when the intended type is already inferred.
3. Use expression bodies for single-expression arrow functions when returning the expression is already intended or acceptable to the caller.

This supplements the completed [frontend style-guide alignment plan](./FRONTEND_STYLE_GUIDE_ALIGNMENT_PLAN.md). It does not reopen that plan's completed visual, accessibility, naming, or layout work.

## 2. Scope and boundaries

- Planning only until implementation is explicitly requested.
- Change only the listed frontend functions and the corresponding test helper.
- Preserve function names, exports, parameters, inferred/public types, caller behavior, and evaluation order.
- Preserve all layout calculations, Auto sizing, spans, gaps, crop/hotspot framing, image preloading, scroll behavior, animation timing, and navigation.
- No CMS changes, data changes, migrations, schema changes, deployment, push, or commit.
- No new dependencies, formatter installation, broad formatting pass, or unrelated cleanup.
- Preserve unrelated work and the local style-guide copy.

## 3. Audit baseline

The read-only audit found:

| Finding | Count |
| --- | --- |
| Ordinary function declarations in application source suitable for arrows | 9 |
| Redundant function return-type annotations | 6 |
| Single-expression arrow blocks suitable for expression bodies | 5 |
| Ordinary function declaration in tests suitable for an arrow | 1 |

These counts overlap: changing one function may address both its declaration syntax and its return annotation.

Audit verification completed before this plan:

- Existing CSS declaration, template attribute, and prop-order check passed using the temporary adapted checker from the previous cleanup.
- All 12 existing tests passed.
- Svelte check completed with zero errors and zero warnings. Its first restricted attempt failed because Vite could not write its temporary configuration cache; the authorized rerun passed.
- No additional actionable findings were reported under the remaining style conventions.
- No build or browser rerun occurred during the audit.

Refresh the checkout status and relevant source before implementation; the recorded counts are a baseline, not permission to overwrite intervening changes.

## 4. Work packages

### A. Convert ordinary function declarations

In `src/lib/utils/projectSlideLayout.ts`, convert these seven declarations to const-bound arrows while retaining their current exports:

- `autoMobileSpans`
- `resolveGeometry`
- `isValidSlideV2`
- `unavailableLayout`
- `mobileOrientationFor`
- `resolveDesktopLayout`
- `resolveMobileLayout`

In `src/lib/utils/imageFraming.ts`, convert:

- `croppedRatio`
- `hotspotPosition`

In `tests/projectSlideLayout.test.mjs`, convert the recursive local `check` helper to a const-bound arrow. Recursion itself does not require a function declaration: the helper is initialized before the test invokes it.

Before conversion, confirm no call depends on declaration hoisting or dynamic `this`, including module initialization paths. Keep definitions before any initialization-time calls. Do not rearrange unrelated code or change exports solely for formatting.

### B. Remove six redundant return annotations

| File | Function | Annotation to remove |
| --- | --- | --- |
| `src/lib/utils/projectSlideLayout.ts` | `autoMobileSpan` | `number` |
| `src/lib/utils/projectSlideLayout.ts` | `autoMobileSpans` | `number[]` |
| `src/lib/utils/imageFraming.ts` | `croppedRatio` | `number` |
| `src/lib/utils/imageFraming.ts` | `hotspotPosition` | `string` |
| `src/lib/utils/common.ts` | `filterFalsey` | `T[]` |
| `src/lib/utils/sanity.ts` | `getPlaceholderSrc` | `string` or `undefined` |

Preserve the existing `as T[]` expression in `filterFalsey`; this task removes the duplicate function annotation, not the assertion that supplies its current generic result type.

Keep `isValidSlideV2`'s explicit `v is SlideLayoutV2` predicate. It narrows the optional layout for callers and is not a redundant annotation. Keep parameter annotations, interface callback signatures, framework function types such as `Action`, `Handle`, and `PageServerLoad`, and the derived `ReturnType` alias.

Verify that inference still provides the intended result types. Do not use `any`, a new cast, or a wrapper merely to avoid a necessary annotation.

### C. Simplify five arrow bodies

| File | Location | Expression-body change |
| --- | --- | --- |
| `src/lib/actions/scrollendAction.ts` | `onscroll` timer callback | Return the `dispatchEvent(...)` expression; the timer ignores its boolean result. |
| `src/routes/_components/header/header.svelte` | `getLinks` | Return the object literal directly, enclosed in parentheses. |
| `src/routes/_components/selected/selectedProjects.svelte` | Center-adjust animation `onComplete` | Use the parenthesized `centerAdjustTween = undefined` assignment. |
| `src/routes/_components/selected/selectedProjects.svelte` | Navigation animation `onComplete` | Return `goto(...)` directly; keep the animation callback's navigation timing unchanged. |
| `src/routes/projects/[project]/+layout.svelte` | Image-preloading `onMount` callback | Return the existing `forEach(...)` expression directly; `forEach` returns void. |

The installed GSAP completion paths ignore these callback results, as checked in the audit. Reconfirm if the installed version or callbacks change before implementation. Do not introduce awaiting, cleanup functions, extra promise handling, or different navigation sequencing as part of this edit.

A single expression may wrap across lines. The goal is an expression body, not forcing long expressions onto one physical line. Keep blocks for multi-statement bodies and for any callback where returning its expression would change behavior or violate the caller's contract. Do not replace conditional statements with clever expressions merely to remove braces.

## 5. Verification

1. Review the diff against the inventory: all nine source declarations, six redundant annotations, five arrow bodies, and the one test helper are addressed without unrelated changes.
2. Repeat the syntax scan across TypeScript and Svelte script blocks. Inspect remaining annotations and block bodies rather than treating every match as a violation.
3. Run the existing 12 tests and the frontend type/Svelte check. No new tests are necessary solely to mirror syntax changes.
4. Run the production build to verify imports, initialization, and compilation after removing declaration hoisting.
5. Run `git diff --check`. Reuse the existing temporary ordering checker if available; do not add tooling to the repository for this task.
6. Perform a focused local browser smoke check: Selected Works recentering, animated project navigation, header links, and a project route loading its images. Include desktop/mobile slide rendering as a quick geometry check; do not claim a full browser/device matrix.
7. Record the commands actually run, outcomes, and any unavailable browser checks. Ensure source edits remain confined to this plan's inventory.

Existing geometry tests remain the regression protection for spans, Auto, Justified, crop, and mobile overrides. Do not alter expected values to accommodate a syntax-only change.

## 6. Acceptance criteria

- All listed functions follow the new function conventions.
- The validator's type predicate and necessary framework/callback type contracts remain intact.
- Tests, type check, and build pass; focused browser behavior is unchanged or any unverified checks are explicitly reported.
- No layout values, content contracts, public routes, CMS code, or dataset values change.
- The CMS Index / Include all media plan remains a separate pending task.

## 7. Completion record

Implemented the nine source declaration conversions, six redundant annotation removals, five expression-body simplifications, and test-helper conversion. Preserved the explicit validator predicate and framework type contracts.

Verification: all 12 tests passed; Svelte check reported zero errors and zero warnings; production build passed (with the bundle-size warning and adapter-auto environment notice); temporary ordering checker and git diff whitespace check passed. Diff reviewed against the inventory. No browser smoke check was performed in this pass, so visual/navigation behavior is not newly verified. No CMS, content, migration, or deployment changes.
