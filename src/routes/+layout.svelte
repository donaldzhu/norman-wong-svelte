<script lang="ts">
  import { beforeNavigate } from "$app/navigation"
  import { pageIsProjectPage, pageIsSelectedWorksPage } from "$lib/utils/url.js"
  import "../app.css"
  import Header from "./_components/header/header.svelte"
  import Info from "./_components/header/info.svelte"
  import SelectedProjects from "./_components/selected/selectedProjects.svelte"

  let { children, data } = $props()
  let infoIsVisible = $state(false)
  let selectedWorksKey = $state(Date.now())
  let shouldShowProjectSlide = $derived(
    pageIsSelectedWorksPage() || pageIsProjectPage(),
  )

  beforeNavigate(({ to }) => {
    if (pageIsSelectedWorksPage(to)) selectedWorksKey = Date.now()
  })
</script>

{#if data?.header}
  <Header {data} bind:infoIsVisible />
{/if}

{#if data?.info && infoIsVisible}
  <Info data={data.info} />
{/if}

{#if shouldShowProjectSlide}
  {#key selectedWorksKey}
    <SelectedProjects {data} />
  {/key}
{/if}

{@render children()}
