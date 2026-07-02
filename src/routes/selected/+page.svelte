<script lang="ts">
  import { quickArray } from "$lib/utils/common"
  import { getTitle } from "$lib/utils/meta.js"
  import { onDestroy, onMount, tick } from "svelte"
  import {
    PAGE_INFINITE_SCROLL_COPY_COUNT,
    PAGE_INFINITE_SCROLL_SETTLE_MS,
    PAGE_SNAP_STRICTNESS,
    PAGE_SNAP_STOP,
  } from "./_components/configs"
  import SelectedProjectSection from "./_components/selectedProjectSection.svelte"
  import { goto } from "$app/navigation"
  import type { ProjectData } from "$lib/types/sanity.js"
  import gsap from "gsap"
  import { ANIMATION_DURATION, ANIMATION_EASE } from "../_components/config.js"

  let { data } = $props()

  const projects = $derived(data?.selectedWorks?.projects ?? [])

  const CENTER_INDEX = (PAGE_INFINITE_SCROLL_COPY_COUNT - 1) / 2
  const copyIndices = quickArray(PAGE_INFINITE_SCROLL_COPY_COUNT)

  let scrollContainerRef = $state<HTMLDivElement>()
  let scrollTrackRef = $state<HTMLDivElement>()
  let scrollSegmentHeight = $state(0)

  let resizeObserver: ResizeObserver
  let settleTimer: ReturnType<typeof setTimeout> | undefined
  let scrollTween: gsap.core.Timeline | undefined

  let centerProjectIndex = $state<number>()
  let hasAdjustedScroll = $state(false)
  let isRecentering = $state(false)
  let isMounted = $state(false)
  let isNavigating = $state(false)

  const getSegmentHeight = () =>
    !scrollTrackRef
      ? 0
      : scrollTrackRef.scrollHeight / PAGE_INFINITE_SCROLL_COPY_COUNT

  const recenter = () => {
    if (!scrollContainerRef || scrollSegmentHeight <= 0) return
    isRecentering = true
    clearSettleTimer()

    const offset = scrollContainerRef.scrollTop % scrollSegmentHeight
    const target = CENTER_INDEX * scrollSegmentHeight + offset
    const MIN_DELTA = 100
    if (Math.abs(scrollContainerRef.scrollTop - target) >= MIN_DELTA)
      scrollContainerRef.scrollTop = target
  }

  const clearSettleTimer = () => {
    if (settleTimer) clearTimeout(settleTimer)
    settleTimer = undefined
  }

  const scheduleSettleRecenter = () => {
    clearSettleTimer()
    settleTimer = setTimeout(recenter, PAGE_INFINITE_SCROLL_SETTLE_MS)
  }

  const isNearTrueEdge = () => {
    if (!scrollContainerRef || scrollSegmentHeight <= 0) return false
    const { scrollTop, clientHeight, scrollHeight } = scrollContainerRef
    const maxScrollTop = scrollHeight - clientHeight
    const edgeCushion = scrollSegmentHeight * 3
    return scrollTop < edgeCushion || scrollTop > maxScrollTop - edgeCushion
  }

  const onObserverResize = (isInitialResize = false) => {
    if (!scrollContainerRef || !scrollTrackRef) return
    const newSegmentHeight = getSegmentHeight()
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

  const getAllRows = () => {
    if (!scrollTrackRef) return []
    return Array.from(scrollTrackRef.children).flatMap(row =>
      Array.from(row.children),
    )
  }

  const updateCenterProjectIndex = () => {
    if (!scrollTrackRef || scrollSegmentHeight <= 0 || isNavigating) return
    const allRows = getAllRows()
    centerProjectIndex =
      Array.from(allRows).findIndex(
        child => child.getBoundingClientRect().top > window.innerHeight / 2,
      ) - 1
  }

  const onscroll = () => {
    if (scrollSegmentHeight <= 0 || isNavigating) return

    if (hasAdjustedScroll) updateCenterProjectIndex()
    else if (isRecentering) hasAdjustedScroll = true
    if (isRecentering) return (isRecentering = false)

    if (isNearTrueEdge()) return recenter()
    scheduleSettleRecenter()
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
      isMounted = true
    })
  })

  onDestroy(() => {
    scrollTween?.kill()
    clearSettleTimer()
    resizeObserver?.disconnect()
  })
</script>

<div
  class="selected-works__scroll"
  bind:this={scrollContainerRef}
  role="region"
  aria-label="Selected works"
  {onscroll}
  style:opacity={isMounted ? 1 : 0}
  style:pointer-events={isNavigating ? "none" : "auto"}
  style:scroll-snap-type="y {PAGE_SNAP_STRICTNESS}"
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

  .selected-works__scroll__segment {
    @include selected-project-title-passthrough;
  }
</style>
