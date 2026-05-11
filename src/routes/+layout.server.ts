import type { SanityData } from '$lib/types/sanity'
import { client } from '$lib/sanity'

export async function load() {
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
      }
    }
  }
  `

  const hydrateSlideIds = `
    "slideMediaIds": slides[] {
      "ids": media[].image.asset->_id
    }.ids
  `

  const query = `
  {
    "header": *[_type == "header"][0] {
      nameDisplayText,
      selectedWorksDisplayText,
      allProjectsDisplayText,
      informationDisplayText
    },
    "info": *[_type == "info"][0] {
      contacts[] {
        displayName,
        email,
        phone
      }
    },
    "selectedWorks": *[_type == "selectedWorks"][0] {
      desktopLayout {
        projects[] {
          media[] {
            mediaType,
            image {
              ...,
              ${hydrateImage}
            }
          },
          project->{
            _id,
            slug,
            ${hydrateSlideIds}
          }
        },
        rowSettings
      }
    },
    "allProjects": *[_type == "allProjects"][0] {
      projects[]-> {
        _id,
        title,
        subtitle,
        slug,
        ${hydrateSlideIds},
        'thumbnails': allProjectsThumbnails[]{
          image {
            ...,
            ${hydrateImage}
          },
          desktopSize,
          mobileSize,
          type
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