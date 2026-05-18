import { MediaType } from './../utils/media'
import type { SanityImageObject } from '@sanity/image-url'

import type { Orientation } from '$lib/utils/dom'

export interface SanityData {
  header: HeaderData
  info: InfoData
  selectedWorks: SelectedWorksData
  allProjects: AllProjectsData
}

export interface HeaderData {
  nameDisplayTextDesktop: string
  nameDisplayTextMobile: string
  selectedWorksDisplayTextDesktop: string
  selectedWorksDisplayTextMobile: string
  allProjectsDisplayTextDesktop: string
  allProjectsDisplayTextMobile: string
  informationDisplayTextDesktop: string
  informationDisplayTextMobile: string
}

export interface ContactData {
  displayName: string
  email: string
  phone?: string
}

export interface InfoData {
  contacts: ContactData[]
}

export interface AllProjectsData {
  projects: ProjectData[]
}

type SlideMediaIds = string[][]

export interface Slug {
  current: string
}
export interface ProjectData {
  _id: string
  title: string
  subtitle?: string
  slug: Slug
  thumbnails: AllProjectsThumbnailData[]
  slideMediaIds: SlideMediaIds
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

export type AllProjectsThumbnailData = MediaData & {
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
  mobileOrientation: Orientation
  automaticMobileLayout: boolean
}

export type SlideMediaData = MediaData & {
  _key: string
  automaticMobileLayout: boolean
  desktopStart: number
  desktopEnd: number
  mobileStart?: number
  mobileEnd?: number
}

export interface SelectedWorksData {
  desktopLayout: SelectedWorksLayoutData
  mobileLayout: SelectedWorksLayoutData
  projects: SelectedWorksProjectData[]
}

export interface SelectedWorksLayoutData {
  rowSettings: number[]
}

export interface SelectedWorksProjectData {
  media: SelectedWorksMediaData[]
  project: {
    _id: string
    slug: Slug
    slideMediaIds: SlideMediaIds
  }
}

export type SelectedWorksMediaData = MediaData & {
  hideOnMobile: boolean
}

export type MediaData = {
  mediaType: MediaType.Image
  image: SanityImageObjectWithAsset
} | {
  mediaType: MediaType.Video
  video: SanityVideoObject
}

export interface SanityVideoObject {
  asset: {
    _id: string
    playbackId?: string
    status: 'ready' | 'preparing' | 'error'
    data: {
      aspect_ratio: string
    }
  }
}