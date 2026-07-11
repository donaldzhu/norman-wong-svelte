<script lang="ts">
  import type { MediaData } from "$lib/types/sanity"
  import { withDebounce, type TimeOut } from "$lib/utils/animation"
  import { filterFalsey, quickArray } from "$lib/utils/common"
  import { isMobile } from "$lib/utils/dom"
  import { getMediaId } from "$lib/utils/media"
  import _ from "lodash"
  import { onMount } from "svelte"
  import AllThumbnailRow from "./_components/allThumbnailRow.svelte"
  import { DEBOUNCE_TRANSITION } from "../_components/config"
  import type { AllThumbnailData } from "../_components/types"
  import { getTitle } from "$lib/utils/meta"

  let { data } = $props()
  const layout = $derived(data.allProjects?.desktopLayout)

  const projects = $derived(data.allProjects?.projects)
  const projectList = $derived(projects?.flatMap(project => project.media))
  const desktopRowSettings = $derived(
    data.allProjects?.desktopLayout?.rowSettings,
  )
  const mobileRowSettings = $derived(
    data.allProjects?.mobileLayout?.rowSettings,
  )

  const getThumbnailData = (media: MediaData, index: number) => {
    if (!layout || !projects) return

    let result = 0
    for (let i = 0; i < projects.length; i++)
      for (let ii = 0; ii < projects[i].media.length; ii++) {
        if (result === index) {
          const projectData = projects[i]
          const { project } = projectData
          const { slug } = project

          const slideIndex = project.slideMediaIds.findIndex(ids =>
            ids.includes(getMediaId(media)),
          )
          return {
            anchor: `projects/${slug.current}/${slideIndex + 1}`,
            projectId: projectData.project._id,
          }
        }
        result++
      }
  }

  let prevIsMobile = $state(false)
  const getRows = () => {
    if (!layout || !projectList) rows = []
    const windowIsMobile = isMobile()
    prevIsMobile = windowIsMobile

    const filteredProjectList = projectList.filter(
      project => !windowIsMobile || !project.hideOnMobile,
    )
    let mediaIndex = 0
    const rowSettings = windowIsMobile ? mobileRowSettings : desktopRowSettings

    const isUnfilled = filteredProjectList.length % _.sum(rowSettings) > 0
    rows = rowSettings?.map((rowCellCount, rowIndex) => {
      const row = quickArray(rowCellCount, () => {
        const media = filteredProjectList[mediaIndex]
        const isLastRow = rowIndex === rowSettings.length - 1
        if (!media) return
        return {
          media,
          thumbnailData: getThumbnailData(media, mediaIndex++),
          isUnfilled: isLastRow && isUnfilled,
        }
      })
      return filterFalsey(row)
    })
  }

  let hoverProjectId = $state<string | undefined>()

  let rows = $state<AllThumbnailData[][] | undefined>(undefined)

  onMount(getRows)

  let getRowDebounceTimer: TimeOut | undefined = $state(undefined)
  const getRowWithDebounce = () =>
    withDebounce(
      () => getRowDebounceTimer,
      debounce => (getRowDebounceTimer = debounce),
      getRows,
      prevIsMobile,
    )
</script>

<svelte:head>
  <title>{getTitle()}</title>
</svelte:head>

<div
  class="all-projects"
  style:opacity={getRowDebounceTimer ? 0 : 1}
  style:transition={!getRowDebounceTimer ? DEBOUNCE_TRANSITION : undefined}
>
  {#each quickArray(2) as tempCopyIndex}
    {#each rows as rowData}
      <AllThumbnailRow
        {rowData}
        {tempCopyIndex}
        bind:hoverProjectId
        isUnfilled={rowData.some(data => data.isUnfilled)}
      />
    {/each}
  {/each}
</div>

<svelte:window on:resize={getRowWithDebounce} />

<style lang="scss">
  @use "$lib/styles/_entry.scss" as *;

  .all-projects {
    @include flex-column;
    @include fullscreen;
    gap: var(--all-projects-row-gap);
    padding: var(--page-spacing-top) 0 var(--y-margin-bottom);
    justify-content: flex-start;
    box-sizing: border-box;
    overflow-y: auto;
    @include hide-scrollbars;
  }
</style>
