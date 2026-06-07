<script lang="ts">
  import type { MediaData } from "$lib/types/sanity"
  import type { SizeSettings } from "$lib/utils/media"
  import Image from "./image.svelte"
  import Video from "./video.svelte"

  let {
    media,
    style,
    ref = $bindable<HTMLDivElement | HTMLVideoElement | null>(),
    sizeSettings,
  }: {
    media: MediaData
    style?: string
    ref?: HTMLDivElement | HTMLVideoElement | null
    sizeSettings?: SizeSettings
  } = $props()
</script>

{#if media.mediaType === "image"}
  <Image
    image={media.image}
    {style}
    {sizeSettings}
    bind:ref={ref as HTMLDivElement | null}
  />
{:else}
  <Video
    video={media.video}
    {style}
    bind:ref={ref as HTMLVideoElement | null}
  />
{/if}
