# Frontend style guide

Apply these conventions to new and meaningfully edited frontend code. This is a local copy of the High Contrast frontend style guide, with the function conventions below added for Norman Wong. A documentation update does not authorize a codebase-wide refactor.

The Svelte examples apply to this frontend. References below to High Contrast-specific utilities, paths, scripts, browser suites, and diagnostics describe the source project, not verified tooling or diagnostics in this checkout. Reuse Norman Wong’s existing equivalents where available; this copy does not require adding those tools or importing the source project’s AGENTS.md.

## Boolean names

Always name boolean bindings, props, object properties, and boolean-returning helpers as predicates. Use prefixes such as `is`, `has`, `can`, or `should`, followed by a descriptive name.

```ts
let isMounted = false
let isDestroyed = false
const hasProjects = projects.length > 0
const canGoNext = currentIndex < projects.length - 1
const shouldAnimate = () => isVisible && isDocumentVisible
```

Use `isMounted` instead of `mounted`, `isDestroyed` instead of `destroyed`, and `hasFailed` instead of `failed`. Keep the prefix appropriate to the meaning; not every boolean needs to start with `is`.

When extracting a boolean from an external API whose name does not follow this convention, give the local binding a predicate name. Preserve the external API's field name.

```ts
const { complete: isImageLoaded } = imageEl
```

## `const` and `let`

Use `const` whenever a binding is not reassigned. Use `let` when the binding is reassigned. Mutating an object's properties or an array's contents does not reassign its binding.

```ts
const projects = []
projects.push(project)

let currentIndex = 0
currentIndex += 1
```

Exception: a mixed destructuring declaration may use `let` when at least one extracted binding is reassigned. The other bindings may remain in that declaration; do not split it solely to make those bindings `const`.

```ts
let { width, height } = bounds
width = Math.round(width)
```

Reassignment includes reactive updates performed by Svelte. Preserve required `let` declarations for reactive props and state, even when there is no explicit reassignment in the component's script.

## Functions and return types

Prefer arrow functions for ordinary functions and callbacks. Use a function declaration or ordinary function expression only when needed, such as required hoisting, dynamic `this`, generator syntax, or a framework-required form. Briefly explain a non-obvious exception.

Do not specify a return type when TypeScript already infers the intended type from the function. Keep an explicit return type only when needed to establish a contract that inference does not provide, such as a type predicate, required public return shape, or recursive inference limitation. Parameter types and interface callback signatures are unaffected.

```ts
// Use: the return type is inferred as number.
const double = (value: number) => value * 2

// Avoid a redundant return annotation.
const double = (value: number): number => value * 2
```

For a single-expression arrow function, omit the braces and explicit `return` when it already returns that expression, or when returning the expression's value is acceptable to its callers.

```ts
// Use
const getTitle = (project: Project) => project.title
const refresh = () => reload()
const createPoint = (x: number, y: number) => ({ x, y })

// Avoid unnecessary blocks when the returned value is acceptable.
const getTitle = (project: Project) => { return project.title }
const refresh = () => { reload() }
```

Keep a block when multiple statements are needed or when returning a value would change behavior or violate the callback contract. For example, React effect callbacks must not accidentally return a promise or an arbitrary value. Do not compress multiple statements into a comma expression solely to remove braces.

## CSS class names

When an HTML element is the only element with that tag name in a component, do not give it a class for styling. Select it by tag name in the component's scoped styles instead. For example, a component's only `<div>` should be styled with `div`, rather than a dedicated class.

```svelte
<div>Content</div>

<style lang="scss">
  div {
    display: flex;
  }
</style>
```

Use the same approach for one template element repeated in an `{#each}` when all instances have the same styling role. Keep classes that distinguish different same-tag roles, represent changing state, or provide a shared styling contract. Preserve support for forwarded `class` props and parent styling across component boundaries, but remove unnecessary class values as described below. Tests alone do not require a styling class.

When classes are needed, use BEM class names with lowercase, kebab-case words:

| Purpose                      | Pattern                    | Example                        |
| ---------------------------- | -------------------------- | ------------------------------ |
| Block                        | `block`                    | `contact-form`                 |
| Element belonging to a block | `block__element`           | `contact-form__submit`         |
| Block variant or state       | `block--modifier`          | `contact-form--submitting`     |
| Element variant or state     | `block__element--modifier` | `contact-form__field--invalid` |

