import type { SanityImageObject } from "@sanity/image-url"
import { client } from "$lib/sanity"
import { createImageUrlBuilder } from "@sanity/image-url"

const urlBuilder = createImageUrlBuilder(client)

// TODO: based on the size of the image, return the appropriate url
export const urlFor = (image: SanityImageObject) => urlBuilder.image(image).url()