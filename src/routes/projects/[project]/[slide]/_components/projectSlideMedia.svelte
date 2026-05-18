<script lang="ts">
  import Media from "$lib/components/media.svelte"
  import type { SlideMediaData } from "$lib/types/sanity"
  import { Orientation } from "$lib/utils/dom"

  let {
    media,
    orientation,
    automaticMobileLayout,
  }: {
    media: SlideMediaData
    orientation: Orientation
    automaticMobileLayout: boolean
  } = $props()
  const { desktopStart, desktopEnd } = $derived(media)

  const mobileStart = $derived(
    automaticMobileLayout ? Math.ceil(desktopStart / 2) : media.mobileStart,
  )
  const mobileEnd = $derived(
    automaticMobileLayout ? Math.ceil(desktopEnd / 2) : media.mobileEnd,
  )
</script>

<!-- TODO image component with preload, sanity sizing, etc. -->
<div
  class:portrait={orientation === Orientation.Portrait}
  class:landscape={orientation === Orientation.Landscape}
  style:--desktop-grid-layout="{desktopStart} / {desktopEnd}"
  style:--mobile-grid-layout="{mobileStart} / {mobileEnd}"
>
  <Media {media} />
</div>

<style lang="scss">
  @use "$lib/styles/_entry.scss" as *;
  div {
    $text-height: calc(var(--ui-font-size) * 1.2);
    $footer-margin-top: 3rem;

    $header-height: calc(
      var(--y-margin-top) + var(--y-margin-bottom) + var(--button-padding) * 2 +
        #{$text-height} * 3 + #{$footer-margin-top}
    );

    min-height: 0;
    object-fit: cover;
    width: 100%;
    max-height: calc(100dvh - #{$header-height});

    @include desktop {
      grid-column: var(--desktop-grid-layout);
    }

    @include mobile {
      &.portrait {
        max-width: 100dvw;
        grid-row: var(--mobile-grid-layout);
      }

      &.landscape {
        grid-column: var(--mobile-grid-layout);
      }
    }
  }
</style>
