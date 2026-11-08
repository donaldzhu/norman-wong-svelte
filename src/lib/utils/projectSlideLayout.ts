import { croppedRatio } from './imageFraming'
import type { Orientation } from './dom'
import type { SlideMediaData, SlideLayoutV2, SlideData } from "$lib/types/sanity"

const SIZES = [6, 8, 10, 12, 14, 16, 18] as const
export const autoMobileSpan = (desktopSpan: number): number => Math.min(8, desktopSpan / 2)
export function autoMobileSpans(desktopSpans: number[]): number[] {
  const base = desktopSpans.map(autoMobileSpan)
  for (const bump of [2, 1, 0]) {
    const spans = base.map(span => Math.min(8, span + bump))
    if (spans.reduce((sum, span) => sum + span, 0) <= 12) return spans
  }
  return base
}
const DESKTOP_COLUMNS = 24
// Preserve the previous grid container's `100vw + 8px` sizing reference.
const GEOMETRY_BUFFER = 8

const aspectRatio = (media: SlideMediaData, isMobile = false) => {
  let ratio: number | undefined
  if (media.mediaType === "image") {
    const image = isMobile ? media.mobileImage ?? media.image : media.image
    const dimensions = image?.asset?.metadata?.dimensions
    ratio = dimensions?.aspectRatio || (dimensions ? dimensions.width / dimensions.height : undefined)
    if (ratio) ratio = croppedRatio(ratio, image)
  } else {
    const parts = (isMobile ? media.mobileVideo ?? media.video : media.video)?.asset?.data?.aspect_ratio?.split(":").map(Number)
    ratio = parts?.length === 2 ? parts[0] / parts[1] : undefined
  }
  return ratio && Number.isFinite(ratio) && ratio > 0 ? ratio : undefined
}

interface GeometryInput {
  media: SlideMediaData[]
  spans: number[]
  width: number
  height: number
  gap: number
  tracks: number
  isStacked: boolean
  isJustified: boolean
  isMobile: boolean
  issues: string[]
}

function resolveGeometry({ media, spans, width, height, gap, tracks, isStacked, isJustified, isMobile, issues }: GeometryInput) {
  const isReady = Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0
  const safeWidth = isReady ? width : 1
  const safeHeight = isReady ? height : 1
  const main = isStacked ? safeHeight : safeWidth
  const cross = isStacked ? safeWidth : safeHeight
  const requestedGap = Math.max(0, Number.isFinite(gap) ? gap : 0)
  // Leave positive space for tracks even on unusually small viewports.
  const gridGap = Math.min(requestedGap, main / tracks)
  const track = (main + GEOMETRY_BUFFER - (tracks - 1) * gridGap) / tracks
  const sourceRatios = media.map(item => aspectRatio(item, isMobile))
  const ratios = sourceRatios.map(ratio => ratio ?? 1)
  const lengths = spans.map(span => span * track + (span - 1) * gridGap)
  const breadths = lengths.map((length, i) => isStacked ? length * ratios[i] : length / ratios[i])
  const resolvedGap = media.length > 1 ? Math.min(gridGap, main / (media.length - 1)) : 0
  const sum = lengths.reduce((a, b) => a + b, 0)
  const mainScale = sum ? (main - resolvedGap * Math.max(0, media.length - 1)) / sum : 1
  const crossScale = breadths.length ? cross / Math.max(...breadths) : 1
  // Desktop spans own the width; tall media clips instead of shrinking to height.
  const scale = media.length ? Math.max(0, Math.min(1, mainScale, isMobile ? crossScale : 1)) : 0
  const total = spans.reduce((a, b) => a + b, 0)
  const resolvedIssues = [...issues]
  sourceRatios.forEach((ratio, i) => {
    if (ratio === undefined) resolvedIssues.push(`Media ${i + 1}: missing aspect ratio; using compatibility square`)
  })
  if (!isJustified && total > tracks) resolvedIssues.push(`Column total ${total} exceeds ${tracks}`)
  return {
    isReady,
    isJustified,
    spans,
    total,
    isValid: resolvedIssues.length === 0,
    issues: resolvedIssues,
    gap: resolvedGap,
    isGapAdjusted: gridGap !== requestedGap,
    scale: isJustified ? 1 : scale,
    fitReason: isJustified || scale >= 1 ? null : resolvedIssues.length ? 'metadata' : isMobile && crossScale < mainScale ? 'cross-axis' : 'boundary',
    items: media.map((_, i) => {
      const itemWidth = isJustified ? safeWidth : (isStacked ? breadths[i] : lengths[i]) * scale
      const itemHeight = isJustified ? safeHeight : (isStacked ? lengths[i] : breadths[i]) * scale
      return {
        width: itemWidth,
        height: itemHeight,
        sourceFraction: (isJustified ? Math.max(safeWidth, safeHeight * ratios[i]) : itemWidth) / safeWidth * 1.2,
      }
    }),
  }
}

