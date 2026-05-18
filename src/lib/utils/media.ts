import type { MediaData } from '$lib/types/sanity'

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