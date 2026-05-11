export const isLandscape = (aspectRatio: number) => aspectRatio > 1

export const wrap = (value: number, min: number, max: number) => {
  const range = max - min + 1
  return ((((value - min) % range) + range) % range) + min
}

export const quickArray = <T = number>(length: number, mapFunction: (index: number) => T = i => i as T) =>
  Array(length).fill(0).map((_, i) => mapFunction(i))
