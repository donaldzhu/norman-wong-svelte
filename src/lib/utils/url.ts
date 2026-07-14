import type { NavigationTarget } from '@sveltejs/kit'
import { page } from '$app/state'

type pageState = typeof page | NavigationTarget<any> | null
export const pageIsSelectedWorksPage = (p: pageState = page) => p?.url.pathname === '/'
export const pageIsProjectPage = (p: pageState = page) => !!p?.url.pathname.match(/^\/projects\/.*/)