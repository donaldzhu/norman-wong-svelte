import _ from 'lodash'

export const vw = (percentage = 100) => window.innerWidth * percentage / 100
export const vwRamp = (currentVw: number, valueAtMin: number, valueAtMax: number, minVw = 1440, maxVw = 2560) => {
  const range = maxVw - minVw
  const value = valueAtMin + (valueAtMax - valueAtMin) * (currentVw - minVw) / range
  return value
}


export const fitToHeight = (
  aspectRatio: number,
  height: number,
) => {
  const width = height * aspectRatio
  return width
}

export const fitToWidth = (
  aspectRatio: number,
  width: number,
) => {
  const height = width / aspectRatio
  return height
}

interface StretchToContainerConfig {
  minGap: number,
  maxGap: number,
  contentWidth: number,
  containerWidth: number,
  itemCount: number,
}
export const stretchToContainer = ({ minGap, maxGap, contentWidth, containerWidth, itemCount }: StretchToContainerConfig) => {
  const gapCount = itemCount - 1
  let remainingGap = (containerWidth - contentWidth) / gapCount
  let scalingFactor = 1
  const gap = _.clamp(remainingGap, minGap, maxGap)

  scalingFactor = (containerWidth - gap * gapCount) / contentWidth

  console.log(scalingFactor, gap, minGap, maxGap)
  return {
    scalingFactor,
    gap,
  }
}