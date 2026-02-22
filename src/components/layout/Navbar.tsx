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
  Heart,
  BookOpen,
  LogOut,
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

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
  { href: '/pricing', icon: Gift, label: 'Carte gratuite', price: '48 h', desc: '' },
  { href: '/pricing', icon: Mail, label: 'À l\'unité', price: '2,50 €', desc: '' },
  { href: '/pricing', icon: Zap, label: 'Pro & Agence', price: 'Devis', desc: '' },
]

const dropdownFonctionnalites = [
  {
    href: '/#fonctionnalites',
    icon: Zap,
    title: "Vue d'ensemble",
    description: "Aperçu rapide sur l'accueil",
  },
  {
    href: '/idees',
    icon: BookOpen,
    title: 'Toutes les fonctionnalités',
    description: 'Détails et possibilités',
  },
  { href: '/editor', icon: Plus, title: 'Créer une carte', description: 'Éditeur en ligne' },
  { href: '/galerie', icon: ImageIcon, title: 'Galerie', description: 'Exemples et inspiration' },
]

const dropdownDecouvrir = [
  {
    href: '/galerie',
    icon: ImageIcon,
    title: 'Galerie',
    description: 'Cartes postales créées par la communauté',
  },
  {
    href: '/blog',
    icon: BookOpen,
    title: 'Blog',
    description: 'Astuces et actualités',
  },
  {
    href: '/a-propos',
    icon: Info,
    title: 'À propos',
    description: 'Notre histoire et notre équipe',
  },
]

