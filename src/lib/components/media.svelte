<script lang="ts">
  import type { MediaData } from "$lib/types/sanity"
  import Image from "./image.svelte"
  import Video from "./video.svelte"

  let {
    media,
    style,
    ref = $bindable<HTMLImageElement | HTMLVideoElement | null>(),
  }: {
    media: MediaData
    style?: string
    ref?: HTMLImageElement | HTMLVideoElement | null
  } = $props()
</script>

{#if media.mediaType === "image"}
  <Image
    image={media.image}
    {style}
    bind:ref={ref as HTMLImageElement | null}
  />
{:else}
  <Video
    video={media.video}
    {style}
    bind:ref={ref as HTMLVideoElement | null}
  />
{/if}
