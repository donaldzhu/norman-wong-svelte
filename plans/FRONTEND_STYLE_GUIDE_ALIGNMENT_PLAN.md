# Frontend style-guide alignment

Date: 2026-11-08  
Status: Implemented locally after explicit authorization; verification and limits recorded below. No deployment or content migration.  
Repository: `norman-wong-svelte`

## 1. Objective

Address every finding from the read-only frontend style audit: correct the Selected Works link, improve existing control semantics and keyboard focus, and align handwritten frontend code with the supplied style conventions while preserving the current design and layout behavior.

Reference: [High Contrast frontend style guide](</Users/donaldzhu/Dropbox/Work/01 Freelance/High Contrast/04 Developement/HighContrast-Frontend/docs/STYLE_GUIDE.md>), reviewed on 2026-11-08. Treat this document as the requested review criteria. Its High Contrast-specific scripts, diagnostics, routes module, and neighboring repository instructions are not automatically part of the Norman Wong project.

## 2. Authorization and boundaries

The initial request authorized this plan. Subsequent requests explicitly authorized frontend implementation and continuation. Publishing, deployment, content migration, and CMS edits remain outside this work.

When implementation is explicitly requested:

- Work locally in the frontend checkout and preserve unrelated changes.
- Scope includes the audited components, utilities, styles, their consumers, and necessary regression coverage.
- Keep the CMS checkout, Sanity dataset, schema field names, GROQ data contract, and assets unchanged.
- Preserve desktop/mobile spans, Auto sizing, orientation, Justified behavior, crop/hotspot handling, responsive gaps, and width-first desktop sizing. Do not restore legacy-grid inference.
- Preserve normal visual appearance, animation timing, scroll geometry, image loading, and playback. Intended behavior changes are valid native links and usable, named keyboard controls with visible focus.
- Do not add features, change layout values, rewrite the navigation/scroll system, or upgrade dependencies.
- Do not install High Contrast's tooling, copy its full verification suite, or create empty configuration/modules solely to match its paths.
- Do not commit, push, deploy, or modify live content as part of this plan.

## 3. Audit baseline

The preceding read-only audit covered all 19 Svelte components, shared styles, utilities, types, and route code. The checkout was clean at the start of this planning turn.

Recorded verification from the audit:

- All 11 existing project-slide layout tests passed.
- All 19 components and global SCSS compiled in memory.
- Four compiler accessibility warnings concerned the two clickable slide-navigation divs.
- Full `svelte-check` did not complete successfully: its Vite preprocessing attempted to write a temporary configuration file outside the writable workspace. This is a verification limitation, not 15 confirmed source defects.
- No build or cross-browser matrix ran during that audit.
- No unused HTML IDs or `data-testid` hooks were found.
- Small prop types are already inline. No application-owned URL query parameters currently need centralization.
- The frontend has `check`, `build`, and `sass` scripts, but no `style:check`, `format`, or `verify` scripts. The source guide's six understood CSS warnings belong to High Contrast, not this project.

Re-record the baseline before implementation; these observations are not a substitute for checks on the eventual diff.

## 4. Functional and accessibility corrections

### 4.1 Correct the Selected Works anchor

File: `src/routes/_components/selected/selectedProjectSection.svelte`.

The current quoted attribute `href="/projects/${project.slug.current}/1"` produces a literal dollar sign followed by the interpolated slug. Svelte's parsed template confirmed this. The separate animated click handler masks the problem for ordinary clicks; native link actions use the bad URL.

- Use Svelte quoted interpolation so the href resolves to `/projects/<slug>/1`, without the extra dollar sign.
- Preserve the animated ordinary-click flow and its modifier-key bypass in `selectedProjects.svelte`.
- Verify ordinary click, keyboard activation, Command/Ctrl-click, middle-click, opening in a new tab, and copying the link.
- Add a focused regression check of the rendered href using local fixture data. Do not add a test-only ID or class.

