<script lang="ts">
  import { fade } from "svelte/transition"
  import { FADE_DURATION_MS } from "../../routes/_components/config"

  let {
    muted = $bindable(),
  }: {
    muted: boolean
  } = $props()
</script>

<div in:fade={{ duration: FADE_DURATION_MS }}>
  <button onclick={() => (muted = true)} class:active={muted}> MUTE </button>
  /
  <button onclick={() => (muted = false)} class:active={!muted}>
    UNMUTE
  </button>
</div>

<style lang="scss">
  @use "$lib/styles/_entry.scss" as *;

  div {
    @include flex;
    @include ui;
    gap: var(--text-button-gap);
    position: absolute;

    --offset: 1em;
    top: calc(100% + var(--offset));
    left: 0;
    z-index: 999999;
    pointer-events: all;
  }

  button {
    @include text-button;
  }
</style>
