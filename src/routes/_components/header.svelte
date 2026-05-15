<script lang="ts">
  import type { HeaderData } from "$lib/types/sanity"

  import { page } from "$app/state"

  let {
    data,
    infoIsVisible = $bindable(),
  }: { data: HeaderData; infoIsVisible: boolean } = $props()

  const links = {
    [data.selectedWorksDisplayText]: "/",
    [data.allProjectsDisplayText]: "/all",
  }

  const onclick = () => (infoIsVisible = false)
</script>

<header class:info-visible={infoIsVisible}>
  <h1>{data.nameDisplayText}</h1>
  <nav>
    <ul>
      {#each Object.entries(links) as [text, href]}
        <li>
          <a class:active={page.url.pathname === href} {href} {onclick}
            >{text}</a
          >
        </li>
      {/each}
    </ul>
  </nav>
  <button onclick={() => (infoIsVisible = !infoIsVisible)}>
    {data.informationDisplayText}
  </button>
</header>

<style lang="scss">
  @use "$lib/styles/_entry.scss" as *;

  header {
    @include fullscreen;
    height: initial;
    justify-content: space-between;
    padding: var(--y-margin-top) var(--x-margin) 0;
    box-sizing: border-box;
    z-index: 999;

    &,
    ul {
      display: flex;
      align-items: center;
    }

    &.info-visible {
      color: white;
    }
  }

  h1,
  a,
  button {
    @include ui;
  }

  ul {
    list-style: none;
    gap: var(--header-spacing);
  }

  a.active {
    color: #{$gray};
  }
</style>
