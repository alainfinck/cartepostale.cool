import type { TemplateCategory } from '@/types'

export interface EventTheme {
  /** Texte du héros (remplace "Vous avez reçu une carte postale de la part de") */
  heroTitle: string
  /** Emoji thématique affiché après le titre héros */
  icon: string
  /** Classe Tailwind pour le fond de la page */
  pageBg: string
  /** Classe Tailwind pour la couleur de la signature de l'expéditeur */
  signatureColor: string
  /** Classe Tailwind pour le blob de décoration haut-droite de la section CTA */
  ctaBlob1: string
  /** Classe Tailwind pour le blob de décoration bas-gauche de la section CTA */
  ctaBlob2: string
  /** Classe Tailwind pour l'icône de la section CTA */
  ctaIconBg: string
  ctaIconColor: string
}

// NOTE : toutes les classes Tailwind sont écrites en intégralité (chaînes statiques)
// pour que le scanner Tailwind les détecte correctement.
const EVENT_THEMES: Partial<Record<TemplateCategory, EventTheme>> = {
  birthday: {
    heroTitle: "Vous avez reçu une carte d'anniversaire de la part de",
    icon: '🎂',
    pageBg: 'bg-[#fff9f0]',
    signatureColor: 'text-amber-600',
    ctaBlob1: 'bg-amber-50/60',
    ctaBlob2: 'bg-orange-50/60',
    ctaIconBg: 'bg-amber-50',
    ctaIconColor: 'text-amber-500',
  },
  vacation: {
    heroTitle: 'Vous avez reçu une carte de vacances de la part de',
    icon: '🌴',
    pageBg: 'bg-[#f0fbf7]',
    signatureColor: 'text-teal-700',
    ctaBlob1: 'bg-teal-50/60',
    ctaBlob2: 'bg-sky-50/60',
    ctaIconBg: 'bg-teal-50',
    ctaIconColor: 'text-teal-500',
  },
  invitation: {
    heroTitle: 'Vous avez reçu une invitation de la part de',
    icon: '✉️',
    pageBg: 'bg-[#fdf8ff]',
    signatureColor: 'text-violet-700',
    ctaBlob1: 'bg-violet-50/60',
    ctaBlob2: 'bg-purple-50/60',
    ctaIconBg: 'bg-violet-50',
    ctaIconColor: 'text-violet-500',
  },
  birth: {
    heroTitle: 'Vous avez reçu une carte de naissance de la part de',
    icon: '👶',
    pageBg: 'bg-[#f0f9ff]',
    signatureColor: 'text-sky-600',
    ctaBlob1: 'bg-sky-50/60',
    ctaBlob2: 'bg-blue-50/60',
    ctaIconBg: 'bg-sky-50',
    ctaIconColor: 'text-sky-500',
  },
  christmas: {
    heroTitle: 'Vous avez reçu une carte de Noël de la part de',
    icon: '🎄',
    pageBg: 'bg-[#f0fff6]',
    signatureColor: 'text-green-700',
    ctaBlob1: 'bg-green-50/60',
    ctaBlob2: 'bg-red-50/60',
    ctaIconBg: 'bg-green-50',
    ctaIconColor: 'text-green-600',
  },
  wedding: {
    heroTitle: 'Vous avez reçu une carte de mariage de la part de',
    icon: '💍',
    pageBg: 'bg-[#fff8f8]',
    signatureColor: 'text-rose-600',
    ctaBlob1: 'bg-rose-50/60',
    ctaBlob2: 'bg-pink-50/60',
    ctaIconBg: 'bg-rose-50',
    ctaIconColor: 'text-rose-500',
  },
  graduation: {
    heroTitle: "Vous avez reçu une carte de félicitations de la part de",
    icon: '🎓',
    pageBg: 'bg-[#fdfbf0]',
    signatureColor: 'text-yellow-700',
    ctaBlob1: 'bg-yellow-50/60',
    ctaBlob2: 'bg-amber-50/60',
    ctaIconBg: 'bg-yellow-50',
    ctaIconColor: 'text-yellow-600',
  },
}

const DEFAULT_THEME: EventTheme = {
  heroTitle: 'Vous avez reçu une carte postale de la part de',
  icon: '',
  pageBg: 'bg-[#fdfbf7]',
  signatureColor: 'text-teal-700',
  ctaBlob1: 'bg-teal-50/50',
  ctaBlob2: 'bg-orange-50/50',
  ctaIconBg: 'bg-orange-50',
  ctaIconColor: 'text-orange-500',
}

export function getEventTheme(eventType?: TemplateCategory | string | null): EventTheme {
  if (!eventType) return DEFAULT_THEME
  return EVENT_THEMES[eventType as TemplateCategory] ?? DEFAULT_THEME
}
