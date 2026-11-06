<script lang="ts">
  import type { DesktopMediaLayout } from "$lib/utils/projectSlideLayout"
  import Media from "$lib/components/media.svelte"
  import type { SlideMediaData } from "$lib/types/sanity"
  import { Orientation } from "$lib/utils/dom"

  let {
    media,
    desktopLayout,
    mobileLayout,
    orientation,
    preview,
    showMuteButton,
  }: {
    media: SlideMediaData
    desktopLayout: DesktopMediaLayout
    mobileLayout: DesktopMediaLayout
    orientation: Orientation
    preview?: boolean
    showMuteButton?: boolean
  } = $props()

  const desktopPercentage = $derived(
    desktopLayout.sourceFraction,
  )
  const mobilePercentage = $derived(
    mobileLayout.sourceFraction,
  )
  const hasMobileMedia = $derived(
    ("mobileImage" in media && !!media.mobileImage) ||
      ("mobileVideo" in media && !!media.mobileVideo),
  )
</script>

<div
  class="project-slide-media"
  style:--mobile-media-width="{mobileLayout.width}px"
  style:--mobile-media-height="{mobileLayout.height}px"
  style:--desktop-media-width="{desktopLayout.width}px"
  style:--desktop-media-height="{desktopLayout.height}px"
  class:portrait={orientation === Orientation.Portrait}
  class:landscape={orientation === Orientation.Landscape}
>
  <Media
    {media}
    mediaStyle="object-fit: contain;"
    srcSettings={[mobilePercentage, desktopPercentage]}
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


  }
</style>
