export const isLandscape = (aspectRatio: number) => aspectRatio > 1

export const vw = (percentage = 100) => window.innerWidth * percentage / 100
export const vh = (percentage = 100) => window.innerHeight * percentage / 100

export const wrap = (value: number, min: number, max: number) => {
  const range = max - min + 1
  return ((((value - min) % range) + range) % range) + min
}