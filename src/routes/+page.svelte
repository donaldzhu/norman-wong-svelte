<script lang="ts">
  import type { SanityImageObjectWithAsset } from "$lib/types/sanity"
  import { filterFalsey, quickArray } from "$lib/utils/common"
  import _ from "lodash"
  import SelectedThumbnailRow from "./_components/selectedThumbnailRow.svelte"
  import type { SelectedThumbnailData } from "./_components/types.js"

  let { data } = $props()
  const layout = $derived(data.selectedWorks?.desktopLayout)

  const projects = $derived(data.selectedWorks?.projects)
  const projectList = $derived(projects?.flatMap(project => project.media))
  const desktopRowSettings = $derived(
    data.selectedWorks?.desktopLayout?.rowSettings,
  )
  const mobileRowSettings = $derived(
    data.selectedWorks?.mobileLayout?.rowSettings,
  )

  const getThumbnailData = (
    { asset }: SanityImageObjectWithAsset,
    index: number,
  ) => {
    if (!layout || !projects) return

    let result = 0
    for (let i = 0; i < projects.length; i++)
      for (let ii = 0; ii < projects[i].media.length; ii++) {
        if (result === index) {
          const projectData = projects[i]
          const { project } = projectData
          const { slug } = project

          const slideIndex = project.slideMediaIds.findIndex(ids =>
            ids.includes(asset._id),
          )
          return {
            anchor: `projects/${slug.current}/${slideIndex + 1}`,
            projectId: projectData.project._id,
          }
        }
        result++
      }
  }

  const getRows = (): SelectedThumbnailData[][] | undefined => {
    if (!layout || !projectList) return []
    let mediaIndex = 0
    const isUnfilled = projectList.length % _.sum(desktopRowSettings) > 0
    return desktopRowSettings?.map((rowCellCount, rowIndex) => {
      const row = quickArray(rowCellCount, () => {
        const media = projectList[mediaIndex]
        const isLastRow = rowIndex === desktopRowSettings.length - 1
        if (!media) return
        return {
          media,
          thumbnailData: getThumbnailData(media.image, mediaIndex++),
          isUnfilled: isLastRow && isUnfilled,
        }
      })
      return filterFalsey(row)
    })
  }

  let hoverProjectId = $state<string | undefined>()

  const rows = $derived(getRows())
</script>

<div class="selected-works">
  {#each quickArray(2) as tempCopyIndex}
    {#each rows as rowData}
      <SelectedThumbnailRow
        {rowData}
        {tempCopyIndex}
        bind:hoverProjectId
        isUnfilled={rowData.some(data => data.isUnfilled)}
      />
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
