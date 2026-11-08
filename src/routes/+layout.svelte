<script lang="ts">
  import { page } from "$app/state"
  import { beforeNavigate } from "$app/navigation"
  import { isProjectRoute, isSelectedWorksRoute } from "$lib/utils/url.js"
  import "../app.css"
  import Header from "./_components/header/header.svelte"
  import Info from "./_components/header/info.svelte"
  import SelectedProjects from "./_components/selected/selectedProjects.svelte"

  let { data, children } = $props()
  let isInfoVisible = $state(false)
  let selectedWorksKey = $state(Date.now())
  const shouldShowProjectSlide = $derived(
    isSelectedWorksRoute() ||
      (isProjectRoute() &&
        (data?.selectedWorks?.projects ?? []).some(
          (project) => project?.slug?.current === page.params.project,
        )),
  )

  beforeNavigate(({ to }) => {
    if (isSelectedWorksRoute(to)) selectedWorksKey = Date.now()
  })
</script>

{#if data?.header}
  <Header {data} bind:isInfoVisible />
{/if}

{#if data?.info && isInfoVisible}
  <Info data={data.info} />
{/if}

<div style:display="contents" inert={isInfoVisible}>
  {#if shouldShowProjectSlide}
    {#key selectedWorksKey}
      <SelectedProjects {data} />
    {/key}
  {/if}

  {@render children()}
</div>
