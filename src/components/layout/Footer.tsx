'use client'

import React from 'react'
import Link from 'next/link'
import { Mail, Instagram, Heart, Image as ImageIcon } from 'lucide-react'
import { usePathname } from 'next/navigation'

const navLinks = [
  { href: '/', label: 'Accueil' },
  { href: '/idees', label: 'Fonctionnalités' },
  { href: '/cas-d-usage', label: "Cas d'utilisation" },
  { href: '/galerie', label: 'Découvrir' },
  { href: '/blog', label: 'Blog' },
  { href: '/business', label: 'Solutions Pro' },
  { href: '/pricing', label: 'Tarifs' },
  { href: '/a-propos', label: 'À propos' },
  { href: '/contact', label: 'Contact' },
]

const legalLinks = [
  { href: '/legal/mentions-legales', label: 'Mentions Légales' },
  { href: '/legal/cgu', label: 'CGU' },
  { href: '/legal/cgv', label: 'CGV' },
  { href: '/legal/confidentialite', label: 'Confidentialité' },
  { href: '/legal/cookies', label: 'Cookies' },
]

export const Footer = () => {
  const pathname = usePathname()

  if (pathname === '/editor') return null

  if (
    pathname?.startsWith('/view/') ||
    pathname?.startsWith('/view-debug/') ||
    pathname?.startsWith('/carte/')
  ) {
    return (
      <footer className="bg-transparent py-8 mt-12 relative z-[60]">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <Link href="/" className="inline-flex items-center cursor-pointer group scale-90">
            <div className="relative bg-gradient-to-r from-pink-500 to-orange-400 group-hover:opacity-90 transition-all p-1.5 rounded-lg mr-2.5 flex items-center justify-center shadow-md shadow-pink-500/10">
              <Mail className="text-white" size={14} />
              <div className="absolute -top-1 -right-1 rounded-full bg-white p-[1px]">
                <Heart className="text-rose-500" size={10} />
              </div>
            </div>
            <span className="font-bold text-stone-800 tracking-tight text-sm">
              cartepostale.cool
            </span>
          </Link>
          <p className="text-stone-400 text-[10px] mt-3 font-medium opacity-60">
            Partagez vos albums photo facilement sur :{' '}
            <a
              href="https://www.photopartage.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-600 hover:underline"
            >
              photopartage.com
            </a>
          </p>
        </div>
      </footer>
    )
  }

  return (
    <footer className="bg-white border-t border-stone-200 pt-10 pb-8 mt-24">
      <div className="max-w-7xl mx-auto px-5">
        {/* Logo */}
        <div className="flex justify-center items-center gap-2 mb-8 opacity-80">
          <div className="bg-teal-500 p-1.5 rounded-lg transform -rotate-3">
            <Mail className="text-white" size={16} />
          </div>
          <span className="font-serif font-bold text-xl text-stone-800">cartepostale.cool</span>
        </div>

        {/* Nav links — 3 colonnes sur mobile, flex-wrap sur desktop */}
        <nav className="grid grid-cols-2 sm:flex sm:flex-wrap sm:justify-center gap-y-3 gap-x-2 sm:gap-8 mb-8 text-sm text-stone-500 font-medium text-center">
          {navLinks.map(({ href, label }) => (
            <Link key={href} href={href} className="hover:text-teal-600 transition-colors truncate">
              {label}
            </Link>
          ))}
        </nav>

        {/* Réseaux sociaux */}
        <div className="flex justify-center gap-5 mb-8 text-stone-400">
          <a
            href="#"
            className="hover:text-teal-600 transition-colors p-1"
            aria-label="X (Twitter)"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
          <a href="#" className="hover:text-teal-600 transition-colors p-1" aria-label="Instagram">
            <Instagram size={20} />
          </a>
        </div>

        {/* Copyright */}
        <p
          className="text-stone-400 text-xs sm:text-sm text-center leading-relaxed"
          suppressHydrationWarning
        >
          © {new Date().getFullYear()} cartepostale.cool — Des sourires{' '}
          <Heart className="w-3 h-3 fill-red-400 text-red-400 inline align-middle" /> dans vos
          boîtes aux lettres numériques.
        </p>

        {/* Photopartage */}
        <p className="text-stone-400 text-xs mt-3 flex items-center justify-center gap-1.5 text-center flex-wrap">
          <ImageIcon className="w-3 h-3 shrink-0" />
          <span>Partagez vos albums photo facilement :</span>
          <a
            href="https://www.photopartage.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal-500 hover:underline"
          >
            photopartage.com
          </a>
        </p>

        {/* Liens légaux */}
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-5 text-xs text-stone-400">
          {legalLinks.map(({ href, label }) => (
            <Link key={href} href={href} className="hover:text-stone-600 transition-colors py-0.5">
              {label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  )
}
