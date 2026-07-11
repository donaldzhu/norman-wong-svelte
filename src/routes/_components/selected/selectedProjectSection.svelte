<script lang="ts">
  import type { ProjectData } from "$lib/types/sanity"
  import ProjectSlide from "../projectSlides/projectSlide.svelte"

  let {
    project,
    isSelected,
    isNavigating,
    isSettled,
    isHighlighted,
    onNavigate,
  }: {
    project: ProjectData
    isSelected?: boolean
    isNavigating: boolean
    isSettled: boolean
    isHighlighted: boolean
    onNavigate: (e: MouseEvent, project: ProjectData) => void
  } = $props()
  const { title, subtitle } = $derived(project)
</script>

<section
  class:is-selected={isSelected}
  class:is-navigating={isNavigating}
  class:is-highlighted={isHighlighted}
>
  <a
    href="/projects/${project.slug.current}/1"
    onclick={e => onNavigate(e, project)}
  >
    <h2>
      {title}{#if subtitle}, <i>{subtitle}</i>{/if}
    </h2>
  </a>
  {#if isSelected}
    <div class="selected-works__slide">
      <ProjectSlide slide={project.slides[0]} preview={!isSettled} />
    </div>
  {/if}
</section>

<style lang="scss">
  @use "$lib/styles/_entry.scss" as *;

  section {
    @include flex-column;
    scroll-snap-align: center;
    scroll-snap-stop: var(--snap-stop, normal);
    gap: var(--selected-works-inner-gap);
    max-width: 100vw;
    box-sizing: border-box;

    &.is-navigating {
      &:not(.is-selected) {
        h2 {
          opacity: 0;
        }
      }

      &.is-selected {
        h2 {
          transition: none;
        }
      }
    }

    &.is-selected {
      $bottom-margin: 1.5rem;
      padding: 0 0.25rem $bottom-margin;
      margin-bottom: -$bottom-margin;
    }

    &.is-highlighted,
    &:hover {
      h2 {
        color: $gray;
      }
    }

    &.is-selected,
    &.is-highlighted {
      h2 {
        z-index: 999;
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
    z-index: -1;
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

  .selected-works__slide {
    @include fullscreen;
    pointer-events: none;
  }
</style>
