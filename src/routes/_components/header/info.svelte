<script lang="ts">
  import type { InfoData } from "$lib/types/sanity"

  let { data }: { data: InfoData } = $props()
</script>

<div class="information">
  {#each data.contacts as contact}
    <div class="information__contact">
      <h3>{contact.displayName}</h3>
      {#if contact.email}
        <a href={`mailto:${contact.email}`}>{contact.email}</a>
      {/if}
      {#if contact.phone}
        <p>{contact.phone}</p>
      {/if}
    </div>
  {/each}
</div>

<style lang="scss">
  @use "$lib/styles/_entry.scss" as *;

  .information {
    @include fullscreen;

    z-index: 9999999;

    @include flex-column;
    gap: 1em;

    @include serif;
    color: white;
    font-size: var(--info-font-size);

    background-color: black;
  }

  .information__contact {
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
