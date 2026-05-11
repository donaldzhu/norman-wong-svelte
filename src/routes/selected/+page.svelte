<script lang="ts">
  import { quickArray } from "$lib/utils/common"
  import type { SanityImageObjectWithAsset } from "$lib/types/sanity"
  import type { SelectedThumbnailData } from "./_components/types"
  import SelectedThumbnailRow from "./_components/selectedThumbnailRow.svelte"

  let { data } = $props()
  const layout = $derived(data.selectedWorks?.desktopLayout)
  const projectList = $derived(
    layout?.projects.flatMap(project => project.media),
  )

  const getThumbnailData = (
    { asset }: SanityImageObjectWithAsset,
    index: number,
  ) => {
    if (!layout) return
    const id = asset._id

    for (let i = 0, mediaIndex = 0; i < layout.projects.length; i++) {
      const { project, media } = layout.projects[i]
      const { slug } = project

      for (let ii = 0; ii < media.length; ii++, mediaIndex++) {
        if (mediaIndex === index) {
          const slideIndex = project.slideMediaIds.findIndex(ids =>
            ids.includes(id),
          )
          return {
            anchor: `projects/${slug.current}/${slideIndex + 1}`,
            projectId: project._id,
          }
        }
      }
    }
  }

  const getRows = (): SelectedThumbnailData[][] => {
    if (!layout || !projectList) return []
    let mediaIndex = 0
    return quickArray(layout.rowSettings.length, index => {
      return quickArray(layout.rowSettings[index], () => {
        const media = projectList[mediaIndex]
        return {
          media,
          thumbnailData: getThumbnailData(media.image, mediaIndex++),
        }
      })
    })
  }

  let hoverProjectId = $state<string | undefined>()

  const rows = $derived(getRows())
</script>

<div class="selected-works">
  {#each quickArray(2) as tempCopyIndex}
    {#each rows as rowData}
      <SelectedThumbnailRow {rowData} {tempCopyIndex} bind:hoverProjectId />
    {/each}
  {/each}
</div>

<style lang="scss">
  @use "$lib/styles/_entry.scss" as *;

  .selected-works {
    @include flex-column;
    gap: var(--selected-works-row-gap);
    margin: var(--page-spacing-top) 0 var(--y-margin-top);
  }
</style>
