<script lang="ts">
  import type { SanityImageObjectWithAsset } from "$lib/types/sanity"
  import { isMobile, Orientation } from "$lib/utils/dom"
  import { getImageSrc, type SrcSettings } from "$lib/utils/media"
  import { getPlaceholderSrc } from "$lib/utils/sanity"
  import { onMount } from "svelte"

  let {
    ref = $bindable<HTMLDivElement | null>(),
    image,
    style,
    mediaStyle,
    srcSettings,
    orientation,
    hasMobileMedia,
    isMobileMedia,
  }: {
    ref?: HTMLDivElement | null
    image: SanityImageObjectWithAsset
    style?: string
    mediaStyle?: string
    srcSettings?: SrcSettings
    orientation?: Orientation
    hasMobileMedia?: boolean
    isMobileMedia?: boolean
  } = $props()

  const alt = $derived(image?.asset?.altText)
  const width = $derived(image?.asset?.metadata?.dimensions?.width)
  const height = $derived(image?.asset?.metadata?.dimensions?.height)
  const imgSrc = $derived(getImageSrc(image, srcSettings))
  const placeholderSrc = $derived(getPlaceholderSrc(image))
  let windowIsMobile = $state<boolean>()

  const imageId = $derived(image?.asset?._id)
  let loadedImageId = $state<string>()
  const loaded = $derived(imageId !== undefined && loadedImageId === imageId)

  let imgElement = $state<HTMLImageElement>()

  const onload = () => {
    if (imageId) loadedImageId = imageId
  }

  $effect(() => {
    if (!imgElement || !imageId) return
    if (
      hasMobileMedia &&
      windowIsMobile !== undefined &&
      windowIsMobile !== isMobileMedia
    )
      return
    if (imgElement.complete && imgElement.naturalWidth > 0) onload()
  })

  onMount(() => {
    windowIsMobile = isMobile()
  })
</script>

<div
  bind:this={ref}
  {style}
  class:portrait={orientation === Orientation.Portrait}
  class:landscape={orientation === Orientation.Landscape}
  class:has-mobile-media={hasMobileMedia}
  class:is-mobile-media={isMobileMedia}
  style:aspect-ratio="{width}/{height}"
>
  {#if placeholderSrc}
    <img
      class="placeholder"
      style:opacity={loaded ? 0 : 1}
      style={mediaStyle}
      src={placeholderSrc}
      alt=""
      aria-hidden="true"
    />
  {/if}
  <img
    bind:this={imgElement}
    {...imgSrc}
    {alt}
    style:opacity={loaded ? 1 : 0}
    style={mediaStyle}
    {onload}
  />
</div>

<svelte:window on:resize={() => (windowIsMobile = isMobile())} />

<style lang="scss">
  @use "$lib/styles/_entry.scss" as *;

  div {
    @include auto-fit-media;
    @include demarcate-media;
    position: relative;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: flex;
    background-color: $light-gray;
  }

  .placeholder {
    @include fade-in-out;
    position: absolute;
    inset: 0;
    z-index: 2;
  }
</style>
