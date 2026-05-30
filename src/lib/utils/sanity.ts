import { client } from "$lib/sanity"
import type { SanityImageObjectWithAsset } from '$lib/types/sanity'
import type { SanityImageObject } from "@sanity/image-url"
import { createImageUrlBuilder } from "@sanity/image-url"
import { LARGE_DESKTOP_BREAKPOINT, MOBILE_BREAKPOINT } from '../../routes/_components/config'
import { type SizeSettings } from './media'
import { ceil50 } from './common'

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

export const srcSetFor = (image: SanityImageObjectWithAsset, sizeSettings: SizeSettings) => {
  const aspectRatio = image.asset.metadata.dimensions.aspectRatio

  const keys = Object.keys(sizeSettings) as (keyof SizeSettings)[]
  const widths = keys.map((key) => ceil50(sizeSettings[key].width ?? sizeSettings[key].height! * aspectRatio))

  const SMALL_MOBILE_CAP = 400
  const srcset =
    keys.map((key, i) => {
      const sizeSetting = sizeSettings[key]
      const width = sizeSetting?.width ? ceil50(sizeSetting?.width) : undefined
      const height = sizeSetting?.height ? ceil50(sizeSetting?.height) : undefined

      const url = urlFor(image, { width, height })
      return `${url} ${widths[i]}w`
    })

  const sizes = [
    `(max-width: ${MOBILE_BREAKPOINT}px) ${widths[0]}px`,
    `(max-width: ${LARGE_DESKTOP_BREAKPOINT}px) ${widths[1]}px`,
    `${widths[2]}px`,
  ]

  if (SMALL_MOBILE_CAP < widths[0]) {
    srcset.unshift(`${urlFor(image, { width: SMALL_MOBILE_CAP })} ${SMALL_MOBILE_CAP}w`)
    sizes.unshift(`(max-width: ${SMALL_MOBILE_CAP}px) ${SMALL_MOBILE_CAP}px`)
  }

  return {
    srcset: srcset.join(', '),
    sizes: sizes.join(', '),
  }
}