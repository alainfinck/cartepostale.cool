'use client'

import React from 'react'
import Link from 'next/link'
import { Mail, Github, Twitter, Instagram } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export const Footer = () => {
    const pathname = usePathname()

    // Hide footer on editor page for more space
    if (pathname === '/editor') return null

    return (
        <footer className="bg-white border-t border-stone-200 py-12 mt-24">
            <div className="max-w-7xl mx-auto px-4 text-center">
                <div className="flex justify-center items-center gap-2 mb-6 opacity-80">
                    <div className="bg-teal-500 p-1.5 rounded-lg transform -rotate-3">
                        <Mail className="text-white" size={16} />
                    </div>
                    <span className="font-serif font-bold text-xl text-stone-800">CartePostale</span>
                </div>
                <div className="flex flex-wrap justify-center gap-8 mb-8 text-stone-500 font-medium">
                    <Link href="/" className="hover:text-teal-600 transition-colors">Accueil</Link>
                    <Link href="/showcase" className="hover:text-teal-600 transition-colors">Découvrir</Link>
                    <Link href="/business" className="hover:text-teal-600 transition-colors">Solutions Pro</Link>
                    <Link href="/pricing" className="hover:text-teal-600 transition-colors">Tarifs</Link>
                </div>

                <div className="flex justify-center gap-6 mb-8 text-stone-400">
                    <a href="#" className="hover:text-teal-600 transition-colors"><Twitter size={20} /></a>
                    <a href="#" className="hover:text-teal-600 transition-colors"><Instagram size={20} /></a>
                    <a href="#" className="hover:text-teal-600 transition-colors"><Github size={20} /></a>
                </div>

                <p className="text-stone-400 text-sm">
                    © {new Date().getFullYear()} CartePostale.cool. Des sourires dans vos boîtes aux lettres numériques.
                </p>
            </div>
        </footer>
    )
}
