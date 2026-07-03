import { redirect, type Handle } from '@sveltejs/kit'

// Keep `/all` internal — send direct visits to the public `/index` URL.
export const handle: Handle = async ({ event, resolve }) => {
	if (event.url.pathname === '/all') {
		redirect(308, '/index')
	}

	return resolve(event)
}
