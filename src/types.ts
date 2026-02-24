export interface MediaItem {
  id: string
  type: 'image' | 'video'
  url: string
  key?: string
  mimeType?: string
  filesize?: number
  note?: string
  /** Localisation géocodée inversée depuis l'EXIF GPS (ex: "Paris, France") */
  location?: string
  exif?: {
    gps?: {
      latitude: number
      longitude: number
    }
    dateTime?: string
    cameraMake?: string
    cameraModel?: string
  }
}

/** Position de recadrage de la photo (pour aperçu / éditeur). x,y en % (0–100). */
export interface FrontImageCrop {
  /** Zoom : 1 = fit, >1 = zoom (ex. 1.5 = 150%). */
  scale: number
  /** Point focal horizontal (%). 50 = centre. */
  x: number
  /** Point focal vertical (%). 50 = centre. */
  y: number
}

export interface FrontImageFilter {
  brightness: number
  contrast: number
  saturation: number
  sepia: number
  grayscale: number
}

/** Position du bloc caption+emoji sur la face avant (x, y en % 0–100, centre du bloc). */
export interface FrontCaptionPosition {
  x: number
  y: number
}

/** Style du texte accroche (face avant). */
export type FrontCaptionFontFamily = 'serif' | 'sans' | 'cursive' | 'display'
/** Taille du texte accroche en pixels (ex. 16). Utilisé avec boutons − / +. */
export const CAPTION_FONT_SIZE_MIN = 12
export const CAPTION_FONT_SIZE_MAX = 28
export const CAPTION_FONT_SIZE_DEFAULT = 16
export const CAPTION_FONT_SIZE_STEP = 2
export type FrontCaptionColor =
  | 'stone-900'
  | 'white'
  | 'black'
  | 'teal-800'
  | 'stone-700'
  | 'amber-900'
  | 'rose-900'
  | 'emerald-900'

export interface Postcard {
  id: string
  frontImage: string
  /** Recadrage / zoom de la face avant (éditeur uniquement, non persisté). */
  frontImageCrop?: FrontImageCrop
  /** Filtres visuels appliqués à la photo de face (éditeur/aperçu). */
  frontImageFilter?: FrontImageFilter
  frontCaption?: string
  frontEmoji?: string
  /** Position du bloc caption+emoji sur la carte (centre en %). Par défaut en bas au centre. */
  frontCaptionPosition?: FrontCaptionPosition
  /** Police du texte accroche. */
  frontCaptionFontFamily?: FrontCaptionFontFamily
  /** Taille du texte accroche : nombre (px) ou anciennes valeurs sm/md/lg/xl pour compat. */
  frontCaptionFontSize?: number | string
  /** Couleur du texte accroche. */
  frontCaptionColor?: FrontCaptionColor
  /** Opacité du fond du bloc texte (0–100). */
  frontTextBgOpacity?: number
  /** Preset de style du texte accroche (ex: 'classic', 'elegant', 'bd'…). */
  frontCaptionPreset?: string
  /** Largeur du bloc caption en % de la carte (ex: 70 = 70%). */
  frontCaptionWidth?: number
  message: string
  recipientName: string
  senderName: string
  senderEmail?: string
  location: string
  coords?: {
    lat: number
    lng: number
  }
  greeting?: string
  stampStyle: 'classic' | 'modern' | 'airmail'
  /** Personnalisation du timbre (ex: "Digital Poste") */
  stampLabel?: string
  /** Année affichée sur le timbre (ex: "2024") */
  /** Année affichée sur le timbre (ex: "2024") */
  stampYear?: string
  /** Texte du tampon (ex: "Paris, France") */
  postmarkText?: string
  date: string
  status?: 'published' | 'draft' | 'archived'
  views?: number
  shares?: number
  mediaItems?: MediaItem[]
  isPremium?: boolean
  agencyId?: string
  brandLogo?: string
  stickers?: StickerPlacement[]
  emojiStickers?: EmojiSticker[]
  audioMessage?: string
  audioDuration?: number
  backgroundMusic?: string
  backgroundMusicTitle?: string
  allowComments?: boolean
  isPublic?: boolean
  password?: string
  contributionToken?: string
  isContributionEnabled?: boolean
  scratchCardEnabled?: boolean
  scratchCardImage?: string
  puzzleCardEnabled?: boolean
  puzzleCardDifficulty?: '3' | '4' | '5'
}

export interface Sticker {
  id: string
  name: string
  image: string // URL
  category?: string
}

export interface StickerPlacement {
  id: string // Unique instance ID
  stickerId: string
  x: number // %
  y: number // %
  scale: number
  rotation: number
  imageUrl?: string // Cache for display
}

/** Emoji placé directement sur la face avant de la carte (draggable + zoomable). */
export interface EmojiSticker {
  id: string
  emoji: string
  x: number // % 0-100 (centre)
  y: number // % 0-100 (centre)
  scale: number // multiplicateur de taille (1 = ~48px)
}

export interface AgencyConfig {
  id: string
  name: string
  logo: string
  primaryColor: string
  imageBank: string[]
  qrCodeUrl: string
}

export interface Lead {
  id: string
  senderEmail: string
  recipientEmail: string
  date: string
  location: string
}

export type TemplateCategory =
  | 'beach'
  | 'city'
  | 'nature'
  | 'travel'
  | 'romantic'
  | 'festive'
  | 'food'
  | 'abstract'

export interface Template {
  id: string
  name: string
  description?: string
  imageUrl: string
  category: TemplateCategory
  // Donnees pre-remplies
  frontCaption?: string
  frontEmoji?: string
  message?: string
  location?: string
  stampStyle?: 'classic' | 'modern' | 'airmail'
}

export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'client' | 'user'
  company?: string
  cardsCreated: number
  plan: 'free' | 'pro' | 'enterprise'
}

export enum ViewState {
  HOME = 'HOME',
  EDITOR = 'EDITOR',
  GALLERY = 'GALLERY',
  PRICING = 'PRICING',
  BUSINESS = 'BUSINESS',
  SHOWCASE = 'SHOWCASE',
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD',
  CLIENT_PORTAL = 'CLIENT_PORTAL',
}