### 4.2 Use native slide-navigation controls

File: `src/routes/projects/[project]/[slide]/+page.svelte`.

- Replace the previous/next clickable divs with native `button type="button"` controls.
- Preserve accessible names, hit-area dimensions, positioning, stacking, wraparound behavior, and appearance.
- Retain the existing window arrow-key behavior without introducing duplicate handling of Enter/Space.
- Verify the new buttons do not intercept video or header controls incorrectly.
- Resolve the four existing navigation accessibility warnings through semantics, not suppression.

### 4.3 Name the video control and preserve focus

Files: `src/lib/components/video.svelte`, `src/lib/assets/svg/play.svelte`, `src/lib/components/mute.svelte`, `src/routes/_components/header/header.svelte`, `src/lib/styles/app.scss`, and relevant mixins in `_layout.scss`.

- Give the video play control an accessible name describing its actual action. Preserve the existing autoplay, preview, and pause/play behavior; do not turn it into a new play/pause feature.
- Treat the play SVG as decorative once its parent control supplies the name.
- Review when the video wrapper is actionable. Avoid an unnamed or inactive keyboard stop in preview/playing states while preserving access to the actual playback control.
- Restore a visible keyboard-focus indicator after the global and component-level `all: unset` resets. Keep normal and pointer-hover visuals unchanged, avoid layout shifts, and check contrast over both white pages and full-bleed media.
- Expose existing Information open/closed state and Mute/Unmute state with appropriate semantics; retain their visible wording. Only add IDs if needed for a real association, and keep them unique across the mobile/desktop header instances.
- Check opacity-hidden navigation states for focusable links. Where a region is actually unavailable, synchronize focusability with that state. Do not make an entire shared media region inert if its video controls must remain usable.
- Do not introduce a dialog redesign, decorative hidden text, or broad accessibility infrastructure. Reuse native semantics and existing structure.

## 5. Naming, bindings, and prop contracts

### 5.1 Boolean predicates

Audit declarations, custom props, object results, parameters, and boolean-returning helpers, then rename each local/application-owned boolean and all its consumers together.

Representative mappings:

| Existing name | Intended name |
| --- | --- |
| `loaded` | `isLoaded` |
| `paused`, local/custom `muted` | `isPaused`, `isMuted` |
| `preview`, `showMuteButton` | `isPreview`, `shouldShowMuteButton` |
| `windowIsMobile`, `prevIsMobile` | `isMobileViewport`, `wasMobileViewport` |
| `infoIsVisible`, `userHasScrolled` | `isInfoVisible`, `hasUserScrolled` |
| `requiresSoftAdjustment` | `shouldAdjustCenter` |
| geometry `ready`, `valid`, `justified`, `stacked`, `mobile` | `isReady`, `isValid`, `isJustified`, `isStacked`, `isMobile` |
| `gapAdjusted` | `isGapAdjusted` |
| `validSlideV2` | `isValidSlideV2` |
| `pageIsProjectPage`, `pageIsSelectedWorksPage` | `isProjectPage`, `isSelectedWorksPage` |

Resolve name collisions semantically. For example, if a component already derives `isProjectPage`, name the imported predicate `isProjectRoute` instead of adding an alias solely for shorthand. In `video.svelte`, distinguish the requested mute-button prop from the computed visibility condition, such as `shouldShowMuteControl`.

Preserve external names exactly: native/Mux `muted`, `loop`, `autoplay`, DOM `complete`, Sanity `mobile.auto`, and stored `hideOnMobile`. For example, bind the renamed local state with `muted={isMuted}` at the external boundary. Do not rename persisted fields or reshape fetched data to satisfy a naming rule.

Before renaming exported layout-result fields, search tests and sibling consumers. Update frontend consumers atomically. If an actual cross-repository contract requires an existing field name, preserve that boundary and use predicate-named local bindings; record the exception rather than changing the CMS under this frontend plan.

### 5.2 `const` and `let`

