<script lang="ts">
  import type { SanityVideoObject } from "$lib/types/sanity"
  import "@mux/mux-player"
  import { onMount } from "svelte"
  import PlayIcon from "$lib/assets/svg/play.svelte"
  import { isMobile, Orientation } from "$lib/utils/dom"

  let {
    video,
    style,
    mediaStyle,
    orientation,
    preview,
    hasMobileMedia,
    isMobileMedia,
    ref = $bindable<HTMLVideoElement | null>(),
  }: {
    video?: SanityVideoObject
    style?: string
    mediaStyle?: string
    orientation?: Orientation
    preview?: boolean
    ref?: HTMLVideoElement | null
    hasMobileMedia?: boolean
    isMobileMedia?: boolean
  } = $props()

  const asset = $derived(video?.asset)
  const playbackId = $derived(asset?.playbackId)
  const isReady = $derived(asset?.status === "ready")
  const aspectRatio = $derived(asset?.data.aspect_ratio)
  let windowIsMobile = $state<boolean>()

  let paused = $state(false)
  const isPreviewSlide = preview

  onMount(() => {
    windowIsMobile = isMobile()
    if (!ref) return
    if (!preview) {
      ref.play().catch((error: Error) => {
        if (error.name === "NotAllowedError") paused = true
      })
    }
  })

  $effect(() => {
    if (!isPreviewSlide || !ref) return
    if (
      preview ||
      (hasMobileMedia &&
        windowIsMobile !== undefined &&
        windowIsMobile !== isMobileMedia)
    )
      ref.pause()
    else ref.play()
  })
</script>

{#if isReady && playbackId}
  <button
    style:--aspect-ratio={aspectRatio?.replace(":", "/")}
    class:video-paused={paused}
    class:portrait={orientation === Orientation.Portrait}
    class:landscape={orientation === Orientation.Landscape}
    class:has-mobile-media={hasMobileMedia}
    class:is-mobile-media={isMobileMedia}
    onclick={() => {
      if (paused) ref?.play()
    }}
  >
    {#if paused && !preview}
      <PlayIcon />
    {/if}
    <mux-player
      style:--controls="none"
      playback-id={playbackId}
      muted
      loop
      playsinline
      autoplay={!preview}
      thumbnail-time="0"
      onpause={() => (paused = true)}
      onplay={() => (paused = false)}
      style="{style} {mediaStyle}"
      bind:this={ref}
    ></mux-player>
  </button>
{/if}

<svelte:window on:resize={() => (windowIsMobile = isMobile())} />

<style lang="scss">
  @use "$lib/styles/_entry.scss" as *;

  button {
    @include auto-fit-media;
    @include demarcate-media;
    all: unset;
    aspect-ratio: var(--aspect-ratio);
    object-fit: cover;
    position: relative;
    display: flex;
  }

  .video-paused {
    cursor: pointer;
  }

  mux-player {
    background-color: $light-gray;
  }
</style>
