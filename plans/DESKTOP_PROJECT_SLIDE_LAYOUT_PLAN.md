# Desktop Project Slide Layout Plan

Status: Implemented — automated checks and targeted browser verification complete; expanded browser coverage remains outstanding.

Date: 2026-11-05

Repository: `norman-wong-svelte`

## 1. Objective

Simplify desktop project slide presentation by interpreting existing Sanity grid spans as six centered media sizes or a single-media justified layout. Existing content must work immediately without being rewritten.

The six centered sizes are **6, 8, 10, 12, 14, and 16 columns** of the existing desktop grid. Preserve its column-track and gutter sizing, including its existing 8px container buffer as the sizing reference. Consolidation changes the selected column count; it does not redefine widths as fractions of the viewport.

This plan covers the frontend implementation and its verification. Implementation was explicitly authorized after this plan was written.

## 2. Scope and boundaries

### In scope

- Desktop rendering of project slides in the Svelte frontend.
- Runtime interpretation of existing `desktopStart` and `desktopEnd` values.
- Centered media groups with consistent visible gaps and preserved aspect ratios.
- Full-slide cover for eligible single-media slides.
- Images, videos, and their loading presentation within project slides.
- Desktop image-size hints needed to serve appropriate image resolutions.
- Both consumers of the shared slide renderer: selected-work/homepage previews and project pages.
- Focused verification of layout mathematics, visible rendering, and unchanged mobile behavior.

### Explicitly out of scope

- **No migration, backfill, bulk update, or other Sanity content write.**
- **No CMS code, schema, planner, validation, controls, or preview changes.**
- **No mobile layout redesign or mobile span remapping.**
- No new persisted layout modes or size fields.
- No GROQ projection changes or new backend requests for layout information.
- No changes to the All Projects grid, global responsive conventions, navigation, animation design, or playback policy.
- No deployment or publishing as part of writing this plan.

The existing CMS planner can continue to write its current fields. Every desktop render interprets those fields through the rules below. CMS preview parity is outside this phase.

## 3. Current implementation

Relevant source files, inspected on 2026-11-05:

| File | Current responsibility | Planned relevance |
| --- | --- | --- |
| `src/routes/_components/projectSlides/projectSlide.svelte` | Fullscreen slide container; 24-column desktop grid and mobile grid | Own desktop group geometry and justified mode |
| `src/routes/_components/projectSlides/projectSlideMedia.svelte` | Per-item desktop/mobile grid placement; media rendering and image-size hints | Consume resolved desktop dimensions while preserving mobile placement |
| `src/lib/components/media.svelte` | Dispatch to image/video components and mobile variants | Add only narrowly scoped presentation plumbing if required |
| `src/lib/components/image.svelte` | Image dimensions, placeholders, responsive source selection | Ensure desktop slide sizing/fit reaches both image layers |
| `src/lib/components/video.svelte` | Mux player, aspect ratio, autoplay/pause/mute behavior | Ensure desktop slide sizing/fit reaches actual video content |
| `src/lib/utils/media.ts` | Media aspect-ratio helpers and source selection | Reuse existing metadata; guard invalid ratios locally |
| `src/lib/utils/sanity.ts` | Existing image URL sizing and hydrated slide data | Reference existing capabilities; no query/data-model changes |
| `src/routes/projects/[project]/_components/configs.ts` | Desktop count 24 and mobile count 12 | Retain the desktop sizing denominator and mobile constants |
| `src/routes/_components/selected/selectedProjectSection.svelte` | Shared slide rendering on selected work and first-slide route transitions | Integration verification |
| `src/routes/projects/[project]/[slide]/+page.svelte` | Later slide rendering and slide navigation | Integration verification |
| `src/lib/styles/_responsive.scss` | Mobile and desktop media-query mixins | Reference only; avoid global breakpoint changes |
| `src/lib/styles/app.scss` | `--project-slide-gap: 2rem` | Reuse the computed gap; do not hard-code a pixel equivalent |

Current details that affect implementation:

- Desktop width is currently determined by CSS grid lines. Each media item's span is `desktopEnd - desktopStart`.
- Desktop image-size hints use the raw span divided by 24, with a 1.2 multiplier.
- The old slide container has an 8px width/height buffer. Retain its width buffer when deriving column-track widths. Use actual slide bounds for centering, fitting, and full-slide cover; preserve mobile behavior separately.
- Mobile Landscape uses columns; mobile Portrait uses rows. Both use a 12-unit reference.
- The shared media components carry orientation classes and intrinsic aspect-ratio styles. Desktop layout must not accidentally inherit height constraints from `mobileOrientation`.
- Mobile applies at widths of 768px and below. The existing desktop Sass mixin also starts at 768px, creating an overlap at that exact width. Scope the new behavior strictly above the mobile boundary without changing the shared breakpoint definitions.
- The first project slide is rendered through the selected-work component; later slides use the project slide route. Both paths require verification.

