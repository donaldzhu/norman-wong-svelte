import type { AllProjectsProjectData, AllProjectsMediaData } from '$lib/types/sanity'

export const effectiveIndexRows = (saved: number[] | undefined, count: number, min: number, max: number) => {
  const rows: number[] = []
  let capacity = 0
  while (capacity < count) {
    const value = saved?.[rows.length]
    const width = typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max ? value : min
    rows.push(width)
    capacity += width
  }
  return rows
}

const assetId = (media: AllProjectsMediaData) => media.mediaType === 'image' ? media.image?.asset?._id :
  media.mediaType === 'video' ? media.video?.asset?._id : undefined

export const resolveIndexEntries = (entries: AllProjectsProjectData[] = []) => entries.flatMap((entry, entryIndex) => {
  const project = entry.project
  if (!project) return []
  const isAutomatic = entry.includeAllMedia === true
  const occurrences = isAutomatic
    ? (entry.sourceSlides ?? []).flatMap((slide, slideIndex) => (slide.media ?? []).map((media, mediaIndex) => ({
      media: { ...media, mobileImage: undefined, mobileVideo: undefined, hideOnMobile: false },
      slideNumber: slideIndex + 1,
      key: JSON.stringify([entry._key ?? entryIndex, slide._key ?? slideIndex, media._key ?? mediaIndex]),
    })))
    : (entry.media ?? []).map((media, mediaIndex) => ({
      media,
      slideNumber: (project.slideMediaIds ?? []).findIndex(ids => ids?.includes(assetId(media) ?? '')) + 1,
      key: JSON.stringify([entry._key ?? entryIndex, media._key ?? mediaIndex]),
    }))
  return occurrences.filter(({ media }) => !!assetId(media)).map(({ media, slideNumber, key }) => ({
    key,
    media,
    thumbnailData: {
      anchor: project.slug?.current && slideNumber > 0 ? `/projects/${project.slug.current}/${slideNumber}` : undefined,
      projectId: project._id,
    },
  }))
})
