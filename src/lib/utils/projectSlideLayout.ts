import { croppedRatio } from './imageFraming'
import type { Orientation } from './dom'
import type { SlideMediaData, SlideLayoutV2, SlideData } from "$lib/types/sanity"

const LEGACY_SIZES = [6, 8, 10, 12, 14, 16] as const
const SIZES = [...LEGACY_SIZES, 18] as const
export const autoMobileSpan = (desktopSpan: number, singleImage = false): number =>
  Math.min(8, desktopSpan / 2 + (singleImage ? 1 : 0))
const DESKTOP_COLUMNS = 24
// Preserve the previous grid container's `100vw + 8px` sizing reference.
const LEGACY_GRID_BUFFER = 8

export function desktopSpan(start: number, end: number): number {
  if (!Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end > 25 || end <= start) return 8
  return end - start
}

export function centeredSize(span: number): number {
  if (span === 4) return 6
  if (span === 9) return 8
  if (span === 18 || span === 24) return 16
  return LEGACY_SIZES.reduce<number>((best, size) => Math.abs(size - span) < Math.abs(best - span) ? size : best, 6)
}

function aspectRatio(media: SlideMediaData, mobile = false): number | undefined {
  let ratio: number | undefined
  if (media.mediaType === "image") {
    const image = mobile ? media.mobileImage ?? media.image : media.image
    const dimensions = image?.asset?.metadata?.dimensions
    ratio = dimensions?.aspectRatio || (dimensions ? dimensions.width / dimensions.height : undefined)
    if (ratio) ratio = croppedRatio(ratio, image)
  } else {
    const parts = (mobile ? media.mobileVideo ?? media.video : media.video)?.asset?.data?.aspect_ratio?.split(":").map(Number)
    ratio = parts?.length === 2 ? parts[0] / parts[1] : undefined
  }
  return ratio && Number.isFinite(ratio) && ratio > 0 ? ratio : undefined
}

// Mobile spans retain the existing 12-track grid, including internal gutters.
export function mobileSpan(start: number, end: number): number {
  if (!Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end > 13 || end <= start) return 8
  return end - start
}

interface GeometryInput {
  media: SlideMediaData[]
  spans: number[]
  width: number
  height: number
  gap: number
  tracks: number
  stacked: boolean
  justified: boolean
  mobile: boolean
  issues: string[]
}

function resolveGeometry({media, spans, width, height, gap, tracks, stacked, justified, mobile, issues}: GeometryInput) {
  const ready = Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0
  const safeWidth = ready ? width : 1
  const safeHeight = ready ? height : 1
  const main = stacked ? safeHeight : safeWidth
  const cross = stacked ? safeWidth : safeHeight
  const requestedGap = Math.max(0, Number.isFinite(gap) ? gap : 0)
  // Leave positive space for tracks even on unusually small viewports.
  const gridGap = Math.min(requestedGap, main / tracks)
  const track = (main + LEGACY_GRID_BUFFER - (tracks - 1) * gridGap) / tracks
  const sourceRatios = media.map(item => aspectRatio(item, mobile))
  const ratios = sourceRatios.map(ratio => ratio ?? 1)
  const lengths = spans.map(span => span * track + (span - 1) * gridGap)
  const breadths = lengths.map((length, i) => stacked ? length * ratios[i] : length / ratios[i])
  const resolvedGap = media.length > 1 ? Math.min(gridGap, main / (media.length - 1)) : 0
  const sum = lengths.reduce((a, b) => a + b, 0)
  const mainScale = sum ? (main - resolvedGap * Math.max(0, media.length - 1)) / sum : 1
  const crossScale = breadths.length ? cross / Math.max(...breadths) : 1
  // Desktop spans own the width; tall media clips instead of shrinking to height.
  const scale = media.length ? Math.max(0, Math.min(1, mainScale, mobile ? crossScale : 1)) : 0
  const total = spans.reduce((a, b) => a + b, 0)
  const resolvedIssues = [...issues]
  sourceRatios.forEach((ratio, i) => {
    if (ratio === undefined) resolvedIssues.push(`Media ${i + 1}: missing aspect ratio; using compatibility square`)
  })
  if (!justified && total > tracks) resolvedIssues.push(`Column total ${total} exceeds ${tracks}`)
  return {
    ready,
    justified,
    spans,
    total,
    valid: resolvedIssues.length === 0,
    issues: resolvedIssues,
    gap: resolvedGap,
    gapAdjusted: gridGap !== requestedGap,
    scale: justified ? 1 : scale,
    fitReason: justified || scale >= 1 ? null : resolvedIssues.length ? 'legacy-compatibility' : mobile && crossScale < mainScale ? 'cross-axis' : 'boundary',
    items: media.map((_, i) => {
      const itemWidth = justified ? safeWidth : (stacked ? breadths[i] : lengths[i]) * scale
      const itemHeight = justified ? safeHeight : (stacked ? lengths[i] : breadths[i]) * scale
      return {
        width: itemWidth,
        height: itemHeight,
        sourceFraction: (justified ? Math.max(safeWidth, safeHeight * ratios[i]) : itemWidth) / safeWidth * 1.2,
      }
    }),
  }
}

