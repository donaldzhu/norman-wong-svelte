import { LONG_DEBOUNCE_MS } from '../../routes/_components/config'
import { isMobile } from './dom'

export type TimeOut = ReturnType<typeof setTimeout>
export const withDebounce = (
  getDebounce: () => TimeOut | undefined,
  setDebounce: (debounce: TimeOut | undefined) => any,
  callback: () => any,
  prevIsMobile: boolean | null,
) => {
  if (prevIsMobile !== null && prevIsMobile === isMobile()) return
  const debounce = getDebounce()
  if (debounce) clearTimeout(debounce)
  setDebounce(setTimeout(() => {
    setDebounce(undefined)
    callback()
  }, LONG_DEBOUNCE_MS))
}

