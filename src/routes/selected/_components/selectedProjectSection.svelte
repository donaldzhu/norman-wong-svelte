<script lang="ts">
  import type { ProjectData } from "$lib/types/sanity"
  import ProjectSlide from "../../projects/[project]/[slide]/_components/projectSlide.svelte"

  const {
    project,
    isSelected,
    isNavigating,
    onNavigate,
  }: {
    project: ProjectData
    isSelected?: boolean
    isNavigating: boolean
    onNavigate: (e: MouseEvent, project: ProjectData) => void
  } = $props()
  const { title, subtitle } = $derived(project)
</script>

<section
  class="selected-works__section"
  class:is-selected={isSelected}
  class:is-navigating={isNavigating}
>
  <a
    href={`/projects/${project.slug.current}/1`}
    onclick={e => onNavigate(e, project)}
  >
    <h2 style:opacity={isNavigating && !isSelected ? 0 : 1}>
      {title}{#if subtitle}, <i>{subtitle}</i>{/if}
    </h2>
    {#if isSelected}
      <div class="selected-works__popup">
        <ProjectSlide slide={project.slides[0]} />
      </div>
    {/if}
  </a>
</section>

<style lang="scss">
  @use "$lib/styles/_entry.scss" as *;

  section {
    @include flex-column;
    @include selected-project-title-passthrough;
    scroll-snap-align: center;
    scroll-snap-stop: var(--snap-stop, normal);
    gap: var(--selected-works-inner-gap);

    &.is-navigating {
      pointer-events: none;
    }

    &.is-selected {
      background-color: white;
      $bottom-margin: 1.5em;
      padding-bottom: $bottom-margin;
      margin-bottom: -$bottom-margin;

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
    font-size: var(--selected-works-font-size);
    line-height: 0.95;
    text-align: center;
    mix-blend-mode: lighten;

    @include mobile {
      line-height: 1.05;
    }
  }

  a {
    @include flex;
    padding: 0;

    &:hover {
      color: black;
    }
  }

  .selected-works__popup {
    @include fullscreen;
    @include flex-column;
    pointer-events: none;
  }
</style>