function validLines(start: number, end: number, tracks: number) {
  return Number.isInteger(start) && Number.isInteger(end) && start >= 1 && end <= tracks + 1 && end > start
}

function desktopResolution(media: SlideMediaData[]) {
  const issues: string[] = []
  const justified = media.length === 1 && validLines(media[0].desktopStart, media[0].desktopEnd, 24) && desktopSpan(media[0].desktopStart, media[0].desktopEnd) === 24
  const spans = media.map((item, i) => {
    const raw = desktopSpan(item.desktopStart, item.desktopEnd)
    if (!validLines(item.desktopStart, item.desktopEnd, 24) || ![4, 6, 8, 9, 10, 12, 14, 16, 18, 24].includes(raw)) issues.push(`Media ${i + 1}: unsupported desktop span`)
    return justified ? 24 : centeredSize(raw)
  })
  return {spans, justified, issues}
}

export function validSlideV2(media: SlideMediaData[], v?: SlideLayoutV2): v is SlideLayoutV2 {
  if (!v || v.version !== 2 || !media.length || media.length > 4 || media.some(m => !m._key) || new Set(media.map(m => m._key)).size !== media.length) return false
  if (!['center','justify'].includes(v.desktop?.mode) || !['center','justify'].includes(v.mobile?.mode) || typeof v.mobile?.auto !== 'boolean' || !['portrait','landscape'].includes(v.mobile?.orientation)) return false
  if (!media.every(m => SIZES.includes(m.desktopSpan as typeof SIZES[number]) && Number.isInteger(m.mobileSpan) && m.mobileSpan! >= 1 && m.mobileSpan! <= 11)) return false
  return (v.desktop.mode === 'justify' ? media.length === 1 : media.reduce((n,m) => n + m.desktopSpan!,0) <= 24) &&
    (v.mobile.auto || (v.mobile.mode === 'justify' ? media.length === 1 : media.reduce((n,m) => n + m.mobileSpan!,0) <= 12))
}
export function mobileOrientationFor(slide: SlideData) {
  if (validSlideV2(slide.media, slide.layoutV2)) return slide.layoutV2.mobile.auto ? 'portrait' as Orientation.Portrait : slide.layoutV2.mobile.orientation
  return slide.mobileOrientation
}

export function resolveDesktopLayout(media: SlideMediaData[], width: number, height: number, gap: number, layoutV2?: SlideLayoutV2) {
  if (validSlideV2(media, layoutV2)) return resolveGeometry({media, width, height, gap, tracks: 24, stacked: false, mobile: false, spans: media.map(m => m.desktopSpan!), justified: layoutV2.desktop.mode === 'justify', issues: []})
  const legacy = desktopResolution(media)
  if (layoutV2) legacy.issues.push('Invalid V2 layout; using legacy layout')
  return resolveGeometry({media, width, height, gap, tracks: DESKTOP_COLUMNS, stacked: false, mobile: false, ...legacy})
}

export function resolveMobileLayout(media: SlideMediaData[], width: number, height: number, gap: number, stacked: boolean, layoutV2?: SlideLayoutV2) {
  if (validSlideV2(media, layoutV2)) {
    const auto = layoutV2.mobile.auto
    const singleCenteredImage = layoutV2.desktop.mode === 'center' && media.length === 1 && media[0].mediaType === 'image'
    const spans = media.map(m => auto ? autoMobileSpan(m.desktopSpan!, singleCenteredImage) : m.mobileSpan!)
    const justified = (auto ? layoutV2.desktop.mode : layoutV2.mobile.mode) === 'justify'
    return {...resolveGeometry({media, width, height, gap, tracks: 12, stacked, mobile: true, spans, justified, issues: []}), mode: auto ? 'auto' : 'custom'}
  }
  const preset = ({1: 8, 2: 6, 3: 4, 4: 3} as Record<number, number>)[media.length]
  const absent = media.every(item => item.mobileStart == null && item.mobileEnd == null)
  const defaults = media.length > 0 && media.every(item => validLines(item.mobileStart, item.mobileEnd, 12) && item.mobileEnd - item.mobileStart === preset)
  const mode = absent || defaults ? 'auto' : 'custom'
  const desktop = desktopResolution(media)
  const issues = mode === 'auto' ? [...desktop.issues] : media.flatMap((item, i) => validLines(item.mobileStart, item.mobileEnd, 12) ? [] : [`Media ${i + 1}: invalid mobile span`])
  if (layoutV2) issues.push('Invalid V2 layout; using legacy layout')
  const spans = mode === 'auto' ? desktop.spans.map(span => span / 2) : media.map(item => mobileSpan(item.mobileStart, item.mobileEnd))
  const justified = mode === 'auto' ? desktop.justified : media.length === 1 && validLines(media[0].mobileStart, media[0].mobileEnd, 12) && spans[0] === 12
  return {...resolveGeometry({media, spans, width, height, gap, tracks: 12, stacked, mobile: true, justified, issues}), mode}
}

export type DesktopMediaLayout = ReturnType<typeof resolveDesktopLayout>["items"][number]