Keep element names flat relative to their block, regardless of DOM nesting. Use `about__contact-subheading`, not `about__contact__subheading`. A nested component can own a separate block, such as `contact-form__field`, when it is an independent component.

Use the modifier alongside its base class when that base class is needed. A unique element styled by tag may retain a state modifier without a redundant base class:

```svelte
<form class="contact-form" class:contact-form--submitting={isSubmitting}>
  <input
    class="contact-form__field"
    class:contact-form__field--invalid={hasError}
  />
</form>
```

Sass nesting must produce the same BEM names. Boolean identifier prefixes apply to script identifiers; CSS states use BEM modifiers.

## SCSS nesting

For child-component elements, prefer a locally scoped ancestor with a global tag selector when the tag unambiguously identifies the intended element. The ancestor remains scoped by Svelte; `a :global(img)` only targets images inside this component's anchors. Do not add or retain a forwarded class solely to cross the component boundary.

```scss
a {
  :global(img) {
    display: block;
    width: 100%;
  }
}
```

Remove the corresponding class from the child component usage when it has no other purpose. Keep classes that distinguish same-tag roles, represent state, or provide a necessary shared styling or application-code selector. Check other consumers before removal; avoid broadening the selector to unrelated descendants. Do not replace this pattern with an unanchored `:global(img)` rule.

Always nest descendant selectors under their shared parent or state selector instead of repeating that selector. Preserve the resulting selector relationships and specificity.

```scss
// Use
.pillar-cylinder--canvas-ready {
  h4,
  span {
    opacity: 0;
  }
}

// Do not use
.pillar-cylinder--canvas-ready h4,
.pillar-cylinder--canvas-ready span {
  opacity: 0;
}
```

## HTML IDs

Remove temporary testing/debugging hooks from production components after verification, including `data-testid` attributes. Tests should use existing semantic markup or selectors that already serve the application. Update affected tests when removing these hooks; keep the tests themselves.

Do not add or retain unused `id` attributes. Every ID must have a concrete purpose, such as a label association, fragment link, or an actual reference from application code. Tests alone are not a reason to add or keep an ID; use suitable selectors for the existing markup instead. When removing the last reference to an ID, remove the ID too and update any affected tests.

## Svelte style directives

Always use Svelte's quoted attribute interpolation when combining an expression with a unit or other literal text in a style directive. Do not use a JavaScript template literal for this.

```svelte
<!-- Use -->
<div style:height="{maxHeight}px"></div>

<!-- Do not use -->
<div style:height={`${maxHeight}px`}></div>
```

For a value that needs no surrounding literal text, use the expression directly, such as `style:opacity={opacity}`.

## Svelte event handler names

When a function is named after a native event, match the event attribute's spelling so the Svelte binding can use shorthand. Use `onclick`, `onsubmit`, and `oninput` rather than `onClick`, `onSubmit`, and `onInput`.

```svelte
<!-- Use -->
<button {onclick}>Submit</button>

<!-- Do not use a camel-cased event name -->
<button onclick={onClick}>Submit</button>
```

Keep meaningful action names when they describe the function's purpose, distinguish multiple handlers, or identify a function reused elsewhere. For example, `onclick={retryCaptcha}` is appropriate. Do not add an alias or wrapper solely to obtain shorthand. This convention applies to native event handlers, not custom component callback contracts.

## Svelte prop types

For components used in one or only a few places, check the actual call sites: if a prop is always supplied, declare it as required. Do not make it optional for hypothetical reuse. For example, use `loading: "eager" | "lazy"` rather than `loading?: "eager" | "lazy"` when every caller supplies `loading`. Optional props must represent a supported omission in the component's actual usage.

Keep prop types inline with `$props()` for small prop lists. Do not extract a separate `Props` interface solely to name the shape. Use a separate interface only when there are enough props that the inline declaration becomes difficult to read.

```svelte
<script lang="ts">
  const { images }: { images: ContentImage[] } = $props()
</script>
```

## Svelte keys

Do not add keys to `{#each}` blocks or wrap content in `{#key}` without a concrete behavioral need. For lists that stay fixed while the component is mounted, use an unkeyed `{#each}`. Do not generate IDs or composite key fields solely to key such lists.