- Change `remainingGap` in `src/lib/utils/dom.ts` to `const`; it is not reassigned.
- Inspect other ordinary bindings for the same issue.
- Preserve `let` where required for state mutation, binding, prop updates, or intentionally overridden derived values.
- Do not split mixed destructuring just to make individual bindings `const`, or mechanically replace all reactive declarations.

### 5.3 Native-event handler names

- Rename the scroll action's `onScroll` to `onscroll`, updating both listener registration and cleanup.
- Review other native-event-named functions for the same convention.
- Preserve meaningful action names and custom callback contracts such as `onNavigate`. Do not add wrappers or aliases just to obtain shorthand.

### 5.4 Actual prop optionality

- Make `SelectedProjectSection.isSelected` required: its sole current caller supplies it.
- Inspect all actual consumers of the image/video/media wrappers and narrow props that are always supplied, including `Video.video` if confirmed at implementation time.
- Distinguish a prop that may be omitted from a required forwarded prop whose value may legitimately be `undefined`.
- Keep genuinely supported omissions: for example, the project route supplies only `slide` to `ProjectSlide`, while the shared renderer forwards optional preview/control behavior.
- Retain inline types for small prop lists. Do not extract interfaces solely to name them or remove runtime handling for genuine loading/missing asset states.

## 6. CSS classes and selectors

### 6.1 Build a selector inventory before renaming

Search template classes, SCSS mixins, `:global` selectors, DOM queries, and tests together. Distinguish local styling-only classes from same-tag roles, states, and required cross-component contracts.

- Flatten `selected-works__scroll__track` to `selected-works__scroll-track` and `selected-works__scroll__segment` to `selected-works__scroll-segment`.
- Convert local states to BEM modifiers, including video paused/project-page states, project-slide ready/justified states, and Selected Works selected/navigating/highlighted/hidden states.
- Remove `play-icon` and use the component's scoped `svg` selector.
- Review other unique-tag classes, including the slide's unavailable paragraph and gap-measurement span, for removal when their only purpose is scoped styling.
- Preserve classes that distinguish different div roles. Do not replace a role-specific selector with a broad tag selector that catches unrelated descendants.

### 6.2 Coordinate shared states and media contracts

`_layout.scss` currently consumes shared states such as `active`, `portrait`, `landscape`, `has-mobile-media`, and `is-mobile-media`. These cannot safely be renamed one component at a time.

- Map their image/video/header/mute consumers before editing.
- Use BEM state names and update mixins and all participating templates in the same change. Prefer a small explicit selector parameter where a mixin needs different component modifiers; do not create a new styling framework.
- Retain `project-slide-media` where needed to identify the media wrapper across a component boundary. Replace it with an ancestor-scoped tag relationship only if that relationship remains unambiguous for images, video wrappers, and mute controls.
- Check the parent's `button.video` rules before removing the video base class or switching to scoped tag styling.
- Keep stored orientation values and CSS behavior unchanged. This work changes names and selector structure, not breakpoint semantics or media geometry.

### 6.3 Nest repeated descendants

- Nest repeated `.project-slide__media-container :global(...)` rules under the shared local ancestor separately within each existing breakpoint.
- Nest justified overrides under their appropriate state selector.
- Prefer local-ancestor/global-tag targeting where the tag identifies the intended child unambiguously.
- Preserve child versus descendant relationships, specificity, `!important` behavior, and source order. Never replace anchored rules with unqualified global media selectors.

## 7. Formatting and declaration order

### 7.1 CSS declarations

Apply the guide's order to handwritten SCSS and component style blocks:

1. Local variables/custom properties.
2. Dimensions and box sizing.
3. Spacing.
4. Position and stacking.
5. Flex/grid/display/alignment/gaps.
6. Typography and text color.
7. Appearance and media fitting.
8. Overflow and interaction.
9. Motion.

Use blank lines between populated groups in substantial rules. Preserve compact small rules.