## 4. Desktop behavior contract

### 4.1 Runtime span mapping

Read the original fields without modifying the source object:

`storedSpan = desktopEnd - desktopStart`

| Stored desktop span | Resolved desktop presentation |
| --- | --- |
| 4 | Centered size 6 |
| 6 | Centered size 6 |
| 8 | Centered size 8 |
| 9 | Centered size 8 |
| 10 | Centered size 10 |
| 12 | Centered size 12 |
| 14 | Centered size 14 |
| 16 | Centered size 16 |
| 18 | Centered size 16 |
| 24, with exactly one media item | Justified: full-slide cover |
| 24, with more than one media item | Centered size 16 for that item |

Additional defensive rules for values outside the audited set:

- Valid integer spans not explicitly listed resolve to the nearest centered size. Choose the smaller size for an equal-distance tie.
- Invalid or missing grid lines, non-finite values, non-integer values, or an end not greater than its start resolve to centered size 8.
- Validate legacy line bounds before recognizing a full span: start 1–24, end 2–25. Malformed data must not accidentally activate justified mode.
- Only an exact, valid span of 24 on a single-item slide activates justified mode. A large image or a size of 16 does not imply cover.
- An empty media array renders no media and does not enter a fitting calculation.

These defensive rules are frontend fallbacks. They do not repair or save content.

### 4.2 Centered layout

- Ignore the original absolute desktop starting positions after deriving the span.
- Render all items in media array order, from left to right.
- Keep all items in a single row; do not wrap or overlap them.
- Center the entire group horizontally and vertically within the slide.
- Vertically center each item on the same horizontal centerline.
- Use the existing computed `--project-slide-gap` between neighboring media edges. Do not distribute unused width as larger gaps.
- Preserve the original aspect ratio of every image and video. Centered mode must not crop or stretch media.
- Sizes describe target width before fitting; the number of items does not select a different sizing preset.
- Fit the whole group proportionally when necessary. Do not independently shrink individual items in a way that changes their requested relative widths.
- Keep outer margins equal horizontally. Their size is the space left after media and internal gaps are placed.

The group must be sized from the actual aspect-ratio media rectangles. Equal gaps between oversized wrappers with empty space inside do not satisfy the visible-gap requirement.

### 4.3 Size and fitting mathematics

For a positive desktop slide width `W`, height `H`, gap `g`, and `n` media items:

- Let `s_i` be an item's mapped column count.
- Let `r_i` be its source aspect ratio, width divided by height.
- Legacy grid reference width: `W_grid = W + 8px`.
- Grid column width: `c = max(0, (W_grid - 23 * g) / 24)`.
- Requested span width: `w_i = s_i * c + (s_i - 1) * g`.
- The grid gutter `g` participates in this calculation even when there is only one media item.
- Requested height: `h_i = w_i / r_i`.
- Total fixed internal gap: `G = (n - 1) * g`.
- Width fitting factor: `k_width = (W - G) / sum(w_i)`.
- Height fitting factor: `k_height = H / max(h_i)`.
- Uniform scale: `k = max(0, min(1, k_width, k_height))`.
- Final item width and height: `k * w_i` and `k * h_i`.
- Final group width: `sum(k * w_i) + G`.

Use positive, finite inputs and skip calculations for a hidden or zero-sized container. Do not upscale beyond the requested centered size just because more space is available.

The current CMS permits up to four items per slide. Keep the normal gap fixed throughout that supported range. For malformed content with so many items that the gaps alone exceed the viewport, use a bounded, uniform gap fallback before fitting; never emit negative or non-finite dimensions. This fallback must not affect supported one-to-four-item layouts.

Each size remains a real column span of the existing 24-column grid. Include the internal gutters in its width, just as CSS grid does, without drawing gaps inside the image. For example, at a 1280px viewport with a 20px gutter, the old grid is 1288px wide, each track is 34.5px, and an 8-column media item is 416px wide. It is not 1280 / 3 pixels wide. Centering and the gap between separate media items are calculated after these span widths are resolved.

### 4.4 Justified layout

When a slide contains exactly one item whose valid stored span is 24:

