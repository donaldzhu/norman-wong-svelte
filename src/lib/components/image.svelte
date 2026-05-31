<script lang="ts">
  import type { SanityImageObjectWithAsset } from "$lib/types/sanity"
  import { getImageSrc, type SizeSettings } from "$lib/utils/media"

  let {
    image,
    style,
    sizeSettings,
    ref = $bindable<HTMLImageElement | null>(),
  }: {
    image: SanityImageObjectWithAsset
    style?: string
    sizeSettings?: SizeSettings
    ref?: HTMLImageElement | null
  } = $props()

  const alt = $derived(image?.asset?.altText)
  const width = $derived(image?.asset?.metadata?.dimensions?.width)
  const height = $derived(image?.asset?.metadata?.dimensions?.height)
  const imgSrc = $derived(getImageSrc(image, sizeSettings))
</script>

<img
  {...imgSrc}
  {alt}
  style:aspect-ratio="{width}/{height}"
  {style}
  bind:this={ref}
/>

<style lang="scss">
  @use "$lib/styles/_entry.scss" as *;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: flex;
    background-color: $light-gray;
  }
</style>
