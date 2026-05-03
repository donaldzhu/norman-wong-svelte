import type { SanityImageObject } from '@sanity/image-url'

export interface SanityData {
  header: HeaderData
  info: InfoData
  selectedWorks: SelectedWorksData
  allProjects: AllProjectsData
}

export interface HeaderData {
  nameDisplayText: string
  selectedWorksDisplayText: string
  allProjectsDisplayText: string
  informationDisplayText: string
}

export interface ContactData {
  displayName: string
  email: string
  phone?: string
}

export interface InfoData {
  contacts: ContactData[]
}

export interface SelectedWorksData {
  media: MediaData[]
}

export interface MediaData {
  image: SanityImageObject
  mediaType: string
}

export interface AllProjectsData {
  projects: ProjectData[]
}

export interface ProjectData {
  _id: string
  title: string
  subtitle?: string
  slug: {
    current: string
  }
  thumbnails: AllProjectsThumbnailData[]
  slideMediaIds: string[][]
  hidden: boolean
}

export interface PortableTextSpan {
  _type: 'span'
  text: string
}

export interface PortableTextBlock {
  _type: 'block'
  children?: PortableTextSpan[]
}

export type MediaType = 'image' | 'video'
export type ThumbnailSize = 's' | 'm' | 'l'

export type SanityImageObjectWithAsset = SanityImageObject & {
  alt?: string
  asset?: {
    _id: string
    altText?: string
    description?: string
    title?: string
    url: string
    metadata: {
      dimensions: {
        width: number
        height: number
        aspectRatio: number
      }
    }
  }
}

export interface AllProjectsThumbnailData {
  image: SanityImageObjectWithAsset
  type: MediaType
  desktopSize: ThumbnailSize
  mobileSize: Exclude<ThumbnailSize, 'm'>
}

export interface ProjectSlideData {
  hidden: boolean
  title: string
  subtitle?: string
  slides: SlideData[]
}

export interface SlideData {
  description: PortableTextBlock[]
  year: number
  media: SlideMediaData[]
}

export interface SlideMediaData {
  automaticMobileLayout: boolean
  desktopStart: number
  desktopEnd: number
  mobileStart: number
  mobileEnd: number
  image: SanityImageObjectWithAsset
}