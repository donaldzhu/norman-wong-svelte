<script lang="ts">
  import type { SanityVideoObject } from "$lib/types/sanity"
  import "@mux/mux-player"
  import { onMount } from "svelte"
  import PlayIcon from "$lib/assets/svg/play.svelte"

  let {
    video,
    style,
    ref = $bindable<HTMLVideoElement | null>(),
  }: {
    video?: SanityVideoObject
    style?: string
    ref?: HTMLVideoElement | null
  } = $props()

  const asset = $derived(video?.asset)
  const playbackId = $derived(asset?.playbackId)
  const isReady = $derived(asset?.status === "ready")
  const aspectRatio = $derived(asset?.data.aspect_ratio)

  let paused = $state(false)

  onMount(() => {
    if (!ref) return
    ref.play().catch((error: Error) => {
      if (error.name === "NotAllowedError") paused = true
    })
  })
</script>

{#if isReady && playbackId}
  <button
    style:--aspect-ratio={aspectRatio?.replace(":", "/")}
    class:video-paused={paused}
    onclick={() => {
      if (paused) ref?.play()
    }}
  >
    {#if paused}
      <PlayIcon />
    {/if}
    <mux-player
      style:--controls="none"
      playback-id={playbackId}
      muted
      loop
      playsinline
      autoplay
      thumbnail-time="0"
      onpause={() => (paused = true)}
      onplay={() => (paused = false)}
      {style}
      bind:this={ref}
    ></mux-player>
  </button>
{/if}

<style lang="scss">
  @use "$lib/styles/_entry.scss" as *;

  button {
    all: unset;
    aspect-ratio: var(--aspect-ratio);
    object-fit: cover;
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
  }

  .video-paused {
    cursor: pointer;
  }

  mux-player {
    background-color: $light-gray;
  }
</style>
