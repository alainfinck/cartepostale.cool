'use client'

import React from 'react'
import Link from 'next/link'
import { Mail, Github, Instagram, Heart, Image as ImageIcon } from 'lucide-react'
import { usePathname } from 'next/navigation'

export const Footer = () => {
  const pathname = usePathname()

  // Hide footer on editor page for more space
  if (pathname === '/editor') return null

  // Minimalist footer for view page and carte page
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
    <footer className="bg-white border-t border-stone-200 py-12 mt-24">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <div className="flex justify-center items-center gap-2 mb-6 opacity-80">
          <div className="bg-teal-500 p-1.5 rounded-lg transform -rotate-3">
            <Mail className="text-white" size={16} />
          </div>
          <span className="font-serif font-bold text-xl text-stone-800">cartepostale.cool</span>
        </div>
        <div className="flex flex-wrap justify-center gap-8 mb-8 text-stone-500 font-medium">
          <Link href="/" className="hover:text-teal-600 transition-colors">
            Accueil
          </Link>
          <Link href="/galerie" className="hover:text-teal-600 transition-colors">
            Découvrir
          </Link>
          <Link href="/business" className="hover:text-teal-600 transition-colors">
            Solutions Pro
          </Link>
          <Link href="/pricing" className="hover:text-teal-600 transition-colors">
            Tarifs
          </Link>
          <Link href="/a-propos" className="hover:text-teal-600 transition-colors">
            À propos
          </Link>
          <Link href="/contact" className="hover:text-teal-600 transition-colors">
            Contact
          </Link>
        </div>

        <div className="flex justify-center gap-6 mb-8 text-stone-400">
          <a href="#" className="hover:text-teal-600 transition-colors">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zl-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
          <a href="#" className="hover:text-teal-600 transition-colors">
            <Instagram size={20} />
          </a>
          <a href="#" className="hover:text-teal-600 transition-colors">
            <Github size={20} />
          </a>
        </div>

        <p className="text-stone-400 text-sm flex items-center justify-center gap-1">
          © {new Date().getFullYear()} cartepostale.cool. Des sourires{' '}
          <Heart className="w-3 h-3 fill-red-400 text-red-400 inline" /> dans vos boîtes aux lettres
          numériques.
        </p>
        <p className="text-stone-400 text-xs mt-3 flex items-center justify-center gap-1.5">
          <ImageIcon className="w-3 h-3" />
          Partagez vos albums photo (pro, perso) facilement :{' '}
          <a
            href="https://www.photopartage.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal-500 hover:underline"
          >
            photopartage.com
          </a>
        </p>
        <div className="flex justify-center flex-wrap gap-x-6 gap-y-2 mt-4 text-xs text-stone-400">
          <Link href="/legal/mentions-legales" className="hover:text-stone-600 transition-colors">
            Mentions Légales
          </Link>
          <Link href="/legal/cgu" className="hover:text-stone-600 transition-colors">
            CGU
          </Link>
          <Link href="/legal/cgv" className="hover:text-stone-600 transition-colors">
            CGV
          </Link>
          <Link href="/legal/confidentialite" className="hover:text-stone-600 transition-colors">
            Confidentialité
          </Link>
          <Link href="/legal/cookies" className="hover:text-stone-600 transition-colors">
            Cookies
          </Link>
        </div>
      </div>
    </footer>
  )
}
