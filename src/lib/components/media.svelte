<script lang="ts">
  import type {
    MediaData,
    SanityImageObjectWithAsset,
    SanityVideoObject,
  } from "$lib/types/sanity"
  import type { Orientation } from "$lib/utils/dom"
  import type { SrcSettings } from "$lib/utils/media"
  import Image from "./image.svelte"
  import Video from "./video.svelte"

  let {
    style,
    mediaStyle,
    media,
    srcSettings,
    orientation,
    ref = $bindable<HTMLDivElement | HTMLVideoElement | null>(),
    isPreview,
    hasMobileMedia,
    shouldShowMuteButton,
  }: {
    style?: string
    mediaStyle?: string
    media: MediaData
    srcSettings: SrcSettings
    orientation?: Orientation
    ref?: HTMLDivElement | HTMLVideoElement | null
    isPreview?: boolean
    hasMobileMedia?: boolean
    shouldShowMuteButton?: boolean
  } = $props()
</script>

{#snippet image(imageAsset: SanityImageObjectWithAsset, isMobileMedia: boolean)}
  <Image
    bind:ref={ref as HTMLDivElement | null}
    {style}
    image={imageAsset}
    {mediaStyle}
    {srcSettings}
    {orientation}
    {hasMobileMedia}
    {isMobileMedia}
  />
{/snippet}

{#snippet video(videoAsset: SanityVideoObject, isMobileMedia: boolean)}
  <Video
    bind:ref={ref as HTMLVideoElement | null}
    {style}
    video={videoAsset}
    {mediaStyle}
    {orientation}
    {isPreview}
    {hasMobileMedia}
    {isMobileMedia}
    {shouldShowMuteButton}
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
