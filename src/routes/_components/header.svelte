<script lang="ts">
  import type { HeaderData, SanityData } from "$lib/types/sanity"

  import { page } from "$app/state"
  import { Device } from "$lib/utils/dom"

  let {
    data,
    infoIsVisible = $bindable(),
  }: { data: SanityData; infoIsVisible: boolean } = $props()

  const onLinkClick = () => (infoIsVisible = false)
  const headerData = $derived(data.header)
  const {
    nameDisplayTextDesktop,
    nameDisplayTextMobile,
    selectedWorksDisplayTextDesktop,
    selectedWorksDisplayTextMobile,
    allProjectsDisplayTextDesktop,
    allProjectsDisplayTextMobile,
    informationDisplayTextDesktop,
    informationDisplayTextMobile,
  } = $derived(headerData)

  const getCurrentProject = () => {
    const projectSlug = page.url.pathname.split("/")[2]
    if (!projectSlug) return null

    const project = data.allProjects.projects.find(
      project => project.project.slug.current === projectSlug,
    )?.project
    return project
      ? `${project.title}${project.subtitle ? `, ${project.subtitle}` : ""}`
      : null
  }

  const currentProject = $derived(getCurrentProject())

  // TODO
  const getCopy = (device: Device) => {
    return {
      name:
        device === Device.Mobile
          ? nameDisplayTextMobile
          : nameDisplayTextDesktop,
      selectedWorks:
        device === Device.Mobile
          ? selectedWorksDisplayTextMobile
          : selectedWorksDisplayTextDesktop,
      allProjects:
        device === Device.Mobile
          ? allProjectsDisplayTextMobile
          : allProjectsDisplayTextDesktop,
      information:
        device === Device.Mobile
          ? informationDisplayTextMobile
          : informationDisplayTextDesktop,
    }
  }

  const SELECTED_WORKS_LINK = "/selected"
  const ALL_PROJECTS_LINK = "/all"

  const getLinks = (device: Device) => {
    return {
      [getCopy(device).selectedWorks]: SELECTED_WORKS_LINK,
      [getCopy(device).allProjects]: ALL_PROJECTS_LINK,
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
    <nav>
      <div class="header__primary-links">
        {#each Object.entries(getLinks(device)) as [text, href], index}
          <a
            class:active={page.url.pathname === href && !infoIsVisible}
            {href}
            onclick={onLinkClick}>{text}</a
          >
          {#if index < Object.entries(getLinks(device)).length - 1}
            <span>/</span>
          {/if}
        {/each}
      </div>
      {#if currentProject}
        <div class="header__current-project">
          <span>/</span>
          <a href={page.url.pathname} class="active">{currentProject}</a>
        </div>
      {/if}
    </nav>
    <button onclick={onInfoClick} class:active={infoIsVisible}>
      {getCopy(device).information}
    </button>
  </header>
{/each}

<style lang="scss">
  @use "$lib/styles/_entry.scss" as *;

  header {
    @include fullscreen;
    @include ui;
    height: initial;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: var(--y-margin-top) var(--x-margin) 0;
    box-sizing: border-box;
    z-index: 99999;

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
  }

  h1,
  a,
  button {
    @include ui;
  }

  h1 {
    width: fit-content;
  }

  nav,
  .header__primary-links {
    @include flex;
    align-items: flex-start;
    gap: var(--header-spacing);
  }

  nav {
    @include mobile {
      flex-direction: column;
      gap: 0;
    }
  }

  .header__current-project {
    @include mobile {
      display: block;
      span {
        display: none;
      }

      a {
        pointer-events: none;
      }
    }
  }

  a,
  button {
    padding: calc(0.5 * var(--button-padding));
    margin: calc(-0.5 * var(--button-padding));
    &.active {
      color: $gray;
    }
  }
</style>