Handle `all: unset`, shorthand/longhand overrides, mixin output, nested selectors, and responsive blocks as cascade-sensitive boundaries. Do not sort across them mechanically. In particular, inspect `fullscreen`, `auto-fit-media`, `demarcate-media`, `text-button`, and `hide-scrollbars` before moving their calls.

Edit `src/lib/styles/app.scss` and its source mixins; regenerate `src/app.css` with the existing Sass command when needed. Do not hand-edit the generated CSS independently.

### 7.2 Attributes and props

Order template attributes, prop destructuring, and inline prop types consistently where safe: identity/semantics; styling; content/configuration; accessibility/metadata; references/non-boolean bindings/directives; booleans; handlers/callbacks.

Keep `aria-*` and `data-*` in metadata, class/style directives together, and native boolean names unchanged. Preserve spread precedence, dependent defaults, and listener/binding execution order. Review the image component's spread and style directives manually.

### 7.3 Style interpolation

- Replace `allThumbnailRow.svelte`'s template-literal gap expression with quoted interpolation, such as `style:--unfilled-col-gap="{isUnfilled ? maxGap : 0}px"`.
- Review the conditional scroll-snap string in `selectedProjects.svelte` against the same rule; preserve valid `none` and `y <strictness>` values without adding a redundant alias solely for formatting.
- Keep pure values as direct expressions. Do not apply this rule to ordinary JavaScript strings outside style directives.

## 8. Keys and already-compliant areas

### Keys

- Remove keys from the fixed mobile/desktop header list and its fixed link-destination list after confirming those destinations remain constant while mounted.
- Remove the key from the fixed copy-index loop. Keep `copyIndices` and the loop index because they still drive the repeated layout and flat-index calculations.
- Preserve slide-media keys: slide navigation replaces media, and component identity affects loading and playback state.
- Inspect the project list's actual update paths before deciding on its keys; do not assume live CMS reordering exists.
- Preserve the intentional `selectedWorksKey` reset until verified otherwise: returning to Selected Works currently recreates the scroll component. Removing this is not a style-only change.
- Preserve Sanity `_key` and `_id` content fields even when a template no longer uses a key.

### No-op checks

Recheck, but do not invent cleanup where the audit found none:

- No unused HTML IDs or debug/test-only attributes.
- Inline small prop types already follow the guide.
- No application query parameters currently need `QUERY_PARAM_KEYS`. Do not add an empty routes module or introduce filters/sorting.
- Do not add test-only hooks while verifying this work.

## 9. Delivery sequence and affected files

| Phase | Files/areas | Deliverable |
| --- | --- | --- |
| Baseline | Current diff, screenshots, existing checks | Recorded starting behavior and known diagnostics |
| Functional fix | `selectedProjectSection.svelte`; focused regression coverage | Correct native href with animated navigation preserved |
| Semantics and focus | Slide route, video/play/mute/header, global SCSS | Native navigation, named controls, state semantics, visible keyboard focus |
| Script conventions | Layout helpers, URL/DOM utilities, scroll action, component props/state | Consistent predicates, correct bindings, required props |
| Selector cleanup | Selected Works, project-slide/media components, header/info, image/video, All Projects, shared mixins | Flat BEM, purposeful classes, scoped nested selectors |
| Ordering | Handwritten Svelte/SCSS; generated `app.css` as required | Declaration/attribute/prop order and style interpolation |
| Key review | Header, Selected Works, shared slide renderer | Only behaviorally justified keys retained |
| Verification | Existing layout tests, targeted link check, compiler/build, browser checks | Documented results and remaining limitations |

Keep these phases reviewable in the diff. Do not combine a naming change with new geometry formulas, altered content queries, or an unrelated scroll rewrite. If a functional defect beyond this audit appears, record it separately instead of silently expanding implementation.

## 10. Verification and acceptance criteria

### Automated and source checks