export const Navbar = () => {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [openMobileSection, setOpenMobileSection] = useState<string | null>(null)
  const [user, setUser] = useState<{ name?: string | null; email?: string; role?: string } | null>(
    null,
  )
  const [scrolled, setScrolled] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileMenuOpen])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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

  // Fermer les dropdowns à chaque changement de page (ex. clic sur Connexion)
  useEffect(() => {
    setOpenDropdown(null)
  }, [pathname])

  const NavDropdown = ({
    id,
    label,
    active,
    href,
    children,
  }: {
    id: string
    label: string
    active: boolean
    href?: string
    children: React.ReactNode
  }) => {
    const Component = href ? Link : 'button'
    const props = href
      ? { href, onClick: () => setOpenDropdown(null) }
      : {
          type: 'button' as const,
          onClick: () => setOpenDropdown(openDropdown === id ? null : id),
        }

    return (
      <div className="relative">
        <Component
          {...(props as any)}
          onMouseEnter={() => setOpenDropdown(id)}
          className={cn(
            'flex items-center gap-1.5 font-medium transition-all duration-200 rounded-xl px-4 py-3',
            'tracking-tight text-[15px]',
            active
              ? 'text-teal-600 font-bold bg-teal-50/80'
              : 'text-stone-600 hover:text-teal-600 hover:bg-stone-50/80',
          )}
        >
          {label}
          <ChevronDown
            className={cn(
              'w-4 h-4 transition-transform duration-200',
              openDropdown === id && 'rotate-180',
            )}
          />
        </Component>
        {openDropdown === id && (
          <div
            className="absolute top-full left-0 pt-3 min-w-[380px] z-50 animate-in fade-in slide-in-from-top-2 duration-200"
            onMouseLeave={() => setOpenDropdown(null)}
          >
            <div className="bg-white rounded-2xl shadow-2xl shadow-stone-200/50 border border-stone-100 overflow-hidden">
              {children}
            </div>
          </div>
        )}
      </div>
    )
  }

  const MobileSection = ({
    title,
    isOpen,
    onToggle,
    href,
    children,
  }: {
    title: string
    isOpen: boolean
    onToggle: () => void
    href?: string
    children: React.ReactNode
  }) => (
    <div className="border-b border-stone-100 last:border-0">
      <div className="flex items-center justify-between w-full group">
        {href ? (
          <Link
            href={href}
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex-1 py-4 px-2 text-left"
          >
            <span
              className={cn(
                'text-[15px] font-bold uppercase tracking-wider transition-colors',
                isOpen ? 'text-pink-600' : 'text-stone-950 group-hover:text-black',
              )}
            >
              {title}
            </span>
          </Link>
        ) : (
          <button onClick={onToggle} className="flex-1 py-4 px-2 text-left">
            <span
              className={cn(
                'text-[15px] font-bold uppercase tracking-wider transition-colors',
                isOpen ? 'text-pink-600' : 'text-stone-950 group-hover:text-black',
              )}
            >
              {title}
            </span>
          </button>
        )}
        <button onClick={onToggle} className="py-4 px-4">
          <ChevronDown
            className={cn(
              'w-5 h-5 transition-transform duration-300',
              isOpen ? 'rotate-180 text-pink-500' : 'text-stone-400',
            )}
          />
        </button>
      </div>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )

  // Minimalist Navbar for View Page and Carte Page
  if (
    pathname?.startsWith('/view/') ||
    pathname?.startsWith('/view-debug/') ||
    pathname?.startsWith('/carte/')
  ) {
    return (
      <nav
        className={cn(
          'bg-[#faf8f5]/95 backdrop-blur-lg border-b border-stone-200/60 sticky top-0 z-50 transition-all duration-300',
          scrolled ? 'shadow-sm' : '',
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={cn(
              'flex justify-between items-center transition-all duration-300',
              scrolled ? 'h-9 md:h-10' : 'h-10 md:h-12',
            )}
          >
            <Link href="/" className="flex items-center cursor-pointer group">
              <div
                className={cn(
                  'relative bg-gradient-cta group-hover:opacity-90 transition-all p-1.5 rounded-lg mr-2 flex items-center justify-center',
                  scrolled ? 'scale-90' : '',
                )}
              >
                <Mail className="text-white" size={scrolled ? 14 : 16} />
                <div
                  className="absolute -top-1 -right-1 rounded-full bg-white p-[2px]"
                  aria-hidden="true"
                >
                  <Heart
                    className="text-rose-500 drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]"
                    size={scrolled ? 12 : 14}
                  />
                </div>
              </div>
              <span
                className={cn(
                  'font-bold text-stone-800 tracking-tight leading-none transition-all',
                  scrolled ? 'text-sm md:text-base' : 'text-base md:text-lg',
                )}
              >
                cartepostale.cool
              </span>
            </Link>
            <Link href="/editor" className="my-1.5 flex items-center">
              <Button
                className={cn(
                  'bg-gradient-cta hover:opacity-95 text-white rounded-full font-bold shadow-xl shadow-pink-500/30 transition-all border-0 flex items-center gap-2',
                  scrolled ? 'text-xs px-3 h-6' : 'text-xs md:text-sm px-3.5 md:px-4 h-7 md:h-8',
                )}
              >
                <Plus size={scrolled ? 14 : 16} strokeWidth={3} />
                <span className="hidden lg:inline">Créer ma carte postale</span>
                <span className="lg:hidden">Créer</span>
              </Button>
            </Link>
          </div>
        </div>
      </nav>
    )
  }

  const GoogleIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1c-2.4 0-4.52 1.25-5.76 3.16l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )

  return (
    <nav
      className={cn(
        'bg-[#faf8f5]/95 backdrop-blur-lg border-b border-stone-200/60 sticky top-0 z-50 transition-all duration-300',
        scrolled ? 'shadow-sm' : '',
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={cn(
            'flex justify-between items-center transition-all duration-300',
            scrolled ? 'h-14 md:h-16' : 'h-16 md:h-20',
          )}
        >
          <Link href="/" className="flex items-center cursor-pointer group">
            <div
              className={cn(
                'relative bg-gradient-to-r from-pink-500 to-orange-400 group-hover:opacity-90 transition-all p-2 rounded-xl mr-3 flex items-center justify-center shadow-lg shadow-pink-500/20',
                scrolled ? 'p-1.5 scale-90' : '',
              )}
            >
              <Mail className="text-white" size={scrolled ? 18 : 22} />
              <div
                className="absolute -top-1 -right-1 rounded-full bg-white p-[2px]"
                aria-hidden="true"
              >
                <Heart
                  className="text-rose-500 drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]"
                  size={scrolled ? 14 : 16}
                />
              </div>
            </div>
            <span
              className={cn(
                'font-bold text-stone-800 tracking-tight leading-none',
                scrolled ? 'text-lg' : 'text-xl md:text-2xl',
              )}
            >
              cartepostale.cool
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-1" ref={dropdownRef}>
            <NavDropdown
              id="fonctionnalites"
              label="Fonctionnalités"
              active={pathname === '/' || pathname === '/editor' || pathname === '/galerie'}
            >
              <div className="p-2">
                {dropdownFonctionnalites.map((item) => (
                  <Link
                    key={item.href + item.title}
                    href={item.href}
                    className={cn(
                      'flex gap-3 px-4 py-3 rounded-xl transition-colors',
                      (
                        item.href === '/#fonctionnalites'
                          ? pathname === '/'
                          : pathname === item.href
                      )
                        ? 'bg-pink-50'
                        : 'hover:bg-stone-50',
                    )}
                  >
                    <item.icon className="w-5 h-5 text-pink-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-[15px] text-stone-800">{item.title}</div>
                      <div className="text-sm text-stone-500 mt-0.5">{item.description}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </NavDropdown>

            <NavDropdown
              id="decouvrir"
              label="Découvrir"
              active={pathname === '/galerie' || pathname === '/a-propos'}
            >
              <div className="p-2">
                {dropdownDecouvrir.map((item) => (
                  <Link
                    key={item.href + item.title}
                    href={item.href}
                    className={cn(
                      'flex gap-3 px-4 py-3 rounded-xl transition-colors',
                      pathname === item.href ? 'bg-pink-50' : 'hover:bg-stone-50',
                    )}
                  >
                    <item.icon className="w-5 h-5 text-pink-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-[15px] text-stone-800">{item.title}</div>
                      <div className="text-sm text-stone-500 mt-0.5">{item.description}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </NavDropdown>

            <NavDropdown
              id="tarifs"
              label="Tarifs"
              active={pathname === '/pricing'}
              href="/pricing"
            >
              <div className="p-2 space-y-2">
                {dropdownTarifs.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl transition-colors',
                      pathname === item.href
                        ? 'bg-pink-50 text-pink-700'
                        : 'text-stone-700 hover:bg-stone-50',
                    )}
                  >
                    <item.icon className="w-5 h-5 text-pink-500 shrink-0" />
                    <span className="font-medium text-[15px] flex-1">{item.label}</span>
                    <span className="text-sm font-bold text-pink-600 tabular-nums">
                      {item.price}
                    </span>
                  </Link>
                ))}
              </div>
            </NavDropdown>

            <NavDropdown
              id="pro"
              label="Pro"
              active={
                pathname === '/business' || pathname === '/pricing' || pathname === '/contact'
              }
            >
              <div className="p-2">
                {dropdownPro.map((item) => (
                  <Link
                    key={item.href + item.title}
                    href={item.href}
                    className={cn(
                      'flex gap-3 px-4 py-3 rounded-xl transition-colors',
                      pathname === item.href ? 'bg-teal-50' : 'hover:bg-stone-50',
                    )}
                  >
                    <item.icon className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-[15px] text-stone-800">{item.title}</div>
                      <div className="text-sm text-stone-500 mt-0.5">{item.description}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </NavDropdown>

            <div className="h-6 w-px bg-stone-200 mx-2" />

            {user ? (
              <Link
                href={
                  user.role === 'admin'
                    ? '/manager'
                    : user.role === 'agence'
                      ? '/espace-agence'
                      : '/espace-client'
                }
                className={cn(
                  'font-semibold flex items-center gap-2 text-[15px] rounded-xl px-4 py-3 transition-all',
                  pathname?.startsWith('/espace-client') ||
                    pathname?.startsWith('/espace-agence') ||
                    pathname?.startsWith('/manager')
                    ? 'text-pink-600 bg-pink-50/80'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/80',
                )}
              >
                <LayoutDashboard size={20} />
                <span
                  className="hidden md:inline truncate max-w-[180px]"
                  title={user.email ?? undefined}
                >
                  {user.name?.trim() || user.email}
                </span>
                <span className="md:hidden">
                  {user.role === 'admin'
                    ? 'Manager'
                    : user.role === 'agence'
                      ? 'Espace Agence'
                      : 'Mon espace'}
                </span>
              </Link>
            ) : (
              <Link
                href="/connexion"
                className="text-stone-600 hover:text-stone-900 hover:bg-stone-100/80 font-semibold flex items-center gap-2 text-[15px] rounded-xl px-4 py-3 transition-all"
              >
                <LogIn size={18} /> Connexion
              </Link>
            )}

            <Link href="/editor" className="ml-2">
              <Button className="bg-gradient-to-r from-pink-500 to-purple-500 hover:opacity-95 text-white rounded-full font-bold shadow-lg shadow-pink-500/25 border-0 flex items-center gap-2 px-5 py-5 text-[15px] transition-all duration-200">
                Créer ma carte <span className="opacity-90">✨</span>
              </Button>
            </Link>
          </div>

          <div className="lg:hidden flex items-center">
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
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-b border-stone-200 shadow-2xl overflow-y-auto z-50 h-[calc(100vh-100%)] min-h-[calc(100vh-100%)]">
          <div className="px-4 pt-4 pb-12 space-y-6">
            <div className="px-2 space-y-3">
              <Link
                href="/editor"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-extrabold text-base shadow-lg shadow-pink-500/30 active:scale-[0.98] transition-transform border-0"
              >
                <Plus size={20} strokeWidth={3} />
                Créer ma carte postale <span className="opacity-90">✨</span>
              </Link>

              {user ? (
                <Link
                  href={
                    user.role === 'admin'
                      ? '/manager'
                      : user.role === 'agence'
                        ? '/espace-agence'
                        : '/espace-client'
                  }
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-3 w-full py-3 rounded-2xl bg-stone-100 text-stone-900 font-bold text-base border border-stone-200"
                >
                  <LayoutDashboard size={20} />
                  <span>Tableau de bord</span>
                </Link>
              ) : (
                <Link
                  href="/connexion"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-3 w-full py-3 rounded-2xl bg-white text-stone-900 font-bold text-base border border-stone-200 shadow-sm"
                >
                  <GoogleIcon className="w-5 h-5" />
                  <span>Connexion / Inscription</span>
                </Link>
              )}
            </div>

            <div className="space-y-2">
              <MobileSection
                title="Découvrir"
                isOpen={openMobileSection === 'decouvrir'}
                onToggle={() =>
                  setOpenMobileSection(openMobileSection === 'decouvrir' ? null : 'decouvrir')
                }
              >
                <div className="space-y-1 pt-1 pb-2">
                  <Link
                    href="/#fonctionnalites"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-pink-50/80 text-stone-900 font-bold text-[15px] transition-colors"
                  >
                    <Star className="w-6 h-6 text-pink-500 flex-shrink-0" />
                    Fonctionnalités
                  </Link>
                  <Link
                    href="/pricing"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-4 px-4 py-3 rounded-2xl transition-colors font-bold text-[15px]',
                      pathname === '/pricing'
                        ? 'bg-pink-50 text-pink-900'
                        : 'hover:bg-pink-50/80 text-stone-900',
                    )}
                  >
                    <CreditCard className="w-6 h-6 text-pink-500 flex-shrink-0" />
                    Tarifs
                  </Link>
                  <Link
                    href="/galerie"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-4 px-4 py-3 rounded-2xl transition-colors font-bold text-[15px]',
                      pathname === '/galerie'
                        ? 'bg-pink-50 text-pink-900'
                        : 'hover:bg-pink-50/80 text-stone-900',
                    )}
                  >
                    <ImageIcon className="w-6 h-6 text-pink-500 flex-shrink-0" />
                    Galerie
                  </Link>
                  <Link
                    href="/a-propos"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-4 px-4 py-3 rounded-2xl transition-colors font-bold text-[15px]',
                      pathname === '/a-propos'
                        ? 'bg-pink-50 text-pink-900'
                        : 'hover:bg-pink-50/80 text-stone-900',
                    )}
                  >
                    <Info className="w-6 h-6 text-pink-500 flex-shrink-0" />À propos
                  </Link>
                </div>
              </MobileSection>

              <MobileSection
                title="Agences & Pro"
                isOpen={openMobileSection === 'pro'}
                onToggle={() => setOpenMobileSection(openMobileSection === 'pro' ? null : 'pro')}
              >
                <div className="space-y-1 pt-1 pb-2">
                  {dropdownPro.map((item) => (
                    <Link
                      key={item.href + item.title}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex gap-4 px-4 py-3 rounded-2xl hover:bg-orange-50/80 active:bg-orange-50 text-stone-900 transition-colors"
                    >
                      <item.icon className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-[15px]">{item.title}</div>
                        <div className="text-sm text-stone-500 mt-0.5">{item.description}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </MobileSection>

              <MobileSection
                title="Tarifs"
                isOpen={openMobileSection === 'tarifs'}
                onToggle={() =>
                  setOpenMobileSection(openMobileSection === 'tarifs' ? null : 'tarifs')
                }
                href="/pricing"
              >
                <div className="space-y-2 pt-1 pb-2">
                  {dropdownTarifs.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-stone-50 active:bg-stone-100 text-stone-900 transition-colors"
                    >
                      <item.icon className="w-6 h-6 text-pink-500 flex-shrink-0" />
                      <span className="font-bold flex-1 text-[15px]">{item.label}</span>
                      <span className="text-sm font-bold text-pink-600 tabular-nums">
                        {item.price}
                      </span>
                    </Link>
                  ))}
                </div>
              </MobileSection>
            </div>

            <div className="h-px bg-stone-100 my-4" />

            <div className="space-y-2 pb-6">
              {user ? (
                <React.Fragment>
                  <Link
                    href={
                      user.role === 'admin'
                        ? '/manager'
                        : user.role === 'agence'
                          ? '/espace-agence'
                          : '/espace-client'
                    }
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-4 px-4 py-4 rounded-2xl bg-pink-50 text-pink-700 font-semibold text-[15px] shadow-sm shadow-pink-100"
                  >
                    <LayoutDashboard size={22} />
                    <div className="flex flex-col min-w-0">
                      <span className="truncate font-bold">
                        {user.name?.trim() || user.email?.split('@')[0]}
                      </span>
                      <span className="text-pink-500 font-medium text-xs">
                        {user.role === 'admin'
                          ? 'Administrateur'
                          : user.role === 'agence'
                            ? 'Espace Agence'
                            : 'Tableau de bord'}
                      </span>
                    </div>
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="flex items-center gap-4 w-full px-4 py-4 rounded-2xl bg-stone-50 text-stone-900 font-bold text-[15px] border border-stone-200 mt-2"
                  >
                    <LogOut size={22} className="text-stone-500" />
                    <span>Déconnexion</span>
                  </button>
                </React.Fragment>
              ) : (
                <Link
                  href="/connexion"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-stone-50 text-stone-900 font-bold text-[15px] border border-stone-100"
                >
                  <div className="flex items-center justify-center w-6 h-6">
                    <GoogleIcon className="w-5 h-5" />
                  </div>
                  Connexion
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
