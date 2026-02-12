'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Mail, Menu, X, LogIn, Plus, Compass, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export const Navbar = () => {
    const pathname = usePathname()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)

    useEffect(() => {
        fetch('/api/users/me', { credentials: 'include' })
            .then((res) => res.ok)
            .then(setIsLoggedIn)
            .catch(() => setIsLoggedIn(false))
    }, [])

    const isActive = (path: string) => pathname === path

    return (
        <nav className="bg-white/80 backdrop-blur-md border-b border-stone-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20 items-center">
                    <Link href="/" className="flex items-center cursor-pointer group">
                        <div className="bg-teal-500 group-hover:bg-teal-600 transition-colors p-2 rounded-lg mr-3 transform -rotate-3 shadow-md">
                            <Mail className="text-white" size={24} />
                        </div>
                        <div>
                            <span className="font-serif font-bold text-2xl text-stone-800 tracking-tight block leading-none">CartePostale</span>
                            <span className="text-xs font-bold text-orange-500 uppercase tracking-widest">Cool & Digital</span>
                        </div>
                    </Link>

                    <div className="hidden sm:flex items-center space-x-6">
                        <Link
                            href="/showcase"
                            className={cn(
                                "font-medium transition-colors hover:text-teal-600",
                                isActive('/showcase') ? 'text-teal-600 font-bold' : 'text-stone-500'
                            )}
                        >
                            Découvrir
                        </Link>
                        <Link
                            href="/business"
                            className={cn(
                                "font-medium transition-colors hover:text-teal-600",
                                isActive('/business') ? 'text-teal-600 font-bold' : 'text-stone-500'
                            )}
                        >
                            Agences & Pro
                        </Link>
                        <Link
                            href="/pricing"
                            className={cn(
                                "font-medium transition-colors hover:text-teal-600",
                                isActive('/pricing') ? 'text-teal-600 font-bold' : 'text-stone-500'
                            )}
                        >
                            Tarifs
                        </Link>

                        <div className="h-6 w-px bg-stone-300 mx-2"></div>

                        {isLoggedIn ? (
                            <Link
                                href="/espace-client"
                                className={cn(
                                    "font-bold flex items-center gap-2 text-sm",
                                    pathname.startsWith('/espace-client') ? 'text-teal-600' : 'text-stone-500 hover:text-stone-800'
                                )}
                            >
                                <LayoutDashboard size={18} /> Mon espace
                            </Link>
                        ) : (
                            <Link
                                href="/connexion"
                                className="text-stone-500 hover:text-stone-800 font-bold flex items-center gap-2 text-sm"
                            >
                                <LogIn size={18} /> Connexion
                            </Link>
                        )}

                        <Link href="/editor">
                            <Button
                                className="bg-orange-500 text-white hover:bg-orange-600 rounded-full font-bold shadow-md hover:shadow-lg flex items-center gap-2 transform hover:-translate-y-0.5"
                            >
                                <Plus size={20} /> Créer
                            </Button>
                        </Link>
                    </div>

                    <div className="sm:hidden flex items-center">
                        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-stone-500 p-2">
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {isMobileMenuOpen && (
                <div className="sm:hidden bg-white border-b border-stone-200">
                    <div className="px-4 pt-2 pb-4 space-y-2">
                        <Link href="/showcase" onClick={() => setIsMobileMenuOpen(false)} className="block w-full text-left px-3 py-2 text-stone-600 font-medium hover:bg-stone-50 rounded-lg">Découvrir</Link>
                        <Link href="/business" onClick={() => setIsMobileMenuOpen(false)} className="block w-full text-left px-3 py-2 text-stone-600 font-medium hover:bg-stone-50 rounded-lg">Agences & Pro</Link>
                        <Link href="/pricing" onClick={() => setIsMobileMenuOpen(false)} className="block w-full text-left px-3 py-2 text-stone-600 font-medium hover:bg-stone-50 rounded-lg">Tarifs</Link>
                        {isLoggedIn ? (
                            <Link href="/espace-client" onClick={() => setIsMobileMenuOpen(false)} className="block w-full text-left px-3 py-2 text-teal-600 font-medium hover:bg-teal-50 rounded-lg">Mon espace</Link>
                        ) : (
                            <Link href="/connexion" onClick={() => setIsMobileMenuOpen(false)} className="block w-full text-left px-3 py-2 text-stone-600 font-medium hover:bg-stone-50 rounded-lg">Connexion</Link>
                        )}
                        <Link href="/editor" onClick={() => setIsMobileMenuOpen(false)} className="block w-full text-left px-3 py-2 text-orange-600 font-bold hover:bg-orange-50 rounded-lg">Créer une carte</Link>
                    </div>
                </div>
            )}
        </nav>
    )
}
