<svg
  height="24px"
  viewBox="0 -960 960 960"
  width="24px"
  fill="#ffffff"
  class="play-icon"
>
  <path d="M320-200v-560l440 280-440 280Z" />
</svg>

<style lang="scss">
  @use "$lib/styles/_entry.scss" as *;

  .play-icon {
    $size: 60px;
    $max-size: 75%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: $size;
    height: $size;
    max-width: $max-size;
    max-height: $max-size;
    z-index: 999;
  }
</style>
