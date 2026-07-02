<script lang="ts">
  import { withDebounce, type TimeOut } from "$lib/utils/animation"
  import {
    fitToHeight,
    isMobile,
    stretchToContainer,
    vw,
    vwRamp,
  } from "$lib/utils/dom"
  import { getMediaAspectRatio } from "$lib/utils/media"
  import { onMount } from "svelte"
  import { ALL_PROJECTS_ROW_MOBILE_GAPS } from "../all/_components/configs"
  import {
    ALL_PROJECTS_MAX_GAP,
    ALL_PROJECTS_MAX_GAP_RAMP,
    ALL_PROJECTS_MIN_GAP,
    ALL_PROJECTS_ROW_HEIGHT,
    ALL_PROJECTS_ROW_HEIGHT_RAMP,
    ALL_PROJECTS_X_MARGIN,
    DEBOUNCE_TRANSITION,
  } from "./config"
  import AllThumbnail from "./allThumbnail.svelte"
  import type { AllThumbnailData } from "./types"

  let {
    rowData,
    tempCopyIndex,
    hoverProjectId = $bindable<string | undefined>(),
    isUnfilled = false,
  }: {
    rowData: AllThumbnailData[]
    tempCopyIndex: number
    hoverProjectId?: string
    isUnfilled: boolean
  } = $props()

  let scalingFactor = $state(1)

  let height = $state(ALL_PROJECTS_ROW_HEIGHT)
  let maxGap = $state(ALL_PROJECTS_MAX_GAP)
  let prevIsMobile = $state(false)
  const mobileGap =
    ALL_PROJECTS_ROW_MOBILE_GAPS[rowData.length] ?? ALL_PROJECTS_MIN_GAP

  const adjustSize = () => {
    prevIsMobile = isMobile()
    const allImageWidth = rowData.reduce((totalWidth, mediaData) => {
      height = prevIsMobile
        ? ALL_PROJECTS_ROW_HEIGHT
        : ALL_PROJECTS_ROW_HEIGHT +
          vwRamp(vw(), 0, ALL_PROJECTS_ROW_HEIGHT_RAMP)
      const aspectRatio = getMediaAspectRatio(mediaData.media)
      return totalWidth + fitToHeight(aspectRatio, height)
    }, 0)

    const minGap = prevIsMobile ? mobileGap : ALL_PROJECTS_MIN_GAP
    maxGap = prevIsMobile
      ? mobileGap
      : ALL_PROJECTS_MAX_GAP + vwRamp(vw(), 0, ALL_PROJECTS_MAX_GAP_RAMP)
    const containerWidth = vw() - ALL_PROJECTS_X_MARGIN * 2

    scalingFactor = stretchToContainer({
      minGap,
      maxGap,
      contentWidth: allImageWidth,
      containerWidth,
      itemCount: rowData.length,
    })
  }

  let adjustSizeDebounceTimer: TimeOut | undefined = $state(undefined)
  const adjustSizeDebounce = () =>
    withDebounce(
      prevIsMobile,
      () => adjustSizeDebounceTimer,
      debounce => (adjustSizeDebounceTimer = debounce),
      adjustSize,
    )

  onMount(() => adjustSize())
</script>

<div
  class="all-projects__row"
  class:all-projects__row--mobile={prevIsMobile}
  class:is-unfilled={isUnfilled}
  style:--x-margin="{ALL_PROJECTS_X_MARGIN}px"
  style:--scaling-factor={isUnfilled ? 1 : scalingFactor}
  style:--height="{height}px"
  style:--unfilled-col-gap={isUnfilled ? `${maxGap}px` : 0}
  style:--all-projects-row-mobile-gap="{Math.min(scalingFactor, 1) *
    mobileGap}px"
  style:opacity={adjustSizeDebounceTimer ? 0 : 1}
  style:transition={!adjustSizeDebounceTimer ? DEBOUNCE_TRANSITION : undefined}
>
  {#each rowData as mediaData}
    <AllThumbnail {mediaData} {tempCopyIndex} bind:hoverProjectId />
  {/each}
</div>

<svelte:window on:resize={adjustSizeDebounce} />

<style lang="scss">
  @use "$lib/styles/_entry.scss" as *;

  .all-projects__row {
    @include flex;
    width: 100dvw;
    height: calc(var(--height) * var(--scaling-factor));
    padding: 0 var(--x-margin);
    box-sizing: border-box;
    justify-content: space-between;
    flex: none;

    @include mobile {
      max-width: 100dvw;
      max-height: var(--all-projects-row-height);
    }
  }

  .all-projects__row.is-unfilled {
    justify-content: center;
    @include desktop {
      gap: var(--unfilled-col-gap);
    }
  }

  .all-projects__row--mobile {
    justify-content: center;
    gap: var(--all-projects-row-mobile-gap);
  }
</style>