- Make the media frame match the full desktop slide width and height.
- Apply cover with centered positioning: preserve aspect ratio, fill both dimensions, and crop the excess.
- Apply no internal group gap or centered-size cap.
- Use the actual slide bounds without inheriting the old desktop 8px buffer.
- Apply the same frame and fitting to the loading image/poster and the loaded media.
- Verify the actual Mux video surface fills the frame. Styling only an outer wrapper is insufficient.
- Retain existing video controls, autoplay/pause behavior, muted state, and navigation interactions.

### 4.5 Mobile preservation

At widths of 768px and below, retain the existing rendering path and behavior:

- Original `mobileStart` and `mobileEnd` values and grid positioning.
- Original Portrait/Landscape handling.
- Original mobile alternate asset selection and fallback behavior.
- Original mobile image-size hints, sizing, fit, spacing, and container behavior.
- Original playback, touch, and navigation behavior.

Desktop span mapping must not change mobile fit. In particular, a desktop span of 24 must not cause cover on mobile. Do not alter global media components' default appearance to achieve the desktop change.

## 5. Proposed implementation structure

### 5.1 Pure desktop layout resolver

Add a small frontend utility, provisionally `src/lib/utils/projectSlideLayout.ts`, with separate responsibilities for:

1. Validating and mapping an existing desktop span.
2. Choosing centered versus justified presentation from the item count and span.
3. Producing centered media dimensions from sizes, aspect ratios, slide bounds, and the resolved gap.

Keep the resolver independent of Sanity mutations, DOM access, navigation, and video playback. Return derived values; never mutate incoming slide/media data. Keep legacy transport types intact and use separate local types for the derived layout.

### 5.2 Slide-level measurement and presentation

Use `projectSlide.svelte` to derive the layout once for the group and pass each item's resolved presentation to `projectSlideMedia.svelte`.

Preferred approach:

- Measure the actual desktop slide container and resolve the CSS gap.
- Recalculate when the slide data, aspect-ratio metadata, container dimensions, or relevant gap value changes.
- Use one scoped resize observer per mounted slide if JavaScript measurement is needed; clean it up on unmount and avoid observer feedback loops.
- Do not change global viewport utilities or add a new layout library.
- Use desktop-scoped styles to replace grid positioning. Keep the existing mobile rules in effect.
- Keep server rendering safe: no unguarded access to `window`, computed styles, or observers before mount.
- Keep initial markup stable and provide a bounded, centered desktop fallback while dimensions are unavailable; verify that hydration does not visibly flash the old grid positions.
- Use one media/player instance per existing rendered asset path. Do not duplicate desktop and mobile slide trees to switch layouts.

### 5.3 Media presentation integration

The per-item component should receive explicit desktop width, height, and fit rather than recalculate its own independent fitting scale.

If the shared `Media`, image, or video components require changes, add an opt-in project-slide presentation mechanism. Its default must preserve other callers and mobile rendering.

Pay particular attention to:

- Existing width/height rules from `auto-fit-media` and orientation classes.
- Existing inline `object-fit: contain` styling.
- The image wrapper's intrinsic aspect ratio and both placeholder/loaded image layers.
- The video button's aspect ratio and the actual Mux playback surface.
- Keeping slide navigation overlays, play-to-resume controls, mute buttons, and stacking order functional.

Use aspect-ratio metadata already returned with slide media. Guard missing or invalid image/video metadata in the desktop resolver. A safe temporary ratio/contained placeholder may reserve space until the real ratio is available; do not stretch the media or send invalid dimensions into the group calculation. Do not introduce a new Sanity query for this purpose.

### 5.4 Image source sizing

Update only the desktop part of the project's image-size hints:

- Centered images: derive required source width from the final fitted image width.
- Justified images: account for the full covered source width, which can exceed the frame width when height determines cover scaling. For source ratio `r`, this width is `max(W, H * r)`.
- Preserve the existing image URL pipeline, candidate-size limits, and mobile hints.
- If retaining the existing 1.2 resolution allowance, apply it to the resolved required width, not the old raw span.
- Avoid introducing duplicate image downloads or separate visible media instances.

## 6. Implementation sequence

1. **Record the baseline.** Capture representative desktop and mobile views and confirm the current working tree. Record existing type-check/build failures separately if present.
2. **Add the pure resolver.** Implement the exact mapping and group-fitting rules with focused mathematical verification.
3. **Integrate centered desktop rendering.** Replace desktop positioning in the shared slide components, then verify single and multi-media groups.
4. **Integrate justified desktop rendering.** Verify images, videos, and loading layers cover the full slide.
5. **Update desktop image-size hints.** Keep mobile source selection unchanged.
6. **Check both slide consumers and responsive transitions.** Verify homepage previews, project first slides, later slides, and boundary resizing.
7. **Complete validation and review the diff.** Confirm that only relevant frontend source/test files changed and that no CMS or content-writing work was introduced.

