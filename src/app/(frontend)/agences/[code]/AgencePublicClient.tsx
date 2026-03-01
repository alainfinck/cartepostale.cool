'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  MapPin,
  Globe,
  Phone,
  Mail,
  ArrowRight,
  Sparkles,
  QrCode,
  Camera,
  PenLine,
  Send,
  Building2,
  ExternalLink,
  Smartphone,
} from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { Button } from '@/components/ui/button'
import { getOptimizedImageUrl } from '@/lib/image-processing'
import AgencyGallerySection from './AgencyGallerySection'
import type { GalleryItemPublic, GalleryCategoryPublic } from './types'

interface AgencyPublicData {
  id: number
  code: string
  name: string
  logoUrl: string | null
  primaryColor: string
  website: string | null
  phone: string | null
  email: string | null
  city: string | null
  address: string | null
  bannerEnabled: boolean
  bannerText: string | null
  bannerSubtext: string | null
  bannerColor: string
  bannerTextColor: string
  bannerLink: string | null
  bannerImageUrl: string | null
}

interface Props {
  agency: AgencyPublicData
  galleryItems: GalleryItemPublic[]
  galleryCategories: GalleryCategoryPublic[]
}


const STEPS = [
  {
    step: '01',
    icon: QrCode,
    title: 'Scannez le QR code',
    desc: "Ou cliquez sur le bouton ci-dessous pour accéder à l'éditeur.",
    color: 'bg-teal-50 text-teal-600',
  },
  {
    step: '02',
    icon: Camera,
    title: 'Choisissez une photo',
    desc: 'Depuis la galerie de destinations ou vos propres photos.',
    color: 'bg-orange-50 text-orange-600',
  },
  {
    step: '03',
    icon: PenLine,
    title: 'Écrivez votre message',
    desc: 'Personnalisez votre carte avec un message sincère.',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    step: '04',
    icon: Send,
    title: 'Partagez !',
    desc: 'Envoyez à vos proches par lien, email ou réseau social.',
    color: 'bg-rose-50 text-rose-600',
  },
]

