import type { SanityData } from '$lib/types/sanity'
import { client } from '$lib/sanity'

export const load = async () => {
  const hydrateImage = `
    asset-> {
      _id,
      altText,
      description,
      title,
      url,
      metadata {
        dimensions {
          width,
          height,
          aspectRatio
        },
        lqip
      }
    }
  `

  const hydrateSlideIds = `
    "slideMediaIds": slides[] {
      "ids": media[] {
        "id": coalesce(image.asset->_id, video.asset->_id)
      }.id
    }.ids
  `

  const query = `
  {
    "header": *[_type == "header"][0] {
      nameDisplayTextDesktop,
      nameDisplayTextMobile,
      selectedWorksDisplayTextDesktop,
      selectedWorksDisplayTextMobile,
      allProjectsDisplayTextDesktop,
      allProjectsDisplayTextMobile,
      informationDisplayTextDesktop,
      informationDisplayTextMobile,
    },
    "info": *[_type == "info"][0] {
      contacts[] {
        displayName,
        email,
        phone
      }
    },
    "allProjects": *[_type == "allProjects"][0] {
      desktopLayout {
        rowSettings
      },
      mobileLayout {
        rowSettings
      },
      projects[] {
        project-> {
          _id,
          slug,
          ${hydrateSlideIds}
        },
        media[] {
          mediaType,
          image {
            ...,
            ${hydrateImage}
          },
          video {
            asset->
          },
          hideOnMobile
        }
      },
    },
    "selectedWorks": *[_type == "selectedWorks"][0] {
      projects[]-> {
        _id,
        title,
        subtitle,
        slug,
        ${hydrateSlideIds},
        'thumbnails': selectedWorksThumbnails[]{
          image {
            ...,
            ${hydrateImage}
          },
          video {
            asset->
          },
          desktopSize,
          mobileSize,
          mediaType
        },
        hidden,
      }
    }
  }
`
  const data = await client.fetch<SanityData>(query)
  if (!data) {
    return {
      status: 500,
      body: new Error('Internal Server Error')
    }
  }
  return data
}