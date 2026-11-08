<script lang="ts">
  import type { DesktopMediaLayout } from "$lib/utils/projectSlideLayout"
  import Media from "$lib/components/media.svelte"
  import type { SlideMediaData } from "$lib/types/sanity"
  import type { Orientation } from "$lib/utils/dom"

  let {
    media,
    desktopLayout,
    mobileLayout,
    orientation,
    isPreview,
    shouldShowMuteButton,
  }: {
    media: SlideMediaData
    desktopLayout: DesktopMediaLayout
    mobileLayout: DesktopMediaLayout
    orientation: Orientation
    isPreview: boolean | undefined
    shouldShowMuteButton: boolean | undefined
  } = $props()

  const desktopPercentage = $derived(desktopLayout.sourceFraction)
  const mobilePercentage = $derived(mobileLayout.sourceFraction)
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
>
  <Media
    {media}
    mediaStyle="object-fit: contain;"
    srcSettings={[mobilePercentage, desktopPercentage]}
    {orientation}
    {isPreview}
    {hasMobileMedia}
    {shouldShowMuteButton}
  />
</div>

<style lang="scss">
  @use "$lib/styles/_entry.scss" as *;
  div {
    width: 100%;
    min-height: 0;

    position: relative;

    @include flex;

    pointer-events: none;
  }
</style>
