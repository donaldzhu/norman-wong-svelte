<script lang="ts">
  import type { HeaderData } from "$lib/types/sanity"

  import { page } from "$app/state"
  import { Device } from "$lib/utils/dom"

  let {
    data,
    infoIsVisible = $bindable(),
  }: { data: HeaderData; infoIsVisible: boolean } = $props()

  const onLinkClick = () => (infoIsVisible = false)

  const getCopy = (device: Device) => {
    return {
      name:
        device === Device.Mobile
          ? data.nameDisplayTextMobile
          : data.nameDisplayTextDesktop,
      selectedWorks:
        device === Device.Mobile
          ? data.selectedWorksDisplayTextMobile
          : data.selectedWorksDisplayTextDesktop,
      allProjects:
        device === Device.Mobile
          ? data.allProjectsDisplayTextMobile
          : data.allProjectsDisplayTextDesktop,
      information:
        device === Device.Mobile
          ? data.informationDisplayTextMobile
          : data.informationDisplayTextDesktop,
    }
  }

  const ALL_PROJECTS_LINK = "/all"
  const SELECTED_WORKS_LINK = "/selected"

  const getLinks = (device: Device) => {
    return {
      [getCopy(device).allProjects]: ALL_PROJECTS_LINK,
      [getCopy(device).selectedWorks]: SELECTED_WORKS_LINK,
    }
  }

  const onInfoClick = () => {
    infoIsVisible = !infoIsVisible
    document.documentElement.style.overflow = infoIsVisible ? "hidden" : "auto"
  }
</script>

{#each [Device.Mobile, Device.Desktop] as device}
  <header
    class:info-visible={infoIsVisible}
    class:mobile={device === Device.Mobile}
  >
    {#if device === Device.Desktop}
      <a href={ALL_PROJECTS_LINK}>
        <h1>{getCopy(device).name}</h1>
      </a>
    {/if}
    <nav>
      <ul>
        {#if device !== Device.Desktop}
          <li>
            <a href={ALL_PROJECTS_LINK}>
              <h1>{getCopy(device).name}</h1>
            </a>
          </li>
        {/if}
        {#each Object.entries(getLinks(device)) as [text, href]}
          <li>
            <a
              class:active={page.url.pathname === href && !infoIsVisible}
              {href}
              onclick={onLinkClick}>{text}</a
            >
          </li>
        {/each}
        {#if device !== Device.Desktop}
          <li>
            <button onclick={onInfoClick} class:active={infoIsVisible}>
              {getCopy(device).information}
            </button>
          </li>
        {/if}
      </ul>
    </nav>
    {#if device === Device.Desktop}
      <button onclick={onInfoClick} class:active={infoIsVisible}>
        {getCopy(device).information}
      </button>
    {/if}
  </header>
{/each}

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

    @include mobile {
      display: none;
    }

    &.mobile {
      display: none;
      @include mobile {
        display: flex;
      }
    }

    > * {
      position: relative;
    }

    > a {
      left: calc(-1 * var(--button-padding));
    }

    > button {
      left: var(--button-padding);
    }
  }

  h1,
  a,
  button {
    @include ui;
  }

  h1,
  li {
    width: fit-content;
  }

  ul {
    list-style: none;
    gap: var(--header-spacing);
    padding: 0;
    margin: 0;

    @include mobile {
      width: 100%;
      display: flex;
      justify-content: space-between;
    }
  }

  nav {
    @include mobile {
      width: 100%;
    }
  }

  li {
    @include mobile {
      display: flex;
    }
  }

  a,
  button {
    @include mobile {
      padding: 0;
    }

    &.active {
      color: $gray;
    }
  }
</style>
