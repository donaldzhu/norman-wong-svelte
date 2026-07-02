import { MOBILE_BREAKPOINT } from '../../routes/_components/config'
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

interface StretchToContainerConfig {
  minGap: number,
  maxGap: number,
  contentWidth: number,
  containerWidth: number,
  itemCount: number,
}

export const stretchToContainer = ({
  minGap,
  maxGap,
  contentWidth,
  containerWidth,
  itemCount,
}: StretchToContainerConfig) => {
  const gapCount = itemCount - 1
  let remainingGap = (containerWidth - contentWidth) / gapCount
  const gap = _.clamp(remainingGap, minGap, maxGap)

  return (containerWidth - gap * gapCount) / contentWidth
}

export enum Device {
  Mobile = 'mobile',
  Desktop = 'desktop',
}

export enum Orientation {
  Portrait = 'portrait',
  Landscape = 'landscape',
}

export const isMobile = () => vw() <= MOBILE_BREAKPOINT