export default function AgencePublicClient({
  agency,
  galleryItems,
  galleryCategories,
}: Props) {
  const primary = agency.primaryColor || '#0d9488'
  const createUrl = `/editor?agencyCode=${agency.code}`

  return (
    <div className="min-h-screen bg-[#fdfbf7] font-sans">
      {/* ── HEADER AGENCE ─────────────────────────── */}
      <header
        className="sticky top-0 z-40 border-b"
        style={{ backgroundColor: primary, borderColor: `${primary}80` }}
      >
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {agency.logoUrl ? (
              <img
                src={getOptimizedImageUrl(agency.logoUrl, { width: 120 })}
                alt={agency.name}
                className="h-10 w-auto object-contain"
              />
            ) : (
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/20">
                <Building2 size={20} className="text-white" />
              </div>
            )}
            <span className="text-white font-bold text-base truncate max-w-[180px] sm:max-w-none">
              {agency.name}
            </span>
          </div>
          <Link href={createUrl}>
            <Button
              size="sm"
              className="shrink-0 text-xs font-bold border-2 border-white/80 bg-amber-400 text-stone-900 shadow-md hover:bg-amber-300 hover:border-white transition-colors"
            >
              Créer une carte
              <ArrowRight size={14} className="ml-1" />
            </Button>
          </Link>
        </div>
      </header>

      {/* ── HERO ─────────────────────────────────── */}
      <section
        className="relative flex flex-col items-center justify-center overflow-hidden py-20 px-4"
        style={{ backgroundColor: primary }}
      >
        {/* Motif géométrique subtil en SVG */}
        {/* Fond uni propre comme demandé */}
        <div className="absolute inset-0 pointer-events-none bg-black/5" />

        <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center"
          >
            {/* ── LOGO MIS EN AVANT (effet timbre réaliste : petits ronds en crantelé, fond blanc plein) ── */}
            {agency.logoUrl ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.03, rotate: 1 }}
                transition={{
                  duration: 0.5,
                  delay: 0.1,
                }}
                className="mb-12 cursor-pointer group relative"
              >
                {/* Masque SVG : rectangle avec petits ronds (perforations) le long des bords uniquement */}
                <svg width={0} height={0} className="absolute" aria-hidden>
                  <defs>
                    <mask id="stamp-perforations-mask" maskContentUnits="objectBoundingBox">
                      <rect width="1" height="1" fill="white" />
                      <g fill="black">
                        {/* Bord du haut : petits cercles centrés sur le bord */}
                        {[0.06, 0.18, 0.3, 0.42, 0.54, 0.66, 0.78, 0.9].map((x) => (
                          <circle key={`t-${x}`} cx={x} cy={0} r={0.028} />
                        ))}
                        {/* Bord droit */}
                        {[0.06, 0.18, 0.3, 0.42, 0.54, 0.66, 0.78, 0.9].map((y) => (
                          <circle key={`r-${y}`} cx={1} cy={y} r={0.028} />
                        ))}
                        {/* Bord du bas */}
                        {[0.94, 0.82, 0.7, 0.58, 0.46, 0.34, 0.22, 0.1].map((x) => (
                          <circle key={`b-${x}`} cx={x} cy={1} r={0.028} />
                        ))}
                        {/* Bord gauche */}
                        {[0.94, 0.82, 0.7, 0.58, 0.46, 0.34, 0.22, 0.1].map((y) => (
                          <circle key={`l-${y}`} cx={0} cy={y} r={0.028} />
                        ))}
                      </g>
                    </mask>
                  </defs>
                </svg>
                <div
                  className="bg-white p-10 md:p-14 relative z-10 shadow-[0_20px_60px_rgba(0,0,0,0.4)]"
                  style={{
                    mask: 'url(#stamp-perforations-mask)',
                    maskSize: '100% 100%',
                    maskPosition: '0 0',
                    maskRepeat: 'no-repeat',
                    WebkitMask: 'url(#stamp-perforations-mask)',
                    WebkitMaskSize: '100% 100%',
                    WebkitMaskPosition: '0 0',
                    WebkitMaskRepeat: 'no-repeat',
                  }}
                >
                  <div className="relative z-10 flex items-center justify-center">
                    <img
                      src={getOptimizedImageUrl(agency.logoUrl, { width: 600 })}
                      alt={agency.name}
                      className="h-36 md:h-48 w-auto max-w-[320px] md:max-w-[520px] object-contain"
                      style={{ display: 'block' }}
                    />
                  </div>
                  <div className="absolute inset-5 border border-stone-200/50 pointer-events-none z-20" />
                </div>
                <div
                  className="absolute inset-0 -z-10 blur-[80px] opacity-40 scale-110"
                  style={{ backgroundColor: primary }}
                />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mb-10"
              >
                <div className="bg-white/20 w-28 h-28 rounded-3xl flex items-center justify-center">
                  <Building2 size={48} className="text-white" />
                </div>
              </motion.div>
            )}

            <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-4 leading-tight">
              {agency.name}
            </h1>

            <p className="text-white/75 text-lg md:text-xl mb-8 leading-relaxed font-light max-w-xl">
              Créez et partagez vos cartes postales de voyage en quelques secondes. Un souvenir
              unique, aux couleurs de{' '}
              <span className="font-semibold text-white">{agency.name}</span>.
            </p>

            {/* Contact chips */}
            <div className="flex flex-wrap justify-center gap-3 mb-10 text-sm text-white/80">
              {agency.city && (
                <span className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <MapPin size={13} className="shrink-0" /> {agency.city}
                </span>
              )}
              {agency.website && (
                <a
                  href={`https://${agency.website.replace(/^https?:\/\//, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm hover:bg-white/25 transition-colors px-3 py-1.5 rounded-full"
                >
                  <Globe size={13} className="shrink-0" /> {agency.website}
                  <ExternalLink size={11} />
                </a>
              )}
              {agency.phone && (
                <a
                  href={`tel:${agency.phone}`}
                  className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm hover:bg-white/25 transition-colors px-3 py-1.5 rounded-full"
                >
                  <Phone size={13} className="shrink-0" /> {agency.phone}
                </a>
              )}
              {agency.email && (
                <a
                  href={`mailto:${agency.email}`}
                  className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm hover:bg-white/25 transition-colors px-3 py-1.5 rounded-full"
                >
                  <Mail size={13} className="shrink-0" /> {agency.email}
                </a>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <Link href={createUrl}>
                <Button
                  size="lg"
                  className="text-base font-bold px-8 py-6 rounded-2xl border-2 border-white/90 bg-amber-400 text-stone-900 shadow-[0_8px_30px_rgba(0,0,0,0.25),0_0_0_1px_rgba(255,255,255,0.5)_inset] hover:bg-amber-300 hover:border-white hover:shadow-[0_12px_40px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.6)_inset] transition-all duration-200"
                >
                  <Camera size={18} className="mr-2" />
                  Créer ma carte postale
                  <ArrowRight size={18} className="ml-2" />
                </Button>
              </Link>

              <button
                onClick={() =>
                  document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })
                }
                className="text-white/80 hover:text-white text-sm font-semibold underline underline-offset-4 flex items-center gap-1"
              >
                Comment ça marche ?
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── BANNIÈRE PROMO ─────────────────────────── */}
      {agency.bannerEnabled && agency.bannerText && (
        <div
          className="w-full py-3 px-4"
          style={{
            backgroundColor: agency.bannerColor,
            backgroundImage: agency.bannerImageUrl ? `url(${agency.bannerImageUrl})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="max-w-6xl mx-auto flex items-center gap-4">
            <div className="flex-1">
              {agency.bannerLink ? (
                <a
                  href={agency.bannerLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  <p className="font-bold text-sm" style={{ color: agency.bannerTextColor }}>
                    {agency.bannerText}
                  </p>
                  {agency.bannerSubtext && (
                    <p className="text-xs opacity-80" style={{ color: agency.bannerTextColor }}>
                      {agency.bannerSubtext}
                    </p>
                  )}
                </a>
              ) : (
                <>
                  <p className="font-bold text-sm" style={{ color: agency.bannerTextColor }}>
                    {agency.bannerText}
                  </p>
                  {agency.bannerSubtext && (
                    <p className="text-xs opacity-80" style={{ color: agency.bannerTextColor }}>
                      {agency.bannerSubtext}
                    </p>
                  )}
                </>
              )}
            </div>
            {agency.bannerLink && (
              <a
                href={agency.bannerLink}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 text-xs font-bold uppercase px-4 py-2 rounded-full border-2 transition-opacity hover:opacity-80"
                style={{ borderColor: agency.bannerTextColor, color: agency.bannerTextColor }}
              >
                En savoir +
              </a>
            )}
          </div>
        </div>
      )}

      {/* ── COMMENT ÇA MARCHE ─────────────────────── */}
      <section id="how-it-works" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          {/* Titre */}
          <div className="text-center mb-14">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-black uppercase tracking-widest mb-6"
              style={{ backgroundColor: `${primary}15`, color: primary }}
            >
              <Sparkles size={15} /> Comment ça marche
            </div>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-stone-900 mb-4">
              En 4 étapes simples
            </h2>
            <p className="text-stone-600 text-lg max-w-xl mx-auto">
              Créez et partagez votre carte postale brandée{' '}
              <span className="font-semibold" style={{ color: primary }}>
                {agency.name}
              </span>{' '}
              en moins de 2 minutes.
            </p>
          </div>

          {/* Layout 2 colonnes : étapes + QR code */}
          <div className="grid lg:grid-cols-[1fr_340px] gap-10 items-start">
            {/* ── ÉTAPES ── */}
            <div className="flex flex-col gap-0">
              {STEPS.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12 }}
                  className="flex gap-5"
                >
                  {/* Colonne gauche : numéro + trait vertical */}
                  <div className="flex flex-col items-center">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg shrink-0 shadow-md"
                      style={{ backgroundColor: primary }}
                    >
                      {s.step}
                    </div>
                    {i < 3 && (
                      <div
                        className="w-0.5 flex-1 my-2 min-h-[40px]"
                        style={{ backgroundColor: `${primary}25` }}
                      />
                    )}
                  </div>

                  {/* Contenu */}
                  <div className={`pb-8 ${i === STEPS.length - 1 ? 'pb-0' : ''}`}>
                    <div
                      className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mb-3`}
                    >
                      <s.icon size={18} />
                    </div>
                    <h3 className="font-bold text-stone-900 text-base mb-1">{s.title}</h3>
                    <p className="text-stone-500 text-sm leading-relaxed">{s.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* ── QR CODE ── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:sticky lg:top-24"
            >
              <div
                className="rounded-3xl overflow-hidden border shadow-xl"
                style={{ borderColor: `${primary}20` }}
              >
                {/* Header */}
                <div
                  className="px-6 py-4 flex items-center gap-3"
                  style={{ backgroundColor: primary }}
                >
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <Smartphone size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">Accès rapide</p>
                    <p className="text-white/70 text-xs">Scannez pour créer votre carte</p>
                  </div>
                </div>

                {/* QR Code */}
                <div className="bg-white p-8 flex flex-col items-center gap-5">
                  <div
                    className="p-4 rounded-2xl"
                    style={{ backgroundColor: `${primary}08`, border: `2px solid ${primary}20` }}
                  >
                    <QRCodeSVG
                      value={
                        typeof window !== 'undefined'
                          ? `${window.location.origin}/editor?agencyCode=${agency.code}`
                          : `/editor?agencyCode=${agency.code}`
                      }
                      size={180}
                      fgColor={primary}
                      bgColor="transparent"
                      level="M"
                      imageSettings={
                        agency.logoUrl
                          ? {
                              src: getOptimizedImageUrl(agency.logoUrl, { width: 80 }),
                              x: undefined,
                              y: undefined,
                              height: 36,
                              width: 36,
                              excavate: true,
                            }
                          : undefined
                      }
                    />
                  </div>

                  <div className="text-center">
                    <p className="text-stone-800 font-semibold text-sm mb-1">
                      Pointez votre appareil photo
                    </p>
                    <p className="text-stone-400 text-xs">Ou cliquez sur le bouton ci-dessous</p>
                  </div>

                  <Link href={createUrl} className="w-full">
                    <Button
                      size="sm"
                      className="w-full font-bold rounded-xl border-0 py-5"
                      style={{ backgroundColor: primary, color: 'white' }}
                    >
                      <Camera size={15} className="mr-2" />
                      Créer ma carte maintenant
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── GALERIE AGENCE ────────────────────────── */}
      <AgencyGallerySection
        galleryItems={galleryItems}
        galleryCategories={galleryCategories}
        agencyName={agency.name}
        agencyLogoUrl={agency.logoUrl}
        primaryColor={primary}
        createUrl={createUrl}
      />

      {/* ── CTA FINAL ─────────────────────────────── */}
      <section className="py-20 px-4 bg-stone-900 text-white text-center">
        <div className="max-w-2xl mx-auto">
          {agency.logoUrl && (
            <img
              src={getOptimizedImageUrl(agency.logoUrl, { width: 120 })}
              alt={agency.name}
              className="h-12 w-auto object-contain mx-auto mb-6 opacity-80"
            />
          )}
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
            Votre carte postale vous attend
          </h2>
          <p className="text-white/60 mb-10 text-lg">
            Créez un souvenir unique et partagez-le avec vos proches en quelques clics.
          </p>
          <Link href={createUrl}>
            <Button
              size="lg"
              className="text-base font-bold px-10 py-6 rounded-2xl border-0 shadow-xl"
              style={{ backgroundColor: primary }}
            >
              Créer ma carte postale {agency.name}
              <ArrowRight size={18} className="ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────── */}
      <footer className="py-8 px-4 border-t border-stone-200 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-stone-400 text-xs">
          <div className="flex items-center gap-3">
            {agency.logoUrl && (
              <img
                src={getOptimizedImageUrl(agency.logoUrl, { width: 80 })}
                alt={agency.name}
                className="h-6 w-auto object-contain opacity-60"
              />
            )}
            <span className="font-semibold">{agency.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Cartes postales propulsées par</span>
            <Link
              href="/"
              className="font-bold text-stone-600 hover:text-teal-600 transition-colors"
            >
              cartepostale.cool
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