- [x] Record a fresh `git status`/diff and preserve unrelated work.
- [x] Run the existing 11 layout tests; update renamed application-owned result keys in tests without weakening assertions.
- [x] Add/run a focused rendered-link regression using local fixture data and semantic selectors.
- [x] Regenerate global CSS with `npm run sass` if its source changed.
- [x] Run `npm run check` and `npm run build` when implementation is authorized; distinguish configuration/environment failures from source failures.
- [x] Confirm the four navigation accessibility warnings are resolved and no new compiler warnings are introduced by selector changes.
- [x] Re-scan the audited conventions; document intentional external/shared-contract exceptions.
- [x] Run `git diff --check` and verify generated CSS matches its source.
- [x] Do not claim High Contrast's `style:check`, formatter, or `verify` matrix ran here. Manual convention review remains required unless tooling is separately added later.

### Browser and visual regression checks

- [ ] Verify Selected Works ordinary navigation, native open-in-new-tab actions, copied links, and keyboard activation.
- [ ] Check Tab/Shift-Tab and Enter/Space on header, previous/next, video play, and mute controls. Keep visible focus and avoid unavailable hidden controls in the tab order.
- [ ] Check Information and mute state announcements without duplicate decorative icon announcements.
- [ ] Verify return-to-home scroll reset, selected title highlighting, scroll recentering, and project slide transitions after key/class changes.
- [ ] Compare desktop and mobile screenshots for centered single media, diptychs, Justified media, Auto Portrait, and saved manual orientations.
- [ ] Confirm image placeholders, crop/hotspot positioning, mobile asset replacements, video autoplay/preview, and mute placement remain unchanged.
- [ ] Check All Projects thumbnail sizing, hover, and links; include 390px, 768px, 769px, and a representative desktop width.
- [ ] Exercise available Chrome, Firefox, and WebKit/Safari environments; explicitly list browsers/devices not run. Do not add a browser-testing platform or substitute narrow viewport testing for real touch-device coverage.
- [ ] Use local fixtures for missing content cases. Never edit the production dataset to create test content.

### Completion

- [x] Every audit finding is implemented or has an evidence-based, documented exception.
- [ ] No unintended changes to layout values, data contracts, media lifecycle, or ordinary visual appearance.
- [x] No CMS edits, dataset mutations, migrations, dependency upgrades, pushes, or deployments.
- [x] Update this plan with actual implementation status and verification evidence only after authorized work is complete.

## 11. Risk management and rollback

The highest-risk changes are shared media selectors, global resets/focus rules, binding/prop renames, and keyed component lifecycle. Validate those at the phase that introduces them rather than waiting until the end.

Preserve the existing layout calculations and use their tests as regression evidence. For style-only changes, compare compiled selector relationships and rendered screenshots; do not create tests that only mirror spelling or declaration order.

If a phase regresses behavior, revert only that phase's changes and retain unrelated user work. No content rollback or migration is required because this plan changes frontend source only.

## 12. Implementation and verification evidence — 2026-11-08

Implemented locally across the audited frontend scope:

- Corrected the native Selected Works href and added an in-memory rendered-component regression using two fixture slugs. The real link template is compiled; route state and the unused media child are isolated, without introducing production testing hooks.
- Replaced slide navigation divs with named native buttons, retaining hit areas and arrow-key navigation. Added keyboard focus through both global and component resets. The two-tone indicator remains visible on light and dark backgrounds.
- Named the video action, removed its non-actionable playing/preview state from the tab order, hid the decorative SVG from assistive technology, and exposed Information and Mute/Unmute state. The Information overlay makes the underlying page inert while open without affecting its layout.
- Renamed local/custom booleans and internal layout-result fields to predicates; updated frontend callers and tests. Preserved native `muted`, persisted `mobile.auto`/`hideOnMobile`, and the Sanity data shape.
- Tightened always-forwarded prop types, distinguishing required props with potentially undefined values from actual supported omissions. Preserved required reactive/bindable `let` declarations.
- Coordinated BEM modifiers across shared image/video and text-control mixins using explicit selector/block parameters. Flattened scroll element classes and nested repeated slide descendants under their local container. Removed unique-tag styling classes where unneeded; retained `project-slide-media` because the parent must identify that wrapper among child image/video/control elements.
- Applied declaration, attribute, and inline prop ordering, with `all: unset`, nested/responsive mixins, spreads, and binding/listener order treated as semantic barriers. Regenerated `src/app.css` from Sass.
- Removed fixed header/copy/project-list keys. The project list is server-loaded and has no live reordering path in this implementation. Retained media `_key` identity across slide replacement and the intentional root Selected Works scroll-reset key.
- Removed hidden resize/loading regions and navigating title links from keyboard interaction using their existing states.

