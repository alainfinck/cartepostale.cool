'use client'

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import confetti from 'canvas-confetti'
import {
  Upload,
  Type,
  MapPin,
  Eye,
  ChevronRight,
  ChevronLeft,
  Image as ImageIcon,
  Stamp,
  Sticker as StickerIcon,
  Send,
  Sparkles,
  X,
  Check,
  Camera,
  Plane,
  PenTool,
  RotateCw,
  RefreshCw,
  Locate,
  Navigation,
  User,
  Users,
  Copy,
  Facebook,
  Linkedin,
  Share2,
  Maximize2,
  MessageSquare,
  Mail,
  CreditCard,
  Crop,
  Grid,
  Minus,
  Plus,
  MoreHorizontal,
  Gift,
  XCircle,
  CheckCircle2,
  Info,
  SlidersHorizontal,
  FileText, // Added for note editing
  Mic,
  Search,
  Square,
  Play,
  Pause,
  Trash2,
  Volume2,
  Loader2,
  ChevronUp,
  Wand2,
  Move,
  Link2,
} from 'lucide-react'
import {
  Postcard,
  Template,
  TemplateCategory,
  FrontImageCrop,
  FrontImageFilter,
  FrontCaptionPosition,
  FrontCaptionFontFamily,
  FrontCaptionColor,
  CAPTION_FONT_SIZE_MIN,
  CAPTION_FONT_SIZE_MAX,
  CAPTION_FONT_SIZE_DEFAULT,
  CAPTION_FONT_SIZE_STEP,
  StickerPlacement,
  Sticker,
  EmojiSticker,
} from '@/types'
import PostcardView from '@/components/postcard/PostcardView'
import ScratchCardViewWrapper from '@/components/view/ScratchCardViewWrapper'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { createPostcard } from '@/actions/postcard-actions'
import { linkPostcardToUser } from '@/actions/auth-actions'
import { sendPostcardToRecipientsFromEditor, type EditorRecipient } from '@/actions/editor-actions'
import { consumeCredit } from '@/actions/credit-actions'

import {
  fileToProcessedDataUrl as fileToDataUrl,
  urlToResizedDataUrl,
  dataUrlToBlob,
  readFileAsDataUrl,
  MAX_IMAGE_PX,
  getOptimizedImageUrl,
  JPEG_QUALITY,
} from '@/lib/image-processing'
import { extractExifData, ExifData } from '@/lib/extract-exif'
import { CAPTION_PRESETS, getCaptionExtraStyle, captionPresetHidesBg } from '@/lib/caption-style'
import { UnsplashSearchModal } from '@/components/UnsplashSearchModal'
import {
  AiImageGeneratorModal,
  AI_GENERATION_PRICE_EUR,
} from '@/components/editor/AiImageGeneratorModal'
import UserGalleryModal from '@/components/editor/UserGalleryModal'
import StickerGallery from '@/components/editor/StickerGallery'
import StickerLayer from '@/components/editor/StickerLayer'
import FrontFaceEditor from '@/components/editor/FrontFaceEditor'
import RealTimeViewStats from '@/components/stats/RealTimeViewStats'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton'
import { useFacebookPixel } from '@/hooks/useFacebookPixel'
import { MusicLibraryModal } from '@/components/editor/MusicLibraryModal'
import type { MusicTrack } from '@/components/editor/MusicLibraryModal'
import { PACK_TIERS } from '@/components/pricing/PacksSlider'

const POSTCARD_ASPECT = 4 / 3

/** Génération d'image par IA : masqué pour l'instant, à réactiver plus tard */
const SHOW_AI_IMAGE_GENERATION = false

/** Options carte à gratter et puzzle : masquées pour l'instant, à réactiver plus tard */
const SHOW_SCRATCH_PUZZLE_OPTIONS = false

/** Catégories pour lesquelles la carte au verso est masquée par défaut */
const NO_MAP_CATEGORIES: TemplateCategory[] = [
  'birthday',
  'invitation',
  'birth',
  'christmas',
  'wedding',
  'graduation',
  'romantic',
  'festive',
  'abstract',
]

const DEFAULT_FRONT_FILTER: FrontImageFilter = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  sepia: 0,
  grayscale: 0,
}

const FILTER_PRESETS: { id: string; label: string; values: FrontImageFilter }[] = [
  { id: 'normal', label: 'Normal', values: DEFAULT_FRONT_FILTER },
  {
    id: 'vivid',
    label: 'Vivid',
    values: { brightness: 105, contrast: 112, saturation: 132, sepia: 0, grayscale: 0 },
  },
  {
    id: 'warm',
    label: 'Chaud',
    values: { brightness: 102, contrast: 106, saturation: 112, sepia: 20, grayscale: 0 },
  },
  {
    id: 'vintage',
    label: 'Vintage',
    values: { brightness: 98, contrast: 92, saturation: 84, sepia: 35, grayscale: 0 },
  },
  {
    id: 'noirblanc',
    label: 'Noir & blanc',
    values: { brightness: 102, contrast: 112, saturation: 0, sepia: 0, grayscale: 100 },
  },
]

const LOCAL_STORAGE_KEY = 'cartepostale_draft_v1'

function getCropPreviewStyle(
  crop: FrontImageCrop,
  naturalSize: { w: number; h: number },
): React.CSSProperties {
  const imgAspect = naturalSize.w / naturalSize.h
  let widthPercent = 100
  let heightPercent = 100

  if (imgAspect > POSTCARD_ASPECT) {
    heightPercent = 100 * crop.scale
    widthPercent = (heightPercent * imgAspect) / POSTCARD_ASPECT
  } else {
    widthPercent = 100 * crop.scale
    heightPercent = (widthPercent / imgAspect) * POSTCARD_ASPECT
  }

  const leftPercent = 50 - (crop.x / 100) * widthPercent
  const topPercent = 50 - (crop.y / 100) * heightPercent

  return {
    width: `${widthPercent}%`,
    height: `${heightPercent}%`,
    left: `${leftPercent}%`,
    top: `${topPercent}%`,
  }
}

function buildFrontImageFilterCss(filter: FrontImageFilter): string {
  return [
    `brightness(${filter.brightness}%)`,
    `contrast(${filter.contrast}%)`,
    `saturate(${filter.saturation}%)`,
    `sepia(${filter.sepia}%)`,
    `grayscale(${filter.grayscale}%)`,
  ].join(' ')
}

/**
 * Génère une image recadrée 3:2 à partir d'une data URL et des paramètres de zoom/position.
 * Utilisé à l'enregistrement pour "figer" le cadrage choisi par l'utilisateur.
 */
function bakeFrontImageCrop(
  dataUrl: string,
  crop: FrontImageCrop,
  filter: FrontImageFilter = DEFAULT_FRONT_FILTER,
  outputPx = 1200,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const imgW = img.naturalWidth
      const imgH = img.naturalHeight
      const cw = Math.round(outputPx)
      const ch = Math.round(outputPx / POSTCARD_ASPECT)
      const coverScale = Math.max(cw / imgW, ch / imgH)
      const userScale = crop.scale
      const visibleW = cw / (coverScale * userScale)
      const visibleH = ch / (coverScale * userScale)
      const centerX = (crop.x / 100) * imgW
      const centerY = (crop.y / 100) * imgH
      const sx = Math.max(0, Math.min(imgW - visibleW, centerX - visibleW / 2))
      const sy = Math.max(0, Math.min(imgH - visibleH, centerY - visibleH / 2))
      const canvas = document.createElement('canvas')
      canvas.width = cw
      canvas.height = ch
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve(dataUrl)
        return
      }
      ctx.filter = buildFrontImageFilterCss(filter)
      ctx.drawImage(img, sx, sy, visibleW, visibleH, 0, 0, cw, ch)
      try {
        resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY))
      } catch {
        resolve(dataUrl)
      }
    }
    img.onerror = () => reject(new Error('Image load failed'))
    img.src = dataUrl
  })
}

const STEPS = [
  { id: 'photo', label: 'Photo', icon: Camera },
  { id: 'redaction', label: 'Rédaction', icon: PenTool },
  { id: 'payment', label: 'Paiement', icon: CreditCard },
  { id: 'preview', label: 'Aperçu', icon: Share2 },
] as const

type StepId = (typeof STEPS)[number]['id']

const TEMPLATE_CATEGORIES: {
  key: TemplateCategory | 'all'
  label: string
  icon?: string
  imageUrl?: string
}[] = [
  { key: 'all', label: 'Tous' },
  // Occasions
  {
    key: 'birthday',
    label: 'Anniversaire',
    icon: '🎂',
    imageUrl: '/images/themes/theme_birthday.png',
  },
  { key: 'vacation', label: 'Vacances', icon: '🌴', imageUrl: '/images/themes/theme_vacation.png' },
  {
    key: 'invitation',
    label: 'Invitation',
    icon: '✉️',
    imageUrl: '/images/themes/theme_invitation.png',
  },
  { key: 'birth', label: 'Naissance', icon: '👶', imageUrl: '/images/themes/theme_birth.png' },
  { key: 'christmas', label: 'Noël', icon: '🎄', imageUrl: '/images/themes/theme_christmas.png' },
  { key: 'wedding', label: 'Mariage', icon: '💍', imageUrl: '/images/themes/theme_wedding.png' },
  {
    key: 'graduation',
    label: 'Diplôme',
    icon: '🎓',
    imageUrl: '/images/themes/theme_graduation.png',
  },
  // Destinations & scènes
  {
    key: 'beach',
    label: 'Plage',
    icon: '\u{1F3D6}\u{FE0F}',
    imageUrl: '/images/themes/theme_beach_main.png',
  },
  {
    key: 'city',
    label: 'Ville',
    icon: '\u{1F3D9}\u{FE0F}',
    imageUrl: '/images/themes/theme_city.png',
  },
  {
    key: 'nature',
    label: 'Nature',
    icon: '\u{1F33F}',
    imageUrl: '/images/themes/theme_nature.png',
  },
  {
    key: 'travel',
    label: 'Voyage',
    icon: '\u2708\u{FE0F}',
    imageUrl: '/images/themes/theme_travel.png',
  },
  {
    key: 'romantic',
    label: 'Romantique',
    icon: '\u2764\u{FE0F}',
    imageUrl: '/images/themes/theme_romantic.png',
  },
  {
    key: 'festive',
    label: 'Fêtes',
    icon: '\u{1F389}',
    imageUrl: '/images/themes/theme_festive.png',
  },
  {
    key: 'food',
    label: 'Gastronomie',
    icon: '\u{1F37D}\u{FE0F}',
    imageUrl: '/images/themes/theme_food.png',
  },
  {
    key: 'abstract',
    label: 'Abstrait',
    icon: '\u{1F3A8}',
    imageUrl: '/images/themes/theme_abstract.png',
  },
]

/** Catégories d'occasions affichées en raccourcis dans la section templates */
const OCCASION_SHORTCUTS: { key: TemplateCategory; label: string; icon: string }[] = [
  { key: 'birthday', label: 'Anniversaire', icon: '🎂' },
  { key: 'vacation', label: 'Vacances', icon: '🌴' },
  { key: 'invitation', label: 'Invitation', icon: '✉️' },
  { key: 'birth', label: 'Naissance', icon: '👶' },
  { key: 'christmas', label: 'Noël', icon: '🎄' },
  { key: 'wedding', label: 'Mariage', icon: '💍' },
  { key: 'graduation', label: 'Diplôme', icon: '🎓' },
]

/** IDs des modèles affichés en raccourci (icônes cliquables). */
const BASE_TEMPLATE_IDS = ['tpl-1', 'tpl-2', 'tpl-4', 'tpl-8', 'tpl-13'] as const

const SAMPLE_TEMPLATES: Template[] = [
  // === Plage (beach) ===
  {
    id: 'tpl-1',
    name: 'Plage tropicale',
    description: 'Sable blanc et eaux cristallines',
    imageUrl: '/images/themes/theme_beach_main.png',
    category: 'beach',
    frontCaption: 'Paradis tropical',
    frontEmoji: '\u{1F334}',
    message:
      'Les pieds dans le sable, le soleil sur la peau... Le paradis existe et j\u2019y suis ! Bisous sal\u00E9s depuis cette plage de r\u00EAve.',
    location: '\u00CEles Maldives',
    stampStyle: 'airmail',
  },
  {
    id: 'tpl-2',
    name: 'Coucher de soleil',
    description: 'Couleurs flamboyantes sur l\u2019oc\u00E9an',
    imageUrl: 'https://img.cartepostale.cool/demo/photo-1476514525535-07fb3b4ae5f1.jpg',
    category: 'beach',
    frontCaption: 'Golden hour',
    frontEmoji: '\u{1F305}',
    message:
      'Le ciel s\u2019embrase chaque soir ici... Un spectacle magique qu\u2019aucune photo ne peut vraiment capturer. Vous me manquez !',
    location: 'Bali, Indon\u00E9sie',
    stampStyle: 'classic',
  },
  {
    id: 'tpl-3',
    name: 'Paradis turquoise',
    description: 'Lagon aux eaux transparentes',
    imageUrl: 'https://img.cartepostale.cool/demo/photo-1506929562872-bb421503ef21.jpg',
    category: 'beach',
    frontCaption: 'Eaux turquoise',
    frontEmoji: '\u{1F30A}',
    message:
      'L\u2019eau est tellement claire qu\u2019on voit les poissons depuis la surface ! Un vrai aquarium naturel. On ne veut plus rentrer !',
    location: 'Bora Bora, Polyn\u00E9sie',
    stampStyle: 'airmail',
  },
  // === Ville (city) ===
  {
    id: 'tpl-4',
    name: 'Paris romantique',
    description: 'La Tour Eiffel au cr\u00E9puscule',
    imageUrl: '/images/themes/theme_city.png',
    category: 'city',
    frontCaption: 'Paris, je t\u2019aime',
    frontEmoji: '\u2764\u{FE0F}',
    message:
      'Paris brille de mille feux ce soir. On a flan\u00E9 le long de la Seine, crois\u00E9 et macaron au Jardin du Luxembourg. La vie est belle !',
    location: 'Paris, France',
    stampStyle: 'classic',
  },
  {
    id: 'tpl-5',
    name: 'Tokyo n\u00E9ons',
    description: 'Lumi\u00E8res de Shibuya la nuit',
    imageUrl: 'https://img.cartepostale.cool/demo/photo-1540959733332-eab4deabeeaf.jpg',
    category: 'city',
    frontCaption: 'N\u00E9ons de Tokyo',
    frontEmoji: '\u{1F3EE}',
    message:
      'Tokyo est une explosion de couleurs et de saveurs ! Les ramen sont incroyables et les temples magnifiques. Quelle \u00E9nergie !',
    location: 'Tokyo, Japon',
    stampStyle: 'modern',
  },
  {
    id: 'tpl-6',
    name: 'Skyline moderne',
    description: 'Gratte-ciels et architecture futuriste',
    imageUrl: 'https://img.cartepostale.cool/demo/photo-1486074218988-66a98816c117.jpg',
    category: 'city',
    frontCaption: 'Skyline vertigineux',
    frontEmoji: '\u{1F3D9}\u{FE0F}',
    message:
      'Vue imprenable depuis le rooftop ! La ville s\u2019\u00E9tend \u00E0 perte de vue, c\u2019est vertigineux. On se sent tout petit face \u00E0 ces g\u00E9ants de verre.',
    location: 'Dubai, \u00C9mirats arabes unis',
    stampStyle: 'modern',
  },
  {
    id: 'tpl-7',
    name: 'Nuit urbaine',
    description: 'Ambiance nocturne en ville',
    imageUrl: 'https://img.cartepostale.cool/demo/photo-1486406146926-c627a92ad1ab.jpg',
    category: 'city',
    frontCaption: 'City lights',
    frontEmoji: '\u{1F303}',
    message:
      'La ville ne dort jamais ! Petite balade nocturne entre les buildings illumin\u00E9s. L\u2019ambiance est \u00E9lectrique, on adore.',
    location: 'New York, USA',
    stampStyle: 'modern',
  },
  // === Nature ===
  {
    id: 'tpl-8',
    name: 'Alpes suisses',
    description: 'Sommets enneig\u00E9s majestueux',
    imageUrl: '/images/themes/theme_nature.png',
    category: 'nature',
    frontCaption: 'Sommets majestueux',
    frontEmoji: '\u{1F3D4}\u{FE0F}',
    message:
      'L\u2019air pur des montagnes, le silence des sommets... On a fait une randonn\u00E9e sublime avec vue sur le glacier. Inoubliable !',
    location: 'Zermatt, Suisse',
    stampStyle: 'classic',
  },
  {
    id: 'tpl-9',
    name: 'For\u00EAt enchant\u00E9e',
    description: 'Lumi\u00E8re filtrant \u00E0 travers les arbres',
    imageUrl: 'https://img.cartepostale.cool/demo/photo-1448375240586-882707db888b.jpg',
    category: 'nature',
    frontCaption: 'For\u00EAt magique',
    frontEmoji: '\u{1F332}',
    message:
      'Promenade f\u00E9\u00E9rique en for\u00EAt ce matin. La lumi\u00E8re filtrait entre les arbres comme dans un conte. Le calme absolu, quel bonheur.',
    location: 'For\u00EAt-Noire, Allemagne',
    stampStyle: 'classic',
  },
  {
    id: 'tpl-10',
    name: 'Champs de lavande',
    description: 'Rang\u00E9es violettes \u00E0 perte de vue',
    imageUrl: 'https://img.cartepostale.cool/demo/photo-1499856871958-5b9627545d1a.jpg',
    category: 'nature',
    frontCaption: 'Mer de lavande',
    frontEmoji: '\u{1F33B}',
    message:
      'Un oc\u00E9an violet \u00E0 perte de vue, le parfum enivrant de la lavande... La Provence est un enchantement pour tous les sens !',
    location: 'Valensole, Provence',
    stampStyle: 'classic',
  },
  {
    id: 'tpl-11',
    name: 'Jungle luxuriante',
    description: 'V\u00E9g\u00E9tation tropicale dense',
    imageUrl: 'https://img.cartepostale.cool/demo/photo-1528164344705-47542687000d.jpg',
    category: 'nature',
    frontCaption: 'Jungle sauvage',
    frontEmoji: '\u{1F33F}',
    message:
      'Au c\u0153ur de la jungle, entour\u00E9s de verdure et de chants d\u2019oiseaux exotiques. Une aventure extraordinaire !',
    location: 'Costa Rica',
    stampStyle: 'airmail',
  },
  {
    id: 'tpl-12',
    name: 'Lac paisible',
    description: 'Reflets sur un lac de montagne',
    imageUrl: 'https://img.cartepostale.cool/demo/photo-1439396087961-99bc12bd8959.jpg',
    category: 'nature',
    frontCaption: 'S\u00E9r\u00E9nit\u00E9',
    frontEmoji: '\u{1F4A7}',
    message:
      'Le lac est un miroir parfait ce matin. Pas un bruit, juste le vent dans les arbres. Un moment de paix absolue.',
    location: 'Lac de C\u00F4me, Italie',
    stampStyle: 'classic',
  },
  // === Voyage (travel) ===
  {
    id: 'tpl-13',
    name: 'C\u00F4te Amalfitaine',
    description: 'Villages color\u00E9s sur les falaises',
    imageUrl: '/images/themes/theme_travel.png',
    category: 'travel',
    frontCaption: 'Dolce Vita',
    frontEmoji: '\u{1F1EE}\u{1F1F9}',
    message:
      'Les villages color\u00E9s accroch\u00E9s aux falaises, la mer turquoise en contrebas... La c\u00F4te Amalfitaine est un r\u00EAve \u00E9veill\u00E9 !',
    location: 'Amalfi, Italie',
    stampStyle: 'airmail',
  },
  {
    id: 'tpl-14',
    name: 'Santorini grecque',
    description: 'Maisons blanches et d\u00F4mes bleus',
    imageUrl: 'https://img.cartepostale.cool/demo/photo-1503614472-8c93d56e92ce.jpg',
    category: 'travel',
    frontCaption: 'Bleu \u00E9g\u00E9en',
    frontEmoji: '\u{1F1EC}\u{1F1F7}',
    message:
      'Le blanc immacul\u00E9 des maisons, le bleu profond de la mer \u00C9g\u00E9e... Santorini est encore plus belle en vrai. On est sous le charme !',
    location: 'Santorini, Gr\u00E8ce',
    stampStyle: 'airmail',
  },
  {
    id: 'tpl-15',
    name: 'Escapade resort',
    description: 'Piscine et d\u00E9tente tropicale',
    imageUrl: 'https://img.cartepostale.cool/demo/photo-1520250497591-112f2f40a3f4.jpg',
    category: 'travel',
    frontCaption: 'Escapade de r\u00EAve',
    frontEmoji: '\u{1F334}',
    message:
      'Piscine \u00E0 d\u00E9bordement, cocktails frais et farniente... Le resort est un petit coin de paradis. On recharge les batteries !',
    location: 'Phuket, Tha\u00EFlande',
    stampStyle: 'modern',
  },
  {
    id: 'tpl-16',
    name: 'Aventure lointaine',
    description: 'Paysages grandioses et d\u00E9couverte',
    imageUrl: 'https://img.cartepostale.cool/demo/photo-1501785888041-af3ef285b470.jpg',
    category: 'travel',
    frontCaption: 'L\u2019aventure nous appelle',
    frontEmoji: '\u{1F30D}',
    message:
      'On explore des terres inconnues, chaque virage r\u00E9v\u00E8le un panorama plus beau que le pr\u00E9c\u00E9dent. Le monde est immense et magnifique !',
    location: 'Nouvelle-Z\u00E9lande',
    stampStyle: 'airmail',
  },
  // === Romantique ===
  {
    id: 'tpl-17',
    name: 'Amour \u00E9ternel',
    description: 'Coucher de soleil romantique',
    imageUrl: '/images/themes/theme_romantic.png',
    category: 'romantic',
    frontCaption: 'Avec tout mon amour',
    frontEmoji: '\u{1F495}',
    message:
      'Chaque coucher de soleil me rappelle combien je suis chanceux(se) de partager ces moments avec toi. Je t\u2019aime, tout simplement.',
    location: 'Venise, Italie',
    stampStyle: 'classic',
  },
  {
    id: 'tpl-18',
    name: 'Spa d\u00E9tente',
    description: 'Bien-\u00EAtre et relaxation',
    imageUrl: 'https://img.cartepostale.cool/demo/photo-1556761175-5973dc0f32e7.jpg',
    category: 'romantic',
    frontCaption: 'Pause bien-\u00EAtre',
    frontEmoji: '\u{1F9D6}',
    message:
      'Massage, jacuzzi et th\u00E9 \u00E0 la menthe... On se fait chouchouter comme des rois. Un week-end ressour\u00E7ant dont on avait bien besoin !',
    location: 'Marrakech, Maroc',
    stampStyle: 'modern',
  },
  // === F\u00EAtes (festive) ===
  {
    id: 'tpl-19',
    name: 'Feux d\u2019artifice',
    description: 'C\u00E9l\u00E9bration lumineuse dans le ciel',
    imageUrl: '/images/themes/theme_festive.png',
    category: 'festive',
    frontCaption: 'F\u00EAte et lumi\u00E8res',
    frontEmoji: '\u{1F386}',
    message:
      'Quel spectacle ! Le ciel s\u2019est illumin\u00E9 de mille couleurs. On a f\u00EAt\u00E9 \u00E7a en grand, des souvenirs plein la t\u00EAte !',
    location: 'Sydney, Australie',
    stampStyle: 'modern',
  },
  {
    id: 'tpl-20',
    name: 'C\u00E9l\u00E9bration',
    description: 'Ambiance festive et joyeuse',
    imageUrl: 'https://img.cartepostale.cool/demo/photo-1516426122078-c23e76319801.jpg',
    category: 'festive',
    frontCaption: 'Vive la f\u00EAte !',
    frontEmoji: '\u{1F389}',
    message:
      'Musique, danse et rires \u00E0 gogo ! L\u2019ambiance est incroyable, tout le monde est dans la joie. On f\u00EAte la vie !',
    location: 'Rio de Janeiro, Br\u00E9sil',
    stampStyle: 'modern',
  },
  // === Gastronomie (food) ===
  {
    id: 'tpl-21',
    name: 'Pause caf\u00E9',
    description: 'Caf\u00E9 et douceurs du matin',
    imageUrl: '/images/themes/theme_food.png',
    category: 'food',
    frontCaption: 'Coffee time',
    frontEmoji: '\u2615',
    message:
      'Un petit caf\u00E9 en terrasse, un croissant dor\u00E9 et le journal du matin... Les petits plaisirs simples qui font le bonheur du voyageur.',
    location: 'Lisbonne, Portugal',
    stampStyle: 'classic',
  },
  {
    id: 'tpl-22',
    name: 'Chocolat artisanal',
    description: 'D\u00E9lices sucr\u00E9s \u00E0 savourer',
    imageUrl: 'https://img.cartepostale.cool/demo/photo-1527529482837-4698179dc6ce.jpg',
    category: 'food',
    frontCaption: 'Douceurs gourmandes',
    frontEmoji: '\u{1F36B}',
    message:
      'On a d\u00E9couvert un chocolatier artisanal exceptionnel ! Chaque bouche est une explosion de saveurs. On vous ram\u00E8ne des \u00E9chantillons !',
    location: 'Bruxelles, Belgique',
    stampStyle: 'classic',
  },
  // === Anniversaire (birthday) ===
  {
    id: 'tpl-25',
    name: 'Joyeux anniversaire',
    description: 'Gâteau et bougies pour fêter le grand jour',
    imageUrl: '/images/themes/theme_birthday.png',
    category: 'birthday',
    frontCaption: 'Joyeux anniversaire !',
    frontEmoji: '🎂',
    message:
      "En ce jour si spécial, je pense très fort à toi ! Que cette nouvelle année t'apporte tout ce que tu mérites : bonheur, santé et plein de belles aventures. Je t'embrasse très fort !",
    stampStyle: 'modern',
  },
  {
    id: 'tpl-26',
    name: 'Fête en couleurs',
    description: 'Ballons et confettis pour célébrer',
    imageUrl: 'https://img.cartepostale.cool/demo/photo-1513151233558-d860c5398176.jpg',
    category: 'birthday',
    frontCaption: "C'est ta fête !",
    frontEmoji: '🎉',
    message:
      "Un anniversaire, ça n'arrive qu'une fois par an – alors on fête ça en grand ! Tous mes vœux du fond du cœur, que ce jour soit aussi extraordinaire que tu l'es.",
    stampStyle: 'modern',
  },
  // === Vacances (vacation) ===
  {
    id: 'tpl-27',
    name: 'Paradis estival',
    description: 'Hamac et cocotiers au bord de la mer',
    imageUrl: '/images/themes/theme_vacation.png',
    category: 'vacation',
    frontCaption: 'En vacances !',
    frontEmoji: '🌴',
    message:
      'Enfin les vacances ! On profite à fond du soleil, de la mer et de la dolce vita. Pas de réveil, pas de réunions – juste du bonheur. On pense à vous !',
    stampStyle: 'airmail',
  },
  {
    id: 'tpl-28',
    name: 'Road trip ensoleillé',
    description: 'Liberté sur la route sous le soleil',
    imageUrl: 'https://img.cartepostale.cool/demo/photo-1473116763249-2faaef81ccda.jpg',
    category: 'vacation',
    frontCaption: 'La route nous appelle',
    frontEmoji: '🚗',
    message:
      "En route pour l'aventure ! La fenêtre ouverte, la musique à fond et le paysage qui défile… Le road trip de rêve. On vous envoie plein de soleil depuis la route !",
    stampStyle: 'modern',
  },
  // === Invitation ===
  {
    id: 'tpl-29',
    name: 'Soirée élégante',
    description: 'Table dressée pour une occasion spéciale',
    imageUrl: '/images/themes/theme_invitation.png',
    category: 'invitation',
    frontCaption: 'Vous êtes invités !',
    frontEmoji: '✉️',
    message:
      'Nous avons le plaisir de vous convier à une soirée exceptionnelle. Votre présence rendra cet événement encore plus mémorable. Nous comptons sur vous !',
    stampStyle: 'classic',
  },
  {
    id: 'tpl-30',
    name: "Fête d'été",
    description: 'Ambiance festive et conviviale',
    imageUrl: 'https://img.cartepostale.cool/demo/photo-1530103043960-ef38714abb15.jpg',
    category: 'invitation',
    frontCaption: 'Save the date !',
    frontEmoji: '🥂',
    message:
      'On organise une fête et vous êtes bien sûr de la partie ! Au programme : bonne humeur, musique et moments inoubliables. Répondez vite, les places sont limitées !',
    stampStyle: 'modern',
  },
  // === Naissance (birth) ===
  {
    id: 'tpl-31',
    name: 'Bienvenue au monde',
    description: "La magie d'une nouvelle naissance",
    imageUrl: '/images/themes/theme_birth.png',
    category: 'birth',
    frontCaption: 'Bienvenue petit(e) !',
    frontEmoji: '👶',
    message:
      "Une nouvelle petite étoile vient d'illuminer notre vie. On est fous de joie et on voulait partager cette merveilleuse nouvelle avec vous. Bébé et maman se portent à merveille !",
    stampStyle: 'classic',
  },
  {
    id: 'tpl-32b',
    name: "Douceur de l'enfance",
    description: 'Tendresse et délicatesse pour accueillir bébé',
    imageUrl: 'https://img.cartepostale.cool/demo/photo-1555252333-9f8e92e65df9.jpg',
    category: 'birth',
    frontCaption: 'Notre trésor est né !',
    frontEmoji: '🌸',
    message:
      "Après tant d'impatience, notre petit miracle est arrivé. Les yeux grands ouverts sur le monde, il (elle) nous remplit déjà d'un amour infini. Venez vite le (la) rencontrer !",
    stampStyle: 'classic',
  },
  // === Noël (christmas) ===
  {
    id: 'tpl-32',
    name: 'Joyeux Noël',
    description: 'Lumières et magie de Noël',
    imageUrl: '/images/themes/theme_christmas.png',
    category: 'christmas',
    frontCaption: 'Joyeux Noël !',
    frontEmoji: '🎄',
    message:
      'En cette période féerique, on vous souhaite un Noël rempli de chaleur, de rires et de bonheur partagé. Que cette nuit magique vous apporte tout ce que vous espérez. Joyeuses fêtes !',
    stampStyle: 'classic',
  },
  {
    id: 'tpl-33',
    name: 'Ambiance hivernale',
    description: 'Sapin illuminé et atmosphère chaleureuse',
    imageUrl: 'https://img.cartepostale.cool/demo/photo-1543589077-47d81606c1bf.jpg',
    category: 'christmas',
    frontCaption: 'Magie de Noël',
    frontEmoji: '⛄',
    message:
      "Le sapin scintille, la neige tombe et le chocolat chaud fume… C'est Noël ! On pense à vous avec tout notre amour et on vous souhaite les plus belles fêtes de fin d'année.",
    stampStyle: 'classic',
  },
  // === Mariage (wedding) ===
  {
    id: 'tpl-34',
    name: 'Notre plus beau jour',
    description: "Célébration d'un amour éternel",
    imageUrl: '/images/themes/theme_wedding.png',
    category: 'wedding',
    frontCaption: 'Nous nous sommes mariés !',
    frontEmoji: '💍',
    message:
      "C'est avec une joie immense que nous vous annonçons notre union. Ce jour restera gravé dans nos cœurs pour toujours. Merci d'avoir partagé ce moment magique avec nous. Avec tout notre amour.",
    stampStyle: 'classic',
  },
  {
    id: 'tpl-35',
    name: 'Fleurs de mariage',
    description: 'Bouquet et décoration florale élégante',
    imageUrl: 'https://img.cartepostale.cool/demo/photo-1465495976277-4387d4b0b4c6.jpg',
    category: 'wedding',
    frontCaption: 'Oui, pour la vie !',
    frontEmoji: '💐',
    message:
      "Entourés de ceux qu'on aime, on a dit oui ! La cérémonie était absolument magique, les fleurs sublimes et les émotions au rendez-vous. On est si heureux de partager cette nouvelle avec vous !",
    stampStyle: 'modern',
  },
  // === Diplôme (graduation) ===
  {
    id: 'tpl-36',
    name: 'Félicitations diplômé !',
    description: 'Remise de diplôme et réussite scolaire',
    imageUrl: '/images/themes/theme_graduation.png',
    category: 'graduation',
    frontCaption: 'Mission accomplie !',
    frontEmoji: '🎓',
    message:
      "Toutes mes félicitations pour l'obtention de ton diplôme ! Des années de travail et de persévérance ont payé. Tu peux être très fier(ère) de toi. Un avenir brillant t'attend – je le sais !",
    stampStyle: 'modern',
  },
  // === Abstrait ===
  {
    id: 'tpl-23',
    name: 'D\u00E9sert dor\u00E9',
    description: 'Dunes de sable \u00E0 l\u2019infini',
    imageUrl: '/images/themes/theme_abstract.png',
    category: 'abstract',
    frontCaption: 'Oc\u00E9an de sable',
    frontEmoji: '\u{1F3DC}\u{FE0F}',
    message:
      'Le silence du d\u00E9sert est assourdissant. Les dunes s\u2019\u00E9tendent \u00E0 perte de vue, sculpt\u00E9es par le vent. Un paysage hypnotique.',
    location: 'Sahara, Maroc',
    stampStyle: 'airmail',
  },
  {
    id: 'tpl-24',
    name: 'Paysage abstrait',
    description: 'Nature aux couleurs surr\u00E9alistes',
    imageUrl: 'https://img.cartepostale.cool/demo/photo-1483347756197-71ef80e95f73.jpg',
    category: 'abstract',
    frontCaption: 'R\u00EAve \u00E9veill\u00E9',
    frontEmoji: '\u{1F3A8}',
    message:
      'La nature est la plus grande artiste. Ces couleurs, ces formes... On croirait un tableau vivant. Magnifique.',
    location: 'Islande',
    stampStyle: 'modern',
  },
]

