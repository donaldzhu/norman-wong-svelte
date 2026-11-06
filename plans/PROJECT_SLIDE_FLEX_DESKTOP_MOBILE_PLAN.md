# Project slide flex layout — desktop and mobile

Date: 2026-11-05  
Status: Implemented locally after explicit authorization. No deployment or data migration.  
Repository: `norman-wong-svelte`

Next revision: [Desktop column-width correction](./DESKTOP_COLUMN_WIDTH_CORRECTION_PLAN.md) supersedes desktop height containment below. This correction is now implemented locally; verification is recorded in its plan.

## 1. Objective

Use flex layout for project slides on desktop and mobile, with media dimensions calculated from column or row spans and gutters. Center the complete media group along both axes, preserve media order and aspect ratios, and use equal gaps between items.

Automatic mobile sizes are exactly half the resolved desktop spans. Column counts remain the sizing model even though CSS grid no longer positions the elements.

This plan supersedes the desktop-only scope of `DESKTOP_PROJECT_SLIDE_LAYOUT_PLAN.md` for the next implementation phase. Its established desktop consolidation and sizing reference remain relevant.

## 2. Scope and authorization

This request authorizes this plan only. Do not edit application code until explicitly asked to implement.

The future implementation is frontend-only and local:

- No Sanity content writes, data migration, new persisted fields, or schema changes.
- No CMS implementation in this phase. The proposed mobile Auto switch and orientation dropdown are a subsequent CMS task.
- No push, deployment, or publishing.
- Preserve mobile asset overrides, orientation, image loading, video playback, mute controls, navigation, and existing routes.
- Apply to both selected-work/homepage slides and project-detail slides through the shared renderer.
- Exclude the All Projects grid and unrelated responsive layouts.

## 3. Actual starting point

The local checkout already contains desktop and mobile flex overrides and calculated geometry in `projectSlideLayout.ts`. The mobile changes were made prematurely in an earlier turn and remain present. They are a starting point to review, not evidence that this new plan has already been approved or completed.

Current gaps:

- CSS grid declarations and placement variables remain beneath the flex overrides.
- Mobile currently reads saved mobile spans directly; it does not derive Auto spans from desktop.
- Separate desktop/mobile geometry implementations duplicate the same calculations.
- Fitting can conceal an over-budget source layout unless validity is reported separately.
- Mobile's computed gap is applied explicitly to stacked rows, but horizontal layout still uses the stylesheet gap directly. Measurement and rendering must share one gap contract.

Preserve unrelated work and do not reset the existing modified files wholesale.

## 4. Span resolution

### Desktop

Keep the agreed centered sizes: **6, 8, 10, 12, 14, 16** out of 24 tracks.

Keep runtime consolidation: 4 → 6, 9 → 8, 18 → 16. A valid single-media span of 24 is Justify. Keep the existing compatibility behavior for other legacy values, but report malformed or unsupported inputs separately from valid authoring choices.

Absolute saved start positions do not position the new composition. Read start/end only to derive span lengths and validate the source values. Never modify those values.

### Automatic mobile

Divide the resolved desktop span by two, after desktop consolidation:

| Size | Desktop span | Automatic mobile span |
| --- | ---: | ---: |
| XS | 6 | 3 |
| S | 8 | 4 |
| M | 10 | 5 |
| L | 12 | 6 |
| XL | 14 | 7 |
| XXL | 16 | 8 |

Odd mobile spans are intentional. Do not round them, remap them to four even sizes, or halve the original uncorrected desktop span. A single desktop Justify maps to mobile Justify in Auto mode.

For any valid centered desktop composition:

`sum(desktopSpans) <= 24` implies `sum(autoMobileSpans) <= 12`.

Examples: desktop 16 + 8 becomes mobile 8 + 4; 10 + 8 + 6 becomes 5 + 4 + 3; four six-column items become four three-unit items.

### Existing mobile defaults and custom layouts

There is currently no saved Auto switch. For this no-migration phase, resolve a slide-level runtime mode using existing data:

1. If all mobile spans are absent, use Auto.
2. If every stored mobile span matches the existing Center preset for that media count, use Auto: one item 8; two items 6 each; three items 4 each; four items 3 each.
3. Otherwise preserve the stored mobile spans as a custom layout. This includes single-media span 12 as mobile Justify. Partial/malformed mobile data is an explicit compatibility issue, not proof of Auto.

Compare span lengths, not absolute placement, because the new composition is always centered. Keep the existing `mobileOrientation` in every case. Do not infer orientation from aspect ratio or change it when selecting Auto.

This is a compatibility heuristic, not recovered author intent. A manually chosen layout that happens to match the old preset is indistinguishable from the preset. Document this limitation; do not persist an inferred flag. A future explicit CMS Auto field should take precedence once separately designed and authorized.

