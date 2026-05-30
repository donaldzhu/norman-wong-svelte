<script lang="ts">
  import type { ProjectSlideData } from "$lib/types/sanity"
  import { filterFalsey } from "$lib/utils/common"
  import { MediaType, preloadImage } from "$lib/utils/media"
  import { onMount, type Snippet } from "svelte"

  let {
    children,
    data,
  }: {
    children: Snippet
    data: { project: ProjectSlideData }
  } = $props()

  onMount(() => {
    filterFalsey(
      data.project.slides
        .map(slide =>
          slide.media.map(media =>
            media.mediaType === MediaType.Image ? media.image : undefined,
          ),
        )
        .flat(),
    ).forEach(image => preloadImage(image))
  })
</script>

{@render children()}
