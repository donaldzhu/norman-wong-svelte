<script lang="ts">
  import type { SanityImageObjectWithAsset } from "$lib/types/sanity"
  import { Orientation } from "$lib/utils/dom"
  import { getImageSrc, type SizeSettings } from "$lib/utils/media"
  import { getPlaceholderSrc } from "$lib/utils/sanity"

  let {
    image,
    style,
    mediaStyle,
    sizeSettings,
    orientation,
    ref = $bindable<HTMLDivElement | null>(),
    noPreview,
  }: {
    image: SanityImageObjectWithAsset
    style?: string
    mediaStyle?: string
    sizeSettings?: SizeSettings
    orientation?: Orientation
    ref?: HTMLDivElement | null
    noPreview?: boolean
  } = $props()

  const alt = $derived(image?.asset?.altText)
  const width = $derived(image?.asset?.metadata?.dimensions?.width)
  const height = $derived(image?.asset?.metadata?.dimensions?.height)
  const imgSrc = $derived(getImageSrc(image, sizeSettings))
  const placeholderSrc = $derived(getPlaceholderSrc(image))

  const imageId = $derived(image?.asset?._id)
  let loadedImageId = $state<string>()
  const loaded = $derived(imageId !== undefined && loadedImageId === imageId)

  let imgElement = $state<HTMLImageElement>()

  const onload = () => {
    if (imageId) loadedImageId = imageId
  }

  $effect(() => {
    if (!imgElement || !imageId) return
    if (imgElement.complete && imgElement.naturalWidth > 0) onload()
  })
</script>

<div
  class="image"
  bind:this={ref}
  {style}
  class:portrait={orientation === Orientation.Portrait}
  class:landscape={orientation === Orientation.Landscape}
  style:aspect-ratio="{width}/{height}"
>
  {#if placeholderSrc && !noPreview}
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

<style lang="scss">
  @use "$lib/styles/_entry.scss" as *;

  div {
    position: relative;
    @include auto-fit-media;
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
    /* filter: blur(5px); */
  }
</style>
