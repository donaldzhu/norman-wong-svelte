<script lang="ts">
  import { onDestroy, onMount } from "svelte"
  import type { SelectedThumbnailData } from "./types"
  import { FADE_DURATION, FADE_EASE, MAX_FADE_IN_DELAY } from "./config"
  import gsap from "gsap"
  import type { TimeOut } from "$lib/utils/animation"

  let {
    mediaData,
    hoverProjectId = $bindable<string | undefined>(),
    tempCopyIndex,
  }: {
    mediaData: SelectedThumbnailData
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

  let thumbnailRef = $state<HTMLImageElement>()
  onMount(() => {
    if (!thumbnailRef) return
    gsap.to(thumbnailRef, {
      opacity: 1,
      delay: FADE_DURATION + Math.random() * MAX_FADE_IN_DELAY,
      duration: FADE_DURATION,
      ease: FADE_EASE,
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
      ? 1
      : 0.6}
>
  <img
    src={media.image.asset.url}
    alt={media.image.asset.altText}
    bind:this={thumbnailRef}
    style:opacity={0}
  />
</a>

<style lang="scss">
  @use "$lib/styles/_entry.scss" as *;

  img {
    height: var(--height);
  }

  a,
  a:hover {
    padding: 0;
  }

  a {
    cursor: pointer;
    transition: opacity $fade-duration ease-in-out;
  }
</style>
