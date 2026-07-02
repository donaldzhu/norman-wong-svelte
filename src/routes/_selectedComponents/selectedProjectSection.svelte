<script lang="ts">
  import type { ProjectData } from "$lib/types/sanity"
  import ProjectSlide from "../projects/[project]/[slide]/_components/projectSlide.svelte"

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
</script>

<section
  class="selected-works__section"
  class:is-selected={isSelected}
  class:is-navigating={isNavigating}
  class:is-settled={isSettled}
>
  <a
    href={`/projects/${project.slug.current}/1`}
    onclick={e => onNavigate(e, project)}
  >
    {#snippet text()}
      {title}{#if subtitle}, <i>{subtitle}</i>{/if}
    {/snippet}
    <h2>{@render text()}</h2>
    {#if isSelected && isSettled}
      <h2 class="overlay">{@render text()}</h2>
    {/if}

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
    scroll-snap-align: center;
    scroll-snap-stop: var(--snap-stop, normal);
    gap: var(--selected-works-inner-gap);

    &.is-navigating {
      pointer-events: none;
    }

    &.is-selected {
      background-color: white;
      $bottom-margin: 1.5em;
      padding: 0 0.25rem $bottom-margin;
      margin-bottom: -$bottom-margin;

      h2 {
        z-index: 999;
        transition: none;
      }

      &.is-settled h2 {
        color: white;
        mix-blend-mode: difference;
      }

      a {
        position: relative;
      }
    }
  }

  h2 {
    @include serif;
    @include fade-in-out;
    font-size: var(--selected-works-font-size);
    line-height: 0.95;
    text-align: center;

    @include mobile {
      line-height: 1.05;
    }

    &.overlay {
      position: absolute;
      width: 100%;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      mix-blend-mode: normal;
      opacity: 0.2;
      color: #eee;
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
