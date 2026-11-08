<script lang="ts">
  import type { SanityImageObjectWithAsset } from "$lib/types/sanity"
  import { isMobile, Orientation } from "$lib/utils/dom"
  import { getImageSrc, type SrcSettings } from "$lib/utils/media"
  import { getPlaceholderSrc } from "$lib/utils/sanity"
  import { croppedRatio, hotspotPosition } from "$lib/utils/imageFraming"
  import { onMount } from "svelte"

  let {
    style,
    mediaStyle,
    image,
    srcSettings,
    orientation,
    ref = $bindable<HTMLDivElement | null>(),
    hasMobileMedia,
    isMobileMedia,
  }: {
    style: string | undefined
    mediaStyle: string | undefined
    image: SanityImageObjectWithAsset
    srcSettings: SrcSettings | undefined
    orientation: Orientation | undefined
    ref: HTMLDivElement | null | undefined
    hasMobileMedia: boolean | undefined
    isMobileMedia: boolean | undefined
  } = $props()

  const alt = $derived(image?.asset?.altText)
  const width = $derived(image?.asset?.metadata?.dimensions?.width)
  const height = $derived(image?.asset?.metadata?.dimensions?.height)
  const ratio = $derived(croppedRatio(width && height ? width / height : 1, image))
  let frame = $state({ width: 0, height: 0 })
  const objectPosition = $derived(
    hotspotPosition(image, ratio, frame.width, frame.height),
  )
  const imgSrc = $derived(getImageSrc(image, srcSettings))
  const placeholderSrc = $derived(getPlaceholderSrc(image))
  let isMobileViewport = $state<boolean>()

  const imageId = $derived(image?.asset?._id)
  let loadedImageId = $state<string>()
  const isLoaded = $derived(imageId !== undefined && loadedImageId === imageId)

  let imgElement = $state<HTMLImageElement>()

  const onload = () => {
    if (imageId) loadedImageId = imageId
  }

  $effect(() => {
    if (!imgElement || !imageId) return
    if (
      hasMobileMedia &&
      isMobileViewport !== undefined &&
      isMobileViewport !== isMobileMedia
    )
      return
    if (imgElement.complete && imgElement.naturalWidth > 0) onload()
  })

  onMount(() => {
    isMobileViewport = isMobile()
    const measure = () => {
      if (ref) frame = { width: ref.clientWidth, height: ref.clientHeight }
    }
    const observer = new ResizeObserver(measure)
    if (ref) observer.observe(ref)
    measure()
    return () => observer.disconnect()
  })
</script>

<div
  {style}
  class:image--portrait={orientation === Orientation.Portrait}
  class:image--landscape={orientation === Orientation.Landscape}
  class:image--has-mobile-media={hasMobileMedia}
  class:image--mobile-media={isMobileMedia}
  style:aspect-ratio={ratio}
  bind:this={ref}
>
  {#if placeholderSrc}
    <img
      class="image__placeholder"
      style:opacity={isLoaded ? 0 : 1}
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
    style:opacity={isLoaded ? 1 : 0}
    style={mediaStyle}
    style:object-position={objectPosition}
    {alt}
    {onload}
  />
</div>

<svelte:window on:resize={() => (isMobileViewport = isMobile())} />

<style lang="scss">
  @use "$lib/styles/_entry.scss" as *;

  div {
    @include auto-fit-media("image");
    @include demarcate-media("image");
    position: relative;
  }

  img {
    width: 100%;
    height: 100%;

    display: flex;

    object-fit: cover;
    background-color: $light-gray;

    transform: translateZ(0);
  }

  .image__placeholder {
    position: absolute;
    inset: 0;
    z-index: 2;

    @include fade-in-out;
  }
</style>
