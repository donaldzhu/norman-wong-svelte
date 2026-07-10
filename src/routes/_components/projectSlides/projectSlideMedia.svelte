<script lang="ts">
  import Media from "$lib/components/media.svelte"
  import type { SlideMediaData } from "$lib/types/sanity"
  import { Orientation } from "$lib/utils/dom"
  import {
    DESKTOP_GRID_COUNT,
    MOBILE_GRID_COUNT,
  } from "../../projects/[project]/_components/configs"

  let {
    media,
    orientation,
    preview,
  }: {
    media: SlideMediaData
    orientation: Orientation
    preview?: boolean
  } = $props()
  const { desktopStart, desktopEnd, mobileStart, mobileEnd } = $derived(media)

  const isLandscape = $derived(orientation === Orientation.Landscape)
  const desktopPercentage = $derived(
    ((desktopEnd - desktopStart) / DESKTOP_GRID_COUNT) * 1.2 * 2,
  )
  const mobilePercentage = $derived(
    ((mobileEnd - mobileStart) / MOBILE_GRID_COUNT) * 2,
  )
</script>

<div
  class="project-slide-media"
  class:portrait={orientation === Orientation.Portrait}
  class:landscape={orientation === Orientation.Landscape}
  style:--desktop-grid-layout="{desktopStart} / {desktopEnd}"
  style:--mobile-grid-layout="{mobileStart} / {mobileEnd}"
>
  <Media
    {media}
    mediaStyle="object-fit: contain;"
    sizeSettings={[isLandscape ? mobilePercentage : 1, desktopPercentage]}
    {orientation}
    {preview}
    hasMobileMedia={("mobileImage" in media && !!media.mobileImage) ||
      ("mobileVideo" in media && !!media.mobileVideo)}
  />
</div>

<style lang="scss">
  @use "$lib/styles/_entry.scss" as *;
  div {
    $text-height: calc(var(--ui-font-size) * 1.2);
    $footer-margin-top: 3rem;

    $header-height: calc(
      var(--y-margin-top) + var(--y-margin-bottom) + var(--button-padding) * 2 +
        #{$text-height} * 3 + #{$footer-margin-top}
    );

    @include flex;
    width: 100%;
    min-height: 0;
    pointer-events: none;

    @include desktop {
      grid-column: var(--desktop-grid-layout);
    }

    @include mobile {
      &.portrait {
        max-width: 100dvw;
        grid-row: var(--mobile-grid-layout);
      }

      &.landscape {
        grid-column: var(--mobile-grid-layout);
      }
    }
  }
</style>
