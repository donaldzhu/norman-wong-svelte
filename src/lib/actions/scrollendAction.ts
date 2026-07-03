import type { Action } from 'svelte/action'

export const scrollend: Action<HTMLElement> = node => {
  if ('onscrollend' in window) return

  let timeout: ReturnType<typeof setTimeout>
  const onScroll = () => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      node.dispatchEvent(new Event('scrollend', { bubbles: true }))
    }, 100)
  }
  node.addEventListener('scroll', onScroll, { passive: true })
  return {
    destroy() {
      clearTimeout(timeout)
      node.removeEventListener('scroll', onScroll)
    },
  }
}