Custom mobile spans do not receive the automatic budget guarantee. Validate them independently against 12.

## 5. Track and gutter mathematics

Use the same formula for desktop columns, mobile columns, and mobile stacked rows.

Definitions:

- `N`: track count, 24 on desktop or 12 on mobile.
- `V`: available slide extent along the arrangement axis: width horizontally, height when stacked.
- `B`: existing compatibility buffer, currently 8px.
- `C = V + B`: legacy sizing reference.
- `G`: resolved gutter in pixels, read from the existing spacing token.
- `T = (C - (N - 1) * G) / N`: track width or height.
- `S`: selected span count.

The requested extent of one media is:

`extent(S) = S * T + (S - 1) * G`

**A two-column span is two track widths plus one gutter.** A six-column span is six track widths plus five internal gutters. It is not six tracks alone and not simply one quarter of the viewport.

For `K` adjacent media, the group extent is:

`groupExtent = sum(extent(Si)) + (K - 1) * G`

With the same gutter inside spans and between media, this simplifies to:

`groupExtent = totalSpan * T + (totalSpan - 1) * G`

Do not add extra columns to the budget for inter-media gaps. Internal gutters are already part of each calculated media extent; flex contributes exactly one additional gutter between neighboring media.

### Compatibility buffer

Retain the existing 8px reference buffer in this phase to preserve the previously agreed desktop sizing. For example, at V=1280, N=24, G=20: C=1288, T=34.5, and an eight-column span is 416px before containment.

The actual flex container remains the real slide size, not V+8. A full-budget group can therefore request 8px more than the visible extent. Any small boundary fit must be explicit in the geometry result and distinguished from span validation. Removing this buffer would be a separate sizing change; do not silently change the reference to make the formulas appear simpler.

If the viewport cannot accommodate the configured gutters and positive tracks, resolve a smaller nonnegative gutter before computing tracks. Use that same gutter throughout sizing and flex placement, and report the adjustment in diagnostics. Avoid measuring a previously fitted flex gap as the next input, which can create a feedback loop.

## 6. Flex rendering and containment

### Arrangement

- Desktop: horizontal flex row.
- Mobile Landscape: horizontal flex row.
- Mobile Portrait: vertical flex column.
- Both axes: center the whole group using `justify-content: center` and `align-items: center`.
- Use `flex: 0 0 auto`, explicit resolved width/height, and `flex-wrap: nowrap`.
- Use the resolved gutter as the flex gap. Do not use `space-between`, automatic wrapping, or implicit flex shrinking.

### Media dimensions

For a horizontal arrangement, the calculated span extent is width; derive height from the effective asset's aspect ratio. For stacked arrangements, the extent is height; derive width from the effective aspect ratio.

Use the asset actually shown at the breakpoint, including mobile image/video replacements. Preserve existing same-type media-selection behavior rather than introducing unrelated media-model changes.

Apply a common scale to the group when valid media exceed the cross-axis space, preserving relative sizes, aspect ratios, and equal gaps. Reserve gaps before fitting the media. Record the resulting scale and fit reason; a fitted display does not alter its source span.

Calculate image source-size hints from the resulting visible or covered image width. Apply contain/cover to both image layers and actual Mux content, including poster presentation.

### Justify

Only a single media can be Justify. Fill the real slide width and height with centered cover. Ignore centered-span geometry for this mode. In custom mobile mode, a valid single stored mobile span of 12 selects Justify; in Auto, follow the resolved desktop mode.

### Invalid layouts and legacy content

Validate before display fitting. A normalized desktop total above 24, or custom mobile total above 12, remains invalid even if compatibility fitting can keep existing media visible.

Return explicit validity and issue information alongside dimensions. Surface issues in local development diagnostics with the slide/media context; do not introduce public-facing debugging labels. Retain a clearly identified compatibility rendering fallback for existing invalid documents so the frontend does not blank previously viewable slides. Never report such a fallback as a valid Auto composition. The later CMS planner must reject invalid selections visibly.

Handle missing metadata, empty arrays, and unmeasured containers without NaN, Infinity, or accidental Justify. Do not silently claim an unknown aspect ratio is accurate.

## 7. Implementation structure

| File | Planned change |
| --- | --- |
| `src/lib/utils/projectSlideLayout.ts` | Separate span/mode resolution and validation from a shared axis-aware geometry calculation; add Auto/custom mobile resolution and diagnostics |
| `src/routes/_components/projectSlides/projectSlide.svelte` | Use flex as the sole slide placement system; own measurements and breakpoint/orientation selection; remove obsolete grid rules and variables |
| `src/routes/_components/projectSlides/projectSlideMedia.svelte` | Consume resolved dimensions and source hints; remove grid-line placement bindings and obsolete CSS |
| `tests/projectSlideLayout.test.mjs` | Extend existing mathematical and compatibility fixtures for Auto/custom mode and both axes |

