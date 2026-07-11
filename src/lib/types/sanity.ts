import { MediaType } from './../utils/media'
import type { Orientation } from '$lib/utils/dom'
import type { SanityImageObject } from '@sanity/image-url'

export interface SanityVideoObject {
  asset: {
    _id: string
    playbackId?: string
    status: 'ready' | 'preparing' | 'error'
    data: {
      aspect_ratio: string
      tracks: {
        type: 'audio' | 'video'
      }[]
    }
  }
}

export type MediaData = {
  mediaType: MediaType.Image
  image: SanityImageObjectWithAsset
  mobileImage?: SanityImageObjectWithAsset
} | {
  mediaType: MediaType.Video
  video: SanityVideoObject
  mobileVideo?: SanityVideoObject
}

export interface SanityData {
  header: HeaderData
  info: InfoData
  selectedWorks: SelectedWorksData
  allProjects: AllProjectsData
  projects: Pick<ProjectData, 'title' | 'subtitle' | 'slug'>[]
}

export interface HeaderData {
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
    slideMediaIds: SlideMediaIds
  }
}

export type AllProjectsMediaData = MediaData & {
  hideOnMobile: boolean
}
