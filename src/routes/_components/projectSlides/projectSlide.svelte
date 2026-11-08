<script lang="ts">
  import { onMount } from "svelte"
  import { resolveDesktopLayout, resolveMobileLayout, mobileOrientationFor } from "$lib/utils/projectSlideLayout"
  import type { SlideData } from "$lib/types/sanity"
  import { Orientation } from "$lib/utils/dom"
  import ProjectSlideMedia from "./projectSlideMedia.svelte"

  let {
    slide,
    preview,
    showMuteButton,
  }: {
    slide: SlideData
    preview?: boolean
    showMuteButton?: boolean
  } = $props()

  const mobileOrientation = $derived(mobileOrientationFor(slide))
  let container: HTMLDivElement
  let gapReference: HTMLSpanElement
  let bounds = $state({ width: 0, height: 0, gap: 0 })
  const desktop = $derived(resolveDesktopLayout(slide.media, bounds.width, bounds.height, bounds.gap, slide.layoutV2))

  const mobile = $derived(resolveMobileLayout(slide.media, bounds.width, bounds.height, bounds.gap, mobileOrientation === Orientation.Portrait, slide.layoutV2))

  $effect(() => {
    const layout = bounds.width <= 768 ? mobile : desktop
    if (import.meta.env.DEV && layout.issues.length) {
      console.warn("Project slide layout unavailable or missing media metadata", slide.media.map(item => item._key), layout.issues)
    }
  })

  onMount(() => {
    const measure = () => {
      const styles = getComputedStyle(gapReference)
      bounds = { width: container.clientWidth, height: container.clientHeight, gap: parseFloat(styles.columnGap) || 0 }
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
  <span class="project-slide__gap-reference" bind:this={gapReference} aria-hidden="true"></span>
  <div
    bind:this={container}
    class="project-slide__media-container"
    class:mobile-ready={mobile.ready}
    class:mobile-justified={mobile.justified}
    style:--mobile-layout-gap="{mobile.gap}px"
    style:--desktop-layout-gap="{desktop.gap}px"
    class:desktop-ready={desktop.ready}
    class:desktop-justified={desktop.justified}
    class:landscape={mobileOrientation === Orientation.Landscape}
    class:portrait={mobileOrientation === Orientation.Portrait}
  >
    {#if mobileOrientation && desktop.items.length && mobile.items.length}
    {#each slide.media as media, index (media._key)}
      <ProjectSlideMedia
        {media}
        desktopLayout={desktop.items[index]}
        mobileLayout={mobile.items[index]}
        orientation={mobileOrientation}
        {preview}
        {showMuteButton}
      />
    {/each}
    {/if}
  </div>
  {#if desktop.issues.length && !desktop.items.length}
    <p class="project-slide__unavailable" role="status">Slide unavailable.</p>
  {/if}
</div>

<style lang="scss">
  @use "$lib/styles/_entry.scss" as *;

  .project-slide {
    @include fullscreen;
    @include flex-column;
    pointer-events: none;
    z-index: 999;
  }

  .project-slide__unavailable {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0;
  }

  .project-slide__gap-reference {
    position: absolute;
    visibility: hidden;
    pointer-events: none;
    display: flex;
    gap: var(--project-slide-gap);
  }
  .project-slide__media-container {
    display: flex;
    flex-wrap: nowrap;
    justify-content: center;
    align-items: center;
    width: 100dvw;
    height: 100dvh;
    box-sizing: border-box;
    overflow: hidden;
  }
  @media (width <= 768px) {
    .project-slide__media-container {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100dvw;
      height: 100dvh;
      gap: var(--mobile-layout-gap);
      visibility: hidden;
      &.mobile-ready { visibility: visible; }
      &.portrait { flex-direction: column; row-gap: var(--mobile-layout-gap); align-items: center; }
    }
    .project-slide__media-container :global(.project-slide-media) {
      flex: 0 0 auto;
      width: var(--mobile-media-width);
      height: var(--mobile-media-height);
      min-width: 0;
    }
    .project-slide__media-container :global(.project-slide-media > div),
    .project-slide__media-container :global(.project-slide-media > button.video) {
      width: 100%;
      height: 100%;
      aspect-ratio: auto;
    }
    .project-slide__media-container :global(.project-slide-media img) {
      object-fit: contain !important;
      object-position: center;
    }
    .project-slide__media-container :global(.project-slide-media mux-player) {
      width: 100%;
      height: 100%;
      --media-object-fit: contain;
      --media-object-position: center;
    }
    .mobile-justified :global(.project-slide-media img) { object-fit: cover !important; }
    .mobile-justified :global(.project-slide-media mux-player) { --media-object-fit: cover; }
  }
  // Strictly above mobile: the shared desktop mixin also matches 768px.
  @media (width > 768px) {
    .project-slide__media-container {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100dvw;
      height: 100dvh;
      gap: var(--desktop-layout-gap);
      visibility: hidden;

      &.desktop-ready { visibility: visible; }
      // One justified item has no inter-item gap; retain the grid gutter measurement.
    }

    .project-slide__media-container :global(.project-slide-media) {
      flex: 0 0 auto;
      width: var(--desktop-media-width);
      height: var(--desktop-media-height);
      min-width: 0;
    }

    .project-slide__media-container :global(.project-slide-media > div),
    .project-slide__media-container :global(.project-slide-media > button.video) {
      width: 100%;
      height: 100%;
      aspect-ratio: auto;
    }

    .project-slide__media-container :global(.project-slide-media img) {
      object-fit: contain !important;
      object-position: center;
    }

    .project-slide__media-container :global(.project-slide-media mux-player) {
      width: 100%;
      height: 100%;
      --media-object-fit: contain;
      --media-object-position: center;
    }

    .desktop-justified :global(.project-slide-media img) { object-fit: cover !important; }
    .desktop-justified :global(.project-slide-media mux-player) { --media-object-fit: cover; }
  }
</style>
