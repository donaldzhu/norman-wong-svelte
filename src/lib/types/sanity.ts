import { MediaType } from './../utils/media'
import type { Orientation } from '$lib/utils/dom'
import type { SanityImageObject } from '@sanity/image-url'

// Common
export interface PortableTextSpan {
  _type: 'span'
  text: string
}

export interface PortableTextBlock {
  _type: 'block'
  children?: PortableTextSpan[]
}

export type ThumbnailSize = 's' | 'm' | 'l'

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


export type MediaData = {
  mediaType: MediaType.Image
  image: SanityImageObjectWithAsset
} | {
  mediaType: MediaType.Video
  video: SanityVideoObject
}


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

export interface SelectedWorksData {
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
  slideMediaIds: SlideMediaIds
  slides: SlideData[]
}

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
      lqip?: string
    }
  }
}

export interface ProjectSlideData {
  title: string
  subtitle?: string
  slides: SlideData[]
}

export interface SlideData {
  description: PortableTextBlock[]
  year: number
  media: SlideMediaData[]
  mobileOrientation: Orientation
}

export type SlideMediaData = MediaData & {
  _key: string
  desktopStart: number
  desktopEnd: number
  mobileStart: number
  mobileEnd: number
}

export interface AllProjectsData {
  desktopLayout: AllProjectsLayoutData
  mobileLayout: AllProjectsLayoutData
  projects: AllProjectsProjectData[]
}

export interface AllProjectsLayoutData {
  rowSettings: number[]
}

export interface AllProjectsProjectData {
  media: AllProjectsMediaData[]
  project: {
    _id: string
    slug: Slug
    title: string
    subtitle?: string
    slideMediaIds: SlideMediaIds
  }
}

export type AllProjectsMediaData = MediaData & {
  hideOnMobile: boolean
}