Keep changes to shared image/video components minimal and only where browser verification demonstrates a need. Do not alter queries or write to Sanity.

Use non-overlapping breakpoints: mobile at 768px and below, desktop strictly above 768px. Keep geometry reactive to viewport resizing, orientation changes, asset changes, and slide navigation. Disconnect observers on teardown.

## 8. Implementation sequence

1. Record the current diff and type/build baseline, preserving existing work.
2. Implement pure desktop and Auto/custom mobile span resolution with explicit issue states.
3. Consolidate geometry around the track-plus-gutter formula and axis selection.
4. Replace layered grid/flex CSS with one flex placement contract at both breakpoints.
5. Connect effective asset ratios, contained/covered dimensions, and image source hints.
6. Verify mathematical fixtures and source immutability.
7. Inspect the local frontend with actual media and local-only synthetic stacked fixtures where no saved example exists.
8. Run type check and build, review scope, and capture representative screenshots. Do not deploy.

## 9. Acceptance criteria

### Mathematics and validity

- [ ] Two-track extent equals 2T + G; eight desktop tracks retain the 416px reference fixture.
- [ ] Changing the gap changes both track sizing and inter-media spacing coherently.
- [ ] Every desktop centered size maps to its exact half on Auto mobile, including 3, 5, and 7.
- [ ] All valid desktop combinations of one to four supported spans remain within mobile's 12-unit budget.
- [ ] Exactly-full compositions reserve gaps correctly; compatibility buffer fitting is explicit.
- [ ] Over-budget inputs retain invalid status rather than becoming valid through fitting.
- [ ] Source objects and stored desktop/mobile values remain unmodified.

### Existing content

- [ ] Old mobile Center defaults resolve to Auto.
- [ ] Existing custom mobile spans, mobile Justify, orientation, and mobile asset overrides are preserved.
- [ ] Missing and partial mobile data follow the stated rules and produce useful diagnostics.
- [ ] Desktop consolidation and valid desktop appearance remain consistent with the previous approved sizing contract.

### Browser behavior

- [ ] Horizontal groups are centered with equal gaps on desktop and mobile.
- [ ] Stacked groups are vertically centered, horizontally centered, and evenly spaced.
- [ ] Mixed aspect ratios and videos stay contained; single-media Justify covers both dimensions.
- [ ] No CSS grid positioning remains in the shared project-slide components.
- [ ] Verify 390×844, a smaller phone, 768px, 769px, and a desktop viewport, including resizing across the breakpoint.
- [ ] Verify both selected-work/first-slide rendering and later project-slide routes.
- [ ] Verify placeholder loading, mobile replacement assets, and video controls.
- [ ] Capture horizontal mobile, stacked mobile, and desktop screenshots.

### Checks and closeout

- [ ] Run `node --test tests/projectSlideLayout.test.mjs`.
- [ ] Run `npm run check` and `npm run build`; distinguish existing warnings from new issues.
- [ ] Final diff contains only authorized frontend work and associated documentation/tests.
- [ ] No CMS writes, migrations, pushes, or deployments occurred.

## 10. Later CMS phase

After the frontend contract is accepted, separately plan the CMS mobile section: Auto on by default for inferred defaults, manual size buttons when off, an always-available orientation dropdown, and preview parity with these formulas. Mobile manual sizes would be 3–8; full-slide Justify remains a separate single-media mode. Persisted fields and any data migration require their own explicit authorization.


## Local implementation evidence — 2026-11-05

- Shared axis-aware geometry now drives flex on desktop and mobile; grid placement was removed from both project-slide components.
- Auto inference follows the missing/default mobile-span rules above. Custom spans and orientation remain unchanged in source data.
- Geometry reports spans, total, validity/issues, gap adjustments, fit scale, and fit reason. Development diagnostics identify compatibility fallbacks.
- All 16 layout tests pass, including half-span mapping, valid desktop combinations, custom/partial data, stack geometry, and immutable inputs.
- Svelte check: zero errors; four pre-existing navigation accessibility warnings. Local production build passes.
- Browser inspected the real Octobers Very Own diptych at 320, 390, 768, 769, and 1280px widths, and the first-slide route on mobile. Horizontal groups are centered with equal gaps.
- Stacked multi-media geometry is exercised by automated fixtures; the audited saved content had no portrait multi-media slide for a corresponding real-content browser check.
- Screenshots: `flex-auto-mobile.jpg` and `flex-desktop.jpg` in the current Codex visualization directory.
- No CMS source, dataset, migration, or deployment changes were made in this implementation phase.