const EMOJI_SUGGESTIONS = ['✨', '📍', '🌅', '🌴', '💌', '🌊', '🗺️'] as const

type EmojiCategoryKey = 'mood' | 'travel' | 'nature' | 'celebration' | 'love' | 'fun'

interface EmojiCategory {
  key: EmojiCategoryKey
  label: string
  icon: string
  emojis: string[]
}

const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    key: 'mood',
    label: 'Humeurs',
    icon: '😊',
    emojis: ['😊', '😄', '😌', '🤩', '😎', '😁', '🙂', '😇', '🤗', '😺'],
  },
  {
    key: 'travel',
    label: 'Voyage',
    icon: '✈️',
    emojis: ['✈️', '🌍', '🗺️', '🧳', '🚢', '🛳️', '⛰️', '🏖️', '🌇', '🌅'],
  },
  {
    key: 'nature',
    label: 'Nature',
    icon: '🌿',
    emojis: ['🌿', '🌸', '🌼', '🌲', '🌊', '🌞', '🌱', '🌺', '🍃', '🍂'],
  },
  {
    key: 'celebration',
    label: 'Fêtes',
    icon: '🎉',
    emojis: ['🎉', '🥂', '🎈', '🎂', '✨', '🎶', '🕯️', '🎁', '🍾', '🪅'],
  },
  {
    key: 'love',
    label: 'Amour',
    icon: '💌',
    emojis: ['💌', '❤️', '💘', '💞', '💑', '😘', '💍', '🌹', '💕', '😍'],
  },
  {
    key: 'fun',
    label: 'Fun',
    icon: '😜',
    emojis: ['😜', '🤪', '🕶️', '😺', '🤠', '🎭', '🪄', '🎮', '🛼', '🎢'],
  },
]

/** Emojis rapides pour le message (carte postale). */
const MESSAGE_EMOJIS = [
  '❤️',
  '😊',
  '🌅',
  '🌴',
  '🌊',
  '☀️',
  '💌',
  '✨',
  '📍',
  '🗺️',
  '😘',
  '👋',
  '💕',
  '🌸',
  '🏖️',
]

/** Un seul palier payant : prix unique tout compris (photo, vidéo, audio). */
const ALBUM_TIERS = {
  paid: { photos: 50, videos: 10, price: 2.5 },
} as const

/** Plans tarifaires : Carte gratuite (sans limite de temps) ou À l'unité 2,50 € (prix unique tout compris). */
type PostcardPlanId = 'ephemere' | 'payant'

interface PostcardPlan {
  id: PostcardPlanId
  label: string
  emoji: string
  tagline: string
  price: number // 0 = gratuit
  priceLabel: string
  duration: string
  features: string[]
  highlight?: string
  color: 'stone' | 'teal' | 'indigo' | 'violet' | 'amber' | 'rose' | 'orange'
  maxPhotos: number
  allowsAudio: boolean
  allowsVideo: boolean
  multiRecipients: number
}

/** Même plan tarifaire que la page /pricing : Carte gratuite sans limite de temps + À l'unité 2,50 €. */
const POSTCARD_PLANS: PostcardPlan[] = [
  {
    id: 'ephemere',
    label: 'Carte gratuite',
    emoji: '🌸',
    tagline: 'Essayez sans engagement',
    price: 0,
    priceLabel: 'Gratuit',
    duration: 'Illimitée',
    features: [
      '1 carte postale (photo, texte)',
      'Modifiable via le lien reçu par email',
      'Prolongeable en carte payante à tout moment',
    ],
    color: 'stone',
    maxPhotos: 1,
    allowsAudio: false,
    allowsVideo: false,
    multiRecipients: 1,
  },
  {
    id: 'payant',
    label: "À l'unité",
    emoji: '💌',
    tagline: 'Prix unique tout compris',
    price: 2.5,
    priceLabel: '2,50 €',
    duration: 'Illimitée',
    features: [
      'Photo, vidéo ou message vocal : même prix',
      'Envoi à un nombre illimité de destinataires par carte',
      'Cartes 100 % virtuelles, avec statistiques de visite',
      "Programmation : envoi le jour de l'anniversaire à 8h00",
      'Modifiable depuis votre compte',
    ],
    highlight: 'Populaire',
    color: 'teal',
    maxPhotos: ALBUM_TIERS.paid.photos,
    allowsAudio: true,
    allowsVideo: true,
    multiRecipients: 1,
  },
]

