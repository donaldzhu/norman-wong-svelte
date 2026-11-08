<svg
  height="24px"
  viewBox="0 -960 960 960"
  width="24px"
  fill="#ffffff"
  aria-hidden="true"
>
  <path d="M320-200v-560l440 280-440 280Z" />
</svg>

<style lang="scss">
  svg {
    $size: 60px;
    $max-size: 75%;

    width: $size;
    height: $size;
    max-width: $max-size;
    max-height: $max-size;

    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 999;

    transform: translate(-50%, -50%);
  }
</style>
