<script lang="ts">
  import "../app.css"
  import { page } from "$app/state"
  import type { ProjectSlideData } from "$lib/types/sanity"
  import Header from "./_components/header/header.svelte"
  import Info from "./_components/header/info.svelte"
  import ProjectSlide from "./_components/projectSlides/projectSlide.svelte"
  import {
    setSlideContext,
    type SlideContext,
  } from "$lib/context/slideContext.js"

  let { children, data } = $props()
  let infoIsVisible = $state(false)

  const slideContext = $state<SlideContext>({
    slide: undefined,
    autoPlay: true,
  })

  setSlideContext(slideContext)

  const SLIDE_ROUTE = "/projects/[project]/[slide]"

  const pageProject = $derived(
    page.route.id === SLIDE_ROUTE
      ? (page.data as { project: ProjectSlideData }).project
      : undefined,
  )

  const pageSlide = $derived(
    pageProject?.slides[parseInt(page.params.slide ?? "1") - 1],
  )
</script>

{#if data?.header}
  <Header {data} bind:infoIsVisible />
{/if}

{#if data?.info && infoIsVisible}
  <Info data={data.info} />
{/if}

{#if pageSlide}
  <ProjectSlide slide={pageSlide} preview={!slideContext.autoPlay} />
{/if}

{@render children()}

<style lang="scss">
  @use "$lib/styles/_entry.scss" as *;
</style>
