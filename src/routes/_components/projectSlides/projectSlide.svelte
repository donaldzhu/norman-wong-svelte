<script lang="ts">
  import { onMount } from "svelte"
  import {
    resolveDesktopLayout,
    resolveMobileLayout,
    mobileOrientationFor,
  } from "$lib/utils/projectSlideLayout"
  import type { SlideData } from "$lib/types/sanity"
  import { Orientation } from "$lib/utils/dom"
  import ProjectSlideMedia from "./projectSlideMedia.svelte"

  let {
    slide,
    isPreview,
    shouldShowMuteButton,
  }: {
    slide: SlideData
    isPreview?: boolean
    shouldShowMuteButton?: boolean
  } = $props()

  const mobileOrientation = $derived(mobileOrientationFor(slide))
  let container: HTMLDivElement
  let gapReference: HTMLSpanElement
  let bounds = $state({ width: 0, height: 0, gap: 0 })
  const desktop = $derived(
    resolveDesktopLayout(
      slide.media,
      bounds.width,
      bounds.height,
      bounds.gap,
      slide.layoutV2,
    ),
  )

  const mobile = $derived(
    resolveMobileLayout(
      slide.media,
      bounds.width,
      bounds.height,
      bounds.gap,
      mobileOrientation === Orientation.Portrait,
      slide.layoutV2,
    ),
  )

  $effect(() => {
    const layout = bounds.width <= 768 ? mobile : desktop
    if (import.meta.env.DEV && layout.issues.length) {
      console.warn(
        "Project slide layout unavailable or missing media metadata",
        slide.media.map((item) => item._key),
        layout.issues,
      )
    }
  })

  onMount(() => {
    const measure = () => {
      const styles = getComputedStyle(gapReference)
      bounds = {
        width: container.clientWidth,
        height: container.clientHeight,
        gap: parseFloat(styles.columnGap) || 0,
      }
    }
    const observer = new ResizeObserver(measure)
    observer.observe(container)
    window.addEventListener("resize", measure)
    measure()
    return () => {
      observer.disconnect()
      window.removeEventListener("resize", measure)
    }
  })
</script>

<div class="project-slide">
  <span aria-hidden="true" bind:this={gapReference}></span>
  <div
    class="project-slide__media-container"
    class:project-slide__media-container--mobile-ready={mobile.isReady}
    class:project-slide__media-container--mobile-justified={mobile.isJustified}
    style:--mobile-layout-gap="{mobile.gap}px"
    style:--desktop-layout-gap="{desktop.gap}px"
    class:project-slide__media-container--desktop-ready={desktop.isReady}
    class:project-slide__media-container--desktop-justified={desktop.isJustified}
    class:project-slide__media-container--landscape={mobileOrientation ===
      Orientation.Landscape}
    class:project-slide__media-container--portrait={mobileOrientation ===
      Orientation.Portrait}
    bind:this={container}
  >
    {#if mobileOrientation && desktop.items.length && mobile.items.length}
      {#each slide.media as media, index (media._key)}
        <ProjectSlideMedia
          {media}
          desktopLayout={desktop.items[index]}
          mobileLayout={mobile.items[index]}
          orientation={mobileOrientation}
          {isPreview}
          {shouldShowMuteButton}
        />
      {/each}
    {/if}
  </div>
  {#if desktop.issues.length && !desktop.items.length}
    <p role="status">Slide unavailable.</p>
  {/if}
</div>

<style lang="scss">
  @use "$lib/styles/_entry.scss" as *;

  .project-slide {
    @include fullscreen;

    z-index: 999;

    @include flex-column;

    pointer-events: none;
  }

  p {
    margin: 0;

    position: absolute;
    inset: 0;

    @include flex;
  }

  span {
    position: absolute;

    display: flex;
    gap: var(--project-slide-gap);

    visibility: hidden;

    pointer-events: none;
  }

  .project-slide__media-container {
    box-sizing: border-box;
    width: 100dvw;
    height: 100dvh;

    display: flex;
    flex-wrap: nowrap;
    justify-content: center;
    align-items: center;

    overflow: hidden;
  }

  @media (width <= 768px) {
    .project-slide__media-container {
      width: 100dvw;
      height: 100dvh;

      display: flex;
      justify-content: center;
      align-items: center;
      gap: var(--mobile-layout-gap);

      visibility: hidden;

      &.project-slide__media-container--mobile-ready {
        visibility: visible;
      }
      &.project-slide__media-container--portrait {
        flex-direction: column;
        row-gap: var(--mobile-layout-gap);
        align-items: center;
      }

      :global(.project-slide-media) {
        width: var(--mobile-media-width);
        min-width: 0;
        height: var(--mobile-media-height);

        flex: 0 0 auto;
      }

      :global(.project-slide-media > div),
      :global(.project-slide-media > button) {
        width: 100%;
        height: 100%;
        aspect-ratio: auto;
      }

      :global(.project-slide-media img) {
        object-fit: contain !important;
        object-position: center;
      }

      :global(.project-slide-media mux-player) {
        --media-object-fit: contain;
        --media-object-position: center;

        width: 100%;
        height: 100%;
      }
    }

    .project-slide__media-container--mobile-justified {
      :global(.project-slide-media img) {
        object-fit: cover !important;
      }
      :global(.project-slide-media mux-player) {
        --media-object-fit: cover;
      }
    }
  }

  // Strictly above mobile: the shared desktop mixin also matches 768px.
  @media (width > 768px) {
    .project-slide__media-container {
      width: 100dvw;
      height: 100dvh;

      display: flex;
      justify-content: center;
      align-items: center;
      gap: var(--desktop-layout-gap);

      visibility: hidden;

      &.project-slide__media-container--desktop-ready {
        visibility: visible;
      }

      :global(.project-slide-media) {
        width: var(--desktop-media-width);
        min-width: 0;
        height: var(--desktop-media-height);

        flex: 0 0 auto;
      }

      :global(.project-slide-media > div),
      :global(.project-slide-media > button) {
        width: 100%;
        height: 100%;
        aspect-ratio: auto;
      }

      :global(.project-slide-media img) {
        object-fit: contain !important;
        object-position: center;
      }

      :global(.project-slide-media mux-player) {
        --media-object-fit: contain;
        --media-object-position: center;

        width: 100%;
        height: 100%;
      }
    }

    .project-slide__media-container--desktop-justified {
      :global(.project-slide-media img) {
        object-fit: cover !important;
      }
      :global(.project-slide-media mux-player) {
        --media-object-fit: cover;
      }
    }
  }
</style>
