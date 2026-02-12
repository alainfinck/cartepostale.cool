'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    Mail,
    Menu,
    X,
    LogIn,
    Plus,
    LayoutDashboard,
    ChevronDown,
    ImageIcon,
    Info,
    Building2,
    CreditCard,
    FileText,
    Gift,
    Globe,
    Star,
    Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'


const dropdownPro = [
    {
        href: '/business',
        icon: Building2,
        title: 'Solutions Pro',
        description: 'Pour agences et entreprises',
    },
    {
        href: '/pricing',
        icon: CreditCard,
        title: 'Tarifs entreprise',
        description: 'Devis et volumes',
    },
    {
        href: '/contact',
        icon: FileText,
        title: 'Contact',
        description: 'Échangez avec notre équipe',
    },
]

const dropdownTarifs = [
    { href: '/pricing', icon: Gift, label: 'Gratuit', price: '0€', desc: 'Carte limitée' },
    { href: '/pricing', icon: Globe, label: 'Occasionnel', price: '2,99€', desc: '/ carte' },
    { href: '/pricing', icon: Star, label: 'Voyageur', price: '9,99€', desc: '/ mois' },
    { href: '/pricing', icon: Zap, label: 'Pro & Agence', price: 'Sur devis', desc: '' },
]

export const Navbar = () => {
    const pathname = usePathname()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [openDropdown, setOpenDropdown] = useState<string | null>(null)
    const [user, setUser] = useState<{ name?: string | null; email?: string } | null>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        fetch('/api/users/me', { credentials: 'include' })
            .then((res) => {
                if (!res.ok) {
                    setUser(null)
                    return
                }
                return res.json()
            })
            .then((data) => {
                if (data?.user) setUser(data.user)
                else setUser(null)
            })
            .catch(() => setUser(null))
    }, [])

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpenDropdown(null)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const NavDropdown = ({
        id,
        label,
        active,
        children,
    }: {
        id: string
        label: string
        active: boolean
        children: React.ReactNode
    }) => (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === id ? null : id)}
                onMouseEnter={() => setOpenDropdown(id)}
                className={cn(
                    'flex items-center gap-1.5 font-medium transition-all duration-200 rounded-xl px-4 py-3',
                    'tracking-tight text-[15px]',
                    active
                        ? 'text-teal-600 font-bold bg-teal-50/80'
                        : 'text-stone-600 hover:text-teal-600 hover:bg-stone-50/80'
                )}
            >
                {label}
                <ChevronDown
                    className={cn('w-4 h-4 transition-transform duration-200', openDropdown === id && 'rotate-180')}
                />
            </button>
            {openDropdown === id && (
                <div
                    className="absolute top-full left-0 pt-3 min-w-[300px] z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                    onMouseLeave={() => setOpenDropdown(null)}
                >
                    <div className="bg-white rounded-2xl shadow-2xl shadow-stone-200/50 border border-stone-100 overflow-hidden">
                        {children}
                    </div>
                </div>
            )}
        </div>
    )

    return (
        <nav className="bg-white/95 backdrop-blur-lg border-b border-stone-200/80 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-24 items-center">
                    <Link href="/" className="flex items-center cursor-pointer group">
                        <div className="bg-teal-500 group-hover:bg-teal-600 transition-colors p-2.5 rounded-xl mr-4 transform -rotate-3 shadow-lg shadow-teal-500/20">
                            <Mail className="text-white" size={26} />
                        </div>
                        <div>
                            <span className="font-serif font-bold text-2xl text-stone-800 tracking-tight block leading-none">
                                CartePostale
                            </span>
                            <span className="text-xs font-bold text-orange-500 uppercase tracking-widest">
                                Cool & Digital
                            </span>
                        </div>
                    </Link>

                    <div className="hidden sm:flex items-center gap-2">
                        <Link
                            href="/galerie"
                            className={cn(
                                'font-medium transition-all duration-200 rounded-xl px-4 py-3 tracking-tight text-[15px]',
                                pathname === '/galerie'
                                    ? 'text-teal-600 font-bold bg-teal-50/80'
                                    : 'text-stone-600 hover:text-teal-600 hover:bg-stone-50/80'
                            )}
                        >
                            Galerie
                        </Link>

                        <Link
                            href="/a-propos"
                            className={cn(
                                'font-medium transition-all duration-200 rounded-xl px-4 py-3 tracking-tight text-[15px]',
                                pathname === '/a-propos'
                                    ? 'text-teal-600 font-bold bg-teal-50/80'
                                    : 'text-stone-600 hover:text-teal-600 hover:bg-stone-50/80'
                            )}
                        >
                            À propos
                        </Link>

                        <NavDropdown
                            id="pro"
                            label="Agences & Pro"
                            active={pathname === '/business' || pathname === '/contact'}
                        >
                            <div className="py-3 px-1">
                                {dropdownPro.map((item) => (
                                    <Link
                                        key={item.href + item.title}
                                        href={item.href}
                                        onClick={() => setOpenDropdown(null)}
                                        className="flex gap-4 px-4 py-4 rounded-xl hover:bg-orange-50/80 transition-colors group/item mx-2 mb-1 last:mb-0"
                                    >
                                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 group-hover/item:bg-orange-100 group-hover/item:scale-105 transition-transform">
                                            <item.icon className="w-6 h-6" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="font-semibold text-stone-800 group-hover/item:text-teal-600 text-[15px]">
                                                {item.title}
                                            </div>
                                            <div className="text-sm text-stone-500 mt-0.5">{item.description}</div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </NavDropdown>

                        <NavDropdown id="tarifs" label="Tarifs" active={pathname === '/pricing'}>
                            <div className="p-4">
                                <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3 px-2">
                                    Nos offres
                                </div>
                                <div className="space-y-1">
                                    {dropdownTarifs.map((item) => (
                                        <Link
                                            key={item.label}
                                            href={item.href}
                                            onClick={() => setOpenDropdown(null)}
                                            className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-stone-50 transition-colors group/item"
                                        >
                                            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-600 group-hover/item:bg-teal-50 group-hover/item:text-teal-600">
                                                <item.icon className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <span className="font-medium text-stone-800 group-hover/item:text-teal-600 text-[15px]">
                                                    {item.label}
                                                </span>
                                                {item.desc && (
                                                    <span className="text-stone-500 text-sm ml-1.5">{item.desc}</span>
                                                )}
                                            </div>
                                            <span className="font-bold text-teal-600 text-sm tabular-nums">{item.price}</span>
                                        </Link>
                                    ))}
                                </div>
                                <Link
                                    href="/pricing"
                                    onClick={() => setOpenDropdown(null)}
                                    className="block text-center text-sm font-semibold text-teal-600 hover:text-teal-700 mt-4 pt-4 border-t border-stone-100"
                                >
                                    Voir tous les tarifs →
                                </Link>
                            </div>
                        </NavDropdown>

                        <div className="h-8 w-px bg-stone-200 mx-3" />

                        {user ? (
                            <Link
                                href="/espace-client"
                                className={cn(
                                    'font-bold flex items-center gap-2.5 text-[15px] rounded-xl px-4 py-3 transition-all',
                                    pathname.startsWith('/espace-client')
                                        ? 'text-teal-600 bg-teal-50/80'
                                        : 'text-stone-600 hover:text-teal-600 hover:bg-stone-50/80'
                                )}
                            >
                                <LayoutDashboard size={20} />
                                <span className="hidden md:inline truncate max-w-[180px]" title={user.email ?? undefined}>
                                    {user.name?.trim() || user.email}
                                </span>
                                <span className="md:hidden">Mon espace</span>
                            </Link>
                        ) : (
                            <Link
                                href="/connexion"
                                className="text-stone-600 hover:text-teal-600 hover:bg-stone-50/80 font-bold flex items-center gap-2.5 text-[15px] rounded-xl px-4 py-3 transition-all"
                            >
                                <LogIn size={20} /> Connexion
                            </Link>
                        )}

                        <Link href="/editor" className="ml-2">
                            <Button className="bg-orange-500 text-white hover:bg-orange-600 rounded-full font-bold shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 flex items-center gap-2.5 px-6 py-6 text-[15px] transform hover:-translate-y-0.5 transition-all duration-200">
                                <Plus size={22} /> Créer
                            </Button>
                        </Link>
                    </div>

                    <div className="sm:hidden flex items-center">
                        <button
                            type="button"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="text-stone-600 p-3 rounded-xl hover:bg-stone-100 transition-colors"
                            aria-label="Menu"
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isMobileMenuOpen && (
                <div className="sm:hidden bg-white border-b border-stone-200 shadow-xl">
                    <div className="px-4 pt-6 pb-8 space-y-6">
                        <div className="text-xs font-bold text-stone-400 uppercase tracking-widest px-4 py-2">
                            Découvrir
                        </div>
                        <div className="space-y-1">
                            <Link
                                href="/galerie"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={cn(
                                    "flex items-center gap-4 px-4 py-4 rounded-2xl transition-colors font-semibold text-[15px]",
                                    pathname === "/galerie" ? "bg-teal-50 text-teal-700" : "hover:bg-teal-50/80 text-stone-700"
                                )}
                            >
                                <ImageIcon className="w-6 h-6 text-teal-500 flex-shrink-0" />
                                Galerie
                            </Link>
                            <Link
                                href="/a-propos"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={cn(
                                    "flex items-center gap-4 px-4 py-4 rounded-2xl transition-colors font-semibold text-[15px]",
                                    pathname === "/a-propos" ? "bg-teal-50 text-teal-700" : "hover:bg-teal-50/80 text-stone-700"
                                )}
                            >
                                <Info className="w-6 h-6 text-teal-500 flex-shrink-0" />
                                À propos
                            </Link>
                        </div>
                        <div className="text-xs font-bold text-stone-400 uppercase tracking-widest px-4 py-2">
                            Agences & Pro
                        </div>
                        <div className="space-y-1">
                            {dropdownPro.map((item) => (
                                <Link
                                    key={item.href + item.title}
                                    href={item.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex gap-4 px-4 py-4 rounded-2xl hover:bg-orange-50/80 active:bg-orange-50 text-stone-700 transition-colors"
                                >
                                    <item.icon className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <div className="font-semibold text-[15px]">{item.title}</div>
                                        <div className="text-sm text-stone-500 mt-0.5">{item.description}</div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                        <div className="text-xs font-bold text-stone-400 uppercase tracking-widest px-4 py-2">
                            Tarifs
                        </div>
                        <div className="space-y-1">
                            {dropdownTarifs.map((item) => (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-stone-50 active:bg-stone-100 text-stone-700 transition-colors"
                                >
                                    <item.icon className="w-6 h-6 text-teal-500 flex-shrink-0" />
                                    <span className="font-medium flex-1 text-[15px]">{item.label}</span>
                                    <span className="text-sm font-bold text-teal-600 tabular-nums">{item.price}</span>
                                </Link>
                            ))}
                        </div>
                        <div className="h-px bg-stone-100 my-2" />
                        <div className="space-y-2">
                            {user ? (
                                <Link
                                    href="/espace-client"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center gap-4 px-4 py-4 rounded-2xl bg-teal-50 text-teal-700 font-semibold text-[15px]"
                                >
                                    <LayoutDashboard size={22} />
                                    <span className="truncate">{user.name?.trim() || user.email}</span>
                                    <span className="text-stone-500 font-normal text-sm">(Mon espace)</span>
                                </Link>
                            ) : (
                                <Link
                                    href="/connexion"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-stone-50 text-stone-700 font-semibold text-[15px]"
                                >
                                    <LogIn size={22} /> Connexion
                                </Link>
                            )}
                            <Link
                                href="/editor"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center justify-center gap-2.5 w-full py-4 rounded-2xl bg-orange-500 text-white font-bold text-[15px] shadow-lg shadow-orange-500/25 active:scale-[0.98] transition-transform"
                            >
                                <Plus size={22} /> Créer une carte
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    )
}
