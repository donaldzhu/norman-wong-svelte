<script lang="ts">
  import type {
    AllProjectsThumbnailData,
    ProjectData,
  } from "$lib/types/sanity.js"
  import { isLandscape, vw } from "$lib/utils/common.js"
  import { urlFor } from "$lib/utils/sanity.js"
  import _ from "lodash"
  import { onMount } from "svelte"
  import {
    baseSizes,
    MAX_GAP_VW,
    MIN_GAP_VW,
    THUMB_IN_FRAME,
    thumbnailRatios,
  } from "./configs"

  const { project }: { project: ProjectData } = $props()
  const { _id, title, subtitle, thumbnails } = $derived(project)

  let scalingFactor = $state(1)
  let gap = $state(100)
  let isMounted = $state(false)

  const getDimensions = (thumbnail: AllProjectsThumbnailData) => {
    if (!isMounted) return { width: 0, height: 0 }
    const { aspectRatio } = thumbnail.image.asset.metadata.dimensions
    const landscapeWidth =
      baseSizes.landscape * thumbnailRatios.landscape[thumbnail.desktopSize]
    const landscapeHeight = landscapeWidth / aspectRatio
    const portraitHeight =
      baseSizes.portrait * thumbnailRatios.portrait[thumbnail.desktopSize]
    const portraitWidth = portraitHeight * aspectRatio
    return {
      width: isLandscape(aspectRatio)
        ? landscapeWidth * scalingFactor
        : portraitWidth * scalingFactor,
      height: isLandscape(aspectRatio)
        ? landscapeHeight * scalingFactor
        : portraitHeight * scalingFactor,
    }
  }

  onMount(() => {
    isMounted = true
    const allImageWidths = project.thumbnails
      .slice(0, THUMB_IN_FRAME)
      .reduce(
        (totalWidth: number, thumbnail: AllProjectsThumbnailData) =>
          totalWidth + getDimensions(thumbnail).width,
        0,
      )
    const remainingGap = (vw() - allImageWidths) / (THUMB_IN_FRAME - 1)
    const minGap = vw(MIN_GAP_VW)
    const maxGap = vw(MAX_GAP_VW)

    if (remainingGap < minGap) scalingFactor = minGap / remainingGap
    else if (remainingGap > maxGap) scalingFactor = remainingGap / maxGap
    gap = _.clamp(remainingGap, minGap, maxGap)
  })

  const getThumbnailAnchor = (thumbnail: AllProjectsThumbnailData) => {
    const id = thumbnail.image.asset._id
    const slideIndex = project.slideMediaIds.findIndex(ids => ids.includes(id))
    return `projects/${project.slug.current}/${slideIndex + 1}`
  }
</script>

<section
  class="all-projects__section"
  style:--scaling-factor={scalingFactor}
  style:--gap="{gap}px"
  style:--min-gap-vw={MIN_GAP_VW}
  style:--max-gap-vw={MAX_GAP_VW}
>
  <h2>
    {title}{#if subtitle}, <i>{subtitle}</i>{/if}
  </h2>
  <div class="all-projects__thumbnail-container">
    {#each thumbnails ?? [] as thumbnail, index (`${_id}-${index}`)}
      {#if thumbnail.type === "image" && thumbnail.image}
        <a href={getThumbnailAnchor(thumbnail)}>
          <img
            class="desktop-size-{thumbnail.desktopSize} mobile-size-{thumbnail.mobileSize} {isLandscape(
              thumbnail.image.asset?.metadata?.dimensions?.aspectRatio,
            )
              ? 'landscape'
              : 'portrait'}"
            src={urlFor(thumbnail.image)}
            alt={thumbnail.image.asset?.altText}
            width={isMounted ? getDimensions(thumbnail).width : "auto"}
            height={isMounted ? getDimensions(thumbnail).height : "auto"}
            style:opacity={isMounted ? 1 : 0}
          />
        </a>
      {/if}
    {/each}
  </div>
</section>

<style lang="scss">
  @use "$lib/styles/_entry.scss" as *;

  section {
    @include flex-column;
    gap: var(--all-projects-inner-gap);
  }

  h2 {
    @include serif;
    font-size: var(--all-projects-font-size);
    line-height: 0.9;
  }

  .all-projects__thumbnail-container {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--gap);
    width: 100vw;
  }

  img {
    display: flex;
    transition: opacity 0.3s ease-in-out;
  }
</style>
