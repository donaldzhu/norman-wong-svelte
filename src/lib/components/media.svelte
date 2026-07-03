<script lang="ts">
  import type {
    MediaData,
    SanityImageObjectWithAsset,
    SanityVideoObject,
  } from "$lib/types/sanity"
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
    preview,
  }: {
    media: MediaData
    style?: string
    mediaStyle?: string
    ref?: HTMLDivElement | HTMLVideoElement | null
    sizeSettings?: SizeSettings
    noPreview?: boolean
    orientation?: Orientation
    preview?: boolean
  } = $props()
</script>

{#snippet image(
  imageAsset: SanityImageObjectWithAsset,
  isMobileMedia?: boolean,
)}
  <Image
    image={imageAsset}
    {style}
    {mediaStyle}
    {sizeSettings}
    {orientation}
    {isMobileMedia}
  />
{/snippet}

{#snippet video(videoAsset: SanityVideoObject, isMobileMedia?: boolean)}
  <Video
    video={videoAsset}
    {style}
    {mediaStyle}
    {orientation}
    bind:ref={ref as HTMLVideoElement | null}
    {preview}
    {isMobileMedia}
  />
{/snippet}

{#if media.mediaType === "image"}
  {@render image(media.image, false)}
  {#if "mobileImage" in media && media.mobileImage}
    {@render image(media.mobileImage, true)}
  {/if}
{:else}
  {@render video(media.video, false)}
  {#if "mobileVideo" in media && media.mobileVideo}
    {@render video(media.mobileVideo, true)}
  {/if}
{/if}
