import { SLIDE_QUERY, getSanityData } from '$lib/utils/sanity'

import type { SanityData } from '$lib/types/sanity'

export const load = async ({ params }: { params: { project: string } }) => {
  const query = `
  {
    "project": *[_type == "project" && slug.current == $slug][0] {
      hidden,
      title,
      subtitle,
      ${SLIDE_QUERY}
    }
  }
  `

  return getSanityData<SanityData>(query, { slug: params.project })
}