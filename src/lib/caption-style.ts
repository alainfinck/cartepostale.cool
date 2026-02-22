import type { Postcard, FrontCaptionFontFamily, FrontCaptionColor } from '@/types'
import { CAPTION_FONT_SIZE_DEFAULT } from '@/types'

export const CAPTION_FONT_FAMILY: Record<FrontCaptionFontFamily, string> = {
  serif: "Georgia, 'Times New Roman', serif",
  sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  cursive: "'Segoe Script', 'Brush Script MT', 'Comic Sans MS', cursive",
  display: "'Impact', 'Arial Black', sans-serif",
}

/** Legacy: anciennes valeurs sm/md/lg/xl → px (pour docs existants). */
const LEGACY_FONT_SIZE: Record<string, string> = {
  sm: '14px',
  md: '16px',
  lg: '18px',
  xl: '22px',
}

export const CAPTION_COLOR: Record<FrontCaptionColor, string> = {
  'stone-900': '#1c1917',
  white: '#ffffff',
  black: '#000000',
  'teal-800': '#115e59',
  'stone-700': '#44403c',
  'amber-900': '#78350f',
  'rose-900': '#881337',
  'emerald-900': '#064e3b',
}

export function getCaptionStyle(postcard: Postcard): {
  fontFamily: string
  fontSize: string
  color: string
} {
  const fontFamily =
    CAPTION_FONT_FAMILY[postcard.frontCaptionFontFamily ?? 'sans']
  const raw = postcard.frontCaptionFontSize
  const fontSize =
    typeof raw === 'number'
      ? `${raw}px`
      : LEGACY_FONT_SIZE[String(raw)] ?? `${CAPTION_FONT_SIZE_DEFAULT}px`
  const color = CAPTION_COLOR[postcard.frontCaptionColor ?? 'stone-900']
  return { fontFamily, fontSize, color }
}

export function getCaptionBgColor(postcard: Postcard): string {
  const opacity = postcard.frontTextBgOpacity ?? 90
  const clamped = Math.max(0, Math.min(100, opacity))
  return `rgba(255, 255, 255, ${clamped / 100})`
}
