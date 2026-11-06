# Desktop column-width sizing correction

Date: 2026-11-05
Status: Implemented locally after explicit authorization; no deployment or data migration.
Repository: norman-wong-svelte

## Objective

Preserve desktop Center media widths calculated from column spans when switching from grid to flex. Derive height from the source aspect ratio, center vertically, and clip overflow instead of shrinking the composition to fit its height.

This supersedes the desktop cross-axis containment requirement in PROJECT_SLIDE_FLEX_DESKTOP_MOBILE_PLAN.md. Mobile containment is unchanged in this correction; the confirmed problem and requested width-first behavior concern desktop. The corresponding CMS plan is ../../norman-wong-cms/plans/SLIDE_PLANNER_VIEW_AND_SIZING_REVISION_PLAN.md.

## Evidence

On OVO /1, both versions resolve the saved desktop span 8–18 to 10 columns. At 1280 × 720 both render about 525 × 668.8px. On the user's 2560px-wide Chrome windows, the original grid renders approximately 1058.33 × 1348.22px, whereas local flex reduces the image to approximately 967.88 × 1233px. The inspected live and local windows had different heights (1289 and 1233px); this was not a matched-height browser comparison. The source confirms that crossScale in projectSlideLayout.ts reduces width based on available height.

The defect was missed by the earlier 1280 × 720 checks because the image already fit vertically. CMS-to-frontend numerical parity tests also cannot detect a shared incorrect rule.

## Scope

- Local frontend changes only after implementation is requested.
- No content migration, Sanity writes, schema changes, push, or deployment.
- Preserve desktop consolidation, mobile Auto/custom inference, saved orientation, effective assets, media order, equal gaps, and single-media Justify.
- Apply through the shared project-slide renderer, covering project-detail and selected-work slides.
- Do not modify unrelated site grids or redesign mobile sizing.

## Geometry contract

Desktop remains 24 tracks. With actual viewport width W and resolved gutter G:

    T = (W + 8 - 23G) / 24
    itemWidth = span × T + (span - 1) × G
    itemHeight = itemWidth / effectiveAspectRatio

Keep the legacy 8px sizing reference. At W=2560 and G=20, T=87.833333px, and span 10 yields width 1058.333333px. The OVO source is 6900 × 8790, giving height approximately 1348.22px.

For valid desktop Center layouts, do not use viewport height to scale media. Keep the established main-axis boundary fit, which reserves inter-item gaps and accounts for a full-budget group's 8px reference overflow. This limited width fit must depend on width only; it must not reintroduce height fitting. The previous desktop/full-budget containment behavior remains otherwise unchanged.

The actual slide viewport stays W × H with overflow hidden. Center the group in both axes. Taller items extend equally above and below the viewport; preserve their full calculated dimensions and aspect ratios. Use safe flex rules so neither parent flex shrinking nor media max-height constraints reduce them implicitly. Avoid safe-center alignment that would anchor oversized content at the top.

Single-media Justify continues covering the viewport. Mobile row/stack sizing keeps its current containment policy. Unsupported legacy spans retain explicit diagnostics and existing compatibility handling; do not expand this correction into migration or normalization work.

## Implementation steps

1. Recheck local changes and owning sources before editing.
2. In src/lib/utils/projectSlideLayout.ts, make containment policy explicit by breakpoint/layout. Desktop Center uses the main-axis scale only; mobile retains the existing min(mainScale, crossScale) calculation. Keep validity independent of visual fitting.
3. Ensure desktop fitReason never reports cross-axis fitting; retain boundary/legacy diagnostics when applicable. Source-size hints use final width.
4. Review src/routes/_components/projectSlides/projectSlide.svelte and projectSlideMedia.svelte for implicit height constraints. Keep explicit calculated dimensions, centered flex, equal gaps, and viewport clipping.
5. Add a regression fixture where the image is taller than the viewport. Assert the same desktop width and height for fixed W across several H values. Include image and video ratios, mixed-aspect diptychs, and full-budget layouts.
6. Update the CMS preview calculation in its separately scoped implementation to match this contract. Neither repository should import the other's production runtime.
7. Run focused tests, frontend check, and build; compare the actual local/live OVO /1 at identical viewport dimensions, then record screenshots and limitations.

## Acceptance criteria

- [ ] OVO /1 at 2560px width retains approximately 1058.33px width and 1348.22px height before any width-only fit; changing height alone does not change either dimension.
- [ ] At 1280 × 720 its existing approximately 525 × 668.8px geometry remains unchanged.
- [ ] Tall media clips symmetrically; no stretching, unexpected top alignment, or height-driven shrink.
- [ ] Mixed-aspect desktop groups retain calculated relative widths and equal gaps.
- [ ] Full-budget boundary fitting reserves gaps and remains independent of height.
- [ ] Mobile Auto/custom, Portrait/Landscape, and Justify regression fixtures remain unchanged.
- [ ] Browser comparison uses matching width AND height, records the actual viewport, and includes a tall-content case.
- [ ] Type checks/build pass, with unrelated existing warnings recorded separately.
- [ ] Closeout includes screenshots and explicitly states local-only changes with no data migration/deployment.

## Rollback

Revert only this correction's geometry/presentation changes if required; no data restoration is needed. Leave unrelated local changes intact.

## Implementation results

- Desktop Center no longer uses cross-axis height fitting. Mobile containment and width-boundary fitting remain unchanged. No presentation changes were necessary.
- All 16 focused layout tests passed, including tall image/video/diptych height independence, existing mobile fixtures, Justify, and full-budget width fitting.
- Frontend check passed with zero errors and four existing navigation accessibility warnings. Production build passed.
- Matched Chrome viewports: local and live OVO /1 both measured 2560 × 1289. Both rendered width 1058.328px; local height 1348.219px versus live 1348.203px (subpixel rounding). Content clips symmetrically above and below.
- Screenshot: /Users/donaldzhu/.codex/visualizations/2026/11/05/01a1ada9-06ad-7c92-b5de-010f743e358c/ovo-width-correction.png.
- CMS preview correction remains separately planned; no CMS application code was changed in this task.
