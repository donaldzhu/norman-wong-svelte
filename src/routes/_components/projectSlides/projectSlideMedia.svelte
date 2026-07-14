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
    showMuteButton,
  }: {
    media: SlideMediaData
    orientation: Orientation
    preview?: boolean
    showMuteButton?: boolean
  } = $props()
  const { desktopStart, desktopEnd, mobileStart, mobileEnd } = $derived(media)

  const isLandscape = $derived(orientation === Orientation.Landscape)
  const desktopPercentage = $derived(
    ((desktopEnd - desktopStart) / DESKTOP_GRID_COUNT) * 1.2,
  )
  const mobilePercentage = $derived(
    (mobileEnd - mobileStart) / MOBILE_GRID_COUNT,
  )
  const hasMobileMedia = $derived(
    ("mobileImage" in media && !!media.mobileImage) ||
      ("mobileVideo" in media && !!media.mobileVideo),
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
    mediaStyle="object-fit: contain;"
    srcSettings={[isLandscape ? mobilePercentage : 1, desktopPercentage]}
    {orientation}
    {preview}
    {hasMobileMedia}
    {showMuteButton}
  />
</div>

<style lang="scss">
  @use "$lib/styles/_entry.scss" as *;
  div {
    @include flex;
    width: 100%;
    min-height: 0;
    position: relative;
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
