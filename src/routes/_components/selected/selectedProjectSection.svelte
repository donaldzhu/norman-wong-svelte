<script lang="ts">
  import { page } from "$app/state"
  import type { ProjectData } from "$lib/types/sanity"
  import { isProjectRoute } from "$lib/utils/url"
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
    isSelected: boolean
    isNavigating: boolean
    isSettled: boolean
    isHighlighted: boolean
    onNavigate: (e: MouseEvent, project: ProjectData) => void
  } = $props()
  const isProjectPage = $derived(isProjectRoute())
  const isNotFirstSlide = $derived(
    isProjectPage && page.url.pathname.split("/")[3] !== "1", // TODO: use enum
  )

  const { title, subtitle } = $derived(project)
</script>

<section
  class:selected-project--selected={isSelected}
  class:selected-project--navigating={isNavigating}
  class:selected-project--highlighted={isHighlighted}
  class:selected-project--hidden={isNotFirstSlide}
>
  {#if !isProjectPage}
    <a
      href="/projects/{project.slug.current}/1"
      inert={isNavigating}
      onclick={(e) => onNavigate(e, project)}
    >
      <h2>
        {title}{#if subtitle}, <i>{subtitle}</i>{/if}
      </h2>
    </a>
  {/if}
  {#if isSelected}
    <div>
      <ProjectSlide
        slide={project.slides[0]}
        isPreview={!isSettled && !isProjectPage}
        shouldShowMuteButton={isNavigating}
      />
    </div>
  {/if}
</section>

<style lang="scss">
  @use "$lib/styles/_entry.scss" as *;

  section {
    max-width: 100vw;
    box-sizing: border-box;

    @include flex-column;
    gap: var(--selected-works-inner-gap);

    scroll-snap-align: center;
    scroll-snap-stop: var(--snap-stop, normal);

    &.selected-project--navigating {
      &:not(.selected-project--selected) {
        h2 {
          opacity: 0;
        }
      }

      &.selected-project--selected {
        h2 {
          transition: none;
        }
      }
    }

    &.selected-project--selected {
      $bottom-margin: 1.5rem;
      padding: 0 0.25rem $bottom-margin;
      margin-bottom: -$bottom-margin;
    }

    &.selected-project--highlighted {
      h2 {
        color: $gray;
      }
    }

    &:hover {
      @include desktop {
        h2 {
          color: $gray;
        }
      }
    }

    &.selected-project--selected,
    &.selected-project--highlighted {
      h2 {
        z-index: 999;
      }
    }
  }

  h2 {
    max-width: 100%;

    z-index: -1;

    display: block;

    @include serif;
    font-size: var(--selected-works-font-size);
    line-height: var(--selected-works-line-height);
    text-align: center;

    @include fade-in-out;
  }

  a {
    max-width: 100%;
    @include flex;

    &,
    &:hover {
      padding: 0;
      color: black;
    }
  }

  div {
    @include fullscreen;
    pointer-events: none;
  }

  .selected-project--hidden {
    display: none;
  }
</style>
