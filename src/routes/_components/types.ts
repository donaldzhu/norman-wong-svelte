import type { SelectedWorksMediaData } from '$lib/types/sanity'

export interface SelectedThumbnailData {
  media: SelectedWorksMediaData
  thumbnailData?: {
    anchor: string
    projectId: string
  }
  isUnfilled: boolean
}