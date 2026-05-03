import type { SanityData } from '$lib/types/sanity'
import { client } from '$lib/sanity'

export async function load({ params }: { params: { project: string } }) {
  const query = `
  {
    "project": *[_type == "project" && slug.current == $slug][0] {
      hidden,
      title,
      subtitle,
      slides[] {
        ...,
        media[] {
          ...,
          image {
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
          }
        }
      }
    }
  }
  `

  // TODO
  const data = await client.fetch<SanityData>(query, { slug: params.project })
  console.log(data)
  if (!data) {
    return {
      status: 500,
      body: new Error('Internal Server Error')
    }
  }
  return data
}