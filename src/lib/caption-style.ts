import type React from 'react'
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

export interface CaptionPreset {
  id: string
  label: string
  emoji: string
  /** Override font family (applied on top of user selection) */
  fontFamily?: FrontCaptionFontFamily
  extraStyle: React.CSSProperties
}

export const CAPTION_PRESETS: CaptionPreset[] = [
  {
    id: 'classic',
    label: 'Classique',
    emoji: '✏️',
    extraStyle: {},
  },
  {
    id: 'elegant',
    label: 'Elegant',
    emoji: '✨',
    fontFamily: 'serif',
    extraStyle: {
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      fontWeight: '300',
    },
  },
  {
    id: 'bd',
    label: 'BD',
    emoji: '💥',
    fontFamily: 'display',
    extraStyle: {
      WebkitTextStroke: '1px black',
      textTransform: 'uppercase',
      textShadow: '3px 3px 0 rgba(0,0,0,0.85), -1px -1px 0 rgba(0,0,0,0.4)',
      letterSpacing: '0.05em',
    },
  },
  {
    id: 'vacation',
    label: 'Vacances',
    emoji: '🌴',
    fontFamily: 'cursive',
    extraStyle: {
      textShadow: '2px 2px 0 rgba(255,140,0,0.6), 1px 1px 0 rgba(255,80,0,0.3)',
      letterSpacing: '0.03em',
    },
  },
  {
    id: 'vintage',
    label: 'Vintage',
    emoji: '📸',
    fontFamily: 'serif',
    extraStyle: {
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      textShadow: '1px 1px 3px rgba(120,80,40,0.5)',
      opacity: 0.85,
      fontStyle: 'italic',
    },
  },
  {
    id: 'neon',
    label: 'Neon',
    emoji: '💡',
    fontFamily: 'display',
    extraStyle: {
      textShadow: '0 0 7px #fff, 0 0 15px #fff, 0 0 30px #0ff, 0 0 50px #0ff',
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
    },
  },
  {
    id: 'cinema',
    label: 'Cinema',
    emoji: '🎬',
    fontFamily: 'display',
    extraStyle: {
      letterSpacing: '0.2em',
      textTransform: 'uppercase',
      textShadow: '0 2px 12px rgba(0,0,0,0.7)',
    },
  },
  {
    id: 'romance',
    label: 'Amour',
    emoji: '💌',
    fontFamily: 'cursive',
    extraStyle: {
      letterSpacing: '0.04em',
      textShadow: '0 2px 8px rgba(200,0,80,0.35), 0 1px 3px rgba(0,0,0,0.15)',
      fontStyle: 'italic',
    },
  },
]

export function getCaptionExtraStyle(presetId: string | undefined): React.CSSProperties {
  if (!presetId || presetId === 'classic') return {}
  const preset = CAPTION_PRESETS.find((p) => p.id === presetId)
  if (!preset) return {}
  const style: React.CSSProperties = { ...preset.extraStyle }
  if (preset.fontFamily) {
    style.fontFamily = CAPTION_FONT_FAMILY[preset.fontFamily]
  }
  return style
}
