<script lang="ts">
  import type { SlideData } from "$lib/types/sanity"
  import { Orientation } from "$lib/utils/dom"
  import { onMount, type Snippet } from "svelte"
  import {
    DESKTOP_GRID_COUNT,
    MOBILE_GRID_COUNT,
  } from "../../_components/configs"
  import ProjectSlideMedia from "./projectSlideMedia.svelte"
  import { page } from "$app/state"

  let {
    children,
    slide,
    title,
    subtitle,
    label,
  }: {
    children?: Snippet
    slide: SlideData
    title?: string
    subtitle?: string
    label?: string
  } = $props()

  const { description, year, mobileOrientation } = $derived(slide)
  let opacity = $state(page.state.noPreview ? 0 : 1)
  onMount(() => (opacity = 1))
</script>

<div class="project-slide">
  {#if children}
    {@render children()}
  {/if}
  <div
    class="project-slide__media-container"
    class:landscape={mobileOrientation === Orientation.Landscape}
    class:portrait={mobileOrientation === Orientation.Portrait}
    style:--desktop-grid-count={DESKTOP_GRID_COUNT}
    style:--mobile-grid-count={MOBILE_GRID_COUNT}
  >
    {#each slide.media as media (media._key)}
      <ProjectSlideMedia {media} orientation={mobileOrientation} />
    {/each}
  </div>
  <div class="project-slide__info" style:opacity>
    {#if title}
      <h2>
        {title}{#if subtitle}, {subtitle}{/if}
        {#if description || year}
          <span> — </span>
        {/if}
        {#if description}
          <span>
            {description}{#if year}<span>, </span>
            {/if}
          </span>
        {/if}
        {#if year}
          <span>
            {year}
          </span>
        {/if}
      </h2>
      {#if label}
        <div>
          {label}
        </div>
      {/if}
    {/if}
  </div>
</div>

<style lang="scss">
  @use "$lib/styles/_entry.scss" as *;

  .project-slide {
    @include fullscreen;
    @include flex-column;
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
      position: fixed;
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

  .project-slide__info {
    @include flex-column;
    @include fade-in-out;
    @include ui;
    position: fixed;
    bottom: 0;
    width: 100vw;
    flex: none;
    box-sizing: border-box;
    margin: 0 var(--x-margin);
    padding-top: var(--header-spacing);
    padding-bottom: var(--y-margin-bottom);
  }
</style>
