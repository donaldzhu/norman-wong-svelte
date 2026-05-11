<script lang="ts">
  import { onMount } from "svelte"
  import SelectedThumbnail from "./selectedThumbnail.svelte"
  import type { SelectedThumbnailData } from "./types"
  import {
    MAX_GAP,
    MAX_GAP_RAMP,
    MIN_GAP,
    ROW_HEIGHT,
    ROW_HEIGHT_RAMP,
    X_MARGIN,
  } from "./config"
  import { fitToHeight, stretchToContainer, vw, vwRamp } from "$lib/utils/dom"

  let {
    rowData,
    tempCopyIndex,
    hoverProjectId = $bindable<string | undefined>(),
  }: {
    rowData: SelectedThumbnailData[]
    tempCopyIndex: number
    hoverProjectId?: string
  } = $props()

  let scalingFactor = $state(1)
  let height = $state(ROW_HEIGHT)

  onMount(() => {
    const allImageWidth = rowData.reduce((totalWidth, mediaData) => {
      height = ROW_HEIGHT + vwRamp(vw(), 0, ROW_HEIGHT_RAMP)
      const { aspectRatio } = mediaData.media.image.asset.metadata.dimensions
      return totalWidth + fitToHeight(aspectRatio, height)
    }, 0)

    scalingFactor = stretchToContainer({
      minGap: MIN_GAP,
      maxGap: MAX_GAP + vwRamp(vw(), 0, MAX_GAP_RAMP),
      contentWidth: allImageWidth,
      containerWidth: vw() - X_MARGIN * 2,
      itemCount: rowData.length,
    }).scalingFactor
  })
</script>

<div
  class="selected-works__row"
  style:--x-margin="{X_MARGIN}px"
  style:--height="{height * scalingFactor}px"
  style:--scaling-factor={scalingFactor}
>
  {#each rowData as mediaData}
    <SelectedThumbnail {mediaData} {tempCopyIndex} bind:hoverProjectId />
  {/each}
</div>

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
</style>
