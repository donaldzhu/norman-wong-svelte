<script lang="ts">
  import PlayIcon from "$lib/assets/svg/play.svelte"
  import type { SanityVideoObject } from "$lib/types/sanity"
  import { isMobile, Orientation } from "$lib/utils/dom"
  import "@mux/mux-player"
  import { onMount } from "svelte"
  import MuteButton from "./mute.svelte"
  import { isProjectRoute } from "$lib/utils/url"

  let {
    style,
    mediaStyle,
    video,
    orientation,
    ref = $bindable<HTMLVideoElement | null>(),
    isPreview,
    hasMobileMedia,
    isMobileMedia,
    shouldShowMuteButton,
  }: {
    style: string | undefined
    mediaStyle: string | undefined
    video: SanityVideoObject
    orientation: Orientation | undefined
    ref: HTMLVideoElement | null | undefined
    isPreview: boolean | undefined
    hasMobileMedia: boolean | undefined
    isMobileMedia: boolean | undefined
    shouldShowMuteButton: boolean | undefined
  } = $props()

  const asset = $derived(video?.asset)
  const playbackId = $derived(asset?.playbackId)
  const isReady = $derived(asset?.status === "ready")
  const aspectRatio = $derived(asset?.data.aspect_ratio)
  let isMobileViewport = $state<boolean>()
  let isPaused = $state(false)
  let isMuted = $state(true)
  let hasPlayed = $state(false)
  const hasAudio = $derived(asset?.data?.tracks?.some((t) => t.type === "audio"))
  const isProjectPage = $derived(isProjectRoute())
  const shouldShowMuteControl = $derived(
    (shouldShowMuteButton || isProjectPage) && hasAudio,
  )

  onMount(() => {
    isMobileViewport = isMobile()
    if (!ref) return
    if (!isPreview) {
      ref.play().catch((error: Error) => {
        if (error.name === "NotAllowedError") isPaused = true
      })
    }
  })

  $effect(() => {
    if (!ref) return
    if (
      isPreview ||
      (hasMobileMedia &&
        isMobileViewport !== undefined &&
        isMobileViewport !== isMobileMedia)
    )
      ref.pause()
    else ref.play()
  })
</script>

{#if isReady && playbackId}
  <button
    type="button"
    style:--aspect-ratio={aspectRatio?.replace(":", "/")}
    class:video--paused={isPaused}
    class:video--portrait={orientation === Orientation.Portrait}
    class:video--landscape={orientation === Orientation.Landscape}
    class:video--has-mobile-media={hasMobileMedia}
    class:video--mobile-media={isMobileMedia}
    class:video--project-page={isProjectPage}
    aria-label="Play video"
    tabindex={isPaused && !isPreview ? 0 : -1}
    onclick={() => {
      if (isPaused) ref?.play()
    }}
  >
    {#if isPaused && !isPreview}
      <PlayIcon />
    {/if}
    <mux-player
      style:--controls="none"
      style="{style} {mediaStyle}"
      playback-id={playbackId}
      thumbnail-time="0"
      muted={isMuted}
      loop
      playsinline
      autoplay={!isPreview}
      onpause={() => (isPaused = true)}
      onplay={() => {
        isPaused = false
        hasPlayed = true
      }}
      bind:this={ref}
    ></mux-player>
  </button>
  {#if hasPlayed && hasAudio && shouldShowMuteControl}
    <MuteButton bind:isMuted />
  {/if}
{/if}

<svelte:window on:resize={() => (isMobileViewport = isMobile())} />

<style lang="scss">
  @use "$lib/styles/_entry.scss" as *;

  button {
    @include auto-fit-media("video");
    @include demarcate-media("video");
    all: unset;
    width: 100%;
    aspect-ratio: var(--aspect-ratio);

    position: relative;

    display: flex;

    object-fit: cover;
    @include keyboard-focus;

    &.video--project-page {
      pointer-events: all;
    }
  }

  .video--paused {
    cursor: pointer;
  }

  mux-player {
    background-color: $light-gray;
  }
</style>
