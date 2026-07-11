import { HYDRATE_IMAGE_QUERY, SLIDE_QUERY, getSanityData } from '$lib/utils/sanity'

import type { SanityData } from '$lib/types/sanity'

export const load = async () => {
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
            ${HYDRATE_IMAGE_QUERY}
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
        ${SLIDE_QUERY}
      }
    },
    "projects": *[_type == "project"] {
      title,
      subtitle,
      slug
    }
  }
`

  return getSanityData<SanityData>(query)
}