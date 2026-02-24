'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Mail,
  User,
  LogOut,
  ChevronRight,
  Plus,
  Globe,
  Image as ImageIcon,
  Sparkles,
  Code,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { CurrentUser } from '@/lib/auth'

interface Props {
  user: CurrentUser
}

const navItems = [
  { href: '/espace-client', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/espace-client/cartes', label: 'Mes cartes', icon: Mail },
  { href: '/espace-client/galerie', label: 'Ma galerie', icon: ImageIcon },
  { href: '/espace-client/carte-du-monde', label: 'Carte du monde', icon: Globe },
  { href: '/espace-client/dev', label: 'Espace Dev', icon: Code },
  { href: '/espace-client/credits', label: 'Gérer les crédits', icon: Sparkles },
  { href: '/espace-client/compte', label: 'Mon compte', icon: User },
]

export default function EspaceClientNav({ user }: Props) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/users/logout', { method: 'POST', credentials: 'include' })
    router.push('/connexion')
    router.refresh()
  }

  return (
    <>
      {/* ── Navigation mobile (barre horizontale scrollable) ── */}
      <div className="lg:hidden w-full border-b border-stone-200 bg-white/90 backdrop-blur-sm sticky top-0 z-20">
        {/* Infos utilisateur */}
        <div className="px-4 pt-3 pb-1 flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest">
              Mon espace
            </p>
            <p className="text-sm font-medium text-stone-800 truncate">{user.name || user.email}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-3">
            <Link href="/editor">
              <Button
                size="sm"
                className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white gap-1 text-xs px-3 py-1.5 h-auto"
              >
                <Plus size={14} /> Créer
              </Button>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
              title="Déconnexion"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Tabs scrollables */}
        <nav className="flex gap-0.5 px-3 pb-0 overflow-x-auto scrollbar-hide">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive =
              pathname === href || (href !== '/espace-client' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors shrink-0',
                  isActive
                    ? 'border-teal-600 text-teal-700'
                    : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300',
                )}
              >
                <Icon size={15} className="shrink-0" />
                {label}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* ── Sidebar desktop ── */}
      <aside className="hidden lg:flex w-64 shrink-0 border-r border-stone-200 bg-white/80 flex-col min-h-[calc(100vh-5rem)]">
        <div className="p-4 border-b border-stone-100">
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-1">
            Mon espace
          </p>
          <p className="font-medium text-stone-800 truncate" title={user.email}>
            {user.name || user.email}
          </p>
          <p className="text-sm text-stone-500 truncate" title={user.email}>
            {user.email}
          </p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive =
              pathname === href || (href !== '/espace-client' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-teal-50 text-teal-700 border border-teal-100'
                    : 'text-stone-600 hover:bg-stone-50 hover:text-stone-800',
                )}
              >
                <Icon size={20} className="shrink-0" />
                {label}
                <ChevronRight
                  size={16}
                  className={cn('ml-auto shrink-0', !isActive && 'opacity-0')}
                />
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-stone-100 space-y-2">
          <Link href="/editor">
            <Button className="w-full rounded-xl bg-orange-500 hover:bg-orange-600 text-white gap-2">
              <Plus size={18} /> Créer une carte
            </Button>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-stone-500 hover:bg-stone-50 hover:text-stone-700 transition-colors"
          >
            <LogOut size={20} /> Déconnexion
          </button>
        </div>
      </aside>
    </>
  )
}
