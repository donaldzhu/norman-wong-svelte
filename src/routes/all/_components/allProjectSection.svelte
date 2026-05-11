<script lang="ts">
  import type { AllProjectsThumbnailData, ProjectData } from "$lib/types/sanity"
  import { isLandscape, quickArray } from "$lib/utils/common"
  import {
    fitToHeight,
    fitToWidth,
    stretchToContainer,
    vw,
    vwRamp,
  } from "$lib/utils/dom"
  import { urlFor } from "$lib/utils/sanity"
  import _ from "lodash"
  import { onDestroy, onMount, tick } from "svelte"
  import {
    BaseSizes,
    HOVER_EDGE_SCROLL_PX_PER_SEC,
    HOVER_EDGE_SCROLL_ZONE,
    INFINITE_SCROLL_COPY_COUNT,
    INFINITE_SCROLL_EDGE_CUSHION_PX,
    MAX_FADE_IN_DELAY,
    MAX_GAP,
    MAX_GAP_RAMP,
    MIN_GAP,
    FADE_DURATION,
    THUMB_IN_FRAME,
    THUMB_NEGATIVE_MARGIN,
    ThumbnailRatio,
  } from "./configs"
  import gsap from "gsap"

  const { project }: { project: ProjectData } = $props()
  const { _id, title, subtitle, thumbnails } = $derived(project)

  const imageThumbnails = $derived(
    (thumbnails ?? []).filter(
      (t): t is AllProjectsThumbnailData =>
        t.type === "image" && Boolean(t.image),
    ),
  )

  const INFINITE_SCROLL_CENTER_INDEX = (INFINITE_SCROLL_COPY_COUNT - 1) / 2
  const INFINITE_SCROLL_SEGMENT_INDICES = quickArray(INFINITE_SCROLL_COPY_COUNT)

  let scrollContainerRef = $state<HTMLDivElement>()
  let scrollTrackRef = $state<HTMLDivElement>()
  let scrollSegmentWidth = $state(0)

  let scalingFactors = $state(1)
  let gap = $state(100)

  const thumbnailRefs = $state<(HTMLImageElement | null)[][]>(
    quickArray<null[]>(INFINITE_SCROLL_COPY_COUNT, () =>
      Array(THUMB_IN_FRAME).fill(null),
    ),
  )
  let initialLeftMostThumbnail = $derived(
    thumbnailRefs[INFINITE_SCROLL_CENTER_INDEX][0],
  )
  let isMounted = $state(false)

  const getDimensions = (thumbnail: AllProjectsThumbnailData) => {
    if (!isMounted) return { width: 0, height: 0 }
    const { aspectRatio } = thumbnail.image.asset.metadata.dimensions

    let width: number
    let height: number
    if (isLandscape(aspectRatio)) {
      width =
        BaseSizes.landscape *
        ThumbnailRatio.landscape[thumbnail.desktopSize] *
        scalingFactors
      height = fitToWidth(aspectRatio, width)
    } else {
      height =
        BaseSizes.portrait *
        ThumbnailRatio.portrait[thumbnail.desktopSize] *
        scalingFactors
      width = fitToHeight(aspectRatio, height)
    }

    return { width, height }
  }

  let resizeObserver: ResizeObserver

  onMount(() => {
    isMounted = true
    // TODO: seems to presist on route nav?
    const allImageWidth = project.thumbnails
      .slice(0, THUMB_IN_FRAME)
      .reduce(
        (totalWidth: number, thumbnail: AllProjectsThumbnailData) =>
          totalWidth + getDimensions(thumbnail).width,
        0,
      )

    const sizeConfig = stretchToContainer({
      minGap: MIN_GAP,
      maxGap: MAX_GAP + Math.max(0, vwRamp(vw(), 0, MAX_GAP_RAMP)),
      contentWidth: allImageWidth,
      containerWidth: vw() + THUMB_NEGATIVE_MARGIN * 2,
      itemCount: THUMB_IN_FRAME,
    })

    scalingFactors = sizeConfig.scalingFactor
    gap = sizeConfig.gap

    for (let index = 0; index < THUMB_IN_FRAME; index++) {
      gsap.to(thumbnailRefs[INFINITE_SCROLL_CENTER_INDEX][index], {
        opacity: 1,
        delay: FADE_DURATION + Math.random() * MAX_FADE_IN_DELAY,
        duration: FADE_DURATION,
        ease: "power2.inOut",
      })
    }

    tick().then(() => {
      if (!scrollTrackRef || !scrollContainerRef) return
      resizeObserver = new ResizeObserver(() => onWindowResize())
      resizeObserver.observe(scrollTrackRef)
      onWindowResize()
    })
  })

  const getThumbnailAnchor = (thumbnail: AllProjectsThumbnailData) => {
    const id = thumbnail.image.asset._id
    const slideIndex = project.slideMediaIds.findIndex(ids => ids.includes(id))
    return `projects/${project.slug.current}/${slideIndex + 1}`
  }

  const getSegmentWidth = () =>
    !scrollTrackRef
      ? 0
      : scrollTrackRef.scrollWidth / INFINITE_SCROLL_COPY_COUNT

  const onWindowResize = (isInitialResize = false) => {
    if (!scrollContainerRef || !scrollTrackRef) return
    const newSegmentWidth = getSegmentWidth()
    if (newSegmentWidth <= 0) return

    const needsInitialScroll = scrollSegmentWidth <= 0
    const didSegmentWidthChange = scrollSegmentWidth !== newSegmentWidth

    if (needsInitialScroll && isInitialResize)
      scrollContainerRef.scrollLeft =
        INFINITE_SCROLL_CENTER_INDEX * newSegmentWidth
    else if (didSegmentWidthChange)
      scrollContainerRef.scrollLeft *= newSegmentWidth / scrollSegmentWidth

    if (initialLeftMostThumbnail)
      scrollContainerRef.scrollTo({
        left: initialLeftMostThumbnail.offsetLeft + THUMB_NEGATIVE_MARGIN,
      })

    scrollSegmentWidth = newSegmentWidth
  }

  const onscroll = () => {
    if (!scrollContainerRef || scrollSegmentWidth <= 0) return

    if (scrollContainerRef.scrollLeft <= INFINITE_SCROLL_EDGE_CUSHION_PX)
      scrollContainerRef.scrollLeft += scrollSegmentWidth
    else if (
      scrollContainerRef.scrollLeft >=
      (INFINITE_SCROLL_COPY_COUNT - 1) * scrollSegmentWidth -
        scrollContainerRef.clientWidth -
        INFINITE_SCROLL_EDGE_CUSHION_PX
    )
      scrollContainerRef.scrollLeft -= scrollSegmentWidth
  }

  type HoverDir = -1 | 0 | 1
  let hoverAnimation: number | null = null
  let hoverDir: HoverDir = 0
  let lastHoverTick: number | null = null

  const stopHoverScrol = () => {
    if (hoverAnimation) cancelAnimationFrame(hoverAnimation)
    hoverAnimation = null
    hoverDir = 0
    lastHoverTick = null
  }

  const hoverScroll = (time: number) => {
    if (!scrollContainerRef || hoverDir === 0) return stopHoverScrol()

    if (lastHoverTick) {
      const timeDelta = Math.min((time - lastHoverTick) / 1000, 0.05)
      scrollContainerRef.scrollLeft +=
        hoverDir * HOVER_EDGE_SCROLL_PX_PER_SEC * timeDelta
    }

    lastHoverTick = time
    hoverAnimation = requestAnimationFrame(hoverScroll)
  }

  const onHoverMove = ({ clientX }: MouseEvent) => {
    const leftBound = vw(HOVER_EDGE_SCROLL_ZONE)
    const rightBound = vw(100 - HOVER_EDGE_SCROLL_ZONE)

    let nextDir: HoverDir =
      clientX < leftBound ? -1 : clientX > rightBound ? 1 : 0

    if (nextDir === 0) return stopHoverScrol()

    const wasIdle = hoverDir === 0
    hoverDir = nextDir
    if (wasIdle) hoverAnimation = requestAnimationFrame(hoverScroll)
  }

  onDestroy(() => {
    resizeObserver?.disconnect()
    stopHoverScrol()
  })
