<script lang="ts">
  import type {
    AllProjectsThumbnailData,
    ProjectData,
  } from "$lib/types/sanity.js"
  import { isLandscape, vw } from "$lib/utils/common.js"
  import { urlFor } from "$lib/utils/sanity.js"
  import _ from "lodash"
  import { onDestroy, onMount, tick } from "svelte"
  import {
    baseSizes,
    MAX_GAP_VW,
    MIN_GAP_VW,
    THUMB_IN_FRAME,
    thumbnailRatios,
  } from "./configs"

  /** Duplicated sequences in the horizontal track; odd count so there is a true center strip. */
  const INFINITE_SCROLL_COPY_COUNT = 5
  const INFINITE_SCROLL_CENTER_INDEX = (INFINITE_SCROLL_COPY_COUNT - 1) >> 1
  const INFINITE_SCROLL_SEGMENT_INDICES = Array.from(
    { length: INFINITE_SCROLL_COPY_COUNT },
    (_, i) => i,
  )

  const { project }: { project: ProjectData } = $props()
  const { _id, title, subtitle, thumbnails } = $derived(project)

  const imageThumbnails = $derived(
    (thumbnails ?? []).filter(
      (t): t is AllProjectsThumbnailData =>
        t.type === "image" && Boolean(t.image),
    ),
  )

  const useInfiniteScroll = $derived(imageThumbnails.length > 1)

  let scrollEl: HTMLDivElement | undefined = $state()
  let trackEl: HTMLDivElement | undefined = $state()
  let segmentWidth = $state(0)

  let scalingFactor = $state(1)
  let gap = $state(100)
  let isMounted = $state(false)

  const getDimensions = (thumbnail: AllProjectsThumbnailData) => {
    if (!isMounted) return { width: 0, height: 0 }
    const { aspectRatio } = thumbnail.image.asset.metadata.dimensions
    const landscapeWidth =
      baseSizes.landscape * thumbnailRatios.landscape[thumbnail.desktopSize]
    const landscapeHeight = landscapeWidth / aspectRatio
    const portraitHeight =
      baseSizes.portrait * thumbnailRatios.portrait[thumbnail.desktopSize]
    const portraitWidth = portraitHeight * aspectRatio
    return {
      width: isLandscape(aspectRatio)
        ? landscapeWidth * scalingFactor
        : portraitWidth * scalingFactor,
      height: isLandscape(aspectRatio)
        ? landscapeHeight * scalingFactor
        : portraitHeight * scalingFactor,
    }
  }

  let resizeObserver: ResizeObserver | undefined

  onMount(() => {
    isMounted = true
    const allImageWidths = project.thumbnails
      .slice(0, THUMB_IN_FRAME)
      .reduce(
        (totalWidth: number, thumbnail: AllProjectsThumbnailData) =>
          totalWidth + getDimensions(thumbnail).width,
        0,
      )
    const remainingGap = (vw() - allImageWidths) / (THUMB_IN_FRAME - 1)
    const minGap = vw(MIN_GAP_VW)
    const maxGap = vw(MAX_GAP_VW)

    if (remainingGap < minGap) scalingFactor = minGap / remainingGap
    else if (remainingGap > maxGap) scalingFactor = remainingGap / maxGap
    gap = _.clamp(remainingGap, minGap, maxGap)

    tick().then(() => {
      if (!useInfiniteScroll || !trackEl || !scrollEl) return
      resizeObserver = new ResizeObserver(() => syncScrollForResize())
      resizeObserver.observe(trackEl)
      syncScrollForResize()
    })
  })

  const getThumbnailAnchor = (thumbnail: AllProjectsThumbnailData) => {
    const id = thumbnail.image.asset._id
    const slideIndex = project.slideMediaIds.findIndex(ids => ids.includes(id))
    return `projects/${project.slug.current}/${slideIndex + 1}`
  }

  function measureSegmentWidth() {
    if (!trackEl) return 0
    return trackEl.scrollWidth / INFINITE_SCROLL_COPY_COUNT
  }

  function syncScrollForResize() {
    if (!scrollEl || !trackEl || !useInfiniteScroll) return
    const nextW = measureSegmentWidth()
    if (nextW <= 0) return

    if (segmentWidth <= 0) {
      scrollEl.scrollLeft = INFINITE_SCROLL_CENTER_INDEX * nextW
    } else if (segmentWidth !== nextW) {
      scrollEl.scrollLeft *= nextW / segmentWidth
    }
    segmentWidth = nextW
  }

  let isAdjustingScroll = false
  function handleThumbnailScroll() {
    if (
      !useInfiniteScroll ||
      !scrollEl ||
      segmentWidth <= 0 ||
      isAdjustingScroll
    )
      return

    const W = segmentWidth
    const edge = 4

    if (scrollEl.scrollLeft <= edge) {
      isAdjustingScroll = true
      scrollEl.scrollLeft += W
      isAdjustingScroll = false
    } else if (
      scrollEl.scrollLeft >=
      (INFINITE_SCROLL_COPY_COUNT - 1) * W -
        scrollEl.clientWidth -
        edge
    ) {
      isAdjustingScroll = true
      scrollEl.scrollLeft -= W
      isAdjustingScroll = false
    }
  }

  onDestroy(() => resizeObserver?.disconnect())
