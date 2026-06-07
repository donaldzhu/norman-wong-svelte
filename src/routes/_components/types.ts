import type { AllProjectsMediaData } from '$lib/types/sanity'

export interface AllThumbnailData {
  media: AllProjectsMediaData
  thumbnailData?: {
    anchor: string
    projectId: string
  }
  isUnfilled: boolean
}
