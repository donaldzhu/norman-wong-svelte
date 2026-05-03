<script lang="ts">
  import type { InfoData } from "$lib/types/sanity"

  let { data }: { data: InfoData } = $props()
</script>

<div class="info-container">
  {#each data.contacts as contact}
    <div class="contact-container">
      <h3>{contact.displayName}</h3>
      <p>{contact.email}</p>
      <p>{contact.phone}</p>
    </div>
  {/each}
</div>

<style lang="scss">
  @use "$lib/styles/_entry.scss" as *;

  .info-container {
    @include fullscreen;
    background-color: black;
    color: white;
    @include serif;
    font-size: var(--info-font-size);
    @include flex-column;
    gap: 1em;
  }

  .contact-container {
    @include flex-column;
  }

  h3,
  p {
    line-height: 1em;
  }
</style>
