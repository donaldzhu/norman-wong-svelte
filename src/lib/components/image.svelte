<script lang="ts">
  import type { SanityImageObjectWithAsset } from "$lib/types/sanity"
  import { getImageSrc, type SizeSettings } from "$lib/utils/media"
  import { getPlaceholderSrc } from "$lib/utils/sanity"

  let {
    image,
    style,
    sizeSettings,
    ref = $bindable<HTMLDivElement | null>(),
  }: {
    image: SanityImageObjectWithAsset
    style?: string
    sizeSettings?: SizeSettings
    ref?: HTMLDivElement | null
  } = $props()

  const alt = $derived(image?.asset?.altText)
  const width = $derived(image?.asset?.metadata?.dimensions?.width)
  const height = $derived(image?.asset?.metadata?.dimensions?.height)
  const imgSrc = $derived(getImageSrc(image, sizeSettings))
  const placeholderSrc = $derived(getPlaceholderSrc(image))

  const imageId = $derived(image?.asset?._id)
  let loadedImageId = $state<string>()
  const loaded = $derived(imageId !== undefined && loadedImageId === imageId)
</script>

<div
  class="image"
  bind:this={ref}
  {style}
  style:aspect-ratio="{width}/{height}"
>
  {#if placeholderSrc}
    <img
      class="placeholder"
      style:opacity={loaded ? 0 : 1}
      src={placeholderSrc}
      alt=""
      aria-hidden="true"
    />
  {/if}
  <img
    {...imgSrc}
    {alt}
    style:opacity={loaded ? 1 : 0}
    onload={() => {
      if (imageId) loadedImageId = imageId
    }}
  />
</div>

<style lang="scss">
  @use "$lib/styles/_entry.scss" as *;

  div {
    position: relative;
    width: 100%;
    height: 100%;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: flex;
    background-color: $light-gray;
  }

  .placeholder {
    position: absolute;
    inset: 0;
    transition: opacity $fade-duration ease-in-out;
    z-index: 2;
    filter: blur(5px);
  }
</style>