</script>

<section
  class="all-projects__section"
  style:--scaling-factor={scalingFactors}
  style:--gap="{gap}px"
  style:--fade-duration="{FADE_DURATION}s"
  style:opacity={!isMounted ? 0 : 1}
>
  <h2>
    {title}{#if subtitle}, <i>{subtitle}</i>{/if}
  </h2>
  <div
    class="all-projects__thumbnail-scroll-container"
    role="region"
    bind:this={scrollContainerRef}
    {onscroll}
    onmousemove={onHoverMove}
    onmouseleave={stopHoverScrol}
  >
    <div
      class="all-projects__thumbnail-scroll-track"
      bind:this={scrollTrackRef}
    >
      {#each INFINITE_SCROLL_SEGMENT_INDICES as segment, segmentIndex (segment)}
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
              style:opacity={!isMounted ||
              (segmentIndex === INFINITE_SCROLL_CENTER_INDEX &&
                index <= THUMB_IN_FRAME - 1)
                ? 0
                : 1}
              bind:this={thumbnailRefs[segmentIndex][index]}
            />
          </a>
        {/each}
      {/each}
    </div>
  </div>
</section>

<style lang="scss">
  @use "$lib/styles/_entry.scss" as *;

  section {
    @include flex-column;
    gap: var(--all-projects-inner-gap);
    transition: opacity var(--fade-duration) ease-in-out;
  }

  a {
    padding: 0;
  }

  h2 {
    @include serif;
    font-size: var(--all-projects-font-size);
    line-height: 0.9;
  }

  .all-projects__thumbnail-container {
    @include flex;
    gap: var(--gap);
    width: 100vw;
  }

  .all-projects__thumbnail-scroll-container {
    width: 100vw;
    overflow: auto hidden;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    -ms-overflow-style: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  .all-projects__thumbnail-scroll-track {
    @include flex;
    width: max-content;
    justify-content: flex-start;
    gap: var(--gap);
  }

  img {
    display: flex;
  }
</style>
