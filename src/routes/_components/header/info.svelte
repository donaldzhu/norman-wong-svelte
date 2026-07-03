<script lang="ts">
  import type { InfoData } from "$lib/types/sanity"

  let { data }: { data: InfoData } = $props()
</script>

<div class="info-container">
  {#each data.contacts as contact}
    <div class="contact-container">
      <h3>{contact.displayName}</h3>
      <a href={`mailto:${contact.email}`}>{contact.email}</a>
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
    z-index: 9999;
  }

  .contact-container {
    @include flex-column;
  }

  h3,
  a,
  p {
    padding: 0;
    line-height: 1em;

    @include mobile {
      line-height: 1.05em;
    }
  }
</style>
