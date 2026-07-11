import type { MediaData, SanityImageObjectWithAsset } from '$lib/types/sanity'
import { srcSetFor, urlFor } from './sanity'

export enum MediaType {
  Image = 'image',
  Video = 'video',
}

export const getMediaId = (media: MediaData) =>
  media.mediaType === MediaType.Image ? media.image?.asset?._id : media.video?.asset?._id

const parseVideoRatio = (ratio: string) => {
  const [width, height] = ratio.split(':').map(Number)
  return width / height
}

export const getMediaAspectRatio = (media: MediaData) =>
  media.mediaType === MediaType.Image ? media.image.asset.metadata.dimensions.aspectRatio : parseVideoRatio(media.video.asset.data.aspect_ratio)

export const getImageSrc = (image: SanityImageObjectWithAsset, srcSettings?: SrcSettings) =>
  srcSettings ? srcSetFor(image, srcSettings) : {
    src: urlFor(image),
  }

export const preloadImage = (image: SanityImageObjectWithAsset, srcSettings?: SrcSettings) => {
  const imgSrc = getImageSrc(image, srcSettings)
  const img = new Image()
  if ('srcset' in imgSrc) {
    img.srcset = imgSrc.srcset
    img.sizes = imgSrc.sizes
    return
  }
  img.src = imgSrc.src
}

export type SrcSettings = number[]