import { DEBOUNCE_MS } from '../../routes/_components/config'

export type TimeOut = ReturnType<typeof setTimeout>
export const withDebounce = (
  getDebounce: () => TimeOut | undefined,
  setDebounce: (debounce: TimeOut | undefined) => any,
  callback: () => any
) => () => {
  const debounce = getDebounce()
  if (debounce) clearTimeout(debounce)
  setDebounce(setTimeout(() => {
    setDebounce(undefined)
    callback()
  }, DEBOUNCE_MS))
}