</script>

<section
  class="all-projects__section"
  style:--scaling-factor={scalingFactor}
  style:--gap="{gap}px"
  style:--min-gap-vw={MIN_GAP_VW}
  style:--max-gap-vw={MAX_GAP_VW}
>
  <h2>
    {title}{#if subtitle}, <i>{subtitle}</i>{/if}
  </h2>
  {#if imageThumbnails.length === 0}{:else if useInfiniteScroll}
    <div
      class="all-projects__thumbnail-scroll"
      bind:this={scrollEl}
      onscroll={handleThumbnailScroll}
    >
      <div class="all-projects__thumbnail-track" bind:this={trackEl}>
        {#each INFINITE_SCROLL_SEGMENT_INDICES as segment (segment)}
          {#each imageThumbnails as thumbnail, index (`${_id}-${segment}-${index}`)}
            <a href={getThumbnailAnchor(thumbnail)}>
              <img
                class="desktop-size-{thumbnail.desktopSize} mobile-size-{thumbnail.mobileSize} {isLandscape(
                  thumbnail.image.asset?.metadata?.dimensions?.aspectRatio,
                )
                  ? 'landscape'
                  : 'portrait'}"
                src={urlFor(thumbnail.image)}
                alt={thumbnail.image.asset?.altText}
                width={isMounted ? getDimensions(thumbnail).width : "auto"}
                height={isMounted ? getDimensions(thumbnail).height : "auto"}
                style:opacity={isMounted ? 1 : 0}
              />
            </a>
          {/each}
        {/each}
      </div>
    </div>
  {:else}
    <div class="all-projects__thumbnail-container">
      {#each imageThumbnails as thumbnail, index (`${_id}-${index}`)}
        <a href={getThumbnailAnchor(thumbnail)}>
          <img
            class="desktop-size-{thumbnail.desktopSize} mobile-size-{thumbnail.mobileSize} {isLandscape(
              thumbnail.image.asset?.metadata?.dimensions?.aspectRatio,
            )
              ? 'landscape'
              : 'portrait'}"
            src={urlFor(thumbnail.image)}
            alt={thumbnail.image.asset?.altText}
            width={isMounted ? getDimensions(thumbnail).width : "auto"}
            height={isMounted ? getDimensions(thumbnail).height : "auto"}
            style:opacity={isMounted ? 1 : 0}
          />
        </a>
      {/each}
    </div>
  {/if}
</section>

<style lang="scss">
  @use "$lib/styles/_entry.scss" as *;

  section {
    @include flex-column;
    gap: var(--all-projects-inner-gap);
  }

  h2 {
    @include serif;
    font-size: var(--all-projects-font-size);
    line-height: 0.9;
  }

  .all-projects__thumbnail-container {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--gap);
    width: 100vw;
  }

  .all-projects__thumbnail-scroll {
    overflow-x: auto;
    overflow-y: hidden;
    width: 100vw;
    -webkit-overflow-scrolling: touch;
  }

  .all-projects__thumbnail-track {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: var(--gap);
    width: max-content;
  }

  img {
    display: flex;
    transition: opacity 0.3s ease-in-out;
  }
</style>
