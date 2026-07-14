<script lang="ts">
  import { goto } from "$app/navigation"
  import type { ProjectSlideData } from "$lib/types/sanity"
  import { wrap } from "$lib/utils/common"
  import ProjectSlide from "../../../_components/projectSlides/projectSlide.svelte"

  let {
    data,
    params,
  }: {
    data: { project: ProjectSlideData }
    params: { project: string; slide: string }
  } = $props()

  const { project: projectSlug, slide: slideNumber } = $derived(params)
  const { slides } = $derived(data.project)
  const slide = $derived(slides[parseInt(slideNumber) - 1])

  const onclick = (increment: 1 | -1) => {
    if (slides.length === 1) return
    const newSlideNumber = parseInt(slideNumber) + increment
    goto(`/projects/${projectSlug}/${wrap(newSlideNumber, 1, slides.length)}`)
  }

  const onkeydown = ({ key }: KeyboardEvent) => {
    if (key === "ArrowRight") onclick(1)
    else if (key === "ArrowLeft") onclick(-1)
  }
</script>

{#if slideNumber !== "1"}
  <ProjectSlide {slide} isProjectPage />
{/if}
{#if slides.length > 1}
  <div
    class="project-slide__button project-slide__button--previous"
    onclick={() => onclick(-1)}
    aria-label="Previous slide"
  ></div>
  <div
    class="project-slide__button project-slide__button--next"
    onclick={() => onclick(1)}
    aria-label="Next slide"
  ></div>
{/if}

<svelte:window on:keydown={onkeydown} />

<style lang="scss">
  @use "$lib/styles/_entry.scss" as *;

  .project-slide__button {
    all: unset;
    position: fixed;
    width: 35vw;
    height: 100dvh;
    cursor: pointer;
    z-index: 99;
    pointer-events: all;
    top: 0;

    &--previous {
      left: 0;
    }

    &--next {
      right: 0;
    }
  }
</style>
