<script lang="ts">
  import Media from "$lib/components/media.svelte"
  import type { SlideMediaData } from "$lib/types/sanity"
  import { Orientation } from "$lib/utils/dom"
  import {
    EXTRA_LARGE_DESKTOP_BREAKPOINT,
    LARGE_DESKTOP_BREAKPOINT,
    MOBILE_BREAKPOINT,
  } from "../../../../_components/config"
  import {
    DESKTOP_GRID_COUNT,
    MOBILE_GRID_COUNT,
  } from "../../_components/configs"

  let {
    media,
    orientation,
  }: {
    media: SlideMediaData
    orientation: Orientation
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
  class:portrait={orientation === Orientation.Portrait}
  class:landscape={orientation === Orientation.Landscape}
  style:--desktop-grid-layout="{desktopStart} / {desktopEnd}"
  style:--mobile-grid-layout="{mobileStart} / {mobileEnd}"
>
  <Media
    {media}
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

    min-height: 0;
    object-fit: cover;
    width: 100%;
    max-height: calc(100dvh - #{$header-height});

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
