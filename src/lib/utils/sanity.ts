import type { SanityImageObject } from "@sanity/image-url"
import type { SanityImageObjectWithAsset } from '$lib/types/sanity'
import { client } from "$lib/sanity"
import { createImageUrlBuilder } from "@sanity/image-url"

const urlBuilder = createImageUrlBuilder(client)

// TODO: based on the size of the image, return the appropriate url
export const urlFor = (image: SanityImageObject) => urlBuilder.image(image).url()
/*
export const getThumbnailAnchor = (image: SanityImageObjectWithAsset) => {
  const id = image.asset._id
  const slideIndex = project.slideMediaIds.findIndex(ids => ids.includes(id))
  return `projects/${project.slug.current}/${slideIndex + 1}`
} */