### Automated results

- `node --test tests/*.test.mjs`: **12 passed** (11 geometry/contract tests plus the native-link regression).
- `npm run check`: **0 errors, 0 warnings**. The four original slide-navigation accessibility warnings are resolved.
- `npm run build`: **passed**. Vite reports a large bundle warning for existing player dependencies; adapter-auto reports no production provider in this local build. No dependency splitting or deployment configuration was added.
- Existing CMS `tests/projectSlidePlannerLayout.test.mjs`: **passed**, including **2,800 size combinations** and frontend geometry parity. CMS files were not edited.
- Temporary ordering verification: **passed**. Used a temporary adaptation of the referenced guide's checker with the Norman Wong mixins and an `all: unset` barrier, plus the already-installed formatter from the reference checkout. No tools, scripts, dependencies, or package scripts were installed into this frontend.
- `git diff --check`: **passed**; generated global CSS was refreshed using `npm run sass`.

### Browser results

Verified in the in-app Chromium browser against the local frontend:

- OVO `/3` diptych at desktop, 390px mobile, and the 768px/769px boundary. Desktop dimensions/positions remain exactly the measured baseline: 307 × 391.078125 at (214, 164.453125), and 525 × 668.796875 at (541, 25.59375), in a 1280 × 720 viewport.
- The saved mobile diptych retains its vertically stacked composition and equal gap. No span, sizing formula, or orientation change was introduced.
- Moncler `/9` Justified image fills the slide.
- Native Next/Previous controls advance with Enter/Space; visible keyboard focus was confirmed through computed outline and shadow values.
- Information opens and closes with correct expanded state; underlying slide controls disappear from the accessible tree while it is open.
- Selected Works return/reset, correct hrefs, normal animated navigation, and Command-click opening a separate tab at `/projects/chris-bumstead-the-standard/1` all work.
- The 9million `/10` video renders and plays; Mute/Unmute actions update their displayed pressed state. Actual audio output was not independently measured.
- The index renders desktop rows and mobile thumbnail arrangements after resizing.
- No browser warnings/errors were recorded during these checks.

Screenshots captured: `/tmp/norman-style-desktop.jpg` and `/tmp/norman-style-mobile.jpg`.

### Intentional exceptions and remaining verification limits

- The scroll-snap directive retains a conditional between complete CSS values (`none` versus `y <strictness>`). Its template literal constructs one complete branch, unlike the corrected numeric gap directive. Avoided duplicating its reactive condition or adding an alias solely for formatting.
- Spread and binding/listener precedence take priority over a purely cosmetic attribute order. In particular, the image spread and Mux reference-binding relationship were preserved.
- External/native field names and actual shared wrapper contracts retain their established spelling. No dataset changes or compatibility layer were introduced.
- Firefox, native Safari/WebKit, physical touch devices, assistive-technology speech, audio output, native copy-link context menus, and exhaustive wraparound/swipe interactions were not exercised. These are verification limits, not claimed passes.
- Crop/mobile asset geometry is covered by the existing tests; not every asset/orientation variant was inspected in a browser.
- No CMS source edits, content mutations, data migrations, dependency upgrades, commits, pushes, or deployments occurred.