Do not run a migration, alter content to create test cases, or update the CMS as a dependency of any step.

## 7. Verification plan

### 7.1 Resolver and geometry checks

Use focused checks that assert observable layout outcomes, not only the implementation's internal structure. Avoid adding a large test framework solely for this change.

| Case | Required outcome |
| --- | --- |
| Exact sizes 6, 8, 10, 12, 14, 16 | Remain those centered sizes |
| Legacy spans 4, 9, 18 | Resolve to 6, 8, 16 respectively |
| Single valid span 24 | Full-slide justified mode |
| Span 24 among multiple media | Centered size 16; all items remain visible |
| Single centered item | Equal left/right and top/bottom margins |
| Two unequal centered sizes | Requested width ratio preserved after fitting |
| Three/four items that exceed available width | One proportional scale; fixed equal gaps; no wrapping or clipping |
| Tall media exceeding the slide height | Whole group shrinks proportionally; all centered media remains visible |
| Different aspect ratios | Equal visible edge-to-edge gaps |
| Invalid spans or ratios | Finite, bounded fallback; no exception or stretched media |
| Empty slide / zero container dimensions | No divide-by-zero or invalid styles |
| Input data after resolution | Original slide and media objects unchanged |

For measurable geometry, allow normal subpixel rounding, targeting a maximum discrepancy of 1 CSS pixel for centering and gap equality after layout settles.

### 7.2 Representative content

The following are examples from the read-only audit on 2026-11-05. Verify their current slide positions before using them; these are examples, not stable fixtures.

| Scenario | Example |
| --- | --- |
| Span 4 promoted to 6 | Body of Work, slides 2–4; Octobers Very Own, slide 2 |
| Span 9 reduced to 8 | 9million — Shine On, slide 1; Nemahsis — Spinning Plates, slide 2 |
| Span 10 | Hublot — Daniel Arsham, slide 3 |
| Span 12 | Hublot — Novak Djokovic, slide 3 |
| Span 14 | Hublot — Novak Djokovic, slide 7; Moncler — 1017 ALYX 9SM, slides 2 and 10 |
| Span 16 | Hublot — Novak Djokovic, slides 1 and 5; Moncler — 1017 ALYX 9SM, slide 9 |
| Span 18 reduced to 16 | Hublot — Daniel Arsham, slide 1 |
| Span 24 becomes cover | Moncler — 1017 ALYX 9SM, slide 7; Nemahsis — Spinning Plates, slide 6 |
| Old off-center placement | Octobers Very Own, slide 2 |
| Multiple media | Moncler and Nike slides containing pairs |
| Video | 9million — Shine On; Nemahsis — Spinning Plates |

Use local test data for three/four-item groups, mixed image/video slides, invalid values, missing metadata, and a full-span video if suitable existing content is unavailable. These fixtures must not be written to Sanity or exposed as new product UI.

### 7.3 Browser and interaction checks

- Check Chrome and Safari.
- Check representative desktop viewports such as 1024×768, 1440×900, and 1920×1080, plus a short/wide viewport that forces height fitting.
- Verify centered images remain fully visible and justified media fills both axes at different aspect ratios.
- Check initial load, loading placeholders, slide-to-slide navigation, repeated navigation, and browser resizing.
- Check homepage selected-work presentation and transitions into the first project slide, then later project slides.
- Check video autoplay/pause, blocked-autoplay resume, mute controls, and navigation click targets.
- Confirm videos and images are not duplicated by the responsive layout switch.

### 7.4 Mobile regression checks

Compare before/after at representative mobile widths, including Portrait and Landscape layout settings, mobile alternate assets, and a desktop span-24 slide.

Explicitly check widths immediately below, exactly at, and immediately above 768px. At 768px and below, the existing mobile layout and fit must remain unchanged. Crossing the boundary must not leave stale desktop dimensions or cover styling applied to mobile media.

Mobile regression testing is required to protect the scope boundary; it does not authorize mobile changes.

### 7.5 Repository checks

Run the frontend's existing commands after implementation:

- `npm run check`
- `npm run build`

Record any failures that predate this work and distinguish them from new regressions. Review the final diff for accidental mobile/global-style changes and confirm there are no schema, CMS, migration, or content-write additions.

