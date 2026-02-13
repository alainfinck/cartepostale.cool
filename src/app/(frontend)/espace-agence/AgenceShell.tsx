'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Mail, Building2, User, LogOut, Menu, Plus, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

const nav = [
  { href: '/espace-agence', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/espace-agence/cartes', label: 'Cartes de l\'agence', icon: Mail },
  { href: '/espace-agence/agence', label: 'Mon agence', icon: Building2 },
  { href: '/espace-agence/compte', label: 'Mon compte', icon: User },
]

interface Props {
  children: React.ReactNode
  agencyId: number | null
}

export function AgenceShell({ children, agencyId }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [agencyName, setAgencyName] = useState<string>('Mon agence')

  useEffect(() => {
    if (!agencyId) return
    fetch(`/api/agencies/${agencyId}?depth=0`, { credentials: 'include' })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data?.name) setAgencyName(data.name)
      })
      .catch(() => {})
  }, [agencyId])

  const handleLogout = async () => {
    await fetch('/api/users/logout', { method: 'POST', credentials: 'include' })
    router.push('/connexion')
    router.refresh()
  }

  const sidebar = (
    <aside className="flex h-full w-56 flex-col border-r border-border bg-card">
      <div className="flex h-14 items-center border-b border-border px-4">
        <div className="min-w-0">
          <span className="font-semibold text-foreground block truncate">{agencyName}</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Espace Agence</span>
        </div>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {nav.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname?.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive ? 'bg-teal-600 text-white' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-border p-3 space-y-1">
        <Link href="/editor">
          <Button variant="default" size="sm" className="w-full justify-start gap-3 bg-teal-600 hover:bg-teal-700">
            <Plus className="h-4 w-4" />
            Créer une carte
          </Button>
        </Link>
        <Link href="/">
          <Button variant="ghost" size="sm" className="w-full justify-start gap-3">
            <ArrowLeft className="h-4 w-4" />
            Retour au site
          </Button>
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </button>
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Mobile header with menu */}
      <header className="flex h-14 items-center gap-2 border-b border-border bg-card px-4 lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-56 p-0">
            {sidebar}
          </SheetContent>
        </Sheet>
        <span className="font-semibold text-foreground truncate">{agencyName}</span>
        <span className="text-xs text-muted-foreground ml-1">Agence</span>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <div className="hidden lg:block">{sidebar}</div>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
