<script lang="ts">
  import { urlFor } from "$lib/utils/sanity"
  import type { SanityImageObjectWithAsset } from "$lib/types/sanity"

  let {
    image,
    style,
    ref = $bindable<HTMLImageElement | null>(),
  }: {
    image: SanityImageObjectWithAsset
    style?: string
    ref?: HTMLImageElement | null
  } = $props()
</script>

<img src={urlFor(image)} alt={image?.asset?.altText} {style} bind:this={ref} />

<style lang="scss">
  img {
    width: 100%;
    height: 100%;
    display: flex;
  }
</style>
