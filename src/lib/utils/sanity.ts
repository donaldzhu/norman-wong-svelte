import { error } from '@sveltejs/kit'
import { client } from "$lib/sanity"
import type { SanityImageObjectWithAsset } from '$lib/types/sanity'
import type { SanityImageObject } from "@sanity/image-url"
import { createImageUrlBuilder } from "@sanity/image-url"
import { LARGE_DESKTOP_BREAKPOINT, MOBILE_BREAKPOINT } from '../../routes/_components/config'
import { type SizeSettings } from './media'
import { ceil50, quickArray } from './common'
import type { QueryParams } from '@sanity/client'

const urlBuilder = createImageUrlBuilder(client)

export const urlFor = (image: SanityImageObject, {
  width,
  height,
}: {
  width?: number
  height?: number
  dpr?: number
} = {}) => {
  let imageBuilder = urlBuilder.image(image)
  if (width) imageBuilder = imageBuilder.width(width)
  if (height) imageBuilder = imageBuilder.height(height)
  return imageBuilder.url()
}

export const srcSetFor = (image: SanityImageObjectWithAsset, vwSettings: SizeSettings) => {
  const SIZE_INTERVAL = 250
  const MIN_SIZE = 250
  const MAX_SIZE = 3000
  const srcset = quickArray((MAX_SIZE - MIN_SIZE) / SIZE_INTERVAL + 1, i => {
    const width = MIN_SIZE + i * SIZE_INTERVAL
    const url = urlFor(image, { width })
    return `${url} ${width}w`
  })

  const vwSizes = vwSettings.map(vw => `${vw * 100}vw`)
  const sizes = [
    `(max-width: ${MOBILE_BREAKPOINT}px) ${vwSizes[0]}`,
    vwSizes[1],
  ]
  /*
    if (SMALL_MOBILE_CAP < widths[0]) {
      srcset.unshift(`${urlFor(image, { width: SMALL_MOBILE_CAP })} ${SMALL_MOBILE_CAP}w`)
      sizes.unshift(`(max-width: ${SMALL_MOBILE_CAP}px) ${SMALL_MOBILE_CAP}px`)
    } */

  return {
    srcset: srcset.join(', '),
    sizes: sizes.join(', '),
  }
}

const PLACEHOLDER_WIDTH = 50

export const getPlaceholderSrc = (image: SanityImageObjectWithAsset): string | undefined => {
  const lqip = image.asset?.metadata?.lqip
  if (lqip) return lqip

  const aspectRatio = image.asset?.metadata?.dimensions?.aspectRatio
  if (!aspectRatio) return undefined

  const height = Math.ceil(PLACEHOLDER_WIDTH / aspectRatio)
  return urlBuilder
    .image(image)
    .width(PLACEHOLDER_WIDTH)
    .height(height)
    .blur(50)
    .quality(20)
    .url()
}

export const getSanityData = async <T>(query: string, params?: QueryParams) => {
  const data = (params != null
    ? await client.fetch(query, params)
    : await client.fetch(query)) as T | null
  if (data == null) error(500, 'Internal Server Error')
  return data
}

export const HYDRATE_IMAGE_QUERY = `
  asset-> {
    _id,
    altText,
    description,
    title,
    url,
    metadata {
      dimensions {
        width,
        height,
        aspectRatio
      },
      lqip
    }
  }
`
export const SLIDE_QUERY = `
  slides[] {
    ...,
    media[] {
      ...,
      image {
        ${HYDRATE_IMAGE_QUERY}
      },
      video {
        asset->
      },
      mobileImage {
        ${HYDRATE_IMAGE_QUERY}
      },
      mobileVideo {
        asset->
      }
    }
  }
`