import { DEBOUNCE_MS } from '../../routes/_components/config'
import { isMobile } from './dom'

export type TimeOut = ReturnType<typeof setTimeout>
export const withDebounce = (
  prevIsMobile: boolean,
  getDebounce: () => TimeOut | undefined,
  setDebounce: (debounce: TimeOut | undefined) => any,
  callback: () => any
) => {
  if (prevIsMobile === isMobile()) return
  const debounce = getDebounce()
  if (debounce) clearTimeout(debounce)
  setDebounce(setTimeout(() => {
    setDebounce(undefined)
    callback()
  }, DEBOUNCE_MS))
}

