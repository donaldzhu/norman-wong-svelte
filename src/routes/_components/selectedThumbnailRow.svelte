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
  import {
    fitToHeight,
    isMobile,
    stretchToContainer,
    vw,
    vwRamp,
  } from "$lib/utils/dom"
  import { DEBOUNCE_TRANSITION } from "./config"
  import { withDebounce, type TimeOut } from "$lib/utils/animation"
  import { SELECTED_WORKS_ROW_MOBILE_GAPS } from "../all/_components/configs"
  import { getMediaAspectRatio, MediaType } from "$lib/utils/media"

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
  let windowIsMobile = $state(false)
  const mobileGap =
    SELECTED_WORKS_ROW_MOBILE_GAPS[rowData.length] ?? SELECTED_WORKS_MIN_GAP

  const adjustSize = () => {
    const allImageWidth = rowData.reduce((totalWidth, mediaData) => {
      height = windowIsMobile
        ? SELECTED_WORKS_ROW_HEIGHT
        : SELECTED_WORKS_ROW_HEIGHT +
          vwRamp(vw(), 0, SELECTED_WORKS_ROW_HEIGHT_RAMP)
      const aspectRatio = getMediaAspectRatio(mediaData.media)
      return totalWidth + fitToHeight(aspectRatio, height)
    }, 0)

    const minGap = windowIsMobile ? mobileGap : SELECTED_WORKS_MIN_GAP
    maxGap = windowIsMobile
      ? mobileGap
      : SELECTED_WORKS_MAX_GAP + vwRamp(vw(), 0, SELECTED_WORKS_MAX_GAP_RAMP)
    const containerWidth = vw() - SELECTED_WORKS_X_MARGIN * 2

    scalingFactor = stretchToContainer({
      minGap,
      maxGap,
      contentWidth: allImageWidth,
      containerWidth,
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
    windowIsMobile = isMobile()
    adjustSize()
  })
</script>

<div
  class="selected-works__row"
  class:selected-works__row--mobile={windowIsMobile}
  class:is-unfilled={isUnfilled}
  style:--x-margin="{SELECTED_WORKS_X_MARGIN}px"
  style:--scaling-factor={isUnfilled ? 1 : scalingFactor}
  style:--height="{height}px"
  style:--unfilled-col-gap={isUnfilled ? `${maxGap}px` : 0}
  style:--selected-works-row-mobile-gap="{Math.min(scalingFactor, 1) *
    mobileGap}px"
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
    height: calc(var(--height) * var(--scaling-factor));
    padding: 0 var(--x-margin);
    box-sizing: border-box;
    justify-content: space-between;
    flex: none;

    @include mobile {
      max-width: 100dvw;
      max-height: var(--selected-works-row-height);
    }
  }

  .selected-works__row.is-unfilled {
    justify-content: center;
    @include desktop {
      gap: var(--unfilled-col-gap);
    }
  }

  .selected-works__row--mobile {
    justify-content: center;
    gap: var(--selected-works-row-mobile-gap);
  }
</style>
