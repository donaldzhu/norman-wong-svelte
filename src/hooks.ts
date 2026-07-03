import type { Reroute } from '@sveltejs/kit'

// `/index` cannot be a real route folder: adapter-vercel reserves `index.func`.
// Keep the public URL as `/index` and resolve it to the internal `/all` route.
export const reroute: Reroute = ({ url }) => {
	if (url.pathname === '/index') return '/all'
}