Use keyed `{#each}` blocks when item identity must be preserved across insertions, removals, reordering, or replacements, or when an animation requires keys. Use `{#key}` only when a value change intentionally needs to destroy and recreate the enclosed content. Base that decision on actual update paths, not hypothetical CMS changes.

When removing an unnecessary key, remove any local field or computation used only to produce it. Preserve CMS keys such as Sanity's `_key` where they serve the content model.

## URL query parameter names

Declare application-owned URL query parameter names in `QUERY_PARAM_KEYS` in `src/lib/utils/routes.ts`. Use those constants when reading, writing, or building links; do not repeat literal names such as `'sort'`, `'industry'`, or `'services'` at call sites. Keep the constants in the existing routes module, without a separate configuration folder. Test fixtures may use literal URLs to verify the public URL format independently.

## CSS declaration order

Use local variables, dimensions, spacing, position, layout, typography, appearance, overflow/interaction, then motion. Dimensions come first after variables.

1. Local Sass variables and CSS custom properties.
2. Box sizing, width/min/max width, height/min/max height, aspect ratio.
3. Margin and padding.
4. Position, offsets/inset, stacking.
5. Display, flex/grid configuration and placement, alignment, gaps.
6. Font, line height, text treatment, wrapping, text color.
7. Background, borders, radius, shadows, opacity, visibility, filters, object fit.
8. Overflow, scrolling, cursor, pointer events, touch action, selection.
9. Transform, transition, animation.

Separate populated groups with blank lines in substantial rules. Keep small rules compact. Mixins belong with their output's purpose, but responsive/nested mixins remain cascade barriers. Preserve shorthand/longhand overrides, fallbacks, physical/logical conflicts, and declarations around nested rules. A documented behavior dependency takes precedence over grouping. Never move every mixin or media query together automatically.

`npm run style:check` checks safe declaration runs, template attributes, and inline prop lists. `node scripts/style-order.mjs --write` applies those rules; run `npm run format` afterward. The checker conservatively retains overlapping property-family precedence, mixins that emit nested rules, spreads, comments, rest props, and default-value dependencies. Review these boundaries manually. It does not infer every possible Sass side effect.

## Attribute and prop order

Use identity/semantics; styling; content/configuration; accessibility/metadata; references/non-boolean bindings/framework directives; booleans; then handlers/callbacks/function props. Mirror this order in prop declarations and inline types where safe.

Keep `aria-*` and `data-*` in metadata even when their values describe boolean state. Keep class/style directives with styling. Keep native names such as `disabled` and `required`. Custom boolean props use predicate names. Preserve spread precedence and listener/binding execution order; never reorder dependent defaults or add aliases just to obtain shorthand.

## Accessibility without visual changes

Prefer native controls and their semantics. Name icon controls, associate dialog headings and field errors, expose toggle/active/busy state, and announce completed actions politely. Decorative graphics must not duplicate meaningful alternatives. Do not add redundant roles, hide focusable controls with ARIA alone, or remove the only accessible equivalent of canvas content.

Opacity-hidden controls must not remain accidental keyboard stops. Use state-linked `inert` where the entire region is unavailable. Preserve existing visible labels and native focus indication. IDs are appropriate for real ARIA associations and must be unique per component instance.

Use the shared `sr-only` utility only for necessary nonvisual text; adding an element still requires checking tag selectors and child-position rules. Avoid per-character or per-scroll-frame live announcements.

## Verification

`npm run verify` runs source checks, units, formatting and ordering checks, build, and all browser suites. The browser matrix uses Chrome, Firefox, and WebKit at desktop/narrow widths. Native swipe automation currently uses Chromium CDP; real Firefox/WebKit touch remains a device check. Narrow viewport tests use the application's 768px CSS breakpoint rather than Playwright's mobile-emulation flag.

Six `css_unused_selector` diagnostics are currently emitted by the shared grid mixin in About/Works/project route styles: Svelte prunes the generated direct-child rule when the child is a component. Retaining the mixin preserves its other grid declarations and its uses with native children. These diagnostics are understood; do not broaden them with global selectors or suppress all unused-selector warnings.
