<script lang="ts">
  import { onMount } from "svelte"
  import SelectedThumbnail from "./selectedThumbnail.svelte"
  import type { SelectedThumbnailData } from "./types"
  import {
    SELECTED_WORKS_MAX_GAP,
    SELECTED_WORKS_MAX_GAP_RAMP,
    SELECTED_WORKS_MIN_GAP,
    SELECTED_WORKS_ROW_HEIGHT,
    SELECTED_WORKS_ROW_HEIGHT_RAMP,
    SELECTED_WORKS_X_MARGIN,
  } from "./config"
  import { fitToHeight, stretchToContainer, vw, vwRamp } from "$lib/utils/dom"
  import { DEBOUNCE_MS, DEBOUNCE_TRANSITION } from "./config"
  import { withDebounce, type TimeOut } from "$lib/utils/animation"

  let {
    rowData,
    tempCopyIndex,
    hoverProjectId = $bindable<string | undefined>(),
    isUnfilled = false,
  }: {
    rowData: SelectedThumbnailData[]
    tempCopyIndex: number
    hoverProjectId?: string
    isUnfilled: boolean
  } = $props()

  let scalingFactor = $state(1)
  let height = $state(SELECTED_WORKS_ROW_HEIGHT)
  let maxGap = $state(SELECTED_WORKS_MAX_GAP)

  const adjustSize = () => {
    const allImageWidth = rowData.reduce((totalWidth, mediaData) => {
      height =
        SELECTED_WORKS_ROW_HEIGHT +
        vwRamp(vw(), 0, SELECTED_WORKS_ROW_HEIGHT_RAMP)
      const { aspectRatio } = mediaData.media.image.asset.metadata.dimensions
      return totalWidth + fitToHeight(aspectRatio, height)
    }, 0)

    maxGap =
      SELECTED_WORKS_MAX_GAP + vwRamp(vw(), 0, SELECTED_WORKS_MAX_GAP_RAMP)
    scalingFactor = stretchToContainer({
      minGap: SELECTED_WORKS_MIN_GAP,
      maxGap,
      contentWidth: allImageWidth,
      containerWidth: vw() - SELECTED_WORKS_X_MARGIN * 2,
      itemCount: rowData.length,
    }).scalingFactor
  }

  let adjustSizeDebounceTimer: TimeOut | undefined = $state(undefined)
  const adjustSizeDebounce = withDebounce(
    () => adjustSizeDebounceTimer,
    debounce => (adjustSizeDebounceTimer = debounce),
    adjustSize,
  )
  onMount(() => {
    adjustSize()
  })
</script>

<div
  class="selected-works__row"
  class:is-unfilled={isUnfilled}
  style:--x-margin="{SELECTED_WORKS_X_MARGIN}px"
  style:--height="{Math.min(
    height * scalingFactor,
    isUnfilled ? height : Infinity,
  )}px"
  style:--scaling-factor={scalingFactor}
  style:--unfilled-col-gap={isUnfilled ? `${maxGap}px` : 0}
  style:opacity={adjustSizeDebounceTimer ? 0 : 1}
  style:transition={!adjustSizeDebounceTimer ? DEBOUNCE_TRANSITION : undefined}
>
  {#each rowData as mediaData}
    <SelectedThumbnail {mediaData} {tempCopyIndex} bind:hoverProjectId />
  {/each}
</div>

<svelte:window on:resize={adjustSizeDebounce} />

<style lang="scss">
  @use "$lib/styles/_entry.scss" as *;

  .selected-works__row {
    @include flex;
    width: 100dvw;
    height: var(--height);
    padding: 0 var(--x-margin);
    box-sizing: border-box;
    justify-content: space-between;
  }

  .selected-works__row.is-unfilled {
    justify-content: center;
    gap: var(--unfilled-col-gap);
  }
</style>
