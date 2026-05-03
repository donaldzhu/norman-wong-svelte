import type { PageServerLoad } from './$types'
import { redirect } from '@sveltejs/kit'

export const load: PageServerLoad = async ({ params }) => {
  const { project } = params
  redirect(303, `/projects/${project}/1`)
}