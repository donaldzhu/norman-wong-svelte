<script lang="ts">
  import { withDebounce, type TimeOut } from "$lib/utils/animation"
  import { isMobile } from "$lib/utils/dom"
  import { untrack } from "svelte"
  import {
    effectiveIndexRows,
    resolveIndexEntries,
  } from "$lib/utils/indexMedia"
  import AllThumbnailRow from "./_components/allThumbnailRow.svelte"
  import { DEBOUNCE_TRANSITION } from "../_components/config"
  import type { AllThumbnailData } from "../_components/types"
  import { getTitle } from "$lib/utils/meta"

  let { data } = $props()
  const projects = $derived(data.allProjects?.projects)
  const projectList = $derived(resolveIndexEntries(projects))
  const desktopRowSettings = $derived(
    data.allProjects?.desktopLayout?.rowSettings,
  )
  const mobileRowSettings = $derived(
    data.allProjects?.mobileLayout?.rowSettings,
  )

  let wasMobileViewport = $state(false)
  const getRows = () => {
    const isMobileViewport = isMobile()
    wasMobileViewport = isMobileViewport
    const items = projectList.filter(
      item => !isMobileViewport || !item.media.hideOnMobile,
    )
    const rowSettings = effectiveIndexRows(
      isMobileViewport ? mobileRowSettings : desktopRowSettings,
      items.length,
      isMobileViewport ? 2 : 10,
      isMobileViewport ? 4 : 12,
    )
    let offset = 0
    rows = rowSettings.map(width => {
      const group = items.slice(offset, offset + width)
      offset += width
      return group.map(item => ({ ...item, isUnfilled: group.length < width }))
    })
  }

  let hoverProjectId = $state<string | undefined>()

  let rows = $state<AllThumbnailData[][] | undefined>(undefined)

  $effect(() => {
    projectList
    desktopRowSettings
    mobileRowSettings
    untrack(getRows)
  })

  let getRowDebounceTimer: TimeOut | undefined = $state(undefined)
  const getRowWithDebounce = () =>
    withDebounce(
      () => getRowDebounceTimer,
      debounce => (getRowDebounceTimer = debounce),
      getRows,
      wasMobileViewport,
    )
</script>

<svelte:head>
  <title>{getTitle()}</title>
</svelte:head>

<div
  style:opacity={getRowDebounceTimer ? 0 : 1}
  style:transition={!getRowDebounceTimer ? DEBOUNCE_TRANSITION : undefined}
  inert={!!getRowDebounceTimer}
>
  {#each rows as rowData}
    <AllThumbnailRow
      {rowData}
      bind:hoverProjectId
      isUnfilled={rowData.some(data => data.isUnfilled)}
    />
  {/each}
</div>

<svelte:window on:resize={getRowWithDebounce} />

<style lang="scss">
  @use "$lib/styles/_entry.scss" as *;

  div {
    @include fullscreen;
    box-sizing: border-box;

    padding: var(--page-spacing-top) 0 var(--y-margin-bottom);

    @include flex-column;
    gap: var(--all-projects-row-gap);
    justify-content: flex-start;

    overflow-y: auto;
    @include hide-scrollbars;
  }
</style>
