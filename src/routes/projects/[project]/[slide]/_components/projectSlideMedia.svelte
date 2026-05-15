<script lang="ts">
  import type { SlideMediaData } from "$lib/types/sanity"

  let { media }: { media: SlideMediaData } = $props()
  const { desktopStart, desktopEnd } = $derived(media)

  let start = $derived(desktopStart)
  let end = $derived(desktopEnd)
</script>

<!-- TODO image component with preload, sanity sizing, etc. -->
<img
  src={media.image.asset.url}
  alt={media.image.asset.altText}
  style:grid-column-start={start}
  style:grid-column-end={end}
/>

<style lang="scss">
  @use "$lib/styles/_entry.scss" as *;
  img {
    $text-height: calc(var(--ui-font-size) * 1.2);
    $footer-margin-top: 3rem;

    $header-height: calc(
      var(--y-margin-top) + var(--y-margin-bottom) + var(--button-padding) * 2 +
        #{$text-height} * 3 + #{$footer-margin-top}
    );

    width: 100%;
    max-height: calc(100vh - #{$header-height});
    object-fit: cover;
  }
</style>
