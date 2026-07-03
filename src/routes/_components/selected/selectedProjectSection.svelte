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
  class:is-settled={isSettled}
  class:should-blend={shouldBlend}
>
  <a
    href={`/projects/${project.slug.current}/1`}
    onclick={e => onNavigate(e, project)}
  >
    {#snippet text()}
      {title}{#if subtitle}, <i>{subtitle}</i>{/if}
    {/snippet}
    <h2>{@render text()}</h2>
    <h2 class="overlay">{@render text()}</h2>
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

    &.is-navigating {
      pointer-events: none;
      &:not(.is-selected) {
        z-index: -1;
        /*  opacity: 0; */
      }

      &.is-selected {
        h2 {
          transition: none;
        }
      }
    }

    &.is-selected {
      background-color: white;
      $bottom-margin: 1.5em;
      padding: 0 0.25rem $bottom-margin;
      margin-bottom: -$bottom-margin;

      h2 {
        z-index: 999;
        @include fade-in-out;
      }

      a {
        position: relative;
      }
    }

    &.should-blend {
      h2 {
        opacity: 0.2;
      }

      .overlay {
        opacity: 0.8;
      }
    }
  }

  h2 {
    @include serif;
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
      color: white;
      mix-blend-mode: difference;
      pointer-events: none;
      opacity: 0;
    }
  }

  a {
    @include flex;
    &,
    &:hover {
      padding: 0;
      color: black;
    }
  }
</style>
