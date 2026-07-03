<script lang="ts">
  import type { ProjectData } from "$lib/types/sanity"

  let {
    project,
    isSettled,
    isSelected,
    isNavigating,
    onNavigate,
  }: {
    project: ProjectData
    isSettled: boolean
    isSelected?: boolean
    isNavigating: boolean
    onNavigate: (e: MouseEvent, project: ProjectData) => void
  } = $props()
  const { title, subtitle } = $derived(project)
  const shouldBlend = $derived(isSelected && isSettled)
</script>

<section
  class="selected-works__section"
  class:is-selected={isSelected}
  class:is-navigating={isNavigating}
  class:should-blend={shouldBlend}
>
  <a
    href={`/projects/${project.slug.current}/1`}
    onclick={e => onNavigate(e, project)}
  >
    <h2>
      {title}{#if subtitle}, <i>{subtitle}</i>{/if}
    </h2>
  </a>
</section>

<style lang="scss">
  @use "$lib/styles/_entry.scss" as *;

  section {
    @include flex-column;
    @include fade-in-out;
    scroll-snap-align: center;
    scroll-snap-stop: var(--snap-stop, normal);
    gap: var(--selected-works-inner-gap);
    max-width: 100vw;
    box-sizing: border-box;

    /* &.is-navigating {
      pointer-events: none;
      &:not(.is-selected) {
        z-index: -1;
      }

      &.is-selected {
        h2 {
          transition: none;
        }
      }
    } */

    &.is-selected {
      $bottom-margin: 1.5rem;
      padding: 0 0.25rem $bottom-margin;
      margin-bottom: -$bottom-margin;
      background-color: white;

      h2 {
        color: white;
        mix-blend-mode: difference;
        z-index: 999;
        transition: none;
      }
    }
  }

  h2 {
    @include serif;
    @include fade-in-out;
    display: block;
    max-width: 100%;
    font-size: var(--selected-works-font-size);
    line-height: var(--selected-works-line-height);
    text-align: center;
  }

  a {
    @include flex;
    max-width: 100%;

    &,
    &:hover {
      padding: 0;
      color: black;
    }
  }
</style>
