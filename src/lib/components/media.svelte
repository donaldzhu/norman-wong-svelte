<script lang="ts">
  import type { MediaData } from "$lib/types/sanity"
  import type { Orientation } from "$lib/utils/dom"
  import type { SizeSettings } from "$lib/utils/media"
  import Image from "./image.svelte"
  import Video from "./video.svelte"

  let {
    media,
    style,
    mediaStyle,
    ref = $bindable<HTMLDivElement | HTMLVideoElement | null>(),
    sizeSettings,
    orientation,
    noPreview,
  }: {
    media: MediaData
    style?: string
    mediaStyle?: string
    ref?: HTMLDivElement | HTMLVideoElement | null
    sizeSettings?: SizeSettings
    noPreview?: boolean
    orientation?: Orientation
  } = $props()
</script>

{#if media.mediaType === "image"}
  <Image
    image={media.image}
    {style}
    {mediaStyle}
    {sizeSettings}
    {orientation}
    bind:ref={ref as HTMLDivElement | null}
    {noPreview}
  />
{:else}
  <Video
    video={media.video}
    {style}
    {mediaStyle}
    {orientation}
    bind:ref={ref as HTMLVideoElement | null}
  />
{/if}
