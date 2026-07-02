<script>
  import { page } from "$app/state"
</script>

<div>
  {#if page.status === 404}
    <h2>404 - Page Not Found</h2>
  {:else}
    <h1>Error {page.status}</h1>
  {/if}
</div>

<style lang="scss">
  @import "$lib/styles/_entry.scss";

  div {
    @include flex;
    @include fullscreen;
  }

  h2 {
    @include serif;
    font-size: var(--selected-works-font-size);
  }
</style>
