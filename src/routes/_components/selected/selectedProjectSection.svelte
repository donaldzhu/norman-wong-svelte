<script lang="ts">
  import type { ProjectData, SlideData } from "$lib/types/sanity"
  import ProjectSlide from "../projectSlides/projectSlide.svelte"

  let {
    project,
    isSelected,
    isNavigating,
    isSettled,
    shouldBlend,
    onNavigate,
  }: {
    project: ProjectData
    isSelected?: boolean
    isNavigating: boolean
    isSettled: boolean
    shouldBlend: boolean
    onNavigate: (e: MouseEvent, project: ProjectData) => void
  } = $props()
  const { title, subtitle } = $derived(project)
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
      padding: $bottom-margin 0.25rem;
      margin: -$bottom-margin 0;

      h2 {
        transition: none;
      }
    }
    &.should-blend {
      /* background-color: white; */
      h2 {
        color: red;
        // mix-blend-mode: difference;
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
    z-index: 999;
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
