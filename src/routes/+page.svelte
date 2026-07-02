<script lang="ts">
  import { quickArray } from "$lib/utils/common"
  import { getTitle } from "$lib/utils/meta"
  import { onDestroy, onMount, tick } from "svelte"
  import {
    PAGE_INFINITE_SCROLL_COPY_COUNT,
    PAGE_SNAP_STRICTNESS,
    PAGE_SNAP_STOP,
    RECENTER_MIN_MULTIPLES,
    REQUIRES_SOFT_ADJUSTMENT_THRESHOLD,
    EDGE_CUSHION_MULTIPLES,
    SCROLL_THRESHOLD,
  } from "./_selectedComponents/configs.js"
  import SelectedProjectSection from "./_selectedComponents/selectedProjectSection.svelte"
  import { goto } from "$app/navigation"
  import type { ProjectData } from "$lib/types/sanity"
  import gsap from "gsap"
  import { ANIMATION_DURATION, ANIMATION_EASE } from "./_components/config"
  import { scrollend } from "$lib/actions/scrollendAction"

  let { data } = $props()

  const projects = $derived(data?.selectedWorks?.projects ?? [])

  const CENTER_INDEX = (PAGE_INFINITE_SCROLL_COPY_COUNT - 1) / 2
  const copyIndices = quickArray(PAGE_INFINITE_SCROLL_COPY_COUNT)

  let scrollContainerRef = $state<HTMLDivElement>()
  let scrollTrackRef = $state<HTMLDivElement>()
  let scrollSegmentHeight = $state(0)
  let lastScrollTop = $state(0)
  let centerProjectIndex = $state<number>()

  let resizeObserver: ResizeObserver
  let scrollTween: gsap.core.Timeline | undefined

  let hasInitialized = $state(false)
  let isRecentering = $state(false)
  let isSettled = $state(false)
  let isNavigating = $state(false)
  let isMounted = $state(false)
  let requiresSoftAdjustment = $state(false)

  let userHasScrolled = $state(false)

  const getAllRows = () => {
    if (!scrollTrackRef) return []
    return Array.from(scrollTrackRef.children).flatMap(row =>
      Array.from(row.children),
    )
  }

  const recenter = () => {
    if (!scrollContainerRef || scrollSegmentHeight <= 0 || userHasScrolled)
      return
    isRecentering = true

    const offset = scrollContainerRef.scrollTop % scrollSegmentHeight
    let target = CENTER_INDEX * scrollSegmentHeight + offset

    if (centerProjectIndex !== undefined) {
      const scrollElement = getAllRows()[centerProjectIndex]
      const { top, height } = scrollElement.getBoundingClientRect()
      const compositionOffset = Math.ceil(
        top + height / 2 - window.innerHeight / 2,
      )
      if (Math.abs(compositionOffset) > REQUIRES_SOFT_ADJUSTMENT_THRESHOLD)
        requiresSoftAdjustment = true
    }

    const minDelta = RECENTER_MIN_MULTIPLES * scrollSegmentHeight
    if (Math.abs(scrollContainerRef.scrollTop - target) < minDelta) return

    tick().then(() => {
      if (scrollContainerRef) scrollContainerRef.scrollTop = target
    })
  }

  const isNearTrueEdge = () => {
    if (!scrollContainerRef) return false
    const { scrollTop, clientHeight, scrollHeight } = scrollContainerRef
    const maxScrollTop = scrollHeight - clientHeight
    const edgeCushion = scrollSegmentHeight * EDGE_CUSHION_MULTIPLES
    return scrollTop < edgeCushion || scrollTop > maxScrollTop - edgeCushion
  }

  const onObserverResize = (isInitialResize = false) => {
    if (!scrollContainerRef || !scrollTrackRef) return
    const newSegmentHeight =
      scrollTrackRef.scrollHeight / PAGE_INFINITE_SCROLL_COPY_COUNT
    if (newSegmentHeight <= 0) return

    const needsInitialScroll = scrollSegmentHeight <= 0
    const didSegmentHeightChange = scrollSegmentHeight !== newSegmentHeight

    if (needsInitialScroll && isInitialResize) {
      scrollContainerRef.scrollTop =
        CENTER_INDEX * newSegmentHeight - window.innerHeight / 2
    } else if (didSegmentHeightChange)
      scrollContainerRef.scrollTop *= newSegmentHeight / scrollSegmentHeight

    scrollSegmentHeight = newSegmentHeight
  }

  const updateCenterProjectIndex = () => {
    if (!scrollTrackRef || scrollSegmentHeight <= 0 || isNavigating) return
    const allRows = getAllRows()
    centerProjectIndex =
      Array.from(allRows).findIndex(
        child => child.getBoundingClientRect().top > window.innerHeight / 2,
      ) - 1
  }

  const updateLastScrollTop = () => {
    let difference = NaN
    if (scrollContainerRef) {
      difference = scrollContainerRef.scrollTop - lastScrollTop
      lastScrollTop = scrollContainerRef.scrollTop
    }
    return difference
  }

  const onuserscroll = () => {
    isRecentering = false
    hasInitialized = true
    userHasScrolled = true
  }

  const onscroll = () => {
    if (scrollSegmentHeight <= 0 || isNavigating) return
    if (hasInitialized) updateCenterProjectIndex()
    // console.log("scroll", isRecentering)
    isRecentering = false
    isSettled = false
    userHasScrolled = false
    if (isNearTrueEdge()) return recenter()
  }

  const onscrollend = () => {
    const difference = updateLastScrollTop()
    isSettled = true

    if (difference <= SCROLL_THRESHOLD || isNavigating || isRecentering) return
    isRecentering = false
    // console.log("scrollend", isRecentering)
    recenter()
  }

  const onNavigate = (e: MouseEvent, project: ProjectData) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey) return
    e.preventDefault()
    const target = e.currentTarget as HTMLElement

    const index = getAllRows().findIndex(child =>
      Array.from(child.children).find(anchor => anchor === target),
    )
    centerProjectIndex = index
    isNavigating = true

    const targetRect = target.getBoundingClientRect()
    const scrollDelta =
      targetRect.top - window.innerHeight / 2 + targetRect.height / 2

    if (!scrollContainerRef) return

    scrollTween?.kill()
    scrollTween = gsap.timeline({
      onComplete: () => {
        goto(`/projects/${project.slug.current}/1`, {
          state: { noPreview: true },
        })
      },
    })
    scrollTween.to(scrollContainerRef, {
      scrollTop: scrollContainerRef.scrollTop + scrollDelta,
      duration: ANIMATION_DURATION,
      ease: ANIMATION_EASE,
    })
    scrollTween.to(target.querySelector("h2"), {
      opacity: 0,
      duration: ANIMATION_DURATION,
      ease: ANIMATION_EASE,
      delay: 0.125,
    })

    scrollTween.play()
  }

  onMount(() => {
    tick().then(() => {
      if (!scrollTrackRef || !scrollContainerRef) return
      resizeObserver = new ResizeObserver(() => onObserverResize())
      resizeObserver.observe(scrollTrackRef)
      onObserverResize(true)
      recenter()
      isMounted = true
    })
  })

  onDestroy(() => {
    scrollTween?.kill()
    resizeObserver?.disconnect()
  })
