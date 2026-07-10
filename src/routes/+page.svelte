<script lang="ts">
  import { getProjectDisplayTitle, quickArray } from "$lib/utils/common"
  import { getTitle } from "$lib/utils/meta"
  import { onDestroy, onMount, tick } from "svelte"
  import {
    SELECTED_WORKS_INFINITE_SCROLL_COPY_COUNT,
    SELECTED_WORKS_SNAP_STRICTNESS,
    SELECTED_WORKS_SNAP_STOP,
    SELECTED_WORKS_RECENTER_MIN_MULTIPLES,
    SELECTED_WORKS_REQUIRES_SOFT_ADJUSTMENT_THRESHOLD,
    SELECTED_WORKS_EDGE_CUSHION_MULTIPLES,
    SELECTED_WORKS_SCROLL_THRESHOLD,
    SHOULD_BLEND_THRESHOLD,
    CENTER_ADJUST_DELAY_MS,
    ANIMATION_DURATION,
    ANIMATION_EASE,
  } from "./_components/config"
  import SelectedProjectSection from "./_components/selected/selectedProjectSection.svelte"
  import { goto } from "$app/navigation"
  import type { ProjectData } from "$lib/types/sanity"
  import { navigation } from "$lib/state/navigation.svelte"
  import gsap from "gsap"
  import { scrollend } from "$lib/actions/scrollendAction"

  let { data } = $props()

  const projects = $derived(data?.selectedWorks?.projects ?? [])

  const CENTER_INDEX = (SELECTED_WORKS_INFINITE_SCROLL_COPY_COUNT - 1) / 2 + 1
  const copyIndices = quickArray(SELECTED_WORKS_INFINITE_SCROLL_COPY_COUNT)

  let scrollContainerRef = $state<HTMLDivElement>()
  let scrollTrackRef = $state<HTMLDivElement>()
  let scrollSegmentHeight = $state(0)
  let lastScrollTop = $state(0)
  let centerProjectIndex = $state<number>()

  let resizeObserver: ResizeObserver
  let scrollTween: gsap.core.Timeline | undefined
  let centerAdjustTimeout: ReturnType<typeof setTimeout> | undefined
  let centerAdjustTween: gsap.core.Tween | undefined

  let hasInitialized = $state(false)
  let isRecentering = $state(false)
  let isSettled = $state(false)
  let isNavigating = $state(false)
  let isMounted = $state(false)
  let lastOffset = $state(0)
  let requiresSoftAdjustment = $state(false)

  let userHasScrolled = $state(false)

  const getAllRows = () => {
    if (!scrollTrackRef) return []
    return Array.from(scrollTrackRef.children).flatMap(row =>
      Array.from(row.children),
    )
  }

  const getOffset = () => {
    if (centerProjectIndex === undefined) return 0
    const scrollElement = getAllRows()[centerProjectIndex]
    const { top, height } = scrollElement.getBoundingClientRect()
    return Math.ceil(top + height / 2 - window.innerHeight / 2)
  }

  const cancelCenterAdjust = () => {
    if (centerAdjustTimeout) {
      clearTimeout(centerAdjustTimeout)
      centerAdjustTimeout = undefined
    }
    centerAdjustTween?.kill()
    centerAdjustTween = undefined
  }

  const scheduleCenterAdjust = () => {
    cancelCenterAdjust()
    if (!requiresSoftAdjustment) return
    centerAdjustTimeout = setTimeout(() => {
      centerAdjustTimeout = undefined
      if (!scrollContainerRef || userHasScrolled) return

      const centerOffset = getOffset()
      if (Math.abs(centerOffset) <= SHOULD_BLEND_THRESHOLD / 2) return

      centerAdjustTween = gsap.to(scrollContainerRef, {
        scrollTop: scrollContainerRef.scrollTop + centerOffset,
        duration: ANIMATION_DURATION,
        ease: ANIMATION_EASE,
        onComplete: () => {
          centerAdjustTween = undefined
        },
      })
    }, CENTER_ADJUST_DELAY_MS)
  }

  const recenter = () => {
    if (!scrollContainerRef || scrollSegmentHeight <= 0) return

    const offset = scrollContainerRef.scrollTop % scrollSegmentHeight
    const target = CENTER_INDEX * scrollSegmentHeight + offset

    if (
      Math.abs(lastOffset) > SELECTED_WORKS_REQUIRES_SOFT_ADJUSTMENT_THRESHOLD
    )
      requiresSoftAdjustment = true

    const minDelta = SELECTED_WORKS_RECENTER_MIN_MULTIPLES * scrollSegmentHeight
    if (Math.abs(scrollContainerRef.scrollTop - target) < minDelta) return

    isRecentering = true
    userHasScrolled = false

    tick().then(() => {
      if (!scrollContainerRef || userHasScrolled) return
      scrollContainerRef.scrollTop = Math.round(target)
    })

    scheduleCenterAdjust()
  }

  const isNearTrueEdge = () => {
    if (!scrollContainerRef) return false
    const { scrollTop, clientHeight, scrollHeight } = scrollContainerRef
    const maxScrollTop = scrollHeight - clientHeight
    const edgeCushion =
      scrollSegmentHeight * SELECTED_WORKS_EDGE_CUSHION_MULTIPLES
    return scrollTop < edgeCushion || scrollTop > maxScrollTop - edgeCushion
  }

  const shouldHighlightCenter = (index: number) => {
    if (!isRecentering || centerProjectIndex === undefined || isNavigating)
      return false
    const isCenter = Math.floor(index / projects.length) - 1 === CENTER_INDEX
    const isSelected =
      index % projects.length === centerProjectIndex % projects.length
    return isCenter && isSelected
  }

  const onObserverResize = (isInitialResize = false) => {
    if (!scrollContainerRef || !scrollTrackRef) return
    const newSegmentHeight =
      scrollTrackRef.scrollHeight / SELECTED_WORKS_INFINITE_SCROLL_COPY_COUNT
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
      allRows.findIndex(
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
    cancelCenterAdjust()
  }

  const onscroll = () => {
    if (scrollSegmentHeight <= 0 || isNavigating) return
    if (hasInitialized) updateCenterProjectIndex()
    isSettled = false
    userHasScrolled = false
    if (!isRecentering) lastOffset = getOffset()
    if (isNearTrueEdge()) return recenter()
  }

  const onscrollend = () => {
    const difference = updateLastScrollTop()
    isSettled = true
    if (
      Math.abs(difference) <= SELECTED_WORKS_SCROLL_THRESHOLD ||
      isNavigating ||
      isRecentering
    )
      return
    recenter()
  }

  const onNavigate = (e: MouseEvent, project: ProjectData) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey) return
    e.preventDefault()
    const target = e.currentTarget as HTMLElement

    const index = getAllRows().findIndex(child =>
      Array.from(child.children).find(anchor => anchor === target),
    )

    const isCenterProject = index === centerProjectIndex
    centerProjectIndex = index
    isNavigating = true
    isRecentering = true
    navigation.pendingProjectTitle = getProjectDisplayTitle(project)

    if (!scrollContainerRef) return

    scrollTween?.kill()
    scrollTween = gsap.timeline({
      onComplete: () => {
        goto(`/projects/${project.slug.current}/1`, {
          state: { noPreview: true },
        })
      },
    })

    if (!isCenterProject)
      scrollTween.to(scrollContainerRef, {
        scrollTop: scrollContainerRef.scrollTop + getOffset(),
        duration: ANIMATION_DURATION,
        ease: ANIMATION_EASE,
      })

    scrollTween.to(target.querySelectorAll("h2"), {
      opacity: 0,
      duration: 1,
      ease: ANIMATION_EASE,
      delay: isCenterProject ? 0.125 : 0,
    })
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
    cancelCenterAdjust()
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
    : `y ${SELECTED_WORKS_SNAP_STRICTNESS}`}
  style:--snap-stop={SELECTED_WORKS_SNAP_STOP}
>
  <div class="selected-works__scroll__track" bind:this={scrollTrackRef}>
    {#each copyIndices as copyIndex, i (copyIndex)}
      <div class="selected-works__scroll__segment">
        {#each projects as project, ii (project._id)}
          {@const flatIndex = i * projects.length + ii}
          {@const isSelected = flatIndex === centerProjectIndex}
          <SelectedProjectSection
            {project}
            {isSelected}
            {isNavigating}
            {isSettled}
            shouldBlend={(Math.abs(lastOffset) <= SHOULD_BLEND_THRESHOLD &&
              isSelected) ||
              shouldHighlightCenter(flatIndex)}
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