## 8. Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Desktop orientation styles leak into mobile | Opt-in desktop presentation, strict breakpoint isolation, boundary comparisons |
| Centered images appear to have unequal gaps | Fit actual aspect-ratio rectangles, not oversized contain wrappers |
| Independent flex shrinking changes intended size ratios | One explicit group fitting factor |
| Tall media clips despite fitting horizontally | Fit against both width and height |
| A video wrapper fills the slide but the video letterboxes | Inspect the actual Mux video surface and poster rendering |
| Resolution hints remain tied to old spans | Derive desktop hints from final centered or covered dimensions |
| Hydration or resizing causes a position flash | Stable markup, bounded initial presentation, observer cleanup, visual verification |
| Shared media changes affect unrelated pages | Opt-in project-slide behavior and targeted caller regression checks |
| Previously unusual placements become visually different | This is intentional for desktop; verify all mapped sizes and preserve original data |

## 9. Acceptance criteria

- [ ] All defined span mappings produce the specified desktop presentation.
- [ ] Centered desktop items preserve array order, aspect ratios, and consistent visible gaps.
- [ ] Groups remain centered and fit within both slide dimensions without cropping or wrapping.
- [ ] Eligible single-media span-24 slides fill the desktop slide with cover.
- [ ] Images, placeholders, videos, and posters use the appropriate desktop fit.
- [ ] The shared renderer behaves consistently in homepage previews and project pages.
- [ ] Existing video and navigation interactions remain functional.
- [ ] Mobile output, including behavior at 768px, matches the baseline.
- [ ] No CMS, schema, query contract, or Sanity content changes are needed or made.
- [ ] No migration or content-write script is added or executed.
- [ ] Type checking and the production build pass, or pre-existing failures are clearly documented.
- [ ] Browser verification demonstrates the required visible behavior; successful compilation alone is not treated as proof.

## 10. Rollback and handoff

Rollback consists of reverting the frontend rendering changes. The original grid fields and all content remain intact, so no content restoration or reverse migration is required.

The implementation handoff should identify changed frontend files, summarize the desktop behavior, list completed visual and automated checks, and state any remaining verification limits. Update this plan's status and checklists only to reflect work actually completed.


## 11. Implementation record

Implemented on 2026-11-05 in the shared project-slide components, with a pure resolver in `src/lib/utils/projectSlideLayout.ts` and focused checks in `tests/projectSlideLayout.test.mjs`. Shared image/video components, CMS code, Sanity queries, and content were not changed.

Validation completed:

- `node --test tests/projectSlideLayout.test.mjs`: seven tests passed. Covers mapping, width and height fitting, relative sizes, aspect ratios, cover eligibility, three/four-item groups, input immutability, and invalid/unmeasured inputs.
- `npm run check`: zero errors; four pre-existing navigation accessibility warnings, also observed in the baseline.
- `npm run build`: passed. Adapter-auto reports that a production deployment target has not been selected.
- `git diff --check`: passed.
- Local browser, 1280×720: Moncler slide 3 has two equal-width media rectangles, equal outer horizontal margins, and a measured 20px visible gap. The image elements match their media frames.
- Local browser: Moncler slide 7 has a 1280×720 frame and image frame with cover enabled.
- Boundary check: 768px retains the 12-column mobile grid; 769px uses the new desktop flex layout.
- Local browser: 9million slide 10 has a 320×180 video player matching its centered media frame, with contain enabled and mute controls present.

Verification limits: a separate Safari run, the full viewport/content matrix, full-span video visual playback, and before/after mobile screenshot comparisons have not been completed. Do not treat these targeted checks as completion of every item in section 7.


## 12. Column-count sizing correction

The user clarified that consolidation preserves the existing column-count sizing. The initial fractional-viewport implementation was incorrect and has been replaced by the grid-track-plus-gutter calculation in section 4.3. Earlier pixel measurements and seven-test results in section 11 describe the superseded implementation.

The correction retains the legacy grid's 8px width buffer solely as a sizing reference. Centering, proportional fitting, single-media cover, and the existing mobile path remain as specified. Two additional regression tests check all six column spans against explicit legacy grid measurements and verify that gutter changes affect single-item spans as well.

Correction verification: all nine layout tests pass; type checking reports zero errors and the same four pre-existing warnings; the production build passes. Moncler slide 1 was visually checked at 1280×720 with a 20px gutter: its 8-column image spans 416px, centered with 432px left/right margins. No migration, CMS, or mobile code changes were made.