</script>

<div
  class="selected-works__scroll"
  role="region"
  {onscroll}
  {onscrollend}
  onwheel={onuserscroll}
  ontouchmove={onuserscroll}
  bind:this={scrollContainerRef}
  use:scrollend
  style:opacity={isMounted ? 1 : 0}
  style:pointer-events={isNavigating ? "none" : "auto"}
  style:scroll-snap-type={(isRecentering && requiresSoftAdjustment) ||
  isNavigating
    ? "none"
    : `y ${PAGE_SNAP_STRICTNESS}`}
  style:--snap-stop={PAGE_SNAP_STOP}
>
  <div class="selected-works__scroll__track" bind:this={scrollTrackRef}>
    {#each copyIndices as copyIndex, i (copyIndex)}
      <div
        class="selected-works__scroll__segment"
        class:is-selected={i === CENTER_INDEX + 1}
      >
        {#each projects as project, ii (project._id)}
          {@const flatIndex = i * projects.length + ii}
          <SelectedProjectSection
            {project}
            {isSettled}
            isSelected={flatIndex === centerProjectIndex}
            {isNavigating}
            {onNavigate}
          />
        {/each}
      </div>
    {/each}
  </div>
</div>

<svelte:head>
  <title>{getTitle("All Projects")}</title>
</svelte:head>

<style lang="scss">
  @use "$lib/styles/_entry.scss" as *;

  .selected-works__scroll {
    @include fade-in-out;
    @include hide-scrollbars;
    height: 100dvh;
    overflow: hidden auto;
  }

  .selected-works__scroll__track,
  .selected-works__scroll__segment {
    @include flex-column;
  }
</style>
