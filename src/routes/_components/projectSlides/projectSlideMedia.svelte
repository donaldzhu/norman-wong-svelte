<script lang="ts">
  import Media from "$lib/components/media.svelte"
  import type { SlideMediaData } from "$lib/types/sanity"
  import { Orientation } from "$lib/utils/dom"
  import {
    EXTRA_LARGE_DESKTOP_BREAKPOINT,
    LARGE_DESKTOP_BREAKPOINT,
    MOBILE_BREAKPOINT,
  } from "../config"
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
    ((desktopEnd - desktopStart) / DESKTOP_GRID_COUNT) * 1.2,
  )
  const mobilePercentage = $derived(
    (mobileEnd - mobileStart) / MOBILE_GRID_COUNT,
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
    sizeSettings={{
      mobile: isLandscape
        ? { width: mobilePercentage * MOBILE_BREAKPOINT }
        : {
            height:
              mobilePercentage <= 0.5
                ? 0.5 * MOBILE_BREAKPOINT
                : MOBILE_BREAKPOINT,
          },
      desktop: { width: desktopPercentage * LARGE_DESKTOP_BREAKPOINT },
      largeDesktop: {
        width: desktopPercentage * EXTRA_LARGE_DESKTOP_BREAKPOINT,
      },
    }}
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
    max-height: calc(100dvh - #{$header-height});
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
