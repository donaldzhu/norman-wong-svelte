<script lang="ts">
  import type { SlideData } from "$lib/types/sanity"
  import { Orientation } from "$lib/utils/dom"
  import {
    DESKTOP_GRID_COUNT,
    MOBILE_GRID_COUNT,
  } from "../../projects/[project]/_components/configs"
  import ProjectSlideMedia from "./projectSlideMedia.svelte"

  let {
    slide,
    preview,
  }: {
    slide: SlideData
    preview?: boolean
  } = $props()

  const { mobileOrientation } = $derived(slide)
</script>

<div class="project-slide">
  <div
    class="project-slide__media-container"
    class:landscape={mobileOrientation === Orientation.Landscape}
    class:portrait={mobileOrientation === Orientation.Portrait}
    style:--desktop-grid-count={DESKTOP_GRID_COUNT}
    style:--mobile-grid-count={MOBILE_GRID_COUNT}
  >
    {#each slide.media as media (media._key)}
      <ProjectSlideMedia {media} orientation={mobileOrientation} {preview} />
    {/each}
  </div>
</div>

<style lang="scss">
  @use "$lib/styles/_entry.scss" as *;

  .project-slide {
    @include fullscreen;
    @include flex-column;
    pointer-events: none;
  }

  .project-slide__media-container {
    display: grid;
    grid-template-columns: repeat(var(--desktop-grid-count), 1fr);
    align-items: center;
    gap: var(--project-slide-gap);
    width: 100vw;

    $margin: calc(
      var(--ui-text-height) * 2 + var(--header-spacing) + var(--y-margin-bottom)
    );
    height: calc(100dvh - #{$margin} * 2);
    margin: $margin 0;
    box-sizing: border-box;
    overflow: hidden;

    @include mobile {
      position: absolute;
      inset: 0;
      grid-template-columns: repeat(var(--mobile-grid-count), 1fr);

      &.portrait {
        grid-template-columns: 1fr;
        grid-template-rows: repeat(var(--mobile-grid-count), 1fr);
        align-items: stretch;
        justify-items: center;
      }
    }
  }
</style>
