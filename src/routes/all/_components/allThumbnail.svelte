<script lang="ts">
  import { onDestroy, onMount } from "svelte"
  import type { AllThumbnailData } from "../../_components/types"
  import {
    ANIMATION_DURATION,
    ANIMATION_EASE,
    MAX_FADE_IN_DELAY,
  } from "../../_components/config"
  import gsap from "gsap"
  import type { TimeOut } from "$lib/utils/animation"
  import Media from "$lib/components/media.svelte"

  let {
    mediaData,
    hoverProjectId = $bindable<string | undefined>(),
    tempCopyIndex,
  }: {
    mediaData: AllThumbnailData
    hoverProjectId?: string
    tempCopyIndex: number // TODO
  } = $props()

  const MOUSEOUT_DEBOUNCE_MS = 300

  let mouseoutTimer: TimeOut | undefined
  const { media, thumbnailData } = $derived(mediaData)
  const { anchor, projectId } = $derived(
    thumbnailData || { anchor: undefined, projectId: undefined },
  )

  const copySpecificProjectId = $derived(`${projectId}-${tempCopyIndex}`)

  const clearMouseoutTimer = () => {
    if (mouseoutTimer !== undefined) {
      clearTimeout(mouseoutTimer)
      mouseoutTimer = undefined
    }
  }

  const scheduleHoverClear = () => {
    clearMouseoutTimer()
    mouseoutTimer = setTimeout(() => {
      mouseoutTimer = undefined
      if (!projectId || hoverProjectId === copySpecificProjectId)
        hoverProjectId = undefined
    }, MOUSEOUT_DEBOUNCE_MS)
  }

  onDestroy(clearMouseoutTimer)

  const onmouseover = () => {
    clearMouseoutTimer()
    hoverProjectId = copySpecificProjectId
  }
  const onmouseout = () => {
    if (!projectId || hoverProjectId === copySpecificProjectId)
      scheduleHoverClear()
  }

  let thumbnailRef = $state<HTMLDivElement>()
  onMount(() => {
    if (!thumbnailRef) return
    gsap.to(thumbnailRef, {
      opacity: 1,
      delay: ANIMATION_DURATION + Math.random() * MAX_FADE_IN_DELAY,
      duration: ANIMATION_DURATION,
      ease: ANIMATION_EASE,
    })
  })
</script>

<a
  href={anchor}
  {onmouseover}
  {onmouseout}
  onfocus={onmouseover}
  onblur={onmouseout}
  style:opacity={!hoverProjectId
    ? 1
    : hoverProjectId === copySpecificProjectId
      ? 0.6
      : 1}
>
  <Media
    {media}
    bind:ref={thumbnailRef}
    style="opacity: 0; width: auto;"
    sizeSettings={{
      mobile: { height: 200 * 2 },
      desktop: { height: 300 * 2 },
      largeDesktop: { height: 400 * 2 },
    }}
  />
</a>

<style lang="scss">
  @use "$lib/styles/_entry.scss" as *;

  a {
    height: calc(var(--height) * var(--scaling-factor));

    @include mobile {
      max-height: var(--all-projects-row-height);
    }
  }

  a,
  a:hover {
    padding: 0;
  }

  a {
    @include fade-in-out;
    cursor: pointer;
  }
</style>
