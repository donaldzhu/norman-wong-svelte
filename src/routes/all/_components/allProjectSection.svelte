<script lang="ts">
  import Media from "$lib/components/media.svelte"
  import type { AllProjectsThumbnailData, ProjectData } from "$lib/types/sanity"
  import { withDebounce, type TimeOut } from "$lib/utils/animation"
  import { isLandscape, quickArray } from "$lib/utils/common"
  import {
    fitToHeight,
    fitToWidth,
    isMobile,
    stretchToContainer,
    vw,
    vwRamp,
  } from "$lib/utils/dom"
  import { getMediaAspectRatio, getMediaId } from "$lib/utils/media"
  import gsap from "gsap"
  import { onDestroy, onMount, tick } from "svelte"
  import {
    DEBOUNCE_TRANSITION,
    FADE_DURATION,
    FADE_EASE,
    MAX_FADE_IN_DELAY,
  } from "../../_components/config"
  import {
    BaseSizes,
    DESKTOP_MAX_GAP,
    DESKTOP_MAX_GAP_RAMP,
    DESKTOP_MIN_GAP,
    DESKTOP_THUMB_IN_FRAME,
    HOVER_EDGE_SCROLL_PX_PER_SEC,
    HOVER_EDGE_SCROLL_ZONE,
    INFINITE_SCROLL_COPY_COUNT,
    INFINITE_SCROLL_EDGE_CUSHION_PX,
    MOBILE_MAX_GAP,
    MOBILE_MIN_GAP,
    MOBILE_THUMB_IN_FRAME,
    THUMB_NEGATIVE_MARGIN,
    ThumbnailRatio,
  } from "./configs"

  const { project }: { project: ProjectData } = $props()
  const { _id, title, subtitle, thumbnails } = $derived(project)

  const INFINITE_SCROLL_CENTER_INDEX = (INFINITE_SCROLL_COPY_COUNT - 1) / 2
  const INFINITE_SCROLL_SEGMENT_INDICES = quickArray(INFINITE_SCROLL_COPY_COUNT)

  let scrollContainerRef = $state<HTMLDivElement>()
  let scrollTrackRef = $state<HTMLDivElement>()
  let scrollSegmentWidth = $state(0)

  let scalingFactors = $state(1)
  let gap = $state(100)

  let thumbInFrame = $state(DESKTOP_THUMB_IN_FRAME)
  const thumbnailRefs = $state<
    (HTMLImageElement | HTMLVideoElement | null)[][]
  >(
    quickArray<null[]>(INFINITE_SCROLL_COPY_COUNT, () =>
      Array(DESKTOP_THUMB_IN_FRAME).fill(null),
    ),
  )

  let initialLeftMostThumbnail = $derived(
    thumbnailRefs[INFINITE_SCROLL_CENTER_INDEX][0],
  )

  const getDimensions = (thumbnail: AllProjectsThumbnailData) => {
    if (!isMounted) return { width: 0, height: 0 }
    const aspectRatio = getMediaAspectRatio(thumbnail)

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

  const getThumbnailAnchor = (thumbnail: AllProjectsThumbnailData) => {
    const id = getMediaId(thumbnail)
    if (!id.match(/image/)) console.log(project.slideMediaIds)

    const slideIndex = project.slideMediaIds.findIndex(ids => ids.includes(id))
    return `projects/${project.slug.current}/${slideIndex + 1}`
  }

  const getSegmentWidth = () =>
    !scrollTrackRef
      ? 0
      : scrollTrackRef.scrollWidth / INFINITE_SCROLL_COPY_COUNT

  const onWindowResize = () => {
    scalingFactors = 1
    const windowIsMobile = isMobile()
    thumbInFrame = windowIsMobile
      ? MOBILE_THUMB_IN_FRAME
      : DESKTOP_THUMB_IN_FRAME

    const minGap = windowIsMobile ? MOBILE_MIN_GAP : DESKTOP_MIN_GAP
    const maxGap = windowIsMobile ? MOBILE_MAX_GAP : DESKTOP_MAX_GAP
    const maxGapRamp = windowIsMobile ? 0 : DESKTOP_MAX_GAP_RAMP

    const allImageWidth = project.thumbnails
      .slice(0, thumbInFrame)
      .reduce(
        (totalWidth: number, thumbnail: AllProjectsThumbnailData) =>
          totalWidth + getDimensions(thumbnail).width,
        0,
      )

    const sizeConfig = stretchToContainer({
      minGap,
      maxGap: maxGap + Math.max(0, vwRamp(vw(), 0, maxGapRamp)),
      contentWidth: allImageWidth,
      containerWidth: vw() + THUMB_NEGATIVE_MARGIN * 2,
      itemCount: thumbInFrame,
    })

    scalingFactors = sizeConfig.scalingFactor
    gap = sizeConfig.gap
  }

  let windowResizeDebounceTimer: TimeOut | undefined = $state(undefined)
  const windowResizeDebounce = withDebounce(
    () => windowResizeDebounceTimer,
    debounce => (windowResizeDebounceTimer = debounce),
    onWindowResize,
  )

  let isMounted = $state(false)

  onMount(() => {
    isMounted = true

    for (let index = 0; index < DESKTOP_THUMB_IN_FRAME; index++) {
      gsap.to(thumbnailRefs[INFINITE_SCROLL_CENTER_INDEX][index], {
        opacity: 1,
        delay: FADE_DURATION + Math.random() * MAX_FADE_IN_DELAY,
        duration: FADE_DURATION,
        ease: FADE_EASE,
      })
    }

    tick().then(() => {
      if (!scrollTrackRef || !scrollContainerRef) return
      resizeObserver = new ResizeObserver(() => onObserverResize())
      resizeObserver.observe(scrollTrackRef)
      onWindowResize()
      onObserverResize()
    })
  })

  const onObserverResize = (isInitialResize = false) => {
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

    if (initialLeftMostThumbnail) {
      let left: number
      const mobileMiddleThumbnail =
        thumbnailRefs[INFINITE_SCROLL_CENTER_INDEX][
          Math.floor(thumbInFrame / 2)
        ]

      if (isMobile() && mobileMiddleThumbnail) {
        const { width } = mobileMiddleThumbnail.getBoundingClientRect()
        left = mobileMiddleThumbnail.offsetLeft + width / 2 - vw(50)
      } else left = initialLeftMostThumbnail.offsetLeft + THUMB_NEGATIVE_MARGIN

      scrollContainerRef.scrollTo({ left })
    }

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
    if (windowResizeDebounceTimer || isMobile()) return
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
    onmouseenter={onHoverMove}
    onmousemove={onHoverMove}
    onmouseleave={stopHoverScrol}
    style:opacity={windowResizeDebounceTimer ? 0 : 1}
    style:transition={!windowResizeDebounceTimer
      ? DEBOUNCE_TRANSITION
      : undefined}
  >
    <div
      class="all-projects__thumbnail-scroll-track"
      bind:this={scrollTrackRef}
    >
      {#each INFINITE_SCROLL_SEGMENT_INDICES as segment, segmentIndex (segment)}
        {#each thumbnails as thumbnail, index (`${_id}-${segment}-${index}`)}
          <a
            href={getThumbnailAnchor(thumbnail)}
            style:--width={isMounted
              ? `${getDimensions(thumbnail).width}px`
              : "auto"}
            style:--height={isMounted
              ? `${getDimensions(thumbnail).height}px`
              : "auto"}
          >
            <Media
              media={thumbnail}
              style={`opacity: ${
                !isMounted ||
                (segmentIndex === INFINITE_SCROLL_CENTER_INDEX &&
                  index <= DESKTOP_THUMB_IN_FRAME - 1)
                  ? 0
                  : 1
              }`}
              bind:ref={thumbnailRefs[segmentIndex][index]}
            />
          </a>
        {/each}
      {/each}
    </div>
  </div>
</section>

<svelte:window on:resize={windowResizeDebounce} />

<style lang="scss">
  @use "$lib/styles/_entry.scss" as *;

  section {
    @include flex-column;
    gap: var(--all-projects-inner-gap);
    transition: opacity var(--fade-duration) ease-in-out;
  }

  a {
    padding: 0;
    display: block;
    width: var(--width);
    height: var(--height);
  }

  h2 {
    @include serif;
    font-size: var(--all-projects-font-size);
    line-height: 0.9;
    text-align: center;

    i {
      @include mobile {
        display: block;
      }
    }
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
</style>
