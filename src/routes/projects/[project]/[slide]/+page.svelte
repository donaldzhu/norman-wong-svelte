<script lang="ts">
  import { goto } from "$app/navigation"
  import type { ProjectSlideData } from "$lib/types/sanity"
  import { wrap } from "$lib/utils/common"
  import _ from "lodash"
  import ProjectSlideMedia from "./_components/projectSlideMedia.svelte"

  let {
    data,
    params,
  }: {
    data: { project: ProjectSlideData }
    params: { project: string; slide: string }
  } = $props()

  const { project: projectSlug, slide: slideNumber } = $derived(params)
  const { title, subtitle } = $derived(data.project)
  const { slides } = $derived(data.project)
  const slide = $derived(slides[parseInt(slideNumber) - 1])

  const onclick = (increment: 1 | -1) => {
    const newSlideNumber = parseInt(slideNumber) + increment
    goto(`/projects/${projectSlug}/${wrap(newSlideNumber, 1, slides.length)}`)
  }

  const onkeydown = ({ key }: KeyboardEvent) => {
    if (key === "ArrowRight") onclick(1)
    else if (key === "ArrowLeft") onclick(-1)
  }
</script>

<div class="project-slide">
  <button
    class="project-slide__button project-slide__button--previous"
    onclick={() => onclick(-1)}
    aria-label="Previous slide"
  ></button>
  <button
    class="project-slide__button project-slide__button--next"
    onclick={() => onclick(1)}
    aria-label="Next slide"
  ></button>
  <div class="project-slide__media-container">
    {#each slide.media as media (media.image.asset._id)}
      <ProjectSlideMedia {media} />
    {/each}
  </div>
  <div class="project-slide__info">
    <h2>
      {title}{#if subtitle}, {subtitle}{/if}
      {#if slide.description || slide.year}
        <span> — </span>
      {/if}
      {#if slide.description}
        <span>
          {slide.description}{#if slide.year}<span>, </span>
          {/if}
        </span>
      {/if}
      {#if slide.year}
        <span>
          {slide.year}
        </span>
      {/if}
    </h2>
    <div>
      {slideNumber} of {slides.length}
    </div>
  </div>
</div>
<svelte:window on:keydown={onkeydown} />

<style lang="scss">
  @use "$lib/styles/_entry.scss" as *;

  .project-slide {
    @include fullscreen;
    @include flex-column;
  }

  .project-slide__button {
    all: unset;
    position: fixed;
    width: 35vw;
    height: 100dvh;
    cursor: pointer;

    &--previous {
      left: 0;
    }

    &--next {
      right: 0;
    }
  }

  .project-slide__media-container {
    display: grid;
    grid-template-columns: repeat(24, 1fr);
    align-items: center;
    gap: var(--project-slide-gap);
  }

  .project-slide__info {
    @include flex-column;
    @include ui;
    position: fixed;
    bottom: 0;
    width: 100vw;
    box-sizing: border-box;
    margin: var(--page-spacing-top) var(--x-margin) var(--y-margin-bottom);
  }
</style>
