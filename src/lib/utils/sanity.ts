import type { SanityImageObject } from "@sanity/image-url"
import type { SanityImageObjectWithAsset } from '$lib/types/sanity'
import { client } from "$lib/sanity"
import { createImageUrlBuilder } from "@sanity/image-url"

const urlBuilder = createImageUrlBuilder(client)

export const urlFor = (image: SanityImageObject) => urlBuilder.image(image).url()
