import type { Action } from 'svelte/action'
import { SHORT_DEBOUNCE_MS } from '../../routes/_components/config'
import type { TimeOut } from '$lib/utils/animation'

export const scrollend: Action<HTMLElement> = node => {
  if ('onscrollend' in window) return

  let timeout: TimeOut
  const onscroll = () => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      node.dispatchEvent(new Event('scrollend', { bubbles: true }))
    }, SHORT_DEBOUNCE_MS)
  }
  node.addEventListener('scroll', onscroll, { passive: true })
  return {
    destroy() {
      clearTimeout(timeout)
      node.removeEventListener('scroll', onscroll)
    },
  }
}