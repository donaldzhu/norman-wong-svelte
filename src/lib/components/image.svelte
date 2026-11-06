<script lang="ts">
  import type { SanityImageObjectWithAsset } from "$lib/types/sanity"
  import { isMobile, Orientation } from "$lib/utils/dom"
  import { getImageSrc, type SrcSettings } from "$lib/utils/media"
  import { getPlaceholderSrc } from "$lib/utils/sanity"
  import { croppedRatio, hotspotPosition } from "$lib/utils/imageFraming"
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
  const ratio = $derived(croppedRatio(width && height ? width / height : 1, image))
  let frame = $state({ width: 0, height: 0 })
  const objectPosition = $derived(hotspotPosition(image, ratio, frame.width, frame.height))
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
    const measure = () => { if (ref) frame = { width: ref.clientWidth, height: ref.clientHeight } }
    const observer = new ResizeObserver(measure)
    if (ref) observer.observe(ref)
    measure()
    return () => observer.disconnect()
  })
</script>

<div
  bind:this={ref}
  {style}
  class:portrait={orientation === Orientation.Portrait}
  class:landscape={orientation === Orientation.Landscape}
  class:has-mobile-media={hasMobileMedia}
  class:is-mobile-media={isMobileMedia}
  style:aspect-ratio={ratio}
>
  {#if placeholderSrc}
    <img
      class="placeholder"
      style:opacity={loaded ? 0 : 1}
      style={mediaStyle}
      style:object-position={objectPosition}
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
    style:object-position={objectPosition}
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
    transform: translateZ(0);
  }

  .placeholder {
    @include fade-in-out;
    position: absolute;
    inset: 0;
    z-index: 2;
  }
</style>
