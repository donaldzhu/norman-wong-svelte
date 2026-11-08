<script lang="ts">
  import { fade } from "svelte/transition"
  import { FADE_DURATION_MS } from "../../routes/_components/config"

  let {
    isMuted = $bindable(),
  }: {
    isMuted: boolean
  } = $props()
</script>

<div in:fade={{ duration: FADE_DURATION_MS }}>
  <button
    class:mute__button--active={isMuted}
    aria-pressed={isMuted}
    onclick={() => (isMuted = true)}
  >
    MUTE
  </button>
  /
  <button
    class:mute__button--active={!isMuted}
    aria-pressed={!isMuted}
    onclick={() => (isMuted = false)}
  >
    UNMUTE
  </button>
</div>

<style lang="scss">
  @use "$lib/styles/_entry.scss" as *;

  div {
    --offset: 1em;

    position: absolute;
    top: calc(100% + var(--offset));
    left: 0;
    z-index: 999999;

    @include flex;
    gap: var(--text-button-gap);

    @include ui;

    pointer-events: all;
  }

  button {
    @include text-button(".mute__button--active");
  }
</style>