export function isValidSlideV2(media: SlideMediaData[], v?: SlideLayoutV2): v is SlideLayoutV2 {
  if (!v || v.version !== 2 || !media.length || media.length > 4 || media.some(m => !m._key) || new Set(media.map(m => m._key)).size !== media.length) return false
  if (!['center', 'justify'].includes(v.desktop?.mode) || !['center', 'justify'].includes(v.mobile?.mode) || typeof v.mobile?.auto !== 'boolean' || !['portrait', 'landscape'].includes(v.mobile?.orientation)) return false
  if (!media.every(m => SIZES.includes(m.desktopSpan as typeof SIZES[number]) && Number.isInteger(m.mobileSpan) && m.mobileSpan! >= 1 && m.mobileSpan! <= 11)) return false
  return (v.desktop.mode === 'justify' ? media.length === 1 : media.reduce((n, m) => n + m.desktopSpan!, 0) <= 24) &&
    (v.mobile.auto || (v.mobile.mode === 'justify' ? media.length === 1 : media.reduce((n, m) => n + m.mobileSpan!, 0) <= 12))
}
function unavailableLayout(layoutV2?: SlideLayoutV2) {
  const issue = !layoutV2 ? 'Slide layout settings incomplete.' : layoutV2.version !== 2 ? 'Unsupported slide layout version.' : 'Invalid slide layout settings.'
  return {
    isReady: false, isJustified: false, spans: [] as number[], total: 0, isValid: false,
    issues: [issue], gap: 0, isGapAdjusted: false, scale: 0, fitReason: null,
    items: [] as { width: number; height: number; sourceFraction: number }[],
  }
}

export function mobileOrientationFor(slide: SlideData) {
  if (!isValidSlideV2(slide.media, slide.layoutV2)) return undefined
  return slide.layoutV2.mobile.auto ? 'portrait' as Orientation.Portrait : slide.layoutV2.mobile.orientation
}

export function resolveDesktopLayout(media: SlideMediaData[], width: number, height: number, gap: number, layoutV2?: SlideLayoutV2) {
  if (!isValidSlideV2(media, layoutV2)) return unavailableLayout(layoutV2)
  return resolveGeometry({ media, width, height, gap, tracks: DESKTOP_COLUMNS, isStacked: false, isMobile: false, spans: media.map(m => m.desktopSpan!), isJustified: layoutV2.desktop.mode === 'justify', issues: [] })
}

export function resolveMobileLayout(media: SlideMediaData[], width: number, height: number, gap: number, isStacked: boolean, layoutV2?: SlideLayoutV2) {
  if (!isValidSlideV2(media, layoutV2)) return { ...unavailableLayout(layoutV2), mode: 'unavailable' }
  const isAuto = layoutV2.mobile.auto
  const desktopSpans = media.map(m => m.desktopSpan!)
  const spans = isAuto ? layoutV2.desktop.mode === 'center' ? autoMobileSpans(desktopSpans) : desktopSpans.map(autoMobileSpan) : media.map(m => m.mobileSpan!)
  const isJustified = (isAuto ? layoutV2.desktop.mode : layoutV2.mobile.mode) === 'justify'
  return { ...resolveGeometry({ media, width, height, gap, tracks: 12, isStacked, isMobile: true, spans, isJustified, issues: [] }), mode: isAuto ? 'auto' : 'custom' }
}

export type DesktopMediaLayout = ReturnType<typeof resolveDesktopLayout>["items"][number]
