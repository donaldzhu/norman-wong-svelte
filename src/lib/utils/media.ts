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

export const getImageSrc = (image: SanityImageObjectWithAsset, sizeSettings?: SizeSettings) =>
  sizeSettings ? srcSetFor(image, sizeSettings) : {
    src: urlFor(image),
  }

export const preloadImage = (image: SanityImageObjectWithAsset, sizeSettings?: SizeSettings) => {
  const imgSrc = getImageSrc(image, sizeSettings)
  const img = new Image()
  if ('srcset' in imgSrc) {
    img.srcset = imgSrc.srcset
    img.sizes = imgSrc.sizes
    return
  }
  img.src = imgSrc.src
}


type MediaDimensions = {
  width: number
  height?: number
} | {
  width?: number
  height: number
}

export interface SizeSettings {
  mobile: MediaDimensions
  desktop: MediaDimensions
  largeDesktop: MediaDimensions
}