<script lang="ts">
  import PlayIcon from "$lib/assets/svg/play.svelte"
  import type { SanityVideoObject } from "$lib/types/sanity"
  import { isMobile, Orientation } from "$lib/utils/dom"
  import "@mux/mux-player"
  import { onMount } from "svelte"
  import MuteButton from "./mute.svelte"
  import { pageIsProjectPage } from "$lib/utils/url"

  let {
    video,
    style,
    mediaStyle,
    orientation,
    preview,
    hasMobileMedia,
    isMobileMedia,
    showMuteButton,
    ref = $bindable<HTMLVideoElement | null>(),
  }: {
    video?: SanityVideoObject
    style?: string
    mediaStyle?: string
    orientation?: Orientation
    preview?: boolean
    hasMobileMedia?: boolean
    isMobileMedia?: boolean
    showMuteButton?: boolean
    ref?: HTMLVideoElement | null
  } = $props()

  const asset = $derived(video?.asset)
  const playbackId = $derived(asset?.playbackId)
  const isReady = $derived(asset?.status === "ready")
  const aspectRatio = $derived(asset?.data.aspect_ratio)
  let windowIsMobile = $state<boolean>()
  let paused = $state(false)
  let muted = $state(true)
  let hasPlayed = $state(false)
  let hasAudio = $derived(asset?.data?.tracks?.some(t => t.type === "audio"))
  let isProjectPage = $derived(pageIsProjectPage())
  let shouldShowMuteButton = $derived(
    (showMuteButton || isProjectPage) && hasAudio,
  )

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
    if (!ref) return
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
    class="video"
    style:--aspect-ratio={aspectRatio?.replace(":", "/")}
    class:video-paused={paused}
    class:portrait={orientation === Orientation.Portrait}
    class:landscape={orientation === Orientation.Landscape}
    class:has-mobile-media={hasMobileMedia}
    class:is-mobile-media={isMobileMedia}
    class:is-project-page={isProjectPage}
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
      {muted}
      loop
      playsinline
      autoplay={!preview}
      thumbnail-time="0"
      onpause={() => (paused = true)}
      onplay={() => {
        paused = false
        hasPlayed = true
      }}
      style="{style} {mediaStyle}"
      bind:this={ref}
    ></mux-player>
  </button>
  {#if hasPlayed && hasAudio && shouldShowMuteButton}
    <MuteButton bind:muted />
  {/if}
{/if}

<svelte:window on:resize={() => (windowIsMobile = isMobile())} />

<style lang="scss">
  @use "$lib/styles/_entry.scss" as *;

  .video {
    @include auto-fit-media;
    @include demarcate-media;
    all: unset;
    display: flex;
    aspect-ratio: var(--aspect-ratio);
    object-fit: cover;
    position: relative;
    &.is-project-page {
      pointer-events: all;
    }
  }

  .video-paused {
    cursor: pointer;
  }

  mux-player {
    background-color: $light-gray;
  }
</style>