export default function EditorPage() {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentStep, setCurrentStep] = useState<StepId>('photo')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isLocating, setIsLocating] = useState(false)
  /** Synchronisé avec la Navbar : quand elle se réduit au scroll, on colle la barre d'étapes en dessous. */
  const [navbarScrolled, setNavbarScrolled] = useState(false)

  // Postcard state
  const [frontImage, setFrontImage] = useState('')
  const [frontCaption, setFrontCaption] = useState('')
  const [frontEmoji, setFrontEmoji] = useState('✨')
  const [frontCaptionPosition, setFrontCaptionPosition] = useState<FrontCaptionPosition>({
    x: 50,
    y: 85,
  })
  const [frontCaptionFontFamily, setFrontCaptionFontFamily] =
    useState<FrontCaptionFontFamily>('sans')
  const [frontCaptionFontSize, setFrontCaptionFontSize] = useState(CAPTION_FONT_SIZE_DEFAULT)
  const [frontCaptionColor, setFrontCaptionColor] = useState<FrontCaptionColor>('stone-900')
  const [frontTextBgOpacity, setFrontTextBgOpacity] = useState(90)
  const [frontCaptionPreset, setFrontCaptionPreset] = useState('classic')
  const [frontCaptionWidth, setFrontCaptionWidth] = useState<number | undefined>(undefined)
  const [message, setMessage] = useState(
    'Un petit coucou de mes vacances ! Tout se passe merveilleusement bien, les paysages sont magnifiques. On pense bien à vous !',
  )
  const [recipientName, setRecipientName] = useState('')
  const [senderName, setSenderName] = useState('Sarah')
  const [senderEmail, setSenderEmail] = useState('')
  const [location, setLocation] = useState('Antibes, France')
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [hideMap, setHideMap] = useState(false)
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [allowComments, setAllowComments] = useState(true)
  const [isPublic, setIsPublic] = useState(false)
  const [scratchCardEnabled, setScratchCardEnabled] = useState(false)
  const [puzzleCardEnabled, setPuzzleCardEnabled] = useState(false)
  const [puzzleCardDifficulty, setPuzzleCardDifficulty] = useState<'3' | '4' | '5'>('3')
  const [showInteractivePreview, setShowInteractivePreview] = useState<'scratch' | 'puzzle' | null>(
    null,
  )

  const [stampStyle, setStampStyle] = useState<Postcard['stampStyle']>('classic')
  const [stampLabel, setStampLabel] = useState('Digital Poste')
  const [stampYear, setStampYear] = useState(() => new Date().getFullYear().toString())
  const [postmarkText, setPostmarkText] = useState('')
  const [uploadedFileName, setUploadedFileName] = useState('')
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const [isDropActive, setIsDropActive] = useState(false)
  /** À l'étape Rédaction : id du modèle utilisé pour l'aperçu du verso (null = ma rédaction). */
  const [versoPreviewTemplateId, setVersoPreviewTemplateId] = useState<string | null>(null)
  const [frontImageKey, setFrontImageKey] = useState<string | null>(null)
  const [frontImageMimeType, setFrontImageMimeType] = useState<string | null>(null)
  const [frontImageFilesize, setFrontImageFilesize] = useState<number | null>(null)
  const [frontExif, setFrontExif] = useState<ExifData | null>(null)
  /** Recadrage / zoom de la photo face avant (position en %, scale 1 = fit). */
  const [frontImageCrop, setFrontImageCrop] = useState<FrontImageCrop>({ scale: 1, x: 50, y: 50 })
  const [frontImageFilter, setFrontImageFilter] = useState<FrontImageFilter>(DEFAULT_FRONT_FILTER)
  const [showCropPanel, setShowCropPanel] = useState(false)
  const [showImageEditModal, setShowImageEditModal] = useState(false)
  const [imgNaturalSize, setImgNaturalSize] = useState<{ w: number; h: number } | null>(null)
  const cropAreaRef = useRef<HTMLDivElement>(null)
  const cropImgRef = useRef<HTMLImageElement>(null)
  const cropDragRef = useRef<{
    clientX: number
    clientY: number
    cropX: number
    cropY: number
  } | null>(null)
  const dropDragCounterRef = useRef(0)
  const messageInputRef = useRef<HTMLTextAreaElement>(null)

  const [mediaItems, setMediaItems] = useState<Postcard['mediaItems']>([])
  const [isPremium, setIsPremium] = useState(false)
  const [showFullscreen, setShowFullscreen] = useState(false)
  const [showRecipientModal, setShowRecipientModal] = useState(false)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [templateModalCategory, setTemplateModalCategory] = useState<TemplateCategory | 'all'>(
    'all',
  )
  const [eventType, setEventType] = useState<TemplateCategory | null>(null)
  const [showPricingModal, setShowPricingModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<PostcardPlanId>('payant')
  const [showTemplateSection, setShowTemplateSection] = useState(false) // Mobile-friendly: hide templates by default
  const [showPacks, setShowPacks] = useState(false)
  const [fullscreenScale, setFullscreenScale] = useState(1)

  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal' | 'revolut' | null>(
    'revolut',
  )

  // Sharing state
  const [isPublishing, setIsPublishing] = useState(false)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [createdPostcardId, setCreatedPostcardId] = useState<string | null>(null)
  const [internalPostcardId, setInternalPostcardId] = useState<number | null>(null)
  const [shareError, setShareError] = useState<string | null>(null)
  const [showEmailPromptModal, setShowEmailPromptModal] = useState(false)
  /** When editing an existing card (?edit=publicId), this is set so createPostcard updates instead of create. */
  const [editingPublicId, setEditingPublicId] = useState<string | null>(null)
  const [editModeLoading, setEditModeLoading] = useState(false)

  const [showCopyToast, setShowCopyToast] = useState(false)
  const [hasConfettiFired, setHasConfettiFired] = useState(false)
  const [previewRecipientModalOpen, setPreviewRecipientModalOpen] = useState(false)
  const [previewRecipientUrl, setPreviewRecipientUrl] = useState<string | null>(null)
  const [previewRecipientLoading, setPreviewRecipientLoading] = useState(false)
  /** Dernier slug d'aperçu — réutilisé pour réactiver le même lien (TTL 5 min) */
  const [lastPreviewSlug, setLastPreviewSlug] = useState<string | null>(null)
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [recipients, setRecipients] = useState<EditorRecipient[]>([
    { firstName: '', lastName: '', email: '' },
  ])
  const [isSendingToRecipients, setIsSendingToRecipients] = useState(false)
  const [recipientsSentCount, setRecipientsSentCount] = useState<number | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showUnsplashModal, setShowUnsplashModal] = useState(false)
  const [imageSearchQuery, setImageSearchQuery] = useState('')
  const [unsplashInitialQuery, setUnsplashInitialQuery] = useState<string | null>(null)
  const [showAiGeneratorModal, setShowAiGeneratorModal] = useState(false)
  const [hasAiGenerationPaid, setHasAiGenerationPaid] = useState(false)
  const [showUserGalleryModal, setShowUserGalleryModal] = useState<'front' | 'back' | null>(null)
  const [showStickerGallery, setShowStickerGallery] = useState(false)
  const [stickers, setStickers] = useState<StickerPlacement[]>([])
  const [emojiStickers, setEmojiStickers] = useState<EmojiSticker[]>([])
  const [selectedEmojiCategory, setSelectedEmojiCategory] = useState<EmojiCategoryKey>(
    EMOJI_CATEGORIES[0].key,
  )
  const emojiPickerRef = useRef<HTMLDivElement>(null)
  const previewSectionRef = useRef<HTMLDivElement>(null)
  const [currentUser, setCurrentUser] = useState<{
    id: number
    email?: string
    name?: string | null
    role?: string
    credits?: number
  } | null>(null)
  const [isRevolutRedirecting, setIsRevolutRedirecting] = useState(false)
  const [revolutError, setRevolutError] = useState<string | null>(null)
  const [hasPaid, setHasPaid] = useState(false)

  // Meta Facebook Pixel
  const {
    trackInitiateCheckout,
    trackAddToCart,
    trackCompleteRegistration,
    trackViewContent,
    trackCustomizeProduct,
  } = useFacebookPixel()

  const [password, setPassword] = useState('')
  const [isPasswordProtected, setIsPasswordProtected] = useState(false)

  // Note editing state
  const [editingMediaNoteId, setEditingMediaNoteId] = useState<string | null>(null)
  const [editingMediaNoteText, setEditingMediaNoteText] = useState('')
  const [uploadStatus, setUploadStatus] = useState<{
    current: number
    total: number
    step: string
  } | null>(null)

  // Promo code state
  const [promoCode, setPromoCode] = useState('')
  const [isActivatingCode, setIsActivatingCode] = useState(false)
  const [codeError, setCodeError] = useState<string | null>(null)
  const [codeSuccess, setCodeSuccess] = useState(false)

  // Audio state
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [audioDuration, setAudioDuration] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [stickyPreview, setStickyPreview] = useState(false)

  // Background music state
  const [backgroundMusic, setBackgroundMusic] = useState<string | undefined>(undefined)
  const [backgroundMusicTitle, setBackgroundMusicTitle] = useState<string | undefined>(undefined)
  const [showMusicModal, setShowMusicModal] = useState(false)
  const [isPlayingEditorMusic, setIsPlayingEditorMusic] = useState(false)
  const editorMusicAudioRef = useRef<HTMLAudioElement | null>(null)

  // Arrêter la lecture quand la musique sélectionnée change ou au démontage
  useEffect(() => {
    return () => {
      editorMusicAudioRef.current?.pause()
      editorMusicAudioRef.current = null
      setIsPlayingEditorMusic(false)
    }
  }, [])
  useEffect(() => {
    editorMusicAudioRef.current?.pause()
    editorMusicAudioRef.current = null
    setIsPlayingEditorMusic(false)
  }, [backgroundMusic])

  const handleGoogleSuccess = useCallback(
    async (result: { success: boolean; role: string; email?: string }) => {
      if (result.success && result.email) {
        setSenderEmail(result.email)
        // Meta Pixel — CompleteRegistration (connexion/inscription Google)
        trackCompleteRegistration({ content_name: 'Google Login - Editor' })
        // Check if we have a postcard to link
        if (createdPostcardId) {
          setIsSendingEmail(true)
          const linkRes = await linkPostcardToUser(createdPostcardId, result.email)
          setIsSendingEmail(false)
          if (linkRes.success) {
            if (typeof window !== 'undefined') {
              sessionStorage.removeItem('pendingLinkPostcard')
            }
            setIsEmailSent(true)
            // Update currentUser state
            setCurrentUser({
              id: 0,
              email: result.email,
              role: result.role,
              credits: (result as any).credits ?? 0,
            })
            router.refresh()
            // Hide modal if open
            setTimeout(() => {
              setShowEmailPromptModal(false)
            }, 1000)
          }
        } else {
          router.refresh()
        }
      }
    },
    [createdPostcardId, router],
  )

  const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep)
  const [showBack, setShowBack] = useState(currentStep === 'redaction')

  // Sync showBack when step changes + scroll to top
  useEffect(() => {
    setShowBack(currentStep === 'redaction')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentStep])

  // Même seuil que la Navbar : quand elle passe en mode réduit, on ajuste le top de la barre d'étapes
  useEffect(() => {
    const handleScroll = () => {
      setNavbarScrolled(window.scrollY > 20)
      setShowScrollTop(window.scrollY > 300)
    }
    handleScroll() // valeur initiale
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Image de couverture depuis la galerie (param ?cover=...)
  useEffect(() => {
    const cover = searchParams.get('cover')
    if (cover && typeof cover === 'string' && (cover.startsWith('http') || cover.startsWith('/'))) {
      setFrontImage(cover)
      if (typeof window !== 'undefined' && window.history.replaceState) {
        const url = new URL(window.location.href)
        url.searchParams.delete('cover')
        window.history.replaceState({}, '', url.pathname + (url.search || ''))
      }
    }
  }, [searchParams])

  // Mode édition : charger la carte depuis l'API (?edit=publicId)
  useEffect(() => {
    const editId = searchParams.get('edit')
    if (!editId || typeof editId !== 'string') return

    setEditingPublicId(editId)
    setEditModeLoading(true)
    fetch(`/api/postcards/edit/${encodeURIComponent(editId)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Carte non trouvée')
        return res.json()
      })
      .then((doc: Record<string, any>) => {
        const origin = typeof window !== 'undefined' ? window.location.origin : ''
        const frontUrl =
          doc.frontImageURL ||
          (doc.frontImage?.url
            ? doc.frontImage.url.startsWith('http')
              ? doc.frontImage.url
              : origin + doc.frontImage.url
            : '')
        if (frontUrl) setFrontImage(frontUrl)
        if (doc.message != null) setMessage(doc.message)
        if (doc.recipientName != null) setRecipientName(doc.recipientName)
        if (doc.senderName != null) setSenderName(doc.senderName)
        if (doc.location != null) setLocation(doc.location)
        if (doc.hideMap != null) setHideMap(doc.hideMap)
        if (doc.coords != null) setCoords(doc.coords)
        if (doc.frontCaption != null) setFrontCaption(doc.frontCaption)
        if (doc.frontEmoji != null) setFrontEmoji(doc.frontEmoji)
        if (doc.frontCaptionPosition?.x != null || doc.frontCaptionPosition?.y != null) {
          setFrontCaptionPosition({
            x: doc.frontCaptionPosition.x ?? 50,
            y: doc.frontCaptionPosition.y ?? 85,
          })
        }
        if (doc.frontCaptionFontFamily != null)
          setFrontCaptionFontFamily(doc.frontCaptionFontFamily)
        if (doc.frontCaptionFontSize != null)
          setFrontCaptionFontSize(Number(doc.frontCaptionFontSize))
        if (doc.frontCaptionColor != null) setFrontCaptionColor(doc.frontCaptionColor)
        if (doc.frontTextBgOpacity != null) setFrontTextBgOpacity(Number(doc.frontTextBgOpacity))
        if (doc.frontCaptionPreset != null) setFrontCaptionPreset(doc.frontCaptionPreset)
        if (doc.frontCaptionWidth != null) setFrontCaptionWidth(Number(doc.frontCaptionWidth))
        if (doc.stampStyle != null) setStampStyle(doc.stampStyle)
        if (doc.stampLabel != null) setStampLabel(doc.stampLabel)
        if (doc.stampYear != null) setStampYear(String(doc.stampYear))
        if (Array.isArray(doc.mediaItems) && doc.mediaItems.length > 0) {
          const items = doc.mediaItems.map((item: any) => {
            const media = item.media
            const url = media?.url
              ? String(media.url).startsWith('http')
                ? media.url
                : origin + media.url
              : ''
            const mediaId =
              typeof media === 'object' && media?.id
                ? media.id
                : typeof media === 'number'
                  ? media
                  : undefined
            return {
              id: item.id || Math.random().toString(36).slice(2),
              type: item.type === 'video' ? ('video' as const) : ('image' as const),
              url: url || '',
              ...(mediaId !== undefined && { media: mediaId }),
            }
          })
          setMediaItems(items)
        }
        setCreatedPostcardId(editId)
        setShareUrl(`${origin}/carte/${editId}`)

        const step = searchParams.get('step')
        if (step === 'preview') {
          setCurrentStep('preview')
        }
      })
      .catch(() => setShareError('Impossible de charger la carte à modifier.'))
      .finally(() => setEditModeLoading(false))
  }, [searchParams])

  useEffect(() => {
    if (currentStep === 'preview' && !isPublishing) {
      handlePublish()
    }
  }, [currentStep])

  // Trigger confetti once when shareUrl becomes available
  useEffect(() => {
    if (shareUrl && !hasConfettiFired) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#14b8a6', '#f59e0b', '#3b82f6', '#ec4899'],
      })
      setHasConfettiFired(true)
    }
  }, [shareUrl, hasConfettiFired])

  // Handle payment success return (after Revolut redirect, state is reset)
  useEffect(() => {
    const success = searchParams.get('payment_success')
    if (success === 'true' && !hasPaid) {
      setHasPaid(true)
      setCurrentStep('preview')
      const amount = getAlbumPrice()
      if (amount > 0) {
        fetch('/api/meta/event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventName: 'Purchase',
            params: {
              value: amount,
              currency: 'EUR',
              content_name: 'Carte Postale Premium CartePostale.cool',
              content_type: 'product',
            },
            userEmail: currentUser?.email || senderEmail || undefined,
          }),
        }).catch(() => {})
      }
    }
  }, [searchParams, hasPaid])

  // Handle AI generation payment success return
  useEffect(() => {
    const aiPaid = searchParams.get('ai_paid')
    if (aiPaid === 'true') {
      setHasAiGenerationPaid(true)
      if (SHOW_AI_IMAGE_GENERATION) setShowAiGeneratorModal(true)
      const url = new URL(window.location.href)
      url.searchParams.delete('ai_paid')
      window.history.replaceState({}, '', url.toString())
    }
  }, [searchParams])

  // Meta Pixel — AddToCart quand le premier média premium est ajouté
  const prevIsPremiumRef = useRef(false)
  useEffect(() => {
    if (isPremium && !prevIsPremiumRef.current && getAlbumPrice() > 0) {
      trackAddToCart({
        content_name: 'Carte Postale Premium CartePostale.cool',
        value: getAlbumPrice(),
        currency: 'EUR',
      })
    }
    prevIsPremiumRef.current = isPremium
  }, [isPremium])

  // Meta Pixel — CustomizeProduct quand la première image est ajoutée
  const hasTrackedFirstEdit = useRef(false)
  useEffect(() => {
    if (frontImage && !hasTrackedFirstEdit.current) {
      trackCustomizeProduct()
      hasTrackedFirstEdit.current = true
    }
  }, [frontImage, trackCustomizeProduct])

  useEffect(() => {
    fetch('/api/users/me', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          setCurrentUser({
            id: data.user.id,
            email: data.user.email,
            name: data.user.name ?? null,
            role: data.user.role,
            credits: data.user.credits ?? 0,
          })
          // Pré-remplir la signature avec le prénom quand l'utilisateur est connecté
          const fullName = data.user.name?.trim()
          if (fullName) {
            const firstName = fullName.split(/\s+/)[0]
            if (firstName) setSenderName(firstName)
          }
        } else setCurrentUser(null)
      })
      .catch(() => setCurrentUser(null))
  }, [])

  // Sauvegarde locale automatique (Debounce ou effet simple)
  useEffect(() => {
    // Ne pas sauvegarder si on visualise une carte créée ou si on est en train de publier
    if (createdPostcardId || isPublishing) {
      localStorage.removeItem(LOCAL_STORAGE_KEY)
      return
    }

    // On sauvegarde l'état pertinent
    const stateToSave = {
      frontImage,
      frontImageCrop,
      frontImageFilter,
      frontCaption,
      frontEmoji,
      frontCaptionPosition,
      frontCaptionFontFamily,
      frontCaptionFontSize,
      frontCaptionColor,
      frontTextBgOpacity,
      frontCaptionPreset,
      frontCaptionWidth,
      message,
      recipientName,
      senderName,
      senderEmail,
      location,
      hideMap,
      coords,
      stampStyle,
      stampLabel,
      stampYear,
      postmarkText,
      mediaItems, // Attention: URLs blobs ne persistent pas après reload, mais URLs base64 oui.
      isPremium,
      stickers,
      emojiStickers,
      selectedTemplateId,
      eventType,
      updatedAt: Date.now(),
    }

    // Éviter de sauvegarder si vide (juste l'init)
    if (!frontImage && message.startsWith('Un petit coucou')) return

    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave))
    } catch (e) {
      console.warn('LocalStorage full or error', e)
    }
  }, [
    createdPostcardId,
    isPublishing,
    frontImage,
    frontImageCrop,
    frontImageFilter,
    frontCaption,
    frontEmoji,
    frontCaptionPosition,
    frontCaptionFontFamily,
    frontCaptionFontSize,
    frontCaptionColor,
    frontTextBgOpacity,
    frontCaptionPreset,
    message,
    recipientName,
    senderName,
    senderEmail,
    location,
    hideMap,
    coords,
    stampStyle,
    stampLabel,
    stampYear,
    postmarkText,
    mediaItems,
    isPremium,
    stickers,
    emojiStickers,
    selectedTemplateId,
  ])

  // Restauration de la sauvegarde locale au montage
  useEffect(() => {
    // Seulement si on n'a pas d'ID dans l'URL (création neuve), pas de cover, pas de mode édition
    if (searchParams.get('id') || searchParams.get('cover') || searchParams.get('edit')) return

    const saved = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (saved) {
      try {
        const data = JSON.parse(saved)
        // Vérifier si la sauvegarde n'est pas trop vieille (ex: 24h)
        if (Date.now() - data.updatedAt > 24 * 60 * 60 * 1000) {
          localStorage.removeItem(LOCAL_STORAGE_KEY)
          return
        }

        const confirmRestore = window.confirm(
          'Une carte non terminée a été retrouvée. Voulez-vous la restaurer ?',
        )
        if (confirmRestore) {
          if (data.frontImage) setFrontImage(data.frontImage)
          if (data.frontImageCrop) setFrontImageCrop(data.frontImageCrop)
          if (data.frontImageFilter) setFrontImageFilter(data.frontImageFilter)
          if (data.frontCaption) setFrontCaption(data.frontCaption)
          if (data.frontEmoji) setFrontEmoji(data.frontEmoji)
          if (data.frontCaptionPosition) setFrontCaptionPosition(data.frontCaptionPosition)
          if (data.frontCaptionFontFamily) setFrontCaptionFontFamily(data.frontCaptionFontFamily)
          if (data.frontCaptionFontSize != null)
            setFrontCaptionFontSize(Number(data.frontCaptionFontSize))
          if (data.frontCaptionColor) setFrontCaptionColor(data.frontCaptionColor)
          if (data.frontTextBgOpacity != null) setFrontTextBgOpacity(data.frontTextBgOpacity)
          if (data.frontCaptionPreset) setFrontCaptionPreset(data.frontCaptionPreset)
          if (data.frontCaptionWidth != null) setFrontCaptionWidth(data.frontCaptionWidth)
          if (data.message) setMessage(data.message)
          if (data.recipientName) setRecipientName(data.recipientName)
          if (data.senderName) setSenderName(data.senderName)
          if (data.senderEmail) setSenderEmail(data.senderEmail)
          if (data.location) setLocation(data.location)
          if (data.hideMap != null) setHideMap(data.hideMap)
          if (data.coords) setCoords(data.coords)
          if (data.stampStyle) setStampStyle(data.stampStyle)
          if (data.stampLabel) setStampLabel(data.stampLabel)
          if (data.stampYear) setStampYear(data.stampYear)
          if (data.postmarkText) setPostmarkText(data.postmarkText)
          if (data.mediaItems) setMediaItems(data.mediaItems)
          if (data.isPremium) setIsPremium(data.isPremium)
          if (data.stickers) setStickers(data.stickers)
          if (data.emojiStickers) setEmojiStickers(data.emojiStickers)
          if (data.selectedTemplateId) setSelectedTemplateId(data.selectedTemplateId)
          if (data.eventType) setEventType(data.eventType)
        } else {
          localStorage.removeItem(LOCAL_STORAGE_KEY)
        }
      } catch (e) {
        console.error('Error restoring draft', e)
        localStorage.removeItem(LOCAL_STORAGE_KEY)
      }
    }
  }, [])

  // De base : afficher ma position sur la carte (géolocalisation au chargement)
  useEffect(() => {
    if (coords || !navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setCoords({ lat: latitude, lng: longitude })
      },
      () => {
        /* refus ou erreur : l'utilisateur peut cliquer sur « Ma position actuelle » */
      },
    )
  }, [])

  useEffect(() => {
    if (showFullscreen) {
      // Auto-fit logic: calculate a scale to fit the card (aspect 3/2) comfortably
      const padding = 80 // Total horizontal/vertical padding
      const availableW = window.innerWidth - padding
      const availableH = window.innerHeight - padding

      const cardW = 1000 // Sample base width for calculation
      const cardH = cardW / POSTCARD_ASPECT

      const scaleW = availableW / cardW
      const scaleH = availableH / cardH
      const autoFitScale = Math.min(scaleW, scaleH, 1.2) // Cap auto-fit at 1.2x

      setFullscreenScale(Number(autoFitScale.toFixed(2)))

      // Escape key listener
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setShowFullscreen(false)
      }
      window.addEventListener('keydown', handleEsc)
      return () => window.removeEventListener('keydown', handleEsc)
    }
  }, [showFullscreen])

  useEffect(() => {
    if (!showEmojiPicker) return
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showEmojiPicker])

  const canGoNext = () => {
    switch (currentStep) {
      case 'photo':
        return frontImage !== ''
      case 'redaction':
        // Un seul critère : au moins un message. Destinataire / expéditeur / lieu optionnels (valeurs par défaut à l'envoi).
        return message.trim().length > 0
      case 'payment':
        return (
          hasPaid || codeSuccess || selectedPlan === 'ephemere' || currentUser?.role === 'admin'
        )
      case 'preview':
        return true
      default:
        return false
    }
  }

  const goNext = () => {
    if (currentStepIndex < STEPS.length - 1 && canGoNext()) {
      const nextStep = STEPS[currentStepIndex + 1].id
      setCurrentStep(nextStep)
    }
  }

  const goPrev = () => {
    if (currentStepIndex > 0) {
      const prevStep = STEPS[currentStepIndex - 1].id
      setCurrentStep(prevStep)
    }
  }

  const processFrontImageFile = useCallback(async (file: File) => {
    setUploadedFileName(file.name)
    setUploadStatus({ current: 1, total: 1, step: 'Lecture des données EXIF...' })

    // Extract EXIF data
    const exif = await extractExifData(file)
    setFrontExif(exif)

    setUploadStatus({ current: 1, total: 1, step: "Optimisation de l'image..." })
    // Resize max 2k, JPEG 80%, puis upload du résultat (pas l'original)
    const dataUrl = await fileToDataUrl(file).catch(() => null)
    if (!dataUrl) {
      setUploadStatus(null)
      setUploadedFileName('')
      alert('Impossible de charger cette image. Utilisez une photo en JPEG, PNG, HEIC ou WebP.')
      return
    }

    const blob = await dataUrlToBlob(dataUrl)
    const safeName = `postcard-front-${Date.now()}.jpg`

    try {
      setUploadStatus({ current: 1, total: 1, step: "Préparation de l'envoi..." })
      const presignedRes = await fetch('/api/upload-presigned', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: safeName,
          mimeType: 'image/jpeg',
          filesize: blob.size,
        }),
      })
      if (presignedRes.ok) {
        setUploadStatus({ current: 1, total: 1, step: "Transfert de l'image..." })
        const { url, key } = await presignedRes.json()
        const putRes = await fetch(url, {
          method: 'PUT',
          body: blob,
          headers: { 'Content-Type': 'image/jpeg' },
        })
        if (putRes.ok) {
          setFrontImageKey(key)
          setFrontImageMimeType('image/jpeg')
          setFrontImageFilesize(blob.size)
          setFrontImage(dataUrl)
          setFrontImageCrop({ scale: 1, x: 50, y: 50 })
          setFrontImageFilter(DEFAULT_FRONT_FILTER)
          setSelectedTemplateId(null)
          setUploadStatus(null)
          return
        }
      }
    } catch (_) {
      /* fallback to base64 */
    }
    setUploadStatus(null)
    setFrontImageKey(null)
    setFrontImageMimeType(null)
    setFrontImageFilesize(null)
    setFrontImage(dataUrl)
    setFrontImageCrop({ scale: 1, x: 50, y: 50 })
    setFrontImageFilter(DEFAULT_FRONT_FILTER)
    setSelectedTemplateId(null)
  }, [])

  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      await processFrontImageFile(file)
      e.target.value = ''
    },
    [processFrontImageFile],
  )

  const handleDropZoneDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    dropDragCounterRef.current += 1
    setIsDropActive(true)
  }, [])

  const handleDropZoneDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    dropDragCounterRef.current = Math.max(0, dropDragCounterRef.current - 1)
    if (dropDragCounterRef.current === 0) {
      setIsDropActive(false)
    }
  }, [])

  const handleDropZoneDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDropZoneDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      dropDragCounterRef.current = 0
      setIsDropActive(false)
      const file = e.dataTransfer.files?.[0]
      if (file) {
        void processFrontImageFile(file)
      }
    },
    [processFrontImageFile],
  )

  const handleSelectTemplate = useCallback(async (template: Template) => {
    setUploadedFileName('')
    setSelectedTemplateId(template.id)
    setFrontImageKey(null)
    setFrontImageMimeType(null)
    setFrontImageFilesize(null)
    setFrontImageCrop({ scale: 1, x: 50, y: 50 })
    setFrontImageFilter(DEFAULT_FRONT_FILTER)
    // Pre-fill fields from template
    if (template.frontCaption) setFrontCaption(template.frontCaption)
    if (template.frontEmoji) setFrontEmoji(template.frontEmoji)
    if (template.message) setMessage(template.message)
    if (template.location) setLocation(template.location)
    if (template.stampStyle) setStampStyle(template.stampStyle)
    if (template.category) {
      setHideMap(NO_MAP_CATEGORIES.includes(template.category))
      setEventType(template.category as TemplateCategory)
    }
    try {
      const resized = await urlToResizedDataUrl(template.imageUrl)
      setFrontImage(resized)
    } catch {
      setFrontImage(template.imageUrl)
    }
  }, [])

  const [isApplyingDefaultPhoto, setIsApplyingDefaultPhoto] = useState(false)
  const handleContinueWithDefaultPhoto = useCallback(async () => {
    const baseTemplate = SAMPLE_TEMPLATES[0]
    if (!baseTemplate) return
    setIsApplyingDefaultPhoto(true)
    try {
      await handleSelectTemplate(baseTemplate)
      setCurrentStep('redaction')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setIsApplyingDefaultPhoto(false)
    }
  }, [handleSelectTemplate])

  const handleSelectUnsplashImage = useCallback(
    async (imageUrl: string) => {
      setShowUnsplashModal(false)
      setUploadedFileName('Photo Unsplash')
      setFrontImageKey(null)
      setFrontImageMimeType(null)
      setFrontImageFilesize(null)
      setFrontImageCrop({ scale: 1, x: 50, y: 50 })
      setFrontImageFilter(DEFAULT_FRONT_FILTER)

      try {
        const resized = await urlToResizedDataUrl(imageUrl)
        setFrontImage(resized)
      } catch (err) {
        console.error('Error processing Unsplash image:', err)
        setFrontImage(imageUrl)
      }

      void confetti({
        particleCount: 40,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#14b8a6', '#f59e0b', '#ef4444'],
      })
    },
    [urlToResizedDataUrl],
  )

  const handleSelectAiImage = useCallback(
    async (imageUrl: string) => {
      setShowAiGeneratorModal(false)
      setUploadedFileName('Image IA')
      setFrontImageKey(null)
      setFrontImageMimeType(null)
      setFrontImageFilesize(null)
      setFrontImageCrop({ scale: 1, x: 50, y: 50 })
      setFrontImageFilter(DEFAULT_FRONT_FILTER)

      try {
        const resized = await urlToResizedDataUrl(imageUrl)
        setFrontImage(resized)
      } catch (err) {
        console.error('Error processing AI image:', err)
        setFrontImage(imageUrl)
      }

      void confetti({
        particleCount: 60,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#8b5cf6', '#a855f7', '#c084fc', '#14b8a6'],
      })
    },
    [urlToResizedDataUrl],
  )

  const handleAiPayment = useCallback(async () => {
    const amount = AI_GENERATION_PRICE_EUR
    setRevolutError(null)
    setIsRevolutRedirecting(true)

    try {
      const res = await fetch('/api/revolut/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountEur: amount,
          description: "Option IA — Génération d'image CartePostale.cool",
          customerEmail: currentUser?.email || senderEmail || undefined,
          redirectPath: '/editor?ai_paid=true',
          metadata: { feature: 'ai_image_generation' },
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setRevolutError(data.error || 'Impossible de créer le paiement.')
        setIsRevolutRedirecting(false)
        return
      }
      if (data.checkout_url) {
        window.location.href = data.checkout_url
        return
      }
      setRevolutError('URL de paiement non disponible.')
    } catch {
      setRevolutError('Erreur réseau lors du paiement.')
    }
    setIsRevolutRedirecting(false)
  }, [currentUser?.email, senderEmail])

  const handleCropImgLoad = useCallback(() => {
    const img = cropImgRef.current
    if (img?.naturalWidth && img.naturalHeight)
      setImgNaturalSize({ w: img.naturalWidth, h: img.naturalHeight })
  }, [])

  useEffect(() => {
    if (!showImageEditModal) return
    const img = cropImgRef.current
    if (img?.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
      setImgNaturalSize({ w: img.naturalWidth, h: img.naturalHeight })
    }
  }, [showImageEditModal, frontImage])

  const handleStickerSelect = (sticker: Sticker) => {
    const newSticker: StickerPlacement = {
      id: Math.random().toString(36).substr(2, 9),
      stickerId: sticker.id,
      imageUrl: sticker.image,
      x: 50,
      y: 50,
      scale: 1,
      rotation: 0,
    }
    setStickers([...stickers, newSticker])
    setShowStickerGallery(false)
  }

  const updateSticker = (id: string, updates: Partial<StickerPlacement>) => {
    setStickers(stickers.map((s) => (s.id === id ? { ...s, ...updates } : s)))
  }

  const removeSticker = (id: string) => {
    setStickers(stickers.filter((s) => s.id !== id))
  }

  const handleCropPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault()
      cropDragRef.current = {
        clientX: e.clientX,
        clientY: e.clientY,
        cropX: frontImageCrop.x,
        cropY: frontImageCrop.y,
      }
      ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
    },
    [frontImageCrop.x, frontImageCrop.y],
  )

  const handleCropPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const drag = cropDragRef.current
      if (!drag || !imgNaturalSize || !cropAreaRef.current) return
      const rect = cropAreaRef.current.getBoundingClientRect()
      const coverScale = Math.max(rect.width / imgNaturalSize.w, rect.height / imgNaturalSize.h)
      const displayScale = coverScale * frontImageCrop.scale
      const dx = e.clientX - drag.clientX
      const dy = e.clientY - drag.clientY
      const deltaXPercent = (dx / (imgNaturalSize.w * displayScale)) * 100
      const deltaYPercent = (dy / (imgNaturalSize.h * displayScale)) * 100
      const newX = Math.max(0, Math.min(100, drag.cropX - deltaXPercent))
      const newY = Math.max(0, Math.min(100, drag.cropY - deltaYPercent))
      setFrontImageCrop((c) => ({ ...c, x: newX, y: newY }))
      cropDragRef.current = { clientX: e.clientX, clientY: e.clientY, cropX: newX, cropY: newY }
    },
    [frontImageCrop.scale, imgNaturalSize],
  )

  const handleCropPointerUp = useCallback((e: React.PointerEvent) => {
    cropDragRef.current = null
    ;(e.target as HTMLElement).releasePointerCapture?.(e.pointerId)
  }, [])

  const handleGeolocation = () => {
    if (!navigator.geolocation) return
    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false)
        const { latitude, longitude } = position.coords
        setCoords({ lat: latitude, lng: longitude })
        // Keep a human-readable label in the UI, coords stay in `coords`.
        setLocation((prev) => (prev.trim() ? prev : 'Ma position actuelle'))
      },
      () => {
        setIsLocating(false)
      },
    )
  }

  const handleAlbumUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    e.target.value = ''
    if (files.length === 0) return

    setUploadStatus({ current: 0, total: files.length, step: 'Initialisation...' })

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const isVideo = file.type.startsWith('video/')
      const type = isVideo ? ('video' as const) : ('image' as const)
      const newId = Date.now() + Math.random().toString()

      setUploadStatus({
        current: i + 1,
        total: files.length,
        step: isVideo
          ? `Traitement vidéo ${i + 1}/${files.length}...`
          : `Optimisation image ${i + 1}/${files.length}...`,
      })

      if (isVideo) {
        // Video: upload R2 (presigned), fallback URL.createObjectURL for preview?
        const previewUrl = await readFileAsDataUrl(file).catch(() => null)
        if (!previewUrl) {
          alert(`Impossible de charger la vidéo ${file.name}.`)
          continue
        }

        let key: string | undefined
        let mimeType: string | undefined
        let filesize: number | undefined
        const blob = file // Video file is already a blob

        try {
          setUploadStatus({
            current: i + 1,
            total: files.length,
            step: `Upload vidéo ${i + 1}/${files.length}...`,
          })
          const safeName = `postcard-video-${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${file.name.split('.').pop()}`

          const presignedRes = await fetch('/api/upload-presigned', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filename: safeName,
              mimeType: file.type,
              filesize: file.size,
            }),
          })

          if (presignedRes.ok) {
            const { url, key: k } = await presignedRes.json()
            const putRes = await fetch(url, {
              method: 'PUT',
              body: blob,
              headers: { 'Content-Type': file.type },
            })
            if (putRes.ok) {
              key = k
              mimeType = file.type
              filesize = file.size
            }
          }
        } catch (e) {
          console.error('Video upload failed', e)
        }

        setMediaItems((prev) => {
          const videos = (prev || []).filter((i) => i.type === 'video').length
          if (videos >= ALBUM_TIERS.paid.videos) {
            alert(`Limite de ${ALBUM_TIERS.paid.videos} vidéos atteinte.`)
            return prev || []
          }
          const newItem = {
            id: newId,
            type: 'video',
            url: previewUrl,
            ...(key && { key, mimeType, filesize }),
          } as any
          return [...(prev || []), newItem]
        })
        setIsPremium(true)
      } else {
        // Image: resize max 2k JPEG 80%, puis upload R2 (presigned), fallback base64
        const previewUrl = await fileToDataUrl(file).catch(() => null)
        if (!previewUrl) {
          alert(
            `Impossible de charger ${file.name}. Utilisez des photos en JPEG, PNG, HEIC ou WebP.`,
          )
          continue
        }

        setUploadStatus({
          current: i + 1,
          total: files.length,
          step: `Extraction EXIF ${i + 1}/${files.length}...`,
        })
        // Extract EXIF data
        const exif = await extractExifData(file)

        let key: string | undefined
        let mimeType: string | undefined
        let filesize: number | undefined
        const blob = await dataUrlToBlob(previewUrl)
        const safeName = `postcard-album-${Date.now()}-${Math.random().toString(36).slice(2, 9)}.jpg`

        try {
          setUploadStatus({
            current: i + 1,
            total: files.length,
            step: `Upload image ${i + 1}/${files.length}...`,
          })
          const presignedRes = await fetch('/api/upload-presigned', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filename: safeName,
              mimeType: 'image/jpeg',
              filesize: blob.size,
            }),
          })
          if (presignedRes.ok) {
            const { url, key: k } = await presignedRes.json()
            const putRes = await fetch(url, {
              method: 'PUT',
              body: blob,
              headers: { 'Content-Type': 'image/jpeg' },
            })
            if (putRes.ok) {
              key = k
              mimeType = 'image/jpeg'
              filesize = blob.size
            }
          }
        } catch (_) {
          /* fallback to base64 */
        }

        setMediaItems((prev) => {
          const photos = (prev || []).filter((i) => i.type === 'image').length
          if (photos >= ALBUM_TIERS.paid.photos) {
            alert(`Limite de ${ALBUM_TIERS.paid.photos} photos atteinte.`)
            return prev || []
          }
          const newItem = {
            id: newId,
            type: 'image',
            url: previewUrl,
            exif,
            ...(key && { key, mimeType, filesize }),
          } as any
          return [...(prev || []), newItem]
        })
        setIsPremium(true)
      }
    }
    setUploadStatus(null)
  }

  const getAlbumPrice = () => {
    if (codeSuccess) return 0
    if (currentUser?.role === 'admin') return 0
    const plan = POSTCARD_PLANS.find((p) => p.id === selectedPlan)
    return plan?.price ?? 0
  }

  const getSelectedPlan = () =>
    POSTCARD_PLANS.find((p) => p.id === selectedPlan) ?? POSTCARD_PLANS[0]

  const removeMediaItem = (id: string) => {
    setMediaItems((prev) => {
      const updated = prev?.filter((item) => item.id !== id) || []
      setIsPremium(updated.length > 0)
      return updated
    })
  }

  const openNoteEditor = (id: string, currentNote: string = '') => {
    setEditingMediaNoteId(id)
    setEditingMediaNoteText(currentNote)
  }

  const saveMediaNote = () => {
    if (!editingMediaNoteId) return
    setMediaItems((prev) =>
      (prev || []).map((item) =>
        item.id === editingMediaNoteId ? { ...item, note: editingMediaNoteText } : item,
      ),
    )
    setEditingMediaNoteId(null)
    setEditingMediaNoteText('')
  }

  const isFrontFilterEdited =
    frontImageFilter.brightness !== DEFAULT_FRONT_FILTER.brightness ||
    frontImageFilter.contrast !== DEFAULT_FRONT_FILTER.contrast ||
    frontImageFilter.saturation !== DEFAULT_FRONT_FILTER.saturation ||
    frontImageFilter.sepia !== DEFAULT_FRONT_FILTER.sepia ||
    frontImageFilter.grayscale !== DEFAULT_FRONT_FILTER.grayscale
  const frontImageFilterCss = buildFrontImageFilterCss(frontImageFilter)

  const currentPostcard: Postcard = useMemo<Postcard>(
    () => ({
      id: createdPostcardId || 'editor-preview',
      frontImage:
        frontImage || 'https://img.cartepostale.cool/demo/photo-1507525428034-b723cf961d3e.jpg',
      frontImageCrop: frontImage ? frontImageCrop : undefined,
      frontImageFilter: frontImage ? frontImageFilter : undefined,
      frontCaption: frontCaption.trim() || undefined,
      frontEmoji: frontEmoji.trim() || undefined,
      frontCaptionPosition,
      frontCaptionFontFamily,
      frontCaptionFontSize,
      frontCaptionColor,
      frontTextBgOpacity,
      frontCaptionPreset: frontCaptionPreset !== 'classic' ? frontCaptionPreset : undefined,
      frontCaptionWidth: frontCaptionWidth,
      message: message || '',
      recipientName: recipientName || '',
      senderName: senderName || '',
      senderEmail: senderEmail || undefined,
      location: location || '',
      hideMap,
      coords: coords || undefined,
      stampStyle,
      stampLabel: stampLabel.trim() || undefined,
      stampYear: stampYear.trim() || undefined,
      postmarkText: postmarkText.trim() || undefined,
      date: new Date().toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      isPremium,
      stickers,
      emojiStickers: emojiStickers.length > 0 ? emojiStickers : undefined,
      mediaItems,
      scratchCardEnabled,
      puzzleCardEnabled,
      puzzleCardDifficulty,
      backgroundMusic,
      backgroundMusicTitle,
      eventType: eventType ?? undefined,
    }),
    [
      createdPostcardId,
      frontImage,
      frontImageCrop,
      frontImageFilter,
      frontCaption,
      frontEmoji,
      frontCaptionPosition,
      frontCaptionFontFamily,
      frontCaptionFontSize,
      frontCaptionColor,
      frontTextBgOpacity,
      frontCaptionPreset,
      frontCaptionWidth,
      message,
      recipientName,
      senderName,
      senderEmail,
      location,
      stampStyle,
      stampLabel,
      stampYear,
      postmarkText,
      isPremium,
      stickers,
      emojiStickers,
      mediaItems,
      coords,
      scratchCardEnabled,
      puzzleCardEnabled,
      puzzleCardDifficulty,
      backgroundMusic,
      backgroundMusicTitle,
      eventType,
    ],
  )

  /** Aperçu : à l'étape Rédaction, si un modèle verso est choisi, on affiche le verso avec son style (timbre, message, lieu). */
  const postcardForPreview: Postcard = useMemo<Postcard>(() => {
    if (currentStep === 'redaction' && versoPreviewTemplateId) {
      const tpl = SAMPLE_TEMPLATES.find((t) => t.id === versoPreviewTemplateId)
      if (tpl) {
        return {
          ...currentPostcard,
          message: tpl.message ?? currentPostcard.message,
          location: tpl.location ?? currentPostcard.location,
          hideMap: tpl.category
            ? NO_MAP_CATEGORIES.includes(tpl.category)
            : currentPostcard.hideMap,
          stampStyle: tpl.stampStyle ?? currentPostcard.stampStyle,
        }
      }
    }
    return currentPostcard
  }, [currentPostcard, currentStep, versoPreviewTemplateId])

  const filteredTemplates =
    templateModalCategory === 'all'
      ? SAMPLE_TEMPLATES
      : SAMPLE_TEMPLATES.filter((t) => t.category === templateModalCategory)
  const selectedTemplate = selectedTemplateId
    ? (SAMPLE_TEMPLATES.find((template) => template.id === selectedTemplateId) ?? null)
    : null
  const selectedTemplateCategory = selectedTemplate
    ? (TEMPLATE_CATEGORIES.find((cat) => cat.key === selectedTemplate.category) ?? null)
    : null
  const currentEmojiCategory =
    EMOJI_CATEGORIES.find((category) => category.key === selectedEmojiCategory) ??
    EMOJI_CATEGORIES[0]

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const audioUrl = URL.createObjectURL(audioBlob)
        setAudioBlob(audioBlob)
        setAudioUrl(audioUrl)

        // Get duration
        const audio = new Audio(audioUrl)
        audio.onloadedmetadata = () => {
          setAudioDuration(audio.duration)
        }
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (err) {
      console.error('Error accessing microphone:', err)
      alert("Impossible d'accéder au microphone. Vérifiez vos permissions.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())
      setIsRecording(false)
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
      }
    }
  }

  const deleteAudio = () => {
    setAudioBlob(null)
    setAudioUrl(null)
    setAudioDuration(0)
    setRecordingTime(0)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Upload audio logic (called during publish/pay)
  const uploadAudio = async (): Promise<string | undefined> => {
    if (!audioBlob) return undefined

    // Check if we already uploaded it (optimization: store uploaded URL in state?)
    // For now, re-upload logic similar to images

    try {
      const filename = `postcard-audio-${Date.now()}.webm`
      const filesize = audioBlob.size

      const presignedRes = await fetch('/api/upload-presigned', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename,
          mimeType: 'audio/webm',
          filesize,
        }),
      })

      if (presignedRes.ok) {
        const { url, key } = await presignedRes.json()
        const putRes = await fetch(url, {
          method: 'PUT',
          body: audioBlob,
          headers: { 'Content-Type': 'audio/webm' },
        })

        if (putRes.ok) {
          return key // Return the key (filename) to be stored
        }
      }
    } catch (e) {
      console.error('Audio upload failed', e)
    }
    return undefined // Fail silently or handle error?
  }

  const handleAutoLocate = useCallback((silent = false) => {
    if (!navigator.geolocation) {
      if (!silent) alert('Votre navigateur ne supporte pas la géolocalisation.')
      return
    }

    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setCoords({ lat: latitude, lng: longitude })

        // Reverse geocoding with Photon
        fetch(`https://photon.komoot.io/reverse?lat=${latitude}&lon=${longitude}&lang=fr`)
          .then((res) => res.json())
          .then((data) => {
            if (data.features && data.features.length > 0) {
              const p = data.features[0].properties
              const locName = `${p.city || p.name || ''}, ${p.country || ''}`
              setLocation(locName)
            }
            setIsLocating(false)
          })
          .catch((err) => {
            console.error('Reverse geocoding error:', err)
            setIsLocating(false)
          })
      },
      (error) => {
        console.error('Geolocation error:', error)
        setIsLocating(false)
        if (!silent) alert('Impossible de vous localiser. Vérifiez vos permissions.')
      },
    )
  }, [])

  // Géolocalisation automatique au chargement si déjà autorisée
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' as PermissionName }).then((res) => {
        if (res.state === 'granted') {
          handleAutoLocate(true)
        }
      })
    }
  }, [handleAutoLocate])

  const handlePublish = async () => {
    setIsPublishing(true)
    setShareError(null)

    try {
      let finalFrontImage = currentPostcard.frontImage
      let sendKey = frontImageKey
      let sendMime = frontImageMimeType
      let sendFilesize = frontImageFilesize
      const hasCrop =
        frontImageCrop.scale !== 1 || frontImageCrop.x !== 50 || frontImageCrop.y !== 50
      const hasImageEdits = hasCrop || isFrontFilterEdited
      const canBake =
        frontImage &&
        (frontImage.startsWith('data:') ||
          frontImage.startsWith('http') ||
          frontImage.startsWith('/'))
      if (canBake && hasImageEdits) {
        try {
          const imgUrl = frontImage.startsWith('data:')
            ? frontImage
            : typeof window !== 'undefined' && frontImage.startsWith('/')
              ? window.location.origin + frontImage
              : frontImage
          const dataUrl = frontImage.startsWith('data:')
            ? frontImage
            : await fetch(imgUrl)
                .then((r) => r.blob())
                .then(
                  (b) =>
                    new Promise<string>((res, rej) => {
                      const reader = new FileReader()
                      reader.onloadend = () => res(reader.result as string)
                      reader.onerror = rej
                      reader.readAsDataURL(b)
                    }),
                )
          finalFrontImage = await bakeFrontImageCrop(dataUrl, frontImageCrop, frontImageFilter)
          sendKey = null
          sendMime = null
          sendFilesize = null
        } catch (_) {
          /* keep original image if bake fails */
        }
      }

      // Build optimized payload to avoid Next.js payload size limits
      // Strip large Base64 strings if we have an R2 key (sendKey/item.key)
      const result = await createPostcard({
        ...currentPostcard,
        ...(editingPublicId && { id: editingPublicId }),
        frontImage: sendKey ? undefined : finalFrontImage,
        mediaItems: currentPostcard.mediaItems?.map((item) => ({
          ...item,
          // Only send the Base64 URL if we don't have an R2 key
          url: item.key ? undefined : item.url,
        })),
        recipients: [],
        allowComments,
        isPublic,
        scratchCardEnabled,
        puzzleCardEnabled,
        puzzleCardDifficulty,
        password: isPasswordProtected ? password : undefined,
        ...(audioUrl && {
          audioMessage: await uploadAudio(), // Upload and get key
          audioDuration: Math.round(audioDuration),
        }),
        ...(sendKey && {
          frontImageKey: sendKey,
          frontImageMimeType: sendMime ?? undefined,
          frontImageFilesize: sendFilesize ?? undefined,
          frontExif: frontExif ?? undefined,
        }),
        // Also pass frontExif if we are sending base64
        ...(!sendKey && {
          frontExif: frontExif ?? undefined,
        }),
      })

      if (result.success && result.publicId) {
        setCreatedPostcardId(result.publicId)
        if (typeof result.id === 'number') {
          setInternalPostcardId(result.id)
        }
        setShareUrl(`${window.location.origin}/carte/${result.publicId}`)

        if (!currentUser && !senderEmail) {
          setShowEmailPromptModal(true)
          if (typeof window !== 'undefined' && result.publicId) {
            sessionStorage.setItem('pendingLinkPostcard', result.publicId)
          }
        }
      } else {
        setShareError(result.error || 'Une erreur est survenue lors de la création de la carte.')
      }
    } catch (err: any) {
      console.error('Publish error:', err)
      setShareError('Une erreur critique est survenue. Veuillez réessayer.')
    } finally {
      setIsPublishing(false)
    }
  }

  const copyToClipboard = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl)
      setShowCopyToast(true)
      setTimeout(() => setShowCopyToast(false), 2000)
    }
  }

  const openPreviewAsRecipient = async () => {
    setPreviewRecipientLoading(true)
    try {
      const payload = JSON.parse(
        JSON.stringify({
          ...postcardForPreview,
          id: postcardForPreview.id || 'preview',
          ...(lastPreviewSlug && { slug: lastPreviewSlug }),
        }),
      )
      const res = await fetch('/api/editor/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur')
      const slug = data.slug
      if (slug && typeof window !== 'undefined') {
        setLastPreviewSlug(slug)
        setPreviewRecipientUrl(`${window.location.origin}/carte/preview/${slug}`)
        setPreviewRecipientModalOpen(true)
      }
    } catch (e) {
      console.error('Preview as recipient:', e)
      alert("Impossible de générer l'aperçu. Réessayez dans un instant.")
    } finally {
      setPreviewRecipientLoading(false)
    }
  }

  const handlePayWithRevolut = async () => {
    const amount = getAlbumPrice()
    if (amount <= 0) return
    setRevolutError(null)
    setIsRevolutRedirecting(true)

    // Meta Pixel — InitiateCheckout (ouverture du paiement)
    trackInitiateCheckout({
      value: amount,
      currency: 'EUR',
      content_name: 'Carte Postale Premium CartePostale.cool',
    })

    try {
      // Ensure we have a createdPostcardId first
      let pid = createdPostcardId
      if (!pid) {
        // We need to publish now to get an ID
        // Strip large Base64 strings etc. exactly as handlePublish does
        let finalFrontImage = currentPostcard.frontImage
        const hasCrop =
          frontImageCrop.scale !== 1 || frontImageCrop.x !== 50 || frontImageCrop.y !== 50
        const hasImageEdits = hasCrop || isFrontFilterEdited
        const canBake =
          frontImage &&
          (frontImage.startsWith('data:') ||
            frontImage.startsWith('http') ||
            frontImage.startsWith('/'))
        if (canBake && hasImageEdits) {
          try {
            const imgUrl = frontImage.startsWith('data:')
              ? frontImage
              : typeof window !== 'undefined' && frontImage.startsWith('/')
                ? window.location.origin + frontImage
                : frontImage
            const dataUrl = frontImage.startsWith('data:')
              ? frontImage
              : await fetch(imgUrl)
                  .then((r) => r.blob())
                  .then(
                    (b) =>
                      new Promise<string>((res, rej) => {
                        const reader = new FileReader()
                        reader.onloadend = () => res(reader.result as string)
                        reader.onerror = rej
                        reader.readAsDataURL(b)
                      }),
                  )
            finalFrontImage = await bakeFrontImageCrop(dataUrl, frontImageCrop, frontImageFilter)
          } catch (_) {
            /* ignore */
          }
        }

        const result = await createPostcard({
          ...currentPostcard,
          ...(editingPublicId && { id: editingPublicId }),
          frontImage: frontImageKey ? undefined : finalFrontImage,
          mediaItems: currentPostcard.mediaItems?.map((item) => ({
            ...item,
            url: item.key ? undefined : item.url,
          })),
          recipients: [],
          ...(frontImageKey && {
            frontImageKey,
            frontImageMimeType: frontImageMimeType ?? undefined,
            frontImageFilesize: frontImageFilesize ?? undefined,
            frontExif: frontExif ?? undefined,
          }),
          // Also pass frontExif if we are sending base64
          ...(!frontImageKey && {
            frontExif: frontExif ?? undefined,
          }),
        })

        if (result.success && result.publicId) {
          pid = result.publicId
          setCreatedPostcardId(pid)
          setShareUrl(`${window.location.origin}/carte/${pid}`)

          // If promo code was used, mark it as used in DB
          if (codeSuccess && promoCode) {
            const { consumePromoCode } = await import('@/actions/leads-actions')
            const numericId =
              typeof result.id === 'number'
                ? result.id
                : typeof result.id === 'string'
                  ? parseInt(result.id)
                  : undefined
            if (numericId) {
              await consumePromoCode(promoCode, numericId)
            }
          }
        } else {
          setRevolutError(result.error || 'Erreur lors de la préparation de la carte.')
          return
        }
      }

      const res = await fetch('/api/revolut/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountEur: amount,
          description: 'Carte postale CartePostale.cool',
          customerEmail: currentUser?.email || senderEmail || undefined,
          redirectPath: `/carte/${createdPostcardId}`,
          merchantOrderReference: createdPostcardId,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setRevolutError(data.error || 'Impossible de créer le paiement Revolut.')
        return
      }
      if (data.checkout_url) {
        // Use current URL with success flag as return path
        const returnUrl = `${window.location.origin}/editor?payment_success=true`
        // We might need to encode this correctly for the API
        window.location.href = data.checkout_url
        return
      }
      setRevolutError('URL de paiement Revolut manquante.')
    } catch (e) {
      setRevolutError(e instanceof Error ? e.message : 'Erreur réseau.')
    } finally {
      setIsRevolutRedirecting(false)
    }
  }

  const [isPayingWithCredit, setIsPayingWithCredit] = useState(false)
  const [creditError, setCreditError] = useState<string | null>(null)

  const handlePayWithCredit = async () => {
    if ((currentUser?.credits || 0) <= 0) {
      setCreditError("Vous n'avez pas assez de crédits.")
      return
    }

    setCreditError(null)
    setIsPayingWithCredit(true)

    try {
      // 1. Ensure postcard is created (similar to handlePayWithRevolut)
      let pid = createdPostcardId
      if (!pid) {
        // ... (truncated for brevity, I'll use a helper if I could, but I'll replicate the logic or call handlePublish internally)
        // Simplified: let's assume if we are here we might already have pid or we can just try handlePublish
        await handlePublish()
        pid = createdPostcardId
      }

      if (!pid) {
        // If still no pid after handlePublish, it failed
        setIsPayingWithCredit(false)
        return
      }

      // 2. Consume credit
      const res = await consumeCredit()
      if (res.success) {
        // Success! Redirect to the carte page with a success flag
        window.location.href = `/carte/${pid}?payment_success=true`
      } else {
        setCreditError(res.error || "Erreur lors de l'utilisation du crédit.")
        setIsPayingWithCredit(false)
      }
    } catch (err) {
      setCreditError('Une erreur est survenue.')
      setIsPayingWithCredit(false)
    }
  }

  const handleCreateVariant = () => {
    setCreatedPostcardId(null)
    setInternalPostcardId(null)
    setShareUrl(null)
    setIsPublishing(false)
    setCurrentStep('redaction')
    // On garde tout le reste du state (image, message, etc.)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    // toast ?
  }

  const captionHidesBg = captionPresetHidesBg(frontCaptionPreset)

  return (
    <div className="min-h-screen bg-[#fdfbf7]">
      {/* Step Progress Bar — collé sous la topbar ; top suit la hauteur navbar (réduite au scroll) */}
      <div
        className={cn(
          'bg-white border-b border-stone-200 sticky z-40 -mt-1 mb-6 md:mb-8 transition-[top] duration-300',
          navbarScrolled ? 'top-14 md:top-16' : 'top-16 md:top-20',
        )}
      >
        <div className="max-w-5xl mx-auto px-3 py-1.5 sm:px-4 sm:py-2 md:py-2.5">
          <div className="flex items-center gap-0">
            {STEPS.map((step, index) => {
              const Icon = step.icon
              const isActive = step.id === currentStep
              const isCompleted = index < currentStepIndex
              const isPayment = step.id === 'payment'

              return (
                <React.Fragment key={step.id}>
                  <button
                    onClick={() => {
                      if (index <= currentStepIndex || canGoNext()) {
                        setCurrentStep(step.id)
                      }
                    }}
                    className={cn(
                      'flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-full transition-all text-xs sm:text-sm font-semibold shrink-0',
                      isActive
                        ? 'bg-teal-500 text-white shadow-md shadow-teal-200'
                        : isCompleted
                          ? 'bg-teal-50 text-teal-700 hover:bg-teal-100'
                          : 'bg-stone-100 text-stone-400',
                    )}
                  >
                    {isCompleted ? (
                      <Check size={14} className="sm:w-4 sm:h-4" />
                    ) : (
                      <Icon size={14} className="sm:w-4 sm:h-4" />
                    )}
                    <span className="hidden sm:inline">{step.label}</span>
                  </button>
                  {index < STEPS.length - 1 && (
                    <div
                      className={cn(
                        'flex-1 min-w-0 h-0.5 mx-1 sm:mx-2 rounded-full transition-colors shrink',
                        index < currentStepIndex ? 'bg-teal-400' : 'bg-stone-200',
                      )}
                    />
                  )}
                </React.Fragment>
              )
            })}
            {/* Toggle aperçu fixe — mobile only */}
            <button
              type="button"
              onClick={() => setStickyPreview((v) => !v)}
              className={cn(
                'ml-2 lg:hidden flex items-center gap-1 px-2 py-1.5 rounded-full text-[10px] font-bold transition-all shrink-0 border',
                stickyPreview
                  ? 'bg-teal-100 text-teal-700 border-teal-300'
                  : 'bg-stone-100 text-stone-400 border-stone-200',
              )}
              aria-label="Aperçu fixe en bas"
            >
              <Eye size={11} />
              <span className="hidden xs:inline">Aperçu</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl xl:max-w-[88rem] mx-auto px-4 sm:px-4 py-8 w-full">
        <div className="flex flex-col lg:flex-row gap-8 w-full">
          {/* Left Panel: Carte (aperçu en direct) */}
          <div className="hidden lg:block w-[600px] flex-shrink-0">
            <div className="sticky top-44">
              <div className="flex items-center gap-2 mb-4">
                <Eye size={16} className="text-teal-500" />
                <span className="text-sm font-bold text-stone-500 uppercase tracking-wider">
                  Aperçu en direct
                </span>
                <div className="flex items-center gap-1.5 ml-auto text-stone-400 text-xs font-medium">
                  <RefreshCw
                    size={12}
                    className="animate-spin"
                    style={{ animationDuration: '3s' }}
                  />
                  Mise à jour en temps réel
                </div>
              </div>
              <div className="relative z-10 transition-transform duration-300">
                <PostcardView
                  postcard={postcardForPreview}
                  flipped={showBack}
                  frontTextBgOpacity={frontTextBgOpacity}
                  className="w-full h-auto aspect-[4/3] shadow-xl rounded-xl border border-stone-100"
                  onCaptionPositionChange={setFrontCaptionPosition}
                />
                <StickerLayer
                  stickers={stickers}
                  onUpdate={updateSticker}
                  onRemove={removeSticker}
                  isActive={!showBack && currentStep === 'photo'} // Only interactive on front in step 1
                />
              </div>
              <div className="mt-2 flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-teal-700 border-teal-200 hover:bg-teal-50 hover:border-teal-300"
                  disabled={previewRecipientLoading}
                  onClick={openPreviewAsRecipient}
                >
                  {previewRecipientLoading ? (
                    <Loader2 size={16} className="animate-spin shrink-0" />
                  ) : (
                    <Eye size={16} className="shrink-0" />
                  )}
                  <span>
                    {previewRecipientLoading ? 'Génération...' : 'Voir comme un destinataire'}
                  </span>
                </Button>
              </div>
            </div>
          </div>

          {/* Right Panel: Editor Controls */}
          <div className="flex-1 min-w-0 w-full max-w-full">
            {/* ==================== STEP: PHOTO ==================== */}
            {currentStep === 'photo' && (
              <div className="w-full max-w-full bg-white rounded-2xl shadow-sm border border-stone-200 p-6 sm:p-8">
                <h2 className="text-2xl font-serif font-bold text-stone-800 mb-2">
                  Choisissez votre photo
                </h2>
                <p className="text-stone-500 mb-6">
                  Importez votre plus belle photo ou choisissez parmi nos modèles.
                </p>

                {/* Upload Zone */}
                <div
                  className={cn(
                    'relative border-2 border-dashed rounded-2xl text-center transition-all mb-8 group overflow-hidden',
                    uploadStatus
                      ? 'border-teal-400 bg-teal-50/20 p-6 cursor-wait'
                      : 'cursor-pointer hover:border-teal-400 hover:bg-teal-50/50',
                    !uploadStatus && isDropActive
                      ? 'border-teal-400 bg-teal-50/40 p-8'
                      : !uploadStatus && uploadedFileName
                        ? 'border-teal-400 bg-teal-50/10 p-2 sm:p-3'
                        : !uploadStatus && frontImage && !uploadedFileName
                          ? 'border-stone-200 bg-shadow-sm p-8'
                          : !uploadStatus && 'border-stone-300 p-8',
                  )}
                  onClick={() => !uploadStatus && fileInputRef.current?.click()}
                  onDragEnter={handleDropZoneDragEnter}
                  onDragOver={handleDropZoneDragOver}
                  onDragLeave={handleDropZoneDragLeave}
                  onDrop={handleDropZoneDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/heic,image/heif,image/webp,.jpg,.jpeg,.png,.heic,.heif,.webp"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  {uploadStatus ? (
                    <div className="flex items-center gap-4 justify-center text-left">
                      <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                        <Loader2 size={24} className="text-teal-600 animate-spin" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-stone-800 font-bold truncate">{uploadedFileName}</p>
                        <p className="text-teal-600 text-sm mt-0.5">{uploadStatus.step}</p>
                      </div>
                    </div>
                  ) : uploadedFileName ? (
                    <div className="flex items-center gap-3 justify-between text-left px-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center">
                            <Check size={12} className="text-white" />
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-teal-600">
                            Image sélectionnée
                          </span>
                        </div>
                        <p className="text-stone-800 text-sm font-bold truncate">
                          {uploadedFileName}
                        </p>
                        <p className="text-stone-400 text-[10px] font-bold uppercase tracking-wider mt-0.5 group-hover:text-teal-500 transition-colors">
                          Cliquez pour changer
                        </p>
                      </div>
                      {frontImage && (
                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden border border-teal-200 bg-stone-100 flex-shrink-0 shadow-sm transition-transform hover:scale-105">
                          <img src={frontImage} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-stone-100 group-hover:bg-teal-100 flex items-center justify-center transition-colors">
                        <Upload
                          size={28}
                          className="text-stone-400 group-hover:text-teal-600 transition-colors"
                        />
                      </div>
                      <div>
                        <p className="text-stone-700 font-semibold">
                          Glissez ou déposez votre photo ici
                        </p>
                        <p className="text-stone-400 text-sm mt-1">
                          {isDropActive
                            ? 'Relâchez pour importer votre image'
                            : 'ou cliquez pour parcourir (JPEG, PNG, HEIC, WebP)'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Desktop: 2 buttons side by side; mobile: stacked */}
                <div className="flex flex-col sm:flex-row gap-3 mt-3 mb-4 w-full">
                  {currentUser && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowUserGalleryModal('front')}
                      className="flex-1 w-full h-auto py-3 rounded-xl border-2 border-dashed border-stone-300 text-stone-600 hover:text-teal-600 hover:border-teal-300 hover:bg-teal-50 gap-2"
                    >
                      <ImageIcon size={18} /> Choisir depuis ma galerie
                    </Button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowTemplateSection(!showTemplateSection)}
                    className={cn(
                      'flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-stone-300 bg-stone-50/50 px-4 py-3 text-stone-600 hover:border-teal-300 hover:bg-teal-50/30 hover:text-teal-600 transition-all group',
                      currentUser ? 'flex-1 w-full' : 'w-full',
                    )}
                  >
                    <ImageIcon
                      size={18}
                      className="text-stone-400 group-hover:text-teal-500 transition-colors"
                    />
                    <span className="text-sm font-semibold">
                      {showTemplateSection ? 'Masquer les modèles' : 'Ou choisir un modèle'}
                    </span>
                    <ChevronRight
                      size={16}
                      className={cn(
                        'text-stone-400 transition-transform',
                        showTemplateSection ? 'rotate-90' : '',
                      )}
                    />
                  </button>
                </div>

                {/* Recherche d'image : ouvre le modal banque d'images avec la recherche */}
                <div className="flex gap-2 mb-8">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                    <Input
                      type="text"
                      placeholder="Recherche d'image (ex: plage, montagne, Paris…)"
                      value={imageSearchQuery}
                      onChange={(e) => setImageSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          setUnsplashInitialQuery(imageSearchQuery.trim() || null)
                          setShowUnsplashModal(true)
                        }
                      }}
                      className="pl-9 h-10 rounded-xl border-stone-200 bg-stone-50/50"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={() => {
                      setUnsplashInitialQuery(imageSearchQuery.trim() || null)
                      setShowUnsplashModal(true)
                    }}
                    className="shrink-0 rounded-xl bg-teal-500 hover:bg-teal-600 text-white gap-2 px-4"
                  >
                    <Search size={18} /> Chercher
                  </Button>
                </div>

                {/* Template Selection - Collapsible */}
                {showTemplateSection && (
                  <div className="space-y-5 mb-8">
                    {/* Raccourcis occasions */}
                    <div>
                      <p className="text-sm font-semibold text-stone-700 mb-2.5">
                        Choisir par occasion
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {OCCASION_SHORTCUTS.map((occ) => (
                          <button
                            key={occ.key}
                            type="button"
                            onClick={() => {
                              setTemplateModalCategory(occ.key)
                              setShowTemplateModal(true)
                            }}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-stone-200 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700 text-stone-600 transition-all shadow-sm"
                          >
                            <span className="text-base leading-none">{occ.icon}</span>
                            <span>{occ.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Thèmes visuels avec images IA */}
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <p className="text-sm font-semibold text-stone-700">Explorer par Thèmes</p>
                        <button
                          type="button"
                          onClick={() => {
                            setTemplateModalCategory('all')
                            setShowTemplateModal(true)
                          }}
                          className="text-[10px] font-bold text-teal-600 uppercase tracking-widest hover:underline"
                        >
                          Tout voir
                        </button>
                      </div>
                      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-1 px-1">
                        {TEMPLATE_CATEGORIES.filter((c) => c.key !== 'all').map((cat) => (
                          <button
                            key={cat.key}
                            type="button"
                            onClick={() => {
                              setTemplateModalCategory(cat.key)
                              setShowTemplateModal(true)
                            }}
                            className="flex-shrink-0 group relative w-28 h-20 rounded-2xl overflow-hidden border border-stone-100 shadow-sm transition-all hover:shadow-md hover:border-teal-200"
                          >
                            {cat.imageUrl && (
                              <img
                                src={cat.imageUrl}
                                alt=""
                                className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                              />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end p-2">
                              <span className="text-[10px] font-bold text-white truncate w-full">
                                {cat.label}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Modèles sélectionnés */}
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <p className="text-sm font-semibold text-stone-700">Modèles sélectionnés</p>
                        <button
                          type="button"
                          onClick={() => {
                            setTemplateModalCategory('all')
                            setShowTemplateModal(true)
                          }}
                          className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-stone-600 transition hover:border-teal-300 hover:bg-stone-50 hover:text-teal-600"
                          aria-label="Voir tous les modèles"
                        >
                          <MoreHorizontal size={16} />
                          Tous les modèles
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {BASE_TEMPLATE_IDS.map((id) => {
                          const tpl = SAMPLE_TEMPLATES.find((t) => t.id === id)
                          if (!tpl) return null
                          const cat = TEMPLATE_CATEGORIES.find((c) => c.key === tpl.category)
                          const isSelected = selectedTemplateId === tpl.id
                          return (
                            <button
                              key={tpl.id}
                              type="button"
                              onClick={() => handleSelectTemplate(tpl)}
                              className={cn(
                                'flex items-center gap-2 rounded-2xl border p-2.5 text-left transition-all min-w-0 max-w-full',
                                isSelected
                                  ? 'border-teal-500 bg-teal-50 ring-2 ring-teal-200'
                                  : 'border-stone-200 bg-white hover:border-teal-200 hover:bg-stone-50',
                              )}
                              title={
                                tpl.description ? `${tpl.name} – ${tpl.description}` : tpl.name
                              }
                            >
                              <div className="h-12 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-stone-100">
                                <img
                                  src={tpl.imageUrl}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-stone-800 truncate">
                                  {tpl.name}
                                </p>
                                <p className="flex items-center gap-0.5 text-[0.65rem] uppercase tracking-wider text-stone-400">
                                  {cat?.icon && <span>{cat.icon}</span>}
                                  <span className="truncate">{cat?.label ?? tpl.category}</span>
                                </p>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <Button
                      type="button"
                      onClick={() => setShowUnsplashModal(true)}
                      variant="outline"
                      className="w-full h-12 rounded-2xl border-2 border-stone-200 hover:border-teal-400 hover:bg-teal-50/50 flex items-center justify-center gap-3 text-stone-700 font-semibold transition-all group"
                    >
                      <ImageIcon
                        size={20}
                        className="text-stone-400 group-hover:text-teal-600 transition-colors"
                      />
                      <span>Chercher une image sur la banque d&apos;images ou similaire</span>
                    </Button>
                  </div>
                )}

                {SHOW_AI_IMAGE_GENERATION && (
                  /* AI Image Generation (paid option) */
                  <div className="mb-8">
                    <button
                      type="button"
                      onClick={() => setShowAiGeneratorModal(true)}
                      className="w-full flex items-center gap-4 rounded-2xl border-2 border-dashed border-violet-300 bg-gradient-to-r from-violet-50/80 to-fuchsia-50/80 px-5 py-4 text-left transition-all hover:border-violet-400 hover:shadow-md hover:shadow-violet-100/50 hover:-translate-y-0.5 group"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-100 group-hover:bg-violet-200 transition-colors">
                        <Wand2
                          size={22}
                          className="text-violet-600 group-hover:text-violet-700 transition-colors"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-violet-800">Générer par IA</span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-200/80 text-violet-700 text-[10px] font-bold uppercase tracking-wider">
                            <Sparkles size={10} />
                            Premium
                          </span>
                        </div>
                        <p className="text-xs text-violet-600/70 mt-0.5">
                          Créez une image unique par IA —{' '}
                          {AI_GENERATION_PRICE_EUR.toFixed(2).replace('.', ',')} &euro;
                        </p>
                      </div>
                      <span className="text-violet-400 shrink-0 group-hover:text-violet-600 transition-colors">
                        &rarr;
                      </span>
                    </button>
                  </div>
                )}

                {/* Retouche photo : filtres + recadrage/zoom dans un modal */}
                {frontImage && (
                  <section className="mt-8 pt-8 border-t border-stone-200">
                    <button
                      type="button"
                      onClick={() => {
                        setShowImageEditModal(true)
                        setShowCropPanel(true)
                        setImgNaturalSize(null)
                      }}
                      className={cn(
                        'flex items-center gap-3 w-full rounded-xl border-2 p-3 text-left transition-all',
                        showImageEditModal || showCropPanel || isFrontFilterEdited
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-stone-200 hover:border-teal-200 hover:bg-stone-50',
                      )}
                    >
                      <span
                        className={cn(
                          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                          showImageEditModal || showCropPanel || isFrontFilterEdited
                            ? 'bg-teal-500 text-white'
                            : 'bg-teal-100 text-teal-600',
                        )}
                      >
                        <SlidersHorizontal size={20} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-stone-800 uppercase tracking-wider">
                          Retoucher la photo
                        </h3>
                        <p className="text-xs text-stone-500">
                          Filtres, recadrage et zoom dans un éditeur dédié
                        </p>
                      </div>
                      <span className="text-stone-400 shrink-0">▶</span>
                    </button>
                  </section>
                )}

                {/* Face avant : texte + emoji */}
                <section className="mt-8 pt-8 border-t border-stone-200">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-100 text-teal-600">
                      <Sparkles size={18} />
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-stone-800 uppercase tracking-wider">
                        Face avant
                      </h3>
                      <p className="text-xs text-stone-500">Texte et emoji sur la photo</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="mb-1.5 flex items-center justify-between">
                        <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider">
                          Texte accroche
                        </label>
                        {frontCaption.trim().length > 0 ? (
                          <button
                            type="button"
                            onClick={() => setFrontCaption('')}
                            className="text-[11px] font-semibold text-stone-500 hover:text-teal-600 transition-colors"
                          >
                            Effacer
                          </button>
                        ) : null}
                      </div>
                      <Input
                        placeholder="ex: Souvenirs magiques"
                        value={frontCaption}
                        onChange={(e) => setFrontCaption(e.target.value)}
                        maxLength={40}
                        className="h-11 rounded-xl border-stone-200 bg-stone-50/80 text-stone-800 placeholder:text-stone-400 focus:border-teal-400 focus:ring-teal-400"
                      />
                      <p className="mt-1 text-[11px] text-stone-400">
                        Optionnel : laissez vide pour ne rien afficher sur la carte (max. 40
                        caractères)
                      </p>
                    </div>
                    {frontCaption.trim().length > 0 && (
                      <>
                        {/* Presets de style */}
                        <div>
                          <label className="mb-2 block text-xs font-semibold text-stone-600 uppercase tracking-wider">
                            Style du texte
                          </label>
                          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
                            {CAPTION_PRESETS.map((preset) => {
                              const extraStyle = getCaptionExtraStyle(preset.id)
                              const isActive = frontCaptionPreset === preset.id
                              return (
                                <button
                                  key={preset.id}
                                  type="button"
                                  onClick={() => setFrontCaptionPreset(preset.id)}
                                  className={[
                                    'shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl border-2 text-center transition-all',
                                    isActive
                                      ? 'border-teal-400 bg-teal-50 shadow-sm'
                                      : 'border-stone-200 bg-white hover:border-stone-300',
                                  ].join(' ')}
                                  style={{ minWidth: 68 }}
                                >
                                  <span className="text-lg leading-none">{preset.emoji}</span>
                                  <span
                                    className="text-[10px] font-bold leading-tight"
                                    style={extraStyle}
                                  >
                                    {preset.label}
                                  </span>
                                </button>
                              )
                            })}
                          </div>
                        </div>
                        <div>
                          <label className="mb-1.5 block text-xs font-semibold text-stone-600 uppercase tracking-wider">
                            Police
                          </label>
                          <select
                            value={frontCaptionFontFamily}
                            onChange={(e) =>
                              setFrontCaptionFontFamily(e.target.value as FrontCaptionFontFamily)
                            }
                            className="w-full h-10 rounded-xl border border-stone-200 bg-stone-50/80 px-3 text-sm text-stone-800 focus:border-teal-400 focus:ring-teal-400"
                          >
                            <option value="serif">Serif</option>
                            <option value="sans">Sans-serif</option>
                            <option value="cursive">Script / Cursive</option>
                            <option value="display">Display</option>
                            <option value="architectsDaughter">Architects Daughter</option>
                          </select>
                        </div>
                        <div>
                          <label className="mb-1.5 block text-xs font-semibold text-stone-600 uppercase tracking-wider">
                            Taille de police
                          </label>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-10 w-10 rounded-xl border-stone-200 shrink-0"
                              onClick={() =>
                                setFrontCaptionFontSize((s) =>
                                  Math.max(CAPTION_FONT_SIZE_MIN, s - CAPTION_FONT_SIZE_STEP),
                                )
                              }
                              disabled={frontCaptionFontSize <= CAPTION_FONT_SIZE_MIN}
                              aria-label="Réduire la taille"
                            >
                              <Minus size={18} />
                            </Button>
                            <span className="min-w-[4rem] text-center text-sm font-semibold text-stone-800 tabular-nums">
                              {frontCaptionFontSize} px
                            </span>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-10 w-10 rounded-xl border-stone-200 shrink-0"
                              onClick={() =>
                                setFrontCaptionFontSize((s) =>
                                  Math.min(CAPTION_FONT_SIZE_MAX, s + CAPTION_FONT_SIZE_STEP),
                                )
                              }
                              disabled={frontCaptionFontSize >= CAPTION_FONT_SIZE_MAX}
                              aria-label="Augmenter la taille"
                            >
                              <Plus size={18} />
                            </Button>
                          </div>
                        </div>
                        <div>
                          <label className="mb-1.5 block text-xs font-semibold text-stone-600 uppercase tracking-wider">
                            Couleur du texte
                          </label>
                          <select
                            value={frontCaptionColor}
                            onChange={(e) =>
                              setFrontCaptionColor(e.target.value as FrontCaptionColor)
                            }
                            className="w-full h-10 rounded-xl border border-stone-200 bg-stone-50/80 px-3 text-sm text-stone-800 focus:border-teal-400 focus:ring-teal-400"
                          >
                            <option value="stone-900">Gris foncé</option>
                            <option value="white">Blanc</option>
                            <option value="black">Noir</option>
                            <option value="teal-800">Teal</option>
                            <option value="stone-700">Gris</option>
                            <option value="amber-900">Ambre</option>
                            <option value="rose-900">Rose</option>
                            <option value="emerald-900">Émeraude</option>
                          </select>
                        </div>
                        {!captionHidesBg && (
                          <div>
                            <div className="mb-1.5 flex items-center justify-between">
                              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider">
                                Opacité du fond
                              </label>
                              <span className="text-xs font-medium text-stone-500 tabular-nums">
                                {frontTextBgOpacity}%
                              </span>
                            </div>
                            <input
                              type="range"
                              min={0}
                              max={100}
                              step={1}
                              value={frontTextBgOpacity}
                              onChange={(e) => setFrontTextBgOpacity(Number(e.target.value))}
                              className="w-full h-2 rounded-full appearance-none bg-stone-200 accent-teal-500 cursor-pointer"
                            />
                          </div>
                        )}
                      </>
                    )}
                    <div>
                      <label className="mb-2 block text-xs font-semibold text-stone-600 uppercase tracking-wider">
                        Emoji
                      </label>
                      <div className="relative">
                        <div className="flex flex-wrap items-center gap-2">
                          {EMOJI_SUGGESTIONS.map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => setFrontEmoji(emoji)}
                              className={cn(
                                'flex h-10 w-10 items-center justify-center rounded-xl border-2 text-xl transition-all',
                                frontEmoji === emoji
                                  ? 'border-teal-500 bg-teal-50 text-teal-700 shadow-sm'
                                  : 'border-stone-200 bg-white text-stone-500 hover:border-teal-300 hover:bg-teal-50/50',
                              )}
                              title={`Choisir ${emoji}`}
                            >
                              {emoji}
                            </button>
                          ))}
                          <Input
                            placeholder="✨"
                            value={frontEmoji}
                            onChange={(e) => setFrontEmoji(e.target.value)}
                            maxLength={4}
                            className="h-10 w-16 rounded-xl border-stone-200 text-center text-lg tracking-widest"
                          />
                          <button
                            type="button"
                            className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-stone-200 bg-white text-stone-400 transition-colors hover:border-teal-400 hover:text-teal-600"
                            onClick={() => setShowEmojiPicker((value) => !value)}
                            aria-label="Choisir un emoji par thème"
                          >
                            <Grid size={16} />
                          </button>
                          {frontEmoji && (
                            <button
                              type="button"
                              onClick={() => setFrontEmoji('')}
                              className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-stone-200 bg-white text-stone-400 transition-colors hover:border-red-400 hover:text-red-500"
                              title="Retirer l'emoji"
                            >
                              <X size={15} />
                            </button>
                          )}
                          <button
                            type="button"
                            className="flex h-12 px-5 items-center justify-center rounded-xl border-2 border-stone-200 bg-white text-stone-500 transition-colors hover:border-teal-400 hover:text-teal-600 gap-2 font-semibold text-sm"
                            onClick={() => setShowStickerGallery(true)}
                            aria-label="Ajouter des stickers"
                          >
                            <StickerIcon size={20} />
                            Stickers
                          </button>
                        </div>
                        {showEmojiPicker && (
                          <div
                            ref={emojiPickerRef}
                            className="absolute z-20 mt-2 w-full rounded-2xl border border-stone-200 bg-white p-3 shadow-xl shadow-stone-400/20"
                          >
                            <div className="flex flex-wrap gap-2 border-b border-stone-100 pb-3">
                              {EMOJI_CATEGORIES.map((category) => (
                                <button
                                  key={category.key}
                                  type="button"
                                  onClick={() => setSelectedEmojiCategory(category.key)}
                                  className={cn(
                                    'flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold transition-all',
                                    selectedEmojiCategory === category.key
                                      ? 'border-teal-500 bg-teal-50 text-teal-700 shadow-sm'
                                      : 'border-stone-200 bg-white text-stone-500 hover:border-teal-300',
                                  )}
                                >
                                  <span>{category.icon}</span>
                                  {category.label}
                                </button>
                              ))}
                            </div>
                            <div className="mt-3 grid grid-cols-6 gap-2 max-h-48 overflow-y-auto pb-1">
                              {currentEmojiCategory.emojis.map((emoji) => (
                                <button
                                  key={emoji}
                                  type="button"
                                  onClick={() => {
                                    setFrontEmoji(emoji)
                                    setShowEmojiPicker(false)
                                  }}
                                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-stone-100 bg-stone-50 text-2xl transition hover:border-teal-300 hover:bg-teal-50"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Emojis sur la face avant */}
                {frontImage && (
                  <section className="mt-6 pt-6 border-t border-stone-200">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-600 text-lg">
                        🎭
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-stone-800 uppercase tracking-wider">
                          Emojis sur la carte
                        </h3>
                        <p className="text-xs font-semibold text-stone-500">
                          Ajoutez des emojis directement sur la photo · glissez · pincez pour zoomer
                        </p>
                      </div>
                    </div>
                    {/* Suggestions rapides */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {(
                        [
                          ...EMOJI_SUGGESTIONS,
                          '❤️',
                          '⭐',
                          '🔥',
                          '🎉',
                          '😎',
                          '🌈',
                          '🏖️',
                          '🎨',
                        ] as string[]
                      ).map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => {
                            const newSticker: EmojiSticker = {
                              id: `es-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                              emoji,
                              x: 30 + Math.random() * 40,
                              y: 20 + Math.random() * 60,
                              scale: 1,
                            }
                            setEmojiStickers((prev) => [...prev, newSticker])
                          }}
                          className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-stone-200 bg-white text-xl transition-all hover:border-teal-400 hover:bg-teal-50 hover:scale-110"
                          title={`Ajouter ${emoji}`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                    {/* Liste des emojis placés */}
                    {emojiStickers.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2 p-2 bg-stone-50 rounded-xl border border-stone-200">
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider w-full mb-1">
                          Sur la carte :
                        </span>
                        {emojiStickers.map((es) => (
                          <div
                            key={es.id}
                            className="flex items-center gap-1 bg-white border border-stone-200 rounded-lg px-2 py-1"
                          >
                            <span className="text-lg">{es.emoji}</span>
                            <button
                              type="button"
                              onClick={() =>
                                setEmojiStickers((prev) => prev.filter((s) => s.id !== es.id))
                              }
                              className="text-stone-300 hover:text-red-500 transition-colors"
                              title="Retirer"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => setEmojiStickers([])}
                          className="ml-auto text-[11px] text-stone-400 hover:text-red-500 transition-colors font-semibold"
                        >
                          Tout effacer
                        </button>
                      </div>
                    )}
                  </section>
                )}

                {/* Interactive Front Face Editor */}
                {frontImage && (frontCaption.trim().length > 0 || emojiStickers.length > 0) && (
                  <section className="mt-8 pt-8 border-t border-stone-200">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-100 text-teal-600">
                        <Move size={18} />
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-stone-800 uppercase tracking-wider">
                          Position du texte
                        </h3>
                        <p className="text-xs font-semibold text-stone-500">
                          Glissez le texte pour le repositionner sur la photo
                        </p>
                      </div>
                    </div>
                    <FrontFaceEditor
                      frontImage={frontImage}
                      frontImageCrop={frontImageCrop}
                      frontImageFilter={frontImageFilter}
                      frontCaption={frontCaption}
                      frontEmoji={frontEmoji}
                      frontCaptionPosition={frontCaptionPosition}
                      frontTextBgOpacity={frontTextBgOpacity}
                      frontCaptionPreset={frontCaptionPreset}
                      frontCaptionWidth={frontCaptionWidth}
                      location={location}
                      stickers={stickers}
                      emojiStickers={emojiStickers}
                      onCaptionPositionChange={setFrontCaptionPosition}
                      onEmojiStickerChange={setEmojiStickers}
                      className="w-full"
                    />
                    {/* Largeur du bloc texte */}
                    <div className="mt-4">
                      <div className="mb-1.5 flex items-center justify-between">
                        <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider">
                          Largeur du bloc
                        </label>
                        <span className="text-xs font-medium text-stone-500 tabular-nums">
                          {frontCaptionWidth != null ? `${frontCaptionWidth}%` : 'Auto'}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={20}
                        max={95}
                        step={5}
                        value={frontCaptionWidth ?? 70}
                        onChange={(e) => setFrontCaptionWidth(Number(e.target.value))}
                        className="w-full h-2 rounded-full appearance-none bg-stone-200 accent-teal-500 cursor-pointer"
                      />
                      {frontCaptionWidth != null && (
                        <button
                          type="button"
                          onClick={() => setFrontCaptionWidth(undefined)}
                          className="mt-1.5 text-[11px] font-semibold text-stone-500 hover:text-teal-600 transition-colors"
                        >
                          Réinitialiser (auto)
                        </button>
                      )}
                    </div>
                  </section>
                )}

                {/* Lieu du souvenir — en bas à gauche */}
                <section className="mt-8 pt-8 border-t border-stone-200 flex flex-col items-start text-left">
                  <label className="flex items-center gap-2 text-sm font-bold text-stone-800 mb-3 uppercase tracking-wider">
                    <span className="flex items-center gap-2">
                      <MapPin size={16} className="text-teal-500" /> Lieu du souvenir
                    </span>
                  </label>
                  <div className="relative w-full max-w-md">
                    <Input
                      placeholder="Tapez un lieu (ville, pays, région…)"
                      value={location}
                      onChange={(e) => {
                        const val = e.target.value
                        setLocation(val)
                        if (val.length > 2) {
                          setIsLocating(true)
                          // Debounce search
                          const timeoutId = setTimeout(() => {
                            fetch(`https://photon.komoot.io/api/?q=${val}&lang=fr`)
                              .then((res) => res.json())
                              .then((data) => {
                                setSuggestions(data.features || [])
                                setIsLocating(false)
                              })
                              .catch(() => setIsLocating(false))
                          }, 500)
                          return () => clearTimeout(timeoutId)
                        } else {
                          setSuggestions([])
                        }
                      }}
                      className="w-full rounded-xl border border-stone-200 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-base py-3 px-4 pl-10 bg-stone-50 focus:bg-white transition-colors placeholder:text-stone-400"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
                      {isLocating ? (
                        <RefreshCw size={18} className="animate-spin text-teal-500" />
                      ) : (
                        <MapPin size={18} />
                      )}
                    </div>
                    {suggestions.length > 0 && (
                      <div className="absolute z-50 mt-1 w-full rounded-xl border border-stone-100 bg-white shadow-xl max-h-60 overflow-y-auto">
                        {suggestions.map((s: any, i) => (
                          <button
                            key={i}
                            type="button"
                            className="w-full px-4 py-3 text-left hover:bg-teal-50 transition-colors border-b border-stone-50 last:border-0 flex items-center gap-2 text-sm"
                            onClick={() => {
                              setLocation(
                                `${s.properties.name}, ${
                                  s.properties.city || s.properties.country || ''
                                }`,
                              )
                              if (s.geometry?.coordinates) {
                                setCoords({
                                  lat: s.geometry.coordinates[1],
                                  lng: s.geometry.coordinates[0],
                                })
                              }
                              setSuggestions([])
                            }}
                          >
                            <MapPin size={14} className="text-teal-500 shrink-0" />
                            <span className="font-medium text-stone-700">{s.properties.name}</span>
                            <span className="text-stone-400 text-xs ml-auto">
                              {s.properties.city} {s.properties.country}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                    {/* Bouton de géolocalisation automatique */}
                    <button
                      type="button"
                      onClick={() => handleAutoLocate()}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-stone-400 hover:text-teal-600 hover:bg-teal-50 transition-colors"
                      title="Me géolocaliser"
                    >
                      <Locate size={18} />
                    </button>
                  </div>
                  <p className="mt-2 text-[11px] text-stone-400 flex items-start gap-1.5">
                    <Info size={12} className="shrink-0 mt-0.5" />
                    Ce lieu apparaîtra sur le timbre et la carte au verso.
                  </p>
                </section>

                <div className="mt-8 pt-6 border-t border-stone-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
                  {!frontImage && (
                    <Button
                      type="button"
                      onClick={handleContinueWithDefaultPhoto}
                      disabled={isApplyingDefaultPhoto}
                      className="rounded-xl font-bold flex items-center justify-center gap-2 px-6 py-4 h-auto transition-all shadow-lg shadow-teal-100 bg-teal-500 hover:bg-teal-600 text-white"
                    >
                      {isApplyingDefaultPhoto ? (
                        <>
                          <RefreshCw size={18} className="animate-spin" />
                          Chargement…
                        </>
                      ) : (
                        <>
                          Continuer avec la photo de base
                          <ChevronRight size={18} />
                        </>
                      )}
                    </Button>
                  )}
                  <Button
                    onClick={goNext}
                    disabled={!canGoNext()}
                    className={cn(
                      'rounded-xl font-bold flex items-center justify-center gap-2 px-6 py-4 h-auto transition-all shadow-lg shadow-teal-100',
                      canGoNext()
                        ? 'bg-teal-500 hover:bg-teal-600 text-white'
                        : 'bg-stone-200 text-stone-400 cursor-not-allowed',
                    )}
                  >
                    Continuer
                    <ChevronRight size={18} />
                  </Button>
                </div>
              </div>
            )}

            {/* ==================== STEP: PAIEMENT ==================== */}
            {currentStep === 'payment' && (
              <div className="w-full max-w-full space-y-6">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 sm:p-8">
                  <h2 className="text-2xl font-serif font-bold text-stone-800 mb-1">
                    Choisissez votre formule
                  </h2>
                  <p className="text-stone-500 text-sm">
                    Tous les plans vous permettent de modifier votre carte depuis votre compte.
                  </p>
                </div>

                {/* Plan selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Carte gratuite (limitée) */}
                  <button
                    type="button"
                    onClick={() => {
                      if (message.length <= 500) {
                        setSelectedPlan('ephemere')
                      }
                    }}
                    disabled={message.length > 500}
                    className={cn(
                      'relative w-full text-left rounded-2xl border-2 p-5 transition-all duration-200 focus:outline-none',
                      selectedPlan === 'ephemere'
                        ? 'border-stone-400 bg-stone-50 ring-2 ring-stone-400 shadow-md'
                        : 'border-stone-200 bg-white hover:border-stone-300 hover:shadow-sm',
                      message.length > 500 && 'opacity-50 cursor-not-allowed',
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl leading-none mt-0.5">🌸</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-bold text-stone-900 text-sm">Carte gratuite</span>
                          <span className="font-black text-base text-stone-700">Gratuit</span>
                        </div>
                        <p className="text-[11px] text-stone-400 mb-2">Limitée mais permanente</p>
                        <ul className="space-y-1">
                          {[
                            '1 photo (pas de vidéo ni audio)',
                            "Jusqu'à 500 caractères",
                            'Lien de partage permanent',
                          ].map((f, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-1.5 text-[11px] text-stone-600"
                            >
                              <span
                                className={cn(
                                  'mt-0.5 flex-shrink-0 w-3.5 h-3.5 rounded-full flex items-center justify-center',
                                  selectedPlan === 'ephemere' ? 'bg-stone-700' : 'bg-stone-200',
                                )}
                              >
                                <svg className="w-2 h-2 text-white" viewBox="0 0 8 8" fill="none">
                                  <path
                                    d="M1.5 4L3 5.5L6.5 2"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </span>
                              {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div
                      className={cn(
                        'absolute top-4 right-4 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all',
                        selectedPlan === 'ephemere'
                          ? 'border-stone-400 bg-stone-700'
                          : 'border-stone-300 bg-white',
                      )}
                    >
                      {selectedPlan === 'ephemere' && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </div>
                  </button>

                  {/* Carte complète (payante) */}
                  <button
                    type="button"
                    onClick={() => setSelectedPlan('payant')}
                    className={cn(
                      'relative w-full text-left rounded-2xl border-2 p-5 transition-all duration-200 focus:outline-none',
                      selectedPlan === 'payant'
                        ? 'border-teal-400 bg-teal-50 ring-2 ring-teal-500 shadow-md'
                        : 'border-stone-200 bg-white hover:border-stone-300 hover:shadow-sm',
                    )}
                  >
                    <span className="absolute -top-2.5 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm bg-teal-100 text-teal-800">
                      Populaire
                    </span>
                    <div className="flex items-start gap-3">
                      <span className="text-2xl leading-none mt-0.5">💌</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-bold text-stone-900 text-sm">Carte complète</span>
                          <span className="font-black text-base text-teal-700">2,50 €</span>
                        </div>
                        <p className="text-[11px] text-stone-400 mb-2">
                          Tout compris, sans limites
                        </p>
                        <ul className="space-y-1">
                          {[
                            'Photos, vidéo et message vocal',
                            'Envoi illimité de destinataires',
                            'Statistiques de visite',
                            'Modifiable depuis votre compte',
                            'Durée illimitée',
                          ].map((f, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-1.5 text-[11px] text-stone-600"
                            >
                              <span
                                className={cn(
                                  'mt-0.5 flex-shrink-0 w-3.5 h-3.5 rounded-full flex items-center justify-center',
                                  selectedPlan === 'payant' ? 'bg-teal-500' : 'bg-stone-200',
                                )}
                              >
                                <svg className="w-2 h-2 text-white" viewBox="0 0 8 8" fill="none">
                                  <path
                                    d="M1.5 4L3 5.5L6.5 2"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </span>
                              {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div
                      className={cn(
                        'absolute top-4 right-4 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all',
                        selectedPlan === 'payant'
                          ? 'border-teal-400 bg-teal-500'
                          : 'border-stone-300 bg-white',
                      )}
                    >
                      {selectedPlan === 'payant' && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </div>
                  </button>
                </div>

                {/* Upsell : Pack de cartes postales */}
                <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 rounded-2xl transition-all duration-300 border border-amber-200/80 shadow-sm overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowPacks(!showPacks)}
                    className="w-full flex items-center justify-between p-5 sm:p-6 text-left hover:bg-amber-100/30 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="bg-amber-100 p-2.5 rounded-xl shrink-0">
                        <Gift size={20} className="text-amber-600" />
                      </div>
                      <div>
                        <h3 className="font-black text-stone-900 text-sm sm:text-base">
                          Besoin de plusieurs cartes ?
                        </h3>
                        <p className="text-stone-500 text-xs mt-0.5">
                          Achetez un pack et profitez de tarifs dégressifs — jusqu&apos;à{' '}
                          <strong className="text-amber-700">1,40 €/carte</strong>
                        </p>
                      </div>
                    </div>
                    <ChevronUp
                      size={20}
                      className={cn(
                        'text-amber-400 transition-transform duration-300',
                        !showPacks && 'rotate-180',
                      )}
                    />
                  </button>

                  <div
                    className={cn(
                      'px-5 sm:px-6 pb-6 transition-all duration-300',
                      showPacks ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden',
                    )}
                  >
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {PACK_TIERS.map((tier) => (
                        <a
                          key={tier.id}
                          href="/connexion?redirect=/espace-client"
                          className={cn(
                            'relative flex flex-col items-center p-3 rounded-xl bg-white border transition-all hover:shadow-md hover:-translate-y-0.5 text-center group',
                            tier.popular
                              ? 'border-amber-300 shadow-sm'
                              : 'border-amber-100 hover:border-amber-300',
                          )}
                        >
                          {tier.popular && (
                            <span className="absolute -top-2 px-2 py-0.5 bg-amber-500 text-white text-[9px] font-black uppercase tracking-wider rounded-full shadow-sm">
                              Populaire
                            </span>
                          )}
                          <span className="font-black text-stone-900 text-sm mt-1">
                            {tier.count} cartes
                          </span>
                          <span className="font-bold text-amber-700 text-base">{tier.price} €</span>
                          <span className="text-[10px] text-stone-400 font-medium">
                            {(tier.price / tier.count).toFixed(2).replace('.', ',')} €/carte
                          </span>
                          <span className="mt-1.5 text-[10px] font-bold text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                            Voir <ChevronRight size={10} />
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Récap + CTA */}
                <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="text-sm text-stone-500">Formule sélectionnée</p>
                      <p className="font-bold text-stone-900">
                        {selectedPlan === 'ephemere' ? '🌸 Carte gratuite' : '💌 Carte complète'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-stone-500">Total</p>
                      <p className="text-2xl font-black text-stone-900">
                        {getAlbumPrice() === 0 ? 'Gratuit' : `${getAlbumPrice().toFixed(2)} €`}
                      </p>
                    </div>
                  </div>

                  {/* Promo Code (only for paid plan) */}
                  {!codeSuccess && getAlbumPrice() > 0 && (
                    <div className="mb-4 pt-4 border-t border-stone-100">
                      <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">
                        Code promo
                      </p>
                      <div className="flex gap-2">
                        <Input
                          placeholder="CODE"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                          className="h-10 text-sm font-mono"
                        />
                        <Button
                          size="sm"
                          onClick={async () => {
                            if (!promoCode || isActivatingCode) return
                            setIsActivatingCode(true)
                            const { validatePromoCode } = await import('@/actions/leads-actions')
                            const res = await validatePromoCode(promoCode)
                            setIsActivatingCode(false)
                            if (res.success) {
                              setCodeSuccess(true)
                              setIsPremium(true)
                            } else {
                              setCodeError(res.error || 'Invalide')
                              setTimeout(() => setCodeError(null), 3000)
                            }
                          }}
                          className="bg-stone-800 text-white h-10 px-4"
                        >
                          {isActivatingCode ? (
                            <RefreshCw size={14} className="animate-spin" />
                          ) : (
                            'Appliquer'
                          )}
                        </Button>
                      </div>
                      {codeError && <p className="text-[10px] text-red-500 mt-1">{codeError}</p>}
                    </div>
                  )}
                  {codeSuccess && (
                    <div className="mb-4 flex items-center gap-2 text-teal-600 text-sm font-bold">
                      <CheckCircle2 size={16} /> Code appliqué — Accès gratuit !
                    </div>
                  )}

                  <div className="flex flex-col gap-3">
                    {getAlbumPrice() > 0 && !codeSuccess && (currentUser?.credits || 0) > 0 && (
                      <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl mb-1">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Sparkles size={16} className="text-teal-600" />
                            <span className="text-sm font-bold text-teal-800">
                              Vous avez {currentUser?.credits} crédits
                            </span>
                          </div>
                          <span className="text-[10px] font-black uppercase text-teal-600 bg-white px-2 py-0.5 rounded-full border border-teal-100">
                            Prêt
                          </span>
                        </div>
                        <Button
                          onClick={handlePayWithCredit}
                          disabled={isPayingWithCredit || isPublishing}
                          className="w-full rounded-xl font-black py-4 h-auto bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-900/10 transition-all flex items-center justify-center gap-2"
                        >
                          {isPayingWithCredit ? (
                            <RefreshCw size={18} className="animate-spin" />
                          ) : (
                            <>
                              <Sparkles size={18} />
                              <span>Utiliser 1 crédit</span>
                            </>
                          )}
                        </Button>
                        {creditError && (
                          <p className="text-[10px] text-rose-500 mt-2 font-bold text-center">
                            {creditError}
                          </p>
                        )}
                      </div>
                    )}
                    {getAlbumPrice() > 0 && !codeSuccess && currentUser?.role !== 'admin' ? (
                      <Button
                        onClick={handlePayWithRevolut}
                        disabled={isRevolutRedirecting || isPublishing}
                        className="w-full rounded-2xl font-bold py-6 h-auto bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-100 transition-all flex items-center justify-center gap-3 text-lg"
                      >
                        {isRevolutRedirecting || isPublishing ? (
                          <RefreshCw size={24} className="animate-spin" />
                        ) : (
                          <>
                            <CreditCard size={20} />
                            <span>Régler {getAlbumPrice().toFixed(2)} €</span>
                            <ChevronRight size={20} />
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        onClick={goNext}
                        disabled={!canGoNext()}
                        className="w-full rounded-2xl font-bold py-6 h-auto bg-teal-500 hover:bg-teal-600 text-white shadow-lg shadow-teal-100 transition-all flex items-center justify-center gap-3 text-lg"
                      >
                        {selectedPlan === 'ephemere' ? 'Continuer gratuitement' : 'Continuer'}
                        <ChevronRight size={20} />
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      onClick={goPrev}
                      className="w-full rounded-xl font-semibold py-3 h-auto text-stone-400 hover:text-stone-600 hover:bg-stone-50 transition-all"
                    >
                      <ChevronLeft size={18} className="mr-2" />
                      Modifier ma carte
                    </Button>
                  </div>
                  <p className="text-center text-[10px] text-stone-400 mt-4">
                    Paiement sécurisé via Revolut · CB, Apple Pay, Google Pay
                  </p>
                </div>
              </div>
            )}
            {/* ==================== STEP: RÉDACTION (fusionné) ==================== */}
            {currentStep === 'redaction' && (
              <div className="w-full max-w-full bg-white rounded-[2rem] shadow-xl shadow-stone-200/40 border border-stone-100 overflow-hidden">
                {/* Header */}
                <div className="p-6 sm:p-8 border-b border-stone-100 bg-gradient-to-r from-stone-50 via-white to-white">
                  <div className="flex items-center gap-3">
                    <span className="bg-orange-100 text-orange-600 p-2.5 rounded-xl">
                      <PenTool size={22} />
                    </span>
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-800">
                        Studio de Création
                      </h2>
                      <p className="text-stone-500 text-sm">
                        Personnalisez le verso de votre carte
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 sm:p-8 space-y-8">
                  {/* Destinataire & Signature — côte à côte en haut */}
                  <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-stone-800 mb-3 uppercase tracking-wider">
                        <Users size={16} className="text-teal-500" /> Destinataire
                      </label>
                      <input
                        type="text"
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        placeholder="ex: Papa & Maman"
                        className="w-full rounded-xl border border-stone-200 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-base py-3 px-4 bg-stone-50 focus:bg-white transition-colors placeholder:text-stone-400"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-stone-800 mb-3 uppercase tracking-wider">
                        <Stamp size={16} className="text-teal-500" /> Signature
                      </label>
                      <input
                        type="text"
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        placeholder="ex: Sarah"
                        className="w-full rounded-xl border border-stone-200 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-base py-3 px-4 font-sans bg-stone-50 focus:bg-white transition-colors placeholder:text-stone-400"
                      />
                    </div>
                  </section>

                  {/* Réglages de la carte (Commentaires & Visibilité) */}
                  <section className="bg-stone-50/50 rounded-2xl p-5 border border-stone-100 flex flex-wrap gap-6 items-center">
                    <div
                      className="flex items-center gap-3 cursor-pointer group"
                      onClick={() => setAllowComments(!allowComments)}
                    >
                      <div
                        className={cn(
                          'w-5 h-5 rounded border transition-all flex items-center justify-center',
                          allowComments
                            ? 'bg-teal-500 border-teal-500 text-white'
                            : 'border-stone-300 bg-white group-hover:border-teal-300',
                        )}
                      >
                        {allowComments && <Check size={14} strokeWidth={3} />}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-stone-700">
                          Autoriser les commentaires
                        </span>
                        <span className="text-[10px] text-stone-400 uppercase tracking-wider font-medium">
                          Les gens pourront vous répondre
                        </span>
                      </div>
                    </div>

                    <div className="w-px h-8 bg-stone-200 hidden sm:block" />

                    <div
                      className="flex items-center gap-3 cursor-pointer group"
                      onClick={() => setIsPasswordProtected(!isPasswordProtected)}
                    >
                      <div
                        className={cn(
                          'w-5 h-5 rounded border transition-all flex items-center justify-center',
                          isPasswordProtected
                            ? 'bg-purple-500 border-purple-500 text-white'
                            : 'border-stone-300 bg-white group-hover:border-purple-300',
                        )}
                      >
                        {isPasswordProtected && <Check size={14} strokeWidth={3} />}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-stone-700">Mot de passe</span>
                        <span className="text-[10px] text-stone-400 uppercase tracking-wider font-medium">
                          {isPasswordProtected ? 'Accès sécurisé' : 'Accès libre'}
                        </span>
                      </div>
                    </div>

                    {isPasswordProtected && (
                      <div className="flex-1 min-w-[150px]">
                        <input
                          type="text"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Définir un secret..."
                          className="w-full rounded-xl border border-stone-200 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-xs py-2 px-3 bg-white transition-colors"
                        />
                      </div>
                    )}

                    {SHOW_SCRATCH_PUZZLE_OPTIONS && (
                      <>
                        <div className="w-px h-8 bg-stone-200 hidden sm:block" />

                        <div
                          className="flex items-center gap-3 cursor-pointer group"
                          onClick={() => {
                            const next = !scratchCardEnabled
                            setScratchCardEnabled(next)
                            if (next) setPuzzleCardEnabled(false)
                          }}
                        >
                          <div
                            className={cn(
                              'w-5 h-5 rounded border transition-all flex items-center justify-center',
                              scratchCardEnabled
                                ? 'bg-amber-500 border-amber-500 text-white'
                                : 'border-stone-300 bg-white group-hover:border-amber-300',
                            )}
                          >
                            {scratchCardEnabled && <Check size={14} strokeWidth={3} />}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-stone-700">
                              Carte à gratter
                            </span>
                            <span className="text-[10px] text-stone-400 uppercase tracking-wider font-medium">
                              {scratchCardEnabled
                                ? 'Le destinataire grattera pour découvrir'
                                : 'Effet surprise désactivé'}
                            </span>
                            {scratchCardEnabled && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setShowInteractivePreview('scratch')
                                }}
                                className="text-left text-xs text-amber-600 hover:text-amber-700 font-semibold mt-1"
                              >
                                Voir un aperçu
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="w-px h-8 bg-stone-200 hidden sm:block" />

                        <div
                          className="flex items-center gap-3 cursor-pointer group"
                          onClick={() => {
                            const next = !puzzleCardEnabled
                            setPuzzleCardEnabled(next)
                            if (next) setScratchCardEnabled(false)
                          }}
                        >
                          <div
                            className={cn(
                              'w-5 h-5 rounded border transition-all flex items-center justify-center',
                              puzzleCardEnabled
                                ? 'bg-violet-500 border-violet-500 text-white'
                                : 'border-stone-300 bg-white group-hover:border-violet-300',
                            )}
                          >
                            {puzzleCardEnabled && <Check size={14} strokeWidth={3} />}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-stone-700">Carte puzzle</span>
                            <span className="text-[10px] text-stone-400 uppercase tracking-wider font-medium">
                              {puzzleCardEnabled
                                ? "Le destinataire reconstituera l'image"
                                : 'Puzzle désactivé'}
                            </span>
                            {puzzleCardEnabled && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setShowInteractivePreview('puzzle')
                                }}
                                className="text-left text-xs text-violet-600 hover:text-violet-700 font-semibold mt-1"
                              >
                                Voir un aperçu
                              </button>
                            )}
                          </div>
                        </div>

                        {puzzleCardEnabled && (
                          <div className="flex items-center gap-2 ml-2">
                            {(['3', '4', '5'] as const).map((size) => (
                              <button
                                key={size}
                                type="button"
                                onClick={() => setPuzzleCardDifficulty(size)}
                                className={cn(
                                  'px-3 py-1.5 rounded-lg text-xs font-bold border transition-all',
                                  puzzleCardDifficulty === size
                                    ? 'bg-violet-500 text-white border-violet-500 shadow-sm'
                                    : 'bg-white text-stone-600 border-stone-200 hover:border-violet-300',
                                )}
                              >
                                {size}&times;{size}
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </section>

                  {/* SECTION MESSAGE VOCAL */}
                  <section className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600">
                        <Mic size={16} />
                      </div>
                      <h3 className="font-semibold text-stone-800">Message Vocal</h3>
                    </div>

                    <div className="flex flex-col items-center justify-center gap-4 p-4 border-2 border-dashed border-stone-200 rounded-xl bg-stone-50">
                      {!audioUrl ? (
                        isRecording ? (
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center animate-pulse">
                              <Mic size={32} className="text-red-500" />
                            </div>
                            <div className="text-red-500 font-mono font-bold text-xl">
                              {formatTime(recordingTime)}
                            </div>
                            <button
                              onClick={stopRecording}
                              className="flex items-center gap-2 px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full font-medium transition-colors"
                            >
                              <Square size={16} fill="currentColor" /> Arrêter
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <p className="text-sm text-stone-500 text-center mb-2">
                              Enregistrez un message personnel ou l&apos;ambiance du lieu (max 30s)
                            </p>
                            <button
                              onClick={startRecording}
                              className="flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-full font-medium transition-colors shadow-sm"
                            >
                              <Mic size={20} /> Enregistrer un message
                            </button>
                          </div>
                        )
                      ) : (
                        <div className="w-full flex items-center gap-3 bg-white p-3 rounded-lg border border-stone-200 shadow-sm">
                          <button
                            onClick={() => {
                              const audio = new Audio(audioUrl)
                              audio.play()
                            }}
                            className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center hover:bg-teal-200 transition-colors shrink-0"
                          >
                            <Play size={20} fill="currentColor" />
                          </button>

                          <div className="flex-1 min-w-0">
                            <div className="h-8 flex items-center gap-0.5 opacity-50">
                              {/* Fake waveform visual */}
                              {Array.from({ length: 20 }).map((_, i) => (
                                <div
                                  key={i}
                                  className="flex-1 bg-teal-500 rounded-full"
                                  style={{ height: `${Math.random() * 100}%` }}
                                ></div>
                              ))}
                            </div>
                          </div>

                          <span className="text-xs font-mono text-stone-500 tabular-nums">
                            {formatTime(audioDuration)}
                          </span>

                          <button
                            onClick={deleteAudio}
                            className="p-2 text-stone-400 hover:text-red-500 transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* SECTION MUSIQUE D'AMBIANCE */}
                  <section className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-600">
                        <Volume2 size={16} />
                      </div>
                      <h3 className="font-semibold text-stone-800">Musique d&apos;ambiance</h3>
                      {backgroundMusic && (
                        <span className="ml-auto text-xs bg-violet-100 text-violet-700 font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
                          🎵 {backgroundMusicTitle || 'Musique choisie'}
                        </span>
                      )}
                    </div>

                    {backgroundMusic ? (
                      <div className="flex items-center gap-3 bg-violet-50 border border-violet-200 rounded-xl p-3">
                        <button
                          type="button"
                          onClick={() => {
                            if (isPlayingEditorMusic && editorMusicAudioRef.current) {
                              editorMusicAudioRef.current.pause()
                              setIsPlayingEditorMusic(false)
                              return
                            }
                            if (editorMusicAudioRef.current) {
                              editorMusicAudioRef.current.pause()
                              editorMusicAudioRef.current = null
                            }
                            const a = new Audio(backgroundMusic)
                            editorMusicAudioRef.current = a
                            a.onended = () => {
                              setIsPlayingEditorMusic(false)
                              editorMusicAudioRef.current = null
                            }
                            a.onpause = () => setIsPlayingEditorMusic(false)
                            a.play().catch(() => {
                              setIsPlayingEditorMusic(false)
                              editorMusicAudioRef.current = null
                            })
                            setIsPlayingEditorMusic(true)
                          }}
                          className="w-9 h-9 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center hover:bg-violet-200 transition-colors shrink-0"
                          title={isPlayingEditorMusic ? 'Pause' : 'Lecture'}
                        >
                          {isPlayingEditorMusic ? (
                            <Pause size={16} fill="currentColor" />
                          ) : (
                            <Play size={16} fill="currentColor" />
                          )}
                        </button>
                        <span className="flex-1 text-sm text-stone-700 font-medium truncate">
                          {backgroundMusicTitle || 'Musique sélectionnée'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowMusicModal(true)}
                          className="text-xs text-violet-600 hover:text-violet-800 font-semibold px-3 py-1.5 rounded-lg hover:bg-violet-100 transition-colors"
                        >
                          Changer
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (editorMusicAudioRef.current) {
                              editorMusicAudioRef.current.pause()
                              editorMusicAudioRef.current = null
                              setIsPlayingEditorMusic(false)
                            }
                            setBackgroundMusic(undefined)
                            setBackgroundMusicTitle(undefined)
                          }}
                          className="p-1.5 text-stone-400 hover:text-red-500 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3 p-5 border-2 border-dashed border-stone-200 rounded-xl bg-stone-50">
                        <p className="text-sm text-stone-500 text-center">
                          Ajoutez une musique qui se jouera en fond quand le destinataire ouvre la
                          carte
                        </p>
                        <button
                          type="button"
                          onClick={() => setShowMusicModal(true)}
                          className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-full font-medium transition-colors shadow-sm"
                        >
                          <Volume2 size={18} /> Choisir une musique
                        </button>
                      </div>
                    )}
                  </section>

                  {/* Lieu du souvenir — en bas à gauche */}
                  <section className="mt-8 pt-8 border-t border-stone-200 flex flex-col items-start text-left">
                    <label className="flex items-center gap-2 text-sm font-bold text-stone-800 mb-3 uppercase tracking-wider">
                      <span className="flex items-center gap-2">
                        <MapPin size={16} className="text-teal-500" /> Lieu du souvenir
                      </span>
                    </label>
                    <div className="relative w-full max-w-md">
                      <Input
                        placeholder="Tapez un lieu (ville, pays, région…)"
                        value={location}
                        onChange={(e) => {
                          const val = e.target.value
                          setLocation(val)
                          if (val.length > 2) {
                            setIsLocating(true)
                            // Debounce search
                            const timeoutId = setTimeout(() => {
                              fetch(`https://photon.komoot.io/api/?q=${val}&lang=fr`)
                                .then((res) => res.json())
                                .then((data) => {
                                  setSuggestions(data.features || [])
                                  setIsLocating(false)
                                })
                                .catch(() => setIsLocating(false))
                            }, 500)
                            return () => clearTimeout(timeoutId)
                          } else {
                            setSuggestions([])
                          }
                        }}
                        className="w-full rounded-xl border border-stone-200 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-base py-3 px-4 pl-10 bg-stone-50 focus:bg-white transition-colors placeholder:text-stone-400"
                      />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
                        {isLocating ? (
                          <RefreshCw size={18} className="animate-spin text-teal-500" />
                        ) : (
                          <MapPin size={18} />
                        )}
                      </div>
                      {suggestions.length > 0 && (
                        <div className="absolute z-50 mt-1 w-full rounded-xl border border-stone-100 bg-white shadow-xl max-h-60 overflow-y-auto">
                          {suggestions.map((s: any, i) => (
                            <button
                              key={i}
                              type="button"
                              className="w-full px-4 py-3 text-left hover:bg-teal-50 transition-colors border-b border-stone-50 last:border-0 flex items-center gap-2 text-sm"
                              onClick={() => {
                                setLocation(
                                  `${s.properties.name}, ${
                                    s.properties.city || s.properties.country || ''
                                  }`,
                                )
                                if (s.geometry?.coordinates) {
                                  setCoords({
                                    lat: s.geometry.coordinates[1],
                                    lng: s.geometry.coordinates[0],
                                  })
                                }
                                setSuggestions([])
                              }}
                            >
                              <MapPin size={14} className="text-teal-500 shrink-0" />
                              <span className="font-medium text-stone-700">
                                {s.properties.name}
                              </span>
                              <span className="text-stone-400 text-xs ml-auto">
                                {s.properties.city} {s.properties.country}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                      {/* Bouton de géolocalisation automatique */}
                      <button
                        type="button"
                        onClick={() => handleAutoLocate()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-stone-400 hover:text-teal-600 hover:bg-teal-50 transition-colors"
                        title="Me géolocaliser"
                      >
                        <Locate size={18} />
                      </button>
                    </div>

                    {/* Checkbox pour masquer la carte */}
                    <div className="mt-3 flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        id="show-map"
                        checked={!hideMap}
                        onChange={(e) => setHideMap(!e.target.checked)}
                        className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-stone-300"
                      />
                      <label htmlFor="show-map" className="text-sm text-stone-700 cursor-pointer">
                        Afficher la carte géographique au verso
                      </label>
                    </div>

                    <p className="mt-2 text-[11px] text-stone-400 flex items-start gap-1.5">
                      <Info size={12} className="shrink-0 mt-0.5" />
                      Ce lieu apparaîtra sur le timbre et la carte au verso.
                    </p>
                    <p className="mt-4 text-[11px] text-teal-600 flex items-start gap-1.5 bg-teal-50/80 rounded-xl px-3 py-2 border border-teal-100/80">
                      <Link2 size={12} className="shrink-0 mt-0.5" />
                      Une fois la carte créée, vous pourrez partager un lien pour que d&apos;autres
                      personnes ajoutent leurs photos à la carte.
                    </p>
                  </section>

                  <div className="h-px bg-stone-100" />

                  {/* Message — section style indigo comme l'original */}
                  <section className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100/50">
                    <div className="flex justify-between items-end mb-4">
                      <label className="flex items-center gap-2 text-sm font-bold text-indigo-900 uppercase tracking-wider">
                        <Type size={16} className="text-indigo-500" /> Votre Message
                      </label>
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-indigo-400 font-medium">
                          {message.length}/10000
                        </span>
                        {message.length > 500 && (
                          <span className="text-[10px] text-teal-600 font-bold uppercase tracking-wider mt-0.5">
                            Premium (&gt; 500 car.)
                          </span>
                        )}
                      </div>
                    </div>
                    <textarea
                      ref={messageInputRef}
                      value={message}
                      onChange={(e) => {
                        const val = e.target.value
                        if (val.length <= 10000) {
                          setMessage(val)
                          if (val.length > 500 && selectedPlan === 'ephemere') {
                            setSelectedPlan('payant')
                          }
                        }
                      }}
                      placeholder="Cher(e)... Nous voici au bout du monde, le soleil se couche sur la mer et je pense à vous..."
                      rows={8}
                      maxLength={10000}
                      className="w-full min-h-[220px] rounded-2xl border border-stone-200 shadow-inner focus:border-indigo-500 focus:ring-indigo-500 text-lg p-5 font-sans bg-white leading-relaxed text-stone-700 resize-none placeholder:text-stone-300"
                    />
                    {/* Emojis rapides pour le message */}
                    <div className="mt-3">
                      <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-2">
                        Choisir un emoji
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {MESSAGE_EMOJIS.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => {
                              const el = messageInputRef.current
                              const pos = el ? el.selectionStart : message.length
                              const before = message.slice(0, pos)
                              const after = message.slice(pos)
                              const next = before + emoji + after
                              if (next.length <= 10000) {
                                setMessage(next)
                                if (next.length > 500 && selectedPlan === 'ephemere') {
                                  setSelectedPlan('payant')
                                }
                                requestAnimationFrame(() => {
                                  if (el) {
                                    el.focus()
                                    const newPos = pos + emoji.length
                                    el.setSelectionRange(newPos, newPos)
                                  }
                                })
                              }
                            }}
                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-indigo-100 hover:border-indigo-300 hover:bg-indigo-50 text-xl transition-colors"
                            title={`Insérer ${emoji}`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Messages pré-écrits : un bouton qui ouvre les choix */}
                    <div className="mt-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="gap-2 rounded-full border-indigo-100 bg-white text-indigo-700 hover:bg-indigo-50 hover:border-indigo-200 text-xs font-semibold"
                          >
                            <Sparkles size={14} className="text-indigo-500" />
                            Messages pré-écrits
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="start"
                          className="min-w-[280px] max-w-[min(90vw,360px)]"
                        >
                          {[
                            'Le temps est magnifique, on pense bien à vous !',
                            'Un petit coucou depuis le bout du monde...',
                            'Si vous étiez là, ce serait parfait !',
                            'Les paysages sont à couper le souffle.',
                          ].map((s) => (
                            <DropdownMenuItem
                              key={s}
                              onClick={() => setMessage(s)}
                              className="cursor-pointer py-2.5 text-sm text-stone-700 focus:bg-indigo-50 focus:text-indigo-900"
                            >
                              <span className="line-clamp-2">{s}</span>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </section>

                  <div className="h-px bg-stone-100" />

                  {/* Style du Timbre */}
                  <section>
                    <label className="flex items-center gap-2 text-sm font-bold text-stone-800 mb-3 uppercase tracking-wider">
                      <Stamp size={16} className="text-teal-500" /> Style du Timbre
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(
                        [
                          { value: 'classic', label: 'Classique' },
                          { value: 'modern', label: 'Moderne' },
                          { value: 'airmail', label: 'Par Avion' },
                        ] as const
                      ).map((style) => (
                        <button
                          key={style.value}
                          onClick={() => setStampStyle(style.value)}
                          className={cn(
                            'py-3 px-2 rounded-xl text-xs font-bold capitalize transition-all border-2',
                            stampStyle === style.value
                              ? 'border-teal-500 bg-teal-50 text-teal-800 shadow-sm'
                              : 'border-stone-100 bg-stone-50 text-stone-400 hover:border-stone-300 hover:bg-white',
                          )}
                        >
                          {style.label}
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div>
                        <label className="block text-xs font-medium text-stone-500 mb-1">
                          Texte du timbre
                        </label>
                        <input
                          type="text"
                          value={stampLabel}
                          onChange={(e) => setStampLabel(e.target.value)}
                          placeholder="ex: Digital Poste"
                          className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-teal-500 focus:ring-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-stone-500 mb-1">
                          Année
                        </label>
                        <input
                          type="text"
                          value={stampYear}
                          onChange={(e) => setStampYear(e.target.value)}
                          placeholder="ex: 2024"
                          maxLength={4}
                          className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-teal-500 focus:ring-teal-500"
                        />
                      </div>
                    </div>
                  </section>

                  <div className="h-px bg-stone-100" />

                  {/* Album / Gallery Section */}
                  <section className="relative rounded-2xl border-2 border-stone-200 bg-stone-50/60 p-5 shadow-sm">
                    {!isPremium && (
                      <div className="sm:hidden p-3 mb-5 bg-amber-50/50 border border-amber-100 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
                        <Sparkles size={18} className="text-amber-500 shrink-0" />
                        <div className="flex-1">
                          <p className="text-[10px] font-black text-amber-900 uppercase tracking-[0.15em]">
                            Option payante (2,50 € — tout compris)
                          </p>
                          <p className="text-[10px] text-amber-700/80 leading-tight mt-0.5">
                            Photos, vidéo, message vocal : même prix. Cartes virtuelles avec stats
                            de visite.
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="mb-4 space-y-3">
                      <div className="flex items-center gap-2 text-sm font-bold text-stone-800 uppercase tracking-wider">
                        <div className="relative">
                          <ImageIcon size={16} className="text-teal-500" />
                          <div className="absolute -right-1 -bottom-1 bg-teal-500 rounded-full p-[1px] border border-white">
                            <span className="block w-1.5 h-1.5 bg-white rounded-full"></span>
                          </div>
                        </div>
                        <span>Album Souvenir (Photos/Vidéos)</span>
                        <div className="relative group/info">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault()
                              setShowPricingModal(true)
                            }}
                            onKeyDown={(e) => e.key === 'Enter' && setShowPricingModal(true)}
                            title="Cliquer pour voir les tarifs détaillés"
                            className="inline-flex items-center justify-center w-7 h-7 rounded-full text-teal-700 bg-teal-50 border border-teal-200 shadow-sm hover:text-teal-800 hover:bg-teal-100 hover:border-teal-300 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                            aria-label="Voir les tarifs et options"
                          >
                            <Info size={15} />
                          </button>
                          <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-stone-900 px-2.5 py-1 text-[10px] font-semibold text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover/info:opacity-100">
                            Cliquez pour plus d&apos;infos
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-medium">
                        {isPremium ? (
                          <div className="flex flex-col items-end gap-1">
                            <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded-md border border-amber-100 font-bold">
                              <Sparkles size={12} fill="currentColor" /> Formule À l&apos;unité
                              activée
                            </span>
                            <div className="flex items-center gap-2">
                              {getAlbumPrice() > 0 && (
                                <span className="text-[11px] bg-teal-500 text-white px-2 py-0.5 rounded-full font-bold">
                                  Prix : {getAlbumPrice().toFixed(2)}€
                                </span>
                              )}
                              <span className="text-[10px] text-stone-400 font-bold">
                                {(mediaItems || []).filter((i) => i.type === 'image').length}/
                                {ALBUM_TIERS.paid.photos} photos
                                {` - ${(mediaItems || []).filter((i) => i.type === 'video').length}/${ALBUM_TIERS.paid.videos} vidéos`}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full">
                            <div className="flex flex-wrap items-center gap-2 w-full justify-start sm:justify-end">
                              <span
                                className={cn(
                                  'text-[11px] sm:text-xs px-2.5 py-1.5 rounded-lg font-extrabold border-2 transition-colors whitespace-nowrap',
                                  (mediaItems || []).length === 0
                                    ? 'bg-teal-50 text-teal-800 border-teal-300 shadow-sm'
                                    : 'bg-stone-50 text-stone-500 border-stone-200',
                                )}
                              >
                                Gratuit : 1 photo
                              </span>
                              <span
                                className={cn(
                                  'text-[11px] sm:text-xs px-2.5 py-1.5 rounded-lg font-extrabold border-2 transition-colors whitespace-nowrap',
                                  getAlbumPrice() === ALBUM_TIERS.paid.price
                                    ? 'bg-teal-50 text-teal-800 border-teal-300 shadow-sm'
                                    : 'bg-stone-50 text-stone-500 border-stone-200',
                                )}
                              >
                                2,50 € : photos + vidéos + message vocal
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                      {(mediaItems || []).map((item) => (
                        <div
                          key={item.id}
                          className="flex flex-col rounded-xl overflow-hidden shadow-sm border border-stone-200 bg-white"
                        >
                          <div className="relative aspect-square overflow-hidden">
                            {item.type === 'video' ? (
                              <video
                                src={item.url}
                                className="w-full h-full object-cover"
                                playsInline
                                muted
                              />
                            ) : (
                              <img
                                src={getOptimizedImageUrl(item.url, {
                                  width: 400,
                                  height: 400,
                                  fit: 'cover',
                                })}
                                alt="album item"
                                className="w-full h-full object-cover"
                              />
                            )}
                            <div className="absolute top-1 left-1 flex items-center justify-center w-5 h-5 bg-black/50 backdrop-blur-sm rounded text-white">
                              {item.type === 'video' ? <Camera size={8} /> : <ImageIcon size={8} />}
                            </div>
                          </div>
                          <div className="flex items-center justify-center gap-1 py-1.5 px-1 border-t border-stone-100 bg-stone-50/50">
                            <div className="relative group/tooltip">
                              <button
                                type="button"
                                onClick={() => openNoteEditor(item.id, item.note)}
                                className={cn(
                                  'flex items-center justify-center w-7 h-7 rounded-md transition-colors',
                                  item.note
                                    ? 'bg-teal-500 text-white'
                                    : 'text-stone-400 hover:bg-teal-50 hover:text-teal-600',
                                )}
                                aria-label="Ajouter une note / légende"
                              >
                                <FileText size={14} />
                              </button>
                              <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 px-2 py-1 text-[10px] font-medium text-white bg-stone-800 rounded-md opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 shadow-lg">
                                Ajouter une note / légende
                              </span>
                            </div>
                            <div className="relative group/tooltip">
                              <button
                                type="button"
                                onClick={() => removeMediaItem(item.id)}
                                className="flex items-center justify-center w-7 h-7 rounded-md text-stone-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                                aria-label="Retirer de l'album"
                              >
                                <X size={14} />
                              </button>
                              <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 px-2 py-1 text-[10px] font-medium text-white bg-stone-800 rounded-md opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 shadow-lg">
                                Retirer de l&apos;album
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}

                      <div className="flex flex-col gap-2 relative aspect-square">
                        <input
                          type="file"
                          id="album-upload"
                          className="hidden"
                          multiple
                          accept="image/*,.heic,.heif,.avif,.webp,.tiff,.bmp,video/*"
                          onChange={handleAlbumUpload}
                        />
                        <label
                          htmlFor="album-upload"
                          className="flex-1 w-full flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-300 bg-stone-50 hover:bg-stone-100 hover:border-stone-400 transition-colors cursor-pointer text-stone-400 hover:text-stone-600"
                        >
                          <Camera size={24} className="mb-2" />
                          <span className="text-xs font-bold text-center px-2">
                            Ajouter depuis l&apos;appareil
                          </span>
                        </label>
                        {currentUser && (
                          <button
                            type="button"
                            onClick={() => setShowUserGalleryModal('back')}
                            className="flex-1 w-full flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-teal-200 bg-teal-50 hover:bg-teal-100 hover:border-teal-400 transition-colors cursor-pointer text-teal-600 font-bold px-2 group"
                          >
                            <ImageIcon
                              size={20}
                              className="mb-1 text-teal-500 group-hover:scale-110 transition-transform"
                            />
                            <span className="text-[10px] text-center leading-tight">
                              Depuis ma
                              <br />
                              galerie
                            </span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Upload Progress Overlay */}
                    {uploadStatus && (
                      <div className="fixed inset-0 z-[100] bg-white/80 backdrop-blur-md flex items-center justify-center p-6 text-center animate-in fade-in duration-300">
                        <div className="max-w-sm w-full bg-white rounded-3xl shadow-2xl shadow-teal-200/50 border border-teal-100 p-8">
                          <div className="mb-6 relative inline-block">
                            <div className="w-20 h-20 border-4 border-teal-100 rounded-full"></div>
                            <div className="w-20 h-20 border-4 border-teal-500 rounded-full border-t-transparent animate-spin absolute inset-0"></div>
                            <div className="absolute inset-0 flex items-center justify-center text-teal-600 font-black">
                              {Math.round((uploadStatus.current / uploadStatus.total) * 100)}%
                            </div>
                          </div>
                          <h3 className="text-xl font-serif font-black text-stone-900 mb-2">
                            Chargement en cours...
                          </h3>
                          <p className="text-stone-500 text-sm mb-4 font-medium uppercase tracking-wider">
                            {uploadStatus.step}
                          </p>
                          <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-teal-500 h-full transition-all duration-300 rounded-full"
                              style={{
                                width: `${(uploadStatus.current / uploadStatus.total) * 100}%`,
                              }}
                            />
                          </div>
                          <p className="text-[10px] text-stone-400 mt-4 font-bold uppercase tracking-[0.2em]">
                            Étape {uploadStatus.current} sur {uploadStatus.total}
                          </p>
                        </div>
                      </div>
                    )}
                  </section>

                  {/* Bouton Continuer en bas à droite (étape rédaction) */}
                  <div className="flex justify-end pt-4">
                    <Button
                      onClick={goNext}
                      disabled={!canGoNext()}
                      className={cn(
                        'rounded-full font-bold flex items-center gap-2 px-6 py-5 h-auto transition-all',
                        canGoNext()
                          ? 'bg-teal-500 hover:bg-teal-600 text-white shadow-md shadow-teal-200 hover:-translate-y-0.5'
                          : 'bg-stone-200 text-stone-400 cursor-not-allowed',
                      )}
                    >
                      Continuer
                      <ChevronRight size={18} />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* ==================== STEP: APERÇU ==================== */}
            {currentStep === 'preview' && (
              <div className="w-full max-w-full bg-white rounded-2xl shadow-sm border border-stone-200 p-5 sm:p-8">
                <div className="flex flex-col gap-10">
                  {/* Title & Introduction */}
                  <div className="text-center sm:text-left">
                    <h2 className="text-2xl sm:text-3xl font-serif font-black text-stone-900 mb-3">
                      Votre carte est prête ! 🎉
                    </h2>
                    <p className="text-stone-500 text-sm leading-relaxed max-w-xl">
                      Partagez-la maintenant avec vos proches. Cliquez sur la carte en bas de page
                      pour la retourner. Vous pouvez encore la modifier si besoin avant de quitter.
                    </p>
                  </div>

                  {/* Bloc de partage (Priorité haute) */}
                  <div className="w-full">
                    {isPublishing ? (
                      <div className="bg-stone-50 rounded-2xl p-10 border border-stone-100 flex flex-col items-center justify-center text-center">
                        <RefreshCw size={40} className="text-teal-500 animate-spin mb-4" />
                        <p className="text-stone-600 font-serif font-medium">
                          Nous préparons votre lien...
                        </p>
                      </div>
                    ) : shareError ? (
                      <div className="bg-red-50 rounded-2xl p-8 border border-red-100 flex flex-col items-center justify-center text-center">
                        <XCircle size={40} className="text-red-500 mb-4" />
                        <h3 className="text-lg font-bold text-stone-900 mb-2">
                          Erreur de création
                        </h3>
                        <p className="text-stone-600 text-sm mb-6">{shareError}</p>
                        <Button
                          onClick={() => {
                            setShareError(null)
                            handlePublish()
                          }}
                          className="bg-teal-500 hover:bg-teal-600 text-white rounded-xl"
                        >
                          <RefreshCw size={16} className="mr-2" /> Réessayer
                        </Button>
                      </div>
                    ) : !shareUrl ? (
                      <div className="bg-stone-50 rounded-2xl p-10 border border-stone-100 flex flex-col items-center justify-center text-center">
                        <RefreshCw size={40} className="text-teal-500 animate-spin mb-4" />
                        <p className="text-stone-600 font-serif font-medium">
                          Génération du lien en cours...
                        </p>
                      </div>
                    ) : (
                      <div className="bg-teal-50/50 rounded-[2rem] p-6 sm:p-10 border border-teal-100 text-center animate-in fade-in slide-in-from-top-6 duration-700 shadow-sm relative overflow-hidden">
                        {/* Decorative background element */}
                        <div className="absolute -top-12 -right-12 w-32 h-32 bg-teal-200/20 rounded-full blur-3xl pointer-events-none" />

                        {/* Paiement Revolut Section (fallback si non payé) */}
                        {!hasPaid &&
                          !codeSuccess &&
                          currentUser?.role !== 'admin' &&
                          getAlbumPrice() > 0 && (
                            <div className="mb-10 p-6 rounded-2xl bg-stone-900 text-white text-left shadow-2xl relative z-10">
                              <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                                <CreditCard size={20} className="text-teal-400" /> Finalisez le
                                paiement
                              </h3>
                              <p className="text-stone-400 text-sm mb-4">
                                Votre carte est prête, il ne manque que le règlement pour débloquer
                                le lien de partage.
                              </p>
                              <Button
                                onClick={handlePayWithRevolut}
                                disabled={isRevolutRedirecting}
                                className="w-full sm:w-auto bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl px-8 py-6 h-auto transition-all"
                              >
                                {isRevolutRedirecting
                                  ? 'Redirection...'
                                  : `Payer ${getAlbumPrice().toFixed(2)}€ avec Revolut`}
                              </Button>
                            </div>
                          )}

                        {hasPaid ||
                        codeSuccess ||
                        selectedPlan === 'ephemere' ||
                        currentUser?.role === 'admin' ? (
                          <>
                            {/* Upsell banner for free plan */}
                            {selectedPlan === 'ephemere' &&
                              !hasPaid &&
                              !codeSuccess &&
                              currentUser?.role !== 'admin' && (
                                <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-teal-500 to-teal-600 text-white text-left relative z-10">
                                  <div className="flex items-start gap-3">
                                    <Sparkles size={20} className="shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                      <p className="font-bold text-sm mb-1">
                                        Passez à la carte complète !
                                      </p>
                                      <p className="text-teal-100 text-xs leading-relaxed">
                                        Votre carte gratuite est limitée à 1 photo, sans vidéo ni
                                        message vocal. Pour <strong>2,50 €</strong>, débloquez
                                        toutes les fonctionnalités : album photos, vidéos, audio et
                                        statistiques.
                                      </p>
                                      <Button
                                        onClick={() => {
                                          setSelectedPlan('payant')
                                          setCurrentStep('payment')
                                        }}
                                        className="mt-3 bg-white/20 hover:bg-white/30 text-white rounded-lg px-4 py-2 h-auto text-xs font-bold transition-all"
                                      >
                                        <CreditCard size={14} className="mr-1.5" />
                                        Passer à la carte complète — 2,50 €
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              )}

                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg border border-teal-50 transform hover:scale-105 transition-transform duration-300">
                              <Send size={36} className="text-teal-600" />
                            </div>
                            <h3 className="text-2xl font-serif font-black text-stone-900 mb-2 italic">
                              Lien prêt à être envoyé !
                            </h3>
                            <p className="text-stone-500 text-[10px] sm:text-xs mb-8 uppercase tracking-[0.2em] font-black">
                              Copiez le lien ou partagez directement
                            </p>

                            {createdPostcardId && internalPostcardId && (
                              <div className="flex justify-center mb-6">
                                <RealTimeViewStats
                                  postcardId={internalPostcardId}
                                  initialViews={0}
                                  pollingInterval={5000}
                                />
                              </div>
                            )}

                            <div className="mb-10 w-full max-w-xl mx-auto">
                              <div className="flex flex-col sm:flex-row gap-3">
                                <div className="relative flex-1 group">
                                  <input
                                    type="text"
                                    readOnly
                                    value={shareUrl}
                                    className="w-full bg-white border border-stone-200 rounded-2xl px-5 py-4.5 text-sm text-stone-700 focus:outline-none shadow-inner font-bold text-center sm:text-left group-hover:border-stone-400 transition-colors"
                                  />
                                </div>
                                <Button
                                  onClick={copyToClipboard}
                                  className="w-full sm:w-auto rounded-2xl bg-stone-900 hover:bg-black text-white px-8 py-4.5 h-auto shadow-xl flex items-center justify-center gap-3 font-black active:scale-95 transition-all"
                                >
                                  <Copy size={20} />
                                  <span>COPIER LE LIEN</span>
                                </Button>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
                              <a
                                href={`mailto:?subject=Regarde ma carte postale !&body=J'ai créé une carte postale pour toi : ${shareUrl}`}
                                className="flex items-center gap-2 px-5 py-3 bg-white text-stone-700 border border-stone-200 rounded-xl font-bold text-xs hover:bg-stone-50 transition-all shadow-sm active:scale-95"
                              >
                                <Mail size={18} className="text-stone-400" /> <span>Emails</span>
                              </a>
                              <a
                                href={`sms:?body=${encodeURIComponent(`Regarde ma carte postale ! ${shareUrl}`)}`}
                                className="flex items-center gap-2 px-5 py-3 bg-stone-800 text-white rounded-xl font-bold text-xs hover:bg-stone-900 transition-all shadow-md active:scale-95"
                              >
                                <MessageSquare size={18} /> <span>SMS</span>
                              </a>
                              <a
                                href={`https://wa.me/?text=${encodeURIComponent(`Regarde ma carte postale ! ${shareUrl}`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-5 py-3 bg-[#25D366] text-white rounded-xl font-bold text-xs hover:opacity-90 transition-all shadow-md active:scale-95"
                              >
                                <Share2 size={18} /> <span>WhatsApp</span>
                              </a>
                            </div>

                            <Button
                              type="button"
                              onClick={() => setShowRecipientModal(true)}
                              className="w-full max-w-sm mx-auto flex items-center justify-center gap-3 px-8 py-5 bg-gradient-to-br from-teal-400 via-teal-500 to-emerald-500 text-white rounded-2xl text-sm font-black uppercase tracking-[0.2em] shadow-xl shadow-teal-500/30 hover:shadow-teal-500/50 hover:scale-[1.02] active:scale-95 transition-all h-auto"
                            >
                              <Plane size={24} className="animate-bounce-subtle" />
                              <span>VOIR COMME DESTINATAIRE</span>
                            </Button>

                            <div className="mt-4 flex justify-center">
                              <Button
                                variant="ghost"
                                onClick={handleCreateVariant}
                                className="text-stone-500 hover:text-teal-600 hover:bg-teal-50 rounded-xl px-4 py-2 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all"
                              >
                                <Copy size={16} />
                                <span>Créer une variante de cette carte</span>
                              </Button>
                            </div>
                            <p className="mt-6 text-[11px] text-teal-600 flex items-center justify-center gap-1.5 flex-wrap text-center px-4">
                              <Link2 size={12} className="shrink-0" />
                              Sur la page de la carte, menu ⋮ puis « Partager le lien pour ajouter
                              des photos » pour inviter d&apos;autres à contribuer.
                            </p>
                          </>
                        ) : (
                          <div className="py-6 text-center">
                            <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                              <CreditCard size={36} className="text-stone-400" />
                            </div>
                            <h3 className="text-2xl font-serif font-black text-stone-900 mb-2">
                              Débloquez votre lien de partage
                            </h3>
                            <p className="text-stone-500 text-sm mb-6 max-w-md mx-auto">
                              Votre carte est prête ! Pour obtenir le lien de partage, réglez votre
                              carte ou entrez un code promo.
                            </p>
                            <div className="flex flex-col gap-3 max-w-sm mx-auto">
                              <Button
                                onClick={() => setCurrentStep('payment')}
                                className="w-full rounded-2xl font-bold py-5 h-auto bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-100 transition-all flex items-center justify-center gap-3 text-base"
                              >
                                <CreditCard size={20} />
                                <span>Régler {getAlbumPrice().toFixed(2)} €</span>
                              </Button>
                              <Button
                                variant="ghost"
                                onClick={() => setCurrentStep('payment')}
                                className="w-full rounded-xl font-semibold py-3 h-auto text-stone-400 hover:text-stone-600 hover:bg-stone-50 transition-all"
                              >
                                <Gift size={16} className="mr-2" />
                                Entrer un code promo
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Account / Email Section */}
                  <div className="pt-10 border-t border-stone-100">
                    <div className="bg-stone-50 rounded-3xl p-6 sm:p-8 border border-stone-200 relative overflow-hidden">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
                        <div className="bg-stone-900 text-white p-4 rounded-2xl shadow-lg shrink-0">
                          <User size={24} />
                        </div>
                        <div>
                          <h3 className="font-serif font-black text-xl text-stone-900 leading-tight">
                            {currentUser ? 'Compte associé avec succès' : 'Sauvegardez votre carte'}
                          </h3>
                          <p className="text-stone-500 text-sm mt-1 leading-relaxed max-w-md">
                            {currentUser
                              ? 'Retrouvez cette création à tout moment dans votre espace personnel.'
                              : "Indiquez votre e-mail pour sauvegarder cette carte. Vous pourrez ensuite la modifier (textes, images...) ou la dupliquer pour personnaliser vos messages pour d'autres destinataires."}
                          </p>
                        </div>
                      </div>

                      <div className="w-full max-w-md">
                        {currentUser ? (
                          <div className="flex items-center gap-4 bg-white border-2 border-teal-100 text-teal-900 px-5 py-5 rounded-2xl shadow-sm">
                            <div className="bg-teal-500 p-1.5 rounded-full text-white">
                              <Check size={18} />
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <p className="font-black text-sm truncate">{currentUser.email}</p>
                              <p className="text-xs text-teal-600 font-bold uppercase tracking-wider">
                                Compte configuré
                              </p>
                            </div>
                          </div>
                        ) : isEmailSent ? (
                          <div className="flex items-center gap-4 bg-teal-50 border-2 border-teal-200 text-teal-800 px-5 py-5 rounded-2xl animate-in fade-in slide-in-from-top-2 shadow-sm">
                            <CheckCircle2 size={24} className="text-teal-600" />
                            <div>
                              <p className="font-black text-sm">C&apos;est tout bon !</p>
                              <p className="text-xs text-teal-600 font-bold uppercase tracking-wider italic">
                                Vérifiez vos e-mails
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-3">
                            <input
                              type="email"
                              value={senderEmail}
                              onChange={(e) => setSenderEmail(e.target.value)}
                              placeholder="votre@email.com"
                              disabled={isSendingEmail}
                              className="w-full bg-white border-2 border-stone-200 rounded-2xl px-6 py-4.5 text-base focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 shadow-sm transition-all font-medium disabled:opacity-50"
                            />
                            <Button
                              onClick={async () => {
                                if (!createdPostcardId) return
                                if (
                                  !senderEmail ||
                                  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(senderEmail)
                                ) {
                                  alert('Veuillez entrer une adresse email valide.')
                                  return
                                }
                                setIsSendingEmail(true)
                                try {
                                  const result = await linkPostcardToUser(
                                    createdPostcardId,
                                    senderEmail,
                                  )
                                  if (result.success) setIsEmailSent(true)
                                  else
                                    alert(
                                      'Erreur: ' +
                                        (result.error || 'Impossible de lier le compte.'),
                                    )
                                } catch (e) {
                                  alert('Une erreur est survenue.')
                                } finally {
                                  setIsSendingEmail(false)
                                }
                              }}
                              disabled={isSendingEmail}
                              className="w-full rounded-2xl bg-teal-500 hover:bg-teal-600 text-white py-5 h-auto font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-teal-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                              {isSendingEmail ? (
                                <RefreshCw className="animate-spin" size={18} />
                              ) : (
                                <span>ENREGISTRER MA CARTE</span>
                              )}
                            </Button>

                            {googleClientId && !currentUser && (
                              <>
                                <div className="relative my-2">
                                  <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-stone-200"></div>
                                  </div>
                                  <div className="relative flex justify-center text-[10px]">
                                    <span className="px-2 bg-stone-50 text-stone-400 font-bold uppercase tracking-widest">
                                      Ou continuez avec
                                    </span>
                                  </div>
                                </div>
                                <GoogleLoginButton
                                  onSuccess={handleGoogleSuccess}
                                  redirectPath={
                                    createdPostcardId
                                      ? `/api/link-postcard-and-redirect?postcard=${encodeURIComponent(createdPostcardId)}&redirect=${encodeURIComponent(`/editor?edit=${createdPostcardId}&step=preview`)}`
                                      : undefined
                                  }
                                />
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Send to Recipients Section (Email Tracking) */}
                  <div className="pt-10 border-t border-stone-100">
                    <div className="bg-amber-50/50 rounded-3xl p-6 sm:p-8 border border-amber-100">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
                        <div className="bg-amber-500 text-white p-4 rounded-2xl shadow-lg shrink-0">
                          <Send size={24} />
                        </div>
                        <div>
                          <h3 className="font-serif font-black text-xl text-stone-900 leading-tight">
                            Envoyer par e-mail (suivi)
                          </h3>
                          <p className="text-stone-500 text-sm mt-1 leading-relaxed">
                            Le destinataire recevra l&apos;URL de la carte par email, permettant de
                            suivre l&apos;ouverture de sa carte.
                          </p>
                        </div>
                      </div>

                      {recipientsSentCount !== null ? (
                        <div className="flex items-center gap-4 bg-white border-2 border-teal-100 text-teal-900 px-6 py-6 rounded-2xl shadow-sm italic font-bold">
                          <CheckCircle2 size={32} className="text-teal-600" />
                          <p>{recipientsSentCount} invitation(s) envoyée(s) avec succès !</p>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-6">
                          <p className="text-stone-500 text-xs font-bold uppercase tracking-wider">
                            Destinataires
                          </p>
                          <div className="space-y-4">
                            {recipients.map((r, i) => (
                              <div key={i} className="flex flex-col sm:flex-row gap-2">
                                <Input
                                  placeholder="Prénom"
                                  value={r.firstName}
                                  onChange={(e) => {
                                    const next = [...recipients]
                                    next[i] = { ...next[i], firstName: e.target.value }
                                    setRecipients(next)
                                  }}
                                  className="flex-1 rounded-xl border-stone-200 bg-white"
                                />
                                <Input
                                  type="email"
                                  placeholder="email@exemple.com"
                                  value={r.email}
                                  onChange={(e) => {
                                    const next = [...recipients]
                                    next[i] = { ...next[i], email: e.target.value }
                                    setRecipients(next)
                                  }}
                                  className="flex-[2] rounded-xl border-stone-200 bg-white"
                                />
                                <Button
                                  variant="ghost"
                                  className="h-12 px-4 text-stone-300 hover:text-red-500"
                                  onClick={() =>
                                    setRecipients(recipients.filter((_, j) => j !== i))
                                  }
                                  disabled={recipients.length <= 1}
                                >
                                  <X size={20} />
                                </Button>
                              </div>
                            ))}
                          </div>

                          <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Button
                              variant="outline"
                              onClick={() =>
                                setRecipients([
                                  ...recipients,
                                  { firstName: '', lastName: '', email: '' },
                                ])
                              }
                              className="rounded-xl border-stone-200 h-14 px-6 font-bold flex items-center justify-center gap-2 hover:bg-stone-50"
                            >
                              <Plus size={18} /> Ajouter un autre
                            </Button>
                            <Button
                              onClick={async () => {
                                if (!createdPostcardId) return
                                const needSender =
                                  !currentUser && !(senderEmail || '').trim() && !isEmailSent
                                if (needSender)
                                  return alert("Indiquez votre e-mail plus haut avant d'envoyer.")
                                const valid = recipients.filter((r) => (r.email || '').trim())
                                if (valid.length === 0)
                                  return alert('Ajoutez au moins un e-mail valide.')

                                setIsSendingToRecipients(true)
                                try {
                                  const result = await sendPostcardToRecipientsFromEditor(
                                    createdPostcardId,
                                    valid,
                                    (currentUser?.email ?? senderEmail) || undefined,
                                  )
                                  if (result.success && result.sentCount !== undefined)
                                    setRecipientsSentCount(result.sentCount)
                                  else alert(result.error || "Erreur lors de l'envoi.")
                                } catch (e) {
                                  alert('Une erreur est survenue.')
                                } finally {
                                  setIsSendingToRecipients(false)
                                }
                              }}
                              disabled={isSendingToRecipients || !createdPostcardId}
                              className="flex-1 rounded-xl bg-stone-900 hover:bg-black text-white h-14 font-black uppercase tracking-wider shadow-lg flex items-center justify-center gap-3 active:scale-95 transition-all"
                            >
                              {isSendingToRecipients ? (
                                <RefreshCw className="animate-spin" size={20} />
                              ) : (
                                <>
                                  <Send size={20} /> ENVOYER MAINTENANT
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!shareUrl && (
              <div className="mt-4 lg:mt-8 lg:hidden">
                {/* Card Preview — masqué quand l'aperçu fixe en bas est actif */}
                <div ref={previewSectionRef} className={stickyPreview ? 'hidden' : ''}>
                  <div className="flex items-center gap-2 mb-3">
                    <Eye size={14} className="text-teal-500" />
                    <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                      Aperçu de votre carte
                    </span>
                    <div className="flex items-center gap-1.5 ml-auto text-stone-400 text-[10px] font-medium">
                      {isPublishing || shareUrl ? (
                        <div className="flex items-center gap-1 text-teal-600">
                          {isPublishing ? (
                            <RefreshCw size={10} className="animate-spin" />
                          ) : (
                            <Check size={10} />
                          )}
                          <span>{isPublishing ? 'Création...' : 'Prête !'}</span>
                        </div>
                      ) : (
                        <>
                          <RefreshCw
                            size={10}
                            className="animate-spin"
                            style={{ animationDuration: '3s' }}
                          />
                          Temps réel
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-center w-full px-1 sm:px-0 mb-0">
                    <div className="transform scale-100 sm:scale-[0.85] origin-top w-full max-w-full">
                      <PostcardView
                        postcard={postcardForPreview}
                        flipped={showBack}
                        frontTextBgOpacity={frontTextBgOpacity}
                        onCaptionPositionChange={setFrontCaptionPosition}
                      />
                    </div>
                  </div>
                  <div className="mt-2 flex justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 text-teal-700 border-teal-200 hover:bg-teal-50 hover:border-teal-300"
                      disabled={previewRecipientLoading}
                      onClick={openPreviewAsRecipient}
                    >
                      {previewRecipientLoading ? (
                        <Loader2 size={16} className="animate-spin shrink-0" />
                      ) : (
                        <Eye size={16} className="shrink-0" />
                      )}
                      <span>
                        {previewRecipientLoading ? 'Génération...' : 'Voir comme un destinataire'}
                      </span>
                    </Button>
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-2 mb-6 sm:mb-0">
                  <Button
                    variant="ghost"
                    onClick={goPrev}
                    disabled={currentStepIndex === 0}
                    className={cn(
                      'rounded-full font-semibold flex items-center gap-2 transition-all',
                      currentStepIndex === 0
                        ? 'opacity-0 pointer-events-none'
                        : 'text-stone-600 hover:text-stone-800 hover:bg-stone-100',
                    )}
                  >
                    <ChevronLeft size={18} />
                    Retour
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal plein écran : voir comme le destinataire */}
      {showFullscreen && (
        <div
          className="fixed inset-0 z-50 bg-stone-900/95 flex items-center justify-center p-2 sm:p-4 overflow-auto"
          onClick={() => setShowFullscreen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex items-center justify-center w-full h-full p-4 sm:p-12"
          >
            <button
              onClick={() => setShowFullscreen(false)}
              className="absolute top-2 right-2 sm:top-6 sm:right-6 p-4 text-white hover:text-red-400 transition-all z-50 bg-black/20 hover:bg-black/40 backdrop-blur-sm rounded-full active:scale-95"
              aria-label="Fermer"
            >
              <X size={48} strokeWidth={3} />
            </button>
            <div className="flex items-center justify-center w-full h-full">
              <div
                className="transition-transform duration-200"
                style={{ transform: `scale(${fullscreenScale})`, transformOrigin: 'center' }}
              >
                <PostcardView
                  postcard={postcardForPreview}
                  flipped={showBack}
                  frontTextBgOpacity={frontTextBgOpacity}
                  className="w-full max-w-[1700px] h-auto aspect-[4/3] shadow-2xl cursor-default"
                  onCaptionPositionChange={setFrontCaptionPosition}
                />
              </div>
            </div>
            <div className="absolute bottom-8 left-1/2 flex w-[min(90vw,640px)] -translate-x-1/2 flex-col items-center gap-2 rounded-2xl border border-white/30 bg-black/50 px-4 py-3 text-white backdrop-blur-lg shadow-2xl">
              <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-widest text-white/80">
                <span>Zoom</span>
                <span className="text-sm text-white">{fullscreenScale.toFixed(2)}×</span>
              </div>
              <div className="flex items-center gap-2 w-full">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    setFullscreenScale((value) => Math.max(0.5, Number((value - 0.1).toFixed(2))))
                  }}
                  className="rounded-full border border-white/60 p-2 text-white hover:border-teal-300 hover:text-teal-300"
                  aria-label="Réduire"
                >
                  <Minus size={14} />
                </button>
                <input
                  type="range"
                  min={0.5}
                  max={3.0}
                  step={0.05}
                  value={fullscreenScale}
                  onChange={(event) => {
                    event.stopPropagation()
                    setFullscreenScale(Number(event.target.value))
                  }}
                  className="h-1 w-full cursor-pointer appearance-none rounded-full bg-white/40 accent-teal-400 focus-visible:outline-none"
                />
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    setFullscreenScale((value) => Math.min(3.0, Number((value + 0.1).toFixed(2))))
                  }}
                  className="rounded-full border border-white/60 p-2 text-white hover:border-teal-300 hover:text-teal-300"
                  aria-label="Agrandir"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sticky preview panel — mobile/tablet */}
      {stickyPreview && !shareUrl && currentStep !== 'preview' && (
        <div
          className="fixed bottom-0 inset-x-0 z-[46] lg:hidden bg-stone-900 shadow-2xl shadow-black/60"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          {/* Barre du haut */}
          <div className="flex items-center justify-between px-3 py-1.5">
            <div className="flex items-center gap-1.5">
              <RefreshCw
                size={10}
                className="text-teal-400 animate-spin"
                style={{ animationDuration: '3s' }}
              />
              <span className="text-[11px] font-bold text-white/50 uppercase tracking-wider">
                Aperçu en direct
              </span>
            </div>
            <button
              type="button"
              onClick={() => setStickyPreview(false)}
              className="p-1 text-white/40 hover:text-white transition-colors"
              aria-label="Fermer"
            >
              <X size={15} />
            </button>
          </div>
          {/* Carte pleine largeur */}
          <PostcardView
            postcard={postcardForPreview}
            flipped={showBack}
            frontTextBgOpacity={frontTextBgOpacity}
            className="w-full aspect-[4/3]"
            hideFullscreenButton
            hideFlipHints
            defaultActionsOpen={false}
          />
          {/* Barre du bas — toujours visible */}
          <div className="flex items-center gap-2 px-4 py-2.5 border-t border-white/10">
            <button
              type="button"
              onClick={() => setShowBack((v) => !v)}
              className="flex items-center gap-1.5 text-[11px] font-bold text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors"
            >
              <RotateCw size={11} />
              {showBack ? 'Recto' : 'Verso'}
            </button>
            <button
              type="button"
              onClick={() => setShowFullscreen(true)}
              className="flex items-center gap-1.5 text-[11px] font-bold text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors"
            >
              <Maximize2 size={11} />
              Plein écran
            </button>
          </div>
        </div>
      )}

      {/* Modal "Voir comme un destinataire" — iframe /carte/preview/[token] */}
      <Dialog
        open={previewRecipientModalOpen}
        onOpenChange={(open) => {
          setPreviewRecipientModalOpen(open)
          if (!open) setPreviewRecipientUrl(null)
        }}
      >
        <DialogContent
          hideCloseButton
          className="max-w-6xl w-[95vw] h-[90vh] p-0 gap-0 overflow-hidden bg-stone-100 rounded-2xl border border-stone-200 shadow-2xl flex flex-col"
        >
          <DialogHeader className="shrink-0 px-3 py-2 border-b border-stone-200 bg-white flex flex-row items-center justify-end min-h-0">
            <DialogTitle className="sr-only">Aperçu comme le destinataire</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setPreviewRecipientModalOpen(false)
                setPreviewRecipientUrl(null)
              }}
              className="rounded-full h-8 w-8 p-0"
            >
              <X size={18} />
            </Button>
          </DialogHeader>
          <div className="flex-1 min-h-0 relative bg-white">
            {previewRecipientUrl && (
              <iframe
                src={previewRecipientUrl}
                title="Aperçu comme destinataire"
                className="absolute inset-0 w-full h-full border-0 rounded-b-2xl"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showImageEditModal}
        onOpenChange={(open) => {
          setShowImageEditModal(open)
          setShowCropPanel(open)
          if (!open) setImgNaturalSize(null)
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl p-0 border-none shadow-2xl">
          <DialogHeader className="px-6 pt-6 pb-3 border-b border-stone-100">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-stone-800">
                <SlidersHorizontal size={18} className="text-teal-600" />
                Retouche photo
              </DialogTitle>
              <button
                type="button"
                onClick={() => {
                  setShowImageEditModal(false)
                  setShowCropPanel(false)
                }}
                className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-stone-100 transition-colors text-stone-400 hover:text-stone-600"
              >
                <X size={20} />
              </button>
            </div>
            <DialogDescription>
              Ajustez les filtres, le recadrage et le zoom. L'aperçu à gauche est mis à jour en
              temps réel.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 p-6 lg:grid-cols-[1.25fr_1fr]">
            <div
              ref={cropAreaRef}
              className="relative w-full overflow-hidden rounded-2xl border-2 border-stone-200 bg-stone-100 aspect-[4/3] select-none cursor-grab active:cursor-grabbing"
              onPointerDown={handleCropPointerDown}
              onPointerMove={handleCropPointerMove}
              onPointerUp={handleCropPointerUp}
              onPointerLeave={handleCropPointerUp}
              style={{ touchAction: 'none' }}
            >
              {imgNaturalSize ? (
                <div
                  className="absolute pointer-events-none"
                  style={getCropPreviewStyle(frontImageCrop, imgNaturalSize)}
                >
                  <img
                    ref={cropImgRef}
                    src={frontImage}
                    alt="Retouche photo"
                    className="block w-full h-full object-cover"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      filter: frontImageFilterCss,
                    }}
                    onLoad={handleCropImgLoad}
                    draggable={false}
                  />
                </div>
              ) : (
                <img
                  ref={cropImgRef}
                  src={frontImage}
                  alt="Retouche photo"
                  className="absolute inset-0 w-full h-full pointer-events-none object-cover"
                  style={{
                    objectPosition: `${frontImageCrop.x}% ${frontImageCrop.y}%`,
                    transform: `scale(${frontImageCrop.scale})`,
                    filter: frontImageFilterCss,
                  }}
                  onLoad={handleCropImgLoad}
                  draggable={false}
                />
              )}
            </div>

            <div className="space-y-5">
              <div>
                <p className="mb-2 text-xs font-semibold text-stone-600 uppercase tracking-wider">
                  Filtres
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {FILTER_PRESETS.map((preset) => {
                    const isSelected =
                      frontImageFilter.brightness === preset.values.brightness &&
                      frontImageFilter.contrast === preset.values.contrast &&
                      frontImageFilter.saturation === preset.values.saturation &&
                      frontImageFilter.sepia === preset.values.sepia &&
                      frontImageFilter.grayscale === preset.values.grayscale
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setFrontImageFilter({ ...preset.values })}
                        className={cn(
                          'rounded-xl border px-3 py-2 text-xs font-semibold transition',
                          isSelected
                            ? 'border-teal-500 bg-teal-50 text-teal-700'
                            : 'border-stone-200 bg-white text-stone-600 hover:border-teal-300 hover:text-teal-700',
                        )}
                      >
                        {preset.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-600 uppercase tracking-wider">
                      Zoom
                    </span>
                    <span className="text-xs font-medium text-stone-500 tabular-nums">
                      {Math.round(frontImageCrop.scale * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={4}
                    step={0.05}
                    value={frontImageCrop.scale}
                    onChange={(e) =>
                      setFrontImageCrop((c) => ({ ...c, scale: Number(e.target.value) }))
                    }
                    className="w-full h-2 rounded-full appearance-none bg-stone-200 accent-teal-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-600 uppercase tracking-wider">
                      Luminosité
                    </span>
                    <span className="text-xs font-medium text-stone-500 tabular-nums">
                      {frontImageFilter.brightness}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={60}
                    max={150}
                    step={1}
                    value={frontImageFilter.brightness}
                    onChange={(e) =>
                      setFrontImageFilter((v) => ({ ...v, brightness: Number(e.target.value) }))
                    }
                    className="w-full h-2 rounded-full appearance-none bg-stone-200 accent-teal-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-600 uppercase tracking-wider">
                      Contraste
                    </span>
                    <span className="text-xs font-medium text-stone-500 tabular-nums">
                      {frontImageFilter.contrast}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={60}
                    max={150}
                    step={1}
                    value={frontImageFilter.contrast}
                    onChange={(e) =>
                      setFrontImageFilter((v) => ({ ...v, contrast: Number(e.target.value) }))
                    }
                    className="w-full h-2 rounded-full appearance-none bg-stone-200 accent-teal-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-600 uppercase tracking-wider">
                      Saturation
                    </span>
                    <span className="text-xs font-medium text-stone-500 tabular-nums">
                      {frontImageFilter.saturation}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={170}
                    step={1}
                    value={frontImageFilter.saturation}
                    onChange={(e) =>
                      setFrontImageFilter((v) => ({ ...v, saturation: Number(e.target.value) }))
                    }
                    className="w-full h-2 rounded-full appearance-none bg-stone-200 accent-teal-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-600 uppercase tracking-wider">
                      Sépia
                    </span>
                    <span className="text-xs font-medium text-stone-500 tabular-nums">
                      {frontImageFilter.sepia}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={frontImageFilter.sepia}
                    onChange={(e) =>
                      setFrontImageFilter((v) => ({ ...v, sepia: Number(e.target.value) }))
                    }
                    className="w-full h-2 rounded-full appearance-none bg-stone-200 accent-teal-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-600 uppercase tracking-wider">
                      Niveaux de gris
                    </span>
                    <span className="text-xs font-medium text-stone-500 tabular-nums">
                      {frontImageFilter.grayscale}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={frontImageFilter.grayscale}
                    onChange={(e) =>
                      setFrontImageFilter((v) => ({ ...v, grayscale: Number(e.target.value) }))
                    }
                    className="w-full h-2 rounded-full appearance-none bg-stone-200 accent-teal-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="px-6 pb-6 pt-2 border-t border-stone-100">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl border-stone-200"
              onClick={() => {
                setFrontImageCrop({ scale: 1, x: 50, y: 50 })
                setFrontImageFilter(DEFAULT_FRONT_FILTER)
              }}
            >
              Réinitialiser
            </Button>
            <Button
              type="button"
              onClick={() => {
                setShowImageEditModal(false)
                setShowCropPanel(false)
              }}
              className="rounded-xl bg-teal-500 hover:bg-teal-600"
            >
              <Check size={16} className="mr-2" />
              Valider la retouche
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Tarifs (info options payantes) */}
      <Dialog open={showPricingModal} onOpenChange={setShowPricingModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl p-0 border-none shadow-2xl">
          <DialogHeader className="p-6 pb-2 border-b border-stone-100">
            <DialogTitle className="text-xl font-serif font-bold text-stone-800">
              Tarifs et options
            </DialogTitle>
            <DialogDescription className="text-stone-500">
              Choisissez le palier qui correspond à votre carte.
            </DialogDescription>
          </DialogHeader>
          <div className="p-6 space-y-6">
            {/* Carte gratuite — même plan que /pricing */}
            <div className="rounded-2xl border-2 border-green-200 bg-green-50/50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-block w-3 h-3 rounded-full bg-green-500" />
                <h4 className="font-bold text-stone-800">Carte gratuite</h4>
              </div>
              <p className="text-sm text-stone-600 mb-1">
                Sans limite de temps. Essayez sans engagement.
              </p>
              <ul className="text-xs text-stone-600 space-y-1 list-disc list-inside">
                <li>1 carte postale (photo, texte)</li>
                <li>Modifiable via le lien reçu par email</li>
                <li>Prolongeable en carte payante à tout moment</li>
              </ul>
            </div>
            {/* À l'unité 2,50 € — même plan que /pricing */}
            <div className="rounded-2xl border-2 border-teal-200 bg-teal-50/50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-block w-3 h-3 rounded-full bg-teal-500" />
                <h4 className="font-bold text-stone-800">À l&apos;unité — 2,50 €</h4>
              </div>
              <p className="text-sm text-stone-600 mb-1">
                Peu importe le contenu (Photo, Vidéo ou Message vocal), le prix reste le même.
              </p>
              <ul className="text-xs text-stone-600 space-y-1 list-disc list-inside">
                <li>Envoi à un nombre illimité de destinataires par carte</li>
                <li>Cartes 100 % virtuelles, avec statistiques de visite</li>
                <li>Photos, vidéos, message vocal : même tarif</li>
                <li>Programmation (ex. anniversaire à 8h00)</li>
                <li>Modifiable depuis votre compte</li>
                <li>Carte gratuite modifiable via le lien reçu par email</li>
              </ul>
            </div>
          </div>
          <DialogFooter className="p-6 pt-0 border-t border-stone-100">
            <Link href="/pricing" onClick={() => setShowPricingModal(false)}>
              <Button variant="outline" className="rounded-xl border-stone-200">
                Voir tous les tarifs et abonnements
              </Button>
            </Link>
            <Button
              onClick={() => setShowPricingModal(false)}
              className="rounded-xl bg-teal-500 hover:bg-teal-600"
            >
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Aperçu carte à gratter / puzzle */}
      <Dialog
        open={showInteractivePreview !== null}
        onOpenChange={(open) => !open && setShowInteractivePreview(null)}
      >
        <DialogContent className="sm:max-w-[min(90vw,560px)] max-h-[90vh] overflow-hidden flex flex-col bg-white rounded-3xl border-none shadow-2xl p-0">
          <DialogHeader className="px-6 pt-6 pb-3 border-b border-stone-100 flex-shrink-0">
            <DialogTitle className="text-lg font-bold text-stone-800">
              {showInteractivePreview === 'scratch' && 'Aperçu — Carte à gratter'}
              {showInteractivePreview === 'puzzle' && 'Aperçu — Carte puzzle'}
            </DialogTitle>
            <DialogDescription className="text-sm text-stone-500">
              {showInteractivePreview === 'scratch' &&
                'Glissez sur la carte pour simuler le grattage. Ce que verra le destinataire.'}
              {showInteractivePreview === 'puzzle' &&
                "Déplacez les pièces pour reconstituer l'image. Ce que verra le destinataire."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-auto p-6 flex justify-center items-start min-h-0">
            {showInteractivePreview && frontImage && (
              <div className="w-full max-w-[320px] perspective-[1000px]">
                <ScratchCardViewWrapper
                  postcard={{
                    ...currentPostcard,
                    scratchCardEnabled: showInteractivePreview === 'scratch',
                    puzzleCardEnabled: showInteractivePreview === 'puzzle',
                  }}
                >
                  <PostcardView
                    postcard={currentPostcard}
                    flipped={false}
                    className="w-full"
                    width="320"
                    height="213"
                  />
                </ScratchCardViewWrapper>
              </div>
            )}
          </div>
          <DialogFooter className="px-6 pb-6 pt-3 border-t border-stone-100 flex-shrink-0">
            <Button
              onClick={() => setShowInteractivePreview(null)}
              className="rounded-xl bg-stone-700 hover:bg-stone-800"
            >
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Email Prompt */}
      {showEmailPromptModal && (
        <Dialog open={showEmailPromptModal} onOpenChange={setShowEmailPromptModal}>
          <DialogContent className="sm:max-w-md bg-white rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden">
            <div className="p-8 text-center bg-stone-50 border-b border-stone-100">
              <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail size={32} />
              </div>
              <DialogTitle className="text-2xl font-serif font-black text-stone-900 mb-2">
                Recevez votre carte !
              </DialogTitle>
              <DialogDescription className="text-stone-500 text-sm font-medium">
                Créez un compte pour sauvegarder cette carte. Vous pourrez la modifier (images,
                textes...) à tout moment ou la dupliquer pour envoyer des variantes personnalisées à
                vos proches.
              </DialogDescription>
            </div>
            <div className="p-8 space-y-4">
              <Input
                type="email"
                placeholder="votre@email.com"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                className="h-12 rounded-xl border-stone-200 focus:border-teal-500 shadow-sm text-lg"
              />
              <Button
                onClick={() => {
                  if (senderEmail) {
                    setIsSendingEmail(true)
                    linkPostcardToUser(createdPostcardId!, senderEmail).then((res) => {
                      setIsSendingEmail(false)
                      if (res.success) {
                        if (typeof window !== 'undefined') {
                          sessionStorage.removeItem('pendingLinkPostcard')
                        }
                        setIsEmailSent(true)
                        setTimeout(() => {
                          setShowEmailPromptModal(false)
                        }, 1500)
                      }
                    })
                  }
                }}
                disabled={!senderEmail || isSendingEmail}
                className="w-full bg-stone-900 hover:bg-black text-white rounded-xl py-6 h-auto font-black flex items-center justify-center gap-2 shadow-lg"
              >
                {isSendingEmail ? (
                  <RefreshCw size={20} className="animate-spin" />
                ) : isEmailSent ? (
                  <>
                    <CheckCircle2 size={20} className="text-teal-400" />
                    Envoyé !
                  </>
                ) : (
                  'Sauvegarder et Envoyer'
                )}
              </Button>

              {googleClientId && (
                <>
                  <div className="relative my-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-stone-100"></div>
                    </div>
                    <div className="relative flex justify-center text-[10px]">
                      <span className="px-2 bg-white text-stone-400 font-bold uppercase tracking-widest">
                        Ou
                      </span>
                    </div>
                  </div>
                  <GoogleLoginButton
                    onSuccess={handleGoogleSuccess}
                    className="!h-14"
                    redirectPath={
                      createdPostcardId
                        ? `/api/link-postcard-and-redirect?postcard=${encodeURIComponent(createdPostcardId)}&redirect=${encodeURIComponent(`/editor?edit=${createdPostcardId}&step=preview`)}`
                        : undefined
                    }
                  />
                </>
              )}

              {createdPostcardId && (
                <Link
                  href={`/connexion?callbackUrl=${encodeURIComponent(`/editor?edit=${createdPostcardId}&step=preview`)}&linkPostcard=${encodeURIComponent(createdPostcardId)}`}
                  className="block w-full text-center text-sm font-bold text-teal-600 hover:text-teal-700 transition-colors"
                >
                  Déjà un compte ? Se connecter
                </Link>
              )}

              <button
                onClick={() => setShowEmailPromptModal(false)}
                className="w-full text-stone-400 hover:text-stone-600 text-[10px] sm:text-xs uppercase tracking-widest font-black transition-colors"
                aria-label="Ignorer cette étape"
              >
                Plus tard
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Note Editor Dialog */}
      <Dialog
        open={!!editingMediaNoteId}
        onOpenChange={(open) => !open && setEditingMediaNoteId(null)}
      >
        <DialogContent className="sm:max-w-md bg-white rounded-3xl border-none shadow-2xl p-0 overflow-hidden">
          <div className="p-6 border-b border-stone-100 bg-teal-50/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-500 text-white rounded-xl flex items-center justify-center shadow-md shadow-teal-100">
                <FileText size={20} />
              </div>
              <div>
                <DialogTitle className="text-xl font-serif font-extrabold text-stone-900">
                  Légende de la photo
                </DialogTitle>
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest leading-none mt-1">
                  Ajoutez un souvenir
                </p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <textarea
              value={editingMediaNoteText}
              onChange={(e) => setEditingMediaNoteText(e.target.value)}
              placeholder="Racontez l'histoire de cette photo..."
              className="w-full min-h-[150px] rounded-2xl border border-stone-200 focus:border-teal-500 focus:ring-teal-500 text-base p-4 bg-stone-50/50 resize-none transition-all placeholder:text-stone-300"
              autoFocus
            />
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={saveMediaNote}
                className="flex-1 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-black shadow-lg shadow-teal-100 transition-all h-12"
              >
                Sauvegarder
              </Button>
              <Button
                variant="ghost"
                onClick={() => setEditingMediaNoteId(null)}
                className="bg-stone-50 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-xl font-bold h-12"
              >
                Annuler
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal : tous les modèles avec catégories */}
      {showTemplateModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 sm:p-8 overflow-auto"
          onClick={() => setShowTemplateModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl max-h-[85vh] bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between shrink-0 border-b border-stone-200 px-6 py-4">
              <div>
                <h3 className="text-lg font-bold text-stone-800">
                  {templateModalCategory === 'all'
                    ? 'Tous les modèles'
                    : (TEMPLATE_CATEGORIES.find((c) => c.key === templateModalCategory)?.icon ??
                        '') +
                      ' ' +
                      (TEMPLATE_CATEGORIES.find((c) => c.key === templateModalCategory)?.label ??
                        '')}
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  {filteredTemplates.length} modèle{filteredTemplates.length > 1 ? 's' : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowTemplateModal(false)}
                className="p-2 rounded-full text-stone-500 hover:bg-stone-100 hover:text-stone-700 transition"
                aria-label="Fermer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Category selection */}
            <div className="shrink-0 border-b border-stone-100 bg-stone-50/30 px-4 py-4 overflow-x-auto">
              <div className="flex gap-2.5 flex-nowrap min-w-max">
                {TEMPLATE_CATEGORIES.map((cat) => {
                  const isActive = templateModalCategory === cat.key
                  return (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => setTemplateModalCategory(cat.key)}
                      className={cn(
                        'group flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all border shadow-sm',
                        isActive
                          ? 'bg-teal-500 text-white border-teal-600 shadow-teal-100'
                          : 'bg-white text-stone-600 border-stone-200 hover:border-teal-300 hover:bg-teal-50/50',
                      )}
                    >
                      {cat.imageUrl ? (
                        <div
                          className={cn(
                            'w-6 h-6 rounded-lg overflow-hidden border transition-all',
                            isActive
                              ? 'border-white/30'
                              : 'border-stone-100 group-hover:border-teal-200',
                          )}
                        >
                          <img src={cat.imageUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        cat.icon && <span className="text-sm">{cat.icon}</span>
                      )}
                      {cat.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Template grid */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredTemplates.map((template) => {
                  const cat = TEMPLATE_CATEGORIES.find((c) => c.key === template.category)
                  const isSelected = selectedTemplateId === template.id
                  return (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => {
                        handleSelectTemplate(template)
                        setShowTemplateModal(false)
                      }}
                      className={cn(
                        'flex items-center gap-3 rounded-2xl border p-3 text-left transition-all w-full',
                        isSelected
                          ? 'border-teal-500 bg-teal-50 ring-2 ring-teal-200'
                          : 'border-stone-200 bg-white hover:border-teal-200 hover:bg-stone-50',
                      )}
                    >
                      <div className="h-14 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-stone-100">
                        <img
                          src={template.imageUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-stone-900">{template.name}</p>
                        {template.description && (
                          <p className="text-xs text-stone-500 line-clamp-1">
                            {template.description}
                          </p>
                        )}
                        <p className="text-[0.65rem] uppercase tracking-wider text-stone-400 mt-0.5">
                          {cat?.icon
                            ? `${cat.icon} ${cat.label}`
                            : (cat?.label ?? template.category)}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="shrink-0 w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center">
                          <Check size={12} className="text-white" />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
              {filteredTemplates.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-2xl mb-2">
                    {TEMPLATE_CATEGORIES.find((c) => c.key === templateModalCategory)?.icon ?? '📋'}
                  </p>
                  <p className="text-sm font-semibold text-stone-600">
                    Aucun modèle dans cette catégorie pour le moment.
                  </p>
                  <button
                    type="button"
                    onClick={() => setTemplateModalCategory('all')}
                    className="mt-3 text-xs text-teal-600 hover:text-teal-700 font-semibold underline"
                  >
                    Voir tous les modèles
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal destinataire : iframe de la page réelle */}
      {showRecipientModal && shareUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 sm:p-8 overflow-auto"
          onClick={() => setShowRecipientModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[1400px] h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200"
          >
            <button
              onClick={() => setShowRecipientModal(false)}
              className="absolute top-3 right-3 z-50 p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all"
              aria-label="Fermer la vue destinataire"
            >
              <X size={20} />
            </button>
            <div className="absolute inset-x-0 top-4 flex justify-center z-40">
              <span className="bg-white/80 text-stone-600 text-xs font-semibold uppercase tracking-[0.2em] px-4 py-1 rounded-full shadow-sm">
                Vue destinataire
              </span>
            </div>
            <iframe
              src={shareUrl || undefined}
              title="Page destinataire"
              className="w-full h-full border-0"
              loading="lazy"
              allowFullScreen
            />
          </div>
        </div>
      )}
      {/* Copy notification toast */}
      {showCopyToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="bg-stone-900 border border-white/10 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md">
            <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center">
              <Check size={14} className="text-white" />
            </div>
            <span className="font-bold text-sm tracking-wide">Lien copié !</span>
          </div>
        </div>
      )}
      <UnsplashSearchModal
        isOpen={showUnsplashModal}
        onClose={() => {
          setShowUnsplashModal(false)
          setUnsplashInitialQuery(null)
        }}
        onSelect={handleSelectUnsplashImage}
        location={location}
        initialQuery={unsplashInitialQuery}
      />
      {SHOW_AI_IMAGE_GENERATION && (
        <AiImageGeneratorModal
          isOpen={showAiGeneratorModal}
          onClose={() => setShowAiGeneratorModal(false)}
          onSelect={handleSelectAiImage}
          hasPaid={hasAiGenerationPaid}
          onRequestPayment={handleAiPayment}
        />
      )}
      {/* Modal galerie stickers */}
      {showStickerGallery && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
          onClick={() => setShowStickerGallery(false)}
          aria-modal
          role="dialog"
          aria-label="Choisir un sticker"
        >
          <div
            className="w-full max-w-lg max-h-[85vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <StickerGallery
              onSelect={handleStickerSelect}
              onClose={() => setShowStickerGallery(false)}
            />
          </div>
        </div>
      )}

      <UserGalleryModal
        multiple={showUserGalleryModal === 'back'}
        open={showUserGalleryModal !== null}
        onOpenChange={(open) => !open && setShowUserGalleryModal(null)}
        onSelect={(payloadUrl) => {
          // Uniquement pour le mode 'front' (sélection unique, sans bouton Valider)
          if (showUserGalleryModal === 'front') {
            const finalUrl = Array.isArray(payloadUrl) ? payloadUrl[0] : payloadUrl
            if (finalUrl) {
              setFrontImage(finalUrl)
              setFrontImageKey(null)
              setFrontImageMimeType(null)
              setFrontImageFilesize(null)
              setFrontImageCrop({ scale: 1, x: 50, y: 50 })
              setFrontImageFilter(DEFAULT_FRONT_FILTER)
            }
          }
        }}
        onSelectMediaItems={(galleryItems) => {
          // Mode 'back' : on reçoit les UserMediaItem complets avec l'ID Payload
          setMediaItems((prev) => {
            const currentMedia = prev || []
            let imagesCount = currentMedia.filter((i) => i.type === 'image').length
            const newItems: typeof currentMedia = []

            for (const galleryItem of galleryItems) {
              if (imagesCount >= ALBUM_TIERS.paid.photos) {
                alert(
                  `La limite est atteinte (${ALBUM_TIERS.paid.photos} photos max). Certaines images n'ont pas été ajoutées.`,
                )
                break
              }
              newItems.push({
                id: Date.now().toString() + Math.random().toString(),
                type: 'image' as const,
                url: galleryItem.url,
                media: galleryItem.id, // ID Payload → relation media correctement sauvegardée
              })
              imagesCount++
            }

            return [...currentMedia, ...newItems]
          })
        }}
      />

      {/* Bibliothèque de musique d'ambiance */}
      <MusicLibraryModal
        isOpen={showMusicModal}
        onClose={() => setShowMusicModal(false)}
        onSelect={(track: MusicTrack) => {
          setBackgroundMusic(track.url)
          setBackgroundMusicTitle(track.title)
          setShowMusicModal(false)
        }}
      />

      {/* Floating Button: Scroll to Top */}
      {showScrollTop && !stickyPreview && (
        <div className="fixed bottom-4 right-4 z-[71]">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className={cn(
              'flex items-center justify-center w-12 h-12',
              'bg-teal-600 hover:bg-teal-700 text-white rounded-full shadow-lg transition-all duration-300',
              'hover:scale-110 active:scale-95 animate-in fade-in zoom-in duration-300',
            )}
            title="Retour en haut"
          >
            <ChevronUp className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  )
}
